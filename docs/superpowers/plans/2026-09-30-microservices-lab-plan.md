# Microservices Lab: System Design & Bootstrap Plan

## Context

You want an educational, zero-cost system that exercises microservices architecture "to the fullest".
Business logic stays trivial; the learning lives in the platform patterns, the docs, and hands-on
"break it and watch" labs. You asked for:

1. A catalog of microservices fundamentals to choose from (delivered: see the Appendix).
2. A researched, big-tech-grade stack on free infrastructure.
3. A full system design based on your selection.
4. A development process: git, CLAUDE.md, superpowers, living docs, a ROADMAP "plan of plans",
   custom Claude skills/agents/tools, and NotebookLM-style learning material.

This plan records all decisions and is **self-contained**: a new Claude Code session opened in
`C:\microservices-lab` can continue from it.

**Success means:**
- One command (`task up`) brings the whole system up locally.
- Each of the 36 selected fundamentals has three things: running code or config, a concept page, and a
  scripted lab.
- Docs and the ROADMAP never drift from the code.
- A learning pack plus a docs site let you study the system.

## Decisions (yours)

| Topic | Decision |
|---|---|
| Scope | Fundamentals **1–36** (Tiers 1–3). Tier 4 is listed as "future / not planned". |
| Languages | **.NET 10 LTS (C#)** for the transactional core. **Node 24 LTS + TypeScript + NestJS** for the edge and event-projection services. A **Go** service is added as a late milestone, to prove the contract-first design. |
| Domain | Classic **commerce order flow** (the same one Microsoft's eShop, microservices.io and Sam Newman use). |
| Cloud | **Local first.** Cloud is a late milestone and the provider is decided then. The OCI research is kept in an ADR. Images are multi-arch from day one. |
| Repo | **Public GitHub**, at **`C:\microservices-lab`**. |
| Claude output style | **Explanatory** (a project setting). |

## Research facts that shape the design (verified 2026-09-30)

- **Oracle Cloud Always Free Arm allowance halved in mid-2026: now 2 OCPU / 12 GB.** It is still the only
  forever-free managed Kubernetes (OKE Basic). Things that cost money by default:
  - the Console defaults to the paid Enhanced cluster;
  - a LoadBalancer without annotations gets the paid 100 Mbps shape;
  - the minimum PVC is 50 GB, out of 200 GB total including boot volumes;
  - OCI's registry (OCIR) charges for storage.

  All of this is re-verified at the cloud milestone.
- **ingress-nginx is retired** (no fixes since Mar 2026). The standard is Kubernetes Gateway API v1.6.
  **Envoy Gateway 1.9** is the only open-source gateway with native JWT/OIDC, Redis-backed global rate limits,
  retries and circuit breakers. Kong OSS is frozen, and Traefik's JWT/OIDC support is paid.
- **Bitnami's free catalog is gone**, so no Bitnami charts or images.
- **Kyverno 1.19** deprecates `ClusterPolicy`, so we use CEL `ValidatingPolicy` / `ImageValidatingPolicy`.
- Docker Hub allows only **10 anonymous pulls per hour**, so we use local pull-through caches.
- **NotebookLM is now "Gemini Notebook".** Personal accounts get **no API**. The free tier allows 50 sources
  per notebook, and it imports text only. So we ship a curated pack of ≤50 single-topic Markdown files.
- Material for MkDocs is in maintenance mode, so the docs site uses **Docusaurus 3.10**.
- GitHub Actions is unlimited for public repos, including **free arm64 runners**. GHCR is free for public images.
- **Your machine:** i9-13900HX, 32 GB RAM, Docker Desktop on WSL2 (the VM currently has 15.5 GiB).
  It has git, gh, Java 21, .NET 9, Rust and winget.
  Needs fixing or upgrading:
  - Node 20 has reached end of life.
  - .NET 10 SDK is missing.
  - Docker Desktop's kubectl 1.32 is too old for Kubernetes 1.36.
  - Not installed: kind, helm, tilt, task, buf.
  - An **invalid user-level `GITHUB_TOKEN`** shadows your valid `gh` login.
  - `core.autocrlf=true`, and long paths are disabled.

## Architecture

### Services

Each service lives in its own namespace. Every service exposes:
- `/info`: name, version, git SHA, runtime, pod, node, uptime, dependency status;
- `/healthz` and `/readyz`;
- OTLP telemetry.

The .NET services listen on two ports: **8080** (HTTP/1.1 for `/info` and probes) and **8081** (h2c gRPC).

| Service | Stack | Sync API | Events in → out | Data | Fundamentals |
|---|---|---|---|---|---|
| catalog | .NET | gRPC ListProducts, GetProduct, UpdatePrice (admin) | none | Postgres + Valkey (HybridCache) | 7, 9, 22 |
| order | .NET | gRPC PlaceOrder, GetOrder; calls catalog for the price | payments.v1, inventory.v1 → orders.v1 | Postgres: orders, outbox, inbox | 17, 18, 19, 23 |
| payment | .NET | none | orders.v1 → payments.v1 | Postgres | 17, 19, 25 |
| inventory | .NET | gRPC GetStock | orders.v1 → inventory.v1 | Postgres (optimistic locking) | 17, 19 |
| notification | NestJS | none | orders.v1 (Confirmed/Cancelled) | Valkey dedup with TTL (contrasts with an inbox table) | 19, 20, 25 |
| order-query | NestJS | gRPC GetTimeline, ListOrders | all `*.v1` topics → read model | Postgres (disposable, rebuildable) | 21 |
| bff-web | NestJS | REST `/api/v1` (then `/v2`), OpenAPI/Swagger; minimal web UI (M6) | calls catalog, order, order-query | Valkey (Idempotency-Key store) | 3, 24, 26 |

**Deterministic lab triggers:**
- SKU `OOS-*` → stock is rejected.
- Order total > 999 → payment fails.
- Customer `poison` → the message goes to the DLQ.
- A config switch adds random failures and latency. It becomes a flagd flag in M10.

### Order saga (parallel choreography)

1. `PlaceOrder` writes `Order(PENDING)` and `OrderPlaced` to the outbox in **one transaction**.
2. A single active relay publishes the outbox to `orders.v1`. A Postgres advisory lock keeps it to one
   relay, and `traceparent` is stored in the outbox row.
3. payment and inventory react in parallel: Authorized or Failed, and Reserved or Rejected.
4. order-service resolves the outcome:
   - both succeed → **CONFIRMED** and it emits `OrderConfirmed`;
   - either fails, or **30 s pass** → **CANCELLED** and it emits `OrderCancelled{reason}`.
5. On `OrderCancelled`, payment refunds and inventory releases (the compensations).
6. Edge cases:
   - **Tombstones** turn a late or replayed `OrderPlaced` into a no-op.
   - Terminal states ignore late replies.
   - Per-order ordering is guaranteed by the orderId partition key.

### Events

- **Topics** are one per aggregate: `orders.v1`, `payments.v1`, `inventory.v1`.
  - Key: orderId. Partitions: 6.
  - Replication: RF 3 with min-ISR 2 locally (3 KRaft brokers), RF 1 in CI and cloud.
  - Retry path per consumer group: `<group>.<topic>.retry-1` (5 s) → `.retry-2` (30 s) → `.dlq`.
- **Envelope:** CloudEvents binary mode, carried in Kafka headers.
  - `ce_id` is a UUIDv7 and doubles as the idempotency key.
  - `ce_type` looks like `com.lab.order.placed.v1`; `ce_subject` is the orderId; `traceparent` carries the trace.
  - The payload is **proto3** Protobuf, registered in **Apicurio** (KafkaSQL storage, BACKWARD compatibility).
- The event catalog docs are generated from the protos and topic definitions (no AsyncAPI).

### Platform by concern

- **Edge**
  - Gateway API + Envoy Gateway: HTTPRoute and GRPCRoute on `*.localtest.me` (resolves to 127.0.0.1).
    kind maps 127.0.0.1:80/443 to NodePorts 30080/30443.
  - TLS: cert-manager with an mkcert CA. **TLS lands before OIDC.**
  - Keycloak (Operator, realm import) provides OIDC at the gateway for the UIs, and JWT validation with
    claim-to-header mapping for the APIs.
  - Local rate limits, plus global rate limits backed by Valkey.
- **Messaging:** Strimzi-managed Kafka 4.3 (KRaft), Apicurio Registry 3, kafbat UI.
  Kafka clients are used directly: Confluent.Kafka for .NET, `@confluentinc/kafka-javascript` for Node.
- **Data**
  - CloudNativePG runs one small cluster per data-owning service locally. The cloud-slim profile uses one
    shared cluster with a database per service (ADR).
  - Valkey, one instance per owner.
- **Observability**
  - OTel SDKs → OTel Collector → Prometheus 3 (OTLP ingest) + Alertmanager, Loki, Tempo, Grafana.
  - Dashboards are provisioned, with trace↔log links.
- **Delivery**
  - GitHub Actions: an orchestrator workflow with an always-running `ci-ok` gate and actions pinned by SHA.
    Images are built natively on amd64 and arm64 runners and pushed to GHCR as multi-arch manifests.
  - Tilt for the inner loop.
  - Helm umbrella charts per platform component from M1; Kustomize for the services.
  - Argo CD ApplicationSets (M9) and Argo Rollouts with the Gateway API plugin (M10).
  - OpenTofu: the local kind bootstrap in M9, OCI in M14.
- **Mesh / zero trust:** Istio ambient (ztunnel + waypoints; Envoy Gateway set to `routingType: Service`),
  AuthorizationPolicies, NetworkPolicies, Kiali.
- **Security / policy**
  - External Secrets Operator + OpenBao.
  - Trivy, Syft SBOMs, keyless cosign signing (GitHub OIDC).
  - Kyverno CEL policies, with image verification scoped to the GitOps namespaces.
- **Resilience / scale**
  - .NET: gRPC service-config retries and deadlines, plus a Polly circuit breaker in a gRPC interceptor.
    HTTP-level handlers can't see `grpc-status`.
  - Node: cockatiel.
  - Envoy BackendTrafficPolicy; PDBs, topology spread, HPA, KEDA on Kafka lag.
- **Node specifics:** NestJS native gRPC transport (grpc-js + ts-proto, which has OTel instrumentation);
  protobuf-es for event payloads; images on distroless `nodejs24-debian13:nonroot`.
- **.NET specifics:** chiseled Ubuntu images, cross-compiled with `dotnet publish -a $TARGETARCH`. No Native AOT.
- **Tests:**
  - xUnit v3 + Testcontainers (.NET); Vitest (Node).
  - e2e tests (Vitest) on kind in CI from M1.
  - Pact contract tests for the UI↔BFF pair (M6); k6 (M8); Chaos Mesh (M13).
  - Feature flags: OpenFeature + flagd (M10).

### Environment profiles (local RAM, steady state)

| Profile | Where | Contents | RAM |
|---|---|---|---|
| core | laptop kind (1 control plane + 2 workers) | services, edge, Kafka ×3, data, Keycloak, observability | ≈12 GB |
| full | laptop kind | core + Istio/Kiali, Argo CD/Rollouts, Kyverno, ESO/OpenBao, Chaos Mesh, flagd | ≈15.3 GB |
| ci | GitHub runner kind | services, edge, Kafka ×1, data; test JWKS instead of Keycloak; no observability | small |
| cloud-slim | M14 (OCI OKE Basic, 2 OCPU / 12 GB) | 1 broker, shared Postgres, Grafana Cloud Free | ≈6 GB |

Local cluster setup:
- The kind node image is pinned **by digest at Kubernetes 1.36**, one minor behind latest so every operator
  supports it.
- A local registry runs on `:5001`, with pull-through caches for docker.io, quay.io, ghcr.io and registry.k8s.io.

### Tech stack (versions as of 2026-09; `stack-check` re-verifies at each milestone)

| Area | Stack |
|---|---|
| Runtimes | .NET 10 LTS (ASP.NET Core minimal APIs, Grpc.AspNetCore, EF Core + Npgsql, HybridCache) · Node 24 LTS (NestJS, pnpm workspaces) |
| Contracts | proto3 + Buf 1.73 (STANDARD lint, FILE breaking) |
| Kubernetes | kind 0.33 (K8s 1.36) · Tilt 0.37 · Taskfile 3.53 · Helm 4.3 · Kustomize 5.8 |
| Edge and identity | Gateway API 1.6 · Envoy Gateway 1.9 · cert-manager · Keycloak |
| Messaging | Kafka 4.3 via Strimzi 1.2 · Apicurio 3.3 · kafbat UI |
| Data | CloudNativePG 1.30 · Valkey 9.1 |
| Observability | OpenTelemetry · Collector 0.16x · Prometheus 3.13 LTS · Loki 3.7 · Tempo 3.1 · Grafana |
| Delivery | Argo CD 3.5 · Argo Rollouts 1.10 · OpenTofu 1.12 |
| Mesh | Istio 1.31 ambient · Kiali 2.x |
| Security and policy | Kyverno 1.19 · ESO 2.x · OpenBao 2.6 · Trivy · Syft · cosign 3 |
| Scale and resilience | KEDA 2.21 · Chaos Mesh 2.8 · k6 2.x |
| Docs | Docusaurus 3.10 |

## Repository layout (`C:\microservices-lab`)

```
.claude/{settings.json,hooks/,skills/,agents/,rules/}   .githooks/   .github/{workflows,actions}
docs/{architecture,adr,fundamentals,labs,services,runbooks,reference,superpowers/{specs,plans}}  docs/glossary.md
website/            Docusaurus site; reads ../docs; published to GitHub Pages
proto/              buf.yaml, buf.gen.yaml, commerce/<context>/v1/*.proto
services/<svc>/     src/, test/, k8s/base/, Dockerfile
libs/dotnet/Lab.*   ServiceDefaults: info/health, Kestrel ports, OTel, resilience, Kafka/outbox helpers
libs/node/*         platform module: info/health, config (zod), shutdown, OTel, Kafka helpers
deploy/             kind/, platform/<component>/ (Helm umbrella charts), envs/{local,ci,gitops-local,cloud}/, argocd/
infra/tofu/         local/, oci/
tests/              e2e/, load/, contract/, chaos/
scripts/*.mjs       docs-drift, doctor, learning-pack, event-catalog, versions table (Node, no dependencies)
CLAUDE.md  ROADMAP.md  README.md  Taskfile.yml  Tiltfile  lab.slnx  global.json  Directory.*.props  pnpm-workspace.yaml
```

## Development process

Every milestone goes through the same loop:

1. `stack-check`: verify versions and breaking changes.
2. `superpowers:brainstorming`: write the milestone spec in `docs/superpowers/specs/`.
3. `superpowers:writing-plans`: write the plan in `docs/superpowers/plans/`.
4. Branch `mN/<slug>`, then `superpowers:subagent-driven-development` with TDD.
5. `superpowers:requesting-code-review`.
6. `superpowers:verification-before-completion`, running `task verify:mN`.
7. Update the docs, labs, learning pack and ROADMAP.
8. Open a squash-merge PR (`ci-ok` must be green).
9. Tag `mN`, publish a GitHub Release, and finish with `superpowers:finishing-a-development-branch`.

**Conventions:**
- Conventional Commits, with the service as scope.
- One ADR (MADR 4 format) per significant decision.
- Never: secrets in the repo, Bitnami, `:latest` tags, or `--no-verify`.
- Always: multi-arch images, proto3, and Node `.mjs` for tooling scripts (portable on Windows).

**Definition of Done for every milestone:**
- Running code and config.
- One concept page per fundamental covered, using the full template including "Check your understanding".
- At least one lab per fundamental, with a scripted **Verify** section.
- Updated service, ADR and runbook pages, and regenerated reference docs.
- ROADMAP status and changelog updated.
- `task verify:mN` and CI `ci-ok` green.
- Learning pack rebuilt (from M2 on).
- Tag and release published.

## Docs & learning system

- **`docs/` sections:**
  - architecture: C4 overview, flows, tech stack and versions
  - adr
  - fundamentals: 36 concept pages plus an index with status and milestone
  - labs, services, runbooks
  - reference: generated API docs and event catalog
  - superpowers specs and plans
  - glossary
- **Templates:**
  - **Concept page:** What / Why / How it's built here / See it / Break it / Trade-offs / Big-tech examples /
    Further reading / Check your understanding.
  - **Lab:** Goal / Profile / Setup / Steady state / Break it / Observe / Explain / Fix / Verify (scripted) / Cleanup.
  - **Service page:** Purpose, APIs, Events, Data, Config, Resilience, SLOs, Runbooks.
  - **ADR** (MADR 4) and **Runbook**.
- Every Mermaid diagram is followed by a prose **"Diagram description"**, because the notebook ingests text only.
- **Docs site:** Docusaurus in `website/` publishes `docs/` to GitHub Pages, starting in M0. It is the primary
  learning interface.
- **Gemini Notebook (ex-NotebookLM) pack:**
  - `task learning-pack` (from M2) builds ≤50 single-topic Markdown sources from `docs/`.
  - Each milestone release carries the pack as an attachment, with a loading guide and suggested prompts for
    Audio/Video Overviews, flashcards and quizzes.
  - Optional later: push the pack as Google Docs through the Google Drive connector, so the notebook
    auto-syncs. This needs you to authorize the connector.
- **Docs-freshness enforcement, in five layers:**
  1. A Claude `PreToolUse` hook on `git commit`: **deny on `main`** with suggested docs; on branches, allow
     with a reminder, so TDD micro-commits aren't blocked.
  2. A git `commit-msg` hook, for commits made outside Claude.
  3. **CI docs-drift on the PR diff**, required through `ci-ok`; the `skip-docs` label bypasses it.
  4. Generated references verified by regenerate-and-diff.
  5. A `docs-auditor` semantic sweep, plus a DoD checklist in the PR template.

## Claude Code tooling (created when first needed; skills written with `superpowers:writing-skills`)

| When | Hooks / scripts | Skills | Agents | Rules / MCP |
|---|---|---|---|---|
| M0 | `docs-guard.mjs` (PreToolUse; Bash + PowerShell `git commit`) · `session-context.mjs` (SessionStart: current milestone, open DoD items, latest spec/plan, ≤1 KB) · `scripts/docs-drift.mjs` (+ `node --test`) · `.githooks/commit-msg` | `roadmap` (manual) · `adr` · `update-docs` · `stack-check` | `docs-auditor` (read-only) | `docs.md`, `github-actions.md` · `.mcp.json`: Context7 |
| M1 | — | `lab` · `dev-env` (up/down/reset/doctor) | `learning-writer` · `k8s-reviewer` (read-only) | `dotnet.md`, `node.md`, `k8s.md` · kubernetes-mcp-server (read-only) |
| M2 | — | `learning-pack` | — | mcp-grafana (`--disable-write`) |
| M3 | — | `new-service` (golden-path scaffold extracted from the first real services) | — | — |
| M14 | — | `cost-guard` | — | — |

`.claude/settings.json` contains:
- `outputStyle: "Explanatory"`;
- deny rules for `.env*` reads, `git push --force` and `git commit --no-verify`;
- the two hooks, invoked as `node` with the path passed as an argument.

Verify the hook schema against the current Claude Code docs at implementation time.

CLAUDE.md stays at 150 lines or fewer and covers:
- mission and non-negotiables;
- a learner profile: strong in Node/TS, uses .NET at work, explain the Kubernetes and cloud-native "why";
- the superpowers loop and conventions;
- commands, a repo map, and environment facts;
- pointers to the rules files.

## Roadmap ("plan of plans"). ROADMAP.md holds this table plus a status, spec, plan and tag per row

The first line of `ROADMAP.md` is machine-readable: `**Current milestone:** M0 — Foundation · in-progress`.

| M | Goal | Fundamentals | Key deliverables | Size |
|---|---|---|---|---|
| 0 | Foundation | — | Repo, CLAUDE.md, ROADMAP, docs + templates, ADRs 0001–0012, Docusaurus + Pages, hooks and M0 tooling, `task doctor`, docs CI | S |
| 1 | Walking skeleton | 1, 2, 3, 6, 7, 10, 11, 13, 24, 35 | Buf contracts; catalog (.NET) + bff-web (NestJS); kind + registry caches; Envoy Gateway; Tilt/Task; multi-arch images to GHCR; e2e smoke in CI | L |
| 2 | Observability | 12 | Collector, Prometheus/Loki/Tempo/Grafana, dashboards, trace↔log links, learning-pack builder | M |
| 3 | Data ownership | 9, 22, 23, 6 | CloudNativePG per service, migrations, HybridCache/Valkey, order-service with a sync call to catalog, gRPC load-balancing lab, `new-service` skill | M |
| 4 | Event backbone | 8, 16, 18, 19 | Strimzi (3 KRaft nodes), Apicurio, CloudEvents libraries, outbox relay, inbox/dedup, notification consumer, traces across Kafka, event catalog | L |
| 5 | Saga | 17, 19, 20 | payment + inventory, compensations, timeout sweeper, tombstones, retry topics + DLQ, saga e2e test | L |
| 6 | CQRS, BFF composition, versioning | 21, 24, 26 | order-query projector (rebuild via offset reset), composition with graceful degradation, Idempotency-Key, API v2 with Deprecation/Sunset headers, minimal UI, Pact | M |
| 7 | Edge security | 3, 4, 5 | cert-manager + mkcert CA, Keycloak, JWT with claim headers, OIDC for UIs, local + global rate limits | L |
| 8 | Resilience & scaling | 23, 25, 2, 10 | Polly/cockatiel/gateway policies, retry-storm lab, PDBs, topology spread, HPA, KEDA on lag, k6 | M |
| 9 | IaC & GitOps | 14, 15 | OpenTofu bootstrap (kind, caches, Argo CD), ApplicationSets, gitops-local environment, image promotion through PRs | L |
| 10 | Progressive delivery & flags | 30, 36 | Argo Rollouts canary with Prometheus analysis, flagd replaces the env switches | M |
| 11 | Mesh & zero trust | 27, 28, 6, 34 | Istio ambient, waypoints, default-deny AuthorizationPolicy/NetworkPolicy, Kiali, fault injection | L |
| 12 | Secrets, supply chain, policy | 29, 31, 32 | ESO + OpenBao, Trivy, SBOM, keyless signing and attestations, Kyverno admission verification and guardrails | L |
| 13 | SRE | 33, 34, 35 | SLOs with burn-rate alerts, Chaos Mesh GameDays, full e2e + k6 in CI | L |
| 14 | Cloud | 15, 32 | Provider ADR (re-verify OCI terms), OpenTofu OKE Basic, cloud-slim overlay, cost guardrails, Grafana Cloud, `cost-guard` | L |
| 15 | Learning experience | all | Course navigation on the site, labs index, final ≤50-file notebook pack and guide, retrospective | M |
| 16 | Polyglot proof | 7, 16 | A Go shipping-service joins through contracts only and appears in the timeline with zero changes elsewhere | M |
| — | Future / not planned | Tier 4 | Temporal, Debezium CDC, event sourcing, Backstage, GraphQL federation, Dapr, multi-cluster, strangler fig | — |

## Execution sequence after you approve this plan

1. **In this session:**
   - Create `C:\microservices-lab`.
   - Run `git init -b main` and set repo-local `core.autocrlf=false`.
   - Add a minimal `.gitattributes` (`* text=auto eol=lf`; `*.ps1`, `*.cmd`, `*.bat` → `eol=crlf`) and a `.gitignore`.
2. **In this session:** write the master spec `docs/superpowers/specs/2026-09-30-microservices-lab-design.md`.
   - Contents: this plan in full, the fundamentals catalog, the stack with sources, and the per-milestone
     pitfalls from research (Keycloak issuer/JWKS, Envoy↔waypoints, Kafka client binaries, Tilt on Windows, …).
   - Self-review it for placeholders, contradictions, ambiguity and scope, then commit.
3. **You:** complete the pre-flight items below, open Claude Code in `C:\microservices-lab`, and review the spec.
   To continue, say: *"Spec approved — continue per plan C:\Users\eyal6\.claude\plans\pasted-content-id-093c-this-is-humble-fountain.md"*.
4. **New session:**
   1. `superpowers:writing-plans` produces the M0 plan; you review it and choose how it's executed
      (subagent-driven is recommended).
   2. Execute M0:
      - Install tools with winget, with your approval.
      - Write CLAUDE.md, ROADMAP, the docs skeleton, templates and ADRs 0001–0012.
      - Build the scripts, hooks, skills and agent; the Taskfile; Docusaurus; and CI.
      - Create the **public** repo with `gh repo create microservices-lab --public --source . --push`.
        Turn on secret scanning and push protection, squash-only merges, and Pages from Actions.
        Add a ruleset requiring `ci-ok` after the first green run.
   3. Open the PR, then tag `m0`.
5. The M1 cycle begins: spec → plan → execute, tracked in ROADMAP.md.

**ADRs written in M0:**
1. MADR format
2. Scope 1–36
3. Local-first on kind
4. Language split
5. Commerce domain & service decomposition
6. Monorepo, squash PRs and the `ci-ok` gate
7. Docs-as-code & freshness enforcement
8. Taskfile + Tilt + Node scripts
9. proto3 + Buf; gRPC inside, REST at the BFF
10. Chiseled/distroless multi-arch images, no AOT
11. Gateway API + Envoy Gateway
12. Cloud target: OCI OKE Basic research (status: **proposed / deferred**)

## Your pre-flight action items (before step 3)

- **Remove the invalid user-level `GITHUB_TOKEN`:** `[Environment]::SetEnvironmentVariable('GITHUB_TOKEN',$null,'User')`.
  Then restart VS Code and check `gh auth status`. Your keyring login as Eyal-Avni is valid.
- **(admin)** Set `LongPathsEnabled=1`, then run `git config --global core.longpaths true`.
- **(admin)** Put `%LOCALAPPDATA%\Microsoft\WinGet\Links` ahead of Docker's `resources\bin` in the machine PATH.
  Otherwise Docker's kubectl 1.32 shadows the newer one; `task doctor` checks this.
- Create `%UserProfile%\.wslconfig`:
  ```
  [wsl2]
  memory=20GB
  processors=16
  swap=8GB
  [experimental]
  sparseVhd=true
  ```
  Then run `wsl --shutdown`, update Docker Desktop, and run `docker login` (to avoid the Hub pull limits).
- **Installed in M0 with your approval:**
  - winget: `Microsoft.DotNet.SDK.10`, `Kubernetes.kubectl`, `Kubernetes.kind`, `Helm.Helm`, `Task.Task`,
    `bufbuild.buf`, `fullstorydev.grpcurl`, `Derailed.k9s`.
  - Node: `nvm install 24`, `nvm use 24`, `corepack enable`.
  - Tilt: the official `install.ps1`.
- **Installed later:**

  | Milestone | Tools |
  |---|---|
  | M7 | mkcert |
  | M8 | k6 |
  | M9 | OpenTofu, argocd |
  | M11 | istioctl |
  | M12 | cosign, syft, trivy |
  | M16 | Go |

## Verification

- **M0:**
  - `task doctor` is green for the M0 tools, and `node --test scripts` passes.
  - Hook proof: on `main`, a commit that stages `services/x` without docs is **denied**, with suggestions. On a
    branch it is allowed, with a reminder.
  - CI `ci-ok` is green on the M0 PR (markdownlint, docs-drift, and a Docusaurus build that fails on broken links).
  - The Pages site is reachable.
  - A new session shows the "Current milestone" context.
  - The `m0` tag and release exist.
- **Every milestone:** `task verify:mN` runs reset → up → unit/integration tests → e2e → the scripted lab
  Verify blocks. Key proofs:

  | Milestone | Proof |
  |---|---|
  | M1 | `curl https?://api.localtest.me/api/v1/products` returns 200; `grpcurl` works through the gateway |
  | M2 | The trace shows in Tempo, and Loki finds its logs by `trace_id` |
  | M4 | One trace spans order → Kafka → notification |
  | M5 | An `OOS-*` order ends CANCELLED with Released/Refunded within 10 s; killing payment mid-flight causes no double charge |
  | M6 | The read model rebuilds after an offset reset |
  | M7 | Requests return 401 without a token, 200 with one, 429 over the limit |
  | M8 | k6 thresholds pass and KEDA scales out |
  | M9 | Argo apps are Synced and Healthy |
  | M10 | A bad canary aborts automatically |
  | M11 | Plaintext calls and calls from the wrong service account are denied |
  | M12 | An unsigned image is rejected |
  | M13 | The burn-rate alert fires under chaos |
  | M14 | The same e2e suite passes against the cloud URL |
  | M16 | The Go service appears with no other diffs |

- **CI coverage:** CI runs the M1–M6 e2e suite on the `ci` profile. Tier-3 proofs run locally and are
  recorded in the milestone PR.

## Risks and items to re-verify at their milestone (via `stack-check`)

- Whether the Confluent serializers support protobuf Editions (not needed now: we use proto3).
- Whether `@confluentinc/schemaregistry` works with protobuf-es v2.
- Whether WSL sysctls reach the Docker Desktop VM (inotify limits for kind).
- Whether the WSL kernel has netem (Chaos Mesh network faults).
- GRPCRoute support in the Argo Rollouts Gateway API plugin.
- Fault injection through waypoints.
- The `tehcyx/kind` OpenTofu provider.
- Tempo 3 monolithic mode without Kafka.
- Sloth maintenance status.
- Operator support for Kubernetes 1.36.
- **OCI free-tier terms at M14** (they changed without notice in 2026).
- The Claude Code hook schema: the `args` exec form and the `PowerShell(...)` matcher.
- The local RAM budget: if the `full` profile is too heavy, keep Tier-3 add-ons toggleable per profile.

## Appendix: Fundamentals catalog (Stage 1; ✓ = selected)

**Tier 1: Core backbone** ✓
1. Containerization (multi-stage, multi-arch, distroless)
2. Kubernetes orchestration
3. API gateway
4. Edge authentication (OIDC + JWT)
5. Rate limiting (local + global)
6. Service discovery and load balancing
7. Contract-first sync RPC (Protobuf/gRPC + Buf)
8. Async messaging via a broker (Kafka)
9. Database per service
10. Health, readiness and graceful shutdown
11. 12-factor config and secrets with environment overlays
12. Observability (OTel traces, metrics, correlated logs)
13. Per-service CI
14. GitOps CD
15. Infrastructure as Code

**Tier 2: Distributed data and resilience patterns** ✓

16. Event-driven architecture (CloudEvents + schema registry)
17. Choreographed saga with compensations
18. Transactional outbox
19. Idempotent consumers
20. Retry topics and DLQ
21. CQRS read model
22. Cache-aside
23. Timeouts, retries, circuit breakers and bulkheads
24. BFF / API composition
25. HPA + KEDA
26. API versioning

**Tier 3: Big-tech platform and SRE** ✓

27. Service mesh (Istio ambient)
28. Zero-trust authorization + NetworkPolicies
29. Secrets management
30. Progressive delivery
31. Supply-chain security
32. Policy as code
33. SLOs, error budgets and alerting
34. Chaos engineering
35. Microservice test pyramid
36. Feature flags

**Tier 4: Advanced stretch goals** (future / not planned)

37. Temporal orchestration
38. Debezium CDC
39. Event sourcing
40. Backstage
41. GraphQL federation
42. Dapr
43. Multi-cluster
44. Strangler fig

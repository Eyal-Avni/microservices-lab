# Architecture decision records

Each record explains one decision: its context, the options considered (including the rejected ones, which are part of the lesson), the choice, and its consequences. Records are never rewritten; a changed decision gets a new record that supersedes the old one. Add new records with the `adr` skill.

| ADR | Decision | Status | Date |
|---|---|---|---|
| [0001](0001-record-decisions-with-madr.md) | Record architecture decisions with MADR 4 | accepted | 2026-10-01 |
| [0002](0002-scope-fundamentals-1-36.md) | Scope: fundamentals 1–36; Tier 4 deferred | accepted | 2026-10-01 |
| [0003](0003-local-first-on-kind.md) | Local first on kind; cloud later (M14) | accepted | 2026-10-01 |
| [0004](0004-language-split.md) | .NET 10 core, Node 24 + NestJS edge, Go later | accepted | 2026-10-01 |
| [0005](0005-commerce-domain-and-services.md) | Commerce domain and service decomposition | accepted | 2026-10-01 |
| [0006](0006-monorepo-squash-prs-ci-ok.md) | Monorepo, squash-merged PRs and a single `ci-ok` gate | accepted | 2026-10-01 |
| [0007](0007-docs-as-code-freshness.md) | Docs as code with five freshness layers | accepted | 2026-10-01 |
| [0008](0008-taskfile-tilt-node-scripts.md) | Taskfile, Tilt and dependency-free Node tooling | accepted | 2026-10-01 |
| [0009](0009-proto3-buf-grpc-rest-bff.md) | proto3 + Buf; gRPC inside, REST at the BFF | accepted | 2026-10-01 |
| [0010](0010-multi-arch-minimal-images.md) | Chiseled/distroless multi-arch images, no Native AOT | accepted | 2026-10-01 |
| [0011](0011-gateway-api-envoy-gateway.md) | Kubernetes Gateway API with Envoy Gateway | accepted | 2026-10-01 |
| [0012](0012-cloud-target-oci-oke.md) | Cloud target: OCI OKE Basic (decide in M14) | proposed | 2026-10-01 |

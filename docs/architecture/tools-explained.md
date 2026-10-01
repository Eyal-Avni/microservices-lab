---
sidebar_position: 2
---

# Tools explained

Every tool in the Microservices Lab, in plain words: what it is, what it is used for in general, and what it does in this project. The milestone in brackets says when the tool arrives (M0 means it is already in use). Versions and licenses are on the [tech stack](tech-stack.md) page.

> **Rule:** when a tool is added, replaced or removed, this page is updated in the same change.

## Your machine and the workflow

### Git

- **What it is:** A version-control system that records every change to files as a "commit".
- **Used for:** Keeping history, working on branches, and merging changes safely.
- **In this project (M0):** Holds all code and docs. Each milestone is built on an `mN/...` branch and merged into `main`.

### GitHub

- **What it is:** A website that hosts Git repositories, with pull requests, automation and web pages.
- **Used for:** Sharing code, reviewing changes, and running builds.
- **In this project (M0):** Hosts the public repo, runs CI, stores container images and serves this docs site.

### GitHub CLI (`gh`)

- **What it is:** GitHub's command-line tool.
- **Used for:** Creating repos, pull requests and releases, and calling the GitHub API from a terminal.
- **In this project (M0):** Creates the repo, opens and merges pull requests, and publishes milestone releases.

### Node.js

- **What it is:** A runtime that runs JavaScript outside the browser.
- **Used for:** Servers, command-line tools and build tooling.
- **In this project (M0):** Runs our tooling scripts and the docs site. From M1 it also runs the NestJS services.

### nvm (nvm-windows)

- **What it is:** A Node version manager.
- **Used for:** Installing several Node versions side by side and switching between them.
- **In this project (M0):** Keeps this repo on Node 24 while other projects can stay on older versions.

### pnpm

- **What it is:** A fast, disk-efficient package manager for Node.
- **Used for:** Installing JavaScript dependencies and managing repos with many packages (workspaces).
- **In this project (M0):** Installs the docs site's dependencies. From M1 it manages all Node services as one workspace.

### TypeScript

- **What it is:** JavaScript with types, compiled to plain JavaScript.
- **Used for:** Catching mistakes before code runs, and making large codebases easier to change.
- **In this project (M1):** The language of the Node services: bff-web, notification and order-query.

### Task

- **What it is:** A task runner, like `make`, configured in `Taskfile.yml`.
- **Used for:** Giving common commands short names that work the same on every operating system.
- **In this project (M0):** The front door: `task setup`, `task doctor`, `task test`, `task docs:dev`, `task verify`, and from M1 `task up`.

### .NET SDK

- **What it is:** Microsoft's toolkit for building C# applications.
- **Used for:** Compiling, testing and publishing .NET apps.
- **In this project (M1):** Builds the four .NET 10 services: catalog, order, payment and inventory.

### Docker Desktop

- **What it is:** An app that runs Linux containers on Windows, inside a WSL2 virtual machine.
- **Used for:** Building container images and running containers locally.
- **In this project (M1):** Builds the service images and hosts the local Kubernetes cluster. Its VM is set to 20 GB.

### Claude Code

- **What it is:** An AI coding agent that works in the terminal and the editor.
- **Used for:** Writing, testing and explaining code together with you.
- **In this project (M0):** Builds the lab. The hooks, skills, agents and rules in `.claude/` shape how it works in this repo.

### superpowers

- **What it is:** A Claude Code plugin with skills for disciplined software work.
- **Used for:** Brainstorming designs, writing plans, test-driven development and code review.
- **In this project (M0):** Every milestone follows its loop: spec, plan, test-first build, review, verify.

### Context7

- **What it is:** An MCP server that gives AI assistants up-to-date library documentation.
- **Used for:** Avoiding outdated answers about fast-moving libraries.
- **In this project (M0):** Claude checks current APIs and versions with it (configured in `.mcp.json`).

## Services and contracts

### ASP.NET Core

- **What it is:** The .NET framework for web servers and APIs.
- **Used for:** HTTP APIs, gRPC services and web apps in C#.
- **In this project (M1):** Hosts each .NET service's HTTP endpoints (port 8080) and gRPC services (port 8081).

### Entity Framework Core

- **What it is:** .NET's object-relational mapper (ORM).
- **Used for:** Reading and writing database tables as C# objects, and evolving the schema with migrations.
- **In this project (M3):** Each .NET service uses it for its own PostgreSQL database, including the outbox and inbox tables.

### NestJS

- **What it is:** A structured Node.js framework (modules, dependency injection), similar in style to ASP.NET Core.
- **Used for:** Building maintainable server-side apps and APIs in TypeScript.
- **In this project (M1):** Powers bff-web (a REST API with OpenAPI docs), notification and order-query.

### Protocol Buffers (Protobuf)

- **What it is:** A compact, typed message format with its own schema language (`.proto` files).
- **Used for:** Defining data and APIs once and generating code for many languages.
- **In this project (M1):** Every service contract and event payload is a proto3 file under `proto/`.

### gRPC

- **What it is:** A fast remote-procedure-call framework over HTTP/2 that uses Protobuf.
- **Used for:** Efficient, typed calls between services.
- **In this project (M1):** How our services call each other (for example bff-web calling catalog), always with a deadline.

### Buf

- **What it is:** A command-line toolkit for Protobuf.
- **Used for:** Linting `.proto` files, catching breaking changes, and generating code.
- **In this project (M1):** CI fails if a contract change would break existing clients.

### grpcurl

- **What it is:** Like `curl`, but for gRPC.
- **Used for:** Calling and exploring gRPC services from the terminal.
- **In this project (M1):** Labs use it to call services directly and through the gateway.

### Polly and cockatiel

- **What it is:** Resilience libraries: Polly for .NET, cockatiel for Node.
- **Used for:** Retries, timeouts, circuit breakers and bulkheads around calls that can fail.
- **In this project (M3, M8):** Protect calls between services. Labs show retry storms and circuits opening.

## Containers, Kubernetes and the local cluster

### Chiseled and distroless images

- **What it is:** Minimal container base images that contain only the app's runtime: no shell, no package manager.
- **Used for:** Smaller, safer images with fewer things to patch.
- **In this project (M1):** .NET services run on Ubuntu chiseled images; Node services run on distroless images. Every image is built for both amd64 and arm64.

### Kubernetes

- **What it is:** A platform that runs and manages containers across a cluster of machines.
- **Used for:** Deploying, scaling, healing and connecting containerized apps.
- **In this project (M1):** Runs everything: the services, the gateway, the broker, the databases and the observability stack.

### kubectl

- **What it is:** The Kubernetes command-line tool.
- **Used for:** Inspecting and changing what runs in a cluster.
- **In this project (M1):** Your main window into the cluster in labs and runbooks.

### kind

- **What it is:** "Kubernetes in Docker": runs a whole Kubernetes cluster as Docker containers.
- **Used for:** Local development and test clusters that start in about a minute.
- **In this project (M1):** The local cluster (one control plane and two workers, Kubernetes 1.36) and the CI test cluster.

### Helm

- **What it is:** The package manager for Kubernetes. Its packages are called charts.
- **Used for:** Installing complex software (operators, databases, monitoring) with configurable values.
- **In this project (M1):** Installs platform components such as Envoy Gateway, Strimzi and the Grafana stack.

### Kustomize

- **What it is:** A tool that layers changes over plain Kubernetes YAML. It is built into kubectl.
- **Used for:** One base configuration with small differences per environment.
- **In this project (M1):** Our service manifests, with overlays for `local`, `ci` and later `cloud`.

### Tilt

- **What it is:** A local development tool for apps made of many services, with a web dashboard.
- **Used for:** Rebuilding and redeploying services automatically while you edit code.
- **In this project (M1):** `task dev` runs it, so you see every service's status and logs in one place.

### k9s

- **What it is:** A terminal user interface for Kubernetes.
- **Used for:** Browsing pods, logs and events quickly, without long kubectl commands.
- **In this project (M1):** A comfortable way to watch the cluster during labs.

### metrics-server

- **What it is:** A small cluster add-on that collects CPU and memory usage from every pod.
- **Used for:** `kubectl top` and CPU-based autoscaling.
- **In this project (M1):** Feeds the autoscaling labs in M8.

### Container registry (local)

- **What it is:** A server that stores container images. Here it is the open-source `registry` image (CNCF Distribution), running in Docker.
- **Used for:** Pushing and pulling images close to where they run.
- **In this project (M1):** Holds the images Tilt builds, plus pull-through caches that avoid Docker Hub's pull limits.

## Traffic and identity (the edge)

### Kubernetes Gateway API

- **What it is:** The standard Kubernetes API for routing outside traffic into a cluster. It replaces the older Ingress API.
- **Used for:** Declaring gateways and routes (HTTP, gRPC) in a vendor-neutral way.
- **In this project (M1):** Our routes for `api.localtest.me`, `grpc.localtest.me` and the tool UIs.

### Envoy Gateway

- **What it is:** An implementation of the Gateway API built on Envoy, a high-performance proxy.
- **Used for:** An API gateway: routing, TLS, authentication, rate limits and retries.
- **In this project (M1, M7):** The single entry point to the system. From M7 it also checks tokens and enforces rate limits.

### cert-manager

- **What it is:** A Kubernetes operator that issues and renews TLS certificates.
- **Used for:** Automatic HTTPS certificates.
- **In this project (M7):** Issues the `*.localtest.me` certificate from our local certificate authority.

### mkcert

- **What it is:** A tool that creates a local certificate authority that your computer trusts.
- **Used for:** Real HTTPS on development machines without browser warnings.
- **In this project (M7):** Its certificate authority signs our local certificates, through cert-manager.

### Keycloak

- **What it is:** An open-source identity provider: a login server that speaks OpenID Connect and OAuth 2.
- **Used for:** User login, access tokens, roles and single sign-on.
- **In this project (M7):** Issues the tokens the gateway checks, for demo users `alice`, `bob` and `admin`.

## Messaging

### Apache Kafka

- **What it is:** A distributed, durable log of events, organised into topics and partitions.
- **Used for:** Letting many services publish and consume events reliably, each at its own pace.
- **In this project (M4):** The event backbone of the order saga: `orders.v1`, `payments.v1` and `inventory.v1`.

### Strimzi

- **What it is:** A Kubernetes operator that runs Kafka.
- **Used for:** Managing Kafka clusters, topics and users as Kubernetes resources.
- **In this project (M4):** Runs our three-broker Kafka cluster. Each service declares its own topics as `KafkaTopic` resources.

### Kafka clients (Confluent.Kafka, confluent-kafka-javascript)

- **What it is:** The official Kafka client libraries for .NET and for Node.
- **Used for:** Producing and consuming Kafka messages from code.
- **In this project (M4):** Used directly, without framework wrappers, so offsets, commits and rebalances stay visible.

### Apicurio Registry

- **What it is:** A schema registry: it stores message schemas and checks new versions for compatibility.
- **Used for:** Stopping a producer from breaking its consumers with an incompatible message change.
- **In this project (M4):** Holds our event schemas, with a backward-compatibility rule.

### kafbat UI

- **What it is:** A web interface for Kafka.
- **Used for:** Browsing topics, messages and consumer groups.
- **In this project (M4):** Lets you watch saga events flow, at `kafka-ui.localtest.me`.

### CloudEvents

- **What it is:** A CNCF standard for event metadata: id, type, source, subject and time.
- **Used for:** Describing events the same way across systems and brokers.
- **In this project (M4):** Every Kafka message carries CloudEvents headers, and the event id doubles as the idempotency key.

## Data

### PostgreSQL

- **What it is:** A popular open-source relational database.
- **Used for:** Storing structured data with transactions.
- **In this project (M3):** Each data-owning service has its own PostgreSQL database (database per service).

### CloudNativePG

- **What it is:** A Kubernetes operator that runs PostgreSQL.
- **Used for:** Creating and managing Postgres clusters as Kubernetes resources.
- **In this project (M3):** Creates one small Postgres cluster per service.

### Valkey

- **What it is:** An open-source, Redis-compatible in-memory data store (a BSD-licensed fork of Redis).
- **Used for:** Caches, counters and short-lived keys.
- **In this project (M3, M7):** The catalog cache, the BFF's idempotency keys, notification's duplicate detection, and the gateway's rate-limit counters.

## Observability

### OpenTelemetry

- **What it is:** The open standard and SDKs for traces, metrics and logs, plus the Collector that receives and forwards them.
- **Used for:** Instrumenting code once and sending telemetry to any backend.
- **In this project (M2):** Every service sends telemetry to the Collector, and traces follow an order across HTTP, gRPC and Kafka.

### Prometheus

- **What it is:** A time-series database for metrics, with alerting through Alertmanager.
- **Used for:** Measuring request rates, errors and latencies, and alerting when they go wrong.
- **In this project (M2, M13):** Stores service and platform metrics. Later it drives SLO alerts and canary analysis.

### Loki

- **What it is:** A log store from Grafana Labs that indexes labels rather than full text.
- **Used for:** Searching logs from many services cheaply.
- **In this project (M2):** Holds all service logs, linked to traces by trace id.

### Tempo

- **What it is:** A distributed-tracing store from Grafana Labs.
- **Used for:** Seeing one request's path through many services, with timings.
- **In this project (M2):** Shows each order's journey, and generates a service graph from the traces.

### Grafana

- **What it is:** A dashboard and exploration tool for metrics, logs and traces.
- **Used for:** Visualising system health and investigating problems.
- **In this project (M2):** Dashboards for every service, for Kafka lag and for saga outcomes, at `grafana.localtest.me`.

## Delivery and infrastructure

### GitHub Actions

- **What it is:** GitHub's built-in CI/CD service.
- **Used for:** Running tests, builds and deployments on every push and pull request.
- **In this project (M0):** Lints and builds the docs, checks that code changes come with docs changes, runs the tooling tests and deploys this site. From M1 it also builds multi-architecture images. `ci-ok` is the one required check.

### Setup actions (checkout, setup-node, pnpm/action-setup)

- **What it is:** Three ready-made GitHub Actions steps: `actions/checkout` downloads the repo, `actions/setup-node` installs Node.js and `pnpm/action-setup` installs pnpm.
- **Used for:** Preparing a fresh CI machine before the real work starts, with a download cache that keeps installs fast.
- **In this project (M0):** The first steps of every CI job. Each is pinned to a full commit SHA, so a moved version tag can't change what runs.

### dorny/paths-filter

- **What it is:** A GitHub Action that reports which groups of files a push or pull request changed.
- **Used for:** Skipping CI jobs that a change can't affect.
- **In this project (M0):** The `changes` job in `ci.yml` decides whether the docs and tooling jobs run. Filtering inside one workflow keeps the required `ci-ok` check reporting even when jobs are skipped.

### GitHub Container Registry (GHCR)

- **What it is:** GitHub's registry for container images.
- **Used for:** Storing and sharing images.
- **In this project (M1):** Holds our public service images, built for both amd64 and arm64.

### Argo CD

- **What it is:** A GitOps tool: an agent inside the cluster that keeps the cluster in sync with Git.
- **Used for:** Deploying by committing to Git instead of running commands.
- **In this project (M9):** Manages the `gitops-local` environment. Promoting a new version is a pull request.

### Argo Rollouts

- **What it is:** A Kubernetes controller for progressive delivery.
- **Used for:** Canary and blue-green releases, with automatic rollback.
- **In this project (M10):** Shifts traffic to a new version step by step, and aborts if Prometheus shows errors.

### OpenTofu

- **What it is:** An open-source infrastructure-as-code tool (a fork of Terraform).
- **Used for:** Creating cloud and cluster infrastructure from versioned files.
- **In this project (M9, M14):** Bootstraps the local GitOps setup, then the cloud cluster.

## Service mesh and security

### Istio (ambient mode)

- **What it is:** A service mesh. Ambient mode works without a sidecar container next to every service.
- **Used for:** Encrypting traffic between services (mTLS), traffic policy, and telemetry.
- **In this project (M11):** Encrypts all service-to-service traffic and enforces which service may call which.

### Kiali

- **What it is:** A management console for Istio.
- **Used for:** Seeing the live service graph, traffic and encryption status.
- **In this project (M11):** A visual map of the system, at `kiali.localtest.me`.

### External Secrets Operator

- **What it is:** A Kubernetes operator that copies secrets from a vault into Kubernetes Secrets.
- **Used for:** Keeping secrets out of Git while apps still read normal Kubernetes Secrets.
- **In this project (M12):** Syncs service credentials from OpenBao.

### OpenBao

- **What it is:** An open-source secrets vault (a fork of HashiCorp Vault).
- **Used for:** Storing, rotating and auditing secrets.
- **In this project (M12):** The single source of secrets. A lab rotates a secret and watches it reach the pods.

### Kyverno

- **What it is:** A policy engine for Kubernetes.
- **Used for:** Rejecting or fixing resources that break your rules (policy as code).
- **In this project (M12, M14):** Requires resource limits, probes and non-root pods, and rejects unsigned images. In M14 it also guards the free-tier costs.

### Trivy

- **What it is:** A security scanner for container images, code and configuration.
- **Used for:** Finding known vulnerabilities before shipping.
- **In this project (M12):** Scans every image in CI.

### Syft

- **What it is:** A tool that lists everything inside an image: a software bill of materials (SBOM).
- **Used for:** Knowing exactly what you ship, for audits and vulnerability response.
- **In this project (M12):** Creates an SBOM for every image.

### cosign (Sigstore)

- **What it is:** A tool for signing and verifying container images.
- **Used for:** Proving an image came from your build pipeline and was not tampered with.
- **In this project (M12):** CI signs images without stored keys ("keyless"), and Kyverno admits only signed images.

## Scaling, resilience and testing

### KEDA

- **What it is:** Kubernetes event-driven autoscaling.
- **Used for:** Scaling workloads on external signals, such as the length of a queue.
- **In this project (M8):** Adds notification replicas when its Kafka backlog grows.

### OpenFeature and flagd

- **What it is:** OpenFeature is a standard API for feature flags; flagd is a small flag server that implements it.
- **Used for:** Turning behaviour on or off at runtime, without redeploying.
- **In this project (M10):** Flags switch the simulated failures and latency used in the labs.

### Chaos Mesh

- **What it is:** A chaos-engineering platform for Kubernetes.
- **Used for:** Injecting failures on purpose (killed pods, network delays) to test resilience.
- **In this project (M13):** Runs "GameDay" experiments while we watch the SLOs.

### k6

- **What it is:** A load-testing tool from Grafana Labs. Tests are written in JavaScript.
- **Used for:** Simulating many users and checking performance limits.
- **In this project (M8):** Load tests with pass/fail thresholds, also used to trigger autoscaling.

### Testcontainers

- **What it is:** A library that starts real dependencies (databases, Kafka) in containers during tests.
- **Used for:** Integration tests against the real thing instead of mocks.
- **In this project (M3):** .NET and Node integration tests against real Postgres, Kafka and Valkey.

### xUnit and Vitest

- **What it is:** Unit-test frameworks: xUnit for .NET, Vitest for TypeScript.
- **Used for:** Fast, automated tests of small pieces of code.
- **In this project (M1):** Every service is built test-first with them.

### Pact

- **What it is:** A contract-testing tool.
- **Used for:** Checking that an API's consumer and provider still agree, without running both together.
- **In this project (M6):** Tests the contract between the web UI and bff-web.

## Docs and learning

### Docusaurus

- **What it is:** A generator for documentation websites, built with React.
- **Used for:** Turning Markdown files into a searchable docs site.
- **In this project (M0):** Builds this site from `docs/` and publishes it to GitHub Pages.

### GitHub Pages

- **What it is:** GitHub's free hosting for static websites.
- **Used for:** Publishing docs and project sites straight from a repository.
- **In this project (M0):** Hosts this docs site. The `pages` workflow publishes every docs change on `main` with GitHub's `configure-pages`, `upload-pages-artifact` and `deploy-pages` actions.

### Mermaid

- **What it is:** A text syntax for diagrams that renders inside Markdown.
- **Used for:** Keeping diagrams in version control next to the docs.
- **In this project (M0):** All our diagrams. Each one is followed by a written "Diagram description".

### markdownlint

- **What it is:** A linter for Markdown files.
- **Used for:** Keeping docs consistent and catching formatting mistakes.
- **In this project (M0):** Runs in `task docs:lint` and in CI.

### lychee

- **What it is:** A fast link checker.
- **Used for:** Finding dead links in docs.
- **In this project (M0):** The `links` workflow runs it through `lychee-action`: weekly, on demand, and on pull requests that change Markdown. It is not a required check, so one flaky outside site can't block a merge.

### Gemini Notebook (formerly NotebookLM)

- **What it is:** Google's AI notebook that answers questions from documents you upload.
- **Used for:** Studying a topic with audio and video overviews, flashcards and quizzes.
- **In this project (M2):** We build a learning pack of up to 50 files from these docs for you to upload.

## Later milestones

### Oracle Cloud (OCI) and OKE

- **What it is:** Oracle's cloud, and its managed Kubernetes service.
- **Used for:** Running Kubernetes clusters without managing the control plane yourself.
- **In this project (M14, proposed):** The likely free, always-on home for the system. The decision is made in M14.

### Grafana Cloud

- **What it is:** Grafana Labs' hosted observability service, with a free tier.
- **Used for:** Storing metrics, logs and traces without running those systems yourself.
- **In this project (M14):** Receives the cloud cluster's telemetry, so the small cloud cluster stays light.

### Go

- **What it is:** A compiled programming language from Google, popular for cloud-native tools (Kubernetes itself is written in Go).
- **Used for:** Fast, small services and command-line tools.
- **In this project (M16):** One new service, `shipping`, proves that a new language can join through the contracts alone.

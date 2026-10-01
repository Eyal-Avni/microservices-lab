# Microservices Lab

An educational, zero-cost system for learning microservices architecture end to end, on Kubernetes. It covers the gateway, authentication, rate limiting, gRPC contracts, Kafka, sagas, the outbox pattern, CQRS, observability, a service mesh and GitOps. The business logic is trivial on purpose: every pattern comes with a concept page and a "break it and watch" lab.

- Docs site: https://eyal-avni.github.io/microservices-lab/
- Roadmap: [ROADMAP.md](ROADMAP.md)
- Design: [system design spec](docs/superpowers/specs/2026-09-30-microservices-lab-design.md)

## Stack in brief

.NET 10 (core services) · Node 24 + NestJS (edge and projections) · gRPC/Protobuf + Buf · Kafka (Strimzi) · Envoy Gateway (Gateway API) · Keycloak · PostgreSQL (CloudNativePG) · Valkey · OpenTelemetry + the Grafana stack · Istio ambient · Argo CD · OpenTofu · kind + Tilt locally · GitHub Actions + GHCR. Every tool is explained in plain words on [Tools explained](docs/architecture/tools-explained.md); versions and licenses are on the [tech stack](docs/architecture/tech-stack.md) page.

## Quick start (Windows 11)

1. Follow the [toolchain setup runbook](docs/runbooks/toolchain-setup.md).
2. Run `task setup`, then `task verify`.
3. Run `task docs:dev` to browse the docs locally. `task up` arrives with M1.

## Working on it

Development follows the superpowers workflow and the conventions in [CLAUDE.md](CLAUDE.md) and [how we work](docs/architecture/dev-workflow.md).

## License

[MIT](LICENSE)

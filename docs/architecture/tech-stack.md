---
sidebar_position: 3
---

# Tech stack

What each tool *is* and *does* is explained in plain words on [Tools explained](tools-explained.md). This page tracks versions and licenses. Every version below was verified against the project's releases on **2026-09-30**, and the M0 tooling rows (repo tooling, CI and Pages actions, docs) on **2026-10-01**. The `stack-check` skill re-verifies a milestone's components before the milestone starts and updates this page. Changing a choice needs an ADR.

| Area | Choice | Version (verified) | License | Arrives in |
|---|---|---|---|---|
| Core services | .NET (ASP.NET Core, Grpc.AspNetCore, EF Core + Npgsql) | 10 LTS | MIT | M1 |
| Edge and projection services | Node.js + TypeScript + NestJS | Node 24 LTS | MIT | M1 |
| Contracts | Protobuf (proto3) + Buf CLI | Buf 1.73 | Apache-2.0 | M1 |
| Local cluster | kind (Kubernetes 1.36 node image) | 0.33 | Apache-2.0 | M1 |
| Inner loop / tasks | Tilt / Task | 0.37 / 3.53 | Apache-2.0 / MIT | M1 / M0 |
| Packaging | Helm / Kustomize | 4.3 / 5.8 | Apache-2.0 | M1 |
| Gateway | Kubernetes Gateway API + Envoy Gateway | 1.6 / 1.9 | Apache-2.0 | M1 |
| TLS / identity | cert-manager / Keycloak | current | Apache-2.0 | M7 |
| Observability | OpenTelemetry SDKs + Collector | Collector 0.16x | Apache-2.0 | M2 |
| Metrics / logs / traces / UI | Prometheus / Loki / Tempo / Grafana | 3.13 LTS / 3.7 / 3.1 / current | Apache-2.0 / AGPL-3.0 / AGPL-3.0 / AGPL-3.0 | M2 |
| Data | CloudNativePG / Valkey | 1.30 / 9.1 | Apache-2.0 / BSD-3-Clause | M3 |
| Broker | Apache Kafka (KRaft) via Strimzi | 4.3 / 1.2 | Apache-2.0 | M4 |
| Kafka clients | Confluent.Kafka / @confluentinc/kafka-javascript | 2.x / 1.x | Apache-2.0 / MIT | M4 |
| Schema registry / UI | Apicurio Registry / kafbat UI | 3.3 / 1.5 | Apache-2.0 | M4 |
| Autoscaling / load | KEDA / k6 | 2.21 / 2.x | Apache-2.0 / AGPL-3.0 | M8 |
| GitOps / delivery | Argo CD / Argo Rollouts | 3.5 / 1.10 | Apache-2.0 | M9 / M10 |
| IaC | OpenTofu | 1.12 | MPL-2.0 | M9 |
| Feature flags | OpenFeature + flagd | current | Apache-2.0 | M10 |
| Mesh | Istio (ambient) / Kiali | 1.31 / 2.x | Apache-2.0 | M11 |
| Secrets | External Secrets Operator / OpenBao | 2.x / 2.6 | Apache-2.0 / MPL-2.0 | M12 |
| Supply chain / policy | Trivy, Syft, cosign / Kyverno | cosign 3 / 1.19 | Apache-2.0 | M12 |
| Chaos | Chaos Mesh | 2.8 | Apache-2.0 | M13 |
| Repo tooling | Node.js scripts (built-ins only) / pnpm workspaces | Node 24 LTS / 12.8.1 | MIT | M0 |
| CI / registry / docs hosting | GitHub Actions / GHCR / GitHub Pages | service | — | M0 / M1 / M0 |
| CI actions (pinned by commit SHA) | actions/checkout / actions/setup-node / pnpm/action-setup / dorny/paths-filter | 7.0.1 / 7.0.0 / 6.1.0 / 4.0.3 | MIT | M0 |
| Pages actions (pinned by commit SHA) | actions/configure-pages / actions/upload-pages-artifact / actions/deploy-pages | 6.0.0 / 5.0.0 / 5.0.1 | MIT | M0 |
| Docs | Docusaurus / markdownlint-cli2 / lychee (lychee-action) | 3.10.2 / 0.23.3 / action 2.9.0 | MIT / MIT / Apache-2.0 | M0 |

## Licensing notes

- Everything is open source; nothing needs a paid plan.
- Grafana, Loki, Tempo and k6 are **AGPL-3.0**. We run them unmodified, which the license allows. Their milestone's `stack-check` re-confirms this.
- Some candidates were rejected partly for licensing reasons: Redpanda (BSL), Redis 8 (AGPL/source-available) and Terraform (BSL). The [ADRs](../adr/index.md) record why.

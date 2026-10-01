# Fundamentals

The system demonstrates 36 microservices fundamentals in three tiers. As each milestone lands, its fundamentals get a concept page (what, why, how it's built here, trade-offs, questions) and at least one hands-on lab.

- **Tier 1, core backbone:** 1–15.
- **Tier 2, distributed data and resilience patterns:** 16–26.
- **Tier 3, big-tech platform and SRE:** 27–36.

| # | Fundamental | Tier | Milestone(s) | Status | Concept | Lab |
|---|---|---|---|---|---|---|
| 1 | Containerization (multi-stage, multi-arch, minimal images) | 1 | M1 | planned | — | — |
| 2 | Kubernetes orchestration | 1 | M1, M8 | planned | — | — |
| 3 | API gateway | 1 | M1, M7 | planned | — | — |
| 4 | Edge authentication (OIDC + JWT) | 1 | M7 | planned | — | — |
| 5 | Rate limiting (local + global) | 1 | M7 | planned | — | — |
| 6 | Service discovery and load balancing | 1 | M1, M3, M11 | planned | — | — |
| 7 | Contract-first sync RPC (Protobuf/gRPC + Buf) | 1 | M1, M16 | planned | — | — |
| 8 | Async messaging via a broker (Kafka) | 1 | M4 | planned | — | — |
| 9 | Database per service | 1 | M3 | planned | — | — |
| 10 | Health, readiness and graceful shutdown | 1 | M1, M8 | planned | — | — |
| 11 | 12-factor config and secrets, environment overlays | 1 | M1 | planned | — | — |
| 12 | Observability (OpenTelemetry traces, metrics, logs) | 1 | M2, M4 | planned | — | — |
| 13 | CI per service | 1 | M0, M1 | planned | — | — |
| 14 | GitOps continuous delivery | 1 | M9 | planned | — | — |
| 15 | Infrastructure as Code | 1 | M9, M14 | planned | — | — |
| 16 | Event-driven architecture (CloudEvents + schema registry) | 2 | M4, M16 | planned | — | — |
| 17 | Saga (choreography) with compensations | 2 | M5 | planned | — | — |
| 18 | Transactional outbox | 2 | M4 | planned | — | — |
| 19 | Idempotent consumers | 2 | M4, M5 | planned | — | — |
| 20 | Retry topics and dead-letter queues | 2 | M5 | planned | — | — |
| 21 | CQRS read model | 2 | M6 | planned | — | — |
| 22 | Cache-aside | 2 | M3 | planned | — | — |
| 23 | Timeouts, retries, circuit breakers, bulkheads | 2 | M3, M8 | planned | — | — |
| 24 | BFF / API composition | 2 | M1, M6 | planned | — | — |
| 25 | Autoscaling (HPA + KEDA) | 2 | M8 | planned | — | — |
| 26 | API versioning and backward compatibility | 2 | M6 | planned | — | — |
| 27 | Service mesh (Istio ambient) | 3 | M11 | planned | — | — |
| 28 | Zero-trust authorization + NetworkPolicies | 3 | M11 | planned | — | — |
| 29 | Secrets management | 3 | M12 | planned | — | — |
| 30 | Progressive delivery (canary + analysis) | 3 | M10 | planned | — | — |
| 31 | Supply-chain security | 3 | M12 | planned | — | — |
| 32 | Policy as code | 3 | M12, M14 | planned | — | — |
| 33 | SLOs, error budgets and alerting | 3 | M13 | planned | — | — |
| 34 | Chaos engineering | 3 | M11, M13 | planned | — | — |
| 35 | Microservice test pyramid | 3 | M1–M13 | planned | — | — |
| 36 | Feature flags | 3 | M10 | planned | — | — |

Status values are `planned`, `in progress` and `implemented`. When a fundamental lands, its row links its concept page and its labs.

**Tier 4 (future, not planned):** Temporal orchestration (37), Debezium CDC (38), event sourcing (39), Backstage (40), GraphQL federation (41), Dapr (42), multi-cluster (43), strangler fig (44).

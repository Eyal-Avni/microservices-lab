---
sidebar_position: 8
---

# Glossary

- **API gateway**: the single entry point in front of the services. It handles routing, TLS, authentication and rate limiting. Here: Envoy Gateway.
- **Backend-for-frontend (BFF)**: an API shaped for one kind of client, which combines several services' data (bff-web).
- **Bounded context**: a part of the domain with its own model and language. Each service owns one.
- **Bulkhead**: isolating resources (connection pools, threads) so that one failing dependency can't exhaust everything.
- **Circuit breaker**: stops calling a failing dependency for a while, so failures fail fast instead of piling up.
- **CloudEvents**: a CNCF standard for event metadata (id, type, source, subject, time). Our Kafka messages carry it in headers.
- **Compensation**: an action that semantically undoes an earlier saga step, for example a refund.
- **Consumer group**: Kafka consumers that share a topic's partitions; each partition goes to one member.
- **CQRS**: Command Query Responsibility Segregation. Writes and reads use different models; here order-query builds a read model from events.
- **Dead-letter queue (DLQ)**: where messages go after they keep failing, so that they stop blocking the stream.
- **Distroless / chiseled image**: a container image with only the app and its runtime: no shell and no package manager.
- **Eventual consistency**: different services agree after a short delay, rather than instantly.
- **Gateway API**: the Kubernetes standard API for ingress traffic (Gateway, HTTPRoute, GRPCRoute). It replaces Ingress.
- **GitOps**: the cluster pulls its desired state from Git, and an agent (Argo CD) keeps it in sync.
- **gRPC**: a fast RPC framework over HTTP/2, with Protobuf contracts.
- **Idempotency**: doing something twice has the same effect as doing it once. This is essential with at-least-once delivery.
- **Infrastructure as Code (IaC)**: infrastructure declared in versioned files (OpenTofu here) instead of being clicked together.
- **kind**: Kubernetes IN Docker. It runs whole clusters as containers on a laptop.
- **KRaft**: Kafka's built-in consensus, which replaced ZooKeeper (Kafka 4 runs KRaft only).
- **Liveness / readiness probe**: Kubernetes health checks. Liveness answers "restart me?"; readiness answers "send me traffic?".
- **mTLS**: mutual TLS, where both sides present certificates. A service mesh does it transparently.
- **Outbox pattern**: write the event into the same database transaction as the state change, then relay it to the broker, so no event is lost.
- **Partition**: a shard of a Kafka topic. Ordering is guaranteed only within a partition, which is why messages are keyed by orderId.
- **Protobuf**: Protocol Buffers, a compact, typed and versionable message format.
- **Rate limiting**: capping how many requests a client may make per time window.
- **Saga**: a business transaction spread across services, made of local steps plus compensations. In choreography the services react to each other's events; in orchestration a coordinator directs them.
- **Schema registry**: stores message schemas and rejects incompatible changes (Apicurio here).
- **Service mesh**: infrastructure that handles service-to-service traffic: mTLS, retries, policy, telemetry (Istio ambient here).
- **SLO / error budget**: a reliability target, and the amount of failure the target still allows.
- **Tombstone (saga)**: a marker saying "this order was cancelled before I saw it", so that a late or replayed message is ignored.
- **Zero trust**: never trust the network. Every call must prove its identity and be explicitly allowed.

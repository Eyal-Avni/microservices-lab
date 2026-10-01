---
status: accepted
date: 2026-10-01
decision-makers: learner (Eyal-Avni), Claude Code
---

# 0005 — Commerce domain and service decomposition

## Context and problem statement

Sagas, the outbox pattern and CQRS need a real business flow to act on; endpoints that only return metadata would leave them with nothing to do. A textbook domain also means books and articles map one-to-one onto the code.

## Considered options

- A commerce order flow
- A neutral job pipeline
- The same flow with themed nouns
- Metadata-only services

## Decision outcome

Chosen option: "A commerce order flow", because it is the canonical example in microservices.io, Microsoft's eShop and Sam Newman's books.

- Seven services: catalog, order, payment, inventory, notification, order-query and bff-web.
- Each service runs in its own namespace and owns its data.
- Kafka topics are per aggregate (`orders.v1`, `payments.v1`, `inventory.v1`) and keyed by orderId, so each order's events stay in order.
- A parallel choreographed saga with compensations decides each order's outcome.

### Consequences

- Good, because outside reading maps directly onto this code.
- Bad, because the business rules are trivial, so some patterns are demonstrative rather than strictly necessary.

## More information

- Spec §5 (system architecture).
- [Architecture overview](../architecture/overview.md).

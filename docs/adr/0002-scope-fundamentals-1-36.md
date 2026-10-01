---
status: accepted
date: 2026-10-01
decision-makers: learner (Eyal-Avni), Claude Code
---

# 0002 — Scope: fundamentals 1–36; Tier 4 deferred

## Context and problem statement

The design session catalogued 44 microservices fundamentals in four tiers, from the core backbone (gateway, broker, database per service) to advanced stretch goals (Temporal, event sourcing, Backstage). The learner selected Tiers 1–3. Laptop resources (32 GB RAM) and learning time are finite, so the scope must be explicit.

## Considered options

- Tiers 1–3 (fundamentals 1–36)
- Tier 1 only (the core backbone, 1–15)
- All four tiers (1–44)

## Decision outcome

Chosen option: "Tiers 1–3", because they cover the patterns big-tech systems use every day while staying buildable on one laptop.

Tier 4 is listed as "future / not planned" in the ROADMAP: Temporal orchestration, Debezium CDC, event sourcing, Backstage, GraphQL federation, Dapr, multi-cluster and the strangler fig.

### Consequences

- Good, because every selected fundamental gets running code, a concept page and a lab.
- Good, because the roadmap stays finite (M0–M16).
- Bad, because orchestration engines, change data capture and event sourcing are only described, not built.

## More information

- Spec §4 (fundamentals catalog and coverage matrix).
- [Fundamentals index](../fundamentals/index.md).

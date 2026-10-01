---
status: accepted
date: 2026-10-01
decision-makers: learner (Eyal-Avni), Claude Code
---

# 0004 — .NET 10 for the core, Node 24 + NestJS at the edge, Go later

## Context and problem statement

The learner is strong in Node/TypeScript, uses .NET (C#) at work, and did not want Go in the core services. A contract-first design (Protobuf contracts, CloudEvents on Kafka) should make the language a per-service choice, which is itself one of the lessons.

## Considered options

- .NET core services with a Node edge
- Mostly .NET, with only the BFF in Node
- Node core services with some .NET
- Go first
- Three languages (.NET, Node, Go) from day one

## Decision outcome

Chosen option: ".NET core services with a Node edge", because it gives practice in both of the learner's work languages and uses each where it is strongest.

- .NET 10 LTS for catalog, order, payment and inventory: ASP.NET Core minimal APIs, Grpc.AspNetCore and EF Core.
- NestJS on Node 24 LTS for bff-web, notification and order-query.
- A Go `shipping` service arrives in M16 to prove contract-first design: a new language joins with no changes to the other services.

### Consequences

- Good, because the learner practises both work languages.
- Good, because NestJS's dependency injection mirrors ASP.NET Core, so patterns transfer between them.
- Bad, because CI needs two toolchains and the repo needs two sets of platform libraries.

## More information

- Spec §3 (decisions D2–D4).

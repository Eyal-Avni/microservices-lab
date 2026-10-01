---
status: accepted
date: 2026-10-01
decision-makers: learner (Eyal-Avni), Claude Code
---

# 0009 — proto3 + Buf; gRPC inside, REST at the BFF

## Context and problem statement

Contract-first RPC is a core fundamental, and the contracts must work across .NET, Node and later Go. Protobuf Editions are the newest schema format, but as of 2026-09 their support in Apicurio and the Confluent serializers was unverified.

## Considered options

- proto3 with Buf
- Protobuf Editions 2024
- OpenAPI everywhere (REST between services)
- ConnectRPC only

## Decision outcome

Chosen option: "proto3 with Buf", because every tool in the chain supports it, and Buf adds linting and breaking-change detection.

- Contracts live under `proto/commerce/<context>/v1`, checked by Buf (STANDARD lint, FILE breaking-change rules).
- Services call each other with gRPC; bff-web exposes REST/JSON with OpenAPI to clients.
- NestJS uses grpc-js with ts-proto, because grpc-js has OpenTelemetry instrumentation and Connect-ES does not.

### Consequences

- Good, because a breaking contract change fails CI before it reaches a consumer.
- Good, because every language gets typed clients from the same contracts.
- Bad, because Node needs two code generators: ts-proto for RPC and protobuf-es for event payloads.

## More information

- Spec §5.4 (synchronous APIs) and §8 (tech stack).

---
status: accepted
date: 2026-10-01
decision-makers: learner (Eyal-Avni), Claude Code
---

# 0010 — Chiseled/distroless multi-arch images, no Native AOT

## Context and problem statement

A future Arm cloud (OCI Ampere A1) needs arm64 images, while the laptop is amd64. The Node Kafka client downloads a native binary for each architecture, so emulated builds are risky. .NET Native AOT would shrink the images, but it conflicts with reflection-heavy libraries (EF Core, the schema-registry serializers, OpenFeature).

## Considered options

- Chiseled/distroless multi-arch images built natively per architecture
- Native AOT
- Alpine images
- amd64 only

## Decision outcome

Chosen option: "Chiseled/distroless multi-arch images", because they are small and non-root, keep the Arm cloud option open, and ship the glibc that librdkafka needs.

- .NET services run on `aspnet:10.0-noble-chiseled`, cross-compiled with `dotnet publish -a $TARGETARCH`.
- Node services run on `gcr.io/distroless/nodejs24-debian13:nonroot`.
- Images are built natively on `ubuntu-24.04` and `ubuntu-24.04-arm` runners and merged into one manifest, never under QEMU emulation.

### Consequences

- Good, because the images are small, run as non-root and work on arm64.
- Bad, because there is no shell inside the containers; debugging uses `kubectl debug`, which becomes an M1 lab.
- Bad, because the images are larger than Native AOT ones would be.

## More information

- Spec §3 (decision D12) and §6.8 (delivery).

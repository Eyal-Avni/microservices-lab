---
status: accepted
date: 2026-10-01
decision-makers: learner (Eyal-Avni), Claude Code
---

# 0011 — Kubernetes Gateway API with Envoy Gateway

## Context and problem statement

ingress-nginx, long the default Kubernetes ingress controller, is retired and gets no fixes after March 2026. The edge needs JWT/OIDC authentication, global rate limiting, retries and circuit breaking, ideally without paid add-ons. Kubernetes Gateway API v1.6 is now the standard for routing traffic into a cluster.

## Considered options

- Envoy Gateway
- Kong OSS (frozen at 3.9.1)
- Traefik OSS (JWT/OIDC only in the paid tier)
- Istio's gateway (global rate limiting needs an EnvoyFilter)
- ingress-nginx (retired)

## Decision outcome

Chosen option: "Envoy Gateway", because it implements the standard Gateway API and supports every edge feature we need natively.

- Envoy Gateway 1.9 implements Gateway API routes (HTTPRoute, GRPCRoute).
- It is exposed on NodePorts 30080/30443, which kind maps to 127.0.0.1:80/443.

### Consequences

- Good, because routes use the vendor-neutral standard API.
- Good, because JWT/OIDC, rate limits, retries and circuit breaking are all built in.
- Bad, because there are fewer tutorials than for nginx.
- Bad, because global rate limiting needs a Redis-protocol store (Valkey).

## More information

- Spec §6.1 (edge).

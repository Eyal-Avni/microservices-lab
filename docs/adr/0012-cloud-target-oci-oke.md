---
status: proposed
date: 2026-10-01
decision-makers: learner (Eyal-Avni), Claude Code
---

# 0012 — Cloud target: OCI OKE Basic (decide in M14)

## Context and problem statement

The cloud deployment comes in M14 and must stay free. On 2026-09-30, the only forever-free managed Kubernetes found was Oracle Cloud's Always Free tier:

- Ampere A1 Arm compute, 2 OCPU / 12 GB since mid-2026;
- a free control plane for OKE Basic clusters;
- a Pay-As-You-Go account upgrade that is likely needed (still $0 within the limits).

Several settings cost money by default:

- the Console creates the paid Enhanced cluster unless told otherwise;
- a LoadBalancer Service without annotations gets the paid 100 Mbps shape;
- every PVC is at least 50 GB, inside a 200 GB total that includes the boot volumes;
- OCI's container registry (OCIR) charges for storage.

The alternatives are time-limited credits (GCP, Azure, AWS).

## Considered options

- OCI OKE Basic
- k3s on OCI A1 VMs
- GCP or Azure trial credits
- Stay local only

## Decision outcome

Proposed option: "OCI OKE Basic", because it is the only free option with a managed control plane. The proposal:

- OKE Basic on A1 nodes, with a `cloud-slim` profile (about 6 GB);
- Grafana Cloud Free for observability;
- images on GHCR;
- infrastructure provisioned with OpenTofu;
- cost-guardrail policies.

This record stays **proposed** until M14. Research the terms again first: Oracle changed them without notice in 2026.

### Consequences

- Good, because the system would be always on, with a managed control plane, at $0 within the limits.
- Bad, because it needs a Pay-As-You-Go account with a card.
- Bad, because Arm capacity can run out, the nodes are Arm only, and the terms can change.

## More information

- Spec §7.5 (cloud research) and §18 (sources).
- [ADR 0003](0003-local-first-on-kind.md) (local first).

---
status: accepted
date: 2026-10-01
decision-makers: learner (Eyal-Avni), Claude Code
---

# 0003 — Local first on kind; cloud later (M14)

## Context and problem statement

The infrastructure must be free. Oracle Cloud's forever-free Arm allowance, the only free managed Kubernetes found in research, was halved in mid-2026 to 2 OCPU / 12 GB. Meanwhile the learner's laptop has 32 GB RAM and Docker Desktop on WSL2, which is enough for the full lab. The learner chose to build locally first and move to the cloud later.

## Considered options

- kind locally now, cloud in M14
- OCI OKE from day one
- k3s on an OCI Always Free VM
- GCP or Azure trial credits

## Decision outcome

Chosen option: "kind locally now, cloud in M14", because the whole lab (about 15 GB with every add-on) fits on the laptop, with fast iteration and no cost risk.

- A kind cluster with one control-plane node and two workers, pinned to Kubernetes 1.36.
- Profiles: `core` (about 12 GB), `full` (about 15 GB), and a small `ci` profile for GitHub Actions.
- The cloud provider is decided in M14; [ADR 0012](0012-cloud-target-oci-oke.md) records the research so far.

### Consequences

- Good, because the full lab fits on one machine and iteration is fast.
- Good, because there is no risk of a surprise cloud bill.
- Bad, because there is no always-on public endpoint until M14.
- Bad, because images must stay multi-architecture from day one to remain cloud-ready (the likely cloud nodes are Arm).

## More information

- Spec §2 (goals), §7 (environments and resource budget) and §7.5 (cloud research).

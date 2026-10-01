---
status: accepted
date: 2026-10-01
decision-makers: learner (Eyal-Avni), Claude Code
---

# 0006 — Monorepo, squash-merged PRs and a single `ci-ok` gate

## Context and problem statement

One learner works on many services that share contracts, docs and tooling. In GitHub, a workflow that path filters skip never reports a status, so making it a required check would block merges forever.

## Considered options

- A monorepo with path filters inside one orchestrator workflow
- A polyrepo (one repository per service)
- A monorepo with a separate workflow per service, each a required check

## Decision outcome

Chosen option: "A monorepo with one orchestrator workflow", because changes to contracts, services and docs can land together, and a single always-running `ci-ok` job can be the only required check.

- One public GitHub monorepo.
- `main` is protected by a ruleset: changes need a pull request and a green `ci-ok`.
- Squash merges, Conventional Commits, `mN/<slug>` branches, and GitHub Actions pinned by commit SHA.

### Consequences

- Good, because a change to a contract and all its consumers is one atomic pull request.
- Good, because there is exactly one required check, however many jobs run.
- Bad, because CI must stay fast through path filters.
- Bad, because monorepo tooling is needed (pnpm workspaces, .NET central package management).

## More information

- Spec §6.8 (delivery) and §10 (conventions).
- [How we work](../architecture/dev-workflow.md).

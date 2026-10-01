# Roadmap

**Current milestone:** M1 — Walking skeleton · planned

This is the "plan of plans" for the Microservices Lab. Every milestone runs the same loop: stack-check → spec → plan → build (TDD) → review → verify → docs → PR → tag. The design behind it all is the [system design spec](docs/superpowers/specs/2026-09-30-microservices-lab-design.md).

Statuses: `planned` · `in-progress` · `done` · `deferred`. Tooling parses this file (`scripts/lib/roadmap.mjs`): keep the current-milestone line and the table shape intact. The `roadmap` skill explains how to change them.

| M | Goal | Fundamentals | Status | Spec | Plan | Tag |
|---|---|---|---|---|---|---|
| M0 | Foundation | 13 (CI skeleton) | done | [design](docs/superpowers/specs/2026-09-30-microservices-lab-design.md) | [m0](docs/superpowers/plans/2026-10-01-m0-foundation.md) | m0 |
| M1 | Walking skeleton | 1, 2, 3, 6, 7, 10, 11, 13, 24, 35 | planned | — | — | — |
| M2 | Observability | 12 | planned | — | — | — |
| M3 | Data ownership | 9, 22, 23, 6 | planned | — | — | — |
| M4 | Event backbone | 8, 16, 18, 19, 12 | planned | — | — | — |
| M5 | Saga | 17, 19, 20 | planned | — | — | — |
| M6 | CQRS, BFF composition, versioning | 21, 24, 26 | planned | — | — | — |
| M7 | Edge security | 3, 4, 5 | planned | — | — | — |
| M8 | Resilience & scaling | 23, 25, 2, 10 | planned | — | — | — |
| M9 | IaC & GitOps | 14, 15 | planned | — | — | — |
| M10 | Progressive delivery & flags | 30, 36 | planned | — | — | — |
| M11 | Mesh & zero trust | 27, 28, 6, 34 | planned | — | — | — |
| M12 | Secrets, supply chain, policy | 29, 31, 32 | planned | — | — | — |
| M13 | SRE | 33, 34, 35 | planned | — | — | — |
| M14 | Cloud | 15, 32 | planned | — | — | — |
| M15 | Learning experience | all | planned | — | — | — |
| M16 | Polyglot proof | 7, 16 | planned | — | — | — |

## M0 — Foundation

Definition of Done:

- [x] Toolchain installed and verified (stage 1)
- [x] Public GitHub repo with secret scanning, push protection and squash-only merges
- [x] CLAUDE.md, ROADMAP.md, README.md and LICENSE
- [x] Docs skeleton: start page, templates, architecture pages, fundamentals index, glossary, toolchain runbook
- [x] ADRs 0001–0012
- [x] Docs-freshness layers 1–3: Claude hook, git commit-msg hook, CI docs-drift
- [x] SessionStart hook shows the current milestone in a new session
- [x] Skills `roadmap`, `adr`, `update-docs`, `stack-check` and agent `docs-auditor`
- [x] Docusaurus site builds and is live on GitHub Pages
- [x] CI `ci-ok` green on the M0 PR; a ruleset requires it on `main`
- [x] Tag `m0` and a GitHub Release

## Future / not planned (Tier 4)

Temporal orchestration (37) · Debezium CDC (38) · event sourcing (39) · Backstage (40) · GraphQL federation (41) · Dapr (42) · multi-cluster (43) · strangler fig (44).

## Changelog

- 2026-10-01 — Design spec approved; M0 started.
- 2026-10-01 — Toolchain installed and verified; public repo published.
- 2026-10-01 — CLAUDE.md, README, LICENSE, the docs skeleton and ADRs 0001–0012 written; hooks, skills, the docs site and CI built (M0 PR).
- 2026-10-01 — M0 done: PR #1 merged with `ci-ok` green, the docs site is live, a ruleset protects `main`, and a new session proved the hooks live (deny on `main`, reminder on a branch). Tag `m0` and its release follow this PR's merge. 12 minor review findings carry over to M1 (listed in the PR #1 body).
- 2026-10-01 — M1 next: walking skeleton.

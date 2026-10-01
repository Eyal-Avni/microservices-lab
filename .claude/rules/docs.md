---
paths:
  - "docs/**"
  - "ROADMAP.md"
  - "README.md"
  - "services/**"
  - "libs/**"
  - "proto/**"
  - "deploy/**"
  - "infra/**"
---

# Docs conventions

- Changing code under `services/`, `libs/`, `proto/`, `deploy/`, `infra/`, `scripts/`, `.claude/` or `.github/` means updating the matching docs in the same PR. `node scripts/docs-drift.mjs --staged` suggests the pages, and the `update-docs` skill does the work.
- Start new pages from `docs/_templates/` (concept, lab, service, runbook, ADR) and keep every section.
- After every Mermaid block, add a paragraph that starts with `**Diagram description:**` and explains the diagram in prose. The learning pack is text-only. The `docs-auditor` agent checks this, and an automated check arrives in M2.
- Link pages inside `docs/` relatively. Link anything outside `docs/` with `https://github.com/Eyal-Avni/microservices-lab/blob/main/<path>`, because the site build fails on relative links that leave `docs/`.
- New folders under `docs/` get a `_category_.json` (label and position) so that the sidebar stays ordered.
- Run `task docs:lint` and `task docs:build` before committing docs.
- Write for the learner: explain the why, name the trade-offs, and keep "Check your understanding" answerable from the page.

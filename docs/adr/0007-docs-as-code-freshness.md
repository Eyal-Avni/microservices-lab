---
status: accepted
date: 2026-10-01
decision-makers: learner (Eyal-Avni), Claude Code
---

# 0007 — Docs as code with five freshness layers

## Context and problem statement

Docs are a first-class deliverable here: the learner asked for documentation that is updated with every feature. Left alone, docs rot silently. The code changes, and nobody notices that a page is now wrong.

## Considered options

- An honour system (remember to update the docs)
- A CI-only check
- Layered checks: a Claude Code hook, a git hook, CI, generated references and a semantic audit

## Decision outcome

Chosen option: "Layered checks", because each layer catches drift at a different moment, from the commit to the pull request.

- Markdown lives in `docs/`, and Docusaurus publishes it to GitHub Pages.
- Five layers enforce freshness (spec §12.6): the docs-guard hook, the git `commit-msg` hook, the CI `docs-drift` job, regenerated references, and the `docs-auditor` agent.
- The hard gates apply only on `main` and in CI, so small test-first commits on branches are never blocked.
- Escape hatches: `[skip-docs]` in a commit message, and the `skip-docs` label on a pull request.

### Consequences

- Good, because drift is caught before it reaches `main`.
- Bad, because the checks prove only *that* docs changed, not that they are right; the `docs-auditor` agent and code review cover correctness.

## More information

- Spec §12 (documentation and learning system).
- [How we work](../architecture/dev-workflow.md).

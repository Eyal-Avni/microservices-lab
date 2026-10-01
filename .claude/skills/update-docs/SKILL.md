---
name: update-docs
description: Use when code, deploy, proto, infra, scripts, CI or Claude tooling in this repo changed and the docs may now be stale - before committing on main, before opening a PR, or when the docs guard or docs-drift reports missing docs
---

# Updating docs after a change

## Overview

Docs are part of the change. The docs guard and CI only prove *that* docs changed. This skill is about changing the *right* pages, correctly.

## Steps

1. List the change: `git diff --cached --name-only` (staged) or `git diff --name-only origin/main...HEAD` (branch).
2. Get suggestions: `node scripts/docs-drift.mjs --staged --include-worktree` (or `--range origin/main...HEAD`) prints the pages the change probably affects.
3. On each affected page, fix whatever the change made untrue: commands and task names, ports, paths, versions, diagrams and their `**Diagram description:**`, and concept pages' "How it's built here" and "See it" sections.
4. New service, fundamental, lab or runbook: create the page from `docs/_templates/` and update its index (`docs/fundamentals/index.md` status and links, `docs/adr/index.md`).
5. A tool was added, replaced or removed: update its entry in `docs/architecture/tools-explained.md` and its row in `docs/architecture/tech-stack.md`.
6. Decision changed: use the `adr` skill. Milestone progress: tick DoD boxes in `ROADMAP.md` (the `roadmap` skill for status changes). New term: add it to `docs/glossary.md`.
7. Verify: `task docs:lint` and `task docs:build` pass, and the step-2 command now prints nothing.

## Where changes land

| Changed | Update |
|---|---|
| `services/<svc>/**` | `docs/services/<svc>.md` and the related concept pages |
| `proto/**` | regenerate `docs/reference/`, plus the service pages' API sections |
| `deploy/platform/<component>/**` | the component's concept page, `docs/architecture/environments.md` |
| `deploy/**`, `infra/**` | `docs/architecture/environments.md`, runbooks |
| `scripts/**`, `.claude/**`, `.github/**`, `Taskfile.yml`, `Tiltfile` | `docs/architecture/dev-workflow.md` (commands, tooling and CI tables) |
| A tool added, replaced or removed (package, image, chart, action, CLI, MCP server) | `docs/architecture/tools-explained.md` and `docs/architecture/tech-stack.md` |

## Common mistakes

| Mistake | Fix |
|---|---|
| Only touching a changelog line to silence the check | Fix the pages the change made untrue |
| Updating a diagram but not its Diagram description | Update both together |
| A relative link to a file outside `docs/` | Use `https://github.com/Eyal-Avni/microservices-lab/blob/main/<path>` |

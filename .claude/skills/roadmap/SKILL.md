---
name: roadmap
description: Use when starting, finishing, deferring or re-planning a milestone, or when asked for the project status, in this repo's ROADMAP.md
disable-model-invocation: true
argument-hint: "[status | start Mn | done Mn | defer Mn]"
---

# Updating the roadmap

ROADMAP.md is parsed by tooling (`scripts/lib/roadmap.mjs`, used by the SessionStart hook and by a contract test that reads the real file), so its shape is a contract.

## The contract

- The line after the title is `**Current milestone:** M<n> — <goal> · <status>`. Statuses: `planned`, `in-progress`, `done`, `deferred`. It always names the milestone being worked on, or the next one.
- The table has the columns `| M | Goal | Fundamentals | Status | Spec | Plan | Tag |`, with one row for each of M0–M16 and `—` in empty cells. At most one row is `in-progress`, and the current line's status equals its row's status.
- Every started milestone has a `## M<n> — <goal>` section with a `Definition of Done:` checklist (`- [ ]` / `- [x]`).
- `## Changelog` entries go newest last, as `- YYYY-MM-DD — what happened`.

## Operations

| Request | What to do |
|---|---|
| `status` | Run `node --test scripts/lib/roadmap.test.mjs`. Report the current milestone, its open DoD items and the next planned milestone. |
| `start Mn` | Set the row to `in-progress` and link the spec and plan if they exist. Set the current line to `Mn — <goal> · in-progress`. Add the `## Mn — <goal>` section with its DoD: copy it from the milestone plan, or, if there is no plan yet, use the milestone's deliverables in spec §14 plus the generic DoD in spec §11. Add a changelog entry. |
| `done Mn` | Only when every DoD box is ticked and `task verify` and `ci-ok` are green. Set the row to `done` and Tag to `mN`. Set the current line to the next planned milestone with `· planned`. Add a changelog entry. After the PR merges: `git tag -a mN -m "MN — <goal>"`, `git push origin mN`, then `gh release create mN --title "MN — <goal>" --notes-file <notes.md>`. |
| `defer Mn` | Set the row to `deferred` and add a changelog entry with the reason. |

Always finish with `node --test scripts/lib/roadmap.test.mjs`, which must pass: its contract test parses the real ROADMAP.md. Tagging and releasing happen only on the merged `main` commit, never on a branch.

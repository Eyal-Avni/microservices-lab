---
status: accepted
date: 2026-10-01
decision-makers: learner (Eyal-Avni), Claude Code
---

# 0001 — Record architecture decisions with MADR 4

## Context and problem statement

This is a learning project, so the *why* behind each choice matters as much as the code. The design session on 2026-09-30 settled many decisions (scope, languages, domain, tooling), and they must stay visible so that nobody has to argue them again from memory. We need a lightweight format that lives next to the code and can be reviewed in pull requests.

## Considered options

- MADR 4 (Markdown Architectural Decision Records) files in `docs/adr/`
- Nygard-style ADRs (the original, shorter format)
- Decisions recorded only in the design spec
- Wiki pages

## Decision outcome

Chosen option: "MADR 4 files in `docs/adr/`", because MADR's structure (context, options, outcome, consequences) makes the rejected options explicit, and for a learner the rejected options are half the lesson.

- Files are numbered `NNNN-<slug>.md` and listed in [the index](index.md).
- Accepted records are never edited; a changed decision gets a new record that supersedes the old one.
- The `adr` skill writes new records and keeps the index complete.

### Consequences

- Good, because decisions are versioned together with the code and readable on the docs site.
- Good, because rejected options and their reasons are recorded, not just the winner.
- Bad, because every significant decision costs one more step.
- Bad, because parallel branches can clash on the next number (rare with a single developer).

## More information

- Spec §3 (key decisions) and §12 (documentation system).
- MADR: https://adr.github.io/madr/

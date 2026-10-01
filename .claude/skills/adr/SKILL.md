---
name: adr
description: Use when a significant technical or process decision is made, changed or reversed in this repo (choosing or replacing a tool, library, pattern, version policy or provider) and it needs to be recorded as an Architecture Decision Record
---

# Recording an ADR

## Overview

Decisions live in `docs/adr/` as numbered MADR 4 records, so the learner can see why the system looks the way it does. One decision per file. Accepted records are never rewritten: a changed decision gets a new record that supersedes the old one.

## Steps

1. Number: the highest `docs/adr/NNNN-*.md` plus one, zero-padded to four digits.
2. File: `docs/adr/NNNN-<kebab-case-title>.md`, copied from `docs/_templates/adr.md`. Fill every section; delete none.
3. Front matter: `status: accepted` for a decision made now, `proposed` while the learner still has to decide; `date:` is today.
4. Considered options: at least two, including the rejected ones and why. The rejected options are part of the lesson. Cite versions, dates and sources.
5. Superseding: set the old record's status to `superseded by ADR-NNNN` and link the two records both ways.
6. Add a row to the table in `docs/adr/index.md`: the number as a link, the decision, the status and the date.
7. If the decision adds, replaces or removes a tool, also update `docs/architecture/tools-explained.md` and `docs/architecture/tech-stack.md`.
8. Run `task docs:build`. It fails if the index links a file that doesn't exist.

## Common mistakes

| Mistake | Fix |
|---|---|
| Editing an accepted ADR to change the decision | Write a new ADR that supersedes it |
| Forgetting the index row | The record can't be found from the index; add the row |
| Listing only the chosen option | Add the rejected options and the reasons |
| A topic as the title ("Caching") | State the decision ("Use Valkey for caches") |

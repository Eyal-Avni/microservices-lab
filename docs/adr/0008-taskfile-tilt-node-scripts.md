---
status: accepted
date: 2026-10-01
decision-makers: learner (Eyal-Avni), Claude Code
---

# 0008 — Taskfile, Tilt and dependency-free Node tooling

## Context and problem statement

Development happens on Windows 11 (PowerShell and Git Bash) while CI runs on Linux. `make` needs MSYS2 or WSL on Windows, and bash scripts don't run in PowerShell, so the project needs commands that behave the same everywhere.

## Considered options

- Taskfile with Node scripts
- make with bash scripts
- npm scripts only
- PowerShell scripts

## Decision outcome

Chosen option: "Taskfile with Node scripts", because Task's embedded POSIX shell interpreter runs the same commands on every OS, and Node is already needed for the docs site and the NestJS services.

- `task` is the single entry point (`task setup`, `task test`, `task verify` and so on).
- Tooling scripts are Node `.mjs` files that use only built-in modules, tested with `node:test`.
- Tilt drives the inner development loop from M1.

### Consequences

- Good, because the same commands work on Windows, macOS and Linux CI.
- Good, because the tooling itself has unit tests.
- Bad, because contributors must install Task.
- Bad, because Node is required even for .NET-only work.

## More information

- Spec §3 (decision D15) and §7.4 (commands).

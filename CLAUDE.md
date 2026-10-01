# Microservices Lab — guide for Claude Code

An educational system for learning microservices "to the fullest". Business logic stays trivial; the value is in the platform patterns, the docs and the labs. The learner studies, runs and deliberately breaks what we build.

- Design (source of truth): `docs/superpowers/specs/2026-09-30-microservices-lab-design.md`
- Plan of plans and current status: `ROADMAP.md`. The SessionStart hook prints the current milestone.
- Docs site: https://eyal-avni.github.io/microservices-lab/ (source in `docs/`, built by `website/`).

## Learner profile

- Strong in Node/TypeScript; uses .NET (C#) at work; new to Kubernetes and cloud-native platforms.
- Explain the *why* behind architecture and platform choices (the Explanatory output style is on).
- Prefer researched, current facts over memory; cite versions and dates.
- Offer choices as short options with a recommendation. Do not reopen settled decisions (spec §3, ADRs).

## Non-negotiables

- No secrets in git (`.env*` is ignored). Never commit tokens, kubeconfigs or private keys.
- No Bitnami images or charts, no `:latest` tags. Images are multi-arch (amd64 + arm64).
- Contracts are proto3, linted and breaking-checked with Buf.
- Every service implements the common contract (spec §5.3):
  - `/info`, `/healthz`, `/readyz`;
  - HTTP on 8080 and gRPC on 8081;
  - OpenTelemetry;
  - graceful shutdown.
- Every Mermaid block is followed by a paragraph starting `**Diagram description:**`.
- Every tool in the stack has a plain-language entry in `docs/architecture/tools-explained.md`: what it is, what it's used for in general, what it does here, and its milestone. Adding, replacing or removing a tool updates that page and `tech-stack.md` in the same change (`.claude/rules/stack-tools.md`).
- Tooling scripts are dependency-free Node `.mjs`, so they are portable on Windows. No bash-only scripts.
- Never use `--no-verify`, never force-push, never bypass `ci-ok`.
- Docs links:
  - pages inside `docs/` link to each other relatively;
  - anything outside `docs/` uses `https://github.com/Eyal-Avni/microservices-lab/blob/main/<path>`, because the site build fails on links that leave `docs/`.

## Workflow: the superpowers loop, every milestone

1. Run the `stack-check` skill to verify the versions of the milestone's components.
2. `superpowers:brainstorming` writes the milestone spec in `docs/superpowers/specs/`.
3. `superpowers:writing-plans` writes the plan in `docs/superpowers/plans/`; the learner picks how it's executed.
4. Work on branch `mN/<slug>`, test-first (`superpowers:test-driven-development`), with small commits.
5. `superpowers:requesting-code-review`, then `superpowers:verification-before-completion` (`task verify`).
6. Run the `update-docs` skill, update ROADMAP.md (status, DoD boxes, changelog) and sweep with the `docs-auditor` agent.
7. Open a PR, squash-merge once `ci-ok` is green, then tag `mN` and publish a GitHub Release (the `roadmap` skill).

## Commits and PRs

- Conventional Commits, with the service or area as scope: `catalog`, `order`, `bff`, `proto`, `platform`, `deploy`, `ci`, `docs`, `tooling` and so on. The body explains why.
- End every commit message with the `Co-Authored-By:` trailer Claude Code provides for the model you are running as. PR bodies end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- `main` takes changes only through PRs. On `main`, the docs guard blocks commits that change code without docs. Add `[skip-docs]` only when no docs change is genuinely needed.

## Commands

| Command | What it does |
|---|---|
| `task setup` | One-time: git hooks path, `autocrlf=false`, `pnpm install` |
| `task test` | All automated tests |
| `task docs:lint`, `task docs:build`, `task docs:dev` | Docs lint, site build, live site |
| `task verify` | The current milestone's proof |
| `node scripts/docs-drift.mjs --staged` | What the docs guard sees for the staged change |

## Repository map

- `docs/`: the learning docs (architecture, adr, fundamentals, labs, services, runbooks, reference, glossary).
  - `docs/_templates/`: page templates.
  - `docs/superpowers/`: specs and plans (design history).
- `website/`: the Docusaurus site that publishes `docs/`.
- `scripts/`: tooling (`docs-drift`; `doctor` arrives in M1 and `docs-check` in M2); shared code lives in `scripts/lib/`.
- `.claude/`: hooks, skills, agents and rules for this repo. `.githooks/`: git hooks.
- Later milestones add `proto/`, `services/`, `libs/`, `deploy/`, `infra/` and `tests/` (spec §9).

## Claude tooling in this repo

- Hooks: `docs-guard` (checks docs on `git commit`) and `session-context` (prints the current milestone).
- Skills: `roadmap` (manual), `adr`, `update-docs`, `stack-check`.
- Agent: `docs-auditor` (read-only).
- Rules in `.claude/rules/` load for matching paths: docs, GitHub Actions, stack tools.
- MCP: Context7 for current library docs (`.mcp.json`).

## Environment facts

- Windows 11, with PowerShell and Git Bash. Docker Desktop on WSL2 with a 20 GB VM. The repo path has no spaces on purpose.
- `jq` is not installed: parse JSON with Node or `gh --jq`. In PowerShell, use `curl.exe`.
- The kind cluster and the service toolchain arrive in M1, together with `task doctor`, which checks the toolchain.

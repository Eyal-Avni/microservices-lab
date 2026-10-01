---
paths:
  - ".github/**"
---

# GitHub Actions conventions

- Pin every action to a full commit SHA, with the version as a trailing comment: `uses: actions/checkout@<40-char sha> # v7.0.1`. Resolve a tag with `gh api repos/<owner>/<repo>/commits/<tag> --jq .sha`.
- Default to `permissions: contents: read` at workflow level, and grant more per job only where it's needed.
- Every required check flows into the single `ci-ok` job in `ci.yml` (`if: always()`, failing when any needed job failed or was cancelled). Add new jobs to its `needs`.
- Inside `ci.yml`, filter paths with `dorny/paths-filter` instead of workflow-level `paths:`. A skipped workflow never reports a status, and that would block merges.
- Pass untrusted values (branch names, PR titles) through `env:` instead of inlining `${{ }}` in `run:` scripts.
- Build container images natively per architecture (`ubuntu-24.04` and `ubuntu-24.04-arm`), never under QEMU.

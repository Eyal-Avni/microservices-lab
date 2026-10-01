---
name: stack-check
description: Use when starting a milestone, adding or upgrading a dependency, image, chart, action or tool in this repo, or when a version, license or maintenance status in the docs may be out of date
---

# Verifying the stack

## Overview

This stack moves fast. Releases come every few weeks, and projects get retired or relicensed (for example ingress-nginx, Bitnami, Kong OSS). Never trust a remembered version: check the source, and record what you checked and when.

## Steps

1. List the components the milestone touches: its ROADMAP row and spec §8.
2. For each one, find the latest stable release and its date:
   - GitHub releases: `gh api repos/<owner>/<repo>/releases/latest --jq '.tag_name + " " + .published_at'`
   - npm: `npm view <package> version time.modified`
   - NuGet: `dotnet package search <id> --exact-match`
   - Helm chart: `helm repo add <name> <url>`, then `helm search repo <name>/<chart>`
   - API or behaviour changes: the Context7 MCP (resolve the library id, then query its docs)
3. When a major version changed, or a project has had no release for six months, look for retirement, relicensing or maintenance-mode news in its release notes or blog.
4. Confirm the component supports the pinned Kubernetes version (1.36 at design time).
5. Update `docs/architecture/tech-stack.md`: the version, the license, and the verification date in the intro line. Give every new tool an entry in `docs/architecture/tools-explained.md` (What it is / Used for / In this project (Mn)), and update or remove the entries of tools that changed. A changed choice needs the `adr` skill.
6. Report a table: component | pinned → latest | released | breaking changes | action.

## Common mistakes

| Mistake | Fix |
|---|---|
| Pinning a GitHub Action by its tag | Pin by commit SHA: `gh api repos/<owner>/<repo>/commits/<tag> --jq .sha` |
| Piping into `jq` | `jq` isn't installed; use `gh --jq` or Node |
| Upgrading a major version inside an unrelated change | Do it in its own commit, with notes |
| Answering from memory | Every version in the report has a source |

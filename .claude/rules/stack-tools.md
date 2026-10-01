---
paths:
  - "package.json"
  - "**/package.json"
  - "pnpm-workspace.yaml"
  - "**/*.csproj"
  - "Directory.Packages.props"
  - "global.json"
  - "**/Dockerfile"
  - "deploy/**"
  - "infra/**"
  - ".github/workflows/**"
  - "Taskfile.yml"
  - "Tiltfile"
  - ".mcp.json"
  - "docs/architecture/tools-explained.md"
  - "docs/architecture/tech-stack.md"
---

# Stack tools: keep "Tools explained" current

Any change that adds, replaces or removes a tool updates the docs in the same change. A tool is a CLI, library, framework, service, operator, chart, GitHub Action, MCP server or standard.

1. Add, update or remove the tool's entry in `docs/architecture/tools-explained.md`, under the right section, in exactly this shape:

   ```markdown
   ### Tool name

   - **What it is:** one plain sentence.
   - **Used for:** what it is generally used for, in one sentence.
   - **In this project (Mn):** what it does here, in one or two sentences, with the milestone it arrives in.
   ```

2. If the system, its CI or its cluster runs the tool, update its row in `docs/architecture/tech-stack.md`: version, license and milestone. Workflow-only tools such as Git, nvm or Claude Code are covered by step 1 alone.

Write for a web developer who is new to the tool: short words, no unexplained jargon, no marketing.

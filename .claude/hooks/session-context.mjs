#!/usr/bin/env node
// SessionStart hook: prints a short summary of the current milestone. Claude Code adds hook stdout to
// Claude's context, so every session starts knowing where the project stands. Registered in .claude/settings.json.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sessionSummary } from '../../scripts/lib/roadmap.mjs';

const root = process.env.CLAUDE_PROJECT_DIR || join(import.meta.dirname, '..', '..');
try {
  console.log(sessionSummary(readFileSync(join(root, 'ROADMAP.md'), 'utf8')));
} catch (err) {
  console.log(`session-context: could not read ROADMAP.md (${err.message}).`);
}

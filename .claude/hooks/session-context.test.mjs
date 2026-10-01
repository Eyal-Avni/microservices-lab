// .claude/hooks/session-context.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const HOOK = join(import.meta.dirname, 'session-context.mjs');
const run = (projectDir) => spawnSync(process.execPath, [HOOK], {
  encoding: 'utf8', input: '{}', env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
});
const tempDir = (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'mslab-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
};

test('prints the current milestone from ROADMAP.md', (t) => {
  const dir = tempDir(t);
  writeFileSync(join(dir, 'ROADMAP.md'), [
    '# Roadmap', '', '**Current milestone:** M0 — Foundation · in-progress', '',
    '| M | Goal | Fundamentals | Status | Spec | Plan | Tag |', '|---|---|---|---|---|---|---|',
    '| M0 | Foundation | 13 | in-progress | — | — | — |', '',
  ].join('\n'));
  const r = run(dir);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /current milestone M0 Foundation \(in-progress\)/);
});

test('degrades gracefully when ROADMAP.md is missing', (t) => {
  const r = run(tempDir(t));
  assert.equal(r.status, 0);
  assert.match(r.stdout, /could not read ROADMAP\.md/);
});

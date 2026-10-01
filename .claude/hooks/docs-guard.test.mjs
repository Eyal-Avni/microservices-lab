// .claude/hooks/docs-guard.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { analyzeCommand, buildOutput } from './docs-guard.mjs';
import { makeTempRepo } from '../../scripts/lib/testing.mjs';

const HOOK = join(import.meta.dirname, 'docs-guard.mjs');
// GIT_CEILING_DIRECTORIES stops git from finding an unrelated repo above the temp folder.
const hook = (input) => spawnSync(process.execPath, [HOOK], {
  encoding: 'utf8',
  input: typeof input === 'string' ? input : JSON.stringify(input),
  env: { ...process.env, GIT_CEILING_DIRECTORIES: tmpdir() },
});
const bash = (command, cwd) => ({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command }, cwd });

test('recognises git commit in its common shapes', () => {
  for (const cmd of [
    'git commit -m "feat: x"',
    'git -C "C:/microservices-lab" commit -q -F -',
    "git -C 'C:\microservices-lab' commit -m 'x'",
    'git add -A && git commit -m x',
    'git -c user.name=x commit --amend --no-edit',
    'git commit -am "fix"',
  ]) assert.ok(analyzeCommand(cmd), cmd);
});

test('ignores commands that are not commits', () => {
  for (const cmd of ['git status', 'git log --grep commit', 'git commit-tree abc', 'npm test', 'echo commit', '', undefined]) {
    assert.equal(analyzeCommand(cmd), null, String(cmd));
  }
});

test('extracts -C, detects staging in the same command, and the skip marker', () => {
  assert.equal(analyzeCommand('git -C "C:/a b" commit -m x').repoDir, 'C:/a b');
  assert.equal(analyzeCommand('git commit -m x').repoDir, null);
  assert.equal(analyzeCommand('git add -A && git commit -m x').includeWorktree, true);
  assert.equal(analyzeCommand('git commit -am x').includeWorktree, true);
  assert.equal(analyzeCommand('git commit -m x').includeWorktree, false);
  assert.equal(analyzeCommand('git commit -m "x [skip-docs]"').skip, true);
});

test('buildOutput denies on main, reminds elsewhere, and stays silent when docs changed', () => {
  const deny = buildOutput({ files: ['scripts/a.mjs'], branch: 'main' });
  assert.equal(deny.hookSpecificOutput.hookEventName, 'PreToolUse');
  assert.equal(deny.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(deny.hookSpecificOutput.permissionDecisionReason, /dev-workflow\.md/);
  const remind = buildOutput({ files: ['scripts/a.mjs'], branch: 'm0/foundation' });
  assert.equal(remind.hookSpecificOutput.permissionDecision, undefined);
  assert.match(remind.hookSpecificOutput.additionalContext, /Docs reminder/);
  assert.equal(buildOutput({ files: ['scripts/a.mjs', 'docs/index.md'], branch: 'main' }), null);
});

test('end to end: denies a code-only commit on main', (t) => {
  const repo = makeTempRepo(t);
  repo.write('scripts/tool.mjs');
  repo.run('add', '.');
  const r = hook(bash('git commit -m "feat: tool"', repo.dir));
  assert.equal(r.status, 0);
  assert.equal(JSON.parse(r.stdout).hookSpecificOutput.permissionDecision, 'deny');
});

test('end to end: counts files that git add stages in the same command (PowerShell tool)', (t) => {
  const repo = makeTempRepo(t);
  repo.write('scripts/tool.mjs');
  const r = hook({ ...bash('git add -A && git commit -m "feat: tool"', repo.dir), tool_name: 'PowerShell' });
  assert.equal(JSON.parse(r.stdout).hookSpecificOutput.permissionDecision, 'deny');
});

test('end to end: reminds on a branch', (t) => {
  const repo = makeTempRepo(t);
  repo.run('switch', '-q', '-c', 'm0/foundation');
  repo.write('scripts/tool.mjs');
  repo.run('add', '.');
  const out = JSON.parse(hook(bash('git commit -m "wip"', repo.dir)).stdout);
  assert.match(out.hookSpecificOutput.additionalContext, /m0\/foundation/);
});

test('end to end: silent for non-commits, invalid input and non-repos (fails open)', (t) => {
  const repo = makeTempRepo(t);
  const plain = mkdtempSync(join(tmpdir(), 'mslab-'));
  t.after(() => rmSync(plain, { recursive: true, force: true }));
  for (const input of [bash('git status', repo.dir), 'not json', bash('git commit -m x', plain)]) {
    const r = hook(input);
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  }
});

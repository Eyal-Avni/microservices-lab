// scripts/lib/git.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { currentBranch, rangeFiles, stagedFiles, worktreeChanges } from './git.mjs';
import { makeTempRepo } from './testing.mjs';

test('currentBranch works before the first commit', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'mslab-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: dir });
  assert.equal(currentBranch(dir), 'main');
});

test('currentBranch returns HEAD when detached', (t) => {
  const repo = makeTempRepo(t);
  repo.run('switch', '-q', '--detach');
  assert.equal(currentBranch(repo.dir), 'HEAD');
});

test('stagedFiles lists only staged paths', (t) => {
  const repo = makeTempRepo(t);
  repo.write('scripts/a.mjs');
  repo.write('docs/b.md');
  repo.run('add', 'scripts/a.mjs');
  assert.deepEqual(stagedFiles(repo.dir), ['scripts/a.mjs']);
});

test('worktreeChanges includes renamed, untracked and space-containing paths', (t) => {
  const repo = makeTempRepo(t);
  repo.run('mv', 'README.md', 'INTRO.md');
  repo.write('notes.txt');
  repo.write('scripts/new file.mjs');
  assert.deepEqual(worktreeChanges(repo.dir).sort(), ['INTRO.md', 'notes.txt', 'scripts/new file.mjs']);
});

test('rangeFiles lists files changed on a branch', (t) => {
  const repo = makeTempRepo(t);
  repo.run('switch', '-q', '-c', 'feature');
  repo.write('scripts/x.mjs');
  repo.run('add', '.');
  repo.run('commit', '-q', '-m', 'x');
  assert.deepEqual(rangeFiles('main...HEAD', repo.dir), ['scripts/x.mjs']);
});

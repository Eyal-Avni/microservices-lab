// scripts/docs-drift.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { decide } from './docs-drift.mjs';
import { makeTempRepo } from './lib/testing.mjs';

const CLI = join(import.meta.dirname, 'docs-drift.mjs');
const cli = (cwd, ...args) => spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });

test('decide blocks code-only changes on main and suggests pages', () => {
  const r = decide({ files: ['scripts/x.mjs'], branch: 'main', mode: 'staged' });
  assert.equal(r.exitCode, 1);
  assert.match(r.text, /docs\/architecture\/dev-workflow\.md/);
});

test('decide only reminds on other branches', () => {
  const r = decide({ files: ['scripts/x.mjs'], branch: 'm1/skeleton', mode: 'staged' });
  assert.equal(r.exitCode, 0);
  assert.match(r.text, /reminder only on branch m1\/skeleton/);
});

test('decide always blocks in range mode', () => {
  assert.equal(decide({ files: ['services/catalog/a.cs'], mode: 'range' }).exitCode, 1);
});

test('decide is silent when docs changed too, and honours [skip-docs]', () => {
  assert.deepEqual(decide({ files: ['scripts/x.mjs', 'ROADMAP.md'], branch: 'main', mode: 'staged' }), { exitCode: 0, text: '' });
  const skipped = decide({ files: ['scripts/x.mjs'], branch: 'main', message: 'chore: bump [skip-docs]', mode: 'staged' });
  assert.equal(skipped.exitCode, 0);
  assert.match(skipped.text, /skipped/);
});

test('cli --staged blocks a code-only commit on main', (t) => {
  const repo = makeTempRepo(t);
  repo.write('scripts/tool.mjs');
  repo.run('add', '.');
  const r = cli(repo.dir, '--staged');
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stderr, /1 code file\(s\) changed/);
});

test('cli --staged only reminds on a branch', (t) => {
  const repo = makeTempRepo(t);
  repo.run('switch', '-q', '-c', 'm1/skeleton');
  repo.write('scripts/tool.mjs');
  repo.run('add', '.');
  const r = cli(repo.dir, '--staged');
  assert.equal(r.status, 0);
  assert.match(r.stderr, /reminder only/);
});

test('cli --commit-msg-file honours [skip-docs]', (t) => {
  const repo = makeTempRepo(t);
  repo.write('scripts/tool.mjs');
  repo.run('add', '.');
  const msg = join(repo.dir, '.git', 'COMMIT_EDITMSG');
  writeFileSync(msg, 'chore: tooling only [skip-docs]\n');
  assert.equal(cli(repo.dir, '--staged', '--commit-msg-file', msg).status, 0);
});

test('cli --include-worktree also sees files that are not staged yet', (t) => {
  const repo = makeTempRepo(t);
  repo.write('scripts/tool.mjs');
  assert.equal(cli(repo.dir, '--staged').status, 0);
  assert.equal(cli(repo.dir, '--staged', '--include-worktree').status, 1);
});

test('cli --range blocks a code-only branch diff', (t) => {
  const repo = makeTempRepo(t);
  repo.run('switch', '-q', '-c', 'feature');
  repo.write('services/catalog/a.cs');
  repo.run('add', '.');
  repo.run('commit', '-q', '-m', 'feat: code only');
  const r = cli(repo.dir, '--range', 'main...HEAD');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /docs\/services\/catalog\.md/);
});

test('cli without a mode prints usage and exits 2', (t) => {
  const repo = makeTempRepo(t);
  const r = cli(repo.dir);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Usage/);
});

test('cli outside a git repository exits 2 with a one-line message', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'mslab-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  // GIT_CEILING_DIRECTORIES stops git from finding an unrelated repo above the temp folder.
  const r = spawnSync(process.execPath, [CLI, '--staged'], {
    cwd: dir, encoding: 'utf8', env: { ...process.env, GIT_CEILING_DIRECTORIES: tmpdir() },
  });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /^docs-drift: not a git repository/);
  assert.equal(r.stderr.trim().split('\n').length, 1);
});

test('cli --range with an unknown ref exits 2 with git\'s reason on one line', (t) => {
  const repo = makeTempRepo(t);
  const r = cli(repo.dir, '--range', 'no-such-branch...HEAD');
  assert.equal(r.status, 2);
  assert.match(r.stderr, /^docs-drift: git failed: .*no-such-branch/);
  assert.equal(r.stderr.trim().split('\n').length, 1);
});

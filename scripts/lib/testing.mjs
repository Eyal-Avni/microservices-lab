// scripts/lib/testing.mjs
// Test-only helpers: throwaway git repositories in the OS temp folder, removed after each test.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export function makeTempRepo(t) {
  const dir = mkdtempSync(join(tmpdir(), 'mslab-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const run = (...args) =>
    execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const write = (path, content = 'x\n') => {
    const full = join(dir, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  };
  run('init', '-q', '-b', 'main');
  run('config', 'user.name', 'Test');
  run('config', 'user.email', 'test@example.com');
  run('config', 'commit.gpgsign', 'false');
  write('README.md', '# temp\n');
  run('add', '.');
  run('commit', '-q', '-m', 'init');
  return { dir, run, write };
}

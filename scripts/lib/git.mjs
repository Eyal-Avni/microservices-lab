// scripts/lib/git.mjs
// Minimal git wrappers for the tooling scripts. -z output avoids git's quoting of unusual paths.
import { execFileSync } from 'node:child_process';

export function git(args, cwd = process.cwd()) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

const nulList = (out) => out.split('\0').filter(Boolean);

export function isGitRepo(cwd = process.cwd()) {
  try {
    git(['rev-parse', '--git-dir'], cwd);
    return true;
  } catch {
    return false;
  }
}

export function currentBranch(cwd = process.cwd()) {
  try {
    return git(['symbolic-ref', '--quiet', '--short', 'HEAD'], cwd).trim();
  } catch {
    return 'HEAD'; // detached HEAD
  }
}

export function stagedFiles(cwd = process.cwd()) {
  return nulList(git(['diff', '--cached', '--name-only', '-z'], cwd));
}

export function worktreeChanges(cwd = process.cwd()) {
  const entries = git(['status', '--porcelain=v1', '-z', '--untracked-files=all'], cwd).split('\0');
  const files = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry) continue;
    files.push(entry.slice(3));
    if (entry[0] === 'R' || entry[0] === 'C') i++; // the next entry is the original path
  }
  return files;
}

export function rangeFiles(range, cwd = process.cwd()) {
  return nulList(git(['diff', '--name-only', '-z', range], cwd));
}

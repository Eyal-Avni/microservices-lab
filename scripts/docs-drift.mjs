#!/usr/bin/env node
// docs-drift: docs-freshness check for the git commit-msg hook (--staged) and CI (--range). Spec §12.6, layers 2-3.
// Exit codes: 0 = fine or reminder only, 1 = code changed without docs (blocking), 2 = usage error.
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { evaluate, suggestDocs, SKIP_MARKER } from './lib/docs-rules.mjs';
import { currentBranch, rangeFiles, stagedFiles, worktreeChanges } from './lib/git.mjs';

const USAGE = `Usage:
  node scripts/docs-drift.mjs --staged [--commit-msg-file <file> | --message <text>] [--include-worktree]
  node scripts/docs-drift.mjs --range <base>...<head> [--skip]`;

export function decide({ files, branch = '', message = '', mode }) {
  if (message.includes(SKIP_MARKER)) {
    return { exitCode: 0, text: `docs-drift: skipped (${SKIP_MARKER} in the commit message).` };
  }
  const { code, needsDocs } = evaluate(files);
  if (!needsDocs) return { exitCode: 0, text: '' };
  const blocking = mode === 'range' || branch === 'main';
  const summary = `${code.length} code file(s) changed but no docs/ or ROADMAP.md file did.`;
  const lines = [
    blocking ? `docs-drift: ${summary}` : `docs-drift (reminder only on branch ${branch}): ${summary}`,
    ...code.slice(0, 10).map((f) => `  code: ${f}`),
    ...(code.length > 10 ? [`  … and ${code.length - 10} more`] : []),
    'Probably affected docs:',
    ...suggestDocs(code).map((d) => `  - ${d}`),
    `Update those docs (the update-docs skill helps), or use ${SKIP_MARKER} in the commit message ` +
      '/ the skip-docs PR label when no docs change is needed.',
  ];
  return { exitCode: blocking ? 1 : 0, text: lines.join('\n') };
}

export function main(argv) {
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        staged: { type: 'boolean' },
        range: { type: 'string' },
        'commit-msg-file': { type: 'string' },
        message: { type: 'string' },
        'include-worktree': { type: 'boolean' },
        skip: { type: 'boolean' },
      },
    }));
  } catch (err) {
    console.error(`${err.message}\n${USAGE}`);
    return 2;
  }
  if (values.skip) {
    console.log('docs-drift: skipped by request.');
    return 0;
  }
  if (values.range) {
    const result = decide({ files: rangeFiles(values.range), mode: 'range' });
    if (result.text) console.error(result.text);
    return result.exitCode;
  }
  if (values.staged) {
    const message = values['commit-msg-file']
      ? readFileSync(values['commit-msg-file'], 'utf8')
      : (values.message ?? '');
    const files = new Set(stagedFiles());
    if (values['include-worktree']) for (const f of worktreeChanges()) files.add(f);
    const result = decide({ files: [...files], branch: currentBranch(), message, mode: 'staged' });
    if (result.text) console.error(result.text);
    return result.exitCode;
  }
  console.error(USAGE);
  return 2;
}

if (import.meta.main) process.exitCode = main(process.argv.slice(2));

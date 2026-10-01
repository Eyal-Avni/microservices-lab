#!/usr/bin/env node
// PreToolUse hook, docs-freshness layer 1 (spec §12.6). Claude Code runs it before every Bash/PowerShell
// tool call; it stays silent unless the command is a `git commit`. On main it denies a commit that changes
// code without docs; on other branches it allows the commit and adds a reminder for Claude.
// It fails open (no output, exit 0) on any internal error: CI (layer 3) is the real gate.
import { evaluate, suggestDocs, SKIP_MARKER } from '../../scripts/lib/docs-rules.mjs';
import { currentBranch, stagedFiles, worktreeChanges } from '../../scripts/lib/git.mjs';

const GIT_COMMIT_RE = /\bgit(?:\s+(?:-C\s+(?:"[^"]*"|'[^']*'|\S+)|-c\s+\S+|--[\w-]+(?:=\S+)?))*\s+commit(?![\w-])/;
const GIT_DIR_RE = /\bgit\s+-C\s+(?:"([^"]*)"|'([^']*)'|(\S+))/;
// `git add` earlier in the same command line, or `commit -a/-am/--all`: files are not staged yet when this
// hook runs, so the worktree changes count too.
const STAGES_FILES_RE = /\bgit\b[^;&|\n]*\sadd\s|\s(?:-a|-am|--all)(?=\s|$)/;

export function analyzeCommand(command) {
  if (typeof command !== 'string' || !GIT_COMMIT_RE.test(command)) return null;
  const dir = command.match(GIT_DIR_RE);
  return {
    repoDir: dir ? (dir[1] ?? dir[2] ?? dir[3]) : null,
    includeWorktree: STAGES_FILES_RE.test(command),
    skip: command.includes(SKIP_MARKER),
  };
}

export function buildOutput({ files, branch }) {
  const { code, needsDocs } = evaluate(files);
  if (!needsDocs) return null;
  const pages = suggestDocs(code).map((d) => `- ${d}`).join('\n');
  const summary = `This commit changes ${code.length} code file(s) but no docs/ or ROADMAP.md file.`;
  if (branch === 'main') {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          `${summary} Commits on main must keep the docs current.\nProbably affected docs:\n${pages}\n` +
          `Update them (the update-docs skill helps), or add ${SKIP_MARKER} to the commit message if no docs change is needed.`,
      },
    };
  }
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      additionalContext: `Docs reminder: ${summary} That is fine for an in-progress commit on ${branch}, but update these before the PR:\n${pages}`,
    },
  };
}

export function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const info = analyzeCommand(input?.tool_input?.command);
    if (!info || info.skip) return '';
    const cwd = info.repoDir ?? input.cwd ?? process.cwd();
    const files = new Set(stagedFiles(cwd));
    if (info.includeWorktree) for (const f of worktreeChanges(cwd)) files.add(f);
    const output = buildOutput({ files: [...files], branch: currentBranch(cwd) });
    return output ? JSON.stringify(output) : '';
  } catch {
    return ''; // fail open
  }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

if (import.meta.main) process.stdout.write(run(await readStdin()));

// scripts/lib/docs-rules.mjs
// Shared rules for the docs-freshness checks (spec §12.6): which paths are "code", which are "docs",
// and which docs pages a code change probably affects. Used by docs-drift.mjs (git hook + CI)
// and by the Claude Code docs-guard hook.

export const SKIP_MARKER = '[skip-docs]';

const CODE_PREFIXES = ['services/', 'libs/', 'proto/', 'deploy/', 'infra/', 'scripts/', '.github/', '.claude/'];
const CODE_FILES = new Set(['Taskfile.yml', 'Tiltfile']);
const DOC_FILES = new Set(['ROADMAP.md', 'README.md']);
const IGNORED = new Set(['.claude/settings.local.json']);

export function normalizePath(p) {
  return String(p).trim().replace(/\\/g, '/').replace(/^\.\//, '');
}

export function classify(path) {
  const p = normalizePath(path);
  if (p === '' || IGNORED.has(p)) return 'other';
  if (DOC_FILES.has(p)) return 'docs';
  if (p.startsWith('docs/')) return p.startsWith('docs/superpowers/') ? 'other' : 'docs';
  if (CODE_FILES.has(p) || CODE_PREFIXES.some((prefix) => p.startsWith(prefix))) return 'code';
  return 'other';
}

export function evaluate(paths) {
  const code = [];
  const docs = [];
  for (const raw of paths) {
    const p = normalizePath(raw);
    const kind = classify(p);
    if (kind === 'code') code.push(p);
    else if (kind === 'docs') docs.push(p);
  }
  return { code, docs, needsDocs: code.length > 0 && docs.length === 0 };
}

// First matching rule wins, so specific rules come before general ones.
const SUGGESTIONS = [
  [/^services\/([^/]+)\//, (m) => `docs/services/${m[1]}.md`],
  [/^libs\//, () => 'docs/architecture/overview.md'],
  [/^proto\//, () => 'docs/reference/ (regenerate the API reference)'],
  [/^deploy\/platform\/([^/]+)\//, (m) => `docs/fundamentals/ (concept page for ${m[1]})`],
  [/^deploy\//, () => 'docs/architecture/environments.md'],
  [/^infra\//, () => 'docs/architecture/environments.md and docs/runbooks/'],
  [/^(?:scripts\/|\.claude\/|\.github\/|Taskfile\.yml$|Tiltfile$)/, () => 'docs/architecture/dev-workflow.md'],
];

export function suggestDocs(codePaths) {
  const out = new Set();
  for (const raw of codePaths) {
    const p = normalizePath(raw);
    for (const [re, toPage] of SUGGESTIONS) {
      const m = p.match(re);
      if (m) {
        out.add(toPage(m));
        break;
      }
    }
  }
  return [...out];
}

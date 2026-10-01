// scripts/lib/roadmap.mjs
// Parser for ROADMAP.md, the "plan of plans". Its shape is a contract shared by the SessionStart hook,
// its contract test, and later docs-check (M2) and doctor (M1):
//   **Current milestone:** M<n> — <goal> · <status>          (the line after the title)
//   | M | Goal | Fundamentals | Status | Spec | Plan | Tag |  (one row per milestone)
//   ## M<n> — <goal>   followed by "- [ ]" / "- [x]" Definition-of-Done items
export const STATUSES = ['planned', 'in-progress', 'done', 'deferred'];

const CURRENT_RE = /^\*\*Current milestone:\*\* (M\d+) — (.+?) · ([a-z-]+)\s*$/m;
const ROW_RE = /^\|\s*(M\d+)\s*\|(.*)\|\s*$/;

export function parseRoadmap(text) {
  const errors = [];
  const match = text.match(CURRENT_RE);
  const current = match ? { id: match[1], name: match[2].trim(), status: match[3] } : null;
  if (!current) errors.push('Missing the "**Current milestone:** M<n> — <goal> · <status>" line.');
  else if (!STATUSES.includes(current.status)) errors.push(`Unknown status "${current.status}" in the current-milestone line.`);

  const milestones = [];
  for (const line of text.split(/\r?\n/)) {
    const row = line.match(ROW_RE);
    if (!row) continue;
    const cells = row[2].split('|').map((c) => c.trim());
    if (cells.length !== 6) {
      errors.push(`Row ${row[1]} has ${cells.length + 1} columns; expected 7.`);
      continue;
    }
    const [goal, fundamentals, status, spec, plan, tag] = cells;
    if (!STATUSES.includes(status)) errors.push(`Row ${row[1]} has unknown status "${status}".`);
    milestones.push({ id: row[1], goal, fundamentals, status, spec, plan, tag });
  }

  const inProgress = milestones.filter((m) => m.status === 'in-progress').map((m) => m.id);
  if (inProgress.length > 1) errors.push(`More than one milestone is in-progress: ${inProgress.join(', ')}.`);
  if (current) {
    const row = milestones.find((m) => m.id === current.id);
    if (!row) errors.push(`The current milestone ${current.id} has no table row.`);
    else if (row.status !== current.status) {
      errors.push(`The current-milestone line says "${current.status}" but row ${current.id} says "${row.status}".`);
    }
  }
  return { current, milestones, errors };
}

export function openDodItems(text, id) {
  const lines = text.split(/\r?\n/);
  const heading = new RegExp(`^## ${id}(?!\d)`);
  const start = lines.findIndex((l) => heading.test(l));
  if (start === -1) return [];
  const items = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) break;
    const m = line.match(/^\s*- \[ \] (.+)$/);
    if (m) items.push(m[1].trim());
  }
  return items;
}

export function linkTarget(cell) {
  const m = String(cell ?? '').match(/\]\(([^)]+)\)/);
  return m ? m[1] : null;
}

export function sessionSummary(text, maxChars = 1000) {
  const { current, milestones, errors } = parseRoadmap(text);
  if (!current) return 'ROADMAP.md has no "**Current milestone:**" line. Read ROADMAP.md before starting work.';
  const row = milestones.find((m) => m.id === current.id);
  const parts = [`Microservices Lab: current milestone ${current.id} ${current.name} (${current.status}).`];
  const spec = row && linkTarget(row.spec);
  const plan = row && linkTarget(row.plan);
  if (spec) parts.push(`Spec: ${spec}`);
  if (plan) parts.push(`Plan: ${plan}`);
  const open = openDodItems(text, current.id);
  if (open.length) parts.push(`Open DoD items (${open.length}): ${open.slice(0, 6).join('; ')}${open.length > 6 ? '; …' : ''}`);
  const next = milestones.find((m) => m.status === 'planned' && m.id !== current.id);
  if (next) parts.push(`Next planned: ${next.id} ${next.goal}.`);
  if (errors.length) parts.push(`ROADMAP.md format problems: ${errors.join(' ')}`);
  parts.push('Follow the superpowers loop in CLAUDE.md and keep docs and ROADMAP.md current.');
  const summary = parts.join('\n');
  return summary.length > maxChars ? `${summary.slice(0, maxChars - 1)}…` : summary;
}

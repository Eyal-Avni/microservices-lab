// scripts/lib/roadmap.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openDodItems, parseRoadmap, sessionSummary } from './roadmap.mjs';

const FIXTURE = [
  '# Roadmap',
  '',
  '**Current milestone:** M1 — Walking skeleton · in-progress',
  '',
  '| M | Goal | Fundamentals | Status | Spec | Plan | Tag |',
  '|---|---|---|---|---|---|---|',
  '| M0 | Foundation | 13 | done | [design](docs/superpowers/specs/s.md) | [m0](docs/superpowers/plans/p0.md) | m0 |',
  '| M1 | Walking skeleton | 1, 2 | in-progress | [m1](docs/superpowers/specs/m1.md) | [m1](docs/superpowers/plans/p1.md) | — |',
  '| M10 | Delivery | 30 | planned | — | — | — |',
  '',
  '## M1 — Walking skeleton',
  '',
  'Definition of Done:',
  '',
  '- [x] Contracts',
  '- [ ] Catalog service',
  '- [ ] Gateway route',
  '',
  '## M10 — Delivery',
  '',
  '- [ ] Should not leak into M1',
  '',
].join('\n');

test('parses the current milestone and the table', () => {
  const r = parseRoadmap(FIXTURE);
  assert.deepEqual(r.current, { id: 'M1', name: 'Walking skeleton', status: 'in-progress' });
  assert.deepEqual(r.milestones.map((m) => `${m.id}:${m.status}`), ['M0:done', 'M1:in-progress', 'M10:planned']);
  assert.equal(r.milestones[0].tag, 'm0');
  assert.deepEqual(r.errors, []);
});

test('CRLF input parses exactly like LF input', () => {
  assert.deepEqual(parseRoadmap(FIXTURE.replace(/\n/g, '\r\n')), parseRoadmap(FIXTURE));
});

test('reports a missing current-milestone line', () => {
  const r = parseRoadmap(FIXTURE.replace(/^\*\*Current milestone.*$/m, ''));
  assert.equal(r.current, null);
  assert.match(r.errors.join(' '), /Missing the "\*\*Current milestone:\*\*/);
});

test('reports unknown statuses, two in-progress rows and a mismatched current line', () => {
  assert.match(parseRoadmap(FIXTURE.replace('| planned |', '| someday |')).errors.join(' '), /unknown status "someday"/);
  assert.match(parseRoadmap(FIXTURE.replace('| planned |', '| in-progress |')).errors.join(' '), /More than one milestone is in-progress: M1, M10/);
  assert.match(parseRoadmap(FIXTURE.replace('· in-progress', '· planned')).errors.join(' '), /says "planned" but row M1 says "in-progress"/);
});

test('openDodItems returns unchecked items of one section only (M1 is not M10)', () => {
  assert.deepEqual(openDodItems(FIXTURE, 'M1'), ['Catalog service', 'Gateway route']);
  assert.deepEqual(openDodItems(FIXTURE, 'M10'), ['Should not leak into M1']);
  assert.deepEqual(openDodItems(FIXTURE, 'M2'), []);
});

test('sessionSummary names the milestone, links, open items and the next milestone', () => {
  const s = sessionSummary(FIXTURE);
  assert.match(s, /current milestone M1 Walking skeleton \(in-progress\)/);
  assert.match(s, /Plan: docs\/superpowers\/plans\/p1\.md/);
  assert.match(s, /Open DoD items \(2\): Catalog service; Gateway route/);
  assert.match(s, /Next planned: M10 Delivery\./);
  assert.ok(s.length <= 1000);
  assert.equal(sessionSummary(FIXTURE, 40).length, 40);
});

test('contract: the real ROADMAP.md parses cleanly and lists M0..M16', () => {
  const r = parseRoadmap(readFileSync(join(import.meta.dirname, '..', '..', 'ROADMAP.md'), 'utf8'));
  assert.deepEqual(r.errors, []);
  assert.ok(r.current);
  assert.deepEqual(r.milestones.map((m) => m.id), Array.from({ length: 17 }, (_, n) => `M${n}`));
});

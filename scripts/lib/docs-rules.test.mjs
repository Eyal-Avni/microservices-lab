// scripts/lib/docs-rules.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, evaluate, normalizePath, suggestDocs, SKIP_MARKER } from './docs-rules.mjs';

test('code paths are classified as code', () => {
  for (const p of [
    'services/catalog/src/Program.cs', 'libs/node/platform/index.ts', 'proto/buf.yaml',
    'deploy/kind/cluster.yaml', 'infra/tofu/local/main.tf', 'scripts/docs-drift.mjs',
    '.github/workflows/ci.yml', '.claude/settings.json', '.claude/hooks/docs-guard.mjs',
    'Taskfile.yml', 'Tiltfile',
  ]) assert.equal(classify(p), 'code', p);
});

test('docs paths are classified as docs', () => {
  for (const p of ['docs/architecture/overview.md', 'docs/adr/0001-x.md', 'docs/_templates/lab.md',
    'docs/fundamentals/_category_.json', 'ROADMAP.md', 'README.md']) assert.equal(classify(p), 'docs', p);
});

test('specs and plans are design history, not docs', () => {
  assert.equal(classify('docs/superpowers/specs/2026-09-30-x.md'), 'other');
  assert.equal(classify('docs/superpowers/plans/2026-10-01-y.md'), 'other');
});

test('everything else is other', () => {
  for (const p of ['.gitignore', 'package.json', 'pnpm-lock.yaml', 'website/docusaurus.config.js',
    '.claude/settings.local.json', 'CLAUDE.md', '']) assert.equal(classify(p), 'other', p);
});

test('windows separators and ./ prefixes are normalized', () => {
  assert.equal(normalizePath('.\\services\\catalog\\a.cs'), 'services/catalog/a.cs');
  assert.equal(classify('services\\catalog\\a.cs'), 'code');
  assert.equal(classify('./docs/index.md'), 'docs');
});

test('evaluate: code without docs needs docs', () => {
  const r = evaluate(['scripts/x.mjs', 'package.json']);
  assert.deepEqual(r.code, ['scripts/x.mjs']);
  assert.deepEqual(r.docs, []);
  assert.equal(r.needsDocs, true);
});

test('evaluate: code with docs, docs only, or other only never needs docs', () => {
  assert.equal(evaluate(['scripts/x.mjs', 'docs/architecture/dev-workflow.md']).needsDocs, false);
  assert.equal(evaluate(['docs/index.md']).needsDocs, false);
  assert.equal(evaluate(['package.json', 'docs/superpowers/plans/p.md']).needsDocs, false);
  assert.equal(evaluate([]).needsDocs, false);
});

test('suggestDocs maps code areas to pages and de-duplicates', () => {
  assert.deepEqual(suggestDocs(['services/catalog/a.cs', 'services/catalog/b.cs']), ['docs/services/catalog.md']);
  assert.deepEqual(suggestDocs(['deploy/platform/envoy-gateway/values.yaml']),
    ['docs/fundamentals/ (concept page for envoy-gateway)']);
  assert.deepEqual(suggestDocs(['deploy/kind/cluster.yaml']), ['docs/architecture/environments.md']);
  assert.deepEqual(suggestDocs(['scripts/a.mjs', '.claude/hooks/b.mjs', 'Taskfile.yml', '.github/workflows/ci.yml']),
    ['docs/architecture/dev-workflow.md']);
  assert.deepEqual(suggestDocs(['proto/commerce/catalog/v1/catalog.proto']),
    ['docs/reference/ (regenerate the API reference)']);
});

test('skip marker is [skip-docs]', () => assert.equal(SKIP_MARKER, '[skip-docs]'));

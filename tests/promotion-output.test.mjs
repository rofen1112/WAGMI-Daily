import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { writePromotion } from '../scripts/promotion.mjs';

test('promotion refreshes the dist/client files served by the public tunnel', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'wagmi-promotion-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(join(root, 'data/main'), { recursive: true });
  await mkdir(join(root, 'reports'), { recursive: true });
  await mkdir(join(root, 'public/reports'), { recursive: true });
  await writeFile(join(root, 'data/main/index.json'), '{}\n');
  await writeFile(join(root, 'reports/daily.md'), '# Daily\n');
  const privateHistory = '# 原文10月28日\n[Memene 核验](https://memene.cn/daily/history)：已独立核实。\n';
  await writeFile(join(root, 'reports/history.md'), privateHistory);
  await writeFile(join(root, 'public/reports/history.md'), privateHistory);

  const snapshot = {
    schemaVersion: '1.0.0',
    generatedAt: '2026-07-19T07:30:00+08:00',
    asOf: { ai: '2026-07-19', github: '2026-07-19', skills: '2026-07-19' },
    projects: [],
    aiEvents: [{ id: 'history-event', date: '2026-07-18',
      sources: [{ label: '官方', url: 'https://example.org/release' }],
      readingSources: [{ label: 'Memene', url: 'https://memene.cn/daily/history' }],
    }],
    skills: [],
    weeklySummaries: [],
    reports: [{ path: '/reports/daily.md' }],
  };

  await writePromotion({
    root,
    previous: { generatedAt: '2026-07-18T07:30:00+08:00', asOf: {} },
    snapshot,
    skillsCatalog: { skills: [] },
    errors: [],
    warnings: [],
  });

  const publicSnapshot = JSON.parse(await readFile(join(root, 'dist/client/data/main/index.json'), 'utf8'));
  const publicCatalog = JSON.parse(await readFile(join(root, 'dist/client/data/main/skills-catalog.json'), 'utf8'));
  const publicReport = await readFile(join(root, 'dist/client/reports/daily.md'), 'utf8');

  assert.equal(publicSnapshot.asOf.ai, '2026-07-19');
  assert.equal(publicSnapshot.aiEvents.length, 1);
  assert.deepEqual(publicSnapshot.aiEvents[0].readingSources, []);
  assert.equal(snapshot.aiEvents[0].readingSources.length, 1);
  assert.deepEqual(publicCatalog, { skills: [] });
  assert.equal(publicReport, '# Daily\n');
  const publicHistory = await readFile(join(root, 'dist/client/reports/history.md'), 'utf8');
  assert.match(publicHistory, /原文10月28日/);
  assert.match(publicHistory, /内部发现源 核验：已独立核实/);
  assert.doesNotMatch(publicHistory, /memene/i);
  assert.equal(await readFile(join(root, 'reports/history.md'), 'utf8'), privateHistory);
});

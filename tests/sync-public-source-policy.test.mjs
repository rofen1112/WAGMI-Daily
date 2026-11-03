import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';

test('data sync sanitizes indexed and unindexed public history, preserving internal originals', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'wagmi-public-sources-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const path of ['data/main', 'reports', 'public/reports']) await mkdir(join(root, path), { recursive: true });
  const snapshot = { aiEvents: [{ id: 'fact', date: '2026-10-28',
    sources: [{ label: '官方', url: 'https://example.org/release' }],
    readingSources: [{ label: 'Memene', url: 'https://memene.cn/daily/today' }],
  }], reports: [{ path: '/reports/daily.md' }, { path: '/reports/attachment.bin' }] };
  const original = '# 原文10月28日\n[Memene 对照](https://memene.cn/daily/today)：已核实并保留。\n';
  await writeFile(join(root, 'data/main/index.json'), JSON.stringify(snapshot));
  await writeFile(join(root, 'reports/daily.md'), original);
  const binary = Buffer.from([0xff, 0xfe, 0x01, 0x00, 0xa0]);
  await writeFile(join(root, 'reports/attachment.bin'), binary);
  await writeFile(join(root, 'reports/unindexed-history.md'), original);
  await writeFile(join(root, 'public/reports/unindexed-history.md'), '旧公开副本 https://memene.cn/old');
  await writeFile(join(root, 'public/reports/public-only.html'), '<a href="https://memenews.cn/old">Memene</a>，原文10月27日');
  await writeFile(join(root, 'data/main/skills-catalog.json'), JSON.stringify({ sources: [
    { label: '内部', url: 'https://memene.cn/catalog' }, { label: '官方', url: 'https://example.org/catalog' },
  ] }));
  await promisify(execFile)(process.execPath, [fileURLToPath(new URL('../scripts/sync-main-data.mjs', import.meta.url))], { cwd: root });
  assert.deepEqual(JSON.parse(await readFile(join(root, 'data/main/index.json'), 'utf8')), snapshot);
  assert.equal(await readFile(join(root, 'reports/unindexed-history.md'), 'utf8'), original);
  assert.deepEqual(await readFile(join(root, 'public/reports/attachment.bin')), binary);
  const publicData = JSON.parse(await readFile(join(root, 'public/data/main/index.json'), 'utf8'));
  assert.equal(publicData.aiEvents.length, 1);
  assert.deepEqual(publicData.aiEvents[0].sources, snapshot.aiEvents[0].sources);
  assert.deepEqual(publicData.aiEvents[0].readingSources, []);
  for (const name of ['daily.md', 'unindexed-history.md', 'public-only.html']) {
    const report = await readFile(join(root, 'public/reports', name), 'utf8');
    assert.doesNotMatch(report, /memene(?:ws)?/i);
    assert.match(report, /原文10月2[78]日/);
  }
  assert.deepEqual(JSON.parse(await readFile(join(root, 'public/data/main/skills-catalog.json'), 'utf8')),
    { sources: [{ label: '官方', url: 'https://example.org/catalog' }] });
});

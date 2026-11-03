import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, readdir, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { buildSnapshot, normalizeMemeneItem, runMemeneDiscovery, selectHistoryWindow } from '../scripts/discover-memene-daily.mjs';

const records = [
  { id: '18', date: '2026-07-18', timestamp: 18, title: 'Today', totalCount: 3, relatedCount: 2, topTopicList: [] },
  { id: '17', date: '2026-07-17', timestamp: 17, title: 'Yesterday', totalCount: 2, relatedCount: 1, topTopicList: [] },
  { id: '11', date: '2026-07-11', timestamp: 11, title: 'Outside window', totalCount: 1, relatedCount: 1, topTopicList: [] },
];

test('Memene history is selected by embedded Shanghai date rather than numeric id', () => {
  const selected = selectHistoryWindow(records, '2026-07-18', 7);
  assert.equal(selected.status, 'current');
  assert.equal(selected.target.id, '18');
  assert.deepEqual(selected.history.map((item) => item.date), ['2026-07-18', '2026-07-17']);
  assert.ok(selected.missingDates.includes('2026-07-16'));
});

test('Memene stale content is retained as fallback and never relabeled as today', () => {
  const selected = selectHistoryWindow(records.slice(1), '2026-07-18', 7);
  assert.equal(selected.status, 'stale');
  assert.equal(selected.target, null);
  assert.equal(selected.latest.date, '2026-07-17');
});

test('Memene items preserve references and derive official social post links', () => {
  const item = normalizeMemeneItem({
    id: 1,
    title: 'Example',
    briefContent: 'Summary',
    referenceLinks: ['https://example.com/original'],
    associatedContent: [{ sourceId: 'twitter_12345', authorId: 'OpenAI', authorName: 'OpenAI', recordPublishedTime: 1 }],
  });
  assert.deepEqual(item.sources.map((source) => source.url), [
    'https://example.com/original',
    'https://x.com/OpenAI/status/12345',
  ]);
  assert.equal(item.verificationStatus, 'source_available');
});

test('Memene snapshots reject detail payloads from the wrong date', () => {
  assert.throws(() => buildSnapshot({
    targetDate: '2026-07-18',
    days: 7,
    planId: 'plan',
    historyData: { historyRecords: records },
    detailData: { id: '18', date: '2026-07-17', content: [] },
  }), /does not match target/);
});

const jsonResponse = data => new Response(JSON.stringify({ statusCode: 200, data }), { status: 200 });
const successfulFetch = async url => String(url).includes('/history')
  ? jsonResponse({ historyRecords: records })
  : jsonResponse({ id: '18', date: '2026-07-18', content: [{ id: 1, title: '已发布消息', referenceLinks: [] }] });

async function withWorkspace(run) {
  const root = await mkdtemp(join(tmpdir(), 'wagmi-memene-observation-'));
  try { await run(root); }
  finally { assert.ok(resolve(root).startsWith(resolve(tmpdir()) + sep)); await rm(root, { recursive: true, force: true }); }
}

test('a failed optional check records its actual day and preserves the earlier successful observation', async () => {
  await withWorkspace(async root => {
    const success = await runMemeneDiscovery({ root, targetDate: '2026-07-18', generatedAt: '2026-07-18T00:00:00Z', fetchImpl: successfulFetch });
    const failure = await runMemeneDiscovery({ root, targetDate: '2026-07-18', generatedAt: '2026-07-18T01:00:00Z',
      fetchImpl: async () => { throw Error('upstream connection failed'); } });
    assert.equal(success.run.status, 'success');
    assert.equal(failure.asOf, '2026-07-18');
    assert.equal(failure.generatedAt, '2026-07-18T01:00:00Z');
    assert.equal(failure.run.status, 'failed');
    assert.equal(failure.run.stage, 'history');
    assert.match(failure.error, /upstream connection failed/);
    assert.equal(failure.target, null);
    assert.equal(failure.window.status, 'unavailable');
    const checkpoint = JSON.parse(await readFile(join(root, 'data/dev/memene-daily-latest.json'), 'utf8'));
    assert.deepEqual(checkpoint, failure);
    const folder = join(root, 'data/dev/source-archives/memene-observations/2026-07-18');
    const observations = await Promise.all((await readdir(folder)).map(async file => JSON.parse(await readFile(join(folder, file), 'utf8'))));
    assert.equal(observations.length, 2);
    assert.ok(observations.some(snapshot => snapshot.run.status === 'success' && snapshot.target.id === '18'));
    assert.ok(observations.some(snapshot => snapshot.run.status === 'failed' && snapshot.error.includes('connection failed')));
  });
});

test('detail date mismatch is an unavailable source observation, never a successful empty candidate batch', async () => {
  const snapshot = await runMemeneDiscovery({ targetDate: '2026-07-18', generatedAt: '2026-07-18T01:00:00Z', dryRun: true,
    fetchImpl: async url => String(url).includes('/history') ? jsonResponse({ historyRecords: records })
      : jsonResponse({ id: '18', date: '2026-07-17', content: [] }) });
  assert.equal(snapshot.run.status, 'failed');
  assert.equal(snapshot.run.stage, 'validation');
  assert.equal(snapshot.target, null);
  assert.match(snapshot.error, /does not match target/);
  assert.equal(snapshot.history[0].date, '2026-07-18');
  assert.equal(snapshot.fallback.date, '2026-07-17');
});

test('a malformed history response is retained as a source error', async () => {
  const snapshot = await runMemeneDiscovery({ targetDate: '2026-07-18', generatedAt: '2026-07-18T01:00:00Z', dryRun: true,
    fetchImpl: async () => jsonResponse({ historyRecords: {} }) });
  assert.equal(snapshot.run.status, 'failed');
  assert.match(snapshot.error, /historyRecords must be an array/);
});

test('malformed detail references are a failed source observation rather than a successful empty record', async () => {
  const snapshot = await runMemeneDiscovery({ targetDate: '2026-07-18', generatedAt: '2026-07-18T01:00:00Z', dryRun: true,
    fetchImpl: async url => String(url).includes('/history') ? jsonResponse({ historyRecords: records })
      : jsonResponse({ id: '18', date: '2026-07-18', content: [{ id: 1, title: 'Bad data', referenceLinks: {} }] }) });
  assert.equal(snapshot.run.status, 'failed');
  assert.equal(snapshot.target, null);
  assert.match(snapshot.error, /invalid referenceLinks/);
});

test('historical replay, including failure, cannot replace the current-day checkpoint', async () => {
  await withWorkspace(async root => {
    const checkpointPath = join(root, 'data/dev/memene-daily-latest.json');
    const current = { asOf: '2026-07-19', generatedAt: '2026-07-19T00:00:00Z', run: { status: 'success' } };
    await mkdir(join(root, 'data/dev'), { recursive: true });
    await writeFile(checkpointPath, JSON.stringify(current));
    await runMemeneDiscovery({ root, targetDate: '2026-07-18', generatedAt: '2026-07-19T01:00:00Z', fetchImpl: successfulFetch });
    assert.deepEqual(JSON.parse(await readFile(checkpointPath, 'utf8')), current);
    await runMemeneDiscovery({ root, targetDate: '2026-07-18', generatedAt: '2026-07-19T02:00:00Z',
      fetchImpl: async () => { throw Error('history replay failed'); } });
    assert.deepEqual(JSON.parse(await readFile(checkpointPath, 'utf8')), current);
    const history = JSON.parse(await readFile(join(root, 'data/dev/source-archives/memene-2026-07-18.json'), 'utf8'));
    assert.equal(history.asOf, '2026-07-18');
    assert.equal(history.run.status, 'failed');
  });
});

test('dry-run failures do not alter observation checkpoints or create archives', async () => {
  await withWorkspace(async root => {
    const snapshot = await runMemeneDiscovery({ root, targetDate: '2026-07-18', generatedAt: '2026-07-18T01:00:00Z', dryRun: true,
      fetchImpl: async () => { throw Error('offline'); } });
    assert.equal(snapshot.run.status, 'failed');
    assert.deepEqual(await readdir(root), []);
  });
});

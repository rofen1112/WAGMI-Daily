import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { buildAiSourceCoverage, aiPublicationBlockers } from '../scripts/ai-source-policy.mjs';
import { inspectOptionalMemene, reconcileReviewedEvents, runAiReconciliation } from '../scripts/reconcile-ai-collection.mjs';
import { buildDailyGate } from '../scripts/daily-main-publish.mjs';
import { buildFreshness } from '../scripts/send-dingtalk-digest.mjs';
import { mergeDevSnapshot } from '../scripts/merge-dev-data.mjs';
const date = '2026-10-10', time = '2026-10-10T01:00:00Z';
const event = { id: 'official-release', date: '2026-10-09', title: '官方发布新版本', summary: '修复交互问题',
  whyItMatters: '提高稳定性', action: '核验新版本', priority: 'B', sourceType: 'official_github_release',
  verification: 'verified', sourceReportId: 'ai-' + date, boards: ['AI Coding'], sources: [{ label: '官方发布', url: 'https://github.com/openai/codex/releases/tag/v1' }] };
const review = { url: event.sources[0].url, checkedAt: time, success: true, verification: 'verified',
  sourceClass: 'official', eventIds: [event.id], method: 'official-content-review' };
const success = { asOf: date, run: { status: 'success' } };
function completed() {
  const accepted = reconcileReviewedEvents({ date, reportId: 'ai-' + date, events: [event], evidence: [review] }).accepted;
  return { ...success, report: { id: 'ai-' + date, date }, aiEvents: accepted, sourceStatus: [{ id: 'memene', optional: true, status: 'stale' }],
    sourceCoverage: buildAiSourceCoverage({ date, events: accepted, evidence: [review] }) };
}
test('a weekend Memene gap does not block a reviewed batch at either publish or send gate', async () => {
  const state = await inspectOptionalMemene({ asOf: date, target: null, fallback: { date: '2026-10-09' } }, date,
    async () => { throw Error('Must not request a nonexistent ID'); });
  assert.equal(state.status, 'stale'); assert.equal(state.expectedNoUpdate, true);
  const aiLatest = completed();
  assert.equal(buildDailyGate({ date, aiLatest, githubLatest: success, skillsLatest: success,
    papersLatest: success, papersCatalog: { asOf: date } }).ready, true);
  assert.equal(buildFreshness({ date, aiLatest, githubLatest: success, skillsLatest: success }).ready, true);
});
test('stale, unbound or aggregator-only evidence cannot make a successful original-source batch', () => {
  for (const bad of [
    { ...review, checkedAt: '2026-10-09T01:00:00Z' }, { ...review, eventIds: ['another-event'] },
    { ...review, verification: 'pending' }, { ...review, url: 'https://memene.cn/daily/123' },
  ]) {
    const result = reconcileReviewedEvents({ date, reportId: 'ai-' + date, events: [event], evidence: [bad] });
    assert.equal(result.accepted.length, 0); assert.equal(result.pending.length, 1);
    assert.equal(buildAiSourceCoverage({ date, events: [event], evidence: [bad] }).ready, false);
  }
  const broken = completed(); broken.aiEvents[0].verification = 'pending';
  assert.ok(aiPublicationBlockers(broken, date).length);
  assert.equal(buildFreshness({ date, aiLatest: broken, githubLatest: success, skillsLatest: success }).ready, false);
});
test('a verified quiet day needs an explicit current check, not an empty failed response', () => {
  const input = { date, events: [], evidence: [{ ...review, discoveryChecked: true }] };
  assert.equal(buildAiSourceCoverage(input).ready, false);
  assert.equal(buildAiSourceCoverage({ ...input, noNewEvents: true }).ready, true);
  assert.equal(buildAiSourceCoverage({ ...input, evidence: [], noNewEvents: true }).ready, false);
});
test('a Chinese reading link cannot replace the event factual source review', () => {
  const chineseUrl = 'https://www.qbitai.com/2026/10/review.html';
  const withReading = { ...event, readingSources: [{ label: '量子位中文解读', url: chineseUrl, language: 'zh', role: 'coverage' }] };
  const readingReview = { ...review, url: chineseUrl, sourceClass: 'trusted_media' };
  assert.equal(buildAiSourceCoverage({ date, events: [withReading], evidence: [readingReview] }).ready, false);
  const result = reconcileReviewedEvents({ date, reportId: 'ai-' + date, events: [withReading], evidence: [review] });
  assert.equal(result.accepted.length, 1);
  assert.deepEqual(result.accepted[0].readingSources, withReading.readingSources);
});
test('optional Memene page failure keeps its source warning without stopping other sources', async () => {
  const memene = { asOf: date, window: { status: 'current' }, run: { status: 'success' },
    target: { date, id: '123', candidates: [{}] } };
  const result = await inspectOptionalMemene(memene, date, async () => { throw Error('Source offline'); });
  assert.equal(result.status, 'warning'); assert.equal(result.optional, true);
});
test('reconciliation creates the daily report from reviewed events, excludes pending overrides and is idempotent', async () => {
  const root = await mkdtemp(join(tmpdir(), 'wagmi-multisource-'));
  const json = async (file, value) => writeFile(join(root, file), JSON.stringify(value));
  try {
    await mkdir(join(root, 'data/dev'), { recursive: true });
    const pending = { ...event, id: 'unreviewed', title: '尚未核验消息', verification: 'pending' };
    await json('data/dev/ai-events-latest.json', { ...success, generatedAt: time, schemaVersion: '1.0.0',
      aiEvents: [event, pending], candidates: [],
      sourceStatus: [{ id: 'official-blog', optional: true, status: 'unavailable', checkedAt: time, message: 'HTTP 403' },
        { id: 'memene-daily', optional: true, status: 'warning', message: 'prior request failed' }],
      report: { id: 'ai-' + date, date, path: '/reports/ai-events-' + date + '.md' } });
    await json('data/dev/index.json', { aiEvents: [pending], reports: [] });
    await json('data/dev/ai-editorial-repairs-' + date + '.json', { verifiedSources: [review], events: [{ ...event,
      readingSources: [{ label: '量子位中文解读', url: 'https://www.qbitai.com/review', language: 'zh', role: 'coverage' }] }] });
    const run = () => runAiReconciliation({ root, date, fetchImpl: async () => { throw Error('No Memene request expected'); } });
    const first = await run();
    assert.equal(first.currentEvents, 1); assert.equal(first.pending, 1);
    const latest = JSON.parse(await readFile(join(root, 'data/dev/ai-events-latest.json'), 'utf8'));
    assert.equal(latest.run.status, 'success'); assert.equal(latest.aiEvents[0].date, '2026-10-09');
    assert.equal(latest.sourceStatus.find(source => source.id === 'official-blog').status, 'unavailable');
    assert.equal(latest.sourceStatus.filter(source => source.id === 'memene-daily').length, 1);
    assert.equal(latest.sourceStatus.find(source => source.id === 'memene-daily').status, 'stale');
    assert.ok(latest.run.sourceWarnings.includes('official-blog：HTTP 403'));
    const report = await readFile(join(root, 'reports/ai-events-' + date + '.md'), 'utf8');
    assert.match(report, /官方发布新版本/); assert.match(report, /可选发现源无当日记录/);
    assert.match(report, /中文阅读：\[量子位中文解读\]/);
    const override = JSON.parse(await readFile(join(root, 'data/dev/index.json'), 'utf8'));
    assert.deepEqual(override.aiEvents.map(row => row.id), [event.id]);
    const second = await run(); assert.equal(second.currentEvents, 1); assert.equal(second.pending, 1);
    assert.ok(second.sourceWarnings.includes('official-blog：HTTP 403'));
    assert.match(await readFile(join(root, 'reports/ai-events-' + date + '.md'), 'utf8'), /尚未核验消息：原始事实证据待核验/);
    const rerun = JSON.parse(await readFile(join(root, 'data/dev/index.json'), 'utf8'));
    assert.equal(rerun.aiEvents.length, 1);
    await json('data/dev/ai-editorial-repairs-' + date + '.json', { verifiedSources: [review],
      events: [event], resolvedPendingEvents: [{ pendingId: pending.id, eventId: event.id }] });
    const resolved = await run();
    assert.equal(resolved.pending, 0);
    const refreshed = JSON.parse(await readFile(join(root, 'data/dev/ai-events-latest.json'), 'utf8'));
    assert.ok(!refreshed.candidates.some(candidate => candidate.id === pending.id));
  } finally { assert.ok(resolve(root).startsWith(resolve(tmpdir()) + sep)); await rm(root, { recursive: true, force: true }); }
});

test('policy adoption requires coverage for new batches, while historical snapshots remain compatible', () => {
  const unreviewed = { ...success, aiEvents: [{ ...event, verification: 'pending' }] };
  assert.ok(aiPublicationBlockers(unreviewed, date).some(message => message.includes('coverage is missing')));
  assert.equal(buildFreshness({date, aiLatest: unreviewed, githubLatest: success, skillsLatest: success}).ready, false);
  assert.deepEqual(aiPublicationBlockers({asOf:'2026-10-09',run:{status:'success'}},'2026-10-09'), []);
});

test('same-day withdrawal replaces already-published events with the latest accepted set', () => {
  const approved=completed(); const withdrawn={...event,id:'withdrawn'}; const historical={...event,id:'historical',sourceReportId:'ai-2026-10-09'};
  const merged=mergeDevSnapshot({main:{generatedAt:time,aiEvents:[historical,withdrawn]},override:{aiEvents:[withdrawn]},aiLatest:approved});
  assert.deepEqual(merged.aiEvents.map(row=>row.id),[historical.id,event.id]);
});

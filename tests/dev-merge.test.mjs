import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeDevSnapshot, mergeProjects, mergeAiEvents } from '../scripts/merge-dev-data.mjs';
import { buildPublishedSnapshot } from '../scripts/promotion.mjs';

test('canonical repository aliases replace duplicate historical records', () => {
  assert.deepEqual(mergeProjects([{id:'old',repo:'owner/old'}], [{id:'new',repo:'owner/new',repoAliases:['owner/old']}]), [{id:'new',repo:'owner/new',repoAliases:['owner/old']}]);
});

test('paper date corrections reconcile old duplicate IDs but not shared product homepages', () => {
  const paper = {contentKind:'paper',date:'2026-10-01',paper:{paperUrl:'https://arxiv.org/abs/2610.00001'}};
  assert.equal(mergeAiEvents([{...paper,id:'old'}],[{...paper,id:'new'}]).length,1);
  assert.equal(mergeAiEvents([{id:'one',sources:[{url:'https://qwen.ai/'}]},{id:'two',sources:[{url:'https://qwen.ai/'}]}]).length,2);
});

test('paper deduplication stays idempotent when a published result is merged again', () => {
  const paper={contentKind:'paper',date:'2026-09-01',paper:{paperUrl:'https://arxiv.org/abs/2609.00610',readingLevel:'abstract'}};
  const historical=[{...paper,id:'first',sourceReportId:'ai-2026-09-04'},{...paper,id:'second',sourceReportId:'ai-2026-09-11'}];
  const published=mergeAiEvents(historical);
  assert.deepEqual(mergeAiEvents(published,historical),published);
  assert.equal(published[0].id,'second');
});

test('dev snapshot merges channel files without mutating main publication data', () => {
  const main = {
    track: 'main',
    generatedAt: '2026-07-10T07:30:00+08:00',
    asOf: { ai: '2026-07-10', github: '2026-07-10' },
    projects: [{ id: 'repo-1', stars: 10 }],
    aiEvents: [{ id: 'event-1', title: 'published' }],
    runs: [{ id: 'wagmi-github', schedule: '每天 07:30' }],
    reports: [],
    weeklySummaries: [{
      id: 'ai-weekly-2026-07-07',
      range: { start: '2026-07-01', end: '2026-07-07' },
      totalEvents: 12,
    }],
  };
  const result = mergeDevSnapshot({
    main,
    candidates: [{ id: 'candidate-1', status: 'pending' }],
    creators: [{ name: 'Official channel' }],
    models: [{ id: 'model-1', modelId: 'owner/model' }],
    aiLatest: {
      generatedAt: '2026-07-14T07:35:00+08:00',
      asOf: '2026-07-14',
      aiEvents: [{ id: 'event-2', title: 'dev' }],
      report: { id: 'ai-2026-07-14' },
    },
    githubLatest: {
      generatedAt: '2026-07-14T07:40:00+08:00',
      asOf: '2026-07-14',
      projects: [{ id: 'repo-1', stars: 20 }],
      report: { id: 'github-2026-07-14' },
    },
    githubTrends: {
      candidates: [{ repo: 'owner/trending', hotLevel: 'hot' }],
    },
    skillsLatest: {
      generatedAt: '2026-07-14T07:45:00+08:00',
      asOf: '2026-07-14',
      skills: [{ id: 'owner/skills/browser', rank: 1 }],
      run: { id: 'wagmi-skills', schedule: 'old' },
      report: { id: 'skills-2026-07-14' },
    },
    weeklyLatest: {
      id: 'ai-weekly-2026-07-14',
      range: { start: '2026-07-08', end: '2026-07-14' },
      totalEvents: 18,
      run: { id: 'wagmi-ai-2', schedule: 'old', status: 'success' },
      report: { id: 'ai-weekly-2026-07-14' },
    },
    dingtalkRun: { id: 'wagmi-dingtalk', schedule: 'old', status: 'unknown' },
  });

  assert.equal(result.track, 'dev');
  assert.equal(result.generatedAt, '2026-07-14T07:45:00+08:00');
  assert.deepEqual(result.asOf, { ai: '2026-07-14', github: '2026-07-14', skills: '2026-07-14' });
  assert.deepEqual(result.projects, [{ id: 'repo-1', stars: 20 }]);
  assert.deepEqual(result.githubTrends, [{
    repo: 'owner/trending',
    hotLevel: 'hot',
    periodStars24h: 0,
    periodStarsWeekly: 0,
    totalStars: 0,
    forks: 0,
    hotScore: 0,
    topics: [],
    priorityDomains: [],
    sourceSignals: [],
    hotReasons: [],
    qualityRisks: [],
  }]);
  assert.equal(result.aiEvents.length, 2);
  assert.equal(result.reports.length, 4);
  assert.equal(result.skills.length, 1);
  assert.equal(result.candidates.length, 1);
  assert.equal(result.watchlist.length, 1);
  assert.deepEqual(result.modelWatchlist, [{ id: 'model-1', modelId: 'owner/model' }]);
  assert.deepEqual(result.weeklySummaries.map((summary) => summary.id), [
    'ai-weekly-2026-07-14',
    'ai-weekly-2026-07-07',
  ]);
  assert.equal(result.runs[0].schedule, '每天 07:30');
  assert.equal(result.runs.find((run) => run.id === 'wagmi-dingtalk').schedule, '每天 08:30');
  assert.equal(result.runs.find((run) => run.id === 'wagmi-ai-2').schedule, '每周一 07:50');
  assert.equal(result.runs.find((run) => run.id === 'wagmi-ai-2').status, 'success');
  assert.equal(result.runs.find((run) => run.id === 'wagmi-skills').schedule, '每天 07:40');
  assert.equal(main.track, 'main');
  assert.equal(main.projects[0].stars, 10);
});

test('published snapshot removes private queues and normalizes schedules', () => {
  const merged = {
    schemaVersion: '1.0.0', track: 'dev', generatedAt: '2026-07-16T07:30:00+08:00',
    asOf: { ai: '2026-07-16', github: '2026-07-16' },
    projects: [{ id: 'repo-1', name: 'Repo', starsDelta: 5, summary: 'Signal', riskNote: 'Risk', sourceReportId: 'github-2026-07-16' }],
    aiEvents: [{ id: 'event-1', date: '2026-07-16', title: 'Event', summary: 'Summary', action: 'Act', priority: 'A', entities: ['Org'], sourceReportId: 'ai-2026-07-16' }],
    runs: [{ id: 'wagmi-github', schedule: 'old' }], reports: [], candidates: [{ id: 'private' }], watchlist: [{ name: 'private' }], weeklySummaries: [],
    githubTrends: [{ repo: 'owner/trending', hotLevel: 'hot' }],
    localReports: [{ id: 'private-report', path: '/__admin/reports/private-report' }],
    modelWatchlist: [{ id: 'private-model' }],
  };
  const published = buildPublishedSnapshot(merged);
  assert.equal(published.track, 'main');
  assert.deepEqual(published.candidates, []);
  assert.deepEqual(published.watchlist, []);
  assert.equal('localReports' in published, false);
  assert.equal('modelWatchlist' in published, false);
  assert.deepEqual(published.githubTrends, [{ repo: 'owner/trending', hotLevel: 'hot' }]);
  assert.equal(published.runs[0].schedule, '每天 07:30');
  assert.equal(published.brief.date, '2026-07-16');
  assert.ok(published.brief.highlights.length >= 2);
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  applyCandidateReviewDecision,
  buildTrackedSeeds,
  buildDelistedProject,
  dedupeProjectsByRepo,
  dedupeTrendCandidates,
  cumulativeStarsDelta,
  metadataIsFreshForDate,
  isConfirmedRepositoryDelisting,
  isDelistedTrackingRecord,
  parseGithubRepositoryPage,
  resolveRepositoryPolicy,
  selectTrackedSeedsForRefresh,
  updateTrendCandidateFromProject,
} from '../scripts/sync-github-industry-watchlist.mjs';

test('3DGS watchlist retains the curated reconstruction stack', async () => {
  const watchlist = JSON.parse(await readFile(new URL('../github-industry-watchlist.json', import.meta.url), 'utf8'));
  const repositories = new Set(watchlist.repositories.map((item) => item.repo.toLowerCase()));
  const required = [
    'apple/ml-sharp',
    'bytedance-seed/depth-anything-3',
    'internrobotics/anysplat',
    'wang-pengfei/one2scene',
    'j-c-zhao/structsplat',
    'cvg/depthsplat',
    'cvg/noposplat',
    'cvg/resplat',
    'fastgs/fastgs',
  ];

  for (const repo of required) assert.ok(repositories.has(repo), `${repo} should remain in the 3DGS watchlist`);
});

test('generative model watchlist retains official SenseNova and FLUX repositories', async () => {
  const watchlist = JSON.parse(await readFile(new URL('../github-industry-watchlist.json', import.meta.url), 'utf8'));
  const repositories = new Set(watchlist.repositories.map((item) => item.repo.toLowerCase()));

  assert.ok(repositories.has('opensensenova/sensenova-u1'));
  assert.ok(repositories.has('black-forest-labs/flux'));
  assert.ok(repositories.has('lbouaraba/comfyui-krea2edit'));
});

test('GitHub HTML fallback preserves public repository counters and quality flags', () => {
  const metadata = parseGithubRepositoryPage('owner/repo', `
    <span id="repo-network-counter" title="1,234">1.2k</span>
    <span id="repo-stars-counter-star" title="56,789">56.8k</span>
  `);

  assert.equal(metadata.full_name, 'owner/repo');
  assert.equal(metadata.stargazers_count, 56_789);
  assert.equal(metadata.forks_count, 1_234);
  assert.equal(metadata.archived, false);
  assert.equal(metadata.fork, false);
  assert.equal(metadata.metadata_source, 'github-html');
});

test('GitHub HTML fallback detects archived forks', () => {
  const metadata = parseGithubRepositoryPage('owner/repo', `
    <span id="repo-network-counter" title="0">0</span>
    <span id="repo-stars-counter-star" title="0">0</span>
    <p>This repository has been archived by the owner.</p>
    <span>forked from <a href="/upstream/repo">upstream/repo</a></span>
  `);

  assert.equal(metadata.archived, true);
  assert.equal(metadata.fork, true);
});

test('React repository counters preserve canonical renames and explicit zero', () => {
  const metadata = parseGithubRepositoryPage('old/name', `<script type="application/json">${JSON.stringify({payload:{sidebarAbout:{ownerLogin:'owner',repoName:'renamed',stargazerCount:586,forksCount:0,repo:{isArchived:false,isFork:false}}}})}</script>`);
  assert.equal(metadata.full_name, 'owner/renamed');
  assert.equal(metadata.stargazers_count, 586);
  assert.equal(metadata.forks_count, 0);
  assert.throws(() => parseGithubRepositoryPage('owner/repo', '<h1>Repo</h1>'), /counter .* missing/);
});

test('verified official forks retain provenance without warning the whole run', () => {
  const policy = resolveRepositoryPolicy(
    { officialFork: true, intakeDecision: 'approved' },
    { archived: false, fork: true },
  );

  assert.equal(policy.originality, 'official_derivative_repository');
  assert.equal(policy.intakeDecision, 'approved');
  assert.equal(policy.requiresWarning, false);
});

test('unapproved forks still require manual review', () => {
  const policy = resolveRepositoryPolicy({}, { archived: false, fork: true });

  assert.equal(policy.originality, 'fork_requires_manual_review');
  assert.equal(policy.intakeDecision, 'observe');
  assert.equal(policy.requiresWarning, true);
});

test('tracked metadata freshness is based on each repository fetch time', () => {
  assert.equal(metadataIsFreshForDate({ metadataFetchedAt: '2026-07-29T00:30:00.000Z' }, '2026-07-29'), true);
  assert.equal(metadataIsFreshForDate({ metadataFetchedAt: '2026-07-27T23:30:00.000Z' }, '2026-07-29'), false);
  assert.equal(metadataIsFreshForDate({ metadataFetchedAt: null }, '2026-07-29'), false);
});

test('confirmed GitHub 404/410 is classified as a retained delisting lifecycle event', () => {
  assert.equal(isConfirmedRepositoryDelisting(new Error('owner/repo: GitHub page HTTP 404')), true);
  assert.equal(isConfirmedRepositoryDelisting(new Error('owner/repo: GitHub page HTTP 410')), true);
  assert.equal(isConfirmedRepositoryDelisting(new Error('owner/repo: GitHub page HTTP 429')), false);

  const project = buildDelistedProject(
    { repo: 'owner/repo', name: 'Repo', category: '3D', level: 'B+', priorityDomains: ['3d'], summary: 'Summary', riskNote: 'Risk', decisionReason: 'Historical decision' },
    { id: 'owner-repo', repo: 'owner/repo', url: 'https://github.com/owner/repo', stars: 13, forks: 1, lastActivity: '2026-07-15', verification: 'verified', intakeDecision: 'approved', metadataFetchedAt: '2026-09-07T00:00:00.000Z' },
    null,
    'github-2026-09-08',
    '2026-09-08',
    '2026-09-08T00:45:00.000Z',
  );

  assert.equal(isDelistedTrackingRecord(project), true);
  assert.equal(project.delistedAt, '2026-09-08');
  assert.equal(project.stars, 13);
  assert.equal(project.starsDelta, 0);
  assert.equal(project.intakeDecision, 'approved');
  assert.equal(project.availabilityCheckedAt, '2026-09-08T00:45:00.000Z');
});

test('same-day repository refreshes preserve cumulative star growth', () => {
  const firstRefresh = cumulativeStarsDelta({
    stars: 6_893,
    starsDelta: 0,
    sourceReportId: 'github-2026-07-29',
  }, 7_704, 'github-2026-07-29');
  const secondRefresh = cumulativeStarsDelta({
    stars: 7_704,
    starsDelta: firstRefresh,
    sourceReportId: 'github-2026-07-29',
  }, 7_800, 'github-2026-07-29');

  assert.equal(firstRefresh, 811);
  assert.equal(secondRefresh, 907);
});

test('tracked refresh reconciles candidate metadata and AI review status', () => {
  const candidate = updateTrendCandidateFromProject({
    repo: 'old/name',
    hotLevel: 'surging',
    hotReasons: ['跨 5 个来源命中', '本地快照新增 Stars 100'],
    observedDelta: 100,
    aiReviewStatus: 'pending',
  }, {
    repo: 'owner/name',
    url: 'https://github.com/owner/name',
    name: 'Name',
    stars: 7_704,
    forks: 589,
    starsDelta: 811,
    lastActivity: '2026-07-29',
    license: 'Apache-2.0',
    intakeDecision: 'approved',
  });

  assert.equal(candidate.totalStars, 7_704);
  assert.equal(candidate.observedDelta, 811);
  assert.equal(candidate.aiReviewStatus, 'approved');
  assert.equal(candidate.intakeRecommendation, 'tracked');
  assert.deepEqual(candidate.hotReasons, ['跨 5 个来源命中', '本地快照新增 Stars 811']);
});

test('formal projects missing from the curated watchlist still enter metadata refresh', () => {
  const seeds = buildTrackedSeeds(
    [{ repo: 'owner/core', aliases: ['old/core'], name: 'Core' }],
    [
      { repo: 'old/core', name: 'Core historical path' },
      {
        repo: 'owner/formal',
        name: 'Formal',
        category: '3D',
        level: 'B+',
        summary: 'Summary',
        riskNote: 'Risk',
        intakeDecision: 'approved',
      },
    ],
  );

  assert.deepEqual(seeds.map((seed) => seed.repo), ['owner/core', 'owner/formal']);
  assert.equal(seeds[1].intakeDecision, 'approved');
});

test('a renamed repository with the curated stable id is retained as an alias, not duplicated', () => {
  const seeds = buildTrackedSeeds(
    [{ repo: 'neu-vi/houseCrafter', name: 'HouseCrafter' }],
    [{ id: 'neu-vi-housecrafter', repo: 'neu-3dvi/houseCrafter', name: 'HouseCrafter' }],
  );

  assert.equal(seeds.length, 1);
  assert.equal(seeds[0].repo, 'neu-vi/houseCrafter');
  assert.deepEqual(seeds[0].aliases, ['neu-3dvi/houseCrafter']);
});

test('duplicate trend candidates keep the richer signals after a repository rename', () => {
  const candidates = dedupeTrendCandidates([
    { repo: 'owner/Repo', hotScore: 8, sourceSignals: [{ id: 'tracked' }], priorityDomains: [{ id: '3d' }], hotReasons: ['tracked'], totalStars: 10 },
    { repo: 'OWNER/repo', hotScore: 58, sourceSignals: [{ id: 'industry' }], priorityDomains: [{ id: 'interior' }], hotReasons: ['industry'], totalStars: 12 },
  ]);

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].hotScore, 58);
  assert.equal(candidates[0].totalStars, 12);
  assert.deepEqual(candidates[0].sourceSignals.map((item) => item.id), ['tracked', 'industry']);
  assert.deepEqual(candidates[0].priorityDomains.map((item) => item.id), ['3d', 'interior']);
});

test('canonical repository paths are unique even when historical ids differ', () => {
  const projects = dedupeProjectsByRepo([
    { id: 'old-id', repo: 'Owner/Renamed', stars: 12 },
    { id: 'new-id', repo: 'owner/renamed', stars: 10 },
  ]);

  assert.deepEqual(projects, [{ id: 'old-id', repo: 'Owner/Renamed', stars: 12 }]);
});

test('daily refresh prioritizes hot projects and rotates the stalest long-tail records', () => {
  const seeds = ['hot', 'oldest', 'older', 'fresh', 'delisted'].map((name) => ({ repo: `owner/${name}`, name }));
  const projects = [
    { repo: 'owner/hot', metadataFetchedAt: '2026-07-29T00:30:00.000Z' },
    { repo: 'owner/oldest', metadataFetchedAt: '2026-07-20T00:00:00.000Z' },
    { repo: 'owner/older', metadataFetchedAt: '2026-07-21T00:00:00.000Z' },
    { repo: 'owner/fresh', metadataFetchedAt: '2026-07-29T01:00:00.000Z' },
    { repo: 'owner/delisted', metadataFetchedAt: '2026-07-01T00:00:00.000Z', trackingStatus: 'delisted', delistedAt: '2026-07-28' },
  ];
  const trends = {
    candidates: [{ repo: 'owner/hot', tracked: true, hotLevel: 'surging' }],
  };

  const selected = selectTrackedSeedsForRefresh(seeds, projects, trends, '2026-07-29', 1);
  assert.deepEqual(selected.map((seed) => seed.repo), ['owner/hot', 'owner/oldest']);
});

test('daily AI review decisions are reflected in candidate state', () => {
  assert.deepEqual(
    applyCandidateReviewDecision({ repo: 'owner/repo', aiReviewStatus: 'pending' }, 'observe'),
    { repo: 'owner/repo', aiReviewStatus: 'observe', intakeRecommendation: 'observe' },
  );
  assert.equal(
    applyCandidateReviewDecision({ repo: 'owner/tracked' }, 'approved').intakeRecommendation,
    'tracked',
  );
});

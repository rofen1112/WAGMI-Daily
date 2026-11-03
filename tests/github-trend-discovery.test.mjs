import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildTrendSnapshot,
  classifyHotLevel,
  collectForcedCandidates,
  githubRetryDelayMs,
  ossInsightUnavailable,
  parseGithubTrending,
  mergeCandidate,
  normalizeRepo,
  priorityDomainsFor,
  scoreCandidate,
  validateTrendSnapshot,
} from '../scripts/discover-github-trends.mjs';

test('unavailable OSS metric is not a successful empty ranking', () => {
  const payload = { data: { rows: [] }, data_quality: { status: 'unavailable', reason: 'capture incomplete' } };
  assert.equal(ossInsightUnavailable(payload).status, 'unavailable');
  assert.equal(ossInsightUnavailable({ data: { rows: [] } }), null);
});

test('official GitHub Trending retains actual source, rank and period counts', () => {
  const rows = parseGithubTrending('<article class="Box-row"><h2><a href="/lab/ai-tool">lab / ai-tool</a></h2><p>Original AI &amp; 3D tool</p><a href="/lab/ai-tool/stargazers">1,234</a><a href="/lab/ai-tool/forks">12</a><span>78 stars today</span></article>', 'github-trending-24h-all', 'past_24_hours');
  assert.equal(rows[0].totalStars, 1234);
  assert.equal(rows[0].periodStars24h, 78);
  assert.equal(rows[0].sourceSignals[0].id, 'github-trending-24h-all');
  assert.equal(classifyHotLevel(rows[0]), 'surging');
});

test('repository normalization accepts owner/repo and GitHub URLs only', () => {
  assert.equal(normalizeRepo('owner/repo'), 'owner/repo');
  assert.equal(normalizeRepo('https://github.com/owner/repo.git'), 'owner/repo');
  assert.equal(normalizeRepo('unresolved project name'), '');
});

test('weekly verified repository annotations enter the forced candidate queue', () => {
  const result = collectForcedCandidates({}, {
    projectCandidates: [
      'MoonshotAI/Kimi-K3 | verified | https://github.com/MoonshotAI/Kimi-K3',
      'Unresolved model asset | pending | repo URL 待核验',
    ],
  }, []);
  assert.deepEqual(result.resolved.map((item) => item.repo), ['MoonshotAI/Kimi-K3']);
  assert.equal(result.unresolved.length, 1);
});

test('GitHub search rate limits wait until the advertised reset window', () => {
  const now = Date.parse('2026-07-20T00:00:00Z');
  assert.equal(githubRetryDelayMs({ status: 403, rateLimitReset: String((now + 30_000) / 1000) }, now), 31_500);
  assert.equal(githubRetryDelayMs({ status: 429, retryAfter: '12' }, now), 13_000);
  assert.equal(githubRetryDelayMs({ status: 500 }, now), 0);
});

test('candidate merging preserves independent trend signals and strongest velocity', () => {
  const merged = mergeCandidate(
    { repo: 'owner/repo', periodStars24h: 12, sourceSignals: [{ id: 'one', weight: 10 }] },
    { repo: 'owner/repo', periodStars24h: 25, sourceSignals: [{ id: 'two', weight: 20 }] },
  );
  assert.equal(merged.periodStars24h, 25);
  assert.deepEqual(merged.sourceSignals.map((item) => item.id), ['two', 'one']);
});

test('hot classification detects sudden attention without relying on total stars', () => {
  const scored = scoreCandidate({
    repo: 'owner/new-agent',
    description: 'Autonomous AI agent',
    totalStars: 80,
    periodStars24h: 28,
    activityScore24h: 120,
    createdAt: '2026-07-10T00:00:00Z',
    pushedAt: '2026-07-17T00:00:00Z',
    sourceSignals: [{ id: 'ossinsight-24h-all', weight: 45 }],
  }, null, '2026-07-17');
  assert.equal(classifyHotLevel(scored), 'hot');
  assert.ok(scored.hotScore > 50);
});

test('same-day discovery reruns preserve the strongest observed heat', () => {
  const previousSnapshot = buildTrendSnapshot({
    asOf: '2026-07-25',
    sourceStatus: [{ id: 'ossinsight-24h-all', status: 'success', count: 1 }],
    previousSnapshot: {
      asOf: '2026-07-24',
      candidates: [{ repo: 'owner/fast-agent', totalStars: 100 }],
    },
    unresolvedAiCandidates: [],
    records: [{
      repo: 'owner/fast-agent',
      description: 'Original AI agent runtime',
      totalStars: 230,
      pushedAt: '2026-07-25T00:00:00Z',
      sourceSignals: [{ id: 'ossinsight-24h-all', weight: 45, rank: 12 }],
    }],
  });
  assert.equal(previousSnapshot.candidates[0].hotLevel, 'surging');
  assert.equal(previousSnapshot.candidates[0].observedDelta, 130);

  const rerun = buildTrendSnapshot({
    asOf: '2026-07-25',
    sourceStatus: [{ id: 'ossinsight-24h-all', status: 'success', count: 1 }],
    previousSnapshot,
    unresolvedAiCandidates: [],
    records: [{
      repo: 'owner/fast-agent',
      description: 'Original AI agent runtime',
      totalStars: 230,
      pushedAt: '2026-07-25T00:00:00Z',
      sourceSignals: [{ id: 'ossinsight-24h-all', weight: 45, rank: 30 }],
    }],
  });
  assert.equal(rerun.candidates[0].hotLevel, 'surging');
  assert.equal(rerun.candidates[0].observedDelta, 130);
});

test('repository aliases collapse redirects into the canonical candidate', () => {
  const snapshot = buildTrendSnapshot({
    asOf: '2026-07-26',
    sourceStatus: [{ id: 'ossinsight-24h-all', status: 'success', count: 1 }],
    previousSnapshot: {
      asOf: '2026-07-26',
      candidates: [{
        repo: 'old-owner/tool',
        hotLevel: 'surging',
        hotScore: 200,
        sourceSignals: [{ id: 'tracked', weight: 5 }],
      }],
    },
    unresolvedAiCandidates: [],
    repoAliases: new Map([['old-owner/tool', 'new-owner/tool']]),
    records: [
      {
        repo: 'old-owner/tool',
        description: 'Original AI design tool',
        tracked: true,
        sourceSignals: [{ id: 'tracked', weight: 5 }],
      },
      {
        repo: 'new-owner/tool',
        description: 'Original AI design tool',
        periodStars24h: 20,
        sourceSignals: [{ id: 'ossinsight-24h-all', weight: 45 }],
      },
    ],
  });
  assert.equal(snapshot.candidates.length, 1);
  assert.equal(snapshot.candidates[0].repo, 'new-owner/tool');
  assert.equal(snapshot.candidates[0].hotLevel, 'surging');
});

test('trend snapshot filters unrelated lists while retaining tracked and forced projects', () => {
  const snapshot = buildTrendSnapshot({
    asOf: '2026-07-17',
    sourceStatus: [{ id: 'ossinsight-24h-all', status: 'success', count: 3 }],
    previousSnapshot: null,
    unresolvedAiCandidates: [],
    records: [
      { repo: 'owner/ai-agent', description: 'AI agent runtime', periodStars24h: 30, sourceSignals: [{ id: 'ossinsight-24h-all', weight: 45 }] },
      { repo: 'owner/awesome-links', description: 'Awesome resources', periodStars24h: 100, sourceSignals: [{ id: 'ossinsight-24h-all', weight: 45 }] },
      { repo: 'owner/internal-tool', description: 'Utility', tracked: true, sourceSignals: [{ id: 'tracked', weight: 5 }] },
      { repo: 'owner/forced-sdk', description: '', forcedByAI: true, sourceSignals: [{ id: 'ai-daily-forced', weight: 50 }] },
    ],
  });
  assert.deepEqual(snapshot.candidates.map((item) => item.repo).sort(), ['owner/ai-agent', 'owner/forced-sdk', 'owner/internal-tool']);
  assert.deepEqual(validateTrendSnapshot(snapshot), []);
});

test('industry priority domains do not require heat for GitHub intake review', () => {
  const snapshot = buildTrendSnapshot({
    asOf: '2026-07-18', previousSnapshot: null, sourceStatus: [{ id: 'github-3dgs-active', status: 'success' }], unresolvedAiCandidates: [],
    records: [
      {
        repo: 'studio/quiet-3dgs-tool',
        description: 'Original Gaussian Splatting editor for interior and architectural scenes',
        periodStars24h: 0,
        sourceSignals: [{ id: 'github-3dgs-active', weight: 50, rank: 20 }],
      },
    ],
  });
  assert.equal(snapshot.candidates.length, 1);
  assert.equal(snapshot.candidates[0].hotLevel, 'watch');
  assert.equal(snapshot.candidates[0].intakePriority, 'P0');
  assert.equal(snapshot.candidates[0].heatRequiredForIntake, false);
  assert.deepEqual(snapshot.candidates[0].priorityDomains.map((item) => item.id).sort(), ['3dgs', 'interior-design']);
});

test('forks and copied resource lists are marked as quality risks for AI review', () => {
  const snapshot = buildTrendSnapshot({
    asOf: '2026-07-18', previousSnapshot: null, sourceStatus: [{ id: 'github-design-tools-active', status: 'success' }], unresolvedAiCandidates: [],
    records: [
      {
        repo: 'copy/awesome-generative-design',
        description: 'Awesome generative design resources',
        fork: true,
        forcedByAI: true,
        sourceSignals: [{ id: 'ai-daily-forced', weight: 50 }],
      },
    ],
  });
  assert.equal(snapshot.candidates[0].qualityGate, false);
  assert.deepEqual(snapshot.candidates[0].qualityRisks.sort(), ['copy_or_coursework', 'fork', 'list_or_resource_collection']);
  assert.equal(snapshot.candidates[0].intakeRecommendation, 'reject_unless_originality_verified');
});

test('priority domain classifier recognizes architecture, 3D and open model projects', () => {
  const domains = priorityDomainsFor({
    repo: 'lab/open-building-model',
    description: 'Open-weight foundation model for BIM architecture and text-to-3D generation',
  }).map((item) => item.id);
  assert.ok(domains.includes('architecture-aec'));
  assert.ok(domains.includes('3d'));
  assert.ok(domains.includes('open-model'));
});

test('priority domain classifier recognizes web data infrastructure', () => {
  const domains = priorityDomainsFor({
    repo: 'data/firecrawl-like',
    description: 'AI web crawler with HTML-to-Markdown data extraction, browser automation and deep research workflows.',
  }).map((item) => item.id);
  assert.ok(domains.includes('web-data'));
  assert.ok(domains.includes('browser-automation'));
  assert.ok(domains.includes('deep-research'));
  const documentDomains = priorityDomainsFor({ repo: 'firecrawl/pdf-inspector', description: 'Fast PDF parser with OCR routing, table extraction and PDF-to-Markdown conversion.' }).map((item) => item.id);
  assert.ok(documentDomains.includes('document-processing'));
});
test('priority domain classifier recognizes physically consistent SimReady projects', () => {
  const domains = priorityDomainsFor({
    repo: 'research/physical-scene',
    description: 'Simulation-ready 3D reconstruction with scene graphs, support relations and collision-free physics-guided refinement.',
    topics: ['isaac-sim'],
  });
  assert.equal(domains.some((domain) => domain.id === 'simulation'), true);
});

test('priority domain classifier recognizes video algorithms, editing and 3D stage projects', () => {
  const domains = priorityDomainsFor({
    repo: 'studio/video-stage',
    description: 'Video understanding and automatic video editing with 4D reconstruction, novel camera trajectories and virtual production tools.',
  }).map((item) => item.id);
  assert.ok(domains.includes('video-intelligence'));
  assert.ok(domains.includes('video-editing'));
  assert.ok(domains.includes('virtual-production'));
});

test('priority domain classifier separates image and video generation models', () => {
  const imageDomains = priorityDomainsFor({
    repo: 'model-lab/unified-image',
    description: 'Open-weight native multimodal generation model for text-to-image and image editing.',
  }).map((item) => item.id);
  const videoDomains = priorityDomainsFor({
    repo: 'model-lab/video-foundation',
    description: 'Open text-to-video and image-to-video generative video foundation model.',
  }).map((item) => item.id);

  assert.ok(imageDomains.includes('image-generation'));
  assert.ok(videoDomains.includes('video-generation'));
});

test('priority domain classifier recognizes WAIC physical AI, VLA and Sim2Real projects', () => {
  const domains = priorityDomainsFor({
    repo: 'robot-lab/physical-vla',
    description: 'Physical AI vision-language-action robot policy trained with synthetic robot data for sim-to-real manipulation.',
    topics: ['robot-learning', 'isaac-lab'],
  }).map((item) => item.id);
  assert.ok(domains.includes('physical-ai'));
  assert.ok(domains.includes('robot-simulation'));
  assert.ok(domains.includes('robot-learning'));
});

test('low-information single-source projects do not enter the AI review queue', () => {
  const snapshot = buildTrendSnapshot({
    asOf: '2026-07-18', previousSnapshot: null, sourceStatus: [{ id: 'github-interior-design-active', status: 'success' }], unresolvedAiCandidates: [],
    records: [{
      repo: 'demo/interior-page',
      description: 'Interior design',
      totalStars: 0,
      sourceSignals: [{ id: 'github-interior-design-active', weight: 48 }],
    }],
  });
  assert.equal(snapshot.candidates.length, 0);
});

test('expanded discovery keeps up to 100 qualified industry candidates', () => {
  const records = Array.from({ length: 120 }, (_, index) => ({
    repo: `spatial-lab/reconstruction-${index}`,
    description: `Original 3D reconstruction system ${index} with maintained implementation`,
    totalStars: 20 + index,
    pushedAt: '2026-07-19T00:00:00Z',
    sourceSignals: [{ id: 'github-3d-active', weight: 46, rank: index + 1 }],
  }));
  const snapshot = buildTrendSnapshot({
    asOf: '2026-07-19', previousSnapshot: null, sourceStatus: [{ id: 'github-3d-active', status: 'success' }], unresolvedAiCandidates: [], records,
  });
  assert.equal(snapshot.candidates.length, 100);
  assert.deepEqual(snapshot.methodology.limits, {
    discoveryCandidates: 100,
    hotReviewCandidates: 24,
    githubSearchPerQuery: 50,
  });
});
test('paper repository forcing is limited to papers selected for the current AI daily', () => {
  const result = collectForcedCandidates({
    aiEvents: [{
      contentKind: 'paper',
      paper: { paperUrl: 'https://arxiv.org/abs/2608.10756' },
      repoCandidates: [],
    }],
    candidates: [],
  }, {}, [], {
    candidates: [
      { paperId: 'arxiv-2608-10756', repo: 'owner/current-paper-code' },
      { paperId: 'arxiv-2608-03279', repo: 'owner/historical-paper-code' },
    ],
  });
  assert.deepEqual(result.resolved.map((item) => item.repo), ['owner/current-paper-code']);
});
test('weekly model assets are not misclassified as GitHub repositories', () => {
  const result = collectForcedCandidates({}, {
    projectCandidates: [
      'Comfy-Org/MiniMax-H3 | verified model asset | https://huggingface.co/Comfy-Org/MiniMax-H3',
      'mistralai/Shieldstral-1.0-3B | verified',
    ],
  }, []);
  assert.deepEqual(result.resolved, []);
});

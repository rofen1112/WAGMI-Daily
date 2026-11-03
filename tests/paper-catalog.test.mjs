import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPaperCatalog, inferRepositoryLinks } from '../scripts/sync-paper-catalog.mjs';

const topic = { id: 'three-d', labelZh: '3D 重建', board: 'AI 3D / World Models', score: 20, matchedTerms: ['3d gaussian'] };
const basePaper = {
  arxivId: '2608.00001',
  source: 'arxiv',
  titleOriginal: 'A 3D Gaussian Splatting Method',
  abstract: 'A feed-forward 3D Gaussian splatting method for novel view synthesis.',
  authors: ['Researcher'],
  categories: ['cs.CV'],
  publishedAt: '2026-08-05T01:00:00Z',
  url: 'https://arxiv.org/abs/2608.00001',
  pdfUrl: 'https://arxiv.org/pdf/2608.00001',
  score: 40,
  reviewTier: 'deep',
  matchedTopics: [topic],
  targetBoards: ['Frontier Paper / Research', 'AI 3D / World Models'],
  reasonsZh: ['3D 重建'],
};

const projects = [
  { repo: 'graphdeco-inria/gaussian-splatting', url: 'https://github.com/graphdeco-inria/gaussian-splatting' },
  { repo: 'nerfstudio-project/gsplat', url: 'https://github.com/nerfstudio-project/gsplat' },
  { repo: 'dcharatan/pixelsplat', url: 'https://github.com/dcharatan/pixelsplat' },
];

test('same-day editorial selections survive catalog rebuilds and cannot select unreviewed or excess papers', () => {
  const p={...basePaper,id:'arxiv-2608-00001'};
  const options={latest:{asOf:'2026-08-05',catalogCandidates:[p]},previous:{papers:[]},githubLatest:{projects:[]},
    reviews:{[p.id]:{titleZh:'已读原始摘要的论文',summaryZh:'该论文提出一项三维重建方法。',limitationsZh:'摘要级，尚未复现。',reviewStatus:'interpreted',readingLevel:'abstract'}},
    dailySelections:{'2026-08-05':{paperIds:[p.id],checkedAt:'2026-08-05T01:00:00Z',reason:'人工比较原始内容后优先选择本日重要候选。'}}};
  assert.deepEqual(buildPaperCatalog(options).dailyRecommendations,[p.id]);
  for(const mutate of [
    o=>{o.dailySelections['2026-08-05'].paperIds=['missing'];},
    o=>{o.dailySelections['2026-08-05'].paperIds=[p.id,p.id];},
    o=>{o.dailySelections['2026-08-05'].paperIds=['a','b','c','d'];},
    o=>{o.dailySelections['2026-08-05'].checkedAt='2026-08-04T01:00:00Z';},
    o=>{o.reviews[p.id].readingLevel='metadata';},
  ]){const changed=structuredClone(options);mutate(changed);assert.throws(()=>buildPaperCatalog(changed),/Invalid current-day/);}
  const next=structuredClone(options);next.latest.asOf='2026-08-06';
  assert.equal(buildPaperCatalog(next).dailyRecommendationSelection,undefined);
});

test('a manually discovered original has no invented RSS announcement', () => {
  const paper={...basePaper,id:'arxiv-2608-00001',originalPublishedAt:'2026-08-01T00:00:00Z',rssAnnouncedAt:null,relatedRepositories:[]};
  const catalog=buildPaperCatalog({latest:{asOf:'2026-08-05',catalogCandidates:[]},previous:{papers:[paper]},githubLatest:{projects:[]}});
  assert.equal(catalog.papers[0].rssAnnouncedAt,null);
  assert.equal(catalog.papers[0].publishedAt,paper.originalPublishedAt);
});

test('paper catalog preserves missing records and advances the reading queue', () => {
  const first = { ...basePaper, id: 'arxiv-2608-00001' };
  const second = { ...basePaper, id: 'arxiv-2608-00002', arxivId: '2608.00002', titleOriginal: 'Second 3D Reconstruction Paper', url: 'https://arxiv.org/abs/2608.00002' };
  const previousPaper = {
    ...basePaper,
    id: 'arxiv-2607-99999',
    arxivId: '2607.99999',
    titleOriginal: 'Previously Collected Paper',
    abstractOriginal: 'Historical source abstract.',
    url: 'https://arxiv.org/abs/2607.99999',
    topics: [topic],
    relatedRepositories: [],
    reviewStatus: 'discovered',
    readingLevel: 'metadata',
    availabilityStatus: 'active',
    missingRuns: 0,
    firstSeenAt: '2026-08-04T00:00:00Z',
    lastSeenAt: '2026-08-04T00:00:00Z',
  };
  const catalog = buildPaperCatalog({
    latest: {
      asOf: '2026-08-05', budgets: { deepRead: 1, fullText: 1, digest: 8 },
      candidates: [first, second], deepReadQueue: [first.id], sourcePlan: {},
    },
    previous: { papers: [previousPaper], reviewQueue: [] },
    githubLatest: { projects },
    reviews: {
      [first.id]: { reviewStatus: 'interpreted', readingLevel: 'abstract', titleZh: '首篇三维重建论文', summaryZh: '已经完成摘要级中文解读。' },
    },
    generatedAt: '2026-08-05T02:00:00Z',
  });

  assert.equal(catalog.papers.length, 3);
  assert.equal(catalog.papers.find((paper) => paper.id === previousPaper.id).availabilityStatus, 'monitoring');
  assert.equal(catalog.papers.find((paper) => paper.id === previousPaper.id).missingRuns, 1);
  assert.deepEqual(catalog.reviewQueue, [second.id]);
  assert.deepEqual(catalog.dailyRecommendations, [first.id]);

  const rerun = buildPaperCatalog({
    latest: {
      asOf: '2026-08-05', budgets: { deepRead: 1, fullText: 1, digest: 8 },
      candidates: [first, second], deepReadQueue: [first.id], sourcePlan: {},
    },
    previous: catalog,
    githubLatest: { projects },
    reviews: {
      [first.id]: { reviewStatus: 'interpreted', readingLevel: 'abstract', titleZh: '首篇三维重建论文', summaryZh: '已经完成摘要级中文解读。' },
    },
    generatedAt: '2026-08-05T06:00:00Z',
  });
  assert.equal(rerun.papers.find((paper) => paper.id === previousPaper.id).missingRuns, 1);
  assert.equal(rerun.papers.find((paper) => paper.id === previousPaper.id).availabilityStatus, 'monitoring');
});

test('related repositories are not mislabeled as official code', () => {
  const links = inferRepositoryLinks(basePaper, projects);
  assert.ok(links.some((link) => link.repo === 'graphdeco-inria/gaussian-splatting' && link.relation === 'baseline'));
  assert.ok(links.every((link) => link.relation !== 'official_code'));
  assert.ok(links.every((link) => link.evidenceUrl === basePaper.url));
});

test('an explicit GitHub URL creates a high-confidence official-code relation', () => {
  const paper = { ...basePaper, abstract: 'Code is available at https://github.com/example/paper-code.' };
  const links = inferRepositoryLinks(paper, [{ repo: 'example/paper-code', url: 'https://github.com/example/paper-code' }]);
  assert.ok(links.some((link) => link.repo === 'example/paper-code' && link.relation === 'official_code' && link.confidence === 'high'));
});
test('manual review requests take priority over automatic candidates', () => {
  const automatic = { ...basePaper, id: 'arxiv-2608-00001' };
  const manual = {
    ...basePaper,
    id: 'arxiv-2608-00002',
    arxivId: '2608.00002',
    titleOriginal: 'Manually requested paper',
    url: 'https://arxiv.org/abs/2608.00002',
  };
  const catalog = buildPaperCatalog({
    latest: {
      asOf: '2026-08-06',
      budgets: { deepRead: 1, fullText: 1, digest: 8 },
      candidates: [automatic, manual],
      deepReadQueue: [automatic.id],
      sourcePlan: {},
    },
    previous: { papers: [], reviewQueue: [] },
    githubLatest: { projects },
    reviewRequests: [{
      paperId: manual.id,
      requestedAt: '2026-08-06T08:00:00.000Z',
      status: 'queued',
      source: 'local-admin',
    }],
    generatedAt: '2026-08-06T08:01:00.000Z',
  });

  assert.deepEqual(catalog.reviewQueue, [manual.id]);
  assert.deepEqual(catalog.priorityReviewQueue, [manual.id]);
  assert.equal(catalog.papers.find((paper) => paper.id === manual.id).reviewPriority, 'immediate');
  assert.equal(catalog.papers.find((paper) => paper.id === automatic.id).reviewStatus, 'discovered');
});

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const latestPath = resolve(root, 'data/dev/ai-papers-latest.json');
const catalogPath = resolve(root, 'data/dev/papers-catalog.json');
const githubPath = resolve(root, 'data/dev/github-radar-latest.json');
const reviewPath = resolve(root, 'paper-review-overrides.json');
const reviewRequestsPath = resolve(root, 'data/dev/paper-review-requests.json');
const githubBridgePath = resolve(root, 'data/dev/paper-github-candidates.json');

const relationPriority = {
  official_code: 5,
  project_page: 4,
  baseline: 3,
  related_method: 2,
  downstream_application: 1,
};

const repositoryRules = [
  {
    pattern: /3d gaussian|gaussian splatting|\b3dgs\b/i,
    links: [
      ['graphdeco-inria/gaussian-splatting', 'baseline', '3D Gaussian Splatting 基础实现'],
      ['nerfstudio-project/gsplat', 'related_method', '3DGS 工程与研究后端'],
    ],
  },
  {
    pattern: /feed-forward|pixelsplat|mvsplat|novel view synthesis|\bnvs\b/i,
    links: [
      ['dcharatan/pixelsplat', 'baseline', '前馈式 3D 重建相关方法'],
      ['donydchen/mvsplat', 'baseline', '稀疏多视图前馈重建基线'],
      ['donydchen/mvsplat360', 'related_method', '全景前馈重建相关方法'],
    ],
  },
  {
    pattern: /world model|world simulation|spatial intelligence/i,
    links: [
      ['facebookresearch/jepa-wms', 'related_method', '世界模型研究实现'],
      ['alibaba-damo-academy/RynnWorld-4D', 'related_method', '4D 世界生成相关实现'],
      ['mira-wm/mira', 'related_method', '可运行世界模型相关实现'],
    ],
  },
  {
    pattern: /embodied|robot|physical ai/i,
    links: [
      ['AgibotTech/AgiBotWorldChallengeICRA2026-WorldModelBaseline', 'downstream_application', '具身智能世界模型应用基线'],
    ],
  },
];

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

function cleanRepo(value = '') {
  return String(value)
    .trim()
    .replace(/^https:\/\/github\.com\//i, '')
    .replace(/\/$/, '')
    .replace(/[.,;:!?]+$/, '')
    .replace(/\.git$/i, '');
}

function normalizedRepo(value = '') {
  return cleanRepo(value).toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function daysBetween(date, other) {
  const left = Date.parse(`${String(date).slice(0, 10)}T00:00:00Z`);
  const right = Date.parse(`${String(other).slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return 99;
  return Math.max(0, Math.floor((left - right) / 86_400_000));
}

function shanghaiDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value).slice(0, 10);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsed);
}

function extractGithubLinks(paper, projectsByRepo) {
  const text = `${paper.titleOriginal ?? ''} ${paper.abstract ?? paper.abstractOriginal ?? ''}`;
  const links = [];
  for (const match of text.matchAll(/https?:\/\/github\.com\/([\w.-]+\/[\w.-]+)/gi)) {
    const explicitRepo = cleanRepo(match[1]);
    const repoKey = normalizedRepo(explicitRepo);
    const project = projectsByRepo.get(repoKey);
    links.push({
      repo: project?.repo ?? explicitRepo,
      url: project?.url ?? `https://github.com/${explicitRepo}`,
      relation: 'official_code',
      labelZh: '论文正文或摘要明确给出的代码仓库',
      evidenceUrl: paper.url,
      confidence: 'high',
      verified: Boolean(project),
    });
  }
  return links;
}

export function inferRepositoryLinks(paper, projects = []) {
  const projectsByRepo = new Map(projects.map((project) => [normalizedRepo(project.repo), project]));
  const text = `${paper.titleOriginal ?? ''} ${paper.abstract ?? paper.abstractOriginal ?? ''}`;
  const links = extractGithubLinks(paper, projectsByRepo);

  for (const rule of repositoryRules) {
    if (!rule.pattern.test(text)) continue;
    for (const [repo, relation, labelZh] of rule.links) {
      const project = projectsByRepo.get(normalizedRepo(repo));
      if (!project) continue;
      links.push({
        repo: project.repo,
        url: project.url,
        relation,
        labelZh,
        evidenceUrl: paper.url,
        confidence: relation === 'baseline' ? 'medium' : 'contextual',
        verified: true,
      });
    }
  }

  const merged = new Map();
  for (const link of links) {
    const key = normalizedRepo(link.repo);
    const current = merged.get(key);
    if (!current || relationPriority[link.relation] > relationPriority[current.relation]) merged.set(key, link);
  }
  return [...merged.values()].sort((left, right) => relationPriority[right.relation] - relationPriority[left.relation] || left.repo.localeCompare(right.repo));
}

function mergeRepositoryLinks(existing = [], inferred = []) {
  const merged = new Map();
  for (const link of [...existing, ...inferred]) {
    const repo = cleanRepo(link.repo);
    const key = normalizedRepo(repo);
    if (!key) continue;
    const normalizedLink = {
      ...link,
      repo,
      url: link.url?.startsWith('https://github.com/') ? `https://github.com/${repo}` : link.url,
    };
    const current = merged.get(key);
    if (!current || relationPriority[normalizedLink.relation] >= relationPriority[current.relation]) merged.set(key, normalizedLink);
  }
  return [...merged.values()];
}

function heatScore(paper, asOf, repositories) {
  const recency = Math.max(0, 16 - daysBetween(asOf, paper.publishedAt) * 3);
  const evidence = Math.min(12, repositories.length * 3);
  const officialCode = repositories.some((link) => link.relation === 'official_code') ? 16 : 0;
  const crossDomain = Math.min(8, Math.max(0, (paper.matchedTopics?.length ?? paper.topics?.length ?? 0) - 1) * 2);
  return Math.max(0, Math.round(Number(paper.score ?? 0) + recency + evidence + officialCode + crossDomain));
}

function recommendationReasons(paper, repositories, asOf) {
  const reasons = [];
  if (daysBetween(asOf, paper.publishedAt) <= 2) reasons.push('近期发布');
  if ((paper.matchedTopics?.length ?? 0) >= 2) reasons.push('跨多个关注方向');
  if (repositories.some((link) => link.relation === 'official_code')) reasons.push('已发现官方代码证据');
  else if (repositories.length) reasons.push(`可关联 ${repositories.length} 个研究或工程项目`);
  if (Number(paper.score ?? 0) >= 25) reasons.push('与 ark.insight 关注方向高度相关');
  return reasons.length ? reasons : ['进入长期观察目录'];
}

function buildPaperItem(candidate, existing, review, context) {
  const seen = Boolean(candidate);
  const rawSource = candidate ?? existing;
  const originalPublishedAt = context.sourceDates?.[rawSource.id]?.originalPublishedAt ?? existing?.originalPublishedAt;
  const source = { ...rawSource, publishedAt: originalPublishedAt ?? rawSource.publishedAt,
    rssAnnouncedAt: Object.hasOwn(rawSource, 'rssAnnouncedAt') ? rawSource.rssAnnouncedAt : rawSource.publishedAt };
  const inferred = seen ? inferRepositoryLinks(source, context.projects) : [];
  const relatedRepositories = mergeRepositoryLinks(existing?.relatedRepositories, inferred);
  const previousMissingDate = existing?.lastMissingDate ?? null;
  const previousCheckDate = existing?.lastCheckedAt ? shanghaiDate(existing.lastCheckedAt) : null;
  const previousMissingRuns = Number(existing?.missingRuns ?? 0);
  const missingRuns = seen
    ? 0
    : previousMissingDate === context.asOf
      ? previousMissingRuns
      : !previousMissingDate && previousCheckDate === context.asOf
        ? Math.min(1, previousMissingRuns)
        : previousMissingRuns + 1;
  const availabilityStatus = seen ? 'active' : missingRuns > 3 ? 'needs_review' : 'monitoring';
  const queued = context.deepReadIds.has(source.id);
  const existingReviewStatus = existing?.reviewStatus === 'queued' && !queued
    ? 'discovered'
    : existing?.reviewStatus;
  const reviewStatus = review?.reviewStatus
    ?? (queued ? 'queued' : existingReviewStatus ?? 'discovered');
  const manualRequest = context.manualRequestById.get(source.id);
  const topics = source.matchedTopics ?? existing?.topics ?? [];
  const item = {
    id: source.id,
    arxivId: source.arxivId,
    source: source.source ?? 'arxiv',
    titleOriginal: source.titleOriginal,
    titleZh: review?.titleZh ?? existing?.titleZh ?? '',
    abstractOriginal: source.abstract ?? source.abstractOriginal ?? '',
    summaryZh: review?.summaryZh ?? existing?.summaryZh ?? '',
    authors: source.authors ?? [],
    categories: source.categories ?? [],
    publishedAt: context.sourceDates?.[source.id]?.originalPublishedAt ?? existing?.originalPublishedAt ?? source.publishedAt,
    originalPublishedAt: context.sourceDates?.[source.id]?.originalPublishedAt ?? existing?.originalPublishedAt ?? null,
    rssAnnouncedAt: source.rssAnnouncedAt,
    dateSemantics: context.sourceDates?.[source.id]?.originalPublishedAt || existing?.originalPublishedAt ? 'original_submission' : 'rss_announcement',
    url: source.url,
    pdfUrl: source.pdfUrl ?? null,
    licenseUrl: source.licenseUrl ?? null,
    score: Number(source.score ?? 0),
    heatScore: heatScore(source, context.asOf, relatedRepositories),
    reviewTier: source.reviewTier ?? existing?.reviewTier ?? 'watch',
    reviewStatus,
    readingLevel: review?.readingLevel ?? existing?.readingLevel ?? 'metadata',
    topics,
    targetBoards: source.targetBoards ?? existing?.targetBoards ?? ['Frontier Paper / Research'],
    reasonsZh: source.reasonsZh ?? existing?.reasonsZh ?? [],
    recommendationReasonsZh: recommendationReasons(source, relatedRepositories, context.asOf),
    keyContributionsZh: review?.keyContributionsZh ?? existing?.keyContributionsZh ?? [],
    industryValueZh: review?.industryValueZh ?? existing?.industryValueZh ?? '',
    limitationsZh: review?.limitationsZh ?? existing?.limitationsZh ?? '',
    futureOutlookZh: review?.futureOutlookZh ?? existing?.futureOutlookZh ?? '',
    relatedRepositories,
    firstSeenAt: existing?.firstSeenAt ?? context.generatedAt,
    lastSeenAt: seen ? context.generatedAt : existing?.lastSeenAt,
    lastCheckedAt: context.generatedAt,
    availabilityStatus,
    missingRuns,
    lastMissingDate: seen ? null : context.asOf,
    reviewPriority: reviewStatus === 'queued' ? (manualRequest ? 'immediate' : 'automatic') : null,
    reviewRequestedAt: manualRequest?.requestedAt ?? null,
    scheduledFor: reviewStatus === 'queued' ? (existing?.scheduledFor ?? context.asOf) : null,
    reviewedAt: review?.reviewedAt ?? existing?.reviewedAt ?? null,
  };
  return item;
}

export function buildTrendClusters(papers) {
  const groups = new Map();
  for (const paper of papers) {
    for (const topic of paper.topics ?? []) {
      const group = groups.get(topic.id) ?? { id: topic.id, labelZh: topic.labelZh, paperIds: [], repositories: new Set() };
      group.paperIds.push(paper.id);
      for (const link of paper.relatedRepositories ?? []) group.repositories.add(link.repo);
      groups.set(topic.id, group);
    }
  }
  return [...groups.values()]
    .filter((group) => group.paperIds.length >= 2)
    .map((group) => {
      const repositories = [...group.repositories];
      const evidenceLevel = repositories.length ? 'strong' : 'emerging';
      return {
        id: group.id,
        labelZh: group.labelZh,
        evidenceLevel,
        paperIds: group.paperIds,
        repositories,
        conclusionZh: repositories.length
          ? `${group.paperIds.length} 篇近期论文与 ${repositories.length} 个可追踪项目共同表明，“${group.labelZh}”已从研究议题进入可验证的工程阶段。`
          : `${group.paperIds.length} 篇近期论文集中指向“${group.labelZh}”，目前仍以研究证据为主，需等待代码与独立复现。`,
      };
    })
    .sort((left, right) => right.paperIds.length - left.paperIds.length || right.repositories.length - left.repositories.length)
    .slice(0, 12);
}

export function buildPaperCatalog({ latest, previous, githubLatest, reviews = {}, reviewRequests = [], sourceDates = {}, dailySelections = {}, generatedAt = new Date().toISOString() }) {
  const existingById = new Map((previous?.papers ?? []).map((paper) => [paper.id, paper]));
  const catalogCandidates = latest?.catalogCandidates ?? latest?.candidates ?? [];
  const latestById = new Map(catalogCandidates.map((paper) => [paper.id, paper]));
  const ids = unique([...existingById.keys(), ...latestById.keys()]);
  const knownIds = new Set(ids);
  const queueBudget = Number(latest?.budgets?.deepRead ?? 10);
  const alreadyReviewed = (id) => ['interpreted', 'verified'].includes(reviews[id]?.reviewStatus ?? existingById.get(id)?.reviewStatus);
  const manualRequests = reviewRequests
    .filter((request) => request?.status === 'queued' && knownIds.has(request.paperId) && !alreadyReviewed(request.paperId))
    .sort((left, right) => String(left.requestedAt).localeCompare(String(right.requestedAt)));
  const manualRequestById = new Map(manualRequests.map((request) => [request.paperId, request]));
  const manualQueueIds = unique(manualRequests.map((request) => request.paperId)).slice(0, queueBudget);
  const automaticCandidates = unique([
    ...(previous?.reviewQueue ?? []),
    ...(latest?.deepReadQueue ?? []),
    ...(latest?.candidates ?? []).filter((paper) => paper.reviewTier === 'deep').map((paper) => paper.id),
  ]).filter((id) => knownIds.has(id) && !manualRequestById.has(id) && !alreadyReviewed(id));
  const queueIds = [...manualQueueIds];
  const queueTopics = new Set(queueIds.map((id) => {
    const source = latestById.get(id) ?? existingById.get(id);
    return source?.matchedTopics?.[0]?.id ?? source?.topics?.[0]?.id ?? id;
  }));
  for (const id of automaticCandidates) {
    const source = latestById.get(id) ?? existingById.get(id);
    const topic = source?.matchedTopics?.[0]?.id ?? source?.topics?.[0]?.id ?? id;
    if (queueTopics.has(topic)) continue;
    queueTopics.add(topic);
    queueIds.push(id);
    if (queueIds.length >= queueBudget) break;
  }
  for (const id of automaticCandidates) {
    if (queueIds.length >= queueBudget) break;
    if (!queueIds.includes(id)) queueIds.push(id);
  }
  const context = {
    sourceDates,
    asOf: latest.asOf,
    generatedAt,
    projects: githubLatest?.projects ?? [],
    deepReadIds: new Set(queueIds),
    manualRequestById,
  };
  const papers = ids.map((id) => buildPaperItem(latestById.get(id), existingById.get(id), reviews[id], context))
    .sort((left, right) => right.heatScore - left.heatScore || String(right.publishedAt).localeCompare(String(left.publishedAt)));

  const queuedIds = new Set(papers.filter((paper) => paper.reviewStatus === 'queued').map((paper) => paper.id));
  const reviewQueue = queueIds.filter((id) => queuedIds.has(id));
  const priorityReviewQueue = reviewQueue.filter((id) => manualRequestById.has(id));
  let dailyRecommendations = papers
    .filter((paper) => ['interpreted', 'verified'].includes(paper.reviewStatus) && paper.titleZh && paper.summaryZh)
    .sort((left, right) => {
      const leftReviewedToday = String(left.reviewedAt ?? '').startsWith(latest.asOf) ? 1 : 0;
      const rightReviewedToday = String(right.reviewedAt ?? '').startsWith(latest.asOf) ? 1 : 0;
      return rightReviewedToday - leftReviewedToday || right.heatScore - left.heatScore;
    })
    .slice(0, 3)
    .map((paper) => paper.id);
  const selection = dailySelections[latest.asOf];
  if (selection) {
    if (!Array.isArray(selection.paperIds) || selection.paperIds.length < 1 || selection.paperIds.length > 3
      || new Set(selection.paperIds).size !== selection.paperIds.length
      || !selection.checkedAt || shanghaiDate(selection.checkedAt) !== latest.asOf
      || typeof selection.reason !== 'string' || selection.reason.trim().length < 6
      || selection.paperIds.some(id => {
        const paper = papers.find(p => p.id === id);
        return !paper || !paper.titleZh || !paper.summaryZh || !paper.limitationsZh
          || !['interpreted', 'verified'].includes(paper.reviewStatus)
          || !['abstract', 'fulltext'].includes(paper.readingLevel);
      })) throw new Error('Invalid current-day editorial paper selection; retain one to three actually interpreted catalog papers');
    dailyRecommendations = [...selection.paperIds];
  }
  const linkedRepositories = new Set(papers.flatMap((paper) => paper.relatedRepositories.map((link) => normalizedRepo(link.repo))));
  const trendClusters = buildTrendClusters(papers);

  return {
    schemaVersion: '1.0.0',
    generatedAt,
    asOf: latest.asOf,
    source: 'arXiv RSS + top-conference watch + verified GitHub relations',
    stats: {
      totalPapers: papers.length,
      activePapers: papers.filter((paper) => paper.availabilityStatus === 'active').length,
      monitoringPapers: papers.filter((paper) => paper.availabilityStatus === 'monitoring').length,
      needsReviewPapers: papers.filter((paper) => paper.availabilityStatus === 'needs_review').length,
      addedToday: papers.filter((paper) => shanghaiDate(paper.firstSeenAt) === latest.asOf).length,
      queuedPapers: papers.filter((paper) => paper.reviewStatus === 'queued').length,
      priorityQueuedPapers: priorityReviewQueue.length,
      interpretedPapers: papers.filter((paper) => ['interpreted', 'verified'].includes(paper.reviewStatus)).length,
      linkedPapers: papers.filter((paper) => paper.relatedRepositories.length > 0).length,
      linkedRepositories: linkedRepositories.size,
    },
    budgets: latest.budgets,
    reviewQueue,
    priorityReviewQueue,
    dailyRecommendations,
    ...(selection ? { dailyRecommendationSelection: { ...selection, runDate: latest.asOf } } : {}),
    trendClusters,
    sourcePlan: latest.sourcePlan,
    papers,
  };
}

function validateCatalog(catalog) {
  const errors = [];
  const ids = new Set();
  for (const paper of catalog.papers ?? []) {
    if (!paper.id || ids.has(paper.id)) errors.push(`invalid or duplicate paper ${paper.id ?? 'unknown'}`);
    ids.add(paper.id);
    if (!paper.url?.startsWith('https://arxiv.org/abs/')) errors.push(`invalid paper URL ${paper.id}`);
    if (!['discovered', 'queued', 'interpreted', 'verified'].includes(paper.reviewStatus)) errors.push(`invalid review status ${paper.id}`);
    if (!['active', 'monitoring', 'needs_review'].includes(paper.availabilityStatus)) errors.push(`invalid availability status ${paper.id}`);
    for (const link of paper.relatedRepositories ?? []) {
      if (!link.evidenceUrl?.startsWith('https://')) errors.push(`repository link without evidence ${paper.id} ${link.repo}`);
      if (link.relation === 'official_code' && link.confidence !== 'high') errors.push(`official code must have high confidence ${paper.id} ${link.repo}`);
    }
  }
  for (const id of [...(catalog.reviewQueue ?? []), ...(catalog.dailyRecommendations ?? [])]) {
    if (!ids.has(id)) errors.push(`catalog reference is missing ${id}`);
  }
  return errors;
}

async function writeAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporary, path);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const [latest, previous, githubLatest, reviewFile, reviewRequestFile, sourceDateFile] = await Promise.all([
    readJson(latestPath),
    readJson(catalogPath, { papers: [] }),
    readJson(githubPath, { projects: [] }),
    readJson(reviewPath, { reviews: {} }),
    readJson(reviewRequestsPath, { requests: [] }),
    readJson(resolve(root, 'data/dev/paper-source-dates.json'), { papers: {} }),
  ]);
  if (!latest) throw new Error('data/dev/ai-papers-latest.json is missing');
  const catalog = buildPaperCatalog({
    latest,
    previous,
    githubLatest,
    reviews: reviewFile?.reviews ?? {},
    reviewRequests: reviewRequestFile?.requests ?? [],
    sourceDates: sourceDateFile?.papers ?? {},
    dailySelections: reviewFile?.dailySelections ?? {},
  });
  const errors = validateCatalog(catalog);
  if (errors.length) throw new Error(`Paper catalog validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  const githubCandidates = [...new Map(catalog.papers.flatMap((paper) => paper.relatedRepositories
    .filter((link) => link.relation === 'official_code')
    .map((link) => [normalizedRepo(link.repo), {
      repo: link.repo,
      url: link.url,
      paperId: paper.id,
      paperUrl: paper.url,
      evidenceUrl: link.evidenceUrl,
      reasonZh: `论文《${paper.titleZh || paper.titleOriginal}》明确给出的代码仓库`,
    }]))).values()];
  const githubBridge = { schemaVersion: '1.0.0', generatedAt: catalog.generatedAt, asOf: catalog.asOf, candidates: githubCandidates };
  if (!dryRun) {
    await writeAtomic(catalogPath, catalog);
    await writeAtomic(githubBridgePath, githubBridge);
  }
  console.log(JSON.stringify({ asOf: catalog.asOf, stats: catalog.stats, reviewQueue: catalog.reviewQueue, dailyRecommendations: catalog.dailyRecommendations, paperGithubCandidates: githubCandidates.length, output: dryRun ? null : catalogPath }, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import './network-fetch.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const latestPath = resolve(root, 'data/dev/github-radar-latest.json');
const watchlistPath = resolve(root, 'github-industry-watchlist.json');

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(resolve(root, path), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function renameWithRetry(source, destination, attempts = 8) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await rename(source, destination);
      return;
    } catch (error) {
      lastError = error;
      if (!['EPERM', 'EBUSY', 'EACCES'].includes(error?.code) || attempt === attempts) throw error;
      await delay(attempt * 100);
    }
  }
  throw lastError;
}

function shanghaiDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function projectId(repo) {
  return repo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function sameRepo(left, right) {
  return String(left ?? '').toLowerCase() === String(right ?? '').toLowerCase();
}

export function metadataIsFreshForDate(project, asOf) {
  const fetchedAt = project?.metadataFetchedAt;
  if (!fetchedAt || Number.isNaN(Date.parse(fetchedAt))) return false;
  return shanghaiDate(new Date(fetchedAt)) === asOf;
}

export function isDelistedTrackingRecord(record) {
  return record?.trackingStatus === 'delisted' && /^\d{4}-\d{2}-\d{2}$/.test(record?.delistedAt ?? '');
}

export function isConfirmedRepositoryDelisting(error) {
  return /GitHub page HTTP (?:404|410)(?:\s|$)/.test(String(error?.message ?? error));
}

export function cumulativeStarsDelta(previous, stars, reportId) {
  const previousStars = Number(previous?.stars);
  const increment = Number.isFinite(previousStars) ? Math.max(0, stars - previousStars) : 0;
  if (previous?.sourceReportId !== reportId) return increment;
  return Math.max(0, Number(previous?.starsDelta) || 0) + increment;
}

export function updateTrendCandidateFromProject(candidate, project) {
  const reasons = (candidate?.hotReasons ?? [])
    .filter((reason) => !String(reason).startsWith('本地快照新增 Stars'));
  if (isDelistedTrackingRecord(project)) {
    return {
      ...candidate,
      repo: project.repo,
      url: project.url,
      name: project.name,
      totalStars: project.stars,
      forks: project.forks,
      pushedAt: project.lastActivity || candidate?.pushedAt || null,
      observedDelta: 0,
      tracked: false,
      curatedIndustry: true,
      trackingStatus: 'delisted',
      delistedAt: project.delistedAt,
      license: project.license,
      aiReviewStatus: 'observe',
      intakeRecommendation: 'delisted',
      hotLevel: 'watch',
      hotReasons: [`已下架 ${project.delistedAt}`, ...reasons.filter((reason) => !String(reason).startsWith('已下架'))].slice(0, 6),
    };
  }
  if (project.starsDelta > 0) reasons.push(`本地快照新增 Stars ${project.starsDelta}`);
  return {
    ...candidate,
    repo: project.repo,
    url: project.url,
    name: project.name,
    totalStars: project.stars,
    forks: project.forks,
    pushedAt: project.lastActivity || candidate?.pushedAt || null,
    observedDelta: Math.max(Number(candidate?.observedDelta) || 0, project.starsDelta),
    tracked: true,
    curatedIndustry: true,
    license: project.license,
    aiReviewStatus: project.intakeDecision === 'approved' ? 'approved' : project.intakeDecision ?? 'observe',
    intakeRecommendation: 'tracked',
    hotReasons: reasons.slice(0, 6),
  };
}

export function dedupeTrendCandidates(candidates) {
  const byRepo = new Map();
  const mergeUnique = (left, right, key) => {
    const seen = new Set();
    return [...(left ?? []), ...(right ?? [])].filter((item) => {
      const identity = key(item);
      if (seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
  };
  for (const candidate of candidates) {
    const identity = String(candidate.repo ?? '').toLowerCase();
    const previous = byRepo.get(identity);
    if (!previous) {
      byRepo.set(identity, candidate);
      continue;
    }
    const preferred = Number(candidate.hotScore ?? 0) > Number(previous.hotScore ?? 0) ? candidate : previous;
    const secondary = preferred === candidate ? previous : candidate;
    byRepo.set(identity, {
      ...secondary,
      ...preferred,
      sourceSignals: mergeUnique(previous.sourceSignals, candidate.sourceSignals, (item) => item.id),
      hotReasons: mergeUnique(previous.hotReasons, candidate.hotReasons, (item) => item),
      priorityDomains: mergeUnique(previous.priorityDomains, candidate.priorityDomains, (item) => item.id),
      observedDelta: Math.max(Number(previous.observedDelta) || 0, Number(candidate.observedDelta) || 0),
      totalStars: Math.max(Number(previous.totalStars) || 0, Number(candidate.totalStars) || 0),
      forks: Math.max(Number(previous.forks) || 0, Number(candidate.forks) || 0),
      tracked: Boolean(previous.tracked || candidate.tracked),
      curatedIndustry: Boolean(previous.curatedIndustry || candidate.curatedIndustry),
      forcedByAI: Boolean(previous.forcedByAI || candidate.forcedByAI),
    });
  }
  return [...byRepo.values()];
}

export function dedupeProjectsByRepo(projects) {
  const seenRepos = new Set();
  return projects.filter((project) => {
    const identity = String(project.repo ?? project.id ?? '').toLowerCase();
    if (seenRepos.has(identity)) return false;
    seenRepos.add(identity);
    return true;
  });
}

export function applyCandidateReviewDecision(candidate, decision) {
  return {
    ...candidate,
    aiReviewStatus: decision,
    intakeRecommendation: decision === 'approved' ? 'tracked' : decision,
  };
}

export function buildTrackedSeeds(curatedSeeds, projects) {
  const normalizedCuratedSeeds = curatedSeeds.map((seed) => {
    const stableId = projectId(seed.repo);
    const historicalAliases = projects
      .filter((project) => project.id === stableId && !sameRepo(project.repo, seed.repo))
      .map((project) => project.repo);
    return {
      ...seed,
      aliases: [...new Set([...(seed.aliases ?? []), ...historicalAliases])],
    };
  });
  const representedRepos = new Set(normalizedCuratedSeeds.flatMap((seed) =>
    [seed.repo, ...(seed.aliases ?? [])].map((repo) => repo.toLowerCase())));
  const implicitSeeds = projects
    .filter((project) => !representedRepos.has(String(project.repo ?? '').toLowerCase()))
    .map((project) => ({
      repo: project.repo,
      name: project.name,
      category: project.category,
      level: project.level,
      license: project.license,
      priorityDomains: project.priorityDomains ?? ['tracked'],
      summary: project.summary,
      riskNote: project.riskNote,
      trackingStatus: project.trackingStatus,
      delistedAt: project.delistedAt,
      delistedReason: project.delistedReason,
      industryFit: project.industryFit ?? 'medium',
      intakeDecision: project.intakeDecision ?? 'approved',
      decisionReason: project.decisionReason ?? 'Existing approved project retained from the formal tracked inventory.',
    }));
  return [...normalizedCuratedSeeds, ...implicitSeeds];
}

export function selectTrackedSeedsForRefresh(trackedSeeds, projects, trends, asOf, rotationSize = 25) {
  const projectByRepo = new Map(projects.map((project) => [String(project.repo ?? '').toLowerCase(), project]));
  const mandatoryRepos = new Set((trends?.candidates ?? [])
    .filter((candidate) => candidate.tracked && (
      candidate.hotLevel === 'surging'
      || candidate.hotLevel === 'hot'
      || candidate.forcedByAI
    ))
    .map((candidate) => String(candidate.repo ?? '').toLowerCase()));

  const mandatory = [];
  const rotationPool = [];
  for (const seed of trackedSeeds) {
    const acceptedRepos = [seed.repo, ...(seed.aliases ?? [])].map((repo) => repo.toLowerCase());
    const project = acceptedRepos.map((repo) => projectByRepo.get(repo)).find(Boolean);
    if (isDelistedTrackingRecord(seed) || isDelistedTrackingRecord(project)) continue;
    if (acceptedRepos.some((repo) => mandatoryRepos.has(repo))) {
      mandatory.push(seed);
    } else if (!metadataIsFreshForDate(project, asOf)) {
      rotationPool.push({ seed, fetchedAt: Date.parse(project?.metadataFetchedAt ?? '') || 0 });
    }
  }
  rotationPool.sort((left, right) => left.fetchedAt - right.fetchedAt || left.seed.repo.localeCompare(right.seed.repo));
  return [...mandatory, ...rotationPool.slice(0, rotationSize).map((item) => item.seed)];
}

function levelChange(previous, current) {
  if (!previous) return `new tracked ${current}`;
  return previous.level === current ? `stays ${current}` : `${previous.level} to ${current}`;
}

async function fetchRepository(repo) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'wagmi-daily-industry-watchlist',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers,
    signal: AbortSignal.timeout(25_000),
  });
  if (response.ok) return { ...(await response.json()), metadata_source: 'github-api' };
  // A newly published public repository can briefly return 404 from the API
  // while its canonical GitHub page is already available. Use the same
  // official-page fallback as rate-limited responses before declaring the
  // daily metadata refresh incomplete.
  if (![403, 404, 429].includes(response.status)) throw new Error(`${repo}: GitHub HTTP ${response.status}`);

  const pageResponse = await fetch(`https://github.com/${repo}`, {
    headers: { 'User-Agent': 'wagmi-daily-industry-watchlist' },
    signal: AbortSignal.timeout(25_000),
  });
  if (!pageResponse.ok) throw new Error(`${repo}: GitHub page HTTP ${pageResponse.status}`);
  return parseGithubRepositoryPage(repo, await pageResponse.text());
}

export function parseGithubRepositoryPage(repo, html) {
  // GitHub's React repository page moved the precise counters into JSON.
  // A missing counter is a parse failure, never evidence of zero stars.
  let about;
  for (const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
    try { const value = JSON.parse(match[1]); if (value.payload?.sidebarAbout) about = value.payload.sidebarAbout; } catch { /* non-JSON script */ }
  }
  const parseCounter = (id, structured) => {
    if (Number.isSafeInteger(structured) && structured >= 0) return structured;
    const tag = [...html.matchAll(/<[^>]+>/g)].map(match => match[0]).find(tag => tag.includes(`id="${id}"`));
    const value = tag?.match(/title="([\d,]+)"/)?.[1];
    if (value === undefined) throw new Error(`${repo}: GitHub HTML metadata counter ${id} missing`);
    return Number(value.replaceAll(',', ''));
  };
  const canonicalRepo = about?.ownerLogin && about?.repoName ? `${about.ownerLogin}/${about.repoName}` : repo;
  return {
    full_name: canonicalRepo,
    html_url: `https://github.com/${canonicalRepo}`,
    stargazers_count: parseCounter('repo-stars-counter-star', about?.stargazerCount),
    forks_count: parseCounter('repo-network-counter', about?.forksCount),
    pushed_at: null,
    archived: about?.repo?.isArchived ?? /This repository has been archived/i.test(html),
    fork: about?.repo?.isFork ?? /forked from <a/i.test(html),
    license: null,
    metadata_source: 'github-html',
  };
}

export function resolveRepositoryPolicy(seed, metadata) {
  const approvedOfficialFork = seed.officialFork === true;
  return {
    originality: approvedOfficialFork
      ? 'official_derivative_repository'
      : metadata.fork
        ? 'fork_requires_manual_review'
        : 'official_or_original_repository',
    intakeDecision: seed.intakeDecision
      ?? (metadata.archived || (metadata.fork && !approvedOfficialFork) ? 'observe' : 'approved'),
    requiresWarning: Boolean(metadata.archived || (metadata.fork && !approvedOfficialFork)),
  };
}

function buildProject(seed, metadata, previous, reportId, baseline = previous) {
  const stars = Number(metadata.stargazers_count ?? previous?.stars ?? 0);
  const forks = Number(metadata.forks_count ?? previous?.forks ?? 0);
  const starsDelta = cumulativeStarsDelta(baseline, stars, reportId);
  const lastActivity = String(metadata.pushed_at ?? previous?.lastActivity ?? '').slice(0, 10);
  const license = metadata.license?.spdx_id ?? seed.license ?? previous?.license ?? 'NOASSERTION';
  const policy = resolveRepositoryPolicy(seed, metadata);
  return {
    id: previous?.id ?? projectId(metadata.full_name ?? seed.repo),
    name: seed.name,
    repo: metadata.full_name ?? seed.repo,
    repoAliases: [...new Set([seed.repo, ...(seed.aliases ?? []), ...(previous?.repoAliases ?? [])])].filter(repo => !sameRepo(repo, metadata.full_name ?? seed.repo)),
    url: metadata.html_url ?? `https://github.com/${seed.repo}`,
    category: seed.category,
    stars,
    forks,
    starsDelta,
    starsDeltaWindowStart: baseline?.sourceReportId === reportId ? baseline?.starsDeltaWindowStart ?? null : baseline?.sourceReportId?.replace(/^github-/, '') ?? null,
    starsDeltaWindowEnd: reportId.replace(/^github-/, ''),
    starsDeltaSemantics: 'local_snapshot_change',
    level: seed.level,
    levelChange: levelChange(previous, seed.level),
    verification: 'verified',
    lastActivity,
    summary: seed.summary,
    riskNote: seed.riskNote,
    sourceReportId: reportId,
    industryFit: 'high',
    priorityDomains: seed.priorityDomains,
    originality: policy.originality,
    maintenanceEvidence: `GitHub push ${lastActivity || 'unknown'}; ${stars.toLocaleString('en-US')} Stars; ${forks.toLocaleString('en-US')} forks; license ${license}`,
    intakeDecision: policy.intakeDecision,
    decisionReason: seed.decisionReason,
    license,
    trackingStatus: 'active',
    delistedAt: null,
    delistedReason: null,
    availabilityCheckedAt: metadata.metadata_source === 'cache'
      ? previous?.availabilityCheckedAt ?? previous?.metadataFetchedAt ?? null
      : new Date().toISOString(),
    metadataFetchedAt: metadata.metadata_source === 'cache'
      ? previous?.metadataFetchedAt ?? null
      : new Date().toISOString(),
  };
}

export function buildDelistedProject(seed, previous, trendCandidate, reportId, asOf, checkedAt = new Date().toISOString()) {
  const delistedAt = previous?.delistedAt ?? seed.delistedAt ?? asOf;
  const stars = Number(previous?.stars ?? trendCandidate?.totalStars ?? 0);
  const forks = Number(previous?.forks ?? trendCandidate?.forks ?? 0);
  const lastActivity = String(previous?.lastActivity ?? trendCandidate?.pushedAt ?? '').slice(0, 10);
  const license = previous?.license ?? trendCandidate?.license ?? seed.license ?? 'NOASSERTION';
  return {
    id: previous?.id ?? projectId(seed.repo),
    name: seed.name ?? previous?.name ?? trendCandidate?.name ?? seed.repo.split('/')[1],
    repo: seed.repo,
    url: previous?.url ?? trendCandidate?.url ?? `https://github.com/${seed.repo}`,
    category: seed.category ?? previous?.category ?? '历史项目',
    stars,
    forks,
    starsDelta: 0,
    level: seed.level ?? previous?.level ?? 'B',
    levelChange: previous?.levelChange ?? levelChange(previous, seed.level ?? previous?.level ?? 'B'),
    verification: previous?.verification ?? 'verified',
    lastActivity,
    summary: seed.summary ?? previous?.summary ?? trendCandidate?.description ?? '',
    riskNote: seed.riskNote ?? previous?.riskNote ?? '官方仓库已不可访问，保留最后一次可用记录。',
    sourceReportId: reportId,
    industryFit: previous?.industryFit ?? seed.industryFit ?? 'high',
    priorityDomains: seed.priorityDomains ?? previous?.priorityDomains ?? [],
    originality: previous?.originality ?? 'official_or_original_repository',
    maintenanceEvidence: `已于 ${delistedAt} 确认官方仓库下架或转为私有；保留最后可用元数据：${lastActivity || '无活动日期'}，${stars.toLocaleString('en-US')} Stars，${forks.toLocaleString('en-US')} forks，license ${license}`,
    intakeDecision: previous?.intakeDecision ?? seed.intakeDecision ?? 'approved',
    decisionReason: seed.decisionReason ?? previous?.decisionReason ?? '保留历史收录结论。',
    license,
    trackingStatus: 'delisted',
    delistedAt,
    delistedReason: 'GitHub 官方仓库页面返回 HTTP 404/410',
    availabilityCheckedAt: checkedAt,
    metadataFetchedAt: previous?.metadataFetchedAt ?? null,
  };
}

function validateWatchlist(watchlist) {
  const errors = [];
  const repos = new Set();
  for (const item of watchlist?.repositories ?? []) {
    if (!/^[\w.-]+\/[\w.-]+$/.test(item.repo ?? '')) errors.push(`invalid repo ${item.repo ?? 'unknown'}`);
    if (repos.has(item.repo.toLowerCase())) errors.push(`duplicate repo ${item.repo}`);
    repos.add(item.repo.toLowerCase());
    for (const field of ['name', 'category', 'level', 'summary', 'riskNote', 'decisionReason']) {
      if (!item[field]) errors.push(`${item.repo ?? 'unknown'} is missing ${field}`);
    }
    if (!Array.isArray(item.priorityDomains) || item.priorityDomains.length === 0) errors.push(`${item.repo ?? 'unknown'} has no priorityDomains`);
    if (item.trackingStatus && !['active', 'delisted'].includes(item.trackingStatus)) errors.push(`${item.repo ?? 'unknown'} has invalid trackingStatus`);
    if (item.trackingStatus === 'delisted' && !/^\d{4}-\d{2}-\d{2}$/.test(item.delistedAt ?? '')) errors.push(`${item.repo ?? 'unknown'} has invalid delistedAt`);
  }
  return errors;
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function updateReport(report, projects, destinationPath = null) {
  const sourcePath = resolve(root, report.path.replace(/^\//, ''));
  const path = destinationPath ?? sourcePath;
  let existing = '';
  try {
    existing = await readFile(sourcePath, 'utf8');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    existing = `# ${report.title}\n\n`;
  }
  const marker = '## 行业重点收录';
  const groups = Map.groupBy(projects, (project) => project.category);
  const delistedCount = projects.filter(isDelistedTrackingRecord).length;
  const lines = [`\n${marker}\n`, `保留 ${projects.length} 个正式项目记录，其中 ${projects.length - delistedCount} 个处于活跃跟踪，${delistedCount} 个已下架并保留历史信息。热度只用于排序，不是收录门槛。\n`];
  for (const [category, entries] of groups) {
    lines.push(`### ${category}\n`);
    for (const project of entries) {
      const status = isDelistedTrackingRecord(project) ? `（已下架：${project.delistedAt}，保留历史记录）` : '';
      lines.push(`- [${project.name}](${project.url})${status}：${project.decisionReason}`);
    }
    lines.push('');
  }
  await mkdir(dirname(path), { recursive: true });
  const base = existing.includes(marker) ? existing.slice(0, existing.indexOf(marker)).trimEnd() : existing.trimEnd();
  const content = `${base}\n${lines.join('\n')}\n`;
  await writeFile(path, content, 'utf8');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const refreshAll = process.argv.includes('--refresh-all');
  const rebaseFromMain = process.argv.includes('--rebase-from-main');
  if (rebaseFromMain && !refreshAll) throw new Error('--rebase-from-main requires --refresh-all');
  const reportOnly = process.argv.includes('--report-only');
  const publicFromMain = process.argv.includes('--public-from-main');
  const repoArg = process.argv.find((item) => item.startsWith('--repo='));
  const scopedRepo = repoArg?.slice('--repo='.length).trim().toLowerCase() || null;
  const [watchlist, latest, mainSnapshot, trends] = await Promise.all([
    readJson('github-industry-watchlist.json', { repositories: [] }),
    readJson('data/dev/github-radar-latest.json', {}),
    readJson('data/main/index.json', {}),
    readJson('data/dev/github-trend-candidates.json', { candidates: [] }),
  ]);
  const errors = validateWatchlist(watchlist);
  if (errors.length) throw new Error(errors.join('; '));
  const trackedSeeds = buildTrackedSeeds(watchlist.repositories, latest.projects ?? []);
  const activeTrackedSeeds = trackedSeeds.filter((seed) => {
    const acceptedRepos = [seed.repo, ...(seed.aliases ?? [])];
    const previous = (latest.projects ?? []).find((project) => acceptedRepos.some((repo) => sameRepo(repo, project.repo)));
    return !isDelistedTrackingRecord(seed) && !isDelistedTrackingRecord(previous);
  });
  const selectedSeeds = scopedRepo
    ? trackedSeeds.filter((seed) =>
        [seed.repo, ...(seed.aliases ?? [])].some((repo) => sameRepo(repo, scopedRepo)))
    : refreshAll
      ? activeTrackedSeeds
      : selectTrackedSeedsForRefresh(activeTrackedSeeds, latest.projects ?? [], trends, shanghaiDate());
  if (scopedRepo && selectedSeeds.length === 0) {
    throw new Error(`${scopedRepo} is not present in github-industry-watchlist.json`);
  }

  const asOf = shanghaiDate();
  const report = latest.report?.date === asOf ? latest.report : {
    id: `github-${asOf}`,
    title: `GitHub Radar ${asOf}`,
    date: asOf,
    channel: 'github',
    format: 'markdown',
    path: `/reports/github-radar-${asOf}.md`,
  };
  if (publicFromMain) {
    const mainReport = (mainSnapshot.reports ?? [])
      .filter((item) => item.channel === 'github')
      .sort((left, right) => right.date.localeCompare(left.date))[0];
    if (!mainReport) throw new Error('Main GitHub report is missing');
    const projects = mainSnapshot.projects ?? [];
    await Promise.all([
      updateReport(mainReport, projects, resolve(root, 'public', mainReport.path.replace(/^\//, ''))),
      updateReport(mainReport, projects, resolve(root, 'dist/client', mainReport.path.replace(/^\//, ''))),
    ]);
    console.log(`Public GitHub report restored from main: ${projects.length} priority projects.`);
    return;
  }
  if (reportOnly) {
    const projects = latest.projects ?? [];
    await updateReport(report, projects);
    console.log(`GitHub industry report refreshed: ${projects.length} priority projects.`);
    return;
  }
  const previousProjects = [...(mainSnapshot.projects ?? []), ...(latest.projects ?? [])];
  const failures = [];
  const policyWarnings = [];
  const delistedRepositories = [];
  const reactivatedRepositories = [];
  let reusedCount = 0;
  let htmlFallbackCount = 0;
  const industryProjects = (await mapWithConcurrency(selectedSeeds, 5, async (seed) => {
    const acceptedRepos = [seed.repo, ...(seed.aliases ?? [])];
    const previous = [...previousProjects].reverse().find((project) =>
      acceptedRepos.some((repo) => sameRepo(project.repo, repo)));
    const baseline = rebaseFromMain ? [...(mainSnapshot.projects ?? [])].reverse().find(project => acceptedRepos.some(repo => sameRepo(project.repo, repo))) ?? null : previous;
    const trendCandidate = trends.candidates.find((candidate) =>
      acceptedRepos.some((repo) => sameRepo(candidate.repo, repo)));
    if (!refreshAll && !scopedRepo && previous && metadataIsFreshForDate(previous, asOf)) {
      reusedCount += 1;
      return buildProject(seed, {
        full_name: previous.repo,
        html_url: previous.url ?? `https://github.com/${previous.repo}`,
        stargazers_count: previous.stars,
        forks_count: previous.forks,
        pushed_at: previous.lastActivity,
        archived: false,
        fork: false,
        license: { spdx_id: previous.license ?? 'NOASSERTION' },
        metadata_source: 'cache',
      }, previous, report.id);
    }
    try {
      const metadata = await fetchRepository(seed.repo);
      if (isDelistedTrackingRecord(seed) || isDelistedTrackingRecord(previous)) reactivatedRepositories.push(seed.repo);
      if (metadata.metadata_source === 'github-html') htmlFallbackCount += 1;
      if (resolveRepositoryPolicy(seed, metadata).requiresWarning) {
        policyWarnings.push(`${seed.repo} is ${metadata.archived ? 'archived' : 'an unapproved fork'}`);
      }
      return buildProject(seed, metadata, previous, report.id, baseline);
    } catch (error) {
      if (isConfirmedRepositoryDelisting(error)) {
        const project = buildDelistedProject(seed, previous, trendCandidate, report.id, asOf);
        delistedRepositories.push({ repo: seed.repo, delistedAt: project.delistedAt, reason: project.delistedReason });
        return project;
      }
      failures.push(error instanceof Error ? error.message : String(error));
      if (!previous && !trendCandidate) throw error;
      return buildProject(seed, {
        full_name: seed.repo,
        html_url: `https://github.com/${seed.repo}`,
        stargazers_count: previous?.stars ?? trendCandidate?.totalStars ?? 0,
        forks_count: previous?.forks ?? trendCandidate?.forks ?? 0,
        pushed_at: previous?.lastActivity ?? trendCandidate?.pushedAt ?? null,
        archived: trendCandidate?.archived ?? false,
        fork: trendCandidate?.fork ?? false,
        license: { spdx_id: previous?.license ?? trendCandidate?.license ?? seed.license ?? 'NOASSERTION' },
        metadata_source: previous ? 'cache' : 'trend-candidate',
      }, previous, report.id);
    }
  })).filter(Boolean);

  const processedRepos = new Set(selectedSeeds.flatMap((seed) =>
    [seed.repo, ...(seed.aliases ?? [])].map((repo) => repo.toLowerCase())));
  const otherProjects = (latest.projects ?? [])
    .filter((project) => !processedRepos.has(project.repo.toLowerCase()))
    .map((project) => ({
      ...project,
      verification: String(project.verification).startsWith('related_official') ? 'related_official' : 'verified',
      sourceReportId: report.id,
    }));
  const mergedProjects = [...industryProjects, ...otherProjects];
  // GitHub can canonicalize a renamed repository to a new full_name while an
  // older record still carries a different internal id. The repository path,
  // not that historical id, is the stable uniqueness boundary for snapshots.
  const uniqueProjects = dedupeProjectsByRepo(mergedProjects);
  const snapshot = {
    ...latest,
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    asOf,
    projects: uniqueProjects,
    report,
    run: {
      ...(latest.run ?? {}),
      id: 'wagmi-github',
      channel: 'github',
      status: failures.length || policyWarnings.length ? 'warning' : 'success',
      schedule: '每天 07:30',
      // This sync is only an intermediate stage of the daily radar batch.
      // The final review owns lastSuccess because upstream AI readiness and
      // mandatory verification can still turn an otherwise clean sync into a
      // warning run.
      lastSuccess: latest.run?.lastSuccess ?? null,
      artifact: report.path,
      message: `已同步 ${industryProjects.length} 个行业重点仓库；本轮刷新 ${industryProjects.length - reusedCount} 项，复用 ${reusedCount} 项当日缓存${htmlFallbackCount ? `，${htmlFallbackCount} 项通过 GitHub 官方页面核验` : ''}${failures.length ? `，${failures.length} 项沿用上次元数据` : ''}。`,
      refreshSummary: {
        asOf,
        selected: selectedSeeds.length,
        refreshed: industryProjects.length - reusedCount,
        reused: reusedCount,
        failures: failures.length,
      },
    },
  };
  const refreshedByRepo = new Map();
  for (const project of industryProjects) {
    const seed = selectedSeeds.find((item) =>
      [item.repo, ...(item.aliases ?? [])].some((repo) => sameRepo(repo, project.repo)));
    for (const repo of [project.repo, seed?.repo, ...(seed?.aliases ?? [])].filter(Boolean)) {
      refreshedByRepo.set(repo.toLowerCase(), project);
    }
  }
  const nextTrends = {
    ...trends,
    generatedAt: new Date().toISOString(),
    candidates: dedupeTrendCandidates((trends.candidates ?? []).map((candidate) => {
      const project = refreshedByRepo.get(candidate.repo.toLowerCase());
      return project ? updateTrendCandidateFromProject(candidate, project) : candidate;
    })),
  };
  const reportProjects = snapshot.projects;
  snapshot.run.message = `正式跟踪 ${reportProjects.length} 个仓库；本轮选择 ${selectedSeeds.length} 项，其中刷新 ${industryProjects.length - reusedCount} 项、复用 ${reusedCount} 项当日缓存${trackedSeeds.length > watchlist.repositories.length ? `；${trackedSeeds.length - watchlist.repositories.length} 项来自既有正式清单的兼容刷新` : ''}${htmlFallbackCount ? `；${htmlFallbackCount} 项通过 GitHub 官方页面核验` : ''}${failures.length ? `；${failures.length} 项沿用上次元数据` : ''}${policyWarnings.length ? `；${policyWarnings.length} 项存在归档或分支策略警告` : ''}。高热与 AI 强制项目优先，其余项目按最旧元数据轮换。`;
  const nextWatchlist = {
    ...watchlist,
    repositories: (watchlist.repositories ?? []).map((seed) => {
      const delisted = delistedRepositories.find((item) => sameRepo(item.repo, seed.repo));
      if (delisted) return { ...seed, trackingStatus: 'delisted', delistedAt: seed.delistedAt ?? delisted.delistedAt, delistedReason: delisted.reason };
      if (reactivatedRepositories.some((repo) => sameRepo(repo, seed.repo))) {
        const { trackingStatus, delistedAt, delistedReason, ...activeSeed } = seed;
        return activeSeed;
      }
      return seed;
    }),
  };
  if (delistedRepositories.length) snapshot.run.message += ` ${delistedRepositories.length} 个官方仓库已下架，历史记录保留且不阻断本批次。`;
  if (reactivatedRepositories.length) snapshot.run.message += ` ${reactivatedRepositories.length} 个历史下架仓库已恢复公开跟踪。`;

  if (dryRun) {
    console.log(JSON.stringify({ counts: { refreshed: industryProjects.length, industry: reportProjects.length, total: snapshot.projects.length }, failures, projects: industryProjects }, null, 2));
    return;
  }
  await mkdir(dirname(latestPath), { recursive: true });
  const temporaryPath = `${latestPath}.tmp`;
  const trendsPath = resolve(root, 'data/dev/github-trend-candidates.json');
  const trendsTemporaryPath = `${trendsPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await writeFile(trendsTemporaryPath, `${JSON.stringify(nextTrends, null, 2)}\n`, 'utf8');
  await renameWithRetry(temporaryPath, latestPath);
  await renameWithRetry(trendsTemporaryPath, trendsPath);
  if (JSON.stringify(nextWatchlist) !== JSON.stringify(watchlist)) {
    const watchlistTemporaryPath = `${watchlistPath}.tmp`;
    await writeFile(watchlistTemporaryPath, `${JSON.stringify(nextWatchlist, null, 2)}\n`, 'utf8');
    await renameWithRetry(watchlistTemporaryPath, watchlistPath);
  }
  await updateReport(report, reportProjects);
  console.log(`GitHub tracked inventory synced: ${reportProjects.length} tracked projects.`);
  if (scopedRepo) console.log(`Targeted refresh completed for ${selectedSeeds[0].repo}.`);
  if (reusedCount) console.log(`Reused ${reusedCount} same-day metadata records.`);
  if (htmlFallbackCount) console.log(`Used official GitHub page fallback for ${htmlFallbackCount} repositories.`);
  for (const failure of failures) console.warn(`Warning: ${failure}`);
  for (const warning of policyWarnings) console.warn(`Warning: ${warning}`);
  for (const item of delistedRepositories) console.log(`Delisted: ${item.repo} (${item.delistedAt}); historical record retained.`);
}

const executedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executedDirectly) main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import './network-fetch.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(root, 'data/dev/github-trend-candidates.json');
const aiKeywords = /\b(ai|llm|agentic?|copilot|model|inference|rag|embedding|vision|multimodal|diffusion|robotics?|mcp|prompt|autonomous)\b|人工智能|大模型|智能体|世界模型|具身|生成式/i;
const listLikePattern = /(^|[\s/_-])(awesome|roadmap|interview|books?|tutorials?|resources?|cheatsheet|compendium|dictionary|guide)([\s/_-]|$)/i;
const copyLikePattern = /\b(clone|replica|copy|copied|self[- ]?study|coursework|assignment|tutorial project|landing page|webpage|starter template|boilerplate)\b|仿制|复刻|课程作业|练习项目/i;
const hotLevelOrder = { surging: 0, hot: 1, watch: 2 };
const intakePriorityOrder = { P0: 0, P1: 1, P2: 2 };
const priorityDomainRules = [
  { id: 'architecture-aec', label: '建筑设计 / AEC', pattern: /\b(aec|architectural design|building architecture|building design|bim|revit|ifc|floor[- ]?plans?|parametric building|computational architecture)\b|建筑设计|建筑生成|楼层平面/i },
  { id: 'interior-design', label: '室内设计', pattern: /\b(interiors?|interior design|room design|room layout|space planning|furniture layout)\b|室内设计|空间设计|家装设计/i },
  { id: '3dgs', label: '3DGS / Gaussian Splatting', pattern: /\b(3dgs|4dgs|gaussian splatting|gaussian splats?)\b|高斯泼溅|高斯溅射/i },
  { id: '3d', label: '3D / 三维生成', pattern: /\b(3d|text[- ]?to[- ]?3d|image[- ]?to[- ]?3d|mesh generation|point clouds?|nerf|novel view synthesis|3d reconstruction|world model)\b|三维生成|三维重建|世界模型/i },
  { id: 'simulation', label: '物理一致 / SimReady', pattern: /\b(sim[- ]?ready|simulation[- ]?ready|physics[- ]?(?:aware|guided|based|grounded)|physically (?:consistent|stable|plausible|interactable)|collision[- ]?free|rigid[- ]?bod(?:y|ies)|isaac sim|support relation|scene graph)\b|物理一致|仿真就绪|碰撞修正|支撑关系|重力沉降/i },
  { id: 'physical-ai', label: 'WAIC 物理 AI', pattern: /\b(physical[- ]ai|embodied[- ]ai|embodied[- ]intelligence|generalist[- ]robot|robot[- ]foundation[- ]model|robotic[- ]manipulation|robot[- ]navigation|humanoid[- ]robot|vision[- ]language[- ]action|vla)\b|物理 AI|具身 AI|具身智能|机器人基础模型|机器人操作|机器人导航/i },
  { id: 'robot-simulation', label: '机器人仿真 / Sim2Real', pattern: /\b(robot(?:ics)?[- ]simulation|sim[- ]?to[- ]?real|sim2real|synthetic[- ]robot(?:ics)?[- ]data|physics[- ]simulation|robot[- ]learning[- ]environment|digital[- ]twin(?:s)?|mujoco|isaac[- ]lab|maniskill|habitat[- ]sim|omnigibson)\b|机器人仿真|合成机器人数据|数字孪生/i },
  { id: 'robot-learning', label: '机器人学习 / 控制', pattern: /\b(robot[- ]learning|robot[- ]policy|robot[- ]control|diffusion[- ]policy|imitation[- ]learning|reinforcement[- ]learning[- ]for[- ]robot|dexterous[- ]grasp|locomotion|whole[- ]body[- ]control)\b|机器人学习|机器人策略|机器人控制|灵巧抓取|运动控制/i },
  { id: 'design-tools', label: 'AI 设计工具', pattern: /\b(generative design|computational design|design agent|design automation|design system|ui design|ux design|graphic design|product design|cad|computer[- ]?aided design)\b|生成式设计|设计智能体|设计自动化/i },
  { id: 'image-generation', label: '生成式图像模型', pattern: /\b(text[- ]?to[- ]?image|image generation|image editing|image[- ]?to[- ]?image|multimodal generation|diffusion model|flow matching|native multimodal generation)\b|图像生成|文生图|图像编辑|生成式图像|原生多模态生成/i },
  { id: 'open-model', label: '最新开放模型', pattern: /\b(open[- ]?(?:source|weight) models?|model weights?|foundation model|model checkpoint|hugging ?face|transformers?)\b|开源模型|开放权重|模型权重/i },
  { id: 'video-intelligence', label: '视频算法 / 理解', pattern: /\b(video (?:understanding|segmentation|tracking|recognition|analytics?|reasoning|representation)|action recognition|temporal grounding|video foundation model|video[- ]language model|optical flow|motion tracking|object tracking)\b|视频理解|视频分割|视频跟踪|动作识别|时序定位|视频算法/i },
  { id: 'video-generation', label: '视频生成模型', pattern: /\b(text[- ]?to[- ]?video|image[- ]?to[- ]?video|video generation|video diffusion|video foundation model|generative video|world video model)\b|视频生成|文生视频|图生视频|生成式视频|视频基础模型/i },
  { id: 'video-editing', label: '视频生成 / 自动剪辑', pattern: /\b(video (?:editing|generation|production|montage|retouching|inpainting|compositing)|automatic video edit(?:ing)?|agentic video|instruction[- ]guided video edit(?:ing)?|text[- ]to[- ]video|image[- ]to[- ]video|timeline editing)\b|视频编辑|自动剪辑|智能剪辑|视频生成|视频制作|视频合成/i },
  { id: 'virtual-production', label: '视频 3D 舞台 / 虚拟制作', pattern: /\b(virtual production|virtual stage|video reshooting|video[- ]to[- ]3d|video[- ]to[- ]4d|4d reconstruction|4d point clouds?|camera[- ]guided video|novel[- ]view video|novel camera|camera trajectory|dynamic scene reconstruction|rgba video|alpha video)\b|虚拟制作|虚拟舞台|视频重拍|视频三维|视频 3D|动态场景重建|新视角视频/i },
  { id: 'web-data', label: '网页采集与检索', pattern: /\b(web[- ]?(?:scraping|crawler|crawling|search)|ai[- ]?(?:scraping|crawler|search)|data extraction|html[- ]to[- ]markdown|structured web data)\b|网页采集|网页抓取|网页检索|结构化网页数据/i },
  { id: 'browser-automation', label: '浏览器执行', pattern: /\b(browser[- ]?(?:automation|agent|execution)|headless browser|playwright mcp|computer use)\b|浏览器自动化|浏览器智能体|浏览器执行/i },
  { id: 'deep-research', label: '深度研究', pattern: /\b(deep[- ]?research|research agent|autonomous research|web research)\b|深度研究|研究智能体|自动研究/i },
  { id: 'document-processing', label: '文档解析与转换', pattern: /\b(pdf (?:parser|parsing|extraction|classification)|document (?:parser|parsing|extraction|understanding)|ocr routing|pdf[- ]to[- ]markdown|document[- ]to[- ]markdown|table extraction)\b|PDF 解析|文档解析|文档转换|OCR 路由|表格提取/i },
];

const sourceWeights = {
  'github-trending-24h-all': 45,
  'github-trending-24h-python': 35,
  'github-trending-24h-typescript': 35,
  'github-trending-weekly-all': 22,
  'ossinsight-24h-all': 45,
  'ossinsight-24h-python': 35,
  'ossinsight-24h-typescript': 35,
  'ossinsight-weekly-all': 22,
  'github-ai-active': 18,
  'github-llm-active': 18,
  'github-agent-active': 20,
  'github-ai-new': 30,
  'github-aec-design-active': 48,
  'github-interior-design-active': 48,
  'github-3d-active': 46,
  'github-3d-generation-active': 48,
  'github-3dgs-active': 50,
  'github-simready-active': 52,
  'github-open-model-new': 45,
  'github-image-generation-active': 52,
  'github-video-intelligence-active': 50,
  'github-video-generation-active': 54,
  'github-video-editing-active': 52,
  'github-video-3d-stage-active': 54,
  'github-video-2026-new': 48,
  'github-web-data-active': 52,
  'github-browser-automation-active': 50,
  'github-deep-research-active': 48,
  'github-document-processing-active': 50,
  'github-physical-ai-active': 56,
  'github-vla-robotics-active': 56,
  'github-robot-simulation-active': 54,
  'industry-watchlist': 55,
  'ai-daily-forced': 50,
  'ai-weekly-forced': 35,
  'paper-official-code': 55,
  tracked: 5,
};

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(resolve(root, path), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
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

function dateMinus(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

function ageInDays(value, referenceDate) {
  if (!value) return Number.POSITIVE_INFINITY;
  const left = Date.parse(String(value));
  const right = Date.parse(`${referenceDate}T23:59:59Z`);
  return Number.isFinite(left) ? Math.max(0, Math.floor((right - left) / 86_400_000)) : Number.POSITIVE_INFINITY;
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function normalizeRepo(value) {
  const text = String(value ?? '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/[?#].*$/, '').replace(/\/$/, '');
  const match = text.match(/^([\w.-]+)\/([\w.-]+)$/);
  return match ? `${match[1]}/${match[2]}` : '';
}

function sourceSignal(id, details = {}) {
  return { id, weight: sourceWeights[id] ?? 0, ...details };
}

function mergeSignals(left = [], right = []) {
  const byId = new Map();
  for (const signal of [...left, ...right]) {
    const current = byId.get(signal.id);
    if (!current || (signal.rank ?? Number.POSITIVE_INFINITY) < (current.rank ?? Number.POSITIVE_INFINITY)) byId.set(signal.id, signal);
  }
  return [...byId.values()].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
}

export function mergeCandidate(left, right) {
  if (!left) return { ...right, sourceSignals: mergeSignals([], right.sourceSignals) };
  return {
    ...left,
    ...Object.fromEntries(Object.entries(right).filter(([, value]) => value !== null && value !== undefined && value !== '')),
    repo: left.repo,
    description: right.description || left.description || '',
    topics: [...new Set([...(left.topics ?? []), ...(right.topics ?? [])])],
    sourceSignals: mergeSignals(left.sourceSignals, right.sourceSignals),
    forcedByAI: Boolean(left.forcedByAI || right.forcedByAI),
    tracked: Boolean(left.tracked || right.tracked),
    fork: Boolean(left.fork || right.fork),
    periodStars24h: Math.max(left.periodStars24h ?? 0, right.periodStars24h ?? 0),
    periodStarsWeekly: Math.max(left.periodStarsWeekly ?? 0, right.periodStarsWeekly ?? 0),
    activityScore24h: Math.max(left.activityScore24h ?? 0, right.activityScore24h ?? 0),
    activityScoreWeekly: Math.max(left.activityScoreWeekly ?? 0, right.activityScoreWeekly ?? 0),
    pushes24h: Math.max(left.pushes24h ?? 0, right.pushes24h ?? 0),
    pullRequests24h: Math.max(left.pullRequests24h ?? 0, right.pullRequests24h ?? 0),
  };
}

function ossInsightRecord(row, sourceId, rank, period) {
  const repo = normalizeRepo(row.repo_name);
  if (!repo) return null;
  const daily = period === 'past_24_hours';
  return {
    repo,
    url: `https://github.com/${repo}`,
    name: repo.split('/')[1],
    description: String(row.description ?? '').replace(/^"|"$/g, ''),
    language: row.primary_language || null,
    periodStars24h: daily ? finiteNumber(row.stars) ?? 0 : 0,
    periodStarsWeekly: daily ? 0 : finiteNumber(row.stars) ?? 0,
    activityScore24h: daily ? finiteNumber(row.total_score) ?? 0 : 0,
    activityScoreWeekly: daily ? 0 : finiteNumber(row.total_score) ?? 0,
    pushes24h: daily ? finiteNumber(row.pushes) ?? 0 : 0,
    pullRequests24h: daily ? finiteNumber(row.pull_requests) ?? 0 : 0,
    sourceSignals: [sourceSignal(sourceId, { rank, period })],
  };
}

function githubSearchRecord(item, sourceId, rank) {
  const repo = normalizeRepo(item.full_name);
  if (!repo) return null;
  return {
    repo,
    url: item.html_url ?? `https://github.com/${repo}`,
    name: item.name ?? repo.split('/')[1],
    description: item.description ?? '',
    language: item.language ?? null,
    topics: item.topics ?? [],
    totalStars: finiteNumber(item.stargazers_count),
    forks: finiteNumber(item.forks_count),
    openIssues: finiteNumber(item.open_issues_count),
    createdAt: item.created_at ?? null,
    pushedAt: item.pushed_at ?? item.updated_at ?? null,
    archived: Boolean(item.archived),
    fork: Boolean(item.fork),
    license: item.license?.spdx_id ?? null,
    sourceSignals: [sourceSignal(sourceId, { rank })],
  };
}

function trackedRecord(project) {
  const repo = normalizeRepo(project.repo ?? project.url);
  if (!repo) return null;
  return {
    repo,
    url: project.url ?? `https://github.com/${repo}`,
    name: project.name ?? repo.split('/')[1],
    description: project.summary ?? '',
    totalStars: finiteNumber(project.stars),
    forks: finiteNumber(project.forks),
    pushedAt: project.lastActivity ?? null,
    tracked: project.trackingStatus !== 'delisted',
    trackingStatus: project.trackingStatus ?? 'active',
    delistedAt: project.delistedAt ?? null,
    sourceSignals: [sourceSignal('tracked')],
  };
}

function industryWatchlistRecord(project) {
  const repo = normalizeRepo(project.repo);
  if (!repo) return null;
  return {
    repo,
    url: `https://github.com/${repo}`,
    name: project.name ?? repo.split('/')[1],
    description: [project.summary, project.decisionReason].filter(Boolean).join(' '),
    topics: project.priorityDomains ?? [],
    tracked: project.trackingStatus !== 'delisted',
    trackingStatus: project.trackingStatus ?? 'active',
    delistedAt: project.delistedAt ?? null,
    curatedIndustry: true,
    sourceSignals: [sourceSignal('industry-watchlist')],
  };
}

function forcedRecord(repo, sourceId) {
  return {
    repo,
    url: `https://github.com/${repo}`,
    name: repo.split('/')[1],
    forcedByAI: true,
    sourceSignals: [sourceSignal(sourceId)],
  };
}

function aiRelevant(candidate) {
  const haystack = [candidate.repo, candidate.name, candidate.description, ...(candidate.topics ?? [])].filter(Boolean).join(' ');
  return aiKeywords.test(haystack);
}

export function priorityDomainsFor(candidate) {
  const haystack = [candidate.repo, candidate.name, candidate.description, ...(candidate.topics ?? [])].filter(Boolean).join(' ');
  return priorityDomainRules.filter((rule) => rule.pattern.test(haystack)).map((rule) => ({ id: rule.id, label: rule.label }));
}

function isListLike(candidate) {
  return listLikePattern.test(`${candidate.repo} ${candidate.description ?? ''}`);
}

export function scoreCandidate(candidate, previous = null, asOf = shanghaiDate()) {
  const sourceScore = (candidate.sourceSignals ?? []).reduce((total, signal) => total + (signal.weight ?? sourceWeights[signal.id] ?? 0), 0);
  const previousStars = finiteNumber(previous?.totalStars);
  const totalStars = finiteNumber(candidate.totalStars);
  const observedDelta = totalStars !== null && previousStars !== null ? Math.max(0, totalStars - previousStars) : null;
  const createdAge = ageInDays(candidate.createdAt, asOf);
  const pushedAge = ageInDays(candidate.pushedAt, asOf);
  const sourceCount = new Set((candidate.sourceSignals ?? []).map((signal) => signal.id)).size;
  const qualityPenalty = candidate.archived ? 100 : isListLike(candidate) && !candidate.forcedByAI ? 25 : 0;
  const score = sourceScore
    + Math.min(candidate.periodStars24h ?? 0, 120) * 0.6
    + Math.min(Math.sqrt(candidate.activityScore24h ?? 0) * 1.8, 35)
    + Math.min(observedDelta ?? 0, 120) * 0.5
    + Math.max(0, sourceCount - 1) * 8
    + (createdAge <= 30 ? 15 : 0)
    + (pushedAge <= 7 ? 10 : pushedAge <= 30 ? 4 : 0)
    + (candidate.description ? 3 : 0)
    - qualityPenalty;
  return {
    ...candidate,
    observedDelta,
    createdAgeDays: Number.isFinite(createdAge) ? createdAge : null,
    pushedAgeDays: Number.isFinite(pushedAge) ? pushedAge : null,
    hotScore: Math.max(0, Math.round(score * 10) / 10),
  };
}

export function classifyHotLevel(candidate) {
  const newAndFast = (candidate.createdAgeDays ?? Number.POSITIVE_INFINITY) <= 30 && (candidate.totalStars ?? 0) >= 500;
  const signals = candidate.sourceSignals ?? [];
  const rankFor = (id) => signals.find((signal) => signal.id === id)?.rank ?? Number.POSITIVE_INFINITY;
  const allRank = Math.min(rankFor('ossinsight-24h-all'), rankFor('github-trending-24h-all'));
  const languageRank = Math.min(rankFor('ossinsight-24h-python'), rankFor('ossinsight-24h-typescript'), rankFor('github-trending-24h-python'), rankFor('github-trending-24h-typescript'));
  const githubRank = Math.min(
    rankFor('github-ai-active'),
    rankFor('github-llm-active'),
    rankFor('github-agent-active'),
    rankFor('github-ai-new'),
    rankFor('github-image-generation-active'),
    rankFor('github-video-generation-active'),
    rankFor('github-web-data-active'),
    rankFor('github-browser-automation-active'),
    rankFor('github-deep-research-active'),
    rankFor('github-document-processing-active'),
  );
  const hasExternalTrend = signals.some((signal) => signal.id.startsWith('ossinsight-') || signal.id.startsWith('github-'));
  if (allRank <= 5
    || (candidate.periodStars24h ?? 0) >= 50
    || (candidate.observedDelta ?? 0) >= 100
    || newAndFast) return 'surging';
  if (allRank <= 20
    || languageRank <= 5
    || (candidate.periodStars24h ?? 0) >= 15
    || (candidate.observedDelta ?? 0) >= 20
    || (githubRank <= 10 && (candidate.pushedAgeDays ?? Number.POSITIVE_INFINITY) <= 7)
    || (candidate.forcedByAI && hasExternalTrend && candidate.hotScore >= 90)) return 'hot';
  return 'watch';
}

function intakeAssessment(candidate) {
  const priorityDomains = priorityDomainsFor(candidate);
  const relevant = aiRelevant(candidate) || priorityDomains.length > 0;
  const sourceCount = new Set((candidate.sourceSignals ?? []).map((signal) => signal.id)).size;
  const descriptionLength = String(candidate.description ?? '').trim().length;
  const lowInformation = !candidate.tracked
    && !candidate.forcedByAI
    && priorityDomains.length > 0
    && (candidate.totalStars ?? 0) < 5
    && sourceCount < 2
    && descriptionLength < 40
    && (!candidate.license || (candidate.topics ?? []).length === 0);
  const qualityRisks = [
    ...(candidate.archived ? ['archived'] : []),
    ...(candidate.fork ? ['fork'] : []),
    ...(isListLike(candidate) ? ['list_or_resource_collection'] : []),
    ...(copyLikePattern.test(`${candidate.repo} ${candidate.description ?? ''}`) ? ['copy_or_coursework'] : []),
    ...(lowInformation ? ['low_information_unverified'] : []),
  ];
  const qualityGate = qualityRisks.length === 0;
  const intakePriority = priorityDomains.length > 0 ? 'P0' : candidate.forcedByAI || relevant ? 'P1' : 'P2';
  const intakeRecommendation = qualityGate
    ? priorityDomains.length > 0 ? 'priority_ai_review' : candidate.forcedByAI ? 'required_ai_review' : relevant ? 'standard_ai_review' : 'out_of_scope'
    : 'reject_unless_originality_verified';
  return {
    aiRelevant: aiRelevant(candidate),
    industryRelevant: relevant,
    priorityDomains,
    intakePriority,
    heatRequiredForIntake: false,
    qualityGate,
    qualityRisks,
    intakeRecommendation,
    aiReviewStatus: 'pending',
  };
}

function hotReasons(candidate) {
  const reasons = [];
  if (candidate.priorityDomains?.length) reasons.push(`行业优先：${candidate.priorityDomains.map((item) => item.label).join('、')}`);
  if ((candidate.periodStars24h ?? 0) > 0) reasons.push(`${candidate.sourceSignals?.some(signal => signal.id.startsWith('github-trending-')) ? 'GitHub Trending 当日' : 'OSS Insight 24h'}新增关注 ${candidate.periodStars24h}`);
  if ((candidate.activityScore24h ?? 0) > 0) reasons.push(`24h 活跃分 ${Math.round(candidate.activityScore24h)}`);
  if ((candidate.observedDelta ?? 0) > 0) reasons.push(`本地快照新增 Stars ${candidate.observedDelta}`);
  if ((candidate.createdAgeDays ?? Number.POSITIVE_INFINITY) <= 30) reasons.push(`新仓库 ${candidate.createdAgeDays} 天`);
  if ((candidate.pushedAgeDays ?? Number.POSITIVE_INFINITY) <= 7) reasons.push(`最近 ${candidate.pushedAgeDays} 天有推送`);
  if (candidate.forcedByAI) reasons.push('AI 日报/周报强制候选');
  if ((candidate.sourceSignals ?? []).length >= 2) reasons.push(`跨 ${candidate.sourceSignals.length} 个来源命中`);
  return reasons.slice(0, 4);
}

export function collectForcedCandidates(aiLatest, weeklyLatest, candidates, paperGithubCandidates) {
  const resolved = [];
  const unresolved = [];
  const add = (value, sourceId) => {
    const text = String(value ?? '').trim();
    const githubUrl = text.match(/https:\/\/github\.com\/[^/\s|]+\/[^\s|?#]+/i)?.[0];
    const verifiedPrefix = text.match(/^\s*([^|]+?)\s*\|\s*verified\b/i)?.[1];
    const repo = normalizeRepo(value) || normalizeRepo(githubUrl) || normalizeRepo(verifiedPrefix);
    if (repo) resolved.push(forcedRecord(repo, sourceId));
    else if (text) unresolved.push({ name: text, source: sourceId });
  };
  for (const event of aiLatest?.aiEvents ?? []) for (const value of event.repoCandidates ?? []) add(value, 'ai-daily-forced');
  for (const candidate of aiLatest?.candidates ?? []) add(candidate.name, 'ai-daily-forced');
  for (const value of weeklyLatest?.projectCandidates ?? []) {
    const text = String(value ?? '');
    if (/https:\/\/github\.com\//i.test(text)) add(text, 'ai-weekly-forced');
    else if (/\bpending\b|repo URL 待核验/i.test(text)) unresolved.push({ name: text, source: 'ai-weekly-forced' });
  }
  for (const candidate of candidates ?? []) add(candidate.name, 'ai-daily-forced');
  const dailyPaperIds = new Set((aiLatest?.aiEvents ?? [])
    .filter((event) => event.contentKind === 'paper')
    .map((event) => String(event.paper?.paperUrl ?? '').match(/arxiv\.org\/abs\/(\d{4})\.(\d{4,5})/i))
    .filter(Boolean)
    .map((match) => 'arxiv-' + match[1] + '-' + match[2]));
  for (const candidate of paperGithubCandidates?.candidates ?? []) {
    if (dailyPaperIds.has(candidate.paperId)) add(candidate.repo ?? candidate.url, 'paper-official-code');
  }
  return {
    resolved,
    unresolved: [...new Map(unresolved.map((item) => [`${item.source}:${item.name}`, item])).values()],
  };
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(25_000) });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    error.retryAfter = response.headers.get('retry-after');
    error.rateLimitReset = response.headers.get('x-ratelimit-reset');
    error.rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    error.detail = (await response.text()).slice(0, 500);
    throw error;
  }
  return response.json();
}

export function githubRetryDelayMs(error, now = Date.now()) {
  if (![403, 429].includes(Number(error?.status))) return 0;
  const retryAfter = Number(error?.retryAfter);
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(90_000, retryAfter * 1000 + 1_000);
  const resetAt = Number(error?.rateLimitReset) * 1000;
  const delay = resetAt - now + 1_500;
  return Number.isFinite(delay) && delay > 0 && delay <= 90_000 ? delay : 0;
}

export function ossInsightUnavailable(payload) {
  return payload?.data_quality?.status === 'unavailable' ? payload.data_quality : null;
}

function htmlText(value) {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}

export function parseGithubTrending(html, sourceId, period) {
  const articles = [...html.matchAll(/<article\b[^>]*class="[^"]*Box-row[^"]*"[^>]*>([\s\S]*?)<\/article>/g)];
  return articles.map(([_, article], index) => {
    const heading = article.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? '';
    const repo = normalizeRepo(heading.match(/href="\/([^"?#]+)"/)?.[1]);
    if (!repo) return null;
    const count = suffix => {
      const escaped = repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const anchor = article.match(new RegExp(`<a\\b[^>]*href="/${escaped}/${suffix}"[^>]*>([\\s\\S]*?)</a>`));
      return anchor ? Number(htmlText(anchor[1]).replace(/,/g, '')) : null;
    };
    const velocity = Number((htmlText(article).match(/([\d,]+) stars (?:today|this week)/)?.[1] ?? '0').replace(/,/g, ''));
    return { repo, url: `https://github.com/${repo}`, name: repo.split('/')[1],
      description: htmlText(article.match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? ''),
      language: htmlText(article.match(/itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\//)?.[1] ?? '') || null,
      totalStars: count('stargazers'), forks: count('forks'),
      periodStars24h: period === 'past_24_hours' ? velocity : 0,
      periodStarsWeekly: period === 'past_week' ? velocity : 0,
      sourceSignals: [sourceSignal(sourceId, { rank: index + 1, period, metric: period === 'past_week' ? 'github_trending_stars_this_week' : 'github_trending_stars_today' })] };
  }).filter(Boolean);
}

async function fetchOssInsight(source, sourceStatus) {
  const id = source.id.replace('ossinsight-', 'github-trending-');
  const officialUrl = new URL('https://github.com/trending' + (source.language === 'All' ? '' : '/' + source.language.toLowerCase()));
  officialUrl.searchParams.set('since', source.period === 'past_week' ? 'weekly' : 'daily');
  let officialRows = [];
  try {
    const response = await fetch(officialUrl, { signal: AbortSignal.timeout(25_000), headers: { 'User-Agent': 'wagmi-daily-trend-discovery' } });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    officialRows = parseGithubTrending(await response.text(), id, source.period);
    if (!officialRows.length) throw new Error('GitHub Trending contains no parseable repository rows');
    sourceStatus.push({ id, status: 'success', count: officialRows.length, url: officialUrl.href,
      checkedAt: new Date().toISOString(), role: 'required', period: source.period });
  } catch (error) {
    sourceStatus.push({ id, status: 'failed', count: 0, url: officialUrl.href,
      checkedAt: new Date().toISOString(), role: 'required', period: source.period, error: error.message });
  }
  const url = new URL('https://api.ossinsight.io/v1/trends/repos/');
  url.searchParams.set('period', source.period);
  url.searchParams.set('language', source.language);
  try {
    const payload = await fetchJson(url, { Accept: 'application/json' });
    const unavailable = ossInsightUnavailable(payload);
    if (unavailable) throw Object.assign(new Error(unavailable.reason), { dataQuality: unavailable });
    const rows = payload?.data?.rows ?? [];
    sourceStatus.push({ id: source.id, status: 'success', count: rows.length, url: url.href,
      checkedAt: new Date().toISOString(), role: 'optional', period: source.period });
    return [...officialRows, ...rows.map((row, index) => ossInsightRecord(row, source.id, index + 1, source.period)).filter(Boolean)];
  } catch (error) {
    sourceStatus.push({ id: source.id, status: error.dataQuality ? 'unavailable' : 'failed', count: 0,
      url: url.href, checkedAt: new Date().toISOString(), role: 'optional',
      error: error.message, dataQuality: error.dataQuality ?? null });
    return officialRows;
  }
}

async function fetchGithubSearch(source, sourceStatus) {
  const url = new URL('https://api.github.com/search/repositories');
  url.searchParams.set('q', source.query);
  url.searchParams.set('sort', 'stars');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('per_page', '50');
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'wagmi-daily-trend-discovery',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  let lastError;
  let attempts = 0;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    attempts = attempt;
    try {
      const payload = await fetchJson(url, headers);
      const items = payload?.items ?? [];
      sourceStatus.push({ id: source.id, status: 'success', count: items.length, attempts: attempt });
      return items.map((item, index) => githubSearchRecord(item, source.id, index + 1)).filter(Boolean);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : 'request failed';
      // Rate-limit replies sometimes omit reset/retry headers. A bounded full
      // search window retry is preferable to repeatedly publishing partial data.
      const retryDelay = githubRetryDelayMs(error) || ([403, 429].includes(error.status) ? 65_000 : 0);
      if (attempt < 3 && retryDelay > 0) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, retryDelay));
        continue;
      }
      if (attempt === 3 || /HTTP (403|422|429)/.test(message)) break;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 800));
    }
  }
  sourceStatus.push({
    id: source.id,
    status: 'failed',
    count: 0,
    attempts,
    error: lastError instanceof Error ? lastError.message : 'request failed',
    detail: lastError?.detail,
    retryAfter: lastError?.retryAfter,
    rateLimitReset: lastError?.rateLimitReset,
    rateLimitRemaining: lastError?.rateLimitRemaining,
  });
  return [];
}

async function fetchGithubSources(sources, sourceStatus) {
  const groups = [];
  for (let index = 0; index < sources.length; index += 1) {
    groups.push(await fetchGithubSearch(sources[index], sourceStatus));
    if (index < sources.length - 1) {
      // Anonymous GitHub Search allows only 10 requests per minute. Spacing
      // requests prevents the second half of the source list from racing into
      // the same rate-limit window and leaving a false partial snapshot.
      await new Promise((resolveDelay) => setTimeout(resolveDelay, process.env.GITHUB_TOKEN ? 2_500 : 8_000));
    }
  }
  return groups;
}

export function validateTrendSnapshot(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['github trend snapshot is missing'];
  if (payload.schemaVersion !== '1.0.0') errors.push('github trend schemaVersion must be 1.0.0');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.asOf ?? '')) errors.push('github trend asOf is invalid');
  if (!Array.isArray(payload.sourceStatus) || payload.sourceStatus.length === 0) errors.push('github trend sourceStatus is missing');
  if (!Array.isArray(payload.candidates)) errors.push('github trend candidates must be an array');
  for (const candidate of payload.candidates ?? []) {
    if (!normalizeRepo(candidate.repo)) errors.push(`github trend candidate ${candidate.repo ?? 'unknown'} has invalid repo`);
    if (!['surging', 'hot', 'watch'].includes(candidate.hotLevel)) errors.push(`github trend candidate ${candidate.repo ?? 'unknown'} has invalid hotLevel`);
    if (!Number.isFinite(candidate.hotScore)) errors.push(`github trend candidate ${candidate.repo ?? 'unknown'} has invalid hotScore`);
    if (!Array.isArray(candidate.sourceSignals) || candidate.sourceSignals.length === 0) errors.push(`github trend candidate ${candidate.repo ?? 'unknown'} has no source signals`);
  }
  return errors;
}

export function buildTrendSnapshot({ asOf, records, previousSnapshot, sourceStatus, unresolvedAiCandidates, repoAliases = new Map() }) {
  const canonicalize = (candidate) => {
    const canonicalRepo = repoAliases.get(candidate.repo.toLowerCase());
    return canonicalRepo
      ? { ...candidate, repo: canonicalRepo, url: `https://github.com/${canonicalRepo}` }
      : candidate;
  };
  const merged = new Map();
  for (const rawRecord of records.filter(Boolean)) {
    const record = canonicalize(rawRecord);
    merged.set(record.repo.toLowerCase(), mergeCandidate(merged.get(record.repo.toLowerCase()), record));
  }
  const previousByRepo = new Map();
  for (const rawCandidate of previousSnapshot?.candidates ?? []) {
    const candidate = canonicalize(rawCandidate);
    const key = candidate.repo.toLowerCase();
    const previous = previousByRepo.get(key);
    if (!previous
      || hotLevelOrder[candidate.hotLevel] < hotLevelOrder[previous.hotLevel]
      || (candidate.hotLevel === previous.hotLevel && (candidate.hotScore ?? 0) > (previous.hotScore ?? 0))) {
      previousByRepo.set(key, candidate);
    }
  }
  const preserveSameDayPeak = previousSnapshot?.asOf === asOf;
  const scored = [...merged.values()].map((candidate) => {
    const previous = previousByRepo.get(candidate.repo.toLowerCase());
    const withScore = scoreCandidate(candidate, previous, asOf);
    const assessment = intakeAssessment(withScore);
    const current = {
      ...withScore,
      ...assessment,
      hotLevel: classifyHotLevel(withScore),
      hotReasons: hotReasons({ ...withScore, ...assessment }),
    };
    if (!preserveSameDayPeak || !previous || hotLevelOrder[previous.hotLevel] >= hotLevelOrder[current.hotLevel]) return current;
    return {
      ...current,
      observedDelta: Math.max(current.observedDelta ?? 0, previous.observedDelta ?? 0),
      hotScore: Math.max(current.hotScore, previous.hotScore ?? 0),
      hotLevel: previous.hotLevel,
      hotReasons: previous.hotReasons ?? current.hotReasons,
    };
  });
  const hotReviewLimit = 24;
  const prequalified = scored.filter((candidate) => candidate.tracked || candidate.forcedByAI || (candidate.industryRelevant && candidate.qualityGate));
  const retainedHot = new Set(prequalified
    .filter((candidate) => candidate.hotLevel === 'hot')
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, hotReviewLimit)
    .map((candidate) => candidate.repo.toLowerCase()));
  const ranked = prequalified.map((candidate) => candidate.hotLevel === 'hot' && !retainedHot.has(candidate.repo.toLowerCase())
    ? { ...candidate, hotLevel: 'watch', hotReasons: [...candidate.hotReasons, '超过每日热门复核上限，进入轮换观察'].slice(0, 4) }
    : candidate);
  const eligible = ranked;
  const mandatory = eligible.filter((candidate) => candidate.tracked || candidate.forcedByAI);
  const discoveries = eligible
    .filter((candidate) => !candidate.tracked && !candidate.forcedByAI)
    .sort((a, b) => intakePriorityOrder[a.intakePriority] - intakePriorityOrder[b.intakePriority]
      || hotLevelOrder[a.hotLevel] - hotLevelOrder[b.hotLevel]
      || b.hotScore - a.hotScore)
    .slice(0, 100);
  const candidates = [...new Map([...mandatory, ...discoveries].map((candidate) => [candidate.repo.toLowerCase(), candidate])).values()]
    .sort((a, b) => intakePriorityOrder[a.intakePriority] - intakePriorityOrder[b.intakePriority]
      || hotLevelOrder[a.hotLevel] - hotLevelOrder[b.hotLevel]
      || b.hotScore - a.hotScore
      || a.repo.localeCompare(b.repo));
  return {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    asOf,
    methodology: {
      discovery: ['Official GitHub Trending daily/weekly (required); OSS Insight quality-checked auxiliary signals', 'GitHub repository search', 'AI daily/weekly forced intake', 'tracked inventory', 'curated industry watchlist'],
      verification: 'GitHub connector/MCP and official repository metadata',
      ranking: ['P0 industry fit', 'AI intake review', '24h stars/activity', 'observed star delta', 'cross-source hits', 'repository recency/activity', 'originality and quality risks'],
      intakePolicy: 'Heat affects review order only. Industry fit, originality, maintenance and usefulness determine intake.',
      limits: { discoveryCandidates: 100, hotReviewCandidates: hotReviewLimit, githubSearchPerQuery: 50 },
    },
    sourceStatus,
    counts: {
      raw: records.length,
      merged: merged.size,
      eligible: eligible.length,
      publishedCandidates: candidates.length,
      surging: candidates.filter((candidate) => candidate.hotLevel === 'surging').length,
      hot: candidates.filter((candidate) => candidate.hotLevel === 'hot').length,
      priorityIndustry: candidates.filter((candidate) => candidate.intakePriority === 'P0').length,
    },
    unresolvedAiCandidates,
    candidates,
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const retryFailed = process.argv.includes('--retry-failed');
  const asOf = shanghaiDate();
  const [main, githubLatest, aiLatest, weeklyLatest, candidates, paperGithubCandidates, previousSnapshot, industryWatchlist] = await Promise.all([
    readJson('data/main/index.json', {}),
    readJson('data/dev/github-radar-latest.json', {}),
    readJson('data/dev/ai-events-latest.json', {}),
    readJson('data/dev/ai-weekly-latest.json', {}),
    readJson('data/dev/candidates.json', []),
    readJson('data/dev/paper-github-candidates.json', { candidates: [] }),
    readJson('data/dev/github-trend-candidates.json', {}),
    readJson('github-industry-watchlist.json', { repositories: [] }),
  ]);
  const sourceStatus = [];
  const activeSince = dateMinus(asOf, 7);
  const industryActiveSince = dateMinus(asOf, 45);
  const newSince = dateMinus(asOf, 30);
  const ossSources = [
    { id: 'ossinsight-24h-all', period: 'past_24_hours', language: 'All' },
    { id: 'ossinsight-24h-python', period: 'past_24_hours', language: 'Python' },
    { id: 'ossinsight-24h-typescript', period: 'past_24_hours', language: 'TypeScript' },
    { id: 'ossinsight-weekly-all', period: 'past_week', language: 'All' },
  ];
  const githubSources = [
    { id: 'github-ai-active', query: `topic:artificial-intelligence pushed:>=${activeSince} stars:>=50 archived:false` },
    { id: 'github-agent-active', query: `topic:ai-agent pushed:>=${activeSince} stars:>=20 archived:false` },
    { id: 'github-ai-new', query: `created:>=${newSince} artificial-intelligence in:name,description stars:>=20 archived:false` },
    { id: 'github-aec-design-active', query: `topic:bim pushed:>=${industryActiveSince} stars:>=1 archived:false fork:false` },
    { id: 'github-interior-design-active', query: `"interior design" in:name,description,readme pushed:>=${industryActiveSince} stars:>=1 archived:false fork:false` },
    { id: 'github-3d-active', query: `"3D reconstruction" in:name,description,readme pushed:>=${industryActiveSince} stars:>=1 archived:false fork:false` },
    { id: 'github-3d-generation-active', query: `topic:3d-generation pushed:>=${industryActiveSince} stars:>=1 archived:false fork:false` },
    { id: 'github-3dgs-active', query: `topic:gaussian-splatting pushed:>=${industryActiveSince} stars:>=1 archived:false fork:false` },
    { id: 'github-simready-active', query: `sim-ready 3D in:name,description,readme pushed:>=${industryActiveSince} archived:false fork:false` },
    { id: 'github-open-model-new', query: `topic:foundation-model pushed:>=${activeSince} stars:>=50 archived:false fork:false` },
    { id: 'github-image-generation-active', query: `"image generation" multimodal diffusion in:name,description,readme pushed:>=${industryActiveSince} stars:>=5 archived:false fork:false` },
    { id: 'github-video-intelligence-active', query: `video understanding tracking segmentation in:name,description,readme pushed:>=${industryActiveSince} stars:>=5 archived:false fork:false` },
    { id: 'github-video-generation-active', query: `"video generation" text-to-video image-to-video in:name,description,readme pushed:>=${industryActiveSince} stars:>=5 archived:false fork:false` },
    { id: 'github-video-editing-active', query: `video editing automatic montage in:name,description,readme pushed:>=${industryActiveSince} stars:>=3 archived:false fork:false` },
    { id: 'github-video-3d-stage-active', query: `video 3D virtual production camera trajectory in:name,description,readme pushed:>=${industryActiveSince} stars:>=3 archived:false fork:false` },
    { id: 'github-video-2026-new', query: `created:>=2026-01-01 video in:name,description,readme stars:>=10 archived:false fork:false` },
    { id: 'github-web-data-active', query: `topic:web-scraping pushed:>=${industryActiveSince} stars:>=10 archived:false fork:false` },
    { id: 'github-browser-automation-active', query: `topic:browser-automation pushed:>=${industryActiveSince} stars:>=10 archived:false fork:false` },
    { id: 'github-deep-research-active', query: `"deep research" in:name,description,readme pushed:>=${industryActiveSince} stars:>=5 archived:false fork:false` },
    { id: 'github-document-processing-active', query: `PDF parser OCR document extraction markdown in:name,description,readme pushed:>=${industryActiveSince} stars:>=5 archived:false fork:false` },
    { id: 'github-physical-ai-active', query: `"physical AI" embodied robotics in:name,description,readme pushed:>=${industryActiveSince} stars:>=3 archived:false fork:false` },
    { id: 'github-vla-robotics-active', query: `"vision language action" robot in:name,description,readme pushed:>=${industryActiveSince} stars:>=3 archived:false fork:false` },
    { id: 'github-robot-simulation-active', query: `robot simulation sim-to-real synthetic data in:name,description,readme pushed:>=${industryActiveSince} stars:>=3 archived:false fork:false` },
  ];
  const reusable = retryFailed && previousSnapshot.asOf === asOf;
  const previousSuccessful = new Set((reusable ? previousSnapshot.sourceStatus : []).filter(source => source.status === 'success').map(source => source.id));
  if (reusable) sourceStatus.push(...previousSnapshot.sourceStatus.filter(source => source.status === 'success'
    || (source.id?.startsWith('ossinsight-') && previousSuccessful.has(source.id.replace('ossinsight-', 'github-trending-')))));
  const [ossGroups, githubGroups] = await Promise.all([
    Promise.all(ossSources.filter(source => !previousSuccessful.has(source.id.replace('ossinsight-', 'github-trending-'))).map((source) => fetchOssInsight(source, sourceStatus))),
    fetchGithubSources(githubSources.filter(source => !previousSuccessful.has(source.id)), sourceStatus),
  ]);
  const externalGroups = [...ossGroups, ...githubGroups];
  const externalRecords = externalGroups.flat();
  const forced = collectForcedCandidates(aiLatest, weeklyLatest, candidates, paperGithubCandidates);
  const trackedProjects = githubLatest.projects?.length ? githubLatest.projects : main.projects ?? [];
  const repoAliases = new Map((industryWatchlist.repositories ?? []).flatMap((seed) =>
    (seed.aliases ?? []).map((alias) => [alias.toLowerCase(), seed.repo])));
  const records = [
    ...externalRecords,
    ...(reusable ? previousSnapshot.candidates.map(candidate => ({ ...candidate,
      sourceSignals: candidate.sourceSignals.filter(signal => previousSuccessful.has(signal.id)) })).filter(candidate => candidate.sourceSignals.length) : []),
    ...trackedProjects.map(trackedRecord).filter(Boolean),
    ...(industryWatchlist.repositories ?? []).map(industryWatchlistRecord).filter(Boolean),
    ...forced.resolved,
  ];
  const snapshot = buildTrendSnapshot({
    asOf,
    records,
    previousSnapshot,
    sourceStatus,
    unresolvedAiCandidates: forced.unresolved,
    repoAliases,
  });
  const errors = validateTrendSnapshot(snapshot);
  if (errors.length) throw new Error(errors.join('; '));
  if (!sourceStatus.some((source) => source.status === 'success' && source.id !== 'tracked')) {
    throw new Error('All external GitHub trend sources failed; refusing to publish a local-only candidate list.');
  }
  if (dryRun) {
    console.log(JSON.stringify(snapshot, null, 2));
    return;
  }
  await mkdir(dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, outputPath);
  console.log(`GitHub trend discovery complete: ${snapshot.counts.surging} surging, ${snapshot.counts.hot} hot, ${snapshot.counts.publishedCandidates} total candidates.`);
  for (const source of sourceStatus.filter((item) => item.status !== 'success')) {
    const label = source.role === 'optional' ? 'Source notice (optional)' : 'Warning';
    console.warn(label + ': ' + source.id + ' / ' + source.status + ' (' + source.error + ').');
  }
}

const executedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executedDirectly) main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

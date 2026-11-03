import { aiPublicationBlockers } from './ai-source-policy.mjs';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const chineseTextPattern = /[\u3400-\u9fff]/;

function validateAiEventLanguage(event, errors, label) {
  for (const field of ['title', 'summary', 'whyItMatters', 'action']) {
    if (!chineseTextPattern.test(event?.[field] ?? '')) {
      errors.push(`${label} event ${event?.id ?? 'unknown'} ${field} must contain Chinese text`);
    }
  }
}

function validatePaperEvent(event, errors, label) {
  if (event?.contentKind !== 'paper') return;
  const paper = event?.paper;
  if (!paper || typeof paper !== 'object') {
    errors.push(`${label} event ${event?.id ?? 'unknown'} paper metadata is missing`);
    return;
  }
  if (!event.boards?.includes('Frontier Paper / Research')) errors.push(`${label} event ${event.id} must include the frontier paper board`);
  if (!paper.titleOriginal) errors.push(`${label} event ${event.id} original paper title is missing`);
  if (!Array.isArray(paper.authors) || paper.authors.length === 0) errors.push(`${label} event ${event.id} paper authors are missing`);
  if (!paper.publishedAt || Number.isNaN(Date.parse(paper.publishedAt))) errors.push(`${label} event ${event.id} paper publishedAt is invalid`);
  if (!paper.paperUrl?.startsWith('https://')) errors.push(`${label} event ${event.id} paper URL is invalid`);
  if (!['abstract', 'fulltext'].includes(paper.readingLevel)) errors.push(`${label} event ${event.id} paper reading level is invalid`);
}

function validateReport(report, expectedChannel, errors, label) {
  if (!report?.id) errors.push(`${label} report must have an id`);
  if (!isoDatePattern.test(report?.date ?? '')) errors.push(`${label} report date must use YYYY-MM-DD`);
  if (report?.channel !== expectedChannel) errors.push(`${label} report channel must be ${expectedChannel}`);
  if (!['markdown', 'html'].includes(report?.format)) errors.push(`${label} report format is invalid`);
  if (!report?.path?.startsWith('/reports/')) errors.push(`${label} report path must be under /reports/`);
}

function validateCandidateRows(candidates, errors, label) {
  const ids = new Set();
  for (const candidate of candidates ?? []) {
    if (!candidate?.id) errors.push(`${label} contains a candidate without id`);
    if (ids.has(candidate?.id)) errors.push(`${label} contains duplicate candidate ${candidate.id}`);
    ids.add(candidate?.id);
    if (!candidate?.name || !candidate?.source || !candidate?.reason) errors.push(`${label} candidate ${candidate?.id ?? 'unknown'} is incomplete`);
    if (!['pending', 'verified', 'approved', 'rejected', 'observe'].includes(candidate?.status)) errors.push(`${label} candidate ${candidate?.id ?? 'unknown'} has invalid status`);
  }
}

function validateLatestBase(payload, channel, errors) {
  const label = `${channel} latest`;
  if (!payload || typeof payload !== 'object') {
    errors.push(`${label} must be an object`);
    return;
  }
  if (payload.schemaVersion !== '1.0.0') errors.push(`${label} schemaVersion must be 1.0.0`);
  if (!payload.generatedAt || Number.isNaN(Date.parse(payload.generatedAt))) errors.push(`${label} generatedAt must be an ISO date`);
  if (!isoDatePattern.test(payload.asOf ?? '')) errors.push(`${label} asOf must use YYYY-MM-DD`);
  if (!Array.isArray(payload.candidates)) errors.push(`${label} candidates must be an array`);
  else validateCandidateRows(payload.candidates, errors, label);
  if (!payload.run || payload.run.channel !== channel) errors.push(`${label} run channel must be ${channel}`);
  if (!['success', 'warning', 'failed', 'unknown'].includes(payload.run?.status)) errors.push(`${label} run status is invalid`);
  validateReport(payload.report, channel, errors, label);
}

export function validateAiLatest(payload) {
  const errors = [];
  const eventIds = new Set();
  validateLatestBase(payload, 'ai', errors);
  if (payload?.sourceCoverage || payload?.run?.status === 'success') errors.push(...aiPublicationBlockers(payload, payload.asOf));
  if (payload?.report?.id !== `ai-${payload?.asOf}`) errors.push('ai latest report id must match asOf');
  if (payload?.report?.date !== payload?.asOf) errors.push('ai latest report date must match asOf');
  if (!Array.isArray(payload?.aiEvents)) errors.push('ai latest aiEvents must be an array');
  for (const event of payload?.aiEvents ?? []) {
    if (eventIds.has(event.id)) errors.push(`ai latest contains duplicate event id ${event.id}`);
    eventIds.add(event.id);
    if (event.date > payload.asOf) errors.push(`ai latest event ${event.id} has a future event date`);
    if (!event?.id || !isoDatePattern.test(event?.date ?? '')) errors.push(`ai latest event ${event?.id ?? 'unknown'} has invalid identity or date`);
    if (!Array.isArray(event?.sources) || event.sources.length === 0) errors.push(`ai latest event ${event?.id ?? 'unknown'} has no sources`);
    if (event?.sourceReportId !== payload?.report?.id) errors.push(`ai latest event ${event?.id ?? 'unknown'} does not reference its report`);
    validateAiEventLanguage(event, errors, 'ai latest');
    validatePaperEvent(event, errors, 'ai latest');
  }
  if ((payload?.aiEvents ?? []).filter(event => event.contentKind === 'paper').length > 3) errors.push('ai latest exceeds the three-paper daily digest limit');
  if (payload?.run?.id !== 'wagmi-ai') errors.push('ai latest run id must be wagmi-ai');
  if (payload?.run?.schedule !== '每天 07:30') errors.push('ai latest run schedule must be 每天 07:30');
  return errors;
}

export function validateGithubLatest(payload) {
  const errors = [];
  const projectIds = new Set();
  const projectRepos = new Set();
  validateLatestBase(payload, 'github', errors);
  if (!Array.isArray(payload?.projects) || payload.projects.length === 0) errors.push('github latest projects must be a non-empty array');
  for (const project of payload?.projects ?? []) {
    const id = String(project?.id ?? '').toLowerCase();
    const repo = String(project?.repo ?? '').toLowerCase();
    if (!id) errors.push('github latest contains a project without id');
    else if (projectIds.has(id)) errors.push(`github latest contains duplicate project id ${project.id}`);
    if (repo && projectRepos.has(repo)) errors.push(`github latest contains duplicate repo ${project.repo}`);
    if (id) projectIds.add(id);
    if (repo) projectRepos.add(repo);
    if (!/^[\w.-]+\/[\w.-]+$/.test(project?.repo ?? '')) errors.push(`github latest project ${project?.id ?? 'unknown'} has invalid repo`);
    if (!project?.url?.startsWith('https://github.com/')) errors.push(`github latest project ${project?.id ?? 'unknown'} has invalid URL`);
    if (project?.sourceReportId !== payload?.report?.id) errors.push(`github latest project ${project?.id ?? 'unknown'} does not reference its report`);
  }
  if (payload?.run?.id !== 'wagmi-github') errors.push('github latest run id must be wagmi-github');
  if (payload?.run?.schedule !== '每天 07:30') errors.push('github latest run schedule must be 每天 07:30');
  return errors;
}

export function validateSkillsLatest(payload) {
  const errors = [];
  validateLatestBase(payload, 'skills', errors);
  if (!Array.isArray(payload?.skills) || payload.skills.length === 0) errors.push('skills latest skills must be a non-empty array');
  for (const skill of payload?.skills ?? []) {
    const label = `skills latest item ${skill?.id ?? 'unknown'}`;
    if (!skill?.id || !isoDatePattern.test(skill?.date ?? '')) errors.push(`${label} has invalid identity or date`);
    if (!Number.isInteger(skill?.rank) || skill.rank < 1) errors.push(`${label} has invalid rank`);
    if (!skill?.url?.startsWith('https://skills.sh/')) errors.push(`${label} has invalid skills.sh URL`);
    if (!/[\u4e00-\u9fff]/.test(skill?.descriptionZh ?? '')) errors.push(`${label} has no Chinese description`);
    if (!Array.isArray(skill?.useCases) || skill.useCases.length < 2 || skill.useCases.some((item) => !/[\u4e00-\u9fff]/.test(item))) errors.push(`${label} has invalid Chinese use cases`);
    if (skill?.sourceReportId !== payload?.report?.id) errors.push(`${label} does not reference its report`);
  }
  if (payload?.run?.id !== 'wagmi-skills') errors.push('skills latest run id must be wagmi-skills');
  if (payload?.run?.schedule !== '每天 07:40') errors.push('skills latest run schedule must be 每天 07:40');
  if (payload?.view !== 'trending') errors.push('skills latest view must be trending');
  if (!Number.isInteger(payload?.catalog?.totalSkills) || payload.catalog.totalSkills < payload.skills.length) errors.push('skills latest catalog total is invalid');
  if (!Number.isInteger(payload?.catalog?.officialSkills) || payload.catalog.officialSkills < 1) errors.push('skills latest official total is invalid');
  return errors;
}

export function validateWeeklyLatest(payload) {
  if (payload == null) return [];
  const errors = [];
  if (!payload?.id || !payload.id.startsWith('ai-weekly-')) errors.push('weekly latest id is invalid');
  if (!payload?.generatedAt || Number.isNaN(Date.parse(payload.generatedAt))) errors.push('weekly latest generatedAt must be an ISO date');
  if (!isoDatePattern.test(payload?.range?.start ?? '') || !isoDatePattern.test(payload?.range?.end ?? '')) errors.push('weekly latest range is invalid');
  if (!Number.isInteger(payload?.totalEvents) || payload.totalEvents < 0) errors.push('weekly latest totalEvents is invalid');
  for (const field of ['boardCounts', 'trends', 'entities', 'projectCandidates']) {
    if (!Array.isArray(payload?.[field])) errors.push(`weekly latest ${field} must be an array`);
  }
  if (payload?.run?.id !== 'wagmi-ai-2') errors.push('weekly latest run id must be wagmi-ai-2');
  if (payload?.run?.channel !== 'ai') errors.push('weekly latest run channel must be ai');
  if (payload?.run?.schedule !== '每周一 07:50') errors.push('weekly latest run schedule must be 每周一 07:50');
  if (!['success', 'warning', 'failed', 'unknown'].includes(payload?.run?.status)) errors.push('weekly latest run status is invalid');
  if (payload?.run?.artifact !== payload?.report?.path) errors.push('weekly latest run artifact must reference its report');
  validateReport(payload?.report, 'ai', errors, 'weekly latest');
  return errors;
}

export function validatePaperSnapshot(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['paper snapshot must be an object'];
  if (payload.schemaVersion !== '1.0.0') errors.push('paper snapshot schemaVersion must be 1.0.0');
  if (!payload.generatedAt || Number.isNaN(Date.parse(payload.generatedAt))) errors.push('paper snapshot generatedAt must be an ISO date');
  if (!isoDatePattern.test(payload.asOf ?? '')) errors.push('paper snapshot asOf must use YYYY-MM-DD');
  if (!Array.isArray(payload.candidates)) errors.push('paper snapshot candidates must be an array');
  if (payload.catalogCandidates != null && !Array.isArray(payload.catalogCandidates)) errors.push('paper snapshot catalogCandidates must be an array');
  if (!Array.isArray(payload.deepReadQueue)) errors.push('paper snapshot deepReadQueue must be an array');
  if (payload.run?.id !== 'wagmi-ai-papers') errors.push('paper snapshot run id must be wagmi-ai-papers');
  if (payload.run?.channel !== 'ai') errors.push('paper snapshot run channel must be ai');
  if (!['success', 'warning'].includes(payload.run?.status)) errors.push('paper snapshot run status is invalid');

  const candidateIds = new Set();
  for (const paper of payload.candidates ?? []) {
    if (!paper?.id || candidateIds.has(paper.id)) errors.push(`paper snapshot contains invalid or duplicate candidate ${paper?.id ?? 'unknown'}`);
    candidateIds.add(paper?.id);
    if (!paper?.titleOriginal || !paper?.abstract) errors.push(`paper candidate ${paper?.id ?? 'unknown'} is missing title or abstract`);
    if (!Array.isArray(paper?.authors) || paper.authors.length === 0) errors.push(`paper candidate ${paper?.id ?? 'unknown'} has no authors`);
    if (!paper?.url?.startsWith('https://arxiv.org/abs/')) errors.push(`paper candidate ${paper?.id ?? 'unknown'} has an invalid arXiv URL`);
    if (!Number.isFinite(paper?.score) || paper.score < 0) errors.push(`paper candidate ${paper?.id ?? 'unknown'} has an invalid score`);
    if (!['deep', 'digest', 'watch'].includes(paper?.reviewTier)) errors.push(`paper candidate ${paper?.id ?? 'unknown'} has an invalid review tier`);
    if (!paper?.targetBoards?.includes('Frontier Paper / Research')) errors.push(`paper candidate ${paper?.id ?? 'unknown'} has no frontier paper board`);
  }
  const catalogIds = new Set();
  for (const paper of payload.catalogCandidates ?? payload.candidates ?? []) {
    if (!paper?.id || catalogIds.has(paper.id)) errors.push(`paper catalog candidate list contains invalid or duplicate candidate ${paper?.id ?? 'unknown'}`);
    catalogIds.add(paper?.id);
    if (!paper?.titleOriginal || !paper?.abstract) errors.push(`paper catalog candidate ${paper?.id ?? 'unknown'} is missing title or abstract`);
    if (!paper?.url?.startsWith('https://arxiv.org/abs/')) errors.push(`paper catalog candidate ${paper?.id ?? 'unknown'} has an invalid arXiv URL`);
  }
  for (const id of payload.deepReadQueue ?? []) {
    if (!candidateIds.has(id)) errors.push(`paper deep-read candidate ${id} is missing from candidates`);
  }
  if ((payload.deepReadQueue?.length ?? 0) > Number(payload.budgets?.deepRead ?? 0)) errors.push('paper deep-read queue exceeds its budget');
  return errors;
}

export function validatePaperCatalog(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['paper catalog must be an object'];
  if (payload.schemaVersion !== '1.0.0') errors.push('paper catalog schemaVersion must be 1.0.0');
  if (!payload.generatedAt || Number.isNaN(Date.parse(payload.generatedAt))) errors.push('paper catalog generatedAt must be an ISO date');
  if (!isoDatePattern.test(payload.asOf ?? '')) errors.push('paper catalog asOf must use YYYY-MM-DD');
  if (!Array.isArray(payload.papers)) errors.push('paper catalog papers must be an array');
  if (!Array.isArray(payload.reviewQueue)) errors.push('paper catalog reviewQueue must be an array');
  if (!Array.isArray(payload.priorityReviewQueue)) errors.push('paper catalog priorityReviewQueue must be an array');
  if (!Array.isArray(payload.dailyRecommendations)) errors.push('paper catalog dailyRecommendations must be an array');
  if (!Array.isArray(payload.trendClusters)) errors.push('paper catalog trendClusters must be an array');

  const ids = new Set();
  for (const paper of payload.papers ?? []) {
    if (!paper?.id || ids.has(paper.id)) errors.push(`paper catalog contains invalid or duplicate paper ${paper?.id ?? 'unknown'}`);
    ids.add(paper?.id);
    if (!paper?.titleOriginal || !paper?.abstractOriginal) errors.push(`paper catalog item ${paper?.id ?? 'unknown'} is missing source text`);
    if (!paper?.url?.startsWith('https://arxiv.org/abs/')) errors.push(`paper catalog item ${paper?.id ?? 'unknown'} has an invalid URL`);
    if (!['discovered', 'queued', 'interpreted', 'verified'].includes(paper?.reviewStatus)) errors.push(`paper catalog item ${paper?.id ?? 'unknown'} has an invalid review status`);
    if (!['metadata', 'abstract', 'fulltext'].includes(paper?.readingLevel)) errors.push(`paper catalog item ${paper?.id ?? 'unknown'} has an invalid reading level`);
    if (!['active', 'monitoring', 'needs_review'].includes(paper?.availabilityStatus)) errors.push(`paper catalog item ${paper?.id ?? 'unknown'} has an invalid availability status`);
    if (['interpreted', 'verified'].includes(paper?.reviewStatus) && (!chineseTextPattern.test(paper?.titleZh ?? '') || !chineseTextPattern.test(paper?.summaryZh ?? ''))) {
      errors.push(`interpreted paper ${paper?.id ?? 'unknown'} must contain a Chinese title and summary`);
    }
    for (const link of paper?.relatedRepositories ?? []) {
      if (!/^[\w.-]+\/[\w.-]+$/.test(link?.repo ?? '')) errors.push(`paper ${paper?.id ?? 'unknown'} has an invalid repository relation`);
      if (!link?.url?.startsWith('https://github.com/')) errors.push(`paper ${paper?.id ?? 'unknown'} has an invalid repository URL`);
      if (!link?.evidenceUrl?.startsWith('https://')) errors.push(`paper ${paper?.id ?? 'unknown'} has repository relation without evidence`);
      if (link?.relation === 'official_code' && link?.confidence !== 'high') errors.push(`paper ${paper?.id ?? 'unknown'} official code relation must have high confidence`);
    }
  }
  for (const id of [...(payload.reviewQueue ?? []), ...(payload.priorityReviewQueue ?? []), ...(payload.dailyRecommendations ?? [])]) {
    if (!ids.has(id)) errors.push(`paper catalog reference ${id} is missing`);
  }
  if ((payload.priorityReviewQueue ?? []).some((id) => !(payload.reviewQueue ?? []).includes(id))) {
    errors.push('paper priority review queue must be contained in the review queue');
  }
  if ((payload.reviewQueue?.length ?? 0) > Number(payload.budgets?.deepRead ?? 0)) errors.push('paper catalog review queue exceeds its daily budget');
  if ((payload.dailyRecommendations?.length ?? 0) > 3) errors.push('paper catalog daily recommendations exceed three papers');
  if (payload.stats?.totalPapers !== (payload.papers?.length ?? 0)) errors.push('paper catalog total does not match paper rows');
  return errors;
}

export function validateSnapshot(snapshot) {
  const errors = [];

  if (!snapshot || typeof snapshot !== 'object') errors.push('snapshot must be an object');
  if (snapshot?.schemaVersion !== '1.0.0') errors.push('schemaVersion must be 1.0.0');
  if (!['main', 'dev'].includes(snapshot?.track)) errors.push('track must be main or dev');
  if (!snapshot?.generatedAt || Number.isNaN(Date.parse(snapshot.generatedAt))) errors.push('generatedAt must be an ISO date');

  for (const field of ['projects', 'aiEvents', 'skills', 'runs', 'reports', 'candidates', 'watchlist']) {
    if (!Array.isArray(snapshot?.[field])) errors.push(`${field} must be an array`);
  }
  if (snapshot?.githubTrends != null && !Array.isArray(snapshot.githubTrends)) errors.push('githubTrends must be an array');

  const uniqueIds = (rows, label) => {
    const ids = new Set();
    for (const row of rows ?? []) {
      if (!row?.id) errors.push(`${label} contains a row without id`);
      if (ids.has(row?.id)) errors.push(`${label} contains duplicate id ${row.id}`);
      ids.add(row?.id);
    }
  };

  uniqueIds(snapshot?.projects, 'projects');
  uniqueIds(snapshot?.aiEvents, 'aiEvents');
  uniqueIds(snapshot?.skills, 'skills');
  uniqueIds(snapshot?.runs, 'runs');
  uniqueIds(snapshot?.reports, 'reports');

  const reportIds = new Set((snapshot?.reports ?? []).map((report) => report.id));
  const projectRepos = new Set();
  validateCandidateRows(snapshot?.candidates, errors, 'snapshot');

  for (const project of snapshot?.projects ?? []) {
    if (projectRepos.has(String(project.repo).toLowerCase())) errors.push(`projects contains duplicate repo ${project.repo}`);
    projectRepos.add(String(project.repo).toLowerCase());
    if (!/^[\w.-]+\/[\w.-]+$/.test(project.repo ?? '')) errors.push(`invalid repo ${project.repo}`);
    if (!project.url?.startsWith('https://github.com/')) errors.push(`invalid GitHub URL for ${project.id}`);
    if (project.url?.includes('example.com') || project.repo?.includes('example/')) errors.push(`placeholder repo is forbidden: ${project.id}`);
    if (!Number.isFinite(project.stars) || project.stars < 0) errors.push(`invalid stars for ${project.id}`);
    if (!reportIds.has(project.sourceReportId)) errors.push(`missing project source report for ${project.id}`);
  }

  const trendRepos = new Set();
  for (const trend of snapshot?.githubTrends ?? []) {
    const repo = String(trend?.repo ?? '').toLowerCase();
    if (!/^[\w.-]+\/[\w.-]+$/.test(trend?.repo ?? '')) errors.push(`invalid trend repo ${trend?.repo}`);
    if (trendRepos.has(repo)) errors.push(`githubTrends contains duplicate repo ${trend.repo}`);
    trendRepos.add(repo);
    if (!trend?.url?.startsWith('https://github.com/')) errors.push(`invalid trend URL for ${trend?.repo ?? 'unknown'}`);
    if (!['surging', 'hot', 'watch'].includes(trend?.hotLevel)) errors.push(`invalid trend level for ${trend?.repo ?? 'unknown'}`);
    if (!Array.isArray(trend?.hotReasons) || !Array.isArray(trend?.priorityDomains)) errors.push(`incomplete trend evidence for ${trend?.repo ?? 'unknown'}`);
    for (const field of ['periodStars24h', 'periodStarsWeekly', 'totalStars', 'forks', 'hotScore']) {
      if (!Number.isFinite(trend?.[field]) || trend[field] < 0) errors.push(`invalid trend ${field} for ${trend?.repo ?? 'unknown'}`);
    }
  }

  for (const event of snapshot?.aiEvents ?? []) {
    if (!isoDatePattern.test(event.date ?? '')) errors.push(`invalid event date for ${event.id}`);
    if (!Array.isArray(event.sources) || event.sources.length === 0) errors.push(`event ${event.id} has no sources`);
    validateAiEventLanguage(event, errors, 'snapshot');
    validatePaperEvent(event, errors, 'snapshot');
    for (const source of event.sources ?? []) {
      if (!source.url?.startsWith('https://')) errors.push(`event ${event.id} has an invalid source URL`);
    }
    if (!reportIds.has(event.sourceReportId)) errors.push(`missing event source report for ${event.id}`);
  }

  for (const skill of snapshot?.skills ?? []) {
    if (!isoDatePattern.test(skill.date ?? '')) errors.push(`invalid skill date for ${skill.id}`);
    if (!skill.url?.startsWith('https://skills.sh/')) errors.push(`invalid skills.sh URL for ${skill.id}`);
    if (!/[\u4e00-\u9fff]/.test(skill.descriptionZh ?? '')) errors.push(`skill ${skill.id} has no Chinese description`);
    if (!Array.isArray(skill.useCases) || skill.useCases.length < 2) errors.push(`skill ${skill.id} has no use cases`);
    if (!reportIds.has(skill.sourceReportId)) errors.push(`missing skill source report for ${skill.id}`);
  }

  if (snapshot?.skillCatalog != null) {
    if (!Number.isInteger(snapshot.skillCatalog.totalSkills) || snapshot.skillCatalog.totalSkills < snapshot.skills.length) errors.push('snapshot Skill catalog total is invalid');
    if (!snapshot.skillCatalog.path?.startsWith('/data/main/')) errors.push('snapshot Skill catalog path is invalid');
  }

  const serialized = JSON.stringify(snapshot);
  if (serialized.includes('github.com/example')) errors.push('snapshot contains github.com/example placeholder data');
  if (/实时抓取生成的项目样例/.test(serialized)) errors.push('snapshot contains simulated live-fetch copy');

  return errors;
}

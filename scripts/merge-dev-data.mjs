import { applyCandidateDecisions } from './candidate-decisions.mjs';

export function mergeRows(...groups) {
  const rows = new Map();
  groups.flat().forEach((row) => {
    const id = row && typeof row === 'object' && 'id' in row ? String(row.id) : '';
    if (id) rows.set(id, row);
  });
  return [...rows.values()];
}

export function mergeProjects(...groups) {
  const rows = mergeRows(...groups);
  const aliases = new Map();
  for (const row of rows) for (const alias of row.repoAliases ?? []) aliases.set(alias.toLowerCase(), row.repo.toLowerCase());
  const canonical = repo => {
    let key = String(repo ?? '').toLowerCase(); const visited = new Set();
    while (aliases.has(key) && !visited.has(key)) { visited.add(key); key = aliases.get(key); }
    return key;
  };
  return [...new Map(rows.map(row => [row.repo ? canonical(row.repo) : row.id, row])).values()];
}

export function mergeAiEvents(...groups) {
  const rows = mergeRows(...groups);
  // One research paper is one event, even when old collectors varied its ID.
  // Shared product homepages are NOT sufficient to deduplicate announcements.
  const key = event => {
    if (event.contentKind !== 'paper') return event.id;
    const url = event.paper?.paperUrl ?? event.sources?.find(source => /arxiv\.org\/abs\//.test(source.url))?.url;
    const arxivId = url?.match(/arxiv\.org\/abs\/([^?#/]+)/)?.[1]?.replace(/v\d+$/, '');
    return arxivId ? `paper:${arxivId}:${event.date}` : event.id;
  };
  const grouped = new Map();
  const rank = event => `${({fulltext:3,abstract:2,metadata:1})[event.paper?.readingLevel] ?? 0}:${event.sourceReportId ?? ''}:${event.id}`;
  for (const row of rows) {
    const identity = key(row); const previous = grouped.get(identity);
    // Choosing the last array row toggles old duplicate IDs after every publish.
    // Prefer reading depth, then collection report and ID deterministically.
    if (!previous || rank(row) > rank(previous)) grouped.set(identity, row);
  }
  return [...grouped.values()].filter(event => event.digestSelected !== false);
}

export function normalizeRunSchedules(runs) {
  const schedules = {
    'wagmi-ai': '每天 07:30',
    'wagmi-ai-2': '每周一 07:50',
    'wagmi-github': '每天 07:30',
    'wagmi-skills': '每天 07:40',
    'wagmi-dingtalk': '每天 08:30',
  };
  return runs.map((run) => ({ ...run, schedule: schedules[run.id] ?? run.schedule }));
}

function normalizeGithubTrends(trends) {
  if (!Array.isArray(trends)) return [];
  const numberOrZero = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
  return trends.map((trend) => ({
    ...trend,
    periodStars24h: numberOrZero(trend?.periodStars24h),
    periodStarsWeekly: numberOrZero(trend?.periodStarsWeekly),
    totalStars: numberOrZero(trend?.totalStars),
    forks: numberOrZero(trend?.forks),
    hotScore: numberOrZero(trend?.hotScore),
    topics: Array.isArray(trend?.topics) ? trend.topics : [],
    priorityDomains: Array.isArray(trend?.priorityDomains) ? trend.priorityDomains : [],
    sourceSignals: Array.isArray(trend?.sourceSignals) ? trend.sourceSignals : [],
    hotReasons: Array.isArray(trend?.hotReasons) ? trend.hotReasons : [],
    qualityRisks: Array.isArray(trend?.qualityRisks) ? trend.qualityRisks : [],
  }));
}

export function mergeDevSnapshot({
  main,
  override = {},
  candidates = [],
  candidateDecisions = [],
  creators = [],
  models = [],
  aiLatest = null,
  githubLatest = null,
  githubTrends = null,
  skillsLatest = null,
  weeklyLatest = null,
  dingtalkRun = null,
}) {
  const generatedAt = [main.generatedAt, override.generatedAt, aiLatest?.generatedAt, githubLatest?.generatedAt, skillsLatest?.generatedAt]
    .filter((value) => typeof value === 'string')
    .sort((left, right) => Date.parse(left) - Date.parse(right))
    .pop();

  return {
    ...main,
    ...override,
    track: 'dev',
    generatedAt,
    asOf: {
      ...(typeof main.asOf === 'object' ? main.asOf : {}),
      ...(typeof override.asOf === 'object' ? override.asOf : {}),
      ...(aiLatest?.asOf ? { ai: aiLatest.asOf } : {}),
      ...(githubLatest?.asOf ? { github: githubLatest.asOf } : {}),
      ...(skillsLatest?.asOf ? { skills: skillsLatest.asOf } : {}),
    },
    projects: mergeProjects(main.projects ?? [], override.projects ?? [], githubLatest?.projects ?? []),
    githubTrends: normalizeGithubTrends(githubTrends?.candidates ?? override.githubTrends ?? main.githubTrends ?? []),
    aiEvents: mergeAiEvents(
      (main.aiEvents ?? []).filter(event => !aiLatest?.sourceCoverage || event.sourceReportId !== aiLatest.report?.id),
      (override.aiEvents ?? []).filter(event => !aiLatest?.sourceCoverage || event.sourceReportId !== aiLatest.report?.id),
      aiLatest?.aiEvents ?? [],
    ),
    skills: mergeRows(
      (main.skills ?? []).filter((skill) => !skillsLatest?.asOf || skill.date !== skillsLatest.asOf),
      (override.skills ?? []).filter((skill) => !skillsLatest?.asOf || skill.date !== skillsLatest.asOf),
      skillsLatest?.skills ?? [],
    ),
    skillCatalog: skillsLatest?.catalog ?? override.skillCatalog ?? main.skillCatalog,
    runs: normalizeRunSchedules(mergeRows(main.runs ?? [], override.runs ?? [], aiLatest?.run ? [aiLatest.run] : [], weeklyLatest?.run ? [weeklyLatest.run] : [], githubLatest?.run ? [githubLatest.run] : [], skillsLatest?.run ? [skillsLatest.run] : [], dingtalkRun ? [dingtalkRun] : [])),
    reports: mergeRows(main.reports ?? [], override.reports ?? [], aiLatest?.report ? [aiLatest.report] : [], githubLatest?.report ? [githubLatest.report] : [], skillsLatest?.report ? [skillsLatest.report] : [], weeklyLatest?.report ? [weeklyLatest.report] : []),
    candidates: applyCandidateDecisions(
      mergeRows(candidates, override.candidates ?? [], aiLatest?.candidates ?? [], githubLatest?.candidates ?? []),
      candidateDecisions,
    ),
    watchlist: creators,
    modelWatchlist: models,
    weeklySummaries: mergeRows(
      main.weeklySummaries ?? [],
      override.weeklySummaries ?? [],
      weeklyLatest ? [weeklyLatest] : [],
    ).sort((left, right) => String(right?.range?.end ?? '').localeCompare(String(left?.range?.end ?? ''))),
  };
}

const requiredTrendSources = [
  ['github-trending-24h-all', '/trending', 'daily'],
  ['github-trending-24h-python', '/trending/python', 'daily'],
  ['github-trending-24h-typescript', '/trending/typescript', 'daily'],
  ['github-trending-weekly-all', '/trending', 'weekly'],
];

const optionalOssSources = new Set(requiredTrendSources.map(([id]) => id.replace('github-trending-', 'ossinsight-')));

export function evaluateGithubSources(snapshot, date = snapshot?.asOf) {
  const sources = snapshot?.sourceStatus ?? [];
  const blockers = [];
  const notices = [];
  if (!date || snapshot?.asOf !== date) blockers.push('GitHub trend snapshot is stale or missing');
  for (const [id, pathname, period] of requiredTrendSources) {
    const source = sources.find(row => row.id === id);
    let officialUrl = false;
    try {
      const url = new URL(source?.url);
      officialUrl = url.protocol === 'https:' && url.hostname === 'github.com'
        && url.pathname === pathname && url.searchParams.get('since') === period;
    } catch {}
    if (source?.status !== 'success' || !officialUrl || !(source.count > 0)) {
      blockers.push('Required official trend source ' + id + ' is unavailable or invalid');
    }
  }
  for (const source of sources) {
    if (optionalOssSources.has(source.id)) {
      if (source.status !== 'success') notices.push({ ...source, role: 'optional' });
    } else if (source.status !== 'success') {
      blockers.push('GitHub source ' + source.id + ': ' + source.status);
    }
    if (optionalOssSources.has(source.upstream?.id) && source.upstream.status !== 'success') {
      notices.push({ ...source.upstream, role: 'optional' });
    }
  }
  return { policy: 'official-github-trending-primary-v1', ready: !blockers.length,
    primarySource: sources.find(row => row.id === 'github-trending-24h-all') ?? null,
    blockers: [...new Set(blockers)],
    notices: [...new Map(notices.map(row => [row.id, row])).values()] };
}

export function githubReviewBlockers(trends, latest) {
  const blockers = [];
  const summary = latest?.verificationSummary;
  if (latest?.asOf !== trends?.asOf) blockers.push('GitHub review snapshot is stale');
  if (!summary || !Array.isArray(summary.mandatoryReviewed)) return [...blockers, 'GitHub mandatory review evidence is missing'];
  const reviewed = new Map(summary.mandatoryReviewed.map(row => [row.repo?.toLowerCase(), row]));
  const mandatory = [...new Set((trends?.candidates ?? [])
    .filter(row => row.hotLevel === 'surging' || row.hotLevel === 'hot' || row.forcedByAI)
    .map(row => row.repo.toLowerCase()))];
  for (const repo of mandatory) {
    const row = reviewed.get(repo);
    const required = ['accessible', 'readmeVerified', 'commitsVerified', 'issuesVerified', 'pullRequestsVerified', 'releasesVerified'];
    if (!row || required.some(field => row[field] !== true)) blockers.push('Incomplete mandatory GitHub evidence: ' + repo);
  }
  const failures = Number(latest?.run?.refreshSummary?.failures ?? summary.coverage?.trackedRefreshFailures ?? 0);
  if (failures > 0) blockers.push(failures + ' tracked GitHub repositories failed to refresh');
  return blockers;
}

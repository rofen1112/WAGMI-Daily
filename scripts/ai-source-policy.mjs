// Optional discovery-source health is separate from the AI publication batch.
export function sourceCheckDate(value) {
  const time = new Date(value);
  return Number.isNaN(time.valueOf()) ? null : new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(time);
}
export function canonicalSourceUrl(value) {
  try { const url = new URL(value); if (url.protocol !== 'https:') return null; url.hash = ''; return url.href.replace(/\/$/, ''); }
  catch { return null; }
}
export function currentOriginalReview(source, date) {
  const url = canonicalSourceUrl(source?.url);
  if (!url || /(?:^|\.)(?:memene\.cn|memenews\.cn)$/.test(new URL(url).hostname)) return false;
  return source.success === true && source.verification === 'verified'
    && ['official', 'original_research', 'trusted_media'].includes(source.sourceClass)
    && sourceCheckDate(source.checkedAt) === date;
}
export function reviewedSourceForEvent(source, event, date) {
  const url = canonicalSourceUrl(source?.url);
  return currentOriginalReview(source, date) && source.eventIds?.includes(event.id)
    && event.sources?.some(reference => canonicalSourceUrl(reference.url) === url);
}
export function buildAiSourceCoverage({ date, events = [], evidence = [], noNewEvents = false }) {
  const missingEventIds = events.filter(event => event.verification !== 'verified'
    || !evidence.some(source => reviewedSourceForEvent(source, event, date))).map(event => event.id);
  const reviewed = evidence.filter(source => currentOriginalReview(source, date));
  const verifiedSourceCount = new Set(reviewed.map(source => canonicalSourceUrl(source.url))).size;
  const quietDay = events.length === 0 && noNewEvents && reviewed.some(source => source.discoveryChecked === true);
  return { policy: 'independent-sources-v1', asOf: date,
    ready: missingEventIds.length === 0 && (events.length > 0 || quietDay),
    acceptedEvents: events.length, verifiedSourceCount, missingEventIds, noNewEvents: quietDay };
}
export function aiPublicationBlockers(latest, date) {
  const blockers = [];
  if (latest?.asOf !== date) blockers.push(`ai asOf is ${latest?.asOf ?? 'missing'}, expected ${date}`);
  if (latest?.run?.status !== 'success') blockers.push(`ai status is ${latest?.run?.status ?? 'missing'}`);
  const coverage = latest?.sourceCoverage;
  // Only historical snapshots predating policy adoption retain the old contract.
  if (!coverage && date >= '2026-10-10') blockers.push('AI original-source coverage is missing');
  if (coverage) {
    if (coverage.policy !== 'independent-sources-v1' || coverage.asOf !== date || !coverage.ready
      || !Number.isInteger(coverage.verifiedSourceCount) || coverage.verifiedSourceCount < 1
      || coverage.acceptedEvents !== latest.aiEvents?.length) {
      blockers.push('AI original-source coverage is incomplete or stale');
    }
    for (const event of latest.aiEvents ?? []) {
      if (event.verification !== 'verified' || sourceCheckDate(event.sourceVerifiedAt) !== date
        || !event.sourceVerifiedUrls?.some(url => canonicalSourceUrl(url)
          && event.sources?.some(source => canonicalSourceUrl(source.url) === canonicalSourceUrl(url)))) {
        blockers.push(`AI event ${event.id} lacks a current original-source review`);
      }
    }
    if (!latest.aiEvents?.length && !coverage.noNewEvents) blockers.push('AI empty batch has no verified no-update result');
  }
  return blockers;
}

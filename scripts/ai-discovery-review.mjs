import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isInternalSource, sanitizePublicReport } from './public-source-policy.mjs';
import { currentOriginalReview } from './ai-source-policy.mjs';

export const AI_DISCOVERY_REVIEW_POLICY = 'ai-discovery-review-v1';
export const AI_DISCOVERY_REVIEW_START_DATE = '2026-10-29';
const dispositions = new Set(['covered', 'added', 'duplicate', 'pending', 'out_of_scope', 'catalogued']);
const carryDispositions = new Set(['covered', 'duplicate', 'out_of_scope']);
const successfulDispositions = new Set(['covered', 'added', 'duplicate']);
const sourceStates = new Set(['success', 'stale', 'partial', 'blocked', 'failed', 'unavailable', 'warning']);
const chineseHosts = new Set(['qbitai.com', 'geekpark.net', 'aiera.com.cn', 'jiqizhixin.com', 'daily.juya.uk', 'mp.weixin.qq.com', 'ithome.com', 'cls.cn', 'yicai.com', 'xinhuanet.com', 'www3.xinhuanet.com']);

export function shanghaiDate(value) {
  if (arguments.length === 0) value = new Date();
  if (value === undefined || value === null || value === '') return null;
  const point = new Date(value);
  return Number.isNaN(point.valueOf()) ? null : new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(point);
}
function validDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    && !Number.isNaN(Date.parse(date + 'T00:00:00Z'))
    && new Date(date + 'T00:00:00Z').toISOString().slice(0, 10) === date;
}
function dayBefore(date, days = 1) {
  return new Date(Date.parse(date + 'T00:00:00Z') - days * 86400000).toISOString().slice(0, 10);
}
function webUrl(value, keepHash = false) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    if (!keepHash) url.hash = '';
    url.searchParams.sort();
    return url.href.replace(/\/$/, '');
  } catch { return null; }
}
function hash(value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function urls(values = []) {
  return [...new Set(values.map(value => webUrl(typeof value === 'string' ? value : value?.url)).filter(Boolean))].sort();
}
/** Only source identity and content enter this hash; fetch/run times never do. */
export function candidateFingerprint(candidate = {}) {
  return hash({
    id: String(candidate.id ?? ''), sourceId: candidate.sourceId ?? null,
    sourceName: candidate.sourceName ?? null, sourceDate: candidate.sourceDate ?? candidate.date ?? null,
    publishedAt: candidate.publishedAt ?? null, title: candidate.title ?? '', summary: candidate.summary ?? '',
    contentExcerpt: candidate.contentExcerpt ?? '', contentHash: candidate.contentHash ?? null,
    url: webUrl(candidate.originalUrl ?? candidate.url) ?? null,
    sources: urls(candidate.sources ?? []), referencedUrls: urls(candidate.referencedUrls ?? []),
    category: candidate.category ?? null, related: Boolean(candidate.related), topNews: Boolean(candidate.topNews),
    tags: Array.isArray(candidate.tags) ? [...candidate.tags].sort() : candidate.tags ?? null,
    sections: (candidate.sections ?? []).map(section => ({ id: String(section.id ?? ''), hash: candidateFingerprint(section) })),
  });
}
export function mediaConfigFingerprint(config = {}) {
  return hash((config.sources ?? []).filter(source => source.enabled !== false).map(source => ({
    id: source.id, name: source.name, url: webUrl(source.url), channel: source.channel, format: source.format,
    wechatBiz: source.wechatBiz ?? null, expectedFeedTitles: source.expectedFeedTitles ?? [],
    allowedArticleHosts: source.allowedArticleHosts ?? [], articlePathPattern: source.articlePathPattern ?? null,
  })).sort((left, right) => String(left.id).localeCompare(String(right.id))));
}
function shortReason(value) { return typeof value === 'string' && value.trim().length >= 6; }
function currentCandidates(memene, media, date) {
  return {
    memene: memene?.target?.date === date && Array.isArray(memene.target.candidates) ? memene.target.candidates : [],
    media: Array.isArray(media?.candidates) ? media.candidates : [],
  };
}
function eventMap(events, allEvents) {
  return new Map([...(allEvents ?? []), ...(events ?? [])].map(event => [event.id, event]));
}
function safeChineseLink(source) {
  const url = webUrl(source?.url, true);
  if (!url || isInternalSource(source) || source.language === 'en' || source.language === 'other') return false;
  if (source.language === 'zh') return true;
  const parsed = new URL(url);
  if (/\/(?:en|en-us|en-gb)(?:\/|$)/i.test(parsed.pathname)) return false;
  return chineseHosts.has(parsed.hostname.replace(/^www\./, ''))
    || /\/(?:cn|zh|zh-cn|zh-hans)(?:\/|$)/i.test(parsed.pathname);
}
function rowProof(row) {
  return JSON.stringify({ id: row.id, candidateHash: row.candidateHash, importance: row.importance,
    disposition: row.disposition, reason: row.reason, checkedAt: row.checkedAt, eventIds: row.eventIds ?? [],
    subreviews: row.subreviews ?? [] });
}
function carriedProof(row, candidate, date, priorReviews, channel) {
  if (!row?.carriedFromRunDate || !validDate(row.carriedFromRunDate) || row.carriedFromRunDate >= date
    || row.carriedFromRunDate < dayBefore(date, 7) || !validDate(candidate.sourceDate) || candidate.sourceDate >= date
    || !carryDispositions.has(row.disposition)) return false;
  const prior = priorReviews.find(review => review.runDate === row.carriedFromRunDate && review.policy === AI_DISCOVERY_REVIEW_POLICY);
  const past = prior?.[channel]?.items?.find(item => item.id === row.id);
  const checkedDate = shanghaiDate(row.checkedAt);
  return Boolean(past && checkedDate && rowProof(past) === rowProof(row)
    && checkedDate >= candidate.sourceDate && checkedDate <= row.carriedFromRunDate);
}
function countRows(candidates, rows) {
  const map = new Map((rows ?? []).map(row => [row.id, row]));
  const counts = { total: candidates.length, reviewed: 0, covered: 0, added: 0, duplicate: 0, pending: 0, out_of_scope: 0, catalogued: 0, mixed: 0, needs_review: 0 };
  for (const candidate of candidates) {
    const row = map.get(candidate.id);
    const disposition = row?.disposition ?? 'needs_review';
    if (Object.hasOwn(counts, disposition)) counts[disposition] += 1;
    if (dispositions.has(disposition) || disposition === 'mixed') counts.reviewed += 1;
  }
  return counts;
}

export function evaluateAiDiscoveryReview({ date, memene, media, mediaConfig, review, events = [], allEvents = [], priorReviews = [], paperCatalog = null, paperEvidence = [] }) {
  const blockers = [], notices = [];
  const expected = currentCandidates(memene, media, date);
  const currentIds = new Set(events.map(event => event.id));
  const byEventId = eventMap(events, allEvents);
  const configured = (mediaConfig?.sources ?? []).filter(source => source.enabled !== false);
  const checkedSources = Array.isArray(media?.sources) ? media.sources : [];
  if (!validDate(date)) blockers.push('Discovery review requires a valid Shanghai run date');
  if (!review || review.schemaVersion !== '1.0.0' || review.policy !== AI_DISCOVERY_REVIEW_POLICY || review.runDate !== date) {
    blockers.push('Daily AI discovery review is missing, stale or has an invalid policy');
  }
  if (memene?.asOf !== date || shanghaiDate(memene?.generatedAt) !== date || !sourceStates.has(memene?.run?.status)) {
    blockers.push('Memene has no actual collection attempt for the current Shanghai day');
  } else if (memene.target?.date === date) {
    if (!memene.target.id || !Array.isArray(memene.target.candidates)) blockers.push('Memene current detail record is incomplete');
    if (review?.memene?.recordId !== memene.target.id || review?.memene?.sourceDate !== date) blockers.push('Memene review is not bound to the current exact-date record');
  } else {
    const message = memene.run?.error ?? memene.run?.message ?? memene.error;
    if (!shortReason(message)) blockers.push('Memene unavailable/no-update observation has no actual result');
    if (review?.memene?.recordId != null || review?.memene?.sourceDate != null) blockers.push('Memene no-update review incorrectly references an older record');
    notices.push(['failed', 'unavailable', 'blocked'].includes(memene.run?.status)
      ? `Memene collection ${memene.run.status}${memene.run.stage ? ' at ' + memene.run.stage : ''}: ${message}; this does not establish no update. Continue independent sources.`
      : 'Memene has no usable same-day record; retain its real source date and continue independent sources.');
  }
  if (media?.asOf !== date || shanghaiDate(media?.generatedAt) !== date) blockers.push('Chinese media discovery has no actual current-day observation');
  if (!configured.length) blockers.push('Chinese media checklist is empty or missing');
  if (review?.media?.configHash !== mediaConfigFingerprint(mediaConfig)) blockers.push('Chinese media review does not match the enabled source checklist');
  const sourceIds = new Set();
  for (const check of checkedSources) {
    if (sourceIds.has(check.id)) blockers.push(`Duplicate Chinese media source observation: ${check.id}`);
    sourceIds.add(check.id);
  }
  for (const source of configured) {
    const check = checkedSources.find(check => check.id === source.id);
    if (!check || shanghaiDate(check.checkedAt) !== date || webUrl(check.url) !== webUrl(source.url)
      || !sourceStates.has(check.status)) {
      blockers.push(`Chinese media source was not checked against its configured identity today: ${source.id}`);
      continue;
    }
    if (check.status === 'success' && source.expectedFeedTitles?.length && !source.expectedFeedTitles.includes(check.feedTitle)) {
      blockers.push(`Chinese media feed identity does not match the configured account: ${source.id}`);
    }
    if (!['success', 'stale'].includes(check.status)) {
      if (!shortReason(check.error ?? check.message)) blockers.push(`Chinese media source failure has no actual error: ${source.id}`);
      notices.push(`${source.name ?? source.id}: ${check.error ?? check.message ?? check.status}`);
    } else if (check.sameDayCandidateCount === 0) notices.push(`${source.name ?? source.id}: no same-day article observed in its public route; mirror delay remains possible.`);
  }
  for (const candidate of expected.media) {
    const source = configured.find(source => source.id === candidate.sourceId);
    if (!source) blockers.push(`Media candidate references an unchecked/disabled source: ${candidate.id}`);
    if (!validDate(candidate.sourceDate) || candidate.sourceDate > date || candidate.sourceDate < dayBefore(date, 6)) blockers.push(`Media candidate is outside the declared seven-day window: ${candidate.id}`);
    if (source?.wechatBiz) {
      const article = webUrl(candidate.originalUrl ?? candidate.url);
      if (!article || new URL(article).hostname !== 'mp.weixin.qq.com' || new URL(article).searchParams.get('__biz') !== source.wechatBiz) blockers.push(`Media candidate has a different WeChat account identity: ${candidate.id}`);
    }
  }

  function inspectRows(candidates, rows, channel, parent = null) {
    const rowMap = new Map();
    for (const row of rows ?? []) {
      if (!row?.id || rowMap.has(row.id)) blockers.push(`Duplicate or missing ${channel} review identity: ${row?.id ?? 'missing'}`);
      rowMap.set(row?.id, row);
    }
    const identities = new Set();
    for (const candidate of candidates) {
      const label = `${channel} candidate ${candidate.id}`;
      if (!candidate.id || identities.has(candidate.id)) blockers.push(`Duplicate or missing ${channel} candidate identity: ${candidate.id ?? 'missing'}`);
      identities.add(candidate.id);
      const row = rowMap.get(candidate.id);
      if (!row) { blockers.push(`Unreviewed ${label}`); continue; }
      if (row.candidateHash !== candidateFingerprint(candidate)) blockers.push(`Changed or unbound ${label}`);
      if (channel === 'media' && row.sourceId !== candidate.sourceId) blockers.push(`Review has wrong source for ${label}`);
      const composite = candidate.sourceDate === date && candidate.sections?.length > 0;
      const validDisposition = dispositions.has(row.disposition) || (composite && row.disposition === 'mixed');
      if (!validDisposition) blockers.push(`Incomplete editorial decision for ${label}`);
      if (!['high', 'normal', 'low'].includes(row.importance)) blockers.push(`Missing importance assessment for ${label}`);
      if (!shortReason(row.reason)) blockers.push(`Missing specific editorial reason for ${label}`);
      const carried = carriedProof(row, candidate, date, priorReviews, channel);
      if (shanghaiDate(row.checkedAt) !== date && !carried) blockers.push(`Review has no current-day assessment or valid historical carry proof: ${label}`);
      if (row.carriedFromRunDate && !carried) blockers.push(`Unproven historical carry for ${label}`);
      if (candidate.topNews && row.importance !== 'high') blockers.push(`Top-news candidate has not received a high-importance assessment: ${label}`);
      if (row.importance === 'high' && row.disposition === 'out_of_scope') blockers.push(`Important ${label} cannot be dismissed as out of scope`);
      if (successfulDispositions.has(row.disposition)) {
        if (!Array.isArray(row.eventIds) || !row.eventIds.length) blockers.push(`No published event link for ${label}`);
        for (const id of row.eventIds ?? []) {
          const event = byEventId.get(id);
          if (!event || event.verification !== 'verified') blockers.push(`Unresolved or unverified event ${id} for ${label}`);
          if (row.disposition === 'added' && !currentIds.has(id)) blockers.push(`Newly added ${label} is not in the current accepted batch: ${id}`);
        }
      }
      if (row.disposition === 'catalogued') {
        // The paper framework caps the digest at three. Additional verified
        // research remains public in the cumulative catalog, with an explicit
        // same-day review; it must not be falsely marked irrelevant or pending.
        const selected = events.filter(event => event.contentKind === 'paper');
        const fullBudget = selected.length === 3 && paperCatalog?.asOf === date
          && paperCatalog.dailyRecommendations?.length === 3
          && new Set(selected.map(event=>event.paper?.paperUrl)).size === 3
          && new Set(paperCatalog.dailyRecommendations).size === 3
          && selected.every(event => event.verification === 'verified'
            && paperCatalog.dailyRecommendations.some(id => paperCatalog.papers?.find(p => p.id === id)?.url === event.paper?.paperUrl));
        if (!fullBudget || !Array.isArray(row.paperIds) || !row.paperIds.length || !shortReason(row.nextAction)) {
          blockers.push(`Catalogued ${label} lacks a complete three-paper digest, catalog identities or next action`);
        }
        for (const id of row.paperIds ?? []) {
          const paper = paperCatalog?.papers?.find(p => p.id === id);
          if (!paper || !/^https:\/\/arxiv\.org\/abs\/\d{4}\.\d{4,5}$/.test(paper.url ?? '')
            || !paper.titleZh || !paper.summaryZh || !paper.limitationsZh
            || !['interpreted', 'verified'].includes(paper.reviewStatus)
            || !['abstract', 'fulltext'].includes(paper.readingLevel)
            || shanghaiDate(paper.reviewedAt) !== date
            || !paperEvidence.some(source => currentOriginalReview(source, date)
              && source.sourceClass === 'original_research' && source.url === paper.url && source.paperIds?.includes(id))
            || selected.some(event => event.paper?.paperUrl === paper.url)) {
            blockers.push(`Catalogued paper ${id} for ${label} lacks current original evidence or is already in the digest`);
          }
        }
        notices.push(`${label} retained in the public paper catalog within the daily three-paper limit: ${row.reason}`);
      }
      if (row.disposition === 'pending') {
        if (!Array.isArray(row.attemptedSources) || !row.attemptedSources.some(attempt => webUrl(attempt.url) && shortReason(attempt.error ?? attempt.result))
          || !shortReason(row.nextAction)) blockers.push(`Pending ${label} has no actual attempted source and recovery action`);
        notices.push(`${label} remains unverified: ${row.reason}`);
      }
      if (composite) {
        if (row.disposition !== 'mixed' && candidate.sections.some(section => row.subreviews?.find(sub => sub.id === section.id)?.disposition !== row.disposition)) {
          blockers.push(`Composite ${label} must expose its mixed section decisions`);
        }
        inspectRows(candidate.sections, row.subreviews, `${channel}/${candidate.id}`, row);
      }
    }
    for (const id of rowMap.keys()) if (!identities.has(id)) notices.push(`Older ${channel} review row is no longer in the observed window: ${id}`);
  }
  inspectRows(expected.memene, review?.memene?.items, 'memene');
  inspectRows(expected.media, review?.media?.items, 'media');
  const readingMap = new Map();
  for (const row of review?.readingReviews ?? []) {
    if (!row?.eventId || readingMap.has(row.eventId)) blockers.push(`Duplicate or missing Chinese-reading review identity: ${row?.eventId ?? 'missing'}`);
    readingMap.set(row?.eventId, row);
  }
  const readingCounts = { total: events.length, provided: 0, not_found: 0, needs_review: 0 };
  for (const event of events) {
    const reading = readingMap.get(event.id);
    if (!reading || !['provided', 'not_found'].includes(reading.status) || shanghaiDate(reading.checkedAt) !== date || !shortReason(reading.reason)) {
      blockers.push(`Chinese-reading entrance was not reviewed for ${event.id}`); readingCounts.needs_review += 1; continue;
    }
    const actualLinks = [...(event.readingSources ?? []), ...(event.sources ?? [])];
    if (reading.status === 'provided') {
      const chosen = reading.urls ?? [];
      if (!chosen.length || chosen.some(value => !actualLinks.some(source => webUrl(source.url, true) === webUrl(value, true) && safeChineseLink(source)))) {
        blockers.push(`Claimed Chinese-reading entrance is missing or not Chinese for ${event.id}`);
      }
      readingCounts.provided += 1;
    } else {
      if (actualLinks.some(safeChineseLink)) blockers.push(`Chinese-reading entrance exists but was marked not found for ${event.id}`);
      readingCounts.not_found += 1;
      notices.push(`No verified Chinese reading entrance found for ${event.id}: ${reading.reason}`);
    }
  }
  const counts = {
    memene: countRows(expected.memene, review?.memene?.items), media: countRows(expected.media, review?.media?.items),
    reading: readingCounts, sources: { expected: configured.length, checked: configured.filter(source => checkedSources.some(check => check.id === source.id && shanghaiDate(check.checkedAt) === date)).length },
  };
  return { policy: AI_DISCOVERY_REVIEW_POLICY, asOf: date, ready: blockers.length === 0,
    blockers: [...new Set(blockers)], notices: [...new Set(notices)], counts };
}

function draftRow(candidate, sourceId) {
  return { id: candidate.id, ...(sourceId ? { sourceId } : {}), candidateHash: candidateFingerprint(candidate),
    importance: candidate.topNews ? 'high' : 'normal', disposition: 'needs_review', reason: '', eventIds: [], checkedAt: null };
}
/** Preparing only carries an unchanged, previously reviewed historical decision. It never invents a decision. */
export function prepareAiDiscoveryReview({ date, memene, media, mediaConfig, review, events = [], allEvents = [], priorReviews = [] }) {
  if (!validDate(date)) throw new Error('Invalid discovery review date');
  const candidates = currentCandidates(memene, media, date);
  const byEventId = eventMap(events, allEvents);
  const usableEvents = row => !(row.eventIds ?? []).some(id => !byEventId.has(id));
  function prepareRows(list, previousRows, channel) {
    return list.map(candidate => {
      const previous = previousRows?.find(row => row.id === candidate.id && row.candidateHash === candidateFingerprint(candidate));
      if (previous && usableEvents(previous)) return { ...previous, ...(candidate.sourceId ? { sourceId: candidate.sourceId } : {}),
        ...(candidate.sourceDate === date && candidate.sections?.length ? { subreviews: prepareRows(candidate.sections, previous.subreviews, channel + '/' + candidate.id) } : {}) };
      let carried;
      if (validDate(candidate.sourceDate) && candidate.sourceDate < date) {
        for (const prior of [...priorReviews].sort((a, b) => b.runDate.localeCompare(a.runDate))) {
          const row = prior?.[channel]?.items?.find(row => row.id === candidate.id && row.candidateHash === candidateFingerprint(candidate));
          if (row && prior.policy === AI_DISCOVERY_REVIEW_POLICY && carryDispositions.has(row.disposition) && shortReason(row.reason)
            && usableEvents(row) && validDate(prior.runDate) && shanghaiDate(row.checkedAt)
            && shanghaiDate(row.checkedAt) >= candidate.sourceDate && shanghaiDate(row.checkedAt) <= prior.runDate
            && prior.runDate >= dayBefore(date, 7) && prior.runDate < date) {
            carried = { ...row, carriedFromRunDate: prior.runDate }; break;
          }
        }
      }
      return carried ?? { ...draftRow(candidate, candidate.sourceId),
        ...(candidate.sourceDate === date && candidate.sections?.length ? { subreviews: prepareRows(candidate.sections, [], channel + '/' + candidate.id) } : {}) };
    });
  }
  return { schemaVersion: '1.0.0', policy: AI_DISCOVERY_REVIEW_POLICY, runDate: date,
    memene: { recordId: memene?.target?.date === date ? memene.target.id : null, sourceDate: memene?.target?.date === date ? date : null,
      items: prepareRows(candidates.memene, review?.runDate === date ? review.memene?.items : [], 'memene') },
    media: { configHash: mediaConfigFingerprint(mediaConfig), items: prepareRows(candidates.media, review?.runDate === date ? review.media?.items : [], 'media') },
    readingReviews: events.map(event => review?.runDate === date && review.readingReviews?.find(row => row.eventId === event.id)
      || { eventId: event.id, status: 'needs_review', urls: [], reason: '', checkedAt: null }),
  };
}
async function readJson(root, path, fallback = null) {
  try { return JSON.parse(await readFile(resolve(root, path), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
export async function loadAiDiscoveryReview(root, date, overrides = {}) {
  const [memene, media, mediaConfig, review, latest, main, dev, priorReviews, paperCatalog, editorial] = await Promise.all([
    readJson(root, 'data/dev/memene-daily-latest.json'), readJson(root, 'data/dev/ai-media-latest.json'),
    readJson(root, 'ai-media-sources.json'), readJson(root, `data/dev/ai-discovery-review-${date}.json`),
    readJson(root, 'data/dev/ai-events-latest.json'), readJson(root, 'data/main/index.json'),
    readJson(root, 'data/dev/index.json'),
    Promise.all(Array.from({ length: 7 }, (_, index) => readJson(root, `data/dev/ai-discovery-review-${dayBefore(date, index + 1)}.json`))),
    readJson(root, 'data/dev/papers-catalog.json'), readJson(root, `data/dev/ai-editorial-repairs-${date}.json`),
  ]);
  const inputs = { date, memene, media, mediaConfig, review,
    events: overrides.events ?? latest?.aiEvents ?? [],
    // A delayed publication may leave verified historical records only in dev.
    // Those records enter the pending promotion too; validate their actual status
    // instead of requiring an earlier main publication as circular proof.
    allEvents: overrides.allEvents ?? [...new Map([...(main?.aiEvents ?? []), ...(dev?.aiEvents ?? [])]
      .map(event => [event.id, event])).values()],
    priorReviews: priorReviews.filter(Boolean), paperCatalog, paperEvidence: editorial?.verifiedSources ?? [] };
  return { ...evaluateAiDiscoveryReview(inputs), review, inputs };
}
async function writeAtomic(root, path, value) {
  const target = resolve(root, path); await mkdir(dirname(target), { recursive: true });
  const temporary = target + '.' + process.pid + '.tmp';
  await writeFile(temporary, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
  await rename(temporary, target);
}
function md(value) { return String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/\|/g, '\\|').replace(/</g, '&lt;'); }
export function renderAiDiscoveryAudit(result, inputs) {
  const candidates = currentCandidates(inputs.memene, inputs.media, inputs.date);
  const label = { covered: '已覆盖', added: '已补齐', duplicate: '重复', pending: '待核验', out_of_scope: '不收录', catalogued: '已入论文目录（日报限三篇）', mixed: '逐项混合处理', needs_review: '未审阅' };
  const table = (items, rows) => {
    const map = new Map((rows ?? []).map(row => [row.id, row]));
    return '| 候选 | 处理 | 判断与依据 | 对应事件 |\n| --- | --- | --- | --- |\n' + items.map(candidate => {
      const row = map.get(candidate.id);
      let line = `| ${md(candidate.title)} | ${label[row?.disposition] ?? '未审阅'} | ${md(row?.reason)} | ${md((row?.eventIds?.length ? row.eventIds : row?.paperIds)?.join('、'))} |`;
      if (candidate.sourceDate === inputs.date && candidate.sections?.length) {
        const sub = new Map((row?.subreviews ?? []).map(review => [review.id, review]));
        line += '\n' + candidate.sections.map(section => `| ↳ ${md(section.title)} | ${label[sub.get(section.id)?.disposition] ?? '未审阅'} | ${md(sub.get(section.id)?.reason)} | ${md(sub.get(section.id)?.eventIds?.join('、'))} |`).join('\n');
      }
      return line;
    }).join('\n');
  };
  return `# AI 资讯发布前防漏审查｜${inputs.date}\n\n- 检查状态：${result.ready ? '通过' : '未通过，仍需修复'}。\n- Memene 候选：${result.counts.memene.total}；中文媒体候选：${result.counts.media.total}。\n- 公众号/媒体入口：${result.counts.sources.checked}/${result.counts.sources.expected}；中文阅读入口：${result.counts.reading.provided}/${result.counts.reading.total}，已记录未找到 ${result.counts.reading.not_found} 条。\n- 日期保留原始发布时间；聚合阅读入口不能替代事实核验。\n\n## Memene 逐项对照\n\n${candidates.memene.length ? table(candidates.memene, inputs.review?.memene?.items) : '当日未取得可用记录，实际来源状态及限制保留在来源提示。'}\n\n## 中文媒体与公众号候选\n\n${candidates.media.length ? table(candidates.media, inputs.review?.media?.items) : '公开入口未取得可审阅候选。'}\n\n## 待修复检查\n\n${result.blockers.map(blocker => '- ' + md(blocker)).join('\n') || '- 无。'}\n\n## 来源提示与核验边界\n\n${result.notices.map(notice => '- ' + md(notice)).join('\n') || '- 无。'}\n`;
}
export async function runAiDiscoveryReview({ root = process.cwd(), date = shanghaiDate(), prepare = false, now = new Date().toISOString() } = {}) {
  const loaded = await loadAiDiscoveryReview(root, date);
  if (prepare) {
    const review = prepareAiDiscoveryReview(loaded.inputs);
    await writeAtomic(root, `data/dev/ai-discovery-review-${date}.json`, review);
    return { ...evaluateAiDiscoveryReview({ ...loaded.inputs, review }), action: 'prepared', reviewPath: `data/dev/ai-discovery-review-${date}.json` };
  }
  const { inputs, review, ...result } = loaded;
  const audit = { schemaVersion: '1.0.0', checkedAt: now, ...result,
    reviewPath: `data/dev/ai-discovery-review-${date}.json`, sourceSnapshots: { memene: inputs.memene?.generatedAt ?? null, media: inputs.media?.generatedAt ?? null } };
  await writeAtomic(root, `data/dev/ai-discovery-audit-${date}.json`, audit);
  if (date === shanghaiDate(now)) await writeAtomic(root, 'data/dev/ai-discovery-audit-latest.json', audit);
  const report = renderAiDiscoveryAudit(result, inputs);
  await writeAtomic(root, `reports/ai-discovery-audit-${date}.md`, report);
  await writeAtomic(root, `public/reports/ai-discovery-audit-${date}.md`, sanitizePublicReport(report));
  return { ...audit, action: 'checked' };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const modes = args.filter(arg => ['--prepare', '--check'].includes(arg));
  if (modes.length !== 1 || args.some(arg => !['--prepare', '--check'].includes(arg) && !arg.startsWith('--date='))) throw new Error('Use exactly one of --prepare/--check, with optional --date=YYYY-MM-DD');
  const date = args.find(arg => arg.startsWith('--date='))?.slice(7) ?? shanghaiDate();
  if (!validDate(date)) throw new Error('Invalid discovery review date');
  runAiDiscoveryReview({ date, prepare: modes[0] === '--prepare' }).then(result => {
    console.log(JSON.stringify(result, null, 2));
    if (!result.ready && modes[0] === '--check') process.exitCode = 2;
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAiSourceCoverage, currentOriginalReview, reviewedSourceForEvent } from './ai-source-policy.mjs';
import { sanitizePublicReport } from './public-source-policy.mjs';
import './network-fetch.mjs';

export function primaryMemeneReady(memene, date) {
  return memene?.asOf === date && memene.run?.status === 'success' && memene.window?.status === 'current'
    && memene.target?.date === date && Boolean(memene.target?.id) && Boolean(memene.target?.candidates?.length);
}
export function dedupeEventsById(events) {
  return [...new Map(events.map(event => [event.id, event])).values()];
}
export function reconcileReviewedEvents({ date, reportId, events, evidence }) {
  const accepted = [], pending = [];
  for (const event of dedupeEventsById(events)) {
    if (event.sourceReportId !== reportId) throw new Error(`Event ${event.id} is not bound to the current report`);
    const reviews = evidence.filter(source => reviewedSourceForEvent(source, event, date));
    if (event.verification !== 'verified' || !reviews.length) {
      pending.push({ ...event, verification: 'pending', exclusionReason: '缺少本批次与该事件绑定的原始来源事实核验，保留待核验。' });
      continue;
    }
    accepted.push({ ...event, sourceVerifiedAt: reviews.map(source => source.checkedAt).sort().at(-1),
      sourceVerifiedUrls: [...new Set(reviews.map(source => source.url))] });
  }
  return { accepted, pending };
}
export async function inspectOptionalMemene(memene, date, fetchImpl = fetch, checkedAt = new Date().toISOString()) {
  const source = { id: 'memene-daily', name: 'Memene 每日AI', optional: true, checkedAt,
    status: 'stale', sourceDate: memene?.target?.date ?? memene?.fallback?.date ?? memene?.history?.[0]?.date ?? null,
    expectedNoUpdate: [0, 6].includes(new Date(date + 'T12:00:00+08:00').getUTCDay()),
    message: '可选发现源无当日记录；继续使用其他原始来源，不阻断日报。' };
  if (memene?.asOf === date && ['failed', 'unavailable', 'blocked'].includes(memene.run?.status)) {
    const error = memene.run.error ?? memene.error ?? memene.run.message ?? 'Unknown collection failure';
    return { ...source, checkedAt: memene.generatedAt ?? checkedAt, status: memene.run.status,
      stage: memene.run.stage ?? null, expectedNoUpdate: false, error,
      message: `可选发现源本次检查失败（${memene.run.stage ?? 'collection'}）：${error}；不能据此判断没有更新，继续其他独立来源。` };
  }
  if (!primaryMemeneReady(memene, date)) return source;
  try {
    const page = await fetchImpl(`https://memene.cn/daily/${memene.target.id}?ref=website`, { signal: AbortSignal.timeout(20000) });
    const title = (await page.text()).match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
    if (!page.ok || !title.includes(date) || /未找到/.test(title)) throw new Error(`HTTP ${page.status}: ${title}`);
    return { ...source, status: 'success', idPage: page.url, recordId: memene.target.id, httpStatus: page.status,
      message: `当日结构化记录与 ID 页面日期一致，${memene.target.candidates.length} 条发现候选。` };
  } catch (error) { return { ...source, status: 'warning', message: '可选来源 ID 页面核验失败；继续其他来源。', error: error.message }; }
}
export async function runAiReconciliation({ root = process.cwd(), date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date()), fetchImpl = fetch } = {}) {
  const read = async (path, fallback = {}) => {
    try { return JSON.parse(await readFile(resolve(root, path), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
  };
  const write = async (path, value) => {
    const target = resolve(root, path); await mkdir(resolve(target, '..'), { recursive: true });
    await writeFile(target, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
  };
  const [latest, override, memene, manifest, media, priorVerification] = await Promise.all([
    read('data/dev/ai-events-latest.json'), read('data/dev/index.json'),
    read('data/dev/memene-daily-latest.json'), read(`data/dev/ai-editorial-repairs-${date}.json`),
    read('data/dev/ai-media-latest.json'), read('data/dev/ai-source-verification.json'),
  ]);
  if (latest.asOf !== date || latest.report?.id !== `ai-${date}` || latest.report.date !== date) {
    throw new Error('AI reconciliation requires the current daily batch and report identity');
  }
  const now = new Date().toISOString();
  // Editorial reviews preserve their actual observation time; stale evidence cannot be refreshed by relabelling it.
  const evidence = (manifest.verifiedSources ?? []).filter(source => currentOriginalReview(source, date));
  const { accepted, pending: newlyPending } = reconcileReviewedEvents({
    date, reportId: latest.report.id, events: [...(latest.aiEvents ?? []), ...(manifest.events ?? [])], evidence,
  });
  const resolvedPendingIds = new Set((manifest.resolvedPendingEvents ?? [])
    .filter(resolution => accepted.some(event => event.id === resolution.eventId))
    .map(resolution => resolution.pendingId));
  const pending = dedupeEventsById([
    ...(priorVerification.runDate === date ? priorVerification.pending ?? [] : []),
    ...(manifest.pendingEvents ?? []), ...newlyPending,
  ]).filter(event => !resolvedPendingIds.has(event.id) && !accepted.some(approved => approved.id === event.id));
  const coverage = buildAiSourceCoverage({ date, events: accepted, evidence, noNewEvents: manifest.noNewEvents === true });
  if (!coverage.ready) throw new Error('No current original-source coverage; cannot generate a successful AI report');
  const memeneStatus = await inspectOptionalMemene(memene, date, fetchImpl, now);
  // Refresh sources actually checked here while retaining other observations
  // from this daily batch, including unavailable optional official sources.
  const sourceStatus = [...new Map([
    ...(latest.sourceStatus ?? []),
    memeneStatus,
    ...(media.asOf === date ? (media.sources ?? media.sourceStatus ?? []).map(source => ({ ...source, optional: true })) : []),
  ].map(source => [source.id, source])).values()];
  const sourceWarnings = sourceStatus.filter(source => source.status !== 'success').map(source => `${source.name ?? source.id}：${source.message ?? source.error ?? source.status}`);
  const candidates = dedupeEventsById([...(latest.candidates ?? []), ...pending].filter(event =>
    !resolvedPendingIds.has(event.id) && !accepted.some(approved => approved.id === event.id)).map(event =>
    event.title ? { id: event.id, name: event.title, status: 'pending', source: 'editorial-review', url: event.sources?.[0]?.url,
      reason: event.exclusionReason ?? '原始来源待核验' } : event));
  const next = { ...latest, generatedAt: now, aiEvents: accepted, candidates, sourceStatus, sourceCoverage: coverage,
    run: { ...latest.run, lastSuccess: now, status: 'success', sourceWarnings,
      message: `独立批次 wagmi-ai:${date}：${coverage.verifiedSourceCount} 个原始来源完成事实核验，正式收录 ${accepted.length} 条；可选来源的未更新不阻断日报，原始事件日期保留。` } };
  const acceptedIds = new Set(accepted.map(event => event.id));
  override.aiEvents = dedupeEventsById([...(override.aiEvents ?? []).filter(event =>
    event.sourceReportId !== latest.report.id || acceptedIds.has(event.id)), ...accepted]);
  const discoveryReport = date >= '2026-10-29' ? [{
    id: `ai-discovery-${date}`, title: `候选逐条对照与中文来源检查｜${date}`,
    date, channel: 'ai', format: 'markdown', path: `/reports/ai-discovery-audit-${date}.md`,
  }] : [];
  override.reports = dedupeEventsById([...(override.reports ?? []), latest.report, ...discoveryReport]);
  const item = event => `### ${event.priority}｜${event.title}\n\n${event.summary}\n\n- 事件日期：${event.date}\n- 内容类型：${event.contentKind === 'paper' ? '前沿论文（摘要级）' : '行业事件'}\n- 重要性：${event.whyItMatters}\n- 建议动作：${event.action}\n- 事实来源：${event.sources.map(source => `[${source.label}](${source.url})`).join('、')}${event.readingSources?.length ? '\n- 中文阅读：' + event.readingSources.map(source => `[${source.label}](${source.url})`).join('、') : ''}`;
  const report = `# ark.insight AI 大事件与前沿论文日报｜${date}\n\n## 采集状态\n\n- 批次：wagmi-ai:${date}\n- 执行状态：success\n- 独立来源事实核验：${coverage.verifiedSourceCount} 个原始页面。\n- Memene：${memeneStatus.sourceDate ?? '无可用记录'}；${memeneStatus.message}\n- 正式收录：${accepted.length} 条；报告与 JSON 使用同一份事件数组。\n- 日期原则：事件日与采集日分开；保留原始发布日期。\n\n## 本批次已核验内容\n\n${accepted.map(item).join('\n\n') || '已完成原始来源复核，本批次无新增可收录事件。'}\n\n## 来源说明\n\n${sourceWarnings.map(message => '- ' + message).join('\n') || '- 可选来源无异常。'}\n\n## 核验限制\n\n${pending.map(event => '- ' + event.title + '：原始事实证据待核验，未作为正式结论。').join('\n') || '- 无待核验事件。'}\n`;
  if (!await read(`data/dev/source-archives/ai-before-repair-${date}.json`, null)) await write(`data/dev/source-archives/ai-before-repair-${date}.json`, latest);
  await write(`reports/ai-events-${date}.md`, report);
  await write(`public/reports/ai-events-${date}.md`, sanitizePublicReport(report));
  await write('data/dev/ai-source-verification.json', { runDate: date, checkedAt: now, sourceCoverage: coverage, sourceStatus, evidence, pending });
  await write('data/dev/index.json', override);
  await write('data/dev/ai-events-latest.json', next);
  await write(`data/dev/source-archives/ai-${date}.json`, next);
  return { runDate: date, currentEvents: accepted.length, verifiedSourceCount: coverage.verifiedSourceCount, pending: pending.length, sourceWarnings };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await runAiReconciliation(), null, 2));
}

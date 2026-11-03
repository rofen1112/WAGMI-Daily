import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import './network-fetch.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(root, 'data/dev/memene-daily-latest.json');
const apiBase = 'https://apis.memenews.cn/api';

export class MemeneSourceError extends Error {}

export const MEMENE_DAILY_PLAN_ID = 'cm3y1uwk40004tcv987dja7le';

export function shanghaiDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function dateMinus(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

function parseArgs(argv) {
  const value = (name, fallback) => argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=') || fallback;
  const date = value('date', shanghaiDate());
  const days = Math.max(1, Math.min(31, Number(value('days', '7')) || 7));
  return {
    date,
    days,
    planId: value('plan-id', MEMENE_DAILY_PLAN_ID),
    dryRun: argv.includes('--dry-run'),
  };
}

async function fetchJson(url, fetchImpl) {
  let response;
  try {
    response = await fetchImpl(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'WAGMI-Daily/1.0' },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new MemeneSourceError(`Memene request failed: ${error.message}`, { cause: error });
  }
  if (!response.ok) throw new MemeneSourceError(`Memene request failed: HTTP ${response.status} ${url}`);
  let payload;
  try { payload = await response.json(); }
  catch (error) { throw new MemeneSourceError(`Memene returned invalid JSON for ${url}: ${error.message}`, { cause: error }); }
  if (payload?.statusCode !== 200 || !payload.data) {
    throw new MemeneSourceError(`Memene returned an invalid payload for ${url}`);
  }
  return payload.data;
}

function historyUrl(planId, days) {
  const url = new URL('/api/summary/history', apiBase);
  url.searchParams.set('planId', planId);
  url.searchParams.set('start', '0');
  url.searchParams.set('end', String(Math.max(14, days + 7)));
  url.searchParams.set('orderByDate', 'desc');
  return url;
}

function detailUrl(id) {
  const url = new URL('/api/summary/detailsSummaryById', apiBase);
  url.searchParams.set('id', id);
  url.searchParams.set('language', 'zh-CN');
  url.searchParams.set('isMixed', 'true');
  return url;
}

function compactHistory(record) {
  if (record.topTopicList != null && !Array.isArray(record.topTopicList)) {
    throw new MemeneSourceError(`Memene history record ${record.id} has an invalid topic list`);
  }
  return {
    id: String(record.id),
    date: record.date,
    timestamp: record.timestamp,
    title: record.title || record.summaryTitle,
    summary: record.contentSummary || '',
    itemCount: Number(record.totalCount) || 0,
    relatedCount: Number(record.relatedCount) || 0,
    views: Number(record.views) || 0,
    topics: (record.topTopicList ?? []).map((item) => ({
      index: item.index,
      title: item.topic,
      related: Boolean(item.isRelated),
    })),
    pageUrl: `https://memene.cn/daily/${record.id}?ref=website`,
  };
}

export function selectHistoryWindow(records, targetDate, days = 7) {
  if (!Array.isArray(records) || records.some(record => !record || typeof record !== 'object')) {
    throw new MemeneSourceError('Memene historyRecords must contain record objects');
  }
  const from = dateMinus(targetDate, days - 1);
  const history = records
    .filter((record) => /^\d{4}-\d{2}-\d{2}$/.test(record.date ?? '') && record.date >= from && record.date <= targetDate)
    .sort((left, right) => right.date.localeCompare(left.date))
    .map(compactHistory);
  const target = history.find((record) => record.date === targetDate) ?? null;
  const expectedDates = Array.from({ length: days }, (_, index) => dateMinus(targetDate, index));
  const available = new Set(history.map((record) => record.date));
  return {
    from,
    to: targetDate,
    history,
    target,
    latest: history[0] ?? null,
    missingDates: expectedDates.filter((date) => !available.has(date)),
    status: target ? 'current' : history.length ? 'stale' : 'unavailable',
  };
}

function socialSource(item) {
  const sourceId = String(item.sourceId ?? '');
  const match = sourceId.match(/^twitter_(\d+)$/);
  if (!match || !item.authorId) return null;
  return {
    label: `${item.authorName || item.authorId} on X`,
    url: `https://x.com/${item.authorId}/status/${match[1]}`,
    type: 'social',
    publishedAt: Number.isFinite(Number(item.recordPublishedTime))
      ? new Date(Number(item.recordPublishedTime)).toISOString()
      : null,
  };
}

export function normalizeMemeneItem(item, index = 0) {
  if (!item || typeof item !== 'object') throw new MemeneSourceError('Memene detail contains a non-object item');
  for (const field of ['referenceLinks', 'associatedContent']) {
    if (item[field] != null && !Array.isArray(item[field])) throw new MemeneSourceError(`Memene detail item ${item.id} has invalid ${field}`);
  }
  const references = (item.referenceLinks ?? [])
    .filter((url) => /^https:\/\//i.test(url))
    .map((url) => {
      let parsed;
      try { parsed = new URL(url); }
      catch { throw new MemeneSourceError(`Memene detail item ${item.id} has an invalid reference URL`); }
      return { label: item.sourceName || parsed.hostname, url, type: 'reference' };
    });
  const social = (item.associatedContent ?? []).map(socialSource).filter(Boolean);
  const sources = [...references, ...social].filter((source, position, list) => (
    list.findIndex((candidate) => candidate.url === source.url) === position
  ));
  return {
    index: index + 1,
    id: String(item.id),
    title: item.title,
    summary: item.briefContent || item.shortSummary || '',
    category: item.category || '未分类',
    related: Boolean(item.isRelated),
    topNews: Boolean(item.isTopNews),
    sourceName: item.sourceName || null,
    tags: item.tags ?? [],
    sources,
    verificationStatus: sources.length ? 'source_available' : 'needs_original_source',
  };
}

export function buildSnapshot({ targetDate, days, planId, historyData, detailData, generatedAt = new Date().toISOString() }) {
  if (!Array.isArray(historyData.historyRecords)) throw new MemeneSourceError('Memene historyRecords must be an array');
  const selected = selectHistoryWindow(historyData.historyRecords ?? [], targetDate, days);
  if (selected.target && !detailData) throw new MemeneSourceError(`Memene details missing for target ${selected.target.id}`);
  if (detailData && selected.target && String(detailData.id) !== selected.target.id) {
    throw new MemeneSourceError(`Memene detail id ${detailData.id} does not match target ${selected.target.id}`);
  }
  if (detailData && detailData.date !== targetDate) {
    throw new MemeneSourceError(`Memene detail date ${detailData.date} does not match target ${targetDate}`);
  }
  if (detailData && !Array.isArray(detailData.content)) throw new MemeneSourceError('Memene detail content must be an array');
  return {
    schemaVersion: '1.0.0',
    generatedAt,
    asOf: targetDate,
    source: {
      id: 'memene-daily-ai',
      name: 'Memene 每日AI',
      priority: 1,
      role: 'discovery_and_cross_check',
      planId,
      historyEndpoint: `${apiBase}/summary/history`,
      detailEndpoint: `${apiBase}/summary/detailsSummaryById`,
      verificationRule: '聚合摘要仅用于发现；发布前必须核验官方页面、官方账号、论文项目页或可信媒体原文。',
    },
    window: {
      from: selected.from,
      to: selected.to,
      days,
      status: selected.status,
      missingDates: selected.missingDates,
    },
    history: selected.history,
    target: selected.target ? {
      ...selected.target,
      introduction: detailData?.introduction ?? null,
      candidates: (detailData?.content ?? []).map(normalizeMemeneItem),
    } : null,
    fallback: selected.target ? null : selected.latest,
    run: {
      id: 'memene-daily-ai',
      status: selected.target ? 'success' : selected.history.length ? 'warning' : 'failed',
      message: selected.target
        ? `已解析 ${targetDate} Memene 每日AI，共 ${detailData?.content?.length ?? selected.target.itemCount} 条候选。`
        : `Memene 每日AI 尚未更新至 ${targetDate}；最近可用日期为 ${selected.latest?.date ?? '无'}。`,
    },
  };
}

async function writeAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporary, path);
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

async function archiveObservation(workspaceRoot, snapshot) {
  const digest = createHash('sha256').update(JSON.stringify(snapshot)).digest('hex').slice(0, 16);
  const observedDate = validDate(snapshot.asOf ?? '') ? snapshot.asOf : 'unknown-date';
  const observedTime = String(snapshot.generatedAt ?? 'unknown-time').replace(/[^\w-]/g, '-');
  const path = resolve(workspaceRoot, `data/dev/source-archives/memene-observations/${observedDate}/${observedTime}-${digest}.json`);
  await writeAtomic(path, snapshot);
}

export async function runMemeneDiscovery({
  root: workspaceRoot = root, targetDate = shanghaiDate(), days = 7, planId = MEMENE_DAILY_PLAN_ID,
  dryRun = false, fetchImpl = globalThis.fetch, generatedAt = new Date().toISOString(),
} = {}) {
  if (!validDate(targetDate)) throw new Error(`Invalid --date value: ${targetDate}`);
  if (!Number.isInteger(days) || days < 1 || days > 31) throw new Error('Invalid Memene history window');
  if (Number.isNaN(Date.parse(generatedAt))) throw new Error('Invalid Memene observation time');
  let historyData, snapshot;
  let stage = 'history';
  try {
    historyData = await fetchJson(historyUrl(planId, days), fetchImpl);
    if (!Array.isArray(historyData.historyRecords)) throw new MemeneSourceError('Memene historyRecords must be an array');
    const selected = selectHistoryWindow(historyData.historyRecords, targetDate, days);
    stage = 'detail';
    const detailData = selected.target ? await fetchJson(detailUrl(selected.target.id), fetchImpl) : null;
    stage = 'validation';
    snapshot = buildSnapshot({ targetDate, days, planId, historyData, detailData, generatedAt });
  } catch (error) {
    if (!(error instanceof MemeneSourceError)) throw error;
    // A failed optional check is a dated observation, not evidence of no news.
    // Keep any history actually read, but never expose an unvalidated detail as target.
    // Retain usable history without re-triggering the malformed-data error.
    let observed = selectHistoryWindow([], targetDate, days);
    try { observed = selectHistoryWindow(Array.isArray(historyData?.historyRecords) ? historyData.historyRecords : [], targetDate, days); }
    catch (historyError) { if (!(historyError instanceof MemeneSourceError)) throw historyError; }
    snapshot = buildSnapshot({ targetDate, days, planId, historyData: { historyRecords: [] }, detailData: null, generatedAt });
    snapshot.history = observed.history;
    snapshot.fallback = observed.history.find(record => record.date < targetDate) ?? null;
    snapshot.window = { from: observed.from, to: observed.to, days, status: 'unavailable', missingDates: observed.missingDates };
    snapshot.error = error.message;
    snapshot.run = { id: 'memene-daily-ai', status: 'failed', stage, error: error.message,
      message: `Memene 可选来源本次检查失败（${stage}）；不能据此判断没有更新，继续其他独立来源。` };
  }

  if (!dryRun) {
    const checkpoint = resolve(workspaceRoot, 'data/dev/memene-daily-latest.json');
    const dated = resolve(workspaceRoot, `data/dev/source-archives/memene-${targetDate}.json`);
    const currentDay = targetDate === shanghaiDate(new Date(generatedAt));
    // Preserve both prior success and failure observations before replacing a checkpoint.
    for (const priorPath of currentDay ? [dated, checkpoint] : [dated]) {
      try { await archiveObservation(workspaceRoot, JSON.parse(await readFile(priorPath, 'utf8'))); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    await archiveObservation(workspaceRoot, snapshot);
    await writeAtomic(dated, snapshot);
    // A historical replay must never replace today's collection checkpoint.
    if (currentDay) await writeAtomic(checkpoint, snapshot);
  }
  return snapshot;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshot = await runMemeneDiscovery({ targetDate: args.date, days: args.days, planId: args.planId, dryRun: args.dryRun });
  console.log(JSON.stringify({
    asOf: snapshot.asOf,
    status: snapshot.window.status,
    availableDates: snapshot.history.map((record) => record.date),
    missingDates: snapshot.window.missingDates,
    targetId: snapshot.target?.id ?? null,
    candidates: snapshot.target?.candidates.length ?? 0,
    output: args.dryRun ? null : outputPath,
    error: snapshot.error ?? null,
  }, null, 2));
  if (snapshot.run.status === 'failed') process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

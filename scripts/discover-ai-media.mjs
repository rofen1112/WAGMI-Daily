import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { parseJuyaSections } from './juya-sections.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DAY_MS = 86_400_000;
const WINDOW_DAYS = 7;
const trackingKeys = /^(utm_.+|ref|from|source|spm|fbclid|gclid)$/i;

export function shanghaiDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(value));
  const fields = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return [fields.year, fields.month, fields.day].join('-');
}

function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value + 'T00:00:00Z'))
    && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
}

export function mediaWindow(targetDate) {
  if (!validDate(targetDate)) throw new Error('Invalid target date: ' + targetDate);
  return {
    from: new Date(Date.parse(targetDate + 'T00:00:00Z') - (WINDOW_DAYS - 1) * DAY_MS).toISOString().slice(0, 10),
    to: targetDate, days: WINDOW_DAYS,
  };
}

function decode(value) {
  return String(value ?? '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (match, code) => {
      const point = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match;
    })
    .replace(/&(?:amp|quot|apos|lt|gt|nbsp);/g, (entity) => ({
      '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ',
    })[entity]).replace(/\s+/g, ' ').trim();
}

function scalar(value) {
  return typeof value === 'object' && value !== null ? value['#text'] ?? '' : value ?? '';
}

function attribute(tag, name) {
  return tag.match(new RegExp('\\b' + name + '\\s*=\\s*(["\'])([\\s\\S]*?)\\1', 'i'))?.[2] ?? '';
}

export function normalizeMediaUrl(value, baseUrl) {
  try {
    const url = new URL(decode(value), baseUrl);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) if (trackingKeys.test(key)) url.searchParams.delete(key);
    url.searchParams.sort();
    return url.href;
  } catch { return null; }
}

function articleUrl(value, source) {
  const url = normalizeMediaUrl(value, source.url);
  if (!url) return null;
  const parsed = new URL(url);
  if (source.allowedArticleHosts?.length && !source.allowedArticleHosts.includes(parsed.hostname)) return null;
  if (source.articlePathPattern && !new RegExp(source.articlePathPattern).test(parsed.pathname)) return null;
  // A shared WeChat host is not an account identity. Keep each account's biz
  // boundary when a public RSS mirror contains links to other accounts.
  if (source.wechatBiz && parsed.hostname === 'mp.weixin.qq.com'
    && parsed.searchParams.get('__biz') !== source.wechatBiz) return null;
  return url;
}

function publication(value) {
  const raw = String(scalar(value)).trim();
  const dateOnly = raw.match(/^(\d{4})[-./](\d{2})[-./](\d{2})$/);
  if (dateOnly) {
    const sourceDate = dateOnly.slice(1).join('-');
    return validDate(sourceDate) ? { sourceDate, publishedAt: sourceDate, datePrecision: 'date' } : null;
  }
  // Relative labels and a URL's date are never a substitute for a publication date.
  if (!/\d{4}/.test(raw) || !/(?:GMT|UTC|[+-]\d{2}:?\d{2}|Z$)/i.test(raw)) return null;
  const time = Date.parse(raw);
  if (!Number.isFinite(time)) return null;
  return { sourceDate: shanghaiDate(time), publishedAt: new Date(time).toISOString(), datePrecision: 'timestamp' };
}

function record({ title, url, date, summary = '', content = '', tags = [] }, source) {
  const originalUrl = articleUrl(url, source);
  const published = publication(date);
  const cleanTitle = decode(title);
  if (!originalUrl || !published || cleanTitle.length < 2) return null;
  return {
    id: 'media-' + createHash('sha256').update(originalUrl).digest('hex').slice(0, 20),
    title: cleanTitle, summary: decode(summary).slice(0, 600),
    originalUrl, url: originalUrl, ...published,
    sourceId: source.id, sourceName: source.name, channel: source.channel, sourceUrl: source.url,
    tags: [...new Set(tags.map(decode).filter(Boolean))].slice(0, 12),
    language: source.language ?? 'zh', sourceClass: source.sourceClass ?? 'trusted_media',
    readingRole: source.readingRole ?? 'coverage',
    contentExcerpt: decode(content || summary).slice(0, 2400),
    contentHash: content ? createHash('sha256').update(String(content)).digest('hex') : null,
    referencedUrls: [...new Set([...String(content).matchAll(/href\s*=\s*["']([^"']+)["']/gi)]
      .map((match) => normalizeMediaUrl(match[1], originalUrl)).filter(Boolean))].slice(0, 100),
    ...(new URL(originalUrl).hostname === 'daily.juya.uk'
      ? { composite: true, sections: parseJuyaSections(content, originalUrl) } : {}),
    verificationStatus: 'needs_original_fact_review',
    requiresFactVerification: true, requiresOfficialVerification: false, publishingEligible: false,
  };
}

export function parseMediaFeed(xml, source) {
  if (XMLValidator.validate(xml) !== true) throw new Error('Invalid RSS/Atom XML');
  const parsed = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', parseTagValue: false }).parse(xml);
  const channel = parsed.rss?.channel;
  const feed = parsed.feed;
  if (!channel && !feed) throw new Error('Response is not an RSS/Atom article feed');
  const feedTitle = decode(scalar(channel?.title ?? feed?.title));
  if (source.expectedFeedTitles?.length && !source.expectedFeedTitles.includes(feedTitle)) {
    throw new Error('Feed identity mismatch: expected ' + source.expectedFeedTitles.join(' / ') + ', received ' + feedTitle);
  }
  const entries = [channel?.item ?? feed?.entry ?? []].flat();
  const records = entries.map((entry) => {
    const atomLinks = [entry.link ?? []].flat();
    const atomUrl = atomLinks.find((link) => typeof link === 'object' && (!link['@_rel'] || link['@_rel'] === 'alternate'))?.['@_href'];
    return record({
      title: scalar(entry.title), url: atomUrl ?? scalar(entry.link),
      date: entry.pubDate ?? entry.published ?? entry['dc:date'],
      summary: scalar(entry.description ?? entry.summary),
      content: scalar(entry['content:encoded'] ?? entry.content ?? entry.description ?? entry.summary),
      tags: [entry.category ?? []].flat().map((item) => typeof item === 'object' ? item['@_term'] ?? scalar(item) : item),
    }, source);
  }).filter(Boolean);
  return { records, feedTitle, observedItems: entries.length, rejectedItems: entries.length - records.length, structured: true };
}

export function parseMediaArticleList(html, source) {
  const records = [];
  let observedItems = 0;
  for (const [, href, body] of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    if (!articleUrl(href, source)) continue;
    const heading = body.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1];
    if (!heading) continue;
    observedItems += 1;
    const timeTag = body.match(/<time\b[^>]*>/i)?.[0] ?? '';
    const explicitDate = attribute(timeTag, 'datetime')
      || decode(body.match(/<div\b[^>]*class=["'][^"']*\bm\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? '').match(/\b\d{4}[-./]\d{2}[-./]\d{2}\b/)?.[0];
    const item = record({
      title: heading, url: href, date: explicitDate,
      summary: body.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? '',
      tags: [body.match(/<span\b[^>]*class=["'][^"']*\bcat\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? ''],
    }, source);
    if (item) records.push(item);
  }
  return { records, observedItems, rejectedItems: observedItems - records.length, structured: observedItems > 0 };
}

export function selectMediaWindow(records, targetDate) {
  const window = mediaWindow(targetDate);
  const unique = new Map();
  for (const item of records) {
    if (!validDate(item.sourceDate) || item.sourceDate < window.from || item.sourceDate > window.to) continue;
    const key = normalizeMediaUrl(item.originalUrl ?? item.url);
    if (!key) continue;
    if (!unique.has(key)) unique.set(key, { ...item, originalUrl: key, url: key });
  }
  return [...unique.values()].sort((left, right) => right.sourceDate.localeCompare(left.sourceDate)
    || right.publishedAt.localeCompare(left.publishedAt) || left.originalUrl.localeCompare(right.originalUrl));
}

function restriction(html, finalUrl, status) {
  if ([401, 403, 429].includes(status)) return 'Public source access restricted: HTTP ' + status;
  if (/\/(?:sign_?in|log_?in)(?:[/?#]|$)/i.test(finalUrl)) return 'Public source redirected to login';
  const title = decode(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  if (/验证码|captcha|access denied|安全验证|访问受限/i.test(title)) return 'Public source requires verification or denies access';
  if (/机器之心[·\s]*数据服务/.test(title) || /\/data-service(?:[/?#]|$)/.test(finalUrl)) return 'Public article list replaced by a data-service page';
  if (/^(?:登录|用户登录|请登录|sign in|login)/i.test(title)) return 'Public source requires login';
  return null;
}

export async function discoverMediaCandidates(sources, {
  targetDate = shanghaiDate(), generatedAt = new Date().toISOString(), fetchImpl = globalThis.fetch,
  timeoutMs = 20_000,
} = {}) {
  const window = mediaWindow(targetDate);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) throw new Error('Invalid fetch timeout');
  const checks = await Promise.all(sources.filter((source) => source.enabled !== false).map(async (source) => {
    const check = {
      id: source.id, name: source.name, channel: source.channel, url: source.url,
      language: source.language ?? 'zh', accountId: source.accountId ?? null,
      collectionMode: source.collectionMode ?? source.channel, readingRole: source.readingRole ?? 'coverage',
      checkedAt: generatedAt, status: 'failed', sameDayCandidateCount: null,
      sameDayStatus: 'unverified', candidates: [],
    };
    try {
      const response = await fetchImpl(source.url, {
        headers: { Accept: source.format === 'rss' ? 'application/rss+xml, application/atom+xml, application/xml, text/xml' : 'text/html', 'User-Agent': 'WAGMI-Daily/1.0' },
        signal: AbortSignal.timeout(timeoutMs),
      });
      const html = await response.text();
      Object.assign(check, {
        httpStatus: response.status, finalUrl: response.url || source.url,
        contentHash: createHash('sha256').update(html).digest('hex'),
      });
      const blocked = restriction(html, check.finalUrl, response.status);
      if (blocked) { check.status = 'blocked'; check.error = blocked; return check; }
      if (!response.ok) throw new Error('Public source HTTP ' + response.status);
      const parsed = source.format === 'rss' ? parseMediaFeed(html, source) : parseMediaArticleList(html, source);
      Object.assign(check, {
        feedTitle: parsed.feedTitle ?? null,
        observedItems: parsed.observedItems, rejectedItems: parsed.rejectedItems,
        latestSourceDate: parsed.records.map((item) => item.sourceDate).sort().at(-1) ?? null,
        candidates: selectMediaWindow(parsed.records, targetDate),
        sameDayCandidateCount: selectMediaWindow(parsed.records, targetDate).filter((item) => item.sourceDate === targetDate).length,
      });
      if (!parsed.structured || (parsed.observedItems > 0 && !parsed.records.length)) {
        check.status = 'partial'; check.error = 'Page reachable; no usable article publication dates and URLs extracted';
      } else if (!parsed.records.length) {
        check.status = 'partial'; check.error = 'Feed reachable but contains no dated article records; no-push status is unverified';
      } else {
        check.status = parsed.records.length && !check.candidates.length ? 'stale' : 'success';
      }
      check.sameDayStatus = check.sameDayCandidateCount ? 'items_observed'
        : check.status === 'success' ? 'not_observed_in_public_feed' : 'unverified';
    } catch (error) {
      check.error = error instanceof Error ? error.message : String(error);
    }
    return check;
  }));
  const candidates = selectMediaWindow(checks.flatMap((source) => source.candidates), targetDate)
    .map((candidate) => ({ ...candidate, discoveredAt: generatedAt }));
  return {
    schemaVersion: '1.0.0', generatedAt, asOf: targetDate, window,
    role: 'supplemental_discovery_only',
    verificationRule: '中文媒体与公众号原文可作为阅读和事实核验来源；发布前须阅读正文、核对日期与作者，区分事实、评论和传闻。聚合摘要只用于发现；未核验条目不得直接正式发布。',
    sources: checks.map(({ candidates: sourceCandidates, ...source }) => ({ ...source, candidateCount: sourceCandidates.length })),
    candidates,
    run: {
      id: 'ai-media-discovery',
      status: candidates.length ? 'success' : checks.some((source) => ['success', 'stale'].includes(source.status)) ? 'warning' : 'failed',
      message: '已检查 ' + checks.length + ' 个中文媒体/公众号入口，发现 ' + candidates.length + ' 条近 ' + WINDOW_DAYS + ' 日候选；公开入口观察到 ' + candidates.filter((item) => item.sourceDate === targetDate).length + ' 条当日文章。发布前须完成原文事实核验。',
    },
  };
}

async function writeAtomic(path, snapshot) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = path + '.' + process.pid + '.tmp';
  await writeFile(temporary, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  await rename(temporary, path);
}

export async function runMediaDiscovery({
  root = projectRoot, targetDate = shanghaiDate(), dryRun = false, timeoutMs = 20_000,
  fetchImpl = globalThis.fetch, generatedAt = new Date().toISOString(),
} = {}) {
  const config = JSON.parse(await readFile(resolve(root, 'ai-media-sources.json'), 'utf8'));
  if (!Array.isArray(config.sources)) throw new Error('Missing ai-media-sources.json sources');
  const snapshot = await discoverMediaCandidates(config.sources, { targetDate, generatedAt, timeoutMs, fetchImpl });
  if (!dryRun) {
    await writeAtomic(resolve(root, 'data/dev/source-archives/ai-media-' + targetDate + '.json'), snapshot);
    // Historical replay must not replace the current-day checkpoint.
    if (targetDate === shanghaiDate(generatedAt)) await writeAtomic(resolve(root, 'data/dev/ai-media-latest.json'), snapshot);
  }
  return snapshot;
}

async function main() {
  const args = process.argv.slice(2);
  for (const arg of args) if (arg !== '--dry-run' && !/^--(?:date|timeout-ms)=/.test(arg)) throw new Error('Unknown argument: ' + arg);
  const targetDate = args.find((arg) => arg.startsWith('--date='))?.slice(7) ?? shanghaiDate();
  const timeoutMs = Number(args.find((arg) => arg.startsWith('--timeout-ms='))?.slice(13) ?? 20_000);
  mediaWindow(targetDate);
  await import('./network-fetch.mjs');
  const dryRun = args.includes('--dry-run');
  const snapshot = await runMediaDiscovery({ targetDate, dryRun, timeoutMs });
  console.log(JSON.stringify({
    asOf: snapshot.asOf, status: snapshot.run.status, window: snapshot.window,
    candidates: snapshot.candidates.length, sources: snapshot.sources,
    output: dryRun ? null : resolve(projectRoot, 'data/dev/source-archives/ai-media-' + targetDate + '.json'),
    latestOutput: !dryRun && targetDate === shanghaiDate(snapshot.generatedAt) ? resolve(projectRoot, 'data/dev/ai-media-latest.json') : null,
    verificationRule: snapshot.verificationRule,
  }, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
}


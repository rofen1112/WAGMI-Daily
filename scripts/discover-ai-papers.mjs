import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import './network-fetch.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = resolve(root, 'ai-paper-sources.json');
const outputPath = resolve(root, 'data/dev/ai-papers-latest.json');

export function shanghaiDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function dateMinus(date, days) {
  const point = new Date(`${date}T00:00:00Z`);
  point.setUTCDate(point.getUTCDate() - days);
  return point.toISOString().slice(0, 10);
}

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[^a-z0-9+.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanAbstract(value = '') {
  return String(value)
    .replace(/^arXiv:[^\n]+\n?/i, '')
    .replace(/^Abstract:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function arxivIdFromUrl(url = '') {
  return String(url).match(/\/abs\/([^/?#]+)/)?.[1]?.replace(/v\d+$/i, '') ?? null;
}

export function parseArxivRss(xml) {
  const validation = XMLValidator.validate(xml);
  if (validation !== true) throw new Error('Paper source returned invalid XML');
  const parsed = new XMLParser({ ignoreAttributes: false, trimValues: true }).parse(xml);
  if (!parsed?.rss || !Object.hasOwn(parsed.rss, 'channel')) {
    throw new Error('Paper source returned a non-RSS response');
  }
  const items = asArray(parsed.rss.channel?.item);
  const papers = items.map((item) => {
    const arxivId = arxivIdFromUrl(item.link);
    const publishedAt = Number.isNaN(Date.parse(item.pubDate)) ? null : new Date(item.pubDate).toISOString();
    return {
      id: arxivId ? `arxiv-${arxivId.replace(/\./g, '-')}` : String(item.guid?.['#text'] ?? item.link),
      arxivId,
      source: 'arxiv',
      titleOriginal: String(item.title ?? '').replace(/\s+/g, ' ').trim(),
      abstract: cleanAbstract(item.description),
      authors: String(item['dc:creator'] ?? '').split(',').map((value) => value.trim()).filter(Boolean),
      categories: asArray(item.category).map(String),
      announceType: String(item['arxiv:announce_type'] ?? 'unknown'),
      publishedAt,
      rssAnnouncedAt: publishedAt,
      dateSemantics: 'rss_announcement',
      url: String(item.link ?? ''),
      pdfUrl: arxivId ? `https://arxiv.org/pdf/${arxivId}` : null,
      licenseUrl: String(item['dc:rights'] ?? '') || null,
    };
  }).filter((paper) => paper.arxivId && paper.titleOriginal && paper.abstract && paper.url.startsWith('https://'));
  if (papers.length !== items.length) throw new Error('Paper source contains incomplete RSS items');
  return papers;
}

export function scorePaper(paper, config) {
  const title = normalizeText(paper.titleOriginal);
  const abstract = normalizeText(paper.abstract);
  const topicMatches = [];

  for (const topic of config.topics ?? []) {
    let topicScore = 0;
    const matchedTerms = [];
    for (const [rawTerm, weight] of Object.entries(topic.terms ?? {})) {
      const term = normalizeText(rawTerm);
      if (!term) continue;
      if (title.includes(term)) {
        topicScore += Number(weight) * 2;
        matchedTerms.push(rawTerm);
      } else if (abstract.includes(term)) {
        topicScore += Number(weight);
        matchedTerms.push(rawTerm);
      }
    }
    if (topicScore > 0) {
      topicMatches.push({
        id: topic.id,
        labelZh: topic.labelZh,
        board: topic.board,
        score: topicScore,
        matchedTerms: matchedTerms.slice(0, 8),
      });
    }
  }

  topicMatches.sort((left, right) => right.score - left.score || left.labelZh.localeCompare(right.labelZh, 'zh-CN'));
  const categoryBonus = paper.categories.some((category) => ['cs.GR', 'cs.RO'].includes(category)) ? 2 : 0;
  const newPaperBonus = paper.announceType === 'new' ? 2 : 0;
  const crossDomainBonus = Math.min(3, Math.max(0, topicMatches.length - 1));
  const score = topicMatches.reduce((total, topic) => total + topic.score, 0) + categoryBonus + newPaperBonus + crossDomainBonus;
  const thresholds = config.daily?.thresholds ?? { deepRead: 18, digest: 11, watch: 7 };
  const reviewTier = score >= thresholds.deepRead
    ? 'deep'
    : score >= thresholds.digest
      ? 'digest'
      : score >= thresholds.watch
        ? 'watch'
        : 'ignore';

  return {
    ...paper,
    score,
    reviewTier,
    matchedTopics: topicMatches,
    targetBoards: ['Frontier Paper / Research', ...new Set(topicMatches.map((topic) => topic.board))],
    reasonsZh: topicMatches.slice(0, 3).map((topic) => `${topic.labelZh}：${topic.matchedTerms.join('、')}`),
    interpretationStatus: 'metadata_only',
  };
}

export function buildPaperSnapshot({ papers, config, asOf, generatedAt = new Date().toISOString() }) {
  const from = dateMinus(asOf, Math.max(1, Number(config.daily?.windowDays ?? 3)));
  const recent = papers.filter((paper) => !paper.publishedAt || paper.publishedAt.slice(0, 10) >= from);
  const ranked = recent
    .map((paper) => scorePaper(paper, config))
    .filter((paper) => paper.reviewTier !== 'ignore')
    .sort((left, right) => right.score - left.score || String(right.publishedAt).localeCompare(String(left.publishedAt)) || left.titleOriginal.localeCompare(right.titleOriginal));
  const candidates = ranked.slice(0, Number(config.daily?.maxCandidates ?? 60));
  const catalogCandidates = ranked.slice(0, Number(config.catalog?.maxCandidatesPerRun ?? 1000));
  const budgets = config.daily?.budgets ?? { deepRead: 10, fullText: 3, digest: 20 };
  const deepCandidates = candidates.filter((paper) => paper.reviewTier === 'deep');
  const selectedDeepReads = [];
  const selectedTopics = new Set();
  for (const paper of deepCandidates) {
    const primaryTopic = paper.matchedTopics[0]?.id ?? paper.id;
    if (selectedTopics.has(primaryTopic)) continue;
    selectedTopics.add(primaryTopic);
    selectedDeepReads.push(paper);
    if (selectedDeepReads.length >= budgets.deepRead) break;
  }
  for (const paper of deepCandidates) {
    if (selectedDeepReads.length >= budgets.deepRead) break;
    if (!selectedDeepReads.some((selected) => selected.id === paper.id)) selectedDeepReads.push(paper);
  }
  const deepReadQueue = selectedDeepReads.map((paper) => paper.id);

  return {
    schemaVersion: '1.0.0',
    generatedAt,
    asOf,
    sourcePlan: {
      daily: 'arXiv 官方 RSS 元数据初筛；只对高分候选做中文解读。',
      weekly: 'ICLR、CVPR、ICML、NeurIPS 官方论文页与放榜窗口批量复核。',
      conferences: config.conferences ?? [],
    },
    budgets,
    stats: {
      fetched: papers.length,
      recent: recent.length,
      relevant: ranked.length,
      catalogEligible: catalogCandidates.length,
      deepReadQueued: deepReadQueue.length,
    },
    candidates,
    catalogCandidates,
    deepReadQueue,
    run: {
      id: 'wagmi-ai-papers',
      channel: 'ai',
      schedule: '每天 07:30（随 AI 大事件）',
      status: 'success',
      message: `arXiv 元数据抓取完成：本次返回 ${papers.length} 篇，累计入库候选 ${catalogCandidates.length} 篇，每日编辑候选 ${candidates.length} 篇，安排深读 ${deepReadQueue.length} 篇。返回 0 篇表示本次无新增，不视为采集失败。`,
    },
  };
}

export function paperFeedUrl(categories) {
  return `https://rss.arxiv.org/rss/${categories.join('+')}`;
}

async function fetchText(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url, {
      headers: { Accept: 'application/rss+xml,application/xml,text/xml', 'User-Agent': 'ark.insight/1.0 (AI paper discovery; local use)' },
      signal: AbortSignal.timeout(60_000),
    });
    if (response.ok) return { text: await response.text(), status: response.status, contentType: response.headers.get('content-type'), checkedAt: new Date().toISOString() };
    if (response.status !== 429 || attempt === retries) throw new Error(`Paper source failed: HTTP ${response.status} ${url}`);
    await new Promise((resolveWait) => setTimeout(resolveWait, 4_000 * (attempt + 1)));
  }
  throw new Error(`Paper source failed: ${url}`);
}

async function writeAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporary, path);
}

function parseArgs(argv) {
  const value = (name, fallback) => argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=') || fallback;
  return { date: value('date', shanghaiDate()), dryRun: argv.includes('--dry-run') };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const url = paperFeedUrl(config.daily.categories);
  const response = await fetchText(url);
  const papers = parseArxivRss(response.text);
  const snapshot = buildPaperSnapshot({ papers, config, asOf: args.date });
  const channel = new XMLParser().parse(response.text).rss.channel;
  snapshot.sourceStatus = [{ id: 'arxiv-rss', status: 'success', url, checkedAt: response.checkedAt,
    httpStatus: response.status, contentType: response.contentType, count: papers.length,
    feedPublishedAt: channel.pubDate ?? null, feedBuiltAt: channel.lastBuildDate ?? null }];
  if (!args.dryRun) await writeAtomic(outputPath, snapshot);
  console.log(JSON.stringify({
    asOf: snapshot.asOf,
    source: url,
    stats: snapshot.stats,
    deepReadQueue: snapshot.deepReadQueue,
    top: snapshot.candidates.slice(0, 10).map((paper) => ({ id: paper.id, score: paper.score, tier: paper.reviewTier, title: paper.titleOriginal })),
    output: args.dryRun ? null : outputPath,
  }, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

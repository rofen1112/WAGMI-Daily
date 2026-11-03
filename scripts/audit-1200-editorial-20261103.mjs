import { readFile, writeFile } from 'node:fs/promises';
import { candidateFingerprint } from './ai-discovery-review.mjs';
import { XMLParser } from 'fast-xml-parser';

const date = '2026-11-03';
const base = `data/dev/source-archives/audit-1200-${date}`;
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const write = async (path, value) => writeFile(path, JSON.stringify(value, null, 2) + '\n');
const manifestPath = `data/dev/ai-editorial-repairs-${date}.json`;
const reviewPath = `data/dev/ai-discovery-review-${date}.json`;
const [manifest, review, media, memene, sources, extra, beforeReview] = await Promise.all([
  read(manifestPath), read(reviewPath), read('data/dev/ai-media-latest.json'),
  read('data/dev/memene-daily-latest.json'), read(`${base}/source-results.json`),
  read(`${base}/extra-results.json`), read(`${base}/before-ai-discovery-review-${date}.json`),
]);
const now = new Date().toISOString();
const decisions = [
  ['media-0be39f43d2b261755f18', 'normal', 'out_of_scope', [], '完整读取量子位获授权转载的B站稿件：活动明确为10月31日；具身智能落地与世界模型降本属于嘉宾预期，未有本窗口新模型、测试或产品交付，不将11月3日报道日冒充活动日。'],
  ['media-2f75960bd5a3d720fd8d', 'high', 'covered', ['ai-2026-11-03-weight-space'], '已读量子位完整中文正文，与今天已独立核验的作者博客逐项对照：0.016%权重、7.9%至48.1%及50次调用预算是同一初步实验；补入中文阅读，不重复造事件，不将特定测试推广为普遍免训练提升。'],
  ['media-04ee5ea2d0db419ba9c2', 'high', 'covered', ['ai-2026-11-03-pixverse-integration'], '已读量子位完整正文，页末明确爱诗科技供稿、授权转载；与11月2日已收录的新智元PixVerse合作稿为同一集成和教育计划。补充中文阅读，保留厂商自述及课程尚待陆续上线的边界。'],
];
for (const [id, importance, disposition, eventIds, reason] of decisions) {
  const row = review.media.items.find(item => item.id === id);
  const candidate = media.candidates.find(item => item.id === id);
  if (!row || row.candidateHash !== candidateFingerprint(candidate)) throw new Error(`Candidate changed: ${id}`);
  Object.assign(row, { importance, disposition, eventIds, reason, checkedAt: now });
}
for (const [eventId, sourceIndex, label] of [
  ['ai-2026-11-03-weight-space', 1, '量子位 · 权重空间编程中文解读'],
  ['ai-2026-11-03-pixverse-integration', 2, '量子位 · 爱诗科技供稿（厂商自述）'],
]) {
  const event = manifest.events.find(item => item.id === eventId);
  const source = sources[sourceIndex];
  if (!source.success) throw new Error('Missing Chinese article');
  event.readingSources = [{ label, url: source.url, language: 'zh', role: 'coverage' },
    ...(event.readingSources ?? []).filter(item => item.url !== source.url)];
  const row = review.readingReviews.find(item => item.eventId === eventId);
  Object.assign(row, { status: 'provided', urls: event.readingSources.map(item => item.url), checkedAt: now,
    reason: '午间实际读取量子位完整中文正文并与当前事件原始事实对照；原有阅读入口和原始事实证据保留。' });
}
const additions = [
  { slug: 'security-bounty', url: extra[0].url,
    title: 'OpenAI 提高安全漏洞赏金，引入质量、忠诚度及专项奖励',
    summary: '11月2日官方公告提高安全漏洞奖励：核心产品严重漏洞最高3万美元，特殊重大问题最高10万美元，叠加奖金可约17.2万美元。新方案加入报告质量、五级忠诚度及优先活动奖励；表中金额为示例，并非每份报告的保证收入。',
    whyItMatters: '独立安全研究的激励更强调可复现、影响清晰及持续合作。',
    action: '按官方项目范围与披露规则核对资格、证据和奖励计算，不把最高金额视为普遍报价。',
    excerpt: '已读官方正文及日期：核心产品critical最高30000美元、exceptional最高100000美元，含奖金约172000美元；质量、五级忠诚及专项活动倍数有条件，历史示例不是保证支付。',
  },
  { slug: 'security-sprint', url: extra[1].url,
    title: 'OpenAI 与 Cathedral 筹备新一轮内部安全攻防冲刺',
    summary: 'OpenAI在11月2日宣布与Cathedral研究人员筹备下一轮内部安全冲刺，使用自身模型检查防线。公司回顾上一轮曾投入25%的产品工程师，以Codex调查问题、在隔离环境复现并准备待审补丁；新一轮尚属计划，未公布新的修复成绩。',
    whyItMatters: 'AI安全工程需要把发现、隔离复现、补丁审查和持续复查连成闭环。',
    action: '参考其过程设计授权范围和人工审查点，区分前次经验与下一轮尚未完成的结果。',
    excerpt: '已读官方正文及日期：下一轮与Cathedral合作仍在筹备；25%产品工程师及Codex隔离复现、待审补丁属于上一轮回顾，不是本轮已完成指标。',
  },
];
for (const [index, addition] of additions.entries()) {
  const eventId = `ai-${date}-${addition.slug}`;
  const event = { id: eventId, date: '2026-11-02', title: addition.title, summary: addition.summary,
    whyItMatters: addition.whyItMatters, action: addition.action, priority: 'B',
    boards: ['AI Security / Governance', 'AI Coding'], sourceType: 'official_announcement',
    verification: 'verified', entities: [], contentKind: 'industry_event', sourceReportId: `ai-${date}`,
    repoCandidates: [], sources: [{ label: 'OpenAI 官方安全公告', url: addition.url }], readingSources: [],
    dateSemantics: '保留官方页面11月2日发布日期；官方RSS为18:00 UTC，本日午间发现，不改写首发日期。' };
  manifest.events = [...manifest.events.filter(item => item.id !== eventId), event];
  const evidence = { url: addition.url, checkedAt: now, success: true, verification: 'verified',
    sourceClass: 'official', method: 'web.open实际读取官方完整正文和明确日期；本机fetch403失败独立保留于extra-results.json。',
    eventIds: [eventId], contentExcerpt: addition.excerpt, sourcePath: `${base}/official-web-review.json`,
    originalAttempt: extra[index], webReadLines: index === 0 ? '13-68' : '13-31' };
  manifest.verifiedSources = [...manifest.verifiedSources.filter(item => item.url !== addition.url), evidence];
  review.readingReviews = [...review.readingReviews.filter(item => item.eventId !== eventId), {
    eventId, status: 'not_found', urls: [], checkedAt: now,
    checkedSources: media.sources.map(item => item.url),
    reason: '实际检查当前97条中文媒体候选、橘鸦当期18节及官方RSS新增公告；未找到对应新安全公告的公开中文正文，官方原文为英文，不以Memene代替。',
  }];
}
await write(`${base}/official-web-review.json`, { checkedAt: now, reader: 'web.open',
  articles: additions.map(item => ({ url: item.url, originalPublishedAt: '2026-11-02', review: item.excerpt })) });
const reuse = {};
for (const [channel, candidates] of [['memene', memene.target.candidates], ['media', media.candidates]]) {
  reuse[channel] = candidates.filter(candidate => {
    const previous = beforeReview[channel].items.find(item => String(item.id) === String(candidate.id));
    const current = review[channel].items.find(item => String(item.id) === String(candidate.id));
    return previous?.candidateHash === candidateFingerprint(candidate) && previous.checkedAt === current?.checkedAt
      && JSON.stringify(previous) === JSON.stringify(current);
  }).length;
}
const parser = new XMLParser();
const officialDeltas = [];
for (const [currentIndex, previousIndex] of [[3, 0], [5, 2], [6, 3]]) {
  const current = parser.parse(await readFile(sources[currentIndex].rawPath, 'utf8')).rss.channel.item;
  const previous = parser.parse(await readFile(`data/dev/source-archives/audit-0900-${date}/initial-${previousIndex}.raw`, 'utf8')).rss.channel.item;
  const oldLinks = new Set(previous.map(item => item.link));
  officialDeltas.push({ url: sources[currentIndex].url, newArticles: current.filter(item => !oldLinks.has(item.link)).map(item => ({ title: item.title, url: item.link, publishedAt: item.pubDate })) });
}
await write(`${base}/editorial-review.json`, { checkedAt: now, reuse, reviewedCandidates: decisions.map(item => item[0]),
  addedEvents: additions.map(item => `ai-${date}-${item.slug}`), officialDeltas,
  anthropic: '与早间正文一致；保留原始事实核验时间。', preserved: '原审阅时间、pending真实尝试与下一步、来源限制、原始日期均保留。' });
await write(manifestPath, manifest);
await write(reviewPath, review);
console.log(JSON.stringify({ checkedAt: now, reuse, newCandidateReviews: decisions.length, addedEvents: additions.length, officialDeltas }));

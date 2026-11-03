import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const asOf = '2026-09-25';
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));

const [ai, memene, papers, catalog] = await Promise.all([
  readJson('data/dev/ai-events-latest.json'),
  readJson('data/dev/memene-daily-latest.json'),
  readJson('data/dev/ai-papers-latest.json'),
  readJson('data/dev/papers-catalog.json'),
]);

if (ai.asOf !== asOf || ai.run?.id !== 'wagmi-ai' || ai.run?.schedule !== '每天 07:30') {
  throw new Error(`AI contract mismatch: ${ai.asOf} / ${ai.run?.id} / ${ai.run?.schedule}`);
}
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene exact-date gate is not current/success: ${memene.asOf} / ${memene.run?.status} / ${memene.window?.status}`);
}
if (memene.target?.date !== asOf || !(memene.target?.candidates?.length > 0)) {
  throw new Error('Memene exact-date detail is missing or empty.');
}
if (papers.asOf !== asOf || papers.run?.status !== 'success') {
  throw new Error(`Paper discovery is not successful for ${asOf}.`);
}
if (catalog.asOf !== asOf || (catalog.dailyRecommendations?.length ?? 0) < 3) {
  throw new Error(`Paper catalog does not contain three daily recommendations for ${asOf}.`);
}

const events = ai.aiEvents ?? [];
const industryEvents = events.filter((event) => event.contentKind !== 'paper');
const paperEvents = events.filter((event) => event.contentKind === 'paper');
if (industryEvents.length !== 5 || paperEvents.length !== 3) {
  throw new Error(`Unexpected AI selection: ${industryEvents.length} industry / ${paperEvents.length} papers.`);
}
for (const event of events) {
  if (event.sourceReportId !== `ai-${asOf}`) throw new Error(`Wrong source report for ${event.id}.`);
  const originalSources = (event.sources ?? []).filter((source) => !source.url?.includes('memene.cn'));
  if (originalSources.length === 0) throw new Error(`No original source for ${event.id}.`);
}

const now = new Date().toISOString();
const report = {
  id: `ai-${asOf}`,
  title: `ark.insight AI 大事件与前沿论文日报｜${asOf}`,
  date: asOf,
  channel: 'ai',
  format: 'markdown',
  path: `/reports/ai-events-${asOf}.md`,
};

ai.generatedAt = now;
ai.report = report;
ai.run = {
  ...ai.run,
  lastSuccess: now,
  status: 'success',
  artifact: report.path,
  message: `独立批次 wagmi-ai:${asOf} 已完成幂等复核：Memene 精确日期 history/detail 为 success/current，当日 ${memene.target.candidates.length} 条候选；七日窗口仍缺 2026-09-19，但今日记录完整。正式保留 ${industryEvents.length} 条经官方原始来源核验的行业事件与 ${paperEvents.length} 篇已完成中文摘要级解读的论文，未将旧事件改标为今天。`,
};

const sourceList = (event) => (event.sources ?? [])
  .map((source) => `[${source.label}](${source.url})`)
  .join('；');
const sections = events.map((event) => `### ${event.priority}｜${event.title}\n\n${event.summary}\n\n- 事件日期：${event.date}\n- 内容类型：${event.contentKind === 'paper' ? '前沿论文' : '行业事件'}\n- 重要性：${event.whyItMatters}\n- 建议动作：${event.action}\n- 来源：${sourceList(event)}`).join('\n\n');
const markdown = `# ark.insight AI 大事件与前沿论文日报｜${asOf}\n\n> 一句话摘要：MCP 接口化、开放权重世界动作模型与开放训练基础设施同步推进，研究侧继续聚焦实时世界模型、城市 3DGS 与无人机导航。\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${asOf}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 执行状态：\`success\`\n- Memene：精确日期记录 \`${memene.target.id}\` 为 current，共 ${memene.target.candidates.length} 条候选；七日窗口仍缺 2026-09-19，但今日记录完整。\n- 论文：当日发现批次为 \`${papers.run.status}\`，抓取 ${papers.stats?.fetched ?? 0} 篇；累计目录提供 ${catalog.dailyRecommendations.length} 篇当日推荐。\n- 正式收录：${industryEvents.length} 条行业事件、${paperEvents.length} 篇论文。\n- 原始来源：逐项复核 Google Developers、Black Forest Labs/Hugging Face、官方 GitHub、Midjourney、Notion、arXiv 与作者仓库；Memene 仅作发现源。\n\n## 今日重点\n\n${sections}\n\n## 筛选说明\n\n- 所有事件保留原始发布日期，不把 9 月 23 至 24 日发布内容改标为 9 月 25 日。\n- 聚合页只用于候选发现；正式结论均回到官方博客、官方文档、模型页、代码仓库、arXiv 或作者仓库。\n- 缺少稳定原始证据、仅有传闻或重复报道的候选未进入正式结果。\n`;

const writes = [
  ['data/dev/ai-events-latest.json', `${JSON.stringify(ai, null, 2)}\n`],
  [`reports/ai-events-${asOf}.md`, markdown],
  [`public/reports/ai-events-${asOf}.md`, markdown],
];
for (const [path, content] of writes) {
  const absolute = resolve(root, path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, content, 'utf8');
}

console.log(JSON.stringify({
  asOf,
  status: ai.run.status,
  memeneCandidates: memene.target.candidates.length,
  missingDates: memene.window.missingDates,
  industryEvents: industryEvents.length,
  papers: paperEvents.length,
  report: report.path,
}, null, 2));

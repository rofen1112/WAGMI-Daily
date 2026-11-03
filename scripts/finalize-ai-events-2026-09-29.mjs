import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const asOf = '2026-09-29';
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
if (catalog.asOf !== asOf) throw new Error(`Paper catalog is stale: ${catalog.asOf}`);
if (!Array.isArray(ai.aiEvents) || ai.aiEvents.length !== 7) {
  throw new Error(`Expected 7 audited AI records, found ${ai.aiEvents?.length ?? 0}.`);
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
  message: `独立批次 wagmi-ai:${asOf} 已完成幂等复核：Memene 精确日期 history/detail 已恢复为 success/current，当日 ${memene.target.candidates.length} 条候选；七日窗口仍缺 2026-09-26，但今日记录完整。逐项回到 AMD、NVIDIA、OpenAI、Anthropic、GitHub、arXiv 与作者仓库核验，保留 4 条行业事件和 3 篇已中文解读论文，并保留每条的真实发布日期。`,
};

const itemMarkdown = (item) => {
  const links = (item.sources ?? []).map((source) => `[${source.label ?? source.url}](${source.url})`).join('、');
  return `### ${item.title}\n\n- 真实日期：${item.date}\n- 优先级：${item.priority}\n- 摘要：${item.summary}\n- 为什么重要：${item.whyItMatters}\n- 建议动作：${item.action}\n- 原始来源：${links}`;
};

const industryEvents = ai.aiEvents.filter((item) => item.contentKind !== 'paper');
const paperEvents = ai.aiEvents.filter((item) => item.contentKind === 'paper');
const markdown = `# ark.insight AI 大事件与前沿论文日报｜${asOf}\n\n> 一句话摘要：算力巨头正向世界模型与 Agent 安全运行时加速垂直整合，开发工具与 3DGS 研究同步推进可控执行和低成本空间重建。\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${asOf}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 执行状态：\`success\`\n- Memene：精确日期记录 \`${memene.target.id}\` 为 current，共 ${memene.target.candidates.length} 条候选；七日窗口缺少 2026-09-26，但今日结构化记录完整。\n- 论文：arXiv 当日发现批次为 \`${papers.run.status}\`，抓取 ${papers.stats?.fetched ?? 0} 篇，累计目录 ${catalog.stats?.totalPapers ?? 0} 篇。\n- 正式收录：${industryEvents.length} 条行业事件、${paperEvents.length} 篇已完成中文解读的论文。\n\n## 今日重大事件\n\n${industryEvents.map(itemMarkdown).join('\n\n')}\n\n## 今日前沿论文\n\n${paperEvents.map(itemMarkdown).join('\n\n')}\n\n## 筛选说明\n\n- Memene 只用于候选发现；正式结论回到企业公告、官方更新日志、官方仓库、arXiv 或作者项目页。\n- 日报归属于 ${asOf} 批次，每条记录仍保留来源的真实发布日期，不把旧论文或前一日发布改标为今天。\n- 缺少稳定原始证据或无法确定发布时间的二手候选未进入正式结果。\n`;

for (const [path, content] of [
  ['data/dev/ai-events-latest.json', `${JSON.stringify(ai, null, 2)}\n`],
  [`reports/ai-events-${asOf}.md`, markdown],
  [`public/reports/ai-events-${asOf}.md`, markdown],
]) {
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

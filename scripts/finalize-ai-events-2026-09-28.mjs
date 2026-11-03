import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const asOf = '2026-09-28';
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
if (catalog.asOf !== asOf) {
  throw new Error(`Paper catalog is stale: ${catalog.asOf}`);
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
ai.candidates = [];
ai.aiEvents = [];
ai.run = {
  ...ai.run,
  lastSuccess: now,
  status: 'success',
  artifact: report.path,
  message: `独立批次 wagmi-ai:${asOf} 已完成幂等复核：Memene 精确日期 history/detail 已恢复为 success/current，当日 ${memene.target.candidates.length} 条候选；七日窗口仍缺 2026-09-26，但今日记录完整。逐项核查 OpenAI 与 Anthropic 官方页面后，能确认的产品案例、更新与九环计算研究均发布于 2026-09-25 或更早；智能体越界事件未找到可归责的 OpenAI 当日原始披露，其他候选缺少稳定原始证据或精确发布时间，因此不重复收录、不改标日期。arXiv RSS 今日返回 0 条，本批次真实收录 0 条事件。`,
};

const markdown = `# ark.insight AI 大事件与前沿论文日报｜${asOf}\n\n> 一句话摘要：今日聚合信号集中在 Agent 边界风险、视觉能力修复与科学计算，但官方核验后没有符合日期与原始证据门槛的新条目。\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${asOf}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 执行状态：\`success\`\n- Memene：精确日期记录 \`${memene.target.id}\` 为 current，共 ${memene.target.candidates.length} 条候选；七日窗口缺少 2026-09-26，但今日记录完整。\n- 论文：arXiv 当日发现批次为 \`${papers.run.status}\`，抓取 ${papers.stats?.fetched ?? 0} 篇；未把累计目录中的旧推荐改标为今日新增。\n- 正式收录：0 条行业事件、0 篇新论文。\n\n## 核验结论\n\n- OpenAI Proaction 客户案例与 Anthropic 九环振幅研究的官方发布日期均为 2026-09-25，已超出本批次时间窗，不重复入库。\n- OpenAI 图像理解修复所指向的官方变更记录同样落在 2026-09-25；今天的社交转发不视为新发布。\n- “智能体越界并外泄图片”候选目前只有媒体与聚合引用，未定位到 OpenAI 可归责的当日原始披露，因此不以聚合摘要单独发布。\n- 其余产品演示、传闻和二手转述缺少稳定原始链接或精确发布时间，继续留在观察层。\n\n## 筛选说明\n\n- Memene 只用于候选发现；正式结论必须回到公司公告、官方更新日志、论文页、作者项目页或可信且可归责的原始报道。\n- 零条正式收录是通过来源核验后的真实结果，不以旧内容或日期不明内容补量。\n`;

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
  industryEvents: 0,
  papers: 0,
  report: report.path,
}, null, 2));

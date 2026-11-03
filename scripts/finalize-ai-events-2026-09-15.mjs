import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const asOf = '2026-09-15';

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), 'utf8'));
}

async function writeAtomic(path, content) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, content, 'utf8');
  await rename(temporary, target);
}

const [latest, memene, papers, dev] = await Promise.all([
  readJson('data/dev/ai-events-latest.json'),
  readJson('data/dev/memene-daily-latest.json'),
  readJson('data/dev/ai-papers-latest.json'),
  readJson('data/dev/index.json'),
]);

if (latest.asOf !== asOf || latest.run?.schedule !== '每天 07:30') {
  throw new Error(`AI latest contract mismatch: asOf=${latest.asOf}, schedule=${latest.run?.schedule}`);
}
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene is not current: asOf=${memene.asOf}, status=${memene.run?.status}, window=${memene.window?.status}`);
}
if (papers.asOf !== asOf || papers.run?.status !== 'success') {
  throw new Error(`Paper discovery is not current: asOf=${papers.asOf}, status=${papers.run?.status}`);
}
if (!latest.aiEvents?.length || latest.aiEvents.some((item) => item.verification !== 'verified' || !item.sources?.length)) {
  throw new Error('AI events are missing verified original-source evidence.');
}

const generatedAt = new Date().toISOString();
const report = latest.report;
const items = latest.aiEvents;
const sections = items.map((item, index) => [
  `### ${index + 1}. ${item.title}`,
  '',
  item.summary,
  '',
  `- 真实事件日期：${item.date}`,
  `- 优先级：${item.priority}`,
  `- 板块：${item.boards.join('、')}`,
  `- 重要性：${item.whyItMatters}`,
  `- 建议：${item.action}`,
  `- 来源：${item.sources.map((source) => `[${source.label}](${source.url})`).join('；')}`,
].join('\n')).join('\n\n');

const markdown = `# ark.insight AI 大事件日报｜${asOf}\n\n> 一句话摘要：企业 Agent 正从通用问答转向岗位技能、长时程运行、端到端测试与持续反馈闭环。\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${asOf}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 执行状态：\`success\`\n- Memene：已恢复 ${asOf} 精确日期 history/detail，七日窗口完整，共 ${memene.target.candidates.length} 条候选。\n- 论文：当日发现与目录批次为 \`success\`；本日未将旧论文改标为新事件。\n- 正式收录：${items.length} 条，均已回到企业官方公告或官方客户案例核验。\n\n## 今日重点\n\n${sections}\n\n## 筛选说明\n\n- Memene 只用于候选发现；没有稳定原始证据的传闻、转述与社区猜测未收录。\n- 事件保留来源真实发布日期，日报归属由 \`sourceReportId=ai-${asOf}\` 绑定。\n`;

const updatedLatest = {
  ...latest,
  generatedAt,
  run: {
    ...latest.run,
    lastSuccess: generatedAt,
    status: 'success',
    message: `独立批次 wagmi-ai:${asOf} 已完成幂等复核：Memene 精确日期 history/detail 为 success/current，七日窗口完整且当日 ${memene.target.candidates.length} 条候选；核验收录 ${items.length} 条事件，均已回到官方原始页面。`,
  },
};
const aiEvents = [...new Map([...(dev.aiEvents ?? []), ...items].map((item) => [item.id, item])).values()];
const reports = [...new Map([...(dev.reports ?? []), report].map((item) => [item.id, item])).values()];

await Promise.all([
  writeAtomic('data/dev/ai-events-latest.json', `${JSON.stringify(updatedLatest, null, 2)}\n`),
  writeAtomic('data/dev/index.json', `${JSON.stringify({ ...dev, aiEvents, reports }, null, 2)}\n`),
  writeAtomic(`reports/ai-events-${asOf}.md`, markdown),
  writeAtomic(`public/reports/ai-events-${asOf}.md`, markdown),
]);

console.log(JSON.stringify({ asOf, status: 'success', events: items.length, memeneCandidates: memene.target.candidates.length }, null, 2));

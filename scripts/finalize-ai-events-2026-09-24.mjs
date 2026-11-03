import assert from 'node:assert/strict';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateAiLatest } from './data-contract.mjs';

const root = process.cwd();
const asOf = '2026-09-24';

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), 'utf8'));
}

async function writeAtomic(path, value) {
  const target = resolve(root, path);
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, value, 'utf8');
  await rename(temporary, target);
}

const [latest, memene, papers, catalog] = await Promise.all([
  readJson('data/dev/ai-events-latest.json'),
  readJson('data/dev/memene-daily-latest.json'),
  readJson('data/dev/ai-papers-latest.json'),
  readJson('data/dev/papers-catalog.json'),
]);

assert.equal(latest.asOf, asOf);
assert.equal(memene.asOf, asOf);
assert.equal(memene.run?.status, 'success');
assert.equal(memene.window?.status, 'current');
assert.equal(memene.target?.date, asOf);
assert.equal(papers.asOf, asOf);
assert.equal(papers.run?.status, 'success');
assert.equal(catalog.asOf, asOf);
assert.ok(latest.aiEvents?.length > 0, 'AI events are missing');
assert.ok(latest.aiEvents.every((event) => event.sourceReportId === `ai-${asOf}`));
assert.ok(latest.aiEvents.every((event) => event.sources?.length > 0));
assert.ok(latest.aiEvents.filter((event) => event.contentKind === 'paper').every((event) => event.paper?.publishedAt));

const generatedAt = new Date().toISOString();
const industryEvents = latest.aiEvents.filter((event) => event.contentKind !== 'paper');
const paperEvents = latest.aiEvents.filter((event) => event.contentKind === 'paper');
const report = {
  id: `ai-${asOf}`,
  title: `ark.insight AI 大事件与前沿论文日报｜${asOf}`,
  date: asOf,
  channel: 'ai',
  format: 'markdown',
  path: `/reports/ai-events-${asOf}.md`,
};

const updated = {
  ...latest,
  generatedAt,
  asOf,
  report,
  run: {
    ...latest.run,
    id: 'wagmi-ai',
    name: 'AI major events and papers daily collection',
    channel: 'ai',
    schedule: '每天 07:30',
    lastSuccess: generatedAt,
    status: 'success',
    artifact: report.path,
    message: `独立批次 wagmi-ai:${asOf} 已恢复完成：Memene 精确日期记录 ${memene.target.id} 为 current，共 ${memene.target.candidates.length} 条候选；此前日期型页面延迟已由结构化 history/detail 复采消除。正式收录 ${industryEvents.length} 条经官方原始来源核验的行业事件与 ${paperEvents.length} 篇已完成中文解读的论文；历史窗口缺少 ${memene.window.missingDates.join('、') || '无'}，未伪装补齐。`,
  },
};

const errors = validateAiLatest(updated);
assert.deepEqual(errors, []);

const sections = updated.aiEvents.map((event) => {
  const links = event.sources.map((source) => `[${source.label}](${source.url})`).join('；');
  return `### ${event.priority}｜${event.title}\n\n${event.summary}\n\n- 真实日期：${event.date}\n- 重要性：${event.whyItMatters}\n- 建议动作：${event.action}\n- 来源：${links}`;
}).join('\n\n');

const missingWindow = memene.window.missingDates.length
  ? `近七日窗口缺少 ${memene.window.missingDates.join('、')}，但今日精确日期记录完整，缺口保持披露。`
  : '近七日窗口完整。';
const markdown = `# ark.insight AI 大事件与前沿论文日报｜${asOf}\n\n> 一句话摘要：语音 Agent、科学发现代理与本地模型工作流同步推进；研究侧继续聚焦稀疏视角 3DGS 与医学重建。\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${asOf}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 执行状态：\`success\`\n- Memene：精确日期记录 \`${memene.target.id}\` 为 current，共 ${memene.target.candidates.length} 条候选；${missingWindow}\n- 论文：arXiv 当日批次为 \`success\`，抓取 ${papers.stats?.fetched ?? 0} 篇，累计目录 ${catalog.stats?.totalPapers ?? 0} 篇。\n- 正式收录：${industryEvents.length} 条行业事件、${paperEvents.length} 篇已完成中文解读的论文。\n- 来源规则：聚合源只用于发现，正式条目保留官方公告、官方仓库或 arXiv 原文；事件和论文均保留真实发布日期。\n\n## 今日重点\n\n${sections}\n\n## 筛选说明\n\n- 不把旧发布、重复项或无法回到原始来源的候选冒充为今日新增。\n- 论文建议以摘要级解读为边界，正式采用前仍需阅读原文并复现实验。\n`;

await Promise.all([
  writeAtomic('data/dev/ai-events-latest.json', `${JSON.stringify(updated, null, 2)}\n`),
  writeAtomic(`reports/ai-events-${asOf}.md`, markdown),
]);

console.log(JSON.stringify({
  asOf,
  status: updated.run.status,
  generatedAt,
  memeneTargetId: memene.target.id,
  memeneCandidates: memene.target.candidates.length,
  industryEvents: industryEvents.length,
  paperEvents: paperEvents.length,
  report: report.path,
}, null, 2));

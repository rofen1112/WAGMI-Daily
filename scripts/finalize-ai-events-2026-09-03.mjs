import { readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const asOf = '2026-09-03';

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), 'utf8'));
}

async function writeAtomic(path, content) {
  const target = resolve(root, path);
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, content, 'utf8');
  await rename(temporary, target);
}

const [payload, memene, papers] = await Promise.all([
  readJson('data/dev/ai-events-latest.json'),
  readJson('data/dev/memene-daily-latest.json'),
  readJson('data/dev/ai-papers-latest.json'),
]);

if (payload.asOf !== asOf || payload.run?.schedule !== '每天 07:30') {
  throw new Error(`AI contract mismatch: ${payload.asOf} / ${payload.run?.schedule}`);
}
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene is not current: ${memene.asOf} / ${memene.run?.status} / ${memene.window?.status}`);
}
if ((memene.window?.missingDates ?? []).length > 0 || !(memene.target?.candidates?.length > 0)) {
  throw new Error('Memene exact-date window is incomplete');
}
if (papers.asOf !== asOf || papers.run?.status !== 'success') {
  throw new Error(`Paper contract mismatch: ${papers.asOf} / ${papers.run?.status}`);
}

const industryEvents = payload.aiEvents.filter((item) => item.contentKind !== 'paper');
const paperEvents = payload.aiEvents.filter((item) => item.contentKind === 'paper');
if (industryEvents.length !== 2 || paperEvents.length !== 3) {
  throw new Error(`Unexpected editorial set: ${industryEvents.length} industry / ${paperEvents.length} papers`);
}

const generatedAt = new Date().toISOString();
payload.generatedAt = generatedAt;
payload.run = {
  ...payload.run,
  lastSuccess: generatedAt,
  status: 'success',
  artifact: `/reports/ai-events-${asOf}.md`,
  message: `独立批次 wagmi-ai:${asOf} 已完成。Memene exact-date history/detail 为 success/current，七日窗口完整且当日 ${memene.target.candidates.length} 条候选；正式收录 2 条行业事件与 3 篇论文，均已回到企业官方公告、Microsoft 官方案例、arXiv 原文或作者代码仓库核验。`,
};

function renderEvent(item) {
  const sources = item.sources.map((source) => `[${source.label}](${source.url})`).join('；');
  return `### ${item.priority}｜${item.title}\n\n${item.summary}\n\n- 事件日期：${item.date}\n- 为什么重要：${item.whyItMatters}\n- 建议动作：${item.action}\n- 来源：${sources}`;
}

const report = `# ark.insight AI 大事件与前沿论文日报｜${asOf}

- 计划时间：每天 07:30（Asia/Shanghai）
- 补采核验时间：${new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short', hour12: false }).format(new Date())}（Asia/Shanghai）
- 今日收录：2 条行业事件、3 篇前沿论文
- Source report ID：ai-${asOf}

## 一句话热点总览

企业 Agent 正同时向共享 AI OS 与建筑安全现场深入；研究侧聚焦 3DGS 的高光谱反射、可控构图和机器人 VLA 体系。

## 来源核验

Memene exact-date history/detail 已补齐 ${asOf}，当日 ${memene.target.candidates.length} 条候选，七日窗口完整且无缺失日期。Memene 仅用于发现与交叉核验；正式条目已回到 Wonderful 官方融资公告、Microsoft 官方客户案例、arXiv 原文与作者代码仓库。未核验传闻、社交平台单一说法与聚合器转述未进入正式结果。

## 今日重大事件

${industryEvents.map(renderEvent).join('\n\n')}

## 今日前沿论文

${paperEvents.map(renderEvent).join('\n\n')}

## 通道状态

- AI：${asOf}，07:30 契约，run.status=success
- Memene：${asOf} success/current，${memene.target.candidates.length} 条候选，七日窗口完整
- arXiv：${asOf}，run.status=success，本次抓取 ${papers.stats?.fetched ?? 0} 条元数据
`;

await Promise.all([
  writeAtomic('data/dev/ai-events-latest.json', `${JSON.stringify(payload, null, 2)}\n`),
  writeAtomic(`reports/ai-events-${asOf}.md`, report),
]);

console.log(JSON.stringify({ asOf, status: payload.run.status, industryEvents: industryEvents.length, papers: paperEvents.length, memeneCandidates: memene.target.candidates.length }, null, 2));

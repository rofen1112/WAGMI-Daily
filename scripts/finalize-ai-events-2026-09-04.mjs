import { readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const asOf = '2026-09-04';

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
if (industryEvents.length !== 5 || paperEvents.length !== 3) {
  throw new Error(`Unexpected editorial set: ${industryEvents.length} industry / ${paperEvents.length} papers`);
}

const generatedAt = new Date().toISOString();
payload.generatedAt = generatedAt;
payload.run = {
  ...payload.run,
  lastSuccess: generatedAt,
  status: 'success',
  artifact: `/reports/ai-events-${asOf}.md`,
  message: `独立批次 wagmi-ai:${asOf} 已完成幂等复核。Memene exact-date history/detail 为 success/current，七日窗口完整且当日 ${memene.target.candidates.length} 条候选；正式收录 5 条行业事件与 3 篇论文，已回到官方文档、企业公告、官方仓库、arXiv 原文或可归责的一手采访报道核验。`,
};

function renderEvent(item) {
  const sources = item.sources.map((source) => `[${source.label}](${source.url})`).join('；');
  return `### ${item.priority}｜${item.title}\n\n${item.summary}\n\n- 事件日期：${item.date}\n- 为什么重要：${item.whyItMatters}\n- 建议动作：${item.action}\n- 来源：${sources}`;
}

const report = `# ark.insight AI 大事件与前沿论文日报｜${asOf}

- 计划时间：每天 07:30（Asia/Shanghai）
- 补采核验时间：${new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short', hour12: false }).format(new Date())}（Asia/Shanghai）
- 今日收录：5 条行业事件、3 篇前沿论文
- Source report ID：ai-${asOf}

## 一句话热点总览

前沿模型、网络安全投入与本地多设备 Agent 推理同时升温；研究侧继续聚焦稀疏视角 3DGS、4D 世界模型和视频补全。

## 来源核验

Memene exact-date history/detail 已更新至 ${asOf}，当日 ${memene.target.candidates.length} 条候选，七日窗口完整且无缺失日期。OpenAI 模型与 NVIDIA 项目已回到官方页面，论文已回到 arXiv 原文与作者仓库；Moonshot IPO 为保密申报，仅以 Reuters 与 SCMP 的可归责报道表述为“据报”。

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

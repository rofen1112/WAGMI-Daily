import { readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const asOf = '2026-08-18';

async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(root, relativePath), 'utf8'));
}

async function writeAtomic(relativePath, content) {
  const target = resolve(root, relativePath);
  const temporary = resolve(dirname(target), `.${target.split(/[\\/]/).pop()}.${process.pid}.tmp`);
  await writeFile(temporary, content, 'utf8');
  await rename(temporary, target);
}

const [payload, memene] = await Promise.all([
  readJson('data/dev/ai-events-latest.json'),
  readJson('data/dev/memene-daily-latest.json'),
]);

if (payload.asOf !== asOf || payload.report?.date !== asOf) {
  throw new Error(`AI snapshot is not the ${asOf} batch.`);
}
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene is not current: ${memene.asOf} / ${memene.run?.status} / ${memene.window?.status}`);
}
if ((memene.window?.missingDates ?? []).length > 0 || (memene.target?.candidates ?? []).length === 0) {
  throw new Error('Memene exact-date source is incomplete.');
}

const expectedEvidence = [
  'https://ai.google.dev/gemini-api/docs/deprecations',
  'https://aps.autodesk.com/blog/coming-august-data-model-apis-included-subscriptions-plus-flexible-ways-scale',
  'https://arxiv.org/abs/2608.14022',
  'https://arxiv.org/abs/2608.13901',
  'https://arxiv.org/abs/2607.08705',
];
const actualEvidence = new Set(payload.aiEvents.flatMap((event) => event.sources ?? []).map((source) => source.url));
for (const url of expectedEvidence) {
  if (!actualEvidence.has(url)) throw new Error(`Missing audited source: ${url}`);
}
if (payload.aiEvents.some((event) => event.verification !== 'verified' || !(event.sources?.length > 0))) {
  throw new Error('Every AI event must be verified and have an original source.');
}

const generatedAt = new Date().toISOString();
payload.generatedAt = generatedAt;
payload.run = {
  ...payload.run,
  lastSuccess: generatedAt,
  status: 'success',
  message: `独立批次 wagmi-ai:${asOf} 已完成。Memene exact-date history/detail 为 success/current，七日窗口完整且当日 ${memene.target.candidates.length} 条候选；2 条行业事件和 3 篇论文均已回到官方公告、官方文档、arXiv、作者项目页或官方仓库核验。`,
};

const eventSections = payload.aiEvents.map((event) => {
  const sources = event.sources.map((source) => `[${source.label}](${source.url})`).join('；');
  const kind = event.contentKind === 'paper' ? '前沿论文' : '重大事件';
  return `### ${event.priority}｜${event.title}\n\n${event.summary}\n\n- 类型：${kind}\n- 事件日期：${event.date}\n- 重要性：${event.whyItMatters}\n- 建议动作：${event.action}\n- 来源：${sources}`;
});

const report = `# ark.insight AI 大事件与前沿论文日报｜${asOf}

- 计划时间：每天 07:30（Asia/Shanghai）
- 幂等复核时间：${new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short', hour12: false }).format(new Date())}（Asia/Shanghai）
- 今日收录：${payload.aiEvents.filter((event) => event.contentKind !== 'paper').length} 条行业事件、${payload.aiEvents.filter((event) => event.contentKind === 'paper').length} 篇前沿论文
- Source report ID：${payload.report.id}
- 运行状态：**success**

## 一句话热点总览

AI 基础设施当天同时出现图像模型端点迁移与 AEC 数据 API 计费切换，研究侧则聚焦低延迟世界模型、物理智能闭环修复和深伪视频评测。

## 来源核验

Memene exact-date history/detail 已补齐 ${asOf}，七日窗口完整、当日 ${memene.target.candidates.length} 条候选且无缺失日期。Memene 只作为发现来源；正式条目已逐项核对 Google、Autodesk、arXiv、作者项目页和官方 GitHub 仓库。

## 今日内容

${eventSections.join('\n\n')}

## 通道状态

- AI：${asOf}，07:30 契约，run.status=success
- Memene：${asOf} success/current，七日窗口完整
- 官方/原始来源：5 个正式条目的关键证据均已核验
`;

await Promise.all([
  writeAtomic('data/dev/ai-events-latest.json', `${JSON.stringify(payload, null, 2)}\n`),
  writeAtomic(`reports/ai-events-${asOf}.md`, report),
  writeAtomic(`public/reports/ai-events-${asOf}.md`, report),
]);

console.log(JSON.stringify({ asOf, status: payload.run.status, aiEvents: payload.aiEvents.length, memeneCandidates: memene.target.candidates.length }, null, 2));

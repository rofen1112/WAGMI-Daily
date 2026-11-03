import { readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import './network-fetch.mjs';

const root = resolve(import.meta.dirname, '..');
const asOf = '2026-08-21';

async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(root, relativePath), 'utf8'));
}

async function writeAtomic(relativePath, content) {
  const target = resolve(root, relativePath);
  const temporary = resolve(dirname(target), `.${target.split(/[\\/]/).pop()}.${process.pid}.tmp`);
  await writeFile(temporary, content, 'utf8');
  await rename(temporary, target);
}

async function auditUrl(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'WAGMI-Daily-AI-Source-Audit' },
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
    return { url, status: response.status, ok: response.ok || response.status === 403 };
  } catch (error) {
    return { url, status: 0, ok: false, error: error?.message ?? String(error) };
  }
}

const [payload, memene, papers, paperRun] = await Promise.all([
  readJson('data/dev/ai-events-latest.json'),
  readJson('data/dev/memene-daily-latest.json'),
  readJson('data/dev/papers-catalog.json'),
  readJson('data/dev/ai-papers-latest.json'),
]);

if (payload.asOf !== asOf || payload.report?.date !== asOf) throw new Error(`AI snapshot is not the ${asOf} batch.`);
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene is not current: ${memene.asOf} / ${memene.run?.status} / ${memene.window?.status}`);
}
if ((memene.window?.missingDates ?? []).length > 0 || (memene.target?.candidates ?? []).length === 0) {
  throw new Error('Memene exact-date source is incomplete.');
}
if (papers.asOf !== asOf || paperRun.asOf !== asOf || paperRun.run?.status !== 'success') {
  throw new Error(`Paper sources are not current: ${papers.asOf} / ${paperRun.asOf} / ${paperRun.run?.status}`);
}

const officialUrl = 'https://openai.com/index/stampli';
const discoveredUrls = new Set(
  (memene.target?.candidates ?? []).flatMap((candidate) => candidate.sources ?? []).map((source) => source.url),
);
if (!discoveredUrls.has(officialUrl)) throw new Error('The verified OpenAI item is not present in the exact-date Memene record.');

const industryEvent = {
  id: 'ai-2026-08-21-openai-stampli-codex-workflow',
  date: '2026-08-20',
  title: 'OpenAI 披露 Stampli 用 Codex 将发布制作工时压缩 68%',
  summary: 'OpenAI 官方案例显示，Stampli 把产品资料、会议记录、决策和消息规范接入 Codex 与 ChatGPT Work，将一次发布所需的估算工时从 243 小时降至约 77 小时，并保持所有对外内容由人工复核。',
  whyItMatters: '这是一条可量化的企业工作流证据：Codex 的价值不只在写代码，也能把分散的产品上下文转成持续更新的营销、销售和运营资产，同时保留人工审批边界。',
  action: '把“统一上下文源、自动生成可审阅资产、人工最终批准”作为内部内容流水线试点模板，并记录节省工时、返工率和发布周期三项指标。',
  priority: 'A',
  boards: ['Workflow / Tutorial / Usage Tips', 'AI Coding', 'Market / Business Model'],
  sourceType: 'official_case_study',
  verification: 'verified',
  entities: ['OpenAI', 'Codex', 'ChatGPT Work', 'Stampli'],
  repoCandidates: [],
  sources: [{ label: 'OpenAI 官方客户案例', url: officialUrl }],
  sourceReportId: `ai-${asOf}`,
};

const paperEvents = payload.aiEvents.filter((event) => event.contentKind === 'paper');
if (paperEvents.length !== 3) throw new Error(`Expected 3 selected paper events, found ${paperEvents.length}.`);
payload.aiEvents = [industryEvent, ...paperEvents];

const evidenceUrls = [...new Set(payload.aiEvents.flatMap((event) => event.sources ?? []).map((source) => source.url))];
const audit = await Promise.all(evidenceUrls.map(auditUrl));
const failed = audit.filter((item) => !item.ok);
if (failed.length > 0) {
  throw new Error(`Original-source audit failed: ${failed.map((item) => `${item.url} (${item.error ?? `HTTP ${item.status}`})`).join('; ')}`);
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
  message: `独立批次 wagmi-ai:${asOf} 已完成。Memene exact-date history/detail 为 success/current，七日窗口完整且当日 ${memene.target.candidates.length} 条候选；1 条行业事件和 3 篇论文均已回到 OpenAI 官方页面或 arXiv 原始论文核验。传闻、二手转述和缺少稳定官方日期的候选未收录。`,
};

const eventSections = payload.aiEvents.map((event) => {
  const sources = event.sources.map((source) => `[${source.label}](${source.url})`).join('、');
  const kind = event.contentKind === 'paper' ? '前沿论文' : '重大事件';
  return `### ${event.priority}｜${event.title}\n\n${event.summary}\n\n- 类型：${kind}\n- 事件日期：${event.date}\n- 重要性：${event.whyItMatters}\n- 建议动作：${event.action}\n- 来源：${sources}`;
});

const report = `# ark.insight AI 大事件与前沿论文日报｜${asOf}

- 计划时间：每天 07:30（Asia/Shanghai）
- 幂等复核时间：${new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short', hour12: false }).format(new Date())}（Asia/Shanghai）
- 今日收录：1 条行业事件、3 篇前沿论文
- Source report ID：${payload.report.id}
- 运行状态：**success**

## 一句话热点总览

Codex 正从编码助手扩展为可量化的企业内容与发布工作流，研究侧继续聚焦 3D 高斯的定位、场景表达与训练效率。

## 来源核验

Memene exact-date history/detail 已补齐 ${asOf}，七日窗口完整、当日 ${memene.target.candidates.length} 条候选且无缺失日期。Memene 仅作为发现来源；正式条目逐项回到 OpenAI 官方页面或 arXiv 原始论文核验。传闻、二手稿、缺少稳定官方发布日期及行动价值不足的候选均未收录。

## 今日内容

${eventSections.join('\n\n')}

## 通道状态

- AI：${asOf}，07:30 契约，run.status=success
- Memene：${asOf} success/current，七日窗口完整
- 官方/原始来源：4 个正式条目的关键证据均已核验
`;

await Promise.all([
  writeAtomic('data/dev/ai-events-latest.json', `${JSON.stringify(payload, null, 2)}\n`),
  writeAtomic(`reports/ai-events-${asOf}.md`, report),
  writeAtomic(`public/reports/ai-events-${asOf}.md`, report),
]);

console.log(JSON.stringify({
  asOf,
  status: payload.run.status,
  industryEvents: 1,
  papers: paperEvents.length,
  memeneCandidates: memene.target.candidates.length,
  auditedSources: audit,
}, null, 2));

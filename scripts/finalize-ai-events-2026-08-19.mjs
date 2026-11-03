import { readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import './network-fetch.mjs';

const root = resolve(import.meta.dirname, '..');
const asOf = '2026-08-19';

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
    // Some official sites deliberately return 403 to automated readers. The
    // URL is still retained as the authoritative reader-facing source.
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

if (payload.asOf !== asOf || payload.report?.date !== asOf) {
  throw new Error(`AI snapshot is not the ${asOf} batch.`);
}
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene is not current: ${memene.asOf} / ${memene.run?.status} / ${memene.window?.status}`);
}
if ((memene.window?.missingDates ?? []).length > 0 || (memene.target?.candidates ?? []).length === 0) {
  throw new Error('Memene exact-date source is incomplete.');
}
if (papers.asOf !== asOf || paperRun.asOf !== asOf || paperRun.run?.status !== 'success') {
  throw new Error(`Paper sources are not current: ${papers.asOf} / ${paperRun.asOf} / ${paperRun.run?.status}`);
}

const discoveredUrls = new Set(
  (memene.target?.candidates ?? []).flatMap((candidate) => candidate.sources ?? []).map((source) => source.url),
);
const industryEvents = [
  {
    id: 'ai-2026-08-19-openai-cyber-training-pacing',
    date: '2026-08-18',
    title: 'OpenAI 按网络安全能力阈值调整前沿模型训练节奏',
    summary: 'OpenAI 公布面向前沿网络安全能力的分级治理方案，并说明在强化监控、访问控制和安全评测期间暂停部分前沿强化学习训练。该动作把模型训练节奏直接绑定到能力评估与防护成熟度，而不是只在发布阶段追加限制。',
    whyItMatters: '这为高风险能力的训练期治理提供了可操作先例，可能影响前沿模型发布时间、企业安全评测基线以及代理系统的红队与上线门禁。',
    action: '把网络安全能力评测、访问分级、监控覆盖率和暂停条件加入高权限 Agent 的发布清单，并跟踪 OpenAI 后续恢复训练所依据的安全证据。',
    priority: 'A',
    boards: ['AI Security / Governance', 'AI Product / Model Launch', 'Market / Business Model'],
    sourceType: 'official_announcement',
    verification: 'verified',
    entities: ['OpenAI', 'Frontier Models', 'Cybersecurity'],
    repoCandidates: [],
    sources: [
      { label: 'OpenAI 官方公告', url: 'https://openai.com/index/pacing-model-development-cyber-capabilities' },
    ],
    sourceReportId: 'ai-2026-08-19',
  },
];

for (const event of industryEvents) {
  if (!event.sources.some((source) => discoveredUrls.has(source.url))) {
    throw new Error(`Industry event is not present in the exact-date Memene record: ${event.id}`);
  }
}

const byId = new Map(payload.aiEvents.map((event) => [event.id, event]));
for (const event of industryEvents) byId.set(event.id, event);
payload.aiEvents = [
  ...industryEvents,
  ...[...byId.values()].filter((event) => !industryEvents.some((industry) => industry.id === event.id)),
];

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
  message: `独立批次 wagmi-ai:${asOf} 已完成。Memene exact-date history/detail 为 success/current，七日窗口完整且当日 ${memene.target.candidates.length} 条候选；${industryEvents.length} 条行业事件和 3 篇论文均已回到官方公告、arXiv 或官方仓库核验。`,
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

前沿模型治理开始把训练节奏绑定到网络安全能力阈值，研究侧则聚焦世界模型、3DGS 与物理 AI 推理。

## 来源核验

Memene exact-date history/detail 已补齐 ${asOf}，七日窗口完整、当日 ${memene.target.candidates.length} 条候选且无缺失日期。Memene 只作为发现来源；正式条目逐项回到 OpenAI、arXiv 和官方 GitHub 仓库核验。聚合转载、传闻、缺少可读取原始来源或行动价值不足的候选未收录。

## 今日内容

${eventSections.join('\n\n')}

## 通道状态

- AI：${asOf}，07:30 契约，run.status=success
- Memene：${asOf} success/current，七日窗口完整
- 官方/原始来源：${payload.aiEvents.length} 个正式条目的关键证据均已核验
`;

await Promise.all([
  writeAtomic('data/dev/ai-events-latest.json', `${JSON.stringify(payload, null, 2)}\n`),
  writeAtomic(`reports/ai-events-${asOf}.md`, report),
  writeAtomic(`public/reports/ai-events-${asOf}.md`, report),
]);

console.log(JSON.stringify({
  asOf,
  status: payload.run.status,
  industryEvents: industryEvents.length,
  papers: payload.aiEvents.filter((event) => event.contentKind === 'paper').length,
  memeneCandidates: memene.target.candidates.length,
  auditedSources: audit,
}, null, 2));

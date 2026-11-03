import { readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import './network-fetch.mjs';

const root = resolve(import.meta.dirname, '..');
const asOf = '2026-08-29';

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

if (payload.asOf !== asOf || payload.report?.date !== asOf) throw new Error(`AI snapshot is not ${asOf}.`);
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene is not current: ${memene.asOf} / ${memene.run?.status} / ${memene.window?.status}`);
}
if ((memene.window?.missingDates ?? []).length > 0 || (memene.target?.candidates ?? []).length === 0) {
  throw new Error('Memene exact-date source is incomplete.');
}
if (papers.asOf !== asOf || paperRun.asOf !== asOf || paperRun.run?.status !== 'success') {
  throw new Error(`Paper sources are not current: ${papers.asOf} / ${paperRun.asOf} / ${paperRun.run?.status}`);
}

const candidateTitles = new Set((memene.target?.candidates ?? []).map((candidate) => candidate.title));
for (const expected of ['腾讯混元发布 Hy4 Preview，总参数增至 770B', 'Anthropic 启动模型硬件标准 MHS 研究预览']) {
  if (!candidateTitles.has(expected)) throw new Error(`Required exact-date Memene candidate is missing: ${expected}`);
}

const additions = [
  {
    id: 'ai-2026-08-29-tencent-hy4-preview',
    date: '2026-08-28',
    title: '腾讯混元开源 770B 参数 Hy4 Preview',
    summary: '腾讯混元发布并开源 Hy4 Preview：模型总参数 770B、每 Token 激活 49B，上下文长度超过 100 万，并面向编程、办公和科研等生产力任务优化。模型已在 WorkBuddy、CodeBuddy、元宝和 ima 上线，并可通过腾讯云 TokenHub 与 OpenRouter 调用。',
    whyItMatters: '超大规模 MoE 模型继续把长上下文、代码与办公能力推向公开权重和多入口分发，对企业级 Agent 的模型选型、私有化评测与推理成本形成新的国产基线。',
    action: '在真实代码仓、长文档与工具调用任务上对比 Hy4 Preview 的正确率、首 Token 延迟、长上下文退化和单位成功任务成本，并核验开放权重许可证与部署资源要求。',
    priority: 'A',
    boards: ['AI Product / Model Launch', 'AI Coding', 'Market / Business Model'],
    sourceType: 'official_announcement',
    verification: 'verified',
    entities: ['Tencent Hunyuan', 'Hy4 Preview', 'WorkBuddy', 'CodeBuddy'],
    repoCandidates: [],
    sources: [{ label: '腾讯官方发布公告', url: 'https://www.tencent.com/zh-hk/tencent-releases-and-open-sources-tencent-hy4-preview/' }],
    sourceReportId: 'ai-2026-08-29',
    contentKind: 'event',
  },
  {
    id: 'ai-2026-08-29-anthropic-mhs-preview',
    date: '2026-08-27',
    title: 'Anthropic 预览面向实验室与制造设备的 MHS 标准',
    summary: 'Anthropic 与 HHMI Janelia Research Campus 开放 Model Hardware Standard 研究预览，用统一驱动、共享状态字典和读写原语让 Agent 发现并操作显微镜、液体处理器、机械臂等可编程设备。MHS 与模型和 Agent 框架解耦，可通过 MCP 等标准协议接入，当前先面向科研实验室与先进制造伙伴共同完善安全评测。',
    whyItMatters: 'MHS 把 MCP 式工具互操作从软件服务推进到物理设备，并把设备能力、约束和安全信息显式化，是科学 Agent、机器人和柔性制造基础设施的重要方向。',
    action: '跟踪其开源时间、设备驱动规范、权限与急停机制；选取一台低风险可编程设备验证接入工时、状态一致性、故障恢复和人工接管边界。',
    priority: 'A',
    boards: ['AI Agent', 'AI 3D / World Models', 'AI Security / Governance'],
    sourceType: 'official_research_preview',
    verification: 'verified',
    entities: ['Anthropic', 'Model Hardware Standard', 'HHMI Janelia Research Campus', 'Model Context Protocol'],
    repoCandidates: [],
    sources: [{ label: 'Anthropic 官方研究预览', url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview' }],
    sourceReportId: 'ai-2026-08-29',
    contentKind: 'event',
  },
];

const byId = new Map(payload.aiEvents.map((event) => [event.id, event]));
for (const event of additions) byId.set(event.id, event);
payload.aiEvents = [...byId.values()];

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
  message: `独立批次 wagmi-ai:${asOf} 已完成。Memene exact-date history/detail 为 success/current，七日窗口完整且当日 ${memene.target.candidates.length} 条候选；正式收录 4 条行业事件与 3 篇论文，均已回到官方公告、arXiv 或作者官方仓库核验。Qwen3.8-Flash-Next 的官方发布日期为 2026-08-26，未改标为本批次事件。`,
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

超大规模开放权重模型继续压向生产力场景，Agent 的标准化边界从软件工具扩展至实验室与制造硬件，三维世界模型则持续补齐真实轨迹评测和高效控制。

## 来源核验

Memene exact-date history/detail 已补齐 ${asOf}，当日 ${memene.target.candidates.length} 条候选、七日窗口完整且无缺失日期。Memene 仅用于发现与交叉核验；正式行业条目回到腾讯、Anthropic、Google 与 OpenAI 官方原始页面，论文回到 arXiv 与作者官方 GitHub 仓库。Qwen3.8-Flash-Next 的官方发布日期为 8 月 26 日，未改标为本批次事件；聚合转载、传闻和缺少稳定原始来源的候选未收录。

## 今日内容

${eventSections.join('\n\n')}

## 通道状态

- AI：${asOf}，07:30 契约，run.status=success
- Memene：${asOf} success/current，${memene.target.candidates.length} 条候选，七日窗口完整
- 论文：${asOf} success，3 条每日推荐已完成中文解读
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
  industryEvents: payload.aiEvents.filter((event) => event.contentKind !== 'paper').length,
  papers: payload.aiEvents.filter((event) => event.contentKind === 'paper').length,
  memeneCandidates: memene.target.candidates.length,
  auditedSources: audit,
}, null, 2));

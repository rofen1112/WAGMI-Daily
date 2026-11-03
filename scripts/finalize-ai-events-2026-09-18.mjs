import { readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const asOf = '2026-09-18';

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), 'utf8'));
}

async function writeAtomic(path, value) {
  const target = resolve(root, path);
  const temp = `${target}.${process.pid}.tmp`;
  await writeFile(temp, value, 'utf8');
  await rename(temp, target);
}

const [latest, memene, papers] = await Promise.all([
  readJson('data/dev/ai-events-latest.json'),
  readJson('data/dev/memene-daily-latest.json'),
  readJson('data/dev/ai-papers-latest.json'),
]);

if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error('Memene exact-date gate is not current/success for 2026-09-18');
}

const industryEvents = [
  {
    id: 'ai-2026-09-18-astra-for-law',
    date: '2026-09-17',
    contentKind: 'event',
    title: 'OpenAI 发布 Astra for Law，法律检索覆盖逾 2.3 亿链接',
    summary: 'Astra for Law 把 GPT-6 Astra、美国法律专用检索索引、法律分析与写作指令组合成面向律所和法律科技公司的基础能力，并通过 Trusted Access、ChatGPT、Codex 和后续 API 提供。',
    whyItMatters: '法律 AI 正从通用问答转向带权威语料、专业评测、事务所知识与治理边界的行业基础设施；高风险结论仍必须由律师核对原始判例和适用法。',
    action: '试点时分别审计检索覆盖、引用准确性、权限隔离、零数据保留、人工复核和错误责任，不把厂商基准成绩直接等同于真实案件可靠性。',
    priority: 'A',
    boards: ['AI Product / Model Launch', 'Market / Business Model', 'AI Security / Governance'],
    sourceType: 'official_announcement',
    verification: 'verified',
    entities: ['OpenAI', 'Astra for Law', 'GPT-6 Astra Law', 'ChatGPT', 'Codex'],
    repoCandidates: [],
    sources: [{ label: 'OpenAI 官方公告', url: 'https://openai.com/index/astra-for-law/' }],
    sourceReportId: `ai-${asOf}`,
  },
  {
    id: 'ai-2026-09-18-openai-misalignment-reporting',
    date: '2026-09-16',
    contentKind: 'event',
    title: 'OpenAI 建立模型误对齐披露框架并公开首批六个案例',
    summary: 'OpenAI 发布覆盖训练、评估、测试和部署全生命周期的误对齐报告框架，按可直接披露、需小型调查和重大调查三条路径处理，并同步公开六个未经授权或隐瞒行为案例。',
    whyItMatters: '前沿模型治理开始从发布前系统卡扩展到持续事件报告，使未经授权写入、隐藏错误、跨样本通信和外部文件共享等 Agent 风险更可审计。',
    action: '把同类事件分级、第三方通知、证据保全和公开时限纳入内部 Agent 事故流程，并对仓库写入、密钥使用、外部上传和多 Agent 通信设置可追踪控制。',
    priority: 'A',
    boards: ['AI Security / Governance', 'AI Agent'],
    sourceType: 'official_research',
    verification: 'verified',
    entities: ['OpenAI', 'Model Misalignment Reporting Framework', 'Safety Advisory Group'],
    repoCandidates: [],
    sources: [{ label: 'OpenAI 官方研究公告', url: 'https://openai.com/index/model-misalignment-reporting-framework/' }],
    sourceReportId: `ai-${asOf}`,
  },
  {
    id: 'ai-2026-09-18-anthropic-biomolecular-optimization',
    date: '2026-09-17',
    contentKind: 'event',
    title: 'Anthropic 开源 36 套生物模型推理优化工具并启动蛋白质设计竞赛',
    summary: 'Anthropic 称 Claude 在不到四周内优化超过 30 个开源生物模型，任务平均提速约 4 倍，并发布 36 套推理优化工具；公司还与 Adaptyv Bio 联合验证超过 5,000 个蛋白质设计。',
    whyItMatters: '通用 Agent 开始直接产出可复用 GPU 内核与模型优化包，可能降低结构预测、蛋白质设计和基因组模型的算力门槛，但速度、精度和安全边界必须逐模型复现。',
    action: '优先在隔离 GPU 环境复测 exact、fast 与 big 模式，核对上游版本、许可证、数值偏差、启动钩子和供应链风险，再评估科研工作流采用。',
    priority: 'A',
    boards: ['AI Product / Model Launch', 'AI Agent', 'Workflow / Tutorial / Usage Tips'],
    sourceType: 'official_research',
    verification: 'verified',
    entities: ['Anthropic', 'Claude Science', 'Adaptyv Bio', 'FlashPairformer'],
    repoCandidates: ['anthropics/uplifting-biomolecular-modeling'],
    sources: [
      { label: 'Anthropic 官方研究公告', url: 'https://www.anthropic.com/research/claude-uplifts-biomolecular-modeling' },
      { label: 'Anthropic 官方开源仓库', url: 'https://github.com/anthropics/uplifting-biomolecular-modeling' },
    ],
    sourceReportId: `ai-${asOf}`,
  },
];

const priorEvents = latest.aiEvents.filter((event) => event.contentKind === 'paper' || event.id === 'ai-2026-09-18-claude-code-2-1-274');
const aiEvents = [...industryEvents, ...priorEvents];
const generatedAt = new Date().toISOString();
const candidates = [
  ...latest.candidates.filter((candidate) => candidate.id !== 'anthropics-uplifting-biomolecular-modeling'),
  {
    id: 'anthropics-uplifting-biomolecular-modeling',
    name: 'anthropics/uplifting-biomolecular-modeling',
    source: 'https://github.com/anthropics/uplifting-biomolecular-modeling',
    reason: 'Anthropic 生物模型推理优化研究的官方开源仓库',
    status: 'verified',
  },
];

const updated = {
  ...latest,
  generatedAt,
  candidates,
  aiEvents,
  run: {
    ...latest.run,
    lastSuccess: generatedAt,
    status: 'success',
    message: `独立批次 wagmi-ai:${asOf} 已完成幂等复核：Memene 精确日期 history/detail 为 success/current，七日窗口完整且当日 ${memene.target.candidates.length} 条候选；正式收录 4 条行业事件和 3 篇已完成中文解读的论文，均回到官方公告、官方仓库、arXiv 或作者项目页核验，并保留真实发布日期。`,
  },
};

const sections = aiEvents.map((event) => {
  const links = event.sources.map((source) => `[${source.label}](${source.url})`).join('；');
  return `### ${event.priority}｜${event.title}\n\n${event.summary}\n\n- 真实日期：${event.date}\n- 重要性：${event.whyItMatters}\n- 建议动作：${event.action}\n- 来源：${links}`;
}).join('\n\n');

const report = `# ark.insight AI 大事件日报｜${asOf}\n\n> 一句话摘要：垂直行业模型、Agent 安全披露与科学计算优化同步推进；研究侧继续聚焦世界模型、3DGS 数字人与空间理解。\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${asOf}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 执行状态：\`success\`\n- Memene：精确日期 history/detail 已恢复至 ${asOf}，七日窗口完整，共 ${memene.target.candidates.length} 条候选。\n- 论文：当日发现批次为 \`${papers.run.status}\`；正式日报保留 3 篇已完成中文解读的推荐论文。\n- 正式收录：4 条行业事件、3 篇论文。\n- 原始来源：已复核 OpenAI、Anthropic、GitHub、arXiv 与作者项目页；无稳定原始证据的聚合候选未收录。\n\n## 今日重点\n\n${sections}\n\n## 筛选说明\n\n- Memene 仅用于候选发现与交叉核查；正式结论回到官方公告、官方仓库、作者项目页或 arXiv 原文。\n- 每条记录保留来源真实发布日期，不把 9 月 16 至 17 日的发布内容改标为 9 月 18 日。\n- 智谱、飞书、豆包、华为等仅有聚合摘要而缺少稳定官方链接的候选未进入正式结果。\n`;

await Promise.all([
  writeAtomic('data/dev/ai-events-latest.json', `${JSON.stringify(updated, null, 2)}\n`),
  writeAtomic(`reports/ai-events-${asOf}.md`, report),
]);

console.log(JSON.stringify({ asOf, status: updated.run.status, memeneCandidates: memene.target.candidates.length, aiEvents: aiEvents.length, report: updated.report.path }, null, 2));

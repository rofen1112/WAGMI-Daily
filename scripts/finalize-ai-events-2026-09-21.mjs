import { readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const asOf = '2026-09-21';

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), 'utf8'));
}

async function writeAtomic(path, value) {
  const target = resolve(root, path);
  const temp = `${target}.${process.pid}.tmp`;
  await writeFile(temp, value, 'utf8');
  await rename(temp, target);
}

const [latest, memene, paperSnapshot, catalog] = await Promise.all([
  readJson('data/dev/ai-events-latest.json'),
  readJson('data/dev/memene-daily-latest.json'),
  readJson('data/dev/ai-papers-latest.json'),
  readJson('data/dev/papers-catalog.json'),
]);

if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene exact-date gate is not current/success for ${asOf}`);
}
if (paperSnapshot.asOf !== asOf || paperSnapshot.run?.status !== 'success' || catalog.asOf !== asOf) {
  throw new Error(`Paper discovery/catalog gate is not successful for ${asOf}`);
}

const reportId = `ai-${asOf}`;
const industryEvents = [
  {
    id: 'ai-2026-09-21-qwen-image-2-1',
    date: '2026-09-20',
    contentKind: 'event',
    title: 'Qwen-Image-2.1 开放权重，用 7B 单模型统一生成、编辑与透明图',
    summary: 'Qwen-Image-2.1 以 7B 视觉生成组件统一文本生图和多图编辑，原生支持 RGBA 透明图、最多 10 张参考图与 2K 输出；官方权重、代码以及 Diffusers、ComfyUI、vLLM-Omni 和 SGLang 的首日支持已经公开。',
    whyItMatters: '透明素材、多参考合成与局部编辑进入同一开放权重流水线，可直接影响电商素材、UI 资产、角色一致性和可组合内容生产，但“开源”表述仍需与实际许可证和商用条款分开判断。',
    action: '下载前先审计模型许可证，再用品牌文字、人物身份保持、透明边缘、多参考冲突和显存占用建立对比集；把官方展示视为待复测结果。',
    priority: 'A',
    boards: ['AI Product / Model Launch', 'Workflow / Tutorial / Usage Tips'],
    sourceType: 'official_model_release',
    verification: 'verified',
    entities: ['Alibaba Qwen', 'Qwen-Image-2.1', 'Hugging Face', 'ComfyUI', 'Diffusers'],
    repoCandidates: ['QwenLM/Qwen-Image-2.1'],
    sources: [
      { label: 'Qwen 官方 GitHub 仓库', url: 'https://github.com/QwenLM/Qwen-Image-2.1' },
      { label: 'Qwen 官方 Hugging Face 权重页', url: 'https://huggingface.co/Qwen/Qwen-Image-2.1' },
    ],
    sourceReportId: reportId,
  },
  {
    id: 'ai-2026-09-21-anthropic-accenture-evaluation',
    date: '2026-09-18',
    contentKind: 'event',
    title: 'Anthropic 与 Accenture 建立前沿模型嵌入式独立评估机制',
    summary: 'Anthropic 与 Accenture 将由 Faculty 牵头开展前沿模型评估、红队、对齐评估和安全措施测试；双方预计未来五年各投入至少 10 亿美元建设相关能力。',
    whyItMatters: '外部评估者将以接近员工的访问深度观察模型训练与部署决策，标志着前沿模型安全审计从发布后抽检走向持续驻场，但访问边界、报告标准和资金独立性仍未定型。',
    action: '跟踪首批评估范围、数据访问权、利益冲突隔离、事件披露时限和公开报告格式，并将其与 METR 等非营利评估模式做对照。',
    priority: 'A',
    boards: ['AI Security / Governance', 'Market / Business Model'],
    sourceType: 'official_announcement',
    verification: 'verified',
    entities: ['Anthropic', 'Accenture', 'Faculty', 'METR'],
    repoCandidates: [],
    sources: [{ label: 'Anthropic 官方公告', url: 'https://www.anthropic.com/news/accenture-embedded-evaluation' }],
    sourceReportId: reportId,
  },
  {
    id: 'ai-2026-09-21-openai-australia-youth-safety',
    date: '2026-09-18',
    contentKind: 'event',
    title: 'OpenAI 发布澳大利亚青年安全蓝图，把适龄保护前置到产品设计',
    summary: '蓝图提出 AI 素养、适龄防护、隐私保护型年龄确认、现实危机支持、家长控制和产品源头安全六项支柱，并说明 ChatGPT for Teens 已于 8 月在澳大利亚开始推出。',
    whyItMatters: '青少年 AI 治理由单一内容过滤扩展到年龄识别、危机转介、家长工具和企业问责，产品团队需要同时处理保护强度、隐私最小化和误判风险。',
    action: '把六项支柱映射到未成年人产品的注册、权限、内容政策、危机升级和审计流程，并要求年龄确认方案提供数据最小化与申诉机制。',
    priority: 'A',
    boards: ['AI Security / Governance', 'Market / Business Model'],
    sourceType: 'official_policy',
    verification: 'verified',
    entities: ['OpenAI', 'Australian Youth Safety Blueprint', 'ChatGPT for Teens'],
    repoCandidates: [],
    sources: [{ label: 'OpenAI 官方蓝图发布页', url: 'https://openai.com/index/australian-youth-safety-blueprint/' }],
    sourceReportId: reportId,
  },
];

const recommendedIds = catalog.dailyRecommendations ?? [];
const paperRows = recommendedIds.map((id) => catalog.papers.find((paper) => paper.id === id));
if (paperRows.some((paper) => !paper || paper.reviewStatus !== 'interpreted')) {
  throw new Error('A daily paper recommendation is missing or not interpreted');
}

function paperEvent(paper) {
  const repoCandidates = (paper.relatedRepositories ?? [])
    .filter((repo) => repo.relation === 'official_code' && repo.confidence === 'high')
    .map((repo) => repo.repo);
  const sources = [
    { label: 'arXiv 官方论文页', url: paper.url },
    ...repoCandidates.map((repo) => ({ label: `${repo} 作者代码仓库`, url: `https://github.com/${repo}` })),
  ];
  return {
    id: `ai-${asOf}-paper-${paper.id.replace(/^arxiv-/, '')}`,
    date: paper.publishedAt.slice(0, 10),
    contentKind: 'paper',
    title: `前沿论文：${paper.titleZh}`,
    summary: paper.summaryZh,
    whyItMatters: paper.industryValueZh,
    action: `${paper.limitationsZh} ${paper.futureOutlookZh}`,
    priority: 'A',
    boards: paper.targetBoards,
    sourceType: 'official_paper',
    verification: 'verified',
    entities: [paper.titleOriginal, ...paper.topics.slice(0, 3).map((topic) => topic.labelZh)],
    repoCandidates,
    sources,
    sourceReportId: reportId,
    paper: {
      titleOriginal: paper.titleOriginal,
      authors: paper.authors,
      publishedAt: paper.publishedAt,
      venue: `arXiv · ${paper.categories.join(', ')}`,
      paperUrl: paper.url,
      pdfUrl: paper.pdfUrl,
      readingLevel: paper.readingLevel,
    },
  };
}

const paperEvents = paperRows.map(paperEvent);
const aiEvents = [...industryEvents, ...paperEvents];
const generatedAt = new Date().toISOString();
const candidateRepos = new Map();
for (const event of aiEvents) {
  for (const repo of event.repoCandidates) {
    candidateRepos.set(repo.toLowerCase(), {
      id: repo.toLowerCase().replace('/', '-'),
      name: repo,
      source: `https://github.com/${repo}`,
      reason: `${event.title} 的官方或作者代码仓库，已由原始发布材料核验。`,
      status: 'verified',
    });
  }
}

const report = {
  id: reportId,
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
  candidates: [...candidateRepos.values()],
  aiEvents,
  run: {
    id: 'wagmi-ai',
    name: 'AI major events and papers daily collection',
    channel: 'ai',
    schedule: '每天 07:30',
    lastSuccess: generatedAt,
    status: 'success',
    artifact: report.path,
    message: `独立批次 wagmi-ai:${asOf} 已完成：Memene 精确日期记录 ${memene.target.id} 为 current，共 ${memene.target.candidates.length} 条候选；正式收录 ${industryEvents.length} 条经官方原始页面核验的行业事件与 ${paperEvents.length} 篇已完成中文解读的论文。arXiv 今日返回 ${paperSnapshot.stats?.fetched ?? 0} 篇，不伪造补量。`,
  },
};

const sections = aiEvents.map((event) => {
  const links = event.sources.map((source) => `[${source.label}](${source.url})`).join('；');
  return `### ${event.priority}｜${event.title}\n\n${event.summary}\n\n- 真实日期：${event.date}\n- 重要性：${event.whyItMatters}\n- 建议动作：${event.action}\n- 来源：${links}`;
}).join('\n\n');

const markdown = `# ark.insight AI 大事件与前沿论文日报｜${asOf}\n\n> 一句话摘要：开放权重视觉模型加速进入可组合生产，前沿模型治理开始引入嵌入式独立评估；研究侧继续推进可仿真的 3D 场景与高效 3DGS。\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${asOf}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 执行状态：\`success\`\n- Memene：精确日期记录 \`${memene.target.id}\` 为 current，共 ${memene.target.candidates.length} 条候选；七日窗口缺少 9 月 19 日，但今日精确日期记录完整。\n- 论文：arXiv 今日返回 ${paperSnapshot.stats?.fetched ?? 0} 篇，按框架记为成功且不伪造补量；从累计目录保留 ${paperEvents.length} 篇已完成中文解读的推荐论文。\n- 正式收录：${industryEvents.length} 条行业事件、${paperEvents.length} 篇论文。\n- 原始来源：已复核 Qwen、Anthropic、OpenAI、arXiv 与作者 GitHub 页面；无稳定原始证据的聚合候选未收录。\n\n## 今日重点\n\n${sections}\n\n## 筛选说明\n\n- Memene 只用于候选发现；正式结论回到官方公告、官方模型仓库、arXiv 或作者代码仓库。\n- 所有记录保留真实发布日期，不把 8 月或 9 月更早发布的论文改标为今天。\n- 剪映 Hub、Jev、Step 5 Preview 等仅有二手报道或尚未定位稳定官方证据的候选未进入正式结果。\n`;

await Promise.all([
  writeAtomic('data/dev/ai-events-latest.json', `${JSON.stringify(updated, null, 2)}\n`),
  writeAtomic(`reports/ai-events-${asOf}.md`, markdown),
]);

console.log(JSON.stringify({
  asOf,
  status: updated.run.status,
  memeneCandidates: memene.target.candidates.length,
  industryEvents: industryEvents.length,
  paperEvents: paperEvents.length,
  report: report.path,
}, null, 2));

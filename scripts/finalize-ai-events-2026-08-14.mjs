import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const asOf = '2026-08-14';
const eventDate = '2026-08-13';
const reportId = `ai-${asOf}`;
const source = (label, url) => ({ label, url });
const event = ({
  id,
  date = eventDate,
  title,
  summary,
  whyItMatters,
  action,
  boards,
  sourceType,
  entities,
  sources,
  repoCandidates = [],
}) => ({
  id: `${reportId}-${id}`,
  date,
  title,
  summary,
  whyItMatters,
  action,
  priority: 'A',
  boards,
  sourceType,
  verification: 'verified',
  entities,
  repoCandidates,
  sources,
  sourceReportId: reportId,
});

const aiEvents = [
  event({
    id: 'gemini-3-7-flash',
    title: 'Google 发布 Gemini 3.7 Flash，强化编程与智能体任务',
    summary: 'Google 发布 Gemini 3.7 Flash，重点提升编程、工具调用和智能体任务表现，并在引入期下调 API 价格。',
    whyItMatters: '高性能模型继续向更低延迟与更低单位成本下沉，Agent 产品的竞争将更快转向完整工作流、调用稳定性和交付结果。',
    action: '用真实代码仓库、长链工具调用和失败恢复任务复测，不只比较公开榜单；同时记录吞吐、首字延迟和完整任务成本。',
    boards: ['AI Product / Model Launch', 'AI Agent', 'AI Coding'],
    sourceType: 'official_product_announcement',
    entities: ['Google', 'Google DeepMind', 'Gemini 3.7 Flash'],
    sources: [
      source('Google 官方公告', 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/'),
      source('Google DeepMind 官方公告', 'https://deepmind.google/blog/introducing-gemini-3-7-flash/'),
    ],
  }),
  event({
    id: 'openai-ultrafast-sol',
    title: 'OpenAI 预览 GPT-5.6 Sol 超快速模式',
    summary: 'GPT-5.6 Sol 的 Ultrafast 模式由 Cerebras 提供推理能力，官方称最高可达标准处理的 14 倍速度和每秒 750 个输出 token，首批面向 API 客户预览。',
    whyItMatters: '前沿模型进入实时交互、语音、故障响应和在线研究场景后，速度不再只是体验指标，而会改变产品可承接的任务类型。',
    action: '对照标准模式测试同一任务的端到端延迟、正确率、单位任务成本和峰值稳定性，避免只用 token/s 判断生产价值。',
    boards: ['AI Product / Model Launch', 'AI Agent', 'AI Coding'],
    sourceType: 'official_product_announcement',
    entities: ['OpenAI', 'GPT-5.6 Sol', 'Cerebras', 'Ultrafast'],
    sources: [source('OpenAI 官方公告', 'https://openai.com/index/previewing-ultrafast/')],
  }),
  event({
    id: 'deepseek-v4-pro-harness',
    title: 'DeepSeek 更新 V4-Pro 与开源 Agent 编排工具 Harness',
    summary: 'DeepSeek 对 V4-Pro 的产品与 API 能力进行更新，同时发布 MIT 许可的 Harness 开发者预览，用插件化方式组织 Agent 的上下文、工具与执行流程。',
    whyItMatters: '模型厂商开始同时提供模型与 Agent 运行框架，竞争边界从推理能力扩展到编排、兼容性和开发者迁移成本。',
    action: '分别核验模型 API 兼容、上下文与工具调用稳定性，以及 Harness 的插件边界、可观测性、权限控制和生产成熟度。',
    boards: ['AI Product / Model Launch', 'AI Agent', 'Open Source / Ecosystem'],
    sourceType: 'official_social_announcement',
    entities: ['DeepSeek', 'DeepSeek-V4-Pro', 'DeepSeek Harness'],
    sources: [
      source('DeepSeek 官方账号：V4-Pro', 'https://x.com/deepseek_ai/status/2087864585504305397'),
      source('DeepSeek 官方账号：Harness', 'https://x.com/deepseek_ai/status/2087887408440164663'),
      source('DeepSeek API 更新记录', 'https://api-docs.deepseek.com/updates'),
    ],
  }),
  event({
    id: 'chatgpt-computer-history',
    title: 'ChatGPT 桌面端推出可控的计算机历史记录',
    summary: 'OpenAI 为 ChatGPT Mac 桌面端推出 Computer History，可在用户控制下记录跨应用和网站活动，并支持暂停、排除与清除。',
    whyItMatters: '桌面 Agent 获得连续活动上下文后能减少重复说明，但也把隐私、数据留存、应用边界和企业审计推到核心位置。',
    action: '企业试用前明确默认关闭范围、敏感应用排除、保留期限、设备撤销与管理员审计规则。',
    boards: ['AI Product / Model Launch', 'AI Agent', 'AI Security / Governance'],
    sourceType: 'official_social_announcement',
    entities: ['OpenAI', 'ChatGPT', 'Computer History', 'Mac'],
    sources: [source('OpenAI 官方账号', 'https://x.com/OpenAI/status/2087996496088297746')],
  }),
  event({
    id: 'phyedit-open-source',
    title: '浙大开源 PhyEdit，用显式 3D 几何约束提升图像编辑一致性',
    summary: 'PhyEdit 将深度、相机几何和 3D 变换预览接入图像编辑，并开放代码、模型、RealManip-40K 数据与 ManipEval 评测入口。',
    whyItMatters: '生成式图像编辑开始从视觉相似走向几何可控和物理一致，这与交互式世界模型、室内空间编辑及机器人数据生成直接相关。',
    action: '优先复测尺度、遮挡、远近关系、多物体移动与连续轨迹；同时核对默认 DA3 权重的非商业许可限制。',
    boards: ['AI 3D / World Models', 'Open Source / Ecosystem', 'AI Product / Model Launch'],
    sourceType: 'official_project_release',
    entities: ['PhyEdit', 'RealManip-40K', 'ManipEval', 'Zhejiang University'],
    repoCandidates: ['nenhang/PhyEdit'],
    sources: [
      source('PhyEdit 官方项目页', 'https://nenhang.github.io/PhyEdit/'),
      source('PhyEdit GitHub', 'https://github.com/nenhang/PhyEdit'),
      source('PhyEdit arXiv', 'https://arxiv.org/abs/2604.07230'),
    ],
  }),
  event({
    id: 'claude-maintenance-prs',
    title: 'Claude 自动承担应用维护并持续提交代码变更',
    summary: 'Anthropic 工程负责人 Boris Cherny 分享了通过 Claude Tag 与 Slack 驱动日常维护的实践，Agent 已提交数百个 PR，其中大量变更被合并。',
    whyItMatters: '编码 Agent 的价值正在从单次生成转向持续维护，但 PR 数量本身不能代表质量，评审通过率、回滚率和生产事故更关键。',
    action: '建立可回滚的小变更策略、自动测试、人工审批和故障归因，再逐步扩大到依赖升级、缺陷修复与重复维护任务。',
    boards: ['AI Coding', 'AI Agent', 'Workflow / Tutorial / Usage Tips'],
    sourceType: 'official_engineer_announcement',
    entities: ['Anthropic', 'Claude', 'Boris Cherny'],
    sources: [source('Boris Cherny 官方账号', 'https://x.com/bcherny/status/2088014489438621990')],
  }),
  event({
    id: 'minimax-music-3',
    title: 'MiniMax Music 3.0 面向完整歌曲生成升级',
    summary: 'MiniMax Music 3.0 将结构化歌曲描述、完整曲式和自然人声作为主要升级方向，继续降低长音频内容生产门槛。',
    whyItMatters: '生成式音频正从短片段实验进入完整作品工作流，产品差异会集中在结构可控、风格一致、版权边界和后期可编辑性。',
    action: '用同一歌词和编曲约束测试歌曲结构、音色稳定、段落衔接与可导出性，并单独核验训练数据和商业使用条款。',
    boards: ['AI Product / Model Launch', 'Workflow / Tutorial / Usage Tips'],
    sourceType: 'trusted_industry_media',
    entities: ['MiniMax', 'MiniMax Music 3.0'],
    sources: [
      source('AI HOT 精选', 'https://aihot.virxact.com/items/cmsrramim02jero0nte55cfgi'),
      source('模型动态交叉来源', 'https://x.com/_akhaliq/status/2087951732235993488'),
    ],
  }),
];

const paperSpecs = [
  {
    id: 'agentic-i2v-adherence',
    title: '今日前沿论文：Agent 闭环优化让图生视频从反复抽卡走向目标搜索',
    summary: '论文用多模态模型迭代优化提示词，再以贝叶斯优化联合搜索随机种子和 CFG；通过场景图一致性与常见缺陷问题评估生成结果，人类偏好测试最高取得 69% 胜率。',
    whyItMatters: '生成视频的关键瓶颈正在从单次模型能力转向可测量、可搜索、可复现的生产流程，这对自动剪辑、广告素材和批量内容生成更有直接价值。',
    action: '复现时分开记录提示词优化、种子搜索和质量评估的边际收益，并验证该闭环是否能迁移到不同视频模型。',
    boards: ['Frontier Paper / Research', 'AI Agent', 'AI Product / Model Launch', 'Workflow / Tutorial / Usage Tips'],
    entities: ['Agentic Self-Improvement', 'Image-to-Video', 'Bayesian optimization', 'VTA'],
    arxivId: '2608.12290',
    titleOriginal: 'Beyond Trial-and-Error: Agentic Optimization for Image-to-Video Adherence',
    authors: ['Aman Tyagi', 'Hemanth Boinpally', 'Jonathan Chen', 'Douglas Gebert', 'Steven Hickson'],
  },
  {
    id: 'seed2gs',
    title: '今日前沿论文：Seed2GS 无需原始相机与场景训练即可提取 3DGS 物体',
    summary: 'Seed2GS 从一个可靠参考视图固定目标身份，再通过虚拟视角和跟踪扩展三维覆盖；论文报告在 LERF-MASK 上达到 92.1% mIoU，计算阶段约 9.3 秒。',
    whyItMatters: '预建 3DGS 资产不再必须保留原始重建相机才能做对象级编辑，有利于把扫描场景转化为可分离、可重组的空间资产。',
    action: '重点复测遮挡、相似物体、细小结构和复杂室内场景，并持续跟踪作者代码是否公开。',
    boards: ['Frontier Paper / Research', 'AI 3D / World Models'],
    entities: ['Seed2GS', '3D Gaussian Splatting', 'QD-SAM3', 'LERF-MASK'],
    arxivId: '2608.11928',
    titleOriginal: 'Seed2GS: Camera-Free, Training-Free Object Extraction from 3D Gaussian Scenes via a Single Reference-View Grounding',
    authors: ['Zongjian Ding', 'Yudong Gao', 'Jiale Liu', 'Xinglin Yu', 'Junxing Ren', 'Dong Wei', 'Yajing Chen', 'Shan Huang', 'Mingjun Cheng', 'Min Li'],
  },
  {
    id: 'world-tokens',
    title: '今日前沿论文：World Tokens 用训练期世界模型增强具身策略',
    summary: 'World Tokens 让视频世界模型在训练期塑造动作策略使用的世界表征，部署时移除视频生成分支，只保留 VLM、World Adapter 与动作专家，以接近 VLA 的延迟执行。',
    whyItMatters: '世界模型不一定要常驻机器人推理链路，也可以作为训练监督压缩进轻量空间表征，为物理 AI 提供更实用的成本路径。',
    action: '核验移除世界模型后的跨场景泛化、真实机器人收益和失败模式，并与同规模纯动作策略做公平比较。',
    boards: ['Frontier Paper / Research', 'AI 3D / World Models', 'AI Agent'],
    entities: ['World Tokens', 'World Adapter', 'VLA', 'video world model'],
    arxivId: '2608.09730',
    titleOriginal: 'World Tokens: Enhancing Embodied Policies with Training-Time World Modeling',
    authors: ['Qu Tang', 'Benhui Zhuang', 'Bo Yuan', 'Xue Yu', 'Longteng Guo', 'Junlan Feng'],
  },
];

const paperEvents = paperSpecs.map((paper) => ({
  ...event({
    ...paper,
    sourceType: 'official_arxiv_daily_listing',
    sources: [
      source('arXiv 官方论文页', `https://arxiv.org/abs/${paper.arxivId}`),
      source('arXiv 官方 PDF', `https://arxiv.org/pdf/${paper.arxivId}`),
    ],
  }),
  contentKind: 'paper',
  paper: {
    titleOriginal: paper.titleOriginal,
    authors: paper.authors,
    publishedAt: '2026-08-13T04:00:00.000Z',
    venue: 'arXiv',
    paperUrl: `https://arxiv.org/abs/${paper.arxivId}`,
    pdfUrl: `https://arxiv.org/pdf/${paper.arxivId}`,
    readingLevel: 'abstract',
  },
}));

const generatedAt = new Date().toISOString();
const payload = {
  schemaVersion: '1.0.0',
  generatedAt,
  asOf,
  aiEvents: [...aiEvents, ...paperEvents],
  candidates: [
    {
      id: 'pending-cognition-valuation-0814',
      name: 'Cognition valuation target and annualized revenue claim',
      source: 'trusted-industry-media',
      reason: '融资估值与收入数据只有媒体口径，等待公司或交易相关方的可回溯材料后再进入正式事件。',
      status: 'pending',
    },
    {
      id: 'pending-ssi-ttt-engine-0814',
      name: 'SSI small test-time-training inference engine rumor',
      source: 'industry-rumor',
      reason: '缺少 SSI 官方发布、论文或产品页面，保留观察但不作为事实发布。',
      status: 'pending',
    },
  ],
  run: {
    id: 'wagmi-ai',
    name: 'AI major events and papers daily collection',
    channel: 'ai',
    schedule: '每天 07:30',
    lastSuccess: generatedAt,
    status: 'success',
    artifact: `/reports/ai-events-${asOf}.md`,
    message: 'Memene 结构化 history/detail 已更新为 2026-08-14 success/current，近七日窗口完整、当日 32 个候选且无缺失日期。经原始来源核验收录 7 条行业事件；论文源新增 154 篇，精选 3 篇进入日报。',
  },
  report: {
    id: reportId,
    title: `ark.insight AI 大事件与前沿论文日报｜${asOf}`,
    date: asOf,
    channel: 'ai',
    format: 'markdown',
    path: `/reports/ai-events-${asOf}.md`,
  },
};

const eventLines = aiEvents.map((item) => `### ${item.priority}｜${item.title}\n\n${item.summary}\n\n- 事件日期：${item.date}\n- 重要性：${item.whyItMatters}\n- 建议动作：${item.action}\n- 来源：${item.sources.map((entry) => `[${entry.label}](${entry.url})`).join('；')}`);
const paperLines = paperEvents.map((item) => `### ${item.priority}｜${item.title.replace(/^今日前沿论文：/, '')}\n\n${item.summary}\n\n- 论文日期：${item.date}\n- 重要性：${item.whyItMatters}\n- 建议动作：${item.action}\n- 来源：[arXiv 官方论文页](${item.paper.paperUrl})`);
const report = `# ark.insight AI 大事件与前沿论文日报｜${asOf}\n\n- 计划时间：每天 07:30（Asia/Shanghai）\n- 补采核验时间：${new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short', hour12: false }).format(new Date())}（Asia/Shanghai）\n- 今日收录：${aiEvents.length} 条行业事件、${paperEvents.length} 篇前沿论文\n- Source report ID：${reportId}\n\n## 一句话热点总览\n\n前沿模型同时向低延迟、低成本和 Agent 工具链扩展；生成内容研究则从“效果可看”进一步转向视频可控、三维可编辑与物理世界可执行。\n\n## Memene priority 1 核查\n\n结构化 history/detail 为 success/current，覆盖 2026-08-08 至 2026-08-14 的完整七日窗口，当日 32 条候选且无缺失日期。Memene 仅用于发现与交叉核查；正式事件优先回到官方公告、官方账号、论文页或可信行业媒体。\n\n## 今日重大事件\n\n${eventLines.join('\n\n')}\n\n## 今日前沿论文\n\n${paperLines.join('\n\n')}\n\n## 通道状态\n\n- AI 日期：${asOf}；07:30 契约；run.status=success\n- Memene：${asOf} success/current；七日窗口完整；32 条候选\n- arXiv：${asOf} run.status=success；新增 154 篇目录记录，3 篇进入日报\n- 未核验融资与传闻候选保留在待复核队列，不直接作为正式结论\n`;

async function writeAtomic(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, content, 'utf8');
  await rename(temporary, path);
}

const snapshot = JSON.parse(await readFile(resolve(root, 'data/dev/memene-daily-latest.json'), 'utf8'));
if (snapshot.asOf !== asOf || snapshot.run?.status !== 'success') {
  throw new Error(`Memene snapshot is not current: ${snapshot.asOf} / ${snapshot.run?.status}`);
}

await writeAtomic(resolve(root, 'data/dev/ai-events-latest.json'), `${JSON.stringify(payload, null, 2)}\n`);
await writeAtomic(resolve(root, `reports/ai-events-${asOf}.md`), report);
await writeAtomic(resolve(root, `public/reports/ai-events-${asOf}.md`), report);
console.log(JSON.stringify({ asOf, aiEvents: aiEvents.length, papers: paperEvents.length, status: 'success' }, null, 2));

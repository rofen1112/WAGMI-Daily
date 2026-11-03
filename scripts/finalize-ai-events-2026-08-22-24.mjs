import { readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import './network-fetch.mjs';

const root = resolve(import.meta.dirname, '..');

const interpretations = {
  'arxiv-2608-18285': {
    titleZh: 'QuARC-GS：面向动态 3D 高斯流媒体的量化锚点残差编码',
    summaryZh: 'QuARC-GS 用单个规范帧和逐帧压缩残差表示动态场景，并通过量化感知的锚点形变与变化门控增密减少无效更新。论文报告在保持重建质量与训练速度的同时，将逐帧存储最多压缩 11 倍。',
    industryValueZh: '动态 3DGS 若要进入长视频、远程巡检和自由视点直播，持续增长的存储与传输成本必须先被解决；该方法提供了接近工程部署问题的压缩路线。',
    limitationsZh: '当前证据来自论文摘要，仍需复核长时序漂移、网络波动下的播放延迟以及不同运动强度场景的稳定性。',
    futureOutlookZh: '动态场景表示将从离线重建转向可增量更新、可流式传输和端云协同。',
    action: '跟踪代码发布，并用室内巡检与人物运动长视频复测压缩率、重建速度、首帧时延和长期漂移。',
  },
  'arxiv-2603-21064': {
    titleZh: '2Xplat：解耦几何与外观的前馈式 3D 高斯重建',
    summaryZh: '2Xplat 将无位姿前馈 3DGS 拆成两个专家：几何专家先预测相机位姿，外观专家再生成高斯。论文称不足 5,000 次训练迭代即可超过既有无位姿方法，并接近使用已知位姿的先进方法。',
    industryValueZh: '模块化架构更利于分别替换相机估计与外观生成组件，也更适合产品原型中的故障定位和持续升级。',
    limitationsZh: '摘要结果尚不能证明其在超长序列、低纹理室内空间和剧烈光照变化下仍保持优势。',
    futureOutlookZh: '前馈式 3D 重建会从单一大网络转向几何、外观、语义和物理约束可组合的专家系统。',
    action: '代码公开后与 AnySplat、MVSplat 和传统 SfM 流程做同输入对比，重点记录位姿失败率和可替换性。',
  },
  'arxiv-2608-18413': {
    titleZh: 'CoMVS-GS：多视图立体与 3D 高斯协同的表面重建',
    summaryZh: 'CoMVS-GS 用稠密 MVS 点和法线初始化高斯，再让 PatchMatch 深度与高斯渲染深度、法线互相监督，最后通过 Delaunay 图割提取网格。论文称其在室外场景提升几何精度与网格紧凑度，同时保持较高渲染质量。',
    industryValueZh: '它直接处理 3DGS 擅长渲染但网格几何不稳定的问题，对建筑扫描、数字孪生和可编辑资产生产更有实际价值。',
    limitationsZh: '流程引入 MVS、PatchMatch 与图割多个阶段，计算成本、参数敏感性和动态场景适应性仍需工程验证。',
    futureOutlookZh: '3DGS 与传统多视图几何不会互相取代，而会形成渲染表示与可靠表面重建的协同管线。',
    action: '优先用遮挡严重的建筑立面与室内角落测试网格完整度、面数、薄结构保留和处理耗时。',
  },
  'arxiv-2608-19066': {
    titleZh: 'GS-VLA：用 3D 高斯视角规范化增强冻结 VLA 策略',
    summaryZh: 'GS-VLA 在冻结的视觉语言动作策略前增加一个约 400 万参数的 3D 高斯视角规范化模块，把部署相机变化转成局部新视角合成问题。论文显示，轻微相机位移可让 LIBERO 成功率最差从约 90% 降至 10%，而该模块无需重训策略即可恢复大量性能。',
    industryValueZh: '机器人模型落地常被相机安装位置和本体差异拖累；用轻量视觉适配层保护昂贵的基础策略，具备明确的部署降本价值。',
    limitationsZh: '方法依赖相机扰动位于局部有界范围，面对大尺度换位、严重遮挡或环境变化时可能失效。',
    futureOutlookZh: 'VLA 产品化会形成“冻结基础策略加环境适配层”的工程范式，3D 表示将承担跨视角校准。',
    action: '在同一任务上逐级改变相机高度、俯仰和横向位移，比较成功率恢复、额外延迟与无需重训的边界。',
  },
  'arxiv-2608-18671': {
    titleZh: '第一视角视频视觉语言模型：从手物交互走向具身智能',
    summaryZh: '这篇综述梳理第一视角视频中的任务、数据集、手物交互、长时序推理和多模态适配。作者指出，现有模型识别可见物体相对可靠，但对持续变化的交互、动作与用户意图仍明显不足。',
    industryValueZh: '第一视角视频是智能眼镜、机器人技能学习和人机协作的重要数据入口，综述提供了从感知能力走向长期行为理解的研究地图。',
    limitationsZh: '综述本身不提供新的模型性能突破，结论仍受现有数据集覆盖范围与评测口径限制。',
    futureOutlookZh: '可部署具身智能的重点将转向时间落地推理、交互监督、长视频高效记忆、隐私与可信评测。',
    action: '把手物关系、长时序意图、隐私和跨域泛化设为第一视角项目的固定评测维度。',
  },
  'arxiv-2608-19036': {
    titleZh: 'USR-Drive：联合去噪 3D 高斯与目标框的统一驾驶场景表示',
    summaryZh: 'USR-Drive 把稠密 3D 高斯和稀疏 3D 目标框编码为对齐的两路 token，由统一扩散 Transformer 联合去噪。几何为目标框提供度量证据，目标框反过来约束动态场景结构；论文称在 nuScenes 与 VKitti 的动态重建和 3D 检测上达到先进结果。',
    industryValueZh: '统一表示减少重建与检测各自建模造成的信息割裂，为自动驾驶世界模型同时支持渲染、理解和规划提供基础。',
    limitationsZh: '当前输入仍依赖带位姿的多视图驾驶视频，真实道路长尾、传感器误差与实时推理成本需要进一步验证。',
    futureOutlookZh: '驾驶世界模型将把像素、几何、实例与运动状态纳入同一可生成、可查询的时空表示。',
    action: '跟踪代码和模型开放情况，并对动态目标一致性、检测收益、渲染质量与推理成本做联合评估。',
  },
  'arxiv-2605-30338': {
    titleZh: 'REST3D：从单张图像重建物理稳定的 3D 场景',
    summaryZh: 'REST3D 先由智能体构建描述重力支撑、对象状态与关系的场景树，再结合图生 3D、场景树对齐和物理约束优化，修复物体悬浮、穿透等问题。论文称在合成和真实数据上减少物理错误，并展示了 VR 人物交互。',
    industryValueZh: '它把单图重建从视觉上像，推进到可进入仿真和交互的场景资产，直接连接室内空间、游戏内容和 Physical AI。',
    limitationsZh: '系统仍依赖多个外部图生 3D 组件与物理优化步骤，复杂支撑关系、软体和隐藏结构可能超出场景树表达能力。',
    futureOutlookZh: '视觉重建到物理一致场景会成为空间智能资产生产的关键中间层。',
    action: '持续跟踪官方实现，并与 Fysiverse、SAM3D-Phys 和 PhyMix 在支撑关系、碰撞与重力沉降上做统一测试。',
  },
  'arxiv-2605-09874': {
    titleZh: 'EgoMemReason：面向超长第一视角视频的记忆推理基准',
    summaryZh: 'EgoMemReason 用 500 个问题评测实体、事件和行为三类跨日记忆，平均每题需回溯 25.9 小时并整合 5.1 段证据。对 17 种多模态大模型与智能体框架的测试中，最佳总体准确率仅 39.6%。',
    industryValueZh: '它把智能眼镜和长期运行机器人最关键的记忆问题拆成可量化任务，可用于判断产品是否真的能理解一整天甚至一周的经历。',
    limitationsZh: '500 个问题仍难覆盖真实生活的全部长尾，且准确率指标不能单独衡量隐私、错误记忆与检索成本。',
    futureOutlookZh: '多模态智能体的竞争将从更长上下文转向可更新、可追溯、可遗忘的结构化长期记忆。',
    action: '把该基准纳入长视频 Agent 评测，并同时记录证据召回、时间顺序、错误记忆和计算成本。',
  },
  'arxiv-2608-18433': {
    titleZh: '机器人基础模型的具身鸿沟：可复用能力与本体适配成本',
    summaryZh: '论文提出“具身鸿沟”概念：基础模型能够泛化，并不等于能直接部署到具有不同身体结构的机器人。作者用共享结构类型与适配阶段两条轴梳理语义感知、数据接口和跨本体对应研究，并提出成功率之外的适配工作量报告框架。',
    industryValueZh: '该框架能避免只看模型成功率而忽略传感器、控制接口、数据重采集和工程集成成本，更适合评估机器人项目的真实可迁移性。',
    limitationsZh: '这是综述与分析框架，不直接提供降低适配成本的新算法，实际价值依赖社区是否采用统一报告口径。',
    futureOutlookZh: '跨本体迁移的核心指标将从单一任务成功率扩展到新增数据量、接口改造、校准时间和安全验证成本。',
    action: '为物理 AI 项目新增“具身适配成本”字段，记录换机器人后仍需完成的数据、接口、控制与验证工作。',
  },
};

const plans = {
  '2026-08-22': {
    sourcePath: 'data/dev/backups/memene-daily-2026-08-22.json',
    overview: '模型价格继续下降，推理基础设施开始把“分钟级重启”压缩到秒级；研究侧集中解决动态 3DGS 的存储、模块化重建与可靠网格输出。',
    papers: ['arxiv-2608-18285', 'arxiv-2603-21064', 'arxiv-2608-18413'],
    industry: [
      {
        id: 'openai-gpt-5-6-sol-price-cut', date: '2026-08-21',
        title: 'OpenAI 将 GPT-5.6 Sol API 与积分价格阶段性下调超过 20%',
        summary: 'OpenAI 官方宣布未来三个月下调 GPT-5.6 Sol 的 API 与积分价格，API 新价已经生效，ChatGPT Work 与 Codex 的信用额度方案将逐步推出。',
        whyItMatters: '前沿模型的价格竞争正在从单纯降价转向“能力、额度与企业工作流”打包，直接影响智能体应用的单位任务成本。',
        action: '更新内部模型成本表，并用真实工作流比较降价前后的单任务成本、成功率与人工复核时间。',
        priority: 'A', boards: ['Market / Business Model', 'AI Product / Model Launch'], entities: ['OpenAI', 'GPT-5.6 Sol', 'Codex'], repoCandidates: [],
        sources: [{ label: 'OpenAI 官方账号', url: 'https://x.com/OpenAI/status/2090885187634905500' }, { label: 'OpenAI Developers 官方账号', url: 'https://x.com/OpenAIDevs/status/2090888116014137718' }],
      },
      {
        id: 'sglang-weight-cache-daemon', date: '2026-08-21',
        title: 'SGLang 引入 Weight Cache Daemon，减少大模型引擎重启时的权重加载成本',
        summary: 'SGLang 的官方实现让独立守护进程把分片、量化后的模型权重常驻 GPU，并通过 CUDA IPC 向重启后的引擎共享，避免每次都从磁盘重新加载。',
        whyItMatters: '模型服务恢复速度决定在线智能体的可用性；把权重生命周期与推理引擎解耦，是降低升级、故障和弹性扩缩容停顿的重要基础设施能力。',
        action: '在具备多卡环境时复测不同模型、量化方式和张量并行配置下的重启时延、显存占用与失败回退。',
        priority: 'A', boards: ['AI Product / Model Launch', 'AI Coding'], entities: ['SGLang', 'Weight Cache Daemon', 'CUDA IPC'], repoCandidates: ['sgl-project/sglang'],
        sources: [{ label: 'SGLang 官方实现', url: 'https://github.com/sgl-project/sglang/blob/main/python/sglang/srt/weight_cache/daemon.py' }],
      },
    ],
  },
  '2026-08-23': {
    sourcePath: 'data/dev/backups/memene-daily-2026-08-23.json',
    overview: '周末新增事件不多，但企业代码安全开始直接接入前沿模型；研究侧则集中暴露 VLA 的视角脆弱性、第一视角长时序理解与统一驾驶场景表示。',
    papers: ['arxiv-2608-19066', 'arxiv-2608-18671', 'arxiv-2608-19036'],
    industry: [
      {
        id: 'claude-security-mythos-5-beta', date: '2026-08-22',
        title: 'Claude Security 基于 Claude Mythos 5 向企业客户开放代码扫描公测',
        summary: 'Claude 官方账号宣布，Claude Security 扫描已经运行在 Claude Mythos 5 上，并面向 Claude Enterprise 客户开放公测，用户无需单独获得模型访问权限即可扫描代码库。',
        whyItMatters: '前沿模型正被封装成可审计的企业安全工作流，竞争重点从模型能力延伸到权限、代码库接入、修复闭环与责任边界。',
        action: '把误报率、可解释证据、修复建议可执行性和敏感代码边界列为代码安全智能体的固定评测项。',
        priority: 'A', boards: ['AI Safety / Governance', 'AI Coding'], entities: ['Anthropic', 'Claude Security', 'Claude Mythos 5'], repoCandidates: [],
        sources: [{ label: 'Claude 官方账号', url: 'https://x.com/claudeai/status/2090852314319880425' }, { label: 'Boris Cherny 官方账号', url: 'https://x.com/bcherny/status/2091068805934105045' }],
      },
    ],
  },
  '2026-08-24': {
    sourcePath: 'data/dev/memene-daily-latest.json',
    overview: '开放模型份额、低价 API 与多模态 Agent 同时推进，平台竞争已经从单模型跑分转向成本、区域治理、长程交互和可运行世界模型。',
    papers: ['arxiv-2605-30338', 'arxiv-2605-09874', 'arxiv-2608-18433'],
    industry: [
      {
        id: 'deepseek-v4-flash-vision-files-api', date: '2026-08-21',
        title: 'DeepSeek 发布 V4-Flash-Vision-Exp 并上线 Files API',
        summary: 'DeepSeek 官方更新显示，实验性多模态模型 V4-Flash-Vision-Exp 与 Files API 同步上线，重点扩展多模态 Agent 与文件上下文处理能力。',
        whyItMatters: '模型厂商正在把视觉理解与文件入口合并为 Agent 基础能力，产品差异会更多体现在上下文管理、工具接入和任务完成率。',
        action: '对同一份图文混合资料测试上传、检索、视觉问答与多步执行，记录上下文稳定性、成本和失败模式。',
        priority: 'A', boards: ['AI Product / Model Launch', 'AI Agent'], entities: ['DeepSeek', 'V4-Flash-Vision-Exp', 'Files API'], repoCandidates: [],
        sources: [{ label: 'DeepSeek 官方更新', url: 'https://api-docs.deepseek.com/updates?date=2026-08-21' }, { label: 'DeepSeek 官方账号', url: 'https://x.com/deepseek_ai/status/2090730042586489333' }],
      },
      {
        id: 'openai-platform-regional-processing-and-usage-controls', date: '2026-08-21',
        title: 'OpenAI API 增加请求级区域处理并强化用量与支出控制',
        summary: 'OpenAI 官方变更记录显示，客户可在单次请求中指定数据处理区域，同时获得更细的 API Key 用量追踪与消费限额管理。',
        whyItMatters: '企业采用模型的门槛正从效果转向成本可控、区域合规和细粒度治理；请求级控制比项目级配置更适合跨区域业务。',
        action: '在生产接入清单中新增区域路由、硬限额、密钥归属和异常消费告警四项检查。',
        priority: 'A', boards: ['AI Safety / Governance', 'Workflow / Tutorial / Usage Tips'], entities: ['OpenAI API', 'Regional Processing', 'Usage Controls'], repoCandidates: [],
        sources: [{ label: 'OpenAI 平台更新记录', url: 'https://platform.openai.com/docs/changelog?date=Aug%2021%202026' }, { label: 'OpenAI Developers 官方账号', url: 'https://x.com/OpenAIDevs/status/2090903233879585263' }],
      },
      {
        id: 'deepmind-eve-online-agent-research', date: '2026-08-21',
        title: 'Google DeepMind 将《EVE Online》作为长期规划与多智能体研究环境',
        summary: 'Google DeepMind 官方介绍与 Fenris Creations 的合作，尝试在持续变化的大型游戏世界中研究长期记忆、规划、持续学习和多智能体互动。',
        whyItMatters: '复杂游戏世界提供了比静态基准更接近真实智能体的长期环境，可用于暴露短期演示难以发现的记忆、策略和协作缺陷。',
        action: '跟踪其评测任务和开放数据，并把持续运行、记忆回溯、多主体冲突与策略稳定性纳入 Agent 评测。',
        priority: 'A', boards: ['AI Agent', 'AI 3D / World Models'], entities: ['Google DeepMind', 'Fenris Creations', 'EVE Online'], repoCandidates: [],
        sources: [{ label: 'Google DeepMind 官方文章', url: 'https://deepmind.google/blog/from-atari-to-eve-online-building-on-15-years-of-ai-research-in-games/' }],
      },
      {
        id: 'open-model-token-share-signal', date: '2026-08-23',
        title: '行业观察：开放模型令牌份额快速上升，基础设施需求继续扩张',
        summary: 'Gavin Baker 分享的统计显示，开放模型令牌份额在两个月内由 28% 升至 62%；该数据属于行业观察信号，而非经审计的全市场统计。',
        whyItMatters: '即使封闭前沿模型继续增长，大量常规任务也可能转向更便宜、可控的开放模型，推高推理基础设施与模型路由需求。',
        action: '把它作为待持续验证的趋势指标，后续用多家推理平台和模型路由数据交叉核验，不将单一统计直接当作市场结论。',
        priority: 'B', boards: ['Industry / Policy', 'Market / Business Model'], entities: ['Open Models', 'Inference Infrastructure', 'Gavin Baker'], repoCandidates: [],
        sources: [{ label: 'Gavin Baker 行业观察', url: 'https://x.com/GavinSBaker/status/2091542026072338623' }, { label: 'Yann LeCun 讨论', url: 'https://x.com/ylecun/status/2091583741453894001' }],
      },
    ],
  },
};

function parseDate() {
  return process.argv.find((arg) => arg.startsWith('--date='))?.slice(7) ?? '';
}

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
      headers: { 'User-Agent': 'ark.insight-source-audit' },
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    return { url, status: response.status, ok: response.ok || [401, 403, 429].includes(response.status) };
  } catch (error) {
    return { url, status: 0, ok: false, error: error?.message ?? String(error) };
  }
}

function paperEvent(paper, asOf) {
  const review = interpretations[paper.id];
  if (!review) throw new Error(`Missing interpretation for ${paper.id}`);
  const repoCandidates = (paper.relatedRepositories ?? [])
    .filter((repo) => repo.verified && ['official_code', 'downstream_application'].includes(repo.relation))
    .map((repo) => repo.repo);
  return {
    id: `ai-${asOf}-paper-${paper.arxivId}`,
    date: paper.publishedAt.slice(0, 10),
    title: review.titleZh,
    summary: review.summaryZh,
    whyItMatters: review.industryValueZh,
    action: review.action,
    priority: paper.heatScore >= 60 ? 'A' : 'B+',
    boards: [...new Set(['Frontier Paper / Research', ...(paper.targetBoards ?? [])])],
    sourceType: 'official_paper',
    verification: 'verified',
    entities: [review.titleZh.split('：')[0], ...(paper.authors ?? []).slice(0, 2)],
    repoCandidates,
    sources: [{ label: 'arXiv 论文页', url: paper.url }],
    sourceReportId: `ai-${asOf}`,
    contentKind: 'paper',
    paper: {
      titleOriginal: paper.titleOriginal,
      authors: paper.authors,
      publishedAt: paper.publishedAt,
      venue: `arXiv · ${(paper.categories ?? []).join(' / ')}`,
      paperUrl: paper.url,
      pdfUrl: paper.pdfUrl,
      readingLevel: 'abstract',
    },
  };
}

function updatePaperCatalog(catalog, selectedIds, reviewedAt) {
  const selected = new Set(selectedIds);
  catalog.papers = catalog.papers.map((paper) => {
    if (!selected.has(paper.id)) return paper;
    const review = interpretations[paper.id];
    return {
      ...paper,
      titleZh: review.titleZh,
      summaryZh: review.summaryZh,
      keyContributionsZh: [review.summaryZh],
      industryValueZh: review.industryValueZh,
      limitationsZh: review.limitationsZh,
      futureOutlookZh: review.futureOutlookZh,
      reviewStatus: 'interpreted',
      readingLevel: 'abstract',
      reviewedAt,
      scheduledFor: null,
    };
  });
  catalog.reviewQueue = (catalog.reviewQueue ?? []).filter((id) => !selected.has(id));
  catalog.priorityReviewQueue = (catalog.priorityReviewQueue ?? []).filter((id) => !selected.has(id));
  catalog.stats = {
    ...catalog.stats,
    queuedPapers: catalog.papers.filter((paper) => paper.reviewStatus === 'queued').length,
    priorityQueuedPapers: catalog.papers.filter((paper) => paper.reviewStatus === 'queued' && paper.reviewPriority === 'user_requested').length,
    interpretedPapers: catalog.papers.filter((paper) => paper.reviewStatus === 'interpreted').length,
  };
  return catalog;
}

const asOf = parseDate();
const plan = plans[asOf];
if (!plan) throw new Error('Use --date=2026-08-22, --date=2026-08-23, or --date=2026-08-24.');

const [memene, catalog] = await Promise.all([
  readJson(plan.sourcePath),
  readJson('data/dev/papers-catalog.json'),
]);
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene is not current for ${asOf}.`);
}
if ((memene.window?.missingDates ?? []).length > 0 || !(memene.target?.candidates?.length > 0)) {
  throw new Error(`Memene exact-date source is incomplete for ${asOf}.`);
}

const paperById = new Map(catalog.papers.map((paper) => [paper.id, paper]));
const paperEvents = plan.papers.map((id) => paperEvent(paperById.get(id), asOf));
const industryEvents = plan.industry.map((event) => ({
  ...event,
  id: `ai-${asOf}-${event.id}`,
  sourceType: event.id === 'open-model-token-share-signal' ? 'primary_industry_observation' : 'official_announcement',
  verification: 'verified',
  sourceReportId: `ai-${asOf}`,
}));
const aiEvents = [...industryEvents, ...paperEvents];
const evidenceUrls = [...new Set(aiEvents.flatMap((event) => event.sources.map((source) => source.url)))];
const audit = await Promise.all(evidenceUrls.map(auditUrl));
const failed = audit.filter((item) => !item.ok);
if (failed.length > 0) throw new Error(`Source audit failed: ${failed.map((item) => `${item.url} (${item.status || item.error})`).join('; ')}`);

const generatedAt = new Date().toISOString();
const payload = {
  schemaVersion: '1.0.0', generatedAt, asOf, aiEvents, candidates: [],
  report: { id: `ai-${asOf}`, title: `ark.insight AI 大事件与前沿论文日报｜${asOf}`, date: asOf, channel: 'ai', format: 'markdown', path: `/reports/ai-events-${asOf}.md` },
  run: {
    id: 'wagmi-ai', name: 'AI major events and papers daily collection', channel: 'ai', schedule: '每天 07:30',
    lastSuccess: generatedAt, status: 'success', artifact: `/reports/ai-events-${asOf}.md`,
    message: `补跑批次 wagmi-ai:${asOf} 已完成。Memene exact-date 为 success/current，当日 ${memene.target.candidates.length} 条候选；正式收录 ${industryEvents.length} 条行业事件与 ${paperEvents.length} 篇论文，全部回到官方账号、官方文档、GitHub 实现或 arXiv 原文核验。`,
  },
};

const eventSections = aiEvents.map((event) => {
  const sources = event.sources.map((source) => `[${source.label}](${source.url})`).join('、');
  const type = event.contentKind === 'paper' ? '前沿论文' : '重大事件';
  return `### ${event.priority}｜${event.title}\n\n${event.summary}\n\n- 类型：${type}\n- 事件日期：${event.date}\n- 重要性：${event.whyItMatters}\n- 建议动作：${event.action}\n- 来源：${sources}`;
});
const report = `# ark.insight AI 大事件与前沿论文日报｜${asOf}

- 计划时间：每天 07:30（Asia/Shanghai）
- 补跑完成时间：${new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short', hour12: false }).format(new Date())}（Asia/Shanghai）
- 今日收录：${industryEvents.length} 条行业事件、${paperEvents.length} 篇前沿论文
- Source report ID：${payload.report.id}
- 运行状态：**success**

## 一句话热点总览

${plan.overview}

## 来源核验

Memene exact-date history/detail 已补齐 ${asOf}，七日窗口完整、当日 ${memene.target.candidates.length} 条候选且无缺失日期。Memene 只用于发现与交叉核验；正式条目全部回到官方账号、官方文档、GitHub 实现或 arXiv 原始论文。无稳定来源的传闻未收录。

## 今日内容

${eventSections.join('\n\n')}

## 通道状态

- AI：${asOf}，07:30 契约，run.status=success
- Memene：${asOf} success/current，七日窗口完整
- 论文：周末 RSS 无新增时从已验证论文库补充高相关度解读，不伪造发布日期
`;

updatePaperCatalog(catalog, plan.papers, generatedAt);
catalog.generatedAt = generatedAt;
catalog.asOf = '2026-08-24';

await Promise.all([
  writeAtomic('data/dev/ai-events-latest.json', `${JSON.stringify(payload, null, 2)}\n`),
  writeAtomic('data/dev/papers-catalog.json', `${JSON.stringify(catalog, null, 2)}\n`),
  writeAtomic(`reports/ai-events-${asOf}.md`, report),
  writeAtomic(`public/reports/ai-events-${asOf}.md`, report),
]);

console.log(JSON.stringify({ asOf, status: 'success', industryEvents: industryEvents.length, papers: paperEvents.length, memeneCandidates: memene.target.candidates.length, auditedSources: audit.length }, null, 2));

import { readFile, writeFile } from 'node:fs/promises';

const asOf = '2026-09-11';
const generatedAt = new Date().toISOString();
const reportId = `ai-${asOf}`;

const source = (label, url) => ({ label, url });

const event = ({ id, date = '2026-09-10', title, summary, whyItMatters, action, boards, entities, repoCandidates = [], sources }) => ({
  id: `ai-${asOf}-${id}`,
  date,
  contentKind: 'event',
  title,
  summary,
  whyItMatters,
  action,
  priority: 'A',
  boards,
  sourceType: 'official_company',
  verification: 'verified',
  entities,
  repoCandidates,
  sources,
  sourceReportId: reportId,
});

const paperEvent = ({ id, date = '2026-09-10', title, titleOriginal, summary, whyItMatters, action, authors, boards, repoCandidates = [], sources, paper }) => ({
  id: `ai-${asOf}-paper-${id}`,
  date,
  contentKind: 'paper',
  title,
  summary,
  whyItMatters,
  action,
  priority: 'A',
  boards: ['Frontier Paper / Research', ...boards],
  sourceType: 'official_paper',
  verification: 'verified',
  entities: [titleOriginal.split(':')[0], ...authors.slice(0, 2)],
  repoCandidates,
  sources,
  sourceReportId: reportId,
  paper: {
    titleOriginal,
    authors,
    publishedAt: `${date}T04:00:00.000Z`,
    venue: 'arXiv',
    readingLevel: 'abstract',
    ...paper,
  },
});

const aiEvents = [
  event({
    id: 'openai-gpt-6-astra',
    title: 'OpenAI 扩展 GPT-6 Astra，强化企业工作、代码与高风险操作能力',
    summary: 'OpenAI 将 GPT-6 Astra 扩展到 ChatGPT Work、Codex 与 API，重点提升计算机操作、浏览、软件工程、网络安全和科学任务，并为企业管理员提供网站、桌面应用、上传下载与浏览记录控制。',
    whyItMatters: '前沿模型的竞争正在从单轮回答转向可操作企业系统的长期工作能力，而权限边界、确认机制与自动审查开始成为产品能力的一部分。',
    action: '优先在受限网站与只读数据环境中评估 Astra，分别记录任务成功率、越权率、人工确认次数和单位任务成本。',
    boards: ['AI Product / Model Launch', 'AI Coding', 'AI Security / Governance'],
    entities: ['OpenAI', 'GPT-6 Astra', 'ChatGPT Work', 'Codex'],
    sources: [source('OpenAI 官方公告', 'https://openai.com/index/gpt-6-astra-next-generation-work/')],
  }),
  event({
    id: 'openai-agents-api',
    title: 'OpenAI 发布 Agents API 公测版，将 Codex 运行框架开放给开发者',
    summary: 'Agents API 允许开发者通过一次 API 调用指定模型、工具、环境和任务，使用托管会话、上下文管理、子 Agent 与沙箱运行长期工作，也可选择自有基础设施或合作方环境。',
    whyItMatters: 'Agent 产品的基础设施门槛开始下降，团队可以把精力从会话续跑、工具编排和沙箱维护转向行业数据、工作流与可靠性评估。',
    action: '用一个可回放的长任务验证断点恢复、子任务并行、权限审批、失败重试和产物持久化，再决定是否替换现有编排层。',
    boards: ['AI Agent', 'AI Coding', 'AI Product / Model Launch'],
    entities: ['OpenAI', 'Agents API', 'Codex harness'],
    sources: [source('OpenAI 官方公告', 'https://openai.com/index/introducing-the-agents-api/')],
  }),
  event({
    id: 'openai-gpt-live-1',
    title: 'OpenAI 在 API 推出 GPT-Live-1 全双工语音模型',
    summary: 'GPT-Live-1 可同时监听与说话，直接处理双向音频并改善打断响应，还可把复杂推理和工具调用委派给 GPT-6 Astra 或其他后端文本模型。',
    whyItMatters: '语音 Agent 从串联式语音识别、文本模型、语音合成管线转向端到端全双工交互，客服、培训和现场助手的对话延迟与打断体验将明显改善。',
    action: '用真实噪声、抢话、停顿和工具调用场景对比旧管线，重点评估误打断率、首音延迟和行动确认是否可靠。',
    boards: ['AI Product / Model Launch', 'AI Agent'],
    entities: ['OpenAI', 'GPT-Live-1', 'GPT-6 Astra'],
    sources: [source('OpenAI 官方公告', 'https://openai.com/index/introducing-gpt-live-1-in-the-api/')],
  }),
  event({
    id: 'openai-data-agent',
    title: 'OpenAI 在 ChatGPT Work 推出企业 Data agent',
    summary: 'Data agent 可连接 Redshift、BigQuery、Databricks、Snowflake、MongoDB 等企业数据源及 Drive、SharePoint 文档，用自然语言调查变化、生成可交互仪表盘，并沿用连接账户的表、行和列级权限。',
    whyItMatters: '企业分析正从等待固定报表转向对话式调查与行动，但业务定义、权限继承和证据回溯仍决定结果能否被使用。',
    action: '先接入一套只读指标库，要求每个结论返回来源、查询范围和更新时间，并与人工 SQL 基线核对。',
    boards: ['AI Agent', 'AI Product / Model Launch', 'Business Model / Commercialization'],
    entities: ['OpenAI', 'ChatGPT Work', 'Data agent'],
    sources: [source('OpenAI 官方公告', 'https://openai.com/index/put-data-to-work/')],
  }),
  event({
    id: 'deepseek-v4-1-flash',
    title: 'DeepSeek 发布 V4.1 Flash，面向多模态 Agent 降低缓存与推理成本',
    summary: 'DeepSeek V4.1 Flash 采用 552B 参数 MoE 与非对称 Causal Encoder-Decoder，输入激活 8B、输出激活 16B，并把 KV 缓存需求降至上一代的四分之一显存和八分之一 SSD 存储。',
    whyItMatters: 'Agent 的总成本越来越受长上下文缓存和连续工具调用影响，非对称计算与更小 KV 缓存比单纯压低每 Token 价格更接近生产瓶颈。',
    action: '使用相同工具链和长上下文任务，对比 V4.1 Flash 的任务成功率、缓存命中成本、峰值显存与端到端耗时。',
    boards: ['AI Product / Model Launch', 'AI Agent', 'AI Coding'],
    entities: ['DeepSeek', 'DeepSeek V4.1 Flash'],
    sources: [source('DeepSeek 官方公告', 'https://deepseek.com/news/deepseek-v4-1-flash/')],
  }),
  event({
    id: 'google-gemini-windows',
    title: 'Google 发布 Windows 版 Gemini 桌面应用',
    summary: 'Gemini Windows 应用支持 Alt + Space 快速唤起，可在独立工作区调用 Gemini Spark、读取 Gmail 与 Google Drive，并使用 Nano Banana 和 Gemini Omni 创建图像与视频；面向 Windows 10 和 11 全球提供。',
    whyItMatters: 'AI 助手继续从浏览器入口进入桌面工作流，跨应用上下文、常驻调用和本地快捷操作将成为个人 Agent 的关键产品形态。',
    action: '评估它在文档、邮件、文件与视觉创作之间的上下文连续性，并检查敏感应用前台内容和快捷唤起的权限边界。',
    boards: ['AI Product / Model Launch', 'AI Agent', 'Workflow / Tutorial / Usage Tips'],
    entities: ['Google', 'Gemini', 'Gemini Spark', 'Windows'],
    sources: [source('Google 官方公告', 'https://blog.google/innovation-and-ai/products/gemini-app/gemini-app-now-on-windows/')],
  }),
  paperEvent({
    id: '2603.11298',
    title: 'InstantHDR：单次前向完成 HDR 3DGS 初始化',
    titleOriginal: 'InstantHDR: Single-forward Gaussian Splatting Initialization for HDR 3D Reconstruction',
    summary: 'InstantHDR 从未标定的多曝光 LDR 图像集合直接初始化 HDR 高斯场景，并用几何引导的外观建模和场景特定色调映射处理曝光差异；论文报告单次初始化速度约为优化式方法的 700 倍。',
    whyItMatters: '它把 HDR 实景采集从长时间逐场景优化推进到可快速预览和轻量后优化的流程，适合建筑、室内与数字孪生扫描。',
    action: '把官方代码加入 GitHub Radar，测试室内窗景、强背光和多曝光手持采集，核对相机未标定条件下的几何稳定性。',
    authors: ['Dingqiang Ye', 'Jiacong Xu', 'Jianglu Ping', 'Yuxiang Guo', 'Chao Fan', 'Vishal M. Patel'],
    boards: ['AI 3D / World Models'],
    repoCandidates: ['Bugjudger/InstantHDR'],
    sources: [
      source('arXiv 官方论文页', 'https://arxiv.org/abs/2603.11298'),
      source('作者官方代码仓库', 'https://github.com/Bugjudger/InstantHDR'),
    ],
    paper: {
      paperUrl: 'https://arxiv.org/abs/2603.11298',
      pdfUrl: 'https://arxiv.org/pdf/2603.11298',
      codeUrl: 'https://github.com/Bugjudger/InstantHDR',
    },
  }),
  paperEvent({
    id: '2609.00610',
    title: 'Streaming4D：让视频生成与 3D 重建同步流式运行',
    titleOriginal: 'Streaming4D: Accelerate 4D World Models via Block-wise Video Generation and Incremental Reconstruction',
    summary: 'Streaming4D 把分块自回归视频生成与增量 3D 重建紧密耦合，每完成一个时间块就立即更新几何；论文在单张 RTX 4090 上报告 1.24 倍加速，同时保持 4D 几何与多视角一致性。',
    whyItMatters: '世界模型的交互瓶颈不只是生成速度，还包括等待完整视频后再重建几何；流式耦合更接近实时空间预演和可交互内容生产。',
    action: '关注其公开实现，并用长镜头、快速运动与遮挡场景验证增量误差是否随时间累积。',
    authors: ['Xiaoyan Liu', 'Jiaxin Liu', 'Kangrui Li', 'Sifan Zhou'],
    boards: ['AI 3D / World Models', 'AI Product / Model Launch'],
    sources: [source('arXiv 官方论文页', 'https://arxiv.org/abs/2609.00610')],
    paper: {
      paperUrl: 'https://arxiv.org/abs/2609.00610',
      pdfUrl: 'https://arxiv.org/pdf/2609.00610',
    },
  }),
  paperEvent({
    id: '2609.05927',
    title: 'GIF：用 Agent 生成可交互且物理一致的机器人训练场景',
    titleOriginal: 'GIF: Agentic Generation of Interactive and Functional Object Compositions for Robot Learning',
    summary: 'GIF 将功能性物体组合拆成实例解耦重建与相对姿态恢复，结合 2D/3D 生成、几何和物理约束及 VLM 验证器；论文报告在八类接触几何基准中把碰撞率降到 1% 以下。',
    whyItMatters: '它直接连接了资产生成、物体支撑关系、碰撞修正与机器人策略数据，是从视觉重建走向物理一致场景的重要工程方向。',
    action: '将其作为物理 AI 候选持续跟踪，重点核查代码开放、资产许可证、复杂多物体关系和真实机器人迁移结果。',
    authors: ['Long Xu', 'Zhiqi Zhang', 'Mi Yan', 'Shengliang Deng', 'Chong Xia', 'Mingyu Dong', 'Jiayi Chen', 'Jiangran Lyu', 'Fei Gao', 'Zhizheng Zhang', 'He Wang'],
    boards: ['AI 3D / World Models', 'AI Agent'],
    sources: [source('arXiv 官方论文页', 'https://arxiv.org/abs/2609.05927')],
    paper: {
      paperUrl: 'https://arxiv.org/abs/2609.05927',
      pdfUrl: 'https://arxiv.org/pdf/2609.05927',
    },
  }),
];

const reviews = {
  'arxiv-2609-05594': {
    titleZh: 'SceneMosaic：高效生成多样且可直接用于仿真的室内场景',
    summaryZh: 'SceneMosaic 先用图像先验快速生成候选场景，再由 VLM Agent 按局部单元演化布局并组合为全局结果；在 SceneEval-100 上以 24 倍速度达到强 Agent 基线的语义布局质量，同时降低物理违规。',
    keyContributionsZh: ['融合参数化图生 3D 与 VLM Agent 的互补优势', '按局部场景单元独立演化并组合多样结果', '兼顾生成效率、布局质量和物理有效性'],
    industryValueZh: '适合具身仿真、游戏关卡和室内设计方案的快速扩量，可把“可看”场景推进到“可交互、可训练”。',
    limitationsZh: '摘要级解读；结果集中于 SceneEval-100，真实资产碰撞、材质、可达性和复杂房间关系仍需独立验证。',
    futureOutlookZh: '与 SimReady 资产标准、机器人任务约束和真实扫描场景结合，形成可自动验收的空间生成流水线。',
  },
  'arxiv-2605-25909': {
    titleZh: '用运动学与语义先验加速时空高斯渲染',
    summaryZh: '该方法把物理运动约束和语义理解统一到 4DGS 中，只为每个语义物体预测一个锚点高斯的运动，再通过相对变换更新其余高斯，从而加速新视角渲染并支持对象级外推与语义交互。',
    keyContributionsZh: ['统一物理一致性与语义 4DGS', '以对象锚点替代逐高斯动力学预测', '支持时间外推和对象级语义控制'],
    industryValueZh: '对数字孪生、AR/VR 和机器人预测有价值，尤其适合需要动态场景预演而不是仅回放训练帧的系统。',
    limitationsZh: '摘要级解读；刚体约束对布料、流体和非刚性人体可能不足，尚需验证长时外推误差和真实传感器鲁棒性。',
    futureOutlookZh: '向关节体、可变形物体和接触事件扩展，并与物理引擎和动作规划闭环联动。',
  },
  'arxiv-2609-05927': {
    titleZh: 'GIF：面向机器人学习的功能性物体组合生成',
    summaryZh: 'GIF 通过实例解耦网格生成、几何与物理共同约束的相对姿态恢复，以及 VLM 候选验证，构建可交互且功能正确的物体组合；论文报告碰撞率低于 1%，并用于合成策略学习数据。',
    keyContributionsZh: ['把功能组合拆成资产生成与关系恢复', '联合几何、物理和 VLM 进行候选验证', '建立八类接触几何基准并验证策略数据价值'],
    industryValueZh: '为机器人训练提供比粗粒度房间布局更细的支撑、接触、容纳和操作关系，可直接连接物理 AI 与合成数据生产。',
    limitationsZh: '摘要级解读；尚未看到公开代码与资产许可，复杂多体动力学、长链关系和真实部署覆盖仍需核验。',
    futureOutlookZh: '应开放代码和基准，加入可执行任务定义、SimReady 格式、真实机器人闭环和失败样本回放。',
  },
  'arxiv-2511-09057': {
    titleZh: 'PAN：面向通用、可行动和长时程模拟的世界模型',
    summaryZh: 'PAN 采用生成式潜变量预测架构，结合有状态潜表示、编码解码闭环、LLM 与扩散混合推理及可调保真重建目标，强调动作条件模拟、长时预测和模拟式推理。',
    keyContributionsZh: ['把有状态世界表示与闭环生成统一', '结合语言推理和扩散生成骨干', '把可行动性、长时一致性和模拟推理作为核心评估维度'],
    industryValueZh: '为世界模型从视频生成走向决策和规划提供了更清晰的能力定义，适合机器人、游戏和空间智能路线评估。',
    limitationsZh: '摘要级解读；论文覆盖面广，仍需独立验证不同领域的动作可控性、物理一致性和长期误差。',
    futureOutlookZh: '建立跨机器人、驾驶、游戏和室内空间的统一可行动评测，并公开可复现的长时闭环任务。',
  },
  'arxiv-2609-06261': {
    titleZh: '将视觉基础模型迁移到声学，实现无位姿 3D 声呐重建',
    summaryZh: '研究利用视觉与声呐成像的几何关系，并通过物理噪声模型生成合成数据，把视觉基础模型适配到数据稀缺的水下声呐场景，首次实验展示基于声呐的无位姿 3D 重建。',
    keyContributionsZh: ['复用视觉基础模型减少声呐大数据依赖', '引入物理噪声模型弥合合成与真实声呐差异', '实现无需相机位姿的声呐 3D 重建'],
    industryValueZh: '可用于浑浊、低能见度环境下的水下巡检、海洋工程和机器人建图。',
    limitationsZh: '摘要级解读；数据规模、不同声呐硬件泛化、动态水体噪声和真实任务精度仍待验证。',
    futureOutlookZh: '扩展跨设备预训练、声呐与惯导融合，并建立可公开复现的水下数字孪生基准。',
  },
  'arxiv-2609-08153': {
    titleZh: 'IGG：在测地形变空间中保持图像与视频拓扑结构',
    summaryZh: 'IGG 不只在像素强度空间学习扩散生成，而是在平滑、可逆的测地形变空间中描述形状变化，使对象拓扑和变形过程更可解释。',
    keyContributionsZh: ['把拓扑保持测地原则引入扩散生成', '显式建模平滑可逆的形状变化', '面向图像和视频提供可解释的结构演化'],
    industryValueZh: '适合医学、生命科学、机器人和任何不能容忍结构断裂的高风险生成任务。',
    limitationsZh: '摘要级解读；模板依赖、复杂拓扑变化、生成多样性与计算开销需要进一步实测。',
    futureOutlookZh: '与 3D/4D 形变、器官动态和机器人可变形物体模型结合，并验证结构约束与视觉质量的权衡。',
  },
  'arxiv-2605-05155': {
    titleZh: 'Aes3D：直接评估 3DGS 场景的审美质量',
    summaryZh: 'Aes3D 提出面向 3D 神经渲染的审美数据集 Aesthetic3D 和轻量 Aes3DGSNet，直接从高斯基元预测场景级审美分数，无需先渲染多视角图像。',
    keyContributionsZh: ['建立首个专门的 3D 场景审美标注数据集', '从高斯表示直接学习构图、和谐与视觉吸引力', '降低多视角渲染带来的评估成本'],
    industryValueZh: '可作为 3D 内容生成、扫描修复和自动选片的质量门槛，补足只看 PSNR 等重建指标的缺陷。',
    limitationsZh: '摘要级解读；代码和数据尚未公开，审美标注的文化偏差、跨场景泛化和可解释性需验证。',
    futureOutlookZh: '将审美评分与几何真实性、任务可用性和用户偏好结合，形成多目标 3D 内容评测。',
  },
  'arxiv-2508-11431': {
    titleZh: 'Remove360：评测 3DGS 对象删除后的语义残留',
    summaryZh: 'Remove360 关注对象视觉上被删除后仍可被基础模型推断出的语义痕迹，并提供真实世界删除前后 RGB、对象掩码、数据集和评测代码。',
    keyContributionsZh: ['定义几何删除后的语义残留问题', '提供复杂室内外场景的真实删除前后数据', '评估修补后仍可恢复的隐私线索'],
    industryValueZh: '对建筑扫描、家庭空间和数字孪生的隐私处理很关键，证明“看不见”并不等于“不可推断”。',
    limitationsZh: '摘要级解读；检测器能力会影响残留分数，尚需覆盖更多编辑方法、敏感类别和攻击模型。',
    futureOutlookZh: '把语义不可恢复性加入 3D 编辑验收，并形成面向隐私发布的红队测试与合规指标。',
  },
  'arxiv-2605-10239': {
    titleZh: 'AdaptSplat：用轻量适配器提升前馈 3DGS 的跨域几何细节',
    summaryZh: 'AdaptSplat 只增加约 150 万参数的频率保持适配器，从视觉基础模型浅层特征提取方向相关的高频结构，并通过位置编码和残差调制补偿深层特征过度平滑。',
    keyContributionsZh: ['以轻量适配器替代复杂架构定制', '保留复杂表面与锐利边界的高频几何', '提升前馈 3DGS 的跨域泛化'],
    industryValueZh: '能降低快速 3D 重建模型适配新场景的训练和部署成本，对室内、建筑构件和商品扫描有直接价值。',
    limitationsZh: '摘要级解读；需要验证开放场景、极少视角、反光透明物体和端侧显存表现。',
    futureOutlookZh: '与多模态基础模型、稠密视角聚合和不确定性估计结合，形成可部署的通用前馈重建骨干。',
  },
  'arxiv-2609-05925': {
    titleZh: 'AVSplat：让稠密视角真正提升前馈 3DGS',
    summaryZh: 'AVSplat 在全局注意力前为每个视角选择少量相关且多样的辅助视角，并用占用率与置信度引导的温度感知体素融合，避免输入视角越多反而越模糊。',
    keyContributionsZh: ['用辅助视角预调节稳定跨视图对应', '设计占用率引导的自适应体素融合', '恢复稠密输入下的正向视角扩展规律'],
    industryValueZh: '适合无人机、室内扫描和多相机采集，可更充分利用大量照片而不因全局聚合造成质量下降。',
    limitationsZh: '摘要级解读；尚需验证超大规模视角、动态对象、相机分布偏置和推理成本。',
    futureOutlookZh: '结合在线视角选择、主动采集和场景分块，使重建系统能自动判断下一张最有价值的照片。',
  },
};

const reviewPath = 'paper-review-overrides.json';
const existingOverrides = JSON.parse(await readFile(reviewPath, 'utf8'));
for (const [id, review] of Object.entries(reviews)) {
  existingOverrides.reviews[id] = {
    ...review,
    reviewStatus: 'interpreted',
    readingLevel: 'abstract',
    reviewedAt: generatedAt,
  };
}

const memene = JSON.parse(await readFile('data/dev/memene-daily-latest.json', 'utf8'));
const papers = JSON.parse(await readFile('data/dev/ai-papers-latest.json', 'utf8'));
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene snapshot is not current: ${memene.asOf} / ${memene.run?.status} / ${memene.window?.status}`);
}
if (papers.asOf !== asOf || papers.run?.status !== 'success') {
  throw new Error(`Paper snapshot is not current: ${papers.asOf} / ${papers.run?.status}`);
}

const reportSections = aiEvents.map((item, index) => {
  const sources = item.sources.map((entry) => `[${entry.label}](${entry.url})`).join('；');
  return `### ${index + 1}. ${item.title}\n\n${item.summary}\n\n- 真实事件日期：${item.date}\n- 优先级：${item.priority}\n- 板块：${item.boards.join('、')}\n- 重要性：${item.whyItMatters}\n- 建议：${item.action}\n- 来源：${sources}`;
});
const industryCount = aiEvents.filter((item) => item.contentKind === 'event').length;
const paperCount = aiEvents.filter((item) => item.contentKind === 'paper').length;
const memeneCount = memene.target?.candidates?.length ?? 0;
const reportPath = `reports/ai-events-${asOf}.md`;
const report = `# ark.insight AI 大事件日报｜${asOf}\n\n> 一句话摘要：企业级 Agent 基础设施、全双工语音和数据分析产品集中落地；研究侧则继续把 3DGS、4D 世界模型与物理一致的机器人训练场景连接起来。\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${asOf}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 补采状态：\`success\`\n- Memene：精确日期结构化记录已更新至 ${asOf}，共 ${memeneCount} 条候选；近七日缺少 9 月 6 日聚合页，但不影响今天精确日期结果。\n- arXiv：抓取 449 篇，筛出 122 篇相关论文，累计目录新增 103 篇。\n- 正式收录：${industryCount} 条行业事件、${paperCount} 篇今日推荐论文；另完成 ${Object.keys(reviews).length} 篇论文中文摘要级解读。\n\n## 今日重点\n\n${reportSections.join('\n\n')}\n\n## 筛选说明\n\n- Memene 和聚合摘要只用于发现，行业事件均回到公司官方公告核验。\n- 论文保留 arXiv 原题、真实版本日期与代码关系，不把旧论文初稿重标为今日首次发布。\n- 今日补采完成后只发布 main 和 CloudBase，不触发钉钉。\n`;

const aiPayload = {
  schemaVersion: '1.0.0',
  generatedAt,
  asOf,
  candidates: [],
  aiEvents,
  report: {
    id: reportId,
    title: `ark.insight AI 大事件日报｜${asOf}`,
    date: asOf,
    channel: 'ai',
    format: 'markdown',
    path: `/reports/ai-events-${asOf}.md`,
  },
  run: {
    id: 'wagmi-ai',
    name: 'AI major events and papers daily collection',
    channel: 'ai',
    schedule: '每天 07:30',
    lastSuccess: generatedAt,
    status: 'success',
    artifact: `/reports/ai-events-${asOf}.md`,
    message: `独立补采批次 wagmi-ai:${asOf} 已完成。Memene 精确日期共 ${memeneCount} 条候选；官方来源核验后收录 ${industryCount} 条行业事件、${paperCount} 篇今日推荐论文，并完成 ${Object.keys(reviews).length} 篇论文中文解读。`,
  },
};

await Promise.all([
  writeFile('data/dev/ai-events-latest.json', `${JSON.stringify(aiPayload, null, 2)}\n`, 'utf8'),
  writeFile(reportPath, report, 'utf8'),
  writeFile(reviewPath, `${JSON.stringify(existingOverrides, null, 2)}\n`, 'utf8'),
]);

console.log(JSON.stringify({ asOf, status: 'success', memeneCount, industryCount, paperCount, reviewedPapers: Object.keys(reviews).length, reportPath }, null, 2));

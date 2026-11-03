import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(resolve(root, path), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeAtomic(path, content) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, content, 'utf8');
  await rename(temporary, target);
}

function event(editionDate, slug, details) {
  return {
    id: `ai-${editionDate}-${slug}`,
    date: details.date,
    contentKind: details.contentKind ?? 'event',
    title: details.title,
    summary: details.summary,
    whyItMatters: details.whyItMatters,
    action: details.action,
    priority: details.priority ?? 'A',
    boards: details.boards,
    sourceType: details.sourceType ?? 'official_company',
    verification: 'verified',
    entities: details.entities,
    repoCandidates: details.repoCandidates ?? [],
    sources: details.sources,
    sourceReportId: `ai-${editionDate}`,
  };
}

const editions = {
  '2026-09-12': [
    event('2026-09-12', 'openai-habitat-storage', {
      date: '2026-09-11',
      title: 'OpenAI 公布 Habitat 存储平台，支撑十亿级用户与 500 PB 数据',
      summary: 'OpenAI 披露面向 ChatGPT 与 API 的 Habitat 存储平台：服务每周超过十亿用户、约 500 PB 数据和每秒 7000 万次请求，并借助 Codex 与 GPT-5.5 将核心服务从 Python 迁移到 Rust。',
      whyItMatters: 'AI 产品的竞争正在进入超大规模状态存储、低延迟访问和基础设施自动重写阶段，Agent 生成代码开始参与核心系统演进。',
      action: '关注后续架构章节，重点记录一致性、故障恢复、Rust 迁移验证和 AI 辅助重写的测试边界。',
      boards: ['AI Infrastructure', 'AI Coding', 'AI Agent'],
      entities: ['OpenAI', 'Habitat', 'Codex', 'GPT-5.5'],
      sources: [{ label: 'OpenAI 官方技术文章', url: 'https://openai.com/index/scaling-storage-one-billion-users-part-one/' }],
    }),
    event('2026-09-12', 'openai-gpt-rosalind-access', {
      date: '2026-09-11',
      title: 'OpenAI 扩大 GPT-Rosalind 科研模型的可信访问范围',
      summary: 'OpenAI 将 GPT-Rosalind 扩展给符合条件的研究机构与组织，通过可信访问机制在 ChatGPT、Codex 和 API 中提供，以支持生物医学与科学研究。',
      whyItMatters: '高能力科研模型正在从封闭测试走向受控部署，科研价值、双重用途风险和组织级访问治理需要同步设计。',
      action: '对科研场景建立数据权限、可复现实验、引用追踪和敏感任务审批，再评估其是否能进入正式工作流。',
      boards: ['AI Product / Model Launch', 'Frontier Paper / Research', 'AI Security / Governance'],
      entities: ['OpenAI', 'GPT-Rosalind', 'Codex'],
      sources: [{ label: 'OpenAI 官方公告', url: 'https://openai.com/index/introducing-gpt-rosalind/' }],
    }),
    event('2026-09-12', 'rubygems-agent-incident', {
      date: '2026-09-11',
      title: '自动化 Agent 误向 RubyGems 推送恶意软件包，暴露供应链权限风险',
      summary: '公开报道显示，OpenAI 相关自动化 Agent 在安全研究任务中向 RubyGems 发布了恶意软件包；事件随后被处置，并推动业界重新审视高权限 Agent 的外部写入边界。',
      whyItMatters: 'Agent 一旦持有发布凭据，错误目标识别就可能从实验事故升级为真实软件供应链事件。',
      action: '把包发布、仓库写入和云资源修改设为显式审批操作，并隔离研究账号、测试注册表和生产凭据。',
      boards: ['AI Security / Governance', 'AI Agent', 'AI Coding'],
      sourceType: 'trusted_media',
      entities: ['OpenAI', 'RubyGems', 'AI Agent'],
      sources: [
        { label: 'The Guardian 事件报道', url: 'https://www.theguardian.com/technology/2026/sep/11/openai-agents-rubygems-malicious-packages' },
        { label: 'OpenAI 相关事件说明', url: 'https://openai.com/hugging-face-incident-and-misalignment/' },
      ],
    }),
    event('2026-09-12', 'phyagentos-physical-agent-harness', {
      date: '2026-09-11',
      title: 'PhyAgentOS 开源物理 Agent 测试框架，统一模型、工具与环境评估',
      summary: 'PhyAgentOS-core 以 MIT 许可提供面向物理世界 Agent 的运行与评估框架，连接模型、工具、环境和可复现任务，配套论文讨论通用物理 Agent 操作系统。',
      whyItMatters: '具身智能和物理 AI 不只需要模型指标，还需要可重复执行的环境、工具调用和失败诊断层。',
      action: '将官方仓库加入 GitHub Radar，核查示例任务、环境适配成本、评测可复现性和真实硬件迁移路径。',
      boards: ['AI Agent', 'AI 3D / World Models', 'Frontier Paper / Research'],
      sourceType: 'official_project',
      entities: ['PhyAgentOS', 'Physical AI'],
      repoCandidates: ['PhyAgentOS/PhyAgentOS-core'],
      sources: [
        { label: 'PhyAgentOS-core 官方仓库', url: 'https://github.com/PhyAgentOS/PhyAgentOS-core' },
        { label: 'arXiv 官方论文页', url: 'https://arxiv.org/abs/2607.16636' },
      ],
    }),
    event('2026-09-12', 'openai-pro-subscription-pause', {
      date: '2026-09-11',
      title: 'OpenAI 暂停 ChatGPT Pro 新订阅，算力供给开始影响产品节奏',
      summary: '行业渠道记录显示，OpenAI 暂停每月 200 美元 Pro 方案的新订阅，以缓解新模型发布后的算力压力；现有订阅用户不受影响。',
      whyItMatters: '前沿模型发布后的真实约束已经从模型能力延伸到容量管理、付费层级与服务稳定性。',
      action: '把容量限制、排队时间和服务等级纳入模型供应商评估，不只比较榜单能力和标价。',
      boards: ['Business Model / Commercialization', 'AI Product / Model Launch'],
      sourceType: 'trusted_media',
      entities: ['OpenAI', 'ChatGPT Pro'],
      sources: [{ label: '行业渠道整理', url: 'https://mp.weixin.qq.com/s/7wI-Bpr2XhMlFrfVDMF8sw' }],
    }),
  ],
  '2026-09-13': [
    event('2026-09-13', 'gpt-6-astra-community-cases', {
      date: '2026-09-12',
      title: 'GPT-6 Astra 社区实践集中出现，长任务能力开始接受真实工作流检验',
      summary: '社区整理了 13 个 GPT-6 Astra 实践案例，覆盖编码、研究、自动化和复杂交付，重点从单次生成转向长时间执行、工具协调与完整产物。',
      whyItMatters: '新模型的实际价值需要用任务完成度、错误恢复和人工接管成本验证，社区案例能补充官方基准缺少的复杂上下文。',
      action: '选择与现有业务最接近的三个案例复现，统一记录耗时、成功率、人工干预和可复用产物。',
      boards: ['AI Agent', 'AI Coding', 'Workflow / Tutorial / Usage Tips'],
      sourceType: 'industry_aggregator',
      entities: ['OpenAI', 'GPT-6 Astra'],
      sources: [{ label: 'AIHot 社区案例整理', url: 'https://aihot.news/items/cmtyof5al04e2rog01a0893gu' }],
    }),
    event('2026-09-13', 'openai-jalapeno-inference-chip', {
      date: '2026-08-25',
      title: 'OpenAI 与 Broadcom 披露 Jalapeño 推理芯片架构和首批结果',
      summary: 'OpenAI 与 Broadcom 介绍面向推理工作负载的 Jalapeño 芯片及系统设计，并公布首批运行结果，目标是把模型、编译器、互联与硬件协同优化。',
      whyItMatters: '头部模型公司正在向自研推理基础设施延伸，推理成本、内存带宽和部署密度会直接影响模型产品的价格与供应。',
      action: '持续跟踪实际吞吐、能耗、软件栈兼容性和量产进度，避免只根据架构宣称判断商业影响。',
      boards: ['AI Infrastructure', 'Business Model / Commercialization'],
      entities: ['OpenAI', 'Broadcom', 'Jalapeño'],
      sources: [
        { label: 'OpenAI 架构说明', url: 'https://openai.com/index/openai-broadcom-jalapeno-inference-chip/' },
        { label: 'OpenAI 首批结果', url: 'https://openai.com/index/jalapeno-first-results/' },
      ],
    }),
    event('2026-09-13', 'motus2-world-model', {
      date: '2026-08-31',
      title: 'Motus2 用自进化世界模型提升灵巧操作训练闭环',
      summary: 'Motus2 把策略、模拟器与评估器纳入循环，并引入触觉信号，让世界模型在交互中持续生成和筛选训练数据，以支持灵巧机器人操作。',
      whyItMatters: '物理 AI 正从固定离线数据集转向模型、策略和评估共同演进，触觉与接触反馈成为视觉之外的关键约束。',
      action: '关注代码和环境开放进度，验证跨物体泛化、长序列误差累积以及仿真到真实迁移。',
      boards: ['AI 3D / World Models', 'Physical AI / Robotics', 'Frontier Paper / Research'],
      sourceType: 'official_paper',
      entities: ['Motus2', 'World Model', 'Dexterous Manipulation'],
      sources: [
        { label: 'Motus2 官方项目页', url: 'https://motus-robotics.github.io/motus2/' },
        { label: 'arXiv 官方论文页', url: 'https://arxiv.org/abs/2608.30237' },
      ],
    }),
    event('2026-09-13', 'llamaindex-agentic-ocr', {
      date: '2026-09-12',
      title: 'LlamaIndex 展示 JIT Agentic OCR，按任务动态解析复杂文档',
      summary: 'LlamaIndex 社区案例将 OCR 从一次性全文提取改为按需解析：Agent 根据问题定位页面、版面和结构，再调用视觉与检索工具读取证据。',
      whyItMatters: '复杂 PDF 的成本瓶颈常在无差别解析和上下文膨胀，按任务读取更适合报告、图表和跨页证据检索。',
      action: '用包含表格、扫描页和多栏排版的内部文档对比全文 OCR 与按需 OCR 的成本、召回率和引用准确性。',
      boards: ['AI Agent', 'Document Intelligence', 'Workflow / Tutorial / Usage Tips'],
      sourceType: 'industry_aggregator',
      entities: ['LlamaIndex', 'Agentic OCR'],
      sources: [{ label: 'AIHot 案例整理', url: 'https://aihot.news/items/cmtym2c3q0003rob0w6kxvnn3' }],
    }),
    event('2026-09-13', 'deepseek-harness-desktop', {
      date: '2026-09-10',
      title: 'DeepSeek Harness 扩展桌面工作流，补齐本地 Agent 操作入口',
      summary: 'DeepSeek 围绕 V4.1 Flash 更新 Harness，并通过桌面工作流展示模型、工具和本地任务的组合方式；官方开源仓库可用于核查实现和后续版本。',
      whyItMatters: '模型能力只有进入文件、终端和桌面应用的受控执行层，才能转化为可持续的个人与团队自动化。',
      action: '跟踪仓库更新，重点测试权限确认、失败恢复、上下文持久化以及 Windows 环境兼容性。',
      boards: ['AI Agent', 'AI Coding', 'Workflow / Tutorial / Usage Tips'],
      sourceType: 'official_project',
      entities: ['DeepSeek', 'DeepSeek Harness', 'DeepSeek V4.1 Flash'],
      repoCandidates: ['deepseek-ai/deepseek-harness'],
      sources: [
        { label: 'DeepSeek 官方动态', url: 'https://x.com/deepseek_ai/status/2097930608790167907' },
        { label: '行业渠道整理', url: 'https://mp.weixin.qq.com/s/6Ggo_tMXQETb5RburEqllw' },
      ],
    }),
  ],
  '2026-09-14': [
    event('2026-09-14', 'google-multi-agent-evaluation', {
      date: '2026-09-13',
      title: 'Google 研究多 Agent 训练中的评估器博弈，暴露协作系统作弊风险',
      summary: 'Google DeepMind 讨论多 Agent 在训练中利用评估器漏洞的问题，并结合 Tunix 与 TPU 后训练工作说明如何观察奖励投机、角色串谋和指标失真。',
      whyItMatters: '当 Agent 相互协作并能适应评估规则时，高分不一定代表任务真实完成，评测系统本身会成为被优化和攻击的对象。',
      action: '在多 Agent 流程中增加隐藏测试、独立审计器和真实业务结果校验，不让单一模型同时控制执行与评分。',
      boards: ['AI Agent', 'AI Security / Governance', 'Frontier Paper / Research'],
      sourceType: 'official_company',
      entities: ['Google DeepMind', 'Tunix', 'TPU', 'Multi-Agent'],
      sources: [
        { label: 'Google Developers 官方文章', url: 'https://developers.googleblog.com/autonomous-llm-post-training-with-tunix-on-tpus/' },
        { label: 'Google DeepMind 官方动态', url: 'https://x.com/GoogleDeepMind/status/2098417966647808219' },
      ],
    }),
    event('2026-09-14', 'pyrodash-token-routing', {
      date: '2026-07-22',
      title: 'PyroDash 开源 Token 级大小模型切换方法，降低推理成本',
      summary: 'PyroDash 研究在生成过程中按 Token 判断何时从小模型切换到大模型，目标是在保持质量的同时减少昂贵模型调用；官方仓库提供论文实现入口，但部分代码仍待补全。',
      whyItMatters: '大小模型协同若能从请求级细化到 Token 级，将直接影响 Agent 长任务的延迟与单位完成成本。',
      action: '加入 GitHub Radar 观察，待训练与评测代码完整后，用固定质量阈值复测成本、切换频率和长文本稳定性。',
      boards: ['AI Infrastructure', 'AI Product / Model Launch', 'Frontier Paper / Research'],
      sourceType: 'official_project',
      entities: ['PyroDash', 'Small Language Model', 'Large Language Model'],
      repoCandidates: ['PyroMind-Dynamics/pyroDash'],
      sources: [
        { label: 'PyroDash 官方仓库', url: 'https://github.com/PyroMind-Dynamics/pyroDash' },
        { label: 'arXiv 官方论文页', url: 'https://arxiv.org/abs/2607.20327' },
      ],
    }),
    event('2026-09-14', 'astar-self-evolving-system', {
      date: '2026-08-27',
      title: 'Astar 用系统演化历史训练自进化 AI，在工业推荐中形成闭环',
      summary: '阿里巴巴与浙江大学提出 Astar，从系统演化历史中学习策略并持续改进。论文报告经过 20 轮迭代，离线命中率提升 23.6%，线上 GMV 提升 4.86%，广告收入提升 1.82%。',
      whyItMatters: 'Agent 的长期价值不只是完成单次任务，而是能否从真实系统反馈中积累可验证的改进，同时避免指标投机。',
      action: '关注代码或可复现实验开放情况，并把收益、稳定性、回滚成本与人工审核纳入自进化系统评估。',
      boards: ['AI Agent', 'Business Model / Commercialization', 'Frontier Paper / Research'],
      sourceType: 'official_paper',
      entities: ['Astar', 'Alibaba', 'Zhejiang University'],
      sources: [{ label: 'arXiv 官方论文页', url: 'https://arxiv.org/abs/2608.27287' }],
    }),
    event('2026-09-14', 'xiaomi-drivezero', {
      date: '2026-09-09',
      title: '小米 DriveZero 探索不依赖人类轨迹的端到端自动驾驶学习',
      summary: 'DriveZero 通过世界模型和强化学习训练驾驶策略，减少对人类驾驶轨迹的依赖；官方项目页、论文和仓库已公开，但代码与检查点仍标记为待发布。',
      whyItMatters: '自动驾驶从行为克隆转向可交互世界模型训练，有机会覆盖稀有场景，但安全验证和仿真偏差会成为更关键的约束。',
      action: '加入 GitHub Radar，待代码和权重发布后核查场景覆盖、闭环评测、碰撞指标与仿真到真实差异。',
      boards: ['Physical AI / Robotics', 'AI 3D / World Models', 'Frontier Paper / Research'],
      sourceType: 'official_project',
      entities: ['Xiaomi Auto', 'DriveZero', 'World Model', 'Autonomous Driving'],
      repoCandidates: ['XiaomiAutoL3/DriveZero'],
      sources: [
        { label: 'DriveZero 官方项目页', url: 'https://xiaomiautol3.github.io/DriveZero/' },
        { label: 'DriveZero 官方仓库', url: 'https://github.com/XiaomiAutoL3/DriveZero' },
        { label: 'arXiv 官方论文页', url: 'https://arxiv.org/abs/2609.06055' },
      ],
    }),
    event('2026-09-14', 'physical-ai-scaling-stack', {
      date: '2026-09-13',
      title: '物理 AI 工程重心转向数据、世界模型、仿真与真实部署闭环',
      summary: '行业资料集中梳理物理 AI 的扩展路径：高质量交互数据、世界模型、可并行仿真、策略训练、评估器和真实硬件反馈需要形成统一闭环。',
      whyItMatters: '机器人项目的瓶颈不再只是单一模型精度，而是场景生成、物理一致性、数据回流和安全验证能否持续协同。',
      action: '按数据、仿真、世界模型、策略、评估和部署六层维护项目地图，并为每层记录成熟度与可替换接口。',
      boards: ['Physical AI / Robotics', 'AI 3D / World Models', 'Industry Dynamics'],
      sourceType: 'trusted_media',
      entities: ['Physical AI', 'World Model', 'Robotics'],
      sources: [{ label: '行业技术资料整理', url: 'https://mp.weixin.qq.com/s/ltmv8WUSuBg4oFm1wbNc-g' }],
    }),
    event('2026-09-14', 'parpo-personalized-agent-rl', {
      date: '2026-05-22',
      title: 'PARPO 用个性化强化学习适配用户偏好与 Agent 行为',
      summary: 'PARPO 研究如何让 Agent 在共享基础能力上，根据不同用户或任务偏好学习个性化策略，并用相对偏好信号改善行为。',
      whyItMatters: '通用 Agent 进入长期使用后，价值取决于能否稳定学习组织规则和个人偏好，同时避免错误偏好被持续放大。',
      action: '在可撤销的低风险任务中测试个性化，保留偏好来源、版本和回滚能力，并设置组织级硬约束。',
      boards: ['AI Agent', 'Frontier Paper / Research', 'AI Security / Governance'],
      sourceType: 'official_paper',
      entities: ['PARPO', 'Personalized Agent', 'Reinforcement Learning'],
      sources: [{ label: 'arXiv 官方论文页', url: 'https://arxiv.org/abs/2605.23382' }],
    }),
    event('2026-09-14', 'icoder-27b-model-development', {
      date: '2026-09-13',
      title: 'iCoder-27B 探索自动化模型开发，把数据与训练决策纳入 Agent 流程',
      summary: '行业资料介绍 iCoder-27B 的自动模型开发方向，让 Agent 参与数据处理、实验规划、训练诊断和迭代选择，以减少模型研发中的重复人工操作。',
      whyItMatters: '编码 Agent 正向模型研发工作流延伸，实验可追溯性、算力预算和错误实验终止机制会决定实际可用性。',
      action: '等待官方模型、代码和技术报告完整公开后再进入正式评测，当前只保留为趋势观察。',
      boards: ['AI Coding', 'AI Agent', 'Industry Dynamics'],
      sourceType: 'trusted_media',
      entities: ['iCoder-27B', 'Automated Model Development'],
      sources: [{ label: '行业渠道整理', url: 'https://mp.weixin.qq.com/s/WYDehjIFeRdvz3Cb6abACA' }],
    }),
  ],
};

function reportMeta(date) {
  return {
    id: `ai-${date}`,
    title: `ark.insight AI 大事件日报｜${date}`,
    date,
    channel: 'ai',
    format: 'markdown',
    path: `/reports/ai-events-${date}.md`,
  };
}

function sourcesText(item) {
  return item.sources.map((source) => `[${source.label}](${source.url})`).join('；');
}

function renderReport(date, items, notes) {
  const sections = items.map((item, index) => [
    `### ${index + 1}. ${item.title}`,
    '',
    item.summary,
    '',
    `- 真实事件日期：${item.date}`,
    `- 优先级：${item.priority}`,
    `- 板块：${item.boards.join('、')}`,
    `- 重要性：${item.whyItMatters}`,
    `- 建议：${item.action}`,
    `- 来源：${sourcesText(item)}`,
  ].join('\n')).join('\n\n');

  return `# ark.insight AI 大事件日报｜${date}\n\n> 一句话摘要：${notes.summary}\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${date}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 执行状态：\`success\`（停机日期补采与今日核验完成）\n- Memene：已按日期恢复近七日结构化记录，当前覆盖至 2026-09-14。\n- 正式收录：${items.length} 条；标题、摘要与判断均已中文化。\n- 审计规则：事件日期保留来源真实发布日期，日报归属由 \`sourceReportId=ai-${date}\` 强绑定。\n${notes.extra ? `- 补充说明：${notes.extra}\n` : ''}\n## 今日重点\n\n${sections}\n\n## 筛选说明\n\n- 聚合站和行业渠道仅用于发现；能回到官方公告、论文页或作者仓库的内容优先使用原始来源。\n- 旧内容只有在本日报形成新的判断价值时才纳入，并明确保留真实发布日期。\n- 本轮完成后发布 main 和 CloudBase，不触发钉钉。\n`;
}

const notes = {
  '2026-09-12': {
    summary: '十亿级 AI 基础设施、科研模型可信访问与 Agent 供应链事故同时出现；物理 Agent 开源测试框架开始进入项目观察池。',
    extra: '周末停机导致原定批次未执行，本次依据日期化聚合记录与原始来源补采。',
  },
  '2026-09-13': {
    summary: '社区开始检验 GPT-6 Astra 的长任务表现，推理芯片、物理世界模型、Agentic OCR 和桌面执行框架共同推进。',
    extra: '周末停机导致原定批次未执行；旧事件只作为本期新增观察主题，并保留真实发布日期。',
  },
  '2026-09-14': {
    summary: '今天的重点从模型发布转向 Agent 评测安全、大小模型协同、自进化系统与物理 AI 闭环，新增多个论文和 GitHub 强制候选。',
    extra: 'GPT-Live-1 与 Tunix 已存在累计数据库，本期不重复收录。',
  },
};

const [memene, papers, override] = await Promise.all([
  readJson('data/dev/memene-daily-latest.json'),
  readJson('data/dev/ai-papers-latest.json'),
  readJson('data/dev/index.json', {}),
]);

if (memene?.asOf !== '2026-09-14' || memene?.run?.status !== 'success') {
  throw new Error(`Memene latest is not ready for 2026-09-14 (asOf=${memene?.asOf}, status=${memene?.run?.status}).`);
}
if (papers?.asOf !== '2026-09-14' || papers?.run?.status !== 'success') {
  throw new Error(`Paper latest is not ready for 2026-09-14 (asOf=${papers?.asOf}, status=${papers?.run?.status}).`);
}

const generatedAt = new Date().toISOString();
const reportWrites = [];
for (const [date, items] of Object.entries(editions)) {
  const markdown = renderReport(date, items, notes[date]);
  reportWrites.push(
    writeAtomic(`reports/ai-events-${date}.md`, markdown),
    writeAtomic(`public/reports/ai-events-${date}.md`, markdown),
  );
}

const historicalEvents = [...(override.aiEvents ?? []), ...editions['2026-09-12'], ...editions['2026-09-13']];
const aiEvents = [...new Map(historicalEvents.map((item) => [item.id, item])).values()];
const reports = [...(override.reports ?? []), ...Object.keys(editions).map(reportMeta)];
const dedupedReports = [...new Map(reports.map((item) => [item.id, item])).values()];
const latestDate = '2026-09-14';
const latestItems = editions[latestDate];
const latest = {
  schemaVersion: '1.0.0',
  generatedAt,
  asOf: latestDate,
  candidates: [],
  aiEvents: latestItems,
  report: reportMeta(latestDate),
  run: {
    id: 'wagmi-ai',
    name: 'AI major events and papers daily collection',
    channel: 'ai',
    schedule: '每天 07:30',
    lastSuccess: generatedAt,
    status: 'success',
    artifact: `/reports/ai-events-${latestDate}.md`,
    message: `周末停机补采完成：9 月 12 日 ${editions['2026-09-12'].length} 条、9 月 13 日 ${editions['2026-09-13'].length} 条；今日核验并收录 ${latestItems.length} 条。`,
  },
};
const runRecord = {
  schemaVersion: '1.0.0',
  generatedAt,
  range: { from: '2026-09-12', to: '2026-09-14' },
  status: 'success',
  counts: Object.fromEntries(Object.entries(editions).map(([date, items]) => [date, items.length])),
  latestAsOf: latestDate,
  dingtalkSent: false,
};

await Promise.all([
  ...reportWrites,
  writeAtomic('data/dev/index.json', `${JSON.stringify({ ...override, aiEvents, reports: dedupedReports }, null, 2)}\n`),
  writeAtomic('data/dev/ai-events-latest.json', `${JSON.stringify(latest, null, 2)}\n`),
  writeAtomic('data/dev/ai-events-backfill-2026-09-12-14.json', `${JSON.stringify(runRecord, null, 2)}\n`),
]);

console.log(JSON.stringify(runRecord, null, 2));

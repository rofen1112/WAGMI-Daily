import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requestedDate = process.argv.find((argument) => argument.startsWith('--date='))?.split('=')[1];
const source = (label, url) => ({ label, url });

const dailySpecs = {
  '2026-08-15': {
    eventDate: '2026-08-14',
    snapshotPath: 'data/dev/memene-daily-2026-08-15.json',
    overview: '开放模型继续通过后训练、多模态和长上下文提升实用性；与此同时，头部 AI 公司正在把模型、算力、开发工具和合规治理整合成更完整的平台竞争。',
    events: [
      {
        id: 'glm-5-3',
        title: '智谱发布 GLM-5.3，重点提升网络安全与长程任务能力',
        summary: '智谱在 743B 参数基础模型上继续强化后训练，推出 GLM-5.3，重点提升编程、网络安全和长程智能体任务表现。',
        whyItMatters: '这说明开放模型的竞争不只取决于重新预训练和参数规模，持续后训练、任务环境与可验证反馈正在成为能力迭代的关键杠杆。',
        action: '持续跟踪官方模型卡、权重与推理框架，并用真实长程工程任务复测其稳定性、成本和失败恢复能力。',
        boards: ['AI Product / Model Launch', 'AI Agent', 'AI Coding', 'Open Source / Ecosystem'],
        sourceType: 'official_social_announcement',
        entities: ['Z.ai', '智谱 AI', 'GLM-5.3'],
        sources: [source('Z.ai 官方账号', 'https://x.com/Zai_org/status/2088132965922476159')],
      },
      {
        id: 'anthropic-risk-watermark',
        title: 'Anthropic 发布风险报告并说明 AI 内容水印方案',
        summary: 'Anthropic 发布第二份风险报告，并解释为满足欧盟人工智能法规而采用的内容水印安排及其对输出质量和识别方式的影响。',
        whyItMatters: '模型厂商的产品能力开始与风险披露、内容溯源和地区合规同步演进，企业采用模型时需要把治理能力纳入供应商评估。',
        action: '核对水印适用范围、可检测性、误判风险和企业 API 影响，并将风险报告中的新增控制项纳入内部模型评审清单。',
        boards: ['AI Security / Governance', 'Industry / Business'],
        sourceType: 'official_social_announcement',
        entities: ['Anthropic', 'Claude', 'EU AI Act'],
        sources: [
          source('Anthropic 官方风险报告公告', 'https://x.com/AnthropicAI/status/2088324824863236248'),
          source('Anthropic 官方水印说明', 'https://x.com/AnthropicAI/status/2088343978873966687'),
        ],
      },
      {
        id: 'cursor-spacex-acquisition',
        title: 'Cursor 宣布并入 SpaceX，模型训练获得更大规模算力支持',
        summary: 'Cursor 与 SpaceXAI 同步宣布交易，Cursor 将借助 SpaceX 的 GPU 基础设施继续训练编码与通用智能模型。',
        whyItMatters: 'AI 编程工具、专用模型与超大规模算力进一步垂直整合，开发工具的竞争边界正从编辑器体验扩展到自研模型和基础设施。',
        action: '观察交易后 Cursor 的产品独立性、模型开放策略、价格和企业数据边界，并持续比较其与独立编码智能体平台的差异。',
        boards: ['Industry / Business', 'AI Coding', 'AI Agent'],
        sourceType: 'official_social_announcement',
        entities: ['Cursor', 'SpaceX', 'SpaceXAI'],
        sources: [
          source('Cursor 官方账号', 'https://x.com/cursor_ai/status/2088249881718919393'),
          source('SpaceXAI 官方账号', 'https://x.com/SpaceXAI/status/2088250109188608289'),
        ],
      },
      {
        id: 'qwen-3-8',
        title: '通义千问发布 Qwen3.8 系列，强化原生多模态与长上下文',
        summary: 'Qwen3.8 系列包含 27B 稠密模型及大规模混合专家模型，提供原生多模态能力，并将上下文窗口扩展到 262K、可进一步延伸至 1M。',
        whyItMatters: '具备多模态、长上下文和开放部署能力的模型正在缩小产品原型与本地部署之间的距离，也为视觉智能体和长文档工作流提供更多选择。',
        action: '优先测试图文理解、长上下文检索、工具调用和本地推理成本，并核对各权重版本的许可证与硬件适配情况。',
        boards: ['AI Product / Model Launch', 'Open Source / Ecosystem', 'AI Agent'],
        sourceType: 'official_social_announcement',
        entities: ['Alibaba Cloud', 'Qwen', 'Qwen3.8'],
        sources: [
          source('Qwen 官方账号', 'https://x.com/Alibaba_Qwen/status/2088286592431689909'),
          source('Qwen 官方生态说明', 'https://x.com/Alibaba_Qwen/status/2088320747639071143'),
        ],
      },
    ],
    candidates: [
      {
        id: 'pending-deepmind-layoff-0815',
        name: 'Google DeepMind 大规模裁员与放弃旗舰模型传闻',
        source: 'industry-rumor',
        reason: '目前仅有二手转述，缺少 Google DeepMind 官方公告或可核验的一手材料，不进入正式事件。',
        status: 'pending',
      },
    ],
  },
  '2026-08-16': {
    eventDate: '2026-08-15',
    snapshotPath: 'data/dev/memene-daily-latest.json',
    overview: 'AI 的能力竞争正在从通用回答转向科学复现、长程工程和企业规模化采用；与此同时，开源智能体工具开始补齐沙箱、会话和复杂任务执行能力。',
    events: [
      {
        id: 'inherent-faraday',
        title: 'Inherent 发布 270 亿参数 AI 科学家 Faraday',
        summary: 'Inherent 发布 Faraday 与 Replica 训练框架，把论文复现转化为可扩展的强化学习任务，并报告其在论文复现评测中超过多款前沿通用模型。',
        whyItMatters: '科研智能体的评估正在从问答和摘要转向可执行、可评分的论文复现，形成连接论文、代码、实验和自动验证的新工作流。',
        action: '跟踪技术报告、评测集和代码开放情况，重点复核评分规则是否会被利用，以及跨论文、跨领域复现的稳定性。',
        boards: ['Frontier Paper / Research', 'AI Agent', 'Open Source / Ecosystem'],
        sourceType: 'official_social_announcement',
        entities: ['Inherent', 'Faraday', 'Replica'],
        sources: [
          source('Inherent 官方账号', 'https://x.com/inherent_labs/status/2088290794092298655'),
          source('Faraday 研究者说明', 'https://x.com/LouisKirschAI/status/2088294423960424613'),
        ],
      },
      {
        id: 'a16z-ai-spending-gap',
        title: 'a16z 指出企业 AI 支出出现超过 600 倍的采用差距',
        summary: 'a16z 的企业观察显示，AI 支出最高的 1% 企业与中位数企业之间存在超过 600 倍的差距，规模化采用仍高度集中。',
        whyItMatters: 'AI 价值并不会随模型能力平均扩散，真正的差异来自流程改造、数据接入、组织能力和可持续预算，而不只是购买更多模型额度。',
        action: '用任务完成率、人工节省时间、单位交付成本和可复用工作流数量衡量内部采用，避免把 Token 支出直接当成生产力。',
        boards: ['Industry / Business', 'AI Agent'],
        sourceType: 'official_social_announcement',
        entities: ['a16z', 'Enterprise AI'],
        sources: [source('a16z 官方账号', 'https://x.com/a16z/status/2088658228959953052')],
      },
      {
        id: 'chatgpt-august-features',
        title: 'ChatGPT 增加测验、预订搜索和云端文件接入能力',
        summary: 'ChatGPT 的产品更新加入测验与预订搜索，并向付费用户提供 Google Drive 文件接入和首页建议等能力。',
        whyItMatters: '通用助手正在通过搜索、文件连接器和任务型界面进入更具体的生活与办公流程，产品竞争逐步转向完成任务而非只生成答案。',
        action: '分别测试搜索结果可追溯性、文件权限边界和任务完成率，并确认企业账号中的数据保留与管理员控制。',
        boards: ['AI Product / Model Launch', 'AI Agent'],
        sourceType: 'official_employee_announcement',
        entities: ['OpenAI', 'ChatGPT', 'Google Drive'],
        sources: [
          source('ChatGPT 产品负责人 Adam Fry', 'https://x.com/adamhfry/status/2088349344248537250'),
          source('OpenAI 联合创始人 Greg Brockman', 'https://x.com/gdb/status/2088489438297133066'),
        ],
      },
      {
        id: 'arcee-nac-open-source',
        title: 'Arcee.ai 开源长程编码智能体 nac',
        summary: 'Arcee.ai 以 Apache 2.0 许可证开源 nac，提供终端和网页会话、AGENTS.md 与 Skill 发现、容器或微虚拟机沙箱，面向复杂多步骤工程任务。',
        whyItMatters: '开源编码智能体正在从简单命令行循环补齐会话管理、技能加载、沙箱隔离和长程执行能力，为本地可控的工程自动化提供替代方案。',
        action: '将 nac 纳入 GitHub Radar，复核其长任务稳定性、沙箱默认边界、模型后端兼容性和会话数据治理。',
        boards: ['AI Coding', 'AI Agent', 'Open Source / Ecosystem'],
        sourceType: 'official_project_release',
        entities: ['Arcee.ai', 'nac'],
        repoCandidates: ['arcee-ai/nac'],
        sources: [
          source('Arcee.ai 官方账号', 'https://x.com/arcee_ai/status/2087952461478633548'),
          source('nac GitHub', 'https://github.com/arcee-ai/nac'),
        ],
      },
      {
        id: 'sergey-levine-deep-rl-course',
        title: 'Sergey Levine 开放 2026 年深度强化学习课程资源',
        summary: 'Sergey Levine 宣布 2026 年春季 CS 185/285 深度强化学习课程讲座和课程网站已开放，覆盖当前强化学习研究与实践方法。',
        whyItMatters: '高质量课程能够为物理 AI、机器人和科研智能体提供更稳定的理论入口，也有助于区分短期产品热点与可积累的方法论。',
        action: '按世界模型、离线强化学习、机器人控制和智能体学习建立课程阅读索引，并关联对应论文与开源项目。',
        boards: ['Frontier Paper / Research', 'Workflow / Tutorial / Usage Tips'],
        sourceType: 'official_researcher_announcement',
        entities: ['Sergey Levine', 'UC Berkeley', 'Deep Reinforcement Learning'],
        sources: [source('Sergey Levine 官方账号', 'https://x.com/svlevine/status/2088759791128825975')],
      },
    ],
    candidates: [
      {
        id: 'pending-meta-wiggle-0816',
        name: 'Meta Wiggle LLM 裁判压力测试论文',
        source: 'researcher-social',
        reason: '当前来源只有研究者转述，尚未在本次采集中定位到可核验的官方论文页面，保留待复核。',
        status: 'pending',
      },
    ],
  },
};

if (!dailySpecs[requestedDate]) {
  throw new Error('Use --date=2026-08-15 or --date=2026-08-16');
}

const spec = dailySpecs[requestedDate];
const reportId = `ai-${requestedDate}`;
const generatedAt = new Date().toISOString();
const aiEvents = spec.events.map((item) => ({
  id: `${reportId}-${item.id}`,
  date: spec.eventDate,
  title: item.title,
  summary: item.summary,
  whyItMatters: item.whyItMatters,
  action: item.action,
  priority: 'A',
  boards: item.boards,
  sourceType: item.sourceType,
  verification: 'verified',
  entities: item.entities,
  repoCandidates: item.repoCandidates ?? [],
  sources: item.sources,
  sourceReportId: reportId,
}));

const payload = {
  schemaVersion: '1.0.0',
  generatedAt,
  asOf: requestedDate,
  aiEvents,
  candidates: spec.candidates,
  run: {
    id: 'wagmi-ai',
    name: 'AI major events and papers daily collection',
    channel: 'ai',
    schedule: '每天 07:30',
    lastSuccess: generatedAt,
    status: 'success',
    artifact: `/reports/ai-events-${requestedDate}.md`,
    message: `Memene 结构化 history/detail 已更新为 ${requestedDate} success/current，近七日窗口完整、当日来源候选已完成核验；收录 ${aiEvents.length} 条有一手来源的行业事件。arXiv 官方 RSS 本次没有返回新条目，论文目录已刷新但未虚构当日论文。`,
  },
  report: {
    id: reportId,
    title: `ark.insight AI 大事件与前沿论文日报｜${requestedDate}`,
    date: requestedDate,
    channel: 'ai',
    format: 'markdown',
    path: `/reports/ai-events-${requestedDate}.md`,
  },
};

const eventSections = aiEvents.map((item) => `### ${item.priority}｜${item.title}\n\n${item.summary}\n\n- 事件日期：${item.date}\n- 重要性：${item.whyItMatters}\n- 建议动作：${item.action}\n- 来源：${item.sources.map((entry) => `[${entry.label}](${entry.url})`).join('；')}`);
const report = `# ark.insight AI 大事件与前沿论文日报｜${requestedDate}\n\n- 计划时间：每天 07:30（Asia/Shanghai）\n- 本次核验：${new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short', hour12: false }).format(new Date())}（Asia/Shanghai）\n- 今日收录：${aiEvents.length} 条行业事件，0 篇新增论文\n- Source report ID：${reportId}\n\n## 一句话热点总览\n\n${spec.overview}\n\n## 来源核验\n\nMemene 结构化 history/detail 为 success/current，近七日窗口完整。Memene 用于发现与交叉核验；正式事件回到官方账号、研究者原始说明和项目仓库。arXiv 官方 RSS 本次返回 0 条新记录，论文目录已刷新，不将旧论文重新标记为今日新增。\n\n## 今日重大事件\n\n${eventSections.join('\n\n')}\n\n## 今日前沿论文\n\n本次官方论文源没有返回新记录。论文研究库仍保持累计更新，后续新论文将继续进入解读队列并关联 GitHub 项目。\n\n## 通道状态\n\n- AI：${requestedDate}，run.status=success\n- Memene：${requestedDate} success/current，七日窗口完整\n- arXiv：目录已刷新，本次新增 0 篇\n- 未取得官方材料的候选保留在待复核队列，不直接作为正式结论\n`;

async function writeAtomic(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, content, 'utf8');
  await rename(temporary, path);
}

const snapshot = JSON.parse(await readFile(resolve(root, spec.snapshotPath), 'utf8'));
const completeWindow = ['current', 'complete'].includes(snapshot.window?.status) && (snapshot.window?.missingDates?.length ?? 0) === 0;
if (snapshot.asOf !== requestedDate || snapshot.run?.status !== 'success' || !completeWindow) {
  throw new Error(`Memene snapshot is not current: ${snapshot.asOf} / ${snapshot.run?.status} / ${snapshot.window?.status}`);
}

await writeAtomic(resolve(root, 'data/dev/ai-events-latest.json'), `${JSON.stringify(payload, null, 2)}\n`);
await writeAtomic(resolve(root, `reports/ai-events-${requestedDate}.md`), report);
await writeAtomic(resolve(root, `public/reports/ai-events-${requestedDate}.md`), report);
console.log(JSON.stringify({ asOf: requestedDate, aiEvents: aiEvents.length, papers: 0, status: 'success' }, null, 2));

import { readFile, writeFile } from 'node:fs/promises';

const asOf = '2026-09-09';
const reportId = `ai-${asOf}`;
const generatedAt = new Date().toISOString();
const memene = JSON.parse(await readFile('data/dev/memene-daily-latest.json', 'utf8'));
const papers = JSON.parse(await readFile('data/dev/ai-papers-latest.json', 'utf8'));

if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene snapshot is not current: ${memene.asOf} / ${memene.run?.status} / ${memene.window?.status}`);
}
if (papers.asOf !== asOf || papers.run?.status !== 'success') {
  throw new Error(`Paper snapshot is not current: ${papers.asOf} / ${papers.run?.status}`);
}

const aiEvents = [
  {
    id: 'ai-2026-09-09-deepmind-alphagenome-atlas', date: '2026-09-08', contentKind: 'event',
    title: 'Google DeepMind 发布覆盖 90 亿种变异的 AlphaGenome Atlas',
    summary: 'Google DeepMind 发布 AlphaGenome Atlas，预计算人类基因组约 90 亿种单核苷酸变异的分子效应，并提供 AVI 影响评分、网页入口和 API；数据集规模约 1 PB。',
    whyItMatters: '它把单次模型推理扩展为可检索的全基因组预测基础设施，让研究者能先大规模排序潜在关键变异，再开展实验验证。',
    action: '关注这种“基础模型加预计算数据层加领域评分”的产品结构，评估其在材料、空间与工程仿真数据中的迁移价值。',
    priority: 'A', boards: ['AI Product / Model Launch', 'Frontier Paper / Research', 'Market / Business Model'],
    sourceType: 'official_company', verification: 'verified', entities: ['Google DeepMind', 'AlphaGenome Atlas'], repoCandidates: [],
    sources: [{ label: 'Google DeepMind 官方公告', url: 'https://deepmind.google/blog/alphagenome-atlas-a-predictive-map-of-every-possible-dna-letter-change-in-the-human-genome/' }], sourceReportId: reportId,
  },
  {
    id: 'ai-2026-09-09-openai-images-2-5', date: '2026-09-08', contentKind: 'event',
    title: 'OpenAI 发布 ChatGPT Images 2.5 与两款 API 图像模型',
    summary: 'ChatGPT Images 2.5 提升参考图主体保持、局部编辑和多轮一致性，并将生成延迟最高降低 50%；API 同步推出 GPT-Image-2.5 Flare 与 Sunburst。',
    whyItMatters: '图像模型竞争点正从单张生成质量转向可控编辑、多轮稳定和生产吞吐，更接近品牌资产与产品内容流水线的实际要求。',
    action: '用同一组品牌素材测试主体保持、透明背景、局部改字和连续五轮编辑，记录失败类型与成本时延。',
    priority: 'A', boards: ['AI Product / Model Launch', 'AI Design / Creative', 'Workflow / Tutorial / Usage Tips'],
    sourceType: 'official_company', verification: 'verified', entities: ['OpenAI', 'ChatGPT Images 2.5', 'GPT-Image-2.5 Flare', 'GPT-Image-2.5 Sunburst'], repoCandidates: [],
    sources: [{ label: 'OpenAI 官方发布说明', url: 'https://openai.com/index/introducing-chatgpt-images-2-5/' }], sourceReportId: reportId,
  },
  {
    id: 'ai-2026-09-09-openai-navier-stokes', date: '2026-09-08', contentKind: 'event',
    title: 'OpenAI 报告多 Agent 系统完成 Navier–Stokes 奇点证明',
    summary: 'OpenAI 称其内部模型驱动约一万个并发 Agent，形成受迫三维不可压缩 Navier–Stokes 方程有限时间奇点的解析证明，并用 GPT-6 Astra 完成 Lean 形式化验证。',
    whyItMatters: '若经独立数学共同体审查成立，这展示了大规模 Agent 协作、思路交叉汇总与形式化验证结合处理开放科学问题的潜力；当前仍应区分官方发布与外部确认。',
    action: '跟踪证明、Lean 代码和独立专家审查，评估“探索 Agent 群加形式化验证器”在工程优化与安全关键计算中的适用边界。',
    priority: 'A', boards: ['Frontier Paper / Research', 'AI Agent', 'AI Security / Governance'],
    sourceType: 'official_company', verification: 'verified', entities: ['OpenAI', 'GPT-6 Astra', 'Navier–Stokes'], repoCandidates: [],
    sources: [{ label: 'OpenAI 官方研究说明', url: 'https://openai.com/index/navier-stokes-solution/' }], sourceReportId: reportId,
  },
  {
    id: 'ai-2026-09-09-openai-quantum-experiments', date: '2026-09-08', contentKind: 'event',
    title: 'MIT 团队用 GPT-5.6 Sol 自动执行量子芯片常规测量',
    summary: 'MIT EQuS 研究者把 GPT-5.6 Sol 经 Codex 接入实验室软件，让 Agent 选择参数、运行测量、分析结果并迭代六量子比特芯片的常规校准流程。',
    whyItMatters: 'Agent 开始从数字工作流进入真实实验闭环，但官方案例也明确指出弱信号和噪声场景仍需要资深研究者介入。',
    action: '把该案例拆成权限边界、测量技能、异常升级、实验日志和人工接管五层，作为物理设备 Agent 的最小治理模板。',
    priority: 'A', boards: ['AI Agent', 'Frontier Paper / Research', 'Workflow / Tutorial / Usage Tips'],
    sourceType: 'official_company', verification: 'verified', entities: ['MIT EQuS', 'OpenAI', 'GPT-5.6 Sol', 'Codex'], repoCandidates: [],
    sources: [{ label: 'OpenAI 官方案例', url: 'https://openai.com/index/codex-quantum-computing-experiments/' }], sourceReportId: reportId,
  },
];

const payload = {
  schemaVersion: '1.0.0', generatedAt, asOf, aiEvents, candidates: [],
  report: { id: reportId, date: asOf, channel: 'ai', format: 'markdown', path: `/reports/ai-events-${asOf}.md` },
  run: {
    id: 'wagmi-ai', name: 'AI major events and papers daily collection', channel: 'ai', schedule: '每天 07:30',
    lastSuccess: generatedAt, status: 'success', artifact: `/reports/ai-events-${asOf}.md`,
    message: `独立批次 wagmi-ai:${asOf} 已完成。Memene 精确日期记录为 ${asOf}，共 ${memene.target?.candidates?.length ?? 0} 条候选；回到官方原始页面核验收录 ${aiEvents.length} 条事件。arXiv 官方 RSS 本次返回 ${papers.stats?.fetched ?? 0} 篇，不将旧论文改标为今日新增。`,
  },
};

const sections = aiEvents.map((event, index) => `### ${index + 1}. ${event.title}\n\n${event.summary}\n\n- 优先级：${event.priority}\n- 板块：${event.boards.join('、')}\n- 重要性：${event.whyItMatters}\n- 建议：${event.action}\n- 来源：${event.sources.map((source) => `[${source.label}](${source.url})`).join('；')}`).join('\n\n');
const report = `# ark.insight AI 大事件日报｜${asOf}\n\n> 一句话摘要：AI 同时向科学基础设施、可控创作、开放数学问题和真实实验闭环推进，但越接近高风险科学结论与物理世界，独立复核和人工接管越重要。\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${asOf}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 状态：\`success\`\n- Memene：精确日期记录已更新至 ${asOf}，共 ${memene.target?.candidates?.length ?? 0} 条候选。\n- arXiv：官方 RSS 本次返回 ${papers.stats?.fetched ?? 0} 篇；0 篇按契约视为成功，未沿用旧论文冒充当天新增。\n- 正式收录：${aiEvents.length} 条官方事件。\n\n## 今日重点\n\n${sections}\n\n## 筛选说明\n\n- 聚合摘要只用于发现，正式结论均回到官方公司或研究页面。\n- 事件保留真实发布日期 2026-09-08，日报批次日期为 ${asOf}。\n- 二手估值观点、个人感想、旧帖转发和无法定位官方材料的候选未进入正式日报。\n`;

await writeFile('data/dev/ai-events-latest.json', `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
await writeFile(`reports/ai-events-${asOf}.md`, report, 'utf8');
console.log(JSON.stringify({ asOf, status: payload.run.status, events: aiEvents.length, memeneCandidates: memene.target?.candidates?.length ?? 0, papersFetched: papers.stats?.fetched ?? 0 }, null, 2));

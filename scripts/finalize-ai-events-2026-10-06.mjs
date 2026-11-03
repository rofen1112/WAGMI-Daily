import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const asOf = '2026-10-06';
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));

const [previous, memene, papers, catalog] = await Promise.all([
  readJson('data/dev/ai-events-latest.json'),
  readJson('data/dev/memene-daily-latest.json'),
  readJson('data/dev/ai-papers-latest.json'),
  readJson('data/dev/papers-catalog.json'),
]);

if (previous.run?.id !== 'wagmi-ai' || previous.run?.schedule !== '每天 07:30') {
  throw new Error(`AI contract mismatch: ${previous.run?.id} / ${previous.run?.schedule}`);
}
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene exact-date gate is not current/success: ${memene.asOf} / ${memene.run?.status} / ${memene.window?.status}`);
}
if (memene.target?.date !== asOf || !(memene.target?.candidates?.length > 0)) {
  throw new Error('Memene exact-date detail is missing or empty.');
}
if (papers.asOf !== asOf || papers.run?.status !== 'success') {
  throw new Error(`Paper discovery is not successful for ${asOf}.`);
}
if (catalog.asOf !== asOf || !(catalog.papers?.length > 0)) {
  throw new Error(`Paper catalog is stale or empty: ${catalog.asOf}`);
}

const now = new Date().toISOString();
const report = {
  id: `ai-${asOf}`,
  title: `ark.insight AI 大事件与前沿论文日报｜${asOf}`,
  date: asOf,
  channel: 'ai',
  format: 'markdown',
  path: `/reports/ai-events-${asOf}.md`,
};

const aiEvents = [
  {
    id: 'ai-2026-10-06-openai-chatgpt-visual-ads',
    date: '2026-10-05',
    contentKind: 'industry_event',
    title: 'OpenAI 为 ChatGPT 推出视觉广告格式与更完整的效果测量',
    summary: 'OpenAI 宣布在 ChatGPT 图像生成场景中测试带清晰标识的视觉广告，并扩展转化数据、跨渠道归因、增量实验与品牌适宜性评估合作伙伴。',
    whyItMatters: '这表明对话式 AI 的商业化开始从简单展示转向可归因、可做增量实验且需独立品牌安全评估的完整广告基础设施。',
    action: '关注美国首批测试中广告标识、回答独立性、对话隐私和增量转化的实际表现，并避免把平台报告的早期案例当作普遍效果。',
    priority: 'A',
    boards: ['AI Product / Model Launch', 'AI Industry / Business'],
    sourceType: 'official_announcement',
    verification: 'verified',
    entities: ['OpenAI', 'ChatGPT Ads', '广告效果测量'],
    repoCandidates: [],
    sources: [{
      label: 'OpenAI 官方公告',
      url: 'https://openai.com/index/new-chatgpt-ads-format-and-measurement/',
    }],
    sourceReportId: report.id,
  },
  {
    id: 'ai-2026-10-06-openai-textgrain-provenance',
    date: '2026-10-05',
    contentKind: 'industry_event',
    title: 'OpenAI 公布 textGrain 文本水印及欧盟内容溯源路线',
    summary: 'OpenAI 发布 textGrain 统计文本水印：API 客户可针对部分模型自愿开启，欧盟的合资格 ChatGPT 和 Codex 文本输出将在未来数周分阶段加入水印，检测器初期限定给获批研究与专业机构。',
    whyItMatters: '文本溯源正从政策原则进入产品部署，但短文、编辑、翻译和领域限制会显著降低检测可靠性，不能把水印结果当作作者身份、所有权或内容真实性的证明。',
    action: '在欧盟或受监管业务中评估 API 可选水印与现有 C2PA、图像/音频验证流程的组合，并将假阳性、假阴性和编辑耐受性纳入上线验收。',
    priority: 'A',
    boards: ['AI Governance / Safety', 'AI Product / Model Launch'],
    sourceType: 'official_announcement',
    verification: 'verified',
    entities: ['OpenAI', 'textGrain', 'EU AI Act'],
    repoCandidates: [],
    sources: [{
      label: 'OpenAI 官方文本溯源说明',
      url: 'https://openai.com/index/eu-text-provenance/',
    }],
    sourceReportId: report.id,
  },
];

const next = {
  ...previous,
  generatedAt: now,
  asOf,
  report,
  aiEvents,
  candidates: [],
  run: {
    ...previous.run,
    lastSuccess: now,
    status: 'success',
    artifact: report.path,
    message: `独立批次 wagmi-ai:${asOf} 已完成：Memene 精确日期记录 ${memene.target.id} 为 current，共 ${memene.target.candidates.length} 条候选；正式收录 2 条已回到 OpenAI 官方原始公告核验的行业事件。arXiv 当日抓取 ${papers.stats?.fetched ?? 0} 篇，目录新增 ${catalog.stats?.addedToday ?? 0} 篇；未把旧论文或缺少原始证据的候选改标为今日。`,
  },
};

const itemMarkdown = (item) => {
  const links = item.sources.map((source) => `[${source.label}](${source.url})`).join('、');
  return `### ${item.title}\n\n- 真实日期：${item.date}\n- 优先级：${item.priority}\n- 摘要：${item.summary}\n- 为什么重要：${item.whyItMatters}\n- 建议动作：${item.action}\n- 原始来源：${links}`;
};

const markdown = `# ark.insight AI 大事件与前沿论文日报｜${asOf}\n\n> 一句话摘要：对话式 AI 正同时建立可归因的广告商业化基础设施和面向监管的文本溯源能力，但两者都需要对隐私、独立性与识别误差设置清晰边界。\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${asOf}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 执行状态：\`success\`\n- Memene：精确日期记录 \`${memene.target.id}\` 为 current，共 ${memene.target.candidates.length} 条候选；近期窗口缺少 ${memene.window.missingDates.join('、') || '无'}，但不影响今日精确日期记录。\n- 论文：arXiv 当日发现批次为 \`${papers.run.status}\`，抓取 ${papers.stats?.fetched ?? 0} 篇，累计目录 ${catalog.stats?.totalPapers ?? 0} 篇，今日新增 ${catalog.stats?.addedToday ?? 0} 篇。\n- 正式收录：${aiEvents.length} 条行业事件；本批次不把未完成中文摘要级解读的新论文直接写入日报。\n\n## 今日重大事件\n\n${aiEvents.map(itemMarkdown).join('\n\n')}\n\n## 筛选说明\n\n- Memene 仅用于候选发现；正式结论已回到 OpenAI 官方公告。\n- 日报归属于 ${asOf} 批次，事件保留 2026-10-05 的真实发布日期。\n- 媒体、聚合摘要或无稳定原始链接的其他候选未进入正式结果。\n`;

for (const [path, content] of [
  ['data/dev/ai-events-latest.json', `${JSON.stringify(next, null, 2)}\n`],
  [`reports/ai-events-${asOf}.md`, markdown],
  [`public/reports/ai-events-${asOf}.md`, markdown],
]) {
  const absolute = resolve(root, path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, content, 'utf8');
}

console.log(JSON.stringify({
  asOf,
  status: next.run.status,
  memeneCandidates: memene.target.candidates.length,
  missingDates: memene.window.missingDates,
  industryEvents: aiEvents.length,
  fetchedPapers: papers.stats?.fetched ?? 0,
  catalogTotal: catalog.stats?.totalPapers ?? 0,
  report: report.path,
}, null, 2));

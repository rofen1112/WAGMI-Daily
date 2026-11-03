import { readFile, writeFile } from 'node:fs/promises';

const asOf = '2026-09-10';
const aiPath = 'data/dev/ai-events-latest.json';
const reportPath = `reports/ai-events-${asOf}.md`;
const generatedAt = new Date().toISOString();

const [ai, memene, papers] = await Promise.all([
  readFile(aiPath, 'utf8').then(JSON.parse),
  readFile('data/dev/memene-daily-latest.json', 'utf8').then(JSON.parse),
  readFile('data/dev/ai-papers-latest.json', 'utf8').then(JSON.parse),
]);

if (ai.asOf !== asOf || !Array.isArray(ai.aiEvents) || ai.aiEvents.length === 0) {
  throw new Error(`AI snapshot is not ready for ${asOf}`);
}
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene snapshot is not current: ${memene.asOf} / ${memene.run?.status} / ${memene.window?.status}`);
}
if (papers.asOf !== asOf || papers.run?.status !== 'success') {
  throw new Error(`Paper snapshot is not current: ${papers.asOf} / ${papers.run?.status}`);
}

const sourceLabel = (source) => source.label || source.name || source.type || '原始来源';
const sections = ai.aiEvents.map((event, index) => {
  const sources = (event.sources || [])
    .map((source) => `[${sourceLabel(source)}](${source.url})`)
    .join('；');
  return `### ${index + 1}. ${event.title}\n\n${event.summary}\n\n- 真实事件日期：${event.date}\n- 优先级：${event.priority}\n- 板块：${(event.boards || []).join('、')}\n- 重要性：${event.whyItMatters}\n- 建议：${event.action}\n- 来源：${sources}`;
});

const industryCount = ai.aiEvents.filter((event) => event.contentKind !== 'paper').length;
const paperCount = ai.aiEvents.filter((event) => event.contentKind === 'paper').length;
const memeneCount = memene.target?.candidates?.length ?? 0;
const report = `# ark.insight AI 大事件日报｜${asOf}\n\n> 一句话摘要：Agent 工程化、代码质量自动修复与安全治理同步升温，开源模型和论文继续把 AI 延伸到环境监测、机器人和具身智能。\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${asOf}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 状态：\`success\`\n- Memene：精确日期结构化记录已更新至 ${asOf}，共 ${memeneCount} 条候选。\n- arXiv：当天论文批次为 \`success\`，累计目录 ${papers.stats?.catalogSize ?? papers.stats?.total ?? 0} 条。\n- 正式收录：${industryCount} 条行业事件、${paperCount} 篇完成中文解读的论文。\n\n## 今日重点\n\n${sections.join('\n\n')}\n\n## 筛选说明\n\n- 聚合页只用于发现；行业事件均回到公司公告、产品更新、官方博客或正式代码仓库核验。\n- 论文均保留 arXiv 或作者项目页作为原始证据。\n- 每条记录保留真实发布日期，不把 9 月 9 日发布内容改标为 9 月 10 日。\n`;

ai.generatedAt = generatedAt;
ai.report = {
  id: `ai-${asOf}`,
  date: asOf,
  channel: 'ai',
  format: 'markdown',
  path: `/reports/ai-events-${asOf}.md`,
};
ai.run = {
  ...ai.run,
  lastSuccess: generatedAt,
  status: 'success',
  artifact: `/reports/ai-events-${asOf}.md`,
  message: `独立批次 wagmi-ai:${asOf} 已完成。Memene 精确日期结构化记录为 ${asOf}，共 ${memeneCount} 条候选；复核官方或原始来源后收录 ${industryCount} 条行业事件与 ${paperCount} 篇论文。`,
};

await Promise.all([
  writeFile(aiPath, `${JSON.stringify(ai, null, 2)}\n`, 'utf8'),
  writeFile(reportPath, report, 'utf8'),
]);

console.log(JSON.stringify({ asOf, status: ai.run.status, memeneCount, industryCount, paperCount, reportPath }, null, 2));

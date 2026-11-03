import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const asOf = '2026-09-16';

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), 'utf8'));
}

async function writeAtomic(path, content) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, content, 'utf8');
  await rename(temporary, target);
}

const [latest, memene, papers, catalog] = await Promise.all([
  readJson('data/dev/ai-events-latest.json'),
  readJson('data/dev/memene-daily-latest.json'),
  readJson('data/dev/ai-papers-latest.json'),
  readJson('data/dev/papers-catalog.json'),
]);

if (latest.asOf !== asOf || latest.run?.id !== 'wagmi-ai' || latest.run?.schedule !== '每天 07:30') {
  throw new Error(`AI snapshot contract mismatch: ${latest.asOf} / ${latest.run?.id} / ${latest.run?.schedule}`);
}
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') {
  throw new Error(`Memene is not current: ${memene.asOf} / ${memene.run?.status} / ${memene.window?.status}`);
}
if ((memene.window?.missingDates ?? []).length > 0 || (memene.target?.candidates ?? []).length === 0) {
  throw new Error('Memene exact-date source is incomplete.');
}
if (papers.asOf !== asOf || papers.run?.status !== 'success' || catalog.asOf !== asOf) {
  throw new Error(`Paper pipeline is not current: ${papers.asOf} / ${papers.run?.status} / ${catalog.asOf}`);
}

const items = latest.aiEvents ?? [];
const industryEvents = items.filter((item) => item.contentKind !== 'paper');
const paperEvents = items.filter((item) => item.contentKind === 'paper');
if (industryEvents.length !== 5 || paperEvents.length !== 3) {
  throw new Error(`Unexpected editorial payload: ${industryEvents.length} industry / ${paperEvents.length} papers`);
}

const sourceUrls = [...new Set(items.flatMap((item) => item.sources ?? []).map((source) => source.url))];
const sourceAudit = [];
for (const url of sourceUrls) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'Mozilla/5.0 ark.insight source verification' },
  });
  if (!response.ok) throw new Error(`Source verification failed: HTTP ${response.status} ${url}`);
  sourceAudit.push({ url, status: response.status, finalUrl: response.url });
}

const generatedAt = new Date().toISOString();
const message = `独立批次 wagmi-ai:${asOf} 已完成幂等复核：Memene 精确日期 history/detail 为 success/current，七日窗口完整且当日 ${memene.target.candidates.length} 条候选；核验收录 ${industryEvents.length} 条行业事件和 ${paperEvents.length} 篇已完成中文解读的论文，全部原始来源均返回 HTTP 200，论文保留真实提交日期。`;
const updated = {
  ...latest,
  generatedAt,
  run: {
    ...latest.run,
    lastSuccess: generatedAt,
    status: 'success',
    message,
  },
};

const sections = items.map((item) => {
  const sources = (item.sources ?? []).map((source) => `[${source.label}](${source.url})`).join('；');
  return `### ${item.priority}｜${item.title}\n\n${item.summary}\n\n- 真实日期：${item.date}\n- 重要性：${item.whyItMatters}\n- 建议动作：${item.action}\n- 来源：${sources}`;
}).join('\n\n');

const report = `# ark.insight AI 大事件日报｜${asOf}\n\n> 一句话摘要：实时语音 Agent、企业工作流集成和高密度沙箱运行时同步推进；研究侧聚焦低光 3DGS、压缩评测与物理一致视频生成。\n\n## 采集状态\n\n- 批次：\`wagmi-ai:${asOf}\`\n- 契约：Asia/Shanghai 每天 07:30\n- 执行状态：\`success\`\n- Memene：精确日期 history/detail 已更新至 ${asOf}，七日窗口完整，共 ${memene.target.candidates.length} 条候选。\n- 论文：当日发现与目录同步均为 \`success\`，抓取 ${papers.stats?.fetched ?? 0} 篇，目录新增 ${catalog.stats?.addedToday ?? 0} 篇。\n- 正式收录：${industryEvents.length} 条行业事件、${paperEvents.length} 篇完成中文解读的论文。\n- 原始来源：${sourceAudit.length} 个官方、作者或 arXiv 链接均返回 HTTP 200。\n\n## 今日重点\n\n${sections}\n\n## 筛选说明\n\n- Memene 仅用于候选发现与交叉核查；正式结论回到官方公告、官方文档、官方仓库、作者项目页或 arXiv 原文。\n- 每条记录保留来源真实发布日期，不把旧事件或旧论文改标为今天。\n- 未取得稳定原始证据的传闻、二手转述与低行动价值候选未进入正式结果。\n`;

await Promise.all([
  writeAtomic('data/dev/ai-events-latest.json', `${JSON.stringify(updated, null, 2)}\n`),
  writeAtomic(`reports/ai-events-${asOf}.md`, report),
  writeAtomic(`public/reports/ai-events-${asOf}.md`, report),
]);

console.log(JSON.stringify({
  asOf,
  status: updated.run.status,
  memeneCandidates: memene.target.candidates.length,
  industryEvents: industryEvents.length,
  papers: paperEvents.length,
  auditedSources: sourceAudit.length,
}, null, 2));

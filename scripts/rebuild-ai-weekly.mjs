import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeAiEvents } from './merge-dev-data.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const canonicalBoards = [
  'Financing / Investment',
  'AI Product / Model Launch',
  'AI Agent',
  'AI Security / Governance',
  'AI Coding',
  'AI-CAD / AEC',
  'Interior Design AI',
  'AI 3D / World Models',
  'Workflow / Tutorial / Usage Tips',
  'YouTube / Creator Watch',
  'Market / Business Model',
];
const boardAliases = new Map([
  ['AI Safety / Governance', 'AI Security / Governance'],
  ['AI Governance / Safety', 'AI Security / Governance'],
  ['AI Industry / Business', 'Market / Business Model'],
  ['Market / Business Models', 'Market / Business Model'],
  ['Business Model / Commercialization', 'Market / Business Model'],
]);

async function readJson(path, fallback = {}) {
  try {
    return JSON.parse(await readFile(resolve(root, path), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeText(path, value) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, value, 'utf8');
}

function shanghaiDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

function addDays(date, amount) {
  const value = new Date(`${date}T12:00:00+08:00`);
  value.setUTCDate(value.getUTCDate() + amount);
  return shanghaiDate(value);
}

function weekdayLabel(date) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', weekday: 'long' })
    .format(new Date(`${date}T12:00:00+08:00`));
}

function mergeRows(...groups) {
  const rows = new Map();
  for (const row of groups.flat()) if (row?.id) rows.set(row.id, row);
  return [...rows.values()];
}

function normalizeBoard(board) {
  return boardAliases.get(board) ?? board;
}

async function pathExists(path) {
  try {
    await access(resolve(root, path));
    return true;
  } catch {
    return false;
  }
}

function buildTrends(events) {
  const has = (pattern) => events.filter((event) => pattern.test([
    event.title,
    event.summary,
    ...(event.boards ?? []),
  ].join(' '))).length;
  const agentCount = has(/Agent|智能体/i);
  const governanceCount = has(/Security|Governance|权限|审批|安全|治理|误对齐/i);
  const spatialCount = has(/3D|World|空间|高斯|视频|具身|机器人/i);
  const verticalCount = has(/Law|法律|金融|CRM|小企业|前台|生物|行业/i);
  return [
    {
      title: 'Agent 与业务执行的已核验信号',
      summary: `本周 ${agentCount} 条归档记录涉及 Agent。具体进展与限制见逐条原始来源，不以关键词计数推断统一的市场变化。`,
      action: '用真实任务验收权限、人工审批、失败恢复、结果质量与单位成功任务成本。',
    },
    {
      title: '安全治理开始覆盖运行中事件，而不只覆盖发布前评测',
      summary: `本周 ${governanceCount} 条归档记录涉及权限、安全或治理。该计数基于标题、摘要和标签，不代表事故数量或市场总体规模。`,
      action: '建立 Agent 事故分级、证据保全、第三方通知、外部写入审批和可撤销机制。',
    },
    {
      title: '多模态与空间智能逐步连接实时交互和物理任务',
      summary: `本周 ${spatialCount} 条归档记录涉及视频、3D、空间或具身方向，${verticalCount} 条命中垂直行业关键词。各条目按真实发布日期归档，历史更新和新发表分开理解。`,
      action: '按真实环境复测延迟、空间推理、物理一致性、引用准确性与数据许可。',
    },
  ];
}

function projectCandidatesFrom(events) {
  const rows = new Map();
  for (const event of events) {
    for (const repo of event.repoCandidates ?? []) {
      const githubSource = (event.sources ?? []).find((source) => source.url?.toLowerCase().includes(`github.com/${repo.toLowerCase()}`));
      rows.set(repo.toLowerCase(), githubSource
        ? `${repo} | verified | ${githubSource.url}`
        : `${repo} | pending | repo URL 待核验`);
    }
  }
  return [...rows.values()];
}

function eventMarkdown(event, index) {
  const sources = (event.sources ?? []).map((source) => `[${source.label}](${source.url})`).join(' · ') || '无可公开链接';
  const repos = event.repoCandidates?.length ? event.repoCandidates.map((repo) => `\`${repo}\``).join('、') : '无新增公开仓库';
  return [
    `#### ${index + 1}. ${event.title}`,
    '',
    `- **简要说明**：${event.summary}`,
    `- **优先级**：${event.priority}`,
    `- **板块**：${(event.boards ?? []).map(normalizeBoard).join('；')}`,
    `- **重点对象**：${(event.entities ?? []).join('；') || '未标注'}`,
    `- **为什么重要**：${event.whyItMatters}`,
    `- **下一步**：${event.action}`,
    `- **来源链接**：${sources}`,
    `- **GitHub / 工程候选**：${repos}`,
    '',
  ].join('\n');
}

const today = shanghaiDate();
const todayValue = new Date(`${today}T12:00:00+08:00`);
const weekday = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', weekday: 'short' })
  .format(todayValue) === 'Mon' ? 1 : 0);
const end = process.argv.find((arg) => arg.startsWith('--end='))?.slice(6)
  ?? (weekday === 1 ? addDays(today, -1) : addDays(today, -((todayValue.getUTCDay() || 7))));
const start = addDays(end, -6);
const reportDate = addDays(end, 1);
const generatedAt = new Date().toISOString();

const [main, override, publishPreview, aiLatest, previousWeekly] = await Promise.all([
  readJson('data/main/index.json'),
  readJson('data/dev/index.json', {}),
  readJson('data/dev/publish-preview.json', {}),
  readJson('data/dev/ai-events-latest.json', {}),
  readJson('data/dev/ai-weekly-latest.json', {}),
]);
const events = mergeAiEvents(main.aiEvents ?? [], publishPreview.aiEvents ?? [], override.aiEvents ?? [], aiLatest.aiEvents ?? [])
  .filter((event) => event.date >= start && event.date <= end)
  .sort((left, right) => left.date.localeCompare(right.date) || left.priority.localeCompare(right.priority));

const boardCounts = canonicalBoards.map((name) => ({
  name,
  count: events.reduce((count, event) => count + (event.boards ?? []).map(normalizeBoard).filter((board) => board === name).length, 0),
}));
const entityCounts = new Map();
for (const event of events) for (const entity of event.entities ?? []) entityCounts.set(entity, (entityCounts.get(entity) ?? 0) + 1);
const entities = [...entityCounts.entries()]
  .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
  .slice(0, 30)
  .map(([name, count]) => ({ name, count, type: 'company_or_object' }));
const reportPath = `/reports/ai-events-weekly-${reportDate}.md`;
const trends = buildTrends(events);
const projectCandidates = projectCandidatesFrom(events);
const expectedDailyDates = Array.from({ length: 7 }, (_, index) => addDays(start, index));
const dailyCoverage = await Promise.all(expectedDailyDates.map(async (date) => ({
  date,
  available: await pathExists(`reports/ai-events-${date}.md`),
})));
const availableDailyDates = dailyCoverage.filter((row) => row.available).map((row) => row.date);
const missingDailyDates = dailyCoverage.filter((row) => !row.available).map((row) => row.date);
const freshnessReady = aiLatest.asOf === today && aiLatest.run?.status === 'success';
const upstreamReady = freshnessReady && missingDailyDates.length === 0;
const upstreamWarning = !freshnessReady
  ? `上游未就绪：ai-events-latest.json 的 asOf 为 ${aiLatest.asOf ?? '缺失'}，不是当天 ${today}。`
  : '';
const coverageWarning = missingDailyDates.length
  ? `日报缺失：${missingDailyDates.join('、')}；相关后续事件仅使用其他日报中的原始来源核验记录。`
  : '';

const lines = [
  `# ark.insight AI 每周大事件｜${start}—${end}`,
  '',
  `> 一句话周摘要：本周归档 ${events.length} 条已入库核验记录，按真实事件日期组织；历史补录与来源限制保留在日报中。`,
  '',
  `> **运行状态：${upstreamReady ? '完整' : '警告／上游未就绪'}。** ${[upstreamWarning, coverageWarning].filter(Boolean).join(' ') || '上游日期与七日日报覆盖均通过检查。'}`,
  '',
  '## 本周观察（最多 3 条）',
  '',
  ...trends.flatMap((trend, index) => [
    `### ${index + 1}. ${trend.title}`,
    '',
    trend.summary,
    '',
    `**建议动作**：${trend.action}`,
    '',
  ]),
  '## 每日大事件',
  '',
];
for (let date = start; date <= end; date = addDays(date, 1)) {
  const dailyEvents = events.filter((event) => event.date === date);
  lines.push(`### ${weekdayLabel(date)}｜${date}`, '');
  if (!dailyEvents.length) {
    lines.push('- 累计库暂无归属于本日的已核验记录；来源覆盖有局限，不能据此断言市场没有活动。', '');
  } else {
    dailyEvents.forEach((event, index) => lines.push(eventMarkdown(event, index)));
  }
}
lines.push(
  '## 辅助索引',
  '',
  '### 板块计数（多标签）',
  '',
  '| 板块 | 数量 |',
  '|---|---:|',
  ...boardCounts.map((row) => `| ${row.name} | ${row.count} |`),
  '',
  '### 重复重点对象',
  '',
  ...entities.map((entity) => `- ${entity.name}：${entity.count} 条`),
  '',
  '### GitHub / 工程候选',
  '',
  ...projectCandidates.map((candidate) => `- ${candidate}`),
  '',
  '### 覆盖说明',
  '',
  `- 上游新鲜度：\`data/dev/ai-events-latest.json\` 的 \`asOf\` 为 \`${aiLatest.asOf ?? '缺失'}\`；本次执行日为 \`${today}\`，因此${freshnessReady ? '通过' : '未通过'}当天门禁。`,
  `- 日报覆盖：已有 ${availableDailyDates.join('、') || '无'}；缺失 ${missingDailyDates.join('、') || '无'}。`,
  `- 运行结论：${upstreamReady ? '完整成功。' : '部分归档，不宣称完整成功。'}`,
  '- 聚合页面只用于发现；正式事件仍保留官方、作者原始或可信媒体链接。',
  '- 统计仅覆盖累计库已有证据；缺失来源与历史时间点不可追溯字段不被伪装为零活动。',
  '',
);

const weekly = {
  ...previousWeekly,
  id: `ai-weekly-${reportDate}`,
  generatedAt,
  range: { start, end },
  totalEvents: events.length,
  boardCounts,
  trends,
  entities,
  projectCandidates,
  sourceReportPath: reportPath,
  run: {
    id: 'wagmi-ai-2',
    name: 'ark.insight AI 每周大事件',
    channel: 'ai',
    schedule: '每周一 07:50',
    lastSuccess: upstreamReady ? generatedAt : (previousWeekly.run?.lastSuccess ?? null),
    status: upstreamReady ? 'success' : 'warning',
    artifact: reportPath,
    message: upstreamReady
      ? `已按实际日期汇总 ${start} 至 ${end} 的 ${events.length} 条核验事件。`
      : `部分归档：已汇总 ${start} 至 ${end} 的 ${events.length} 条核验事件；${upstreamWarning} ${coverageWarning}`.trim(),
  },
  report: {
    id: `ai-weekly-${reportDate}`,
    title: `ark.insight AI 每周大事件｜${start}—${end}`,
    date: reportDate,
    channel: 'ai',
    format: 'markdown',
    path: reportPath,
  },
  upstream: {
    asOf: aiLatest.asOf ?? null,
    ready: upstreamReady,
    dailyReportCoverage: {
      available: availableDailyDates,
      missing: missingDailyDates,
      note: [upstreamWarning, coverageWarning, upstreamReady ? '七日日报覆盖完整。' : '本次为部分归档，不宣称完整成功。'].filter(Boolean).join(' '),
    },
  },
};

await Promise.all([
  writeText('data/dev/ai-weekly-latest.json', `${JSON.stringify(weekly, null, 2)}\n`),
  writeText(`reports/ai-events-weekly-${reportDate}.md`, `${lines.join('\n')}\n`),
  writeText(`public/reports/ai-events-weekly-${reportDate}.md`, `${lines.join('\n')}\n`),
  writeText(`data/dev/source-archives/ai-weekly-${reportDate}.json`, `${JSON.stringify(weekly, null, 2)}\n`),
]);
override.weeklySummaries = mergeRows(override.weeklySummaries ?? [], [weekly]);
override.reports = mergeRows(override.reports ?? [], [weekly.report]);
await writeText('data/dev/index.json', JSON.stringify(override, null, 2) + '\n');

console.log(`Rebuilt weekly AI report ${start}..${end}: ${events.length} events.`);

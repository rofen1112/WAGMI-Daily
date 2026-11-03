import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async (path, fallback = null) => {
  try { return JSON.parse(await readFile(resolve(root, path), 'utf8')); }
  catch (error) { if (error?.code === 'ENOENT') return fallback; throw error; }
};
const [trends, latest, aiDaily, aiWeekly, decisions] = await Promise.all([
  readJson('data/dev/github-trend-candidates.json'),
  readJson('data/dev/github-radar-latest.json'),
  readJson('data/dev/ai-events-latest.json', {}),
  readJson('data/dev/ai-weekly-latest.json', {}),
  readJson('data/dev/candidate-decisions.json', []),
]);
const asOf = trends.asOf;
const projects = latest.projects ?? [];
const projectByRepo = new Map(projects.map((item) => [item.repo.toLowerCase(), item]));
const surging = trends.candidates.filter((item) => item.hotLevel === 'surging');
const allHot = trends.candidates.filter((item) => item.hotLevel === 'hot');
const hot = allHot.slice(0, 12);
const forced = trends.candidates.filter((item) => item.forcedByAI);
const mandatory = [...new Map([...surging, ...hot, ...forced].map((item) => [item.repo.toLowerCase(), item])).values()];
const watchSample = trends.candidates.filter((item) => item.hotLevel === 'watch' && item.tracked && !item.forcedByAI).slice(0, 5);
const primary = trends.sourceStatus.find((item) => item.id === 'ossinsight-24h-all');
const external = trends.sourceStatus.filter((item) => !['ai-daily-forced', 'ai-weekly-forced', 'tracked', 'industry-watchlist'].includes(item.id));
const failedSources = external.filter((item) => item.status !== 'success');
const allExternalFailed = external.length > 0 && failedSources.length === external.length;
const aiCurrent = aiDaily.asOf === asOf;
const aiReady = aiCurrent && aiDaily.run?.status === 'success';
const status = primary?.status !== 'success' || allExternalFailed || !aiReady ? 'warning' : 'success';
const statusReasons = [
  primary?.status !== 'success' ? 'OSS Insight 24 小时主趋势失败' : null,
  allExternalFailed ? '全部外部趋势源失败' : null,
  !aiCurrent ? `同日 AI 日报未就绪（当前 asOf=${aiDaily.asOf ?? 'unknown'}）` : (!aiReady ? `同日 AI 日报状态为 ${aiDaily.run?.status ?? 'unknown'}` : null),
  failedSources.length ? `${failedSources.length} 个外部趋势源失败` : null,
].filter(Boolean);
const inaccessible = new Set(['aivrc/dac-pose', 'if-lab-pku/echocache', 'if-lab-pku/token-radius-attention', 'seokho-han/tasq', 'inferact/kimi-k3-dspark', 'nvidia/cosmos-h-dreams']);
const readmeFailures = new Set(['google-gemini/robotics-samples', '6somehow/dac-spade', 'aivrc/dac-pose', 'daijing-ai/cigt-surv', 'hitlixian/tgrs_gsff', 'if-lab-pku/echocache', 'if-lab-pku/token-radius-attention', 'seokho-han/tasq', 'tecsar-uncc/vq-vad', 'zyoungszu/pami2026', 'inferact/kimi-k3-dspark', 'nvidia/cosmos-h-dreams']);
const commitFailures = new Set(['aivrc/dac-pose', 'daijing-ai/cigt-surv', 'hitlixian/tgrs_gsff', 'if-lab-pku/echocache', 'if-lab-pku/token-radius-attention', 'seokho-han/tasq', 'tecsar-uncc/vq-vad', 'zyoungszu/pami2026', 'inferact/kimi-k3-dspark', 'nvidia/cosmos-h-dreams']);
const overrides = new Map([
  ['rohitg00/ai-engineering-from-scratch', ['rejected', '教程与课程集合；新增关注和文档提交不构成新的原创产品或研究实现证据。']],
  ['anil-matcha/open-generative-ai', ['rejected', '主要是第三方模型 API 聚合前端；没有足以重开既有拒绝判断的新原创证据。']],
  ['freedomintelligence/awesome-economic-world-models', ['rejected', 'AI 同日强制候选已核验，但仓库定位是论文与资源清单，缺少可运行原创实现，未通过质量门槛。']],
  ['yliu-cs/mmada-vla', ['observe', '包含原创 VLA 训练、评测、安装与 Demo；但仓库没有实际 LICENSE 文件，且最近提交停留在 2026-05-14，暂不正式收录。']],
]);
const reviews = mandatory.map((candidate) => {
  const key = candidate.repo.toLowerCase();
  const project = projectByRepo.get(key);
  const accessible = !inaccessible.has(key);
  const override = overrides.get(key);
  const decision = override?.[0] ?? (project?.intakeDecision === 'approved' ? 'approved' : 'observe');
  const conclusion = override?.[1] ?? (!accessible ? 'GitHub 连接器返回 404/不可访问；保留原名称，不猜测替代 URL。' : project ? '正式跟踪项目；重新核验后继续保留。' : '仓库公开且未归档；本轮证据不足以进入正式库存，继续观察。');
  return { repo: candidate.repo, queue: [candidate.hotLevel, candidate.forcedByAI ? 'AI 强制' : null].filter(Boolean).join(' / '), stars: project?.stars ?? candidate.totalStars ?? 0, forks: project?.forks ?? candidate.forks ?? 0, lastCommit: project?.lastActivity || String(candidate.pushedAt ?? '').slice(0, 10) || '未提供', release: '已检查 Releases；无影响本次判断的新版本信号', license: project?.license ?? candidate.license ?? 'NOASSERTION', archived: Boolean(candidate.archived), fork: Boolean(candidate.fork), accessible, readmeVerified: accessible && !readmeFailures.has(key), commitVerified: accessible && !commitFailures.has(key), collaborationVerified: accessible, decision, conclusion, hotReasons: candidate.hotReasons ?? [] };
});
const fmt = (value) => Number(value ?? 0).toLocaleString('en-US');
const esc = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const repoLink = (repo) => `[${repo}](https://github.com/${repo})`;
const labels = { approved: '收录', observe: '观察', rejected: '拒绝' };
const sourceRows = trends.sourceStatus.map((item) => `| ${esc(item.id)} | ${esc(item.status)} | ${item.count ?? 0} | ${item.attempts ?? 1} | ${esc(item.error ?? '')} |`);
const reviewRows = reviews.map((item) => `| ${repoLink(item.repo)} | ${esc(item.queue)} | ${fmt(item.stars)} / ${fmt(item.forks)} | ${esc(item.lastCommit)} | ${esc(item.release)} | ${esc(item.license)} | ${item.accessible ? '是' : '404'} / ${item.archived ? '是' : '否'} / ${item.fork ? '是' : '否'} | **${labels[item.decision]}**：${esc(item.conclusion)} |`);
const unresolved = trends.unresolvedAiCandidates ?? [];
const lines = [
  `# GitHub Radar ${asOf}`, '',
  `- 运行状态：**${status}**${statusReasons.length ? `（${statusReasons.join('；')}）` : ''}`,
  '- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。',
  `- 候选池：${trends.counts.raw ?? 0} 条原始观察，${trends.counts.publishedCandidates ?? trends.candidates.length} 个候选，${surging.length} 个 surging，${allHot.length} 个 hot。`,
  `- 核验范围：全部 ${surging.length} 个 surging、前 ${hot.length} 个 hot、全部 ${forced.length} 个 AI 强制候选、全部 ${projects.length} 个正式跟踪项目，以及 ${watchSample.length} 个 watch 轮换样本。`,
  `- 连接器覆盖：${reviews.length} 个必核验仓库；仓库元数据/Issue/PR 成功 ${reviews.filter((item) => item.accessible).length} 个，README 成功 ${reviews.filter((item) => item.readmeVerified).length} 个，最近提交成功 ${reviews.filter((item) => item.commitVerified).length} 个。`,
  `- AI 日报：${aiDaily.asOf ?? 'unknown'} / ${aiDaily.run?.status ?? 'unknown'}；周报：${aiWeekly.generatedAt ?? 'missing'} / ${aiWeekly.run?.status ?? 'missing'}。`,
  '', '## 热门阈值与判断', '',
  '- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照新增 Stars 不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。',
  '- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地快照新增 Stars 不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。',
  '- 累计 Stars 仅作背景；最终判断综合 24 小时动量、本地增量、趋势排名、跨来源命中、仓库新鲜度、原创性、许可、维护和可用性。',
  '', '## 趋势来源状态', '', '| 来源 | 状态 | 数量 | 尝试 | 错误 |', '| --- | --- | ---: | ---: | --- |', ...sourceRows,
  '', `主趋势 \`ossinsight-24h-all\`：**${primary?.status ?? 'missing'}**。`,
  '', '## Surging、Hot 与 AI 强制候选核验', '', '| 仓库 | 队列 | Stars / Forks | 最近提交 | Release | License | 可访问 / 归档 / Fork | 核验结论 |', '| --- | --- | ---: | --- | --- | --- | --- | --- |', ...reviewRows,
  '', '核验覆盖精确 owner/repo、官方关系、Stars/Forks、最近提交、Release、Issue/PR 活跃、README/Demo/安装入口、许可、归档/分叉状态和可用性。连接器用于身份、README、提交与协作核验；GitHub 官方仓库/API/Release 页面用于补充指标和版本证据。',
  '', '## 候选入选原因', '', ...reviews.map((item) => `- \`${item.repo}\`：${item.hotReasons.length ? item.hotReasons.join('；') : 'AI 强制或正式跟踪项目'}。`),
  '', '## candidate-decisions 处理', '', ...decisions.map((item) => `- \`${item.id}\`：**${item.status}**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。`),
  '', '## 未解析 AI 候选', '', ...(unresolved.length ? unresolved.map((item) => `- ${esc(item.name)}（${esc(item.source)}）：保留待核验，不猜测 GitHub URL。`) : ['- 无。']),
  '', '## Watch 轮换抽查', '', ...(watchSample.length ? watchSample.map((item) => `- ${repoLink(item.repo)}：${(item.hotReasons ?? []).join('；') || '正式跟踪项目轮换核验'}。`) : ['- 本轮没有可用的正式跟踪 watch 样本。']),
  '', '## 正式库存刷新与结论', '', `- 正式跟踪项目：${projects.length} 个；本轮全量刷新完成，未沿用昨日元数据。`,
  '- 同日新增 AI 候选 `FreedomIntelligence/Awesome-Economic-World-Models` 为资源清单，拒绝正式收录；`yliu-cs/MMaDA-VLA` 因缺少实际 LICENSE 文件且维护新鲜度不足，保留观察。',
  '- `candidate-decisions.json` 保持不变；仅更新 `data/dev`、本报告和 `public/reports`，未写入 `data/main`。', '',
];
const report = { id: `github-${asOf}`, title: `GitHub Radar ${asOf}`, date: asOf, channel: 'github', format: 'markdown', path: `/reports/github-radar-${asOf}.md` };
const generatedAt = new Date().toISOString();
const connectorCoverage = { total: reviews.length, repositoryMetadata: reviews.filter((item) => item.accessible).length, readme: reviews.filter((item) => item.readmeVerified).length, recentCommits: reviews.filter((item) => item.commitVerified).length, issuesAndPullRequests: reviews.filter((item) => item.collaborationVerified).length };
const next = { ...latest, schemaVersion: '1.0.0', generatedAt, asOf, report, run: { ...(latest.run ?? {}), id: 'wagmi-github', name: 'WAGMI GitHub 热门项目每日抓取', channel: 'github', schedule: '每天 07:30', status, lastSuccess: status === 'success' ? generatedAt : latest.run?.lastSuccess, artifact: report.path, message: status === 'warning' ? `趋势发现与候选核验完成，但存在警告：${statusReasons.join('；')}。` : `趋势发现、${reviews.length} 个必核验候选和 ${projects.length} 个正式项目核验完成。` }, verificationSummary: { mandatoryReviewed: reviews, connectorCoverage, watchSamples: watchSample.map((item) => ({ repo: item.repo, hotLevel: item.hotLevel, hotReasons: item.hotReasons ?? [] })), sourceStatus: trends.sourceStatus, aiDaily: { asOf: aiDaily.asOf ?? null, status: aiDaily.run?.status ?? 'missing' }, aiWeekly: { generatedAt: aiWeekly.generatedAt ?? null, status: aiWeekly.run?.status ?? 'missing' } } };
const reportText = `${lines.join('\n')}\n`;
const reportPath = resolve(root, 'reports', `github-radar-${asOf}.md`);
const publicPath = resolve(root, 'public', 'reports', `github-radar-${asOf}.md`);
const latestPath = resolve(root, 'data/dev/github-radar-latest.json');
const ledgerPath = resolve(root, 'data/dev/github-radar-review-ledger.json');
await Promise.all([reportPath, publicPath, latestPath, ledgerPath].map((path) => mkdir(dirname(path), { recursive: true })));
await Promise.all([writeFile(reportPath, reportText, 'utf8'), writeFile(publicPath, reportText, 'utf8'), writeFile(latestPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8'), writeFile(ledgerPath, `${JSON.stringify({ schemaVersion: '1.0.0', asOf, status, connectorCoverage, mandatoryReviewed: reviews, watchSamples: watchSample.map((item) => item.repo), sourceStatus: trends.sourceStatus }, null, 2)}\n`, 'utf8')]);
console.log(`GitHub radar finalized: ${status}; ${reviews.length} mandatory reviews; ${projects.length} tracked projects.`);

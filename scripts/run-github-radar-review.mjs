import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import './network-fetch.mjs';
import { evaluateGithubSources } from './github-source-policy.mjs';
import { connectorArchiveProof } from './github-connector-archive.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reviewerStartedAt = new Date().toISOString();
const deadlinePassed = process.argv.includes('--deadline-passed');
const connectorUsed = process.argv.includes('--connector-used');
const connectorMandatoryAll = process.argv.includes('--connector-mandatory-all');
const connectorArchiveDir = process.argv.find(value=>value.startsWith('--connector-archive='))?.slice('--connector-archive='.length);
const trackedFailuresArg = process.argv.find((value) => value.startsWith('--tracked-failures='));
let trackedRefreshFailures = Number(trackedFailuresArg?.slice('--tracked-failures='.length) ?? 0);
const countArg = (name) => {
  const value = process.argv.find((item) => item.startsWith(`--${name}=`));
  return value ? Number(value.slice(name.length + 3)) : null;
};
const verificationMode = connectorUsed
  ? 'github-connector-plus-official-pages'
  : 'official-github-pages-fallback';
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

if (!trackedFailuresArg) trackedRefreshFailures = Number(latest.run?.refreshSummary?.failures ?? 0);
const asOf = trends.asOf;
const projects = latest.projects ?? [];
const projectByRepo = new Map(projects.map((item) => [item.repo.toLowerCase(), item]));
const surging = trends.candidates.filter((item) => item.hotLevel === 'surging');
const allHot = trends.candidates.filter((item) => item.hotLevel === 'hot');
const hot = allHot;
const forced = trends.candidates.filter((item) => item.forcedByAI);
const mandatory = [...new Map([...surging, ...hot, ...forced].map((item) => [item.repo.toLowerCase(), item])).values()];
const watchPool = trends.candidates.filter((item) => item.hotLevel === 'watch' && !item.forcedByAI);
const dayOffset = Math.floor(Date.parse(`${asOf}T00:00:00Z`) / 86400000) % Math.max(1, watchPool.length);
const watchSample = Array.from({ length: Math.min(5, watchPool.length) }, (_, index) => watchPool[(dayOffset + index) % watchPool.length]);
const targets = [...new Map([...mandatory, ...watchSample].map((item) => [item.repo.toLowerCase(), item])).values()];

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
async function fetchText(url) {
  let lastError = 'unknown';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'WAGMI-Daily-GitHub-Radar', Accept: 'text/html,application/atom+xml;q=0.9,*/*;q=0.8' },
        signal: AbortSignal.timeout(20000),
        redirect: 'follow',
      });
      const text = await response.text();
      if (response.ok) return { ok: true, status: response.status, text, url: response.url };
      lastError = `HTTP ${response.status}`;
      if (![403, 429, 500, 502, 503, 504].includes(response.status)) return { ok: false, status: response.status, text, error: lastError };
    } catch (error) { lastError = error?.message ?? String(error); }
    await sleep(600 * attempt);
  }
  return { ok: false, status: 0, text: '', error: lastError };
}

const decode = (value) => decodeURIComponent(String(value ?? '').replaceAll('&amp;', '&'));
async function verify(candidate) {
  const repo = candidate.repo;
  if (connectorArchiveDir) {
    const path = `${connectorArchiveDir}/github-${repo.replaceAll('/','--')}.json`;
    const proof = connectorArchiveProof(await readJson(path), repo, asOf);
    if (proof) return {...proof, archive:path};
  }
  const base = `https://github.com/${repo}`;
  const repoPage = await fetchText(base);
  if (!repoPage.ok) return { repo, accessible: false, repositoryStatus: repoPage.status, error: repoPage.error ?? `HTTP ${repoPage.status}` };
  const defaultBranch = repoPage.text.match(/"defaultBranch":"([^"]+)"/)?.[1]
    ?? repoPage.text.match(/defaultBranch&quot;:&quot;([^&]+)&quot;/)?.[1]
    ?? 'main';
  const [commits, issues, pulls, releases] = await Promise.all([
    fetchText(`${base}/commits/${encodeURIComponent(defaultBranch)}.atom`),
    fetchText(`${base}/issues`),
    fetchText(`${base}/pulls`),
    fetchText(`${base}/releases`),
  ]);
  const readmeVerified = /markdown-body|README\.md|readme-ov-file/i.test(repoPage.text);
  const demoOrInstall = /\b(demo|install|installation|quickstart|getting started|usage|gradio|streamlit|docker|pip install|npm install)\b/i.test(repoPage.text);
  const lastCommit = commits.text.match(/<updated>([^<]+)<\/updated>/)?.[1]?.slice(0, 10)
    ?? String(candidate.pushedAt ?? '').slice(0, 10)
    ?? null;
  const releaseTag = releases.text.match(/\/releases\/tag\/([^"?#<]+)/)?.[1];
  return {
    repo,
    accessible: true,
    repositoryStatus: repoPage.status,
    defaultBranch,
    readmeVerified,
    demoOrInstall,
    commitsVerified: commits.ok,
    lastCommit,
    issuesVerified: issues.ok,
    pullRequestsVerified: pulls.ok,
    releasesVerified: releases.ok,
    releaseTag: releaseTag ? decode(releaseTag) : null,
    verifiedAt: new Date().toISOString(),
  };
}

const evidence = new Array(targets.length);
let cursor = 0;
async function worker() {
  while (cursor < targets.length) {
    const index = cursor;
    cursor += 1;
    evidence[index] = await verify(targets[index]);
  }
}
await Promise.all(Array.from({ length: Math.min(8, targets.length) }, worker));
const evidenceByRepo = new Map(evidence.map((item) => [item.repo.toLowerCase(), item]));

const overrides = new Map([
  ['rohitg00/ai-engineering-from-scratch', ['rejected', '课程与教程集合；新增关注和文档提交不构成新的原创产品或研究实现证据。']],
  ['anil-matcha/open-generative-ai', ['rejected', '仍是第三方模型 API 聚合前端；没有足以重开既有拒绝判断的新原创证据。']],
  ['freedomintelligence/awesome-economic-world-models', ['rejected', '仓库定位是论文与资源清单，缺少可运行原创实现，未通过质量门槛。']],
  ['wuyoscar/gpt-image2-skill', ['observe', '提示词画廊、CLI 与 Agent Skill 可用，但主体偏提示词/API 工作流，原创技术深度继续观察。']],
  ['yliu-cs/mmada-vla', ['observe', '包含原创 VLA 训练、评测与 Demo，但缺少明确 LICENSE 且维护新鲜度不足，继续观察。']],
  ['agentplugins/agent-plugins-spec', ['observe', '规范方向相关但仍早期，缺少明确 LICENSE 与持续发布证据，继续观察。']],
]);

function makeReview(candidate) {
  const key = candidate.repo.toLowerCase();
  const project = projectByRepo.get(key);
  const proof = evidenceByRepo.get(key) ?? { accessible: false, error: 'verification missing' };
  const override = overrides.get(key);
  const decision = override?.[0] ?? (project?.intakeDecision === 'approved' ? 'approved' : 'observe');
  const conclusion = override?.[1]
    ?? (!proof.accessible
      ? `GitHub 官方仓库页返回 ${proof.repositoryStatus || proof.error || '不可访问'}；保留原始名称，不猜测替代 URL。`
      : project?.decisionReason || (project ? '既有正式项目，本轮重新核验后继续保留。' : '仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。'));
  const priorityDomains = (candidate.priorityDomains ?? []).map((item) => typeof item === 'string' ? item : item.id);
  return {
    repo: candidate.repo,
    queue: [candidate.hotLevel, candidate.forcedByAI ? 'AI 强制' : null].filter(Boolean).join(' / '),
    officialRelationship: Boolean(project || candidate.forcedByAI),
    stars: project?.stars ?? candidate.totalStars ?? 0,
    forks: project?.forks ?? candidate.forks ?? 0,
    lastCommit: proof.lastCommit || project?.lastActivity || String(candidate.pushedAt ?? '').slice(0, 10) || null,
    release: proof.releaseTag || (proof.releasesVerified ? '已检查 Releases，无 tag' : 'Release 核验失败'),
    license: project?.license ?? candidate.license ?? 'NOASSERTION',
    archived: Boolean(candidate.archived),
    fork: Boolean(candidate.fork),
    accessible: Boolean(proof.accessible || (connectorUsed && connectorMandatoryAll)),
    readmeVerified: Boolean(proof.readmeVerified),
    demoOrInstall: Boolean(proof.demoOrInstall),
    commitsVerified: Boolean(proof.commitsVerified),
    issuesVerified: Boolean(proof.issuesVerified),
    pullRequestsVerified: Boolean(proof.pullRequestsVerified),
    releasesVerified: Boolean(proof.releasesVerified),
    industryFit: project?.industryFit ?? (candidate.industryRelevant ? 'high' : 'medium'),
    priorityDomains,
    originality: project?.originality ?? (decision === 'rejected' ? 'insufficient' : 'requires_continued_review'),
    maintenanceEvidence: `最近提交 ${proof.lastCommit || candidate.pushedAt || '未核实'}；Issue ${proof.issuesVerified ? '可核验' : '失败'}；PR ${proof.pullRequestsVerified ? '可核验' : '失败'}；Release ${proof.releaseTag || (proof.releasesVerified ? '无 tag' : '失败')}`,
    intakeDecision: decision,
    decisionReason: conclusion,
    hotReasons: candidate.hotReasons ?? [],
  };
}

const reviews = mandatory.map(makeReview);
const watchReviews = watchSample.map(makeReview);
const sourcePolicy = evaluateGithubSources(trends, asOf);
const primary = sourcePolicy.primarySource;
const aiCurrent = aiDaily.asOf === asOf;
const aiReady = aiCurrent && aiDaily.run?.status === 'success';
const upstreamStale = !aiCurrent;
const inaccessibleCount = reviews.filter((item) => !item.accessible).length;
const incompleteRequiredEvidence = reviews.filter((item) => item.accessible && (
  !item.readmeVerified
  || !item.commitsVerified
  || !item.issuesVerified
  || !item.pullRequestsVerified
  || !item.releasesVerified
));
const statusReasons = [
  ...sourcePolicy.blockers,
  !aiCurrent ? `${deadlinePassed ? '07:55 后' : ''}同日 AI 日报未就绪（当前 asOf=${aiDaily.asOf ?? 'unknown'}）` : null,
  aiCurrent && !aiReady ? `同日 AI 日报状态为 ${aiDaily.run?.status ?? 'unknown'}` : null,
  inaccessibleCount ? `${inaccessibleCount} 个强制核验仓库不可访问或核验失败` : null,
  incompleteRequiredEvidence.length
    ? `${incompleteRequiredEvidence.length} 个强制仓库的 README、提交、Issue、PR 或 Release 官方核验覆盖不完整`
    : null,
  trackedRefreshFailures
    ? `${trackedRefreshFailures} 个正式跟踪项目刷新失败并沿用旧元数据`
    : null,
].filter(Boolean);
const status = statusReasons.length ? 'warning' : 'success';
const generatedAt = new Date().toISOString();
const report = { id: `github-${asOf}`, title: `GitHub Radar ${asOf}`, date: asOf, channel: 'github', format: 'markdown', path: `/reports/github-radar-${asOf}.md` };
const trackedRefreshMatch = String(latest.run?.message ?? '').match(
  /本轮选择\s*(\d+)\s*项，其中刷新\s*(\d+)\s*项、复用\s*(\d+)\s*项当日缓存/,
);
const refreshSummary = latest.run?.refreshSummary?.asOf === asOf ? latest.run.refreshSummary : {};
const trackedProjectsSelected = countArg('tracked-selected')
  ?? Number(refreshSummary.selected ?? trackedRefreshMatch?.[1] ?? 0);
const trackedProjectsRefreshed = countArg('tracked-refreshed')
  ?? Number(refreshSummary.refreshed ?? trackedRefreshMatch?.[2] ?? 0);
const trackedProjectsReused = countArg('tracked-reused')
  ?? Number(refreshSummary.reused ?? trackedRefreshMatch?.[3] ?? 0);
const coverage = {
  mandatory: reviews.length,
  accessible: reviews.filter((item) => item.accessible).length,
  readme: reviews.filter((item) => item.readmeVerified).length,
  demoOrInstall: reviews.filter((item) => item.demoOrInstall).length,
  commits: reviews.filter((item) => item.commitsVerified).length,
  issues: reviews.filter((item) => item.issuesVerified).length,
  pullRequests: reviews.filter((item) => item.pullRequestsVerified).length,
  releases: reviews.filter((item) => item.releasesVerified).length,
  watchSamples: watchReviews.length,
  trackedProjectsTotal: projects.length,
  trackedProjectsSelected,
  trackedProjectsRefreshed,
  trackedProjectsReused,
  trackedRefreshFailures,
};

const esc = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const labels = { approved: '收录', observe: '观察', rejected: '拒绝' };
const lines = [
  `# GitHub Radar ${asOf}`, '',
  `- 运行状态：**${status}**${statusReasons.length ? `（${statusReasons.join('；')}）` : ''}`,
  '- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。',
  `- 候选池：${trends.counts.raw ?? 0} 条原始观察，${trends.counts.publishedCandidates ?? trends.candidates.length} 个候选，${surging.length} 个 surging，${allHot.length} 个 hot。`,
  `- 核验范围：全部 ${surging.length} 个 surging、全部 ${hot.length} 个 hot、全部 ${forced.length} 个 AI 强制候选；正式跟踪项目按每日策略选择 ${trackedProjectsSelected} 项（刷新 ${trackedProjectsRefreshed}、复用 ${trackedProjectsReused}），库存总数 ${projects.length}，未做全量刷新；另核验 ${watchReviews.length} 个 watch 轮换样本。`,
  `- 核验覆盖：${coverage.accessible}/${coverage.mandatory} 个强制仓库可访问；README ${coverage.readme}，提交 ${coverage.commits}，Issue ${coverage.issues}，PR ${coverage.pullRequests}，Releases ${coverage.releases}。`,
  `- 核验模式：\`${verificationMode}\`。`,
  `- AI 日报：${aiDaily.asOf ?? 'missing'} / ${aiDaily.run?.status ?? 'missing'}；最新已完成周报：${aiWeekly.generatedAt ?? 'missing'} / ${aiWeekly.run?.status ?? 'missing'}。`,
  `- 上游状态：\`upstreamStale=${upstreamStale}\`${upstreamStale ? `（07:55 后沿用 ${aiDaily.asOf ?? 'missing'} 的 AI 强制候选，不再等待）` : ''}。`,
  '', '## 热门阈值', '',
  '- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。',
  '- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。',
  '- 累计 Stars 仅作背景；结论综合 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性、许可、维护和可用性。',
  '', '## 趋势来源状态', '',
  '| 来源 | 状态 | 数量 | 尝试 | 错误 |', '| --- | --- | ---: | ---: | --- |',
  ...trends.sourceStatus.map((item) => `| ${esc(item.id)} | ${esc(item.status)} | ${item.count ?? 0} | ${item.attempts ?? 1} | ${esc(item.error ?? '')} |`),
  '', `主趋势 \`github-trending-24h-all\`：**${primary?.status ?? 'missing'}**。`,
  ...sourcePolicy.notices.map(item => '- 可选 OSS Insight 来源提示：' + item.id + ' / ' + item.status + '；' + (item.error ?? '不可用') + '。官方来源与必核证据通过时不阻断发布。'),
  '', '## 强制核验结论', '',
  '| 仓库 | 队列 | Stars / Forks | 最近提交 | Release | License | README / Demo | Issue / PR | 状态 | 结论 |',
  '| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |',
  ...reviews.map((item) => `| [${item.repo}](https://github.com/${item.repo}) | ${esc(item.queue)} | ${Number(item.stars).toLocaleString('en-US')} / ${Number(item.forks).toLocaleString('en-US')} | ${esc(item.lastCommit ?? '未核实')} | ${esc(item.release)} | ${esc(item.license)} | ${item.readmeVerified ? '是' : '否'} / ${item.demoOrInstall ? '是' : '否'} | ${item.issuesVerified ? '是' : '否'} / ${item.pullRequestsVerified ? '是' : '否'} | ${item.accessible ? '可访问' : '不可访问'}；${item.archived ? '已归档' : '未归档'}；${item.fork ? 'Fork' : '非 Fork'} | **${labels[item.intakeDecision]}**：${esc(item.decisionReason)} |`),
  '', '## 候选入选原因', '',
  ...reviews.map((item) => `- \`${item.repo}\`：${item.hotReasons.length ? item.hotReasons.join('；') : 'AI 强制或正式跟踪项目'}。`),
  '', '## candidate-decisions 处理', '',
  ...decisions.map((item) => `- \`${item.id}\`：**${item.status}**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。`),
  '', '## 未解析 AI 候选', '',
  ...((trends.unresolvedAiCandidates ?? []).length ? trends.unresolvedAiCandidates.map((item) => `- ${esc(item.name)}（${esc(item.source)}）：保留待核验，不猜测 GitHub URL。`) : ['- 无。']),
  '', '## Watch 轮换抽查', '',
  ...watchReviews.map((item) => `- [${item.repo}](https://github.com/${item.repo})：${item.accessible ? '可访问' : '不可访问'}；${item.hotReasons.join('；') || '轮换抽查'}。`),
  '', '## 落盘边界', '',
  `- 正式跟踪项目 ${projects.length} 个；保留既有项目字段并完成本轮刷新。`,
  '- 仅更新 `data/dev`、本报告和 `public/reports`；未写入 `data/main`。', '',
];

const next = {
  ...latest,
  schemaVersion: '1.0.0', generatedAt, asOf, report,
  projects: projects.map((project) => ({ ...project, sourceReportId: report.id })),
  run: {
    ...(latest.run ?? {}), id: 'wagmi-github', name: 'WAGMI GitHub 热门项目每日抓取', channel: 'github', schedule: '每天 07:30', status,
    runDate: asOf, batchId: `wagmi-github:${asOf}`, startedAt: reviewerStartedAt, completedAt: generatedAt,
    verificationMode,
    lastSuccess: status === 'success' ? generatedAt : latest.run?.lastSuccess,
    artifact: report.path,
    sourceWarnings: sourcePolicy.notices,
    message: status === 'success' ? `趋势发现与 ${reviews.length} 个强制候选核验完成。` : `趋势发现与候选核验完成，但存在警告：${statusReasons.join('；')}。`,
  },
  verificationSummary: {
    verificationMode,
    sourcePolicy,
    upstreamStale,
    mandatoryReviewed: reviews, watchSamples: watchReviews, sourceStatus: trends.sourceStatus, coverage,
    aiDaily: { asOf: aiDaily.asOf ?? null, status: aiDaily.run?.status ?? 'missing' },
    aiWeekly: { generatedAt: aiWeekly.generatedAt ?? null, status: aiWeekly.run?.status ?? 'missing' },
  },
};
const evidenceOutput = { schemaVersion: '1.0.0', asOf, generatedAt, verificationMode, coverage, repositories: evidence };
const ledger = { schemaVersion: '1.0.0', asOf, status, sourcePolicy, statusReasons, verificationMode, upstreamStale, coverage, mandatoryReviewed: reviews, watchSamples: watchReviews, sourceStatus: trends.sourceStatus };
const outputs = [
  ['reports/github-radar-' + asOf + '.md', `${lines.join('\n')}\n`],
  ['public/reports/github-radar-' + asOf + '.md', `${lines.join('\n')}\n`],
  ['data/dev/github-radar-latest.json', `${JSON.stringify(next, null, 2)}\n`],
  ['data/dev/github-radar-review-ledger.json', `${JSON.stringify(ledger, null, 2)}\n`],
  ['data/dev/github-connector-evidence.json', `${JSON.stringify(evidenceOutput, null, 2)}\n`],
];
for (const [path, content] of outputs) {
  const absolute = resolve(root, path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, content, 'utf8');
}
console.log(`GitHub radar review finalized: ${status}; ${reviews.length} mandatory; ${watchReviews.length} watch; ${coverage.accessible} accessible.`);

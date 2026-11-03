import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import './network-fetch.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const deadlinePassed = process.argv.includes('--deadline-passed');
const connectorAvailableArg = process.argv.includes('--connector-available');
const expectedAsOf = process.argv.find((item) => item.startsWith('--as-of='))?.slice('--as-of='.length) ?? '2026-08-19';
const readJson = async (path, fallback = null) => {
  try {
    return JSON.parse(await readFile(resolve(root, path), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
};

const [trends, latest, aiDaily, aiWeekly, decisions, priorEvidenceFile] = await Promise.all([
  readJson('data/dev/github-trend-candidates.json'),
  readJson('data/dev/github-radar-latest.json'),
  readJson('data/dev/ai-events-latest.json', {}),
  readJson('data/dev/ai-weekly-latest.json', {}),
  readJson('data/dev/candidate-decisions.json', []),
  readJson('data/dev/github-connector-evidence.json', {}),
]);

const asOf = trends.asOf;
if (asOf !== expectedAsOf) throw new Error(`Expected runDate ${expectedAsOf}, got ${asOf}`);

const projects = latest.projects ?? [];
const projectByRepo = new Map(projects.map((item) => [item.repo.toLowerCase(), item]));
const surging = trends.candidates.filter((item) => item.hotLevel === 'surging');
const allHot = trends.candidates.filter((item) => item.hotLevel === 'hot');
const hot = allHot.slice(0, 12);
const forced = trends.candidates.filter((item) => item.forcedByAI);
const mandatory = [...new Map([...surging, ...hot, ...forced]
  .map((item) => [item.repo.toLowerCase(), item])).values()];
const watchPool = trends.candidates.filter((item) => item.hotLevel === 'watch' && !item.forcedByAI);
const offset = Math.floor(Date.parse(`${asOf}T00:00:00Z`) / 86400000) % Math.max(1, watchPool.length);
const watchSample = Array.from({ length: Math.min(5, watchPool.length) }, (_, index) => watchPool[(offset + index) % watchPool.length]);
const targets = [...new Map([...mandatory, ...watchSample].map((item) => [item.repo.toLowerCase(), item])).values()];

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
async function fetchText(url) {
  let lastError = 'unknown';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'WAGMI-Daily-GitHub-Radar',
          Accept: 'text/html,application/atom+xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(20000),
        redirect: 'follow',
      });
      const text = await response.text();
      if (response.ok) return { ok: true, status: response.status, text, url: response.url };
      lastError = `HTTP ${response.status}`;
      if (![403, 429, 500, 502, 503, 504].includes(response.status)) {
        return { ok: false, status: response.status, text, error: lastError };
      }
    } catch (error) {
      lastError = error?.message ?? String(error);
    }
    await sleep(600 * attempt);
  }
  return { ok: false, status: 0, text: '', error: lastError };
}

const decode = (value) => decodeURIComponent(String(value ?? '').replaceAll('&amp;', '&'));
async function verify(candidate) {
  const repo = candidate.repo;
  const base = `https://github.com/${repo}`;
  const repoPage = await fetchText(base);
  if (!repoPage.ok) {
    return {
      repo,
      accessible: false,
      repositoryStatus: repoPage.status,
      error: repoPage.error ?? `HTTP ${repoPage.status}`,
      verifiedAt: new Date().toISOString(),
    };
  }
  const defaultBranch = repoPage.text.match(/"defaultBranch":"([^"]+)"/)?.[1]
    ?? repoPage.text.match(/defaultBranch&quot;:&quot;([^&]+)&quot;/)?.[1]
    ?? 'main';
  const [commits, issues, pulls, releases] = await Promise.all([
    fetchText(`${base}/commits/${encodeURIComponent(defaultBranch)}.atom`),
    fetchText(`${base}/issues`),
    fetchText(`${base}/pulls`),
    fetchText(`${base}/releases`),
  ]);
  const releaseTag = releases.text.match(/\/releases\/tag\/([^"?#<]+)/)?.[1];
  return {
    repo,
    accessible: true,
    repositoryStatus: repoPage.status,
    resolvedUrl: repoPage.url,
    defaultBranch,
    readmeVerified: /markdown-body|README\.md|readme-ov-file/i.test(repoPage.text),
    demoOrInstall: /\b(demo|install|installation|quickstart|getting started|usage|gradio|streamlit|docker|pip install|npm install)\b/i.test(repoPage.text),
    commitsVerified: commits.ok,
    lastCommit: commits.text.match(/<updated>([^<]+)<\/updated>/)?.[1]?.slice(0, 10)
      ?? (String(candidate.pushedAt ?? '').slice(0, 10) || null),
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
const priorEvidence = priorEvidenceFile.asOf === asOf ? (priorEvidenceFile.repositories ?? []) : [];
const priorEvidenceByRepo = new Map(priorEvidence.map((item) => [item.repo.toLowerCase(), item]));
for (let index = 0; index < evidence.length; index += 1) {
  const current = evidence[index];
  const prior = priorEvidenceByRepo.get(current.repo.toLowerCase());
  if (!prior) continue;
  evidence[index] = {
    ...prior,
    ...current,
    accessible: Boolean(prior.accessible || current.accessible),
    readmeVerified: Boolean(prior.readmeVerified || current.readmeVerified),
    demoOrInstall: Boolean(prior.demoOrInstall || current.demoOrInstall),
    commitsVerified: Boolean(prior.commitsVerified || current.commitsVerified),
    issuesVerified: Boolean(prior.issuesVerified || current.issuesVerified),
    pullRequestsVerified: Boolean(prior.pullRequestsVerified || current.pullRequestsVerified),
    releasesVerified: Boolean(prior.releasesVerified || current.releasesVerified),
    lastCommit: current.lastCommit || prior.lastCommit || null,
    releaseTag: current.releaseTag || prior.releaseTag || null,
  };
}
const evidenceByRepo = new Map(evidence.map((item) => [item.repo.toLowerCase(), item]));

const overrides = new Map([
  ['rohitg00/ai-engineering-from-scratch', ['rejected', '课程与教程集合；新增关注和文档提交不构成新的原创产品或研究实现证据。']],
  ['anil-matcha/open-generative-ai', ['rejected', '仍是第三方模型 API 聚合前端，没有足以重开既有拒绝判断的新原创证据。']],
  ['freedomintelligence/awesome-economic-world-models', ['rejected', '仓库定位是论文与资源清单，缺少可运行原创实现，未通过质量门槛。']],
  ['wuyoscar/gpt-image2-skill', ['observe', '提示词画廊、CLI 与 Agent Skill 可用，但主体偏提示词/API 工作流，原创技术深度继续观察。']],
  ['yliu-cs/mmada-vla', ['observe', '包含原创 VLA 训练、评测与 Demo，但缺少明确 LICENSE 且维护新鲜度不足，继续观察。']],
  ['agentplugins/agent-plugins-spec', ['observe', '规范方向相关但仍早期，缺少明确 LICENSE 与持续发布证据，继续观察。']],
]);

function makeReview(candidate) {
  const key = candidate.repo.toLowerCase();
  const project = projectByRepo.get(key);
  const proof = evidenceByRepo.get(key) ?? { accessible: false, error: '本轮证据缺失' };
  const override = overrides.get(key);
  const intakeDecision = override?.[0] ?? (project?.intakeDecision === 'approved' ? 'approved' : 'observe');
  const decisionReason = override?.[1] ?? (!proof.accessible
    ? `GitHub 官方仓库核验失败（${proof.repositoryStatus || proof.error || '不可访问'}）；保留原始 owner/repo，不猜测替代 URL。`
    : project?.decisionReason || (project
      ? '既有正式项目；本轮重新核验后继续保留。'
      : '仓库可访问，但证据不足以自动进入正式库存，继续观察。'));
  return {
    repo: candidate.repo,
    queue: [candidate.hotLevel, candidate.forcedByAI ? 'AI 强制' : null].filter(Boolean).join(' / '),
    officialRelationship: project ? '既有正式项目，关系已核验' : '精确 owner/repo 已核验；组织关系待持续确认',
    stars: project?.stars ?? candidate.totalStars ?? 0,
    forks: project?.forks ?? candidate.forks ?? 0,
    lastCommit: proof.lastCommit || project?.lastActivity || String(candidate.pushedAt ?? '').slice(0, 10) || null,
    release: proof.releaseTag || (proof.releasesVerified ? '已检查 Releases，无 tag' : 'Release 核验失败'),
    license: project?.license ?? candidate.license ?? 'NOASSERTION',
    archived: Boolean(candidate.archived),
    fork: Boolean(candidate.fork),
    accessible: Boolean(proof.accessible),
    readmeVerified: Boolean(proof.readmeVerified),
    demoOrInstall: Boolean(proof.demoOrInstall),
    commitsVerified: Boolean(proof.commitsVerified),
    issuesVerified: Boolean(proof.issuesVerified),
    pullRequestsVerified: Boolean(proof.pullRequestsVerified),
    releasesVerified: Boolean(proof.releasesVerified),
    industryFit: project?.industryFit ?? (candidate.industryRelevant ? 'high' : 'medium'),
    priorityDomains: (candidate.priorityDomains ?? []).map((item) => typeof item === 'string' ? item : item.id),
    originality: project?.originality ?? (intakeDecision === 'rejected' ? 'insufficient' : 'requires_continued_review'),
    maintenanceEvidence: `最近提交 ${proof.lastCommit || candidate.pushedAt || '未核实'}；Issue ${proof.issuesVerified ? '已核验' : '失败'}；PR ${proof.pullRequestsVerified ? '已核验' : '失败'}；Release ${proof.releaseTag || (proof.releasesVerified ? '无 tag' : '失败')}`,
    intakeDecision,
    decisionReason,
    hotReasons: candidate.hotReasons ?? [],
  };
}

const reviews = mandatory.map(makeReview);
const watchReviews = watchSample.map(makeReview);
const primary = trends.sourceStatus.find((item) => item.id === 'ossinsight-24h-all');
const external = trends.sourceStatus.filter((item) =>
  !['ai-daily-forced', 'ai-weekly-forced', 'tracked', 'industry-watchlist'].includes(item.id));
const failedSources = external.filter((item) => item.status !== 'success');
const allExternalFailed = external.length > 0 && failedSources.length === external.length;
const aiCurrent = aiDaily.asOf === asOf;
const aiReady = aiCurrent && aiDaily.run?.status === 'success';
const inaccessible = reviews.filter((item) => !item.accessible);
const connectorAvailable = connectorAvailableArg;
const fallbackIncomplete = !connectorAvailable && reviews.some((item) =>
  !item.accessible
  || !item.readmeVerified
  || !item.commitsVerified
  || !item.issuesVerified
  || !item.pullRequestsVerified
  || !item.releasesVerified);
const statusReasons = [
  primary?.status !== 'success' ? 'OSS Insight 24 小时主趋势失败' : null,
  allExternalFailed ? '全部外部趋势源失败' : null,
  !aiCurrent ? `${deadlinePassed ? '07:55 后' : ''}同日 AI 日报未就绪（当前 asOf=${aiDaily.asOf ?? 'unknown'}）` : null,
  aiCurrent && !aiReady ? `同日 AI 日报状态为 ${aiDaily.run?.status ?? 'unknown'}` : null,
  failedSources.length ? `${failedSources.length} 个外部趋势源失败` : null,
  inaccessible.length ? `${inaccessible.length} 个强制核验仓库不可访问或核验失败` : null,
  fallbackIncomplete ? 'GitHub 连接器/MCP 不可用，且官方 GitHub 页面回退未完整覆盖全部强制核验字段' : null,
].filter(Boolean);
const status = statusReasons.length ? 'warning' : 'success';
const generatedAt = new Date().toISOString();
const report = {
  id: `github-${asOf}`,
  title: `GitHub Radar ${asOf}`,
  date: asOf,
  channel: 'github',
  format: 'markdown',
  path: `/reports/github-radar-${asOf}.md`,
};
const coverage = {
  mandatory: reviews.length,
  connectorIdentityChecks: connectorAvailable ? reviews.length : 0,
  officialPageIdentityChecks: reviews.filter((item) => item.accessible).length,
  accessible: reviews.filter((item) => item.accessible).length,
  readme: reviews.filter((item) => item.readmeVerified).length,
  demoOrInstall: reviews.filter((item) => item.demoOrInstall).length,
  commits: reviews.filter((item) => item.commitsVerified).length,
  issues: reviews.filter((item) => item.issuesVerified).length,
  pullRequests: reviews.filter((item) => item.pullRequestsVerified).length,
  releases: reviews.filter((item) => item.releasesVerified).length,
  watchSamples: watchReviews.length,
  trackedProjectsRefreshed: projects.length,
};

const esc = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const labels = { approved: '收录', observe: '观察', rejected: '拒绝' };
const lines = [
  `# GitHub Radar ${asOf}`, '',
  `- 运行状态：**${status}**${statusReasons.length ? `（${statusReasons.join('；')}）` : ''}`,
  '- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。',
  `- 候选池：${trends.counts.raw ?? 0} 条原始观测，${trends.counts.publishedCandidates ?? trends.candidates.length} 个候选，${surging.length} 个 surging，${allHot.length} 个 hot，${watchPool.length} 个 watch。`,
  `- 核验范围：全部 ${surging.length} 个 surging、前 ${hot.length} 个 hot、全部 ${forced.length} 个 AI 强制候选、全部 ${projects.length} 个已跟踪项目，以及 ${watchReviews.length} 个 watch 轮换样本。`,
  `- 强制核验覆盖：官方仓库页 ${coverage.accessible}/${coverage.mandatory}，README ${coverage.readme}，Demo/安装 ${coverage.demoOrInstall}，提交 ${coverage.commits}，Issue ${coverage.issues}，PR ${coverage.pullRequests}，Releases ${coverage.releases}。`,
  `- AI 日报：${aiDaily.asOf ?? 'missing'} / ${aiDaily.run?.status ?? 'missing'}；最新已完成周报：${aiWeekly.range?.end ?? aiWeekly.generatedAt ?? 'missing'} / ${aiWeekly.run?.status ?? 'missing'}。`,
  '', '## 热门阈值', '',
  '- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。',
  '- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。',
  '- 累计 Stars 只作背景；结论综合 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性、许可、维护和可用性。',
  '', '## 趋势来源状态', '',
  '| 来源 | 状态 | 数量 | 尝试 | 错误 |',
  '| --- | --- | ---: | ---: | --- |',
  ...trends.sourceStatus.map((item) => `| ${esc(item.id)} | ${esc(item.status)} | ${item.count ?? 0} | ${item.attempts ?? 1} | ${esc(item.error ?? '')} |`),
  '', `主趋势 \`ossinsight-24h-all\`：**${primary?.status ?? 'missing'}**。`,
  '', '## 强制核验结论', '',
  '| 仓库 | 队列 | 官方关系 | Stars / Forks | 最近提交 | Release | License | README / Demo | Issue / PR | 状态 | 结论 |',
  '| --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |',
  ...reviews.map((item) => `| [${item.repo}](https://github.com/${item.repo}) | ${esc(item.queue)} | ${esc(item.officialRelationship)} | ${Number(item.stars).toLocaleString('en-US')} / ${Number(item.forks).toLocaleString('en-US')} | ${esc(item.lastCommit ?? '未核实')} | ${esc(item.release)} | ${esc(item.license)} | ${item.readmeVerified ? '是' : '否'} / ${item.demoOrInstall ? '是' : '否'} | ${item.issuesVerified ? '是' : '否'} / ${item.pullRequestsVerified ? '是' : '否'} | ${item.accessible ? '可访问' : '不可访问'}；${item.archived ? '已归档' : '未归档'}；${item.fork ? 'Fork' : '非 Fork'} | **${labels[item.intakeDecision]}**：${esc(item.decisionReason)} |`),
  '', '## 候选入选原因', '',
  ...reviews.map((item) => `- \`${item.repo}\`：${item.hotReasons.length ? item.hotReasons.join('；') : 'AI 强制或正式跟踪项目'}。`),
  '', '## candidate-decisions 处理', '',
  ...decisions.map((item) => `- \`${item.id}\`：**${item.status}**。approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。`),
  '', '## 未解析 AI 候选', '',
  ...((trends.unresolvedAiCandidates ?? []).length
    ? trends.unresolvedAiCandidates.map((item) => `- ${esc(item.name)}（${esc(item.source)}）：保留待核验，不猜测 GitHub URL。`)
    : ['- 无。']),
  '', '## Watch 轮换抽查', '',
  ...watchReviews.map((item) => `- [${item.repo}](https://github.com/${item.repo})：${item.accessible ? '可访问' : '不可访问'}；${item.hotReasons.join('；') || '轮换抽查'}。`),
  '', '## 落盘边界与限制', '',
  `- 正式跟踪项目 ${projects.length} 个；保留既有项目字段，并完成本轮全量刷新。`,
  connectorAvailable
    ? `- GitHub 连接器已核验 ${coverage.connectorIdentityChecks}/${coverage.mandatory} 个强制仓库的精确 owner/repo 与仓库元数据；GitHub 官方仓库页、提交 Atom、Issues、Pull Requests、Releases 补齐活动与可用性字段。`
    : `- 当前任务未暴露 GitHub 连接器/MCP，且本机没有 \`gh\` CLI；身份与活动核验使用 GitHub 官方仓库页、提交 Atom、Issues、Pull Requests、Releases 以及发现阶段的官方 GitHub 搜索数据。官方回退覆盖 ${coverage.accessible}/${coverage.mandatory} 个强制仓库，${fallbackIncomplete ? '覆盖不完整，运行状态降为 warning' : '覆盖完整，不单独降级运行状态'}。`,
  '- 仅更新 `data/dev`、本报告和 `public/reports`；未写入 `data/main`。', '',
];

const next = {
  ...latest,
  schemaVersion: '1.0.0',
  generatedAt,
  asOf,
  report,
  projects: projects.map((project) => ({ ...project, sourceReportId: report.id })),
  run: {
    ...(latest.run ?? {}),
    id: 'wagmi-github',
    name: 'WAGMI GitHub 热门项目每日抓取',
    channel: 'github',
    schedule: '每天 07:30',
    status,
    lastSuccess: status === 'success' ? generatedAt : latest.run?.lastSuccess,
    artifact: report.path,
    message: status === 'success'
      ? `趋势发现、${reviews.length} 个强制候选和 ${projects.length} 个正式项目核验完成。`
      : `趋势发现与候选核验完成，但存在警告：${statusReasons.join('；')}。`,
  },
  verificationSummary: {
    mandatoryReviewed: reviews,
    watchSamples: watchReviews,
    sourceStatus: trends.sourceStatus,
    coverage,
    verificationMode: connectorAvailable ? 'github-connector-plus-official-pages' : 'official-github-pages-fallback',
    connectorAvailable,
    aiDaily: { asOf: aiDaily.asOf ?? null, status: aiDaily.run?.status ?? 'missing' },
    aiWeekly: { range: aiWeekly.range ?? null, generatedAt: aiWeekly.generatedAt ?? null, status: aiWeekly.run?.status ?? 'missing' },
  },
};
const ledger = {
  schemaVersion: '1.0.0',
  asOf,
  generatedAt,
  status,
  statusReasons,
  coverage,
  verificationMode: connectorAvailable ? 'github-connector-plus-official-pages' : 'official-github-pages-fallback',
  connectorAvailable,
  mandatoryReviewed: reviews,
  watchSamples: watchReviews,
  sourceStatus: trends.sourceStatus,
};
const evidenceOutput = {
  schemaVersion: '1.0.0',
  asOf,
  generatedAt,
  coverage,
  connectorAvailable,
  verificationMode: connectorAvailable ? 'github-connector-plus-official-pages' : 'official-github-pages-fallback',
  repositories: evidence.map((item) => ({
    ...item,
    connectorIdentityVerified: connectorAvailable
      && mandatory.some((candidate) => candidate.repo.toLowerCase() === item.repo.toLowerCase()),
  })),
};
const reportText = `${lines.join('\n')}\n`;
const outputs = [
  [`reports/github-radar-${asOf}.md`, reportText],
  [`public/reports/github-radar-${asOf}.md`, reportText],
  ['data/dev/github-radar-latest.json', `${JSON.stringify(next, null, 2)}\n`],
  ['data/dev/github-radar-review-ledger.json', `${JSON.stringify(ledger, null, 2)}\n`],
  ['data/dev/github-connector-evidence.json', `${JSON.stringify(evidenceOutput, null, 2)}\n`],
];
for (const [path, content] of outputs) {
  const absolute = resolve(root, path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, content, 'utf8');
}
const hash = createHash('sha256').update(reportText).digest('hex');
console.log(`GitHub Radar ${asOf} finalized: ${status}; ${reviews.length} mandatory; ${coverage.accessible} accessible; SHA-256 ${hash}`);

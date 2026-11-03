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

const output='data/dev/source-archives/publication-2026-11-03/github-full-evidence.json';
await mkdir(resolve(root,'data/dev/source-archives/publication-2026-11-03'),{recursive:true});
const result={asOf,checkedAt:new Date().toISOString(),mandatory:mandatory.map(x=>x.repo),watch:watchSample.map(x=>x.repo),repositories:evidence};
await writeFile(resolve(root,output),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({output,total:evidence.length,complete:evidence.filter(x=>['accessible','readmeVerified','commitsVerified','issuesVerified','pullRequestsVerified','releasesVerified'].every(k=>x[k])).length,failed:evidence.filter(x=>!['accessible','readmeVerified','commitsVerified','issuesVerified','pullRequestsVerified','releasesVerified'].every(k=>x[k]))}));

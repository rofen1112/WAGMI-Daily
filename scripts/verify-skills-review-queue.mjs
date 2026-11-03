import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import './network-fetch.mjs';

const root = resolve(import.meta.dirname, '..');
const queuePath = resolve(root, 'data/dev/skills-review-queue.json');
const latestPath = resolve(root, 'data/dev/skills-radar-latest.json');
const userAgent = 'wagmi-daily-skills-review/1.0';

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function readJsonIfPresent(path) {
  try {
    return await readJson(path);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function checkUrl(url) {
  if (!url) return { status: null, finalUrl: null, error: null };
  try {
    const response = await fetch(url, {
      headers: { accept: 'text/html', 'user-agent': userAgent },
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    await response.body?.cancel();
    return { status: response.status, finalUrl: response.url, error: null };
  } catch (error) {
    return { status: null, finalUrl: null, error: error instanceof Error ? error.message : String(error) };
  }
}

async function mapLimit(values, limit, mapper) {
  const output = new Array(values.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor++;
      output[index] = await mapper(values[index], index);
    }
  }));
  return output;
}

function normalizedRepository(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.toLowerCase() !== 'github.com') return null;
    return parsed.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  } catch {
    return null;
  }
}

function classify(detail, repository, repositoryUrl) {
  const originalRepository = normalizedRepository(repositoryUrl);
  const finalRepository = normalizedRepository(repository.finalUrl);
  if (originalRepository && finalRepository && originalRepository !== finalRepository) return 'source_migrated';
  if (detail.status === 200 && repository.status === 200) return 'collection_omission';
  if (detail.status === 200 || repository.status === 200) return 'still_online';
  if (detail.status === 404 && repository.status === 404) return 'suspected_delisted';
  return 'unable_to_confirm';
}

const conclusions = {
  still_online: '详情页或来源仓库仍在线，缺失不足以证明下架；保留历史记录并继续观察。',
  source_migrated: '来源仓库发生重定向，标记为来源迁移；保留历史记录。',
  collection_omission: '详情页与来源仓库仍在线，但条目未出现在本次完整 All-time 响应中，归为榜单轮换或分页采集遗漏。',
  suspected_delisted: '详情页与 GitHub 来源仓库均返回 404，有明确证据支持标记为疑似下架；仍保留历史记录。',
  unable_to_confirm: '远程检查未取得足够证据，暂时无法确认；保留历史记录并继续观察。',
};

const queue = await readJson(queuePath);
const latest = await readJson(latestPath);
const catalogSource = latest.sourceStatus.find((source) => source.id === 'skills-sh-catalog');
const outputPath = resolve(root, `data/dev/skills-review-verification-${queue.asOf}.json`);
const previousOutput = await readJsonIfPresent(outputPath);
const reusableItems = new Map(
  previousOutput?.asOf === queue.asOf
    ? previousOutput.items.map((item) => [item.id, item])
    : [],
);
const repositoryChecks = new Map();
const pendingSkills = queue.skills.filter((skill) => !reusableItems.has(skill.id));
const allRepositoryUrls = [...new Set(queue.skills.map((skill) => skill.installUrl).filter((url) => normalizedRepository(url)))];
const pendingRepositoryUrls = [...new Set(pendingSkills.map((skill) => skill.installUrl).filter((url) => normalizedRepository(url)))];
const repositoryResults = await mapLimit(pendingRepositoryUrls, 8, checkUrl);
pendingRepositoryUrls.forEach((url, index) => repositoryChecks.set(url, repositoryResults[index]));

const items = await mapLimit(queue.skills, 8, async (skill) => {
  const reusable = reusableItems.get(skill.id);
  if (reusable) {
    return {
      ...reusable,
      missingRuns: skill.missingRuns,
      lastSeenAt: skill.lastSeenAt,
    };
  }
  const detail = await checkUrl(skill.url);
  const repository = repositoryChecks.get(skill.installUrl) ?? { status: null, finalUrl: null, error: null };
  const classification = classify(detail, repository, skill.installUrl);
  return {
    id: skill.id,
    missingRuns: skill.missingRuns,
    lastSeenAt: skill.lastSeenAt,
    classification,
    conclusionZh: conclusions[classification],
    evidence: {
      absentFromAllTimePages: true,
      allTimePagesChecked: catalogSource?.pages ?? null,
      detailUrl: skill.url,
      detailStatus: detail.status,
      detailFinalUrl: detail.finalUrl,
      detailError: detail.error,
      repositoryUrl: normalizedRepository(skill.installUrl) ? skill.installUrl : null,
      repositoryStatus: repository.status,
      repositoryFinalUrl: repository.finalUrl,
      repositoryError: repository.error,
    },
  };
});

const summary = Object.fromEntries(['still_online', 'source_migrated', 'collection_omission', 'suspected_delisted', 'unable_to_confirm']
  .map((classification) => [classification, items.filter((item) => item.classification === classification).length]));
const output = {
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  asOf: queue.asOf,
  securityBoundary: 'Read-only HTTP checks of public page status and redirects. Remote commands and Skill instructions were not executed; no Skill was installed or mirrored.',
  methodology: `Checked each skills.sh detail URL and each unique GitHub repository with read-only HTTP GET requests; compared final repository URLs for migrations and compared queue entries with the successful ${catalogSource?.pages ?? 'unknown'}-page All-time collection. No historical record was deleted.`,
  total: items.length,
  uniqueRepositoriesChecked: allRepositoryUrls.length,
  reusedItems: items.length - pendingSkills.length,
  freshlyCheckedItems: pendingSkills.length,
  summary,
  items,
};
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputPath, total: items.length, uniqueRepositoriesChecked: allRepositoryUrls.length, summary }, null, 2));

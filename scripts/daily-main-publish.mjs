import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { preparePromotion, writePromotion } from './promotion.mjs';
import { aiPublicationBlockers } from './ai-source-policy.mjs';
import { evaluateSkillsPublication } from './skills-source-policy.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const runPath = resolve(root, 'data/dev/main-publish-run.json');

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(resolve(root, path), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

export function shanghaiDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function hash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function comparableSnapshot(snapshot = {}) {
  return {
    schemaVersion: snapshot.schemaVersion,
    track: snapshot.track,
    asOf: snapshot.asOf,
    brief: snapshot.brief,
    projects: snapshot.projects ?? [],
    aiEvents: snapshot.aiEvents ?? [],
    skills: snapshot.skills ?? [],
    weeklySummaries: snapshot.weeklySummaries ?? [],
    reports: snapshot.reports ?? [],
  };
}

export function publicationFingerprint(snapshot, skillsCatalog, papersCatalog) {
  return hash({ snapshot: comparableSnapshot(snapshot), skillsCatalog: skillsCatalog ?? {}, papersCatalog: papersCatalog ?? {} });
}

export function buildDailyGate({ date, aiLatest, githubLatest, skillsLatest, skillsReview = null, papersLatest, papersCatalog, errors = [], warnings = [] }) {
  const skillsPublication = evaluateSkillsPublication(skillsLatest, skillsReview);
  const channels = {
    ai: { asOf: aiLatest?.asOf ?? null, status: aiLatest?.run?.status ?? 'missing', schedule: '07:30' },
    github: { asOf: githubLatest?.asOf ?? null, status: githubLatest?.run?.status ?? 'missing', schedule: '07:30' },
    skills: { asOf: skillsLatest?.asOf ?? null, status: skillsLatest?.run?.status ?? 'missing', schedule: '07:40' },
    papers: { asOf: papersLatest?.asOf ?? null, status: papersLatest?.run?.status ?? 'missing', schedule: '07:30' },
  };
  channels.skills.publicationReady = skillsPublication.ready;
  const blockers = [...errors, ...warnings.map((warning) => `warning: ${warning}`), ...aiPublicationBlockers(aiLatest, date), ...skillsPublication.blockers];
  if (papersCatalog?.asOf !== date) blockers.push('Paper catalog is not current');
  for (const [name, channel] of Object.entries(channels)) {
    if (channel.asOf !== date) blockers.push(`${name} asOf is ${channel.asOf ?? 'missing'}, expected ${date}`);
    if (channel.status !== 'success' && !(name === 'skills' && skillsPublication.ready)) blockers.push(`${name} status is ${channel.status}`);
  }
  return { date, ready: blockers.length === 0, channels, blockers: [...new Set(blockers)], notices: skillsPublication.notices };
}

async function writeRun(record) {
  await writeFile(runPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
}

export async function runDailyMainPublish({ write = false, date = shanghaiDate() } = {}) {
  const [aiLatest, githubLatest, skillsLatest, papersLatest, currentCatalog, currentPapersCatalog] = await Promise.all([
    readJson('data/dev/ai-events-latest.json'),
    readJson('data/dev/github-radar-latest.json'),
    readJson('data/dev/skills-radar-latest.json'),
    readJson('data/dev/ai-papers-latest.json'),
    readJson('data/main/skills-catalog.json', {}),
    readJson('data/main/papers-catalog.json', {}),
  ]);
  const prepared = await preparePromotion(root);
  const gate = buildDailyGate({
    date,
    aiLatest,
    githubLatest,
    skillsLatest,
    skillsReview: prepared.skillsReview,
    papersLatest,
    papersCatalog: prepared.papersCatalog,
    errors: prepared.errors,
    warnings: prepared.warnings,
  });
  if (prepared.discoveryReview) gate.discoveryReview = {
    ready: prepared.discoveryReview.ready, counts: prepared.discoveryReview.counts,
    notices: prepared.discoveryReview.notices,
  };
  const checkedAt = new Date().toISOString();

  if (!gate.ready) {
    const result = { checkedAt, status: 'blocked', action: 'none', ...gate };
    await writeRun(result);
    return result;
  }

  const currentFingerprint = publicationFingerprint(prepared.previous, currentCatalog, currentPapersCatalog);
  const previewFingerprint = publicationFingerprint(prepared.snapshot, prepared.skillsCatalog, prepared.papersCatalog);
  if (currentFingerprint === previewFingerprint) {
    const result = { checkedAt, status: 'success', action: 'noop', currentFingerprint, previewFingerprint, ...gate };
    await writeRun(result);
    return result;
  }

  if (!write) {
    const result = { checkedAt, status: 'ready', action: 'publish-required', currentFingerprint, previewFingerprint, ...gate };
    await writeRun(result);
    return result;
  }

  const manifest = await writePromotion(prepared);
  const result = { checkedAt, status: 'success', action: 'published', currentFingerprint, previewFingerprint, manifest, ...gate };
  await writeRun(result);
  return result;
}

const executedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executedDirectly) {
  const write = process.argv.includes('--write');
  runDailyMainPublish({ write }).then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (!result.ready) process.exitCode = 2;
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

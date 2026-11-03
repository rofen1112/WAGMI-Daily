import { readFile, readdir, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { mergeDevSnapshot } from './merge-dev-data.mjs';
import { failedSourceDiagnostics } from './source-diagnostics.mjs';

const root = process.cwd();
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
const json = async (path, fallback = {}) => {
  try { return JSON.parse(await readFile(resolve(root, path), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
};
const main = await json('data/main/index.json');
const override = await json('data/dev/index.json');
const aiLatest = await json('data/dev/ai-events-latest.json');
const githubLatest = await json('data/dev/github-radar-latest.json');
const skillsLatest = await json('data/dev/skills-radar-latest.json');
const weeklyLatest = await json('data/dev/ai-weekly-latest.json');
const creators = await json('ai-creator-watchlist-2026.json');
const models = await json('model-industry-watchlist.json');
const skillsCatalog = await json('data/dev/skills-catalog.json');
const papersCatalog = await json('data/dev/papers-catalog.json');
const trends = await json('data/dev/github-trend-candidates.json');
const merged = mergeDevSnapshot({ main, override, aiLatest, githubLatest, skillsLatest, weeklyLatest,
  candidates: await json('data/dev/candidates.json', []), creators: creators.channels ?? [],
  models: models.models ?? [], dingtalkRun: await json('data/dev/dingtalk-run.json') });
const duplicateKeys = (rows = [], field = 'id') => {
  const seen = new Set(); const duplicates = new Set();
  for (const row of rows) { const key = String(row[field] ?? '').toLowerCase(); if (seen.has(key)) duplicates.add(key); seen.add(key); }
  return [...duplicates];
};
const counts = (snapshot) => Object.fromEntries(['aiEvents','projects','skills','reports','weeklySummaries','modelWatchlist']
  .map((key) => [key, snapshot[key]?.length ?? 0]));
const artifacts = new Set(await readdir(resolve(root, 'reports')));
const registered = new Set((merged.reports ?? []).map((report) => report.path?.split('/').pop()));
const missingFiles = [];
for (const report of merged.reports ?? []) {
  const filename = report.path?.split('/').pop();
  let present = artifacts.has(filename);
  if (!present) for (const path of [filename, 'public/reports/' + filename]) {
    try { await access(resolve(root, path)); present = true; } catch {}
  }
  if (!present) missingFiles.push({ id: report.id, path: report.path });
}
const unregisteredFiles = [...artifacts].filter((name) => /^(ai-events|github-radar|skills-radar)-.*\.md$/.test(name)
  && !registered.has(name));
const dates = [];
for (let time = Date.parse('2026-07-01T00:00:00Z'); time <= Date.parse(date + 'T00:00:00Z'); time += 86400000) dates.push(new Date(time).toISOString().slice(0, 10));
const gaps = Object.fromEntries(['ai-events','github-radar','skills-radar'].map(prefix => [prefix,
  dates.filter(day => !artifacts.has(prefix + '-' + day + '.md'))]));
const eventRows = merged.aiEvents ?? [];
const unboundEvents = eventRows.filter(event => !(merged.reports ?? []).some(report => report.id === event.sourceReportId))
  .map(({ id, sourceReportId }) => ({ id, sourceReportId }));
const recentEvents = Object.fromEntries(dates.slice(-14).map(day => [day,
  eventRows.filter(event => event.date === day).map(({ id, title, sourceReportId }) => ({ id, title, sourceReportId }))]));
const sameDayStatus = (snapshot) => ({ asOf: snapshot.asOf, status: snapshot.run?.status,
  current: snapshot.asOf === date, message: snapshot.run?.message });
const result = {
  schemaVersion: '1.0.0', checkedAt: new Date().toISOString(), runDate: date,
  main: { generatedAt: main.generatedAt, asOf: main.asOf, counts: counts(main) },
  merged: { asOf: merged.asOf, counts: counts(merged) },
  channels: { ai: sameDayStatus(aiLatest), github: sameDayStatus(githubLatest), skills: sameDayStatus(skillsLatest),
    papers: sameDayStatus(await json('data/dev/ai-papers-latest.json')) },
  failedSources: failedSourceDiagnostics([...(trends.sourceStatus ?? []), ...(skillsLatest.sourceStatus ?? []), ...(await json('data/dev/ai-papers-latest.json')).sourceStatus ?? []]),
  duplicates: { events: duplicateKeys(eventRows), projects: duplicateKeys(merged.projects, 'repo'),
    skills: duplicateKeys(skillsCatalog.skills), papers: duplicateKeys(papersCatalog.papers), reports: duplicateKeys(merged.reports) },
  reports: { missingFiles, unregisteredFiles, gaps, unboundEvents }, recentEvents,
  postFrameworkReportGaps: Object.fromEntries(Object.entries(gaps).map(([channel, days]) => [channel, days.filter(day => day >= '2026-07-17')])),
  paperCatalog: { asOf: papersCatalog.asOf, stats: papersCatalog.stats, budgets: papersCatalog.budgets,
    queue: papersCatalog.reviewQueue, requested: papersCatalog.priorityReviewQueue },
  skillCatalog: { asOf: skillsCatalog.asOf, stats: skillsCatalog.stats,
    reviewQueueCount: (await json('data/dev/skills-review-queue.json')).skills?.length },
  weekly: { range: weeklyLatest.range, status: weeklyLatest.run?.status, id: weeklyLatest.id },
  models: { updatedAt: models.updatedAt, count: models.models?.length,
    stale: (models.models ?? []).filter(model => model.reviewedAt < date).map(({ modelId, reviewedAt }) => ({ modelId, reviewedAt })) },
};
const phase = process.argv.find(arg => arg.startsWith('--phase='))?.slice(8) ?? 'latest';
await writeFile(resolve(root, 'data/dev/completeness-audit-' + phase + '.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ ...result, recentEvents: Object.fromEntries(Object.entries(recentEvents).map(([day, rows]) => [day, rows.length])) }, null, 2));

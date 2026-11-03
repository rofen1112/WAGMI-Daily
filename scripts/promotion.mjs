import { access, copyFile, mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { mergeDevSnapshot } from './merge-dev-data.mjs';
import { aiPublicationBlockers } from './ai-source-policy.mjs';
import { evaluateGithubSources, githubReviewBlockers } from './github-source-policy.mjs';
import { validateAiLatest, validateGithubLatest, validatePaperCatalog, validateSkillsLatest, validateSnapshot, validateWeeklyLatest } from './data-contract.mjs';
import { validateModelWatchlist } from './model-watchlist.mjs';
import { evaluateSkillsPublication, readSkillsReview } from './skills-source-policy.mjs';
import { loadAiDiscoveryReview } from './ai-discovery-review.mjs';
import { sanitizePublicReport, toPublicSnapshot } from './public-source-policy.mjs';

async function renameWithRetry(source, destination, attempts = 8) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await rename(source, destination);
      return;
    } catch (error) {
      lastError = error;
      if (!['EPERM', 'EBUSY', 'EACCES'].includes(error?.code) || attempt === attempts) throw error;
      await delay(attempt * 100);
    }
  }
  throw lastError;
}
async function readJson(root, path, fallback = null) {
  try {
    return JSON.parse(await readFile(resolve(root, path), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function findReportSource(root, reportPath) {
  const filename = basename(reportPath);
  const candidates = [
    resolve(root, 'reports', filename),
    resolve(root, filename),
    resolve(root, 'public/reports', filename),
    resolve(root, 'dist/client/reports', filename),
  ];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Continue to the next supported historical location.
    }
  }
  return null;
}

function dateLabel(date) {
  const [, month, day] = date.split('-').map(Number);
  return `${month} 月 ${day} 日`;
}

export function buildPublishedBrief(snapshot) {
  const topProjects = [...snapshot.projects].sort((left, right) => right.starsDelta - left.starsDelta).slice(0, 3);
  const latestDate = [snapshot.asOf.ai, snapshot.asOf.github, snapshot.asOf.skills].filter(Boolean).sort().pop();
  const allLatestEvents = snapshot.aiEvents.filter((event) => event.sourceReportId === `ai-${snapshot.asOf.ai}`);
  const latestEvents = allLatestEvents.slice(0, 2);
  const latestSkills = (snapshot.skills ?? []).filter((skill) => skill.date === snapshot.asOf.skills).sort((left, right) => left.rank - right.rank).slice(0, 1);
  const leadProject = topProjects[0];
  const leadEvent = latestEvents[0];
  const leadSkill = latestSkills[0];

  const actions = [];
  if (leadEvent) {
    actions.push({ id: `action-${leadEvent.id}`, title: `跟进 ${leadEvent.entities?.[0] ?? leadEvent.title}`, reason: leadEvent.action, priority: 'high', channel: 'ai' });
  }
  if (leadProject) {
    actions.push({ id: `action-${leadProject.id}`, title: `复核 ${leadProject.name} 的增长质量`, reason: leadProject.riskNote, priority: 'medium', channel: 'github' });
  }
  if (topProjects[1]) {
    actions.push({ id: `action-${topProjects[1].id}`, title: `继续观察 ${topProjects[1].name}`, reason: topProjects[1].riskNote, priority: 'medium', channel: 'github' });
  }
  if (leadSkill) {
    actions.push({ id: `action-${leadSkill.id}`, title: `评估 Skill：${leadSkill.name}`, reason: leadSkill.descriptionZh, priority: 'medium', channel: 'skills' });
  }

  const githubHighlights = topProjects.map((project) => ({
    id: `highlight-${project.id}-${snapshot.asOf.github}`,
    channel: 'github',
    date: snapshot.asOf.github,
    priority: project === leadProject ? 'high' : 'medium',
    title: `${project.name} 快照新增 ${project.starsDelta.toLocaleString('en-US')} Stars`,
    summary: project.summary,
    action: project.riskNote,
    sourceReportId: project.sourceReportId,
  }));
  const aiHighlights = latestEvents.map((event) => ({
    id: `highlight-${event.id}`,
    channel: 'ai',
    date: snapshot.asOf.ai,
    priority: event.priority === 'A' ? 'high' : 'medium',
    title: event.title,
    summary: event.summary,
    action: event.action,
    sourceReportId: event.sourceReportId,
  }));
  const skillHighlights = latestSkills.map((skill) => ({
    id: `highlight-${skill.id}-${skill.date}`,
    channel: 'skills',
    date: skill.date,
    priority: skill.rank <= 3 ? 'medium' : 'low',
    title: `Skill 24h 趋势 #${skill.rank}：${skill.name}`,
    summary: `${skill.descriptionZh} 过去 24 小时记录 ${skill.trendInstalls ?? skill.heatInstalls} 次安装。`,
    action: `结合“${skill.useCases[0]}”场景评估是否值得纳入团队能力库。`,
    sourceReportId: skill.sourceReportId,
  }));

  return {
    date: latestDate,
    title: `${dateLabel(latestDate)}情报更新`,
    summary: `GitHub Radar、AI 大事件与 Skill 目录已更新到 ${dateLabel(latestDate)}。本期收录 ${allLatestEvents.length} 条高置信 AI 事件；${leadProject ? `${leadProject.name} 以 +${leadProject.starsDelta.toLocaleString('en-US')} Stars 成为项目侧最强增长信号。` : '项目侧没有新的强增长信号。'}${leadSkill ? ` Skill 24 小时趋势首位为 ${leadSkill.name}。` : ''}`,
    actions,
    highlights: [...githubHighlights, ...aiHighlights, ...skillHighlights],
  };
}

export function buildPublishedSnapshot(merged) {
  const schedules = {
    'wagmi-ai': '每天 07:30',
    'wagmi-ai-2': '每周一 07:50',
    'wagmi-github': '每天 07:30',
    'wagmi-skills': '每天 07:40',
  };
  const snapshot = {
    ...merged,
    track: 'main',
    projects: [...merged.projects]
      .map((project) => ({
        ...project,
        verification: String(project.verification).startsWith('related_official') ? 'related_official' : 'verified',
      }))
      .sort((left, right) => right.starsDelta - left.starsDelta),
    aiEvents: [...merged.aiEvents].sort((left, right) => right.date.localeCompare(left.date) || left.priority.localeCompare(right.priority)),
    skills: [...(merged.skills ?? [])].sort((left, right) => right.date.localeCompare(left.date) || left.rank - right.rank),
    runs: merged.runs.map((run) => ({ ...run, schedule: schedules[run.id] ?? run.schedule })),
    reports: [...merged.reports].sort((left, right) => right.date.localeCompare(left.date)),
    candidates: [],
    watchlist: [],
  };
  delete snapshot.localReports;
  delete snapshot.modelWatchlist;
  snapshot.brief = buildPublishedBrief(snapshot);
  return toPublicSnapshot(snapshot);
}

export async function preparePromotion(root = process.cwd()) {
  const main = await readJson(root, 'data/main/index.json');
  const override = await readJson(root, 'data/dev/index.json', {});
  const candidates = await readJson(root, 'data/dev/candidates.json', []);
  const candidateDecisions = await readJson(root, 'data/dev/candidate-decisions.json', []);
  const creatorWatchlist = await readJson(root, 'ai-creator-watchlist-2026.json', { channels: [] });
  const modelWatchlist = await readJson(root, 'model-industry-watchlist.json', { models: [] });
  const aiLatest = await readJson(root, 'data/dev/ai-events-latest.json');
  const githubLatest = await readJson(root, 'data/dev/github-radar-latest.json');
  const githubTrends = await readJson(root, 'data/dev/github-trend-candidates.json');
  const weeklyLatest = await readJson(root, 'data/dev/ai-weekly-latest.json');
  const skillsLatest = await readJson(root, 'data/dev/skills-radar-latest.json');
  const skillsReview = await readSkillsReview(root, skillsLatest);
  const skillsPublication = evaluateSkillsPublication(skillsLatest, skillsReview);
  const skillsCatalog = await readJson(root, 'data/dev/skills-catalog.json');
  const papersCatalog = await readJson(root, 'data/dev/papers-catalog.json');
  const papersLatest = await readJson(root, 'data/dev/ai-papers-latest.json');
  const discoveryReview = aiLatest?.asOf >= '2026-10-29'
    ? await loadAiDiscoveryReview(root, aiLatest.asOf, { events: aiLatest.aiEvents }) : null;
  const errors = [
    ...validateAiLatest(aiLatest),
    ...validateGithubLatest(githubLatest),
    ...validateWeeklyLatest(weeklyLatest),
    ...validateSkillsLatest(skillsLatest),
    ...validatePaperCatalog(papersCatalog),
    ...validateModelWatchlist(modelWatchlist),
  ];

  if (!main) errors.push('data/main/index.json is missing');
  if (!skillsCatalog || !Array.isArray(skillsCatalog.skills)) errors.push('data/dev/skills-catalog.json is missing or invalid');
  if (!papersCatalog || !Array.isArray(papersCatalog.papers)) errors.push('data/dev/papers-catalog.json is missing or invalid');
  if (skillsCatalog && skillsLatest?.catalog?.totalSkills !== skillsCatalog.skills?.length) errors.push('Skill catalog count differs from latest run');
  const merged = main ? mergeDevSnapshot({
    main,
    override,
    candidates,
    candidateDecisions,
    creators: creatorWatchlist.channels ?? [],
    models: modelWatchlist.models ?? [],
    aiLatest,
    githubLatest,
    githubTrends,
    weeklyLatest,
    skillsLatest,
  }) : null;
  if (merged) errors.push(...validateSnapshot(merged));

  const warnings = [...aiPublicationBlockers(aiLatest, aiLatest?.asOf)];
  warnings.push(...(discoveryReview?.blockers ?? []));
  warnings.push(...evaluateGithubSources(githubTrends, aiLatest?.asOf).blockers);
  warnings.push(...githubReviewBlockers(githubTrends, githubLatest));
  warnings.push(...skillsPublication.blockers);
  if (papersLatest?.asOf !== aiLatest?.asOf || papersLatest?.run?.status !== 'success') warnings.push('Paper discovery run is stale or not successful');
  if (aiLatest?.asOf !== githubLatest?.asOf) warnings.push(`AI asOf ${aiLatest?.asOf ?? 'missing'} differs from GitHub asOf ${githubLatest?.asOf ?? 'missing'}`);
  if (/上游.*缺失|upstream.*missing/i.test(githubLatest?.run?.message ?? '')) warnings.push('GitHub run reports that the upstream AI snapshot was unavailable');
  if (githubLatest?.run?.status !== 'success') warnings.push(`GitHub run status is ${githubLatest?.run?.status ?? 'missing'}`);
  if (aiLatest?.run?.status !== 'success') warnings.push(`AI run status is ${aiLatest?.run?.status ?? 'missing'}`);
  if (papersCatalog?.asOf !== aiLatest?.asOf) warnings.push(`Paper catalog asOf ${papersCatalog?.asOf ?? 'missing'} differs from AI asOf ${aiLatest?.asOf ?? 'missing'}`);

  const snapshot = merged ? buildPublishedSnapshot(merged) : null;
  if (snapshot) errors.push(...validateSnapshot(snapshot));
  for (const report of snapshot?.reports ?? []) {
    const sourcePath = await findReportSource(root, report.path);
    if (!sourcePath) warnings.push(`Report source is missing: ${report.path}`);
  }

  return { root, snapshot, skillsCatalog, papersCatalog, skillsReview, discoveryReview, previous: main, errors: [...new Set(errors)], warnings: [...new Set(warnings)], notices: [...skillsPublication.notices, ...(discoveryReview?.notices ?? [])] };
}

export async function writePromotion(prepared) {
  if (prepared.errors.length || prepared.warnings.length) throw new Error(`Cannot publish with ${prepared.errors.length} validation error(s) and ${prepared.warnings.length} warning(s)`);
  const aiDate = prepared.snapshot?.asOf?.ai;
  if (aiDate >= '2026-10-29') {
    const review = await loadAiDiscoveryReview(prepared.root, aiDate, {
      events: prepared.snapshot.aiEvents.filter(event => event.sourceReportId === `ai-${aiDate}`),
      allEvents: prepared.snapshot.aiEvents,
    });
    if (!review.ready) throw new Error('Cannot publish before candidate discovery review: ' + review.blockers.join('; '));
  }
  const snapshot = toPublicSnapshot(prepared.snapshot);
  const now = new Date().toISOString();
  const safeTimestamp = now.replace(/[:.]/g, '-');
  const backupPath = resolve(prepared.root, `data/dev/backups/main-${safeTimestamp}.json`);
  const mainPath = resolve(prepared.root, 'data/main/index.json');
  const temporaryPath = `${mainPath}.tmp`;
  const previewPath = resolve(prepared.root, 'data/dev/publish-preview.json');
  const manifestPath = resolve(prepared.root, 'data/dev/publish-manifest.json');

  await mkdir(dirname(backupPath), { recursive: true });
  await writeFile(backupPath, `${JSON.stringify(prepared.previous, null, 2)}\n`, 'utf8');
  await writeFile(previewPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await renameWithRetry(temporaryPath, mainPath);
  const catalogMainPath = resolve(prepared.root, 'data/main/skills-catalog.json');
  const catalogTemporaryPath = `${catalogMainPath}.tmp`;
  await writeFile(catalogTemporaryPath, `${JSON.stringify(toPublicSnapshot(prepared.skillsCatalog))}\n`, 'utf8');
  await renameWithRetry(catalogTemporaryPath, catalogMainPath);
  const mainMirrors = [
    resolve(prepared.root, 'public/data/main/index.json'),
    resolve(prepared.root, 'dist/client/data/main/index.json'),
  ];
  for (const mirror of mainMirrors) {
    await mkdir(dirname(mirror), { recursive: true });
    await copyFile(mainPath, mirror);
  }
  for (const mirror of [resolve(prepared.root, 'public/data/main/skills-catalog.json'), resolve(prepared.root, 'dist/client/data/main/skills-catalog.json')]) {
    await mkdir(dirname(mirror), { recursive: true });
    await copyFile(catalogMainPath, mirror);
  }
  const papersCatalogMainPath = resolve(prepared.root, 'data/main/papers-catalog.json');
  const papersCatalogTemporaryPath = `${papersCatalogMainPath}.tmp`;
  await writeFile(papersCatalogTemporaryPath, `${JSON.stringify(toPublicSnapshot(prepared.papersCatalog))}\n`, 'utf8');
  await renameWithRetry(papersCatalogTemporaryPath, papersCatalogMainPath);
  for (const mirror of [resolve(prepared.root, 'public/data/main/papers-catalog.json'), resolve(prepared.root, 'dist/client/data/main/papers-catalog.json')]) {
    await mkdir(dirname(mirror), { recursive: true });
    await copyFile(papersCatalogMainPath, mirror);
  }

  const reportFiles = new Set(snapshot.reports.map(report => basename(report.path)));
  for (const directory of ['public/reports', 'dist/client/reports']) {
    try {
      for (const entry of await readdir(resolve(prepared.root, directory), { withFileTypes: true })) {
        if (entry.isFile() && /\.(?:md|html)$/i.test(entry.name)) reportFiles.add(entry.name);
      }
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const filename of reportFiles) {
    const source = await findReportSource(prepared.root, filename);
    if (source) {
      const text = /\.(?:md|html)$/i.test(filename) ? sanitizePublicReport(await readFile(source, 'utf8')) : null;
      for (const destination of [resolve(prepared.root, 'public/reports', filename), resolve(prepared.root, 'dist/client/reports', filename)]) {
        await mkdir(dirname(destination), { recursive: true });
        if (text === null) await copyFile(source, destination);
        else await writeFile(destination, text, 'utf8');
      }
    }
  }

  const manifest = {
    schemaVersion: '1.0.0',
    publishedAt: now,
    from: { generatedAt: prepared.previous.generatedAt, asOf: prepared.previous.asOf },
    to: { generatedAt: snapshot.generatedAt, asOf: snapshot.asOf },
    counts: {
      projects: snapshot.projects.length,
      aiEvents: snapshot.aiEvents.length,
      skills: snapshot.skills.length,
      reports: snapshot.reports.length,
      weeklySummaries: snapshot.weeklySummaries?.length ?? 0,
      papers: prepared.papersCatalog?.papers?.length ?? 0,
    },
    warnings: prepared.warnings,
    notices: prepared.notices ?? [],
    backupPath,
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return manifest;
}

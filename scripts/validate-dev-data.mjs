import { evaluateGithubSources } from './github-source-policy.mjs';
import { readFile } from 'node:fs/promises';
import { mergeDevSnapshot } from './merge-dev-data.mjs';
import { validateAiLatest, validateGithubLatest, validatePaperCatalog, validatePaperSnapshot, validateSkillsLatest, validateSnapshot, validateWeeklyLatest } from './data-contract.mjs';
import { validateTrendSnapshot } from './discover-github-trends.mjs';
import { validateModelWatchlist } from './model-watchlist.mjs';
import { loadAiDiscoveryReview } from './ai-discovery-review.mjs';

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

const main = await readJson('data/main/index.json');
const override = await readJson('data/dev/index.json', {});
const candidates = await readJson('data/dev/candidates.json', []);
const creatorWatchlist = await readJson('ai-creator-watchlist-2026.json', { channels: [] });
const modelWatchlist = await readJson('model-industry-watchlist.json', { models: [] });
const aiLatest = await readJson('data/dev/ai-events-latest.json');
const githubLatest = await readJson('data/dev/github-radar-latest.json');
const githubTrends = await readJson('data/dev/github-trend-candidates.json');
const weeklyLatest = await readJson('data/dev/ai-weekly-latest.json');
const dingtalkRun = await readJson('data/dev/dingtalk-run.json');
const skillsLatest = await readJson('data/dev/skills-radar-latest.json');
const papersLatest = await readJson('data/dev/ai-papers-latest.json');
const papersCatalog = await readJson('data/dev/papers-catalog.json');

const errors = [
  ...validateAiLatest(aiLatest),
  ...validateGithubLatest(githubLatest),
  ...validateWeeklyLatest(weeklyLatest),
  ...validateSkillsLatest(skillsLatest),
  ...validatePaperSnapshot(papersLatest),
  ...validatePaperCatalog(papersCatalog),
  ...(githubTrends ? validateTrendSnapshot(githubTrends) : []),
  ...validateModelWatchlist(modelWatchlist),
];
if (aiLatest?.asOf >= '2026-10-29') {
  const discoveryReview = await loadAiDiscoveryReview(process.cwd(), aiLatest.asOf, {
    events: aiLatest.aiEvents, allEvents: [...(main?.aiEvents ?? []), ...(override?.aiEvents ?? []), ...(aiLatest.aiEvents ?? [])],
  });
  errors.push(...discoveryReview.blockers);
  for (const notice of discoveryReview.notices) console.log('Discovery notice: ' + notice);
}

if (main && aiLatest && githubLatest) {
  const merged = mergeDevSnapshot({
    main,
    override,
    candidates,
    creators: creatorWatchlist.channels ?? [],
    models: modelWatchlist.models ?? [],
    aiLatest,
    githubLatest,
    weeklyLatest,
    dingtalkRun,
    skillsLatest,
  });
  errors.push(...validateSnapshot(merged));
}

const warnings = [];
if (aiLatest?.asOf !== githubLatest?.asOf) warnings.push(`AI asOf ${aiLatest?.asOf ?? 'missing'} differs from GitHub asOf ${githubLatest?.asOf ?? 'missing'}`);
if (/上游.*缺失|upstream.*missing/i.test(githubLatest?.run?.message ?? '')) warnings.push('GitHub run reports that the upstream AI snapshot was unavailable');
const githubSourcePolicy = evaluateGithubSources(githubTrends, aiLatest?.asOf);
warnings.push(...githubSourcePolicy.blockers);
for (const notice of githubSourcePolicy.notices) console.log('Source notice (optional): ' + notice.id + ' / ' + notice.status);

if (errors.length) {
  console.error('Dev data validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Dev data validation passed: ${aiLatest.aiEvents.length} new AI events, ${githubLatest.projects.length} tracked projects, ${skillsLatest.skills.length} ranked skills, ${papersCatalog?.papers?.length ?? 0} cataloged papers, ${githubTrends?.candidates?.length ?? 0} trend candidates.`);
warnings.forEach((warning) => console.warn(`Warning: ${warning}`));

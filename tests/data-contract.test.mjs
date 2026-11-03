import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateAiLatest, validateGithubLatest, validatePaperCatalog, validatePaperSnapshot, validateSkillsLatest, validateSnapshot, validateWeeklyLatest } from '../scripts/data-contract.mjs';

const snapshot = JSON.parse(await readFile(new URL('../data/main/index.json', import.meta.url), 'utf8'));
const paperCatalog = JSON.parse(await readFile(new URL('../data/dev/papers-catalog.json', import.meta.url), 'utf8'));

test('main snapshot satisfies the data contract', () => {
  assert.deepEqual(validateSnapshot(snapshot), []);
});

test('paper catalog satisfies the cumulative data contract', () => {
  assert.deepEqual(validatePaperCatalog(paperCatalog), []);
  assert.ok(paperCatalog.papers.length >= 60);
  assert.ok(paperCatalog.reviewQueue.length <= paperCatalog.budgets.deepRead);
  assert.ok(paperCatalog.dailyRecommendations.length <= 3);
});

test('main snapshot contains only verified or related-official repositories', () => {
  assert.ok(snapshot.projects.length > 0);
  assert.ok(snapshot.projects.every((project) => ['verified', 'related_official'].includes(project.verification)));
  assert.ok(snapshot.projects.every((project) => !project.url.includes('example.com')));
});

test('every published event and project resolves to a report', () => {
  const reportIds = new Set(snapshot.reports.map((report) => report.id));
  assert.ok(snapshot.projects.every((project) => reportIds.has(project.sourceReportId)));
  assert.ok(snapshot.aiEvents.every((event) => reportIds.has(event.sourceReportId)));
  assert.ok(snapshot.skills.every((skill) => reportIds.has(skill.sourceReportId)));
});

test('channel data contracts accept valid automation payloads', () => {
  const aiReport = { id: 'ai-2026-07-16', title: 'AI', date: '2026-07-16', channel: 'ai', format: 'markdown', path: '/reports/ai-events-2026-07-16.md' };
  const githubReport = { id: 'github-2026-07-16', title: 'GitHub', date: '2026-07-16', channel: 'github', format: 'markdown', path: '/reports/github-radar-2026-07-16.md' };
  const skillsReport = { id: 'skills-2026-07-16', title: 'Skills', date: '2026-07-16', channel: 'skills', format: 'markdown', path: '/reports/skills-radar-2026-07-16.md' };
  assert.deepEqual(validateAiLatest({
    schemaVersion: '1.0.0', generatedAt: '2026-07-16T07:30:00+08:00', asOf: '2026-07-16',
    aiEvents: [{
      id: 'event-1', date: '2026-07-16', title: '模型发布新版本', summary: '官方发布了新的模型版本。',
      whyItMatters: '这会影响后续产品评测。', action: '重新运行评测并记录版本。',
      sources: [{ label: 'Official', url: 'https://example.org' }], sourceReportId: aiReport.id,
    }],
    candidates: [], run: { id: 'wagmi-ai', channel: 'ai', status: 'success', schedule: '每天 07:30' }, report: aiReport,
  }), []);
  assert.deepEqual(validateGithubLatest({
    schemaVersion: '1.0.0', generatedAt: '2026-07-16T07:50:00+08:00', asOf: '2026-07-16',
    projects: [{ id: 'repo-1', repo: 'owner/repo', url: 'https://github.com/owner/repo', sourceReportId: githubReport.id }],
    candidates: [], run: { id: 'wagmi-github', channel: 'github', status: 'success', schedule: '每天 07:30' }, report: githubReport,
  }), []);
  assert.deepEqual(validateSkillsLatest({
    schemaVersion: '1.0.0', generatedAt: '2026-07-16T07:40:00+08:00', asOf: '2026-07-16',
    view: 'trending', catalog: { totalSkills: 100, officialSkills: 20 },
    skills: [{ id: 'owner/skills/browser', date: '2026-07-16', rank: 1, url: 'https://skills.sh/owner/skills/browser', descriptionZh: '浏览器自动化技能。', useCases: ['抓取网页内容', '执行表单操作'], sourceReportId: skillsReport.id }],
    candidates: [], run: { id: 'wagmi-skills', channel: 'skills', status: 'success', schedule: '每天 07:40' }, report: skillsReport,
  }), []);
  assert.deepEqual(validateWeeklyLatest(null), []);
});

test('AI events reject fully English reader-facing content', () => {
  const report = { id: 'ai-2026-07-16', title: 'AI', date: '2026-07-16', channel: 'ai', format: 'markdown', path: '/reports/ai-events-2026-07-16.md' };
  const errors = validateAiLatest({
    schemaVersion: '1.0.0', generatedAt: '2026-07-16T07:30:00+08:00', asOf: '2026-07-16',
    aiEvents: [{
      id: 'event-english', date: '2026-07-16', title: 'A new model launched', summary: 'The model is now available.',
      whyItMatters: 'It changes the market.', action: 'Run the benchmark.',
      sources: [{ label: 'Official', url: 'https://example.org' }], sourceReportId: report.id,
    }],
    candidates: [], run: { id: 'wagmi-ai', channel: 'ai', status: 'success', schedule: '每天 07:30' }, report,
  });
  assert.equal(errors.filter((error) => error.includes('must contain Chinese text')).length, 4);
});

test('GitHub latest rejects duplicate project ids and repository paths', () => {
  const report = { id: 'github-2026-07-16', title: 'GitHub', date: '2026-07-16', channel: 'github', format: 'markdown', path: '/reports/github-radar-2026-07-16.md' };
  const errors = validateGithubLatest({
    schemaVersion: '1.0.0', generatedAt: '2026-07-16T07:50:00+08:00', asOf: '2026-07-16',
    projects: [
      { id: 'repo-1', repo: 'owner/repo', url: 'https://github.com/owner/repo', sourceReportId: report.id },
      { id: 'repo-1', repo: 'owner/renamed', url: 'https://github.com/owner/renamed', sourceReportId: report.id },
      { id: 'repo-2', repo: 'OWNER/REPO', url: 'https://github.com/OWNER/REPO', sourceReportId: report.id },
    ],
    candidates: [], run: { id: 'wagmi-github', channel: 'github', status: 'success', schedule: '每天 07:30' }, report,
  });

  assert.ok(errors.includes('github latest contains duplicate project id repo-1'));
  assert.ok(errors.includes('github latest contains duplicate repo OWNER/REPO'));
});

test('AI daily report identity must match its collection date', () => {
  const report = { id: 'ai-2026-07-15', title: 'AI', date: '2026-07-15', channel: 'ai', format: 'markdown', path: '/reports/ai-events-2026-07-15.md' };
  const errors = validateAiLatest({
    schemaVersion: '1.0.0', generatedAt: '2026-07-16T07:30:00+08:00', asOf: '2026-07-16',
    aiEvents: [{
      id: 'event-1', date: '2026-07-15', title: '模型发布新版本', summary: '官方发布了新的模型版本。',
      whyItMatters: '这会影响后续产品评测。', action: '重新运行评测并记录版本。',
      sources: [{ label: 'Official', url: 'https://example.org' }], sourceReportId: report.id,
    }],
    candidates: [], run: { id: 'wagmi-ai', channel: 'ai', status: 'success', schedule: '每天 07:30' }, report,
  });
  assert.ok(errors.includes('ai latest report id must match asOf'));
  assert.ok(errors.includes('ai latest report date must match asOf'));
});

test('paper events require structured source metadata', () => {
  const report = { id: 'ai-2026-08-05', title: 'AI', date: '2026-08-05', channel: 'ai', format: 'markdown', path: '/reports/ai-events-2026-08-05.md' };
  const base = {
    schemaVersion: '1.0.0', generatedAt: '2026-08-05T07:30:00+08:00', asOf: '2026-08-05', candidates: [],
    run: { id: 'wagmi-ai', channel: 'ai', status: 'success', schedule: '每天 07:30' }, report,
  };
  const event = {
    id: 'paper-1', date: '2026-08-05', title: '多智能体生成可编辑粒子特效', summary: '论文提出可编辑的结构化粒子生成方法。',
    whyItMatters: '它把生成结果推进到可编辑的生产资产。', action: '复测可编辑性与迭代稳定性。',
    boards: ['Frontier Paper / Research', 'AI 3D / World Models'], sources: [{ label: 'arXiv', url: 'https://arxiv.org/abs/2608.00629' }],
    sourceReportId: report.id, contentKind: 'paper', paper: {
      titleOriginal: 'ParticleGen: A Multi-Agent System for Particle Effects Generation', authors: ['Junhao Zhuge'],
      publishedAt: '2026-08-01T12:38:25Z', venue: 'arXiv · cs.GR', paperUrl: 'https://arxiv.org/abs/2608.00629', readingLevel: 'abstract',
    },
  };
  assert.deepEqual(validateAiLatest({ ...base, aiEvents: [event] }), []);
  const errors = validateAiLatest({ ...base, aiEvents: [{ ...event, paper: { ...event.paper, authors: [] } }] });
  assert.ok(errors.some((error) => error.includes('paper authors are missing')));
});

test('paper discovery snapshot keeps deep reads inside its budget', () => {
  const payload = {
    schemaVersion: '1.0.0', generatedAt: '2026-08-05T07:30:00+08:00', asOf: '2026-08-05', budgets: { deepRead: 1 },
    candidates: [{
      id: 'arxiv-2608-00629', titleOriginal: 'ParticleGen', abstract: 'Structured particle generation.', authors: ['Junhao Zhuge'],
      url: 'https://arxiv.org/abs/2608.00629', score: 42, reviewTier: 'deep', targetBoards: ['Frontier Paper / Research'],
    }],
    deepReadQueue: ['arxiv-2608-00629'], run: { id: 'wagmi-ai-papers', channel: 'ai', status: 'success' },
  };
  assert.deepEqual(validatePaperSnapshot(payload), []);
  assert.ok(validatePaperSnapshot({ ...payload, deepReadQueue: ['missing-paper'] }).some((error) => error.includes('missing from candidates')));
});

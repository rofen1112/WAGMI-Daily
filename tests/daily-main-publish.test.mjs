import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDailyGate, publicationFingerprint } from '../scripts/daily-main-publish.mjs';
import { historicalSkillsFixture, reviewedAiFixture } from './fixtures/skills-source-policy.mjs';

const success = (date) => ({ asOf: date, run: { status: 'success' } });

test('a dated historical Skill review does not freeze all current channels', () => {
  const date = '2026-10-26';
  const input = { date, aiLatest: reviewedAiFixture(date), githubLatest: success(date), papersLatest: success(date), papersCatalog: { asOf: date }, ...historicalSkillsFixture(date) };
  const gate = buildDailyGate(input);
  assert.equal(gate.ready, true);
  assert.equal(gate.channels.skills.status, 'warning');
  assert.equal(gate.channels.skills.publicationReady, true);
  assert.equal(gate.notices.length, 1);
  assert.equal(buildDailyGate({ ...input, date: '2026-10-27' }).ready, false);
  assert.equal(buildDailyGate({ ...input, errors: ['Invalid current event'] }).ready, false);
  assert.equal(buildDailyGate({ ...input, warnings: ['Other verification missing'] }).ready, false);
});

test('daily automatic publication requires every channel to be current and successful', () => {
  const gate = buildDailyGate({
    date: '2026-07-19',
    aiLatest: success('2026-07-19'),
    githubLatest: success('2026-07-19'),
    skillsLatest: success('2026-07-19'),
    papersLatest: success('2026-07-19'),
    papersCatalog: { asOf: '2026-07-19', papers: [{ id: 'paper-1' }] },
  });
  assert.equal(gate.ready, true);

  const stale = buildDailyGate({
    date: '2026-07-19',
    aiLatest: success('2026-07-19'),
    githubLatest: success('2026-07-18'),
    skillsLatest: { asOf: '2026-07-19', run: { status: 'warning' } },
    papersLatest: success('2026-07-19'),
    papersCatalog: { asOf: '2026-07-19', papers: [{ id: 'paper-1' }] },
  });
  assert.equal(stale.ready, false);
  assert.ok(stale.blockers.some((item) => item.includes('github asOf')));
  assert.ok(stale.blockers.some((item) => item.includes('skills status')));
});

test('a nonempty paper catalog cannot hide failed paper discovery', () => {
  const gate=buildDailyGate({date:'2026-07-19',aiLatest:success('2026-07-19'),githubLatest:success('2026-07-19'),skillsLatest:success('2026-07-19'),papersLatest:{asOf:'2026-07-19',run:{status:'failed'}},papersCatalog:{asOf:'2026-07-19',papers:[{id:'old'}]}});
  assert.equal(gate.ready,false);
  assert.equal(gate.channels.papers.status,'failed');
});

test('publication comparison ignores collection timestamps but detects content changes', () => {
  const base = { schemaVersion: '1.0.0', track: 'main', generatedAt: 'old', asOf: { ai: '2026-07-19' }, projects: [{ id: 'one' }], aiEvents: [], skills: [], reports: [], runs: [{ lastSuccess: 'old' }] };
  const refreshed = { ...base, generatedAt: 'new', runs: [{ lastSuccess: 'new' }] };
  assert.equal(publicationFingerprint(base, { skills: [] }), publicationFingerprint(refreshed, { skills: [] }));
  assert.notEqual(publicationFingerprint(base, { skills: [] }), publicationFingerprint({ ...refreshed, projects: [{ id: 'two' }] }, { skills: [] }));
  assert.notEqual(publicationFingerprint(base, { skills: [] }, { papers: [{ id: 'one' }] }), publicationFingerprint(base, { skills: [] }, { papers: [{ id: 'two' }] }));
});

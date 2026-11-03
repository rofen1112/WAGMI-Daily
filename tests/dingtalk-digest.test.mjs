import assert from 'node:assert/strict';
import test from 'node:test';
import { historicalSkillsFixture, reviewedAiFixture } from './fixtures/skills-source-policy.mjs';
import {
  buildDigest,
  buildFreshness,
  buildPublicationState,
  buildSignedWebhook,
  decideSendAction,
  isDingtalkSuppressed,
  normalizePublicUrl,
} from '../scripts/send-dingtalk-digest.mjs';

test('digest readiness uses the publication policy and discloses historical Skill notices', () => {
  const date = '2026-10-26';
  const input = { date, aiLatest: reviewedAiFixture(date), githubLatest: { asOf: date, run: { status: 'success' } }, ...historicalSkillsFixture(date) };
  const freshness = buildFreshness(input);
  assert.equal(freshness.ready, true);
  assert.equal(freshness.skills.runStatus, 'warning');
  assert.match(freshness.skills.display, /历史目录待核验/);
  assert.equal(buildFreshness({ ...input, skillsReview: null }).ready, false);
});

test('a user-requested no-send day does not suppress the next daily batch', () => {
  const control = { suppressedDates: [{ date: '2026-09-15', reason: 'Too late' }] };
  assert.equal(isDingtalkSuppressed(control, '2026-09-15'), true);
  assert.equal(isDingtalkSuppressed(control, '2026-09-16'), false);
  assert.equal(isDingtalkSuppressed({}, '2026-09-15'), false);
});

test('DingTalk webhook signing adds timestamp and signature without losing the token', () => {
  const url = new URL(buildSignedWebhook('https://oapi.dingtalk.com/robot/send?access_token=test-token', 'SECtest-secret', 1_700_000_000_000));
  assert.equal(url.hostname, 'oapi.dingtalk.com');
  assert.equal(url.searchParams.get('access_token'), 'test-token');
  assert.equal(url.searchParams.get('timestamp'), '1700000000000');
  assert.ok(url.searchParams.get('sign')?.length > 20);
});

test('daily digest puts the report link first and keeps hot items title-only', () => {
  const events = Array.from({ length: 7 }, (_, index) => ({ title: `Event ${index}`, summary: 'Summary must not appear in DingTalk', priority: 'A', sourceReportId: 'ai-2026-07-16' }));
  const projects = Array.from({ length: 7 }, (_, index) => ({ repo: `owner/repo-${index}`, starsDelta: index, summary: 'Tracked project' }));
  const digest = buildDigest({
    date: '2026-07-16',
    aiLatest: { asOf: '2026-07-16', aiEvents: events, run: { status: 'success' } },
    githubLatest: { asOf: '2026-07-16', projects, run: { status: 'success' } },
    skillsLatest: { asOf: '2026-07-16', run: { status: 'success' } },
    main: { aiEvents: [{ title: 'Old event', sourceReportId: 'ai-2026-07-15' }], projects: [] },
    publicUrl: 'https://daily.example.com',
  });
  assert.deepEqual(digest.counts, { aiEvents: 7, projects: 7, hotItems: 3 });
  assert.match(digest.text, /Event 0/);
  assert.doesNotMatch(digest.text, /Event 3/);
  assert.doesNotMatch(digest.text, /owner\/repo-6/);
  assert.doesNotMatch(digest.text, /Summary must not appear in DingTalk/);
  assert.match(digest.text, /数据检查/);
  assert.match(digest.text, /https:\/\/daily\.example\.com\/#\/today/);
  const lines = digest.text.split('\n');
  assert.match(lines[1], /^### \[打开今日完整日报 →\]/);
  assert.ok(digest.text.indexOf('打开今日完整日报') < digest.text.indexOf('今日 AI 热点'));
  assert.ok(digest.text.indexOf('打开今日完整日报') < digest.text.indexOf('#### 今日热点'));
});

test('freshness requires both the current date and a successful run', () => {
  const freshness = buildFreshness({
    date: '2026-07-17',
    aiLatest: { asOf: '2026-07-17', run: { status: 'success' } },
    githubLatest: { asOf: '2026-07-17', run: { status: 'warning' } },
    skillsLatest: { asOf: '2026-07-17', run: { status: 'success' } },
  });
  assert.equal(freshness.ai.fresh, true);
  assert.equal(freshness.github.fresh, false);
  assert.equal(freshness.skills.fresh, true);
  assert.equal(freshness.ready, false);
});

test('publication state requires every public channel to match the digest date', () => {
  assert.equal(buildPublicationState({
    date: '2026-09-10',
    main: {
      track: 'main',
      generatedAt: '2026-09-10T01:12:00.000Z',
      asOf: { ai: '2026-09-10', github: '2026-09-10', skills: '2026-09-10' },
    },
  }).ready, true);

  const stale = buildPublicationState({
    date: '2026-09-10',
    main: {
      track: 'main',
      generatedAt: '2026-09-09T01:12:00.000Z',
      asOf: { ai: '2026-09-09', github: '2026-09-09', skills: '2026-09-09' },
    },
  });
  assert.equal(stale.ready, false);
  assert.deepEqual(stale.staleChannels, ['ai', 'github', 'skills']);
});

test('digest uses an editorial observation when no item meets the hot threshold', () => {
  const digest = buildDigest({
    date: '2026-07-17',
    aiLatest: { asOf: '2026-07-17', aiEvents: [], run: { status: 'success' } },
    githubLatest: {
      asOf: '2026-07-17',
      projects: [{ repo: 'owner/quiet', starsDelta: 2, summary: 'No material movement' }],
      run: { status: 'success' },
    },
    skillsLatest: { asOf: '2026-07-17', run: { status: 'success' } },
    publicUrl: 'https://daily.example.com',
  });
  assert.equal(digest.counts.hotItems, 0);
  assert.match(digest.text, /今日观察/);
  assert.match(digest.text, /不为凑数/);
});

test('public URL must be an external HTTPS address', () => {
  assert.equal(normalizePublicUrl('https://daily.example.com/'), 'https://daily.example.com');
  assert.throws(() => normalizePublicUrl('http://127.0.0.1:8080'), /HTTPS/);
  assert.throws(() => normalizePublicUrl('https://localhost:8080'), /outside/);
});

test('same-day changed content requires supplement mode and unchanged content is skipped', () => {
  const existing = { date: '2026-07-17', digestHash: 'old' };
  assert.equal(decideSendAction({ existing, date: '2026-07-17', digestHash: 'old', supplement: true }), 'skip');
  assert.equal(decideSendAction({ existing, date: '2026-07-17', digestHash: 'new' }), 'needs-supplement');
  assert.equal(decideSendAction({ existing, date: '2026-07-17', digestHash: 'new', supplement: true }), 'supplement');
  assert.equal(decideSendAction({ existing: null, date: '2026-07-17', digestHash: 'new', supplement: true }), 'initial');
});

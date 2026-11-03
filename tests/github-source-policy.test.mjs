import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateGithubSources, githubReviewBlockers } from '../scripts/github-source-policy.mjs';

const snapshot = () => ({ asOf: '2026-10-14', candidates: [], sourceStatus: [
  ['github-trending-24h-all', '/trending?since=daily'],
  ['github-trending-24h-python', '/trending/python?since=daily'],
  ['github-trending-24h-typescript', '/trending/typescript?since=daily'],
  ['github-trending-weekly-all', '/trending?since=weekly'],
].map(([id, path]) => ({ id, status: 'success', count: 5, url: 'https://github.com' + path })) });

test('official daily and weekly trends allow an unavailable auxiliary OSS source', () => {
  const data = snapshot();
  data.sourceStatus.push({ id: 'ossinsight-24h-all', status: 'unavailable', error: 'event capture incomplete' });
  const result = evaluateGithubSources(data, data.asOf);
  assert.equal(result.ready, true);
  assert.equal(result.notices[0].status, 'unavailable');
  assert.equal(result.primarySource.id, 'github-trending-24h-all');
});

test('a successful auxiliary OSS source cannot hide missing official trends', () => {
  const data = snapshot();
  data.sourceStatus = data.sourceStatus.filter(row => row.id !== 'github-trending-24h-all');
  data.sourceStatus.push({ id: 'ossinsight-24h-all', status: 'success', count: 20 });
  assert.equal(evaluateGithubSources(data).ready, false);
});

test('stale, empty, failed, or nonofficial primary results still block', () => {
  for (const patch of [{ status: 'failed' }, { count: 0 }, { url: 'https://example.com/trending?since=daily' }]) {
    const data = snapshot(); Object.assign(data.sourceStatus[0], patch);
    assert.equal(evaluateGithubSources(data).ready, false);
  }
  assert.equal(evaluateGithubSources(snapshot(), '2026-10-15').ready, false);
});

test('required search failures block, and old nested OSS diagnostics remain advisory', () => {
  const data = snapshot();
  data.sourceStatus[0].upstream = { id: 'ossinsight-24h-all', status: 'unavailable' };
  assert.equal(evaluateGithubSources(data).notices.length, 1);
  data.sourceStatus.push({ id: 'github-ai-active', status: 'failed' });
  assert.equal(evaluateGithubSources(data).ready, false);
});

test('success labels and coverage counts cannot replace exact mandatory repository evidence', () => {
  const trends = snapshot();
  trends.candidates = [{ repo: 'lab/tool', hotLevel: 'hot' }, { repo: 'lab/forced', forcedByAI: true }];
  const proof = repo => ({ repo, accessible: true, readmeVerified: true, commitsVerified: true,
    issuesVerified: true, pullRequestsVerified: true, releasesVerified: true });
  const latest = { asOf: trends.asOf, run: { status: 'success' },
    verificationSummary: { mandatoryReviewed: [proof('lab/tool'), proof('lab/forced')] } };
  assert.deepEqual(githubReviewBlockers(trends, latest), []);
  latest.verificationSummary.mandatoryReviewed[1].issuesVerified = false;
  assert.match(githubReviewBlockers(trends, latest)[0], /lab\/forced/);
  latest.verificationSummary.mandatoryReviewed = [];
  assert.equal(githubReviewBlockers(trends, latest).length, 2);
  assert.ok(githubReviewBlockers(trends, { asOf: trends.asOf }).length);
});

test('tracked refresh failures and stale review batches remain blocking', () => {
  assert.ok(githubReviewBlockers(snapshot(), { asOf: '2026-10-13',
    verificationSummary: { mandatoryReviewed: [] } }).length);
  assert.ok(githubReviewBlockers(snapshot(), { asOf: '2026-10-14',
    run: { refreshSummary: { failures: 1 } }, verificationSummary: { mandatoryReviewed: [] } }).length);
});

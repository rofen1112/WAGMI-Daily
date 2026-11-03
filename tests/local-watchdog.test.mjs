import assert from 'node:assert/strict';
import test from 'node:test';
import { buildHealthPayload, checkEndpoint, comparePublicSnapshot, evaluateDataFreshness, shanghaiClock, summarizeHealth, updateEndpointHistory } from '../scripts/local-watchdog.mjs';

test('history-only Skill notices require an explicit publication assessment and current dates', () => {
  const input = { today: '2026-10-26', minutes: 12 * 60, main: { asOf: { ai: '2026-10-26', github: '2026-10-26', skills: '2026-10-26' } }, devChannels: { skills: { asOf: '2026-10-26', status: 'warning', publicationReady: true } } };
  assert.equal(evaluateDataFreshness(input).healthy, true);
  input.devChannels.skills.publicationReady = false;
  assert.equal(evaluateDataFreshness(input).healthy, false);
  input.devChannels.skills.publicationReady = true;
  input.devChannels.skills.asOf = '2026-10-25';
  assert.equal(evaluateDataFreshness(input).healthy, false);
});

test('cloud request failures stay non-recoverable and expose the network error code', async () => {
  const dispatcher = {};
  const result = await checkEndpoint({
    name: 'public-tunnel', url: 'https://example.com/', recoverable: false, dispatcher,
    fetchImpl: async (url, options) => {
      assert.equal(options.dispatcher, dispatcher);
      throw new TypeError('fetch failed', { cause: { code: 'ECONNREFUSED' } });
    },
  });
  assert.equal(result.healthy, false);
  assert.equal(result.recoverable, false);
  assert.match(result.message, /ECONNREFUSED/);
  const badResponse = await checkEndpoint({
    name: 'public-tunnel', url: 'https://example.com/', recoverable: false,
    fetchImpl: async () => new Response('unavailable', { status: 503 }),
  });
  assert.equal(badResponse.recoverable, false);
  assert.equal(badResponse.statusCode, 503);
});

test('public health rejects reachable but stale or incomplete cloud data', () => {
  const main = {
    track: 'main', generatedAt: '2026-09-15T01:09:08.727Z',
    asOf: { ai: '2026-09-15', github: '2026-09-15', skills: '2026-09-15' },
    projects: [{ id: 'one' }], aiEvents: [{ id: 'event-one' }], skills: [], reports: [],
  };
  assert.equal(comparePublicSnapshot(JSON.stringify(main), main).healthy, true);
  const stale = comparePublicSnapshot(JSON.stringify({ ...main, generatedAt: '2026-09-14T02:10:38.567Z' }), main);
  assert.equal(stale.healthy, false);
  assert.equal(stale.recoverable, false);
  assert.match(stale.message, /CloudBase publication mismatch/);
  assert.equal(comparePublicSnapshot(JSON.stringify({ ...main, asOf: { ...main.asOf, ai: '2026-09-14' } }), main).healthy, false);
  assert.equal(comparePublicSnapshot(JSON.stringify({ ...main, aiEvents: [] }), main).healthy, false);
  assert.equal(comparePublicSnapshot('<html>Error</html>', main).healthy, false);
});

test('watchdog health is healthy only when every required endpoint is healthy', () => {
  assert.deepEqual(summarizeHealth([
    { name: 'admin', healthy: true },
    { name: 'public', healthy: true },
    { name: 'main-data', healthy: true },
    { name: 'public-tunnel', healthy: true },
  ]), { status: 'healthy', healthy: true, unhealthy: [] });

  assert.deepEqual(summarizeHealth([
    { name: 'admin', healthy: true },
    { name: 'public-tunnel', healthy: false },
  ]), { status: 'degraded', healthy: false, unhealthy: ['public-tunnel'] });
});

test('public tunnel needs three consecutive successes and failures reset the streak', () => {
  const sample = (healthy) => [{ name: 'public-tunnel', healthy, message: healthy ? 'OK' : 'failed' }];
  const first = updateEndpointHistory([], sample(true));
  const second = updateEndpointHistory(first, sample(true));
  const third = updateEndpointHistory(second, sample(true));
  const failed = updateEndpointHistory(third, sample(false));

  assert.equal(first[0].stable, false);
  assert.equal(second[0].stable, false);
  assert.equal(third[0].stable, true);
  assert.equal(failed[0].stable, false);
  assert.equal(failed[0].successStreak, 0);
  assert.equal(failed[0].failureStreak, 1);
});

test('watchdog payload exposes operational state without configuration secrets', () => {
  const payload = buildHealthPayload({
    port: 43127,
    status: 'healthy',
    startedAt: '2026-07-22T00:00:00.000Z',
    checkedAt: '2026-07-22T00:00:01.000Z',
    lastHealthyAt: '2026-07-22T00:00:01.000Z',
    lastRecoveryAt: null,
    recoveryCount: 0,
    recovery: null,
    endpoints: [],
  }, new Date('2026-07-22T00:00:02.000Z'));

  assert.equal(payload.service, 'ark.insight-local-watchdog');
  assert.equal(payload.status, 'healthy');
  assert.equal(payload.port, 43127);
  assert.equal(payload.generatedAt, '2026-07-22T00:00:02.000Z');
  assert.doesNotMatch(JSON.stringify(payload), /access_token|DINGTALK_SECRET/);
});

test('Shanghai clock is stable across UTC date boundaries', () => {
  assert.deepEqual(shanghaiClock(new Date('2026-08-12T23:35:00.000Z')), {
    date: '2026-08-13',
    minutes: 7 * 60 + 35,
  });
});

test('daily data freshness becomes required after collection and publication deadlines', () => {
  const current = {
    ai: { asOf: '2026-08-13', status: 'success' },
    github: { asOf: '2026-08-13', status: 'success' },
    skills: { asOf: '2026-08-13', status: 'success' },
    papers: { asOf: '2026-08-13', status: 'success' },
  };
  assert.equal(evaluateDataFreshness({
    today: '2026-08-13', minutes: 8 * 60, devChannels: current, main: { asOf: {} },
  }).healthy, true);
  assert.deepEqual(evaluateDataFreshness({
    today: '2026-08-13', minutes: 8 * 60 + 20,
    devChannels: { ...current, github: { asOf: '2026-08-12', status: 'success' } },
    main: { asOf: {} },
  }).staleDev, ['github']);
  assert.deepEqual(evaluateDataFreshness({
    today: '2026-08-13', minutes: 10 * 60, devChannels: current,
    main: { asOf: { ai: '2026-08-13', github: '2026-08-12', skills: '2026-08-13' } },
  }).staleMain, ['github']);
});


test('a stalled fetch cannot stop the health polling loop even if it ignores abort', async () => {
  const result = await checkEndpoint({ name: 'public-tunnel', url: 'https://example.com/',
    timeoutMs: 20, recoverable: false, fetchImpl: () => new Promise(() => {}) });
  assert.equal(result.healthy, false);
  assert.equal(result.recoverable, false);
  assert.match(result.message, /timed out/);
});

test('the probe deadline also bounds a stalled response body', async () => {
  const result = await checkEndpoint({ name: 'public-tunnel-data', url: 'https://example.com/',
    timeoutMs: 20, recoverable: false,
    fetchImpl: async () => ({ ok: true, status: 200, text: () => new Promise(() => {}) }) });
  assert.equal(result.healthy, false);
  assert.equal(result.recoverable, false);
  assert.match(result.message, /timed out/);
});

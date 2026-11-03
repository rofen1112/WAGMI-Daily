import assert from 'node:assert/strict';
import test from 'node:test';
import { checkPublicUrl, waitForPublicUrl } from '../scripts/check-public-url.mjs';

test('public validation preserves hosting HTTP errors instead of claiming CDN staleness', async () => {
  await assert.rejects(checkPublicUrl({
    base: 'https://example.test',
    fetchImpl: async () => new Response(null, { status: 418 }),
  }), /public HTML unavailable \(HTTP 418\)/);
});

test('public validation reports a data HTTP error before attempting JSON parsing', async () => {
  await assert.rejects(checkPublicUrl({
    base: 'https://example.test',
    healthOnly: true,
    fetchImpl: async (input) => new URL(input).pathname === '/'
      ? new Response('<title>ark.insight</title>')
      : new Response(null, { status: 503 }),
  }), /main data unavailable \(HTTP 503\)/);
});

test('public validation retries stale CDN HTML with a cache-busting query', async () => {
  let htmlRequests = 0;
  const retryMessages = [];

  const fetchImpl = async (input, init = {}) => {
    const url = new URL(input);
    assert.ok(url.searchParams.has('__ark_verify'));

    if (url.pathname === '/') {
      htmlRequests += 1;
      const asset = htmlRequests === 1 ? '/assets/index-old.js' : '/assets/index-new.js';
      return new Response(
        '<title>ark.insight</title><script type="module" src="' + asset + '"></script>',
        { status: 200 },
      );
    }
    if (url.pathname === '/assets/index-new.js') {
      return new Response('console.log("current bundle");', { status: 200 });
    }
    if (url.pathname === '/data/main/index.json') {
      return Response.json({
        generatedAt: '2026-08-05T11:33:25+08:00',
        aiEvents: [],
      });
    }
    if (
      init.method === 'HEAD'
      && ['/data/main/skills-catalog.json', '/data/main/papers-catalog.json'].includes(url.pathname)
    ) {
      return new Response(null, { status: 200 });
    }
    return new Response(null, { status: 404 });
  };

  const result = await waitForPublicUrl({
    base: 'https://example.test',
    expectedAsset: '/assets/index-new.js',
    expectedGeneratedAt: '2026-08-05T11:33:25+08:00',
    fetchImpl,
    attempts: 2,
    retryDelayMs: 0,
    onRetry: (error) => retryMessages.push(error.message),
  });

  assert.equal(htmlRequests, 2);
  assert.match(retryMessages[0], /entry asset is stale/);
  assert.equal(result.asset, '/assets/index-new.js');
  assert.equal(result.generatedAt, '2026-08-05T11:33:25+08:00');
});

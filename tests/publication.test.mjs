import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { resolvePublicationConfig, runPublication, publicationContentHash } from '../scripts/publication.mjs';

const date = '2026-09-30';
const generatedAt = `${date}T00:30:00.000Z`;

test('publication content hashes ignore object key order but detect changed records', () => {
  assert.equal(publicationContentHash({a:1,b:{c:2}}), publicationContentHash({b:{c:2},a:1}));
  assert.notEqual(publicationContentHash({a:1}), publicationContentHash({a:2}));
});

async function withFixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'ark-publication-'));
  const main = {
    track: 'main', generatedAt,
    asOf: { ai: date, github: date, skills: date },
    projects: [{ id: 'project' }], aiEvents: [{ id: 'event' }],
    skills: [{ id: 'skill' }], reports: [], weeklySummaries: [],
  };
  const skills = { generatedAt, asOf: date, skills: [{ id: 'skill' }] };
  const papers = { generatedAt, asOf: date, papers: [{ id: 'paper' }] };
  const write = async (path, value) => {
    const target = join(root, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, typeof value === 'string' ? value : JSON.stringify(value));
  };
  try {
    await write('.env.publication.local', 'WAGMI_PUBLICATION_MODE=local\n');
    await write('dist/client/index.html', '<title>ark.insight</title><script type="module" src="/assets/index.js"></script>');
    await write('dist/client/assets/index.js', 'console.log("ark.insight");');
    for (const [path, value] of Object.entries({ 'index.json': main, 'skills-catalog.json': skills, 'papers-catalog.json': papers })) {
      await write(`data/main/${path}`, value);
      await write(`dist/client/data/main/${path}`, value);
    }
    const requests = [];
    const fetchImpl = async (value, options = {}) => {
      const url = new URL(value);
      requests.push({ url, options });
      if (url.pathname === '/') return new Response('<title>ark.insight</title><script src="/assets/index.js"></script>');
      if (url.pathname === '/assets/index.js') return new Response('console.log("public");');
      const body = {
        '/data/main/index.json': main,
        '/data/main/skills-catalog.json': skills,
        '/data/main/papers-catalog.json': papers,
      }[url.pathname];
      return body ? new Response(options.method === 'HEAD' ? null : JSON.stringify(body)) : new Response('Not found', { status: 404 });
    };
    await run({ root, main, skills, papers, write, requests, fetchImpl });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('publication defaults to CloudBase and applies explicit configuration precedence', () => {
  assert.equal(resolvePublicationConfig({ environment: {} }).mode, 'cloudbase');
  const local = { WAGMI_PUBLICATION_MODE: 'local', WAGMI_PUBLIC_URL: 'https://new.example.com/' };
  const dingtalk = { WAGMI_PUBLIC_URL: 'https://legacy.example.com' };
  assert.equal(resolvePublicationConfig({ environment: {}, local, dingtalk }).publicUrl, 'https://legacy.example.com');
  assert.deepEqual(resolvePublicationConfig({
    environment: { WAGMI_PUBLICATION_MODE: 'cloudbase', WAGMI_PUBLIC_URL: 'https://runtime.example.com/' }, local, dingtalk,
  }), { mode: 'cloudbase', localUrl: 'http://127.0.0.1:8080', publicUrl: 'https://runtime.example.com' });
  assert.throws(() => resolvePublicationConfig({ environment: { WAGMI_PUBLICATION_MODE: 'unsupported' } }), /local or cloudbase/);
  assert.throws(() => resolvePublicationConfig({ environment: { WAGMI_PUBLIC_URL: 'https://127.0.0.1' } }), /public HTTPS/);
});

test('local deployment builds and verifies the full served publication without contacting the configured cloud', async () => {
  await withFixture(async ({ root, write, requests, fetchImpl }) => {
    await write('.env.dingtalk.local', 'WAGMI_PUBLIC_URL=https://expired.example.com\n');
    let builds = 0;
    const result = await runPublication({ root, action: 'deploy', environment: {}, dependencies: {
      build: async () => { builds += 1; }, fetch: fetchImpl,
      cloudbase: async () => { assert.fail('local deployment must not invoke CloudBase'); },
    } });
    assert.equal(builds, 1);
    assert.equal(result.status, 'success');
    assert.equal(result.stage, 'local-verified');
    assert.equal(result.localReady, true);
    assert.equal(result.publicReady, false);
    assert.equal(result.publicStatus, 'not-checked');
    assert.ok(requests.every(({ url }) => url.origin === 'http://127.0.0.1:8080'));
    assert.ok(requests.some(({ url, options }) => url.pathname === '/data/main/papers-catalog.json' && !options.method));
    const saved = JSON.parse(await readFile(join(root, 'data/dev/publication-run.json'), 'utf8'));
    assert.deepEqual(saved, result);
  });
});

test('local check performs no build and does not require a public URL', async () => {
  await withFixture(async ({ root, fetchImpl }) => {
    const result = await runPublication({ root, action: 'check', environment: {}, dependencies: {
      fetch: fetchImpl, build: async () => { assert.fail('check must not build'); },
    } });
    assert.equal(result.localReady, true);
    assert.equal(result.publicReady, false);
    assert.equal(result.publicStatus, 'awaiting-url');
  });
});

test('failed local verification replaces a previous success and records its stage', async () => {
  await withFixture(async ({ root, write, fetchImpl, main }) => {
    await write('data/dev/publication-run.json', { status: 'success', localReady: true });
    await assert.rejects(runPublication({ root, environment: {}, dependencies: {
      fetch: async (value, options) => {
        if (new URL(value).pathname === '/data/main/index.json') return new Response(JSON.stringify({ ...main, asOf: { ...main.asOf, ai: '2026-09-29' } }));
        return fetchImpl(value, options);
      },
    } }), /ai date mismatch/);
    const saved = JSON.parse(await readFile(join(root, 'data/dev/publication-run.json'), 'utf8'));
    assert.equal(saved.status, 'failed');
    assert.equal(saved.stage, 'local-verification');
    assert.equal(saved.localReady, false);
    assert.equal(saved.publicReady, false);
  });
});

test('explicit public verification preserves local success when the public host fails', async () => {
  await withFixture(async ({ root, write, fetchImpl }) => {
    await write('.env.dingtalk.local', 'WAGMI_PUBLIC_URL=https://expired.example.com\n');
    const result = await runPublication({ root, verifyPublic: true, environment: {}, dependencies: {
      fetch: (value, options) => new URL(value).hostname === 'expired.example.com'
        ? Promise.resolve(new Response('Hosting expired', { status: 418 })) : fetchImpl(value, options),
    } });
    assert.equal(result.status, 'warning');
    assert.equal(result.stage, 'public-verification');
    assert.equal(result.localReady, true);
    assert.equal(result.publicReady, false);
    assert.equal(result.publicStatus, 'failed');
  });
});

test('matching timestamps alone cannot pass public verification when dates or catalog counts differ', async () => {
  await withFixture(async ({ root, write, fetchImpl, main, papers }) => {
    await write('.env.dingtalk.local', 'WAGMI_PUBLIC_URL=https://public.example.com\n');
    for (const mismatch of ['date', 'count', 'catalog-version', 'main-content', 'catalog-content']) {
      const result = await runPublication({ root, verifyPublic: true, environment: {}, dependencies: {
        fetch: (value, options) => {
          const url = new URL(value);
          if (url.hostname === 'public.example.com' && !options?.method) {
            if (mismatch === 'date' && url.pathname === '/data/main/index.json') return Promise.resolve(new Response(JSON.stringify({ ...main, asOf: { ...main.asOf, github: '2026-09-29' } })));
            if (mismatch === 'count' && url.pathname === '/data/main/papers-catalog.json') return Promise.resolve(new Response(JSON.stringify({ ...papers, papers: [] })));
            if (mismatch === 'catalog-version' && url.pathname === '/data/main/papers-catalog.json') return Promise.resolve(new Response(JSON.stringify({ ...papers, generatedAt: 'older' })));
            if (mismatch === 'main-content' && url.pathname === '/data/main/index.json') return Promise.resolve(new Response(JSON.stringify({ ...main, projects:[{id:'changed'}] })));
            if (mismatch === 'catalog-content' && url.pathname === '/data/main/papers-catalog.json') return Promise.resolve(new Response(JSON.stringify({ ...papers, papers:[{id:'changed'}] })));
          }
          return fetchImpl(value, options);
        },
      } });
      assert.equal(result.localReady, true);
      assert.equal(result.publicReady, false, mismatch);
      assert.equal(result.publicStatus, 'failed', mismatch);
      assert.match(result.message, /mismatch/);
    }
  });
});

test('public readiness requires successful full public verification', async () => {
  await withFixture(async ({ root, write, fetchImpl }) => {
    await write('.env.dingtalk.local', 'WAGMI_PUBLIC_URL=https://public.example.com\n');
    const result = await runPublication({ root, verifyPublic: true, environment: {}, dependencies: { fetch: fetchImpl } });
    assert.equal(result.status, 'success');
    assert.equal(result.localReady, true);
    assert.equal(result.publicReady, true);
    assert.equal(result.publicStatus, 'current');
  });
});

test('a truncated proxy transfer requires full verification through an independent direct route', async () => {
  await withFixture(async ({ root, write, fetchImpl }) => {
    await write('.env.dingtalk.local', 'WAGMI_PUBLIC_URL=https://public.example.com\n');
    let truncated = 0;
    const directReads = new Set();
    const result = await runPublication({ root, verifyPublic: true, environment: {}, dependencies: {
      fetch: async (value, options) => {
        const url = new URL(value);
        if (url.hostname === 'public.example.com' && !options?.method) {
          if (options.dispatcher) directReads.add(url.pathname);
          if (url.pathname === '/data/main/papers-catalog.json' && !options.dispatcher) {
            truncated += 1;
            const response = new Response('{}', { headers: { 'content-type': 'application/json' } });
            response.json = async () => { throw new TypeError('terminated'); };
            return response;
          }
        }
        return fetchImpl(value, options);
      },
    } });
    assert.equal(truncated, 2);
    assert.equal(result.publicReady, true);
    assert.ok(directReads.has('/data/main/index.json'));
    assert.ok(directReads.has('/data/main/skills-catalog.json'));
    assert.ok(directReads.has('/data/main/papers-catalog.json'));
    assert.deepEqual(result.publicAttempts.map(x => x.status), ['failed', 'success']);
  });
});

test('independent transport fallback still rejects a catalog with changed content', async () => {
  await withFixture(async ({ root, write, fetchImpl, papers }) => {
    await write('.env.dingtalk.local', 'WAGMI_PUBLIC_URL=https://public.example.com\n');
    const result = await runPublication({ root, verifyPublic: true, environment: {}, dependencies: {
      fetch: async (value, options) => {
        const url = new URL(value);
        if (url.hostname === 'public.example.com' && url.pathname === '/data/main/papers-catalog.json' && !options?.method) {
          if (!options.dispatcher) throw new TypeError('fetch failed');
          return new Response(JSON.stringify({ ...papers, papers: [{ id: 'changed' }] }));
        }
        return fetchImpl(value, options);
      },
    } });
    assert.equal(result.localReady, true);
    assert.equal(result.publicReady, false);
    assert.match(result.message, /papers catalog content mismatch/);
    assert.deepEqual(result.publicAttempts.map(x => x.status), ['failed', 'failed']);
  });
});

test('CloudBase mode delegates the existing deployment without claiming local or public verification', async () => {
  await withFixture(async ({ root }) => {
    let invocation;
    const result = await runPublication({ root, action: 'deploy', skipBuild: true, environment: { WAGMI_PUBLICATION_MODE: 'cloudbase' }, dependencies: {
      cloudbase: async (options) => { invocation = options; return { status: 'success' }; },
      fetch: async () => { assert.fail('public verification is opt-in'); },
    } });
    assert.equal(invocation.action, 'deploy');
    assert.equal(invocation.root, root);
    assert.equal(invocation.skipBuild, true);
    assert.equal(result.status, 'success');
    assert.equal(result.config.mode, 'cloudbase');
    assert.equal(result.localReady, false);
    assert.equal(result.publicReady, false);
  });
});


test('large public catalogs recover from one transient HTTP 200 non-JSON gateway body', async () => {
  await withFixture(async ({ root, write, fetchImpl }) => {
    await write('.env.dingtalk.local', 'WAGMI_PUBLIC_URL=https://public.example.com\n');
    let reads = 0;
    const result = await runPublication({ root, verifyPublic: true, environment: {}, dependencies: {
      fetch: (value, options) => {
        const url = new URL(value);
        if (url.hostname === 'public.example.com' && url.pathname === '/data/main/papers-catalog.json' && !options?.method) {
          if (++reads === 1) return Promise.resolve(new Response('<html>Temporary gateway response</html>', { headers: { 'content-type': 'text/html' } }));
        }
        return fetchImpl(value, options);
      },
    } });
    assert.equal(reads, 2);
    assert.equal(result.publicReady, true);
  });
});

test('public catalog retries are bounded and cannot turn a persistent invalid response into success', async () => {
  await withFixture(async ({ root, write, fetchImpl }) => {
    await write('.env.dingtalk.local', 'WAGMI_PUBLIC_URL=https://public.example.com\n');
    let reads = 0;
    const result = await runPublication({ root, verifyPublic: true, environment: {}, dependencies: {
      fetch: (value, options) => {
        const url = new URL(value);
        if (url.hostname === 'public.example.com' && url.pathname === '/data/main/papers-catalog.json' && !options?.method) {
          reads += 1;
          return Promise.resolve(new Response('<html>Broken</html>', { headers: { 'content-type': 'text/html' } }));
        }
        return fetchImpl(value, options);
      },
    } });
    assert.equal(reads, 2);
    assert.equal(result.publicReady, false);
    assert.match(result.message, /not JSON/);
  });
});

import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, symlink, utimes, writeFile } from 'node:fs/promises';
import { request } from 'node:http';
import { resolve, sep } from 'node:path';
import test from 'node:test';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import { createPublicServer } from '../scripts/serve-public-dist.mjs';

const payload = Buffer.from(JSON.stringify({ track: 'main', title: '暗壳日报', rows: Array.from({ length: 500 }, (_, id) => ({ id, text: 'A useful daily update 中文内容' })) }));

async function fixture(t, options = {}) {
  const workspace = resolve(process.cwd());
  const directory = await mkdtemp(resolve(workspace, '.tmp-public-server-test-'));
  const root = resolve(directory, 'dist/client');
  for (const path of ['data/main', 'data/dev', 'assets/private', 'brand', 'reports', 'admin']) await mkdir(resolve(root, path), { recursive: true });
  await Promise.all([
    writeFile(resolve(root, 'index.html'), '<!doctype html><title>ark.insight</title>'),
    writeFile(resolve(root, 'data/main/index.json'), payload),
    writeFile(resolve(root, 'assets/main-abc123.js'), 'console.log("public");'),
    writeFile(resolve(root, 'brand/mark.png'), Buffer.from([137, 80, 78, 71])),
    writeFile(resolve(root, '.env'), 'secret'),
    writeFile(resolve(root, 'data/dev/index.json'), 'private'),
    writeFile(resolve(root, 'assets/private/key.txt'), 'private'),
    writeFile(resolve(root, 'admin/index.html'), 'admin'),
    writeFile(resolve(directory, 'outside.txt'), 'outside private content'),
  ]);
  const server = createPublicServer({ root, ...options });
  await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done); });
  t.after(async () => {
    await new Promise((done) => { server.close(done); server.closeAllConnections(); });
    assert.ok(directory.startsWith(`${workspace}${sep}.tmp-public-server-test-`));
    await rm(directory, { recursive: true, force: true });
  });
  const get = (path = '/data/main/index.json', headers = {}, method = 'GET') => new Promise((done, reject) => {
    const outgoing = request({ host: '127.0.0.1', port: server.address().port, path, headers, method }, (incoming) => {
      const chunks = [];
      incoming.on('data', (chunk) => chunks.push(chunk));
      incoming.on('error', reject);
      incoming.on('end', () => done({ status: incoming.statusCode, headers: incoming.headers, body: Buffer.concat(chunks) }));
    });
    outgoing.on('error', reject);
    outgoing.end();
  });
  return { root, directory, get };
}

test('public server negotiates br/gzip and sends equivalent bytes with correct representation headers', async (t) => {
  const { get } = await fixture(t);
  const identity = await get();
  assert.equal(identity.status, 200);
  assert.deepEqual(identity.body, payload);
  assert.equal(identity.headers['content-encoding'], undefined);
  assert.equal(identity.headers['cache-control'], 'public, max-age=0, must-revalidate');
  for (const encoding of ['br', 'gzip']) {
    const result = await get(undefined, { 'Accept-Encoding': encoding });
    assert.equal(result.status, 200);
    assert.equal(result.headers['content-encoding'], encoding);
    assert.equal(result.headers.vary, 'Accept-Encoding');
    assert.equal(Number(result.headers['content-length']), result.body.length);
    assert.ok(result.body.length < payload.length / 2);
    assert.notEqual(result.headers.etag, identity.headers.etag);
    assert.deepEqual(encoding === 'br' ? brotliDecompressSync(result.body) : gunzipSync(result.body), payload);
  }
  const many = await Promise.all(Array.from({ length: 10 }, () => get(undefined, { 'Accept-Encoding': 'br, gzip' })));
  assert.ok(many.every((result) => result.status === 200 && result.headers['content-encoding'] === 'br'));
  assert.deepEqual(brotliDecompressSync(many[0].body), payload);
});

test('encoding negotiation respects refusals, weights, wildcards and identity', async (t) => {
  const { get } = await fixture(t);
  const cases = [
    ['br;q=0, gzip;q=1', 'gzip'],
    ['br;q=0.1, gzip;q=0.8', 'gzip'],
    ['gzip;q=0.4, identity;q=1', undefined],
    ['br;q=0, gzip;q=0', undefined],
    ['br;q=0, *;q=0.8', 'gzip'],
    ['BR;Q=1, gzip;q=0.5', 'br'],
    ['br;q=0, br;q=1, gzip', 'gzip'],
    ['', undefined],
  ];
  for (const [header, encoding] of cases) {
    const result = await get(undefined, { 'Accept-Encoding': header });
    assert.equal(result.status, 200, header);
    assert.equal(result.headers['content-encoding'], encoding, header);
  }
  for (const header of ['br;q=0,gzip;q=0,identity;q=0', '*;q=0', 'br;q=invalid,identity;q=0']) {
    assert.equal((await get(undefined, { 'Accept-Encoding': header })).status, 406, header);
  }
  assert.equal((await get('/brand/mark.png', { 'Accept-Encoding': 'br,gzip' })).headers['content-encoding'], undefined);
  assert.equal((await get('/brand/mark.png', { 'Accept-Encoding': 'br,identity;q=0' })).status, 406);
});

test('HEAD and conditional requests preserve cache metadata without a body', async (t) => {
  const { get } = await fixture(t);
  const headers = { 'Accept-Encoding': 'gzip' };
  const first = await get(undefined, headers);
  const head = await get(undefined, headers, 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body.length, 0);
  assert.equal(head.headers['content-length'], first.headers['content-length']);
  assert.equal(head.headers.etag, first.headers.etag);
  const fresh = await get(undefined, { ...headers, 'If-None-Match': `"other", ${first.headers.etag}` });
  assert.equal(fresh.status, 304);
  assert.equal(fresh.body.length, 0);
  assert.equal(fresh.headers.etag, first.headers.etag);
  assert.equal(fresh.headers.vary, 'Accept-Encoding');
  assert.equal(fresh.headers['content-length'], undefined);
  assert.equal((await get(undefined, { ...headers, 'If-None-Match': '*' }, 'HEAD')).status, 304);
  assert.equal((await get(undefined, { ...headers, 'If-Modified-Since': first.headers['last-modified'] })).status, 304);
  assert.equal((await get(undefined, { ...headers, 'If-None-Match': '"changed"', 'If-Modified-Since': first.headers['last-modified'] })).status, 200);
});

test('updating same-size JSON invalidates both compressed cache and ETag', async (t) => {
  const { root, get } = await fixture(t);
  const headers = { 'Accept-Encoding': 'br' };
  const first = await get(undefined, headers);
  const updated = Buffer.from(payload.toString().replace('A useful daily update', 'A timely daily update'));
  assert.equal(updated.length, payload.length);
  const filePath = resolve(root, 'data/main/index.json');
  await writeFile(filePath, updated);
  const changedAt = new Date(Date.now() + 2000);
  await utimes(filePath, changedAt, changedAt);
  const next = await get(undefined, { ...headers, 'If-None-Match': first.headers.etag });
  assert.equal(next.status, 200);
  assert.notEqual(next.headers.etag, first.headers.etag);
  assert.deepEqual(brotliDecompressSync(next.body), updated);
  assert.equal((await get(undefined, { ...headers, 'If-None-Match': next.headers.etag })).status, 304);
});

test('compression remains correct when cache cannot retain a response', async (t) => {
  const { get } = await fixture(t, { maxCacheBytes: 1, maxCacheEntries: 1 });
  for (let i = 0; i < 3; i += 1) {
    const result = await get(undefined, { 'Accept-Encoding': 'gzip' });
    assert.equal(result.status, 200);
    assert.deepEqual(gunzipSync(result.body), payload);
  }
});

test('cumulative catalogs above 32 MiB remain compressed with identical content', async (t) => {
  const { root, get } = await fixture(t);
  const catalog = Buffer.from(JSON.stringify({ papers: ['x'.repeat(33 * 1024 * 1024)] }));
  await writeFile(resolve(root, 'data/main/papers-catalog.json'), catalog);
  const result = await get('/data/main/papers-catalog.json', { 'Accept-Encoding': 'gzip' });
  assert.equal(result.status, 200);
  assert.equal(result.headers['content-encoding'], 'gzip');
  assert.ok(result.body.length < catalog.length / 10);
  assert.deepEqual(gunzipSync(result.body), catalog);
});

test('files above the configured compression bound retain identity fallback', async (t) => {
  const { get } = await fixture(t, { maxCompressFileBytes: payload.length - 1 });
  const result = await get(undefined, { 'Accept-Encoding': 'gzip' });
  assert.equal(result.status, 200);
  assert.equal(result.headers['content-encoding'], undefined);
  assert.deepEqual(result.body, payload);
  assert.equal((await get(undefined, { 'Accept-Encoding': 'gzip, identity;q=0' })).status, 406);
});

test('only known SPA routes receive HTML and missing data/assets stay 404', async (t) => {
  const { get } = await fixture(t);
  for (const path of ['/', '/today', '/github/', '/papers?filter=new']) {
    const page = await get(path);
    assert.equal(page.status, 200, path);
    assert.match(page.body.toString(), /ark.insight/);
  }
  for (const path of ['/data/main/missing.json', '/data/main/missing', '/assets/missing.js', '/assets/missing', '/unrecognized', '/reports/missing.md']) {
    const missing = await get(path);
    assert.equal(missing.status, 404, path);
    assert.doesNotMatch(missing.body.toString(), /ark.insight/);
  }
  const asset = await get('/assets/main-abc123.js');
  assert.match(asset.headers['cache-control'], /immutable/);
  const post = await get('/data/main/index.json', {}, 'POST');
  assert.equal(post.status, 405);
  assert.equal(post.headers.allow, 'GET, HEAD');
  assert.equal((await get('/data/main/missing.json', {}, 'HEAD')).body.length, 0);
});

test('public server rejects traversal, hidden files, private/admin paths and malformed escapes', async (t) => {
  const { get } = await fixture(t);
  for (const path of [
    '/../outside.txt', '/assets/../../../outside.txt', '/assets/%2e%2e/%2e%2e/outside.txt',
    '/assets/%2E%2E%5coutside.txt', '/assets/..%5c..%5coutside.txt', '/.env', '/%2eenv',
    '/assets/.env', '/assets/private/key.txt', '/data/dev/index.json', '/__admin/data/index.json',
    '/admin/index.html', '/operations', '/watchlist', '/index.html:secret', '/index.html.',
    '/data/main/%00index.json', '/%E0%A4%A', '/assets/%252e%252e/private.txt',
  ]) assert.equal((await get(path)).status, 404, path);
});

test('directory links cannot expose files outside public build or inside its private folders', async (t) => {
  const { directory, root, get } = await fixture(t);
  await symlink(directory, resolve(root, 'assets/outside'), process.platform === 'win32' ? 'junction' : 'dir');
  await symlink(resolve(root, 'data/dev'), resolve(root, 'assets/inside-private'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal((await get('/assets/outside/outside.txt')).status, 404);
  assert.equal((await get('/assets/inside-private/index.json')).status, 404);
});

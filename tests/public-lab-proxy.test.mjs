import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer, request } from 'node:http';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { createPublicLabProxy } from '../scripts/public-lab-proxy.mjs';
import { createPublicServer } from '../scripts/serve-public-dist.mjs';

test('public lab proxy forwards only the isolated backend with same-origin and operator boundaries', async t => {
  const workspace = await mkdtemp(resolve('.tmp-public-lab-proxy-'));
  const secret = 'test-proxy-token-' + 'a'.repeat(64);
  await mkdir(resolve(workspace, '.local-ai-lab-public'));
  await writeFile(resolve(workspace, '.local-ai-lab-public/proxy-token'), secret);
  let forwarded = 0;
  const backend = createServer((req, res) => {
    forwarded++;
    assert.equal(req.headers['x-ark-lab-proxy'], secret);
    assert.equal(req.headers['x-ark-lab-secure'], '1');
    assert.equal(req.headers.cookie, 'ark_lab_session=visitor');
    assert.equal(req.headers.origin, undefined);
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      assert.equal(Buffer.concat(chunks).toString(), '{"title":"public"}');
      res.writeHead(201, { 'Content-Type': 'application/json', 'Set-Cookie': 'ark_lab_session=signed; Secure; HttpOnly; SameSite=Lax', 'Cache-Control': 'public' });
      res.end('{"project":{"id":"visitor-project"}}');
    });
  });
  await new Promise(done => backend.listen(0, '127.0.0.1', done));
  const server = createPublicServer({ root: workspace, labProxy: createPublicLabProxy({ workspace, port: backend.address().port }) });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  t.after(async () => {
    for (const item of [server, backend]) await new Promise(done => { item.close(done); item.closeAllConnections(); });
    assert.ok(workspace.startsWith(resolve('.') + sep + '.tmp-public-lab-proxy-'));
    await rm(workspace, { recursive: true, force: true });
  });
  const send = (path, headers = {}, method = 'POST', body = '{"title":"public"}') => new Promise((done, reject) => {
    const outgoing = request({ host: '127.0.0.1', port: server.address().port, path, method,
      headers: { Host: 'wagmii.cn', Origin: 'https://wagmii.cn', 'Content-Type': 'application/json', Cookie: 'ark_lab_session=visitor', 'X-Ark-Lab-Proxy': 'attacker', ...headers } }, incoming => {
      const chunks = []; incoming.on('data', chunk => chunks.push(chunk));
      incoming.on('end', () => done({ status: incoming.statusCode, headers: incoming.headers, body: Buffer.concat(chunks).toString() }));
    }); outgoing.on('error', reject); outgoing.end(body);
  });
  const success = await send('/api/ai-lab/v1/projects');
  assert.equal(success.status, 201);
  assert.equal(success.headers['cache-control'], 'no-store');
  assert.match(success.headers['set-cookie'][0], /HttpOnly/);
  for (const path of ['/api/ai-lab/v1/jobs/abc/handoff/finalize', '/api/ai-lab/v1/projects/abc/baseline', '/viewer-assets/%2e%2e/private']) assert.equal((await send(path)).status, 404);
  assert.equal((await send('/api/ai-lab/v1/projects', { Origin: 'https://evil.test' })).status, 403);
  assert.equal((await send('/api/ai-lab/v1/projects', { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  assert.equal((await send('/api/ai-lab/v1/projects', { 'Content-Length': String(19 * 1024 * 1024) })).status, 413);
  assert.equal(forwarded, 1);
  await new Promise(done => backend.close(done));
  assert.equal((await send('/api/ai-lab/v1/projects')).status, 503);
});

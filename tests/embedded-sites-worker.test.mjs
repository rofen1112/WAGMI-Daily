import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { buildEmbeddedSitesWorker } from '../scripts/build-embedded-sites-worker.mjs';

test('embedded Sites worker serves files and SPA fallbacks without an ASSETS binding', async () => {
  const root = await mkdtemp(resolve(process.cwd(), '.tmp-sites-worker-test-'));
  const client = resolve(root, 'client');
  const output = resolve(root, 'server/index.js');
  await mkdir(resolve(client, 'data/main'), { recursive: true });
  await writeFile(resolve(client, 'index.html'), '<h1>WAGMI Daily</h1>', 'utf8');
  await writeFile(resolve(client, 'data/main/index.json'), '{"projects":45}', 'utf8');

  try {
    const result = await buildEmbeddedSitesWorker(client, output);
    assert.deepEqual(result.files, 2);
    assert.ok((await readFile(output, 'utf8')).includes('DecompressionStream'));

    const worker = (await import(`${pathToFileURL(output).href}?test=${Date.now()}`)).default;
    const home = await worker.fetch(new Request('https://example.test/', { headers: { Accept: 'text/html' } }));
    assert.equal(home.status, 200);
    assert.equal(await home.text(), '<h1>WAGMI Daily</h1>');

    const data = await worker.fetch(new Request('https://example.test/data/main/index.json'));
    assert.equal(await data.text(), '{"projects":45}');

    const fallback = await worker.fetch(new Request('https://example.test/github', { headers: { Accept: 'text/html' } }));
    assert.equal(await fallback.text(), '<h1>WAGMI Daily</h1>');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { markSitesDeployed, prepareSitesPublication } from '../scripts/sites-publication.mjs';

async function writeFixture(root, path, value = '') {
  const target = resolve(root, path);
  await mkdir(resolve(target, '..'), { recursive: true });
  await writeFile(target, typeof value === 'string' ? value : JSON.stringify(value), 'utf8');
}

test('Sites preparation stays independent and detects an already deployed main snapshot', async () => {
  const root = await mkdtemp(join(tmpdir(), 'wagmi-sites-'));
  try {
    await writeFixture(root, 'data/main/index.json', {
      track: 'main',
      asOf: { ai: '2026-07-19', github: '2026-07-19', skills: '2026-07-19' },
      projects: [],
      aiEvents: [],
      skills: [],
    });
    await writeFixture(root, 'data/main/skills-catalog.json', { skills: [] });
    await writeFixture(root, 'dist/client/index.html', '<!doctype html>');
    await writeFixture(root, 'dist/server/index.js', 'export default {};');
    await writeFixture(root, 'dist/.openai/hosting.json', '{}');

    const pending = await prepareSitesPublication(root);
    assert.equal(pending.state, 'pending');
    assert.equal(pending.asOf.ai, '2026-07-19');

    const deployed = await markSitesDeployed({ root, version: '7', url: 'https://private.example.com' });
    assert.equal(deployed.state, 'deployed');
    assert.equal(deployed.deployedHash, pending.mainHash);

    const current = await prepareSitesPublication(root);
    assert.equal(current.state, 'current');
    assert.equal(current.deployedVersion, '7');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

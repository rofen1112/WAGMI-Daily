import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import {
  inspectCloudBaseBundle,
  parseEnvironmentFile,
  resolveCloudBaseConfig,
  runCloudBasePublication,
} from '../scripts/cloudbase-publication.mjs';

test('failed publication replaces the prior success record with its failing stage', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ark-cloudbase-failure-'));
  try {
    await writeFixture(root, 'data/dev/cloudbase-publish-run.json', { status: 'success' });
    await assert.rejects(runCloudBasePublication({ root, action: 'deploy', skipBuild: true, environment: {} }), /missing/);
    const record = JSON.parse(await readFile(join(root, 'data/dev/cloudbase-publish-run.json'), 'utf8'));
    assert.equal(record.status, 'failed');
    assert.equal(record.stage, 'validate-bundle');
    assert.equal(record.action, 'deploy');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
import { buildProxyEnvironment } from '../scripts/network-fetch.mjs';

async function writeFixture(root, path, value = '') {
  const target = resolve(root, path);
  await mkdir(resolve(target, '..'), { recursive: true });
  await writeFile(target, typeof value === 'string' ? value : JSON.stringify(value), 'utf8');
}

test('CloudBase configuration uses runtime values before the local file', () => {
  const local = parseEnvironmentFile(`
    CLOUDBASE_ENV_ID=local-env
    CLOUDBASE_PUBLIC_URL=https://local.example.com/
  `);
  const config = resolveCloudBaseConfig({
    environment: { CLOUDBASE_ENV_ID: 'runtime-env' },
    local,
  });

  assert.deepEqual(config, {
    envId: 'runtime-env',
    publicUrl: 'https://local.example.com',
  });
});

test('CloudBase bundle accepts only a public main snapshot', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ark-cloudbase-'));
  try {
    await writeFixture(root, 'dist/client/index.html', '<title>ark.insight</title>');
    await writeFixture(root, 'dist/client/data/main/index.json', {
      track: 'main',
      asOf: { ai: '2026-07-23' },
      projects: [{ id: 'project-1' }],
      aiEvents: [{ id: 'event-1' }],
      skills: [],
    });
    await writeFixture(root, 'dist/client/data/main/skills-catalog.json', { skills: [] });
    await writeFixture(root, 'dist/client/assets/index.js', 'console.log("public");');

    const result = await inspectCloudBaseBundle(root);
    assert.equal(result.counts.projects, 1);
    assert.equal(result.counts.aiEvents, 1);

    await writeFixture(root, 'dist/client/data/dev/index.json', {});
    await assert.rejects(
      inspectCloudBaseBundle(root),
      /contains private path/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test('CloudBase child process environment inherits the Windows proxy fallback', () => {
  const environment = buildProxyEnvironment({ PATH: 'test' }, '127.0.0.1:18081');
  assert.equal(environment.HTTPS_PROXY, 'http://127.0.0.1:18081');
  assert.equal(environment.http_proxy, 'http://127.0.0.1:18081');
});

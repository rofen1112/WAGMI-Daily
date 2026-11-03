import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { Agent } from 'undici';
import { checkPublicUrl } from './check-public-url.mjs';
import { inspectCloudBaseBundle, parseEnvironmentFile, runCloudBasePublication } from './cloudbase-publication.mjs';
import { buildProxyEnvironment } from './network-fetch.mjs';

const workspaceRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const localUrl = 'http://127.0.0.1:8080';

async function readEnvironmentFile(root, path) {
  try {
    return parseEnvironmentFile(await readFile(resolve(root, path), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw error;
  }
}

export function resolvePublicationConfig({ environment = process.env, local = {}, dingtalk = {} } = {}) {
  const mode = environment.WAGMI_PUBLICATION_MODE || local.WAGMI_PUBLICATION_MODE || 'cloudbase';
  if (!['local', 'cloudbase'].includes(mode)) throw new Error('WAGMI_PUBLICATION_MODE must be local or cloudbase');
  const configuredUrl = environment.WAGMI_PUBLIC_URL || dingtalk.WAGMI_PUBLIC_URL || '';
  let publicUrl = null;
  if (configuredUrl) {
    let url;
    try {
      url = new URL(configuredUrl);
    } catch {
      throw new Error('WAGMI_PUBLIC_URL must be a valid HTTPS URL');
    }
    if (url.protocol !== 'https:' || url.username || url.password
      || ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(url.hostname)) {
      throw new Error('WAGMI_PUBLIC_URL must be a public HTTPS URL without credentials');
    }
    url.search = '';
    url.hash = '';
    publicUrl = url.toString().replace(/\/$/, '');
  }
  return { mode, localUrl, publicUrl };
}

function buildPublic({ root, environment }) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build:public'], {
      cwd: root,
      env: buildProxyEnvironment(environment),
      shell: process.platform === 'win32',
      stdio: 'inherit',
      windowsHide: true,
    });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolvePromise() : reject(new Error(`Public build exited with code ${code ?? 'unknown'}`)));
  });
}

async function readExpectedPublication(root) {
  const read = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));
  const [main, skillsCatalog, papersCatalog] = await Promise.all([
    read('data/main/index.json'),
    read('data/main/skills-catalog.json'),
    read('data/main/papers-catalog.json'),
  ]);
  if (!main.generatedAt || main.track !== 'main') throw new Error('Local main version is unavailable');
  for (const channel of ['ai', 'github', 'skills']) {
    if (!main.asOf?.[channel]) throw new Error(`Local main ${channel} date is unavailable`);
  }
  for (const field of ['projects', 'aiEvents', 'skills', 'reports']) {
    if (!Array.isArray(main[field])) throw new Error(`Local main ${field} is unavailable`);
  }
  for (const [name, catalog, field] of [['skills', skillsCatalog, 'skills'], ['papers', papersCatalog, 'papers']]) {
    if (!catalog.asOf || !catalog.generatedAt || !Array.isArray(catalog[field])) {
      throw new Error(`Local ${name} catalog version is unavailable`);
    }
  }
  return { main, skillsCatalog, papersCatalog };
}

export function publicationContentHash(value) {
  const stable = item => Array.isArray(item) ? item.map(stable) : item && typeof item === 'object'
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, stable(item[key])])) : item;
  return createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
}

function assertMatchingSnapshot(actual, expected) {
  if (actual?.track !== 'main') throw new Error('Publication track is not main');
  if (actual.generatedAt !== expected.generatedAt) throw new Error('Publication main generatedAt mismatch');
  for (const channel of ['ai', 'github', 'skills']) {
    if (actual.asOf?.[channel] !== expected.asOf[channel]) throw new Error(`Publication main ${channel} date mismatch`);
  }
  for (const field of ['projects', 'aiEvents', 'skills', 'reports', 'weeklySummaries', 'githubTrends']) {
    if (expected[field] !== undefined && !Array.isArray(actual[field])) throw new Error(`Publication main ${field} is unavailable`);
    if ((actual[field]?.length ?? 0) !== (expected[field]?.length ?? 0)) throw new Error(`Publication main ${field} count mismatch`);
  }
  if (publicationContentHash(actual) !== publicationContentHash(expected)) throw new Error('Publication main content mismatch');
}

async function verifyPublication({ base, expected, expectedAsset, check, fetchImpl }) {
  const entry = await check({ base, expectedGeneratedAt: expected.main.generatedAt, expectedAsset, fetchImpl });
  const read = async (path) => {
    const timeoutMs = path === '/data/main/index.json' ? 15_000 : 60_000;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const url = new URL(path, base + '/');
      url.searchParams.set('__ark_verify', 'publication-' + Date.now() + '-' + attempt);
      try {
        const response = await fetchImpl(url, {
          headers: { Accept: 'application/json', 'Accept-Encoding': 'br, gzip', 'Cache-Control': 'no-cache, no-store, max-age=0', Pragma: 'no-cache' },
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.ok) {
          await response.body?.cancel();
          throw Object.assign(new Error('Publication ' + path + ' returned HTTP ' + response.status),
            { retryable: response.status >= 500 || [408, 429].includes(response.status) });
        }
        try {
          return await response.json();
        } catch (error) {
          const timedOut = ['AbortError', 'TimeoutError'].includes(error?.name);
          throw Object.assign(new Error('Publication ' + path + (timedOut
            ? ' response timed out after ' + timeoutMs + 'ms'
            : ' is not JSON (content-type: ' + (response.headers?.get('content-type') ?? 'unknown') + ')')), {
            transportFailure: timedOut || (error instanceof TypeError && error.message === 'terminated'),
          });
        }
      } catch (error) {
        if (attempt === 2 || error.retryable === false) throw error;
      }
    }
  };
  // The two catalogs are large enough that fetching all three payloads through
  // the public tunnel at once can intermittently return an HTML gateway body.
  // Verify them serially so a healthy origin is not reported as a public
  // publication failure simply because the ingress connection was saturated.
  const main = await read('/data/main/index.json');
  const skillsCatalog = await read('/data/main/skills-catalog.json');
  const papersCatalog = await read('/data/main/papers-catalog.json');
  assertMatchingSnapshot(main, expected.main);
  for (const [name, actual, original, field] of [
    ['skills', skillsCatalog, expected.skillsCatalog, 'skills'],
    ['papers', papersCatalog, expected.papersCatalog, 'papers'],
  ]) {
    if (actual?.asOf !== original.asOf || actual?.generatedAt !== original.generatedAt) {
      throw new Error(`Publication ${name} catalog version mismatch`);
    }
    if (!Array.isArray(actual[field]) || actual[field].length !== original[field].length) {
      throw new Error(`Publication ${name} catalog count mismatch`);
    }
    if (publicationContentHash(actual) !== publicationContentHash(original)) throw new Error(`Publication ${name} catalog content mismatch`);
  }
  return { status: 'current', generatedAt: main.generatedAt, asOf: main.asOf, asset: entry.asset,
    contentHashes: { main: publicationContentHash(main), skills: publicationContentHash(skillsCatalog), papers: publicationContentHash(papersCatalog) } };
}

function safeMessage(error) {
  return (error instanceof Error ? error.message : String(error))
    .replace(/(access_token|secret|token|password|user_code)=([^\s&]+)/gi, '$1=[redacted]');
}

async function writeRun(root, record) {
  const path = resolve(root, 'data/dev/publication-run.json');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
}

export async function runPublication({
  root = workspaceRoot,
  action = 'check',
  skipBuild = false,
  verifyPublic = false,
  environment = process.env,
  dependencies = {},
} = {}) {
  const record = {
    checkedAt: new Date().toISOString(),
    action,
    status: 'failed',
    stage: 'configuration',
    config: null,
    localReady: false,
    publicReady: false,
    publicStatus: 'not-checked',
  };
  let direct;
  try {
    if (!['check', 'deploy'].includes(action)) throw new Error('Publication action must be check or deploy');
    const [local, dingtalk] = await Promise.all([
      readEnvironmentFile(root, '.env.publication.local'),
      readEnvironmentFile(root, '.env.dingtalk.local'),
    ]);
    const config = resolvePublicationConfig({ environment, local, dingtalk });
    record.config = config;
    record.publicStatus = config.publicUrl ? 'not-checked' : 'awaiting-url';
    const check = dependencies.checkPublicUrl ?? checkPublicUrl;
    const fetchImpl = dependencies.fetch ?? fetch;

    if (config.mode === 'cloudbase') {
      record.stage = 'cloudbase';
      const cloudbase = await (dependencies.cloudbase ?? runCloudBasePublication)({ root, action, skipBuild, environment });
      if (!['success', 'ready'].includes(cloudbase.status)) throw new Error(`CloudBase operation is ${cloudbase.status}`);
    } else if (action === 'deploy' && !skipBuild) {
      record.stage = 'build';
      await (dependencies.build ?? buildPublic)({ root, environment });
    }

    record.stage = 'validate-bundle';
    const bundle = await inspectCloudBaseBundle(root);
    const expected = await readExpectedPublication(root);
    record.generatedAt = expected.main.generatedAt;
    record.asOf = expected.main.asOf;

    if (config.mode === 'local') {
      record.stage = 'local-verification';
      direct = new Agent();
      const localFetch = (url, options) => fetchImpl(url, { ...options, dispatcher: direct });
      record.local = await verifyPublication({ base: config.localUrl, expected, expectedAsset: bundle.entryAsset, check, fetchImpl: localFetch });
      record.localReady = true;
    }

    record.status = 'success';
    record.stage = config.mode === 'local' ? 'local-verified' : 'cloudbase-complete';
    if (verifyPublic) {
      record.stage = 'public-verification';
      try {
        if (!config.publicUrl) throw new Error('WAGMI_PUBLIC_URL is not configured');
        try {
          record.public = await verifyPublication({ base: config.publicUrl, expected, expectedAsset: bundle.entryAsset, check, fetchImpl });
        } catch (error) {
          // Some configured proxies truncate large bodies while the fixed host
          // remains directly reachable. Retry the entire verification once on
          // an independent route, retaining the failed observation. Content or
          // version mismatches never qualify for this transport fallback.
          if (!error.transportFailure && !/fetch failed|timed out|terminated/i.test(error.message)) throw error;
          record.publicAttempts = [{ route: 'configured', status: 'failed', message: safeMessage(error) }];
          direct ??= new Agent();
          const publicDirectFetch = (url, options) => fetchImpl(url, { ...options, dispatcher: direct });
          try {
            record.public = await verifyPublication({ base: config.publicUrl, expected, expectedAsset: bundle.entryAsset, check, fetchImpl: publicDirectFetch });
            record.publicAttempts.push({ route: 'direct', status: 'success' });
          } catch (directError) {
            record.publicAttempts.push({ route: 'direct', status: 'failed', message: safeMessage(directError) });
            throw directError;
          }
        }
        record.publicReady = true;
        record.publicStatus = 'current';
        record.stage = 'complete';
      } catch (error) {
        record.status = 'warning';
        record.publicStatus = 'failed';
        record.message = safeMessage(error);
      }
    }
    if (!record.message) {
      record.message = record.publicReady
        ? 'Configured public website matches the complete main publication.'
        : config.mode === 'local'
          ? 'Local publication is current. Public access has not been verified; DingTalk remains gated by its public check.'
          : 'CloudBase operation completed. Complete verification of the configured DingTalk website has not been requested.';
    }
    await writeRun(root, record);
    return record;
  } catch (error) {
    record.status = 'failed';
    record.message = safeMessage(error);
    await writeRun(root, record);
    throw error;
  } finally {
    await direct?.close();
  }
}

const executedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executedDirectly) {
  runPublication({
    action: process.argv.includes('--deploy') ? 'deploy' : 'check',
    skipBuild: process.argv.includes('--skip-build'),
    verifyPublic: process.argv.includes('--verify-public'),
  }).then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'success') process.exitCode = 2;
  }).catch((error) => {
    console.error(safeMessage(error));
    process.exitCode = 1;
  });
}

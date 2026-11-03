import { access, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildProxyEnvironment } from './network-fetch.mjs';

const workspaceRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

export function parseEnvironmentFile(content = '') {
  const values = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

async function readLocalEnvironment(root) {
  try {
    return parseEnvironmentFile(await readFile(resolve(root, '.env.cloudbase.local'), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw error;
  }
}

export function resolveCloudBaseConfig({ environment = process.env, local = {} } = {}) {
  const envId = environment.CLOUDBASE_ENV_ID
    || environment.TCB_ENV_ID
    || local.CLOUDBASE_ENV_ID
    || local.TCB_ENV_ID
    || '';
  const publicUrl = environment.CLOUDBASE_PUBLIC_URL
    || local.CLOUDBASE_PUBLIC_URL
    || '';

  if (envId && !/^[A-Za-z0-9_-]+$/.test(envId)) {
    throw new Error('CLOUDBASE_ENV_ID contains unsupported characters');
  }
  if (publicUrl && new URL(publicUrl).protocol !== 'https:') {
    throw new Error('CLOUDBASE_PUBLIC_URL must use HTTPS');
  }

  return {
    envId,
    publicUrl: publicUrl.replace(/\/+$/, ''),
  };
}

export async function inspectCloudBaseBundle(root = workspaceRoot) {
  const clientRoot = resolve(root, 'dist/client');
  const indexPath = resolve(clientRoot, 'index.html');
  const dataPath = resolve(clientRoot, 'data/main/index.json');
  const catalogPath = resolve(clientRoot, 'data/main/skills-catalog.json');
  const assetsPath = resolve(clientRoot, 'assets');
  const forbiddenPaths = [
    resolve(clientRoot, 'data/dev'),
    resolve(clientRoot, '__admin'),
  ];

  for (const requiredPath of [indexPath, dataPath, catalogPath]) {
    if (!(await pathExists(requiredPath))) {
      throw new Error(`CloudBase public bundle is missing ${requiredPath}`);
    }
  }
  for (const forbiddenPath of forbiddenPaths) {
    if (await pathExists(forbiddenPath)) {
      throw new Error(`CloudBase public bundle contains private path ${forbiddenPath}`);
    }
  }

  const [html, snapshotText, indexInfo, dataInfo, catalogInfo] = await Promise.all([
    readFile(indexPath, 'utf8'),
    readFile(dataPath, 'utf8'),
    stat(indexPath),
    stat(dataPath),
    stat(catalogPath),
  ]);
  if (!/ark\.insight/i.test(html)) {
    throw new Error('CloudBase public bundle does not contain the ark.insight identity');
  }

  const snapshot = JSON.parse(snapshotText);
  if (snapshot.track !== 'main') {
    throw new Error(`CloudBase may only publish the main track; received ${snapshot.track ?? 'missing'}`);
  }
  if (!Array.isArray(snapshot.aiEvents) || !Array.isArray(snapshot.projects)) {
    throw new Error('CloudBase public bundle has an invalid main snapshot');
  }

  const assetNames = await readdir(assetsPath);
  const javascriptAssets = assetNames.filter((name) => name.endsWith('.js'));
  const javascriptContents = await Promise.all(
    javascriptAssets.map((name) => readFile(resolve(assetsPath, name), 'utf8')),
  );
  if (javascriptContents.some((content) => content.includes('/__admin/'))) {
    throw new Error('CloudBase public bundle contains local admin API code');
  }

  return {
    clientRoot,
    entryAsset: html.match(/<script[^>]+src="([^"]+)"/i)?.[1] ?? null,
    asOf: snapshot.asOf ?? null,
    generatedAt: snapshot.generatedAt ?? null,
    counts: {
      aiEvents: snapshot.aiEvents.length,
      projects: snapshot.projects.length,
      skills: Array.isArray(snapshot.skills) ? snapshot.skills.length : 0,
    },
    bytes: indexInfo.size + dataInfo.size + catalogInfo.size,
  };
}

function run(command, args, cwd = workspaceRoot) {
  return new Promise((resolvePromise, reject) => {
    const output = [];
    const child = spawn(command, args, {
      cwd,
      env: buildProxyEnvironment(process.env),
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    const capture = (stream, writer) => {
      stream?.on('data', (chunk) => {
        const text = String(chunk);
        output.push(text);
        writer.write(text);
      });
    };
    capture(child.stdout, process.stdout);
    capture(child.stderr, process.stderr);

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) return resolvePromise();
      const tail = output
        .join('')
        .replace(/\u001b\[[0-9;]*m/g, '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(-8)
        .join(' | ')
        .slice(-1_200);
      reject(new Error(
        `${command} exited with code ${code ?? 'unknown'}${tail ? `: ${tail}` : ''}`,
      ));
    });
  });
}

async function writeRun(record, root = workspaceRoot) {
  const runPath = resolve(root, 'data/dev/cloudbase-publish-run.json');
  await mkdir(resolve(runPath, '..'), { recursive: true });
  await writeFile(runPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
}

async function executeCloudBasePublication({
  root = workspaceRoot,
  action = 'check',
  skipBuild = false,
  environment = process.env,
  onStage = () => {},
} = {}) {
  const local = await readLocalEnvironment(root);
  const config = resolveCloudBaseConfig({ environment, local });
  const checkedAt = new Date().toISOString();

  if (!skipBuild && action !== 'detail') {
    onStage('build');
    await run('npm', ['run', 'build:public'], root);
  }

  onStage('validate-bundle');
  const bundle = action === 'detail' && !(await pathExists(resolve(root, 'dist/client/index.html')))
    ? null
    : await inspectCloudBaseBundle(root);

  if (action === 'check') {
    const result = {
      checkedAt,
      status: config.envId ? 'ready' : 'configuration-required',
      action,
      config: {
        envId: config.envId || null,
        publicUrl: config.publicUrl || null,
      },
      bundle,
    };
    await writeRun(result, root);
    return result;
  }

  if (!config.envId) {
    throw new Error(
      'CLOUDBASE_ENV_ID is missing. Create .env.cloudbase.local from .env.cloudbase.example.',
    );
  }

  if (action === 'deploy') {
    onStage('upload');
    await run('tcb', [
      'hosting',
      'deploy',
      bundle.clientRoot,
      '-e',
      config.envId,
      '--concurrency',
      '5',
      '--retry-count',
      '3',
    ], root);
  }

  onStage('hosting-status');
  await run('tcb', ['hosting', 'detail', '-e', config.envId], root);

  if (action === 'deploy' && config.publicUrl) {
    onStage('public-verification');
    await run('node', [
      resolve(root, 'scripts/check-public-url.mjs'),
      config.publicUrl,
      '--verbose',
      `--expected-generated-at=${bundle.generatedAt}`,
      ...(bundle.entryAsset ? [`--expected-asset=${bundle.entryAsset}`] : []),
    ], root);
  }

  const result = {
    checkedAt,
    status: 'success',
    action,
    config: {
      envId: config.envId,
      publicUrl: config.publicUrl || null,
    },
    bundle,
  };
  await writeRun(result, root);
  return result;
}

export async function runCloudBasePublication(options = {}) {
  const root = options.root ?? workspaceRoot;
  const checkedAt = new Date().toISOString();
  let stage = 'configuration';
  try {
    return await executeCloudBasePublication({ ...options, onStage: (value) => { stage = value; } });
  } catch (error) {
    const message = (error instanceof Error ? error.message : String(error))
      .replace(/(access_token|secret|token|password|user_code)=([^\s&]+)/gi, '$1=[redacted]');
    await writeRun({ checkedAt, status: 'failed', action: options.action ?? 'check', stage, message }, root);
    throw error;
  }
}

const executedDirectly = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (executedDirectly) {
  const action = process.argv.includes('--deploy')
    ? 'deploy'
    : process.argv.includes('--detail')
      ? 'detail'
      : 'check';
  runCloudBasePublication({
    action,
    skipBuild: process.argv.includes('--skip-build'),
  }).then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (result.status === 'configuration-required') process.exitCode = 2;
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const relativeStatusPath = 'data/dev/sites-publish-request.json';

async function readJson(root, path, fallback = null) {
  try {
    return JSON.parse(await readFile(resolve(root, path), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

function fingerprint(main, catalog) {
  return createHash('sha256').update(JSON.stringify({ main, catalog })).digest('hex');
}

function currentAsOf(main = {}) {
  return {
    ai: main.asOf?.ai ?? null,
    github: main.asOf?.github ?? null,
    skills: main.asOf?.skills ?? null,
  };
}

export async function readSitesPublicationStatus(root = defaultRoot) {
  const status = await readJson(root, relativeStatusPath);
  return status ?? {
    state: 'not-prepared',
    message: '尚未准备 Sites 更新包。',
    requestedAt: null,
    deployedAt: null,
    deployedVersion: null,
    url: null,
  };
}

export async function prepareSitesPublication(root = defaultRoot) {
  const [main, catalog] = await Promise.all([
    readJson(root, 'data/main/index.json'),
    readJson(root, 'data/main/skills-catalog.json'),
  ]);
  if (!main || main.track !== 'main') throw new Error('data/main/index.json 缺失或不是 main 快照');
  if (!catalog || !Array.isArray(catalog.skills)) throw new Error('data/main/skills-catalog.json 缺失或无效');
  await access(resolve(root, 'dist/client/index.html'));
  await access(resolve(root, 'dist/server/index.js'));
  await access(resolve(root, 'dist/.openai/hosting.json'));

  const previous = await readSitesPublicationStatus(root);
  const mainHash = fingerprint(main, catalog);
  const requestedAt = new Date().toISOString();
  const state = previous.deployedHash === mainHash ? 'current' : 'pending';
  const record = {
    ...previous,
    state,
    requestedAt,
    mainHash,
    asOf: currentAsOf(main),
    counts: {
      projects: main.projects?.length ?? 0,
      aiEvents: main.aiEvents?.length ?? 0,
      skills: main.skills?.length ?? 0,
      catalogSkills: catalog.skills.length,
    },
    message: state === 'current'
      ? 'Sites 已与当前 main 数据一致，无需重新部署。'
      : 'Sites 更新包已准备，等待在 Codex 中执行独立部署。',
  };
  const path = resolve(root, relativeStatusPath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return record;
}

export async function markSitesDeployed({ root = defaultRoot, version = null, url = null } = {}) {
  const [main, catalog, previous] = await Promise.all([
    readJson(root, 'data/main/index.json'),
    readJson(root, 'data/main/skills-catalog.json'),
    readSitesPublicationStatus(root),
  ]);
  if (!main || !catalog) throw new Error('main 数据缺失，无法记录 Sites 部署状态');
  const deployedAt = new Date().toISOString();
  const mainHash = fingerprint(main, catalog);
  const record = {
    ...previous,
    state: 'deployed',
    mainHash,
    deployedHash: mainHash,
    asOf: currentAsOf(main),
    deployedAt,
    deployedVersion: version,
    url,
    message: 'Sites 已完成独立部署。',
  };
  const path = resolve(root, relativeStatusPath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return record;
}

const executedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executedDirectly) {
  const markDeployed = process.argv.includes('--mark-deployed');
  const value = (name) => process.argv.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
  const task = markDeployed
    ? markSitesDeployed({ version: value('--version'), url: value('--url') })
    : prepareSitesPublication();
  task.then((record) => console.log(JSON.stringify(record, null, 2))).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { appendFile, readFile, rename, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canRecoverPublicUrl, createHealthTransport } from './health-network.mjs';
import { evaluateSkillsPublication, readSkillsReview } from './skills-source-policy.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultPort = 43_127;
const defaultIntervalMs = 30_000;
const recoveryCooldownMs = 60_000;
const tunnelStabilityChecks = 3;
const logPath = resolve(root, '.tmp-local-watchdog.log');
const envPath = resolve(root, '.env.dingtalk.local');
const localRecoveryScript = resolve(root, 'scripts/start-local.ps1');
const tunnelRecoveryScript = resolve(root, 'scripts/ensure-public-link.ps1');
const devDataPaths = {
  ai: resolve(root, 'data/dev/ai-events-latest.json'),
  github: resolve(root, 'data/dev/github-radar-latest.json'),
  skills: resolve(root, 'data/dev/skills-radar-latest.json'),
  papers: resolve(root, 'data/dev/ai-papers-latest.json'),
};
const mainDataPath = resolve(root, 'data/main/index.json');

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function summarizeHealth(endpoints) {
  const unhealthy = endpoints.filter((endpoint) => !(endpoint.stable ?? endpoint.healthy));
  return {
    status: unhealthy.length ? 'degraded' : 'healthy',
    healthy: unhealthy.length === 0,
    unhealthy: unhealthy.map((endpoint) => endpoint.name),
  };
}

export function updateEndpointHistory(previousEndpoints, currentEndpoints) {
  const previous = new Map(previousEndpoints.map((endpoint) => [endpoint.name, endpoint]));
  return currentEndpoints.map((endpoint) => {
    const prior = previous.get(endpoint.name);
    const successStreak = endpoint.healthy ? Number(prior?.successStreak ?? 0) + 1 : 0;
    const failureStreak = endpoint.healthy ? 0 : Number(prior?.failureStreak ?? 0) + 1;
    const requiresStability = endpoint.name.startsWith('public-tunnel');
    const stable = endpoint.healthy && (!requiresStability || successStreak >= tunnelStabilityChecks);
    return {
      ...endpoint,
      successStreak,
      failureStreak,
      stable,
      message: endpoint.healthy && !stable
        ? `Awaiting stability ${successStreak}/${tunnelStabilityChecks}`
        : endpoint.message,
    };
  });
}

export function buildHealthPayload(state, now = new Date()) {
  return {
    service: 'ark.insight-local-watchdog',
    status: state.status,
    port: state.port,
    pid: process.pid,
    uptimeSeconds: Math.floor(process.uptime()),
    startedAt: state.startedAt,
    checkedAt: state.checkedAt,
    lastHealthyAt: state.lastHealthyAt,
    lastRecoveryAt: state.lastRecoveryAt,
    recoveryCount: state.recoveryCount,
    recovery: state.recovery,
    endpoints: state.endpoints,
    generatedAt: now.toISOString(),
  };
}

export function shanghaiClock(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function evaluateDataFreshness({ today, minutes, devChannels, main }) {
  const devDue = minutes >= 8 * 60 + 20;
  const mainDue = minutes >= 10 * 60;
  const staleDev = Object.entries(devChannels)
    .filter(([name, channel]) => channel.asOf !== today || (channel.status !== 'success'
      && !(name === 'skills' && channel.publicationReady === true)))
    .map(([name]) => name);
  const staleMain = ['ai', 'github', 'skills'].filter((name) => main.asOf?.[name] !== today);
  return {
    devDue,
    mainDue,
    staleDev,
    staleMain,
    healthy: (!devDue || staleDev.length === 0) && (!mainDue || staleMain.length === 0),
  };
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

async function checkDataFreshness(now = new Date()) {
  const clock = shanghaiClock(now);
  const [ai, github, skills, papers, main] = await Promise.all([
    readJson(devDataPaths.ai),
    readJson(devDataPaths.github),
    readJson(devDataPaths.skills),
    readJson(devDataPaths.papers),
    readJson(mainDataPath),
  ]);
  const devChannels = {
    ai: { asOf: ai?.asOf ?? null, status: ai?.run?.status ?? 'missing' },
    github: { asOf: github?.asOf ?? null, status: github?.run?.status ?? 'missing' },
    skills: { asOf: skills?.asOf ?? null, status: skills?.run?.status ?? 'missing' },
    papers: { asOf: papers?.asOf ?? null, status: papers?.run?.status ?? 'missing' },
  };
  const skillsPublication = evaluateSkillsPublication(skills, await readSkillsReview(root, skills));
  devChannels.skills.publicationReady = skillsPublication.ready;
  devChannels.skills.notices = skillsPublication.notices;
  const result = evaluateDataFreshness({
    today: clock.date,
    minutes: clock.minutes,
    devChannels,
    main: { asOf: main?.asOf ?? {} },
  });
  const problems = [];
  if (result.devDue && result.staleDev.length) problems.push(`dev stale: ${result.staleDev.join(', ')}`);
  if (result.mainDue && result.staleMain.length) problems.push(`main stale: ${result.staleMain.join(', ')}`);
  return {
    name: 'daily-data',
    url: null,
    healthy: result.healthy,
    statusCode: null,
    latencyMs: 0,
    checkedAt: now.toISOString(),
    message: result.healthy ? `Current for ${clock.date}` : problems.join('; '),
    date: clock.date,
    devChannels,
    mainAsOf: main?.asOf ?? null,
  };
}
async function appendLog(message) {
  try {
    const current = await stat(logPath).catch(() => null);
    if (current?.size > 2 * 1024 * 1024) {
      await rm(`${logPath}.1`, { force: true });
      await rename(logPath, `${logPath}.1`);
    }
    await appendFile(logPath, `${new Date().toISOString()} ${message}\n`, 'utf8');
  } catch {
    // The health endpoint remains useful even when its optional log cannot be written.
  }
}

async function readPublicUrl() {
  try {
    const content = await readFile(envPath, 'utf8');
    return content.match(/^WAGMI_PUBLIC_URL=(.+)$/m)?.[1]?.trim().replace(/\/+$/, '') ?? null;
  } catch {
    return null;
  }
}

export async function checkEndpoint({ name, url, validate, timeoutMs = 5_000, dispatcher, recoverable = true, fetchImpl = fetch }) {
  const startedAt = performance.now();
  const checkedAt = new Date().toISOString();
  if (!url) {
    return { name, url: null, healthy: false, statusCode: null, latencyMs: 0, checkedAt, message: 'URL is not configured', recoverable: false };
  }

  const controller = new AbortController();
  let deadlineTimer;
  const deadline = new Promise((_, reject) => {
    deadlineTimer = setTimeout(() => {
      controller.abort();
      reject(new Error('Health probe timed out'));
    }, timeoutMs);
  });
  try {
    const { response, body } = await Promise.race([
      (async () => {
        const response = await fetchImpl(url, {
          dispatcher,
          cache: 'no-store',
          headers: { Accept: 'text/html,application/json;q=0.9,*/*;q=0.8' },
          redirect: 'follow',
          signal: controller.signal,
        });
        const body = await response.text();
        return { response, body };
      })(),
      deadline,
    ]);
    const validation = validate ? validate(body, response) : true;
    const contentValid = typeof validation === 'boolean' ? validation : validation.healthy;
    const healthy = response.ok && contentValid;
    return {
      name,
      url,
      healthy,
      statusCode: response.status,
      latencyMs: Math.round(performance.now() - startedAt),
      checkedAt,
      message: !response.ok ? `HTTP ${response.status}` : validation.message ?? (healthy ? 'OK' : 'Unexpected response content'),
      recoverable: recoverable && (validation.recoverable ?? true),
    };
  } catch (error) {
    return {
      name,
      url,
      healthy: false,
      statusCode: null,
      latencyMs: Math.round(performance.now() - startedAt),
      checkedAt,
      message: error instanceof Error ? `${error.message}${error.cause?.code ? ` (${error.cause.code})` : ''}` : 'Request failed',
      recoverable,
    };
  } finally {
    clearTimeout(deadlineTimer);
  }
}

export function comparePublicSnapshot(body, main) {
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    return { healthy: false, message: 'Public main is not JSON', recoverable: true };
  }
  if (data?.track !== 'main' || !Array.isArray(data.projects) || !Array.isArray(data.aiEvents)) {
    return { healthy: false, message: 'Public main has an invalid data contract', recoverable: false };
  }
  if (!main?.generatedAt) {
    return { healthy: false, message: 'Local main version is unavailable', recoverable: false };
  }
  const differences = [];
  if (data.generatedAt !== main.generatedAt) differences.push(`generatedAt ${data.generatedAt ?? 'missing'} (expected ${main.generatedAt})`);
  for (const channel of ['ai', 'github', 'skills']) {
    if (data.asOf?.[channel] !== main.asOf?.[channel]) differences.push(`${channel} ${data.asOf?.[channel] ?? 'missing'} (expected ${main.asOf?.[channel]})`);
  }
  for (const field of ['projects', 'aiEvents', 'skills', 'reports', 'githubTrendCandidates']) {
    if ((data[field]?.length ?? 0) !== (main[field]?.length ?? 0)) differences.push(`${field} count mismatch`);
  }
  return {
    healthy: differences.length === 0,
    message: differences.length ? `CloudBase publication mismatch: ${differences.join('; ')}` : `Public main matches ${main.generatedAt}`,
    // Restarting the local server cannot repair an out-of-date cloud deployment.
    recoverable: false,
  };
}

async function probeEndpoints(transport) {
  const [publicUrl, main] = await Promise.all([readPublicUrl(), readJson(mainDataPath)]);
  transport.refresh();
  const publicRecoverable = canRecoverPublicUrl(publicUrl);
  return Promise.all([
    checkEndpoint({
      name: 'admin',
      url: 'http://127.0.0.1:5174/',
      dispatcher: transport.dispatcher('http://127.0.0.1:5174/'),
      validate: (body) => /ark\.insight/i.test(body),
    }),
    checkEndpoint({
      name: 'public',
      url: 'http://127.0.0.1:8080/',
      dispatcher: transport.dispatcher('http://127.0.0.1:8080/'),
      validate: (body) => /ark\.insight/i.test(body),
    }),
    checkEndpoint({
      name: 'main-data',
      url: 'http://127.0.0.1:8080/data/main/index.json',
      dispatcher: transport.dispatcher('http://127.0.0.1:8080/'),
      validate: (body) => {
        try {
          const data = JSON.parse(body);
          return Array.isArray(data.projects) && Array.isArray(data.aiEvents);
        } catch {
          return false;
        }
      },
    }),
    checkEndpoint({
      name: 'public-tunnel',
      url: publicUrl ? `${publicUrl}/` : null,
      dispatcher: publicUrl ? transport.dispatcher(publicUrl) : undefined,
      recoverable: publicRecoverable,
      validate: (body) => /ark\.insight/i.test(body),
    }),
    checkEndpoint({
      name: 'public-tunnel-data',
      url: publicUrl ? `${publicUrl}/data/main/index.json?__ark_health=${Date.now()}` : null,
      dispatcher: publicUrl ? transport.dispatcher(publicUrl) : undefined,
      recoverable: publicRecoverable,
      timeoutMs: 15_000,
      validate: (body) => comparePublicSnapshot(body, main),
    }),
    checkDataFreshness(),
  ]);
}

function runPowerShell(script, args = []) {
  const powershell = resolve(process.env.SystemRoot ?? 'C:\\Windows', 'System32/WindowsPowerShell/v1.0/powershell.exe');
  return new Promise((resolveRun) => {
    const child = spawn(powershell, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, ...args], {
      cwd: root,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', (chunk) => void appendLog(`[recovery] ${String(chunk).trim()}`));
    child.stderr.on('data', (chunk) => void appendLog(`[recovery:error] ${String(chunk).trim()}`));
    child.once('error', (error) => resolveRun({ exitCode: -1, message: error.message }));
    child.once('close', (exitCode) => resolveRun({ exitCode: exitCode ?? -1, message: exitCode === 0 ? 'Recovery completed' : `Recovery exited with code ${exitCode}` }));
  });
}

function createState(port) {
  return {
    port,
    status: 'starting',
    startedAt: new Date().toISOString(),
    checkedAt: null,
    lastHealthyAt: null,
    lastRecoveryAt: null,
    recoveryCount: 0,
    recovery: null,
    endpoints: [],
  };
}

export async function startWatchdog(options = {}) {
  const host = '127.0.0.1';
  const port = positiveInteger(options.port ?? argumentValue('--port') ?? process.env.ARK_WATCHDOG_PORT, defaultPort);
  const intervalMs = positiveInteger(options.intervalMs ?? argumentValue('--interval-ms') ?? process.env.ARK_WATCHDOG_INTERVAL_MS, defaultIntervalMs);
  const state = createState(port);
  const transport = createHealthTransport();
  let previousStatus = state.status;
  let recoveryPromise = null;
  let lastRecoveryStarted = 0;
  let timer = null;
  let stopping = false;

  const server = createServer((request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    if (request.url === '/live') {
      response.statusCode = 200;
      response.end(JSON.stringify(buildHealthPayload(state), null, 2));
      return;
    }
    if (request.url === '/' || request.url === '/health') {
      response.statusCode = state.status === 'healthy' ? 200 : 503;
      response.end(JSON.stringify(buildHealthPayload(state), null, 2));
      return;
    }
    response.statusCode = 404;
    response.end(JSON.stringify({ error: 'Not found' }));
  });

  async function updateState() {
    state.endpoints = updateEndpointHistory(state.endpoints, await probeEndpoints(transport));
    state.checkedAt = new Date().toISOString();
    const summary = summarizeHealth(state.endpoints);
    state.status = recoveryPromise ? 'recovering' : summary.status;
    if (summary.healthy) state.lastHealthyAt = state.checkedAt;
    if (state.status !== previousStatus) {
      await appendLog(`status ${previousStatus} -> ${state.status}${summary.unhealthy.length ? `; unhealthy=${summary.unhealthy.join(',')}` : ''}`);
      previousStatus = state.status;
    }
    return summary;
  }

  async function recover(unhealthy) {
    const localNames = new Set(['admin', 'public', 'main-data']);
    const recoverable = unhealthy.filter((name) => name !== 'daily-data');
    if (!recoverable.length) {
      await appendLog('daily data is stale; waiting for the scheduled collection or manual review');
      return;
    }
    const localDown = recoverable.some((name) => localNames.has(name));
    const script = localDown ? localRecoveryScript : tunnelRecoveryScript;
    const args = localDown && existsSync(resolve(root, 'dist/client/index.html')) ? ['-SkipBuild'] : [];
    state.status = 'recovering';
    state.lastRecoveryAt = new Date().toISOString();
    state.recoveryCount += 1;
    state.recovery = { target: localDown ? 'local-stack' : 'public-tunnel', status: 'running', exitCode: null, message: null };
    await appendLog(`recovery ${state.recoveryCount} started for ${recoverable.join(',')}`);
    const result = await runPowerShell(script, args);
    state.recovery = {
      ...state.recovery,
      status: result.exitCode === 0 ? 'completed' : 'failed',
      exitCode: result.exitCode,
      message: result.message,
    };
    await appendLog(`recovery ${state.recoveryCount} ${state.recovery.status}: ${result.message}`);
  }

  async function cycle() {
    try {
      const summary = await updateState();
      const canRecover = Date.now() - lastRecoveryStarted >= recoveryCooldownMs;
      const recoveryTargets = state.endpoints
        .filter((endpoint) => !endpoint.healthy)
        .filter((endpoint) => endpoint.recoverable !== false)
        .filter((endpoint) => endpoint.name !== 'daily-data')
        .filter((endpoint) => endpoint.failureStreak >= 3)
        .map((endpoint) => endpoint.name);
      if (recoveryTargets.length && !recoveryPromise && canRecover) {
        lastRecoveryStarted = Date.now();
        recoveryPromise = recover(recoveryTargets);
        await recoveryPromise;
        recoveryPromise = null;
        await new Promise((resolveWait) => setTimeout(resolveWait, 2_000));
        await updateState();
      }
    } catch (error) {
      state.status = 'degraded';
      await appendLog(`watchdog cycle failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (!stopping) timer = setTimeout(() => void cycle(), intervalMs);
    }
  }

  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    if (timer) clearTimeout(timer);
    void transport.close().catch(() => {});
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5_000).unref();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(port, host, resolveListen);
  });
  await appendLog(`watchdog listening on http://${host}:${port}/health (pid ${process.pid})`);
  void cycle();
  return { server, state };
}

const executedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executedDirectly) {
  startWatchdog().catch(async (error) => {
    await appendLog(`watchdog startup failed: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

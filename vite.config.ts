import { execFile } from 'node:child_process';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { mergeDevSnapshot } from './scripts/merge-dev-data.mjs';
import { loadLocalReports, readLocalReport } from './scripts/local-reports.mjs';
import { buildEmbeddedSitesWorker } from './scripts/build-embedded-sites-worker.mjs';
import { validateCandidateDecision, writeCandidateDecision } from './scripts/candidate-decisions.mjs';
import { runPublication } from './scripts/publication.mjs';
import { preparePromotion, writePromotion } from './scripts/promotion.mjs';
import { prepareSitesPublication, readSitesPublicationStatus } from './scripts/sites-publication.mjs';
import { appendSourceChannel, validateSourceChannel } from './scripts/source-watchlist.mjs';
import { queuePaperReview, validatePaperReviewRequest } from './scripts/paper-review-requests.mjs';

const workspaceRoot = resolve(__dirname);
const execFileAsync = promisify(execFile);

async function readJson<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(resolve(workspaceRoot, path), 'utf8')) as T;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return null;
    throw error;
  }
}

function sendJson(response: import('node:http').ServerResponse, status: number, payload: unknown) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

function isLocalRequest(request: import('node:http').IncomingMessage) {
  if (request.headers['x-forwarded-host'] || request.headers.forwarded) return false;
  const host = request.headers.host ?? '';
  const hostname = host.startsWith('[')
    ? host.slice(1, host.indexOf(']'))
    : host.split(':')[0];
  if (!['127.0.0.1', 'localhost', '::1'].includes(hostname.toLowerCase())) return false;
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    return ['127.0.0.1', 'localhost', '::1'].includes(new URL(origin).hostname.toLowerCase());
  } catch {
    return false;
  }
}

async function readRequestBody(request: import('node:http').IncomingMessage) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 65_536) throw new Error('Request body is too large');
  }
  return body ? JSON.parse(body) as Record<string, unknown> : {};
}

function adminDataPlugin(): Plugin {
  async function loadAdminSnapshot() {
    const main = await readJson<Record<string, unknown>>('data/main/index.json');
    if (!main) throw new Error('Missing data/main/index.json');

    const override = (await readJson<Record<string, unknown>>('data/dev/index.json')) ?? {};
    const candidates = (await readJson<unknown[]>('data/dev/candidates.json')) ?? [];
    const candidateDecisions = (await readJson<unknown[]>('data/dev/candidate-decisions.json')) ?? [];
    const aiLatest = await readJson<{ generatedAt?: string; asOf?: string; aiEvents?: unknown[]; candidates?: unknown[]; run?: { id?: string }; report?: { id?: string } }>('data/dev/ai-events-latest.json');
    const githubLatest = await readJson<{ generatedAt?: string; asOf?: string; projects?: unknown[]; candidates?: unknown[]; run?: { id?: string }; report?: { id?: string } }>('data/dev/github-radar-latest.json');
    const githubTrends = await readJson<{ candidates?: unknown[] }>('data/dev/github-trend-candidates.json');
    const weeklyLatest = await readJson<Record<string, unknown> & { report?: { id?: string } }>('data/dev/ai-weekly-latest.json');
    const skillsLatest = await readJson<{ generatedAt?: string; asOf?: string; skills?: unknown[]; candidates?: unknown[]; run?: { id?: string }; report?: { id?: string } }>('data/dev/skills-radar-latest.json');
    const dingtalkRun = await readJson<Record<string, unknown>>('data/dev/dingtalk-run.json');
    const creatorWatchlist = await readJson<{ channels?: unknown[] }>('ai-creator-watchlist-2026.json');
    const modelWatchlist = await readJson<{ models?: unknown[] }>('model-industry-watchlist.json');
    const snapshot = mergeDevSnapshot({
      main,
      override,
      candidates,
      candidateDecisions,
      creators: creatorWatchlist?.channels ?? [],
      models: modelWatchlist?.models ?? [],
      aiLatest,
      githubLatest,
      githubTrends,
      weeklyLatest,
      skillsLatest,
      dingtalkRun,
    });
    return { ...snapshot, localReports: await loadLocalReports(workspaceRoot) };
  }

  return {
    name: 'wagmi-admin-data',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const match = request.url?.match(/^\/__admin\/reports\/([^/?#]+)(?:[?#].*)?$/);
        if (!match) return next();
        if (!isLocalRequest(request)) return sendJson(response, 403, { error: 'Local admin access required' });
        if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'GET required' });
        try {
          const result = await readLocalReport(workspaceRoot, decodeURIComponent(match[1]));
          if (!result) return sendJson(response, 404, { error: 'Local report does not exist' });
          response.statusCode = 200;
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.setHeader('Content-Disposition', 'inline');
          response.setHeader('Cache-Control', 'no-store, private');
          response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
          response.setHeader('X-Content-Type-Options', 'nosniff');
          response.setHeader('Referrer-Policy', 'no-referrer');
          response.setHeader('Content-Security-Policy', "default-src 'none'; img-src data: blob: https:; media-src data: blob: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:; connect-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'");
          response.end(request.method === 'HEAD' ? undefined : result.html);
        } catch (error) {
          sendJson(response, 500, { error: error instanceof Error ? error.message : 'Unknown local report error' });
        }
      });
      server.middlewares.use('/__admin/data/index.json', async (_request, response) => {
        try {
          const snapshot = await loadAdminSnapshot();

          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.setHeader('Cache-Control', 'no-store');
          response.end(JSON.stringify(snapshot));
        } catch (error) {
          response.statusCode = 500;
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown data error' }));
        }
      });
      server.middlewares.use('/__admin/data/skills-catalog.json', async (_request, response) => {
        try {
          const catalog = await readJson<Record<string, unknown>>('data/dev/skills-catalog.json');
          if (!catalog) return sendJson(response, 404, { error: 'Skill catalog is missing' });
          sendJson(response, 200, catalog);
        } catch (error) {
          sendJson(response, 500, { error: error instanceof Error ? error.message : 'Unknown Skill catalog error' });
        }
      });
      server.middlewares.use('/__admin/data/papers-catalog.json', async (_request, response) => {
        try {
          const catalog = await readJson<Record<string, unknown>>('data/dev/papers-catalog.json');
          if (!catalog) return sendJson(response, 404, { error: 'Paper catalog is missing' });
          sendJson(response, 200, catalog);
        } catch (error) {
          sendJson(response, 500, { error: error instanceof Error ? error.message : 'Unknown paper catalog error' });
        }
      });
      server.middlewares.use('/__admin/papers/review-now', async (request, response) => {
        if (!isLocalRequest(request)) return sendJson(response, 403, { error: 'Local admin origin required' });
        if (request.method !== 'POST') return sendJson(response, 405, { error: 'POST required' });
        try {
          const body = await readRequestBody(request);
          const errors = validatePaperReviewRequest(body);
          if (errors.length) return sendJson(response, 400, { error: 'Paper review request is invalid', errors });
          const paperId = String(body.paperId);
          const catalog = await readJson<{ papers?: Array<{ id?: string; reviewStatus?: string }> }>('data/dev/papers-catalog.json');
          const paper = catalog?.papers?.find((item) => item.id === paperId);
          if (!paper) return sendJson(response, 404, { error: 'Paper does not exist' });
          if (paper.reviewStatus === 'interpreted' || paper.reviewStatus === 'verified') {
            return sendJson(response, 409, { error: 'Paper has already been interpreted' });
          }

          const queued = await queuePaperReview(workspaceRoot, paperId);
          await execFileAsync(process.execPath, ['scripts/sync-paper-catalog.mjs'], {
            cwd: workspaceRoot,
            windowsHide: true,
            maxBuffer: 4 * 1024 * 1024,
          });
          const updatedCatalog = await readJson<Record<string, unknown>>('data/dev/papers-catalog.json');
          sendJson(response, 200, {
            ok: true,
            created: queued.created,
            request: queued.request,
            catalog: updatedCatalog,
          });
        } catch (error) {
          sendJson(response, 500, { error: error instanceof Error ? error.message : 'Paper review request failed' });
        }
      });
      server.middlewares.use('/__admin/candidates/decision', async (request, response) => {
        if (!isLocalRequest(request)) return sendJson(response, 403, { error: 'Local admin origin required' });
        if (request.method !== 'POST') return sendJson(response, 405, { error: 'POST required' });
        try {
          const body = await readRequestBody(request);
          const errors = validateCandidateDecision(body);
          if (errors.length) return sendJson(response, 400, { error: 'Candidate decision is invalid', errors });
          const snapshot = await loadAdminSnapshot() as { candidates?: { id?: string }[] };
          if (!snapshot.candidates?.some((candidate) => candidate.id === body.id)) {
            return sendJson(response, 404, { error: 'Candidate does not exist' });
          }
          const decision = await writeCandidateDecision(workspaceRoot, body);
          sendJson(response, 200, { ok: true, decision });
        } catch (error) {
          sendJson(response, 500, { error: error instanceof Error ? error.message : 'Unknown candidate decision error' });
        }
      });
      server.middlewares.use('/__admin/sources', async (request, response) => {
        if (!isLocalRequest(request)) return sendJson(response, 403, { error: 'Local admin origin required' });
        if (request.method !== 'POST') return sendJson(response, 405, { error: 'POST required' });
        try {
          const body = await readRequestBody(request);
          const errors = validateSourceChannel(body);
          if (errors.length) return sendJson(response, 400, { error: 'Source channel is invalid', errors });
          const source = await appendSourceChannel(workspaceRoot, body);
          sendJson(response, 200, { ok: true, source });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown source channel error';
          sendJson(response, message === 'source channel already exists' ? 409 : 500, { error: message });
        }
      });
      server.middlewares.use('/__admin/publish/status', async (request, response) => {
        if (!isLocalRequest(request)) return sendJson(response, 403, { error: 'Local admin origin required' });
        try {
          const prepared = await preparePromotion(workspaceRoot);
          sendJson(response, 200, {
            ready: prepared.errors.length === 0,
            requiresWarningApproval: prepared.warnings.length > 0,
            errors: prepared.errors,
            warnings: prepared.warnings,
            current: { generatedAt: prepared.previous?.generatedAt, asOf: prepared.previous?.asOf },
            preview: prepared.snapshot ? {
              generatedAt: prepared.snapshot.generatedAt,
              asOf: prepared.snapshot.asOf,
              counts: {
                projects: prepared.snapshot.projects.length,
                aiEvents: prepared.snapshot.aiEvents.length,
                skills: prepared.snapshot.skills.length,
                reports: prepared.snapshot.reports.length,
                weeklySummaries: prepared.snapshot.weeklySummaries?.length ?? 0,
              },
            } : null,
          });
        } catch (error) {
          sendJson(response, 500, { error: error instanceof Error ? error.message : 'Unknown promotion error' });
        }
      });
      server.middlewares.use('/__admin/publish', async (request, response) => {
        if (!isLocalRequest(request)) return sendJson(response, 403, { error: 'Local admin origin required' });
        if (request.method !== 'POST') return sendJson(response, 405, { error: 'POST required' });
        try {
          const body = await readRequestBody(request);
          const prepared = await preparePromotion(workspaceRoot);
          if (prepared.errors.length) return sendJson(response, 400, { error: 'Promotion validation failed', errors: prepared.errors, warnings: prepared.warnings });
          if (prepared.warnings.length && body.allowWarnings !== true) {
            return sendJson(response, 409, { error: 'Warnings require explicit approval', warnings: prepared.warnings });
          }
          const manifest = await writePromotion(prepared);
          try {
            const publication = await runPublication({
              root: workspaceRoot,
              action: 'deploy',
            });
            sendJson(response, 200, { ok: true, manifest, publication });
          } catch (error) {
            sendJson(response, 502, {
              error: `main 已更新，但网站发布验证失败：${error instanceof Error ? error.message : 'Unknown publication error'}`,
              manifest,
            });
          }
        } catch (error) {
          sendJson(response, 500, { error: error instanceof Error ? error.message : 'Unknown promotion error' });
        }
      });
      server.middlewares.use('/__admin/sites/status', async (request, response) => {
        if (!isLocalRequest(request)) return sendJson(response, 403, { error: 'Local admin origin required' });
        if (request.method !== 'GET') return sendJson(response, 405, { error: 'GET required' });
        try {
          sendJson(response, 200, await readSitesPublicationStatus(workspaceRoot));
        } catch (error) {
          sendJson(response, 500, { error: error instanceof Error ? error.message : 'Unknown Sites status error' });
        }
      });
      server.middlewares.use('/__admin/sites/prepare', async (request, response) => {
        if (!isLocalRequest(request)) return sendJson(response, 403, { error: 'Local admin origin required' });
        if (request.method !== 'POST') return sendJson(response, 405, { error: 'POST required' });
        try {
          const executable = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : 'npm';
          const args = process.platform === 'win32'
            ? ['/d', '/s', '/c', 'npm.cmd run build:public']
            : ['run', 'build:public'];
          await execFileAsync(executable, args, {
            cwd: workspaceRoot,
            windowsHide: true,
            maxBuffer: 4 * 1024 * 1024,
          });
          const status = await prepareSitesPublication(workspaceRoot);
          sendJson(response, 200, { ok: true, status });
        } catch (error) {
          sendJson(response, 500, { error: error instanceof Error ? error.message : 'Sites package preparation failed' });
        }
      });
    },
  };
}

function sitesOutputPlugin(): Plugin {
  return {
    name: 'wagmi-sites-output',
    apply: 'build',
    async closeBundle() {
      const distRoot = resolve(workspaceRoot, 'dist');
      await mkdir(resolve(distRoot, 'server'), { recursive: true });
      await mkdir(resolve(distRoot, '.openai'), { recursive: true });
      await buildEmbeddedSitesWorker(resolve(distRoot, 'client'), resolve(distRoot, 'server/index.js'));
      await copyFile(resolve(workspaceRoot, '.openai/hosting.json'), resolve(distRoot, '.openai/hosting.json'));
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === 'admin' ? [adminDataPlugin()] : []),
    ...(mode === 'public' ? [sitesOutputPlugin()] : []),
  ],
  server: {
    allowedHosts: mode === 'admin' ? ['127.0.0.1', 'localhost'] : true,
  },
  preview: {
    allowedHosts: true,
  },
  build: mode === 'public' ? { outDir: 'dist/client' } : undefined,
}));

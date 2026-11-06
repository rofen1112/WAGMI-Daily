import { createReadStream, existsSync } from 'node:fs';
import { readFile, realpath, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { brotliCompress, constants, gzip } from 'node:zlib';
import { createPublicLabProxy } from './public-lab-proxy.mjs';

const compressBrotli = promisify(brotliCompress);
const compressGzip = promisify(gzip);
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'], ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.md', 'text/plain; charset=utf-8'], ['.txt', 'text/plain; charset=utf-8'],
  ['.png', 'image/png'], ['.ico', 'image/x-icon'], ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'], ['.svg', 'image/svg+xml'], ['.webp', 'image/webp'],
  ['.woff', 'font/woff'], ['.woff2', 'font/woff2'],
]);
const compressibleExtensions = new Set(['.css', '.html', '.js', '.json', '.md', '.svg', '.txt']);
const publicRoutes = new Set(['', 'today', 'ai', 'github', 'skills', 'papers', 'ai-lab']);

function safePublicPath(pathname) {
  if (!pathname.startsWith('/') || /[\\\u0000-\u001f\u007f:]/.test(pathname)) return false;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.some((part) => /^[._]/.test(part) || /[. ]$/.test(part)
    || /^(?:admin|private|dev|node_modules|watchlist|operations)$/i.test(part))) return false;
  if (parts.length === 1 && ['index.html', 'robots.txt', 'favicon.ico', 'favicon.svg'].includes(parts[0])) return true;
  if (['assets', 'brand', 'reports'].includes(parts[0])) return true;
  return parts[0] === 'data' && parts[1] === 'main';
}

function isInside(root, file) {
  const path = relative(root, file);
  return path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

async function resolvePublicFile(root, rawUrl) {
  // Do not normalize URL dot segments before checking them, including encoded ones.
  let pathname;
  try { pathname = decodeURIComponent(rawUrl.split(/[?#]/, 1)[0]); } catch { return null; }
  const route = pathname.replace(/^\//, '').replace(/\/$/, '');
  if (publicRoutes.has(route) && /^\/(?:today|ai|github|skills|papers|ai-lab)?\/?$/.test(pathname)) pathname = '/index.html';
  if (!safePublicPath(pathname)) return null;
  const requested = resolve(root, `.${pathname}`);
  if (!isInside(root, requested)) return null;
  try {
    const [canonicalRoot, canonicalFile] = await Promise.all([realpath(root), realpath(requested)]);
    if (!isInside(canonicalRoot, canonicalFile)) return null;
    const canonicalPublicPath = `/${relative(canonicalRoot, canonicalFile).split(sep).join('/')}`;
    if (!safePublicPath(canonicalPublicPath)) return null;
    const info = await stat(canonicalFile);
    return info.isFile() ? { filePath: canonicalFile, pathname, info } : null;
  } catch (error) {
    if (['ENOENT', 'ENOTDIR', 'EACCES', 'EPERM'].includes(error.code)) return null;
    throw error;
  }
}

function negotiateEncoding(header, compressible) {
  if (!header?.trim()) return 'identity';
  const qualities = new Map();
  for (const entry of header.split(',')) {
    const [name, ...parameters] = entry.trim().toLowerCase().split(';');
    if (!name) continue;
    let quality = 1;
    for (const parameter of parameters) {
      const match = parameter.trim().match(/^q\s*=\s*(.*)$/);
      if (match) quality = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(match[1]) ? Number(match[1]) : 0;
    }
    qualities.set(name, Math.min(qualities.get(name) ?? 1, quality));
  }
  const codings = compressible ? ['br', 'gzip'] : [];
  const choices = codings.map((name) => ({ name, quality: qualities.get(name) ?? qualities.get('*') ?? 0 }));
  // Identity remains the fallback unless explicitly preferred or prohibited.
  const positive = choices.filter(({ quality }) => quality > 0).map(({ quality }) => quality);
  const identityQuality = qualities.get('identity')
    ?? (qualities.get('*') === 0 ? 0 : Math.min(1, ...positive));
  choices.push({ name: 'identity', quality: identityQuality });
  return choices.filter(({ quality }) => quality > 0).sort((a, b) => b.quality - a.quality)[0]?.name ?? null;
}

function versionOf(info) {
  return `${info.size}:${info.mtimeMs}:${info.ctimeMs}:${info.ino}`;
}

function etagFor(info, encoding) {
  const version = createHash('sha256').update(versionOf(info)).digest('base64url').slice(0, 24);
  // A metadata validator is deliberately weak; compressed representations differ.
  return `W/"${version}-${encoding}"`;
}

function notModified(headers, etag, mtimeMs) {
  if (headers['if-none-match'] !== undefined) {
    const normalize = (value) => value.trim().replace(/^W\//, '');
    return headers['if-none-match'].split(',').some((value) => value.trim() === '*' || normalize(value) === normalize(etag));
  }
  const since = Date.parse(headers['if-modified-since'] ?? '');
  return Number.isFinite(since) && Math.floor(mtimeMs / 1000) <= Math.floor(since / 1000);
}

function cacheControl(pathname) {
  if (pathname === '/index.html' || pathname.startsWith('/data/main/')) return 'public, max-age=0, must-revalidate';
  if (pathname.startsWith('/assets/')) return 'public, max-age=31536000, immutable';
  return 'public, max-age=300';
}

function createCompressionCache({ maxCacheBytes, maxCacheEntries }) {
  const entries = new Map();
  const pending = new Map();
  const waiters = [];
  let bytes = 0;
  let active = 0;
  const remove = (key) => { bytes -= entries.get(key)?.body.length ?? 0; entries.delete(key); };
  async function acquire() {
    if (active >= 2) await new Promise((resume) => waiters.push(resume));
    else active += 1;
  }
  function release() {
    const next = waiters.shift();
    if (next) next();
    else active -= 1;
  }
  return async (filePath, info, encoding) => {
    const version = versionOf(info);
    const key = `${filePath}\0${encoding}`;
    const cached = entries.get(key);
    if (cached?.version === version) {
      entries.delete(key); entries.set(key, cached);
      return cached.body;
    }
    if (cached) remove(key);
    const pendingKey = `${key}\0${version}`;
    if (pending.has(pendingKey)) return pending.get(pendingKey);
    if (pending.size >= 128) throw Object.assign(new Error('Compression queue full'), { statusCode: 503 });
    const operation = (async () => {
      await acquire();
      try {
        const input = await readFile(filePath);
        const body = encoding === 'br'
          ? await compressBrotli(input, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })
          : await compressGzip(input, { level: 6 });
        if (versionOf(await stat(filePath)) !== version) throw Object.assign(new Error('File changed during compression'), { statusCode: 503 });
        if (body.length <= maxCacheBytes && maxCacheEntries > 0) {
          if (entries.has(key)) remove(key);
          while (entries.size && (bytes + body.length > maxCacheBytes || entries.size >= maxCacheEntries)) remove(entries.keys().next().value);
          entries.set(key, { body, version }); bytes += body.length;
        }
        return body;
      } finally { release(); }
    })();
    pending.set(pendingKey, operation);
    try { return await operation; } finally { pending.delete(pendingKey); }
  };
}

export function createPublicServer({
  root = resolve(process.cwd(), 'dist/client'),
  maxCacheBytes = 64 * 1024 * 1024,
  maxCacheEntries = 128,
  // The cumulative paper catalog has passed 32 MiB. Keep it compressed while
  // retaining a finite input bound and the existing two-operation queue.
  maxCompressFileBytes = 64 * 1024 * 1024,
  labProxy = null,
} = {}) {
  root = resolve(root);
  const compressedBody = createCompressionCache({ maxCacheBytes, maxCacheEntries });
  const server = createServer(async (request, response) => {
    const sendError = (status, message, headers = {}) => {
      response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers });
      response.end(request.method === 'HEAD' ? undefined : message);
    };
    if (labProxy && await labProxy(request, response)) return;
    if (request.method !== 'GET' && request.method !== 'HEAD') return sendError(405, 'Method not allowed', { Allow: 'GET, HEAD' });
    if (!request.url) return sendError(400, 'Bad request');
    try {
      const resolved = await resolvePublicFile(root, request.url);
      if (!resolved) return sendError(404, 'Not found');
      const { filePath, pathname, info } = resolved;
      const extension = extname(filePath).toLowerCase();
      const compressible = compressibleExtensions.has(extension) && info.size <= maxCompressFileBytes;
      const encoding = negotiateEncoding(request.headers['accept-encoding'], compressible);
      if (!encoding) return sendError(406, 'No acceptable content encoding', { Vary: 'Accept-Encoding' });
      const etag = etagFor(info, encoding);
      const headers = {
        'Content-Type': contentTypes.get(extension) || 'application/octet-stream',
        'Cache-Control': cacheControl(pathname),
        'X-Content-Type-Options': 'nosniff',
        'Last-Modified': info.mtime.toUTCString(),
        ETag: etag,
        Vary: 'Accept-Encoding',
        ...(encoding !== 'identity' ? { 'Content-Encoding': encoding } : {}),
      };
      if (notModified(request.headers, etag, info.mtimeMs)) {
        response.writeHead(304, headers); response.end(); return;
      }
      const body = encoding === 'identity' ? null : await compressedBody(filePath, info, encoding);
      response.writeHead(200, { ...headers, 'Content-Length': body?.length ?? info.size });
      if (request.method === 'HEAD') return response.end();
      if (body) return response.end(body);
      const stream = createReadStream(filePath);
      stream.on('error', () => response.destroy());
      response.on('close', () => stream.destroy());
      stream.pipe(response);
    } catch (error) {
      if (response.headersSent) response.destroy();
      else if (error.statusCode === 503) sendError(503, 'Please retry shortly', { 'Retry-After': '1' });
      else if (['ENOENT', 'ENOTDIR', 'EACCES', 'EPERM'].includes(error.code)) sendError(404, 'Not found');
      else sendError(500, 'Unable to serve this file');
    }
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  return server;
}

const executedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executedDirectly) {
  const root = resolve(process.cwd(), 'dist/client');
  const argument = (name) => { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : undefined; };
  if (!existsSync(resolve(root, 'index.html'))) {
    console.error(`Missing public build at ${root}. Run "npm.cmd run build:public" first.`);
    process.exitCode = 1;
  } else {
    const host = argument('--host') || process.env.WAGMI_PUBLIC_HOST || '0.0.0.0';
    const port = Number(argument('--port') || process.env.WAGMI_PUBLIC_PORT || '8080');
    const server = createPublicServer({ root, labProxy: createPublicLabProxy({ workspace: process.cwd() }) });
    server.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
    server.listen(port, host, () => console.log(`WAGMI public preview listening on http://${host}:${port} from ${root}`));
    const shutdown = () => { server.close(); setTimeout(() => server.closeAllConnections(), 5_000).unref(); };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  }
}

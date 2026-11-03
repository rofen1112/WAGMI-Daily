import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

async function walk(directory) {
  const files = [];
  for (const name of await readdir(directory)) {
    const path = resolve(directory, name);
    const details = await stat(path);
    if (details.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

function cacheControl(path) {
  if (path === '/index.html' || path.startsWith('/data/main/')) return 'no-cache';
  if (path.startsWith('/assets/')) return 'public, max-age=31536000, immutable';
  return 'public, max-age=3600';
}

export async function buildEmbeddedSitesWorker(clientRoot, outputPath) {
  const assets = {};
  for (const file of await walk(clientRoot)) {
    const path = `/${relative(clientRoot, file).split(sep).join('/')}`;
    const source = await readFile(file);
    assets[path] = {
      data: gzipSync(source, { level: 9 }).toString('base64'),
      etag: `"${createHash('sha256').update(source).digest('hex').slice(0, 24)}"`,
      type: contentTypes[extname(file).toLowerCase()] ?? 'application/octet-stream',
      cache: cacheControl(path),
    };
  }

  const source = `const assets = ${JSON.stringify(assets)};

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

const worker = {
  async fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method Not Allowed', { status: 405 });
    const url = new URL(request.url);
    let path = decodeURIComponent(url.pathname);
    if (path === '/') path = '/index.html';
    let asset = assets[path];
    if (!asset && (request.headers.get('Accept') ?? '').includes('text/html')) asset = assets['/index.html'];
    if (!asset) return new Response('Not Found', { status: 404 });

    const headers = new Headers({
      'Cache-Control': asset.cache,
      'Content-Type': asset.type,
      'ETag': asset.etag,
      'Vary': 'Accept-Encoding',
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.headers.get('If-None-Match') === asset.etag) return new Response(null, { status: 304, headers });
    if (request.method === 'HEAD') return new Response(null, { status: 200, headers });

    const compressed = decodeBase64(asset.data);
    if ((request.headers.get('Accept-Encoding') ?? '').includes('gzip')) {
      headers.set('Content-Encoding', 'gzip');
      return new Response(compressed, { status: 200, headers });
    }
    const body = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(body, { status: 200, headers });
  },
};

export default worker;
`;

  await mkdir(resolve(outputPath, '..'), { recursive: true });
  await writeFile(outputPath, source, 'utf8');
  return { files: Object.keys(assets).length, outputBytes: Buffer.byteLength(source) };
}


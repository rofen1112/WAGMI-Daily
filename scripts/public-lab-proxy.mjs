import { readFile } from 'node:fs/promises';
import { request as httpRequest } from 'node:http';
import { resolve } from 'node:path';

export function createPublicLabProxy({ workspace, port = 8787 } = {}) {
  const secretPath = resolve(workspace, '.local-ai-lab-public/proxy-token');
  return async function publicLabProxy(request, response) {
    const raw = (request.url || '').split('?')[0];
    if (!/^\/(?:api\/ai-lab(?:\/|$)|viewer-assets(?:\/|$))/.test(raw)) return false;
    const fail = (status, message) => {
      // Some errors reject a request before consuming its body. Close that
      // connection so unread bytes cannot be interpreted as another request.
      response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', Connection: 'close' });
      response.end(JSON.stringify({ error: { code: 'lab_unavailable', message } }));
    };
    let path;
    try { path = decodeURIComponent(raw); } catch { fail(400, '请求路径无效。'); return true; }
    if (/[\\\u0000-\u001f\u007f:]/.test(path) || path.split('/').some(part => part === '.' || part === '..')
      || /\/handoff(?:\/|$)/.test(path) || path.endsWith('/baseline')) {
      fail(404, '接口不存在。'); return true;
    }
    if (!['GET', 'POST', 'HEAD'].includes(request.method)) { fail(405, '请求方式不支持。'); return true; }
    const host = request.headers.host || '';
    const origin = request.headers.origin;
    let sameOrigin = !origin;
    try { if (origin) sameOrigin = new URL(origin).host === host; } catch { sameOrigin = false; }
    if (!sameOrigin || request.headers['sec-fetch-site'] === 'cross-site') {
      fail(403, '请从本站实验室页面发起操作。'); return true;
    }
    if (request.method === 'POST' && !/^application\/json(?:;|$)/i.test(request.headers['content-type'] || '')) {
      fail(415, '请提交 JSON。'); return true;
    }
    let token;
    try { token = (await readFile(secretPath, 'utf8')).trim(); } catch { fail(503, '建模服务暂未启动，请稍后重试。'); return true; }
    if (token.length < 48) { fail(503, '建模服务暂未启动，请稍后重试。'); return true; }
    const maximum = 18 * 1024 * 1024;
    const statedSize = Number(request.headers['content-length'] || 0);
    if (!Number.isSafeInteger(statedSize) || statedSize < 0 || statedSize > maximum) { fail(413, '上传内容超过上限。'); return true; }
    let body = Buffer.alloc(0);
    try {
      const chunks = []; let size = 0;
      for await (const chunk of request) {
        size += chunk.length;
        if (size > maximum) { fail(413, '上传内容超过上限。'); return true; }
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    } catch { fail(400, '请求已中断。'); return true; }
    const local = /^(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(host);
    const headers = {
      Host: `127.0.0.1:${port}`, 'X-Ark-Lab-Proxy': token, 'X-Ark-Lab-Secure': local ? '0' : '1',
      'Content-Length': String(body.length), 'Content-Type': 'application/json',
      Cookie: request.headers.cookie || '',
    };
    if (request.headers['idempotency-key']) headers['Idempotency-Key'] = request.headers['idempotency-key'];
    // HEAD is implemented as a backend GET; its response body is discarded.
    await new Promise(done => {
      const outgoing = httpRequest({ host: '127.0.0.1', port, path: request.url, method: request.method === 'HEAD' ? 'GET' : request.method, headers, timeout: 30_000 }, incoming => {
        const selected = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
        for (const key of ['content-type', 'content-length', 'content-disposition', 'set-cookie', 'content-security-policy', 'referrer-policy', 'cross-origin-resource-policy']) {
          if (incoming.headers[key]) selected[key] = incoming.headers[key];
        }
        response.writeHead(incoming.statusCode, selected);
        incoming.on('error', () => { response.destroy(); done(); });
        incoming.on('end', done);
        if (request.method === 'HEAD') { incoming.resume(); response.end(); }
        else incoming.pipe(response);
      });
      outgoing.on('timeout', () => outgoing.destroy());
      outgoing.on('error', () => { if (!response.headersSent) fail(503, '建模服务暂时离线，请稍后重试。'); else response.destroy(); done(); });
      response.on('close', () => outgoing.destroy());
      outgoing.end(body);
    });
    return true;
  };
}

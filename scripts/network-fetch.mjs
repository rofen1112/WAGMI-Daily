import { execFileSync } from 'node:child_process';
import { EnvHttpProxyAgent, ProxyAgent, setGlobalDispatcher } from 'undici';

function normalizeProxyUrl(value) {
  const proxy = String(value ?? '').trim();
  if (!proxy) return null;
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(proxy) ? proxy : `http://${proxy}`;
}

function parseWindowsProxy(output) {
  const enabled = /ProxyEnable\s+REG_DWORD\s+0x1/i.test(output);
  if (!enabled) return null;
  const match = output.match(/ProxyServer\s+REG_SZ\s+([^\r\n]+)/i);
  if (!match) return null;
  const value = match[1].trim();
  const entries = value.includes(';')
    ? Object.fromEntries(value.split(';').map((entry) => entry.split('=', 2)).filter((entry) => entry.length === 2))
    : {};
  return normalizeProxyUrl(entries.https || entries.http || value);
}

function windowsProxy() {
  if (process.platform !== 'win32') return null;
  try {
    const output = execFileSync('reg.exe', [
      'query',
      'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings',
      '/v',
      'ProxyEnable',
    ], { encoding: 'utf8', windowsHide: true });
    if (!/ProxyEnable\s+REG_DWORD\s+0x1/i.test(output)) return null;
    const server = execFileSync('reg.exe', [
      'query',
      'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings',
      '/v',
      'ProxyServer',
    ], { encoding: 'utf8', windowsHide: true });
    return parseWindowsProxy(`${output}\n${server}`);
  } catch {
    return null;
  }
}

export function buildProxyEnvironment(environment = process.env, windowsProxyUrl) {
  const next = { ...environment };
  const existing = next.HTTPS_PROXY || next.https_proxy || next.HTTP_PROXY || next.http_proxy
    || next.ALL_PROXY || next.all_proxy;
  if (existing) return next;
  const proxy = windowsProxyUrl === undefined ? windowsProxy() : normalizeProxyUrl(windowsProxyUrl);
  if (!proxy) return next;
  for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy']) next[key] = proxy;
  return next;
}
export function configureNetworkFetch() {
  const environmentProxy = process.env.HTTPS_PROXY || process.env.https_proxy
    || process.env.HTTP_PROXY || process.env.http_proxy
    || process.env.ALL_PROXY || process.env.all_proxy;
  if (environmentProxy) {
    setGlobalDispatcher(new EnvHttpProxyAgent());
    return { mode: 'environment' };
  }
  const proxy = windowsProxy();
  if (proxy) {
    setGlobalDispatcher(new ProxyAgent(proxy));
    return { mode: 'windows' };
  }
  return { mode: 'direct' };
}

export const networkFetchConfiguration = configureNetworkFetch();
export { normalizeProxyUrl, parseWindowsProxy };
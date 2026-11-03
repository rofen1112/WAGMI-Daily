import { Agent, EnvHttpProxyAgent } from 'undici';
import { buildProxyEnvironment } from './network-fetch.mjs';

const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

export function createHealthTransport({
  readEnvironment = () => buildProxyEnvironment(process.env),
  createDirect = () => new Agent(),
  createProxy = (options) => new EnvHttpProxyAgent(options),
} = {}) {
  const direct = createDirect();
  let remote = direct;
  let signature = 'direct';

  return {
    refresh() {
      const environment = readEnvironment();
      const fallback = environment.all_proxy || environment.ALL_PROXY || '';
      const options = {
        httpProxy: environment.http_proxy || environment.HTTP_PROXY || fallback,
        httpsProxy: environment.https_proxy || environment.HTTPS_PROXY || fallback,
        noProxy: environment.no_proxy || environment.NO_PROXY || '',
      };
      const hasProxy = Boolean(options.httpProxy || options.httpsProxy);
      const nextSignature = hasProxy ? JSON.stringify(options) : 'direct';
      if (nextSignature === signature) return;
      const previous = remote;
      remote = hasProxy ? createProxy(options) : direct;
      signature = nextSignature;
      // Long-lived probes must release agents when the system proxy changes.
      if (previous !== direct) void previous.close().catch(() => {});
    },
    dispatcher(url) {
      return loopbackHosts.has(new URL(url).hostname) ? direct : remote;
    },
    async close() {
      await direct.close();
      if (remote !== direct) await remote.close();
    },
  };
}

export function canRecoverPublicUrl(url) {
  try {
    return new URL(url).hostname.endsWith('.trycloudflare.com');
  } catch {
    return false;
  }
}

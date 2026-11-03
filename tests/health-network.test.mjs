import assert from 'node:assert/strict';
import test from 'node:test';
import { canRecoverPublicUrl, createHealthTransport } from '../scripts/health-network.mjs';

test('health probes bypass proxies for loopback and refresh remote proxy changes', async () => {
  let environment = { HTTPS_PROXY: 'http://127.0.0.1:7890' };
  const agents = [];
  const createAgent = (options) => {
    const agent = { options, closed: false, async close() { this.closed = true; } };
    agents.push(agent);
    return agent;
  };
  const transport = createHealthTransport({
    readEnvironment: () => environment,
    createDirect: () => createAgent(null),
    createProxy: createAgent,
  });
  const remoteUrl = 'https://example.com/';
  transport.refresh();
  const proxy = transport.dispatcher(remoteUrl);
  assert.equal(proxy.options.httpsProxy, environment.HTTPS_PROXY);
  for (const host of ['127.0.0.1', 'localhost', '[::1]']) {
    assert.equal(transport.dispatcher(`http://${host}:5174/`), agents[0]);
  }
  transport.refresh();
  assert.equal(agents.length, 2, 'unchanged configuration reuses the agent');

  environment = { HTTPS_PROXY: 'http://127.0.0.1:7897', NO_PROXY: 'example.org' };
  transport.refresh();
  assert.equal(proxy.closed, true);
  const replacement = transport.dispatcher(remoteUrl);
  assert.equal(replacement.options.httpsProxy, environment.HTTPS_PROXY);
  assert.equal(replacement.options.noProxy, environment.NO_PROXY);

  environment = {};
  transport.refresh();
  assert.equal(transport.dispatcher(remoteUrl), agents[0]);
  assert.equal(replacement.closed, true, 'disabling the proxy releases the old agent');
  await transport.close();
  assert.ok(agents.every((agent) => agent.closed));
});

test('cloud hosting failures cannot trigger local tunnel recovery', () => {
  assert.equal(canRecoverPublicUrl('https://codebuddy-pro-cloud-example.tcloudbaseapp.com'), false);
  assert.equal(canRecoverPublicUrl('https://example.com'), false);
  assert.equal(canRecoverPublicUrl(null), false);
  assert.equal(canRecoverPublicUrl('https://example.trycloudflare.com'), true);
});

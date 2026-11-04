import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const require = createRequire(resolve(process.env.AI_LAB_MODULE_ROOT || root, 'package.json'));
const ts = require('typescript');

async function load(relative, context = {}) {
  const text = await readFile(resolve(root, relative), 'utf8');
  const code = ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX }, fileName: relative }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, URLSearchParams, console, setTimeout, clearTimeout, ...context });
  return exports;
}

function browser(hash = '') {
  return {
    location: { hash, origin: 'http://127.0.0.1:5186' },
    history: { replaceState(_state, _title, href) { this.owner.location.hash = href; } },
    addEventListener() {}, removeEventListener() {}, setTimeout, clearTimeout,
  };
}

async function route(hash, admin, lab) {
  const window = browser(hash); window.history.owner = window;
  const react = { useCallback: (fn) => fn, useEffect: (fn) => fn(), useMemo: (fn) => fn(), useState: (initial) => [initial, () => {}] };
  const router = await load('src/router.ts', { window, require: (id) => { assert.equal(id, 'react'); return react; } });
  return { ...router.useHashRoute(admin, lab), href: window.location.hash, router };
}

test('public and admin cannot enter the lab route; lab keeps its dedicated tool URL', async () => {
  for (const admin of [false, true]) assert.equal((await route('#/ai-lab?tool=floorplan3d', admin, false)).route, 'today');
  const lab = await route('', false, true);
  assert.equal(lab.route, 'ai-lab');
  assert.equal(lab.href, '#/ai-lab?tool=floorplan3d');
  assert.equal((await route('#/operations', false, true)).route, 'ai-lab');
  assert.equal((await route('#/github', false, false)).route, 'github');
});

test('project links restore, react to A-B-back-A and preserve edits on unrelated query changes', async () => {
  const window = browser('#/ai-lab?tool=floorplan3d&projectId=p1&context=handoff');
  window.history.owner = window;
  const listeners = new Map();
  window.addEventListener = (type, callback) => { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); };
  window.removeEventListener = (type, callback) => listeners.get(type)?.delete(callback);
  const failedJob = { id: 'j3', projectId: 'p3', status: 'failed', validation: { errors: [{ code: 'outside_boundary', path: '$.rooms[11].poly' }] } };
  const projects = [{ id: 'p1', title: '住宅', sceneVersion: 2 }, { id: 'p2', title: '办公', sceneVersion: 1 }, { id: 'p3', title: '未通过校验', sceneVersion: 0, latestJob: failedJob }];
  const requests = [];
  const hooks = [];
  let cursor = 0, dirty = false, effects = [], tree;
  const equal = (a, b) => a?.length === b?.length && a.every((value, index) => Object.is(value, b[index]));
  const react = {
    useState(initial) { const index = cursor++; hooks[index] ??= { value: initial }; return [hooks[index].value, (next) => { hooks[index].value = typeof next === 'function' ? next(hooks[index].value) : next; dirty = true; }]; },
    useRef(initial) { const index = cursor++; hooks[index] ??= { current: initial }; return hooks[index]; },
    useCallback(callback, deps) { const index = cursor++; if (!hooks[index] || !equal(hooks[index].deps, deps)) hooks[index] = { callback, deps }; return hooks[index].callback; },
    useEffect(callback, deps) { const index = cursor++; if (!hooks[index] || !equal(hooks[index].deps, deps)) { hooks[index] = { deps }; effects.push(callback); } },
  };
  const jsx = (type, props, key) => ({ type, props, key });
  const helpers = await load('src/features/ai-lab/api.ts');
  const api = {
    ...helpers,
    API: '/api/ai-lab/v1', LabApiError: class extends Error {}, isActiveJob: () => false,
    errorMessage: (error) => error.message, projectPath: (id) => `/projects/${id}`, jobError: () => '', sceneSourceLabel: () => '生成结果需人工核对',
    async request(path) {
      requests.push(path);
      if (path === '/health') return { status: 'ok', providerConfigured: true };
      if (path === '/projects') return { projects };
      if (path === '/baselines') return { baselines: [] };
      if (path === '/projects/p3/scene') return null;
      if (path.endsWith('/scene')) return { scene: { furniture: [], metadata: { mmPerPixel: path.includes('/p1/') ? 25 : -2 } }, state: null, version: 2 };
      throw new Error(`Unexpected request: ${path}`);
    },
    async post() { throw new Error('Restoring a project must never create a job'); },
  };
  const page = await load('src/features/ai-lab/AiLabPage.tsx', { window, require(id) {
    if (id === 'react') return react;
    if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    if (id === './api') return api;
    if (id === './ai-lab.css') return {};
    throw new Error(`Unexpected import: ${id}`);
  } });
  const render = () => { cursor = 0; dirty = false; tree = page.default(); const pending = effects; effects = []; for (const effect of pending) effect(); };
  const flush = async () => { for (let index = 0; index < 10; index++) { await new Promise(setImmediate); if (dirty) render(); } };
  const find = (node, predicate) => {
    if (!node || typeof node !== 'object') return null;
    if (Array.isArray(node)) { for (const child of node) { const found = find(child, predicate); if (found) return found; } return null; }
    if (predicate(node)) return node;
    return find(node.props?.children, predicate);
  };
  render(); await flush();
  assert.ok(requests.includes('/projects/p1/scene'));
  assert.ok(find(tree, (node) => node.type === 'iframe' && node.props.src.includes('/projects/p1/viewer')));
  assert.equal(find(tree, (node) => node.type === 'input' && node.props.id === 'lab-scale').props.value, '25');
  const navigateHash = async (hash) => { window.location.hash = hash; for (const callback of listeners.get('hashchange') || []) callback(); await flush(); };
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p2&context=handoff');
  assert.ok(find(tree, (node) => node.type === 'iframe' && node.props.src.includes('/projects/p2/viewer')));
  assert.equal(find(tree, (node) => node.type === 'input' && node.props.id === 'lab-scale').props.value, '');
  let query = new URLSearchParams(window.location.hash.split('?')[1]);
  assert.equal(query.get('projectId'), 'p2'); assert.equal(query.get('tool'), 'floorplan3d'); assert.equal(query.get('context'), 'handoff');
  const p2Calls = requests.filter((path) => path === '/projects/p2/scene').length;
  const chat = find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-chat');
  chat.props.onChange({ target: { value: '尚未提交的编辑指令' } }); await flush();
  find(tree, (node) => node.type === 'input' && node.props.id === 'lab-scale').props.onChange({ target: { value: '30' } }); await flush();
  const frameKey = find(tree, (node) => node.type === 'iframe').key;
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p2&context=changed');
  assert.equal(requests.filter((path) => path === '/projects/p2/scene').length, p2Calls);
  assert.equal(find(tree, (node) => node.type === 'iframe').key, frameKey);
  assert.equal(find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-chat').props.value, '尚未提交的编辑指令');
  assert.equal(find(tree, (node) => node.type === 'input' && node.props.id === 'lab-scale').props.value, '30');
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p1&context=handoff');
  assert.ok(find(tree, (node) => node.type === 'iframe' && node.props.src.includes('/projects/p1/viewer')));
  assert.equal(find(tree, (node) => node.type === 'input' && node.props.id === 'lab-scale').props.value, '25');
  assert.equal(requests.filter((path) => path === '/projects/p1/scene').length, 2);
  await navigateHash('#/ai-lab?tool=floorplan3d&context=handoff');
  assert.equal(find(tree, (node) => node.type === 'iframe'), null);
  const second = find(tree, (node) => node.type === 'button' && node.key === 'p2');
  assert.ok(second); await second.props.onClick(); await flush();
  assert.equal(new URLSearchParams(window.location.hash.split('?')[1]).get('projectId'), 'p2');
  const create = find(tree, (node) => node.type === 'button' && node.props.className?.includes('lab-new'));
  create.props.onClick(); await flush();
  query = new URLSearchParams(window.location.hash.split('?')[1]);
  assert.equal(query.has('projectId'), false); assert.equal(query.get('tool'), 'floorplan3d');
  assert.equal(requests.filter((path) => path === '/projects/p1/scene').length, 2);
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p3');
  assert.ok(find(tree, (node) => node.type === 'h2' && node.props.children === '生成未通过检查'));
  const footer = find(tree, (node) => node.props?.className === 'lab-canvas-footer');
  assert.equal(footer.props.children[0].props.children, '生成失败');
});

test('project labels reflect terminal and active jobs while retaining saved versions', async () => {
  const api = await load('src/features/ai-lab/api.ts');
  const project = { id: 'p', title: '测试项目', sceneVersion: 0 };
  assert.equal(api.projectStatusLabel(project), '尚未生成');
  for (const [status, label] of [['queued', '排队中'], ['running', '生成中'], ['failed', '生成失败'], ['cancelled', '已取消'], ['needs_input', '需补信息']]) {
    assert.equal(api.projectStatusLabel({ ...project, latestJob: { status } }), label);
  }
  assert.equal(api.projectStatusLabel({ ...project, sceneVersion: 3, latestJob: { status: 'succeeded' } }), '版本 3 · 已保存');
  assert.equal(api.projectStatusLabel({ ...project, sceneVersion: 3, latestJob: { status: 'failed', source: 'modified' } }), '版本 3 · 修改失败');
  assert.equal(api.projectStatusLabel({ ...project, sceneVersion: 3, latestJob: { status: 'failed' } }), '版本 3 · 生成失败');
  assert.equal(api.projectStatusLabel({ ...project, sceneVersion: 3 }), '版本 3 · 已保存');
});

test('failure details translate bounded geometry issues without raw provider payloads or repeated summaries', async () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const api = await load('src/features/ai-lab/api.ts');
  const page = await load('src/features/ai-lab/AiLabPage.tsx', { require(id) {
    if (id === './api') return api;
    if (id === './ai-lab.css') return {};
    return require(id);
  } });
  const summary = '场景未通过校验，请调整输入后重试。';
  const errors = [
    { code: 'outside_boundary', path: '$.rooms[11].poly', message: 'rawproviderbody MUST_NOT_RENDER' },
    { code: 'room_overlap', path: '$.rooms[1].poly' },
    { code: 'invalid_polygon', path: '$.rooms[2].poly' },
    { code: 'out_of_bounds', path: '$.furniture[0]' },
    { code: 'nonpositive', path: '$.furniture[1].w' },
  ];
  const job = { status: 'failed', message: summary, validation: { errors }, error: { message: summary, details: { errors: [...errors, { code: 'invalid_polygon', path: '<script>alert(1)</script>', message: 'MUST_NOT_RENDER' }, ...Array.from({ length: 30 }, (_, index) => ({ code: 'out_of_bounds', path: `$.rooms[${index + 20}].poly` }))], rawproviderbody: 'MUST_NOT_RENDER' } } };
  const issues = api.jobValidationIssues(job);
  assert.equal(issues.length, 8);
  assert.equal(issues[0].label, '第12个房间：房间范围超出模型给出的建筑外轮廓，请检查生成的房间边界。');
  assert.match(issues[1].label, /第2个房间：.*重叠/);
  assert.match(issues[2].label, /轮廓无效/);
  assert.match(issues[3].label, /第1个家具：.*场景范围/);
  assert.match(issues[4].label, /尺寸必须大于 0/);
  const html = renderToStaticMarkup(React.createElement(page.JobFeedback, { job }));
  assert.equal(html.split(summary).length - 1, 1);
  assert.match(html, /第12个房间：房间范围超出模型给出的建筑外轮廓/);
  assert.match(html, /查看对应对象/);
  assert.match(html, /\$\.rooms\[11\]\.poly/);
  assert.doesNotMatch(html, /MUST_NOT_RENDER|rawproviderbody|<script>|alert\(1\)/);
  const escaped = renderToStaticMarkup(React.createElement(page.JobFeedback, { job: { status: 'failed', error: { message: '<img src=x onerror=alert(1)>' } } }));
  assert.match(escaped, /&lt;img/); assert.doesNotMatch(escaped, /<img/);
  for (const value of [null, 'rawproviderbody', { errors: 'rawproviderbody' }]) {
    assert.equal(api.jobValidationIssues({ status: 'failed', validation: value, error: { details: value } }).length, 0);
  }
});

test('API errors preserve actionable server messages and reject malformed successes', async () => {
  let api = await load('src/features/ai-lab/api.ts', { fetch: async () => ({ ok: false, status: 409, json: async () => ({ error: { code: 'VERSION_CONFLICT', message: '方案已更新，请重新打开' } }) }) });
  await assert.rejects(api.request('/projects/a/state'), (error) => error.status === 409 && error.message === '方案已更新，请重新打开');
  api = await load('src/features/ai-lab/api.ts', { fetch: async () => ({ ok: true, status: 200, json: async () => null }) });
  await assert.rejects(api.request('/projects'), /无法读取/);
});

test('vendor call totals are summed only when actually returned, with partial and unknown labels', async () => {
  const api = await load('src/features/ai-lab/api.ts');
  const complete = { calls: [{ usage: { input_tokens: 60, output_tokens: 40, total_tokens: 100 } }, { usage: { total_tokens: 25 } }], cost: null };
  assert.equal(api.summarizeJobUsage(complete).knownTotalTokens, 125);
  assert.equal(api.jobUsageLabel(complete), '本次用量 125 tokens（2 次调用）');
  const partial = { calls: [...complete.calls, { usage: null }, { usage: { input_tokens: 8, output_tokens: 9 } }, { usage: { total_tokens: null } }], cost: null };
  const result = api.summarizeJobUsage(partial);
  assert.equal(result.knownTotalTokens, 125); assert.equal(result.reportedCalls, 2); assert.equal(result.callCount, 5);
  assert.equal(api.jobUsageLabel(partial), '已知用量 125 tokens（部分：2/5 次调用）');
  for (const usage of [null, {}, { calls: [] }, { calls: [{ usage: null }, { usage: { total_tokens: null } }, { usage: { input_tokens: 8, output_tokens: 9 } }] }]) {
    assert.equal(api.summarizeJobUsage(usage).knownTotalTokens, null);
    assert.match(api.jobUsageLabel(usage), /^总用量未返回/);
    assert.doesNotMatch(api.jobUsageLabel(usage), /0 tokens/);
  }
  assert.equal(api.summarizeJobUsage({ calls: [{ usage: { total_tokens: 0 } }] }).knownTotalTokens, 0);
  assert.equal(api.summarizeJobUsage({ calls: [{ usage: { total_tokens: -1 } }, { usage: { total_tokens: NaN } }] }).knownTotalTokens, null);
  assert.equal(api.jobUsageLabel({ calls: [] }, { status: 'succeeded', source: 'modified' }), '本次未调用模型');
  assert.equal(api.jobUsageLabel({ calls: [] }, { status: 'succeeded', source: 'baseline_reference_modified' }), '本次未调用模型');
  assert.equal(api.jobUsageLabel(null, { status: 'succeeded', source: 'modified' }), '总用量未返回');
  assert.equal(api.jobUsageLabel({ calls: [] }, { status: 'failed', source: 'modified' }), '总用量未返回');
  assert.equal(api.jobUsageLabel({ calls: [] }, { status: 'succeeded', source: 'generated' }), '总用量未返回');
});

test('modified reference scenes retain their reference provenance in the UI', async () => {
  const api = await load('src/features/ai-lab/api.ts');
  assert.equal(api.sceneSourceLabel('baseline_reference'), '历史参考 · 非本次 AI 生成');
  assert.equal(api.sceneSourceLabel('baseline_reference_modified'), '参考方案的修改版');
  assert.equal(api.sceneSourceLabel('generated'), '生成结果需人工核对');
});

test('model uncertainty renders bounded source strings with React escaping and ignores unknown values', async () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const api = await load('src/features/ai-lab/api.ts');
  const page = await load('src/features/ai-lab/AiLabPage.tsx', { require(id) {
    if (id === './api') return api;
    if (id === './ai-lab.css') return {};
    return require(id);
  } });
  const warnings = ['门窗位置不确定', '<script>alert("x")</script>', null, { message: '不应被强制转换' }, 42, false, '', '  ', '长'.repeat(800), ...Array.from({ length: 20 }, (_, index) => `其他提醒${index}`)];
  const html = renderToStaticMarkup(React.createElement(page.ModelUncertaintyWarnings, { warnings }));
  assert.match(html, /模型不确定性/);
  assert.match(html, /门窗位置不确定/);
  assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>|不应被强制转换|\[object Object\]|true|false/);
  assert.equal((html.match(/<li>/g) || []).length, 12);
  assert.ok(html.includes('长'.repeat(400)));
  assert.ok(!html.includes('长'.repeat(401)));
  for (const value of [undefined, null, 'not an array', {}, [null, 2, {}]]) {
    assert.equal(renderToStaticMarkup(React.createElement(page.ModelUncertaintyWarnings, { warnings: value })), '');
  }
});

test('viewer bridge ignores other origins, windows and request IDs before accepting state', async () => {
  const listeners = new Set();
  const state = { furniture: [], rooms: {}, demolished: [], measures: [] };
  const window = browser();
  window.addEventListener = (_name, listener) => listeners.add(listener);
  window.removeEventListener = (_name, listener) => listeners.delete(listener);
  const emit = (event) => { for (const listener of listeners) listener(event); };
  const source = { postMessage(message, origin) {
    assert.equal(origin, window.location.origin);
    const data = { type: 'ai-lab:state', requestId: message.requestId, state };
    emit({ origin: 'https://other.test', source, data });
    emit({ origin, source: {}, data });
    emit({ origin, source, data: { ...data, requestId: 'stale' } });
    assert.equal(listeners.size, 1);
    emit({ origin, source, data });
  } };
  const api = await load('src/features/ai-lab/api.ts', { window });
  assert.equal(await api.readViewerState({ contentWindow: source }), state);
  assert.equal(listeners.size, 0);
});

test('viewer bridge rejects null state instead of persisting an empty scheme', async () => {
  const listeners = new Set();
  const window = browser();
  window.addEventListener = (_name, listener) => listeners.add(listener);
  window.removeEventListener = (_name, listener) => listeners.delete(listener);
  const source = { postMessage(message, origin) { for (const listener of listeners) listener({ source, origin, data: { type: 'ai-lab:state', requestId: message.requestId, state: null } }); } };
  const api = await load('src/features/ai-lab/api.ts', { window });
  await assert.rejects(api.readViewerState({ contentWindow: source }), /无法保存/);
  assert.equal(listeners.size, 0);
});

test('independent lab config cannot execute daily/publication plugins', async () => {
  const config = await readFile(resolve(root, 'vite.ai-lab.config.ts'), 'utf8');
  assert.doesNotMatch(config, /from ['"]\.\/vite\.config|adminDataPlugin|sitesOutputPlugin|data:sync-main|publication\.mjs/);
  assert.match(config, /strictPort:\s*true/);
  assert.match(config, /outDir:\s*['"]dist\/ai-lab/);
  const app = await readFile(resolve(root, 'src/App.tsx'), 'utf8');
  assert.match(app, /isLabBuild \? lazy\(\(\) => import\('\.\/features\/ai-lab\/AiLabPage'\)\) : null/);
});

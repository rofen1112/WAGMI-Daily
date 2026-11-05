import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const require = createRequire(resolve(process.env.AI_LAB_MODULE_ROOT || root, 'package.json'));
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const both = { status: 'ok', executionMode: 'api', providerConfigured: false, executionModes: { api: { configured: true, available: true, model: 'gpt-6.1-sol' }, codex_handoff: { configured: true, available: true, model: 'codex-current-session' } } };
const asset = { id: 'asset-test', name: '离线测试.png', mime: 'image/png', width: 1000, height: 500, url: '/api/ai-lab/v1/assets/asset-test' };

function modules(context = {}) {
  const cache = new Map();
  const load = relative => {
    if (cache.has(relative)) return cache.get(relative);
    const source = readFileSync(resolve(root, relative), 'utf8').replaceAll('import.meta.env.DEV', 'true');
    const code = ts.transpileModule(source, { fileName: relative, compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    const exports = {}; cache.set(relative, exports);
    vm.runInNewContext(code, { exports, URL, URLSearchParams, AbortController, crypto: globalThis.crypto, console, ...context, require(id) {
      if (context.imports?.[id]) return context.imports[id];
      if (id.endsWith('.css')) return {};
      if (id.endsWith('.png')) return { default: '/test-logo.png' };
      if (id === './api' && context.api) return context.api;
      if (id.startsWith('./')) return load('src/features/ai-lab/' + id.slice(2) + (id === './api' ? '.ts' : '.tsx'));
      return require(id);
    } });
    return exports;
  };
  return { load, api: () => load('src/features/ai-lab/api.ts') };
}

const helpers = modules().api();
const text = node => typeof node === 'string' || typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.props?.children) : '';
const find = (node, predicate) => {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) { for (const child of node) { const result = find(child, predicate); if (result) return result; } return null; }
  return predicate(node) ? node : find(node.props?.children, predicate);
};

function host(hash = '#/ai-lab?tool=floorplan3d&view=new') {
  const hooks = [], listeners = new Map(), timers = new Map();
  let cursor = 0, dirty = false, effects = [], tree, component, props, nextTimer = 0;
  const same = (a, b) => a?.length === b?.length && a.every((item, i) => Object.is(item, b[i]));
  const react = {
    useState(initial) { const i = cursor++; hooks[i] ??= { value: typeof initial === 'function' ? initial() : initial }; return [hooks[i].value, next => { const value = typeof next === 'function' ? next(hooks[i].value) : next; if (!Object.is(value, hooks[i].value)) { hooks[i].value = value; dirty = true; } }]; },
    useRef(initial) { const i = cursor++; hooks[i] ??= { current: initial }; return hooks[i]; },
    useCallback(callback, deps) { const i = cursor++; if (!hooks[i] || !same(hooks[i].deps, deps)) hooks[i] = { callback, deps }; return hooks[i].callback; },
    useEffect(callback, deps) { const i = cursor++, previous = hooks[i]; if (!previous || !same(previous.deps, deps)) { hooks[i] = { deps }; effects.push(() => { previous?.cleanup?.(); hooks[i].cleanup = callback(); }); } },
  };
  const window = { location: { hash, origin: 'http://127.0.0.1:5186' }, history: { replaceState(_a, _b, href) { window.location.hash = href; } }, matchMedia: () => ({ matches: false }), addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); }, removeEventListener(type, callback) { listeners.get(type)?.delete(callback); }, setTimeout(callback, delay) { timers.set(++nextTimer, { callback, delay }); return nextTimer; }, clearTimeout(id) { timers.delete(id); } };
  const frame = { contentWindow: {} };
  const jsx = (type, props, key) => { if (typeof type === 'function' && type.name === 'AgentPanel') return type(props); if (type === 'iframe' && props.ref) props.ref.current = frame; return { type, props, key }; };
  const render = () => { cursor = 0; dirty = false; tree = component(props); const pending = effects; effects = []; pending.forEach(effect => effect()); };
  const flush = async () => { for (let i = 0; i < 20; i++) { await new Promise(setImmediate); if (dirty) render(); } };
  return { window, frame, imports: { react, 'react/jsx-runtime': { jsx, jsxs: jsx } }, get tree() { return tree; }, async mount(Component, initial = {}) { component = Component; props = initial; render(); await flush(); }, async update(next) { props = { ...props, ...next }; render(); await flush(); }, flush, async click(predicate) { const button = find(tree, predicate); assert.ok(button); button.props.onClick(); await flush(); }, async change(predicate, value) { const field = find(tree, predicate); assert.ok(field); field.props.onChange({ target: { value } }); await flush(); }, async emit(data) { for (const listener of listeners.get('message') || []) listener({ source: frame.contentWindow, origin: window.location.origin, data }); await flush(); }, close() { hooks.forEach(hook => hook?.cleanup?.()); } };
}

function panel(props) {
  const context = modules();
  const Agent = context.load('src/features/ai-lab/AgentPanel.tsx').default;
  return renderToStaticMarkup(React.createElement(Agent, { job: null, health: both, asset, title: '测试空间', prompt: '保留原图', busy: null, working: false, readOnly: false, onTitle() {}, onPrompt() {}, onUpload() {}, onSubmit() {}, onCancel() {}, onScale() {}, ...props }));
}

async function pageFixture({ health = both, job = null, draft = null } = {}) {
  const h = host(job ? '#/ai-lab?tool=floorplan3d&projectId=project-test' : undefined);
  const posts = []; let project = job ? { id: 'project-test', title: '离线任务', sceneVersion: 0, latestJob: job } : null, captures = 0;
  const api = { ...helpers, async readImage() { return 'data:image/png;base64,AAAA'; }, async readViewerCaptures() { captures++; return { planDataUrl: 'data:image/png;base64,AAAA', sceneDataUrl: 'data:image/jpeg;base64,BBBB' }; }, async request(path) {
    if (path === '/health') return health;
    if (path === '/projects') return { projects: project ? [project] : [] };
    if (path === '/baselines') return { baselines: [] };
    if (path.endsWith('/scene')) return null;
    if (path.endsWith('/draft')) return draft;
    if (path.includes('/events?')) return { events: [], cursor: 0, hasMore: false, terminal: false };
    if (path.startsWith('/jobs/')) return { job };
    throw Error('Unexpected GET ' + path);
  }, async post(path, body) {
    posts.push({ path, body });
    if (path === '/assets') return { asset };
    if (path === '/projects') { project = { id: 'project-test', title: body.title, sceneVersion: 0 }; return { project }; }
    if (path === '/projects/project-test/jobs') { job = { id: 'job-new', projectId: 'project-test', executionMode: body.executionMode, pipelineVersion: body.pipelineVersion, status: body.executionMode === 'api' ? 'queued' : 'awaiting_codex', input: { prompt: body.prompt }, sourceAsset: asset }; project.latestJob = job; return { job }; }
    if (path.endsWith('/input')) { job = { ...job, status: 'running', stage: 'structure', message: '比例已记录，继续构建结构。' }; return { job }; }
    if (path.endsWith('/review-images')) { job = { ...job, status: 'running', stage: 'visual_review' }; return { job }; }
    throw Error('Unexpected POST ' + path);
  } };
  const Page = modules({ ...h, api }).load('src/features/ai-lab/AiLabPage.tsx').default;
  await h.mount(Page);
  return { h, posts, get captures() { return captures; }, async upload() { const input = find(h.tree, node => node.type === 'input' && node.props.id === 'lab-file'); await input.props.onChange({ target: { files: [{ name: '离线测试.png' }] } }); await h.flush(); } };
}

test('execution modes use availability and preserve recorded or legacy identities independently of the current choice', () => {
  assert.equal(helpers.defaultExecutionMode(both), 'api');
  assert.equal(helpers.generationAvailable(both, 'api'), true); assert.equal(helpers.generationAvailable(both, 'codex_handoff'), true);
  assert.equal(helpers.generationAvailable({ ...both, executionModes: { ...both.executionModes, api: { configured: true, available: false } } }, 'api'), false);
  assert.equal(helpers.jobExecutionMode({ executionMode: 'api', pipelineVersion: 'codex-handoff-v1' }), 'api');
  assert.equal(helpers.jobExecutionMode({ pipelineVersion: 'codex-workflow-v1' }, 'codex_handoff'), 'api');
  assert.equal(helpers.jobExecutionMode({ pipelineVersion: 'codex-handoff-v1' }, 'api'), 'codex_handoff');
  assert.equal(helpers.knownJobExecutionMode({ status: 'failed' }), null);
  assert.equal(helpers.knownJobExecutionMode({ model: 'historical-api-model' }), 'api');
});

test('API task copy is automatic, Codex copy is handoff-only, and history does not follow the composer selection', () => {
  const apiJob = { id: 'api-old', projectId: 'p', executionMode: 'api', model: 'historical-api-model', status: 'awaiting_codex', events: [{ id: 1, type: 'agent_message', message: '真实历史记录' }] };
  const apiHtml = panel({ job: apiJob, executionMode: 'codex_handoff', working: true });
  assert.match(apiHtml, /API 将自动执行/); assert.match(apiHtml, /API 执行进展/); assert.match(apiHtml, /本次要求 · API 自动执行/);
  assert.doesNotMatch(apiHtml, /等待当前.*聊天接力|复制接力指令|historical-api-model/);
  const handoffHtml = panel({ job: { id: 'chat-old', projectId: 'p', pipelineVersion: 'codex-handoff-v1', status: 'awaiting_codex' }, executionMode: 'api' });
  assert.match(handoffHtml, /复制接力指令/); assert.match(handoffHtml, /网页不会自行开始推理/);
  const savedApi = panel({ job: { ...apiJob, status: 'succeeded' }, executionMode: 'codex_handoff', readOnly: true });
  assert.match(savedApi, /本次要求 · API 自动执行/); assert.doesNotMatch(savedApi, /aria-label="执行方式"|复制接力指令/);
  const unknown = panel({ job: { id: 'legacy', status: 'failed' }, executionMode: 'api', readOnly: true });
  assert.match(unknown, /历史任务（执行方式未记录）/);
  const Workflow = modules().load('src/features/ai-lab/WorkflowSummary.tsx').default;
  const workflowHtml = renderToStaticMarkup(React.createElement(Workflow, { job: { ...apiJob, pipelineVersion: 'codex-workflow-v1' } }));
  assert.match(workflowHtml, /API 分阶段生成/); assert.doesNotMatch(workflowHtml, /Codex/);
});

test('the development selector disables unavailable API and locks both modes while a task awaits input', async () => {
  const h = host(); let changes = 0;
  const Agent = modules({ ...h, api: helpers }).load('src/features/ai-lab/AgentPanel.tsx').default;
  const props = { health: { ...both, executionModes: { ...both.executionModes, api: { configured: false, available: false } } }, executionMode: 'codex_handoff', job: null, asset, title: '', prompt: '', busy: null, working: false, readOnly: false, onExecutionMode() { changes++; }, onTitle() {}, onPrompt() {}, onUpload() {}, onSubmit() {}, onCancel() {}, onScale() {} };
  try {
    await h.mount(Agent, props);
    assert.equal(find(h.tree, node => node.type === 'option' && node.props.value === 'api').props.disabled, true);
    await h.change(node => node.type === 'select' && node.props['aria-label'] === '执行方式', 'api'); assert.equal(changes, 0);
    await h.update({ ...props, health: both, job: { id: 'active', status: 'awaiting_input', executionMode: 'api' } });
    assert.equal(find(h.tree, node => node.type === 'select' && node.props['aria-label'] === '执行方式').props.disabled, true);
    await h.change(node => node.type === 'select' && node.props['aria-label'] === '执行方式', 'codex_handoff'); assert.equal(changes, 0);
  } finally { h.close(); }
});

test('Page submits each selected mode explicitly and unavailable API cannot create a project or job', async () => {
  for (const mode of ['api', 'codex_handoff']) {
    const fixture = await pageFixture();
    try {
      await fixture.upload();
      await fixture.h.change(node => node.type === 'select' && node.props['aria-label'] === '执行方式', mode);
      await fixture.h.click(node => node.type === 'button' && node.props.className === 'lab-agent-send');
      const submission = fixture.posts.find(item => item.path.endsWith('/jobs'));
      assert.ok(submission); assert.equal(submission.body.executionMode, mode); assert.equal(submission.body.pipelineVersion, mode === 'api' ? 'codex-workflow-v1' : 'codex-handoff-v1');
      assert.equal(submission.body.scaleMode, 'auto'); assert.equal(submission.body.assetId, asset.id);
    } finally { fixture.h.close(); }
  }
  const unavailable = await pageFixture({ health: { ...both, executionModes: { ...both.executionModes, api: { configured: true, available: false } } } });
  try {
    await unavailable.upload();
    assert.equal(find(unavailable.h.tree, node => node.type === 'button' && node.props.className === 'lab-agent-send').props.disabled, true);
    await unavailable.h.click(node => node.type === 'button' && node.props.className === 'lab-agent-send');
    assert.equal(unavailable.posts.filter(item => item.path !== '/assets').length, 0);
  } finally { unavailable.h.close(); }
});

test('API awaiting-input uses inputContext and source calibration without creating or reanalyzing another job', async () => {
  const fixture = await pageFixture({ job: { id: 'api-input', projectId: 'project-test', executionMode: 'api', status: 'awaiting_input', sourceAsset: asset, input: { scaleMode: 'auto', prompt: '保留原图' }, inputContext: { requestId: 'api-request', revision: 3 }, handoff: { requestId: 'wrong-context', revision: 1 } } });
  const h = fixture.h;
  try {
    await h.click(node => node.type === 'button' && node.props.children === '空间预览');
    await h.click(node => node.type === 'button' && node.props.children === '打开比例尺');
    assert.equal(find(h.tree, node => node.type === 'button' && node.props.children === '原始平面图').props['aria-selected'], true);
    await h.change(node => node.type === 'select' && node.props.id === 'lab-scale-mode', 'manual');
    await h.change(node => node.type === 'input' && node.props.id === 'lab-scale', '25');
    await h.click(node => node.type === 'button' && node.props.children === '提交尺寸并继续');
    assert.equal(fixture.posts.length, 1); assert.equal(fixture.posts[0].path, '/jobs/api-input/input');
    assert.equal(fixture.posts[0].body.requestId, 'api-request'); assert.equal(fixture.posts[0].body.revision, 3); assert.equal(fixture.posts[0].body.mmPerPixel, 25);
    assert.doesNotMatch(text(h.tree), /复制接力指令|等待当前.*聊天接力/);
  } finally { h.close(); }
});

test('API candidates still upload actual browser captures once and do not render handoff-copy instructions', async () => {
  const job = { id: 'api-capture', projectId: 'project-test', executionMode: 'api', pipelineVersion: 'codex-workflow-v1', status: 'awaiting_review_images', reviewImagesRequired: true, sourceAsset: asset, input: { scaleMode: 'auto', prompt: '保留结构' }, draft: { id: 'api-draft', viewerUrl: '/api/ai-lab/v1/jobs/api-capture/viewer?draftId=api-draft' } };
  const fixture = await pageFixture({ job, draft: { draftId: 'api-draft', scene: {}, state: null, sourceAsset: asset } });
  try {
    await fixture.h.emit({ type: 'ai-lab:ready', projectId: 'draft-api-draft', projectVersion: 1 });
    await fixture.h.emit({ type: 'ai-lab:ready', projectId: 'draft-api-draft', projectVersion: 1 });
    assert.equal(fixture.captures, 1); assert.equal(fixture.posts.length, 1); assert.equal(fixture.posts[0].path, '/jobs/api-capture/review-images');
    assert.equal(fixture.posts[0].body.images[0].view, '2d'); assert.equal(fixture.posts[0].body.images[1].view, '3d');
    assert.doesNotMatch(text(fixture.h.tree), /复制接力指令|等待当前.*聊天接力/);
  } finally { fixture.h.close(); }
});

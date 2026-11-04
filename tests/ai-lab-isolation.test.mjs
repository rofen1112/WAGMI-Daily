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
  const code = ts.transpileModule(text.replaceAll('import.meta.env.DEV', 'true'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX }, fileName: relative }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, URL, URLSearchParams, AbortController, console, setTimeout, clearTimeout, ...context });
  return exports;
}

async function loadLabPage(context) {
  const calibration = await load('src/features/ai-lab/ScaleCalibrator.tsx', context);
  const workflow = await load('src/features/ai-lab/WorkflowSummary.tsx', context);
  const icons = await load('src/features/ai-lab/StudioIcon.tsx', context);
  const thumbnail = await load('src/features/ai-lab/SceneThumbnail.tsx', { ...context, require(id) { return id === './StudioIcon' ? icons : context.require(id); } });
  const gallery = await load('src/features/ai-lab/ProjectsGallery.tsx', { ...context, require(id) { if (id === './StudioIcon') return icons; if (id === './SceneThumbnail') return thumbnail; return context.require(id); } });
  return load('src/features/ai-lab/AiLabPage.tsx', { ...context, require(id) {
    if (id === './ScaleCalibrator') return calibration;
    if (id === './WorkflowSummary') return workflow;
    if (id === './StudioIcon') return icons;
    if (id === './ProjectsGallery') return gallery;
    if (id === './assets/ark-logo.png') return { default: '/test-assets/ark-logo.png' };
    return context.require(id);
  } });
}

function renderedText(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(renderedText).join('');
  return node && typeof node === 'object' ? renderedText(node.props?.children) : '';
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
  assert.equal(lab.href, '#/ai-lab');
  assert.equal((await route('#/ai-lab?tool=floorplan3d&projectId=p1', false, true)).params.get('projectId'), 'p1');
  assert.equal((await route('#/operations', false, true)).route, 'ai-lab');
  assert.equal((await route('#/github', false, false)).route, 'github');
});

test('gallery uses real projects, recent sorting and honest saved/unfinished card states', async () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  let requests = 0;
  const api = await load('src/features/ai-lab/api.ts');
  const icons = await load('src/features/ai-lab/StudioIcon.tsx', { require });
  const thumbnail = await load('src/features/ai-lab/SceneThumbnail.tsx', { require(id) { if (id === './api') return { ...api, request() { requests++; throw new Error('SSR must not load scenes'); } }; if (id === './StudioIcon') return icons; return require(id); } });
  const gallery = await load('src/features/ai-lab/ProjectsGallery.tsx', { require(id) { if (id === './api') return api; if (id === './StudioIcon') return icons; if (id === './SceneThumbnail') return thumbnail; return require(id); } });
  const projects = [{ id: 'older', title: '较早保存的住宅', sceneVersion: 2, updatedAt: '2026-11-01T01:00:00Z' }, { id: 'failed', title: '需要核对的办公室', sceneVersion: 0, updatedAt: '2026-11-04T01:00:00Z', latestJob: { status: 'failed' } }];
  assert.equal(gallery.sortGalleryProjects(projects, '', 'recent')[0].id, 'failed');
  assert.equal(gallery.sortGalleryProjects(projects, '  住宅 ', 'recent').length, 1);
  const html = renderToStaticMarkup(React.createElement(gallery.default, { projects, baselines: [], loading: false, busy: false, error: '', onOpen() {}, onNew() {}, onBaseline() {}, onRetry() {} }));
  assert.match(html, /你的3D项目/); assert.match(html, /新建3D项目/); assert.match(html, /需要核对的办公室/); assert.match(html, /生成失败/); assert.match(html, /版本 2 · 已保存/); assert.match(html, /尚无已保存方案/);
  assert.ok(html.indexOf('需要核对的办公室') < html.indexOf('较早保存的住宅'));
  assert.doesNotMatch(html, /<main|<iframe|<canvas|Rhino/); assert.equal(requests, 0);
});

test('scene thumbnails preserve real edited geometry and cache bounded concurrent scene reads', async () => {
  const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server');
  const api = await load('src/features/ai-lab/api.ts'); const icons = await load('src/features/ai-lab/StudioIcon.tsx', { require });
  let active = 0, maximum = 0, reads = 0; const pending = [];
  const fixture = { scene: { rooms: [{ poly: [[0, 0], [100, 0], [100, 100], [0, 100]] }], walls: [[0, 0, 5, 100, 'e'], [95, 0, 100, 100, 'e']], furniture: [{ cx: 5, cy: 5, w: 2, d: 3, rot: 0 }] }, state: { demolished: ['w0'], furniture: [{ cx: 70, cy: 20, w: 10, d: 20, rot: 90 }] }, source: 'baseline_reference' };
  const thumbnail = await load('src/features/ai-lab/SceneThumbnail.tsx', { require(id) { if (id === './StudioIcon') return icons; if (id === './api') return { ...api, request(path) { assert.match(path, /^\/projects\/[^/]+\/scene$/); reads++; active++; maximum = Math.max(maximum, active); return new Promise((resolve) => pending.push(() => { active--; resolve(fixture); })); } }; return require(id); } });
  const geometry = thumbnail.thumbnailGeometry(fixture);
  assert.equal(geometry.walls.length, 1); assert.equal(geometry.walls[0].x, 95); assert.equal(geometry.furniture[0].cx, 70); assert.equal(geometry.furniture[0].rot, 90); assert.equal(geometry.source, 'baseline_reference');
  const html = renderToStaticMarkup(React.createElement(thumbnail.ThumbnailSvg, { geometry, title: '<script>空间</script>' }));
  assert.match(html, /<svg/); assert.match(html, /rotate\(90 70 20\)/); assert.match(html, /&lt;script&gt;/); assert.doesNotMatch(html, /<iframe|<canvas|<script>/);
  assert.equal(thumbnail.thumbnailGeometry({ scene: { rooms: [{ poly: [['unsafe', 0], [1, 0], [0, 1]] }] }, state: null }), null);
  const first = thumbnail.loadThumbnail({ id: 'p1', sceneVersion: 1 });
  assert.equal(thumbnail.loadThumbnail({ id: 'p1', sceneVersion: 1 }), first);
  const promises = [first, ...[2, 3, 4, 5].map((id) => thumbnail.loadThumbnail({ id: 'p' + id, sceneVersion: 1 }))];
  assert.equal(reads, 3);
  for (let turn = 0; turn < 6; turn++) { while (pending.length) pending.shift()(); await new Promise(setImmediate); }
  await Promise.all(promises); assert.equal(reads, 5); assert.equal(maximum, 3);
  const nextVersion = thumbnail.loadThumbnail({ id: 'p1', sceneVersion: 2 }); assert.equal(reads, 6); pending.shift()(); await nextVersion;
  assert.equal(await thumbnail.loadThumbnail({ id: 'empty', sceneVersion: 0 }), null); assert.equal(reads, 6);
});

test('calibration maps contained-image coordinates to source pixels and submits each scale mode explicitly', async () => {
  const api = await load('src/features/ai-lab/api.ts');
  const asset = { id: 'a1', width: 1000, height: 500 };
  const point = api.imagePixelPoint(200, 200, { left: 0, top: 0, width: 400, height: 400 }, asset.width, asset.height);
  assert.equal(point[0], 500); assert.equal(point[1], 250);
  assert.equal(api.imagePixelPoint(200, 50, { left: 0, top: 0, width: 400, height: 400 }, 1000, 500), null);
  assert.equal(api.imagePixelPoint(0, 0, { left: 0, top: 0, width: 0, height: 1 }, 1000, 500), null);
  assert.equal(api.calibratedScale([[100, 100], [400, 500]], 3000, 1000, 500), 6);
  assert.equal(api.calibratedScale([[100, 100], [100, 100]], 3000, 1000, 500), null);
  assert.equal(api.calibratedScale([[0, 0], [1001, 0]], 1000, 1000, 500), null);
  const automatic = api.generationScalePayload('auto', '', [], '', asset);
  assert.equal(automatic.scaleMode, 'auto'); assert.equal('mmPerPixel' in automatic, false); assert.equal('calibration' in automatic, false);
  const manual = api.generationScalePayload('manual', '25', [], '', asset);
  assert.equal(manual.mmPerPixel, 25); assert.equal(manual.scaleMode, 'manual');
  const calibrated = api.generationScalePayload('calibrated', '', [[100, 100], [400, 500]], '3000', asset);
  assert.equal(calibrated.scaleMode, 'calibrated'); assert.equal(calibrated.calibration.lengthMm, 3000); assert.equal('mmPerPixel' in calibrated, false);
  assert.throws(() => api.generationScalePayload('manual', 'NaN', [], '', asset), /大于 0/);
  assert.throws(() => api.generationScalePayload('calibrated', '', [[1, 1], [1, 1]], '3000', asset), /两个不同点/);
  assert.equal(api.isActiveJob({ status: 'awaiting_review_images' }), true);
  assert.equal(api.projectStatusLabel({ sceneVersion: 0, latestJob: { status: 'awaiting_review_images' } }), '等待预览复核');
});

test('generation input snapshots restore only public assets and submitted valid fields', async () => {
  const api = await load('src/features/ai-lab/api.ts');
  const sourceAsset = { id: 'a1', name: '原图.png', mime: 'image/png', width: 1000, height: 500, url: '/api/ai-lab/v1/assets/a1' };
  const automatic = api.generationInputSnapshot({ sourceAsset, input: { scaleMode: 'auto', prompt: '保留原图隔断' } });
  assert.equal(automatic.sourceAsset.id, 'a1'); assert.equal(automatic.scaleMode, 'auto'); assert.equal(automatic.prompt, '保留原图隔断'); assert.equal(automatic.mmPerPixel, undefined);
  const calibrated = api.generationInputSnapshot({ sourceAsset, input: { scaleMode: 'calibrated', calibration: { p1: [0, 0], p2: [100, 0], lengthMm: 3000 } } });
  assert.equal(calibrated.calibration.lengthMm, 3000); assert.equal(calibrated.calibration.p2[0], 100);
  const legacy = api.generationInputSnapshot({ sourceAsset, input: { mmPerPixel: 25, prompt: '历史输入' } });
  assert.equal(legacy.mmPerPixel, 25); assert.equal(legacy.scaleMode, 'manual');
  assert.equal(api.generationInputSnapshot({ sourceAsset, input: { scaleMode: 'calibrated', calibration: { p1: [0, 0], p2: [2000, 0], lengthMm: 3000 } } }).calibration, undefined);
  assert.equal(api.generationInputSnapshot({ sourceAsset: { ...sourceAsset, url: 'https://other.test/image.png' } }).sourceAsset, undefined);
  assert.equal(api.generationInputSnapshot({ source: 'modified' }).scaleMode, undefined);
  for (const job of [null, {}, { input: null }, { input: { mmPerPixel: NaN } }]) assert.equal(api.generationInputSnapshot(job).mmPerPixel, undefined);
});

test('terminal candidate copy states that failed and cancelled work has stopped', async () => {
  const api = await load('src/features/ai-lab/api.ts');
  assert.match(api.draftStatusCopy({ status: 'awaiting_review_images' }).help, /保持空间预览打开/);
  assert.match(api.draftStatusCopy({ status: 'running', stage: 'visual_review' }).title, /视觉复核中/);
  assert.match(api.draftStatusCopy({ status: 'failed' }).title, /未通过检查/);
  assert.match(api.draftStatusCopy({ status: 'failed' }).help, /任务已停止/);
  assert.match(api.draftStatusCopy({ status: 'cancelled' }).help, /不会继续自动复核或保存/);
  for (const status of ['failed', 'cancelled', 'needs_input']) assert.doesNotMatch(api.draftStatusCopy({ status }).help, /保持空间预览打开|系统会提交/);
});

test('draft URLs and capture bridge reject unrelated origins, stale replies and incomplete images', async () => {
  const window = browser();
  const listeners = new Set();
  window.addEventListener = (_name, listener) => listeners.add(listener);
  window.removeEventListener = (_name, listener) => listeners.delete(listener);
  const api = await load('src/features/ai-lab/api.ts', { window });
  const url = '/api/ai-lab/v1/jobs/j1/viewer?draftId=d1';
  assert.equal(api.safeDraftViewerUrl(url, 'j1', 'd1', window.location.origin), url);
  for (const value of ['https://other.test' + url, '/api/ai-lab/v1/projects/p1/viewer?draftId=d1', url.replace('d1', 'stale'), 'javascript:alert(1)']) assert.throws(() => api.safeDraftViewerUrl(value, 'j1', 'd1', window.location.origin));
  const png = 'data:image/png;base64,AAAA';
  const jpeg = 'data:image/jpeg;base64,BBBB';
  const source = { postMessage(message, origin) {
    assert.equal(message.type, 'ai-lab:capture'); assert.equal(origin, window.location.origin);
    const data = { type: 'ai-lab:captures', requestId: message.requestId, planDataUrl: png, sceneDataUrl: jpeg };
    const emit = (event) => { for (const listener of listeners) listener(event); };
    emit({ source, origin: 'https://other.test', data }); emit({ source: {}, origin, data }); emit({ source, origin, data: { ...data, requestId: 'stale' } });
    assert.equal(listeners.size, 1); emit({ source, origin, data });
  } };
  const captures = await api.readViewerCaptures({ contentWindow: source });
  assert.equal(captures.planDataUrl, png); assert.equal(captures.sceneDataUrl, jpeg); assert.equal(listeners.size, 0);
  source.postMessage = (message, origin) => { for (const listener of listeners) listener({ source, origin, data: { type: 'ai-lab:captures', requestId: message.requestId, planDataUrl: png, sceneDataUrl: null } }); };
  await assert.rejects(api.readViewerCaptures({ contentWindow: source }), /有效的 2D 和 3D/);
  assert.equal(listeners.size, 0);
});

test('workflow summaries show actual scale evidence and visual conclusions with bounded escaped text', async () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const workflow = await load('src/features/ai-lab/WorkflowSummary.tsx', { require });
  const job = { pipelineVersion: 'codex-workflow-v1', stage: 'visual_review', events: [{ stage: 'analyzing' }, { stage: 'structure' }], analysis: { summary: '图中包含办公室', notes: ['<script>unsafe</script>'] }, scaleProvenance: { mode: 'estimated', mmPerPixel: 25, rangeMmPerPixel: [20, 30], confidence: 'low', evidence: ['以可见门宽作为参照'], assumptions: ['无明确尺寸标注'] }, visualReview: { pass: false, issues: [{ message: '房间分隔与原图不一致' }], limitations: ['遮挡区域无法核实'] } };
  const html = renderToStaticMarkup(React.createElement(workflow.default, { job }));
  assert.match(html, /分阶段生成/); assert.match(html, /分析图纸/); assert.match(html, /重建结构/); assert.match(html, /视觉复核/);
  assert.match(html, /自动估算/); assert.match(html, /25 mm \/ px/); assert.match(html, /估算范围 20–30/); assert.match(html, /置信度低/);
  assert.match(html, /不能作为实测尺寸/); assert.match(html, /以可见门宽/); assert.match(html, /需要调整/); assert.match(html, /房间分隔与原图不一致/);
  assert.match(html, /&lt;script&gt;unsafe&lt;\/script&gt;/); assert.doesNotMatch(html, /<script>/);
  const legacy = renderToStaticMarkup(React.createElement(workflow.default, { job: { pipelineVersion: 'legacy-single-v1' } }));
  assert.match(legacy, /历史单次生成流程/); assert.doesNotMatch(legacy, /含视觉复核/);
  const actual = renderToStaticMarkup(React.createElement(workflow.default, { job: { review: { pass: false, reason: '主体分区仍有遗漏', issues: [{ severity: 'critical', path: '$.rooms[1]', description: '楼梯区域位置不符', suggestedChange: '依据原图重新定位楼梯' }], limitations: ['图纸未标尺寸'] } } }));
  assert.match(actual, /需要调整/); assert.match(actual, /主体分区仍有遗漏/); assert.match(actual, /关键问题：楼梯区域位置不符/); assert.match(actual, /建议：依据原图重新定位楼梯/);
});

test('draft capture uploads once per revision, explicitly retries failure and never creates a generation job', async () => {
  const window = browser('#/ai-lab?tool=floorplan3d&projectId=p1'); window.history.owner = window;
  const listeners = new Map(), timers = new Map(); let timerId = 0;
  window.addEventListener = (type, callback) => { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); };
  window.removeEventListener = (type, callback) => listeners.get(type)?.delete(callback);
  window.setTimeout = (callback, delay) => { timers.set(++timerId, { callback, delay }); return timerId; };
  window.clearTimeout = (id) => timers.delete(id);
  const emit = (event) => { for (const callback of [...listeners.get('message') || []]) callback(event); };
  const helpers = await load('src/features/ai-lab/api.ts', { window });
  const inputAsset = { id: 'input-a', name: '分析中的原图.png', mime: 'image/png', width: 1000, height: 500, url: '/api/ai-lab/v1/assets/input-a' };
  let currentJob = { id: 'j1', projectId: 'p1', status: 'running', stage: 'analyzing', pipelineVersion: 'codex-workflow-v1', sourceAsset: inputAsset, input: { scaleMode: 'auto', prompt: '本次原始生成要求' } };
  const project = { id: 'p1', title: '候选复核', sceneVersion: 1 };
  const posts = []; let captureCount = 0, failCapture = false;
  const source = { postMessage(message, origin) {
    assert.equal(message.type, 'ai-lab:capture'); captureCount++;
    emit({ source, origin, data: { type: 'ai-lab:captures', requestId: message.requestId, ...(failCapture ? { error: 'capture_busy', planDataUrl: null, sceneDataUrl: null } : { planDataUrl: 'data:image/png;base64,AAAA', sceneDataUrl: 'data:image/jpeg;base64,BBBB' }) } });
  } };
  const api = { ...helpers, async request(path) {
    if (path === '/health') return { status: 'ok', providerConfigured: true };
    if (path === '/projects') return { projects: [{ ...project, latestJob: currentJob }] };
    if (path === '/baselines') return { baselines: [] };
    if (path === '/projects/p1/scene') return { scene: { furniture: [] }, state: null, version: 1, source: 'baseline_reference' };
    if (path === '/jobs/j1') return { job: currentJob };
    if (path === '/jobs/j1/draft') return { draftId: currentJob.draft.id, scene: { furniture: [] }, state: null, validation: { errors: [], warnings: [] } };
    throw new Error(`Unexpected GET ${path}`);
  }, async post(path, body) { assert.equal(path, '/jobs/j1/review-images'); posts.push({ path, body }); return {}; } };
  const hooks = []; let cursor = 0, dirty = false, effects = [], tree;
  const equal = (a, b) => a?.length === b?.length && a.every((value, index) => Object.is(value, b[index]));
  const react = {
    useState(initial) { const index = cursor++; hooks[index] ??= { value: initial }; return [hooks[index].value, (next) => { const value = typeof next === 'function' ? next(hooks[index].value) : next; if (!Object.is(value, hooks[index].value)) { hooks[index].value = value; dirty = true; } }]; },
    useRef(initial) { const index = cursor++; hooks[index] ??= { current: initial }; return hooks[index]; },
    useCallback(callback, deps) { const index = cursor++; if (!hooks[index] || !equal(hooks[index].deps, deps)) hooks[index] = { callback, deps }; return hooks[index].callback; },
    useEffect(callback, deps) { const index = cursor++, previous = hooks[index]; if (!previous || !equal(previous.deps, deps)) { hooks[index] = { deps }; effects.push(() => { previous?.cleanup?.(); hooks[index].cleanup = callback(); }); } },
  };
  const jsx = (type, props, key) => { if (type === 'iframe' && props.ref) props.ref.current = { contentWindow: source }; return { type, props, key }; };
  const page = await loadLabPage({ window, require(id) {
    if (id === 'react') return react;
    if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    if (id === './api') return api;
    if (id === './ai-lab.css') return {};
    throw new Error(`Unexpected import ${id}`);
  } });
  const render = () => { cursor = 0; dirty = false; tree = page.default(); const pending = effects; effects = []; for (const effect of pending) effect(); };
  const flush = async () => { for (let index = 0; index < 15; index++) { await new Promise(setImmediate); if (dirty) render(); } };
  const find = (node, predicate) => { if (!node || typeof node !== 'object') return null; if (Array.isArray(node)) { for (const child of node) { const found = find(child, predicate); if (found) return found; } return null; } return predicate(node) ? node : find(node.props?.children, predicate); };
  const poll = async () => { const timer = [...timers.entries()].find(([, item]) => item.delay === 500 || item.delay === 1500); assert.ok(timer); timers.delete(timer[0]); await timer[1].callback(); await flush(); };
  const ready = async () => { emit({ source, origin: window.location.origin, data: { type: 'ai-lab:ready' } }); await flush(); };
  render(); await flush();
  const originalTab = find(tree, (node) => node.type === 'button' && node.props.children === '原始平面图');
  assert.equal(originalTab.props.disabled, false); originalTab.props.onClick(); await flush();
  assert.ok(find(tree, (node) => node.type === 'img' && node.props.src === inputAsset.url));
  currentJob = { ...currentJob, status: 'awaiting_review_images', stage: 'preview', reviewImagesRequired: true, draft: { id: 'd1', viewerUrl: '/api/ai-lab/v1/jobs/j1/viewer?draftId=d1' } }; await poll();
  assert.ok(find(tree, (node) => node.type === 'iframe' && node.props.src.includes('draftId=d1')));
  assert.equal(find(tree, (node) => node.type === 'iframe').props.className.includes('is-draft'), true);
  await ready();
  assert.equal(captureCount, 1); assert.equal(posts.length, 1); assert.equal(posts[0].body.draftId, 'd1');
  assert.equal(posts[0].body.images[0].view, '2d'); assert.equal(posts[0].body.images[1].view, '3d');
  currentJob = { ...currentJob, sourceAsset: { ...inputAsset, id: 'repeat', url: '/api/ai-lab/v1/assets/repeat' }, input: { scaleMode: 'manual', mmPerPixel: 99, prompt: '轮询重复字段不应回填' } };
  await ready(); await poll(); assert.equal(captureCount, 1); assert.equal(posts.length, 1);
  assert.equal(find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-prompt').props.value, '本次原始生成要求');
  assert.equal(find(tree, (node) => node.type === 'select' && node.props.id === 'lab-scale-mode').props.value, 'auto');
  assert.equal(find(tree, (node) => node.type === 'iframe').props.src.includes('draftId=d1'), true);
  for (const label of ['导出 JSON', '保存方案']) assert.equal(find(tree, (node) => node.type === 'button' && node.props.children === label).props.disabled, true);
  assert.equal(find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-chat').props.disabled, true);
  currentJob = { ...currentJob, draft: { id: 'd2', viewerUrl: '/api/ai-lab/v1/jobs/j1/viewer?draftId=d2' } };
  failCapture = true; await poll(); await ready();
  assert.equal(captureCount, 2); assert.equal(posts.length, 1);
  await ready(); assert.equal(captureCount, 2);
  failCapture = false;
  const retry = find(tree, (node) => node.type === 'button' && node.props.children === '重试提交视图'); assert.equal(retry.props.disabled, false); retry.props.onClick(); await flush();
  assert.equal(captureCount, 3); assert.equal(posts.length, 2); assert.equal(posts[1].body.draftId, 'd2');
  currentJob = { ...currentJob, status: 'failed', reviewImagesRequired: false }; await poll();
  assert.match(find(tree, (node) => node.type === 'iframe').props.title, /未通过检查/);
  const terminalHelp = find(tree, (node) => node.props?.className === 'lab-editor-help').props.children;
  assert.match(terminalHelp, /任务已停止/); assert.doesNotMatch(terminalHelp, /保持空间预览打开|系统会提交/);
  assert.equal(find(tree, (node) => node.type === 'button' && node.props.children === '导出 JSON').props.disabled, true);
  const saved = find(tree, (node) => node.type === 'button' && Array.isArray(node.props.children) && node.props.children[0] === '已保存版本 '); assert.ok(saved); saved.props.onClick(); await flush();
  assert.equal(find(tree, (node) => node.type === 'iframe').props.src.includes('/projects/p1/viewer'), true);
  assert.equal(find(tree, (node) => node.type === 'button' && node.props.children === '导出 JSON').props.disabled, false);
  for (const hook of hooks) hook?.cleanup?.();
});

test('project links restore, react to A-B-back-A and preserve edits on unrelated query changes', async () => {
  const window = browser('#/ai-lab?tool=floorplan3d&projectId=p1&context=handoff');
  window.history.owner = window;
  const listeners = new Map();
  window.addEventListener = (type, callback) => { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); };
  window.removeEventListener = (type, callback) => listeners.get(type)?.delete(callback);
  const failedJob = { id: 'j3', projectId: 'p3', status: 'failed', validation: { errors: [{ code: 'outside_boundary', path: '$.rooms[11].poly' }] } };
  const recoveryAsset = { id: 'recovery', name: '无需重传.png', mime: 'image/png', width: 1000, height: 500, url: '/api/ai-lab/v1/assets/recovery' };
  const automaticJob = { id: 'j4', projectId: 'p4', status: 'needs_input', sourceAsset: recoveryAsset, input: { scaleMode: 'auto', prompt: '自动比例原始要求' } };
  const calibrationJob = { id: 'j5', projectId: 'p5', status: 'failed', sourceAsset: recoveryAsset, input: { scaleMode: 'calibrated', calibration: { p1: [100, 100], p2: [400, 100], lengthMm: 3000 }, prompt: '校准原始要求' } };
  const manualJob = { id: 'j6', projectId: 'p6', status: 'failed', sourceAsset: recoveryAsset, input: { scaleMode: 'manual', mmPerPixel: 18, prompt: '手动比例原始要求' } };
  const projects = [{ id: 'p1', title: '住宅', sceneVersion: 2 }, { id: 'p2', title: '办公', sceneVersion: 1 }, { id: 'p3', title: '未通过校验', sceneVersion: 0, latestJob: failedJob }, { id: 'p4', title: '自动估算待补信息', sceneVersion: 0, latestJob: automaticJob }, { id: 'p5', title: '已知长度失败项目', sceneVersion: 0, latestJob: calibrationJob }, { id: 'p6', title: '失败但保留旧版本', sceneVersion: 2, latestJob: manualJob }];
  let projectRefreshResponse = null;
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
      if (path === '/projects') return projectRefreshResponse ? projectRefreshResponse() : { projects: projects.map((project) => ({ ...project })) };
      if (path === '/baselines') return { baselines: [{ id: 'reference-one', title: '离线历史参考' }] };
      if (['/projects/p3/scene', '/projects/p4/scene', '/projects/p5/scene'].includes(path)) return null;
      if (path === '/projects/p6/scene') return { scene: { furniture: [], metadata: { mmPerPixel: 99 } }, state: null, version: 2, sourceAsset: { ...recoveryAsset, id: 'older', url: '/api/ai-lab/v1/assets/older' } };
      if (path.endsWith('/scene')) return { scene: { furniture: [], metadata: { mmPerPixel: path.includes('/p1/') ? 25 : -2 } }, state: null, version: 2 };
      throw new Error(`Unexpected request: ${path}`);
    },
    async post() { throw new Error('Restoring a project must never create a job'); },
  };
  const page = await loadLabPage({ window, require(id) {
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
  assert.equal(find(tree, (node) => node.props?.role === 'tabpanel' && node.props['aria-label'] === '对话调整').props.hidden, false);
  find(tree, (node) => node.type === 'button' && node.props.role === 'tab' && renderedText(node) === '生成空间').props.onClick(); await flush();
  assert.equal(find(tree, (node) => node.type === 'select' && node.props.id === 'lab-scale-mode').props.value, 'auto');
  find(tree, (node) => node.type === 'select' && node.props.id === 'lab-scale-mode').props.onChange({ target: { value: 'manual' } }); await flush();
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
  assert.match(tree.props.className, /lab-gallery-shell/);
  assert.equal(new URLSearchParams(window.location.hash.split('?')[1]).has('view'), false);
  const galleryProps = () => find(tree, (node) => typeof node.props?.onNew === 'function' && Array.isArray(node.props.projects)).props;
  galleryProps().onOpen(projects.find((project) => project.id === 'p2')); await flush();
  assert.equal(new URLSearchParams(window.location.hash.split('?')[1]).get('projectId'), 'p2');
  const create = find(tree, (node) => node.type === 'button' && node.props.className?.includes('lab-new'));
  create.props.onClick(); await flush();
  query = new URLSearchParams(window.location.hash.split('?')[1]);
  assert.equal(query.has('projectId'), false); assert.equal(query.get('tool'), 'floorplan3d');
  assert.equal(query.get('view'), 'new');
  assert.equal(requests.filter((path) => path === '/projects/p1/scene').length, 2);
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p3');
  assert.ok(find(tree, (node) => node.type === 'h2' && node.props.children === '生成未通过检查'));
  const footer = find(tree, (node) => node.props?.className === 'lab-canvas-footer');
  assert.match(renderedText(footer), /生成失败/);
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p4');
  assert.ok(find(tree, (node) => node.type === 'img' && node.props.src === recoveryAsset.url));
  assert.equal(find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-prompt').props.value, '自动比例原始要求');
  assert.equal(find(tree, (node) => node.type === 'select' && node.props.id === 'lab-scale-mode').props.value, 'auto');
  assert.equal(find(tree, (node) => node.type === 'button' && node.props.className?.includes('lab-generate')).props.disabled, false);
  find(tree, (node) => node.type === 'select' && node.props.id === 'lab-scale-mode').props.onChange({ target: { value: 'calibrated' } }); await flush();
  const calibrator = () => find(tree, (node) => node.props?.asset?.id === recoveryAsset.id && Array.isArray(node.props.points));
  calibrator().props.onPoints([[10, 10], [510, 10]]); calibrator().props.onLength('5000');
  find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-prompt').props.onChange({ target: { value: '用户正在修正生成要求' } }); await flush();
  const recoveryReads = requests.filter((path) => path === '/projects/p4/scene').length;
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p4&context=unrelated');
  assert.equal(calibrator().props.lengthMm, '5000'); assert.equal(calibrator().props.points[1][0], 510);
  assert.equal(find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-prompt').props.value, '用户正在修正生成要求');
  assert.equal(requests.filter((path) => path === '/projects/p4/scene').length, recoveryReads);
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p5');
  assert.equal(calibrator().props.lengthMm, '3000'); assert.equal(calibrator().props.points[0][0], 100); assert.equal(calibrator().props.points[1][0], 400);
  assert.equal(find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-prompt').props.value, '校准原始要求');
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p6');
  assert.ok(find(tree, (node) => node.type === 'iframe' && node.props.src.includes('/projects/p6/viewer?version=2')));
  assert.equal(find(tree, (node) => node.type === 'input' && node.props.id === 'lab-scale').props.value, '18');
  assert.equal(find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-prompt').props.value, '手动比例原始要求');
  find(tree, (node) => node.type === 'button' && node.props.children === '原始平面图').props.onClick(); await flush();
  assert.ok(find(tree, (node) => node.type === 'img' && node.props.src === recoveryAsset.url));
  projects.push({ id: 'p7', title: '由另一个窗口创建', sceneVersion: 1 });
  const readsBeforeNewProject = requests.filter((path) => path === '/projects').length;
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p7&context=external');
  assert.equal(requests.filter((path) => path === '/projects').length, readsBeforeNewProject + 1);
  assert.ok(find(tree, (node) => node.type === 'iframe' && node.props.src.includes('/projects/p7/viewer')));
  assert.equal(new URLSearchParams(window.location.hash.split('?')[1]).get('context'), 'external');
  let resolveLateLookup;
  projectRefreshResponse = () => new Promise((resolve) => { resolveLateLookup = resolve; });
  const readsBeforePending = requests.filter((path) => path === '/projects').length;
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p8&context=pending');
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p8&context=unrelated');
  assert.equal(requests.filter((path) => path === '/projects').length, readsBeforePending + 1, 'Unrelated query changes must share one pending project refresh.');
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p7&context=keep-editing');
  find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-prompt').props.onChange({ target: { value: '异步查找期间保留的编辑' } }); await flush();
  const preservedFrame = find(tree, (node) => node.type === 'iframe').key;
  projects.push({ id: 'p8', title: '迟到的新项目', sceneVersion: 1 });
  resolveLateLookup({ projects: projects.map((project) => ({ ...project })) }); await flush();
  assert.equal(find(tree, (node) => node.type === 'iframe').key, preservedFrame);
  assert.equal(find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-prompt').props.value, '异步查找期间保留的编辑');
  assert.equal(requests.includes('/projects/p8/scene'), false, 'A late lookup must not follow a URL that is no longer selected.');
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p9');
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p6');
  find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-prompt').props.onChange({ target: { value: '切换项目后保留的编辑' } }); await flush();
  const switchedFrame = find(tree, (node) => node.type === 'iframe').key;
  projects.push({ id: 'p9', title: '选择已变化的迟到项目', sceneVersion: 1 });
  resolveLateLookup({ projects: projects.map((project) => ({ ...project })) }); await flush();
  assert.equal(find(tree, (node) => node.type === 'iframe').key, switchedFrame);
  assert.equal(find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-prompt').props.value, '切换项目后保留的编辑');
  assert.equal(requests.includes('/projects/p9/scene'), false);
  projectRefreshResponse = null;
  const readsBeforeMissing = requests.filter((path) => path === '/projects').length;
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=missing');
  assert.equal(requests.filter((path) => path === '/projects').length, readsBeforeMissing + 1);
  assert.ok(find(tree, (node) => node.type === 'p' && node.props.children === '链接中的项目不存在，请从项目列表重新选择。'));
  assert.equal(find(tree, (node) => node.type === 'iframe').key, switchedFrame);
  assert.equal(requests.includes('/projects/missing/scene'), false);
  const requestsBeforeDockChanges = requests.length;
  const dockFrame = find(tree, (node) => node.type === 'iframe').key;
  find(tree, (node) => node.type === 'button' && node.props['aria-label'] === '专注画布').props.onClick(); await flush();
  assert.match(tree.props.className, /is-left-collapsed/); assert.match(tree.props.className, /is-right-collapsed/);
  assert.equal(find(tree, (node) => node.type === 'iframe').key, dockFrame);
  find(tree, (node) => node.type === 'button' && node.props['aria-label'] === '专注画布').props.onClick(); await flush();
  assert.doesNotMatch(tree.props.className, /is-left-collapsed|is-right-collapsed/);
  find(tree, (node) => node.type === 'button' && node.props.role === 'tab' && renderedText(node) === '生成空间').props.onClick(); await flush();
  find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-prompt').props.onChange({ target: { value: '切换面板也保留的要求' } }); await flush();
  find(tree, (node) => node.type === 'button' && node.props.role === 'tab' && renderedText(node) === '对话调整').props.onClick(); await flush();
  assert.equal(find(tree, (node) => node.props?.role === 'tabpanel' && node.props['aria-label'] === '生成空间').props.hidden, true);
  find(tree, (node) => node.type === 'button' && node.props.role === 'tab' && renderedText(node) === '生成空间').props.onClick(); await flush();
  assert.equal(find(tree, (node) => node.type === 'textarea' && node.props.id === 'lab-prompt').props.value, '切换面板也保留的要求');
  window.matchMedia = () => ({ matches: true });
  find(tree, (node) => node.type === 'button' && node.props['aria-label'] === '切换项目侧栏').props.onClick(); await flush();
  assert.match(tree.props.className, /mobile-projects-open/); assert.doesNotMatch(tree.props.className, /mobile-controls-open/);
  find(tree, (node) => node.type === 'button' && node.props['aria-label'] === '切换创作侧栏').props.onClick(); await flush();
  assert.match(tree.props.className, /mobile-controls-open/); assert.doesNotMatch(tree.props.className, /mobile-projects-open/);
  for (const callback of listeners.get('keydown') || []) callback({ key: 'Escape' }); await flush();
  assert.doesNotMatch(tree.props.className, /mobile-controls-open|mobile-projects-open/);
  assert.equal(find(tree, (node) => node.type === 'iframe').key, dockFrame);
  assert.equal(requests.length, requestsBeforeDockChanges, 'Dock and tab changes must not issue requests.');
  const backToProjects = find(tree, (node) => node.type === 'a' && node.props['aria-label'] === '返回项目管理');
  assert.equal(backToProjects.props.href, '#/ai-lab?tool=floorplan3d'); backToProjects.props.onClick({ preventDefault() {} }); await flush();
  assert.match(tree.props.className, /lab-gallery-shell/); assert.equal(new URLSearchParams(window.location.hash.split('?')[1]).has('projectId'), false);
  const sceneReadsBeforeGallery = requests.filter((path) => path.endsWith('/scene')).length;
  galleryProps().onNew(); await flush();
  assert.equal(new URLSearchParams(window.location.hash.split('?')[1]).get('view'), 'new');
  assert.doesNotMatch(tree.props.className, /lab-gallery-shell/); assert.equal(find(tree, (node) => node.type === 'iframe'), null);
  assert.equal(requests.filter((path) => path.endsWith('/scene')).length, sceneReadsBeforeGallery, 'New project enters an empty editor without API creation or scene loading.');
  await navigateHash('#/ai-lab?tool=floorplan3d'); assert.match(tree.props.className, /lab-gallery-shell/);
  await navigateHash('#/ai-lab'); assert.equal(window.location.hash, '#/ai-lab'); assert.match(tree.props.className, /lab-gallery-shell/);
  await navigateHash('#/ai-lab?tool=unknown&projectId=p1'); assert.equal(window.location.hash, '#/ai-lab?tool=unknown&projectId=p1'); assert.match(tree.props.className, /lab-gallery-shell/);
  await navigateHash('#/ai-lab?projectId=p1'); assert.ok(find(tree, (node) => node.type === 'iframe' && node.props.src.includes('/projects/p1/viewer')));
  assert.equal(new URLSearchParams(window.location.hash.split('?')[1]).get('tool'), 'floorplan3d');
  find(tree, (node) => node.type === 'a' && node.props['aria-label'] === '返回项目管理').props.onClick({ preventDefault() {} }); await flush();
  let resolveReference;
  const referencePosts = [];
  api.post = async (path) => {
    referencePosts.push(path);
    if (path === '/projects') return new Promise((resolve) => { resolveReference = resolve; });
    if (path === '/projects/reference-created/baseline') return { version: 1 };
    throw new Error('Unexpected reference request');
  };
  galleryProps().onBaseline(galleryProps().baselines[0]); await flush();
  await navigateHash('#/ai-lab');
  resolveReference({ project: { id: 'reference-created', title: '迟到的参考载入', sceneVersion: 0 } }); await flush();
  assert.equal(window.location.hash, '#/ai-lab'); assert.match(tree.props.className, /lab-gallery-shell/);
  assert.equal(requests.includes('/projects/reference-created/scene'), false);
  assert.equal(referencePosts.length, 2);
  await navigateHash('#/ai-lab?tool=floorplan3d&projectId=p4');
  let resolveGeneration;
  let generationPosts = 0;
  api.post = async (path, body) => {
    assert.equal(path, '/projects/p4/jobs'); assert.equal(body.pipelineVersion, 'codex-workflow-v1'); generationPosts++;
    return new Promise((resolve) => { resolveGeneration = resolve; });
  };
  find(tree, (node) => node.type === 'button' && node.props.className?.includes('lab-generate')).props.onClick(); await flush();
  await navigateHash('#/ai-lab');
  resolveGeneration({ job: { id: 'late-generation', projectId: 'p4', status: 'queued' } }); await flush();
  assert.equal(window.location.hash, '#/ai-lab'); assert.match(tree.props.className, /lab-gallery-shell/);
  assert.equal(galleryProps().projects.find((project) => project.id === 'p4').latestJob.id, 'j4');
  assert.equal(generationPosts, 1);
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
  const page = await loadLabPage({ require(id) {
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
  const page = await loadLabPage({ require(id) {
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

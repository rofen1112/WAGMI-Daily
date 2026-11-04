import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';

const sourceRoot = resolve(import.meta.dirname, '..');
const moduleRoot = resolve(process.env.AI_LAB_MODULE_ROOT || sourceRoot);
const require = createRequire(resolve(moduleRoot, 'package.json'));
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const browser = process.env.AI_LAB_TEST_BROWSER || [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
].find(existsSync);

function load(relative, imports = {}) {
  const source = readFileSync(resolve(sourceRoot, relative), 'utf8');
  const code = ts.transpileModule(source, { fileName: relative, compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, URL, URLSearchParams, require(id) { return imports[id] || require(id); } });
  return exports;
}

function fixtureHtml() {
  const api = load('src/features/ai-lab/api.ts');
  const { default: Calibrator } = load('src/features/ai-lab/ScaleCalibrator.tsx', { './api': api });
  const { default: Workflow } = load('src/features/ai-lab/WorkflowSummary.tsx');
  const image = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600"><rect width="1000" height="600" fill="white"/><path d="M50 50H950V550H50ZM500 50V550M50 300H500" fill="none" stroke="#333" stroke-width="8"/></svg>').toString('base64')}`;
  const asset = { id: 'layout-only', name: '布局测试平面图', width: 1000, height: 600, url: image };
  const calibration = renderToStaticMarkup(React.createElement(Calibrator, { asset, imageUrl: image, points: [[50, 50], [950, 50]], lengthMm: '9000', disabled: false, onPoints() {}, onLength() {} }));
  const paragraph = '模型复核发现局部隔断和家具位置仍需人工确认，请按原始图纸逐项核对。'.repeat(12);
  const job = { pipelineVersion: 'codex-workflow-v1', stage: 'visual_review', analysis: { summary: paragraph, notes: Array(4).fill(paragraph) }, scaleProvenance: { mode: 'estimated', mmPerPixel: 25, confidence: 'low', evidence: Array(6).fill(paragraph), assumptions: Array(6).fill(paragraph) }, visualReview: { pass: false, reason: paragraph, issues: Array.from({ length: 8 }, () => ({ severity: 'critical', description: paragraph, suggestedChange: paragraph })), limitations: Array(6).fill(paragraph) } };
  const workflow = renderToStaticMarkup(React.createElement(Workflow, { job }));
  const baseCss = readFileSync(resolve(moduleRoot, 'src/styles.css'), 'utf8');
  const labCss = readFileSync(resolve(sourceRoot, 'src/features/ai-lab/ai-lab.css'), 'utf8');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseCss}\n${labCss}</style></head><body>
  <header class="app-header"><div class="header-inner"><span class="brand">ark.insight</span></div></header><main class="app-main"><section class="ai-lab">
  <div class="lab-heading"><div><div class="lab-eyebrow">AI 实验室</div><h1>从一张平面图，开始构建空间</h1><p>识别户型，生成 2D / 3D 方案，再用对话持续调整。</p></div></div>
  <div class="lab-workspace"><aside class="lab-sidebar">我的项目</aside><div class="lab-editor"><div class="lab-editor-toolbar"><div class="lab-tabs"><button>原始平面图</button></div></div><div class="lab-canvas">${calibration}</div><div class="lab-canvas-footer">候选方案 · 尚未保存</div><div class="lab-editor-help">校准依据来自提供的已知长度，未经现场核验。</div></div>
  <aside class="lab-controls"><div class="lab-control-heading"><h2>平面图转 3D</h2></div><label class="lab-field-label">比例依据</label><select class="lab-input"><option>已知长度校准</option></select><section class="lab-job">${workflow}</section></aside></div></section></main>
  <pre id="layout-result"></pre><script>setTimeout(() => {
    const rect = element => { const value = element.getBoundingClientRect(); return { top: value.top, bottom: value.bottom, left: value.left, right: value.right, width: value.width, height: value.height }; };
    const canvas = document.querySelector('.lab-canvas'), controls = document.querySelector('.lab-controls'), image = document.querySelector('.lab-calibration-image img'), known = document.querySelector('#lab-known-length');
    const before = rect(image); controls.scrollTop = controls.scrollHeight;
    const unchanged = rect(image);
    const desktop = window.innerWidth > 900;
    if (desktop) canvas.scrollTop += known.getBoundingClientRect().top - canvas.getBoundingClientRect().top - 18;
    document.querySelector('#layout-result').textContent = JSON.stringify({ viewport: { width: innerWidth, height: innerHeight }, image: before, imageAfterReportScroll: unchanged, workspace: rect(document.querySelector('.lab-workspace')), editor: rect(document.querySelector('.lab-editor')), canvas: rect(canvas), knownLength: rect(known), controls: { ...rect(controls), clientHeight: controls.clientHeight, scrollHeight: controls.scrollHeight, overflow: getComputedStyle(controls).overflowY }, pageScrollTop: document.scrollingElement.scrollTop, pageScrollWidth: document.scrollingElement.scrollWidth });
  }, 100);</script></body></html>`;
}

async function measureInBrowser(html, profile, width, height) {
  const child = spawn(browser, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', '--disable-extensions', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  const exited = once(child, 'exit');
  let socket;
  const pending = new Map();
  let sequence = 0;
  try {
    const endpoint = await new Promise((resolveEndpoint, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error('Chromium did not expose its private test endpoint.')), 10000);
      child.once('error', (error) => { clearTimeout(timer); reject(error); });
      child.stderr.on('data', (data) => {
        output = (output + data.toString()).slice(-8000);
        const match = output.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:[^\s]+)/);
        if (match) { clearTimeout(timer); resolveEndpoint(match[1]); }
      });
    });
    socket = new WebSocket(endpoint);
    await once(socket, 'open');
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      const handler = pending.get(message.id);
      if (!handler) return;
      pending.delete(message.id); clearTimeout(handler.timer);
      if (message.error) handler.reject(new Error(message.error.message)); else handler.resolve(message.result);
    });
    const call = (method, params = {}, sessionId) => new Promise((resolveCall, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Browser test timed out: ${method}`)); }, 10000);
      pending.set(id, { resolve: resolveCall, reject, timer });
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
    const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
    await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false, screenWidth: width, screenHeight: height }, sessionId);
    await call('Page.navigate', { url: pathToFileURL(html).href }, sessionId);
    let measured;
    for (let attempt = 0; attempt < 80; attempt++) {
      const result = await call('Runtime.evaluate', { expression: "document.querySelector('#layout-result')?.textContent", returnByValue: true }, sessionId);
      if (result.result?.value) { measured = JSON.parse(result.result.value); break; }
      await new Promise((resume) => setTimeout(resume, 25));
    }
    assert.ok(measured, 'Browser must execute the actual layout probe.');
    await call('Browser.close').catch(() => {});
    return measured;
  } finally {
    for (const handler of pending.values()) { clearTimeout(handler.timer); handler.reject(new Error('Browser test closed.')); }
    pending.clear(); socket?.close();
    if (child.exitCode === null) child.kill();
    await exited;
  }
}

test('long real workflow SSR keeps desktop calibration visible and mobile content naturally stacked', { skip: !browser ? 'No Chromium browser is installed for actual layout measurement.' : false }, async (context) => {
  const tempBase = resolve(tmpdir());
  const directory = mkdtempSync(resolve(tempBase, 'ai-lab-layout-'));
  try {
    const html = resolve(directory, 'fixture.html');
    writeFileSync(html, fixtureHtml());
    for (const [width, height] of [[1352, 880], [390, 844]]) {
      const measured = await measureInBrowser(html, resolve(directory, `profile-${width}`), width, height);
      assert.equal(measured.viewport.width, width);
      assert.equal(measured.viewport.height, height);
      context.diagnostic(JSON.stringify({ requestedWidth: width, viewport: measured.viewport, imageTop: measured.image.top, workspaceHeight: measured.workspace.height, reportClientHeight: measured.controls.clientHeight, reportScrollHeight: measured.controls.scrollHeight }));
      assert.ok(measured.image.top >= measured.canvas.top, JSON.stringify(measured));
      assert.ok(measured.image.top < measured.viewport.height - 100, 'Calibration image must start inside the first viewport.');
      assert.equal(measured.image.top, measured.imageAfterReportScroll.top, 'Scrolling the long report must not move calibration.');
      assert.ok(measured.pageScrollWidth <= measured.viewport.width + 1, 'No horizontal page overflow.');
      if (width > 900) {
        assert.ok(measured.workspace.height <= 900, 'Long review must not enlarge the desktop workspace.');
        assert.ok(measured.controls.scrollHeight > measured.controls.clientHeight * 2, 'The long real report must scroll inside its panel.');
        assert.equal(measured.controls.overflow, 'auto');
        assert.ok(measured.knownLength.top >= measured.canvas.top && measured.knownLength.bottom <= measured.canvas.bottom + 1, 'Known-length form must be reachable by scrolling only the calibration panel.');
        assert.equal(measured.pageScrollTop, 0);
      } else {
        assert.ok(measured.controls.top >= measured.editor.bottom - 1, 'Mobile report must follow the editor in normal document flow.');
        assert.equal(measured.controls.overflow, 'visible');
      }
    }
  } finally {
    const resolved = resolve(directory);
    assert.equal(dirname(resolved), tempBase);
    assert.ok(resolved.startsWith(tempBase + sep) && resolved.includes('ai-lab-layout-'));
    rmSync(resolved, { recursive: true, force: true });
  }
});

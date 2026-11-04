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

function load(relative, imports = {}, globals = {}) {
  // Match Vite's dev macro when rendering the real page in this CJS fixture.
  const source = readFileSync(resolve(sourceRoot, relative), 'utf8').replaceAll('import.meta.env.DEV', 'true');
  const code = ts.transpileModule(source, { fileName: relative, compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, URL, URLSearchParams, ...globals, require(id) { return imports[id] || require(id); } });
  return exports;
}

function fixtureHtml(width, view = 'editor') {
  const api = load('src/features/ai-lab/api.ts');
  const { default: Calibrator } = load('src/features/ai-lab/ScaleCalibrator.tsx', { './api': api });
  const workflowModule = load('src/features/ai-lab/WorkflowSummary.tsx');
  const { default: Workflow } = workflowModule;
  const icons = load('src/features/ai-lab/StudioIcon.tsx');
  const thumbnail = load('src/features/ai-lab/SceneThumbnail.tsx', { './api': api, './StudioIcon': icons });
  const gallery = load('src/features/ai-lab/ProjectsGallery.tsx', { './api': api, './StudioIcon': icons, './SceneThumbnail': thumbnail });
  const { default: Page } = load('src/features/ai-lab/AiLabPage.tsx', {
    './api': api, './ScaleCalibrator': { default: Calibrator }, './WorkflowSummary': workflowModule,
    './StudioIcon': icons, './ProjectsGallery': gallery, './ai-lab.css': {},
    './assets/ark-logo.png': { default: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"/%3E' },
  }, { window: { location: { hash: view === 'gallery' ? '#/ai-lab?tool=floorplan3d' : '#/ai-lab?tool=floorplan3d&view=new', origin: 'http://127.0.0.1:5186' }, matchMedia() { return { matches: width <= 980 }; } } });
  const page = renderToStaticMarkup(React.createElement(Page));
  const image = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600"><rect width="1000" height="600" fill="white"/><path d="M50 50H950V550H50ZM500 50V550M50 300H500" fill="none" stroke="#333" stroke-width="8"/></svg>').toString('base64')}`;
  const asset = { id: 'layout-only', name: '布局测试平面图', width: 1000, height: 600, url: image };
  const calibration = renderToStaticMarkup(React.createElement(Calibrator, { asset, imageUrl: image, points: [[50, 50], [950, 50]], lengthMm: '9000', disabled: false, onPoints() {}, onLength() {} }));
  const paragraph = '模型复核发现局部隔断和家具位置仍需人工确认，请按原始图纸逐项核对。'.repeat(12);
  const job = { pipelineVersion: 'codex-workflow-v1', stage: 'visual_review', analysis: { summary: paragraph, notes: Array(4).fill(paragraph) }, scaleProvenance: { mode: 'estimated', mmPerPixel: 25, confidence: 'low', evidence: Array(6).fill(paragraph), assumptions: Array(6).fill(paragraph) }, visualReview: { pass: false, reason: paragraph, issues: Array.from({ length: 8 }, () => ({ severity: 'critical', description: paragraph, suggestedChange: paragraph })), limitations: Array(6).fill(paragraph) } };
  const workflow = renderToStaticMarkup(React.createElement(Workflow, { job }));
  const baseCss = readFileSync(resolve(moduleRoot, 'src/styles.css'), 'utf8');
  const labCss = readFileSync(resolve(sourceRoot, 'src/features/ai-lab/ai-lab.css'), 'utf8');
  if (view === 'gallery') {
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseCss}\n${labCss}</style></head><body>
    <div class="app-shell lab-shell"><main class="app-main lab-main" style="width:100%;max-width:none;margin:0;padding:0">${page}</main></div>
    <pre id="layout-result" hidden></pre><script>(${galleryProbe.toString()})().then(result => { document.querySelector('#layout-result').textContent = JSON.stringify(result); }).catch(error => { document.querySelector('#layout-result').textContent = JSON.stringify({error:String(error)}); });</script></body></html>`;
  }
  // This is the real Page SSR inside App's actual lab-only shell branch. Only
  // stress content is inserted: the real calibrator and real long workflow.
  // React event/hooks are deliberately not hydrated; those have separate tests.
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseCss}\n${labCss}</style></head><body>
  <div class="app-shell lab-shell"><main class="app-main lab-main" style="width:100%;max-width:none;margin:0;padding:0">${page}</main></div>
  <template id="calibration-fixture">${calibration}</template><template id="workflow-fixture"><section class="lab-job has-error" aria-label="任务状态"><details class="lab-task-details" open><summary>查看原因与任务详情</summary>${workflow}</details></section></template>
  <pre id="layout-result" hidden></pre><script>(${layoutProbe.toString()})().then(result => { document.querySelector('#layout-result').textContent = JSON.stringify(result); }).catch(error => { document.querySelector('#layout-result').textContent = JSON.stringify({error:String(error)}); });</script></body></html>`;
}

async function galleryProbe() {
  await new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
  const root = document.querySelector('.lab-gallery-shell');
  const grid = document.querySelector('.lab-gallery-grid');
  if (!root || !grid) throw new Error('The tool URL must render the real gallery shell and card grid.');
  const rect = element => { const value = element.getBoundingClientRect(); return { left: value.left, right: value.right, width: value.width, height: value.height }; };
  return {
    viewport: { width: innerWidth, height: innerHeight },
    pageScrollWidth: document.scrollingElement.scrollWidth,
    root: { ...rect(root), clientWidth: root.clientWidth, scrollWidth: root.scrollWidth },
    grid: { ...rect(grid), clientWidth: grid.clientWidth, scrollWidth: grid.scrollWidth, display: getComputedStyle(grid).display },
    cards: [...grid.querySelectorAll('button.lab-project-card, button.lab-new-card')].map(rect),
    newCard: Boolean(grid.querySelector('button.lab-new-card')),
    editorCount: document.querySelectorAll('.lab-workspace').length,
  };
}

async function layoutProbe() {
  const required = selector => { const element = document.querySelector(selector); if (!element) throw new Error('Missing real Page element: ' + selector); return element; };
  const rect = element => { const value = element.getBoundingClientRect(); return { top: value.top, bottom: value.bottom, left: value.left, right: value.right, width: value.width, height: value.height }; };
  const frame = () => new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
  const root = required('.ai-lab'), workspace = required('.lab-workspace'), canvas = required('.lab-canvas');
  const controls = required('.lab-controls'), sidebar = required('.lab-sidebar'), report = required('.lab-controls-scroll');
  canvas.replaceChildren(required('#calibration-fixture').content.cloneNode(true));
  await Promise.all([...canvas.querySelectorAll('img')].map(image => image.decode()));
  const image = required('.lab-calibration-image img'), known = required('#lab-known-length');
  const visible = element => {
    const style = getComputedStyle(element), value = rect(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && element.getClientRects().length > 0 && value.width > 0 && value.height > 0 && value.right > 0 && value.left < innerWidth && value.bottom > 0 && value.top < innerHeight;
  };
  const button = selector => {
    const element = required(selector), value = rect(element);
    const hit = visible(element) ? document.elementFromPoint(value.left + value.width / 2, value.top + value.height / 2) : null;
    return { ...value, visible: visible(element), reachable: Boolean(hit && element.contains(hit)) };
  };
  const appbarUncovered = () => {
    const appbar = required('.lab-appbar'), value = rect(appbar);
    return [1, innerWidth / 2, innerWidth - 1].every(x => appbar.contains(document.elementFromPoint(x, value.top + value.height / 2)));
  };
  const backdropReachable = () => {
    const scrim = document.querySelector('.lab-drawer-scrim');
    if (!scrim || !visible(scrim)) return false;
    const projectsOpen = root.classList.contains('mobile-projects-open');
    const x = projectsOpen ? (rect(sidebar).right + innerWidth) / 2 : rect(controls).left / 2;
    const value = rect(workspace);
    return scrim.contains(document.elementFromPoint(x, value.top + value.height / 2));
  };
  const snapshot = () => ({
    main: rect(required('.lab-main')), app: rect(root), appbar: rect(required('.lab-appbar')), toolbar: rect(required('.lab-editor-toolbar')),
    workspace: rect(workspace), editor: rect(required('.lab-editor')), canvas: rect(canvas), image: rect(image), knownLength: rect(known),
    sidebar: { ...rect(sidebar), visible: visible(sidebar) }, controls: { ...rect(controls), visible: visible(controls) },
    report: { ...rect(report), clientHeight: report.clientHeight, scrollHeight: report.scrollHeight, scrollTop: report.scrollTop, overflow: getComputedStyle(report).overflowY },
    projectClose: button('[aria-label="收起项目侧栏"]'), controlsClose: button('[aria-label="收起创作侧栏"]'),
    projectToggle: button('[aria-label="切换项目侧栏"]'), controlsToggle: button('[aria-label="切换创作侧栏"]'),
    appbarUncovered: appbarUncovered(), backdropReachable: backdropReachable(),
    page: { scrollTop: document.scrollingElement.scrollTop, scrollWidth: document.scrollingElement.scrollWidth, scrollHeight: document.scrollingElement.scrollHeight },
  });
  await frame();
  const initial = snapshot();
  report.append(required('#workflow-fixture').content.cloneNode(true));
  report.querySelectorAll('details').forEach(detail => { detail.open = true; });
  await frame();
  const longReport = snapshot();
  let focused, reportScrolled, projectsOpen, controlsOpen, mobileClosed;
  if (innerWidth > 980) {
    report.scrollTop = report.scrollHeight;
    await frame(); reportScrolled = snapshot();
    root.classList.add('is-left-collapsed', 'is-right-collapsed', 'is-focused');
    sidebar.setAttribute('aria-hidden', 'true'); controls.setAttribute('aria-hidden', 'true');
    await frame(); focused = snapshot();
    root.classList.remove('is-left-collapsed', 'is-right-collapsed', 'is-focused');
    sidebar.setAttribute('aria-hidden', 'false'); controls.setAttribute('aria-hidden', 'false');
  } else {
    // Measure CSS states only; actual hook toggles/ESC/scrim clicks are covered
    // by the frontend interaction tests and root's live browser acceptance.
    let scrim = workspace.querySelector('.lab-drawer-scrim');
    if (!scrim) { scrim = document.createElement('button'); scrim.className = 'lab-drawer-scrim'; scrim.type = 'button'; scrim.setAttribute('aria-label', '关闭侧栏'); workspace.prepend(scrim); }
    const setDrawer = active => {
      root.classList.toggle('mobile-projects-open', active === 'projects');
      root.classList.toggle('mobile-controls-open', active === 'controls');
      sidebar.setAttribute('aria-hidden', String(active !== 'projects'));
      controls.setAttribute('aria-hidden', String(active !== 'controls'));
      scrim.hidden = !active;
    };
    setDrawer('projects'); await frame(); projectsOpen = snapshot();
    setDrawer('controls'); await frame(); controlsOpen = snapshot();
    report.scrollTop = report.scrollHeight;
    await frame(); reportScrolled = snapshot();
    setDrawer(null); await frame(); mobileClosed = snapshot();
  }
  await frame();
  const scrollParents = [];
  for (let element = known.parentElement; element && element !== document.body; element = element.parentElement) {
    if (['auto', 'scroll'].includes(getComputedStyle(element).overflowY)) scrollParents.push(element);
  }
  for (const element of scrollParents) {
    const value = rect(element), field = rect(known);
    if (field.bottom > value.bottom - 12) element.scrollTop += field.bottom - value.bottom + 12;
    if (rect(known).top < value.top + 8) element.scrollTop -= value.top + 8 - rect(known).top;
  }
  await frame();
  return { viewport: { width: innerWidth, height: innerHeight }, realPage: { appbar: Boolean(document.querySelector('.lab-appbar')), oldHeroCount: document.querySelectorAll('.lab-heading, .app-header').length, realCalibrator: Boolean(document.querySelector('#lab-known-length')), realWorkflow: Boolean(document.querySelector('.lab-workflow-detail')) }, initial, longReport, reportScrolled, focused, projectsOpen, controlsOpen, mobileClosed, calibrationReached: { ...snapshot(), localScrollParents: scrollParents.map(element => element.className) } };
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
    await call('Network.enable', {}, sessionId);
    await call('Network.setBlockedURLs', { urls: ['http://*', 'https://*'] }, sessionId);
    // Assert settled layout, not an intermediate drawer animation frame.
    await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
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

test('the new-project editor route keeps edge-to-edge desktop docks and exclusive mobile drawers with local long-content scrolling', { skip: !browser ? 'No Chromium browser is installed for actual layout measurement.' : false }, async (context) => {
  const tempBase = resolve(tmpdir());
  const directory = mkdtempSync(resolve(tempBase, 'ai-lab-layout-'));
  try {
    for (const [width, height] of [[1440, 900], [1920, 1080], [390, 844]]) {
      const html = resolve(directory, `fixture-${width}.html`);
      writeFileSync(html, fixtureHtml(width));
      const measured = await measureInBrowser(html, resolve(directory, `profile-${width}`), width, height);
      assert.equal(measured.error, undefined, JSON.stringify(measured));
      assert.equal(measured.viewport.width, width);
      assert.equal(measured.viewport.height, height);
      const { initial, longReport, reportScrolled, calibrationReached } = measured;
      context.diagnostic(JSON.stringify({ viewport: measured.viewport, canvasWidth: initial.canvas.width, canvasHeight: initial.canvas.height, reportClientHeight: reportScrolled.report.clientHeight, reportScrollHeight: reportScrolled.report.scrollHeight, localCalibrationScroll: calibrationReached.localScrollParents }));
      assert.ok(measured.realPage.appbar && measured.realPage.realCalibrator && measured.realPage.realWorkflow, 'Fixture must use actual Page, calibration and workflow component markup.');
      assert.equal(measured.realPage.oldHeroCount, 0, 'The full viewport Page must not include the old global header/hero.');
      for (const snapshot of [initial, longReport, reportScrolled, calibrationReached, measured.focused, measured.projectsOpen, measured.controlsOpen, measured.mobileClosed].filter(Boolean)) {
        assert.ok(snapshot.page.scrollWidth <= width + 1, 'No tested dock/drawer state may produce horizontal page overflow.');
        assert.equal(snapshot.page.scrollTop, 0, 'Only local panels may scroll, never the page.');
        assert.ok(Math.abs(snapshot.app.left) <= 1 && Math.abs(snapshot.app.right - width) <= 1, 'The studio must reach both viewport edges.');
        assert.ok(snapshot.app.bottom <= height + 1 && snapshot.workspace.bottom <= height + 1, 'Long content must stay in the viewport shell.');
      }
      assert.ok(initial.image.top >= initial.canvas.top && initial.image.top < height - 100, 'Calibration image must begin inside the first visible canvas.');
      assert.ok(Math.abs(initial.canvas.height - longReport.canvas.height) <= 1 && Math.abs(initial.canvas.width - longReport.canvas.width) <= 1, 'Adding a very long real report must not squeeze or enlarge the canvas.');
      assert.equal(longReport.image.top, reportScrolled.image.top, 'Scrolling the report must not move calibration.');
      assert.ok(reportScrolled.report.scrollHeight > reportScrolled.report.clientHeight * 2 && reportScrolled.report.scrollTop > 0, 'Long workflow content must actually scroll inside its panel.');
      assert.equal(reportScrolled.report.overflow, 'auto');
      assert.ok(calibrationReached.localScrollParents.some(name => name.includes('lab-canvas') || name.includes('lab-calibrator')), 'Known-length form must have a local calibration scroll container.');
      assert.ok(calibrationReached.knownLength.top >= calibrationReached.canvas.top - 1 && calibrationReached.knownLength.bottom <= calibrationReached.canvas.bottom + 1, 'Known-length input must be reachable without scrolling the page.');
      if (width > 980) {
        assert.ok(initial.sidebar.visible && initial.controls.visible, 'Both desktop docks must be visible.');
        assert.ok(Math.abs(initial.sidebar.left) <= 1 && Math.abs(initial.controls.right - width) <= 1, 'Desktop side docks must attach to left/right viewport edges.');
        assert.ok(Math.abs(initial.editor.left - initial.sidebar.right) <= 2 && Math.abs(initial.editor.right - initial.controls.left) <= 2, 'Canvas editor must fill the whole space between the docks.');
        assert.ok(initial.canvas.width >= width - 550, 'Desktop canvas must release the space previously lost to centered max-width cards.');
        assert.ok(initial.canvas.height >= height * .65, 'Toolbar and task text must leave a substantial vertical canvas.');
        assert.ok(!measured.focused.sidebar.visible && !measured.focused.controls.visible, 'Focus CSS state must collapse both docks.');
        assert.ok(measured.focused.canvas.width >= width - 2, 'Focused canvas must fill the viewport width.');
      } else {
        assert.ok(!initial.sidebar.visible && !initial.controls.visible, 'Mobile starts with both drawers closed.');
        assert.ok(measured.projectsOpen.sidebar.visible && !measured.projectsOpen.controls.visible, 'Projects drawer must not expose the controls drawer.');
        assert.ok(measured.controlsOpen.controls.visible && !measured.controlsOpen.sidebar.visible, 'Controls drawer must not expose the projects drawer.');
        assert.ok(!measured.mobileClosed.sidebar.visible && !measured.mobileClosed.controls.visible, 'Closing drawer CSS state must return to an unobstructed canvas.');
        for (const snapshot of [initial, measured.mobileClosed]) {
          assert.ok(snapshot.projectToggle.reachable && snapshot.controlsToggle.reachable, 'Hidden drawers must not intercept the controls used to open them.');
        }
        assert.ok(initial.canvas.width >= width - 2 && measured.mobileClosed.canvas.width >= width - 2, 'Closed mobile drawers must not reserve desktop column widths.');
        for (const [snapshot, dock, close] of [[measured.projectsOpen, 'sidebar', 'projectClose'], [measured.controlsOpen, 'controls', 'controlsClose']]) {
          assert.ok(snapshot[dock].top >= snapshot.appbar.bottom - 1, 'Active drawer must begin below the app toolbar.');
          assert.ok(snapshot[close].visible && snapshot[close].reachable, 'The active drawer close button must remain visible and hit-testable.');
          assert.ok(snapshot.appbarUncovered, 'Drawer overlays must not block the actual appbar.');
          assert.ok(snapshot.backdropReachable, 'Each open drawer must leave a hit-testable dismiss backdrop.');
          assert.ok(snapshot[dock].left >= -1 && snapshot[dock].right <= width + 1 && snapshot[dock].width < width - 8, 'Mobile drawer must fit on screen with room for a dismiss backdrop.');
          assert.deepEqual(snapshot.canvas, initial.canvas, 'Absolute drawers must not reflow or shrink the mobile canvas.');
        }
      }
    }
  } finally {
    const resolved = resolve(directory);
    assert.equal(dirname(resolved), tempBase);
    assert.ok(resolved.startsWith(tempBase + sep) && resolved.includes('ai-lab-layout-'));
    rmSync(resolved, { recursive: true, force: true });
  }
});

test('the tool gallery keeps real project cards within desktop and mobile horizontal bounds', { skip: !browser ? 'No Chromium browser is installed for actual layout measurement.' : false }, async (context) => {
  const tempBase = resolve(tmpdir());
  const directory = mkdtempSync(resolve(tempBase, 'ai-lab-layout-'));
  try {
    for (const [width, height] of [[1440, 900], [390, 844]]) {
      const html = resolve(directory, `gallery-${width}.html`);
      writeFileSync(html, fixtureHtml(width, 'gallery'));
      const measured = await measureInBrowser(html, resolve(directory, `profile-${width}`), width, height);
      assert.equal(measured.error, undefined, JSON.stringify(measured));
      assert.equal(measured.viewport.width, width);
      assert.equal(measured.editorCount, 0, 'The tool gallery must not reserve editor dock columns.');
      assert.equal(measured.grid.display, 'grid', 'Measurements must use the real gallery CSS rather than unstyled SSR buttons.');
      assert.ok(measured.newCard && measured.cards.length >= 1, 'SSR must include the real new-project card before API effects run.');
      assert.ok(measured.pageScrollWidth <= width + 1 && measured.root.scrollWidth <= measured.root.clientWidth + 1 && measured.grid.scrollWidth <= measured.grid.clientWidth + 1, 'Gallery and card grid must not overflow horizontally.');
      for (const card of measured.cards) {
        assert.ok(card.width > 0 && card.height > 0 && card.left >= -1 && card.right <= width + 1, 'Every rendered project card must fit within the viewport.');
      }
      context.diagnostic(JSON.stringify({ galleryViewport: measured.viewport, gridWidth: measured.grid.width, cardWidths: measured.cards.map(card => card.width) }));
    }
  } finally {
    const resolved = resolve(directory);
    assert.equal(dirname(resolved), tempBase);
    assert.ok(resolved.startsWith(tempBase + sep) && resolved.includes('ai-lab-layout-'));
    rmSync(resolved, { recursive: true, force: true });
  }
});

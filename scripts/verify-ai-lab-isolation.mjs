// Build the real application graphs in memory. Never loads vite.config.ts,
// daily scripts, private env files, public data, or publication/admin plugins.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(process.env.AI_LAB_MODULE_ROOT || fileURLToPath(new URL('..', import.meta.url)));
const require = createRequire(resolve(root, 'package.json'));
const { build } = await import(pathToFileURL(require.resolve('vite')).href);
const { default: react } = await import(pathToFileURL(require.resolve('@vitejs/plugin-react')).href);
const results = [];

for (const mode of ['public', 'admin', 'lab']) {
  const moduleIds = new Set();
  const result = await build({
    root,
    configFile: false,
    envFile: false,
    publicDir: false,
    logLevel: 'silent',
    mode,
    plugins: [react(), {
      name: 'ai-lab-in-memory-isolation-audit',
      moduleParsed(info) { moduleIds.add(info.id.replaceAll('\\', '/')); },
    }],
    build: { write: false, emptyOutDir: false, minify: true, reportCompressedSize: false },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((item) => item.output);
  const code = outputs.filter((item) => item.type === 'chunk').map((item) => item.code).join('\n');
  const modules = [...moduleIds];
  const labModules = modules.filter((id) => id.includes('/src/features/ai-lab/'));
  const adminModules = modules.filter((id) => /\/src\/pages\/(?:OperationsPage|WatchlistPage)\.tsx/.test(id));
  const labApiIncluded = code.includes('/api/ai-lab/v1');
  const labNavigationIncluded = code.includes('AI 实验室');
  if (mode === 'lab') {
    assert.ok(labModules.some((id) => id.endsWith('/AiLabPage.tsx')), 'lab must contain its page');
    assert.ok(labModules.some((id) => id.endsWith('/api.ts')), 'lab must contain its own API client');
    assert.equal(labApiIncluded, true);
    assert.equal(labNavigationIncluded, true);
    assert.equal(adminModules.length, 0, 'lab must exclude admin-only pages');
  } else {
    assert.equal(labModules.length, 0, `${mode} must not load any lab feature module`);
    assert.equal(labApiIncluded, false, `${mode} must not contain the lab API endpoint`);
    assert.equal(labNavigationIncluded, false, `${mode} must not show lab navigation`);
    assert.equal(adminModules.length, mode === 'admin' ? 2 : 0, 'admin page gating must remain intact');
  }
  results.push({ mode, labModules: labModules.map((id) => id.slice(root.replaceAll('\\', '/').length + 1)), labApiIncluded, labNavigationIncluded, adminPages: adminModules.length, writtenFiles: 0 });
}

console.log(JSON.stringify({ check: 'AI Lab mode isolation', configuration: { configFile: false, envFile: false, publicDir: false, write: false, dailyOrPublicationPlugins: false }, results }, null, 2));

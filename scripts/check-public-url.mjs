import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import './network-fetch.mjs';

const sleep = (delayMs) => new Promise((resolvePromise) => setTimeout(resolvePromise, delayMs));

function positiveIntegerArgument(name, fallback) {
  const raw = process.argv.find((argument) => argument.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export async function checkPublicUrl({
  base,
  healthOnly = false,
  expectedGeneratedAt = '',
  expectedAsset = '',
  fetchImpl = fetch,
  cacheKey = String(Date.now()),
} = {}) {
  const normalizedBase = base?.replace(/\/$/, '');
  if (!normalizedBase) throw new Error('public URL is missing');

  const request = (path, init = {}) => {
    const url = new URL(path, `${normalizedBase}/`);
    url.searchParams.set('__ark_verify', cacheKey);
    return fetchImpl(url, {
      ...init,
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0',
        Pragma: 'no-cache',
        ...(init.headers ?? {}),
      },
      signal: AbortSignal.timeout(15_000),
    });
  };

  const page = await request('/');
  if (!page.ok) {
    await page.body?.cancel();
    throw new Error(`public HTML unavailable (HTTP ${page.status})`);
  }
  const html = await page.text();
  if (!/ark\.insight/i.test(html)) throw new Error('public HTML identity mismatch (expected ark.insight)');

  const scriptPath = html.match(/<script[^>]+src="([^"]+)"/i)?.[1] ?? null;
  if (!healthOnly) {
    if (!scriptPath) throw new Error('public bundle missing');
    if (expectedAsset && scriptPath !== expectedAsset) {
      throw new Error(`public entry asset is stale: expected ${expectedAsset}, received ${scriptPath}`);
    }

    const bundle = await request(scriptPath);
    if (!bundle.ok) throw new Error('public bundle unavailable');
    const bundleText = await bundle.text();
    if (bundleText.length === 0) throw new Error('public bundle empty');

    const dependencyPaths = [
      ...new Set([...bundleText.matchAll(/["'](\.\/[^"']+\.(?:js|css))["']/g)].map((match) => match[1])),
    ].slice(0, 24);
    const dependencies = await Promise.all(
      dependencyPaths.map((path) => request(new URL(path, bundle.url).href)),
    );
    if (dependencies.some((response) => !response.ok)) {
      throw new Error('public bundle dependency unavailable');
    }
    await Promise.all(dependencies.map((response) => response.body?.cancel()));
  }

  const data = await request('/data/main/index.json');
  if (!data.ok) {
    await data.body?.cancel();
    throw new Error(`main data unavailable (HTTP ${data.status})`);
  }
  let snapshot;
  try { snapshot = await data.json(); }
  catch { throw new Error('main data is not valid JSON'); }
  if (!snapshot || !Array.isArray(snapshot.aiEvents)) {
    throw new Error('main data unavailable');
  }
  if (expectedGeneratedAt && snapshot.generatedAt !== expectedGeneratedAt) {
    throw new Error(`public main data is stale: expected ${expectedGeneratedAt}, received ${snapshot.generatedAt ?? 'missing'}`);
  }

  if (!healthOnly) {
    const [skillsCatalog, papersCatalog] = await Promise.all([
      request('/data/main/skills-catalog.json', { method: 'HEAD' }),
      request('/data/main/papers-catalog.json', { method: 'HEAD' }),
    ]);
    if (!skillsCatalog.ok) throw new Error('Skill catalog unavailable');
    if (!papersCatalog.ok) throw new Error('paper catalog unavailable');
  }

  return {
    asset: scriptPath,
    generatedAt: snapshot.generatedAt ?? null,
  };
}

export async function waitForPublicUrl({
  attempts = 12,
  retryDelayMs = 5_000,
  onRetry,
  ...options
} = {}) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await checkPublicUrl({
        ...options,
        cacheKey: `${Date.now()}-${attempt}`,
      });
    } catch (error) {
      lastError = error;
      if (attempt >= attempts) break;
      onRetry?.(error, attempt, attempts);
      if (retryDelayMs > 0) await sleep(retryDelayMs);
    }
  }
  throw lastError ?? new Error('public validation failed');
}

const executedDirectly = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (executedDirectly) {
  const base = process.argv[2]?.replace(/\/$/, '');
  const verbose = process.argv.includes('--verbose');
  const healthOnly = process.argv.includes('--health');
  const expectedGeneratedAt = process.argv.find((argument) => argument.startsWith('--expected-generated-at='))
    ?.split('=')
    .slice(1)
    .join('=') ?? '';
  const expectedAsset = process.argv.find((argument) => argument.startsWith('--expected-asset='))
    ?.split('=')
    .slice(1)
    .join('=') ?? '';

  if (!base) {
    process.exitCode = 1;
  } else {
    try {
      await waitForPublicUrl({
        base,
        healthOnly,
        expectedGeneratedAt,
        expectedAsset,
        attempts: positiveIntegerArgument('attempts', healthOnly ? 1 : 12),
        retryDelayMs: positiveIntegerArgument('retry-delay-ms', 5_000),
        onRetry: verbose
          ? (error, attempt, attempts) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`Public verification failed (${attempt}/${attempts}): ${message}`);
          }
          : undefined,
      });
    } catch (error) {
      if (verbose) console.error(error);
      process.exitCode = 1;
    }
  }
}

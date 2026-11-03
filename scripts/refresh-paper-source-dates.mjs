import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import './network-fetch.mjs';

const root = process.cwd();
const read = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const catalog = await read('data/dev/papers-catalog.json');
const latest = await read('data/dev/ai-events-latest.json');
let cache;
try { cache = await read('data/dev/paper-source-dates.json'); } catch (error) { if (error.code !== 'ENOENT') throw error; cache = { papers: {} }; }
const daily = new Set(latest.aiEvents.filter(event => event.paper).map(event => event.paper.paperUrl));
const targets = catalog.papers.filter(paper => daily.has(paper.url) || paper.reviewStatus === 'queued'
  || (process.argv.includes('--all-reviewed') && ['interpreted', 'verified'].includes(paper.reviewStatus)));
let fetched = 0; let failures = 0;
for (const paper of targets) {
  if (cache.papers[paper.id]?.status === 'success') continue;
  try {
    const response = await fetch(paper.url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const date = html.match(/name="citation_date"\s+content="(\d{4}\/\d{2}\/\d{2})"/)?.[1]?.replaceAll('/', '-');
    const title = html.match(/name="citation_title"\s+content="([^"]+)"/)?.[1];
    if (!date || !title) throw new Error('Missing original submission date or citation title');
    cache.papers[paper.id] = { status: 'success', originalPublishedAt: date + 'T00:00:00.000Z',
      originalDatePrecision: 'day', url: paper.url, titleOriginal: title, checkedAt: new Date().toISOString() };
    fetched += 1;
  } catch (error) {
    cache.papers[paper.id] = { status: 'failed', url: paper.url, error: error.message, checkedAt: new Date().toISOString() };
    failures += 1;
  }
  if ((fetched + failures) % 20 === 0) {
    await writeFile(resolve(root, 'data/dev/paper-source-dates.json'), JSON.stringify(cache, null, 2) + '\n');
    console.log(`Original paper dates: ${fetched} verified, ${failures} failed, ${targets.length} selected.`);
  }
  await new Promise(done => setTimeout(done, 300));
}
await mkdir(resolve(root, 'data/dev'), { recursive: true });
cache.checkedAt = new Date().toISOString();
await writeFile(resolve(root, 'data/dev/paper-source-dates.json'), JSON.stringify(cache, null, 2) + '\n');
console.log(JSON.stringify({ selected: targets.length, fetched, failures }));

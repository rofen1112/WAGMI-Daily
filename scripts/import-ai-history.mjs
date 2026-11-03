import { copyFile, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateSnapshot } from './data-contract.mjs';
import { mergeHistoricalEvents, parseHistoricalReport } from './history.mjs';

const root = process.cwd();
const sources = [
  { reportId: 'ai-2026-06', path: 'reports/ai-events-2026-06.md' },
  { reportId: 'ai-2026-07-09', path: 'reports/ai-events-2026-07-09.md' },
];

const mainPath = resolve(root, 'data/main/index.json');
const snapshot = JSON.parse(await readFile(mainPath, 'utf8'));
const reports = new Map(snapshot.reports.map((report) => [report.id, report]));
const events = [];

for (const source of sources) {
  const report = reports.get(source.reportId);
  if (!report) throw new Error(`Snapshot report is missing: ${source.reportId}`);
  const markdown = await readFile(resolve(root, source.path), 'utf8');
  events.push(...parseHistoricalReport(markdown, report));
}

const next = mergeHistoricalEvents(snapshot, events, sources.map((source) => source.reportId));
const errors = validateSnapshot(next);
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  const temporaryPath = `${mainPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, mainPath);
  for (const mirror of ['public/data/main/index.json', 'dist/data/main/index.json']) {
    await copyFile(mainPath, resolve(root, mirror));
  }
  console.log(`Imported ${events.length} historical AI events from ${sources.length} reports.`);
}

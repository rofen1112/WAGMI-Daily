import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { sanitizePublicReport, toPublicSnapshot } from './public-source-policy.mjs';

const source = resolve('data/main/index.json');
const destination = resolve('public/data/main/index.json');

await mkdir(dirname(destination), { recursive: true });
const snapshot = JSON.parse(await readFile(source, 'utf8'));
await writeFile(destination, `${JSON.stringify(toPublicSnapshot(snapshot), null, 2)}\n`, 'utf8');
console.log(`Synced ${source} -> ${destination}`);

// Rebuild every public report from its preserved internal original when available.
const reportFiles = new Set((snapshot.reports ?? []).map(report => basename(report.path)));
try {
  for (const entry of await readdir(resolve('public/reports'), { withFileTypes: true })) {
    if (entry.isFile() && /\.(?:md|html)$/i.test(entry.name)) reportFiles.add(entry.name);
  }
} catch (error) { if (error.code !== 'ENOENT') throw error; }
for (const filename of reportFiles) {
  const isTextReport = /\.(?:md|html)$/i.test(filename);
  const publicPath = resolve('public/reports', filename);
  const locations = [resolve('reports', filename), resolve(filename), publicPath];
  let content;
  for (const path of locations) {
    try { content = await readFile(path, isTextReport ? 'utf8' : undefined); break; }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  if (content === undefined) continue;
  await mkdir(dirname(publicPath), { recursive: true });
  await writeFile(publicPath, isTextReport ? sanitizePublicReport(content) : content);
}

const catalogSource = resolve('data/main/skills-catalog.json');
const catalogDestination = resolve('public/data/main/skills-catalog.json');
try {
  await access(catalogSource);
  await mkdir(dirname(catalogDestination), { recursive: true });
  const catalog = JSON.parse(await readFile(catalogSource, 'utf8'));
  await writeFile(catalogDestination, `${JSON.stringify(toPublicSnapshot(catalog))}\n`, 'utf8');
  console.log(`Synced ${catalogSource} -> ${catalogDestination}`);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const papersCatalogSource = resolve('data/main/papers-catalog.json');
const papersCatalogDestination = resolve('public/data/main/papers-catalog.json');
try {
  await access(papersCatalogSource);
  await mkdir(dirname(papersCatalogDestination), { recursive: true });
  const catalog = JSON.parse(await readFile(papersCatalogSource, 'utf8'));
  await writeFile(papersCatalogDestination, `${JSON.stringify(toPublicSnapshot(catalog))}\n`, 'utf8');
  console.log(`Synced ${papersCatalogSource} -> ${papersCatalogDestination}`);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

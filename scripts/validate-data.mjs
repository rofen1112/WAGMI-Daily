import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateSnapshot } from './data-contract.mjs';

const input = resolve(process.argv[2] ?? 'data/main/index.json');
const snapshot = JSON.parse(await readFile(input, 'utf8'));
const errors = validateSnapshot(snapshot);

if (errors.length) {
  console.error(`Data validation failed for ${input}:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Data validation passed: ${snapshot.projects.length} projects, ${snapshot.aiEvents.length} AI events, ${snapshot.skills.length} ranked skills, ${snapshot.reports.length} reports.`);

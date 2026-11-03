import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = process.cwd();
const read = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
const watchlist = await read('github-industry-watchlist.json');
const intake = await read(`data/dev/github-editorial-intake-${date}.json`);
for (const seed of intake.repositories) {
  const index = watchlist.repositories.findIndex(previous => previous.repo.toLowerCase() === seed.repo.toLowerCase());
  const record = { ...seed, reviewedAt: date, industryFit: 'high', originality: 'original_research_or_tooling',
    evidenceUrls: [`https://github.com/${seed.repo}`] };
  if (index >= 0) watchlist.repositories[index] = { ...watchlist.repositories[index], ...record };
  else watchlist.repositories.push(record);
}
watchlist.updatedAt = date;
await writeFile(resolve(root, 'github-industry-watchlist.json'), JSON.stringify(watchlist, null, 2) + '\n');
console.log(`Added/reviewed ${intake.repositories.length} source-backed industry projects.`);

import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = process.cwd();
const read = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const [main, override, dates] = await Promise.all([read('data/main/index.json'), read('data/dev/index.json'), read('data/dev/paper-source-dates.json')]);
const events = [...new Map([...(main.aiEvents ?? []), ...(override.aiEvents ?? [])].map(event => [event.id, event])).values()];
const corrections = [];
for (const event of events) {
  if (event.contentKind !== 'paper') continue;
  const id = event.paper.paperUrl.match(/arxiv\.org\/abs\/([^?#]+)/)?.[1];
  const date = dates.papers['arxiv-' + id?.replace('.', '-')]?.originalPublishedAt;
  if (!date || event.date === date.slice(0, 10)) continue;
  corrections.push({ id: event.id, title: event.title, previousDate: event.date, originalDate: date.slice(0, 10), reportId: event.sourceReportId });
  event.paper.rssAnnouncedAt = event.paper.rssAnnouncedAt ?? event.paper.publishedAt;
  event.paper.publishedAt = date;
  event.date = date.slice(0, 10);
  if (event.dateStart) event.dateStart = event.date;
  if (event.dateEnd) event.dateEnd = event.date;
}
override.aiEvents = [...new Map([...(override.aiEvents ?? []), ...events.filter(event => corrections.some(c => c.id === event.id))].map(event => [event.id, event])).values()];
await writeFile(resolve(root, 'data/dev/index.json'), JSON.stringify(override, null, 2) + '\n');
for (const reportId of new Set(corrections.map(c => c.reportId))) {
  const filename = 'ai-events-' + reportId.slice(3) + '.md';
  const path = resolve(root, 'reports', filename);
  try { await access(path); } catch { continue; }
  let markdown = await readFile(path, 'utf8');
  const marker = '## 原始提交日期复核（2026-10-08）';
  markdown = markdown.split(marker)[0].trimEnd();
  markdown += '\n\n' + marker + '\n\n以下日期依据 arXiv 官方 citation_date 重新核验；正文历史通告时间保留作审计，不再充当首次发表日。\n\n' + corrections.filter(c => c.reportId === reportId).map(c => `- ${c.title}：原始提交 ${c.originalDate}；此前记录 ${c.previousDate}。`).join('\n') + '\n';
  await writeFile(path, markdown);
  await writeFile(resolve(root, 'public/reports', filename), markdown);
}
await writeFile(resolve(root, 'data/dev/paper-event-date-repairs.json'), JSON.stringify({ checkedAt: new Date().toISOString(), corrections }, null, 2) + '\n');
console.log(`Corrected ${corrections.length} cumulative AI paper event dates without changing main before the gate.`);

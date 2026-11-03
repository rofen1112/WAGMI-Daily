import fs from 'node:fs';
const base = 'data/dev/source-archives/wagmi-ai-2026-11-02/';
const observations = JSON.parse(fs.readFileSync(base + 'source-results.json', 'utf8'));
const catalog = JSON.parse(fs.readFileSync('data/dev/papers-catalog.json', 'utf8'));
const path = 'data/dev/paper-source-dates.json';
const dates = JSON.parse(fs.readFileSync(path, 'utf8'));
const corrections = [];
for (const row of observations) {
  const index = Number(row.i?.split('-')[1]);
  if (index < 53 || index > 62 || !row.success || row.httpStatus !== 200) continue;
  const arxivId = row.url.match(/^https:\/\/arxiv\.org\/abs\/(\d{4}\.\d{4,5})$/)?.[1];
  if (!arxivId) throw new Error('Unexpected original-source URL');
  const raw = fs.readFileSync(row.path.replace(/\.txt$/, '.raw'), 'utf8');
  const originalDate = raw.match(/name="citation_date"\s+content="(\d{4}\/\d{2}\/\d{2})"/)?.[1]?.replaceAll('/', '-');
  const title = raw.match(/name="citation_title"\s+content="([^"]+)"/)?.[1];
  if (!originalDate || !title || !raw.includes(arxivId)) throw new Error('Missing original citation evidence');
  const id = 'arxiv-' + arxivId.replace('.', '-');
  const paper = catalog.papers.find(item => item.id === id);
  if (!paper || paper.url !== row.url) throw new Error('Catalog identity mismatch');
  const originalPublishedAt = originalDate + 'T00:00:00.000Z';
  corrections.push({ id, url: row.url, priorPublishedAt: paper.publishedAt,
    originalPublishedAt, rssAnnouncedAt: paper.rssAnnouncedAt, archive: row.path,
    sourceCheckedAt: row.checkedAt, reviewedAt: new Date().toISOString() });
  dates.papers[id] = { ...dates.papers[id], status: 'success', originalPublishedAt,
    originalDatePrecision: 'day', url: row.url, titleOriginal: title,
    checkedAt: row.checkedAt, archive: row.path, reviewedAt: new Date().toISOString() };
}
if (corrections.length !== 10) throw new Error('Expected the actual ten reviewed original paper pages');
dates.checkedAt = new Date().toISOString();
fs.writeFileSync(path, JSON.stringify(dates, null, 2) + '\n');
fs.writeFileSync('data/dev/wagmi-paper-date-corrections-2026-11-02.json',
  JSON.stringify({ runDate: '2026-11-02', reviewedAt: new Date().toISOString(),
    method: 'Read original arXiv citation_date; retain actual RSS announcement and review timestamps.', corrections }, null, 2) + '\n');
console.log(JSON.stringify(corrections.map(({ id, priorPublishedAt, originalPublishedAt }) => ({ id, priorPublishedAt, originalPublishedAt }))));

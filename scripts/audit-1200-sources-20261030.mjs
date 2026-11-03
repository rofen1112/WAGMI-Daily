import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import { candidateFingerprint } from './ai-discovery-review.mjs';
import './network-fetch.mjs';

const date = '2026-10-30';
const base = `data/dev/source-archives/audit-1200-${date}`;
const priorBase = `data/dev/source-archives/audit-0900-${date}`;
const json = async p => JSON.parse(await readFile(p, 'utf8'));
await mkdir(base, { recursive: true });
const oldFetches = await json(`${priorBase}/fetch-results.json`);
const urls = ['https://openai.com/news/rss.xml', 'https://www.anthropic.com/news',
  'https://blog.google/technology/ai/rss/', 'https://github.com/anthropics/claude-code/releases'];
function links(raw, url) {
  if (url.includes('rss')) {
    const parsed = new XMLParser().parse(raw);
    const items = parsed.rss?.channel?.item ?? [];
    return (Array.isArray(items) ? items : [items]).map(i => ({ title: i.title, url: i.link, publishedAt: i.pubDate })).slice(0, 40);
  }
  const pattern = url.includes('anthropic.com') ? /href=["']([^"']*\/news\/[^"']+)["']/g : /href=["']([^"']*\/releases\/tag\/[^"']+)["']/g;
  return [...new Set([...raw.matchAll(pattern)].map(m => new URL(m[1], url).href))].slice(0, 50).map(url => ({ url }));
}
const results = await Promise.all(urls.map(async (url, i) => {
  const checkedAt = new Date().toISOString();
  const previous = oldFetches.find(r => r.url === url);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25000), headers: { 'user-agent': 'ark.insight-audit/1.0' } });
    const raw = await response.text();
    await writeFile(`${base}/priority-${i}.raw`, raw);
    if (!response.ok) return { url, checkedAt, httpStatus: response.status, success: false };
    const currentLinks = links(raw, url);
    const oldLinks = previous?.success ? links(await readFile(`${priorBase}/${previous.i}.raw`, 'utf8'), url) : [];
    const seen = new Set(oldLinks.map(r => r.url));
    return { url, checkedAt, httpStatus: response.status, success: true, currentLinks,
      previousObservation: previous?.checkedAt, newLinks: currentLinks.filter(r => !seen.has(r.url)),
      contentHash: createHash('sha256').update(raw).digest('hex') };
  } catch (error) { return { url, checkedAt, success: false, error: error.message }; }
}));
const [memene, media, review, priorReview] = await Promise.all([
  `data/dev/memene-daily-latest.json`, `data/dev/ai-media-latest.json`,
  `data/dev/ai-discovery-review-${date}.json`, `${base}/ai-discovery-review-${date}.json`].map(json));
const decisions = [];
for (const [channel, candidates] of [['memene', memene.target.candidates], ['media', media.candidates]]) {
  for (const candidate of candidates) {
    const row = review[channel].items.find(r => r.id === candidate.id);
    const prior = priorReview[channel].items.find(r => r.id === candidate.id);
    decisions.push({ channel, id: candidate.id, title: candidate.title, candidateHash: candidateFingerprint(candidate),
      unchangedContent: row?.candidateHash === candidateFingerprint(candidate) && prior?.candidateHash === row?.candidateHash,
      disposition: row?.disposition, checkedAt: row?.checkedAt, originalReviewPreserved: JSON.stringify(row) === JSON.stringify(prior),
      sections: candidate.sourceDate === date ? candidate.sections?.length : undefined });
  }
}
const summary = { runDate: date, checkedAt: new Date().toISOString(), results, decisions,
  sourceChecks: media.sources, allDecisionsUnchanged: decisions.every(r => r.unchangedContent && r.originalReviewPreserved) };
await writeFile(`${base}/source-checks.json`, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ allDecisionsUnchanged: summary.allDecisionsUnchanged, candidates: decisions.length,
  sources: results.map(r => ({ url: r.url, status: r.httpStatus ?? r.error, links: r.currentLinks?.length, newLinks: r.newLinks })) }, null, 2));

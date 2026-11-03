import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPaperSnapshot, parseArxivRss, scorePaper } from '../scripts/discover-ai-papers.mjs';

const config = {
  daily: { windowDays: 3, maxCandidates: 20, thresholds: { deepRead: 10, digest: 6, watch: 3 }, budgets: { deepRead: 3, fullText: 1, digest: 8 } },
  topics: [
    { id: 'three-d', labelZh: '3D 重建', board: 'AI 3D / World Models', terms: { 'gaussian splatting': 8 } },
    { id: 'world', labelZh: '世界模型', board: 'AI 3D / World Models', terms: { 'world model': 8 } },
    { id: 'creative', labelZh: '内容工具', board: 'Workflow / Tutorial / Usage Tips', terms: { 'particle effects': 8 } },
  ],
};

function paper(id, title, abstract) {
  return {
    id, arxivId: id.replace('arxiv-', ''), source: 'arxiv', titleOriginal: title, abstract, authors: ['Author'], categories: ['cs.GR'],
    announceType: 'new', publishedAt: '2026-08-05T04:00:00.000Z', url: `https://arxiv.org/abs/${id}`, pdfUrl: `https://arxiv.org/pdf/${id}`,
  };
}

test('parses official arXiv RSS into structured metadata', () => {
  const xml = `<?xml version="1.0"?><rss xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><item><title>ParticleGen</title><link>https://arxiv.org/abs/2608.00629</link><description>Abstract: Editable particle effects.</description><dc:creator>Alice, Bob</dc:creator><category>cs.GR</category><pubDate>Wed, 05 Aug 2026 04:00:00 GMT</pubDate></item></channel></rss>`;
  const parsed = parseArxivRss(xml);
  assert.equal(parsed[0].arxivId, '2608.00629');
  assert.deepEqual(parsed[0].authors, ['Alice', 'Bob']);
  assert.equal(parsed[0].abstract, 'Editable particle effects.');
});

test('scores relevant papers and diversifies the daily deep-read queue', () => {
  const threeD = paper('arxiv-1', 'Gaussian Splatting for Scenes', 'gaussian splatting reconstruction');
  const world = paper('arxiv-2', 'A Better World Model', 'world model for spatial scenes');
  const creative = paper('arxiv-3', 'Particle Effects Generation', 'particle effects in an editable workflow');
  const duplicateThreeD = paper('arxiv-4', 'Fast Gaussian Splatting', 'gaussian splatting at scale');
  assert.equal(scorePaper(threeD, config).reviewTier, 'deep');
  const snapshot = buildPaperSnapshot({ papers: [threeD, duplicateThreeD, world, creative], config, asOf: '2026-08-05' });
  assert.equal(snapshot.deepReadQueue.length, 3);
  assert.ok(snapshot.deepReadQueue.includes('arxiv-2'));
  assert.ok(snapshot.deepReadQueue.includes('arxiv-3'));
  assert.equal(snapshot.deepReadQueue.filter((id) => ['arxiv-1', 'arxiv-4'].includes(id)).length, 1);
});

test('treats a successful empty feed as no new papers instead of a failure', () => {
  const snapshot = buildPaperSnapshot({ papers: [], config, asOf: '2026-08-17' });
  assert.equal(snapshot.run.status, 'success');
  assert.equal(snapshot.stats.fetched, 0);
  assert.match(snapshot.run.message, /不视为采集失败/);
});


test('does not treat an HTTP 200 HTML error page or malformed XML as an empty feed', () => {
  assert.throws(() => parseArxivRss('<html><body>Service unavailable</body></html>'), /non-RSS/);
  assert.throws(() => parseArxivRss('<rss><channel>'), /invalid XML/);
});

test('accepts a valid empty RSS channel but rejects incomplete incoming records', () => {
  assert.deepEqual(parseArxivRss('<rss><channel><title>arXiv updates</title></channel></rss>'), []);
  assert.throws(() => parseArxivRss('<rss><channel><item><title>Missing metadata</title></item></channel></rss>'), /incomplete RSS items/);
});

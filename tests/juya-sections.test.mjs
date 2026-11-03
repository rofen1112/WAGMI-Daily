import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJuyaSections } from '../scripts/juya-sections.mjs';
import { parseMediaFeed } from '../scripts/discover-ai-media.mjs';

const base = 'https://daily.juya.uk/issues/2026-10-29/';
const html = '<h2 id="s1">概览</h2><h3 id="s2">要闻</h3><ul><li>第一条 <code>#1</code></li></ul>'
  + '<h2 id="s8">要闻</h2><h3 id="s9"><a href="https://example.org/first">第一条模型发布</a> <code>#1</code></h3>'
  + '<blockquote>限定用户可用。</blockquote><p>真实正文。</p><a href="https://example.org/first">原文</a>'
  + '<h3 id="s10">无原始链接的第二条 <code>#2</code></h3><blockquote>这条仍然需要审阅。</blockquote>';

test('composite articles preserve each numbered news item including items without a source link', () => {
  const sections = parseJuyaSections(html, base);
  assert.equal(sections.length, 2);
  assert.deepEqual(sections.map(s => s.id), ['s9', 's10']);
  assert.equal(sections[0].title, '第一条模型发布');
  assert.equal(sections[0].url, base + '#s9');
  assert.equal(sections[0].summary, '限定用户可用。');
  assert.deepEqual(sections[0].referencedUrls, ['https://example.org/first']);
  assert.deepEqual(sections[1].referencedUrls, []);
});

test('changed claims alter section evidence even when headline and links do not change', () => {
  assert.notEqual(parseJuyaSections(html, base)[0].contentHash,
    parseJuyaSections(html.replace('限定用户', '所有用户'), base)[0].contentHash);
  assert.throws(() => parseJuyaSections(html + '<h3 id="s9">重复 <code>#3</code></h3>', base), /Duplicate/);
  assert.deepEqual(parseJuyaSections(html, 'https://unrelated.example/'), []);
});

test('RSS collection exposes subitems instead of hiding an entire issue behind one candidate', () => {
  const xml = `<rss><channel><title>橘鸦AI早报</title><item><title>2026-10-29</title><link>${base}</link><pubDate>Thu, 29 Oct 2026 02:02:00 +0000</pubDate><description>早报</description><content:encoded><![CDATA[${html}]]></content:encoded></item></channel></rss>`;
  const parsed = parseMediaFeed(xml, { id: 'juya', name: '橘鸦', url: 'https://daily.juya.uk/rss.xml', allowedArticleHosts: ['daily.juya.uk'] });
  assert.equal(parsed.records[0].composite, true);
  assert.equal(parsed.records[0].sections.length, 2);
});

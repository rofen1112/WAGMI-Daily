import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import {
  discoverMediaCandidates, mediaWindow, normalizeMediaUrl, parseMediaArticleList,
  parseMediaFeed, runMediaDiscovery, selectMediaWindow,
} from '../scripts/discover-ai-media.mjs';

const rssSource = {
  id: 'qbitai', name: '量子位', channel: 'official_site_mirror', format: 'rss',
  url: 'https://www.qbitai.com/feed/', allowedArticleHosts: ['www.qbitai.com'],
};
const listSource = {
  id: 'aiera', name: '新智元', channel: 'official_site_mirror', format: 'article_list',
  url: 'https://aiera.com.cn/asi-articles.html', allowedArticleHosts: ['aiera.com.cn'],
  articlePathPattern: '^/asi-post\\.html$',
};
const rss = '<?xml version="1.0"?><rss version="2.0"><channel><title>量子位</title>'
  + '<item><title><![CDATA[AI &amp; Code]]></title><link>https://www.qbitai.com/2026/10/1.html?utm_source=wx</link><pubDate>Fri, 09 Oct 2026 17:30:00 +0000</pubDate><description><![CDATA[<p>摘要</p>]]></description><category>AI Coding</category></item>'
  + '<item><title>duplicate</title><link>https://www.qbitai.com/2026/10/1.html#comments</link><pubDate>Fri, 09 Oct 2026 17:30:00 +0000</pubDate></item>'
  + '<item><title>old</title><link>https://www.qbitai.com/2026/10/2.html</link><pubDate>Fri, 02 Oct 2026 12:00:00 +0000</pubDate></item>'
  + '<item><title>future</title><link>https://www.qbitai.com/2026/10/3.html</link><pubDate>Sun, 11 Oct 2026 12:00:00 +0000</pubDate></item>'
  + '<item><title>missing date</title><link>https://www.qbitai.com/2026/10/4.html</link></item>'
  + '<item><title>untrusted host</title><link>https://evil.example/news</link><pubDate>Fri, 09 Oct 2026 12:00:00 +0000</pubDate></item>'
  + '</channel></rss>';
const articleList = '<a href="asi-post.html?id=1&amp;utm_source=wx"><span class="cat">LLM · 大模型</span><h3>标题 &#x4e00;</h3><p>2026.08.30 的研究有了新进展</p><div class="m"><span>2026.10.10</span><span>阅读全文 →</span></div></a>'
  + '<a href="asi-post.html?id=2"><h3>timestamp</h3><time datetime="2026-10-03T17:10:00Z"></time></a>'
  + '<a href="asi-post.html?id=3"><h3>relative date must not be guessed</h3><div class="m"><span>今天</span></div></a>'
  + '<a href="asi-post.html?id=4"><h3>invalid date</h3><div class="m"><span>2026.02.30</span></div></a>'
  + '<a href="https://evil.example/asi-post.html?id=5"><h3>external</h3><div class="m"><span>2026.10.10</span></div></a>'
  + '<a href="asi-post.html?id=6"><h3>old</h3><div class="m"><span>2026.10.03</span></div></a>';
const response = (body, status = 200, url = '') => ({ ok: status >= 200 && status < 300, status, url, text: async () => body });

test('RSS candidates preserve publication date and original URL without promoting media facts', () => {
  const parsed = parseMediaFeed(rss, rssSource);
  assert.equal(parsed.observedItems, 6);
  assert.equal(parsed.rejectedItems, 2);
  const selected = selectMediaWindow(parsed.records, '2026-10-10');
  assert.equal(selected.length, 1);
  assert.equal(selected[0].title, 'AI & Code');
  assert.equal(selected[0].originalUrl, 'https://www.qbitai.com/2026/10/1.html');
  assert.equal(selected[0].sourceDate, '2026-10-10');
  assert.equal(selected[0].publishedAt, '2026-10-09T17:30:00.000Z');
  assert.equal(selected[0].channel, 'official_site_mirror');
  assert.equal(selected[0].publishingEligible, false);
  assert.equal(selected[0].requiresOfficialVerification, false);
  assert.equal(selected[0].requiresFactVerification, true);
  assert.equal(selected[0].verificationStatus, 'needs_original_fact_review');
});

test('article list uses explicit publication metadata, not dates mentioned in summaries', () => {
  assert.deepEqual(mediaWindow('2026-10-10'), { from: '2026-10-04', to: '2026-10-10', days: 7 });
  const parsed = parseMediaArticleList(articleList, listSource);
  assert.equal(parsed.observedItems, 5);
  assert.equal(parsed.rejectedItems, 2);
  const selected = selectMediaWindow(parsed.records, '2026-10-10');
  assert.deepEqual(selected.map((item) => item.sourceDate), ['2026-10-10', '2026-10-04']);
  assert.equal(selected[0].publishedAt, '2026-10-10');
  assert.equal(selected[0].datePrecision, 'date');
  assert.equal(selected[0].title, '标题 一');
  assert.equal(selected[0].originalUrl, 'https://aiera.com.cn/asi-post.html?id=1');
  assert.throws(() => mediaWindow('2026-02-30'), /Invalid target date/);
});

test('Atom published date is accepted but updated-only dates and malformed feeds are rejected', () => {
  const atom = '<feed xmlns="http://www.w3.org/2005/Atom"><title>Feed</title>'
    + '<entry><title>New entry</title><link rel="alternate" href="https://www.qbitai.com/2026/10/10.html"/><published>2026-10-10T01:00:00Z</published><updated>2026-10-10T03:00:00Z</updated></entry>'
    + '<entry><title>Older entry updated today</title><link href="https://www.qbitai.com/2026/09/1.html"/><updated>2026-10-10T03:00:00Z</updated></entry></feed>';
  const parsed = parseMediaFeed(atom, rssSource);
  assert.equal(parsed.records.length, 1);
  assert.equal(parsed.records[0].publishedAt, '2026-10-10T01:00:00.000Z');
  assert.throws(() => parseMediaFeed('<html><title>login</title></html>', rssSource), /not an RSS/);
  assert.throws(() => parseMediaFeed('<rss><channel>', rssSource), /Invalid RSS/);
});

test('source restrictions and independent fetch failures do not discard successful candidates', async () => {
  const blocked = { ...listSource, id: 'jiqizhixin', name: '机器之心', url: 'https://www.jiqizhixin.com/articles' };
  const failed = { ...rssSource, id: 'failed', url: 'https://failed.example/feed/' };
  const captcha = { ...rssSource, id: 'captcha', url: 'https://captcha.example/feed/' };
  const snapshot = await discoverMediaCandidates([rssSource, listSource, blocked, failed, captcha], {
    targetDate: '2026-10-10', generatedAt: '2026-10-10T08:00:00Z',
    fetchImpl: async (url, options) => {
      assert.ok(options.signal instanceof AbortSignal);
      if (url === failed.url) throw new Error('upstream unavailable');
      if (url === captcha.url) return response('<title>验证码</title>');
      if (url === blocked.url) return response('<title>机器之心·数据服务</title>还在费劲爬数据？');
      return response(url === rssSource.url ? rss : articleList);
    },
  });
  assert.equal(snapshot.run.status, 'success');
  assert.equal(snapshot.candidates.length, 3);
  assert.deepEqual(snapshot.sources.map((source) => source.status), ['success', 'success', 'blocked', 'failed', 'blocked']);
  assert.equal(snapshot.sources[3].error, 'upstream unavailable');
  assert.ok(snapshot.candidates.every((item) => !item.publishingEligible));
});

test('a reachable undated page is partial, never a successful empty source', async () => {
  const snapshot = await discoverMediaCandidates([listSource], {
    targetDate: '2026-10-10', fetchImpl: async () => response('<html><h1>新闻</h1></html>'),
  });
  assert.equal(snapshot.sources[0].status, 'partial');
  assert.equal(snapshot.sources[0].candidateCount, 0);
  assert.equal(snapshot.run.status, 'failed');
});

test('public WeChat mirrors require the configured feed and account identity', () => {
  const source = { ...rssSource, expectedFeedTitles: ['数字生命卡兹克'],
    allowedArticleHosts: ['mp.weixin.qq.com'], wechatBiz: 'correct==' };
  const body = '<rss><channel><title>数字生命卡兹克</title>'
    + '<item><title>本人原创</title><link>https://mp.weixin.qq.com/s?__biz=correct==&amp;mid=1&amp;idx=1</link><pubDate>Thu, 29 Oct 2026 08:22:00 +0800</pubDate><content:encoded><![CDATA[<p>作者实际正文</p><a href="https://example.com/original">原始资料</a>]]></content:encoded></item>'
    + '<item><title>其他账号链接</title><link>https://mp.weixin.qq.com/s?__biz=other==&amp;mid=2</link><pubDate>Thu, 29 Oct 2026 08:22:00 +0800</pubDate></item></channel></rss>';
  const parsed = parseMediaFeed(body, source);
  assert.equal(parsed.records.length, 1);
  assert.equal(parsed.records[0].sourceDate, '2026-10-29');
  assert.match(parsed.records[0].contentExcerpt, /作者实际正文/);
  assert.ok(parsed.records[0].contentHash);
  assert.deepEqual(parsed.records[0].referencedUrls, ['https://example.com/original']);
  assert.throws(() => parseMediaFeed(body.replace(/数字生命卡兹克/g, '同名错号'), source), /identity mismatch/);
});

test('every enabled account is checked and same-day coverage never relabels prior pushes', async () => {
  const names = ['极客公园', '数字生命卡兹克', '量子位', '橘鸦Juya', '有新Newin'];
  const sources = names.map((name, index) => ({ ...rssSource, id: 'source-' + index, name, url: 'https://feed.example/' + index }));
  const seen = [];
  const snapshot = await discoverMediaCandidates(sources, { targetDate: '2026-10-29', generatedAt: '2026-10-29T03:00:00Z',
    fetchImpl: async (url) => { seen.push(url); return response(rss.replace(/09 Oct 2026/g, '27 Oct 2026')); } });
  assert.equal(seen.length, 5);
  assert.ok(snapshot.sources.every(source => source.sameDayCandidateCount === 0));
  assert.ok(snapshot.sources.every(source => source.sameDayStatus === 'not_observed_in_public_feed'));
  assert.ok(snapshot.candidates.every(candidate => candidate.sourceDate === '2026-10-29' ? false : candidate.sourceDate === '2026-10-28'));
});

test('an empty feed and wrong identity cannot report successful no-push checks', async () => {
  const source = { ...rssSource, expectedFeedTitles: ['量子位'] };
  const empty = await discoverMediaCandidates([source], { targetDate: '2026-10-29',
    fetchImpl: async () => response('<rss><channel><title>量子位</title></channel></rss>') });
  assert.equal(empty.sources[0].status, 'partial');
  const wrong = await discoverMediaCandidates([source], { targetDate: '2026-10-29',
    fetchImpl: async () => response('<rss><channel><title>其他账号</title></channel></rss>') });
  assert.equal(wrong.sources[0].status, 'failed');
  assert.match(wrong.sources[0].error, /identity mismatch/);
});

test('the standing collection config includes all five requested Chinese accounts', async () => {
  const config = JSON.parse(await readFile(new URL('../ai-media-sources.json', import.meta.url), 'utf8'));
  for (const name of ['极客公园', '数字生命卡兹克', '量子位', '橘鸦Juya', '有新Newin']) {
    const source = config.sources.find(item => item.name === name);
    assert.ok(source?.enabled, name + ' must be checked on each run');
    assert.equal(source.language, 'zh');
    assert.ok(source.url.startsWith('https://'));
  }
  for (const source of config.sources.filter(item => item.channel === 'wechat_public_rss')) {
    assert.ok(source.expectedFeedTitles?.length, source.name + ' requires a feed identity');
    assert.ok(source.wechatBiz, source.name + ' requires a fixed account identity');
  }
});

test('requests use a bounded abort signal while other sources complete', async () => {
  const keepAlive = setTimeout(() => {}, 100);
  try {
    const slow = { ...listSource, id: 'slow' };
    const snapshot = await discoverMediaCandidates([rssSource, slow], {
      targetDate: '2026-10-10', timeoutMs: 15,
      fetchImpl: async (url, { signal }) => {
        if (url === rssSource.url) return response(rss);
        await new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
      },
    });
    assert.equal(snapshot.sources[0].status, 'success');
    assert.equal(snapshot.sources[1].status, 'failed');
    assert.match(snapshot.sources[1].error, /abort|time/i);
  } finally { clearTimeout(keepAlive); }
});

test('URL normalization removes trackers but retains article identity parameters', () => {
  assert.equal(normalizeMediaUrl('asi-post.html?id=1&amp;utm_source=wechat#read', listSource.url), 'https://aiera.com.cn/asi-post.html?id=1');
  assert.equal(normalizeMediaUrl('javascript:alert(1)', listSource.url), null);
  assert.equal(normalizeMediaUrl('https://user:password@aiera.com.cn/asi-post.html?id=1'), null);
});

test('dry run creates no files and historical replay does not overwrite latest checkpoint', async () => {
  const temporaryBase = resolve(tmpdir());
  const root = await mkdtemp(join(temporaryBase, 'wagmi-ai-media-'));
  try {
    await writeFile(join(root, 'ai-media-sources.json'), JSON.stringify({ sources: [rssSource] }));
    const options = { root, targetDate: '2026-10-10', generatedAt: '2026-10-10T08:00:00Z', fetchImpl: async () => response(rss) };
    await runMediaDiscovery({ ...options, dryRun: true });
    assert.deepEqual(await readdir(root), ['ai-media-sources.json']);
    await runMediaDiscovery(options);
    const latest = await readFile(join(root, 'data/dev/ai-media-latest.json'), 'utf8');
    assert.equal(JSON.parse(latest).candidates.length, 1);
    assert.equal(JSON.parse(await readFile(join(root, 'data/dev/source-archives/ai-media-2026-10-10.json'), 'utf8')).asOf, '2026-10-10');
    await runMediaDiscovery({ ...options, targetDate: '2026-10-09' });
    assert.equal(await readFile(join(root, 'data/dev/ai-media-latest.json'), 'utf8'), latest);
    assert.equal(JSON.parse(await readFile(join(root, 'data/dev/source-archives/ai-media-2026-10-09.json'), 'utf8')).asOf, '2026-10-09');
  } finally {
    // Only remove this test's mkdtemp directory under the checked temporary base.
    assert.ok(resolve(root).startsWith(temporaryBase + sep));
    await rm(root, { recursive: true, force: true });
  }
});

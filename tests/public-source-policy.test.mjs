import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPublishedSnapshot } from '../scripts/promotion.mjs';
import { isInternalSource, isInternalSourceUrl, sanitizePublicReport, toPublicSnapshot } from '../scripts/public-source-policy.mjs';

test('internal source URLs follow parsed host boundaries, including legacy and subdomain hosts', () => {
  for (const url of ['https://memene.cn/daily', 'https://WWW.MeMeNe.CN/daily',
    'https://new.feed.memenews.cn/', 'https://memene.cn./', 'https://reader@example.memene.cn/',
    'https://%6demene.cn/', 'https://ＭＥＭＥＮＥ.cn/', 'https://ⓜⓔⓜⓔⓝⓔ.cn/', 'https://meme\nne.cn/']) {
    assert.equal(isInternalSourceUrl(url), true, url);
  }
  for (const url of ['https://evilmemene.cn/', 'https://memene.cn.evil.com/',
    'https://memene.cn@example.org/', 'https://example.org/?next=https://memene.cn/', 'not a URL']) {
    assert.equal(isInternalSourceUrl(url), false, url);
  }
  assert.equal(isInternalSource({ url: 'https://example.org/private', visibility: 'internal' }), true);
  assert.equal(isInternalSource({ url: 'https://juya.ai/daily', role: 'discovery' }), false);
});

test('public projections remove internal links recursively without losing or mutating historical events', () => {
  const official = { label: '官方中文', url: 'https://example.org/zh-cn/release' };
  const privateLink = { label: 'Internal', url: 'https://custom.example/private', visibility: 'internal' };
  const data = {
    aiEvents: [{ id: 'memene-discovered-event', date: '2026-10-28', title: '原始事实',
      summary: 'Memene 在 10 月 29 日汇总了 10 月 28 日的事实。',
      sources: [official, { label: 'Memene 交叉核验', url: 'https://memene.cn/model/old' }],
      readingSources: [{ label: '内部', url: 'https://news.memenews.cn/daily' }, privateLink,
        { label: '橘鸦Juya', url: 'https://juya.ai/daily', language: 'zh', role: 'discovery' }],
      sourceVerifiedUrls: [official.url, 'https://memene.cn/model/old', privateLink.url],
      discoverySource: { name: 'Memene 每日AI', url: 'https://memene.cn/daily/old', checkedAt: '2026-10-29T08:00:00+08:00' },
    }],
    candidates: [{ id: 'candidate-1', title: '保留候选记录', url: 'https://memene.cn/daily/candidate', reason: '已独立核实' }],
    weeklySummaries: [{ sourceNote: '[Memene 原始记录](https://memene.cn/daily/old)；原文10月28日。' }],
  };
  const before = structuredClone(data);
  const result = toPublicSnapshot(data);
  assert.deepEqual(data, before);
  assert.equal(result.aiEvents.length, 1);
  assert.equal(result.aiEvents[0].id, 'memene-discovered-event');
  assert.equal(result.aiEvents[0].date, '2026-10-28');
  assert.equal(result.aiEvents[0].title, '原始事实');
  assert.deepEqual(result.aiEvents[0].sources, [official]);
  assert.deepEqual(result.aiEvents[0].sourceVerifiedUrls, [official.url]);
  assert.deepEqual(result.aiEvents[0].readingSources.map(item => item.label), ['橘鸦Juya']);
  assert.deepEqual(result.aiEvents[0].discoverySource, { name: '内部发现源 每日AI', checkedAt: '2026-10-29T08:00:00+08:00' });
  assert.deepEqual(result.candidates, [{ id: 'candidate-1', title: '保留候选记录', reason: '已独立核实' }]);
  assert.match(result.weeklySummaries[0].sourceNote, /原文10月28日/);
  assert.doesNotMatch(JSON.stringify(result), /https:\/\/(?:[^/]*\.)?(?:memene|memenews)\.cn|custom\.example/);
  assert.notEqual(result.aiEvents[0].sources[0], official);
});

test('publication builds from a safe copy while preserving facts and source review evidence', () => {
  const merged = { asOf: { ai: '2026-10-29', github: '2026-10-29', skills: '2026-10-29' },
    projects: [], skills: [], runs: [], reports: [], candidates: [], watchlist: [],
    aiEvents: [{ id: 'event-1', date: '2026-10-28', priority: 'A', sourceReportId: 'ai-2026-10-29',
      title: '标题', summary: '摘要', action: '复核',
      sources: [{ label: '原始来源', url: 'https://example.org/release' }],
      readingSources: [{ label: 'Memene', url: 'https://memene.cn/daily/current' }],
    }],
  };
  const before = structuredClone(merged);
  const result = buildPublishedSnapshot(merged);
  assert.deepEqual(merged, before);
  assert.equal(result.aiEvents.length, merged.aiEvents.length);
  assert.deepEqual(result.aiEvents[0].sources, merged.aiEvents[0].sources);
  assert.deepEqual(result.aiEvents[0].readingSources, []);
});

test('public reports redact private channel links and names while retaining dates, facts, and public sources', () => {
  const input = '10月28日原文；10月29日检查。[Memene 今日22条](https://memene.cn/daily/one?ref=website) 已逐条核实。\n'
    + '<a class="source" href="https://feed.memenews.cn/daily">Memene交叉核验</a>：保持实际日期。\n'
    + '<https://MEMENE.cn/daily/one>；https://memene.cn/daily/two。\n'
    + '[橘鸦Juya](https://juya.ai/daily) [官方](https://example.org/release)\n'
    + '[无关域名](https://memene.cn.evil.com/path) https://evilmemene.cn/\n';
  const result = sanitizePublicReport(input);
  assert.match(result, /10月28日原文；10月29日检查/);
  assert.match(result, /内部发现源 今日22条 已逐条核实/);
  assert.match(result, /内部发现源交叉核验：保持实际日期/);
  assert.match(result, /内部发现源；内部发现源。/);
  assert.match(result, /\[橘鸦Juya\]\(https:\/\/juya\.ai\/daily\)/);
  assert.match(result, /\[官方\]\(https:\/\/example\.org\/release\)/);
  assert.match(result, /https:\/\/memene\.cn\.evil\.com\/path/);
  assert.match(result, /https:\/\/evilmemene\.cn\//);
  assert.doesNotMatch(result, /href="https:\/\/feed\.memenews\.cn\/|\]\(https:\/\/memene\.cn\//);
  assert.equal(sanitizePublicReport(result), result);
});

test('embedded JSON is sanitized structurally and remains parseable with escaped quotes and markup', () => {
  const data = { title: '10月28日事实', html: '<a href="https://memene.cn/daily">Memene</a>',
    sources: [{ label: 'Memene', url: 'https://memene.cn/daily' }, { label: '官方', url: 'https://example.org/release' }] };
  const input = `<script type="application/json">${JSON.stringify(data)}</script>`;
  const report = sanitizePublicReport(input);
  const parsed = JSON.parse(report.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.equal(parsed.title, data.title);
  assert.equal(parsed.html, '内部发现源');
  assert.deepEqual(parsed.sources, [data.sources[1]]);
  const fenced = sanitizePublicReport('```json\n' + JSON.stringify(data, null, 2) + '\n```');
  assert.equal(JSON.parse(fenced.replace(/^```json\n|```$/g, '')).html, '内部发现源');
  assert.equal(sanitizePublicReport('https://%6demene.cn/daily'), '内部发现源');
  assert.equal(sanitizePublicReport('中文入口：https://ⓜⓔⓜⓔⓝⓔ.cn/daily'), '中文入口：内部发现源');
});

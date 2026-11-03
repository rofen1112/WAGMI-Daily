import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = (await readFile(new URL('../src/aiReadingSources.ts', import.meta.url), 'utf8'))
  .replace('../scripts/public-source-policy.mjs', new URL('../scripts/public-source-policy.mjs', import.meta.url).href);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { aiReadingSources } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('Chinese reading links lead without turning English originals into Chinese pages', () => {
  const sources = aiReadingSources([
    { label: '原始来源', url: 'https://openai.com/index/example' },
    { label: '量子位', url: 'https://www.qbitai.com/2026/10/example' },
  ]);
  assert.equal(sources[0].displayName, '量子位');
  assert.equal(sources[0].category, '中文解读');
  assert.equal(sources[1].displayName, 'OpenAI');
  assert.equal(sources[1].category, '原始来源');
  assert.equal(sources[1].chinese, false);
});

test('Internal discovery channels never become reader links; public Chinese discovery links remain', () => {
  const url = 'https://juya.ai/daily/2026-10-29';
  const sources = aiReadingSources([
    { label: 'Memene', url: 'https://memene.cn/daily/168137907427606528?ref=website' },
    { label: 'private', url: 'https://example.org/private', visibility: 'internal' },
    { label: '旧发现源', url: 'https://news.MEMENEWS.cn/daily' },
    { label: '橘鸦Juya', url, language: 'zh', role: 'discovery' },
  ], [
    { label: 'Memene 每日AI', url: 'https://www.MEMENE.cn/daily', language: 'zh', role: 'discovery' },
    { label: '橘鸦Juya·中文导读', url, language: 'zh', role: 'discovery' },
  ]);
  assert.equal(sources.length, 1);
  assert.equal(sources[0].displayName, '橘鸦Juya·中文导读');
  assert.equal(sources[0].category, '中文速览');
  assert.equal(sources[0].role, 'discovery');
});

test('Explicit language wins over host hints and descriptive source labels survive', () => {
  const sources = aiReadingSources([
    { label: '官方资格和额度说明', url: 'https://developers.openai.com/api/docs/guide' },
    { label: 'English interview', url: 'https://www.qbitai.com/interview', language: 'en', role: 'coverage' },
    { label: '原始来源', url: 'https://example.org/zh-cn/release' },
  ]);
  assert.equal(sources.find((item) => item.url.includes('developers.openai.com')).displayName, '官方资格和额度说明');
  assert.equal(sources.find((item) => item.url.includes('qbitai.com')).chinese, false);
  assert.equal(sources.find((item) => item.url.includes('example.org')).category, '中文原文');
});

test('Only safe public web links reach the reader', () => {
  const sources = aiReadingSources([
    { label: 'bad', url: 'javascript:alert(1)' },
    { label: 'bad', url: 'https://name:password@example.org/' },
    { label: 'bad', url: 'not a URL' },
    { label: '原始来源', url: 'https://github.blog/changelog/example' },
  ]);
  assert.equal(sources.length, 1);
  assert.equal(sources[0].displayName, 'GitHub 官方博客');
});

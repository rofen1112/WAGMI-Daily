import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve, sep } from 'node:path';
import test from 'node:test';

test('paper reselection aligns the manifest and retains displaced source records and RSS dates', async t => {
  const workspace = process.cwd();
  const root = await mkdtemp(resolve(workspace, '.tmp-paper-selection-'));
  t.after(async () => {
    assert.ok(root.startsWith(workspace + sep + '.tmp-paper-selection-'));
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(resolve(root, 'data/dev'), { recursive: true });
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
  const old = { id: 'old-paper', contentKind: 'paper', paper: { paperUrl: 'https://arxiv.org/abs/2606.00001' } };
  const industry = { id: 'industry', contentKind: 'industry_event' };
  const evidence = [{ url: 'https://arxiv.org/abs/2606.00001', checkedAt: 'actual-source-time' }];
  const papers = ['2610.00001', '2610.00002', '2610.00003'].map(arxivId => ({
    id: 'arxiv-' + arxivId.replace('.', '-'), arxivId,
    titleOriginal: 'Original paper', titleZh: '论文中文题目', summaryZh: '中文摘要',
    industryValueZh: '应用价值', futureOutlookZh: '后续方向', limitationsZh: '摘要级限制',
    readingLevel: 'abstract', authors: [], targetBoards: ['Frontier Paper / Research'],
    relatedRepositories: [], publishedAt: date + 'T05:00:00.000Z',
    originalPublishedAt: '2026-10-29T00:00:00.000Z', rssAnnouncedAt: date + 'T05:00:00.000Z',
    url: 'https://arxiv.org/abs/' + arxivId, pdfUrl: 'https://arxiv.org/pdf/' + arxivId,
  }));
  const write = (name, value) => writeFile(resolve(root, 'data/dev/' + name + '.json'), JSON.stringify(value));
  const readingSources = [{ label: '已核对中文正文', url: 'https://example.cn/paper', language: 'zh', role: 'coverage' }];
  const retained = { id: 'retained', contentKind: 'paper', paper: { paperUrl: papers[0].url }, readingSources };
  await Promise.all([
    write('papers-catalog', { asOf: date, papers, dailyRecommendations: papers.map(paper => paper.id) }),
    write('ai-events-latest', { asOf: date, report: { id: 'ai-' + date }, aiEvents: [industry, old, retained] }),
    write('index', { aiEvents: [industry, old] }),
    write('ai-editorial-repairs-' + date, { runDate: date, events: [industry, old, retained], verifiedSources: evidence }),
  ]);
  const script = resolve(workspace, 'scripts/select-daily-paper-events.mjs');
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 0, result.stderr);
    const manifest = JSON.parse(await readFile(resolve(root, `data/dev/ai-editorial-repairs-${date}.json`), 'utf8'));
    const latest = JSON.parse(await readFile(resolve(root, 'data/dev/ai-events-latest.json'), 'utf8'));
    assert.equal(manifest.events.filter(event => event.contentKind === 'paper').length, 3);
    assert.deepEqual(manifest.events, latest.aiEvents);
    assert.deepEqual(manifest.verifiedSources, evidence);
    assert.deepEqual(manifest.deferredPaperEvents, [{ ...old, digestSelected: false }]);
    assert.equal(latest.aiEvents[1].date, '2026-10-29');
    assert.equal(latest.aiEvents[1].paper.publishedAt, papers[0].originalPublishedAt);
    assert.equal(latest.aiEvents[1].paper.rssAnnouncedAt, papers[0].rssAnnouncedAt);
    assert.deepEqual(latest.aiEvents[1].readingSources, readingSources);
  }
});

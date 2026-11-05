import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { sanitizePublicReport } from '../scripts/public-source-policy.mjs';
import {
  AI_DISCOVERY_REVIEW_POLICY, candidateFingerprint, mediaConfigFingerprint,
  prepareAiDiscoveryReview, evaluateAiDiscoveryReview, runAiDiscoveryReview, shanghaiDate,
} from '../scripts/ai-discovery-review.mjs';

const date = '2026-10-29';
const checkedAt = '2026-10-29T01:00:00.000Z';
const clone = value => structuredClone(value);
function fixture() {
  const event = { id: 'event-one', verification: 'verified', sourceReportId: 'ai-' + date,
    sources: [{ label: '原始发布', url: 'https://original.example/release' }],
    readingSources: [{ label: '量子位中文解读', url: 'https://www.qbitai.com/review', language: 'zh', role: 'coverage' }] };
  const memeneCandidate = { id: 'memene-one', title: '一项重要发布', summary: '产品开放新功能。', sources: [{ url: 'https://original.example/release' }] };
  const mediaCandidate = { id: 'media-one', sourceId: 'qbitai', sourceName: '量子位', sourceDate: date,
    title: '产品新功能中文介绍', summary: '核对发布日期和开放范围。', contentHash: 'actual-body-hash',
    originalUrl: 'https://www.qbitai.com/review' };
  const mediaConfig = { sources: [{ id: 'qbitai', name: '量子位', enabled: true, url: 'https://www.qbitai.com/feed/', format: 'rss' }] };
  const memene = { asOf: date, generatedAt: checkedAt, run: { status: 'success' }, target: { id: 'record-one', date, candidates: [memeneCandidate] } };
  const media = { asOf: date, generatedAt: checkedAt,
    sources: [{ id: 'qbitai', url: mediaConfig.sources[0].url, checkedAt, status: 'success', sameDayCandidateCount: 1 }],
    candidates: [mediaCandidate] };
  const decision = candidate => ({ id: candidate.id, ...(candidate.sourceId ? { sourceId: candidate.sourceId } : {}),
    candidateHash: candidateFingerprint(candidate), importance: 'normal', disposition: 'covered',
    reason: '已核实并由正式日报收录。', eventIds: [event.id], checkedAt });
  const review = { schemaVersion: '1.0.0', policy: AI_DISCOVERY_REVIEW_POLICY, runDate: date,
    memene: { recordId: memene.target.id, sourceDate: date, items: [decision(memeneCandidate)] },
    media: { configHash: mediaConfigFingerprint(mediaConfig), items: [decision(mediaCandidate)] },
    readingReviews: [{ eventId: event.id, status: 'provided', urls: [event.readingSources[0].url], reason: '已读取可用中文报道，优先提供阅读入口。', checkedAt }] };
  return { date, events: [event], allEvents: [event], memene, media, mediaConfig, review };
}

test('a complete candidate ledger and real Chinese entrances pass independently of factual evidence policy', () => {
  const result = evaluateAiDiscoveryReview(fixture());
  assert.equal(result.ready, true); assert.deepEqual(result.blockers, []);
  assert.equal(result.counts.memene.reviewed, 1); assert.equal(result.counts.media.reviewed, 1);
  assert.equal(result.counts.reading.provided, 1);
});

test('research beyond the three-paper digest must remain public with current independent catalog evidence', () => {
  const input=fixture(),url='https://arxiv.org/abs/2610.12345';
  const row=input.review.memene.items[0];
  Object.assign(row,{disposition:'catalogued',importance:'high',eventIds:[],paperIds:['arxiv-2610-12345'],
    reason:'已核实原始摘要，论文目录完整保留；当日日报三篇预算已用满。',nextAction:'下轮精选比较时继续评估，不把已有论文改成新发布。'});
  input.events.push(...[1,2,3].map(i=>({id:'selected-'+i,verification:'verified',contentKind:'paper',paper:{paperUrl:`https://arxiv.org/abs/2610.0000${i}`}})));
  for(const e of input.events.slice(1))input.review.readingReviews.push({eventId:e.id,status:'not_found',checkedAt,reason:'已检查当前中文入口，未找到对应论文的中文正文。'});
  input.paperCatalog={asOf:date,dailyRecommendations:['p1','p2','p3'],papers:[
    ...[1,2,3].map(i=>({id:'p'+i,url:`https://arxiv.org/abs/2610.0000${i}`})),
    {id:'arxiv-2610-12345',url,titleZh:'已核验的额外论文',summaryZh:'保留原始摘要的中文解读。',limitationsZh:'摘要级，未复现。',reviewStatus:'interpreted',readingLevel:'abstract',reviewedAt:checkedAt}
  ]};
  input.paperEvidence=[{url,success:true,verification:'verified',sourceClass:'original_research',checkedAt,paperIds:row.paperIds}];
  assert.equal(evaluateAiDiscoveryReview(input).ready,true);
  for(const mutate of [
    x=>{x.paperEvidence=[];},
    x=>{x.paperEvidence[0].checkedAt='2026-10-28T01:00:00Z';},
    x=>{x.paperEvidence[0].sourceClass='trusted_media';},
    x=>{x.paperCatalog.papers.at(-1).reviewedAt='2026-10-28T01:00:00Z';},
    x=>{x.paperCatalog.papers.at(-1).summaryZh='';},
    x=>{x.events.pop();},
    x=>{x.paperCatalog.dailyRecommendations=['p1','p2'];},
    x=>{x.events.at(-1).paper.paperUrl=x.events.at(-2).paper.paperUrl;},
    x=>{x.paperCatalog.dailyRecommendations=['p1','p1','p3'];},
    x=>{x.review.memene.items[0].paperIds=['missing'];},
    x=>{x.review.memene.items[0].nextAction='';},
  ]){const changed=clone(input);mutate(changed);assert.equal(evaluateAiDiscoveryReview(changed).ready,false);}
});
test('a new or changed candidate invalidates the previous completed review', () => {
  for (const mutate of [
    input => input.memene.target.candidates.push({ id: 'new', title: '新发现的重要新闻' }),
    input => { input.media.candidates[0].contentHash = 'updated-facts'; },
    input => { input.memene.target.candidates[0].sources.push({ url: 'https://another.example/new-evidence' }); },
  ]) {
    const input = fixture(); mutate(input);
    assert.equal(evaluateAiDiscoveryReview(input).ready, false);
    const prepared = prepareAiDiscoveryReview(input);
    assert.ok([...prepared.memene.items, ...prepared.media.items].some(row => row.disposition === 'needs_review'));
  }
});
test('content fingerprints ignore repeat fetch timestamps but retain sections and actual publication dates', () => {
  const candidate = fixture().media.candidates[0];
  assert.equal(candidateFingerprint(candidate), candidateFingerprint({ ...candidate, discoveredAt: 'later', checkedAt: 'later' }));
  assert.notEqual(candidateFingerprint(candidate), candidateFingerprint({ ...candidate, sourceDate: '2026-10-28' }));
  assert.notEqual(candidateFingerprint(candidate), candidateFingerprint({ ...candidate, sections: [{ id: 's1', title: '新增分项' }] }));
});
test('a claimed completed status or important dismissal cannot conceal unreviewed news', () => {
  for (const mutate of [
    input => { input.review.media.items[0].disposition = 'completed'; },
    input => { input.review.media.items[0].disposition = 'out_of_scope'; input.review.media.items[0].importance = 'high'; },
    input => { input.review.media.items[0].reason = '略过'; },
    input => { input.review.media.items[0].eventIds = []; },
    input => { input.review.media.items[0].eventIds = ['nonexistent']; },
    input => { input.review.media.items[0].disposition = 'added'; input.events = []; },
    input => { input.review.media.items[0].checkedAt = null; },
  ]) { const input = fixture(); mutate(input); assert.equal(evaluateAiDiscoveryReview(input).ready, false); }
});
test('source checklist changes and missing or stale observations block the release', () => {
  for (const mutate of [
    input => input.mediaConfig.sources.push({ id: 'new-account', url: 'https://new.example/rss' }),
    input => { input.media.sources = []; },
    input => { input.media.sources[0].checkedAt = '2026-10-28T01:00:00Z'; },
    input => { delete input.media.generatedAt; },
    input => { input.media.sources[0].url = 'https://wrong.example/rss'; },
    input => { input.mediaConfig.sources[0].expectedFeedTitles = ['量子位']; input.review.media.configHash = mediaConfigFingerprint(input.mediaConfig); input.media.sources[0].feedTitle = '别的账号'; },
  ]) { const input = fixture(); mutate(input); assert.equal(evaluateAiDiscoveryReview(input).ready, false); }
  assert.equal(shanghaiDate(null), null); assert.equal(shanghaiDate(undefined), null);
});
test('a genuine current optional failure remains a notice without inventing successful discovery', () => {
  const input = fixture();
  input.memene = { asOf: date, generatedAt: checkedAt, target: null, run: { status: 'failed', error: 'Memene HTTP 503; bounded retry failed' } };
  input.review.memene = { recordId: null, sourceDate: null, items: [] };
  input.media.sources[0] = { ...input.media.sources[0], status: 'blocked', error: 'Public feed returned HTTP 403', sameDayCandidateCount: null };
  input.media.candidates = []; input.review.media.items = [];
  const result = evaluateAiDiscoveryReview(input);
  assert.equal(result.ready, true); assert.ok(result.notices.some(notice => /Memene/.test(notice)));
  assert.ok(result.notices.some(notice => /Memene collection failed.*503.*does not establish no update/.test(notice)));
  assert.ok(result.notices.some(notice => /403/.test(notice)));
  input.memene.generatedAt = '2026-10-28T01:00:00Z';
  assert.equal(evaluateAiDiscoveryReview(input).ready, false);
});
test('pending facts require a real attempt and next recovery action', () => {
  const input = fixture(); const row = input.review.memene.items[0];
  Object.assign(row, { disposition: 'pending', eventIds: [], importance: 'high', reason: '原始报道受限，暂不能确认采购消息。' });
  assert.equal(evaluateAiDiscoveryReview(input).ready, false);
  row.attemptedSources = [{ url: 'https://original.example/report', error: 'HTTP 403; original article could not be read' }];
  row.nextAction = '下次审计重试原文，并独立检查双方公告。';
  assert.equal(evaluateAiDiscoveryReview(input).ready, true);
  row.checkedAt = '2026-10-28T01:00:00Z'; row.carriedFromRunDate = '2026-10-28';
  assert.equal(evaluateAiDiscoveryReview(input).ready, false);
});
test('a reading claim needs a real Chinese link on the accepted event or an explicit not-found assessment', () => {
  for (const mutate of [
    input => { input.review.readingReviews = []; },
    input => { input.review.readingReviews[0].urls = ['https://unrelated.example/zh']; },
    input => { input.review.readingReviews[0].urls = [input.events[0].sources[0].url]; },
    input => { input.review.readingReviews[0].status = 'not_found'; },
  ]) { const input = fixture(); mutate(input); assert.equal(evaluateAiDiscoveryReview(input).ready, false); }
  const input = fixture(); input.events[0].readingSources = [];
  input.review.readingReviews[0] = { eventId: input.events[0].id, status: 'not_found', urls: [], checkedAt, reason: '已检查全部配置中文渠道，未找到对应正文报道。' };
  assert.equal(evaluateAiDiscoveryReview(input).ready, true);
});
test('internal discovery links cannot satisfy public Chinese reading; public creator links can', () => {
  for (const source of [
    { url: 'https://memene.cn/daily/one', language: 'zh' },
    { url: 'https://www.memenews.cn/daily/one', language: 'zh' },
    { url: 'https://private.example/zh/release', language: 'zh', visibility: 'internal' },
  ]) {
    const input = fixture();
    input.events[0].readingSources = [source];
    input.review.readingReviews[0].urls = [source.url];
    assert.equal(evaluateAiDiscoveryReview(input).ready, false);
    Object.assign(input.review.readingReviews[0], { status: 'not_found', urls: [], reason: '已检查配置的公开中文渠道，内部发现源不能作为公开阅读入口。' });
    assert.equal(evaluateAiDiscoveryReview(input).ready, true);
  }
  const input = fixture();
  input.events[0].readingSources = [{ url: 'https://daily.juya.uk/daily/one#s1', language: 'zh', role: 'discovery' }];
  input.review.readingReviews[0].urls = [input.events[0].readingSources[0].url];
  assert.equal(evaluateAiDiscoveryReview(input).ready, true);
});
test('historical duplicates resolve to the real earlier event instead of being added twice', () => {
  const input = fixture(); const historical = { ...clone(input.events[0]), id: 'previous-event', sourceReportId: 'ai-2026-10-28' };
  input.allEvents.push(historical); input.review.media.items[0].disposition = 'duplicate'; input.review.media.items[0].eventIds = [historical.id];
  assert.equal(evaluateAiDiscoveryReview(input).ready, true);
  input.review.media.items[0].disposition = 'added';
  assert.equal(evaluateAiDiscoveryReview(input).ready, false);
});
test('an unchanged historical decision can be carried only with its real older ledger and original timestamp', () => {
  const input = fixture(); const candidate = input.media.candidates[0]; candidate.sourceDate = '2026-10-28';
  const oldRow = { ...input.review.media.items[0], candidateHash: candidateFingerprint(candidate), checkedAt: '2026-10-28T01:00:00Z' };
  const older = { ...clone(input.review), runDate: '2026-10-28', media: { items: [oldRow] } };
  input.review.media.items = []; input.priorReviews = [older];
  const prepared = prepareAiDiscoveryReview(input);
  assert.equal(prepared.media.items[0].checkedAt, oldRow.checkedAt);
  assert.equal(prepared.media.items[0].carriedFromRunDate, older.runDate);
  assert.equal(evaluateAiDiscoveryReview({ ...input, review: prepared }).ready, true);
  assert.equal(evaluateAiDiscoveryReview({ ...input, review: prepared, priorReviews: [] }).ready, false);
  const highPrior = clone(older); highPrior.media.items[0].importance = 'high';
  const highCarried = prepareAiDiscoveryReview({ ...input, priorReviews: [highPrior] });
  assert.equal(evaluateAiDiscoveryReview({ ...input, review: highCarried, priorReviews: [highPrior] }).ready, true);
  const changed = clone(prepared); changed.media.items[0].reason = '任意篡改了旧的编辑决定。';
  assert.equal(evaluateAiDiscoveryReview({ ...input, review: changed }).ready, false);
  candidate.sourceDate = date;
  assert.equal(prepareAiDiscoveryReview({ ...input, review: null }).media.items[0].disposition, 'needs_review');
});
test('today composite digests require each real section to be reviewed', () => {
  const input = fixture(); const candidate = input.media.candidates[0];
  candidate.sections = [{ id: 's1', title: '首条重要动态', summary: '新增模型与范围。' }, { id: 's2', title: '第二条独立动态', summary: '另一个新产品。' }];
  const row = input.review.media.items[0]; row.candidateHash = candidateFingerprint(candidate);
  assert.equal(evaluateAiDiscoveryReview(input).ready, false);
  row.disposition = 'mixed'; row.eventIds = [];
  row.subreviews = candidate.sections.map(section => ({ id: section.id, candidateHash: candidateFingerprint(section), importance: 'normal', disposition: 'covered', reason: '原始动态已由对应事件核验收录。', eventIds: [input.events[0].id], checkedAt }));
  assert.equal(evaluateAiDiscoveryReview(input).ready, true);
  row.disposition = 'covered'; row.eventIds = [input.events[0].id];
  row.subreviews[1].disposition = 'out_of_scope'; row.subreviews[1].eventIds = [];
  assert.equal(evaluateAiDiscoveryReview(input).ready, false);
  row.disposition = 'mixed'; row.eventIds = [];
  assert.equal(evaluateAiDiscoveryReview(input).ready, true);
  candidate.sections.push({ id: 's3', title: '晚到的一条重要动态' }); row.candidateHash = candidateFingerprint(candidate);
  assert.equal(evaluateAiDiscoveryReview(input).ready, false);
  candidate.sourceDate = '2026-10-28'; row.candidateHash = candidateFingerprint(candidate); row.disposition = 'out_of_scope'; row.reason = '历史聚合仅作回看，新消息独立检查当前日章节。';
  assert.equal(evaluateAiDiscoveryReview(input).ready, true);
});
test('prepare does not manufacture editorial decisions and check writes a matching durable audit', async () => {
  const root = await mkdtemp(join(tmpdir(), 'wagmi-discovery-review-'));
  const input = fixture();
  const writeJson = async (path, value) => { const target = join(root, path); await mkdir(resolve(target, '..'), { recursive: true }); await writeFile(target, JSON.stringify(value)); };
  try {
    await Promise.all([
      writeJson('data/dev/memene-daily-latest.json', input.memene), writeJson('data/dev/ai-media-latest.json', input.media),
      writeJson('ai-media-sources.json', input.mediaConfig), writeJson('data/dev/ai-events-latest.json', { aiEvents: input.events }),
      writeJson('data/main/index.json', { aiEvents: input.allEvents }),
    ]);
    const prepared = await runAiDiscoveryReview({ root, date, prepare: true, now: checkedAt });
    assert.equal(prepared.ready, false);
    const blank = JSON.parse(await readFile(join(root, prepared.reviewPath), 'utf8'));
    assert.equal(blank.media.items[0].disposition, 'needs_review'); assert.equal(blank.readingReviews[0].status, 'needs_review');
    await writeJson(prepared.reviewPath, input.review);
    const checked = await runAiDiscoveryReview({ root, date, now: checkedAt });
    assert.equal(checked.ready, true);
    const report = await readFile(join(root, `reports/ai-discovery-audit-${date}.md`), 'utf8');
    assert.match(report, /产品新功能中文介绍/); assert.match(report, /检查状态：通过/);
    const publicReport = await readFile(join(root, `public/reports/ai-discovery-audit-${date}.md`), 'utf8');
    assert.equal(sanitizePublicReport(report), publicReport);
    assert.doesNotMatch(publicReport, /memene|memenews/i);
    assert.match(report, /Memene/);
  } finally { assert.ok(resolve(root).startsWith(resolve(tmpdir()) + sep)); await rm(root, { recursive: true, force: true }); }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildFreshness } from '../scripts/send-dingtalk-digest.mjs';
import { writePromotion } from '../scripts/promotion.mjs';
import { prepareAiDiscoveryReview, evaluateAiDiscoveryReview, loadAiDiscoveryReview } from '../scripts/ai-discovery-review.mjs';

test('a factually verified current batch cannot send before discovery review passes', () => {
  const date = '2026-10-29';
  const input = { date, aiLatest: { asOf: date, run: { status: 'success' }, aiEvents: [], sourceCoverage: {
    policy: 'independent-sources-v1', asOf: date, ready: true, acceptedEvents: 0,
    verifiedSourceCount: 1, noNewEvents: true,
  } }, githubLatest: { asOf: date, run: { status: 'success' } }, skillsLatest: { asOf: date, run: { status: 'success' } } };
  assert.equal(buildFreshness(input).ready, false);
  assert.equal(buildFreshness({ ...input, discoveryReview: { ready: false, blockers: ['Unreviewed important candidate'] } }).ready, false);
  assert.equal(buildFreshness({ ...input, discoveryReview: { ready: true, blockers: [] } }).ready, true);
});

test('publication rechecks observed candidates instead of trusting an earlier ready result', async t => {
  const root = await mkdtemp(join(tmpdir(), 'wagmi-discovery-publish-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'data/dev'), { recursive: true });
  await mkdir(join(root, 'data/main'), { recursive: true });
  const date = '2026-10-29', time = date + 'T00:00:00Z';
  const memene = { asOf: date, generatedAt: time, run: { status: 'success' }, target: {
    id: 'daily-record', date, candidates: [{ id: 'one', title: '非相关消费活动', sources: [] }],
  } };
  const mediaConfig = { sources: [{ id: 'publisher', name: '公开媒体', url: 'https://example.org/feed', enabled: true }] };
  const media = { asOf: date, generatedAt: time, run: { status: 'success' }, sources: [
    { ...mediaConfig.sources[0], status: 'success', checkedAt: time },
  ], candidates: [] };
  const input = { date, memene, media, mediaConfig, events: [], allEvents: [] };
  const review = prepareAiDiscoveryReview(input);
  Object.assign(review.memene.items[0], { disposition: 'out_of_scope', importance: 'low',
    reason: '消费活动没有AI技术、产品或工作流进展。', checkedAt: time });
  assert.equal(evaluateAiDiscoveryReview({ ...input, review }).ready, true);
  const json = async (path, value) => writeFile(join(root, path), JSON.stringify(value));
  await json('ai-media-sources.json', mediaConfig);
  await json('data/dev/ai-media-latest.json', media);
  await json('data/dev/ai-discovery-review-' + date + '.json', review);
  await json('data/dev/ai-events-latest.json', { asOf: date, aiEvents: [] });
  await json('data/main/index.json', { original: true });
  memene.target.candidates.push({ id: 'new-important', title: '模型重要发布', topNews: true });
  await json('data/dev/memene-daily-latest.json', memene);
  await assert.rejects(writePromotion({ root, errors: [], warnings: [], snapshot: { asOf: { ai: date }, aiEvents: [] } }), /discovery review/i);
  assert.deepEqual(JSON.parse(await readFile(join(root, 'data/main/index.json'), 'utf8')), { original: true });
});

test('delayed main publication resolves verified dev history and still rejects unverified records', async t => {
  const root = await mkdtemp(join(tmpdir(), 'wagmi-discovery-history-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'data/dev'), { recursive: true });
  await mkdir(join(root, 'data/main'), { recursive: true });
  const date='2026-11-01', time=date+'T01:00:00Z';
  const event={id:'yesterday',date:'2026-10-31',verification:'verified'};
  const memene={asOf:date,generatedAt:time,run:{status:'success'},target:{date,id:'record',candidates:[{id:'one',title:'昨日发布的重复报道',sources:[]}]}};
  const mediaConfig={sources:[{id:'publisher',name:'公开媒体',url:'https://example.org/feed',enabled:true}]},media={asOf:date,generatedAt:time,run:{status:'success'},sources:[{id:'publisher',url:'https://example.org/feed',status:'success',checkedAt:time}],candidates:[]};
  const input={date,memene,media,mediaConfig,events:[],allEvents:[event]};
  const review=prepareAiDiscoveryReview(input);
  Object.assign(review.memene.items[0],{importance:'normal',disposition:'duplicate',reason:'昨日已核验事件，本日转载不重复收录。',eventIds:[event.id],checkedAt:time});
  const json=async(path,value)=>writeFile(join(root,path),JSON.stringify(value));
  for(const [path,value] of Object.entries({'ai-media-sources.json':mediaConfig,'data/dev/memene-daily-latest.json':memene,'data/dev/ai-media-latest.json':media,'data/dev/ai-events-latest.json':{asOf:date,aiEvents:[]},['data/dev/ai-discovery-review-'+date+'.json']:review,'data/main/index.json':{aiEvents:[]},'data/dev/index.json':{aiEvents:[event]}}))await json(path,value);
  assert.equal((await loadAiDiscoveryReview(root,date)).ready,true);
  await json('data/dev/index.json',{aiEvents:[{...event,verification:'pending'}]});
  const failed=await loadAiDiscoveryReview(root,date);
  assert.equal(failed.ready,false);
  assert.ok(failed.blockers.some(x=>x.includes('Unresolved or unverified event yesterday')));
  assert.deepEqual(JSON.parse(await readFile(join(root,'data/main/index.json'),'utf8')),{aiEvents:[]});
});

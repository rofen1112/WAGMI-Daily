import test from 'node:test';
import assert from 'node:assert/strict';
import { primaryMemeneReady, dedupeEventsById, inspectOptionalMemene } from '../scripts/reconcile-ai-collection.mjs';

test('optional collector failure retains the real error rather than claiming no update', async () => {
  const date = '2026-11-05', generatedAt = '2026-11-05T00:32:04.915Z';
  const result = await inspectOptionalMemene({ asOf: date, generatedAt, target: null,
    run: { status: 'failed', stage: 'history', error: 'request timeout' } }, date,
  () => { throw new Error('failed collection must not request an invented record'); });
  assert.equal(result.status, 'failed');
  assert.equal(result.checkedAt, generatedAt);
  assert.equal(result.error, 'request timeout');
  assert.equal(result.stage, 'history');
  assert.equal(result.optional, true);
  assert.equal(result.expectedNoUpdate, false);
  assert.match(result.message, /不能据此判断没有更新/);
});
test('exact-date structured Memene is authoritative without a date-path HTML page', () => {
  const memene = { asOf: '2026-10-08', run: { status: 'success' }, window: { status: 'current' }, target: { date: '2026-10-08', id: 'real-id', candidates: [{}] } };
  assert.equal(primaryMemeneReady(memene, '2026-10-08'), true);
  assert.equal(primaryMemeneReady({ ...memene, target: { ...memene.target, date: '2026-10-02' } }, '2026-10-08'), false);
});

test('rerunning reconciliation is idempotent for the same editorial events', () => {
  assert.deepEqual(dedupeEventsById([{id:'one', title:'old'}, {id:'two'}, {id:'one', title:'new'}]), [{id:'one', title:'new'}, {id:'two'}]);
});

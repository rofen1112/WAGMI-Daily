import test from 'node:test';
import assert from 'node:assert/strict';
import { primaryMemeneReady, dedupeEventsById } from '../scripts/reconcile-ai-collection.mjs';
test('exact-date structured Memene is authoritative without a date-path HTML page', () => {
  const memene = { asOf: '2026-10-08', run: { status: 'success' }, window: { status: 'current' }, target: { date: '2026-10-08', id: 'real-id', candidates: [{}] } };
  assert.equal(primaryMemeneReady(memene, '2026-10-08'), true);
  assert.equal(primaryMemeneReady({ ...memene, target: { ...memene.target, date: '2026-10-02' } }, '2026-10-08'), false);
});

test('rerunning reconciliation is idempotent for the same editorial events', () => {
  assert.deepEqual(dedupeEventsById([{id:'one', title:'old'}, {id:'two'}, {id:'one', title:'new'}]), [{id:'one', title:'new'}, {id:'two'}]);
});

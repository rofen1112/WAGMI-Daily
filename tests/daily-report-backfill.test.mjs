import assert from 'node:assert/strict';
import test from 'node:test';

test('daily report backfill module can be imported without executing a run', async () => {
  const module = await import('../scripts/backfill-daily-report-gaps.mjs');
  assert.equal(typeof module.backfillDailyReportGaps, 'function');
});

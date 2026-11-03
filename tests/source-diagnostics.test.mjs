import assert from 'node:assert/strict';
import test from 'node:test';
import { failedSourceDiagnostics } from '../scripts/source-diagnostics.mjs';

test('retains unavailable upstream evidence when the declared fallback succeeds', () => {
  const upstream = { id: 'ossinsight-24h-all', status: 'unavailable', url: 'https://api.ossinsight.io/', dataQuality: { status: 'unavailable' } };
  const result = failedSourceDiagnostics([{ id: 'github-trending-24h-all', status: 'success', upstream }]);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, upstream.id);
  assert.equal(result[0].recoveredBy, 'github-trending-24h-all');
  assert.deepEqual(result[0].dataQuality, upstream.dataQuality);
});

test('reports failed fallbacks and deduplicates upstream rows', () => {
  const upstream = { id: 'oss', url: 'https://example.com/', status: 'failed' };
  const result = failedSourceDiagnostics([upstream, { id: 'fallback', status: 'failed', upstream }, { id: 'healthy', status: 'success' }]);
  assert.deepEqual(result.map(row => row.id), ['oss', 'fallback']);
  assert.equal(result[0].recoveredBy, undefined);
});

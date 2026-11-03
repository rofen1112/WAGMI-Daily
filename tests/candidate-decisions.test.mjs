import assert from 'node:assert/strict';
import test from 'node:test';
import { applyCandidateDecisions, validateCandidateDecision } from '../scripts/candidate-decisions.mjs';

test('candidate decisions override automation status without losing evidence', () => {
  const candidates = [{ id: 'owner-repo', name: 'owner/repo', status: 'verified', source: 'daily', reason: 'Verified URL' }];
  const [candidate] = applyCandidateDecisions(candidates, [{ id: 'owner-repo', status: 'approved', note: '', updatedAt: '2026-07-16T08:00:00Z' }]);
  assert.equal(candidate.status, 'approved');
  assert.equal(candidate.reason, 'Verified URL');
  assert.equal(candidate.decisionUpdatedAt, '2026-07-16T08:00:00Z');
});

test('candidate decision validation rejects unsupported states and ids', () => {
  assert.deepEqual(validateCandidateDecision({ id: 'valid-id', status: 'observe' }), []);
  assert.ok(validateCandidateDecision({ id: '../bad', status: 'pending' }).length >= 1);
});

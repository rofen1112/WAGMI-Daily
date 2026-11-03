import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { queuePaperReview, validatePaperReviewRequest } from '../scripts/paper-review-requests.mjs';

test('paper review requests are validated and queued idempotently', async () => {
  const root = await mkdtemp(join(tmpdir(), 'paper-review-request-'));
  try {
    assert.deepEqual(validatePaperReviewRequest({ paperId: 'arxiv-2608-00001' }), []);
    assert.ok(validatePaperReviewRequest({ paperId: '../bad' }).length > 0);

    const first = await queuePaperReview(root, 'arxiv-2608-00001', {
      requestedAt: '2026-08-06T08:00:00.000Z',
    });
    const second = await queuePaperReview(root, 'arxiv-2608-00001', {
      requestedAt: '2026-08-06T09:00:00.000Z',
    });

    assert.equal(first.created, true);
    assert.equal(second.created, false);
    const payload = JSON.parse(await readFile(join(root, 'data/dev/paper-review-requests.json'), 'utf8'));
    assert.equal(payload.requests.length, 1);
    assert.equal(payload.requests[0].status, 'queued');
    assert.equal(payload.requests[0].source, 'local-admin');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

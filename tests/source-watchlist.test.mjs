import assert from 'node:assert/strict';
import test from 'node:test';
import { validateSourceChannel } from '../scripts/source-watchlist.mjs';

const validSource = {
  name: 'Official Product Blog',
  kind: 'official',
  status: 'official_priority',
  priority: 1,
  focus: ['model releases'],
  url: 'https://example.org/blog',
  why: 'Primary release and product update source.',
  seed_links: ['https://example.org/releases'],
};

test('source channel validation accepts a complete HTTPS source', () => {
  assert.deepEqual(validateSourceChannel(validSource), []);
});

test('source channel validation rejects unsafe or incomplete channels', () => {
  assert.ok(validateSourceChannel({ ...validSource, url: 'http://example.org', focus: [] }).length >= 2);
  assert.ok(validateSourceChannel({ ...validSource, kind: 'unknown', priority: 0 }).length >= 2);
});

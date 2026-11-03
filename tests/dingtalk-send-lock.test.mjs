import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { acquireDingtalkSendLock } from '../scripts/dingtalk-send-lock.mjs';

test('simultaneous daily senders reserve only one delivery', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ark-send-lock-'));
  try {
    const path = join(dir, 'send.json');
    const attempts = await Promise.allSettled(Array.from({ length: 8 }, () => acquireDingtalkSendLock(path, '2026-10-30')));
    assert.equal(attempts.filter(x => x.status === 'fulfilled').length, 1);
    const lock = attempts.find(x => x.status === 'fulfilled').value;
    await lock.release();
    const next = await acquireDingtalkSendLock(path, '2026-10-30');
    await next.release();
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('uncertain request retains its reservation until receipt is reconciled', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ark-send-lock-'));
  try {
    const path = join(dir, 'send.json');
    const lock = await acquireDingtalkSendLock(path, '2026-10-30');
    await lock.markRequestStarted();
    await lock.release();
    assert.equal(JSON.parse(await readFile(path, 'utf8')).stage, 'request-started');
    await assert.rejects(acquireDingtalkSendLock(path, '2026-10-30'), /reconcile/);
    lock.markResolved();
    await lock.release();
    await assert.rejects(readFile(path), { code: 'ENOENT' });
  } finally { await rm(dir, { recursive: true, force: true }); }
});

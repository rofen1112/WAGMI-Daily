import { mkdir, open, readFile, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

// Never expire a lock by age: an interrupted HTTP request may have delivered.
export async function acquireDingtalkSendLock(path, date) {
  await mkdir(dirname(path), { recursive: true });
  let handle;
  try {
    handle = await open(path, 'wx');
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    throw new Error('DingTalk send already reserved; reconcile the existing send lock and receipt before retrying.');
  }
  const token = `${process.pid}:${date}:${randomUUID()}`;
  let state = { token, date, pid: process.pid, createdAt: new Date().toISOString(), stage: 'reserved' };
  await handle.writeFile(JSON.stringify(state, null, 2) + '\n');
  await handle.close();
  let uncertain = false;
  return {
    async markRequestStarted() {
      uncertain = true;
      state = { ...state, stage: 'request-started', requestStartedAt: new Date().toISOString() };
      const file = await open(path, 'r+');
      try { await file.truncate(); await file.writeFile(JSON.stringify(state, null, 2) + '\n'); }
      finally { await file.close(); }
    },
    markResolved() { uncertain = false; },
    async release() {
      if (uncertain) return;
      const current = JSON.parse(await readFile(path, 'utf8'));
      if (current.token === token) await unlink(path);
    },
  };
}

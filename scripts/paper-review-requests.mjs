import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export const paperReviewRequestsPath = 'data/dev/paper-review-requests.json';

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = path + '.' + process.pid + '.tmp';
  await writeFile(temporary, JSON.stringify(value, null, 2) + '\n', 'utf8');
  await rename(temporary, path);
}

export function validatePaperReviewRequest(value) {
  const errors = [];
  if (!value || typeof value !== 'object') return ['request body must be an object'];
  if (typeof value.paperId !== 'string' || !/^arxiv-[\w.-]+$/i.test(value.paperId)) {
    errors.push('paperId must be a valid arXiv catalog id');
  }
  return errors;
}

export async function readPaperReviewRequests(root) {
  return readJson(resolve(root, paperReviewRequestsPath), {
    schemaVersion: '1.0.0',
    updatedAt: null,
    requests: [],
  });
}

export async function queuePaperReview(root, paperId, options = {}) {
  const requestedAt = options.requestedAt ?? new Date().toISOString();
  const payload = await readPaperReviewRequests(root);
  const existing = payload.requests.find((request) => request.paperId === paperId && request.status === 'queued');

  if (existing) {
    return { created: false, request: existing, payload };
  }

  const request = {
    paperId,
    requestedAt,
    status: 'queued',
    source: 'local-admin',
  };
  const next = {
    schemaVersion: '1.0.0',
    updatedAt: requestedAt,
    requests: [...payload.requests, request],
  };
  await writeAtomic(resolve(root, paperReviewRequestsPath), next);
  return { created: true, request, payload: next };
}

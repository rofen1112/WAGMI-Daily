import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export const candidateDecisionStatuses = ['approved', 'observe', 'rejected'];

export function applyCandidateDecisions(candidates, decisions = []) {
  const byId = new Map(decisions.map((decision) => [decision.id, decision]));
  return candidates.map((candidate) => {
    const decision = byId.get(candidate.id);
    if (!decision) return candidate;
    return {
      ...candidate,
      status: decision.status,
      decisionNote: decision.note ?? '',
      decisionUpdatedAt: decision.updatedAt,
    };
  });
}

export function validateCandidateDecision(input) {
  const errors = [];
  if (!input || typeof input !== 'object') errors.push('Decision must be an object');
  if (typeof input?.id !== 'string' || !/^[a-z0-9][a-z0-9._-]{0,127}$/i.test(input.id)) errors.push('Candidate id is invalid');
  if (!candidateDecisionStatuses.includes(input?.status)) errors.push('Candidate status is invalid');
  if (input?.note != null && (typeof input.note !== 'string' || input.note.length > 500)) errors.push('Candidate note is invalid');
  return errors;
}

export async function writeCandidateDecision(root, input, now = new Date().toISOString()) {
  const errors = validateCandidateDecision(input);
  if (errors.length) throw new Error(errors.join('; '));
  const path = resolve(root, 'data/dev/candidate-decisions.json');
  let decisions = [];
  try {
    decisions = JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const decision = { id: input.id, status: input.status, note: input.note?.trim() ?? '', updatedAt: now };
  const next = [...decisions.filter((item) => item.id !== input.id), decision]
    .sort((left, right) => left.id.localeCompare(right.id));
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, path);
  return decision;
}

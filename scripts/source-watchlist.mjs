import { readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const allowedStatuses = new Set(['official_priority', 'followed', 'observe_new']);
const allowedKinds = new Set(['official', 'media', 'creator', 'community']);

function isHttpsUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateSourceChannel(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['source channel must be an object'];
  if (typeof value.name !== 'string' || value.name.trim().length < 2 || value.name.trim().length > 80) errors.push('name must contain 2-80 characters');
  if (!allowedKinds.has(value.kind)) errors.push('kind is unsupported');
  if (!allowedStatuses.has(value.status)) errors.push('status is unsupported');
  if (!Number.isInteger(value.priority) || value.priority < 1 || value.priority > 3) errors.push('priority must be an integer from 1 to 3');
  if (!isHttpsUrl(value.url)) errors.push('url must be a valid HTTPS URL');
  if (!Array.isArray(value.focus) || value.focus.length < 1 || value.focus.length > 8 || value.focus.some((item) => typeof item !== 'string' || !item.trim())) {
    errors.push('focus must contain 1-8 non-empty items');
  }
  if (typeof value.why !== 'string' || value.why.trim().length < 8 || value.why.trim().length > 400) errors.push('why must contain 8-400 characters');
  if (value.seed_links !== undefined && (!Array.isArray(value.seed_links) || value.seed_links.some((item) => !isHttpsUrl(item)))) {
    errors.push('seed_links must contain HTTPS URLs');
  }
  return errors;
}

function shanghaiDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function appendSourceChannel(root, input) {
  const errors = validateSourceChannel(input);
  if (errors.length) throw new Error(errors.join('; '));

  const path = resolve(root, 'ai-creator-watchlist-2026.json');
  const watchlist = JSON.parse(await readFile(path, 'utf8'));
  const channels = Array.isArray(watchlist.channels) ? watchlist.channels : [];
  const normalizedName = input.name.trim().toLowerCase();
  const normalizedUrl = input.url.trim().replace(/\/$/, '').toLowerCase();
  if (channels.some((channel) => channel.name?.trim().toLowerCase() === normalizedName || channel.url?.trim().replace(/\/$/, '').toLowerCase() === normalizedUrl)) {
    throw new Error('source channel already exists');
  }

  const channel = {
    name: input.name.trim(),
    kind: input.kind,
    status: input.status,
    priority: input.priority,
    focus: input.focus.map((item) => item.trim()).filter(Boolean),
    url: input.url.trim(),
    why: input.why.trim(),
    seed_links: (input.seed_links ?? []).map((item) => item.trim()),
    last_seen_at: shanghaiDate(),
  };
  const next = { ...watchlist, updated_at: new Date().toISOString(), channels: [...channels, channel] };
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, path);
  return channel;
}

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const translations = JSON.parse(await readFile(resolve(root, 'data/ai-event-translations-zh.json'), 'utf8'));
const targets = ['data/main/index.json', 'data/dev/ai-events-latest.json'];

for (const target of targets) {
  const path = resolve(root, target);
  const payload = JSON.parse(await readFile(path, 'utf8'));
  let changed = 0;
  payload.aiEvents = (payload.aiEvents ?? []).map((event) => {
    const translation = translations[event.id];
    if (!translation) return event;
    changed += 1;
    return { ...event, ...translation };
  });
  await writeFile(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`${target}: localized ${changed} AI events`);
}

import { preparePromotion, writePromotion } from './promotion.mjs';

const shouldWrite = process.argv.includes('--write');
const allowWarnings = process.argv.includes('--allow-warnings');
const prepared = await preparePromotion();

console.log(`Promotion preview: ${prepared.snapshot?.projects.length ?? 0} projects, ${prepared.snapshot?.aiEvents.length ?? 0} AI events, ${prepared.snapshot?.skills.length ?? 0} ranked skills, ${prepared.papersCatalog?.papers?.length ?? 0} cataloged papers, ${prepared.snapshot?.reports.length ?? 0} reports.`);
prepared.warnings.forEach((warning) => console.warn(`Warning: ${warning}`));
if (prepared.errors.length) {
  prepared.errors.forEach((error) => console.error(`Error: ${error}`));
  process.exit(1);
}
if (shouldWrite && prepared.warnings.length && !allowWarnings) {
  console.error('Promotion stopped because warnings require --allow-warnings.');
  process.exit(2);
}
if (!shouldWrite) {
  console.log('Preflight only. Use --write after review.');
  process.exit(0);
}

const manifest = await writePromotion(prepared);
console.log(`Published main snapshot at ${manifest.publishedAt}. Backup: ${manifest.backupPath}`);

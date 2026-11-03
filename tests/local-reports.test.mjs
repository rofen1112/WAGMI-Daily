import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadLocalReports, readLocalReport, resolveLocalReportFile, validateLocalReportManifest } from '../scripts/local-reports.mjs';

const report = {
  id: 'sample-project-2026-07-21',
  projectRepo: 'owner/project',
  title: 'Sample report',
  date: '2026-07-21',
  format: 'html',
  file: 'html/sample-project-2026-07-21.html',
  status: 'draft',
  author: 'Ark AI',
  summary: 'A local report fixture.',
};

test('local report manifest validates required fields and rejects path traversal', () => {
  assert.deepEqual(validateLocalReportManifest({ schemaVersion: '1.0.0', updatedAt: '2026-07-21', reports: [report] }), []);
  assert.throws(() => resolveLocalReportFile('C:/workspace', '../outside.html'), /must stay inside/);
  const errors = validateLocalReportManifest({ schemaVersion: '1.0.0', updatedAt: '2026-07-21', reports: [{ ...report, file: '../outside.html' }] });
  assert.ok(errors.some((error) => error.includes('must stay inside')));
});

test('local report loader exposes metadata without leaking the private file path', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'ark-local-report-'));
  t.after(async () => {
    const { rm } = await import('node:fs/promises');
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(join(root, 'data/local-reports/html'), { recursive: true });
  await writeFile(join(root, 'data/local-reports/index.json'), JSON.stringify({ schemaVersion: '1.0.0', updatedAt: '2026-07-21', reports: [report] }));
  await writeFile(join(root, 'data/local-reports/html/sample-project-2026-07-21.html'), '<!doctype html><meta charset="utf-8"><title>中文报告</title>');

  const reports = await loadLocalReports(root);
  assert.equal(reports.length, 1);
  assert.equal(reports[0].path, '/__admin/reports/sample-project-2026-07-21');
  assert.equal('file' in reports[0], false);

  const content = await readLocalReport(root, report.id);
  assert.match(content.html, /中文报告/);
  assert.equal(await readLocalReport(root, '../outside'), null);
});

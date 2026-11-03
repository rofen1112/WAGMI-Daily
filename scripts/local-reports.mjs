import { readFile, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';

const reportRootSegment = 'data/local-reports';
const validStatuses = new Set(['draft', 'final', 'archived']);
const reportIdPattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const repoPattern = /^[^/\s]+\/[^/\s]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function localReportRoot(root) {
  return resolve(root, reportRootSegment);
}

export function resolveLocalReportFile(root, file) {
  if (typeof file !== 'string' || !file.trim() || isAbsolute(file)) {
    throw new Error('local report file must be a relative path');
  }

  const base = localReportRoot(root);
  const target = resolve(base, file);
  const relativePath = relative(base, target);
  if (!relativePath || relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error('local report file must stay inside data/local-reports');
  }
  if (!target.toLowerCase().endsWith('.html')) {
    throw new Error('local report file must use the .html extension');
  }
  return target;
}

export function validateLocalReportManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return ['local report manifest must be an object'];
  }
  if (manifest.schemaVersion !== '1.0.0') errors.push('schemaVersion must be 1.0.0');
  if (!datePattern.test(manifest.updatedAt ?? '')) errors.push('updatedAt must use YYYY-MM-DD');
  if (!Array.isArray(manifest.reports)) return [...errors, 'reports must be an array'];

  const ids = new Set();
  manifest.reports.forEach((report, index) => {
    const prefix = `reports[${index}]`;
    if (!report || typeof report !== 'object' || Array.isArray(report)) {
      errors.push(`${prefix} must be an object`);
      return;
    }
    if (!reportIdPattern.test(report.id ?? '')) errors.push(`${prefix}.id is invalid`);
    if (ids.has(report.id)) errors.push(`${prefix}.id must be unique`);
    ids.add(report.id);
    if (!repoPattern.test(report.projectRepo ?? '')) errors.push(`${prefix}.projectRepo must use owner/repo`);
    if (typeof report.title !== 'string' || !report.title.trim()) errors.push(`${prefix}.title is required`);
    if (!datePattern.test(report.date ?? '')) errors.push(`${prefix}.date must use YYYY-MM-DD`);
    if (report.format !== 'html') errors.push(`${prefix}.format must be html`);
    if (!validStatuses.has(report.status)) errors.push(`${prefix}.status is invalid`);
    if (typeof report.author !== 'string' || !report.author.trim()) errors.push(`${prefix}.author is required`);
    if (typeof report.summary !== 'string' || !report.summary.trim()) errors.push(`${prefix}.summary is required`);
    try {
      resolveLocalReportFile('.', report.file);
    } catch (error) {
      errors.push(`${prefix}.file: ${error instanceof Error ? error.message : 'invalid path'}`);
    }
  });
  return errors;
}

async function readManifest(root) {
  const path = resolve(localReportRoot(root), 'index.json');
  let manifest;
  try {
    manifest = JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
  const errors = validateLocalReportManifest(manifest);
  if (errors.length) throw new Error(`Invalid local report manifest: ${errors.join('; ')}`);
  return manifest;
}

function toClientReport(report) {
  return {
    id: report.id,
    projectRepo: report.projectRepo,
    title: report.title,
    date: report.date,
    format: report.format,
    status: report.status,
    author: report.author,
    summary: report.summary,
    path: `/__admin/reports/${encodeURIComponent(report.id)}`,
  };
}

export async function loadLocalReports(root, options = {}) {
  const manifest = await readManifest(root);
  if (!manifest) return [];
  const verifyFiles = options.verifyFiles !== false;
  if (verifyFiles) {
    await Promise.all(manifest.reports.map(async (report) => {
      const filePath = resolveLocalReportFile(root, report.file);
      const fileStats = await stat(filePath);
      if (!fileStats.isFile()) throw new Error(`Local report is not a file: ${report.file}`);
    }));
  }
  return manifest.reports
    .map(toClientReport)
    .sort((left, right) => right.date.localeCompare(left.date));
}

export async function readLocalReport(root, id) {
  if (!reportIdPattern.test(id ?? '')) return null;
  const manifest = await readManifest(root);
  if (!manifest) return null;
  const report = manifest.reports.find((item) => item.id === id);
  if (!report) return null;
  const filePath = resolveLocalReportFile(root, report.file);
  return {
    report: toClientReport(report),
    html: await readFile(filePath, 'utf8'),
  };
}

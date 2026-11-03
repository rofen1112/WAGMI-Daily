import test from 'node:test';
import assert from 'node:assert/strict';
import { bindProjectsToReport } from '../scripts/github-report-binding.mjs';

test('bindProjectsToReport updates every project without mutating the input', () => {
  const projects = [
    { id: 'one', sourceReportId: 'github-2026-08-23' },
    { id: 'two' },
  ];

  const result = bindProjectsToReport(projects, 'github-2026-08-24');

  assert.deepEqual(result.map((project) => project.sourceReportId), [
    'github-2026-08-24',
    'github-2026-08-24',
  ]);
  assert.equal(projects[0].sourceReportId, 'github-2026-08-23');
  assert.equal(projects[1].sourceReportId, undefined);
});

test('bindProjectsToReport rejects a missing report id', () => {
  assert.throws(() => bindProjectsToReport([], ''), /report id is required/i);
});

test('bindProjectsToReport keeps the latest canonical row for redirected or duplicated repositories', () => {
  const projects = [
    { id: 'housecrafter', repo: 'neu-vi/houseCrafter', marker: 'old-owner' },
    { id: 'housecrafter', repo: 'neu-3dvi/houseCrafter', marker: 'canonical' },
    { id: 'housecrafter', repo: 'neu-3dvi/houseCrafter', marker: 'latest-check' },
    { id: 'other-id', repo: 'neu-3dvi/houseCrafter', marker: 'latest-repo-check' },
  ];

  const result = bindProjectsToReport(projects, 'github-2026-08-28');

  assert.deepEqual(result, [{
    id: 'other-id',
    repo: 'neu-3dvi/houseCrafter',
    marker: 'latest-repo-check',
    sourceReportId: 'github-2026-08-28',
  }]);
});

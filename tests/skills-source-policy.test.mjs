import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateSkillsPublication } from '../scripts/skills-source-policy.mjs';
import { historicalSkillsFixture } from './fixtures/skills-source-policy.mjs';

test('historical identity notices permit verified current content without erasing warnings', () => {
  const { skillsLatest, skillsReview } = historicalSkillsFixture();
  const before = structuredClone(skillsLatest);
  const result = evaluateSkillsPublication(skillsLatest, skillsReview);
  assert.equal(result.ready, true);
  assert.equal(result.notices.length, 1);
  assert.deepEqual(result.blockers, []);
  assert.deepEqual(skillsLatest, before);
});

test('current source failures, unknown warnings and failed runs still block publication', () => {
  const mutations = [
    latest => { latest.sourceStatus.find(source => source.id === 'skills-sh-hot').status = 'failed'; },
    latest => { latest.sourceStatus.find(source => source.id === 'skills-sh-trending').count = 0; },
    latest => { latest.sourceStatus = latest.sourceStatus.filter(source => source.id !== 'skills-sh-official'); },
    latest => { latest.sourceStatus.push({ id: 'new-source', status: 'warning' }); },
    latest => { latest.run.status = 'failed'; },
    latest => { latest.run.warnings.push('An unrelated current failure'); },
    latest => { latest.run.message = 'An unrelated current failure'; },
    latest => { latest.sourceStatus.at(-1).status = 'failed'; },
    latest => { latest.sourceStatus.find(source => source.id === 'skills-sh-detail').failed = 1; },
  ];
  for (const mutate of mutations) {
    const { skillsLatest, skillsReview } = historicalSkillsFixture();
    mutate(skillsLatest);
    assert.equal(evaluateSkillsPublication(skillsLatest, skillsReview).ready, false, mutate.toString());
  }
});

test('historical exceptions require current consistent evidence and a disjoint verified shortlist', () => {
  const mutations = [
    fixture => { fixture.skillsReview = null; },
    fixture => { fixture.skillsReview.asOf = '2026-10-25'; },
    fixture => { fixture.skillsReview.summary.unable_to_confirm = 2; },
    fixture => { fixture.skillsLatest.sourceStatus.at(-1).unresolved = 2; },
    fixture => { fixture.skillsReview.items[0].lastSeenAt = '2026-10-26T00:00:00Z'; },
    fixture => { fixture.skillsReview.items[0].lastSeenAt = '2026-10-25T23:00:00Z'; },
    fixture => { fixture.skillsLatest.skills[0].id = fixture.skillsReview.items[0].id.toUpperCase(); },
    fixture => { fixture.skillsLatest.skills[0].metadataStatus = 'failed'; },
    fixture => { fixture.skillsLatest.skills[0].availabilityStatus = 'needs_review'; },
    fixture => { fixture.skillsLatest.skills[0].date = '2026-10-25'; },
  ];
  for (const mutate of mutations) {
    const fixture = historicalSkillsFixture();
    mutate(fixture);
    assert.equal(evaluateSkillsPublication(fixture.skillsLatest, fixture.skillsReview).ready, false, mutate.toString());
  }
});

test('repository maintenance failures require dated complete evidence outside the current shortlist', () => {
  const fixture = () => {
    const f = historicalSkillsFixture();
    f.skillsLatest.sourceStatus.push({ id: 'github-review-repositories', status: 'warning', count: 1,
      unavailable: 1, evidence: `skills-review-verification-${f.skillsLatest.asOf}.json` });
    f.skillsReview.uniqueRepositoriesChecked = 1;
    f.skillsReview.items[0].evidence = { repositoryUrl: 'https://github.com/owner/repo',
      repositoryStatus: 403, repositoryCheckedAt: '2026-10-26T01:00:00Z' };
    return f;
  };
  let f = fixture();
  const before = structuredClone(f);
  assert.equal(evaluateSkillsPublication(f.skillsLatest, f.skillsReview).ready, true);
  assert.deepEqual(f, before);
  f.skillsLatest.sourceStatus.at(-1).message = 'Historical repository access returned HTTP 403';
  f.skillsLatest.run.warnings.push(f.skillsLatest.sourceStatus.at(-1).message);
  f.skillsLatest.run.message = f.skillsLatest.run.warnings.join('；');
  assert.equal(evaluateSkillsPublication(f.skillsLatest, f.skillsReview).ready, true);
  f.skillsLatest.run.warnings.push('Unknown current collection failure');
  f.skillsLatest.run.message = f.skillsLatest.run.warnings.join('；');
  assert.equal(evaluateSkillsPublication(f.skillsLatest, f.skillsReview).ready, false);
  for (const mutate of [
    f => { f.skillsReview.items[0].lastSeenAt = '2026-10-26T00:00:00Z'; },
    f => { f.skillsLatest.skills[0].id = f.skillsReview.items[0].id; },
    f => { f.skillsReview.items[0].evidence.repositoryCheckedAt = '2026-10-25T01:00:00Z'; },
    f => { f.skillsLatest.sourceStatus.at(-1).unavailable = 2; },
    f => { f.skillsLatest.sourceStatus.at(-1).evidence = 'old-review.json'; },
    f => { f.skillsLatest.sourceStatus.find(s => s.id === 'skills-sh-detail').failed = 1; },
  ]) {
    f = fixture(); mutate(f);
    assert.equal(evaluateSkillsPublication(f.skillsLatest, f.skillsReview).ready, false, mutate.toString());
  }
});

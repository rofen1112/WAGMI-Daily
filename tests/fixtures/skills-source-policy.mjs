export function reviewedAiFixture(date) {
  return { asOf: date, run: { status: 'success' }, aiEvents: [], sourceCoverage: {
    policy: 'independent-sources-v1', asOf: date, ready: true,
    verifiedSourceCount: 1, acceptedEvents: 0, noNewEvents: true,
  } };
}

export function historicalSkillsFixture(date = '2026-10-26') {
  const message = 'Historical identities remain unresolved; preserve the review warning.';
  return {
    skillsLatest: {
      asOf: date,
      run: { status: 'warning', message, warnings: [message] },
      skills: [{ id: 'owner/repo/current', date, metadataStatus: 'success', availabilityStatus: 'active' }],
      sourceStatus: [
        ...['trending', 'hot', 'catalog', 'official'].map(name => ({ id: `skills-sh-${name}`, status: 'success', count: 200 })),
        { id: 'skills-sh-detail', status: 'success', count: 1, failed: 0 },
        { id: 'skills-review-source-identities', status: 'warning', count: 1, unresolved: 1, message },
      ],
    },
    skillsReview: {
      asOf: date,
      summary: { unable_to_confirm: 1 },
      items: [{ id: 'owner/repo/old', classification: 'unable_to_confirm', lastSeenAt: '2026-10-23T00:00:00Z' }],
    },
  };
}

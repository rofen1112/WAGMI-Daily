import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeHistoricalEvents, parseDateRange, parseHistoricalReport } from '../scripts/history.mjs';

const report = {
  id: 'ai-2026-06',
  title: 'June archive',
  date: '2026-06-30',
  channel: 'ai',
  format: 'markdown',
  path: '/reports/ai-events-2026-06.md',
};

test('historical date ranges support days, ranges, and full months', () => {
  assert.deepEqual(parseDateRange('2026-06-19'), { dateStart: '2026-06-19', dateEnd: '2026-06-19', periodLabel: '2026-06-19' });
  assert.deepEqual(parseDateRange('2026-06-02 to 2026-06-16'), { dateStart: '2026-06-02', dateEnd: '2026-06-16', periodLabel: '2026-06-02 to 2026-06-16' });
  assert.deepEqual(parseDateRange('2026-06'), { dateStart: '2026-06-01', dateEnd: '2026-06-30', periodLabel: '2026-06' });
});

test('historical report parser preserves report provenance and intake candidates', () => {
  const markdown = `# Report\n\n## Top Events\n\n### 1. Example Agent launch\n\n- Date: 2026-06-02 to 2026-06-16\n- Boards: AI Agent, AI Coding\n- Sources:\n  - https://openai.com/example\n- Why it matters:\n  - A material workflow change.\n- GitHub / project intake:\n  - \`owner/repo\`\n- Action:\n  - Verify the official repository.\n\n## Next Actions\n`;
  const [event] = parseHistoricalReport(markdown, report);
  assert.equal(event.sourceReportId, report.id);
  assert.equal(event.archived, true);
  assert.deepEqual(event.boards, ['AI Agent', 'AI 编程']);
  assert.deepEqual(event.repoCandidates, ['owner/repo']);
  assert.equal(event.sources[0].label, 'OpenAI');
});

test('historical event merge is repeatable', () => {
  const event = { id: 'archive-1', date: '2026-06-01', archived: true, sourceReportId: report.id };
  const snapshot = { aiEvents: [event, { id: 'current', date: '2026-07-01' }] };
  const once = mergeHistoricalEvents(snapshot, [event], [report.id]);
  const twice = mergeHistoricalEvents(once, [event], [report.id]);
  assert.deepEqual(twice.aiEvents, once.aiEvents);
});

test('historical board inference does not treat real-world benchmarks as world models', () => {
  const julyReport = { ...report, id: 'ai-2026-07-09' };
  const markdown = `# Report\n\n## Events\n\n### 1. Kotlin benchmark for coding agents\n\n- Date: 2026-07-08\n- Companies / products / authors: JetBrains\n- Source links:\n  - https://blog.jetbrains.com/example\n- Summary:\n  - Evaluates agents on real-world Kotlin tasks.\n- Impact judgment:\n  - High.\n`;
  const [event] = parseHistoricalReport(markdown, julyReport);
  assert.deepEqual(event.boards, ['AI Agent', 'AI 编程']);
});

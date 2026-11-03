import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildDigest, isDingtalkSuppressed } from './send-dingtalk-digest.mjs';
import { evaluateSkillsPublication } from './skills-source-policy.mjs';
import { publicationContentHash } from './publication.mjs';

const date = '2026-11-02';
const read = async (path, fallback) => {
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT' && fallback !== undefined) return fallback; throw error; }
};
const [ai, github, skills, skillReview, discovery, gate, publication, main, control, sent, progress] = await Promise.all([
  'ai-events-latest', 'github-radar-latest', 'skills-radar-latest',
  `skills-review-verification-${date}`, `ai-discovery-audit-${date}`, 'main-publish-run',
  'publication-run',
].map(name => read(`data/dev/${name}.json`)).concat([
  read('data/main/index.json'), read('data/dev/dingtalk-send-control.json', {}),
  read('data/dev/dingtalk-last-send.json', {}), read(`data/dev/wagmi-publication-progress-${date}.json`, {}),
]));
const skillPolicy = evaluateSkillsPublication(skills, skillReview);
const channels = Object.fromEntries(Object.entries({ ai, github, skills }).map(([name, data]) => [name, {
  asOf: data.asOf, schedule: data.run.schedule, status: data.run.status,
  ...(name === 'skills' ? { publicationReady: skillPolicy.ready, notices: skillPolicy.notices } : {}),
}]));
const current = Object.values(channels).every(channel => channel.asOf === date);
const mainHash = publicationContentHash(main);
const currentPublicReady = current && Object.values(main.asOf).every(value => value === date)
  && publication.localReady === true && publication.publicReady === true
  && publication.generatedAt === main.generatedAt && publication.public?.contentHashes?.main === mainHash;
const suppressed = isDingtalkSuppressed(control, date);
const delivered = sent.date === date && sent.response?.errcode === 0;
const complete = currentPublicReady && gate.date === date && gate.ready === true
  && discovery.ready === true && skillPolicy.ready && (delivered || suppressed);
const digest = buildDigest({ date, aiLatest: ai, githubLatest: github, skillsLatest: skills,
  skillsReview: skillReview, discoveryReview: discovery, main, publicUrl: 'https://wagmii.cn' });
const digestHash = createHash('sha256').update(digest.text).digest('hex');
const digestMatchesReceipt = delivered && digestHash === sent.digestHash;
const audit = {
  batchId: `wagmi:${date}`, runDate: date, checkedAt: new Date().toISOString(),
  status: complete ? (suppressed ? 'complete-user-suppressed' : 'complete') : 'incomplete',
  channels, discovery: { ready: discovery.ready, counts: discovery.counts, notices: discovery.notices },
  gate, publication, currentDayPublicReady: currentPublicReady,
  counts: Object.fromEntries(['projects', 'aiEvents', 'skills', 'reports', 'weeklySummaries'].map(key => [key, main[key]?.length ?? 0])),
  generatedAt: main.generatedAt, mainHash,
  dingtalk: { delivered, suppressed, date: sent.date, sentAt: sent.sentAt,
    response: sent.response, digestHash: sent.digestHash,
    sameDayHistory: (sent.history ?? []).filter(item => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date(item.sentAt)) === date).length,
    currentDigestMatchesReceipt: digestMatchesReceipt,
  },
  digestReference: { path: `wagmi-dingtalk-digest-${date}.md`, sha256: digestHash,
    meaning: digestMatchesReceipt ? 'Exact text matching the successful receipt hash.' : 'Current website digest reference; not a reconstruction of an earlier sent payload.' },
  serverRepair: progress.serverRepair, githubEvidence: progress.githubEvidence,
  paperDateCorrections: progress.paperDateCorrections, paperSelectionRepair: progress.paperSelectionRepair,
  publicReportsAndBoundary: await read(`data/dev/wagmi-public-reports-boundary-${date}.json`, null),
  regression: progress.regression,
};
await writeFile(`data/dev/wagmi-publication-audit-${date}.json`, JSON.stringify(audit, null, 2) + '\n');
await writeFile(`data/dev/wagmi-public-verification-${date}.json`, JSON.stringify(publication, null, 2) + '\n');
await writeFile(`data/dev/wagmi-dingtalk-digest-${date}.md`, digest.text);
console.log(JSON.stringify({ status: audit.status, channels, currentDayPublicReady: currentPublicReady,
  generatedAt: main.generatedAt, dingtalk: audit.dingtalk, counts: audit.counts }));
if (!complete) process.exitCode = 2;

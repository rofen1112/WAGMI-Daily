import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { evaluateSkillsPublication } from './skills-source-policy.mjs';
import './network-fetch.mjs';

const date = '2026-10-30', batchId = `ark-insight-12-00:${date}`;
const base = `data/dev/source-archives/audit-1200-${date}`;
const json = async p => JSON.parse(await readFile(p, 'utf8'));
const [publication, gate, discovery, skills, skillsReview, ai, papers, sourceChecks, main, sc, pc] = await Promise.all([
  'data/dev/publication-run.json', 'data/dev/main-publish-run.json', `data/dev/ai-discovery-audit-${date}.json`,
  'data/dev/skills-radar-latest.json', `data/dev/skills-review-verification-${date}.json`, 'data/dev/ai-events-latest.json',
  'data/dev/ai-papers-latest.json', `${base}/source-checks.json`, 'data/main/index.json',
  'data/main/skills-catalog.json', 'data/main/papers-catalog.json'].map(json));
const policy = evaluateSkillsPublication(skills, skillsReview);
if (publication.status !== 'success' || publication.stage !== 'complete' || !publication.localReady || !publication.publicReady
  || Object.values(publication.asOf).some(v => v !== date)) throw Error('Full current public verification required');
if (!gate.ready || gate.action !== 'noop' || gate.currentFingerprint !== gate.previewFingerprint || !discovery.ready || !policy.ready
  || papers.asOf !== date || papers.run.status !== 'success') throw Error('Current daily gate incomplete');
const sha = data => createHash('sha256').update(data).digest('hex');
const reportChecks = await Promise.all(['ai-events', 'ai-discovery-audit'].flatMap(prefix =>
  ['http://127.0.0.1:8080', 'https://wagmii.cn'].map(async origin => {
    const path = `/reports/${prefix}-${date}.md`, checkedAt = new Date().toISOString();
    const response = await fetch(origin + path, { signal: AbortSignal.timeout(25000), headers: { 'cache-control': 'no-cache' } });
    const body = Buffer.from(await response.arrayBuffer());
    const expected = sha(await readFile('public' + path));
    const result = { url: origin + path, checkedAt, httpStatus: response.status, sha256: sha(body), expected, matches: sha(body) === expected };
    if (!response.ok || !result.matches) throw Error('Report mismatch: ' + JSON.stringify(result));
    return result;
  })));
const tunnelResponse = await fetch('http://127.0.0.1:20246/ready', { signal: AbortSignal.timeout(5000) });
const tunnel = { checkedAt: new Date().toISOString(), httpStatus: tunnelResponse.status, body: await tunnelResponse.json() };
const publicMain = await readFile('data/main/index.json', 'utf8');
if (/https?:\/\/(?:[^/"\s]+\.)?(?:memene\.cn|memenews\.cn)(?:\/|["\s])/i.test(publicMain)) throw Error('Internal source exposed in public main');
const [control, send] = await Promise.all(['data/dev/dingtalk-send-control.json', 'data/dev/dingtalk-last-send.json'].map(json));
const suppressed = control.suppressedDates.some(d => (typeof d === 'string' ? d : d.date) === date);
const alreadySent = send.date === date && send.response?.errcode === 0;
if (!suppressed && !alreadySent) throw Error('DELIVERY_REQUIRED: public verified, current day not yet sent');
const completedAt = new Date().toISOString();
const counts = { dailyAiEvents: ai.aiEvents.length, projects: main.projects.length, aiEvents: main.aiEvents.length,
  skills: main.skills.length, reports: main.reports.length, skillCatalog: sc.skills.length, papers: pc.papers.length };
const receipt = { schemaVersion: '1.0.0', batchId, runDate: date, startedAt: '2026-10-30T03:58:59.486Z', completedAt,
  status: alreadySent ? 'complete' : 'complete-with-user-suppression', channels: gate.channels,
  discovery: { ready: discovery.ready, counts: discovery.counts, notices: discovery.notices,
    allDecisionsUnchanged: sourceChecks.allDecisionsUnchanged, currentJuyaSections: 33,
    prioritySources: sourceChecks.results.map(r => ({ url: r.url, checkedAt: r.checkedAt, httpStatus: r.httpStatus, newLinks: r.newLinks })) },
  skills: { policy, unresolvedHistorical: skillsReview.summary.unable_to_confirm, sourceStatus: skills.sourceStatus },
  publication, reports: reportChecks, tunnel, counts,
  validation: { dev: 'passed', dailyGate: 'passed-noop', fingerprint: gate.currentFingerprint,
    focusedRegression: { passed: 23, failed: 0 }, buildAndTypecheck: 'passed', internalMemenePublicUrls: 0 },
  repairs: [{ stage: 'static-report', finding: 'dist report paper order differed from current reconciled public report',
    action: 'publication:deploy rebuilt validated main and report mirrors', result: 'Full publication verification and both report hashes match' }],
  dingtalk: { suppressed, alreadySent, action: alreadySent ? 'skipped-duplicate' : 'suppressed', date: send.date,
    sentAt: send.sentAt, response: send.response, commandInvoked: false },
  sourceArchive: base, boundaries: { publicUrl: 'https://wagmii.cn', hostingMode: 'local', dnsOrCloudChanges: false,
    newTunnel: false, sites: false, credentialsPrinted: false, otherProcessesStopped: false } };
await writeFile(`data/dev/ark-insight-12-00-audit-${date}.json`, JSON.stringify(receipt, null, 2) + '\n');
const localTime = new Date(completedAt).toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' });
await appendFile('C:/Users/Administrator/.codex/automations/ark-insight-12-00/memory.md',
  `\n\n## ${date} 12:00 兜底核验\n\n- 独立批次${batchId}；已读AGENTS、运行手册、LOCAL_SERVER与四框架。初始本机8080 current，无需恢复服务。\n- 独立刷新Memene当日168500292873093120/22候选和全部9中文入口/104候选。126个内容指纹与同日原决定全部一致，保留真实checkedAt；橘鸦当期33节决定齐全。4个重点官方入口HTTP200，较09:00归档无新增链接；不刷新事实证据时间。来源受限、镜像延迟、未确认线索与8项中文未找到记录保留。\n- select-daily-paper-events、ai:reconcile、ai:discovery:check完成，46事件（43行业/3摘要论文）、46独立事实来源，38中文入口。四通道均${date}；AI/GitHub/论文success。Skill77历史身份warning按统一策略为notice，当前5来源/30详情通过，无active交集，未删历史或弱化检查。\n- data:validate-dev与严格门禁通过，main noop，fingerprint ${gate.currentFingerprint}。23项发现/公开来源/Skill策略回归通过。发现静态日报论文排序与当前报告不同，publication:deploy构建/typecheck成功修复。\n- publication:verify success/complete，localReady=true/publicReady=true，generatedAt=${main.generatedAt}；主数据及Skill/论文目录完整哈希/计数一致。两份报告本机与公网4次GET均200且SHA256一致；隧道readyHTTP${tunnel.httpStatus}。计数${JSON.stringify(counts)}。\n- 公网核验后读禁发与成功记录：suppressed=${suppressed}；当天已有errcode=0，sentAt=${send.sentAt}。本轮0次notify:dingtalk，未修改发送成功记录。未操作DNS/CloudBase/新隧道/云资源/Sites/其他进程。\n- 收据data/dev/ark-insight-12-00-audit-${date}.json，归档${base}。当前运行完成UTC ${completedAt}，上海${localTime}+08:00。\n`);
console.log(JSON.stringify({ status: receipt.status, completedAt, channels: receipt.channels, localReady: publication.localReady,
  publicReady: publication.publicReady, counts, dingtalk: receipt.dingtalk, reportChecks, tunnel }, null, 2));

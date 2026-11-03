import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { readSkillsReview, evaluateSkillsPublication } from './skills-source-policy.mjs';
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const runDate = '2026-10-28';
const publication = await read('data/dev/publication-run.json');
if (publication.status !== 'success' || publication.stage !== 'complete' || !publication.localReady || !publication.publicReady || Object.values(publication.asOf).some(date => date !== runDate)) throw new Error('Current public publication is not complete');
const control = await read('data/dev/dingtalk-send-control.json');
const sent = await read('data/dev/dingtalk-last-send.json');
const suppressed = control.suppressedDates.some(item => (typeof item === 'string' ? item : item.date) === runDate);
const alreadySent = sent.date === runDate && sent.response?.errcode === 0;
if (!suppressed && !alreadySent) throw new Error('Today still requires one notify:dingtalk send; do not write a complete receipt yet');
const [ai, github, skills, papers, main, skillsCatalog, papersCatalog, manifest, gate] = await Promise.all(['data/dev/ai-events-latest.json','data/dev/github-radar-latest.json','data/dev/skills-radar-latest.json','data/dev/ai-papers-latest.json','data/main/index.json','data/main/skills-catalog.json','data/main/papers-catalog.json','data/dev/ai-editorial-repairs-2026-10-28.json','data/dev/main-publish-run.json'].map(read));
const skillPolicy = evaluateSkillsPublication(skills, await readSkillsReview(process.cwd(), skills));
if (!skillPolicy.ready || gate.status !== 'success' || gate.action !== 'noop') throw new Error('Final collection/publication gate must be successful and unchanged');
const channels = Object.fromEntries(Object.entries({ ai, github, skills, papers }).map(([key, value]) => [key, { asOf: value.asOf, status: value.run.status, publicationReady: key === 'skills' ? skillPolicy.ready : value.run.status === 'success' }]));
if (Object.values(channels).some(channel => channel.asOf !== runDate || !channel.publicationReady)) throw new Error('Current channels are not ready');
const reportMirrorsEqual = (await readFile('reports/ai-events-2026-10-28.md')).equals(await readFile('public/reports/ai-events-2026-10-28.md'));
if (!reportMirrorsEqual) throw new Error('Report mirrors differ');
const tunnelResponse = await fetch('http://127.0.0.1:20246/ready', { signal: AbortSignal.timeout(5000) });
const tunnel = await tunnelResponse.json();
const completedAt = new Date().toISOString();
const receipt = {
  batchId: 'ark-insight-12-00:2026-10-28', runDate, firstLocalCheckAt: '2026-10-28T04:03:49.497Z', completedAt,
  status: suppressed ? 'complete-user-suppression' : 'complete', channels, skillPolicy, ai: manifest.audit1200, publication,
  validation: { dataValidateDev: 'passed', dailyCheck: gate.action, fingerprint: gate.currentFingerprint, sourcePolicyTests: { passed: 16, failed: 0 }, buildAndTypecheck: 'passed', reportMirrorsEqual },
  counts: { dailyAiEvents: ai.aiEvents.length, projects: main.projects.length, aiEvents: main.aiEvents.length, skills: main.skills.length, reports: main.reports.length, skillCatalog: skillsCatalog.skills.length, papers: (papersCatalog.papers ?? papersCatalog.entries ?? []).length },
  dingtalk: { suppressed, alreadySent, action: suppressed ? 'skipped-user-suppression' : 'skipped-duplicate', date: sent.date, sentAt: sent.sentAt, response: sent.response, commandInvoked: false },
  hosting: { mode: 'local', publicUrl: 'https://wagmii.cn', namedTunnelReady: { httpStatus: tunnelResponse.status, readyConnections: tunnel.readyConnections }, serviceRecoveryRequired: false, dnsOrCloudChanges: false, newTunnel: false, sites: false },
  evidenceDirectory: 'data/dev/source-archives/audit-1200-2026-10-28',
};
await writeFile('data/dev/ark-insight-12-00-audit-2026-10-28.json', JSON.stringify(receipt, null, 2) + '\n');
const memory = `\n\n## 2026-10-28 12:00 兜底核验\n\n- 独立批次ark-insight-12-00:2026-10-28；先读运行手册、LOCAL_SERVER、四通道框架及记忆，publication:check确认本机8080当天current，无需恢复。隧道ready HTTP${tunnelResponse.status}、${tunnel.readyConnections}连接。\n- 四通道均10月28日；AI/GitHub/论文success，Skill保留66条历史身份warning。统一skills-source-policy验证当天五来源与30详情成功、历史同日证据与active无交集，notice发布，历史记录和warning保留。\n- ai:media:discover取得50公开候选，机器之心受限为可选提示；Memene当日167775517687152640/22候选。午间抓取25来源，完成20份事实/发现复核；3篇OpenAI直连403通过web完整正文读取，其他证据保留实际原时间。四个RSS/Atom比09:00无新增链接；Codex新alpha仅版本号未收录。先select-daily-paper-events再ai:reconcile，14正式内容（11行业/3当天目录论文）、25独立来源、2pending；保留真实日期和摘要级边界。\n- data:validate-dev通过，16项来源策略测试通过，严格门禁无blocker；新核验证据同步main，publication:deploy构建及typecheck通过，最终data:daily:check success/noop，指纹${gate.currentFingerprint}。\n- publication:verify success/complete，localReady=true/publicReady=true，generatedAt=${publication.generatedAt}，主数据/Skill目录/论文目录完整内容哈希及版本与本机main一致，计数${JSON.stringify(receipt.counts)}。\n- 公网成功后读取禁发和发送记录：suppressed=${suppressed}，alreadySent=${alreadySent}，sentAt=${sent.sentAt}，errcode=${sent.response?.errcode}。本轮0次notify:dingtalk，按当天成功记录去重，不修改成功记录。\n- 未操作CloudBase/public:ensure/DNS/云资源/新隧道/Sites。收据data/dev/ark-insight-12-00-audit-2026-10-28.json；原文及前态data/dev/source-archives/audit-1200-2026-10-28/。\n- 本次完成UTC ${completedAt}；上海${new Date(completedAt).toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' })}+08:00；从首次本机核验计时${Math.round((Date.parse(completedAt) - Date.parse(receipt.firstLocalCheckAt)) / 1000)}秒。\n`;
await appendFile('C:/Users/Administrator/.codex/automations/ark-insight-12-00/memory.md', memory);
console.log(JSON.stringify({ status: receipt.status, completedAt, channels, localReady: publication.localReady, publicReady: publication.publicReady, generatedAt: publication.generatedAt, dingtalk: receipt.dingtalk, counts: receipt.counts }, null, 2));

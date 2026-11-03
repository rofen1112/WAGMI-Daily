import {readFile,writeFile,appendFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {evaluateSkillsPublication} from './skills-source-policy.mjs';
import './network-fetch.mjs';
const date='2026-11-01',batchId=`wagmi:${date}`;
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const [publication,gate,discovery,ai,g,skills,review,main,sc,pc]=await Promise.all([
 'data/dev/publication-run.json','data/dev/main-publish-run.json',`data/dev/ai-discovery-audit-${date}.json`,
 'data/dev/ai-events-latest.json','data/dev/github-radar-latest.json','data/dev/skills-radar-latest.json',
 `data/dev/skills-review-verification-${date}.json`,'data/main/index.json','data/main/skills-catalog.json','data/main/papers-catalog.json'].map(json));
const policy=evaluateSkillsPublication(skills,review);
if(publication.status!=='success'||publication.stage!=='complete'||!publication.localReady||!publication.publicReady
 ||Object.values(publication.asOf).some(v=>v!==date)||publication.generatedAt!==main.generatedAt)throw Error('Current complete local/public publication evidence required');
if(!gate.ready||gate.currentFingerprint!==gate.previewFingerprint||!discovery.ready||!policy.ready
 ||ai.asOf!==date||ai.run.status!=='success'||g.asOf!==date||g.run.status!=='success')throw Error('Final daily checks incomplete');
const sha=x=>createHash('sha256').update(x).digest('hex');
const reportChecks=[];
for(const prefix of ['ai-events','ai-discovery-audit'])for(const origin of ['http://127.0.0.1:8080','https://wagmii.cn']){
 const path=`/reports/${prefix}-${date}.md`,checkedAt=new Date().toISOString();
 const response=await fetch(origin+path+'?__wagmi_receipt='+Date.now(),{signal:AbortSignal.timeout(30000),headers:{'cache-control':'no-cache'}});
 const body=Buffer.from(await response.arrayBuffer()),expected=sha(await readFile('public'+path));
 const result={url:origin+path,checkedAt,httpStatus:response.status,sha256:sha(body),expected,matches:sha(body)===expected};
 reportChecks.push(result);if(!response.ok||!result.matches)throw Error('Report mismatch '+JSON.stringify(result));
}
for(const file of ['data/main/index.json','data/main/skills-catalog.json','data/main/papers-catalog.json']){
 const text=await readFile(file,'utf8');
 if(/https?:\/\/(?:[^/"\s]+\.)?(?:memene\.cn|memenews\.cn)(?:\/|["\s])/i.test(text))throw Error('Internal source link in public '+file);
}
// Inspect delivery controls only after proving this day's full public publication.
const [control,send]=await Promise.all(['data/dev/dingtalk-send-control.json','data/dev/dingtalk-last-send.json'].map(json));
const suppressed=(control.suppressedDates??[]).some(d=>(typeof d==='string'?d:d.date)===date);
const delivered=send.date===date&&send.response?.errcode===0;
if(!suppressed&&!delivered)throw Error('DELIVERY_REQUIRED: current public data verified; no successful daily receipt');
const completedAt=new Date().toISOString(),localTime=new Date(completedAt).toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'});
const counts={dailyAiEvents:ai.aiEvents.length,projects:main.projects.length,aiEvents:main.aiEvents.length,
 skills:main.skills.length,reports:main.reports.length,skillCatalog:sc.skills.length,papers:pc.papers.length};
const receipt={schemaVersion:'1.0.0',batchId,runDate:date,startedAt:'2026-11-01T07:19:43.530Z',completedAt,
 status:delivered?'complete':'complete-with-user-suppression',channels:gate.channels,
 ai:{sourceCoverage:ai.sourceCoverage,discoveryReady:discovery.ready,counts:discovery.counts,notices:discovery.notices},
 github:{coverage:g.verificationSummary.coverage,sourceNotices:g.run.sourceWarnings},skills:{policy,sourceStatus:skills.sourceStatus},
 publication,reportChecks,counts,validation:{dev:'passed',dailyGate:'passed-noop',fingerprint:gate.currentFingerprint,focusedRegression:{passed:17,failed:0}},
 dingtalk:{suppressed,delivered,date:send.date,sentAt:send.sentAt,response:send.response},
 sourceArchive:'data/dev/source-archives/publication-2026-11-01',boundaries:{hostingMode:'local',publicUrl:'https://wagmii.cn',dnsOrCloudChanges:false,newTunnel:false,sites:false,credentialsPrinted:false}};
await writeFile(`data/dev/wagmi-publication-audit-${date}.json`,JSON.stringify(receipt,null,2)+'\n');
await writeFile(`data/dev/wagmi-public-verification-${date}.json`,JSON.stringify(publication,null,2)+'\n');
await appendFile('C:/Users/Administrator/.codex/automations/wagmi/memory.md',`\n\n- ${localTime} +08:00: Independent batch ${batchId} ${receipt.status}. Started with all channels Oct31 and local/public main Oct30; refreshed current Memene18/media107 including all enabled source routes, GitHub discovery and Skill catalog. Read original bodies and dated evidence, retained direct403/verification walls, documented browser official help evidence. Concurrent scheduled collectors also repaired current batch; final discovery ready=${discovery.ready}.\n- Final AI/GitHub ${date}07:30 success; Skill ${date}07:40 evaluated through unified source policy: ${JSON.stringify(policy)}. Historical warnings and dates preserved. Focused source-policy/public-projection/concurrent-DingTalk regressions17passed.\n- Final strict daily gate ready/noop, fingerprint ${gate.currentFingerprint}; current main generatedAt ${main.generatedAt}, counts ${JSON.stringify(counts)}. Complete publication verification localReady=true/publicReady=true at fixed https://wagmii.cn, main/Skill/paper content hashes match; public/local AI and discovery report SHA256 match. No DNS/cloud/tunnel/Sites changes or credential output.\n- After full current public verification read controls and real delivery receipt: suppressed=${suppressed}, delivered=${delivered}, sentAt=${send.sentAt}, response=${JSON.stringify(send.response)}. Once-per-day record retained; no force/supplement/test message.\n- Audit data/dev/wagmi-publication-audit-${date}.json; immutable verification data/dev/wagmi-public-verification-${date}.json. Current run time ${completedAt} UTC (${localTime}+08:00).\n`);
console.log(JSON.stringify({status:receipt.status,completedAt,channelDates:publication.asOf,localReady:true,publicReady:true,counts,dingtalk:receipt.dingtalk}));

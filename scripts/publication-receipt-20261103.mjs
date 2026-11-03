import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildDigest,isDingtalkSuppressed} from './send-dingtalk-digest.mjs';
import {evaluateSkillsPublication} from './skills-source-policy.mjs';
const date='2026-11-03',read=async p=>JSON.parse(await readFile(p,'utf8'));
const now=new Date().toISOString();
const [ai,github,skills,main,publication,discovery,send,control,gate,skillsReview]=await Promise.all([
 'data/dev/ai-events-latest.json','data/dev/github-radar-latest.json','data/dev/skills-radar-latest.json','data/main/index.json',
 'data/dev/publication-run.json','data/dev/ai-discovery-audit-'+date+'.json','data/dev/dingtalk-last-send.json',
 'data/dev/dingtalk-send-control.json','data/dev/main-publish-run.json','data/dev/skills-review-verification-'+date+'.json'
].map(read));
const channels=Object.fromEntries(Object.entries({ai,github,skills}).map(([name,d])=>[name,{asOf:d.asOf,status:d.run.status,schedule:d.run.schedule}]));
const current=Object.values(channels).every(x=>x.asOf===date)&&Object.values(main.asOf).every(x=>x===date);
const policy=evaluateSkillsPublication(skills,skillsReview);
const delivered=(send.date??send.runDate)===date&&send.response?.errcode===0;
const suppressed=isDingtalkSuppressed(control,date);
const ready=publication.localReady===true&&publication.publicReady===true&&publication.generatedAt===main.generatedAt
 &&Object.values(publication.asOf).every(x=>x===date)&&gate.ready===true&&discovery.ready===true&&policy.ready&&current;
if(!ready)throw Error('Cannot issue completed receipt without current full publication and all strict gates');
const digest=buildDigest({date,aiLatest:ai,githubLatest:github,skillsLatest:skills,skillsReview,discoveryReview:discovery,main,publicUrl:publication.config.publicUrl});
const digestHash=createHash('sha256').update(digest.text).digest('hex');
const sentDay=t=>{try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date(t));}catch{return null;}};
const receipt={batchId:'wagmi:'+date,runDate:date,checkedAt:now,status:delivered?'complete':suppressed?'suppressed':'published-undelivered',complete:delivered,channels,
 sourceReview:{ready:discovery.ready,counts:discovery.counts,notices:discovery.notices},skillsPolicy:policy,
 counts:Object.fromEntries(['projects','aiEvents','skills','reports','weeklySummaries'].map(k=>[k,main[k]?.length??0])),
 dailyAiEvents:ai.aiEvents.length,githubCoverage:github.verificationSummary.coverage,publication,
 delivery:{delivered,suppressed,date:send.date??send.runDate,sentAt:send.sentAt,response:send.response,sendType:send.sendType??send.type,
 attemptsByThisTask:0,sameDayHistoryCount:(send.history??[]).filter(row=>sentDay(row.sentAt)===date).length,
 currentDigestHash:digestHash,receiptDigestHash:send.digestHash??send.hash,digestMatchesReceipt:digestHash===(send.digestHash??send.hash)},
 recovery:{sourceFailuresRetained:['optional OSS Insight unavailable/timeouts','optional machine-intelligence article-list restriction','Skill duplicate sync database is locked'],
 githubEvidence:'data/dev/source-archives/publication-'+date+'/github-current-merged-evidence.json',
 officialReviews:'data/dev/source-archives/publication-'+date+'/official-web-reviews.json'}};
await writeFile('data/dev/wagmi-publication-audit-'+date+'.json',JSON.stringify(receipt,null,2)+'\n');
await writeFile('data/dev/wagmi-public-verification-'+date+'.json',JSON.stringify(publication,null,2)+'\n');
await writeFile('data/dev/wagmi-dingtalk-digest-'+date+'.md',`# ${date} current verified website digest\n\nCurrent website reference; compare the hash with the receipt before treating it as the sent payload.\n\n${digest.text}\n`);
console.log(JSON.stringify({audit:'data/dev/wagmi-publication-audit-'+date+'.json',checkedAt:now,status:receipt.status,channels,counts:receipt.counts,localReady:publication.localReady,publicReady:publication.publicReady,delivery:receipt.delivery}));

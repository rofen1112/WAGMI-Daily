import {readFile,writeFile} from 'node:fs/promises';
import {evaluateSkillsPublication} from './skills-source-policy.mjs';
const date='2026-11-02',path='data/dev/skills-radar-latest.json';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const [latest,review]=await Promise.all([read(path),read(`data/dev/skills-review-verification-${date}.json`)]);
if(latest.asOf!==date||review.asOf!==date)throw Error('Not current review');
const pending=review.items.filter(r=>r.classification==='unable_to_confirm');
const before={run:latest.run,sourceStatus:latest.sourceStatus};
if(pending.length){
 const message=`队列${pending.length}项核验未取得足够证据，标记无法确认并保留历史记录`;
 latest.sourceStatus=latest.sourceStatus.filter(s=>s.id!=='skills-review-source-identities');
 latest.sourceStatus.push({id:'skills-review-source-identities',url:'https://skills.sh/',status:'warning',count:pending.length,unresolved:pending.length,message,evidence:`skills-review-verification-${date}.json`});
 const warnings=[...new Set([...(latest.run.warnings??[]),message])];
 latest.run={...latest.run,status:'warning',lastSuccess:null,warnings,message:warnings.join('；'),runDate:date,batchId:`wagmi-skill:${date}`};
}
const policy=evaluateSkillsPublication(latest,review);
if(!policy.ready)throw Error(JSON.stringify(policy));
await writeFile(`data/dev/source-archives/audit-0900-${date}/skills-policy-restoration.json`,JSON.stringify({checkedAt:new Date().toISOString(),reason:'A concurrent normal sync replaced latest after historical verification; restore the actual warning and preserve original dated evidence.',before,reviewDate:review.asOf,summary:review.summary,policy},null,2)+'\n');
await writeFile(path,JSON.stringify(latest,null,2)+'\n');
await writeFile(`data/dev/skills-history/${date}.json`,JSON.stringify(latest,null,2)+'\n');
for(const p of [`reports/skills-radar-${date}.md`,`public/reports/skills-radar-${date}.md`]){
 let text=await readFile(p,'utf8');const marker='## 历史来源维护提示（09:00复核）';
 if(!text.includes(marker))text+='\n'+marker+'\n\n'+policy.notices.join('\n\n')+'\n';
 await writeFile(p,text);
}
console.log(JSON.stringify(policy));

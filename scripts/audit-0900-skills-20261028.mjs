import {readFile,writeFile} from 'node:fs/promises';
import {evaluateSkillsPublication} from './skills-source-policy.mjs';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const path='data/dev/skills-radar-latest.json',latest=await read(path);
const review=await read('data/dev/skills-review-verification-2026-10-28.json');
const pending=review.items.filter(r=>r.classification==='unable_to_confirm');
const message=`队列${pending.length}项核验未取得足够证据，标记无法确认并保留历史记录`;
if(pending.length){
 latest.sourceStatus.push({id:'skills-review-source-identities',url:'https://skills.sh/',status:'warning',count:pending.length,unresolved:pending.length,message,evidence:'skills-review-verification-2026-10-28.json'});
 latest.run={...latest.run,status:'warning',lastSuccess:null,message,warnings:[message],runDate:latest.asOf,batchId:'wagmi-skill:2026-10-28'};
}
const policy=evaluateSkillsPublication(latest,review);
if(!policy.ready)throw new Error(JSON.stringify(policy));
await writeFile(path,JSON.stringify(latest,null,2)+'\n');
await writeFile('data/dev/skills-history/2026-10-28.json',JSON.stringify(latest,null,2)+'\n');
for(const path of ['reports/skills-radar-2026-10-28.md','public/reports/skills-radar-2026-10-28.md']){
 let report=await readFile(path,'utf8');
 report+='\n## 历史来源维护提示\n\n'+message+'。当天必需来源及全部30条精选详情通过；统一发布策略确认历史未决记录与当日精选无交集，保留 warning 与历史记录并作为 notice 发布。\n';
 await writeFile(path,report);
}
await writeFile('data/dev/source-archives/audit-0900-2026-10-28-skills-policy.json',JSON.stringify({checkedAt:new Date().toISOString(),reviewReusedItems:review.reusedItems,freshlyCheckedItems:review.freshlyCheckedItems,policy},null,2)+'\n');
console.log(JSON.stringify(policy));


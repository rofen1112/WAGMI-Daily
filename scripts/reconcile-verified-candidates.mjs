import { readFile,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=process.cwd();
const [latest,main]=await Promise.all(['data/dev/ai-events-latest.json','data/main/index.json'].map(async path=>JSON.parse(await readFile(resolve(root,path),'utf8'))));
const formal=new Map(main.aiEvents.filter(event=>event.verification==='verified').map(event=>[event.id,event]));
const repaired=[];
latest.candidates=latest.candidates.map(candidate=>{
  const event=formal.get(candidate.id);
  if(candidate.status!=='pending'||!event)return candidate;
  repaired.push(candidate.id);
  return {...candidate,status:'verified',reason:`原始来源已核验，正式事件保留真实发布日期 ${event.date}，收录报告 ${event.sourceReportId}。`};
});
await writeFile(resolve(root,'data/dev/ai-events-latest.json'),JSON.stringify(latest,null,2)+'\n');
await writeFile(resolve(root,'data/dev/candidate-reconciliation-run.json'),JSON.stringify({checkedAt:new Date().toISOString(),repaired},null,2)+'\n');
console.log(JSON.stringify({repaired}));

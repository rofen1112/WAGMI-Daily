import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {connectorArchiveProof} from './github-connector-archive.mjs';
const date='2026-11-03',base='data/dev/source-archives/publication-'+date;
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const day=t=>{try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date(t));}catch{return null;}};
const required=['accessible','readmeVerified','commitsVerified','issuesVerified','pullRequestsVerified','releasesVerified'];
const byRepo=new Map();
for(const p of [base+'/github-initial-pool-evidence.json',base+'/github-full-evidence.json','data/dev/source-archives/audit-0900-'+date+'/github-review-evidence.json']){
 let source;try{source=await read(p);}catch(e){if(e.code==='ENOENT')continue;throw e;}
 for(const row of source.repositories??[]){
  if(day(row.verifiedAt)!==date)continue;
  const k=row.repo.toLowerCase(),prior=byRepo.get(k);
  if(!prior){byRepo.set(k,{...row,proofArchives:[p]});continue;}
  const merged={...prior,proofArchives:[...new Set([...prior.proofArchives,p])]};
  for(const field of required)merged[field]=prior[field]===true||row[field]===true;
  if(row.releaseTag)merged.releaseTag=row.releaseTag;
  merged.verifiedAt=[prior.verifiedAt,row.verifiedAt].sort().at(-1);
  byRepo.set(k,merged);
 }
}
const records=[];
for(const file of await readdir(base)){
 if(!/^github-connector-recovery.*\.json$/.test(file))continue;
 records.push(...(await read(base+'/'+file)).map(row=>({...row,originArchive:base+'/'+file})));
}
for(const file of await readdir('data/dev/github-evidence-'+date)){
 if(!/^connector.*\.json$/.test(file))continue;
 const data=await read('data/dev/github-evidence-'+date+'/'+file);
 if(Array.isArray(data))records.push(...data.map(row=>({...row,originArchive:'data/dev/github-evidence-'+date+'/'+file})));
}
for(const repo of [...new Set(records.map(r=>r.repo))]){
 const rows=records.filter(r=>r.repo===repo),proof=connectorArchiveProof({repo,checkedAt:rows.map(r=>r.checkedAt).sort().at(-1),records:rows},repo,date);
 if(proof)byRepo.set(repo.toLowerCase(),{...proof,proofArchives:[...new Set(rows.map(r=>r.originArchive))]});
}
const trends=await read('data/dev/github-trend-candidates.json');
if(trends.asOf!==date)throw Error('Current trend snapshot required');
const mandatory=trends.candidates.filter(r=>r.hotLevel==='surging'||r.hotLevel==='hot'||r.forcedByAI);
const complete=[...byRepo.values()].filter(r=>required.every(k=>r[k]===true));
const available=new Set(complete.map(r=>r.repo.toLowerCase()));
const missing=mandatory.filter(r=>!available.has(r.repo.toLowerCase())).map(r=>r.repo);
await mkdir(base,{recursive:true});
await writeFile(base+'/github-current-merged-evidence.json',JSON.stringify({asOf:date,checkedAt:new Date().toISOString(),repositories:complete,missing},null,2)+'\n');
console.log(JSON.stringify({complete:complete.length,mandatory:mandatory.length,missing}));

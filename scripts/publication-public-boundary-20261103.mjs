import fs from 'node:fs/promises';
import{createHash}from'node:crypto';
import './network-fetch.mjs';
const date='2026-11-03',sha=x=>createHash('sha256').update(x).digest('hex');
const paths=['/reports/ai-events-'+date+'.md','/reports/ai-discovery-audit-'+date+'.md','/reports/github-radar-'+date+'.md','/reports/skills-radar-'+date+'.md'];
const privatePaths=['/data/dev/index.json','/.env.dingtalk.local','/admin','/data/dev/skills-catalog.sqlite'];
const rows=[];
for(const origin of ['http://127.0.0.1:8080','https://wagmii.cn']){
 for(const path of paths){const expected=await fs.readFile('public'+path);const r=await fetch(origin+path+'?verify='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(30000)}),body=Buffer.from(await r.arrayBuffer());rows.push({origin,path,httpStatus:r.status,expectedHash:sha(expected),actualHash:sha(body),matches:r.ok&&sha(expected)===sha(body),internalLinkFound:/https?:\/\/(?:[^/\s)"']+\.)?(?:memene\.cn|memenews\.cn)\b/i.test(body.toString('utf8'))});}
 for(const path of privatePaths){const r=await fetch(origin+path,{signal:AbortSignal.timeout(15000)});await r.arrayBuffer();rows.push({origin,path,httpStatus:r.status,privateBoundaryPassed:r.status===404});}
}
const result={runDate:date,checkedAt:new Date().toISOString(),ready:rows.every(r=>r.matches===true&&!r.internalLinkFound||r.privateBoundaryPassed===true),rows};
await fs.writeFile('data/dev/wagmi-public-reports-boundary-'+date+'.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));if(!result.ready)process.exitCode=1;

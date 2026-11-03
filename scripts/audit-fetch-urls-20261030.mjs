import {readFile,writeFile} from 'node:fs/promises';
import './network-fetch.mjs';
const base='data/dev/source-archives/audit-0900-2026-10-30';
const prefix=process.argv[3]??'supp';
const input=JSON.parse(await readFile(process.argv[2],'utf8'));
const results=[];let cursor=0;
await Promise.all(Array.from({length:5},async()=>{while(cursor<input.length){const j=cursor++,url=input[j],checkedAt=new Date().toISOString(),name=prefix+'-'+j;try{const r=await fetch(url,{signal:AbortSignal.timeout(25000)}),raw=await r.text();await writeFile(`${base}/${name}.raw`,raw);const txt=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();await writeFile(`${base}/${name}.txt`,txt);results[j]={i:name,url,checkedAt,httpStatus:r.status,success:r.ok,path:`${base}/${name}.txt`,chars:txt.length};}catch(e){results[j]={i:name,url,checkedAt,success:false,error:e.message};}}}));
await writeFile(base+'/'+prefix+'-results.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results));

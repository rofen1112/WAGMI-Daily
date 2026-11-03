import {readFile,writeFile} from 'node:fs/promises';
import './network-fetch.mjs';
const base='data/dev/source-archives/publication-2026-10-31';
const urls=JSON.parse(await readFile(`${base}/extra-urls.json`,'utf8'));
const results=await Promise.all(urls.map(async(url,i)=>{const checkedAt=new Date().toISOString();try{const r=await fetch(url,{signal:AbortSignal.timeout(20000)}),raw=await r.text();await writeFile(`${base}/extra-${i}.raw`,raw);const txt=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();await writeFile(`${base}/extra-${i}.txt`,txt);return {i,url,checkedAt,status:r.status,success:r.ok,path:`${base}/extra-${i}.txt`,chars:txt.length};}catch(e){return {i,url,checkedAt,success:false,error:e.message}}}));
await writeFile(`${base}/extra-results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));

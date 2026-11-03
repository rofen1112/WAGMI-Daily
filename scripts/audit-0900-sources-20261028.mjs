import {readFile,writeFile,mkdir} from 'node:fs/promises';
import './network-fetch.mjs';
const base='data/dev/source-archives/audit-0900-2026-10-28';
await mkdir(base,{recursive:true});
const manifest=JSON.parse(await readFile('data/dev/ai-editorial-repairs-2026-10-28.json','utf8'));
const urls=[...new Set([...manifest.verifiedSources.map(s=>s.url),'https://openai.com/news/rss.xml','https://blog.google/technology/ai/rss/'])];
let cursor=0; const results=new Array(urls.length);
await Promise.all(Array.from({length:5},async()=>{while(cursor<urls.length){const i=cursor++,url=urls[i],checkedAt=new Date().toISOString();try{const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'user-agent':'ark.insight-audit/1.0'}});const raw=await r.text();await writeFile(`${base}/${i}.raw`,raw);const txt=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();await writeFile(`${base}/${i}.txt`,txt);results[i]={i,url,checkedAt,httpStatus:r.status,success:r.ok,path:`${base}/${i}.txt`,chars:txt.length};}catch(e){results[i]={i,url,checkedAt,success:false,error:e.message};}}}));
await writeFile(`${base}/fetch-results.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));


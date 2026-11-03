import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import './network-fetch.mjs';
const date='2026-11-03',base=`data/dev/source-archives/audit-0900-${date}`;
await mkdir(base,{recursive:true});
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const [m,a,r]=await Promise.all(['data/dev/memene-daily-latest.json','data/dev/ai-media-latest.json',`data/dev/ai-discovery-review-${date}.json`].map(read));
const extra=process.argv[2]?await read(process.argv[2]):[];
const urls=extra.length?extra:[...new Set([
 'https://openai.com/news/rss.xml','https://www.anthropic.com/news','https://blog.google/technology/ai/rss/','https://blogs.nvidia.com/feed/',
 ...m.target.candidates.flatMap(c=>c.sources.map(s=>s.url)),
 ...a.candidates.filter(c=>r.media.items.find(x=>x.id===c.id)?.disposition==='needs_review').flatMap(c=>[c.url,...(c.referencedUrls??[])]),
 ])].filter(u=>!u.includes('youtube.com')&&!u.includes('bilibili.com'));
const prefix=process.argv[3]??'initial',rows=new Array(urls.length);let cursor=0;
await Promise.all(Array.from({length:8},async()=>{while(cursor<urls.length){const i=cursor++,url=urls[i],checkedAt=new Date().toISOString();
 try{const res=await fetch(url,{signal:AbortSignal.timeout(25000)}),raw=await res.text(),stem=`${base}/${prefix}-${i}`;
 let body=raw;try{const j=JSON.parse(raw);body=j.content?.rendered??j.html??raw;}catch{}
 const text=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 await writeFile(stem+'.raw',raw);await writeFile(stem+'.txt',text);
 rows[i]={i,url,checkedAt,success:res.ok,httpStatus:res.status,finalUrl:res.url,chars:text.length,path:stem+'.txt',rawPath:stem+'.raw',sha256:createHash('sha256').update(raw).digest('hex')};
 }catch(e){rows[i]={i,url,checkedAt,success:false,error:e.message};}
}}));
await writeFile(`${base}/${prefix}-results.json`,JSON.stringify(rows,null,2)+'\n');
console.log(JSON.stringify(rows));

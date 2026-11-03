import {readFile,writeFile,mkdir} from 'node:fs/promises';
import './network-fetch.mjs';
const date='2026-11-01',base=`data/dev/source-archives/audit-0900-${date}`;
await mkdir(base,{recursive:true});
const read=async n=>JSON.parse(await readFile(`data/dev/${n}.json`,'utf8'));
const [memene,media,review]=await Promise.all(['memene-daily-latest','ai-media-latest',`ai-discovery-review-${date}`].map(read));
const additional=process.argv[2]?JSON.parse(await readFile(process.argv[2],'utf8')):[];
const prefix=process.argv[3]??'initial';
const urls=additional.length?additional:[...new Set([
 ...memene.target.candidates.flatMap(c=>(c.sources??[]).map(s=>s.url)),
 ...media.candidates.filter(c=>review.media.items.find(r=>r.id===c.id)?.disposition==='needs_review').map(c=>c.url),
 ...media.candidates.filter(c=>c.sourceId==='juya'&&c.sourceDate===date).flatMap(c=>c.sections.flatMap(s=>s.referencedUrls)),
 'https://openai.com/news/rss.xml','https://www.anthropic.com/news','https://blog.google/technology/ai/rss/',
 'https://github.com/anthropics/claude-code/releases','https://huggingface.co/models?sort=trending'
])];
const results=new Array(urls.length);let cursor=0;
await Promise.all(Array.from({length:8},async()=>{while(cursor<urls.length){const i=cursor++,url=urls[i],checkedAt=new Date().toISOString();try{
 const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'user-agent':'ark.insight-audit/1.0'}}),raw=await r.text();
 const path=`${base}/${prefix}-${i}`;await writeFile(path+'.raw',raw);
 let body=raw;try{const p=JSON.parse(raw);if(p.content?.rendered)body=`${p.date} ${p.title.rendered} ${p.content.rendered}`;else if(p.html)body=p.html;}catch{}
 const txt=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();await writeFile(path+'.txt',txt);
 results[i]={i,url,checkedAt,httpStatus:r.status,success:r.ok,path:path+'.txt',chars:txt.length};
}catch(e){results[i]={i,url,checkedAt,success:false,error:e.message};}}}));
await writeFile(`${base}/${prefix}-results.json`,JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results.map(r=>({i:r.i,url:r.url,status:r.httpStatus??r.error,chars:r.chars}))));


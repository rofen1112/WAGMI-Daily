import {readFile,writeFile,mkdir} from 'node:fs/promises';
import './network-fetch.mjs';
const read=async n=>JSON.parse(await readFile(`data/dev/${n}.json`,'utf8'));
const base='data/dev/source-archives/audit-0900-2026-10-30';
await mkdir(base,{recursive:true});
const [memene,media,review]=await Promise.all(['memene-daily-latest','ai-media-latest','ai-discovery-review-2026-10-30'].map(read));
const urls=[...new Set([
 ...memene.target.candidates.flatMap(c=>(c.links??[]).map(l=>l.url)),
 ...media.candidates.filter(c=>review.media.items.find(r=>r.id===c.id)?.disposition==='needs_review').map(c=>c.url),
 ...media.candidates[0].sections.flatMap(s=>s.referencedUrls),
 'https://openai.com/news/rss.xml','https://www.anthropic.com/news','https://blog.google/technology/ai/rss/',
 'https://github.com/anthropics/claude-code/releases','https://huggingface.co/models?sort=trending',
])].filter(u=>!u.includes('x.com/'));
let cursor=0;const results=new Array(urls.length);
await Promise.all(Array.from({length:6},async()=>{while(cursor<urls.length){const i=cursor++,url=urls[i],checkedAt=new Date().toISOString();try{const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'user-agent':'ark.insight-audit/1.0'}});const raw=await r.text();await writeFile(`${base}/${i}.raw`,raw);const txt=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();await writeFile(`${base}/${i}.txt`,txt);results[i]={i,url,checkedAt,httpStatus:r.status,success:r.ok,path:`${base}/${i}.txt`,chars:txt.length};}catch(e){results[i]={i,url,checkedAt,success:false,error:e.message};}}}));
await writeFile(`${base}/fetch-results.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(r=>({i:r.i,url:r.url,status:r.httpStatus??r.error,chars:r.chars}))));

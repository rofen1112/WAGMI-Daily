import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import './network-fetch.mjs';
const date='2026-11-02', base=`data/dev/source-archives/audit-0900-${date}`;
await mkdir(base,{recursive:true});
const urls=process.argv[2] ? JSON.parse(await readFile(process.argv[2],'utf8')) : [
 'https://openai.com/news/rss.xml', 'https://www.anthropic.com/news',
 'https://blog.google/technology/ai/rss/', 'https://blogs.nvidia.com/feed/',
 'https://longcat.ai/blog/longcat-2.5/', 'https://longcat.ai/platform/docs/ChangeLog.html',
 'https://mustafa-suleyman.ai/a-warning-about-model-welfare',
 'https://github.com/anthropics/claude-code/releases',
 'https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview/raw/main/README.md',
 'https://www.qbitai.com/2026/11/507082.html',
 'https://publish.twitter.com/oembed?url=https://x.com/thsottiaux/status/2116692529970311254',
 'https://publish.twitter.com/oembed?url=https://x.com/thsottiaux/status/2117035794678546764',
 'https://publish.twitter.com/oembed?url=https://x.com/claudeai/status/2116220869479428500',
 'https://publish.twitter.com/oembed?url=https://x.com/elonmusk/status/2116992258520064397'
];
const prefix=process.argv[3]??'initial', results=new Array(urls.length);let cursor=0;
await Promise.all(Array.from({length:6},async()=>{while(cursor<urls.length){
 const i=cursor++,url=urls[i],checkedAt=new Date().toISOString();
 try {const r=await fetch(url,{signal:AbortSignal.timeout(25000)}), raw=await r.text();
 const path=`${base}/${prefix}-${i}`; await writeFile(path+'.raw',raw);
 let body=raw;try{const j=JSON.parse(raw);body=j.content?.rendered??j.html??raw;}catch{}
 const txt=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 await writeFile(path+'.txt',txt);results[i]={i,url,checkedAt,httpStatus:r.status,success:r.ok,path:path+'.txt',rawPath:path+'.raw',chars:txt.length,sha256:createHash('sha256').update(raw).digest('hex')};
 }catch(e){results[i]={i,url,checkedAt,success:false,error:e.message};}
}}));
await writeFile(`${base}/${prefix}-results.json`,JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results));

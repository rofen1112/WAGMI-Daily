import {readFile,writeFile} from 'node:fs/promises';
import {XMLParser} from 'fast-xml-parser';
import './network-fetch.mjs';
const base='data/dev/source-archives/publication-2026-11-01';
const config=JSON.parse(await readFile('ai-media-sources.json','utf8'));
const media=JSON.parse(await readFile('data/dev/ai-media-latest.json','utf8'));
const results=[];
const clean=s=>String(s).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
await Promise.all(config.sources.filter(s=>s.enabled!==false&&s.channel==='wechat_public_rss').map(async s=>{try{const checkedAt=new Date().toISOString(),r=await fetch(s.url,{signal:AbortSignal.timeout(25000)}),raw=await r.text();await writeFile(`${base}/feed-${s.id}.xml`,raw);const parsed=new XMLParser({ignoreAttributes:false,parseTagValue:false}).parse(raw);for(const e of [parsed.rss?.channel?.item??[]].flat()){const c=media.candidates.find(c=>c.title===e.title&&c.sourceId===s.id);if(!c)continue;const html=e['content:encoded']??e.description??'',txt=clean(html);await writeFile(`${base}/${c.id}.txt`,txt);results.push({id:c.id,url:c.url,path:`${base}/${c.id}.txt`,checkedAt,sourceDate:c.sourceDate,chars:txt.length,links:[...String(html).matchAll(/https?:[^\s"'<>]+/g)].map(m=>m[0])});}}catch(e){results.push({source:s.id,error:e.message})}}));
await Promise.all(media.candidates.filter(c=>c.sourceId==='aiera').map(async c=>{try{const id=new URL(c.url).searchParams.get('id'),url=`https://aiera.com.cn/wp-json/wp/v2/posts/${id}?_embed=1`,checkedAt=new Date().toISOString(),r=await fetch(url,{signal:AbortSignal.timeout(20000)}),raw=await r.text();await writeFile(`${base}/post-${id}.json`,raw);if(!r.ok)throw new Error('HTTP '+r.status);const p=JSON.parse(raw),txt=clean(p.content?.rendered);await writeFile(`${base}/${c.id}.txt`,txt);results.push({id:c.id,url:c.url,apiUrl:url,path:`${base}/${c.id}.txt`,checkedAt,sourceDate:p.date?.slice(0,10),chars:txt.length,links:[...String(p.content?.rendered).matchAll(/https?:[^\s"'<>]+/g)].map(m=>m[0])});}catch(e){results.push({id:c.id,error:e.message})}}));
await writeFile(`${base}/body-results.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(({links,...r})=>r)));


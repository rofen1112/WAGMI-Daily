import {readFile,writeFile} from 'node:fs/promises';
import './network-fetch.mjs';
const base='data/dev/source-archives/audit-0900-2026-10-29/';
const results=JSON.parse(await readFile(base+'fetch-results.json','utf8'));
const urls=[...results.filter(r=>!r.success&&r.httpStatus!==403).map(r=>({key:r.i+'-retry',url:r.url})),
 {key:'api-changelog',url:'https://developers.openai.com/api/docs/changelog'},
 {key:'api-credits',url:'https://developers.openai.com/api/docs/guides/chatgpt-api-credits'},
 {key:'octoverse',url:'https://simonwillison.net/2026/Oct/28/github-octoverse-2026/'},
 {key:'octoverse-original',url:'https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/'}];
const extra=await Promise.all(urls.map(async ({key,url})=>{const checkedAt=new Date().toISOString();try{const r=await fetch(url,{signal:AbortSignal.timeout(25000)});const raw=await r.text();await writeFile(base+key+'.raw',raw);const txt=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();await writeFile(base+key+'.txt',txt);return {key,url,checkedAt,httpStatus:r.status,success:r.ok,chars:txt.length};}catch(e){return {key,url,checkedAt,success:false,error:e.message};}}));
await writeFile(base+'extra-results.json',JSON.stringify(extra,null,2)+'\n');
console.log(JSON.stringify(extra,null,2));

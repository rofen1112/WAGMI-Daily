import { readFile,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import './network-fetch.mjs';
const root=process.cwd();
const record=JSON.parse(await readFile(resolve(root,'data/dev/secondary-source-verification.json'),'utf8'));
const catalog=JSON.parse(await readFile(resolve(root,'data/dev/papers-catalog.json'),'utf8'));
const now=new Date().toISOString();
const clean=value=>value.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const norm=value=>value.toLowerCase().replace(/[^a-z0-9]/g,'');
const known=new Set(catalog.papers.map(paper=>norm(paper.titleOriginal)));
const get=async url=>{const response=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);return {html:await response.text(),url:response.url,httpStatus:response.status};};
const links=(html,base)=>[...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)].map(([,href,title])=>({url:new URL(href.replace(/&amp;/g,'&'),base).href,title:clean(title)}));
const backlog=[];
for(const check of record.conferences){
  const attempt={checkedAt:now,status:'blocked',candidates:[]};
  try{
    let rows=[];
    if(check.id==='ICML'){
      const home=await get(check.url);
      const match=home.html.match(/<a href="([^"]+)"[^>]*>(?:(?!<\/a>)[\s\S])*<\/a>\s*Proceedings of ICML 2026/);
      if(!match)throw new Error('ICML 2026 volume not present in official index');
      const url=new URL(match[1],home.url).href;const list=await get(url);attempt.listUrl=list.url;
      rows=[...list.html.matchAll(/<div class="paper">([\s\S]*?)<\/div>/g)].map(([,body])=>({title:clean(body.match(/<p class="title">([\s\S]*?)<\/p>/)?.[1]??''),url:body.match(/href="(https:\/\/proceedings\.mlr\.press\/[^\"]+\.html)"/)?.[1]})).filter(row=>row.title&&row.url);
    }else if(check.id==='NeurIPS'){
      const home=await get(check.url);
      const publication=links(home.html,home.url).find(link=>link.url.includes('vol38-main-conference'));
      if(!publication)throw new Error('Latest officially published proceedings link missing');
      const list=await get(publication.url);attempt.listUrl=list.url;attempt.publicationYear=2025;
      rows=links(list.html,list.url).filter(link=>/-Abstract[^/]*\.html$/.test(link.url));
      attempt.caveat='The official index currently lists NeurIPS 2025 as its latest proceedings; these are historical metadata, not 2026 new publications.';
    }else if(check.id==='ICLR'){
      const response=await fetch('https://api2.openreview.net/notes?content.venueid=ICLR.cc/2026/Conference&limit=1000',{signal:AbortSignal.timeout(20000)});
      attempt.apiHttpStatus=response.status;
      if(!response.ok)throw new Error(`OpenReview public notes API HTTP ${response.status}`);
      const data=await response.json();rows=(data.notes??[]).map(note=>({title:note.content?.title?.value,url:`https://openreview.net/forum?id=${note.id}`,authors:note.content?.authors?.value,venue:note.content?.venue?.value}));
      attempt.availableCount=data.count;attempt.partial=data.count>rows.length;
    }else if(check.id==='CVPR'){
      const home=await get(check.url);const days=links(home.html,home.url).filter(link=>link.url.includes('?day=')&&!link.url.includes('day=all'));
      if(!days.length)throw new Error('CVF day navigation missing');
      attempt.dayFailures=[];
      for(const day of days){try{const list=await get(day.url);rows.push(...links(list.html,list.url).filter(link=>/\/html\/.*_CVPR_2026_paper\.html$/.test(link.url)));}catch(error){attempt.dayFailures.push({url:day.url,error:error.message});}}
      if(!rows.length)throw new Error('CVF individual-day lists not readable');
      attempt.partial=attempt.dayFailures.length>0;
    }
    if(!rows.length)throw new Error('Official proceedings returned no parsed paper records');
    rows=[...new Map(rows.map(row=>[row.url,row])).values()];
    attempt.paperLinksObserved=rows.length;
    attempt.candidates=rows.filter(row=>/gaussian splatting|world model|\b3d\b|spatial|robot|physical|floor plan|architect|\bcad\b|video|embodied/i.test(row.title)&&!known.has(norm(row.title))).map(row=>({...row,venue:check.id,readingLevel:'metadata',discoveredAt:now}));
    attempt.status=attempt.partial?'partial':'success';
    backlog.push(...attempt.candidates);
  }catch(error){attempt.error=error.message;}
  check.recovery=attempt;
  if(attempt.status==='success'){check.status='success';delete check.error;check.candidates=attempt.candidates;check.paperLinksObserved=attempt.paperLinksObserved;}
  console.log(`${check.id}: ${attempt.status}, ${attempt.paperLinksObserved??0} paper records, ${attempt.candidates.length} relevant not-yet-cataloged metadata candidates`);
}
await writeFile(resolve(root,'data/dev/secondary-source-verification.json'),JSON.stringify(record,null,2)+'\n');
let previous=[];
try{previous=JSON.parse(await readFile(resolve(root,'data/dev/conference-discovery-backlog.json'),'utf8')).candidates??[];}catch(error){if(error.code!=='ENOENT')throw error;}
const cumulative=[...new Map([...previous,...backlog].map(row=>[row.url,row])).values()];
await writeFile(resolve(root,'data/dev/conference-discovery-backlog.json'),JSON.stringify({asOf:record.runDate,checkedAt:now,retention:'cumulative_no_delete',reviewBudgetPerDay:5,
  caveat:'Metadata discovery is not interpretation. Candidates retain their venue and original publication year; no old conference paper is relabeled as a new daily event.',
  candidates:cumulative},null,2)+'\n');

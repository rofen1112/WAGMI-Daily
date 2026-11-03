import { readFile,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=process.cwd();
const read=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
const [catalog,latest,override]=await Promise.all([read('data/dev/papers-catalog.json'),read('data/dev/ai-events-latest.json'),read('data/dev/index.json')]);
const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date());
if(catalog.asOf!==date||latest.asOf!==date)throw new Error('Daily paper selection requires current inputs');
const recommendations=(catalog.dailyRecommendations??[]).slice(0,3).map(id=>catalog.papers.find(paper=>paper.id===id));
if(recommendations.some(paper=>!paper?.titleZh||!paper?.summaryZh||!['abstract','fulltext'].includes(paper?.readingLevel)))throw new Error('Recommended papers lack actual Chinese review');
const selectedUrls=new Set(recommendations.map(paper=>paper.url));
const deferred=latest.aiEvents.filter(event=>event.contentKind==='paper'&&!selectedUrls.has(event.paper.paperUrl));
const events=recommendations.map(paper=>({
  id:`ai-${date}-paper-${paper.arxivId.replace('.','-')}`,date:paper.originalPublishedAt?.slice(0,10)??paper.publishedAt.slice(0,10),
  title:`前沿论文：${paper.titleZh}`,summary:paper.summaryZh,whyItMatters:paper.industryValueZh,
  action:`${paper.futureOutlookZh} 局限：${paper.limitationsZh}`,priority:paper.reviewTier==='deep'?'A':'B',boards:paper.targetBoards,
  sourceType:'official_paper',verification:'verified',entities:[],contentKind:'paper',sourceReportId:latest.report.id,
  repoCandidates:paper.relatedRepositories.filter(link=>link.relation==='official_code').map(link=>link.repo),
  sources:[{label:'arXiv 原始论文',url:paper.url},...paper.relatedRepositories.filter(link=>link.relation==='official_code').map(link=>({label:'作者代码',url:link.url}))],
  readingSources:latest.aiEvents.find(event=>event.paper?.paperUrl===paper.url)?.readingSources??[],
  readingSources:latest.aiEvents.find(event=>event.contentKind==='paper'&&event.paper?.paperUrl===paper.url)?.readingSources??[],
  paper:{titleOriginal:paper.titleOriginal,authors:paper.authors,publishedAt:paper.originalPublishedAt??paper.publishedAt,rssAnnouncedAt:Object.hasOwn(paper,'rssAnnouncedAt')?paper.rssAnnouncedAt:paper.publishedAt,venue:'arXiv',paperUrl:paper.url,pdfUrl:paper.pdfUrl,readingLevel:paper.readingLevel},
  digestSelected:true,
}));
latest.aiEvents=[...latest.aiEvents.filter(event=>event.contentKind!=='paper'),...events];
override.aiEvents=[...new Map([...(override.aiEvents??[]),...deferred.map(event=>({...event,digestSelected:false,deferralReason:'Daily digest uses the current catalog recommendations, capped at three; source record is preserved privately.'})),...events].map(event=>[event.id,event])).values()];
const record={runDate:date,checkedAt:new Date().toISOString(),selected:events.map(event=>({id:event.id,url:event.paper.paperUrl})),deferred:deferred.map(event=>({id:event.id,url:event.paper.paperUrl})),maxDailyEvents:3};
const writes=[()=>writeFile(resolve(root,'data/dev/ai-events-latest.json'),JSON.stringify(latest,null,2)+'\n'),()=>writeFile(resolve(root,'data/dev/index.json'),JSON.stringify(override,null,2)+'\n'),()=>writeFile(resolve(root,'data/dev/paper-digest-selection.json'),JSON.stringify(record,null,2)+'\n')];
// Reconciliation also reads the editorial manifest. Keep its selected papers
// aligned so a previous shortlist cannot be silently merged back into the day.
const manifestPath=`data/dev/ai-editorial-repairs-${date}.json`;
let manifest;
try{manifest=await read(manifestPath);}catch(error){if(error.code!=='ENOENT')throw error;}
if(manifest){
 if(manifest.runDate!==date)throw new Error('Editorial paper selection requires the current manifest');
 const displaced=(manifest.events??[]).filter(event=>event.contentKind==='paper'&&!selectedUrls.has(event.paper?.paperUrl));
 manifest.deferredPaperEvents=[...new Map([...(manifest.deferredPaperEvents??[]),...displaced,...deferred].map(event=>[event.id,{...event,digestSelected:false}])).values()].filter(event=>!selectedUrls.has(event.paper?.paperUrl));
 manifest.events=[...(manifest.events??[]).filter(event=>event.contentKind!=='paper'),...events];
 manifest.paperDigestSelection=record;
 writes.push(()=>writeFile(resolve(root,manifestPath),JSON.stringify(manifest,null,2)+'\n'));
}
await Promise.all(writes.map(write=>write()));
console.log(JSON.stringify(record));

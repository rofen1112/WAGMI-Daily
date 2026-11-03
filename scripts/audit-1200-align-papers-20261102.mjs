import fs from 'node:fs/promises';
const date='2026-11-02',read=async p=>JSON.parse(await fs.readFile(p,'utf8')),write=async(p,d)=>fs.writeFile(p,JSON.stringify(d,null,2)+'\n');
const [latest,manifest,review,cat,fetches]=await Promise.all(['data/dev/ai-events-latest.json',`data/dev/ai-editorial-repairs-${date}.json`,`data/dev/ai-discovery-review-${date}.json`,'data/dev/papers-catalog.json',`data/dev/source-archives/audit-1200-${date}/fetch-results.json`].map(read));
const urls=new Set(cat.dailyRecommendations.map(id=>cat.papers.find(p=>p.id===id).url)),selected=latest.aiEvents.filter(e=>e.contentKind==='paper');
if(selected.length!==3||selected.some(e=>!urls.has(e.paper.paperUrl)))throw Error('Run select-daily-paper-events first');
manifest.events=manifest.events.filter(e=>e.contentKind!=='paper');
const now=new Date().toISOString();
for(const e of selected){
 if(e.paper.paperUrl.endsWith('2610.26659'))e.readingSources=[{label:'新智元：主动室内建图解读',url:'https://aiera.com.cn/asi-post.html?id=121791',language:'zh',role:'coverage'}];
 manifest.events.push(e);
 const f=fetches.find(f=>f.url===e.paper.paperUrl&&f.success);
 if(!f)throw Error('No actual original '+e.paper.paperUrl);
 if(!manifest.verifiedSources.some(s=>s.url===e.paper.paperUrl&&s.eventIds?.includes(e.id)))manifest.verifiedSources.push({url:e.paper.paperUrl,checkedAt:f.checkedAt,success:true,verification:'verified',sourceClass:'original_research',method:'已读官方摘要与提交历史，中文为摘要级解读，未运行作者代码或声称独立复现',eventIds:[e.id],evidencePath:f.path});
 review.readingReviews=review.readingReviews.filter(r=>r.eventId!==e.id);
 review.readingReviews.push(e.readingSources?.length?{eventId:e.id,status:'provided',urls:e.readingSources.map(s=>s.url),checkedAt:now,reason:'已读新智元完整原文并与官方摘要核对，事实来源独立绑定。'}:{eventId:e.id,status:'not_found',checkedAt:now,checkedSources:['本轮9中文入口和104候选','原始论文和作者页面'],reason:'当前可读公开中文候选未找到准确对应正文；保留实际英文原文，内部发现摘要不作为阅读链接。'});
}
for(const [p,d] of [['data/dev/ai-events-latest.json',latest],[`data/dev/ai-editorial-repairs-${date}.json`,manifest],[`data/dev/ai-discovery-review-${date}.json`,review]])await write(p,d);
console.log(JSON.stringify({date,selected:selected.map(e=>e.id)}));

import fs from 'node:fs/promises';
const date='2026-11-03',base=`data/dev/source-archives/audit-0900-${date}`;
const read=async p=>JSON.parse(await fs.readFile(p,'utf8')),write=async(p,d)=>fs.writeFile(p,JSON.stringify(d,null,2)+'\n');
const [latest,manifest,review,results]=await Promise.all(['data/dev/ai-events-latest.json',`data/dev/ai-editorial-repairs-${date}.json`,`data/dev/ai-discovery-review-${date}.json`,base+'/chinese-results.json'].map(read));
const proof=results[0],now=new Date().toISOString();if(!proof.success||proof.chars<5000)throw Error('HTTPS Chinese body unavailable');
const text=await fs.readFile(proof.path,'utf8');if(!text.includes('Marvell')||!text.includes('169.6'))throw Error('Wrong Chinese article');
for(const key of ['anthropic-amendment','marvell-lumentum']){
 const id=`ai-${date}-${key}`;
 for(const event of [...latest.aiEvents,...manifest.events].filter(e=>e.id===id)){
  event.sources=event.sources.map(s=>s.url==='http://www.geekpark.net/news/373358'?{...s,url:proof.url}:s);
  event.readingSources=[...(event.readingSources??[]).filter(s=>!s.url.includes('geekpark.net/news/373358')),{label:'极客公园：招股更新与光互连并购报道',url:proof.url,language:'zh',role:'coverage'}];
 }
 manifest.verifiedSources.push({url:proof.url,checkedAt:proof.checkedAt,success:true,verification:'verified',sourceClass:'trusted_media',method:'已读HTTPS完整正文与HTTP版本同一内容，核对11月3日署期及11月2日交易/招股更新归属；独立官方证据继续保留',eventIds:[id],evidencePath:proof.path,contentExcerpt:key==='marvell-lumentum'?'报道确认1150亿美元为企业价值，4.5换股、67%/33%股权及2028上半年有条件交割，非已完成交易。':'报道给出169.6亿美元营收、5.67亿美元营业亏损及8954亿美元承诺，不能与净亏损或已支付额混用。'});
 const urls=latest.aiEvents.find(e=>e.id===id)?.readingSources.map(s=>s.url)??[];
 review.readingReviews=review.readingReviews.filter(x=>x.eventId!==id);
 review.readingReviews.push({eventId:id,status:'provided',checkedAt:now,urls,reason:'本轮已读极客公园HTTPS全文对应招股与并购两节；事实另有官方原文绑定，保留报道日期、归属和有条件交割。'});
}
for(const [p,d]of [['data/dev/ai-events-latest.json',latest],[`data/dev/ai-editorial-repairs-${date}.json`,manifest],[`data/dev/ai-discovery-review-${date}.json`,review]])await write(p,d);
console.log(JSON.stringify({repairedHttpsSource:true,verifiedChineseReading:2,checkedAt:now}));

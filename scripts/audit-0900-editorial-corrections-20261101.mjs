import {readFile,writeFile} from 'node:fs/promises';
const date='2026-11-01',base=`data/dev/source-archives/audit-0900-${date}/`;
if(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date())!==date)throw Error('This dated correction cannot create a new same-day review after the batch date has ended');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const [a,m,v]=await Promise.all(['data/dev/ai-events-latest.json',`data/dev/ai-editorial-repairs-${date}.json`,`data/dev/ai-discovery-review-${date}.json`].map(read));
if(a.asOf!==date||m.runDate!==date)throw Error('Current AI batch is not ready; keep independent findings without overwriting the collector');
const now=new Date().toISOString();
const existing=a.aiEvents.find(e=>/RWE[- ]?Bench/i.test(e.title+' '+e.summary));
const event={...(existing??{}),id:existing?.id??`ai-${date}-rwe-bench`,date:'2026-10-28',
 title:'RWE-Bench公布真实工程评测，20项任务检验CAD、布线与仿真约束',
 summary:'新智元11月1日解读Xplore工程评测。官方数据文件把结果发布日期标为10月28日：20项机械、电子和航空航天任务，每次最多24小时，由确定性程序和物理求解器验收。Astra、Opus5.5与Sol的单次平均通过率分别为37%、29%和25%；五次尝试至少成功一次的口径分别为60%、70%和50%。',
 whyItMatters:'工程Agent需要把建模、约束检查和求解器反馈接成闭环，代码或数学分数不能直接替代工程任务验收。',
 action:'数据仍标provisional，样本仅20题且95%可信区间重叠；不要据此断言模型存在统计显著排名差距。官方泛称最高推理强度，但具体数据中Gemini为high、Qwen和Grok为xhigh。成本为每次运行费用；评测方另售训练环境，题目不授权训练。',
 priority:'A',boards:['AI-CAD / AEC','AI 3D / World Models'],sourceType:'official_announcement',verification:'verified',entities:existing?.entities??[],contentKind:'industry_event',sourceReportId:`ai-${date}`,repoCandidates:[],
 sources:[{label:'Xplore官方工程评测',url:'https://xplore.ai/rwe-bench'},{label:'官方结果与指标定义',url:'https://xplore.ai/js/rwe-data.js'}],
 readingSources:[{label:'新智元 · 工程设计评测解读',url:'https://aiera.com.cn/asi-post.html?id=121637',language:'zh',role:'coverage'}],
 dateSemantics:'官方数据resultsDate为2026-10-28；导出日期10月25日不当作发布日。中文报道为11月1日，另提10月27日启动，分别保留。'};
const prior=a.aiEvents.findIndex(e=>e.id===event.id);if(prior>=0)a.aiEvents[prior]=event;else a.aiEvents.push(event);
const mi=m.events.findIndex(e=>e.id===event.id);if(mi>=0)m.events[mi]=event;else m.events.push(event);
const results=(await Promise.all(['primary-results.json','rwe-results.json'].map(n=>read(base+n)))).flat();
for(const url of event.sources.map(s=>s.url)){
 const evidence=results.find(r=>r.url===url);if(!evidence?.success)throw Error('Missing actual original-source observation: '+url);
 m.verifiedSources.push({url,checkedAt:now,success:true,verification:'verified',sourceClass:'official',method:'Read archived official benchmark body and data definitions; distinguish resultsDate, per-run success, pass@5, credible intervals, costs, provisional flag and reasoning labels. No website JavaScript executed.',contentExcerpt:event.summary+' '+event.action,eventIds:[event.id],evidencePath:evidence.path});
}
const review=v.media.items.find(r=>r.id==='media-833752b8164383679d3a');if(!review)throw Error('Missing RWE media candidate');
delete review.carriedFromRunDate;Object.assign(review,{importance:'high',disposition:existing?'covered':'added',reason:'完整阅读新智元正文、Xplore官方页面及结果数据；补核正式结果日期10月28日，区分单次通过率与pass@5，保留可信区间、provisional及推理强度差异。',eventIds:[event.id],checkedAt:now});
v.readingReviews=v.readingReviews.filter(r=>r.eventId!==event.id);v.readingReviews.push({eventId:event.id,status:'provided',urls:event.readingSources.map(s=>s.url),checkedAt:now,reason:'已读发布方WordPress接口全文，保留实际公开中文文章入口；事实与指标另核官方页面和原始结果数据。'});
m.audit0900={...m.audit0900,checkedAt:now,independentFindings:base+'independent-findings.json',correctionEventIds:[event.id]};
for(const [p,d]of [[`data/dev/ai-editorial-repairs-${date}.json`,m],['data/dev/ai-events-latest.json',a],[`data/dev/ai-discovery-review-${date}.json`,v]])await writeFile(p,JSON.stringify(d,null,2)+'\n');
console.log(JSON.stringify({corrected:event.id,date:event.date,existing:Boolean(existing)}));

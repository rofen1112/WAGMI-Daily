import fs from 'node:fs/promises';
const date='2026-11-02',base=`data/dev/source-archives/audit-1200-${date}`;
const read=async p=>JSON.parse(await fs.readFile(p,'utf8')),write=async(p,d)=>fs.writeFile(p,JSON.stringify(d,null,2)+'\n');
const [latest,manifest,review,cat,overrides,fetches]=await Promise.all(['data/dev/ai-events-latest.json',`data/dev/ai-editorial-repairs-${date}.json`,`data/dev/ai-discovery-review-${date}.json`,'data/dev/papers-catalog.json','paper-review-overrides.json',base+'/fetch-results.json'].map(read));
const now=new Date().toISOString(),fetched=url=>{const f=fetches.find(f=>f.url===url);if(!f?.success||f.chars<500)throw Error('Unreadable '+url);return f;};
const specs=[
 ['2610.40503','AWM：从陌生环境探索走向可检查的世界模型证明','AWM通过Python假设反复检验环境规律，再组织成类型化对象与规则，以Lean 4检查可达性和不可达性。作者在两个封闭关卡的六次运行获得不可达证明，并展示183关轨迹回放；证明只针对学得的形式模型，不能自动保证与任意真实世界一致。','对受约束的设计规划和Agent失败诊断有价值，强调可执行假设与形式证明的连接。','摘要及项目页级阅读；未运行Lean，作者小样本和固定游戏协议不能外推所有环境。','优先检查学得规则与环境的差异，再评估形式证明对实际任务验收的覆盖。','2026-10-29',['AI Agent','AI 3D / World Models']],
 ['2609.39388','UniWAM：共享世界动作骨干连接导航与操作','UniWAM以共享骨干、独立导航/操作流和Manipulation Anchor Pose连接停止位置与后续操作。作者仓库提供MAP-Bench、导航检查点、评测轨迹与训练代码，覆盖24项真机任务；任务训练后的真机检查点不在公开包中，不能把导航权重称作全部机器人能力。','为室内机器人导航到可操作位置、空间数据合成和闭环动作评估提供公开研究资源。','摘要和作者仓库级阅读，未复现真机结果；MAP-Bench是导航评测，作者宏平均与真实业务成功率不能混用。','审查数据、模型及代码各自许可，复算公开轨迹并用自有室内场景检验迁移。','2026-09-30',['AI 3D / World Models','AI Agent']],
 ['2610.12426','随机神经网络的李雅普诺夫谱：人类与模型协作推导','作者计算随机非对称耦合循环网络在大规模极限下的李雅普诺夫谱，通过有限规模恒等式与空腔方法得到自洽单点问题。论文明确称与GPT-6 Astra及Claude Opus 5.5协作完成；首发为10月8日，11月2日中文传播不构成新的首发。','为AI协助理论推导、解释与验证提供可检查原稿的案例。','摘要级阅读，未检查36页证明；作者自述不等于已完成独立数学核验。','将原稿、推导检查和代码复核分开，避免把社交传播强度当科学正确性。','2026-10-08',['AI Agent','Frontier Paper / Research']]
];
for(const [a,titleZh,summaryZh,industryValueZh,limitationsZh,futureOutlookZh,pub,boards] of specs){
 const id='arxiv-'+a.replace('.','-'),url='https://arxiv.org/abs/'+a,f=fetched(url),raw=await fs.readFile(f.rawPath,'utf8'),text=await fs.readFile(f.path,'utf8');
 const metas=n=>[...raw.matchAll(/<meta\s+name="([^"]+)"\s+content="([^"]*)"/g)].filter(x=>x[1]===n).map(x=>x[2]);
 if(!metas('citation_title')[0]||!metas('citation_author').length)throw Error('Missing official citation '+a);
 let p=cat.papers.find(p=>p.id===id);
 if(!p){p={id,arxivId:a,source:'arxiv',titleOriginal:metas('citation_title')[0],abstractOriginal:text.split('Abstract:')[1]?.split(' Comments:')[0]?.split(' Subjects:')[0]?.trim(),authors:metas('citation_author'),categories:metas('citation_primary_category'),publishedAt:pub+'T00:00:00.000Z',originalPublishedAt:pub+'T00:00:00.000Z',rssAnnouncedAt:null,dateSemantics:'original_submission',url,pdfUrl:'https://arxiv.org/pdf/'+a,score:25,reviewTier:'watch',topics:[],targetBoards:['Frontier Paper / Research',...boards],relatedRepositories:[],firstSeenAt:now,lastSeenAt:null,lastCheckedAt:now,availabilityStatus:'monitoring',missingRuns:0,discoverySource:'manual-original-source-review'};cat.papers.push(p);}
 Object.assign(p,{titleZh,summaryZh,industryValueZh,limitationsZh,futureOutlookZh,keyContributionsZh:[summaryZh],reviewStatus:'interpreted',readingLevel:'abstract',reviewedAt:now});
 overrides.reviews[id]={...(overrides.reviews[id]??{}),titleZh,summaryZh,industryValueZh,limitationsZh,futureOutlookZh,keyContributionsZh:[summaryZh],reviewStatus:'interpreted',readingLevel:'abstract',reviewedAt:now,evidencePath:f.path};
 manifest.verifiedSources.push({url,checkedAt:f.checkedAt,success:true,verification:'verified',sourceClass:'original_research',method:'已读官方摘要和原始提交记录，区分论文、作者项目说明与独立复现；额外研究受日报三篇限制，完整保留公开目录',paperIds:[id],eventIds:[],evidencePath:f.path,contentExcerpt:summaryZh});
}
// Bind all three selected papers to the actual original sources before reconciliation.
for(const event of latest.aiEvents.filter(e=>e.contentKind==='paper')){
 const f=fetched(event.paper.paperUrl);
 manifest.verifiedSources.push({url:event.paper.paperUrl,checkedAt:f.checkedAt,success:true,verification:'verified',sourceClass:'original_research',method:'已读原始摘要、作者与提交历史；中文解读为摘要级，未声称全文复现',eventIds:[event.id],evidencePath:f.path,contentExcerpt:event.summary});
}
const p=cat.papers.find(p=>p.id==='arxiv-2609-39388');
if(!p.relatedRepositories.some(r=>r.repo==='Fysics-AI/UniWAM'))p.relatedRepositories.push({repo:'Fysics-AI/UniWAM',url:'https://github.com/Fysics-AI/UniWAM',relation:'official_code',labelZh:'作者仓库及原始论文身份已核对',evidenceUrl:p.url,confidence:'high',verified:true,checkedAt:now});
// The product guide is evidence of current documented workflow, not a new model release.
const kimiUrl='https://www.kimi.ai/help/3d-make/3d-make-overview',kf=fetched(kimiUrl),kimi={id:'ai-'+date+'-kimi3d-guide',date,sourceReportId:'ai-'+date,title:'Kimi 3D Make 官方指南说明网页、建模与打印三类工作流',summary:'官方指南确认3D Make由K3.1 Pro驱动，可从描述或参考图生成3D网页、模型与打印文件，支持预览、多轮修改、Remix和分享。这是当前文档的工作流核验；K3.1 Pro与3D能力此前已有发布，不将11月1日社区演示误写为全新模型或功能首发。',whyItMatters:'为建筑、室内和工业设计的小型3D原型提供可核对的产品路径。',action:'以同一参考模型检查比例、可编辑性、文件导出和实际打印约束，不采用社区样本的耗时与费用作为统一承诺。',boards:['AI 3D / World Models','Workflow / Tutorial / Usage Tips'],priority:'A',sourceType:'official_announcement',verification:'verified',contentKind:'industry_event',entities:[],repoCandidates:[],sources:[{label:'Kimi 官方功能指南',url:kimiUrl}],readingSources:[],dateSemantics:'2026-11-02核验当前官方文档；原始产品与模型发布属10月既有事件，本条不声明新首发。'};
latest.aiEvents.push(kimi);manifest.events.push(kimi);
manifest.verifiedSources.push({url:kimiUrl,checkedAt:kf.checkedAt,success:true,verification:'verified',sourceClass:'official',method:'完整阅读官方功能指南，核对产品入口和支持类型；未运行付费生成',eventIds:[kimi.id],evidencePath:kf.path,contentExcerpt:kimi.summary});
const catDecision=(id,reason)=>({disposition:'catalogued',importance:'high',reason,eventIds:[],paperIds:[id],checkedAt:now,nextAction:'完整解读与原始日期已在公开论文目录保留；后续精选继续比较，不冒充下一日新论文。'});
Object.assign(review.media.items.find(r=>r.id==='media-156f3096451c0f9a6cb1'),catDecision('arxiv-2610-40503','已定位并读arXiv与AWM作者项目页，10月29日首发/30日修订；高优先级研究完整入公开目录，日报仍限三篇，保留模型条件与真实世界落差。'));
Object.assign(review.media.items.find(r=>r.id==='media-93fc5729c04f0889e39e'),catDecision('arxiv-2609-39388','公众号不可读后改查作者原始论文与完整仓库，确认24项真机任务和公开导航资源；真机策略检查点未发布。论文目录完整保留，不将9月论文冒充新首发。'));
Object.assign(review.media.items.find(r=>r.id==='media-ecef6a07280203747c8e'),catDecision('arxiv-2610-12426','已读10月8日原始摘要并完整入公开目录；协作数学成果的正确性尚未独立复现，保留原始日期和摘要级边界，日报三篇已用满。'));
Object.assign(review.memene.items.find(r=>r.id==='359553'),{disposition:'covered',importance:'high',reason:'补查到官方3D Make功能指南与当前入口，已核对网页/建模/打印工作流；未把社区演示误认为新模型首发。',eventIds:[kimi.id],checkedAt:now});
review.memene.items.find(r=>r.id==='359540').importance='high';
review.memene.items.find(r=>r.id==='359555').disposition='covered';
for(const row of review.media.items)if(row.disposition==='mixed'&&row.id!=='media-d12d1f6a76d3e3381b87')row.disposition='covered';
const walk=rows=>{for(const row of rows){if(row.disposition==='pending')row.nextAction=row.nextVerificationStep??row.nextAction??'取得完整作者/官方原文并核对日期、方法与适用范围后重新审阅。';if(row.subreviews)walk(row.subreviews);}};
walk(review.memene.items);walk(review.media.items);
// Attach Chinese reading only where the actual corresponding text was read.
for(const event of latest.aiEvents.filter(e=>e.contentKind==='paper')){
 const link=event.paper.paperUrl.endsWith('2610.26659')?'https://aiera.com.cn/asi-post.html?id=121791':null;
 event.readingSources=link?[{label:'新智元：室内主动建图解读',url:link,language:'zh',role:'coverage'}]:[];
 review.readingReviews.push(link?{eventId:event.id,status:'provided',checkedAt:now,urls:[link],reason:'已读完整中文报道并与作者摘要对照；事实来源另绑定arXiv原文。'}:{eventId:event.id,status:'not_found',checkedAt:now,checkedSources:['9个启用中文入口的104候选','原始论文与作者公开链接'],reason:'本轮可读中文公开正文中未找到该论文的对应独立文章；Memene仅内部摘要，不能作为阅读入口。'});
}
review.readingReviews.push({eventId:kimi.id,status:'not_found',checkedAt:now,checkedSources:['Kimi当前官方英文功能指南','本日中文媒体104候选','Kimi中文make3d交互入口（非正文指南）'],reason:'已读官方指南为英文，本轮未取得相同操作指南的完整中文正文，不把产品入口当中文解读文章。'});
cat.stats.totalPapers=cat.papers.length;
cat.dailyRecommendationSelection.previousAutomaticSelection=['arxiv-2606-25430','arxiv-2610-39232','arxiv-2610-26659'];
for(const [path,data] of [['data/dev/ai-events-latest.json',latest],[`data/dev/ai-editorial-repairs-${date}.json`,manifest],[`data/dev/ai-discovery-review-${date}.json`,review],['data/dev/papers-catalog.json',cat],['paper-review-overrides.json',overrides]])await write(path,data);
console.log(JSON.stringify({events:latest.aiEvents.length,catalogPapers:cat.papers.length,extraResearch:specs.map(s=>s[0])}));

import {readFile,writeFile} from 'node:fs/promises';
const date='2026-10-31',base=`data/dev/source-archives/audit-0900-${date}/`,now=new Date().toISOString();
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const [a,m,v]=await Promise.all(['data/dev/ai-events-latest.json',`data/dev/ai-editorial-repairs-${date}.json`,`data/dev/ai-discovery-review-${date}.json`].map(read));
const id=k=>`ai-${date}-${k}`;
// The official model card was readable through the web reader; direct local failures remain archived.
const model={id:id('sensenova-loop'),date:'2026-10-30',title:'商汤发布SenseNova-Loop-9B预览模型，循环共享权重延长计算路径',summary:'商汤官方模型卡以10月30日为发布日，介绍约9B参数的多模态模型：共享中间解码层执行两遍，支持图文输入和文本输出，训练序列最长262144 token，页面标注Apache-2.0许可。',whyItMatters:'参数共享与多模态长上下文为文档和Agent工作流提供新的工程选择。',action:'按官方卡区分约9B总参数与推理执行量；技术报告和独立Transformers实现发布细节仍待公告，不把厂商对比当独立实测。',priority:'B',boards:['AI Product / Model Launch','AI Agent'],sourceType:'official_announcement',verification:'verified',entities:[],contentKind:'industry_event',sourceReportId:`ai-${date}`,repoCandidates:[],sources:[{label:'商汤官方模型卡',url:'https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview'}],readingSources:[{label:'橘鸦Juya · 中文导读',url:`https://daily.juya.uk/issues/${date}/#s19`,language:'zh',role:'discovery'}],dateSemantics:'模型卡News明确2026.10.30；保留原始发布日。'};
if(!a.aiEvents.some(e=>e.id===model.id)){
 a.aiEvents.push(model);m.events.push(model);m.verifiedSources.push({url:model.sources[0].url,checkedAt:now,success:true,verification:'verified',sourceClass:'official',method:'Read official Hugging Face model card through web search full source result: dated News, specifications, license and release-status table. Direct local request failures retained; no download or execution.',contentExcerpt:model.summary,eventIds:[model.id],evidencePath:base+'sensenova-web-review.json'});
 await writeFile(base+'sensenova-web-review.json',JSON.stringify({checkedAt:now,url:model.sources[0].url,newsDate:'2026-10-30',facts:model.summary,limits:model.action,method:'Official model-card body read via web reader; direct attempts in initial/primary results remain failed.'},null,2)+'\n');
}
const forge=a.aiEvents.find(e=>e.id===id('forgekernel'));
if(forge)forge.action+=' 官方README区分source、blind和无reference生成模式；不能把一次直播的零参考条件概括成整个系统从不使用参考实现。';
for(const e of m.events)if(e.id===forge?.id)e.action=forge.action;
const update=(r,keys,reason)=>{if(!r)throw Error('Missing candidate');delete r.carriedFromRunDate;Object.assign(r,{importance:'high',disposition:'added',reason,eventIds:keys.map(id),checkedAt:now});};
const mem={
 '358793':[['forgekernel'],'已读量子位完整正文，并补核官方README、目录和活动；直播配置与系统reference模式分别说明，补入真实10月30日遗漏。'],
 '358794':[['x7-ultra'],'已读量子位完整芯片报道；补入X7 Ultra公开介绍，利用率、量化相似度均保留厂商测试口径，不据标题宣布独立验证。'],
 '358786':[['training-preferences'],'已读OpenAI10月30日正文，补入此前未发布的训练偏好承诺；实施为未来数月，保留日期，不写成今日生效。']
};
for(const [key,[keys,reason]]of Object.entries(mem))update(v.memene.items.find(r=>r.id===key),keys,reason);
const media={
 'media-7b5ec63ba2f627258b99':[['primesim'],'机器之心公开RSS完整正文已读；补入未发表的世界模型遗漏，保留10月30日报道日及代码即将开放的限制。'],
 'media-675e9e053c693878f055':[['forgekernel'],'量子位正文与官方仓库分别核对；补入明确日期的算子优化系统，区分特定算子数据与整体实现模式。'],
 'media-cab620b89f065db54a61':[['oxr'],'量子位完整原文及SoMark官方README、目录已读；按10月30日技术报道补入，不把更早的仓库创建日伪装成当日首次开源。'],
 'media-5d096e437ca717a48441':[['open-h3-regenerate'],'已读MiniMax授权原文；开放实现与官方API模块区分，B200条件及未复现范围明确。'],
 'media-d7a89d9676f987bb6a25':[['wita-omni'],'GO-3沿既有历史事件；本次新增WITA-OMNI及Worken的报道信息，保留企业自述，不重复旧GO-3发布。'],
 'media-8f3e7f31ec06494fe36f':[['tianxi45'],'已读联想授权全文，AIPC上线日期10月30日；本条为多端和办公连接器补漏，不照录效率承诺。'],
 'media-666a1f719c44600b5278':[['baidu-app-upgrade'],'已读量子位10月30日沟通会报道；功能、活动价与递归改进自述分别限定。'],
 'media-4360b42bce7a074b01fa':[['x7-ultra'],'已读量子位完整原文；区分已有X7量产和本次Ultra公开介绍，保留所有厂商数据归属。'],
 'media-2327df5ded573c6d6358':[['x7-ultra'],'已读发布方公开API全文；与量子位X7 Ultra为同一芯片发布合并，不新增第二条。']
};
for(const [key,[keys,reason]]of Object.entries(media))update(v.media.items.find(r=>r.id===key),keys,reason);
const j=v.media.items.find(r=>r.id==='media-b480e0921e69c8d678ee');
for(const [section,key,reason]of [
 ['s13','cursor-extension-security','已读Cursor官方全文与10月30日更新；补入历史漏项，事故日保留29日，不把更新日重标为新事故。'],
 ['s19','sensenova-loop','本机原请求失败保留；官方模型卡经web全文核对明确News日期、规格、许可及尚待发布内容，补入已验证模型公告。'],
 ['s22','training-preferences','OpenAI30日公告在此前主库未收录；按重要治理漏项补写并保留真实日期，不宣称标准已完成或立即执行。'],
 ['s24','community-safety','OpenAI30日原始公告已读；补入未发布的安全治理计划，明确报告2027年初及措施分批生效。']
])update(j.subreviews.find(r=>r.id===section),[key],reason);
j.eventIds=[...new Set(j.subreviews.flatMap(r=>r.eventIds??[]))];j.reason=`全部${j.subreviews.length}节逐节核对；独立补漏后刷新已覆盖项，未核实原帖和缺少原始日期的条目仍保留真实pending。`;j.checkedAt=now;
const priorRead=new Map(v.readingReviews.map(r=>[r.eventId,r]));
v.readingReviews=a.aiEvents.map(e=>priorRead.get(e.id)??{eventId:e.id,status:e.readingSources?.length?'provided':'not_found',urls:(e.readingSources??[]).map(s=>s.url),checkedAt:now,reason:e.readingSources?.length?'已读该事件对应公开中文正文或指定橘鸦导读节；独立原始事实另有证据，不使用内部发现链接。':'已检查当日9个中文入口、105候选与全部橘鸦章节，未找到与本事件直接相关的合格公开中文原文。'});
for(const [p,x]of [['data/dev/ai-events-latest.json',a],[`data/dev/ai-editorial-repairs-${date}.json`,m],[`data/dev/ai-discovery-review-${date}.json`,v]])await writeFile(p,JSON.stringify(x,null,2)+'\n');
console.log(JSON.stringify({events:a.aiEvents.length,reviewedMemene:v.memene.items.length,reviewedMedia:v.media.items.length,sections:j.subreviews.length}));

import {readFile,writeFile} from 'node:fs/promises';
const date='2026-10-30',base='data/dev/source-archives/audit-0900-'+date,now=new Date().toISOString();
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const [latest,m,media,fetches]=await Promise.all(['data/dev/ai-events-latest.json',`data/dev/ai-editorial-repairs-${date}.json`,'data/dev/ai-media-latest.json',base+'/fetch-results.json'].map(read));
function add(key,day,title,summary,why,action,url,{proof,section,boards=['AI Product / Model Launch'],sourceClass='official',method,priority='B',readingUrl}={}){
 const id=`ai-${date}-${key}`,r=fetches.find(r=>r.i===proof);
 const e={id,date:day,title,summary,whyItMatters:why,action,boards,priority,sourceType:sourceClass==='trusted_media'?'media_report':'official_announcement',verification:'verified',entities:[],contentKind:'industry_event',sourceReportId:`ai-${date}`,repoCandidates:[],sources:[{label:sourceClass==='trusted_media'?'中文原文报道':'官方原始来源',url}],readingSources:section?[{label:'橘鸦Juya · 中文导读',url:`https://daily.juya.uk/issues/${date}/#${section}`,language:'zh',role:'discovery'}]:readingUrl?[{label:'中文原文报道',url:readingUrl,language:'zh',role:'coverage'}]:[],dateSemantics:'保留原始事实日期；报道日与首次发生日区分。'};
 latest.aiEvents.push(e);m.events.push(e);m.verifiedSources.push({url,checkedAt:r?.checkedAt??now,success:true,verification:'verified',sourceClass,method:method??'Read original Chinese body, attribution and explicit date; do not infer results beyond supplied evidence.',contentExcerpt:summary,eventIds:[id],evidencePath:r?.path??base+'/web-official-reviews.json'});
}
const webReviews=[
 {url:'https://openai.com/index/how-we-detect-frontier-model-misalignment',date:'2026-10-29',checkedAt:now,method:'Full official web reader; direct fetch403 retained; date, monitoring architecture, replay versus live incident read.',facts:'Astra-level frontier RL/evals monitored; replay alerted about30min after sandbox escape, versus live September DNS breach flagged within15min; scenarios must not be conflated.'},
 {url:'https://openai.com/index/updated-model-spec',date:'2026-10-29',checkedAt:now,method:'Official web article read and dated spec independently fetched.',facts:'Five values; context, oversight and agency; much detailed style guidance retired.'},
 {url:'https://openai.com/index/ropes-gray-ai-diligence',date:'2026-10-29',checkedAt:now,method:'Full official case-study body/date read through web reader after direct403.',facts:'Commercial-contract first pass groups and summarizes documents; lawyers review every deliverable. Hours instead of weeks is an ambition, not an independently audited universal result.'}
];
await writeFile(base+'/web-official-reviews.json',JSON.stringify(webReviews,null,2));
add('misalignment-monitor','2026-10-29','OpenAI 扩展前沿模型行为监控，覆盖强化学习、评估与工具使用','OpenAI介绍扩展的多层监控体系，涵盖前沿模型强化学习、评估、内部使用及部分外部部署。事件重放在逃逸约30分钟后报警；9月实际联网事件则在15分钟内被标记，两者是不同测试。','Agent越能行动，越需要隔离、可追溯监控与人工响应。','不要把重放结果写成已阻止历史事故；监控仍是纵深防御的一层。',webReviews[0].url,{priority:'A',section:'s35',boards:['AI Security / Governance','AI Agent'],method:webReviews[0].method});
add('model-spec','2026-10-29','OpenAI 更新 Model Spec，围绕五项价值重组行为指导','OpenAI于10月29日更新Model Spec，围绕忠实于人类意图、减少伤害、诚实透明、人类自主性与关怀重组指导，补充上下文、监督与行动影响要求，并删除多项详细风格指导。','行为规范从逐条措辞进一步转向复杂情境中的判断与监督。','区分规范目标与模型实际表现，仍需用具体任务检验。',webReviews[1].url,{priority:'A',section:'s36',boards:['AI Security / Governance'],method:webReviews[1].method});
add('ropes-gray','2026-10-29','Ropes & Gray 与 OpenAI 开发尽调初审工具，律师保留最终复核','OpenAI的10月29日案例介绍，Ropes & Gray正开发合同尽调工具，梳理大量文档、分组并按律所格式生成初稿；律师仍需复核源文档和全部交付结果。','垂直专业Agent的价值在结构化初审与证据回看。','将数周缩短到数小时是律所公开目标，不当作已独立验证的普适成效。',webReviews[2].url,{boards:['AI Agent','Workflow / Tutorial / Usage Tips'],method:webReviews[2].method});
add('alphabet-market','2026-10-29','极客公园：Alphabet 股价盘中一度跌逾13%，市场关注AI变现压力','极客公园10月30日早报转述美国29日市场反应：Alphabet股价盘中一度下跌逾13%，市值减少逾5000亿美元；报道将担忧联系到搜索广告、AI变现与现金流压力。','AI能力与云增长不自动等于核心商业模式已消除转型压力。','保留盘中时点、转述和市场判断归属；不把盘中跌幅写成收盘涨跌。','https://www.geekpark.net/news/373154',{proof:1,priority:'A',sourceClass:'trusted_media',readingUrl:'https://www.geekpark.net/news/373154',boards:['Market / Business Model']});
add('jingshuo-funding','2026-10-29','景烁科技披露数千万美元 pre-A 融资，聚焦物理AI数据基础设施','量子位10月29日获授权转载公司公告：文远知行旗下景烁科技获得数千万美元pre-A融资，产品体系包括WorldEngine数据与模型平台、GENESIS-Robotics世界模型及第一视角采集设备。','真实操作数据、治理与模型训练之间的基础设施持续获得投入。','融资与业务进展为公司披露；订单、客户和增长数字未经独立财务审计，不扩大为已兑现营收。','https://www.qbitai.com/2026/10/506281.html',{proof:19,sourceClass:'trusted_media',readingUrl:'https://www.qbitai.com/2026/10/506281.html',boards:['Financing / Investment','AI 3D / World Models']});
add('xiaoyu-lab','2026-10-27','小雨智造与钢结构质检中心共建具身焊接与检测实验室','量子位10月29日转载小雨智造公告，实验室于10月27日揭牌，结合具身机器人焊接工艺开发、试样检测与性能验证，并培养复合型技能人才。','钢结构质量标准与机器人作业结合，贴近AEC及制造现场。','产能、成本和焊接表现为厂商客户案例，不把单车间成效外推至全部产线。','https://www.qbitai.com/2026/10/506273.html',{proof:20,sourceClass:'trusted_media',readingUrl:'https://www.qbitai.com/2026/10/506273.html',boards:['AI-CAD / AEC','AI 3D / World Models']});
// Chinese originals obtained through the publisher's documented page API.
const extra=await read(base+'/extra-results.json');
for(const spec of [
 ['qiyuan','2026-10-30','启元分享家庭机器人的快慢脑与数据闭环路线','新智元10月30日报道启元的家庭机器人路线：以通用大模型负责高层规划，自研VLA承担高频动作，结合遥操作与便携采集形成数据闭环；文中称已下线5000台产品。','家用物理AI需要模型、数据与特定本体协同，不能只靠通用模型API。','量产数量为报道中的企业自述；H系列家务能力仍在迭代，不把陪伴硬件等同通用家务机器人。',124,'121295'],
 ['wika-data','2026-10-28','威卡介绍工程机械多模态数据采集，连接作业经验与具身训练','量子位10月28日报道威卡围绕挖掘机采集视觉、激光、位姿、力反馈与操纵输入，通过统一时间戳保留现场操作链路。','工程机械与AEC智能化需要动作、物理状态和操作意图对齐的数据。','采集成本和所需训练小时数来自受访企业估计，不作为行业统一预算。',33,null]
 ]){
 const [key,day,title,summary,why,action,i,post]=spec;
 const r=post?extra.find(r=>r.i===i):fetches.find(r=>r.i===i);
 const url=post?`https://aiera.com.cn/asi-post.html?id=${post}`:r.url;
 add(key,day,title,summary,why,action,url,{proof:post?undefined:i,sourceClass:'trusted_media',readingUrl:url,boards:['AI 3D / World Models','AI-CAD / AEC']});
 if(post){m.verifiedSources.at(-1).checkedAt=r.checkedAt;m.verifiedSources.at(-1).evidencePath=r.path;}
}
m.audit0900.originalWebReviews=base+'/web-official-reviews.json';
await writeFile('data/dev/ai-events-latest.json',JSON.stringify(latest,null,2)+'\n');
await writeFile(`data/dev/ai-editorial-repairs-${date}.json`,JSON.stringify(m,null,2)+'\n');
console.log({acceptedIndustryEvents:latest.aiEvents.length});

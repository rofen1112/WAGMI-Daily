import {readFile,writeFile} from 'node:fs/promises';
const date='2026-10-29',batchId='wagmi-09-00:'+date;
const base='data/dev/source-archives/audit-0900-'+date+'/';
const path='data/dev/ai-editorial-repairs-'+date+'.json';
const manifest=JSON.parse(await readFile(path,'utf8'));
const results=JSON.parse(await readFile(base+'fetch-results.json','utf8'));
const extras=JSON.parse(await readFile(base+'extra-results.json','utf8'));
const observations={
 0:'10月28日Google原文：Carbon强调长程编码与网络安全；本周先向部分网络防御者及可信伙伴开放，开发者、企业及消费者广泛接入仍待后续。官方基准未独立复测。',
 1:'10月28日Connected Apps平台预览：cloud MCP或Android AppFunctions、控制台注册测试送审；伙伴Gemini已上线与Search后续上线分别保留。',
 2:'10月28日Gemini原文：学生中心分层交互探索支持简体中文；聊天入口与语音旁白属于后续功能。没有试玩或验证三维资产导出。',
 3:'10月28日Google原文列十国AI Mode广告扩展、美国多轮广告和Sponsored标记；其他地区仍属计划，表现数字为内部数据。',
 4:'10月28日GitHub原文：Fusion一般可用、三档努力及Single/Cascade/Critique编排；沿用组织模型策略，按各模型标准费率计费。',
 5:'同日GitHub原文明确本地路由为主动启用的实验预览；托管Windows ML、CLI手动跨系统模型与云端路由边界分别说明，不称为离线会话。',
 6:'10月28日GitHub正文：共享自动化由仓库持有，读权限可看、写权限可改、所有者计费，组织需开关，正在分批推送。',
 13:'10月28日Anthropic正文列20家科学合作对象、Claude额度和仍在早期的研究；MHS实验仪器规范是research preview，不称已证实科研疗效。',
 14:'Simon10月28日作者原文读到四款游戏、提示及迭代经验；复杂游戏仍要试玩调逻辑。个人经验未做对照实验，本批未试玩或观看视频。',
 15:'原始摘要：ArtifactWorld以107.5K配对视频及缺陷热图引导视频扩散修复3DGS；首次4月14日，v2为9月29日。仅摘要级复核，未复现实验。',
 16:'VidEdit3D原始摘要：轨迹引导渲染、Flow-Aligned Video Editing与区域选择3DGS细化；首次提交10月26日17:03:44UTC。论文目录推荐日期与首发日期分开。',
 17:'具身三维综述原始摘要把3D生成分为Data Generator、Simulation Environments、Sim2Real Bridge，强调运动学、材质及物理有效性。首次4月29日，v4为10月23日。',
 19:'Claude Code官方release API最新稳定2.1.312发布2026-10-27T20:24:20Z，目录技能发现及大规则文件覆盖修复早于本次增量，不重标新发布。',
 20:'Codex官方release API最新列表为0.166.0 alpha预发布；不把alpha版本当作新稳定发布。',
 23:'Planner5D公开列表仍为更早文章；当前访问时间与导航不证明今日新发布，未新增正式事件。',
 28:'OpenAI官方RSS最新ServiceNow、future-of-firm、Legora均为10月28日；前后两客户/合作事件已在日报，不把RSS抓取时间写为事件时间。',
 29:'Google AI RSS最新AI Quest日期10月26日，不能用访问日期充当新事件。'
};
const reviews=[];
for(const [key,contentExcerpt] of Object.entries(observations)){
 const r=results[Number(key)]; if(!r.success)throw Error('Unsuccessful source '+key);
 const prior=manifest.verifiedSources.find(s=>s.url===r.url);
 reviews.push({url:r.url,checkedAt:r.checkedAt,success:true,verification:'verified',sourceClass:prior?.sourceClass??'official',method:'独立读取原始正文/摘要与真实日期，和当前正式事件比较；仅元数据的来源不证明正式发布。',contentExcerpt,eventIds:prior?.eventIds??[],discoveryChecked:!(prior?.eventIds?.length),auditBatchId:batchId,evidencePath:base+key+(Number(key)===19||Number(key)===20?'.raw':'.txt')});
}
for(const [key,contentExcerpt] of Object.entries({'10-retry':'NVIDIA官方发布者模型卡含语音理解、推理说明与许可边界；未下载运行。初次网络失败，定向重试HTTP200，失败日志保留。','22-retry':'Meshy列表7.1为两个月前、纹理三个月前、Agent五个月前；研究列表十天前，未取得当前增量发布，不重标日期。初次网络失败保留。','26-retry':'Hugging Face text-to-3d元数据：最新TopX-OOD和社区Hunyuan副本保留发现层；lastModified不等于官方首次发布，不直接新增正式模型事件。'})){
 const r=extras.find(x=>x.key===key);if(!r?.success)throw Error('Retry failed '+key);
 const prior=manifest.verifiedSources.find(s=>s.url===r.url);
 reviews.push({url:r.url,checkedAt:r.checkedAt,success:true,verification:'verified',sourceClass:'official',method:'网络失败后一次定向重试，读取官方模型卡或目录元数据并核对发布边界。',contentExcerpt,eventIds:prior?.eventIds??[],discoveryChecked:!(prior?.eventIds?.length),auditBatchId:batchId,evidencePath:base+key+'.txt'});
}
const additions=[
 {id:'ai-2026-10-29-chatgpt-api-credits',date:'2026-10-28',title:'ChatGPT 合资格订阅新增 API 额度权益，最高每月 500 美元',summary:'OpenAI在10月28日API更新日志公布，符合条件的Pro和Business付费订阅可领取API额度。金额依档位或付费席位而定，需关联自己拥有的API组织；并非所有订阅都获500美元。',whyItMatters:'订阅与API开发的成本入口开始衔接，可影响小团队原型验证预算。',action:'核对订阅满七天、所有者和邮箱条件；额度到期不结转，首次发放可能按剩余周期折算。本批只核查文档，未领取或调用API。',boards:['Market / Business Model','AI Agent','Workflow / Tutorial / Usage Tips'],priority:'B',sources:[{label:'官方10月28日更新日志',url:'https://developers.openai.com/api/docs/changelog'},{label:'官方资格和额度说明',url:'https://developers.openai.com/api/docs/guides/chatgpt-api-credits'}]},
 {id:'ai-2026-10-29-octoverse',date:'2026-10-28',title:'GitHub 发布 Octoverse 2026，新增行业视角观察 Agent 开发',summary:'GitHub年度报告新增行业分类：用模型对公开仓库随机样本的名称、说明、主题和README归类。报告称建筑领域约9%的仓库出现Agent发起的PR，为所列行业最高；这是平台观测，不代表设计成果质量。',whyItMatters:'建筑与制造等垂直领域的编码Agent采用值得单独观察，热度之外可据此找工作流需求。',action:'保留抽样分类、公开仓库及观测口径；Agent配置文件与提交量的相关性不能证明因果，也不把平台数据当全行业市场规模。',boards:['AI Coding','AI-CAD / AEC','Market / Business Model'],priority:'B',sources:[{label:'GitHub官方年度报告及方法',url:'https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/'}]}
];
for(const event of additions){
 Object.assign(event,{datePrecision:'day',dateSemantics:'官方原文给10月28日日级日期；保留真实发布日，不伪造时刻。',sourceType:'official_announcement',verification:'verified',entities:[],contentKind:'industry_event',sourceReportId:'ai-'+date,repoCandidates:[],weeklyRecommended:true});
 if(!manifest.events.some(e=>e.id===event.id))manifest.events.push(event);
 for(const source of event.sources){const key=source.url.includes('chatgpt-api-credits')?'api-credits':source.url.includes('changelog')?'api-changelog':'octoverse-original';const r=extras.find(x=>x.key===key);if(!r?.success)throw Error('New event lacks original '+key);reviews.push({url:source.url,checkedAt:r.checkedAt,success:true,verification:'verified',sourceClass:'official',method:'独立读取官方完整正文、原始日期及资格/方法边界；候选来自Memene，原文独立核验。',contentExcerpt:key==='api-changelog'?'2026年10月28日Feature：合资格ChatGPT Pro和Business订阅可领最高每月500美元API额度，关联自己拥有的API组织。':key==='api-credits'?'官方文档：额度按Pro档位或Business付费席位；Business每工作区每月上限500美元。需付费订阅至少七天、双方所有者及相同邮箱；周期到期不结转。':'GitHub10月28日报告：行业归类来自2022至2026每年公开仓库随机样本的模型分类；建筑约9%仓库有Agent发起PR，制造其次。区分相关性与因果。',eventIds:[event.id],auditBatchId:batchId,evidencePath:base+key+'.txt'});}
}
manifest.verifiedSources.push(...reviews);
manifest.noNewEvents=false;manifest.discoveryChecked=true;
manifest.audit0900={batchId,checkedAt:new Date().toISOString(),noNewEvents:false,discoveryChecked:true,newEventIds:additions.map(e=>e.id),independentReviews:reviews.length,memene:{recordId:'168137907427606528',candidates:22},notes:['新发现API额度和Octoverse两条均独立读取官方正文与日期；其他财报、IPO传闻、社交事件未因聚合摘要直接发布。','初次模型卡、Meshy和模型元数据网络失败经一次定向重试恢复；失败日志保留。','三篇论文保持原始发表日期与摘要级证据边界。']};
await writeFile(path,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest.audit0900,null,2));

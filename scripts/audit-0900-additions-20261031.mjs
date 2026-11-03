import {readFile,writeFile} from 'node:fs/promises';
const date='2026-10-31',base=`data/dev/source-archives/audit-0900-${date}/`;
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const now=new Date().toISOString();
const [initial,extra,media,rss]=await Promise.all([base+'initial-results.json',base+'extra-results.json','data/dev/ai-media-latest.json',base+'rss-bodies.json'].map(read));
const additions=[],evidence=[];
function add(key,day,title,summary,why,action,source,{priority='B',boards=['AI Product / Model Launch'],repos=[],section,sourceClass='trusted_media',url}={}){
 const id=`ai-${date}-${key}`,reference=url??source.url;
 const e={id,date:day,title,summary,whyItMatters:why,action,priority,boards,repoCandidates:repos,sourceType:sourceClass==='official'?'official_announcement':'media_report',verification:'verified',entities:[],contentKind:'industry_event',sourceReportId:`ai-${date}`,sources:[{label:sourceClass==='official'?'官方原始正文':'中文原始报道',url:reference}],readingSources:sourceClass==='trusted_media'?[{label:'中文原始报道',url:reference,language:'zh',role:'coverage'}]:section?[{label:'橘鸦Juya · 中文导读',url:`https://daily.juya.uk/issues/${date}/#${section}`,language:'zh',role:'discovery'}]:[],dateSemantics:'保留首次发布或明确报道日期；厂商测试及计划保留归属。'};
 additions.push(e);evidence.push({url:reference,checkedAt:source.checkedAt??now,success:true,verification:'verified',sourceClass,method:'Read original body and explicit date; checked attribution, scope, availability and historical event duplication.',contentExcerpt:summary,eventIds:[id],evidencePath:source.path});return e;
}
const src=i=>{const r=initial.find(r=>r.i===i);if(!r?.success)throw Error('Missing fetched source '+i);return r;};
const prime=rss.find(r=>/启元PrimeSim/.test(r.title));if(!prime)throw Error('Missing PrimeSim original RSS body');
add('primesim','2026-10-30','启元发布 PrimeSim 机器人世界模型，权重与代码仍待开放','机器之心10月30日原文介绍PrimeSim：以机器人数据中训练及后训练，把视频模型改造为动作条件、多视角、长时序的仿真器。团队报告覆盖22类本体，单张A100特定三视角配置约10.1 FPS；文末明确权重与训练、推理代码即将开源。','动作跟随、跨视角一致性和长期推演关联机器人仿真落地。','性能属于团队实验；即将开源不能写成已取得可部署代码，更不能把仿真相关性等同所有真机成功率。',{url:prime.url,checkedAt:extra.find(r=>r.i===21).checkedAt,path:base+'rss-bodies.json'},{priority:'A',boards:['AI 3D / World Models']});
add('forgekernel','2026-10-30','面壁 ForgeKernel 开放算子优化系统，直播演示特定 B200 算子调优','量子位10月30日报道，面壁与OpenBMB开放ForgeKernel。其B200直播从数学定义和硬件约束开始，经42轮迭代获得472微秒版本，比较的FlashMLA实现为518微秒；报道将该配置描述为快约9.8%。','可验证的算子生成与性能反馈提供Agent工程优化样例。','9.8%为来源采用的该算子吞吐表述，耗时下降约8.9%；不能外推为所有模型或国产算力整体提速。',src(52),{boards:['AI Coding','AI Agent'],repos:['OpenBMB/ForgeKernel']});
add('oxr','2026-10-30','SoMark 发布 OXR 文档解析模型，布局分析与识别排序分离','量子位10月30日介绍SoMark的OXR：轻量模块负责布局分析，主模型结合识别与阅读顺序，并以错误归因、数据生成和迭代训练改善文档解析。原文给出官方代码、权重及复现入口。','可插拔布局模块与结构化输出适合知识库和文档Agent前处理。','榜单、免费API与速度均保留发布方和作者测试口径；先用真实复杂表格复核，不把免费演示承诺当永久服务。',src(60),{boards:['AI Coding','AI Agent'],repos:['SoMarkAI/OXR']});
add('open-h3-regenerate','2026-10-30','NVIDIA与MIT团队开放基于MiniMax H3的视频重生成方案','量子位10月30日获授权转载MiniMax说明：Efficient-Large-Model团队发布Open-H3-Regenerate-2K权重，并在NVlabs/Sana提供推理代码，支持2K及最高4K重生成。单B200约5秒视频的特定预热测试由87.26秒降至22.45秒。','开放视频细化模块提供本地制作与高分辨率迭代路径。','这是独立开放实现；官方H3-Regenerate模块仍经API提供。画质与约3.9倍加速来自团队特定测试，未在本机复现。',src(59),{boards:['AI 3D / World Models','Workflow / Tutorial / Usage Tips'],repos:['NVlabs/Sana']});
add('x7-ultra','2026-10-31','新芯航途介绍X7 Ultra，围绕量产智驾模型协同设计芯片','量子位10月31日报道XHEART首次正式公开亮相及X7 Ultra，披露700 TOPS、超大核NPU、工具链和专用算子设计。98.7%利用率及输出与FP32基准相似度超过99.99%均为发布方指定测试。','端侧物理AI需要模型架构、内存搬运和硬件调度共同优化。','不把TOPS直接等同驾驶能力；区分已有量产X7和本次X7 Ultra，不将厂商测试写成独立实测。',src(34),{boards:['AI 3D / World Models']});
add('wita-omni','2026-10-30','智元介绍WITA-OMNI交互模型与Worken作业指标','量子位10月30日对创新日的报道新增WITA-OMNI交互模型细节：把语音、视觉、文本与语音表情动作输出组合，前台交互和后台规划工具任务分工。Worken按活跃机器人、自主时长和产出效能统计有效作业。','机器人价值评估开始同时关注自然交互和真实岗位产出。','GO-3已在前日日报，沿原事件保留；本条仅补交互模型和作业计量报道。榜单及商业场景数字为厂商披露，Worken并非行业标准。',src(48),{boards:['AI 3D / World Models','AI Agent']});
add('tianxi45','2026-10-30','联想天禧AI 4.5登陆AIPC，扩展跨端执行与办公连接器','联想提供、量子位授权转载的10月30日公告称，天禧AI 4.5正式覆盖AIPC，结合已上线的手机和平板版本，新增超能模式、技能广场、办公连接器、会议总结和移动端接续PC任务。','多设备执行与工作资料连接为办公Agent提供完整任务入口。','这是厂商功能公告；连接器支持和设备、账户条件需逐一复测，不照录无条件Token自由或效率保证。',src(53),{boards:['AI Agent','Workflow / Tutorial / Usage Tips']});
add('baidu-app-upgrade','2026-10-30','百度APP发布搜索、AI镜头与可视化交互升级','量子位10月30日报道百度APP沟通会，围绕搜索框、AI镜头、GUI可视化和AI互动应用升级，并介绍多步任务、持续跟踪和搜索AI API活动价格。','搜索产品正把检索与任务交付、持续提醒结合。','递归自我进化为发布方描述，不等于独立证明；活动最低价不作为固定长期报价，账户与具体任务效果需核对。',src(57),{boards:['AI Agent','Workflow / Tutorial / Usage Tips']});
add('cursor-extension-security','2026-10-29','Cursor披露扩展市场恶意Claude Code包，10月30日更新处置说明','Cursor官方安全公告确认，10月29日其VS Code扩展市场分发的Anthropic.claude-code 2.1.312与2.1.313含恶意修改，影响Windows和macOS；已下架并关闭攻击服务器。10月30日更新明确受影响版本和指标。','编码Agent扩展的分发链与持久化载荷需要分别核查。','这些包并非Anthropic开发；不能声称官方分发同样受影响。卸载可能不足以清除独立持久化，按官方公告核对受影响范围。',src(85),{sourceClass:'official',priority:'A',boards:['AI Security / Governance','AI Coding'],section:'s13'});
const web=[
 {key:'training-preferences',url:'https://openai.com/index/helping-websites-express-ai-training-preferences/',title:'OpenAI将支持通用训练偏好信号，实施仍在未来数月',summary:'OpenAI10月30日宣布将尊重robots.txt中的通用训练偏好信号，参与IETF相关工作，方便网站一次表达面向多家参与方的选择；计划未来数月实施，已有抓取控制继续有效。',why:'网站内容治理需要区分训练偏好、检索可见性与已有抓取控制。',action:'该机制为自愿协作且仍待具体实现，不写成所有厂商已即时停止抓取；根据各家公布的生效日分别核查。',section:'s22'},
 {key:'community-safety',url:'https://openai.com/index/community-safety-report-and-new-protections-for-teens/',title:'OpenAI预告半年社区安全报告，并将逐步加强青少年保护',summary:'OpenAI10月30日承诺于2027年初发布首期社区安全报告，覆盖2026年下半年，此后每半年更新。未来几周逐步推出更严格的武器信息限制，以及识别反复暴力讨论并中断会话等措施。',why:'安全治理需要公开效果、执行边界与持续评估。',action:'首份报告尚未发布，措施仍在逐步推出；不把承诺当成已完成效果，也不把29日Model Spec重复作为新发布。',section:'s24'}
];
for(const r of web){add(r.key,'2026-10-30',r.title,r.summary,r.why,r.action,{url:r.url,checkedAt:now,path:base+'web-official-reviews.json'},{sourceClass:'official',boards:['AI Security / Governance'],section:r.section});}
await writeFile(base+'web-official-reviews.json',JSON.stringify(web.map(r=>({...r,checkedAt:now,method:'Official web reader full article/date review; direct HTTP403 retained separately in initial-results.json.'})),null,2)+'\n');
// Read fresh files immediately before the merge; keep concurrently authored records.
const latest=await read('data/dev/ai-events-latest.json'),manifest=await read(`data/dev/ai-editorial-repairs-${date}.json`);
if(latest.asOf!==date||manifest.runDate!==date)throw Error('Current daily batch not prepared');
const prior=new Set(latest.aiEvents.map(e=>e.id)),fresh=additions.filter(e=>!prior.has(e.id));
latest.aiEvents.push(...fresh);manifest.events.push(...fresh);manifest.verifiedSources.push(...evidence.filter(r=>fresh.some(e=>r.eventIds.includes(e.id))));
manifest.audit0900={checkedAt:now,sourceArchive:base,addedEventIds:fresh.map(e=>e.id),reason:'Independent audit found verified relevant omissions after reading original bodies; preserve dates and qualified claims.'};
await writeFile(base+'verified-additions.json',JSON.stringify({checkedAt:now,events:fresh,verifiedSources:evidence},null,2)+'\n');
await writeFile(`data/dev/ai-editorial-repairs-${date}.json`,JSON.stringify(manifest,null,2)+'\n');
await writeFile('data/dev/ai-events-latest.json',JSON.stringify(latest,null,2)+'\n');
console.log(JSON.stringify({added:fresh.length,eventIds:fresh.map(e=>e.id),total:latest.aiEvents.length}));

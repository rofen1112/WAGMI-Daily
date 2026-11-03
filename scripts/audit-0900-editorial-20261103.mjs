import fs from 'node:fs/promises';
const date='2026-11-03',base=`data/dev/source-archives/audit-0900-${date}`;
const read=async p=>JSON.parse(await fs.readFile(p,'utf8')),write=async(p,d)=>fs.writeFile(p,JSON.stringify(d,null,2)+'\n');
const [old,manifest0,review,media,memene,main,catalog,overrides]=await Promise.all(['data/dev/ai-events-latest.json',`data/dev/ai-editorial-repairs-${date}.json`,`data/dev/ai-discovery-review-${date}.json`,'data/dev/ai-media-latest.json','data/dev/memene-daily-latest.json','data/main/index.json','data/dev/papers-catalog.json','paper-review-overrides.json'].map(async p=>{try{return await read(p)}catch(e){if(e.code==='ENOENT')return {};throw e}}));
const now=new Date().toISOString(),fetches=(await Promise.all(['initial','extras','recovery','originals'].map(n=>read(`${base}/${n}-results.json`)))).flat();
const f=(prefix,i)=>fetches.find(x=>x.path===`${base}/${prefix}-${i}.txt`);
const events=[],sources=[];
const webFacts=[
 ['https://openai.com/index/lifeval','2026-11-02','官方发布LifeVal，以时间使用研究和3995人调研构造日常任务，展示模型自测，不是独立现实成功率。'],
 ['https://openai.com/index/scaling-git-at-openai','2026-11-02','官方完整工程文章：Pando兼容Git协议，已服务内部单体仓库，复用packfiles与分区缓存，推送延迟下降近80%；公开Git客户端修改不等于开放Pando后端。'],
 ['https://openai.com/index/grid-protectors-program','2026-11-02','官方计划：未来计算园区在电网紧张时降载；佐治亚规划园区协议含最高1000MW响应。2029年节费为公司估算，园区仍在开发。'],
 ['https://openai.com/index/qodo-codex-plugin','2026-11-02','官方客户案例：Qodo插件检索组织规则及跨仓库上下文，再独立审查编码结果；Decisions API选择规则为客户探索方向。'],
 ['https://www.aramco.com/en/news-media/news/2026/pif-and-aramco-close-humain-transaction-to-accelerate-humains-global-growth','2026-11-01','Aramco与PIF原始公告日期11月1日；取得HUMAIN49%股权，PIF保留51%，2026年现金约99亿里亚尔及AI资产，2030年3GW为计划。']
].map(([url,sourceDate,contentExcerpt])=>({url,sourceDate,checkedAt:now,success:true,verification:'verified',sourceClass:'official',method:'web工具已读官方正文及日期；本机直接请求失败仍保留原始403/timeout，未将其改为成功',contentExcerpt}));
await write(`${base}/web-original-observations.json`,webFacts);
const add=(key,title,summary,why,action,proof,opts={})=>{
 if(!proof?.success)throw Error('No successful original '+key);
 const id=`ai-${date}-${key}`,url=opts.sourceUrl??proof.url;
 const ev={id,date:opts.date??'2026-11-02',title,summary,whyItMatters:why,action,boards:opts.boards??['AI Agent','Workflow / Tutorial / Usage Tips'],priority:opts.priority??'B',sourceType:opts.sourceClass==='trusted_media'?'media_report':'official_announcement',verification:'verified',contentKind:'industry_event',entities:[],sourceReportId:`ai-${date}`,repoCandidates:opts.repos??[],sources:[{label:opts.sourceClass==='trusted_media'?'已读中文原始报道（保留归属）':'已读官方或作者原文',url}],readingSources:opts.reading?[{label:opts.readingLabel??'中文原文与解读',url:opts.reading,language:'zh',role:'coverage'}]:opts.section?[{label:'橘鸦Juya · 对应中文导读',url:`https://daily.juya.uk/issues/${date}/#${opts.section}`,language:'zh',role:'discovery'}]:[],dateSemantics:opts.dateSemantics??'事件日保留原文日期；本日为发现与事实核验日期。'};
 events.push(ev);sources.push({...proof,url,checkedAt:proof.checkedAt??now,success:true,verification:'verified',sourceClass:opts.sourceClass??proof.sourceClass??'official',method:proof.method??'完整阅读存档正文，核对原始日期、作者、限定条件与对应事实；未执行远程代码',eventIds:[id],evidencePath:proof.path??`${base}/web-original-observations.json`,contentExcerpt:summary});return id;
};
const ids={};
ids.weight=add('weight-space','MIT 研究者展示权重空间编程：直接检查与修改神经网络参数','作者11月2日博客展示由GPT-6 Astra直接读写权重的初步实验。在最多50次练习题批量测试、禁止训练和梯度的设置中，修改Qwen3.5-0.8B的0.016%权重后，作者报告MATH-500由7.9%升至48.1%；对较少循环的Gemma模型未见相同提升。','可用于研究模型缺陷定位与程序化修复，不能据此推断任意模型都能免训练升级。','先核对样本隔离、采样设置和权重差异，再决定复现；不把作者实验当独立通用结论。',f('initial',41),{sourceClass:'original_research',section:'s9',priority:'A',boards:['AI Agent','Frontier Paper / Research']});
ids.pando=add('pando','OpenAI 披露 Pando：为并发 Agent 开发重建兼容 Git 的后端','Pando已承载OpenAI内部单体仓库开发，保留Git协议与工作流，通过可复用packfile、独立分支更新和区域缓存扩展读写。官方称中位推送延迟降低近80%、每日交付近1PB数据；公开的Git客户端改动并非Pando后端源码。','并发编码Agent的瓶颈正延伸到版本管理和集成设施。','审查分支一致性、客户端兼容与缓存条件；公开客户端按其实际代码范围评估。',webFacts[1],{section:'s10',priority:'A',boards:['AI Coding','AI Agent'],repos:['openai/git']});
ids.flash=add('sensenova-flash','SenseNova 6.8 Flash 正式版面向持续办公和可编辑设计交付','商汤正式页确认6.8 Flash支持长期协作，覆盖网页、SVG、Three.js、Blender、PPT等交付，并给出多轮生成、观察、反馈和修改案例。量子位与新智元报道限时体验；部分主动交互案例使用内部研发版，跑分与演示均不代表已独立复现。','与室内设计、3D演示及文档交付直接相关，需区分模型、工具环境和内部测试能力。','用同一任务检查工程可编辑性、几何保真和验收通过率，核对限时政策。',f('initial',44),{reading:'https://www.qbitai.com/2026/11/507277.html',priority:'A',boards:['AI Product / Model Launch','AI 3D / World Models','Workflow / Tutorial / Usage Tips'],repos:['OpenSenseNova/SenseNova-Skills']});
ids.threads=add('message-threads','Claude Messages API 开放 Message Threads 公测，减少长会话重复上传','11月2日官方公告确认公测：首次请求发送完整历史，此后传新增消息及上一响应ID；线程加密保存在内存，最后请求5分钟后过期。官方称50万至100万token会话的中位首token时延下降约35%；每轮仍读取完整上下文，token用量、标准价格和限速保持原口径。','可降低编码、截图与文档密集Agent的传输开销，不等于token费用下降。','按官方文档测试线程过期、重发与恢复路径，再评估端到端时延。',f('initial',60),{section:'s19',priority:'A',boards:['AI Coding','AI Agent']});
ids.life=add('lifeval','OpenAI 发布 LifeVal，用日常事务而非仅问答衡量 Agent','LifeVal基于美国家庭时间使用与跨国时间使用研究，再结合3995名受访者需求，覆盖照护、教育、家庭管理、购物与政务等工作流。官方展示的任务分数属于模型自测，不能直接外推为实际用户全部任务的成功率。','提示产品验收应围绕用户结果、偏好与审批闭环。','为自己的生活与设计工作流制定可验证的完成条件和失败样本。',webFacts[0],{section:'s21',boards:['AI Agent','Frontier Paper / Research']});
ids.activation=add('activation-classifiers','OpenAI 介绍激活分类器：生成过程中监控并暂停风险动作','11月2日研究说明，激活探针读取模型内部状态，逐token评分，可中断回答或阻止工具调用，并交由更完整推理审查。作者称该防线从GPT-5.6起加入；监督标签限制其可识别风险，不能替代其他安全层。','执行型Agent需要在行动发生前具备可中断的监控。','分开验证误报、漏报、模型版本迁移与人工复核，避免把探针当万能证明。',f('initial',48),{section:'s22',boards:['AI Security / Governance','AI Agent']});
ids.gdpx=add('gdpx','SemiAnalysis 推出 GDPx，强调真实环境中的高价值 Agent 任务','11月2日GDPx原文覆盖芯片、网安、生物、金融、法律等11个领域，联合专业环境伙伴构造任务与质量审查；作者称最强被测系统得分约12%。其领域选择有明确商业判断，结果属于作者协议，不能与LifeVal或其他评测直接等同。','工程能力评估需要上下文检索、工具环境和可核查结果，而非只看输出文件。','先审查任务与评分机制、运行预算和利益关系，再将相关子任务引入验收。',f('initial',50),{section:'s24',boards:['AI Agent','Market / Business Model']});
ids.ipo=add('anthropic-ipo-report','极客公园转述 Anthropic 更新招股材料，区分营收与算力承诺','11月3日极客公园转述前一日更新材料：Anthropic第三季度营收169.6亿美元、营业亏损约5.67亿美元，并披露约8954亿美元的基础设施相关承诺。SEC直接请求返回403，本条按媒体报道归属；承诺不是当季已支付金额，净亏损不能与营业亏损混用。','AI公司资本需求和收入结构影响平台持续性与采购判断。','继续核对完整SEC材料的会计口径、附条件承诺及流动性，不以摘要推导投资结论。',f('initial',64),{date:'2026-11-03',reading:'http://www.geekpark.net/news/373358',sourceClass:'trusted_media',section:'s26',boards:['Financing / Investment','Market / Business Model'],priority:'A'});
ids.aup=add('anthropic-aup','Anthropic 公布11月12日生效的使用政策文本，明确未授权代理限制','当前官方政策标明11月12日生效，涵盖Claude应用、Claude Code、API和授权转售渠道；禁止未经授权转售或代理访问，包括以消费订阅转发请求、虚报客户端及未授权付款。本条是11月3日对将生效文本的核验，不将观察日当政策最初发布日。','依赖代理转发的工具和企业接入需要核对自身使用方式。','以正式合同、适用版本和生效日期核查接入，不把摘要当个案法律结论。',f('initial',52),{date,section:'s27',boards:['AI Security / Governance','Market / Business Model'],dateSemantics:'11月3日观察当前官方政策文本；生效日期为11月12日，最初发布日期本轮未确认。'});
ids.grid=add('grid-protectors','OpenAI 启动 Grid Protectors，规划计算园区参与电网需求响应','11月2日计划提出让未来计算园区在电网紧张时降载。佐治亚州Effingham规划园区协议包含最高1000MW灵活需求响应，OpenAI承诺承担所需基础设施及供电成本；园区仍在开发，节费数字为公司预测。','算力规划开始把电网弹性与社区负担纳入交付条件。','区分签署容量、建成容量和实际响应效果，持续跟踪监管及项目进展。',webFacts[2],{section:'s28',boards:['Market / Business Model']});
ids.uae=add('uae-agreements','阿布扎比与 OpenAI 签署四项协议，机器可读政务试点已运行','11月2日官方公告覆盖政府、ADNOC能源运营、Mubadala投资分析及五年推广合作。机器可读政府试点先聚焦食品进口，规则可追溯、最终决定仍由官员负责；推理在阿联酋境内基础设施运行。','展示企业Agent落地中的驻留、规则追溯与责任安排。','对照本地业务检查规则版本、数据驻留和人工决策边界。',f('initial',54),{section:'s29',boards:['AI Agent','Market / Business Model']});
ids.humain=add('humain-close','Aramco 与 PIF 完成 HUMAIN 股权交易，保留11月1日原始日期','Aramco官方11月1日公告确认取得HUMAIN49%股权，PIF保留51%；交易包括关键AI资产及2026年约99亿里亚尔现金投入，2030年3GW数据中心容量属于扩张计划。11月3日中文导读不构成新的成交日。','反映能源、资金与算力基础设施的整合。','按实际交割、现金投入及后续建设进度跟踪，不把计划容量写成已建成。',webFacts[4],{date:'2026-11-01',section:'s30',boards:['Financing / Investment','Market / Business Model']});
ids.creator=add('deepseek-creator','DeepSeek 公布 Creator Mode 七组提示，覆盖3D、海报与视频工作台','官方示例页提供七组中英提示，演示将3D地标、Transformer可视化、海报、视频编辑和论文阅读等封装为Harness插件。页面明确部分演示经历多轮修改，单条提示不保证复现视频效果；本次核验是示例开放，不宣称所有插件已一键达到生产质量。','让设计和内容工具可由自然语言持续定制。','从小型本地素材测试编辑、导出和权限，按实际工程质量验收。',f('originals',2),{reading:f('originals',2).url,boards:['AI Coding','AI 3D / World Models'],priority:'A',repos:['deepseek-ai/deepseek-harness']});
ids.marvell=add('marvell-lumentum','Marvell 宣布全股票收购 Lumentum，交易仍需批准','11月2日官方公告称交易隐含企业价值1150亿美元，每股Lumentum换4.5股Marvell；合并后现Marvell股东约持67%。预期2028年上半年完成，仍取决于股东与监管批准，不是已经交割的收购。','高速光互连与数据中心供应链继续整合。','跟踪批准、交割条件与实际产品路线，区分企业价值、股权价值和协同预测。',f('originals',1),{reading:'http://www.geekpark.net/news/373358',boards:['Financing / Investment','Market / Business Model']});
ids.xiaomi=add('hachimo-dock','HachimoDock 开放源码与自制资料，把桌面硬件接入 Agent','量子位11月2日授权刊载介绍小米创新团队桌面设备，可语音交代任务、显示Agent状态、定制角色与组件，并通过Miloco连接家庭设备；项目README及资料入口已查。约150元是报道中的自制成本，不是保证售价，缺货与涨价也不外推全市场。','为桌面Agent提供任务状态、确认和情绪反馈载体。','先检查源码许可、硬件清单和电脑操作授权，验证状态是否与实际执行一致。',f('initial',87),{reading:'https://www.qbitai.com/2026/11/507107.html',sourceClass:'trusted_media',repos:['YizhengWw/HachimoDock'],boards:['AI Agent','Workflow / Tutorial / Usage Tips']});
ids.qodo=add('qodo-context','Qodo 案例将组织规则与独立审查接入 Codex 会话','OpenAI11月2日案例介绍Qodo插件在生成前检索组织规则、历史模式和跨仓库依赖，生成后返回独立审查意见，由开发者处理未解决争议。Decisions API用于选择适用规则仍是客户探索方向，文章未提供统一缺陷检出率。','适合评估多仓库工程中局部改动的下游风险。','以真实跨服务缺陷样本验证规则检索及审查收益，保持人工复核。',webFacts[3],{boards:['AI Coding','Workflow / Tutorial / Usage Tips']});
ids.agentar=add('agentar-medical','新智元报道 Agentar 医疗版发布，提供专科工作台配置','11月2日报道称Agentar医疗版在乌镇峰会发布，组合病历、辅助诊疗与患者视图，并提供专科模板与技能配置。文中的效率和准确率来自产品方案例，未披露足以独立复核的完整样本，不能当作普遍临床有效性证明。','说明垂直Agent通过统一数据接口、模板与行业评测组织交付。','评估数据接入、可追溯性和医生复核安排，医学效果另经合格评测。',f('recovery',10),{sourceUrl:'https://aiera.com.cn/asi-post.html?id=121890',reading:'https://aiera.com.cn/asi-post.html?id=121890',sourceClass:'trusted_media',boards:['AI Agent','AI Product / Model Launch']});
ids.pixverse=add('pixverse-integration','新智元报道 PixVerse 与 OpenAI 集成及创作者教育计划','11月2日报道介绍PixVerse插件、CLI与Canvas工作台如何衔接策划、图像视频生成及结果比较，并介绍双方共同的Prompt to Production教育计划。工作流演示与创作者经验不等于无需返工的统一成功保证，课程后续发布仍需跟踪。','直接对应角色参考、分镜和最终成片之间的素材与版本管理。','以角色一致性、可编辑资产和成本记录验收实际集成。',f('recovery',11),{sourceUrl:'https://aiera.com.cn/asi-post.html?id=121894',reading:'https://aiera.com.cn/asi-post.html?id=121894',sourceClass:'trusted_media',boards:['Workflow / Tutorial / Usage Tips','AI Product / Model Launch']});
ids.brave=add('brave-lawsuit-report','The Verge 报道出版商起诉 Brave，抓取与付费墙指控待审理','11月2日报道称《纽约时报》等出版商起诉Brave，围绕内容抓取及向AI服务提供搜索内容提出版权指控。本条仅记录诉讼与原告主张，不把尚未裁判的指控当作认定事实。','Agent检索和内容授权的责任边界继续受到争议。','继续查法院材料与被告回应，并核对内容获取和授权链路。',f('initial',36),{sourceClass:'trusted_media',section:'s31',boards:['AI Security / Governance','Market / Business Model']});
// Review the three newly discovered research papers within today's abstract-reading budget.
const paperSpecs=[
 ['2610.40754','DyCraft：以三维分镜分解长时四维动画生成','DyCraft先规划并构建静态场景，再逐帧调试三维关键姿态，最后在已验证起止状态间编写局部动作。作者在24个长时多镜头任务中报告更少穿插、悬空和不自然运动；结果来自特定Agent与评测设置。','适合室内动态演示和机械动画的分阶段验收。','摘要级阅读，未复现24项任务或核查全部人评；不是任意物理场景的正确性保证。','比较关键姿态、接触支撑及运动连贯性，保留人工验收。','2026-10-29'],
 ['2610.41501','VoxLution：从粗布局逐块细化高分辨率室内场景','VoxLution以稀疏多分辨率体素和Transformer先生成粗布局，再按块细化几何；将邻块边界纳入序列保持连接。作者在3D-FRONT与ScanNet++报告FPD/FID改善，属于几何分布指标，不能替代尺寸、碰撞和施工可用性。','为室内场景资产生成提供结构与细节分层路线。','摘要级阅读；未复跑指标与硬件开销，不能将感知质量等同于BIM有效性。','用真实空间尺寸、边界连续性和编辑成本补充指标验收。','2026-10-30'],
 ['2610.41314','GenDSR：把视频生成表征转给动态空间推理模型','GenDSR将视频生成模型中间特征分为保留整体上下文的原始分支和强调时间变化的差分分支，再由任务条件门控融合进VLM。作者报告DSR-Bench67.2%；该结果限于所测基准，不说明真实机器人全程成功率。','连接动态场景理解、视频先验与空间状态跟踪。','摘要级阅读，未复现训练与消融，迁移范围和算力成本仍需检查。','以遮挡、物体交换与长时状态一致性测试自有场景。','2026-10-30']
];
for(const [idx,[a,titleZh,summaryZh,industryValueZh,limitationsZh,futureOutlookZh,pub]] of paperSpecs.entries()){
 const p=catalog.papers.find(p=>p.id==='arxiv-'+a.replace('.','-'));if(!p)throw Error('Missing paper '+a);
 const proof=f('extras',idx);if(!proof.success)throw Error('Unread original paper '+a);
 Object.assign(p,{titleZh,summaryZh,industryValueZh,limitationsZh,futureOutlookZh,keyContributionsZh:[summaryZh],reviewStatus:'interpreted',readingLevel:'abstract',reviewedAt:now,sourceCheckedAt:proof.checkedAt,evidencePath:proof.path,publishedAt:pub+'T00:00:00.000Z',originalPublishedAt:pub+'T00:00:00.000Z'});
 overrides.reviews[p.id]={...(overrides.reviews[p.id]??{}),...Object.fromEntries(['titleZh','summaryZh','industryValueZh','limitationsZh','futureOutlookZh','keyContributionsZh','reviewStatus','readingLevel','reviewedAt','sourceCheckedAt','evidencePath'].map(k=>[k,p[k]]))};
 sources.push({...proof,success:true,verification:'verified',sourceClass:'original_research',method:'已读官方完整摘要、作者和提交历史；今日三篇摘要级预算，未声称全文复现',paperIds:[p.id],eventIds:[`ai-${date}-paper-${a.replace('.','-')}`],contentExcerpt:summaryZh});
}
catalog.dailyRecommendationSelection={selectedAt:now,reasonZh:'逐篇已读新发现原始摘要；替换自动轮换到的已刊历史研究，保留原始发表日和三篇预算。',previousAutomaticSelection:catalog.dailyRecommendations};
catalog.dailyRecommendations=paperSpecs.map(s=>'arxiv-'+s[0].replace('.','-'));
const manifest={...manifest0,runDate:date,checkedAt:now,events:[...(manifest0.events??[]),...events],verifiedSources:[...(manifest0.verifiedSources??[]),...sources]};
const latest=old.asOf===date?{...old,aiEvents:[...old.aiEvents,...events]}:{schemaVersion:'1.0.0',generatedAt:now,asOf:date,report:{id:`ai-${date}`,title:`AI 大事件与前沿论文日报 ${date}`,date,channel:'ai',format:'markdown',path:`/reports/ai-events-${date}.md`},collectionWindow:{from:'2026-10-28',to:date},aiEvents:events,candidates:[],run:{id:'wagmi-ai',name:'AI 大事件与论文每日采集',channel:'ai',schedule:'每天 07:30',runDate:date,batchId:`wagmi-ai:${date}`,status:'running',startedAt:now,artifact:`/reports/ai-events-${date}.md`},sourceStatus:[]};
// Explicit candidate decisions; unchanged historical decisions prepared by the policy retain real timestamps.
const decision=(row,disposition,reason,eventIds=[],importance='normal',extra={})=>{if(!row)throw Error('Missing row');Object.assign(row,{disposition,reason,eventIds,importance,checkedAt:now,...extra});delete row.carriedFromRunDate;};
const mr=id=>review.memene.items.find(r=>r.id===id),ar=id=>review.media.items.find(r=>r.id===id);
const mm={
 '359976':['covered','招股更新已读中文报道并区分营收、营业亏损和承诺；SEC403保留，不依聚合摘要确认全部财务细目。',[ids.ipo],'high'],
 '359997':['covered','三个聚合节分别读OpenAI官方正文：LifeVal、Grid Protectors、Qodo；均以11月2日原日期收录。',[ids.life,ids.grid,ids.qodo],'high'],
 '359998':['out_of_scope','已读Anthropic Residency官方项目详情，属6周至6月的有薪人才申请信息；不构成当前产品、工程实现或研究结果变更。',[]],
 '359977':['out_of_scope','证券指数波动与投资者观点为市场背景，本日报不以单日股价作为AI能力或产品变化证据。',[]],
 '359978':['covered','已定位并读Marvell官方合并公告，确认换股比例、企业价值及尚待批准的交割计划。',[ids.marvell]],
 '359979':['out_of_scope','消费硬件季度财务为一般公司经营信息，缺少本候选中可核验的AI产品或设计工具新增能力。',[]],
 '359980':['covered','已读阿布扎比政府原始四项协议公告，驻留及人工责任边界均核对。',[ids.uae]],
 '359981':['duplicate','与官方更新速览同一Grid Protectors计划，统一事件收录，预测节费未当已实现。',[ids.grid]],
 '359982':['pending','两条彭博原文实际fetch failed，聚合所称AI攻击作用与损失口径未取得独立可读证据。',[],'high'],
 '359983':['covered','已读DeepSeek官方七组中英Creator Mode示例，明确多轮修改限制，并作为具体插件工作流更新收录。',[ids.creator],'high'],
 '359984':['out_of_scope','存储厂商股价与利润展望属于财务周期判断，不将其推导成已验证的AI需求见顶或技术变化。',[]],
 '359985':['duplicate','与OpenAI速览同一LifeVal，原文与调查方法已读，统一收录。',[ids.life]],
 '359986':['covered','补得并读SemiAnalysis原始GDPx方法，按自报协议、领域选择限制收录，不照抄未核到的表图数字。',[ids.gdpx],'high'],
 '359987':['pending','微信原文仅72字验证页，量子位与新智元可读报道也未提供官方新模型发布；不把源码或账单传闻当正式发布。',[]],
 '359988':['pending','彭博Newsletter实际fetch failed，尚未读到ActivTrak原始统计口径，相关性不能证明AI造成加班。',[]],
 '359989':['out_of_scope','已读Campus Technology全文，明确IDC原分析为10月20日，多项调查月份和样本不同；本轮为旧研究媒体再报道，不当今日新调查。',[]],
 '359990':['out_of_scope','一般制冷系统疑似网络事件，候选未建立与AI产品、Agent或所关注产业的明确事实联系。',[]],
 '359991':['pending','Isomorphic预测的彭博原文不可读；MIT可读报道支持获奖而非所有药物由AI设计或首次临床时间，不用无关正文证明该主张。',[]],
 '359992':['covered','已读The Verge报道，按原告诉讼指控保留归属，未作侵权认定。',[ids.brave]],
 '359993':['pending','晚点微信原文仅验证页，日活与制作成本缺少可读原始方法，未以聚合数字正式收录。',[]],
 '359994':['covered','已读量子位授权原文、作者README与实际资料链接；约150元为自制成本，非保证售价。',[ids.xiaomi],'high'],
 '359995':['duplicate','LongCat-2.5正式版已在11月2日报刊载；本轮重读官方changelog仍为同一11月2日版本，不重复发布。',['ai-2026-11-02-longcat25']],
 '359996':['covered','已读Claude11月2日官方公告和技术文档，校正5分钟保留、token不变及公测限制。',[ids.threads],'high']};
for(const [id,args]of Object.entries(mm)){decision(mr(id),...args);if(args[0]==='pending'){const c=memene.target.candidates.find(c=>c.id===id);mr(id).attemptedSources=c.sources.map(s=>{const z=fetches.find(x=>x.url===s.url);return {url:s.url,status:z?.httpStatus??null,error:z?.error??(z?.chars<100?'验证页，无正文':'正文不支持完整主张')}});mr(id).nextAction='取得厂商、作者或可读媒体完整原文，核对日期、统计/实验方法和对应主张后重新审阅。';}}
const mediaDecisions={
 'media-70e1f0e53b2d6d683743':['covered','已读全部晨报；AI重点为招股更新、光互连收购与机器人比赛，前两项已独立核对；一般消费、娱乐和股市背景不单列。',[ids.ipo,ids.marvell]],
 'media-46811be9a2d74bd0ec14':['covered','已读发布者WordPress完整正文，与SenseNova正式页对照；内部研发版测试和演示不外推通用效果。',[ids.flash]],
 'media-8d2f1417a99196cc4ef5':['duplicate','Karpathy HackerTube已在11月2日报核验，今日原文再次报道同一实现，不重复收录。',['ai-2026-11-02-hackertube']],
 'media-c9691648575295e5214d':['pending','已读WordPress报道，关键死亡因果属于家属诉讼指控；纽约时报原文fetch failed，未取得诉状与官方回应，不将标题定为事实。',[],'high'],
 'media-951fef97d545daad1b34':['catalogued','已读完整中文正文、10月13日原始论文摘要与作者仓库；研究纳入论文目录并桥接GitHub，日报三篇精选预算用于本轮新读空间研究。',[],'high',{paperIds:['arxiv-2610-12274']}],
 'media-3fc805d9eb2e181aec29':['out_of_scope','已读全文，主要为10月31日科普晚会、核聚变与材料展示；不将2025年EAST纪录及通用科技晚会当AI新品。',[]],
 'media-fabbc508490e282fffd3':['out_of_scope','已读全文，为个人博士求职经历和作者市场评论，无独立数据支持普遍因果，不进入技术/产品变化精选。',[]],
 'media-adb6ed416c4d490bed70':['out_of_scope','已读全文，主要复述夏季事故、9月论文和10月26日第三方评测；均须按原日期追溯，不将11月3日二次解读当新事故。',[]],
 'media-43bcc0db7b299263f6d0':['pending','已读WordPress全文，与量子位原文比对仍为未发布模型传闻；官方发布列表未取得相应正式公告，不能据推文猜测证实安全事故及版本能力。',[]],
 'media-d4a3d49a591020ec4a1e':['covered','已读量子位完整实测和商汤正式页，保留官方跑分、媒体样例与内部研发版边界。',[ids.flash],'high'],
 'media-b5ceb278cfe6d43511c1':['out_of_scope','同新智元网站科普晚会原文，已读发布者API正文；核聚变/科普展示不属于本次AI发布精选。',[]],
 'media-e44bf58736d35a07e705':['pending','公众号验证页，已读同作者网站完整报道；诉状、实际因果与对方回应仍缺，保留指控待核验。',[],'high'],
 'media-628aeaa1d71bcdfe424e':['catalogued','已读同作者网站HarnessSQL全文与论文原摘要，入公开论文目录并桥接作者仓库；不把10月13日论文改作今日首发。',[],'high',{paperIds:['arxiv-2610-12274']}],
 'media-9a2cca1d9b1361246c35':['out_of_scope','已读全文，明确为上海仪电供稿，核心发布发生10月31日；属厂商宣介，未取得可独立验证的新能力及SLA，不当11月3日新品。',[]],
 'media-5f7bb6dbd76b6274d051':['duplicate','已读全文，为既有Model Spec五项价值解读，10月30日报已核验正式更新，今日不重复发布。',['ai-2026-10-30-model-spec']],
 'media-c400f92bd83cd7486751':['out_of_scope','已读报道，主线是创业赛入选与公司介绍，所列模型及研发案例没有证明本日新发布或独立临床结果。',[]],
 'media-71d58f4e198e363bf728':['covered','已读授权刊载正文与作者README，按真实硬件自制成本与授权边界收录。',[ids.xiaomi],'high'],
 'media-c8fb213cef90e5c449ea':['pending','已读量子位全文；其本身说明权重疑点，模型名/路由观察尚无正式版本公告，不确认泄露或产品上线。',[]],
 'media-881701592e7077bb9223':['out_of_scope','已读晨报，苹果产品观点和搜索流量为二次采访/市场背景，未形成可核验的新设计工具或Agent发布。',[]],
 'media-c7194045dffd1265d374':['pending','微信正文与关联旧文均返回72字验证页，镜像摘录仅2400字，已知其讨论注意力与触发调度，但尚未读到完整系统实现，保留待补全文。',[],'high'],
 'media-f54ad0c9fdbd7a9b984f':['duplicate','已读WordPress完整原文，融资目标/认购/评级的区别已由11月2日报收录，不将反驳评论当新融资交割。',['ai-2026-11-02-financing-reading']],
 'media-ecef6a07280203747c8e':['catalogued','已读完整中文解读；10月8日原始论文及作者AI协作说明已在目录完成解读，保留原日，不把38年问题宣传标题当独立数学验证。',[],'high',{paperIds:['arxiv-2610-12426']}],
 'media-f277eb0ca340173923ca':['covered','已读发布者全文，产品功能及样例指标按报道与厂商案例归属，未推断普遍临床有效性。',[ids.agentar]],
 'media-6363b833724ae1b7650b':['covered','已读发布者全文，核对插件/CLI/Canvas及教育计划范围，保留演示和后续课程状态。',[ids.pixverse],'high'],
 'media-d19ad0628a8ab9e512a0':['pending','已读量子位11月1日报道，关键账号处罚因果仍为用户自述，官方未针对个案确认；不以标题认定未经证实的封禁原因。',[]],
 'media-156f3096451c0f9a6cb1':['catalogued','已读量子位全文，AWM已在公开论文目录完成中文解释并保留10月29日原日；日报三篇上限，未据宣传改写真实世界证明范围。',[],'high',{paperIds:['arxiv-2610-40503']}],
 'media-93fc5729c04f0889e39e':['catalogued','重读作者论文、仓库、项目及数据集：公开导航资源与未发布真机策略分开，9月30日原论文完整保留在目录。',[],'high',{paperIds:['arxiv-2609-39388']}]
};
for(const [id,args]of Object.entries(mediaDecisions)){const row=ar(id);if(row.disposition!=='needs_review')continue;decision(row,...args);if(row.disposition==='pending'){const c=media.candidates.find(c=>c.id===id);row.attemptedSources=[{url:c.url,result:fetches.find(x=>x.url===c.url)??'已读发布者WordPress原文及官方公告列表，未获充分主张证据'}];row.nextAction='补读可解析的原始正文、官方公告或诉讼材料并核对原始日期与主张；未确认之前不作为已发布结论。';}}
const juya=ar('media-39194afae16fa5ee805b');
const sectionMap={s9:ids.weight,s10:ids.pando,s15:ids.flash,s19:ids.threads,s21:ids.life,s22:ids.activation,s24:ids.gdpx,s26:ids.ipo,s27:ids.aup,s28:ids.grid,s29:ids.uae,s30:ids.humain,s31:ids.brave};
for(const row of juya.subreviews){if(sectionMap[row.id])decision(row,'covered','对应原始正文已逐项阅读并绑定事实事件；保留原始日期、厂商/作者自报和生效/交割限制。',[sectionMap[row.id]],'high');else{const c=media.candidates.find(c=>c.id===juya.id).sections.find(s=>s.id===row.id);decision(row,'pending',row.id==='s23'?'已读腾讯官方Hyra成果仓库，当前资源证明研究产物而非整个Agent框架开源；2.0具体发布日期与完整正文仍待核对。':'实际尝试对应微信公众号原文均仅返回72字验证页，web再次打开失败；聚合摘要不足以作为已核验发布事实。',[],'high',{attemptedSources:c.referencedUrls.map(url=>({url,result:fetches.find(x=>x.url===url)??'无可读完整原文'})),nextAction:'补读厂商发布正文或可核对版本的官方文档；核对功能、日期与开放范围后再纳入。'});}}
decision(juya,'mixed','当期18节逐节复核：13节已读独立原始事实并收录，Kimi/Qovest/TRAE/ZCode/Hyra保留实际补证步骤。',Object.values(sectionMap),'high');
const oldJuya=ar('media-d12d1f6a76d3e3381b87');if(oldJuya.disposition==='needs_review'){const prior=await read('data/dev/ai-discovery-review-2026-11-02.json');const past=prior.media.items.find(x=>x.id===oldJuya.id);if(past?.candidateHash===oldJuya.candidateHash){Object.assign(oldJuya,past,{carriedFromRunDate:'2026-11-02'});}else{for(const r of oldJuya.subreviews??[])decision(r,'pending','11月2日聚合节内容发生变化，已请求官方changelog、X与报道正文，须逐节重核增量，不能以部分覆盖认定整期。',[],'normal',{nextAction:'比对当前分节与已刊事件及原始来源。'});decision(oldJuya,'mixed','11月2日聚合当期需对变动逐节补核，保留真实待核状态。',[]);}}
for(const ev of events){const provided=ev.readingSources.length>0;review.readingReviews=review.readingReviews.filter(x=>x.eventId!==ev.id);review.readingReviews.push(provided?{eventId:ev.id,status:'provided',checkedAt:now,urls:ev.readingSources.map(s=>s.url),reason:'已读对应中文正文或公开橘鸦具体分节，事实证据另绑定独立官方/作者/报道原文，未以内部Memene作为中文入口。'}:{eventId:ev.id,status:'not_found',checkedAt:now,checkedSources:['全部9个启用中文入口/97候选','对应官方原文及当前中文聚合18分节'],reason:'本轮已读公开中文材料中未找到对应独立中文正文或具体分节，不把英文客户案例标为中文。'});}
await write(`${base}/ai-before-editorial.json`,old);
for(const [p,d] of [[`data/dev/ai-editorial-repairs-${date}.json`,manifest],['data/dev/ai-events-latest.json',latest],[`data/dev/ai-discovery-review-${date}.json`,review],['data/dev/papers-catalog.json',catalog],['paper-review-overrides.json',overrides]])await write(p,d);
console.log(JSON.stringify({events:events.length,sourceReviews:sources.length,ids,papers:catalog.dailyRecommendations}));

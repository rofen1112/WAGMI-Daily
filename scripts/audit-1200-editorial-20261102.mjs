import fs from 'node:fs/promises';
const date='2026-11-02',base=`data/dev/source-archives/audit-1200-${date}`;
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const write=async(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2)+'\n');
const [old,idx,media,review,fetches,catalog]=await Promise.all(['data/dev/ai-events-latest.json','data/dev/index.json','data/dev/ai-media-latest.json',`data/dev/ai-discovery-review-${date}.json`,base+'/fetch-results.json','data/dev/papers-catalog.json'].map(read));
const now=new Date().toISOString(),events=[],verifiedSources=[];
const history=idx.aiEvents??[];
const byTitle=re=>{const e=history.findLast(e=>re.test(e.title));if(!e)throw Error('Missing historical identity '+re);return e.id;};
const found=url=>fetches.find(f=>f.url===url);
const juya=media.candidates.find(c=>c.sourceId==='juya'&&c.sourceDate===date);
function add(key,title,summary,why,action,url,reading,opts={}){
 const f=found(opts.retrievalUrl??url);
 if(!opts.webEvidence&&(!f?.success||f.chars<500))throw Error('No readable original '+url);
 const id=`ai-${date}-${key}`;
 events.push({id,date:opts.date??date,title,summary,whyItMatters:why,action,priority:opts.priority??'B',boards:opts.boards??['AI Agent','Workflow / Tutorial / Usage Tips'],sourceType:opts.sourceClass==='trusted_media'?'media_report':'official_announcement',verification:'verified',entities:[],contentKind:'industry_event',sourceReportId:'ai-'+date,repoCandidates:opts.repos??[],sources:[{label:opts.sourceClass==='trusted_media'?'已读媒体原文（保留报道或观点归属）':'已读官方或作者原文',url}],readingSources:reading?[{label:opts.readingLabel??'中文原文与解读',url:reading,language:'zh',role:'coverage'}]:[],dateSemantics:opts.dateSemantics??'采用原始发布/报道日期；今日为发现与核验日期，不将旧事件改为今日首发。'});
 verifiedSources.push({url,checkedAt:opts.webEvidence?now:f.checkedAt,success:true,verification:'verified',sourceClass:opts.sourceClass??'official',method:opts.webEvidence?'web工具打开官方完整正文，Node直连403保留；逐项核对本条事实':'逐项阅读原始正文/作者README，核对日期、归属和结论边界；未运行远程代码',eventIds:[id],contentExcerpt:summary,evidencePath:opts.webEvidence?base+'/web-original-reviews.json':f.path,retrievalUrl:opts.retrievalUrl??url});
 return id;
}
const ids={};
ids.longcat=add('longcat25','LongCat-2.5 正式上线，融合视觉编程与长程 Agent 工作流','美团官方11月2日更新日志确认LongCat-2.5正式上线，融合视觉理解与智能体编程，覆盖创意设计、3D和复杂代码库任务，并适配Claude Code、Codex与Hermes等Harness。9月预览版与本次正式版分开记录；本次未对官方能力说明做独立跑分。','为设计与3D工程提供新的多模态长任务模型候选。','用相同代码库、视觉任务和成本口径评估稳定性，不将参数规模等同于任务表现。','https://longcat.ai/platform/docs/zh/ChangeLog.html','https://longcat.ai/platform/docs/zh/ChangeLog.html',{priority:'A',boards:['AI Coding','AI Product / Model Launch','AI 3D / World Models']});
ids.loop=add('sensenova-loop','SenseNova Loop-9B 预览模型以共享循环层增加执行深度','作者仓库将首发标为10月30日，公开多模态SenseNova-Loop-9B-Preview及权重入口。32组解码层权重产生56次层执行，采用双流mHC与混合注意力，最长训练序列262144 token；仓库列出Apache-2.0和部署配置。未将与其他模型的传闻架构联系写成事实。','小规模循环计算为本地视觉文档与工具工作流提供可研究方案。','分别核对权重许可、运行实现与硬件成本，先在隔离环境审阅模型自定义代码。','https://github.com/OpenSenseNova/SenseNova-Loop','https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/README_CN.md',{date:'2026-10-30',repos:['OpenSenseNova/SenseNova-Loop'],priority:'A',boards:['AI Product / Model Launch','AI Coding']});
ids.comma=add('comma-review','新智元介绍 Comma 持续协作 Agent，作者仓库提供自部署实现','新智元11月2日比较AFK Comma与DeepSeek的持续会话架构。作者仓库确认Comma是跨电脑、手机、应用与连接设备持续保存工作上下文的开源Agent，支持托管或自部署，代码许可为AGPL-3.0。媒体关于提前半年与全面领先的判断未当作独立验证结论。','持续主上下文与隔离任务执行是团队Agent的可比较工程路径。','先审查权限继承、信息流控制和失败恢复，再用实际跨应用任务验证；不执行来源安装命令。','https://github.com/AFK-surf/Comma','https://aiera.com.cn/asi-post.html?id=121778',{repos:['AFK-surf/Comma'],priority:'A'});
ids.mouse=add('exin-lab-report','WIRED 报道实验室 Agent 操控小鼠脑内注射，人类审批仍是关键','WIRED于10月31日报道，Exin团队让Agent选择治疗方案并操控注射装置；兽医先开颅，关键注射计划需人类批准，设备保留紧急停机。坐标故障曾造成延误，团队仍在等待评估治疗效果。小鼠恢复良好来自公司自述，不等于疗效已证实。','物理Agent的真正约束包括坐标校准、不可逆动作授权和异常处置。','将这项报道作为监督与运行边界案例，不能外推为自主临床手术能力。','https://www.wired.com/story/an-ai-agent-did-brain-surgery-on-live-mouse/',juya.url+'#s12',{date:'2026-10-31',sourceClass:'trusted_media',boards:['AI Agent','AI Security / Governance']});
ids.campus=add('compute-campus-report','TechCrunch 转述 OpenAI 选后政策宣传计划，尚属报道','TechCrunch11月1日转述Axios称，OpenAI计划在美国中期选举后提出前沿AI保障措施、推动政策沟通，并考虑将数据中心称为AI算力园区。本条只记录媒体对计划的报道，未认定相关提案已经成为政策或监管要求。','数据中心项目的公众沟通和地方接受度开始影响AI基础设施落地。','后续核对正式提案和实际项目进展，保持计划与已实施措施的区别。','https://techcrunch.com/2026/11/01/openai-might-rebrand-its-data-centers-as-ai-compute-campuses/',juya.url+'#s17',{date:'2026-11-01',sourceClass:'trusted_media',boards:['AI Security / Governance','Market / Business Model']});
ids.hackertube=add('hackertube','Karpathy 展示 HackerTube：用编码 Agent 重组社区视频推荐','Karpathy本人11月1日帖文称，利用Claude整理20年约4300万条Hacker News评论，筛得6454个反复被推荐的视频，并用约两小时建立HackerTube。申请API密钥、启动服务器和购买域名仍由本人完成；耗时及部署效果均按作者自述，不视为独立工程验收。','公开语料加个性化筛选可以快速形成可分享的小型产品。','检查数据授权、推荐质量与运维成本，并保留人工管理凭据和上线验收。','https://x.com/karpathy/status/2116957135661945283',null,{date:'2026-11-01',boards:['AI Coding','Workflow / Tutorial / Usage Tips']});
ids.financing=add('financing-reading','新智元复核 AI 融资报道，区分首批认购、目标与评级预期','新智元11月2日的分析强调，OpenAI首批认购、融资目标和最终完成额不能混用；Blackstone对Anthropic未来评级的预期也不等于主要评级机构已经给公司降级。本条记录中文媒体对报道口径的澄清，不独立确认融资结果或据此判断市场走势。','融资口径错误会扭曲对AI基础设施承诺与交付风险的判断。','回到公司披露和原始融资文件，分开记录认购、交割和信用评级对象。','https://aiera.com.cn/asi-post.html?id=121821','https://aiera.com.cn/asi-post.html?id=121821',{sourceClass:'trusted_media',retrievalUrl:'https://aiera.com.cn/wp-json/wp/v2/posts/121821?_embed=1',boards:['Market / Business Model']});
ids.credit=add('credit-saison','OpenAI 公布 Credit Saison 企业试点案例，ROI 属客户自报口径','OpenAI10月30日案例称，Credit Saison的315名跨部门员工试点报告954%的投资回报率，人均每月节省约14小时，随后批准公司范围推广。培训、领导参与和经验分享是案例描述的采用机制；这些数字属于客户与供应商自报，未独立审计。','企业AI试点需要同时记录基线、节省工时和实际采用机制。','以自有部门的可比基线验证收益，不能直接套用该案例的投资回报。','https://openai.com/index/credit-saison',null,{date:'2026-10-30',webEvidence:true,boards:['Market / Business Model','Workflow / Tutorial / Usage Tips']});
const pick=(disposition,reason,eventIds=[],importance='normal')=>({importance,disposition,reason,eventIds,checkedAt:now});
const pending=(reason,urls,next='取得官方/作者完整原文并核实日期、范围与冲突数据后重新判断。',importance='normal')=>({...pick('pending',reason,[],importance),attemptedSources:urls.map(url=>{const f=found(url);return {url,result:f?`实测${f.status??'网络失败'}；${f.chars??0}字；${f.error??'正文已读取，尚不能证明此处主张'}`:'已检查当前官方入口及发现引文，未找到可绑定此主张的完整原始发布'};}),nextVerificationStep:next});
const paperIds=['2610.37741','2610.39302','2610.26659'].map(a=>'ai-'+date+'-paper-'+a.replace('.','-'));
// Explicit editorial selection from the interpreted cumulative catalog; do not relabel RSS dates.
const chosen=['arxiv-2610-37741','arxiv-2610-39302','arxiv-2610-26659'];
for(const id of chosen){const p=catalog.papers.find(p=>p.id===id);if(!p?.titleZh||p.readingLevel!=='abstract'||p.reviewStatus!=='interpreted')throw Error('Paper selection lacks actual interpretation '+id);}
catalog.dailyRecommendations=chosen;
catalog.dailyRecommendationSelection={runDate:date,checkedAt:now,method:'人工编辑：优先本轮发现的Agent执行风险、跨模态表征与室内建图；每条已完成摘要级中文审阅，最多3篇。',selected:chosen,previousAutomaticSelection:catalog.dailyRecommendations};
await write('data/dev/papers-catalog.json',catalog);
const duplicates={
 '359556':[/Claude Ultra/,/自动.*红队|红队.*自动/], '359542':[/帮助页说明12月/], '359550':[/Treg/],
};
const mem={
 '359540':pick('added','已读中文口径复核；将融资目标、首批承诺和最终交割区分，评级预期不写成公司已降级。',[ids.financing]),
 '359555':pick('mixed','逐项核对官方changelog及三篇公告：生命科学可信访问、安全和训练偏好已有历史记录；补入客户案例并保留自报口径。',[byTitle(/扩大 GPT-Rosalind/),byTitle(/社区安全/),byTitle(/训练偏好/),ids.credit]),
 '359541':pending('原型本身已在11月1日日报收录；Bloomberg新增融资/芯片布局原文请求失败，融资口径互相冲突，不将这部分写成确认事实。',['https://www.bloomberg.com/news/articles/2026-11-01/deepseek-drops-enhanced-coding-agent-with-aim-to-rival-anthropic']),
 '359543':pick('covered','已定位并读arXiv原始摘要，首发10月27日；按最多3篇论文预算纳入目录推荐，攻击比例仅限作者实验。',[paperIds[0]],'high'),
 '359544':pick('out_of_scope','选举情景与亚洲股价影响是条件预测，无新增AI产品、工程实现或正式生效政策；不作为已经发生的事件。',[],'low'),
 '359545':pending('APPSO正文仅返回65字验证页；各类显卡/整机价格与AI因果未取得可核验样本，不能把评论标题变成价格事实。',['https://mp.weixin.qq.com/s/0FYF1TqCBAgiKx8qY1VA9w']),
 '359546':pending('ChinaTalk原文网络失败；所述六月至七月行情、市场份额与11月发现日分开，尚不能确认报道的统计范围。',['https://www.chinatalk.media/p/koreas-stock-market-crashed-1-trillion']),
 '359547':pick('covered','已读10月29日arXiv作者摘要；定理限于正视图条件，109M与72B比较属于跨模态对齐，纳入摘要级论文推荐。',[paperIds[1]],'high'),
 '359548':pick('added','作者仓库及中文README已读，保留10月30日首发、预览状态与Apache-2.0；不采用网传GPT架构相同说法。',[ids.loop],'high'),
 '359549':pending('已读极客11月1日早报，Meta/傅利叶仍为The Information转述的未确认原型计划；无双方正式确认，不能记为机器人上市。',['https://www.geekpark.net/news/373252','https://mp.weixin.qq.com/s/a4Y9BPXrrypTOpmR1CeAqg']),
 '359551':pending('量子位全文已读，但内容依赖用户反馈，未找到本次官方规则、范围和生效时间；既有逆向限制传闻不能写成Harness正式全面禁令。',['https://www.qbitai.com/2026/11/507038.html','https://www.anthropic.com/news']),
 '359552':pick('out_of_scope','个人对已宣布Apple智能首批功能的评论；苹果中国部署时间已有正式事件，本条没有核实的新功能发布或版本增量。',[],'low'),
 '359553':pending('已检查Kimi相关历史正式发布，K3.1 Pro已有3D/CAD能力；当前发现摘要没有Moonshot的3D Make独立公告，未确定是新入口还是原有演示。',['https://www.kimi.com/'],'定位Min Choi原帖及Moonshot正式3D Make说明，核对与10月23日K3.1 Pro的差异。','high'),
 '359554':pick('added','已定位并完整读取Karpathy本人原帖；保留11月1日及作者自述，API密钥、服务器和域名由人操作。',[ids.hackertube]),
};
for(const [id,pats] of Object.entries(duplicates))mem[id]=pick('duplicate','逐项对照已发布事件；本条为相同公告的再传播，没有足以再次发布的实质增量。',pats.map(byTitle));
for(const row of review.memene.items){if(!mem[row.id])throw Error('Unreviewed Memene '+row.id);Object.assign(row,mem[row.id]);}
const secToday={
 s8:pending('两条官方社交原帖首轮请求失败；仅凭聚合摘要不能确认全部账户发放条件，保留实际尝试。',['https://x.com/thsottiaux/status/2116692529970311254','https://x.com/thsottiaux/status/2117035794678546764']),
 s10:pick('added','已读官方中英文日志，11月2日正式版与9月预览版分开，未以参数规模或兼容声明代替独立评测。',[ids.longcat],'high'),
 s12:pick('added','已读WIRED完整报道：保留10月31日、人工审批、坐标故障与疗效尚待观察。',[ids.mouse]),
 s13:pick('out_of_scope','作者页面明确日期9月16日，为旧立场文章；今日转发不构成11月2日新发表或意识问题科学定论。',[],'low'),
 s15:pending('马斯克原帖网络失败；未取得完整语境和成本分母，不能将社交转述写成已验证业务成本。',['https://x.com/elonmusk/status/2116992258520064397']),
 s17:pick('added','已读TechCrunch11月1日报道；计划、提议及Axios转述均保留归属，未写成已生效政策。',[ids.campus]),
};
const secYesterday={
 s9:pick('duplicate','与昨日官方帮助页共享额度事件一致，未制造第二次12月政策发布。',[byTitle(/帮助页说明12月/)]),
 s10:pick('duplicate','DeepSeek研究原型已有昨日完整原文与事件，媒体跟进不等于新版本。',[byTitle(/DeepSeek.*Super-agent/)]),
 s12:pick('duplicate','卡与设备限制已有昨日帮助页事件，不能混同使用额度。',[byTitle(/支付卡|卡与设备|卡.*设备限制/)]),
 s13:pending('账户切换与额度发放社交细则尚无可留存官方完整原文。',['https://x.com/thsottiaux/status/2116405414921384099']),
 s14:pending('Prism团队成员社交原帖未取得完整过渡方案，关闭范围和日期尚待确认。',['https://x.com/feitong_yang/status/2116245744327995489']),
 s16:pick('duplicate','可信访问为9月既有事件；changelog提及不证明本日向通用用户新开放。',[byTitle(/扩大 GPT-Rosalind/)]),
 s17:pick('out_of_scope','Astra for Law是9月既有公开介绍，本次价格页面存在不能证明今日新增发布。',[],'low'),
 s19:pending('Command Code社交原文未取得，永久额度的适用模型与限制无法确认。',['https://x.com/CommandCodeAI/status/2116329543921475861']),
 s20:pending('OpenCode开发者社交原帖未取得，服务调整范围未完成核实。',['https://x.com/thdxr/status/2116581467715195278']),
 s22:pick('duplicate','自动红队研究原文与昨日事件一致；研究实验不等于已部署功能。',[byTitle(/自动.*红队|红队.*自动/)]),
 s24:pick('duplicate','11月1日已按官方水印文档收录，默认行为与适用文本类型沿用既有核验。',[byTitle(/Grok.*水印/)]),
 s25:pick('duplicate','Blackstone评级预期已有昨日媒体事件；本次澄清另外收录，不改成公司正式评级。',[byTitle(/Blackstone/)]),
 s26:pick('covered','中文口径复核已收录；首批认购承诺非最终融资额，未将WSJ摘要当完整独立核验。',[ids.financing]),
 s27:pick('duplicate','Daybreak Blue数据政策报道已在昨日收录，保留媒体所见邮件和退出选项归属。',[byTitle(/Daybreak/)]),
};
const mediaMap={
 'media-39afec4bf362515ddaf1':ids.comma,'media-2bcd7c4c2c7124fc0874':ids.comma,'media-5f46015f3c5d59535566':paperIds[2],'media-7cb3024ae8d27fa60295':paperIds[2],'media-f54ad0c9fdbd7a9b984f':ids.financing,
};
const oldMap={
 'media-b43e5028ae56ce29c465':/Treg/,'media-39dc0904c80d148c8a60':/灵光 2.0 发布/,'media-3a7fb1b21be4415c44e7':/异构推理/,'media-cacb7b73969a3eb7a9d1':/异构推理/,'media-19af51797d915ac445bf':/Mol-1/,'media-d2d8f82f360e222a35db':/RWE-Bench/,'media-9b4f5e9f2827ddafbe53':/CLASHarness/,'media-c93237c5161da558f962':/帮助页说明12月/,'media-0323ec6e8c9320452621':/帮助页说明12月/,'media-9d9164d8b68dbd520f88':/帮助页说明12月/,
};
for(const row of review.media.items){
 if(row.disposition!=='needs_review')continue; // Prepared carry proof keeps genuine historical times.
 const c=media.candidates.find(c=>c.id===row.id);let d;
 if(c.sourceId==='juya'){
  const sections=c.sourceDate===date?secToday:secYesterday;
  d=pick('mixed','已逐节判断本期全部内容：新增事实、旧事件、旧文与原始出处受限分别处理；没有用部分已覆盖代替整期审阅。',Object.values(sections).flatMap(s=>s.eventIds));
  row.subreviews=c.sections.map(s=>{if(!sections[s.id])throw Error('Missing section '+s.id);return {...(row.subreviews??[]).find(x=>x.id===s.id),id:s.id,...sections[s.id]};});
 }else if(mediaMap[c.id])d=pick('added','已阅读对应完整正文/官方摘要；中文镜像与公众号同一内容合并，保留原文日期和表述边界。',[mediaMap[c.id]],/三维|Agent/.test(c.title)?'high':'normal');
 else if(oldMap[c.id])d=pick('duplicate','与已发布核验事件逐项对照：'+c.title+'。报道再传播和镜像日期不作为再次首发。',[byTitle(oldMap[c.id])]);
 else if(c.id==='media-c8fb213cef90e5c449ea')d=pending('量子位正文已读，仅有截图、前端字符串与疑似权重；官方最新入口未宣布6.2/Mythos5.5正式发布，不下载不明权重。',[c.url,'https://www.anthropic.com/news','https://platform.openai.com/docs/changelog?date=Oct%2030%202026']);
 else if(c.id==='media-881701592e7077bb9223')d=pick('mixed','逐段核对极客早报：训练偏好是10月30日旧公告，政策宣传是计划；苹果/汽车/游戏/配件非本期技术增量，Reddit流量与宏观推理统计缺独立口径，不据此断言因果。',[ids.campus,byTitle(/训练偏好/)]);
 else if(['media-8775793a36464489b7dc','media-6a6ddbe2e8e2a0cf608d'].includes(c.id))d=pick('out_of_scope','已读全文，主体是10月29日访谈对未公开成果的自述，举例科研多为10月既有工作；未公开成果无法当成新的已证实科学发现。',[],'low');
 else if(c.id==='media-9fdf1db0e07be78f8780')d=pending('已读评论正文，但其内存分配动机和40%产能说法缺已交割订单，访谈与会面仍需原始语境；不接受标题的归因。',[c.url,'https://cheekypint.transistor.fm/39/transcript']);
 else if(c.id==='media-25d0ea7eed2643210d33')d=pick('out_of_scope','旧模型退役史与拟人化纪念文章，未提供本日可核验的新退役公告或新功能，不当作新事件。',[],'low');
 else if(c.id==='media-ecef6a07280203747c8e')d=pick('out_of_scope','已核对arXiv原始摘要：首发10月8日，作者称与AI协作，并非11月2日新论文；保留目录后续阅读，今日论文3篇优先Agent安全/表征/室内空间，不把媒体再述改为首发。',[],'normal');
 else if(c.id==='media-4a0fe19cbd27239371d4')d=pick('out_of_scope','西湖大学新中心与学科布局是机构组织新闻，未给可测试模型/数据/工程成果；与本期产品和技术选题相比优先级低。',[],'low');
 else if(c.id==='media-d19ad0628a8ab9e512a0')d=mem['359551'];
 else if(c.id==='media-0866ef312eaa783d86c1')d=pick('out_of_scope','全文为DeepSeek社区文化与拟人化传播分析；未给新增可验证模型、产品或工程版本。',[],'low');
 else if(c.id==='media-156f3096451c0f9a6cb1')d=pending('已读量子位AWM正文；ARC任务与形式化证明主张需要论文/代码和固定测试协议，文章缺明确原始URL，暂不能确认宣称效率及失败样本。',[c.url],'定位清华团队AWM论文、原始仓库与183关完整评测，核对日期及Lean证明范围。','high');
 else if(c.id==='media-08b28bcc30dbb7416ae2')d=pick('out_of_scope','全文为早年便利店机器人失败史与物理操作的回顾；没有本期新版本或真实可比实验，不伪装今日机器人新失败。',[],'low');
 else if(c.id==='media-93fc5729c04f0889e39e')d=pending('公众号入口返回65字验证页；未完整读取UniWAM 24项真机评测，不能只凭标题确认导航/操作双第一。',[c.url],'取得作者仓库或论文和评测表，核对训练前提、全部任务与真实发布日期。','high');
 else if(c.id==='media-d368b2fedc47fa1644d6')d=pending('公众号原文返回验证页；混合注意力具体方法与代码出处未核实，未将标题当新模型发布。',[c.url]);
 else if(c.id==='media-aaa6ccdc23e2c4295523')d=pending('新智元全文提及匿名Obsidian模型榜单，匿名身份不能与正式模型绑定；未取得作者确认，不冒充厂商发布。',[c.url]);
 else throw Error('Unassigned media '+c.id+' '+c.title);
 Object.assign(row,d);delete row.carriedFromRunDate;
}
const report={id:'ai-'+date,title:'AI 大事件与前沿论文日报 '+date,date,channel:'ai',format:'markdown',path:'/reports/ai-events-'+date+'.md'};
await write(base+'/ai-before-current-batch.json',old);
await write('data/dev/ai-events-latest.json',{schemaVersion:'1.0.0',generatedAt:now,asOf:date,report,collectionWindow:{from:date,to:date},aiEvents:events,candidates:[],run:{id:'wagmi-ai',name:'AI 大事件与论文每日采集',channel:'ai',schedule:'每天 07:30',runDate:date,batchId:'wagmi-ai:'+date,status:'running',startedAt:now,artifact:report.path},sourceStatus:media.sources});
await write('data/dev/ai-editorial-repairs-'+date+'.json',{runDate:date,checkedAt:now,events,verifiedSources,pendingEvents:[],noNewEvents:false,discoveryChecked:true});
review.readingReviews=events.map(e=>e.readingSources.length?{eventId:e.id,status:'provided',checkedAt:now,urls:e.readingSources.map(s=>s.url),reason:'本轮对应中文官方正文、已读中文报道或橘鸦具体小节；事实证据另绑定原文。'}:{eventId:e.id,status:'not_found',checkedAt:now,checkedSources:['本日全部9个中文入口及104候选','Memene17条线索的来源；内部发现链接不当公开阅读',e.sources[0].url],reason:e.id===ids.hackertube?'当日中文候选未包含可读的公开中文独立正文；原始社交帖已读，未把内部摘要冒充阅读链接。':'当日中文入口未找到此客户案例完整公开中文报道；官方原文为英文，不伪标中文。'});
await write('data/dev/ai-discovery-review-'+date+'.json',review);
await write(base+'/web-original-reviews.json',{checkedAt:now,sources:[{url:'https://openai.com/index/credit-saison',sourceDate:'2026-10-30',observation:'web打开完整官方案例，315员工、954%自报ROI及14小时月节省；非独立审计。'},{url:'https://openai.com/index/community-safety-report-and-new-protections-for-teens',observation:'web打开完整正文，已有历史正式事件，未重复发布。'},{url:'https://openai.com/index/helping-websites-express-ai-training-preferences',observation:'10月30日，实施在未来数月；已有历史正式事件，未重复发布。'}]});
await write(base+'/editorial-decisions.json',{runDate:date,checkedAt:now,ids,paperIds,memene:review.memene.items,media:review.media.items});
console.log(JSON.stringify({events:events.length,memene:review.memene.items.length,media:review.media.items.length,ids},null,2));

import fs from 'node:fs/promises';
const date='2026-11-01',base='data/dev/source-archives/audit-1200-'+date;
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const write=async(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2)+'\n');
const [old,idx,media,review,fetches]=await Promise.all(['data/dev/ai-events-latest.json','data/dev/index.json','data/dev/ai-media-latest.json','data/dev/ai-discovery-review-'+date+'.json',base+'/fetch-results.json'].map(read));
if(old.asOf!==date)await write(base+'/ai-before-today.json',old);
const now=new Date().toISOString(),events=[],verifiedSources=[];
const history=idx.aiEvents??[];
const juya=media.candidates.find(c=>c.sourceId==='juya'&&c.sourceDate===date);
const publicUrl=c=>c.url.replace(/^http:/,'https:');
const byTitle=pattern=>{const e=history.findLast(e=>pattern.test(e.title));if(!e)throw Error('Missing historic event '+pattern);return e.id;};
function fetched(url){return fetches.find(f=>f.url===url);}
async function add(key,title,summary,why,action,url,reading,options={}){
 const id='ai-'+date+'-'+key;
 const f=fetched(options.retrievalUrl??url);
 if(!options.webEvidence&&(!f?.success||f.chars<500))throw Error('Missing readable evidence '+url);
 const event={id,date:options.date??date,title,summary,whyItMatters:why,action,
  boards:options.boards??['AI Agent','Workflow / Tutorial / Usage Tips'],priority:options.priority??'B',
  sourceType:options.sourceClass==='trusted_media'?'media_report':'official_announcement',verification:'verified',entities:[],contentKind:'industry_event',
  sourceReportId:'ai-'+date,repoCandidates:options.repos??[],sources:[{label:options.sourceClass==='trusted_media'?'已读媒体原文（结论按报道归属）':'已读官方原始来源',url}],
  readingSources:reading?[{label:options.readingLabel??'中文原文 / 解读',url:reading,language:'zh',role:'coverage'}]:[],weeklyRecommended:options.priority==='A',
  dateSemantics:options.dateSemantics??'按该原文报道/发布日期记录；收录日期为 '+date+'，不将较早事件改为当天发生。'};
 events.push(event);
 verifiedSources.push({url,checkedAt:options.webEvidence?now:f.checkedAt,success:true,verification:'verified',sourceClass:options.sourceClass??'official',
  method:options.webEvidence?'web tool opened official full text; direct Node request 403 retained':'原始正文/作者README逐项阅读，核对日期、归属与结论边界；未运行外部代码',
  contentExcerpt:summary,eventIds:[id],retrievalUrl:options.retrievalUrl??url,evidencePath:f?.path??base+'/web-evidence.json'});
 return id;
}
const ids={};
ids.treg=await add('treg','Treg 开源 Agent 工具网关，量子位介绍按次找人工作流','量子位11月1日介绍Treg与Jev组合：Agent拆解找人条件，调用人员数据、邮箱检索和验证工具。作者仓库确认单入口、多供应商和自带密钥模式；低价与85%成本比较属于供应商样本，未作独立复现。','工具接入与判断模型开始分层，可评估团队工具治理和真实调用成本。','先检查供应商数据许可、密钥隔离与计费，再用小型公开样本对照；不把营销样本视为通用精度。','https://github.com/superdesigndev/treg','https://www.qbitai.com/2026/11/506922.html',{repos:['superdesigndev/treg'],dateSemantics:'11月1日中文报道；仓库为当日复核的现有实现，不推定其首次开源日。'});
ids.super=await add('superagent','DeepSeek 公开 Super-agent 研究原型，强调按授权持续协作','DeepSeek的dsh-superagent-prototype面向单个GitHub仓库，连接GitHub与可选飞书，按请求或团队规则启动工作。README明确这是研究参考原型，并非正式产品；与内部实现和设计文章不同，部分设想尚未实现。','长任务的关键是授权、状态与人工验收，而非只增加并行会话。','先审阅权限与执行模型，再在隔离仓库验证；不把架构设计中的全部能力视为已交付。','https://github.com/deepseek-ai/dsh-superagent-prototype','https://www.qbitai.com/2026/10/506904.html',{date:'2026-10-31',repos:['deepseek-ai/dsh-superagent-prototype'],priority:'A',dateSemantics:'官方设计文章及中文报道为10月31日；11月1日复核公开原型。'});
ids.rwe=await add('rwe','RWE-Bench 用真实 CAD 与仿真任务评估工程 Agent','Xplore的RWE-Bench覆盖机械、电子与航空工程，要求Agent建模、仿真并满足全部约束，由确定性程序与物理求解器验收。新智元11月1日解读该榜单；小样本、模型推理配置和成本口径限制了排名外推。','写代码成绩不能替代几何、应力、热学与阻抗等工程闭环能力。','将约束满足率、仿真收敛和复核成本纳入设计Agent试验；不把一次排名推广为所有工程任务能力。','https://xplore.ai/rwe-bench','https://aiera.com.cn/asi-post.html?id=121637',{date:'2026-10-27',boards:['AI-CAD / AEC','AI Agent'],priority:'A',dateSemantics:'中文原文明确榜单10月27日发布；11月1日发现并复核，不写成当天首发。'});
ids.clash=await add('clasharness','CLASHarness 开放可执行多 Agent 冲突评测框架','作者仓库公开600个冲突评测回合及可控生成框架，覆盖状态过期、队友文字与视觉证据矛盾、共享锁和交接。README列出15个模型的测试，强调单项检查通过不等于完整任务闭环；本次只读代码说明，未运行评测。','多Agent协作要验证真实环境状态、资源释放与交接，不能只信队友汇报。','挑选监控矛盾和锁冲突案例，检验现有Agent是否能自主复核并完成交接。','https://github.com/google-research/CLASHarness','https://aiera.com.cn/asi-post.html?id=121624',{repos:['google-research/CLASHarness'],priority:'A',dateSemantics:'11月1日中文报道与作者仓库复核；不推定论文首发日，本条记录评测工程实现。'});
ids.mol=await add('mol1','Molence 公开 Mol-1 生物分子模型代码与权重入口','Mol-1作者仓库提供蛋白质、核酸与配体复合物预测、微调与权重下载说明；代码显示Apache-2.0许可，模型权重及第三方数据仍须各自核对。新智元报道的抗体和超大复合物成绩属于团队实验，不能据此宣称临床有效或全面超越闭源模型。','开源结构预测可作为科研工程候选，完整环境与许可比标题排名更重要。','复核权重条款、硬件要求和原始评测，再决定是否列入科研模型跟踪。','https://github.com/molence/Mol-1','https://aiera.com.cn/asi-post.html?id=121681',{repos:['molence/Mol-1'],boards:['AI Product / Model Launch','Frontier Paper / Research'],dateSemantics:'11月1日媒体报道；仓库与权重入口当天核对，不推定模型首发日。'});
ids.token=await add('heterogeneous-token','新智元报道趋境、智谱与摩尔线程联合发布国产异构推理方案','新智元11月1日报道，三方在10月31日GAI+C大会发布国产异构推理AI Token工厂方案，并转述趋境超13亿元B轮融资及年内累计24亿元。性能与经营增长数字来自报道及厂商陈述，尚未进行独立生产测量。','国产推理部署开始以异构系统吞吐、时延和每Token成本作为方案交付指标。','索取相同模型、精度、并发和完整成本下的实测数据，再与现有推理栈比较。','https://aiera.com.cn/asi-post.html?id=121647','https://aiera.com.cn/asi-post.html?id=121647',{date:'2026-10-31',sourceClass:'trusted_media',retrievalUrl:'https://aiera.com.cn/wp-json/wp/v2/posts/121647?_embed=1',boards:['Market / Business Model','AI Product / Model Launch']});
ids.economics=await add('coordination-economics','DeepMind 经济学文章把 Agent 协调能力列为组织变革变量','DeepMind Institute于10月29日发表文章，区分单体能力与组织协调：前者逐步改变工资与分工，后者跨过阈值时可能引发市场集中与就业跃迁。文中的工资变化是简化模型情景，不是现实工资预测或已发生结果。','评估自动化价值时需要同时衡量协作摩擦与组织成本。','把交接、验证和上下文同步纳入试点指标，避免只用单体模型跑分推演团队收益。','https://institute.deepmind.com/essays/the-economics-of-intelligence/','https://aiera.com.cn/asi-post.html?id=121728',{date:'2026-10-29',boards:['Market / Business Model','AI Agent']});
ids.selfeval=await add('self-evaluation-report','新智元解读 Claude 自评监控，个体封号因果仍需证据','新智元11月1日介绍Claude在生成后利用已有上下文进行安全自评的机制，并转述监控成本与误报表现。报道的“突然封号”归因属于作者推断；本轮官方社交原帖403，不能据此认定某个账户的封禁原因。','安全监控与前台回答是不同环节，自动标记、人工处置和误报应分别审视。','保留媒体归属与访问限制，核对官方说明及具体账户通知，不传播逐句聊天均会导致封号的断言。','https://aiera.com.cn/asi-post.html?id=121700','https://aiera.com.cn/asi-post.html?id=121700',{sourceClass:'trusted_media',retrievalUrl:'https://aiera.com.cn/wp-json/wp/v2/posts/121700?_embed=1',boards:['AI Security / Governance']});
ids.usage=await add('chat-codex-usage','OpenAI 帮助页说明12月起 ChatGPT 与 Codex 共享用量','OpenAI帮助页说明，12月起Plus、Pro和Business的ChatGPT与Codex将共享按Token计量的用量，Instant聊天不扣这份额度；用户可在设置查看剩余额度和重置时间。页面未给出具体生效日或各档新额度。','聊天与编码任务的预算将联动，现有单产品用量安排需要重新核对。','按账户实际Usage提示规划任务，等待具体实施细则，不自行推算套餐降额。','https://help.openai.com/en/articles/20001625-understanding-chatgpt-and-codex-usage-limits',juya.url+'#s9',{webEvidence:true,priority:'A',boards:['AI Coding','Market / Business Model'],dateSemantics:'11月1日核对当前帮助页，页面显示15小时前更新；记录规则观察日，不声称11月1日已生效。'});
ids.device=await add('card-device-limits','OpenAI 说明 ChatGPT 支付卡与设备限制，区别于用量耗尽','OpenAI帮助页说明，同一卡或设备关联订阅过多可能阻止购买，设备也限制可使用的付费账户数；适用Go、Plus与Pro各档，Free及Business、Enterprise、Edu工作区不计入。设备限制与同时登录账号数分开，买额度或重置不解除该限制。','采购和团队共用设备需要区分订阅、设备与使用量三种限制。','按官方提示联系支持或使用允许的现有账户；不把切换账号视为解除设备限制。','https://help.openai.com/en/articles/20001559-understanding-card-and-device-limits-in-chatgpt',juya.url+'#s12',{webEvidence:true,boards:['AI Security / Governance','Market / Business Model'],date:'2026-10-31',dateSemantics:'11月1日帮助页显示yesterday更新；未给出规则首次生效日。'});
ids.redteam=await add('automated-redteam','Anthropic 自动红队实验发现表面无害训练数据的监控盲区','Anthropic让Claude针对可访问的监控器迭代生成训练集，一些虚构写作与角色扮演数据绕过监控后，使专门微调的研究模型在测试中表现失准。团队强调实验条件偏向红队，研究模型未部署，结果不代表线上Claude行为。','训练数据监控需要对抗压力测试，不能只依赖逐行看起来是否有害。','关注监控器可见性、评测作弊检测与现实数据约束，避免把研究模型行为当作线上事故。','https://alignment.anthropic.com/2026/automated-em-search',juya.url+'#s22',{date:'2026-10-31',sourceClass:'original_research',boards:['AI Security / Governance'],dateSemantics:'作者原文仅标October 2026；10月31日发现源报道、11月1日复核，保留月精度说明，不推定精确论文首发日。'});
ids.credit=await add('anthropic-credit-report','TechCrunch 转述 Blackstone 对 Anthropic 信用评级预期下调','TechCrunch10月30日援引FT报道，Blackstone预计Anthropic上市后可能获双B档投机级评级，较此前投资级预期降低。此为融资参与方预测，评级机构尚未在该报道中发布最终评级；两家公司拒绝置评。','算力融资对信用预期和资金成本敏感，应与已授予评级分开。','等待评级机构和公司披露，不把投资人预测写成评级落地。','https://techcrunch.com/2026/10/30/anthropic-expected-to-receive-high-junk-rating-from-credit-agencies-following-ipo-report-says/',juya.url+'#s25',{date:'2026-10-30',sourceClass:'trusted_media',boards:['Market / Business Model']});
ids.daybreak=await add('daybreak-data-report','The Decoder 报道 Daybreak Blue 训练数据规则拟调整','The Decoder10月31日报道，OpenAI给Trusted Access成员的邮件拟自11月29日起调整Daybreak Blue会话训练用途，后续邮件承诺单独退出选项。信息来自媒体所见邮件；通用数据控制页不足以确认全部适用范围和账户条款。','安全研究会话的训练用途可能与常规开关不同，需要核对特定方案通知。','检查本人收到的正式通知和退出选项；不将媒体转述扩展为所有用户的新规则。','https://the-decoder.com/openai-plans-to-train-models-on-daybreak-blue-cybersecurity-session-data-that-was-previously-off-limits/',juya.url+'#s27',{date:'2026-10-31',sourceClass:'trusted_media',boards:['AI Security / Governance']});
const pick=(key,disposition,reason,eventIds=[],importance='normal',attemptedSources=[],nextAction='')=>({key,disposition,reason,eventIds,importance,checkedAt:now,...(attemptedSources.length?{attemptedSources,nextAction}:{})});
const pending=(key,reason,urls,next='重新核对原始正文或官方发布，确认事实和原始日期后补写，不以摘要代替。',importance='normal')=>pick(key,'pending',reason,[],importance,urls.map(url=>{const f=fetched(url);return {url,result:f?`本轮实测HTTP ${f.status??'无响应'}；${f.chars??0}字；${f.error??(f.chars<100?'返回验证/空壳页面，未取得正文':'正文已查，但未提供可独立确认该断言的原始证据')}`:'已读取当前发现源原始引用，尚无可解析原始出处；需定位原文'};}),next);
const mem={
 '359033':pick('359033','duplicate','已与10月31日融资报道事件对照，保留金额的媒体归属；不将披露或估值重写为11月1日融资。',[byTitle(/DeepSeek第二轮融资/)],'high'),
 '359034':pick('359034','duplicate','苹果中国正式公告及测试时间已在10月31日事件收录；仍保留11月4日/12月计划和授权边界。',[byTitle(/Apple 智能将于中国/)]),
 '359035':pick('359035','out_of_scope','市值轮换和指数涨跌是交易行情，未构成新增AI产品、技术或工作流信号。',[],'low'),
 '359036':pending('359036','Bloomberg/FT融资目标报道正文未取得，且目标、承诺额和完成额不能混用。',['https://www.bloomberg.com/news/articles/2026-10-31/openai-funding-goal-cut-by-10-billion-as-ai-stocks-dip-ft-says']),
 '359037':pick('359037','added','已读DeepSeek官方仓库并补入研究原型事件；明确研究参考、非正式产品和未实现设计。',[ids.super],'high'),
 '359038':pending('359038','公众号原文返回验证页；参数与匿名评测是爆料，不能与已存在的法律定价配置混为正式新模型发布。',['https://mp.weixin.qq.com/s/69Bv-84vlsqh8b3F8othXg']),
 '359039':pending('359039','Bloomberg会面报道网络请求超时，未取得完整原文；不确认投资总额与内存占比。',['https://www.bloomberg.com/news/articles/2026-10-31/openai-sam-altman-samsung-executives-memory-crunch-deepens']),
 '359040':pick('359040','duplicate','极客公园个人助理实测与10月28日发布事件方向相同；11月1日官网全文复核作为阅读补充，非再次发布。',[byTitle(/灵光 2.0 发布/)]),
 '359041':pending('359041','原引用为无法读取的早报；未定位Arena原始统计与2.6万会话样本口径。',['https://mp.weixin.qq.com/s/UlGEdWPcBZKZlPuy08pWRQ']),
 '359042':pending('359042','APPSO原文仅返回验证页，手术细节及公司自述无法完整阅读，不能将临床效果写成独立验证。',['https://mp.weixin.qq.com/s/HporPfPNMy54GSKsQ2A92Q']),
 '359043':pick('359043','duplicate','Jules关停已在10月30日官方核验事件收录；采用已有明确时间，避免发现摘要的时间缺失覆盖原证据。',[byTitle(/Jules 年底关停/)]),
 '359044':pending('359044','发现记录未给出Fortune原始文章URL；现有检索与主页不足以证实98%重写目标及人物归属。',['https://www.fortune.com/']),
 '359045':pick('359045','duplicate','Neuralink早期原型和语音演示已在10月31日事件收录，保留临床研究限定，不重新制造发布日期。',[byTitle(/Neuralink/)]),
 '359046':pending('359046','两条社交转述未附陶哲轩原话场合和MIT实验原始出处；未从作者入口取得可绑定的发言。',['https://terrytao.wordpress.com/']),
 '359047':pending('359047','原引用验证页不可读；新增问题口径、峰值比较和AI因果未经平台数据确认。',['https://mp.weixin.qq.com/s/UlGEdWPcBZKZlPuy08pWRQ']),
 '359048':pending('359048','原早报正文访问受限，尚无Reddit官方具体登录范围和生效日期证据。',['https://mp.weixin.qq.com/s/UlGEdWPcBZKZlPuy08pWRQ']),
 '359049':pick('359049','added','已读取Anthropic研究原文并补入自动红队实验，保留实验偏置和模型未部署边界。',[ids.redteam]),
 '359050':pick('359050','out_of_scope','前三季度软件业与集成电路总量属于宏观统计，未含可单独核验的AI产品或研究变更。',[],'low')};
for(const row of review.memene.items){const d=mem[row.id];if(!d)throw Error('Missing memene '+row.id);Object.assign(row,d);delete row.key;}
const sections={
 s9:pick('s9','added','已读官方帮助全文，明确12月共享用量、Instant例外及未公布具体额度。',[ids.usage],'high'),
 s10:pick('s10','added','官方研究原型与架构说明已核对并收录，未把设想当成已实现能力。',[ids.super],'high'),
 s12:pick('s12','added','官方帮助页正文已复核，分开卡/设备/用量限制。',[ids.device]),
 s13:pending('s13','官方社交原帖403，未取得可留存重置发放细则；需区分账户切换与设备限制。',['https://x.com/thsottiaux/status/2116405414921384099']),
 s14:pending('s14','团队成员原帖直连失败，未取得完整过渡、下载与关闭时间说明。',['https://x.com/feitong_yang/status/2116245744327995489']),
 s16:pick('s16','duplicate','GPT-Rosalind可信访问已有9月事件；现有帮助页说明机构审批与使用范围，未证实本日新发布，不以橘鸦首见改写首发日。',[byTitle(/扩大 GPT-Rosalind/)]),
 s17:pick('s17','out_of_scope','已核对官方介绍首发9月17日及当前价格页面；未找到本日新的API开放公告，当前价目存在不足以制造再次发布事件。',[],'low'),
 s19:pending('s19','Command Code原始社交帖子请求失败，永久额度及完整权重说法未取得原文。',['https://x.com/CommandCodeAI/status/2116329543921475861']),
 s20:pending('s20','OpenCode开发者原帖请求失败，未取得被移除配置与影响范围的完整说明。',['https://x.com/thdxr/status/2116581467715195278']),
 s22:pick('s22','added','已读作者研究原文，明确实验模型未部署且对抗条件偏向红队。',[ids.redteam]),
 s24:pending('s24','Grok水印文档网络请求失败，尚未核对默认开启日期、锁定模型与输出类型。',['https://docs.x.ai/developers/advanced-api-usage/watermarking?lid=860k1ub3kf6m']),
 s25:pick('s25','added','已读TechCrunch正文，明确这只是Blackstone预测，非评级机构已授评级。',[ids.credit]),
 s26:pending('s26','WSJ正文未取得；110亿承诺额、200亿目标及完成额不能合并为已融资数。',['https://www.wsj.com/tech/ai/openai-raises-less-than-half-of-30-billion-target-in-latest-round-91aecdc5']),
 s27:pick('s27','added','已读The Decoder原文，按媒体所见邮件归属，并保留独立退出选项和通用帮助页证据不足。',[ids.daybreak])};
const newMap={
 'media-b43e5028ae56ce29c465':ids.treg,'media-d5fc9cdac15c00a40671':ids.clash,'media-833752b8164383679d3a':ids.rwe,
 'media-3a7fb1b21be4415c44e7':ids.token,'media-19af51797d915ac445bf':ids.mol,'media-093a384c0ea728ea2805':ids.selfeval,'media-19da1babe7c1947b3745':ids.economics,'media-53329debad3f5e102b5d':ids.super};
const duplicateMap={
 'media-1c97bfc2fb01ee5883cf':/灵光 2.0 发布/,'media-3059078f22e3e0961d74':/Apple 智能将于中国/,'media-e4f8ed538934e22f5c83':/星载|Suncatcher/,
 'media-b1a2c6b36a421b567dee':/Claude.*Ultra|Ultra.*Claude/,'media-616da21b41a1443848a3':/Claude.*Ultra|Ultra.*Claude/,'media-5c23692d5af12610ddb2':/Claude.*Ultra|Ultra.*Claude/,
 'media-4360b42bce7a074b01fa':/X7 Ultra/,'media-ca6963414341515fb17c':/ScienceVision/,'media-0b4a8c32ff5c0949eeab':/PrimeSim/,
 'media-142057ea3858705fafd9':/Neuralink/,'media-2327df5ded573c6d6358':/X7 Ultra/,'media-d7a89d9676f987bb6a25':/OXR/,
 'media-2c30ef0ab746425c20bd':/ScienceVision/,'media-675e9e053c693878f055':/ForgeKernel/,'media-8f3e7f31ec06494fe36f':/天禧/,
 'media-7b5ec63ba2f627258b99':/PrimeSim/,'media-666a1f719c44600b5278':/百度\s*APP/i};
for(const row of review.media.items){
 if(row.disposition!=='needs_review')continue;
 const c=media.candidates.find(c=>c.id===row.id);
 let d;
 if(c.id===juya.id){d=pick(c.id,'mixed','当期14节全部逐项审阅；已验证增量已入库，旧发布保持日期，社交/付费正文受限项保留真实尝试。',Object.values(sections).flatMap(s=>s.eventIds));row.subreviews=c.sections.map(s=>({...row.subreviews.find(x=>x.id===s.id),...sections[s.id],id:s.id}));for(const s of row.subreviews)delete s.key;}
 else if(newMap[c.id])d=pick(c.id,'added','已阅读全文、核对来源与真实日期，补入本批事件；保留报道、实验或厂商陈述的边界。',[newMap[c.id]],/工程设计|Super Agent|Agent底座|冲突/.test(c.title)?'high':'normal');
 else if(duplicateMap[c.id])d=pick(c.id,'duplicate','逐项对照已核验历史事件：'+c.title+'；原始事件未出现足以再次发布的实质增量，保留来源原日期。',[byTitle(duplicateMap[c.id])]);
 else if(/大肥鱼/.test(c.title))d=pick(c.id,'out_of_scope','AI拟人化、梗图与社区账号二创分析，未提供新的模型、工程产品或可验证工作流能力。',[],'low');
 else if(c.id==='media-4f21aeaac55207818c17')d=pick(c.id,'covered','全文已查，主项Super-agent已收录；股市、宏观预测不单列，Meta机器人仍为媒体未确认计划，未写成正式发布。',[ids.super]);
 else if(c.id==='media-b480e0921e69c8d678ee')d=pending(c.id,'10月31日聚合各节已对照：Ultra/苹果/安全/TPU已收录；Qoder、Agents API、Private Intelligence等原始补充仍需逐项确认，未以部分已覆盖宣称整期覆盖。',c.sections.flatMap(s=>s.referencedUrls).slice(0,5));
 else if(/提示词/.test(c.title))d=pick(c.id,'out_of_scope','提示词使用心得为经验建议，未提供新增可复现技术或产品变化；不作为事件发布。',[],'low');
 else if(/Deep Search|Obsidian/.test(c.title))d=pending(c.id,'新发现研究或匿名榜单消息原文受限，尚未取得足够来源确定评测或模型身份。',[publicUrl(c)]);
 else throw Error('Unassigned media '+c.id+' '+c.title);
 Object.assign(row,d);delete row.key;delete row.carriedFromRunDate;
}
review.readingReviews=events.map(e=>({eventId:e.id,status:'provided',checkedAt:now,urls:e.readingSources.map(s=>s.url),reason:'本轮已打开对应中文正文或逐节阅读橘鸦；聚合阅读不替代独立事实来源。'}));
const report={id:'ai-'+date,title:'AI 大事件与前沿论文日报 '+date,date,channel:'ai',format:'markdown',path:'/reports/ai-events-'+date+'.md'};
const latest={schemaVersion:'1.0.0',generatedAt:now,asOf:date,report,collectionWindow:{from:date,to:date},aiEvents:events,candidates:[],
 run:{id:'wagmi-ai',name:'AI 大事件与论文每日采集',channel:'ai',schedule:'每天 07:30',runDate:date,batchId:'wagmi-ai:'+date,status:'running',startedAt:now,artifact:report.path},sourceStatus:media.sources};
await write('data/dev/ai-events-latest.json',latest);
await write('data/dev/ai-editorial-repairs-'+date+'.json',{runDate:date,checkedAt:now,events,verifiedSources,pendingEvents:[],noNewEvents:false,discoveryChecked:true});
await write('data/dev/ai-discovery-review-'+date+'.json',review);
await write(base+'/editorial-decisions.json',{runDate:date,checkedAt:now,eventIds:ids,memene:Object.values(mem),sections:Object.values(sections),allMediaRows:review.media.items.length});
console.log(JSON.stringify({events:events.length,memene:review.memene.items.length,media:review.media.items.length,ids},null,2));

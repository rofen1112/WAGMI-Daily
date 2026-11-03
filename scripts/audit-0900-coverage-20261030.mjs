import {readFile,writeFile} from 'node:fs/promises';
const date='2026-10-30',base='data/dev/source-archives/audit-0900-'+date,now=new Date().toISOString();
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const [l,m,v,media,memene,main,first,last]=await Promise.all(['data/dev/ai-events-latest.json',`data/dev/ai-editorial-repairs-${date}.json`,`data/dev/ai-discovery-review-${date}.json`,'data/dev/ai-media-latest.json','data/dev/memene-daily-latest.json','data/main/index.json',base+'/fetch-results.json',base+'/last-results.json'].map(read));
async function add(key,day,title,summary,why,action,r,sourceClass,section){
 const id=`ai-${date}-${key}`,e={id,date:day,title,summary,whyItMatters:why,action,boards:['Market / Business Model','AI 3D / World Models'],priority:'B',sourceType:sourceClass==='trusted_media'?'media_report':'official_announcement',verification:'verified',entities:[],contentKind:'industry_event',sourceReportId:`ai-${date}`,repoCandidates:[],sources:[{label:sourceClass==='official'?'官方原始来源':'原文报道',url:r.url}],readingSources:section?[{label:'橘鸦Juya · 中文导读',url:`https://daily.juya.uk/issues/${date}/#${section}`,language:'zh',role:'discovery'}]:sourceClass==='trusted_media'?[{label:'中文原文报道',url:r.url,language:'zh',role:'coverage'}]:[],dateSemantics:'原始公告或报道日期；不改变首次事件时间。'};
 l.aiEvents.push(e);m.events.push(e);m.verifiedSources.push({url:r.url,checkedAt:r.checkedAt,success:true,verification:'verified',sourceClass,method:'Read original body, explicit source date, figures and evidence limits.',contentExcerpt:summary,eventIds:[id],evidencePath:r.path});
}
await add('furiosa-seriesd','2026-10-28','FuriosaAI 完成6.2亿美元D轮融资，扩展推理芯片量产','FuriosaAI在10月28日官方文章宣布6.2亿美元D轮融资，投后估值29亿美元，并称RNGD已量产，计划今年生产2万张卡、2027年继续扩产。','面向推理的专用硬件及软件生态继续吸引资本投入。','产能和能效为公司披露及计划，不能当作独立实测或已完成扩产。',last[0],'official','s46');
await add('unitree-results','2026-10-28','宇树前三季度营收18.17亿元，归母与扣非利润走势不同','IT之家10月28日转述宇树前三季度财报：营收18.17亿元，归母净利润3.87亿元、同比增270.54%，扣非净利润3.49亿元、同比降18.78%。','机器人商业化应同时观察收入、研发投入和持续经营利润。','归母利润增速不能替代扣非利润；报道日为28日，未改成30日新财报。',last[1],'trusted_media');
await add('hy4-preview','2026-10-29','腾讯预告混元 Hy4 与 Hy4 flash，视觉理解属于即将推出能力','科创板日报记者于10月29日在腾讯大会现场报道，汤道生预告Hy4和Hy4 flash即将发布，强调长程任务、效率与首次视觉理解能力。','多模态与长程Agent能力继续进入企业模型竞争。','这是发布预告，不能写成今天已经全量开放；性能提升保留发言人归属。',first.find(r=>r.i===79),'trusted_media','s48');
const id=key=>key.startsWith('ai-')?key:`ai-${date}-${key}`;
const done=(row,disposition,keys,reason,importance=row.importance??'normal')=>{delete row.carriedFromRunDate;Object.assign(row,{importance,disposition,reason,eventIds:(keys??[]).map(id),checkedAt:now});return row;};
const pending=(row,reason,url,result,next,keys=[])=>{done(row,'pending',keys,reason);Object.assign(row,{attemptedSources:[{url,result,checkedAt:now}],nextAction:next});};
const excluded=(row,reason)=>done(row,'out_of_scope',[],reason,'normal');
const memRules={
 '358487':['alphabet-market','已读极客公园全文，核实美国29日盘中市场反应；保留一度跌逾13%的时点与媒体归属，未将盘中跌幅改写为收盘。'],
 '358507':[['misalignment-monitor','model-spec','ropes-gray'],'已逐节读三篇10月29日OpenAI正文：监控、规范、尽调案例分别收录；模拟与实际事故、目标与已实现成果区分。'],
 '358489':['pro-limits','官方oEmbed明确10月29日翻倍并取消Pro200降额；旧中文倒计时已过时，以最新官方说明纠正。'],
 '358490':['amazon-q3','彭博请求超时后读取亚马逊原始财报，收录AWS与现金流事实；未确认的盘后及单季资本开支标题不作官方结论。'],
 '358491':['microsoft-debt','已从微软10月29日公告核实250亿美元票据已定价，预计11月4日交割；用途包括一般公司事项，不能全部归因AI。'],
 '358492':['intel-q3','已读英特尔原始财报与四季度指引，补齐经营数据；股价重挫与低于市场预期仍属未独立确认的市场描述。'],
 '358493':['samsung-q3','已读三星10月29日财报，收录AI存储业务与财务事实；未将资本开支涨幅及回报延期说法冒充该财报确认。'],
 '358494':['misalignment-monitor','已读OpenAI原始正文，重放30分钟报警与9月15分钟实际报警分别表述，不重复官方速览章节。'],
 '358496':['model-spec','已读10月29日OpenAI文章和当日规范页面，五项价值与上下文等变化单独收录。'],
 '358497':['buddy-one','已读卡兹克原创实测及公开RSS正文；共享积分、只读连接和仍需MCP写入的边界被保留。'],
 '358498':['unitree-results','微信原文受限后找到IT之家10月28日财报转述，区分归母增长与扣非下降，不把财报重标成30日。'],
 '358499':['mistral-large4-weights','已读Mistral10月29日权重公告与模型卡；定位开放权重，厂商排名与基准保留归属。'],
 '358502':['ai-2026-10-29-minicpm-ocr-jev','对应昨日已发布MiniCPM-OCR及Jev事件；本条是同一发布的媒体再传播，保留历史事件，不重复制造30日模型首发。']
};
for(const row of v.memene.items){
 const rule=memRules[row.id];if(rule){done(row,row.id==='358502'?'duplicate':'added',Array.isArray(rule[0])?rule[0]:[rule[0]],rule[1]);continue;}
 const c=memene.target.candidates.find(c=>c.id===row.id);
 if(['358508','358495'].includes(row.id)){excluded(row,'已读Anthropic self-assessment原文，首次发表日为10月16日，29日官方帖为再次介绍，不改写成今天上线的新安全机制。');continue;}
 if(row.id==='358488'){pending(row,'招股书主体已有10月27日IPO与29日计算义务报道；本条客户集中度与客户数增量尚未从付费原文或S1具体表格复核。',c.sources[0].url,'微信返回环境异常验证页；已读Verge公开报道，未见该组完整数字。','核对SEC原始S1客户与代码贡献段落，再更新同一IPO事件。',['ai-2026-10-27-anthropic-ipo']);continue;}
 if(row.id==='358500'){pending(row,'DeepSeek V5代码出现不等于模型已经发布；候选未给出确切仓库路径或提交。',c.sources[0].url,'微信原文返回环境异常；定向检索未找到可解析的当期官方提交。','取得官方owner/repo和commit，核对是否公开发布而非占位。');continue;}
 if(row.id==='358501'){pending(row,'天数智芯现场对比涉及具体GPU、精度与负载，尚无可读原始测试正文，不能发布胜出结论。',c.sources[0].url,'微信原文返回环境异常验证页；定向检索未取得当期原始测试报告。','读取量子位原文或厂商测试设置、设备和脚本。');continue;}
 if(row.id==='358503'){pending(row,'已读橘鸦对应条目，但三方模型名单尚未从独立可读产品公告核实。','https://mp.weixin.qq.com/s/CAf2i5jb2E0jPFgr0oM0Tw','原始微信链接HTTP200但正文为环境异常页；定向检索没有取得官方名单。','核对豆包工作企业版公告和账户内实际模型列表。');continue;}
 if(row.id==='358504'){excluded(row,'K3.1 Pro发布已有10月24日事件；此候选未附可审查的实测原文和测试条件，不把个人排行与代码保守评价当成新模型发布。');continue;}
 if(['358505','358506'].includes(row.id)){pending(row,row.id==='358505'?'日本81起网络事件的统计范围与AI归因尚待原始报告核实。':'蒸馏目标涉及对机构的报道归因；可读页面只有订阅提示，无法确认报道正文与具体证据。',c.sources[0].url,row.id==='358505'?'彭博两篇原始请求均超时，未读到正文。':'HTTP200页面仅标题与订阅提示，不能作为正文事实核验。',row.id==='358505'?'核对日本官方事件统计及彭博完整报告。':'取得The Information可读原文并保留报道与当事方回应归属。');continue;}
 throw Error('Unreviewed Memene '+row.id);
}
const sectionMap={s10:'pro-limits',s12:'ultrathink',s13:'jules-turndown',s14:'antigravity-marketplace',s15:'herdr',s16:'droid1',s19:'openrouter-routing',s21:'gemini-files',s22:'notebook-textbooks',s24:'enterprise-reports',s25:'grok-referrals',s26:'kimi-google-connectors',s28:'mimo-quota',s30:'mistral-large4-weights',s31:'zwz2',s32:'canva-brush',s35:'misalignment-monitor',s36:'model-spec',s38:'hy-nomas-update',s41:'singapore-research',s42:'command-code-incident',s43:'idc-maas',s45:'cohere-series-e',s46:'furiosa-seriesd',s48:'hy4-preview'};
const jrow=v.media.items.find(r=>r.id===juyaId());
function juyaId(){return media.candidates.find(c=>c.sourceId==='juya'&&c.sourceDate===date).id;}
for(const row of jrow.subreviews){
 const s=media.candidates.find(c=>c.id===jrow.id).sections.find(s=>s.id===row.id);
 if(sectionMap[row.id]){const e=l.aiEvents.find(e=>e.id===id(sectionMap[row.id]));done(row,'added',[sectionMap[row.id]],`已读该节所指原始正文与日期，并单独收录“${e.title}”；保留厂商/报道归属、开放范围与证据限制。`);continue;}
 if(row.id==='s40'){done(row,'duplicate',['ai-2026-10-29-anthropic-science'],'已读Anthropic原文，日期为10月28日，20家科研机构合作已在昨日日报，不按30日聚合日重复发布。');continue;}
 if(row.id==='s34'){excluded(row,'已读self-assessment原文，首次日期10月16日；29日官方重新介绍不能改成新技术首发。');continue;}
 if(row.id==='s37'){excluded(row,'播客中的数学算力投入与单一超级智能观点属于访谈评论，非新增可验证产品或论文结果，保留背景而不精选。');continue;}
 if(row.id==='s17'){pending(row,'已读该节，Kimi K2.8 Preview限时折扣未提供原始公告，具体起止时间不可确认。',s.url,'当期全文可读，但该节没有任何原始参考链接。','核对Kimi Code官方用量公告及折扣有效期。');continue;}
 if(row.id==='s18'){pending(row,'已读OpenCode Go当前文档，但页面未给出Teams方案首次上线日，不能按聚合日期推定新品发布。',s.referencedUrls[0],'官方文档HTTP200可读；当前说明可确认，缺少本次变更的原始时间。','取得官方发布帖或变更记录后按真实日期补入。');continue;}
 if(row.id==='s23'){pending(row,'官方首条可读公告确认并排预览，已收录；本节另称多账号与CarPlay，嵌入未覆盖全部串帖，未直接照录。',s.referencedUrls[0],'公开oEmbed只返回首帖，直接X正文403。','读取完整官方串帖或移动端版本说明，核对其余能力。',['claude-mobile']);continue;}
 if(row.id==='s27'){pending(row,'豆包工作三方模型名单与企业范围尚需独立公告正文，聚合摘要不足为事实证据。',s.referencedUrls[0],'微信正文为环境异常验证页；定向搜索未取得可读官方名单。','核对企业版产品公告或可信媒体完整报道。');continue;}
 if(row.id==='s44'){pending(row,'已读IDC整体市场原文并收录整体口径；阿里云46.6%的语言模型子市场数字未在可读正文中找到。',s.referencedUrls[0],'微信返回验证页；IDC整体市场正文没有这组可读子市场表格。','读取IDC子市场表格或该微信原文，分别标明整体与语言模型市场分母。',['idc-maas']);continue;}
 throw Error('Unreviewed Juya section '+row.id);
}
done(jrow,'mixed',[...new Set(jrow.subreviews.flatMap(r=>r.eventIds??[]))],`当期全部${jrow.subreviews.length}节分别审阅；新增、历史重复、旧技术和未确认项逐节列示，不能因部分覆盖认定整期covered。`);
const rules={
 'media-f8d05609cc8eefe80c2b':['added',['alphabet-market','buddy-one'],'已读整期早报；Alphabet盘中市场反应与WorkBuddy企业生态属于AI内容，硬件刷新率及汽车售后不单列AI事件。'],
 'media-189700dfa68f21b41629':['duplicate',['ai-2026-10-29-apple-touch-macbook'],'已读发布方API正文；苹果触屏MacBook已在昨日日报，今日官网转录不构成二次新品发布。'],
 'media-e3004e1b583050fc79fe':['added',['qiyuan'],'已读全部正文，标题GPT-8为设问，实际内容为启元Physical AI路线；按企业自述量产与快慢脑框架收录，不宣称GPT-8发布。'],
 'media-d13464768d62720700cb':['added',['go3-preview'],'已读正文，GO-3 Preview实际发布29日、年底开源属计划；榜单成绩保留厂商归属。'],
 'media-e2a24c503251b0563e05':['added',['pro-limits'],'已读中文正文并对照当日官方额度帖，砍半倒计时已被新公告取代；发布明确取消降额的最新事实。'],
 'media-9be764b1a9838fc0abd2':['added',['gravity-control'],'已读Gravity Control完整正文，保留已有技能前提、局部动作纠偏及整体/单项成功率口径。'],
 'media-cf0cf91067b643734672':['duplicate',['ai-2026-10-29-carbon'],'已读正文；Carbon是28日官方发布、昨日已核验事件，榜单排名与全量可用性不能从夸张标题外推。'],
 'media-2eb04ec555acaaa36828':['added',['anysearch-pro'],'通过官网公开API读取全文，按30日原始报道收录Pro方案；索引、QPS和价格保留产品自述。'],
 'media-9f62df39676eaa7d4e4a':['added',['e05'],'已读公众号RSS正文、官方项目、仓库及论文日期，几何预测与真机任务边界明确；首次论文26日不改成29/30日。'],
 'media-458713052db52bf597d1':['duplicate',['ai-2026-10-29-chatgpt-api-credits'],'合资格API额度已在昨日事件核验，公众号第二入口不重复计为今日福利。'],
 'media-d7c7af19817fa7ba0215':['added',['gravity-control'],'29日公众号原文与30日官网转录为同一Gravity Control报道，合并一个事件并保留原始报道日。'],
 'media-005c5fcddc5fe88aaa9b':['added',['pro-limits'],'已读原文及29日官方最新公告，旧的Pro200降额担忧被后续取消安排取代，发布纠正后的事实。'],
 'media-71b11c68622a885103a2':['added',['buddy-one'],'已读卡兹克原创正文，积分共享与账户只读边界分别写明，作者实测不扩大为无条件系统写入。'],
 'media-414534be96c107de2e10':['added',['jingshuo-funding'],'已读量子位获授权转载公司稿，按pre-A融资与物理AI数据基础设施收录，订单与营收不混用。'],
 'media-c5315acb60bdd5a10897':['added',['xiaoyu-lab'],'已读正文，实验室揭牌实际27日，29日报道；与钢结构/AEC有关，厂商现场效益限定到案例。'],
 'media-3ccdb25a8e3b2a8ab710':['duplicate',['ai-2026-10-29-clover-35b'],'Clover35B已在昨日事件绑定官方权重与仓库，量子位报道不重复作为新发布。'],
 'media-484bdd594051374156b0':['out_of_scope',[],'29日聚合旧期已留历史逐项审计，本轮重新对照已发布事件；今日30日当期另做全部逐节审阅，不把旧整期重发。'],
 'media-6ccd1352f98e15c3a6d4':['duplicate',['ai-2026-10-29-carbon'],'已读29日官网正文，Gemini Carbon官方28日发布已入库；半价等细节沿原始官方条款，不重发榜单标题。'],
 'media-9531b8cf2cc91f361dbe':['duplicate',['ai-2026-10-29-minicpm-ocr-jev'],'MiniCPM-OCR与Jev均已在昨日日报，模型解析与质量打分角色已分开说明。'],
 'media-ffa0769028b487c57d3b':['duplicate',['ai-2026-10-29-agents-judgment-calls'],'已读正文并对照既有事件，86%来自特定实验设定，不是顶尖专家普遍被控制的新事实。'],
 'media-0fb388c1f6fe7c1d658a':['duplicate',['ai-2026-10-27-research-release'],'ETH等三项研究输出已在27日事件保留外部审查边界；不把同一未完成社区复核的主张重发为已证伪。'],
 'media-74caa8e71ac16bc68558':['duplicate',['ai-2026-10-29-minicpm-ocr-jev'],'28日公众号与29日官网对应同一OCR报道，保留原始日期与已发布事件，不制造两次发布。'],
 'media-3e86d2c5188d04dfc3b9':['out_of_scope',[],'已读正文，核心是Pieter10月11日的个人退订实践，发生日早于本次窗口，不把媒体再传播写成今日软件产业事实。'],
 'media-97c8ce38be152d86cf78':['added',['wika-data'],'已读工程机械数据专题，五路时间对齐与真实工况采集关联AEC/具身部署；厂商成本估计保留归属。'],
 'media-b3b61bd4f09a72b5a3bb':['out_of_scope',[],'已读MMDesign全文，属于蛋白质靶点与湿实验平台细分技术报告；本轮重点为设计/3D/AEC及Agent，不据19个项目外推临床成效。'],
 'media-8a7419d4bcadc1160458':['duplicate',['ai-2026-10-29-anthropic-vulnerabilities'],'已读报道，描述为获授权安全研究而非非法员工数据泄露；昨日五组漏洞链事件已明确研究与修复归属。'],
 'media-5610d7d2e60ca86517e3':['duplicate',['ai-2026-10-29-unlimited-ocr-2'],'已读完整Unlimited OCR2稿，27日开源已在昨日事件绑定官方库，28日媒体转载不作新品首发。'],
 'media-3069f243f2ea98dd02e5':['duplicate',['ai-2026-10-29-clover-35b'],'已读DiffuSpace权重新闻，35B总参数与3B激活及速度为既有Clover事件，保留测试归属。']
};
for(const row of v.media.items){
 if(row===jrow||row.disposition!=='needs_review')continue;
 const c=media.candidates.find(c=>c.id===row.id),rule=rules[row.id];
 if(rule){done(row,rule[0],rule[1],rule[2]);continue;}
 if(row.id==='media-8b6dd74b01bdd291a7e6'){excluded(row,'已读汽车发布报道，主体为理想i6售价、交付与产品定位，不是本轮设计/3D/AEC或Agent的新技术发布，不按AI事件单列。');continue;}
 if(['media-741b510ff8edae31ec65','media-c3f2902971bb06525cf0','media-14ff382371997078bb65','media-c1d3768fa6e5be97c6bb'].includes(row.id)){excluded(row,'已读文章内容，该条为全模态交互/多Agent社交研究或综述候选，保留论文研究方向；本日三篇摘要阅读预算优先3D与物理动作，不把综述转述作新产品发布。');continue;}
 if(row.id==='media-aaa6ccdc23e2c4295523'){pending(row,'已读正文，主要榜单变化与Carbon旧发布相关；Obsidian3映射到未发布Fable5.5只是推测，不能当正式模型。',c.url,'发布方API正文可读，但没有厂商确认该代号身份的原始公告。','核对官方模型公告或测试方正式说明，先保留未宣布属性。',['ai-2026-10-29-carbon']);continue;}
 if(row.id==='media-c4a39dfa8989fb26b3f1'){excluded(row,'已读VEGA整篇，主要是大众本土平台、电子电气架构与商业战略回顾，没有可独立核验的新AI模型/工具发布，本轮不精选汽车平台营销专题。');continue;}
 if(['media-b77a562874026c9652e2','media-6638f11074c5546daf42'].includes(row.id)){excluded(row,'已读FluxVLA正文，V2技术报告实际更新10月22日，初始开源4月8日；28日媒体报道不把窗口前的版本更新改成当天，测试副本不重复。');continue;}
 if(row.id==='media-1c6d2ddd5d74f43faa5b'){pending(row,'已读PI融资报道，正文写正在洽谈至少10亿美元及约200亿美元估值，尚非已完成融资。',c.url,'量子位全文为引述彭博知情人的交易洽谈；没有公司完成交割公告。','跟踪公司或投资方完成融资的原始公告，维持洽谈归属。');continue;}
 if(row.id==='media-a0122f5b8d0e57db6688'){pending(row,'已读媒体正文，化学猜想与Lean形式化证明属于作者科研主张，不能单凭转述认定共识结论。',c.url,'新智元公开API正文可读；作者证明及外部复核未在本日三篇论文预算中完成。','进入后续论文队列核对作者项目、证明文件与独立审查。');continue;}
 throw Error('Unreviewed media '+row.id);
}
for(const row of [...v.memene.items,...v.media.items])if(row.disposition==='out_of_scope'&&row.importance==='high')throw Error('Cannot dismiss important '+row.id);
v.readingReviews=l.aiEvents.map(e=>{
 const links=[...(e.readingSources??[]),...(e.sources??[])].filter(s=>s.language==='zh'||/aiera\.com|qbitai\.com|ithome\.com|cls\.cn|\/中国|\/zh\//.test(s.url));
 return {eventId:e.id,status:links.length?'provided':'not_found',urls:links.map(s=>s.url),reason:links.length?'已核对与该事件直接相关的公开中文正文/指定导读节；导读不替代独立事实来源。':'已检查今日全部9个中文媒体入口、104条候选及橘鸦当期各节，未找到与本事件对应的合格公开中文正文；保留已读原始英文事实来源，不使用内部Memene链接。',checkedAt:now};
});
m.audit0900.coverageReviewedAt=now;m.audit0900.industryEvents=l.aiEvents.filter(e=>e.contentKind!=='paper').length;m.audit0900.paperEvents=l.aiEvents.filter(e=>e.contentKind==='paper').length;
for(const [p,d] of [['data/dev/ai-events-latest.json',l],[`data/dev/ai-editorial-repairs-${date}.json`,m],[`data/dev/ai-discovery-review-${date}.json`,v]])await writeFile(p,JSON.stringify(d,null,2)+'\n');
console.log(JSON.stringify({events:l.aiEvents.length,memene:v.memene.items.length,media:v.media.items.length,sections:jrow.subreviews.length}));

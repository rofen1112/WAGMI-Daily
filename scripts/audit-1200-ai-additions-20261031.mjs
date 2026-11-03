import {readFile,writeFile} from 'node:fs/promises';
const read=async p=>JSON.parse(await readFile(p,'utf8')),base='data/dev/source-archives/audit-1200-2026-10-31',now=new Date().toISOString(),date='2026-10-31';
const [latest,manifest,media,fetches,extra]=await Promise.all(['data/dev/ai-events-latest.json',`data/dev/ai-editorial-repairs-${date}.json`,'data/dev/ai-media-latest.json',base+'/source-results.json',base+'/extra-results.json'].map(read));
if(latest.asOf!==date || new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date())!==date)throw Error('This date-specific repair requires its original Shanghai calendar day');
const events=[],evidence=[];
function add(key,day,title,summary,why,action,source,{section,readingUrl,sourceClass='official',sourceType='official_announcement',priority='B',boards=['AI Agent'],excerpt=summary,evidencePath}={}){
 const id=`ai-${date}-${key}`,e={id,date:day,title,summary,whyItMatters:why,action,priority,boards,sourceType,verification:'verified',entities:[],contentKind:'industry_event',sourceReportId:latest.report.id,repoCandidates:[],sources:[{label:sourceClass==='trusted_media'?'中文原始报道':'官方原始来源',url:source}],readingSources:readingUrl?[{label:'中文原文',url:readingUrl,language:'zh',role:'coverage'}]:section?[{label:'橘鸦Juya · 中文导读',url:`https://daily.juya.uk/issues/${date}/#${section}`,language:'zh',role:'discovery'}]:[],dateSemantics:'保留原始公告或报道日期，日报收录日另记。'};
 events.push(e);evidence.push({url:source,checkedAt:now,success:true,verification:'verified',sourceClass,method:'Independent 12:00 audit: read original full body and dated observation; preserve scope, reported metrics and availability limits.',contentExcerpt:excerpt,eventIds:[id],evidencePath});
}
const url=n=>fetches.find(r=>r.i==='source-'+n).url;
add('cursor-extension-security','2026-10-29','Cursor披露扩展市场安全事件，特定Claude Code包被篡改','Cursor公告确认其扩展市场的Anthropic.claude-code 2.1.312与2.1.313的Windows和macOS包遭篡改，尝试收集主机资料及设置SSH持久化。恶意版本与服务器已下线，官方发行渠道未被确认受影响。','编码Agent扩展供应链需要版本与分发渠道双重核对。','按公告检查受影响版本和残留持久化；卸载扩展并不保证清理完成。公告30日更新了版本范围，不把所有Claude Code发行包说成受影响。',url(85),{section:'s13',priority:'A',boards:['AI Coding','AI Security / Governance'],evidencePath:base+'/source-85.txt'});
add('x7-ultra','2026-10-31','量子位报道X7 Ultra智驾芯片，以实际模型评价算力利用','量子位10月31日报道新芯航途X7 Ultra及其与Momenta模型协同设计，标称700 TOPS，厂商测试称NPU计算利用率98.7%、量化输出与FP32基准相似度超过99.99%。','模型与芯片共同优化的指标，比孤立峰值算力更接近部署问题。','全部数字保留厂商测试归属；相似度不是驾驶安全率，利用率不代表所有工作负载或整车可用算力。',url(34),{readingUrl:url(34),sourceClass:'trusted_media',sourceType:'media_report',boards:['AI 3D / World Models','Market / Business Model'],evidencePath:base+'/source-34.txt'});
add('forgekernel','2026-10-30','ForgeKernel展示从数学定义迭代生成算子的实验','量子位10月30日报道面壁ForgeKernel在B200上的算子生成直播：从数学定义与硬件约束出发，42轮迭代后特定FlashMLA Prefill任务耗时472微秒，对照实现518微秒。','让Agent直接针对硬件与正确性约束优化算子，是值得复现实验的工程路线。','9.8%的说法为该报道的特定比较口径；延迟差是46微秒，不能外推到整个模型、全部输入或所有GPU。',url(52),{readingUrl:url(52),sourceClass:'trusted_media',sourceType:'media_report',boards:['AI Coding','AI Agent'],evidencePath:base+'/source-52.txt'});
const prime=media.candidates.find(c=>c.id==='media-7b5ec63ba2f627258b99');
if(!prime?.contentExcerpt?.includes('30110'))throw Error('PrimeSim original RSS content missing');
add('primesim','2026-10-30','启元PrimeSim把视频生成模型改为机器人交互仿真器','机器之心10月30日原文介绍启元PrimeSim：使用约3万小时、22类机器人数据，通过动作条件、多视角交互、蒸馏与分层时序记忆支持机器人操纵推演，并报告两项基准表现。','可交互神经仿真器为策略比较与训练提供另一条路线。','性能和榜单保留作者报告归属；策略增益迁移到传统仿真器不等于已证明真实机器人泛化，不与大晓Mundo项目混并。',prime.url,{readingUrl:prime.url,sourceClass:'trusted_media',sourceType:'media_report',priority:'A',boards:['AI 3D / World Models'],evidencePath:base+'/extra-41.raw'});
add('training-preferences','2026-10-30','OpenAI承诺支持通用训练偏好信号，实施仍在未来数月','OpenAI10月30日公告将尊重robots.txt中的通用训练偏好信号，以减少网站对各家爬虫分别配置的工作，计划未来数月实施，既有爬虫控制继续适用。','内容所有者表达训练偏好的成本有望降低。','这是支持承诺与实施计划；不能写成标准已完成或各平台已经执行，也不替代既有爬虫规则。','https://openai.com/index/helping-websites-express-ai-training-preferences/',{section:'s22',boards:['AI Security / Governance'],evidencePath:base+'/openai-web-reviews.json'});
add('community-safety','2026-10-30','OpenAI预告半年社区安全报告，并分批加强青少年保护','OpenAI10月30日公告首份社区安全报告计划2027年初发布，覆盖2026年下半年，之后每半年更新。针对暴力相关信息和青少年武器信息的新增限制将在未来数周分批推出。','保护措施与定期透明度报告需要区分实际生效范围和计划。','首份报告尚未发布；不把未来数周的逐步推送写成今天全部生效。','https://openai.com/index/community-safety-report-and-new-protections-for-teens/',{section:'s24',boards:['AI Security / Governance'],evidencePath:base+'/openai-web-reviews.json'});
const merge=(a,b)=>[...new Map([...a,...b].map(x=>[x.id,x])).values()];
latest.aiEvents=merge(latest.aiEvents,events);manifest.events=merge(manifest.events??[],events);
manifest.verifiedSources=[...(manifest.verifiedSources??[]).filter(x=>!x.eventIds?.some(id=>events.some(e=>e.id===id))),...evidence];
manifest.audit1200={checkedAt:now,evidence:base,added:events.map(x=>x.id)};
await writeFile(base+'/supplemental-events.json',JSON.stringify({checkedAt:now,events,evidence},null,2)+'\n');
await writeFile('data/dev/ai-events-latest.json',JSON.stringify(latest,null,2)+'\n');
await writeFile(`data/dev/ai-editorial-repairs-${date}.json`,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({events:events.length,total:latest.aiEvents.length}));

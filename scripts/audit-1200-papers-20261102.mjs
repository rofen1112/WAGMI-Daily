import fs from 'node:fs/promises';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const write=async(p,d)=>fs.writeFile(p,JSON.stringify(d,null,2)+'\n');
const date='2026-11-02',base=`data/dev/source-archives/audit-1200-${date}`;
const [catalog,overrides,fetches]=await Promise.all([read('data/dev/papers-catalog.json'),read('paper-review-overrides.json'),read(base+'/fetch-results.json')]);
const now=new Date().toISOString();
const specs=[
 ['2610.37741','预训练投毒可在命令行智能体中留下执行后门','作者从头训练三种规模的Qwen3模型，再使用干净数据进行后训练；在实验中，污染0.1%的预训练语料可植入触发式命令执行后门，4B模型报告约92%的攻击成功率。正常输入表现并不能排除此风险。','把模型来源核验与实际执行权限隔离结合，适用于可调用终端和本地文件的Agent。','摘要级阅读，未复现实验；比例属于作者特定训练、触发器与评测配置，不证明现有商用模型已被植入。','优先审查运行时授权、工具隔离与训练数据来源；不执行远程攻击代码。','2026-10-27',['AI Security / Governance','AI Agent'],'safety-research/agentic-backdoor'],
 ['2610.39302','JEPA表征定理：正样本视图质量影响跨模态对齐','Balestriero与LeCun在限定的正样本视图条件下证明，独立模态训练的JEPA可获得相差一个旋转的表征。作者在特定对齐实验中报告，109M文本JEPA优于所测至72B的语言模型，达到相同对齐所需样本更少；这不是通用语言能力比较。','为视觉、空间与世界模型的表征训练提供可检验的视图构造方向。','摘要级阅读；定理有明确假设，样本效率和模型大小比较限于论文所测对齐任务，未验证任意多模态任务。','结合真实室内多视角数据检查正样本构造和跨域泛化，不把理论结论外推为全部模型能力。','2026-10-29',['AI 3D / World Models','Frontier Paper / Research'],null],
 ['2610.26659','SpatialScout：主动探索室内场景并建立物体级三维地图','SpatialScout在80个室内场景和3140个目标上，让VLM控制相机、建立跨视图对应并估计物体中心。摘要报告最强被测模型平均重叠41.71%；看见和描述房间仍不等于完整、精确的几何建图。','直接对应室内设计、空间采集和具身智能对可核验坐标与覆盖率的需求。','摘要与作者README级阅读，未跑基准。宏平均、物体汇总和价格快照应分别比较；保留10月19日首发及22日修订，不称今日新论文。','用物体漏检、定位容差、视角预算与实际成本共同验收室内Agent。','2026-10-19',['AI 3D / World Models','AI-CAD / AEC'],'JesseZZZZZ/SpatialScout']
];
for(const [arxivId,titleZh,summaryZh,industryValueZh,limitationsZh,futureOutlookZh,published,boards,repo] of specs){
 const id='arxiv-'+arxivId.replace('.','-'),url='https://arxiv.org/abs/'+arxivId,f=fetches.find(x=>x.url===url);
 if(!f?.success||f.chars<1000)throw Error('Missing paper original '+url);
 const raw=await fs.readFile(f.rawPath,'utf8');
 const meta=name=>[...raw.matchAll(/<meta\s+name="([^"]+)"\s+content="([^"]*)"/g)].filter(m=>m[1]===name).map(m=>m[2].replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&amp;','&'));
 const title=meta('citation_title')[0],authors=meta('citation_author');
 if(!title||!authors.length)throw Error('Missing official citation metadata '+url);
 const text=await fs.readFile(f.path,'utf8'),abstract=text.split('Abstract:')[1]?.split(' Subjects:')[0]?.trim();
 if(!abstract)throw Error('Missing original abstract '+url);
 let p=catalog.papers.find(p=>p.id===id);
 if(!p){p={id,arxivId,source:'arxiv',titleOriginal:title,abstractOriginal:abstract,authors,categories:meta('citation_primary_category'),publishedAt:published+'T00:00:00.000Z',originalPublishedAt:published+'T00:00:00.000Z',rssAnnouncedAt:null,dateSemantics:'original_submission',url,pdfUrl:'https://arxiv.org/pdf/'+arxivId,score:32,reviewTier:'deep',topics:[],targetBoards:['Frontier Paper / Research',...boards],relatedRepositories:[],firstSeenAt:now,lastSeenAt:null,lastCheckedAt:now,availabilityStatus:'monitoring',missingRuns:0,discoverySource:'manual-original-source-review',discoveryEvidencePath:f.path};catalog.papers.push(p);}
 if(repo&&!p.relatedRepositories.some(r=>r.repo===repo))p.relatedRepositories.push({repo,url:'https://github.com/'+repo,relation:'official_code',labelZh:'原始摘要明确链接的作者代码',evidenceUrl:url,confidence:'high',verified:true,checkedAt:now});
 overrides.reviews[id]={...overrides.reviews[id],titleZh,summaryZh,industryValueZh,limitationsZh,futureOutlookZh,keyContributionsZh:[summaryZh],reviewStatus:'interpreted',readingLevel:'abstract',reviewedAt:now,sourceCheckedAt:f.checkedAt,evidencePath:f.path};
}
await write(base+'/papers-before-editorial.json',await read('data/dev/papers-catalog.json'));
await write('data/dev/papers-catalog.json',catalog);
await write('paper-review-overrides.json',overrides);
console.log(JSON.stringify({reviewed:specs.map(s=>s[0]),pdfReads:0,checkedAt:now}));

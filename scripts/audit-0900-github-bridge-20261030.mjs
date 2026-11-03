import {readFile,writeFile} from 'node:fs/promises';
import {buildTrendSnapshot,collectForcedCandidates} from './discover-github-trends.mjs';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const date='2026-10-30';
const [watchlist,ai,weekly,trends,papers,index]=await Promise.all(['github-industry-watchlist.json','data/dev/ai-events-latest.json','data/dev/ai-weekly-latest.json','data/dev/github-trend-candidates.json','data/dev/paper-github-candidates.json','data/dev/index.json'].map(read));
const specs=[
 ['herdrdev/herdr-core','Herdr Core','Agent 工程 / 持久终端',['agent-engineering'],'Rust持久终端内核，支持程序后台运行、Agent任务通信与人工接管。','终端可执行本机命令；安装程序、签名与远程访问需要按官方安全文档评估。','Apache-2.0'],
 ['herdrdev/herdr-app','Herdr App','Agent 工程 / 桌面工作区',['agent-engineering'],'基于herdr-core的桌面终端与Agent工作区，支持空间、分屏、状态聚合与可修改界面。','窗口关闭不等于停止后台程序；重启不会保留运行中的进程，远程SSH权限需单独管理。','Apache-2.0'],
 ['Factory-AI/droid-sdk-typescript','Droid TypeScript SDK','Agent 工程 / 官方 SDK',['agent-engineering'],'Factory官方SDK，支持启动Droid、流式会话、工具控制与连接已有daemon。','依赖Droid CLI/服务和API授权；README指出Node18与0.10.0全局WebCrypto兼容边界，未在本机安装。','Apache-2.0（实际LICENSE全文；API标识NOASSERTION）'],
 ['inclusionAI/Zooming-without-Zooming-v2','Zooming without Zooming v2','多模态模型 / 视觉推理',['open-models','spatial-intelligence'],'EvidenceConnect多区域视觉问答合成、GRPO训练与评测实现，提供4B/9B/27B模型。','训练代码许可与基础模型、数据资产分开核对；基准结果为作者报告。','Apache-2.0'],
 ['Tencent-Hunyuan/Hy-Nomas','Hy-Nomas','世界模型 / 交互生成',['world-models','video-generation'],'腾讯官方交互世界生成代码、推理、LoRA微调与Web演示，支持文本和相机控制。','代码与权重采用Apache2.0声明，第三方组件保留各自许可；硬件吞吐和长时一致性需独立复测。','Apache-2.0及第三方组件原许可（实际LICENSE）'],
 ['X-EraAI/e05','E0.5','世界模型 / 机器人动作',['world-models','physical-ai'],'官方未来三维几何预测与机器人动作联合实现，含训练推理、RoboTwin评测及已发布资源。','MIT覆盖自有代码，第三方代码保留许可；真机迁移受数据、本体与训练设置限制。','MIT及第三方许可（实际LICENSE）']
];
const reviewedAt=new Date().toISOString();
const records=specs.map(([repo,name,category,priorityDomains,summary,riskNote,license])=>({repo,name,category,priorityDomains,summary,riskNote,license,level:repo.includes('Hy-Nomas')||repo.includes('e05')?'A':'B',intakeDecision:'approved',industryFit:'high',originality:'original_research_or_official_engineering',officialRelationship:true,decisionReason:'已核对官方关系、README、实际实现目录、安装/评测入口、许可及当前维护元数据；具有可用的原创研究或官方工程实现，不以热度作为收录前提。',reviewedAt:date,evidenceUrls:[`https://github.com/${repo}`],evidencePaths:['data/dev/source-archives/audit-0900-2026-10-30/github-new-connector.json','data/dev/source-archives/audit-0900-2026-10-30/github-new-readmes.json','data/dev/source-archives/audit-0900-2026-10-30/github-new-contents.json']}));
for(const record of records){const i=watchlist.repositories.findIndex(s=>s.repo.toLowerCase()===record.repo.toLowerCase());if(i<0)watchlist.repositories.push(record);else watchlist.repositories[i]={...watchlist.repositories[i],...record};}
watchlist.updatedAt=date;
const forced=collectForcedCandidates(ai,weekly,index.candidates??[],papers);
const next=buildTrendSnapshot({asOf:date,records:[...trends.candidates,...forced.resolved],previousSnapshot:trends,sourceStatus:trends.sourceStatus,unresolvedAiCandidates:forced.unresolved});
next.audit0900={checkedAt:reviewedAt,initialDiscoveryGeneratedAt:trends.generatedAt,action:'Re-score retained actual current-day external observations and add current AI forced repositories; no cached source is represented as a fresh source check.',reviewedNewRepositories:records.map(r=>r.repo)};
await writeFile('github-industry-watchlist.json',JSON.stringify(watchlist,null,2)+'\n');
await writeFile('data/dev/github-trend-candidates.json',JSON.stringify(next,null,2)+'\n');
await writeFile('data/dev/github-editorial-review-2026-10-30.json',JSON.stringify({asOf:date,checkedAt:reviewedAt,repositories:records},null,2)+'\n');
console.log(JSON.stringify({forced:forced.resolved.length,newReviewed:records.length,candidates:next.candidates.length,counts:next.counts}));

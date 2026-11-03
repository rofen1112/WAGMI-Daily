import {readFile,writeFile} from 'node:fs/promises';
import {evaluateGithubSources,githubReviewBlockers} from './github-source-policy.mjs';
const base='data/dev/source-archives/audit-1200-2026-10-31',read=async p=>JSON.parse(await readFile(p,'utf8'));
const [g,t,a,l,six]=await Promise.all(['data/dev/github-radar-latest.json','data/dev/github-trend-candidates.json','data/dev/ai-events-latest.json','data/dev/github-radar-review-ledger.json',base+'/github-mandatory-six.json'].map(read));
const byRepo=new Map(g.verificationSummary.mandatoryReviewed.map(x=>[x.repo.toLowerCase(),x]));
const notes={
 'browser-use/browser-harness':'原创MIT浏览器Agent工程，通过CDP控制真实Chrome并积累任务助手；登录态和浏览器操作权限需复核，保留观察。',
 'anil-matcha/open-generative-ai':'仍为第三方模型API聚合前端；README定位600多模型工作室不构成新原创模型或核心推理实现，维持既有拒绝。',
 'feder-cr/invisible_dots':'提供自托管桌面Agent、持久浏览器与定时任务；确认可运行架构但权限边界和维护质量继续观察。',
 'purpledoubled/locally-uncensored':'本地桌面多模态工作室，集成已有模型并提供编码Agent；AGPL许可和实际硬件性能仍需评估，继续观察。',
 'dgtlmoon/changedetection.io':'原创网站变化监控服务，含浏览器抓取、通知与LLM摘要；与来源跟踪相关，按既有库存决定保留。',
 'comfy-org/comfyui':'原创节点图生成工作流引擎；官方README与发布、提交、Issue及PR均已核对，保留既有库存决定。'
};
for(const proof of six){
 const values=proof.endpoints.map(x=>{if(x.status!=='fulfilled'||x.value.result.isError)throw Error('Incomplete connector evidence '+proof.repo);return JSON.parse(x.value.result.structuredContent.content)});
 if(proof.readme.isError||!proof.readme.structuredContent?.content)throw Error('README missing '+proof.repo);
 const [m,commits,issues,pulls,releases]=values;
 if(!Number.isFinite(m.stargazers_count)||!Number.isFinite(m.forks_count)||![commits,issues,pulls,releases].every(Array.isArray))throw Error('Invalid API evidence '+proof.repo);
 const c=t.candidates.find(x=>x.repo.toLowerCase()===proof.repo.toLowerCase());if(!c)continue;
 const p=g.projects.find(x=>x.repo.toLowerCase()===proof.repo.toLowerCase());
 const key=proof.repo.toLowerCase(),old=byRepo.get(key),text=proof.readme.structuredContent.content;
 byRepo.set(key,{...old,repo:c.repo,queue:[c.hotLevel,c.forcedByAI?'AI 强制':null].filter(Boolean).join(' / '),officialRelationship:Boolean(p||c.forcedByAI),stars:m.stargazers_count,forks:m.forks_count,lastCommit:commits[0]?.commit?.committer?.date?.slice(0,10)??m.pushed_at?.slice(0,10),release:releases[0]?.tag_name??'已检查 Releases，无 tag',license:m.license?.spdx_id??'NOASSERTION',archived:m.archived,fork:m.fork,accessible:true,readmeVerified:true,demoOrInstall:/demo|install|quick.?start|usage|docker/i.test(text),commitsVerified:true,issuesVerified:true,pullRequestsVerified:true,releasesVerified:true,industryFit:p?.industryFit??'medium',priorityDomains:c.priorityDomains??[],originality:p?.originality??'reviewed_original_project_or_integration',maintenanceEvidence:'Official GitHub connector API read: repository, README, latest commit, all-state Issues/PRs and Releases.',intakeDecision:key==='anil-matcha/open-generative-ai'?'rejected':p?.intakeDecision??'observe',decisionReason:notes[key],verifiedAt:proof.checkedAt,evidence:base+'/github-mandatory-six.json',hotReasons:c.hotReasons??[]});
}
const mandatory=t.candidates.filter(c=>c.hotLevel==='surging'||c.hotLevel==='hot'||c.forcedByAI),rows=[...new Set(mandatory.map(c=>c.repo.toLowerCase()))].map(repo=>byRepo.get(repo));
if(rows.some(r=>!r))throw Error('Missing current mandatory review');
const coverage={...g.verificationSummary.coverage,mandatory:rows.length,accessible:rows.filter(x=>x.accessible).length,readme:rows.filter(x=>x.readmeVerified).length,demoOrInstall:rows.filter(x=>x.demoOrInstall).length,commits:rows.filter(x=>x.commitsVerified).length,issues:rows.filter(x=>x.issuesVerified).length,pullRequests:rows.filter(x=>x.pullRequestsVerified).length,releases:rows.filter(x=>x.releasesVerified).length,trackedRefreshFailures:g.run.refreshSummary.failures};
g.verificationSummary={...g.verificationSummary,mandatoryReviewed:rows,coverage};
const policy=evaluateGithubSources(t,g.asOf),blockers=[...policy.blockers,...githubReviewBlockers(t,g),...(a.asOf!==g.asOf||a.run.status!=='success'?['Current AI batch not ready']:[])];
g.run={...g.run,status:blockers.length?'warning':'success',...(blockers.length?{}:{lastSuccess:new Date().toISOString()}),message:blockers.length?'当前已补齐必核仓库证据；待完成：'+blockers.join('；'):`当日${rows.length}个必核仓库证据与正式库存刷新完整；可选来源提示保留。`,audit1200:{checkedAt:new Date().toISOString(),metadataEvidence:base+'/github-metadata-repair.json',mandatoryEvidence:base+'/github-mandatory-six.json',blockers}};
l.mandatoryReviewed=rows;l.coverage=coverage;l.status=g.run.status;l.checkedAt=new Date().toISOString();
for(const [p,v]of [['data/dev/github-radar-latest.json',g],['data/dev/github-radar-review-ledger.json',l]])await writeFile(p,JSON.stringify(v,null,2)+'\n');
console.log(JSON.stringify({status:g.run.status,coverage,blockers}));

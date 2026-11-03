import {readFile,writeFile} from 'node:fs/promises';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const latest=await read('data/dev/github-radar-latest.json');
const ledger=await read('data/dev/github-radar-review-ledger.json');
const prior=await read('data/dev/github-editorial-review-2026-10-29.json');
const byRepo=new Map(prior.repositories.map(r=>[r.repo.toLowerCase(),r]));
let retained=0;
const keepEditorial=row=>{const p=byRepo.get(row.repo.toLowerCase());if(!p)return row;retained++;const next={...row};for(const k of ['intakeDecision','industryFit','priorityDomains','officialRelationship','originality','decisionReason','license'])if(p[k]!==undefined)next[k]=p[k];next.editorialEvidence='data/dev/github-editorial-review-2026-10-29.json';return next;};
latest.verificationSummary.mandatoryReviewed=latest.verificationSummary.mandatoryReviewed.map(keepEditorial);
latest.verificationSummary.watchSamples=latest.verificationSummary.watchSamples.map(keepEditorial);
ledger.mandatoryReviewed=latest.verificationSummary.mandatoryReviewed;
ledger.watchSamples=latest.verificationSummary.watchSamples;
latest.run.audit0900={checkedAt:new Date().toISOString(),discoveryGeneratedAt:(await read('data/dev/github-trend-candidates.json')).generatedAt,editorialReviewsRetained:retained,connectorSupplement:'data/dev/source-archives/audit-0900-2026-10-29-github-connector.json',note:'最终趋势完成后补齐9个新增必核仓库；当前官方页面证据完整，保留同日原始实现/许可编辑判断。'};
const labels={approved:'收录',observe:'观察',rejected:'拒绝'};
const esc=x=>String(x??'').replaceAll('|','\\|').replaceAll('\n',' ');
for(const path of ['reports/github-radar-2026-10-29.md','public/reports/github-radar-2026-10-29.md']){
 let report=await readFile(path,'utf8');
 for(const row of ledger.mandatoryReviewed){const prefix=`| [${row.repo}](https://github.com/${row.repo}) |`;const value=`${prefix} ${esc(row.queue)} | ${row.stars} / ${row.forks} | ${esc(row.lastCommit)} | ${esc(row.release)} | ${esc(row.license)} | ${row.readmeVerified?'是':'否'} / ${row.demoOrInstall?'是':'否'} | ${row.issuesVerified?'是':'否'} / ${row.pullRequestsVerified?'是':'否'} | ${row.accessible?'可访问':'不可访问'}；${row.archived?'已归档':'未归档'}；${row.fork?'Fork':'非 Fork'} | **${labels[row.intakeDecision]}**：${esc(row.decisionReason)} |`;report=report.split('\n').map(line=>line.startsWith(prefix)?value:line).join('\n');}
 report+='\n## 09:00 二次审计\n\n最终趋势发现完成后重新核验全部必核与5个watch样本；保留当日既有源码、许可与原创性编辑证据，新增连接器元数据复核单独归档。本轮没有新增正式项目。\n';
 await writeFile(path,report);
}
await writeFile('data/dev/github-radar-latest.json',JSON.stringify(latest,null,2)+'\n');
await writeFile('data/dev/github-radar-review-ledger.json',JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify(latest.run.audit0900));

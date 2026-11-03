import {readFile,writeFile} from 'node:fs/promises';
import {cumulativeStarsDelta,updateTrendCandidateFromProject,dedupeTrendCandidates} from './sync-github-industry-watchlist.mjs';
const base='data/dev/source-archives/audit-1200-2026-10-31',read=async p=>JSON.parse(await readFile(p,'utf8'));
const [g,t,w,main,proofs,fine]=await Promise.all(['data/dev/github-radar-latest.json','data/dev/github-trend-candidates.json','github-industry-watchlist.json','data/main/index.json',base+'/github-metadata-recovery.json',base+'/finerecon-metadata.json'].map(read));
if(g.asOf!=='2026-10-31'||t.asOf!==g.asOf)throw Error('Unexpected batch date');
const records=[...proofs.filter(p=>p.full_name),fine],changes=[];
for(const m of records){
 const requested=m.requestedRepo==='xinzhang007/PhysOmni'?'xinzhang007/TelePhysics':m.requestedRepo;
 if(!Number.isFinite(m.stargazers_count)||!Number.isFinite(m.forks_count)||!m.pushed_at||!m.id)throw Error('Missing original metadata '+requested);
 const p=g.projects.find(p=>[p.repo,...(p.repoAliases??[])].some(x=>[requested,m.full_name].includes(x)));
 if(!p)throw Error('Tracked project missing '+requested);
 const before={...p},baseline=main.projects.find(x=>x.id===p.id)??p;
 Object.assign(p,{repo:m.full_name,url:m.html_url,repoAliases:[...new Set([requested,...(p.repoAliases??[])])].filter(x=>x!==m.full_name),stars:m.stargazers_count,forks:m.forks_count,starsDelta:cumulativeStarsDelta(baseline,m.stargazers_count,g.report.id),starsDeltaWindowStart:baseline.sourceReportId?.replace(/^github-/,''),starsDeltaWindowEnd:g.asOf,starsDeltaSemantics:'local_snapshot_change',lastActivity:m.pushed_at.slice(0,10),license:m.license?.spdx_id??p.license??'NOASSERTION',availabilityCheckedAt:m.checkedAt,metadataFetchedAt:m.checkedAt,metadataSource:'github-connector',sourceReportId:g.report.id});
 p.maintenanceEvidence=`GitHub push ${p.lastActivity}; ${p.stars} Stars; ${p.forks} forks; license ${p.license}`;
 for(const s of w.repositories.filter(x=>x.repo===requested)){if(requested!==m.full_name){s.aliases=[...new Set([requested,...(s.aliases??[])])];s.repo=m.full_name;s.migrationEvidence=base+'/'+(m===fine?'finerecon-metadata.json':'telephysics-redirect.json');}}
 t.candidates=t.candidates.map(c=>[requested,m.full_name].includes(c.repo)?updateTrendCandidateFromProject({...c,repo:m.full_name},p):c);
 changes.push({requested,canonical:m.full_name,repositoryId:m.id,checkedAt:m.checkedAt,before,after:p});
}
const errors=g.run.refreshSummary?.failures;
if(errors===7&&g.run.refreshSummary.selected===50){g.run.refreshSummary={...g.run.refreshSummary,failures:0,recovery:{checkedAt:new Date().toISOString(),repaired:7,evidence:base+'/github-metadata-repair.json'}};if(g.verificationSummary?.coverage)g.verificationSummary.coverage.trackedRefreshFailures=0;}
t.candidates=dedupeTrendCandidates(t.candidates);
for(const [p,v] of [['data/dev/github-radar-latest.json',g],['data/dev/github-trend-candidates.json',t],['github-industry-watchlist.json',w],[base+'/github-metadata-repair.json',{checkedAt:new Date().toISOString(),originalFailures:errors,changes}]])await writeFile(p,JSON.stringify(v,null,2)+'\n');
console.log(JSON.stringify(changes.map(x=>({requested:x.requested,canonical:x.canonical,stars:x.after.stars,forks:x.after.forks}))))

import {readFile,writeFile} from 'node:fs/promises';
import {cumulativeStarsDelta,dedupeProjectsByRepo,dedupeTrendCandidates,updateTrendCandidateFromProject} from './sync-github-industry-watchlist.mjs';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const base='data/dev/source-archives/publication-2026-10-31',date='2026-10-31';
const [g,t,main,rows]=await Promise.all(['data/dev/github-radar-latest.json','data/dev/github-trend-candidates.json','data/main/index.json',`${base}/github-tail-recovered.json`].map(read));
if(g.asOf!==date||t.asOf!==date)throw new Error('Requires current GitHub inputs');
await writeFile(`${base}/github-before-metadata-repair.json`,JSON.stringify(g,null,2));
for(const row of rows){const m=row.metadata;
 if(!row.success||!m?.full_name||!Number.isSafeInteger(m.stargazers_count)||!Number.isSafeInteger(m.forks_count)||!row.checkedAt.startsWith(date))throw new Error('Incomplete actual connector metadata '+row.repo);
 if(row.redirectId&&Number(m.id)!==row.redirectId)throw new Error('Redirect identity changed');
 const p=g.projects.find(p=>[p.repo,...p.repoAliases??[]].some(r=>r.toLowerCase()===row.repo.toLowerCase()));
 if(!p)throw new Error('Missing historical inventory '+row.repo);
 const prior=main.projects.find(p=>[p.repo,...p.repoAliases??[]].some(r=>r.toLowerCase()===row.repo.toLowerCase()));
 const original=p.repo;
 Object.assign(p,{repo:m.full_name,url:m.html_url,repoAliases:[...new Set([...p.repoAliases??[],original,row.repo])].filter(r=>r.toLowerCase()!==m.full_name.toLowerCase()),stars:m.stargazers_count,forks:m.forks_count,
  starsDelta:cumulativeStarsDelta(prior,m.stargazers_count,g.report.id),starsDeltaWindowStart:prior?.sourceReportId?.replace(/^github-/,''),starsDeltaWindowEnd:date,starsDeltaSemantics:'local_snapshot_change',
  lastActivity:m.pushed_at?.slice(0,10),license:m.license?.spdx_id??p.license,availabilityCheckedAt:row.checkedAt,metadataFetchedAt:row.checkedAt,metadataEvidence:`${base}/github-tail-recovered.json`,
  maintenanceEvidence:`官方连接器复核：${m.stargazers_count} Stars，${m.forks_count} forks；push ${m.pushed_at}；${m.archived?'归档':'活跃'}；${m.license?.spdx_id??'NOASSERTION'}。`});
 }
g.projects=dedupeProjectsByRepo(g.projects);
// All seven failed rotation targets now have actual current REST metadata.
// Keep the failed snapshot above and bind the recovery to its exact targets.
g.run.refreshSummary={...g.run.refreshSummary,failures:0,recoveredFailures:rows.length,recoveryEvidence:`${base}/github-tail-recovered.json`};
g.run.publicationMetadataRecovery={checkedAt:new Date().toISOString(),priorFailures:7,recovered:rows.map(r=>({requested:r.repo,canonical:r.metadata.full_name,checkedAt:r.checkedAt})),evidence:`${base}/github-tail-recovered.json`};
t.candidates=dedupeTrendCandidates(t.candidates.map(c=>{const p=g.projects.find(p=>[p.repo,...p.repoAliases??[]].some(r=>r.toLowerCase()===c.repo.toLowerCase()));return p?updateTrendCandidateFromProject(c,p):c}));
await writeFile('data/dev/github-radar-latest.json',JSON.stringify(g,null,2)+'\n');
await writeFile('data/dev/github-trend-candidates.json',JSON.stringify(t,null,2)+'\n');
console.log(JSON.stringify(g.run.publicationMetadataRecovery));

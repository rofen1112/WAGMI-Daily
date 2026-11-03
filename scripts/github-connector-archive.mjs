const day=value=>{try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date(value))}catch{return null}};
export function connectorArchiveProof(archive,repo,date){
  if(archive?.repo?.toLowerCase()!==repo.toLowerCase()||day(archive.checkedAt)!==date)return null;
  const base='https://api.github.com/repos/'+repo;
  const row=path=>archive.records?.find(r=>r.url===base+path&&day(r.checkedAt)===date);
  const meta=row(''),readme=row('/contents/README.md'),commits=row('/commits?per_page=1'),issues=row('/issues?state=all&per_page=1'),pulls=row('/pulls?state=all&per_page=1'),releases=row('/releases?per_page=1');
  const m=meta?.data;
  if(!meta?.success||m?.full_name?.toLowerCase()!==repo.toLowerCase()||!m.default_branch||m.private!==false)return null;
  const list=r=>r?.success===true&&Array.isArray(r.data);
  const text=readme?.success===true?(typeof readme.data==='string'?readme.data:readme.data?.encoding==='base64'&&readme.data?.type==='file'?Buffer.from(readme.data.content??'','base64').toString('utf8'):''):'';
  // A disabled PR facility is a verified lifecycle fact only with both the
  // explicit official repository setting and the actual endpoint's 404.
  const prDisabled=m.has_pull_requests===false&&pulls?.success===false&&/404/.test(pulls.data?.error??pulls.error??'');
  if(!text.trim()||!list(commits)||!list(issues)||(!list(pulls)&&!prDisabled)||!list(releases))return null;
  return {repo,accessible:true,repositoryStatus:200,defaultBranch:m.default_branch,readmeVerified:true,
    demoOrInstall:/demo|install|quickstart|usage|docker/i.test(text),commitsVerified:true,lastCommit:commits.data[0]?.commit?.committer?.date?.slice(0,10)??m.pushed_at?.slice(0,10),
    issuesVerified:true,pullRequestsVerified:true,releasesVerified:true,releaseTag:releases.data[0]?.tag_name??null,
    verifiedAt:archive.records.map(r=>r.checkedAt).sort().at(-1),verificationMode:'github-connector-rest',
    ...(prDisabled?{pullRequestsStatus:'disabled',pullRequestsEvidence:'Official has_pull_requests=false; list endpoint HTTP404 retained.'}:{})};
}

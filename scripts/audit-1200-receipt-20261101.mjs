import fs from 'node:fs/promises';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const date='2026-11-01',now=new Date().toISOString();
const [ai,github,skills,papers,main,discovery,send,control,skillsReview]=await Promise.all([
 'data/dev/ai-events-latest.json','data/dev/github-radar-latest.json','data/dev/skills-radar-latest.json','data/dev/ai-papers-latest.json',
 'data/main/index.json','data/dev/ai-discovery-audit-'+date+'.json','data/dev/dingtalk-last-send.json','data/dev/dingtalk-send-control.json',
 'data/dev/skills-review-verification-'+date+'.json'].map(read));
const log=await fs.readFile('data/dev/audit-1200-publication-final-'+date+'.log','utf8');
const publication=JSON.parse(log.slice(log.indexOf('{')));
const currentDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date());
const audit={batchId:'ark-insight-12-00:'+date,runDate:date,checkedAt:now,observedShanghaiDate:currentDate,
 status:'published-undelivered',complete:false,
 channels:Object.fromEntries(Object.entries({ai,github,skills,papers}).map(([key,value])=>[key,{asOf:value.asOf,status:value.run.status}])),
 discovery:{ready:discovery.ready,counts:discovery.counts,notices:discovery.notices,report:'reports/ai-discovery-audit-'+date+'.md'},
 repairs:['补采独立Memene与9个启用中文入口，逐条审阅18+107候选及当期14章节',
 '完成真实原始来源复核及中文阅读，合并并发采集事件ID与来源证据；保留pending与历史日期',
 'validate-dev-data显式历史事件集合加入dev已核验历史，配合共享发现加载器修复，避免main延迟造成循环阻断',
 '按原runDate通过严格门禁并发布main；本机构建与固定公网完整验证成功'],
 tests:{passed:33,failed:0,log:'data/dev/audit-1200-policy-tests-final-'+date+'.log'},
 publication:{...publication,readyForRunDate:publication.publicReady&&Object.values(publication.asOf).every(d=>d===date),
  readyForObservedDate:publication.publicReady&&Object.values(publication.asOf).every(d=>d===currentDate)},
 counts:{dailyAiEvents:ai.aiEvents.length,projects:main.projects.length,aiEvents:main.aiEvents.length,skills:main.skills.length,papers:11790},
 skillsHistoricalReview:{asOf:skillsReview.asOf,summary:skillsReview.summary},
 delivery:{attemptsByThisAudit:0,lastSuccessfulDate:send.date??send.runDate,lastSuccessfulAt:send.sentAt,lastResponse:send.response,
  suppressed:(control.suppressedDates??[]).some(d=>(typeof d==='string'?d:d.date)===date),
  status:'unsent-expired-batch',reason:'首次通过完整发布链路时已跨上海午夜。用户明确禁止把旧漏发日报当成新一天发送；未调用supplement、force、测试或修改成功记录。'},
 recovery:{stage:'delivery/date-isolation',error:'Run date 2026-11-01 ended before this batch completed publication; current-day send must not masquerade as missed-day delivery.',
  attemptedRepairs:'Data/source/concurrency and delayed-history repairs completed; dev validation and original-date gate passed, main published and complete public verification succeeded.',
  requiredNextAction:'新的上海自然日须独立重新采集与核验，按当日成功记录去重正式推送。11月1日漏发永久保留，不自动追补。',
  sourceArchive:'data/dev/source-archives/audit-1200-'+date,
  concurrency:'Other existing scheduled chats concurrently reconciled the same artifacts; this audit stopped replacing shared editorial files after identifying the collision.'}};
await fs.writeFile('data/dev/ark-insight-12-00-audit-'+date+'.json',JSON.stringify(audit,null,2)+'\n');
const memory='C:/Users/Administrator/.codex/automations/ark-insight-12-00/memory.md';
await fs.appendFile(memory,`\n\n## ${date} 12:00 兜底核验（跨日收尾）\n\n- 批次固定ark-insight-12-00:${date}；收尾实时时间${now}，上海日期${currentDate}。不得视作11月2日采集已完成。\n- 起始本机正常但main停10月30日；独立Memene18候选、媒体107候选、9个启用入口全部实际检查。补读原文、保留可选失败，参与恢复当日20事件（17行业/3论文）、15中文入口与5真实未找到记录。\n- 并发07:30/08:30/09:00/12:00任务曾互相覆盖事件ID。保留双方归档、由现有AI任务合并；本审计停止替换共享编辑文件。修复validate-dev显式历史集合遗漏dev已核验历史；共享加载器/回归由发布任务一并修复。最终33测试全过，data:validate-dev与原runDate严格门禁通过。\n- 四通道仍${date}；AI/GitHub/论文success，Skill历史80项warning经统一策略为notice，未清除警告/历史。\n- 按触发日期显式runDailyMainPublish发布迟到历史批次，未把日期改为11月2日；publication:deploy成功。最后publication:verify完整success，localReady=true/publicReady=true，generatedAt=${publication.generatedAt}，main及Skill/论文目录完整哈希两侧一致；命名隧道ready HTTP200。\n- 钉钉未送达：本任务0次正式调用，最后真实成功为${send.date??send.runDate}（errcode=${send.response?.errcode}）。发布完成已跨午夜，遵守禁止旧漏发冒充当天规则；不自动补发、不改收据。完整闭环未完成，不报告成功。\n- 收据data/dev/ark-insight-12-00-audit-${date}.json；后续必须独立完成新自然日采集/发布/推送，11月1日未送达状态保留。\n- 本次记忆写入UTC ${now}。\n`);
console.log(JSON.stringify({audit:'data/dev/ark-insight-12-00-audit-'+date+'.json',checkedAt:now,channels:audit.channels,localReady:publication.localReady,publicReady:publication.publicReady,delivery:audit.delivery.status,complete:false}));

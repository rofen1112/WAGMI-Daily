import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

test('reselecting a paper preserves its reviewed Chinese reading links without copying another paper', async t=>{
 const root=await mkdtemp(join(tmpdir(),'ark-paper-selection-'));
 t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(join(root,'data/dev'),{recursive:true});
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date());
 const readingSources=[{label:'中文原文',url:'https://www.qbitai.com/paper-review',language:'zh',role:'coverage'}];
 const paper={id:'paper-one',arxivId:'2610.26659',url:'https://arxiv.org/abs/2610.26659',originalPublishedAt:'2026-10-19T00:00:00Z',publishedAt:date+'T00:00:00Z',titleZh:'研究论文',summaryZh:'中文解读',readingLevel:'abstract',targetBoards:[],relatedRepositories:[],authors:[]};
 const files={
  'papers-catalog.json':{asOf:date,dailyRecommendations:[paper.id],papers:[paper]},
  'ai-events-latest.json':{asOf:date,report:{id:'ai-'+date},aiEvents:[
    {id:'prior-selected',contentKind:'paper',paper:{paperUrl:paper.url},readingSources},
    {id:'other-paper',contentKind:'paper',paper:{paperUrl:'https://arxiv.org/abs/2610.99999'},readingSources:[{url:'https://example.org/unrelated'}]},
  ]},
  'index.json':{aiEvents:[]},
 };
 for(const [name,data]of Object.entries(files))await writeFile(join(root,'data/dev',name),JSON.stringify(data));
 execFileSync(process.execPath,[fileURLToPath(new URL('../scripts/select-daily-paper-events.mjs',import.meta.url))],{cwd:root,windowsHide:true});
 const result=JSON.parse(await readFile(join(root,'data/dev/ai-events-latest.json'),'utf8'));
 assert.equal(result.aiEvents.length,1);
 assert.deepEqual(result.aiEvents[0].readingSources,readingSources);
 assert.equal(result.aiEvents[0].date,'2026-10-19');
 const stored=JSON.parse(await readFile(join(root,'data/dev/index.json'),'utf8'));
 assert.deepEqual(stored.aiEvents.find(e=>e.paper?.paperUrl===paper.url).readingSources,readingSources);
 assert.equal(stored.aiEvents.find(e=>e.id==='other-paper').digestSelected,false);
});

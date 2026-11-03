import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import './network-fetch.mjs';
const root=process.cwd();
const watchlist=JSON.parse(await readFile(resolve(root,'model-industry-watchlist.json'),'utf8'));
const now=new Date().toISOString();
const evidence=[];
for(const model of watchlist.models){
  const record={modelId:model.modelId,checkedAt:now,status:'failed'};
  try{
    const response=await fetch(`https://huggingface.co/api/models/${model.modelId}`,{signal:AbortSignal.timeout(20000)});
    record.httpStatus=response.status;
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const raw=await response.json();
    if(raw.id?.toLowerCase()!==model.modelId.toLowerCase())throw new Error('Model identity mismatch');
    record.status='success';
    record.metadata={id:raw.id,likes:raw.likes,downloads:raw.downloads,lastModified:raw.lastModified,gated:raw.gated,private:raw.private,
      pipelineTag:raw.pipeline_tag,libraryName:raw.library_name,license:raw.cardData?.license,baseModel:raw.cardData?.base_model};
    model.metadataFetchedAt=now;
    model.metrics={...model.metrics,...(Number.isInteger(raw.likes)?{likes:raw.likes}:{}),downloadsApi:raw.downloads??null,checkedAt:now};
    // Licenses and lineage remain the reviewed card conclusions; API tags alone
    // must not promote a community model or override commercial-use conditions.
  }catch(error){record.error=error.message;}
  evidence.push(record);
}
await writeFile(resolve(root,'model-industry-watchlist.json'),JSON.stringify(watchlist,null,2)+'\n');
await writeFile(resolve(root,'data/dev/model-source-verification.json'),JSON.stringify({checkedAt:now,evidence},null,2)+'\n');
console.log(JSON.stringify({checked:evidence.length,success:evidence.filter(row=>row.status==='success').length,failures:evidence.filter(row=>row.status!=='success')}));

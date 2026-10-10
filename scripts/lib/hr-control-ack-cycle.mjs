// Independent PostgreSQL checkpoint adapter. Isolated QA only until real cloud/restore QA.
// Original fs operator remains unchanged. Failure retains the durable run lock.
import {randomUUID} from 'node:crypto';
import {normalizeReceipts} from './hr-deletion-ledger.mjs';
import {readCloudLedger,syncCloudLedger} from './hr-cloud-deletion-ledger.mjs';
const fail=()=>{throw Error('untrusted_hr_control_cycle');};
const exact=(v,keys)=>v && typeof v==='object' && !Array.isArray(v)
 && Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function checkpoint(s,config,runId) {
 if(!exact(s,['format','project','storeId','origin','revision','runId','anchor']) || s.format!==1
  || s.project!==config.project || s.storeId!==config.storeId || s.origin!==config.origin
  || s.runId!==runId || !Number.isSafeInteger(s.revision) || s.revision<0
  || !exact(s.anchor,['project','storeId','generation','hmac'])
  || s.anchor.project!==config.project || s.anchor.storeId!==config.storeId
  || !Number.isSafeInteger(s.anchor.generation) || s.anchor.generation<0
  || !/^[a-f0-9]{64}$/.test(s.anchor.hmac)) fail();
 return s;
}
function sameCheckpoint(a,b){
 return a.revision===b.revision && a.runId===b.runId
  && a.project===b.project && a.storeId===b.storeId && a.origin===b.origin
  && a.anchor.project===b.anchor.project && a.anchor.storeId===b.anchor.storeId
  && a.anchor.generation===b.anchor.generation && a.anchor.hmac===b.anchor.hmac;
}
const sameAnchor=(a,b)=>a.project===b.project && a.storeId===b.storeId
 && a.generation===b.generation && a.hmac===b.hmac;
export async function runControlLedgerAckCycle({sdk,config,control,rpc,runMode,runId=randomUUID()}) {
 // No Production/course retargeting while this adapter is being qualified.
 if(runMode!=='ISOLATED_QA' || !/^[a-z]{20}$/.test(config?.project)
  || ['dqffxflaoyarbxyiyhop','ppvircenkjizeiqdxphj','amduqhmgmeetaatwlmmt'].includes(config.project)
  || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(runId))fail();
 const args={p_project:config.project,p_store:config.storeId,p_origin:config.origin,p_run:runId};
 const old=checkpoint(await control('hr_control_claim',args),config,runId);
 await readCloudLedger(sdk,config,old.anchor);
 const snapshot=await rpc('hr_ledger_snapshot',{p_project:config.project,p_store:config.storeId});
 if(!exact(snapshot,['format','project','receipts']) || snapshot.format!==1 || snapshot.project!==config.project)fail();
 const receipts=normalizeReceipts(snapshot.receipts);
 const result=await syncCloudLedger(sdk,config,old.anchor,{...snapshot,receipts});
 await control('hr_control_commit',{...args,p_revision:old.revision,
  p_generation:result.anchor.generation,p_hmac:result.anchor.hmac});
 // A commit response is insufficient: independent read must observe durable state.
 const current=checkpoint(await control('hr_control_read',args),config,runId);
 if(current.revision!==old.revision+1 || !sameAnchor(current.anchor,result.anchor))fail();
 const verified=await readCloudLedger(sdk,config,current.anchor);
 const exported=new Map(verified.receipts.map(row=>[row.id,JSON.stringify(row)]));
 if(receipts.some(row=>exported.get(row.id)!==JSON.stringify(row)))fail();
 let acknowledged=0;
 for(let start=0;start<receipts.length;start+=100){
  if(!sameCheckpoint(checkpoint(await control('hr_control_read',args),config,runId),current))fail();
  const batch=receipts.slice(start,start+100);
  const response=await rpc('hr_ledger_ack',{p_project:config.project,p_store:config.storeId,
   p_generation:verified.generation,p_hmac:current.anchor.hmac,p_receipts:batch});
  if(!exact(response,['acknowledged']) || !Array.isArray(response.acknowledged)
   || !equal(response.acknowledged,batch.map(row=>row.id)))fail();
  acknowledged+=batch.length;
 }
 if(!sameCheckpoint(checkpoint(await control('hr_control_read',args),config,runId),current))fail();
 const finished=await control('hr_control_finish',{...args,p_revision:current.revision});
 if(!exact(finished,['finished']) || finished.finished!==true)fail();
 return {verified:true,generation:verified.generation,acknowledged};
 // Never clear a lock on unknown commit/ack outcome. No timeout takeover.
}

export function createControlClient(project,serverKey,transport=fetch) {
 if(project!=='amduqhmgmeetaatwlmmt' || typeof serverKey!=='string' || serverKey.length<32)fail();
 return async(name,body)=>{
  if(!['hr_control_claim','hr_control_read','hr_control_commit','hr_control_finish'].includes(name))fail();
  const response=await transport(`https://${project}.supabase.co/rest/v1/rpc/${name}`,{
   method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),
   headers:{apikey:serverKey,authorization:'Bearer '+serverKey,'content-type':'application/json'},
   body:JSON.stringify(body)
  });
  if(!response.ok || !response.body)fail();
  const reader=response.body.getReader();const chunks=[];let size=0,finished=false;
  try {
   while(true){const p=await reader.read();if(p.done){finished=true;break;}
    size+=p.value.byteLength;if(size>16384)fail();chunks.push(Buffer.from(p.value));}
   return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));
  } finally {if(!finished)await reader.cancel().catch(()=>{});reader.releaseLock();}
 };
}

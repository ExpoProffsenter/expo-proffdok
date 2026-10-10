// Explicit isolated bootstrap only. No app RPC, activation, recovery or unlock.
import {randomUUID} from 'node:crypto';
import {sealLedger} from './hr-deletion-ledger.mjs';
import {readCloudLedger} from './hr-cloud-deletion-ledger.mjs';
const fail=()=>{throw Error('untrusted_hr_control_bootstrap');};
const exact=(v,keys)=>v && typeof v==='object' && !Array.isArray(v)
 && Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const protectedProjects=['dqffxflaoyarbxyiyhop','ppvircenkjizeiqdxphj','amduqhmgmeetaatwlmmt'];
function validate(config,runMode,runId){
 if(runMode!=='ISOLATED_QA' || !exact(config,['project','storeId','origin','token','key'])
  || !/^[a-z]{20}$/.test(config.project) || protectedProjects.includes(config.project)
  || !/^store_[a-z0-9]+$/.test(config.storeId)
  || config.origin!==`https://${config.storeId.slice(6)}.private.blob.vercel-storage.com`
  || typeof config.token!=='string' || !/^vercel_blob_rw_[A-Za-z0-9]+_.+$/.test(config.token)
  || config.token.split('_')[3].toLowerCase()!==config.storeId.slice(6)
  || !/^[a-f0-9]{64}$/.test(config.key)
  || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(runId))fail();
}
function state(value,config,runId,hmac,status){
 if(!exact(value,['format','project','storeId','origin','revision','runId','anchor','bootstrapStatus','enabled'])
  || value.format!==1 || value.project!==config.project || value.storeId!==config.storeId
  || value.origin!==config.origin || value.revision!==0 || value.runId!==runId
  || value.bootstrapStatus!==status || value.enabled!==false
  || !exact(value.anchor,['project','storeId','generation','hmac'])
  || value.anchor.project!==config.project || value.anchor.storeId!==config.storeId
  || value.anchor.generation!==0 || value.anchor.hmac!==hmac)fail();
 return value.anchor;
}
export function prepareControlBootstrap(config,runMode){
 validate(config,runMode,randomUUID());
 const envelope=sealLedger({format:1,project:config.project,generation:0,receipts:[]},config.project,config.key);
 // All interpolated values are tightly validated identifiers or a hex digest.
 // This contains no secret. INSERT has no overwrite/recovery/upsert path.
 return {anchor:{project:config.project,storeId:config.storeId,generation:0,hmac:envelope.hmac},
  stagingSql:`-- ONLY expo-hr-control / amduqhmgmeetaatwlmmt; explicit isolated provisioning.\n`
   +`begin;\nset local lock_timeout='5s';\n`
   +`insert into hr_control.checkpoints(project_ref,store_id,origin,generation,hmac,bootstrap_status)\n`
   +`values('${config.project}','${config.storeId}','${config.origin}',0,'${envelope.hmac}','staged');\ncommit;\n`};
}
export async function runControlBootstrap({sdk,config,control,runMode,runId=randomUUID()}){
 try{
 validate(config,runMode,runId);
 const envelope=sealLedger({format:1,project:config.project,generation:0,receipts:[]},config.project,config.key);
 const args={p_project:config.project,p_store:config.storeId,p_origin:config.origin,p_run:runId,p_hmac:envelope.hmac};
 // SQL requires an explicitly pre-staged exact digest. Missing state cannot be created.
 const anchor=state(await control('hr_control_bootstrap_claim',args),config,runId,envelope.hmac,'writing');
 const pathname=`hr-ledger/${config.project}/ledger.json`;
 const options={access:'private',token:config.token,storeId:config.storeId,abortSignal:AbortSignal.timeout(30000)};
 const existing=await sdk.get(pathname,{...options,useCache:false});
 if(existing!==null){if(existing?.stream)await existing.stream.cancel().catch(()=>{});fail();}
 // Create-only closes the check/create race. Unknown outcome retains the SQL lock.
 const written=await sdk.put(pathname,JSON.stringify(envelope)+'\n',{
  ...options,abortSignal:AbortSignal.timeout(30000),addRandomSuffix:false,allowOverwrite:false,
  contentType:'application/json'});
 if(written?.pathname!==pathname || written?.url!==`${config.origin}/${pathname}`)fail();
 await readCloudLedger(sdk,config,anchor);
 state(await control('hr_control_bootstrap_read',args),config,runId,envelope.hmac,'writing');
 await control('hr_control_bootstrap_commit',args);
 // Never trust the commit response as durable evidence.
 state(await control('hr_control_bootstrap_read',args),config,runId,envelope.hmac,'verified');
 await readCloudLedger(sdk,config,anchor);
 state(await control('hr_control_bootstrap_read',args),config,runId,envelope.hmac,'verified');
 return {bootstrapVerified:true,bindingEnabled:false,locked:true};
 // No catch/finally deletion, reset, activation or unlock, including on success.
 }catch{fail();} // Suppress provider errors; never log credentials or clear a durable lock.
}

export function createBootstrapClient(serverKey,transport=fetch){
 if(typeof serverKey!=='string' || !/^sb_secret_[A-Za-z0-9_-]{24,}$/.test(serverKey))fail();
 return async(name,body)=>{
  try{
   if(!['hr_control_bootstrap_claim','hr_control_bootstrap_read','hr_control_bootstrap_commit'].includes(name))fail();
   const response=await transport(`https://amduqhmgmeetaatwlmmt.supabase.co/rest/v1/rpc/${name}`,{
    method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),
    headers:{apikey:serverKey,'content-type':'application/json'},body:JSON.stringify(body)});
   if(!response.ok || !response.body)fail();
   const reader=response.body.getReader();let size=0,finished=false;const chunks=[];
   try{
    while(true){const part=await reader.read();if(part.done){finished=true;break;}
     size+=part.value.byteLength;if(size>16384)fail();chunks.push(part.value);}
    const bytes=new Uint8Array(size);let offset=0;for(const part of chunks){bytes.set(part,offset);offset+=part.byteLength;}
    return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
   }finally{if(!finished)await reader.cancel().catch(()=>{});reader.releaseLock();}
  }catch{fail();}
 };
}

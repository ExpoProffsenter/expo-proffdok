// Control-only isolated worker. No scheduler, activation, unlock, recovery or app UI.
import {Buffer} from 'node:buffer';
import {randomUUID,timingSafeEqual} from 'node:crypto';
import {prepareControlBootstrap,runControlBootstrap,createBootstrapClient} from '../../../../../scripts/lib/hr-control-bootstrap.mjs';
import {runControlLedgerAckCycle} from '../../../../../scripts/lib/hr-control-ack-cycle.mjs';

export const controlUrl='https://amduqhmgmeetaatwlmmt.supabase.co';
const storeId='store_feueeykoyyvzvmca';
const origin='https://feueeykoyyvzvmca.private.blob.vercel-storage.com';
const secret=v=>typeof v==='string' && /^sb_secret_[A-Za-z0-9_-]{24,}$/.test(v);
const fail=()=>{throw Error('hr_ledger_worker_rejected');};
const reply=(status,value)=>new Response(JSON.stringify(value),{status,
 headers:{'content-type':'application/json','cache-control':'no-store'}});
function namedKey(env){
 try{const key=JSON.parse(env('SUPABASE_SECRET_KEYS')).hr_ledger_worker;return secret(key)?key:null;}
 catch{return null;}
}
function authorized(req,key){
 // Never accept user JWT, publishable, default, probe or another named key.
 if(req.headers.has('authorization'))return false;
 const header=req.headers.get('apikey');
 if(!secret(header))return false;
 const a=Buffer.from(header),b=Buffer.from(key);
 return a.length===b.length && timingSafeEqual(a,b);
}
async function action(req){
 if(!req.body)return null;
 const reader=req.body.getReader();const parts=[];let size=0;
 let timer;const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{void reader.cancel().catch(()=>{});reject(Error('body_timeout'));},5000);});
 try{
  return await Promise.race([deadline,(async()=>{
   while(true){const p=await reader.read();if(p.done)break;size+=p.value.byteLength;
    if(size>256)return null;parts.push(Buffer.from(p.value));}
   const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(parts)));
   return body && Object.keys(body).sort().join(',')==='action,mode'
    && body.mode==='ISOLATED_QA' && ['plan','bootstrap','cycle'].includes(body.action)?body.action:null;
  })()]);
 }catch{return null;}finally{clearTimeout(timer);await reader.cancel().catch(()=>{});reader.releaseLock();}
}

export function createWorkerRpc(project,key,names,limit,transport=fetch){
 if(!/^[a-z]{20}$/.test(project) || !secret(key))fail();
 return async(name,body)=>{
  try{
   if(!names.includes(name))fail();
   const response=await transport(`https://${project}.supabase.co/rest/v1/rpc/${name}`,{
    method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),
    headers:{apikey:key,'content-type':'application/json'},body:JSON.stringify(body)});
   if(!response.ok || !response.body)fail();
   const reader=response.body.getReader();let size=0,finished=false;const chunks=[];
   try{
    while(true){const p=await reader.read();if(p.done){finished=true;break;}
     size+=p.value.byteLength;if(size>limit)fail();chunks.push(Buffer.from(p.value));}
    return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));
   }finally{if(!finished)await reader.cancel().catch(()=>{});reader.releaseLock();}
  }catch{fail();}
 };
}

export function createWorkerHandler({sdk,env,transport=fetch}){
 return async req=>{
  if(env('SUPABASE_URL')!==controlUrl)return reply(503,{ok:false,code:'wrong_control_project'});
  const key=namedKey(env);
  if(!key)return reply(403,{ok:false,code:'worker_key_not_configured'});
  if(!authorized(req,key))return reply(403,{ok:false,code:'service_only'});
  if(req.method!=='POST')return reply(405,{ok:false,code:'post_required'});
  const operation=await action(req);
  if(!operation)return reply(400,{ok:false,code:'isolated_action_required'});
  // Deployment-owned binding only; request cannot choose a project, store, key or URL.
  const config={project:env('HR_LEDGER_QA_PROJECT_REF'),storeId,origin,
   token:env('HR_LEDGER_BLOB_TOKEN'),key:env('HR_LEDGER_QA_SIGNING_KEY_V1')};
  let plan;try{plan=prepareControlBootstrap(config,'ISOLATED_QA');}
  catch{return reply(503,{ok:false,code:'isolated_binding_not_configured'});}
  if(operation==='plan')return reply(200,{ok:true,mode:'ISOLATED_QA',...plan,
   privateHROpen:false,productionAnchor:false});
  const runId=randomUUID();
  try{
   let result;
   if(operation==='bootstrap')result=await runControlBootstrap({sdk,config,
    control:createBootstrapClient(key,transport),runMode:'ISOLATED_QA',runId});
   else{
    // Separate explicit fixture approval. Bootstrap cannot set it or enable SQL binding.
    const sourceKey=env('HR_LEDGER_QA_SOURCE_KEY');
    if(env('HR_LEDGER_QA_CYCLE_APPROVED')!=='ISOLATED_QA_VERIFIED' || !secret(sourceKey) || sourceKey===key)
     return reply(503,{ok:false,code:'isolated_cycle_not_configured'});
    const control=createWorkerRpc('amduqhmgmeetaatwlmmt',key,
     ['hr_control_claim','hr_control_read','hr_control_commit','hr_control_finish'],16384,transport);
    const rpc=createWorkerRpc(config.project,sourceKey,['hr_ledger_snapshot','hr_ledger_ack'],40000000,transport);
    result=await runControlLedgerAckCycle({sdk,config,control,rpc,runMode:'ISOLATED_QA',runId});
   }
   return reply(200,{ok:true,mode:'ISOLATED_QA',action:operation,runId,...result,
    privateHROpen:false,productionAnchor:false});
  }catch{
   // Never disclose provider messages, private receipt rows, tokens, keys or traces.
   // A timeout/crash/unknown result is NOT retried and never clears the durable lock.
   return reply(502,{ok:false,mode:'ISOLATED_QA',action:operation,runId,
    code:'isolated_worker_failed',automaticRetry:false,privateHROpen:false,productionAnchor:false});
  }
 };
}

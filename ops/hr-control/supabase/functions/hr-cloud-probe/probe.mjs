import {Buffer} from 'node:buffer';
import {randomBytes,randomUUID,timingSafeEqual} from 'node:crypto';
import {sealLedger,normalizeReceipts} from '../../../../../scripts/lib/hr-deletion-ledger.mjs';
import {readCloudLedger,syncCloudLedger} from '../../../../../scripts/lib/hr-cloud-deletion-ledger.mjs';

export const controlUrl='https://amduqhmgmeetaatwlmmt.supabase.co';
const project='hrcloudprobeqaonlyxx';
const storeId='store_feueeykoyyvzvmca';
const origin='https://feueeykoyyvzvmca.private.blob.vercel-storage.com';
const requireTrue=v=>{if(!v)throw Error('hr_cloud_probe_failed');};
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const row=n=>({id:id(n),company_id:id(1001),employee_id:id(n),user_id:id(n+2000),
 kind:'employment',through_revision:1,requested_at:'2026-10-10T21:00:00.000Z'});
const validToken=token=>typeof token==='string' && /^vercel_blob_rw_[A-Za-z0-9]+_.+$/.test(token)
 && token.split('_')[3].toLowerCase()===storeId.slice(6);
const sameIds=(rows,ids)=>JSON.stringify(rows.map(r=>r.id))===JSON.stringify(ids.map(id));

// Every invocation gets a server-generated unique QA path and ephemeral synthetic signing key.
// The path adapter reuses the actual ledger validation/CAS code without writing its real path.
export async function runCloudProbe(sdk,token,anonymousFetch=fetch) {
 requireTrue(validToken(token));
 const runId=randomUUID(),qaPath=`hr-ledger-qa/${runId}/ledger.json`;
 const expectedPath=`hr-ledger/${project}/ledger.json`;
 const config={project,storeId,origin,token,key:randomBytes(32).toString('hex')};
 const signal=AbortSignal.timeout(90000);
 const options=o=>({...o,token,storeId,access:'private',
  abortSignal:o?.abortSignal?AbortSignal.any([signal,o.abortSignal]):signal});
 const checkMeta=(blob,path)=>{
  const url=blob?.url?new URL(blob.url):null;
  requireTrue(blob?.pathname===path && url?.origin===origin && url.pathname===`/${path}`
   && !url.search && !url.hash && !url.username && !url.password);
 };
 const isolated={
  async get(path,o){
   requireTrue(path===expectedPath);
   const response=await sdk.get(qaPath,options(o));
   if(!response)return null;
   checkMeta(response.blob,qaPath);
   return {...response,blob:{...response.blob,pathname:path,url:`${origin}/${path}`}};
  },
  async put(path,encoded,o){
   requireTrue(path===expectedPath);
   const result=await sdk.put(qaPath,encoded,options(o));checkMeta(result,qaPath);
   return {...result,pathname:path,url:`${origin}/${path}`};
  }
 };
 const make=(generation,receipts)=>sealLedger({format:1,project,generation,
  receipts:normalizeReceipts(receipts)},project,config.key);
 const anchor=e=>({project,storeId,generation:e.payload.generation,hmac:e.hmac});
 const snapshot=receipts=>({format:1,project,receipts});
 let stage='create',created=false,cleaned=false;
 const passed=[];
 try {
  const initial=make(0,[]);
  const written=await sdk.put(qaPath,JSON.stringify(initial)+'\n',options({
   addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'}));
  created=true;checkMeta(written,qaPath);
  await readCloudLedger(isolated,config,anchor(initial));passed.push('private_write_fresh_read');
  stage='anonymous';
  const denied=await anonymousFetch(`${origin}/${qaPath}?cache=0`,{
   method:'GET',redirect:'error',cache:'no-store',credentials:'omit',signal});
  if(denied.body)await denied.body.cancel();
  requireTrue([401,403].includes(denied.status));passed.push('anonymous_read_denied');
  stage='first_union';
  const first=await syncCloudLedger(isolated,config,anchor(initial),snapshot([row(1)]));
  requireTrue(first.payload.generation===1 && sameIds(first.payload.receipts,[1]));
  passed.push('signed_union_fresh_readback');
  stage='conflict';
  const winning=make(2,[row(1),row(2)]);
  let conflict=false;
  try {
   await syncCloudLedger({...isolated,async put(path,encoded,o){
    await isolated.put(path,JSON.stringify(winning)+'\n',o);
    return isolated.put(path,encoded,o);
   }},config,first.anchor,snapshot([row(3)]));
  }catch(error){conflict=error instanceof sdk.BlobPreconditionFailedError;}
  requireTrue(conflict);passed.push('actual_stale_etag_conflict');
  const recovered=await readCloudLedger(isolated,config,anchor(winning));
  requireTrue(sameIds(recovered.receipts,[1,2]));
  stage='restore_union';
  const second=await syncCloudLedger(isolated,config,anchor(winning),snapshot([]));
  requireTrue(second.payload.generation===3 && sameIds(second.payload.receipts,[1,2]));
  passed.push('empty_source_preserves_cloud_receipts');
  stage='unknown_write';
  const lost=Error('synthetic_response_lost_after_actual_write');let ambiguous=false;
  try {
   await syncCloudLedger({...isolated,async put(path,encoded,o){
    await isolated.put(path,encoded,o);throw lost;
   }},config,second.anchor,snapshot([row(3)]));
  }catch(error){ambiguous=error===lost;}
  requireTrue(ambiguous);passed.push('actual_write_with_injected_response_loss_refuses_success');
  stage='old_anchor';let stale=false;
  try{await readCloudLedger(isolated,config,second.anchor);}catch{stale=true;}
  requireTrue(stale);passed.push('previous_anchor_rejected');
  // This expected anchor is synthetic/in-memory, not a durable Production checkpoint.
  stage='recovery';const finalEnvelope=make(4,[row(1),row(2),row(3)]);
  const final=await readCloudLedger(isolated,config,anchor(finalEnvelope));
  requireTrue(final.generation===4 && sameIds(final.receipts,[1,2,3]));
  passed.push('fresh_cloud_recovery_with_known_synthetic_anchor');
  stage='cleanup';
  await sdk.del(qaPath,{token,storeId,abortSignal:signal});
  requireTrue(await sdk.get(qaPath,options({useCache:false}))===null);
  cleaned=true;passed.push('synthetic_object_deleted_and_missing');
  return {ok:true,mode:'ISOLATED_CLOUD_QA',runId,passed,cleaned,
   productionAnchor:false,databaseAck:false,byteRestore:false};
 }catch{
  // Never expose provider error text, secrets, signed payloads or private data.
  if(created && !cleaned){
   try{await sdk.del(qaPath,{token,storeId,abortSignal:AbortSignal.timeout(10000)});
    cleaned=await sdk.get(qaPath,options({useCache:false}))===null;}catch{}
  }
  return {ok:false,mode:'ISOLATED_CLOUD_QA',runId,stage,passed,cleaned,
   productionAnchor:false,databaseAck:false,byteRestore:false};
 }
}

function authorized(header,encodedKeys){
 // Supabase's documented service-to-service mode: only the named default secret on apikey.
 // No user JWT, anon/publishable key or arbitrary named key can invoke this QA function.
 let key;try{key=JSON.parse(encodedKeys).default;}catch{return false;}
 if(typeof key!=='string' || !key.startsWith('sb_secret_') || key.length<32 || typeof header!=='string')return false;
 const a=Buffer.from(header),b=Buffer.from(key);
 return a.length===b.length && timingSafeEqual(a,b);
}
const reply=(status,value)=>new Response(JSON.stringify(value),{status,
 headers:{'content-type':'application/json','cache-control':'no-store'}});
async function requestMode(req){
 if(!req.body)return false;
 const reader=req.body.getReader();let size=0;const parts=[];
 try{while(true){const part=await reader.read();if(part.done)break;
  size+=part.value.byteLength;if(size>256)return false;parts.push(Buffer.from(part.value));}
  const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(parts)));
  return body && Object.keys(body).join(',')==='mode' && body.mode==='ISOLATED_CLOUD_QA';
 }catch{return false;}finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
}
export function createProbeHandler({sdk,env,probe=runCloudProbe}) {
 return async req=>{
  if(env('SUPABASE_URL')!==controlUrl)return reply(503,{ok:false,code:'wrong_control_project'});
  if(!authorized(req.headers.get('apikey'),env('SUPABASE_SECRET_KEYS')))
   return reply(403,{ok:false,code:'service_only'});
  if(req.method!=='POST')return reply(405,{ok:false,code:'post_required'});
  if(!await requestMode(req))return reply(400,{ok:false,code:'isolated_mode_required'});
  const token=env('HR_LEDGER_BLOB_TOKEN');
  if(!validToken(token))return reply(503,{ok:false,code:'store_binding_not_configured'});
  try{const result=await probe(sdk,token);return reply(result.ok?200:502,result);}
  catch{return reply(502,{ok:false,code:'probe_failed'});}
 };
}

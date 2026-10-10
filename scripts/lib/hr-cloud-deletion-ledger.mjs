// Operator-only. Not imported by the app. The store/key/trusted anchor live outside DB restore.
import {normalizeReceipts,sealLedger,verifyLedger} from './hr-deletion-ledger.mjs';

const limit=40000000;
const fail=()=>{throw Error('untrusted_hr_cloud_ledger');};
const exact=(value,keys)=>value && typeof value==='object' && !Array.isArray(value)
  && Object.keys(value).sort().join(',')===[...keys].sort().join(',');

function configuration(config,anchor) {
  if(!exact(config,['project','storeId','origin','token','key'])
    || !/^[a-z]{20}$/.test(config.project) || !/^store_[a-z0-9]+$/.test(config.storeId)
    || !/^https:\/\/[a-z0-9-]+\.private\.blob\.vercel-storage\.com$/.test(config.origin)
    || typeof config.token!=='string' || !/^vercel_blob_rw_[A-Za-z0-9]+_.+$/.test(config.token)
    // Explicit tokens override storeId in audited SDK 2.8.1. Bind before any network call.
    // Catalog/token identifiers may use mixed case; DNS and DB binding use canonical lower case.
    || config.token.split('_')[3].toLowerCase()!==config.storeId.slice(6)
    || config.origin!==`https://${config.storeId.slice(6)}.private.blob.vercel-storage.com`
    || !/^[a-f0-9]{64}$/.test(config.key)
    || !exact(anchor,['project','storeId','generation','hmac'])
    || anchor.project!==config.project || anchor.storeId!==config.storeId
    || !Number.isSafeInteger(anchor.generation) || anchor.generation<0
    || !/^[a-f0-9]{64}$/.test(anchor.hmac)) fail();
}
function metadata(blob,pathname,config) {
  const url=blob && typeof blob.url==='string' ? new URL(blob.url) : null;
  if(!blob || blob.pathname!==pathname || typeof blob.url!=='string'
    || url.origin!==config.origin || url.pathname!==`/${pathname}`
    || url.username || url.password || url.search || url.hash) fail();
}
async function read(sdk,pathname,config,signal) {
  const response=await sdk.get(pathname,{access:'private',token:config.token,
    storeId:config.storeId,useCache:false,abortSignal:signal});
  signal.throwIfAborted();
  if(!response || response.statusCode!==200 || !response.stream) fail();
  const reader=response.stream.getReader();
  const cancel=()=>{void reader.cancel().catch(()=>{});};
  signal.addEventListener('abort',cancel,{once:true});
  let finished=false;
  try {
    metadata(response.blob,pathname,config);
    if(typeof response.blob.etag!=='string' || !response.blob.etag.length
      || !Number.isSafeInteger(response.blob.size) || response.blob.size<1
      || response.blob.size>limit) fail();
    let size=0;const chunks=[];
    while(true){
      signal.throwIfAborted();
      const part=await reader.read();
      if(part.done){finished=true;break;}
      size+=part.value.byteLength;
      if(size>limit || size>response.blob.size) fail();
      chunks.push(Buffer.from(part.value));
    }
    signal.throwIfAborted();
    if(size!==response.blob.size) fail();
    const envelope=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));
    const payload=verifyLedger(envelope,config.project,config.key);
    return {envelope,payload,etag:response.blob.etag};
  } finally {
    signal.removeEventListener('abort',cancel);
    if(!finished)await reader.cancel().catch(()=>{});
    reader.releaseLock();
  }
}
function anchored(result,anchor) {
  // A valid old signature is insufficient. Compare both generation and independent digest.
  if(result.payload.generation!==anchor.generation || result.envelope.hmac!==anchor.hmac) fail();
}
async function bounded(work,timeoutMs) {
  if(!Number.isSafeInteger(timeoutMs) || timeoutMs<1 || timeoutMs>30000) fail();
  const controller=new AbortController();
  let timer;
  const timeout=new Promise((_,reject)=>{
    timer=setTimeout(()=>{
      const error=Error('hr_cloud_ledger_timeout');controller.abort(error);reject(error);
    },timeoutMs);
  });
  try{return await Promise.race([work(controller.signal),timeout]);}finally{clearTimeout(timer);}
}
const currentPath=config=>`hr-ledger/${config.project}/ledger.json`;

export async function readCloudLedger(sdk,config,anchor,timeoutMs=30000) {
  configuration(config,anchor);
  return bounded(async signal=>{
    const result=await read(sdk,currentPath(config),config,signal);
    anchored(result,anchor);
    return result.payload;
  },timeoutMs);
}
export async function syncCloudLedger(sdk,config,anchor,snapshot,timeoutMs=30000) {
  configuration(config,anchor);
  if(!exact(snapshot,['format','project','receipts']) || snapshot.format!==1
    || snapshot.project!==config.project) fail();
  const fresh=normalizeReceipts(snapshot.receipts);
  return bounded(async signal=>{
    const pathname=currentPath(config);
    // Missing/unbound storage cannot be initialized here. Never write before a trusted read.
    const old=await read(sdk,pathname,config,signal);
    anchored(old,anchor);
    const rows=new Map(old.payload.receipts.map(row=>[row.id,row]));
    for(const row of fresh){
      if(rows.has(row.id) && JSON.stringify(rows.get(row.id))!==JSON.stringify(row)) fail();
      rows.set(row.id,row);
    }
    const payload={format:1,project:config.project,generation:old.payload.generation+1,
      receipts:normalizeReceipts([...rows.values()])};
    const envelope=sealLedger(payload,config.project,config.key);
    const encoded=JSON.stringify(envelope)+'\n';
    if(Buffer.byteLength(encoded)>limit) fail();
    const written=await sdk.put(pathname,encoded,{access:'private',token:config.token,
      storeId:config.storeId,addRandomSuffix:false,allowOverwrite:true,ifMatch:old.etag,
      contentType:'application/json',abortSignal:signal});
    signal.throwIfAborted();
    metadata(written,pathname,config);
    // Upload success is not an acknowledgement. Require a fresh verified readback.
    const confirmed=await read(sdk,pathname,config,signal);
    const nextAnchor={project:config.project,storeId:config.storeId,
      generation:payload.generation,hmac:envelope.hmac};
    anchored(confirmed,nextAnchor);
    if(JSON.stringify(confirmed.payload)!==JSON.stringify(payload)) fail();
    return {payload:confirmed.payload,anchor:nextAnchor};
  },timeoutMs);
}

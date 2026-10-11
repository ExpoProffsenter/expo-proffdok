import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {sealLedger} from './lib/hr-deletion-ledger.mjs';
import {readCloudLedger,syncCloudLedger} from './lib/hr-cloud-deletion-ledger.mjs';

const project='ppvircenkjizeiqdxphj';
const config={project,storeId:'store_synthetic',origin:'https://synthetic.private.blob.vercel-storage.com',
  token:'vercel_blob_rw_synthetic_not-a-real-token',key:randomBytes(32).toString('hex')};
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const row=n=>({id:id(n),company_id:id(1001),employee_id:id(n),user_id:id(n+2000),
  kind:'employment',through_revision:1,requested_at:'2026-10-09T21:00:00.000Z'});
const envelope=(generation,receipts)=>sealLedger({format:1,project,generation,receipts},project,config.key);
const initial=envelope(7,[row(900)]);
const anchor={project,storeId:config.storeId,generation:7,hmac:initial.hmac};
const snapshot=receipts=>({format:1,project,receipts});
let scenarios=0;
async function scenario(work){await work();scenarios++;}
function storage() {
  let value=structuredClone(initial),etag='v7',gets=0,puts=0;
  const sdk={
    hook:null,writeHook:null,
    get value(){return structuredClone(value);},
    set value(next){value=structuredClone(next);etag+='x';},
    get puts(){return puts;},
    async get(pathname,options){
      assert.equal(options.access,'private');assert.equal(options.useCache,false);
      assert.equal(options.token,config.token);assert.equal(options.storeId,config.storeId);
      assert(options.abortSignal instanceof AbortSignal);
      gets++;
      const bytes=Buffer.from(JSON.stringify(value)+'\n');
      const response={statusCode:200,blob:{pathname,url:`${config.origin}/${pathname}`,etag,size:bytes.length},
        stream:new ReadableStream({start(controller){controller.enqueue(bytes);controller.close();}})};
      if(sdk.hook)return sdk.hook(response,gets);
      return response;
    },
    async put(pathname,encoded,options){
      assert.equal(options.access,'private');assert.equal(options.allowOverwrite,true);
      assert.equal(options.addRandomSuffix,false);assert.equal(options.token,config.token);
      assert.equal(options.storeId,config.storeId);assert(options.abortSignal instanceof AbortSignal);
      if(sdk.writeHook)await sdk.writeHook();
      if(options.ifMatch!==etag)throw Error('BlobPreconditionFailedError');
      puts++;value=JSON.parse(encoded);etag+='n';
      return {pathname,url:`${config.origin}/${pathname}`,etag};
    }
  };
  return sdk;
}
await scenario(async()=>{
  const sdk=storage();assert.equal((await readCloudLedger(sdk,config,anchor)).generation,7);
  const result=await syncCloudLedger(sdk,config,anchor,snapshot([row(1)]));
  assert.equal(result.payload.generation,8);
  assert.deepEqual(result.payload.receipts.map(r=>r.id),[id(1),id(900)]);
  assert.equal((await readCloudLedger(sdk,config,result.anchor)).receipts.length,2);
  await assert.rejects(readCloudLedger(sdk,config,anchor));
});
for(const mutate of [r=>null,r=>({...r,statusCode:304}),r=>({...r,stream:null}),
  r=>({...r,blob:{...r.blob,etag:''}}),r=>({...r,blob:{...r.blob,size:40000001}}),
  r=>({...r,blob:{...r.blob,size:r.blob.size-1}}),r=>({...r,blob:{...r.blob,size:r.blob.size+1}}),
  r=>({...r,blob:{...r.blob,url:r.blob.url.replace('.private.','.public.')}}),
  r=>({...r,blob:{...r.blob,url:r.blob.url.replace('synthetic.','other.')}}),
  r=>({...r,blob:{...r.blob,pathname:'other/ledger.json'}}),
  r=>({...r,blob:{...r.blob,url:r.blob.url+'?wrong=1'}})]) {
  await scenario(async()=>{
    const sdk=storage();sdk.hook=r=>mutate(r);
    await assert.rejects(syncCloudLedger(sdk,config,anchor,snapshot([])));
    assert.equal(sdk.puts,0);
  });
}
for(const changed of [envelope(6,[]),envelope(7,[]),
  {...initial,hmac:'f'.repeat(64)},
  {...initial,payload:{...initial.payload,project:'aaaaaaaaaaaaaaaaaaaa'}}]) {
  await scenario(async()=>{
    const sdk=storage();sdk.value=changed;
    await assert.rejects(syncCloudLedger(sdk,config,anchor,snapshot([])));
    assert.equal(sdk.puts,0);
  });
}
for(const changed of [snapshot([{...row(900),user_id:id(99)}]),snapshot([row(1),row(1)]),
  snapshot([{...row(1),payload:'sensitive text'}]),{...snapshot([]),project:'aaaaaaaaaaaaaaaaaaaa'}]) {
  await scenario(async()=>{
    const sdk=storage();await assert.rejects(syncCloudLedger(sdk,config,anchor,changed));
    assert.equal(sdk.puts,0);
  });
}
await scenario(async()=>{
  const sdk=storage();sdk.writeHook=()=>{sdk.value=envelope(8,[row(2),row(900)]);};
  await assert.rejects(syncCloudLedger(sdk,config,anchor,snapshot([row(1)])),/Precondition/);
  assert.equal(sdk.puts,0);assert.equal(sdk.value.payload.receipts[0].id,id(2));
});
await scenario(async()=>{
  const sdk=storage();const results=await Promise.allSettled([
    syncCloudLedger(sdk,config,anchor,snapshot([row(1)])),
    syncCloudLedger(sdk,config,anchor,snapshot([row(2)]))]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(sdk.puts,1);assert.equal(sdk.value.payload.receipts.length,2);
});
for(const fault of ['old-readback','missing-readback','tampered-readback','network-after-write']) {
  await scenario(async()=>{
    const sdk=storage();sdk.hook=(response,gets)=>{
      if(gets===1)return response;
      if(fault==='missing-readback')return null;
      if(fault==='network-after-write')throw Error('ambiguous network failure');
      const bytes=Buffer.from(JSON.stringify(fault==='old-readback'?initial:{...sdk.value,hmac:'f'.repeat(64)}));
      return {...response,blob:{...response.blob,size:bytes.length},
        stream:new ReadableStream({start(c){c.enqueue(bytes);c.close();}})};
    };
    await assert.rejects(syncCloudLedger(sdk,config,anchor,snapshot([row(1)])));
    assert.equal(sdk.puts,1,'persisted writes still cannot produce a false acknowledgement');
  });
}
await scenario(async()=>{
  const sdk=storage();sdk.hook=()=>{throw Error('credentials unavailable');};
  await assert.rejects(syncCloudLedger(sdk,config,anchor,snapshot([])));assert.equal(sdk.puts,0);
});
for(const bad of [{...anchor,storeId:'store_other'},{...anchor,generation:6},{...anchor,hmac:'a'.repeat(64)}]) {
  await scenario(async()=>{await assert.rejects(readCloudLedger(storage(),config,bad));});
}
await scenario(async()=>{
  const sdk=storage();sdk.get=()=>new Promise(()=>{});
  await assert.rejects(syncCloudLedger(sdk,config,anchor,snapshot([]),1),/timeout/);
  assert.equal(sdk.puts,0,'a hung transport cannot silently approve or write');
});
for(const bad of [{...config,token:'vercel_blob_rw_other_not-real'},
  {...config,origin:'https://other.private.blob.vercel-storage.com'},
  {...config,key:''},{...config,storeId:'other'},{...config,project:'wrong'}]) {
  await scenario(async()=>{
    const sdk=storage();let called=false;sdk.get=()=>{called=true;throw Error('unexpected network');};
    await assert.rejects(syncCloudLedger(sdk,bad,anchor,snapshot([])));
    assert.equal(called,false);assert.equal(sdk.puts,0);
  });
}
await scenario(async()=>{
  const sdk=storage();let cancelled=false;
  sdk.hook=response=>({...response,blob:{...response.blob,size:40000001},
    stream:new ReadableStream({cancel(){cancelled=true;}})});
  await assert.rejects(readCloudLedger(sdk,config,anchor));assert.equal(cancelled,true);
});
await scenario(async()=>{
  const sdk=storage();const max=envelope(Number.MAX_SAFE_INTEGER,[row(900)]);sdk.value=max;
  await assert.rejects(syncCloudLedger(sdk,config,{...anchor,generation:Number.MAX_SAFE_INTEGER,hmac:max.hmac},snapshot([])));
  assert.equal(sdk.puts,0);
});
// Actual dashboard metadata: mixed-case catalog ID, lower-case private origin.
// Token suffix is synthetic; this is a binding regression, not authenticated cloud evidence.
const bound={...config,storeId:'store_feueeykoyyvzvmca',
 origin:'https://feueeykoyyvzvmca.private.blob.vercel-storage.com',
 token:'vercel_blob_rw_feUEeykOyyvZVMca_synthetic-not-a-real-token'};
const boundAnchor={...anchor,storeId:bound.storeId};
await scenario(async()=>{
 let calls=0;
 const sdk={async get(pathname,options){
  calls++;assert.equal(options.token,bound.token);assert.equal(options.useCache,false);
  const bytes=Buffer.from(JSON.stringify(initial));
  return {statusCode:200,blob:{pathname,url:bound.origin+'/'+pathname,etag:'v7',size:bytes.length},
   stream:new ReadableStream({start(c){c.enqueue(bytes);c.close();}})};
 }};
 assert.equal((await readCloudLedger(sdk,bound,boundAnchor)).generation,7);assert.equal(calls,1);
});
await scenario(async()=>{
 let calls=0;
 const sdk={async get(){calls++;throw Error('unexpected network');}};
 await assert.rejects(readCloudLedger(sdk,{...bound,token:'vercel_blob_rw_oThEr_synthetic-not-a-real-token'},boundAnchor));
 assert.equal(calls,0,'mixed-case wrong store still rejected before networking');
});
console.log(`✅ HR H5a cloud adapter: ${scenarios} fault/concurrency/fresh-readback scenarios PASS (synthetic SDK; no cloud-store/DB ack/restore proof)`);

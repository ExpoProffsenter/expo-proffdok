// Real adapter, synthetic cloud/control transports. Live DB assertions are separate.
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {sealLedger} from './lib/hr-deletion-ledger.mjs';
import {runControlLedgerAckCycle,createControlClient} from './lib/hr-control-ack-cycle.mjs';
const project='aaaaaaaaaaaaaaaaaaaa';
const config={project,storeId:'store_synthetic',origin:'https://synthetic.private.blob.vercel-storage.com',
 token:'vercel_blob_rw_synthetic_fake',key:randomBytes(32).toString('hex')};
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const row=n=>({id:id(n),employee_id:id(n),company_id:id(1000),user_id:id(n+2000),kind:'employment',
 through_revision:1,requested_at:'2026-10-10T16:00:00.000Z'});
let scenarios=0;
async function scenario(work){
 let envelope=sealLedger({format:1,project,generation:0,receipts:[]},project,config.key);
 let etag='v0',runId=null,revision=0,anchor={project,storeId:config.storeId,generation:0,hmac:envelope.hmac};
 let gets=0,reads=0;
 const f={rows:[row(1)],acks:0,puts:0,commits:0,finishes:0,events:[],cloudHook:null,controlHook:null,rpcHook:null,
  get locked(){return runId!==null;},get revision(){return revision;},
  get envelope(){return envelope;},set envelope(v){envelope=v;},
  get anchor(){return anchor;},set anchor(v){anchor=v;},
  state(){// JSONB object key order is unrelated to JS insertion order.
   return {format:1,project,storeId:config.storeId,origin:config.origin,runId,revision,
    anchor:{hmac:anchor.hmac,generation:anchor.generation,storeId:anchor.storeId,project:anchor.project}};},
  async control(name,args){
   f.events.push(name);
   if(f.controlHook){const result=await f.controlHook(name,args);if(result!==undefined)return result;}
   if(name==='hr_control_claim'){if(runId)throw Error('locked');runId=args.p_run;return f.state();}
   if(args.p_run!==runId)throw Error('not owner');
   if(name==='hr_control_read'){reads++;return f.state();}
   if(name==='hr_control_commit'){
    if(args.p_revision!==revision || args.p_generation!==anchor.generation+1)throw Error('conflict');
    anchor={project,storeId:config.storeId,generation:args.p_generation,hmac:args.p_hmac};
    revision++;f.commits++;return f.state();
   }
   if(name==='hr_control_finish'){
    if(args.p_revision!==revision)throw Error('stale finish');
    runId=null;f.finishes++;return{finished:true};
   }
   throw Error('bad control call');
  },
  async get(path,opts){
   f.events.push('cloud-read');assert.equal(opts.useCache,false);gets++;
   const bytes=Buffer.from(JSON.stringify(envelope));
   const value={statusCode:200,stream:new ReadableStream({start(c){c.enqueue(bytes);c.close();}}),
    blob:{pathname:path,url:config.origin+'/'+path,etag,size:bytes.length}};
   return f.cloudHook?f.cloudHook(value,gets):value;
  },
  async put(path,body,opts){
   f.events.push('cloud-write');assert.equal(opts.ifMatch,etag);f.puts++;
   envelope=JSON.parse(body);etag+='n';return{pathname:path,url:config.origin+'/'+path};
  },
  async rpc(name,args){
   f.events.push(name);if(f.rpcHook)return f.rpcHook(name,args);
   if(name==='hr_ledger_snapshot')return{format:1,project,receipts:f.rows};
   assert(runId && f.commits===1 && reads>=2 && gets>=4,'durable anchor and fresh reads precede ack');
   assert.equal(args.p_generation,anchor.generation);assert.equal(args.p_hmac,anchor.hmac);
   f.acks++;return{acknowledged:args.p_receipts.map(r=>r.id)};
  },
  run(overrides={}){return runControlLedgerAckCycle({sdk:{get:f.get,put:f.put},config,
   control:f.control,rpc:f.rpc,runMode:'ISOLATED_QA',...overrides});}
 };
 await work(f);scenarios++;
}
await scenario(async f=>{assert.deepEqual(await f.run(),{verified:true,generation:1,acknowledged:1});assert(!f.locked);assert.equal(f.finishes,1);
 assert.deepEqual(f.events,['hr_control_claim','cloud-read','hr_ledger_snapshot','cloud-read','cloud-write',
  'cloud-read','hr_control_commit','hr_control_read','cloud-read','hr_control_read','hr_ledger_ack','hr_control_read','hr_control_finish']);});
await scenario(async f=>{f.rows=Array.from({length:201},(_,i)=>row(i+1));assert.equal((await f.run()).acknowledged,201);assert.equal(f.acks,3);});
await scenario(async f=>{f.rows=[];assert.equal((await f.run()).acknowledged,0);assert.equal(f.acks,0);});
for(const n of [1,2,3,4])await scenario(async f=>{
 f.cloudHook=(value,read)=>read===n?null:value;
 await assert.rejects(f.run());assert.equal(f.acks,0);assert(f.locked);assert.equal(f.finishes,0);
});
await scenario(async f=>{f.controlHook=async name=>{if(name==='hr_control_commit')throw Error('commit failed');};await assert.rejects(f.run());assert.equal(f.acks,0);assert(f.locked);});
await scenario(async f=>{
 const original=f.control;
 f.control=async(name,args)=>{const r=await original(name,args);if(name==='hr_control_commit')throw Error('response lost after commit');return r;};
 await assert.rejects(f.run());assert.equal(f.revision,1);assert.equal(f.acks,0);assert(f.locked);
 await assert.rejects(f.run());assert.equal(f.puts,1);
});
await scenario(async f=>{
 f.controlHook=async name=>name==='hr_control_read'?{...f.state(),revision:0}:undefined;
 await assert.rejects(f.run());assert.equal(f.acks,0);assert(f.locked);
});
await scenario(async f=>{
 let read=0;f.controlHook=async name=>{if(name==='hr_control_read' && ++read===2)return{...f.state(),runId:id(9)};};
 await assert.rejects(f.run());assert.equal(f.acks,0);assert(f.locked);
});
await scenario(async f=>{f.rows=[{...row(1),private_answer:'must reject'}];await assert.rejects(f.run());assert.equal(f.puts,0);assert(f.locked);});
await scenario(async f=>{f.rows=[row(1),row(1)];await assert.rejects(f.run());assert.equal(f.puts,0);});
await scenario(async f=>{
 f.rpcHook=async name=>{if(name==='hr_ledger_snapshot')return{format:1,project,receipts:f.rows};throw Error('ack outcome unknown');};
 await assert.rejects(f.run());assert(f.locked);assert.equal(f.finishes,0);
});
await scenario(async f=>{
 f.rpcHook=async name=>name==='hr_ledger_snapshot'?{format:1,project,receipts:f.rows}:{acknowledged:[]};
 await assert.rejects(f.run());assert(f.locked);
});
await scenario(async f=>{f.controlHook=async name=>{if(name==='hr_control_finish')throw Error('finish outcome unknown');};await assert.rejects(f.run());assert.equal(f.acks,1);assert(f.locked);});
await scenario(async f=>{const r=await Promise.allSettled([f.run(),f.run()]);assert.equal(r.filter(p=>p.status==='fulfilled').length,1);assert.equal(f.acks,1);});
for(const bad of ['dqffxflaoyarbxyiyhop','ppvircenkjizeiqdxphj','amduqhmgmeetaatwlmmt'])await scenario(async f=>{
 await assert.rejects(f.run({config:{...config,project:bad}}));assert.equal(f.events.length,0);
});
await scenario(async f=>{await assert.rejects(f.run({runMode:'PRODUCTION'}));assert.equal(f.events.length,0);});
let calls=0;
const client=createControlClient('amduqhmgmeetaatwlmmt','synthetic-key-'.repeat(4),async(url,options)=>{
 calls++;assert.equal(url,'https://amduqhmgmeetaatwlmmt.supabase.co/rest/v1/rpc/hr_control_read');
 assert.equal(options.redirect,'error');assert(options.signal instanceof AbortSignal);return new Response('{}');
});
assert.deepEqual(await client('hr_control_read',{}),{});
await assert.rejects(client('arbitrary_endpoint',{}));assert.equal(calls,1);
assert.throws(()=>createControlClient('dqffxflaoyarbxyiyhop','synthetic-key-'.repeat(4)));
const huge=createControlClient('amduqhmgmeetaatwlmmt','synthetic-key-'.repeat(4),async()=>new Response('x'.repeat(16385)));
await assert.rejects(huge('hr_control_read',{}));
console.log(`HR control cycle PASS: ${scenarios} fault/order/concurrency scenarios. Synthetic transports, not live cloud/restore.`);

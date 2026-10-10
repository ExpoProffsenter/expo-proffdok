import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {sealLedger} from './lib/hr-deletion-ledger.mjs';
import {runControlBootstrap,prepareControlBootstrap,createBootstrapClient} from './lib/hr-control-bootstrap.mjs';
const project='bootstrapqaonlyxxxxx';
const config={project,storeId:'store_synthetic',origin:'https://synthetic.private.blob.vercel-storage.com',
 token:'vercel_blob_rw_synthetic_fake',key:randomBytes(32).toString('hex')};
const otherRun='00000000-0000-4000-8000-000000000002';
const expected=sealLedger({format:1,project,generation:0,receipts:[]},project,config.key);
let scenarios=0;
async function scenario(work){
 let runId=null,status='staged',envelope=null;
 const f={events:[],putCount:0,controlHook:null,getHook:null,putHook:null,
  get locked(){return runId!==null;},get status(){return status;},
  get envelope(){return envelope;},set envelope(v){envelope=v;},
  state(){return {format:1,project,storeId:config.storeId,origin:config.origin,revision:0,runId,
   anchor:{hmac:expected.hmac,generation:0,storeId:config.storeId,project},bootstrapStatus:status,enabled:false};},
  async control(name,args){
   f.events.push(name);if(f.controlHook){const v=await f.controlHook(name,args);if(v!==undefined)return v;}
   assert.equal(args.p_hmac,expected.hmac);
   if(name==='hr_control_bootstrap_claim'){
    if(status!=='staged' || runId)throw Error('cannot claim');runId=args.p_run;status='writing';return f.state();
   }
   assert.equal(args.p_run,runId);
   if(name==='hr_control_bootstrap_commit'){assert.equal(status,'writing');status='verified';}
   return f.state();
  },
  async get(path,opts){
   f.events.push('get');assert.equal(opts.useCache,false);
   if(f.getHook){const v=await f.getHook(path,opts);if(v!==undefined)return v;}
   if(!envelope)return null;
   const bytes=Buffer.from(JSON.stringify(envelope));
   return {statusCode:200,blob:{pathname:path,url:config.origin+'/'+path,etag:'one',size:bytes.length},
    stream:new ReadableStream({start(c){c.enqueue(bytes);c.close();}})};
  },
  async put(path,body,opts){
   f.events.push('put');f.putCount++;
   assert.equal(opts.allowOverwrite,false);assert.equal(opts.addRandomSuffix,false);
   assert.equal(opts.access,'private');
   if(envelope)throw Error('exists');envelope=JSON.parse(body);
   if(f.putHook)return f.putHook(path,body,opts);
   return {pathname:path,url:config.origin+'/'+path};
  },
  run(overrides={}){return runControlBootstrap({sdk:{get:f.get,put:f.put},config,control:f.control,
   runMode:'ISOLATED_QA',...overrides});}
 };
 await work(f);scenarios++;
}
await scenario(async f=>{
 assert.deepEqual(await f.run(),{bootstrapVerified:true,bindingEnabled:false,locked:true});
 assert(f.locked);assert.equal(f.status,'verified');assert.equal(f.putCount,1);
 assert.deepEqual(f.events,['hr_control_bootstrap_claim','get','put','get','hr_control_bootstrap_read',
  'hr_control_bootstrap_commit','hr_control_bootstrap_read','get','hr_control_bootstrap_read']);
 await assert.rejects(f.run());assert.equal(f.putCount,1);
});
await scenario(async f=>{f.controlHook=async()=>{throw Error('missing or unprovisioned');};await assert.rejects(f.run());assert.equal(f.putCount,0);assert(!f.locked);});
await scenario(async f=>{f.envelope=expected;await assert.rejects(f.run());assert.equal(f.putCount,0);assert(f.locked);});
await scenario(async f=>{f.getHook=async()=>{throw Error('not authenticated');};await assert.rejects(f.run());assert.equal(f.putCount,0);assert(f.locked);});
await scenario(async f=>{f.getHook=async()=>({statusCode:404});await assert.rejects(f.run());assert.equal(f.putCount,0);});
await scenario(async f=>{f.putHook=async()=>{throw Error('response lost after actual synthetic write');};await assert.rejects(f.run());assert(f.envelope);assert(f.locked);assert.equal(f.status,'writing');await assert.rejects(f.run());assert.equal(f.putCount,1);});
await scenario(async f=>{f.putHook=async()=>({pathname:'wrong',url:config.origin+'/wrong'});await assert.rejects(f.run());assert.equal(f.status,'writing');});
await scenario(async f=>{let gets=0;f.getHook=async()=>++gets===2?null:undefined;await assert.rejects(f.run());assert(f.locked);assert.equal(f.status,'writing');});
await scenario(async f=>{let gets=0;f.getHook=async()=>{if(++gets===3)throw Error('final read failed');};await assert.rejects(f.run());assert.equal(f.status,'verified');assert(f.locked);});
for(const name of ['hr_control_bootstrap_read','hr_control_bootstrap_commit'])await scenario(async f=>{
 f.controlHook=async n=>{if(n===name)throw Error('provider text');};await assert.rejects(f.run());assert(f.locked);
});
await scenario(async f=>{const old=f.control;f.control=async(n,a)=>{const v=await old(n,a);if(n==='hr_control_bootstrap_commit')throw Error('commit reply lost');return v;};await assert.rejects(f.run());assert.equal(f.status,'verified');assert(f.locked);});
await scenario(async f=>{let reads=0;f.controlHook=async n=>n==='hr_control_bootstrap_read'&&++reads===2?{...f.state(),bootstrapStatus:'writing'}:undefined;await assert.rejects(f.run());assert(f.locked);});
for(const field of ['runId','enabled','hmac'])await scenario(async f=>{
 f.controlHook=async n=>{if(n==='hr_control_bootstrap_read'){const s=f.state();if(field==='runId')s.runId=otherRun;else if(field==='enabled')s.enabled=true;else s.anchor.hmac='0'.repeat(64);return s;}};
 await assert.rejects(f.run());assert(f.locked);assert.equal(f.status,'writing');
});
await scenario(async f=>{const r=await Promise.allSettled([f.run(),f.run()]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1);assert.equal(f.putCount,1);assert(f.locked);});
await scenario(async f=>{let gets=0;f.getHook=async()=>{if(++gets===1){f.envelope=expected;return null;}};await assert.rejects(f.run());assert.equal(f.status,'writing');assert(f.locked);});
for(const bad of ['dqffxflaoyarbxyiyhop','ppvircenkjizeiqdxphj','amduqhmgmeetaatwlmmt'])await scenario(async f=>{
 await assert.rejects(f.run({config:{...config,project:bad}}));assert.equal(f.events.length,0);
});
for(const overrides of [{runMode:'PRODUCTION'},{config:{...config,key:'bad'}},
 {config:{...config,token:'vercel_blob_rw_other_fake'}},{config:{...config,private_answer:'reject'}},
 {runId:'invalid'}])await scenario(async f=>{await assert.rejects(f.run(overrides));assert.equal(f.events.length,0);});
console.log(`HR control bootstrap PASS: ${scenarios} synthetic failure/order/concurrency scenarios. No live bootstrap or activation.`);
const plan=prepareControlBootstrap(config,'ISOLATED_QA');
assert.equal(plan.anchor.hmac,expected.hmac);assert(!JSON.stringify(plan).includes(config.key));
assert(!JSON.stringify(plan).includes(config.token));assert(!/on conflict|enabled=true/i.test(plan.stagingSql));
assert.throws(()=>prepareControlBootstrap(config,'PRODUCTION'));
const key='sb_secret_'+'synthetic'.repeat(4);let calls=0;
const client=createBootstrapClient(key,async(url,opts)=>{
 calls++;assert.equal(url,'https://amduqhmgmeetaatwlmmt.supabase.co/rest/v1/rpc/hr_control_bootstrap_read');
 assert.equal(opts.headers.apikey,key);assert(!('authorization' in opts.headers));
 assert.equal(opts.redirect,'error');assert(opts.signal instanceof AbortSignal);return new Response('{}');
});
assert.deepEqual(await client('hr_control_bootstrap_read',{}),{});
await assert.rejects(client('hr_control_claim',{}));assert.equal(calls,1);
for(const reply of [()=>new Response('provider-private-text',{status:403}),()=>new Response('x'.repeat(16385)),
 ()=>new Response('{'),()=>new Response(new Uint8Array([0xff])),()=>{throw Error('provider-secret');}]){
 const c=createBootstrapClient(key,async()=>reply());
 await assert.rejects(c('hr_control_bootstrap_read',{}),e=>e.message==='untrusted_hr_control_bootstrap');
}
assert.throws(()=>createBootstrapClient('sb_publishable_'+'x'.repeat(32)));
console.log('Bootstrap plan and pinned bounded service-only client PASS with synthetic HTTP; no keys printed.');

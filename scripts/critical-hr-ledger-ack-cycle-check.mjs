import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {randomBytes} from 'node:crypto';
import {sealLedger} from './lib/hr-deletion-ledger.mjs';
import {runLedgerAckCycle,createLedgerRpc} from './lib/hr-ledger-ack-cycle.mjs';
const project='ppvircenkjizeiqdxphj',key=randomBytes(32).toString('hex');
const config={project,key,storeId:'store_synthetic',origin:'https://synthetic.private.blob.vercel-storage.com',token:'vercel_blob_rw_synthetic_fake'};
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const row=n=>({id:id(n),company_id:id(1000),employee_id:id(n),user_id:id(n+2000),kind:'employment',through_revision:1,requested_at:'2026-10-10T16:00:00.000Z'});
let scenarios=0;
async function scenario(work){
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'hr-ack-cycle-'));await fs.chmod(root,0o700);
 let value=sealLedger({format:1,project,generation:0,receipts:[]},project,key),etag='v0',gets=0;
 const old={project,storeId:config.storeId,generation:0,hmac:value.hmac};
 await fs.writeFile(path.join(root,'anchor.json'),JSON.stringify(old)+'\n',{mode:0o600});
 const f={root,acks:0,puts:0,rows:[row(1)],old,hook:null,rpcHook:null,
  async sdkGet(p,o){gets++;assert.equal(o.useCache,false);
   const bytes=Buffer.from(JSON.stringify(value));
   const r={statusCode:200,stream:new ReadableStream({start(c){c.enqueue(bytes);c.close();}}),blob:{pathname:p,url:config.origin+'/'+p,etag,size:bytes.length}};
   return f.hook?f.hook(r,gets):r;},
  async sdkPut(p,b,o){assert.equal(o.ifMatch,etag);f.puts++;value=JSON.parse(b);etag+='n';return{pathname:p,url:config.origin+'/'+p};},
  async rpc(name,args){
   if(f.rpcHook)return f.rpcHook(name,args);
   if(name==='hr_ledger_snapshot')return{format:1,project,receipts:f.rows};
   // Actual freshly persisted anchor is already readable before every DB ack.
   const current=JSON.parse(await fs.readFile(path.join(root,'anchor.json'),'utf8'));
   assert.equal(current.generation,args.p_generation);assert.equal(current.hmac,args.p_hmac);
   f.acks++;return{acknowledged:args.p_receipts.map(r=>r.id)};
  },get value(){return value;},set value(v){value=v;},
  run(){return runLedgerAckCycle({sdk:{get:f.sdkGet,put:f.sdkPut},config,root,rpc:f.rpc});}
 };
 try{await work(f);scenarios++;}finally{await fs.rm(root,{recursive:true,force:true});}
}
await scenario(async f=>{assert.deepEqual(await f.run(),{verified:true,generation:1,acknowledged:1});assert.equal(f.acks,1);});
await scenario(async f=>{f.rows=Array.from({length:201},(_,i)=>row(i+1));assert.equal((await f.run()).acknowledged,201);assert.equal(f.acks,3);});
await scenario(async f=>{f.rows=[];assert.equal((await f.run()).acknowledged,0);assert.equal(f.acks,0);});
for(const getNumber of [1,2,3,4])await scenario(async f=>{
 f.hook=(r,n)=>n===getNumber?null:r;
 await assert.rejects(f.run());assert.equal(f.acks,0);
 if(getNumber<3)assert.equal(f.puts,0);
});
await scenario(async f=>{f.hook=(r,n)=>{if(n===2)throw Error('cloud unavailable');return r;};await assert.rejects(f.run());assert.equal(f.acks,0);});
await scenario(async f=>{f.rows=[{...row(1),private_answer:'must reject'}];await assert.rejects(f.run());assert.equal(f.acks,0);assert.equal(f.puts,0);});
await scenario(async f=>{f.rows=[row(1),row(1)];await assert.rejects(f.run());assert.equal(f.acks,0);});
await scenario(async f=>{await fs.chmod(path.join(f.root,'anchor.json'),0o644);await assert.rejects(f.run());assert.equal(f.puts,0);});
await scenario(async f=>{await fs.chmod(f.root,0o755);await assert.rejects(f.run());assert.equal(f.puts,0);});
await scenario(async f=>{await fs.rename(path.join(f.root,'anchor.json'),path.join(f.root,'real.json'));await fs.symlink('real.json',path.join(f.root,'anchor.json'));await assert.rejects(f.run());assert.equal(f.puts,0);});
await scenario(async f=>{await fs.writeFile(path.join(f.root,'.ack-cycle.lock'),'crashed',{mode:0o600});await assert.rejects(f.run());assert.equal(f.puts,0);});
await scenario(async f=>{
 f.hook=async(r,n)=>{if(n===3)await fs.writeFile(path.join(f.root,'anchor.json'),JSON.stringify({...f.old,generation:99}));return r;};
 await assert.rejects(f.run());assert.equal(f.puts,1);assert.equal(f.acks,0);
});
await scenario(async f=>{
 f.hook=async(r,n)=>{if(n===3){await fs.unlink(path.join(f.root,'anchor.json'));await fs.mkdir(path.join(f.root,'anchor.json'));}return r;};
 await assert.rejects(f.run());assert.equal(f.acks,0);
});
await scenario(async f=>{const results=await Promise.allSettled([f.run(),f.run()]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(f.acks,1);});
await scenario(async f=>{
 let failOnce=true;
 f.rpcHook=async(name,args)=>{
  if(name==='hr_ledger_snapshot')return{format:1,project,receipts:f.rows};
  if(failOnce){failOnce=false;throw Error('DB lost response');}
  f.acks++;return{acknowledged:args.p_receipts.map(r=>r.id)};
 };
 await assert.rejects(f.run());assert.equal(f.acks,0);
 assert.equal((await f.run()).acknowledged,1);assert.equal(f.acks,1);
});
await scenario(async f=>{f.rpcHook=async(name)=>name==='hr_ledger_snapshot'?{format:1,project,receipts:f.rows}:{acknowledged:[]};await assert.rejects(f.run());});
await scenario(async f=>{
 assert.equal((await f.run()).acknowledged,1);f.rows=[row(2)];await f.run();assert.deepEqual(f.value.payload.receipts.map(r=>r.id),[id(1),id(2)]);
});
let transportCalls=0;
const rpc=createLedgerRpc(project,'synthetic-server-key-'.repeat(3),async(url,o)=>{
 transportCalls++;assert.equal(url,`https://${project}.supabase.co/rest/v1/rpc/hr_ledger_snapshot`);
 assert.equal(o.redirect,'error');assert(o.signal instanceof AbortSignal);return new Response('{}');
});
assert.deepEqual(await rpc('hr_ledger_snapshot',{}),{});
await assert.rejects(rpc('arbitrary_endpoint',{}));assert.equal(transportCalls,1);
const broken=createLedgerRpc(project,'synthetic-server-key-'.repeat(3),async()=>new Response('private error details',{status:403}));
await assert.rejects(broken('hr_ledger_snapshot',{}),/hr_ledger_rpc_failed/);
console.log(`HR ledger ack cycle PASS: ${scenarios} fault/order/concurrency scenarios; bounded RPC contract.`);

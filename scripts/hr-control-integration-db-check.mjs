// Two separate PostgreSQL engines. Cloud/Auth/Storage adapters are synthetic.
// Exercises actual source H5b RPC + control SQL through the real operator modules.
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {prepareControlBootstrap,runControlBootstrap} from './lib/hr-control-bootstrap.mjs';
import {runControlLedgerAckCycle} from './lib/hr-control-ack-cycle.mjs';
const {PGlite}=await import(process.env.HR_PGLITE_PATH?pathToFileURL(process.env.HR_PGLITE_PATH).href:'@electric-sql/pglite');
let assertions=0;
const check=(value,label)=>{assert(value,label);assertions++;};
const project='integrationqaonlyxxx',storeId='store_synthetic';
const config={project,storeId,origin:'https://synthetic.private.blob.vercel-storage.com',
 token:'vercel_blob_rw_synthetic_fake',key:randomBytes(32).toString('hex')};
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const row=n=>({id:id(n),company_id:id(1000),employee_id:id(n),user_id:id(n+2000),
 kind:'employment',through_revision:1,requested_at:'2026-10-11T00:00:00.000Z'});
async function scenario(mode){
 const source=await PGlite.create(),controlDb=await PGlite.create();
 let envelope=null,etag=0,puts=0,acks=0;
 const scalar=async(db,sql,values=[])=>Object.values((await db.query(sql,values)).rows[0])[0];
 const call=async(db,name,args)=>{
  const signatures={hr_control_bootstrap_claim:['text','text','text','uuid','text'],
   hr_control_bootstrap_read:['text','text','text','uuid','text'],hr_control_bootstrap_commit:['text','text','text','uuid','text'],
   hr_control_claim:['text','text','text','uuid'],hr_control_read:['text','text','text','uuid'],
   hr_control_commit:['text','text','text','uuid','bigint','bigint','text'],hr_control_finish:['text','text','text','uuid','bigint'],
   hr_ledger_snapshot:['text','text'],hr_ledger_ack:['text','text','bigint','text','jsonb']};
  const types=signatures[name];assert(types);const values=Object.values(args).map(v=>Array.isArray(v)?JSON.stringify(v):v);
  assert.equal(types.length,values.length);
  await db.exec('set role service_role');
  try{return await scalar(db,`select public.${name}(${types.map((t,i)=>'$'+(i+1)+'::'+t).join(',')})`,values);}
  finally{await db.exec('reset role');}
 };
 const sdk={
  async get(path,options){
   check(options.useCache===false,'every integration cloud read uncached');
   if(!envelope)return null;
   const bytes=Buffer.from(JSON.stringify(envelope));
   return {statusCode:200,blob:{pathname:path,url:config.origin+'/'+path,etag:String(etag),size:bytes.length},
    stream:new ReadableStream({start(c){c.enqueue(bytes);c.close();}})};
  },
  async put(path,body,options){
   if(envelope){check(options.ifMatch===String(etag),'CAS expected current ETag');check(options.allowOverwrite===true,'union overwrite explicit');}
   else check(options.allowOverwrite===false,'bootstrap creates only');
   envelope=JSON.parse(body);etag++;puts++;
   if(mode==='cloud-response-loss'&&puts===2)throw Error('synthetic reply loss after write');
   return {pathname:path,url:config.origin+'/'+path};
  }
 };
 try{
  await source.exec(await fs.readFile('scripts/fixtures/hr-restore-platform.sql','utf8'));
  for(const name of ['20261009182551_hr_access_foundation.sql','20261009193953_hr_content_purge_foundation.sql',
   '20261009211209_hr_restore_reconcile_orphans.sql','20261010160924_hr_ledger_ack_gate.sql'])
   await source.exec(await fs.readFile('supabase/migrations/'+name,'utf8'));
  await controlDb.exec('create role anon;create role authenticated;create role service_role;grant usage on schema public to anon,authenticated,service_role;');
  for(const name of ['20261010203756_hr_control_checkpoint.sql','20261010232752_hr_control_bootstrap.sql'])
   await controlDb.exec(await fs.readFile('ops/hr-control/supabase/migrations/'+name,'utf8'));
  await controlDb.exec(prepareControlBootstrap(config,'ISOLATED_QA').stagingSql);
  check((await runControlBootstrap({sdk,config,control:(n,a)=>call(controlDb,n,a),runMode:'ISOLATED_QA'})).locked,'SQL bootstrap retains actual lock');
  check(await scalar(controlDb,'select not enabled and bootstrap_status=\'verified\' and run_id is not null from hr_control.checkpoints'),'bootstrap SQL remains disabled locked');
  // Explicit isolated fixture activation only; never execute this against a cloud project.
  await controlDb.exec('update hr_control.checkpoints set bootstrap_status=null,run_id=null,acquired_at=null,enabled=true;');
  await source.query('update hr_private.ledger_settings set enabled=true,project_ref=$1,store_id=$2',[project,storeId]);
  const a=row(2);await source.query("insert into hr_private.purge_receipts(id,company_id,employee_id,user_id,kind,through_revision,requested_at,state) values($1,$2,$3,$4,$5,$6,$7,'complete')",Object.values(a));
  check(await scalar(source,'select state from hr_private.purge_receipts')==='pending','source refuses unverified completion');
  await source.query('insert into hr_private.purge_objects(receipt_id,object_path) values($1,$2)',[a.id,`${a.company_id}/${a.employee_id}/${randomUUID()}`]);
  const control=async(n,args)=>{const result=await call(controlDb,n,args);
   if(mode==='commit-response-loss'&&n==='hr_control_commit')throw Error('synthetic loss after actual SQL commit');return result;};
  const rpc=async(n,args)=>{if(n==='hr_ledger_ack'){acks++;if(mode==='ack-response-loss'){
   await call(source,n,args);throw Error('synthetic loss after actual SQL ack');}}
   return call(source,n,args);};
  const cycle=()=>runControlLedgerAckCycle({sdk,config,control,rpc,runMode:'ISOLATED_QA',runId:randomUUID()});
  if(mode!=='success'){
   await assert.rejects(cycle());assertions++;
   check(await scalar(controlDb,'select run_id is not null from hr_control.checkpoints'),'unknown outcome durable SQL lock retained');
   check(await scalar(source,'select count(*)::int from hr_private.ledger_acknowledgments')===(mode==='ack-response-loss'?1:0),'actual ack count obeys failure boundary');
   check(await scalar(source,'select state from hr_private.purge_receipts')==='pending','pending bytes prevent complete after any failure');
   const before=puts;await assert.rejects(cycle());assertions++;
   check(puts===before,'actual SQL lock prevents second cloud write');
  }else{
   const first=await cycle();check(first.generation===1&&first.acknowledged===1,'actual H5b source/control ack integration');
   check(await scalar(source,'select state from hr_private.purge_receipts')==='pending','actual ack waits for unfinished synthetic file job');
   check(await scalar(source,'select count(*)::int from hr_private.ledger_acknowledgments')===1,'actual immutable ack stored');
   await source.exec('update hr_private.purge_worker_settings set enabled=true;');
   const job=await scalar(source,'select public.hr_purge_worker_reserve()');
   check(await scalar(source,'select public.hr_purge_worker_finish($1,$2,true)',[job.id,job.attempt]),'SQL file-job fixture finish');
   check(await scalar(source,'select state from hr_private.purge_receipts')==='complete','both gates finish source receipt');
   const lower=row(1);await source.query("insert into hr_private.purge_receipts(id,company_id,employee_id,user_id,kind,through_revision,requested_at,state) values($1,$2,$3,$4,$5,$6,$7,'pending')",Object.values(lower));
   const second=await cycle();check(second.generation===2&&second.acknowledged===2,'full snapshot includes later lower UUID');
   check(envelope.payload.receipts.length===2&&envelope.payload.receipts[0].id===lower.id,'cloud union preserves both receipts');
   check(await scalar(controlDb,'select revision=2 and generation=2 and run_id is null from hr_control.checkpoints'),'actual checkpoint advances and releases cycle lock');
   check(await scalar(source,'select bool_and(state=\'complete\') from hr_private.purge_receipts'),'actual source states complete');
   check(acks===2,'two real SQL ack batches');
  }
  check(await scalar(source,'select not content_enabled and restore_quarantined from hr_private.runtime_state'),'source HR remains closed');
 }finally{await source.close();await controlDb.close();}
}
try{
 for(const mode of ['success','cloud-response-loss','commit-response-loss','ack-response-loss'])await scenario(mode);
 console.log(`HR control/source integration PASS: ${assertions} PostgreSQL/order/failure assertions across two independent test engines. Cloud/Auth/Storage synthetic; no live or native integration claim.`);
}catch(error){
 console.error(JSON.stringify({ok:false,mode:'ISOLATED_SQL_INTEGRATION_QA',assertions,
  code:/^[0-9A-Z]{5}$/.test(error?.code)?error.code:'assertion_or_operator_rejected'}));process.exitCode=1;
}

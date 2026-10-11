// PostgreSQL engine with synthetic platform roles; not managed-cloud evidence.
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.HR_PGLITE_PATH?pathToFileURL(process.env.HR_PGLITE_PATH).href:'@electric-sql/pglite');
const db=await PGlite.create();let assertions=0;
const check=(v,label)=>{assert(v,label);assertions++;};
const denied=async(sql,code='42501')=>{await assert.rejects(db.query(sql),e=>e.code===code);assertions++;};
const p='bootstrapqaonlyxxxxx',st='store_synthetic',o='https://synthetic.private.blob.vercel-storage.com';
const a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002',h='a'.repeat(64);
const call=(name,run=a,digest=h)=>`select public.hr_control_bootstrap_${name}('${p}','${st}','${o}','${run}','${digest}') as result`;
try{
 await db.exec('create role anon;create role authenticated;create role service_role;grant usage on schema public to anon,authenticated,service_role;');
 for(const name of ['20261010203756_hr_control_checkpoint.sql','20261010232752_hr_control_bootstrap.sql'])
  await db.exec(await fs.readFile('ops/hr-control/supabase/migrations/'+name,'utf8'));
 // Retain the whole original control contract unchanged.
 const original=await db.exec(await fs.readFile('ops/hr-control/check.sql','utf8'));
 const originalAssertions=original.find(r=>r.rows[0]?.assertions)?.rows[0].assertions;
 check(originalAssertions===37,'all original 37 control assertions preserved');
 await denied(call('claim'));check((await db.query('select count(*)::int as n from hr_control.checkpoints')).rows[0].n===0,'missing not bootstrapped');
 for(const project of ['dqffxflaoyarbxyiyhop','ppvircenkjizeiqdxphj','amduqhmgmeetaatwlmmt'])
  await denied(`insert into hr_control.checkpoints(project_ref,store_id,origin,generation,hmac,bootstrap_status) values('${project}','${st}','${o}',0,'${h}','staged')`,'23514');
 await db.query(`insert into hr_control.checkpoints(project_ref,store_id,origin,generation,hmac,bootstrap_status) values('${p}','${st}','${o}',0,'${h}','staged')`);
 await denied(call('claim',a,'b'.repeat(64)));await denied(call('claim').replace(st,'store_wrong'));
 await denied(call('claim').replace(o,'https://wrong.private.blob.vercel-storage.com'));
 await denied(`update hr_control.checkpoints set enabled=true where project_ref='${p}'`,'23514');
 for(const role of ['anon','authenticated','service_role']){
  const r=(await db.query(`select has_table_privilege('${role}','hr_control.checkpoints','select,insert,update,delete') as table_access,has_schema_privilege('${role}','hr_control','usage') as schema_access`)).rows[0];
  check(!r.table_access&&!r.schema_access,role+' cannot access table/helpers');
  for(const fn of ['claim','read','commit']){
   check((await db.query(`select has_function_privilege('${role}','public.hr_control_bootstrap_${fn}(text,text,text,uuid,text)','execute') as allowed`)).rows[0].allowed===(role==='service_role'),role+' RPC ACL '+fn);
   if(role!=='service_role'){await db.exec('set role '+role);await denied(call(fn));await db.exec('reset role');}
  }
 }
 await db.exec('set role service_role');
 check((await db.query(call('claim'))).rows[0].result.bootstrapStatus==='writing','actual service claim');
 await denied(call('claim'));await denied(call('claim',b));await denied(call('read',b));await denied(call('commit',b));
 await denied(call('commit',a,'b'.repeat(64)));
 check((await db.query(call('read'))).rows[0].result.enabled===false,'stays disabled');
 check((await db.query(call('commit'))).rows[0].result.bootstrapStatus==='verified','actual commit');
 const fresh=(await db.query(call('read'))).rows[0].result;
 check(fresh.bootstrapStatus==='verified'&&!fresh.enabled&&fresh.runId===a&&fresh.anchor.hmac===h,'durable separate read remains locked disabled exact');
 await denied(call('commit'),'40001');await denied(call('claim'));await denied(call('read',b));
 await denied(`select public.hr_control_claim('${p}','${st}','${o}','${b}')`);
 await denied(`select public.hr_control_finish('${p}','${st}','${o}','${a}',0)`);
 await db.exec('reset role');
 await db.query(`update hr_control.checkpoints set acquired_at=now()-interval '1 year' where project_ref='${p}'`);
 await denied(call('claim',b));
 check((await db.query(`select run_id='${a}'::uuid as locked from hr_control.checkpoints where project_ref='${p}'`)).rows[0].locked,'old verified lock not expired');
 check((await db.query(`select count(*)::int as n from pg_proc where proname like 'hr_control_bootstrap_%' and not ('search_path=""'=any(proconfig))`)).rows[0].n===0,'empty search paths');
 check((await db.query(`select relrowsecurity as rls from pg_class where oid='hr_control.checkpoints'::regclass`)).rows[0].rls,'RLS remains enabled');
 await db.exec('truncate hr_control.checkpoints;'); // Only own disposable database.
 const rollback=await db.exec(await fs.readFile('ops/hr-control/bootstrap-check.sql','utf8'));
 const rollbackAssertions=rollback.find(r=>r.rows[0]?.bootstrap_assertions)?.rows[0].bootstrap_assertions;
 check(rollbackAssertions===29,'29 complete rollback SQL checks');
 check((await db.query('select count(*)::int as n from hr_control.checkpoints')).rows[0].n===0,'SQL fixture rolled back empty');
 console.log(`HR bootstrap DB PASS: ${assertions} new PostgreSQL assertions, ${rollbackAssertions} rollback SQL checks; ${originalAssertions} original assertions retained. Synthetic roles; no live activation.`);
}finally{await db.close();}

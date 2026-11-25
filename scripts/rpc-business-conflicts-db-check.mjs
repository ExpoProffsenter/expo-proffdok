import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {isRpcConflict} from '../src/modules/app/rpcErrors.mjs';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'@electric-sql/pglite');
const db=await PGlite.create();let checks=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const fixture=JSON.parse(await fs.readFile('scripts/fixtures/rpc-business-conflicts-baseline.json','utf8'));
const migration=await fs.readFile('supabase/migrations/20261022214307_rpc_business_conflicts_http409.sql','utf8');
const healthSql=await fs.readFile('scripts/ops/rpc-retry-health.sql','utf8');
const definition=async signature=>(await db.query('select pg_get_functiondef(to_regprocedure($1)) as definition',[signature])).rows[0].definition;
const metadata=async signature=>(await db.query('select proacl,proowner,prosecdef,proconfig from pg_proc where oid=to_regprocedure($1)',[signature])).rows[0];
const rewrite=s=>s.replace(/(errcode\s*=\s*)'40001'/gi,"$1'PT409'").replace("or sqlstate '40001' or sqlstate '55000'","or sqlstate '40001' or sqlstate 'PT409' or sqlstate '55000'");
try {
 await db.exec('create role anon;create role authenticated;create role service_role;create schema company_admin_private;set check_function_bodies=off;');
 for(const f of fixture.functions){
  await db.exec(f.definition);
  await db.exec('revoke all on function '+f.signature+' from public,anon,authenticated,service_role');
  for(const acl of f.acl.slice(1,-1).split(',')){const role=acl.split('=')[0]||'public';await db.exec('grant execute on function '+f.signature+' to '+role);}
  eq((await db.query('select md5(pg_get_functiondef(to_regprocedure($1))) as hash',[f.signature])).rows[0].hash,f.definition_md5,'audited definition matches PostgreSQL fixture');
 }
 eq((await db.query(healthSql)).rows[0].manually_retrying_functions,46,'operator health check finds every baseline function, including semicolons inside messages');
 const before=new Map();for(const f of fixture.functions)before.set(f.signature,await metadata(f.signature));
 for(const change of ['alter function public.company_admin_set_role(uuid,uuid,text,text) set statement_timeout=1234','drop function public.company_admin_set_role(uuid,uuid,text,text)']){
  await db.exec('begin;'+change);
  await assert.rejects(()=>db.exec(migration),/audited function|Audited function/);checks++;
  await db.exec('rollback');
  eq(await definition(fixture.functions[0].signature),fixture.functions[0].definition,'failed migration leaves first function untouched');
 }
 await db.exec(migration);
 eq((await db.query(healthSql)).rows[0].manually_retrying_functions,0,'operator health check sees no manual retries after exact migration');
 let raises=0;
 for(const f of fixture.functions){
  const actual=await definition(f.signature);
  eq(actual,rewrite(f.definition),'only approved error-code/handler transformation: '+f.signature);
  eq(await metadata(f.signature),before.get(f.signature),'grants, owner, definer and settings preserved: '+f.signature);
  eq(/errcode\s*=\s*'40001'/i.test(actual),false,'no retryable business raise remains');
  // Execute the exact changed RAISE statements with writes on both sides.
  for(const match of actual.matchAll(/raise exception\s+'(?:''|[^'])*'\s+using\s+errcode\s*=\s*'PT409'\s*;/gi)){
   await db.exec('create table if not exists public.qa_effects(value int);create or replace function public.qa_probe(reject boolean) returns boolean language plpgsql as $$begin insert into public.qa_effects values(1);if reject then '+match[0]+'end if;insert into public.qa_effects values(2);return true;end$$;');
   const count=async()=>(await db.query('select count(*)::int n from public.qa_effects')).rows[0].n;
   const n=await count();await assert.rejects(()=>db.query('select public.qa_probe(true)'),e=>e.code==='PT409');checks++;
   eq(await count(),n,'conflict rolls back all effects');
   eq((await db.query('select public.qa_probe(false) as ok')).rows[0].ok,true,'non-conflict proceeds');
   eq(await count(),n+2,'non-conflict commits both effects');raises++;
  }
 }
 eq(raises,77,'every audited business raise executed');
 const stock=await definition('public.stocktake_record(uuid,uuid,uuid,jsonb)');
 eq(stock.includes("or sqlstate '40001' or sqlstate 'PT409' or sqlstate '55000'"),true,'stocktake keeps genuine serialization handling and structured conflict response');
 for(const code of ['PT409','40001'])eq(isRpcConflict({code}),true,'new and staged legacy conflicts recognized');
 for(const error of [null,{}, {code:'42501'},{code:'NETWORK'},{code:'40P01'}])eq(isRpcConflict(error),false,'unrelated error is not a business conflict');
 await assert.rejects(()=>db.exec(migration),/Audited function changed/);checks++;
 console.log(`PASS RPC business conflicts: ${checks} assertions; 46 exact definitions, all 77 raise paths, atomic rollback, valid path, grants and fail-closed drift/missing/reapply checks.`);
}finally{await db.close();}

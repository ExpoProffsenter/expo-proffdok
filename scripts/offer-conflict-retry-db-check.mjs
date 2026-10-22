import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'@electric-sql/pglite');
const db=await PGlite.create();let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
try {
 await db.exec(`create table public.sales_offers(public_token uuid primary key,active_version_id uuid);create table public.qa_delegate_calls(payload jsonb);
 create function public.accept_sales_offer(token uuid,accepted_name text,selected_options jsonb) returns jsonb language plpgsql as $$begin insert into public.qa_delegate_calls values(jsonb_build_object('token',token,'name',accepted_name,'options',selected_options));return jsonb_build_object('status','accepted','options',selected_options);end$$;
 create function public.accept_sales_offer_quantities(token uuid,accepted_name text,selected_options jsonb,expected_version_id uuid) returns jsonb language plpgsql security definer set search_path to 'public','pg_temp' as $$declare current_version uuid;begin
 select active_version_id into current_version from public.sales_offers where public_token=token for update;
 if not found then raise exception 'Offer not found' using errcode = 'P0002';end if;
 if expected_version_id is null or current_version is distinct from expected_version_id then raise exception 'Tilbudet er oppdatert. Last inn siden på nytt og kontroller tilbudet før aksept.' using errcode = '40001';end if;
 return public.accept_sales_offer(token,accepted_name,selected_options);end$$;`);
 const token='30000000-0000-4000-8000-000000000001',version='30000000-0000-4000-8000-000000000002',old='30000000-0000-4000-8000-000000000003';
 await db.query('insert into public.sales_offers values($1,$2)',[token,version]);
 const definition=async()=> (await db.query("select pg_get_functiondef('public.accept_sales_offer_quantities(uuid,text,jsonb,uuid)'::regprocedure) d")).rows[0].d;
 const before=await definition();await db.exec(await fs.readFile('supabase/migrations/20261022211143_offer_conflict_no_serialization_retry.sql','utf8'));const after=await definition();
 eq(after,before.replace("errcode = '40001'","errcode = 'PT409'"),'only error code changes; guard, definer, search_path and delegate preserved');
 const rpc=async(t=token,v=version,options=[])=> (await db.query('select public.accept_sales_offer_quantities($1,$2,$3,$4) d',[t,'QA',options,v])).rows[0].d;
 for(const v of [null,old]) {let error;try{await rpc(token,v);}catch(e){error=e;}eq(error?.code,'PT409','business conflict returns HTTP 409 without transaction retry');eq((await db.query('select count(*)::int n from public.qa_delegate_calls')).rows[0].n,0,'rejected versions never accept');}
 let missing;try{await rpc(old,version);}catch(e){missing=e;}eq(missing?.code,'P0002','unknown token remains denied');
 const options=[{id:'qa-option',quantity:4}];eq((await rpc(token,version,options)).options,options,'valid version and quantities still delegated');eq((await db.query('select count(*)::int n from public.qa_delegate_calls')).rows[0].n,1,'one valid acceptance');
 eq((await db.query('select active_version_id from public.sales_offers')).rows[0].active_version_id,version,'active version unchanged');
 console.log('PASS offer conflict retry DB: '+checks+' assertions; exact one-code change, null/stale/unknown denial, valid quantity acceptance and unchanged version guard.');
}finally{await db.close();}

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {PGlite}=await import(process.env.HR_PGLITE_PATH || '@electric-sql/pglite');
const db=await PGlite.create();
const id=n=>`40000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
let checks=0; const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
try {
 await db.exec(`create role anon; create role authenticated; create schema auth;
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('qa.user',true),'')::uuid$$;
 create function public.resolve_sales_company_scope() returns uuid language sql as $$select nullif(current_setting('qa.company',true),'')::uuid$$;
 create function public.resolve_sales_support_company_scope(uuid) returns uuid language plpgsql as $$begin if $1 is distinct from public.resolve_sales_company_scope() then raise exception 'Denied' using errcode='42501';end if;return $1;end$$;
 create table sales_requests(company_id uuid,request_ref text,status text,archived_at timestamptz,updated_at timestamptz,created_at timestamptz,created_by uuid,created_by_name text,list_payload jsonb);
 create table sales_offers(id uuid,company_id uuid,request_ref text,status text,accepted_at timestamptz,declined_at timestamptz,updated_at timestamptz,created_at timestamptz,active_version_id uuid);
 create table sales_offer_versions(id uuid,offer_id uuid,version_number int,created_at timestamptz);
 create table sales_offer_follow_up_notifications(company_id uuid,request_ref text,status text,sent_at timestamptz,offer_version_id uuid,reminder_number int,source_email_sent_at timestamptz);
 grant usage on schema auth to authenticated;`);
 const original=await fs.readFile('supabase/migrations/20260915134500_fase42i_sales_list_projection.sql','utf8');
 await db.exec(original.slice(original.indexOf('create or replace function public.list_sales_request_summaries(')));
 for(const [n,status] of [[1,'Tilbud'],[2,'Befaring'],[3,'Akseptert'],[4,'Avvist'],[5,'Aktivert']]) {
  await db.query('insert into sales_requests values($1,$2,$3,null,$4,$5,$6,$7,$8)',[id(1),'case'+n,status,'2026-11-25','2026-01-01',id(10),'QA',JSON.stringify({status,offerEmailSentAt:'2026-11-20T00:00:00Z',offerEmailVersionNumber:1})]);
 }
 await db.query("insert into sales_requests values($1,'foreign','Tilbud',null,now(),now(),null,'Other','{}')",[id(2)]);
 await db.query("insert into sales_offers values($1,$2,'case1','sent',null,null,'2026-11-21','2026-11-01',$3)",[id(11),id(1),id(12)]);
 await db.query("insert into sales_offer_versions values($1,$2,1,'2026-11-17T23:30:00Z')",[id(12),id(11)]);
 await db.query("insert into sales_offer_follow_up_notifications values($1,'case1','sent','2026-11-24',$2,1,'2026-11-20')",[id(1),id(12)]);
 await db.exec(`select set_config('qa.user','${id(10)}',false); select set_config('qa.company','${id(1)}',false);set role authenticated`);
 const before=(await db.query('select * from list_sales_request_summaries()')).rows;
 await db.exec('reset role');
 await db.exec(await fs.readFile('supabase/migrations/20261125124710_sales_offer_summary_date.sql','utf8'));
 await db.exec('set role authenticated');
 const after=(await db.query('select * from list_sales_request_summaries()')).rows;
 eq(after.length,5,'foreign company is excluded');
 eq(after.map(r=>{const {offerPublishedAt,...payload}=r.payload;return {...r,payload};}),before,'all previous projections and order remain identical');
 eq(Date.parse(after.find(r=>r.request_ref==='case1').payload.offerPublishedAt),Date.parse('2026-11-17T23:30:00Z'),'active version date, not send/reminder/update date');
 eq(after.find(r=>r.request_ref==='case2').payload.offerPublishedAt,undefined,'no invented date for unpublished inquiry');
 await assert.rejects(()=>db.query('select * from list_sales_request_summaries($1)',[id(2)]),e=>e.code==='42501');checks++;
 await db.exec("reset role;select set_config('qa.user','',false);set role authenticated");
 await assert.rejects(()=>db.query('select * from list_sales_request_summaries()'),e=>e.code==='42501');checks++;
 await db.exec('reset role;set role anon');
 await assert.rejects(()=>db.query('select * from list_sales_request_summaries()'),e=>e.code==='42501');checks++;
 console.log(`PASS offer summary date: ${checks} PostgreSQL checks; scope, no writes, old projection parity, real version date and anon denial`);
} finally {await db.close();}

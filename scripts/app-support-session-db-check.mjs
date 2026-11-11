import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.HR_PGLITE_PATH||'@electric-sql/pglite');
const db=new PGlite();let checks=0;
const id=n=>`81000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const [actor,target,other,firm,foreign,login,otherLogin]=[1,2,3,4,5,6,7].map(id);
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const denied=async(fn,label)=>{await assert.rejects(fn,e=>['42501','22023','PT409'].includes(e.code),label);checks++;};
const claim=async(user,session=login)=>{await db.query("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({sub:user,role:'authenticated',session_id:session})]);};
const cmd=async(action,t=null,c=null,s=null)=>(await db.query('select public.app_support_session($1,$2,$3,$4) result',[action,t,c,s])).rows[0].result;
try{
await db.exec(`create role anon;create role authenticated;create role service_role;
create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
create table auth.sessions(id uuid primary key,user_id uuid);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claims',true)::jsonb->>'sub','')::uuid$$;
grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
create table public.profiles(id uuid primary key,email text,approved boolean,deactivated boolean,system_role text);
create table public.sales_company_scopes(id uuid primary key,display_name text);
create table public.sales_company_memberships(user_id uuid,company_id uuid);
insert into auth.users(id,email) values('${actor}','actor@example.invalid'),('${target}','target@example.invalid'),('${other}','other@example.invalid');
insert into auth.sessions values('${login}','${actor}'),('${otherLogin}','${actor}');
insert into public.profiles values('${actor}','actor@example.invalid',true,false,'systemadmin'),('${target}','target@example.invalid',true,false,'user'),('${other}','other@example.invalid',true,false,'user');
insert into public.sales_company_scopes values('${firm}','Firma A'),('${foreign}','Firma B');
insert into public.sales_company_memberships values('${target}','${firm}'),('${other}','${foreign}');`);
await db.exec(await fs.readFile('supabase/migrations/20261111182756_app_support_sessions.sql','utf8'));
await claim(actor);await db.exec('set role authenticated');
await denied(()=>cmd('start',target,firm),'disabled by default');
await db.exec('reset role;update app_support_private.settings set enabled=true;set role authenticated');
await claim(target);await denied(()=>cmd('start',other,foreign),'customer cannot start support');
await claim(actor);await denied(()=>cmd('start',target,foreign),'foreign company denied');
await denied(()=>cmd('start',actor,firm),'self impersonation denied');
await claim(actor,id(99));await denied(()=>cmd('start',target,firm),'missing auth session denied');
await claim(actor);const session=await cmd('start',target,firm);
eq(session.target_user_id,target,'actual selected user');eq(session.actor_id,actor,'actor retained');eq(session.company_id,firm,'company retained');eq(session.capabilities,{read:true,create:true,update:true,delete:false},'editing without deletion');
eq(session.target_user.email,'target@example.invalid','safe identity for existing UI');
eq((await cmd('get',null,null,session.id)).id,session.id,'refresh keeps session');
await denied(()=>cmd('start',other,foreign),'concurrent tab cannot silently replace target');
await claim(actor,otherLogin);await denied(()=>cmd('get',null,null,session.id),'session belongs to original actor login');
await claim(actor);await db.exec(`reset role;update public.profiles set deactivated=true where id='${target}';set role authenticated`);
await denied(()=>cmd('get',null,null,session.id),'fresh target revocation');
eq(await cmd('end',null,null,session.id),{ended:true},'exit still works after target revocation');
await denied(()=>cmd('get',null,null,session.id),'ended session rejected');
await db.exec(`reset role;update public.profiles set deactivated=false where id='${target}';set role authenticated`);
const next=await cmd('start',target,firm);
await db.exec(`reset role;delete from public.sales_company_memberships where user_id='${target}';set role authenticated`);
await denied(()=>cmd('get',null,null,next.id),'fresh company membership required');
await cmd('end',null,null,next.id);
await assert.rejects(()=>db.query('select * from app_support_private.audit'));checks++;
await assert.rejects(()=>db.query("update app_support_private.settings set enabled=true"));checks++;
await db.exec('reset role');
eq(Number((await db.query('select count(*) n from app_support_private.audit')).rows[0].n),4,'start/end audit committed');
const removes=async(a,b)=>(await db.query('select app_support_private.removes_content($1,$2) x',[JSON.stringify(a),JSON.stringify(b)])).rows[0].x;
for(const [before,after,expected,label] of [
 [{lines:[{id:'a',price:10}]},{lines:[{id:'a',price:20}]},false,'edit retained line'],
 [{lines:[{id:'a'}]},{lines:[{id:'a'},{id:'b'}]},false,'add line'],
 [{lines:[{id:'a'},{id:'b'}]},{lines:[{id:'b'},{id:'a'}]},false,'reorder'],
 [{lines:[{id:'a'},{id:'b'}]},{lines:[{id:'a'}]},true,'remove line'],
 [{lines:[{id:'a'}]},{lines:[{id:'b'}]},true,'replace line ID'],
 [{files:[{path:'a.pdf'}]},{files:[{path:'b.pdf'}]},true,'replace file'],
 [{nested:{lines:[{id:'a'}]}},{nested:{lines:[]}},true,'nested delete'],
 [{archived_at:null},{archived_at:'2026-11-11'},true,'soft deletion'],
 [{deleted:false},{deleted:true},true,'soft delete flag'],
 [{name:'old'},{name:'new'},false,'ordinary field edit'],
 [{name:'old'}, {},true,'field removal'],
 [{name:'old'},{name:'old',deleted:true},true,'new soft-delete flag'],
 [{name:'old'},{name:'old',deleted_at:'2026-11-11'},true,'new deletion timestamp'],
 [{status:'active'},{status:'deleted'},true,'soft deletion via status'],
 [{status:'draft'},{status:'completed'},false,'ordinary status change'],
 [[{id:'a'},{id:'a'}],[{id:'a'},{id:'b'}],true,'duplicate identity cannot cover removed item'],
 [['a.pdf','b.pdf'],['b.pdf','a.pdf'],false,'scalar file paths reorder'],
 [['a.pdf','a.pdf'],['a.pdf','b.pdf'],true,'scalar file paths cannot be replaced'],
 [[{id:'a',path:'a.pdf'}],[{id:'a',path:'b.pdf'}],true,'stable ID does not permit file replacement'],
 ])eq(await removes(before,after),expected,label);
await db.exec(`insert into public.sales_company_memberships values('${target}','${firm}');
create function public.current_active_company_scope_id() returns uuid language sql stable security definer as $$select company_id from public.sales_company_memberships where user_id=auth.uid() limit 1$$;
create table public.support_qa_records(id uuid primary key,user_id uuid,company_id uuid,payload jsonb);
alter table public.support_qa_records enable row level security;
create policy mine on public.support_qa_records to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.support_qa_records to authenticated;
insert into public.support_qa_records values('${id(20)}','${target}','${firm}','{"lines":[{"id":"line-a","price":10}],"publicToken":"private-link"}'),('${id(21)}','${other}','${foreign}','{}');
create function public.support_qa_remove() returns void language sql security definer as $$delete from public.support_qa_records where id='${id(20)}'$$;
`);
await db.exec(await fs.readFile('supabase/migrations/20261111183233_app_support_write_gateway.sql','utf8'));
await db.exec(await fs.readFile('supabase/migrations/20261111194441_app_support_canonical_write_validation.sql','utf8'));
await claim(actor);await db.exec('set role authenticated');
const writeSession=await cmd('start',target,firm);await db.exec('reset role');
const scoped=async(sql,{prepare=true,session=writeSession.id}={})=>{
 await db.exec('begin;set local role authenticated');
 try{
  await db.query("select set_config('request.jwt.claims',$1,true),set_config('request.headers',$2,true),set_config('request.path','/rpc/native_action',true),set_config('request.method','POST',true)",[JSON.stringify({sub:actor,session_id:login,role:'authenticated'}),JSON.stringify({'x-expo-support-session':session})]);
  if(prepare)await db.query('select public.app_support_prepare_request()');
  const result=await db.query(sql);await db.exec('commit');return result;
 }catch(e){await db.exec('rollback');throw e;}
};
await denied(()=>scoped('select 1'),'transport disabled even when session feature enabled');
await db.exec('update app_support_private.settings set transport_ready=true');
eq((await scoped('select auth.uid() id')).rows[0].id,target,'native request uses target rights, not admin rights');
eq((await scoped('select public.app_support_context() context')).rows[0].context.target_user_id,target,'bootstrap confirms target via server hook');
await denied(()=>scoped('select public.app_support_context()', {prepare:false}),'bootstrap cannot confirm context without installed hook');
eq((await scoped('select id from public.support_qa_records')).rows.map(x=>x.id),[id(20)],'native RLS excludes foreign user');
await scoped(`update public.support_qa_records set payload=jsonb_set(payload,'{lines,0,price}','20') where id='${id(20)}'`);
const audit=(await db.query("select * from app_support_private.audit where action='update' order by id desc limit 1")).rows[0];
eq(audit.actor_id,actor,'audit records actual support actor');eq(audit.target_user_id,target,'audit records target');eq(audit.before_value.payload.publicToken,'[redacted]','secret links not duplicated into audit');eq(audit.after_value.payload.lines[0].price,20,'audit records change');
await scoped(`insert into public.support_qa_records values('${id(22)}',auth.uid(),'${firm}','{}')`);
eq((await db.query(`select user_id from public.support_qa_records where id='${id(22)}'`)).rows[0].user_id,target,'creation owned by target');
await denied(()=>scoped(`delete from public.support_qa_records where id='${id(20)}'`),'direct DELETE blocked');
await denied(()=>scoped('select public.support_qa_remove()'),'SECURITY DEFINER delete blocked by trigger');
await db.exec(`create function public.support_qa_truncate() returns void language sql security definer as $$truncate public.support_qa_records$$;`);
await denied(()=>scoped('select public.support_qa_truncate()'),'SECURITY DEFINER truncate blocked');
await denied(()=>scoped(`update public.support_qa_records set payload='{"lines":[],"publicToken":"private-link"}' where id='${id(20)}'`),'JSON line deletion blocked');
await denied(()=>scoped(`update public.support_qa_records set company_id='${foreign}' where id='${id(20)}'`),'company reassignment blocked');
await denied(()=>scoped(`insert into public.support_qa_records values('${id(23)}','${actor}','${firm}','{}')`,{prepare:false}),'missing request setup cannot write with support header');
eq((await db.query(`select payload->'lines' lines from public.support_qa_records where id='${id(20)}'`)).rows[0].lines,[{id:'line-a',price:20}],'blocked deletion preserved record');
// Reproduce native Sales upsert: INSERT normalization strips a binding field,
// then UPDATE restores its canonical value before persistence.
await db.exec(`create function public.support_qa_mirror() returns trigger language plpgsql as $$begin
 if tg_op='INSERT' then new.payload:=new.payload-'handler';
 elsif old.payload ? 'handler' then new.payload:=new.payload||jsonb_build_object('handler',old.payload->'handler'); end if;
 return new; end$$;
create trigger support_qa_mirror before insert or update on public.support_qa_records for each row execute function public.support_qa_mirror();
update public.support_qa_records set payload=payload||'{"handler":"canonical"}' where id='${id(20)}';`);
await scoped(`insert into public.support_qa_records values('${id(20)}',auth.uid(),'${firm}','{"handler":"canonical","lines":[{"id":"line-a","price":25}],"publicToken":"private-link"}') on conflict(id) do update set payload=excluded.payload`);
eq((await db.query(`select payload->>'handler' handler,payload->'lines' lines from public.support_qa_records where id='${id(20)}'`)).rows[0],{handler:'canonical',lines:[{id:'line-a',price:25}]},'canonical upsert edits persist after binding normalization');
eq((await db.query("select action,after_value->'payload'->>'handler' handler from app_support_private.audit where resource='public.support_qa_records' order by id desc limit 1")).rows[0],{action:'update',handler:'canonical'},'audit describes committed update and canonical binding');
await denied(()=>scoped(`insert into public.support_qa_records values('${id(20)}',auth.uid(),'${firm}','{"handler":"canonical","lines":[],"publicToken":"private-link"}') on conflict(id) do update set payload=excluded.payload`),'upsert still cannot delete nested lines');
eq((await db.query(`select payload->'lines' lines from public.support_qa_records where id='${id(20)}'`)).rows[0].lines,[{id:'line-a',price:25}],'AFTER rejection rolls back destructive upsert');
// Storage requests do not execute PostgREST's pre-request hook.
await db.exec(`create schema storage;
create table storage.objects(id uuid primary key,bucket_id text,name text,owner_id uuid);
alter table storage.objects enable row level security;
grant usage on schema storage to authenticated,anon;
grant select,insert,update,delete on storage.objects to authenticated;
grant select on storage.objects to anon;
create policy private_files on storage.objects to authenticated
 using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy public_files on storage.objects for select to anon using(bucket_id='public');
insert into storage.objects values('${id(30)}','private','target.pdf','${target}'),('${id(31)}','private','foreign.pdf','${other}'),('${id(32)}','private','actor.pdf','${actor}');`);
await db.exec(await fs.readFile('supabase/migrations/20261111190543_app_support_storage_context.sql','utf8'));
eq((await scoped('select name from storage.objects order by name',{prepare:false})).rows.map(x=>x.name),['target.pdf'],'Storage original policy evaluates target identity without Data API hook');
await scoped(`insert into storage.objects values('${id(33)}','private','new.pdf','${target}')`,{prepare:false});
eq((await scoped('select name from storage.objects order by name',{prepare:false})).rows.map(x=>x.name),['new.pdf','target.pdf'],'new file uses customer permissions');
await denied(()=>scoped(`insert into storage.objects values('${id(34)}','private','wrong.pdf','${other}')`,{prepare:false}),'cannot upload file for other user');
await scoped(`update storage.objects set name='replacement.pdf' where id='${id(30)}'`,{prepare:false});
await scoped(`delete from storage.objects where id='${id(30)}'`,{prepare:false});
eq((await db.query(`select name from storage.objects where id='${id(30)}'`)).rows[0].name,'target.pdf','Storage replacement/deletion fenced even with original ALL policy');
eq((await scoped('select public.app_support_prepare_request(),public.app_support_prepare_request(),auth.uid() id')).rows[0].id,target,'repeated setup is idempotent');
await claim(target);await db.exec('set role authenticated');
eq((await db.query('select name from storage.objects order by name')).rows.map(x=>x.name),['new.pdf','target.pdf'],'ordinary customer file access unchanged');
await db.query(`update storage.objects set name='normal.pdf' where id='${id(33)}'`);
await db.query(`delete from storage.objects where id='${id(33)}'`);await db.exec('reset role');
eq((await db.query(`select count(*) n from storage.objects where id='${id(33)}'`)).rows[0].n,0,'ordinary file update/delete unchanged');
await db.exec(`update app_support_private.sessions set expires_at=clock_timestamp()-interval '1 second' where id='${writeSession.id}'`);
await denied(()=>scoped('select 1'),'expired session rejected');
await claim(target);await db.exec('set role authenticated');await db.query(`update public.support_qa_records set payload='{"normal":true}' where id='${id(22)}'`);await db.query(`delete from public.support_qa_records where id='${id(22)}'`);await db.exec('reset role');
eq((await db.query(`select count(*) n from public.support_qa_records where id='${id(22)}'`)).rows[0].n,0,'normal customer update/delete unchanged outside support');
await db.exec('truncate public.support_qa_records');
eq((await db.query('select count(*) n from public.support_qa_records')).rows[0].n,0,'ordinary truncate outside support retains behavior');
await db.exec('set role anon');await denied(()=>cmd('get',null,null,next.id),'anonymous denied');
console.log(`app-support-session-db: ${checks} PASS – real SQL, sessions, actor/target/company boundary, revocation and deletion classification`);
}finally{await db.close();}

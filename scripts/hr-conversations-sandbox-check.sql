-- HR templates: synthetic identities only. Roll back all fixtures.
begin;
set local statement_timeout='25s';
set local lock_timeout='2s';
create function pg_temp.hr_assert(ok boolean,label text) returns void language plpgsql as $$begin
 if ok is distinct from true then raise exception 'HR QA: %',label; end if;
 perform set_config('hr.qa.count',(coalesce(nullif(current_setting('hr.qa.count',true),''),'0')::integer+1)::text,true);
end$$;
create function pg_temp.hr_reject(q text,code text) returns void language plpgsql as $$declare failed boolean:=false;got text;begin
 begin execute q;exception when others then failed:=true;get stacked diagnostics got=returned_sqlstate;end;
 perform pg_temp.hr_assert(failed and got=code,'expected '||code||', got '||coalesce(got,'success'));
end$$;
do $$declare c uuid:=gen_random_uuid();b uuid:=gen_random_uuid();u uuid;k text;begin
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(c,'hr-h1-qa-'||c,'HR H1 QA'),(b,'hr-h1-qa-'||b,'HR H1 foreign');
 perform set_config('hr.qa.company',c::text,true);perform set_config('hr.qa.foreign_company',b::text,true);
 foreach k in array array['admin','self','old','new','reader','ks','system','outsider','foreign'] loop
  u:=gen_random_uuid();perform set_config('hr.qa.'||k,u::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)
   values(u,'authenticated','authenticated','hr-h1-qa-'||u||'@example.invalid',now(),now(),'{}','{}');
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role)
   values(u,'hr-h1-qa-'||u||'@example.invalid','hr-h1-qa-'||case when k='foreign' then b else c end,true,false,case when k in ('admin','foreign') then 'admin' else 'member' end,case when k in ('admin','foreign') then 'firmaadmin' else 'ansatt' end)
   on conflict(id) do update set approved=true,deactivated=false,role=excluded.role,company_role=excluded.company_role,system_role=null;
  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role)
   values(case when k='foreign' then b else c end,u,true,case when k in ('admin','foreign') then 'firmaadmin' else 'ansatt' end) on conflict(company_id,user_id) do update set workspace_role=excluded.workspace_role;
  insert into public.user_active_company_scope(user_id,company_id) values(u,case when k='foreign' then b else c end) on conflict(user_id) do update set company_id=excluded.company_id;
 end loop;
 update public.profiles set system_role='systemadmin',is_admin=true where id=current_setting('hr.qa.system')::uuid;
 insert into public.company_module_access(company_id,module_key,enabled) values(c,'kshms',true);
 -- Existing relationship scenarios now run behind explicit module entitlements.
 insert into public.company_module_access(company_id,module_key,enabled) values(c,'hr',true),(b,'hr',true);
 insert into hr_private.module_access(company_id,user_id,enabled) select company_id,user_id,true from public.sales_company_memberships where company_id in (c,b);
 insert into public.kshms_member_access(company_id,user_id,role,enabled,changed_by) values(c,current_setting('hr.qa.ks')::uuid,'responsible',true,current_setting('hr.qa.admin')::uuid);
end$$;
-- Fixture setup is the same isolated random-firm/identity contract as H1.
-- The harness prepends H1's setup before the first authenticated-role statement.

-- Close this transaction's gate for the negative readiness case; rollback restores the prior committed gate.
update hr_private.runtime_state set content_enabled=false,restore_quarantined=true where singleton;
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e jsonb;t uuid:=gen_random_uuid();p uuid:=gen_random_uuid();m uuid:=gen_random_uuid();begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform public.hr_foundation_configure(c,0,true,'Synthetic conversations QA','Synthetic QA basis',current_date+30);
 e:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',current_setting('hr.qa.self'),'leader_id',current_setting('hr.qa.old')));
 perform set_config('hr.qa.employee',e#>>'{employee,id}',true);
 perform set_config('hr.qa.conversation',gen_random_uuid()::text,true);perform set_config('hr.qa.template',t::text,true);
 perform set_config('hr.qa.prep',p::text,true);perform set_config('hr.qa.meeting',m::text,true);
 perform public.hr_template_save(c,t,0,jsonb_build_object('title','Synthetic QA conversation','kind','annual','intro','Synthetic data only',
 'questions',jsonb_build_array(jsonb_build_object('id',p,'topic','Preparation','prompt','How is work?','phase','preparation','required',true),
 jsonb_build_object('id',m,'topic','Meeting','prompt','What is agreed?','phase','meeting','required',true))),false);
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 perform pg_temp.hr_reject(format('select public.hr_conversation_start(%L,%L,1,%L,%L,1,current_date)',c,current_setting('hr.qa.employee'),current_setting('hr.qa.conversation'),t),'42501');
end$$;
reset role;
-- Opening affects this rollback transaction only. Other sessions retain closed gates.
update hr_private.runtime_state set content_enabled=true,restore_quarantined=false where singleton;
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid:=current_setting('hr.qa.employee')::uuid;
 cid uuid:=current_setting('hr.qa.conversation')::uuid;t uuid:=current_setting('hr.qa.template')::uuid;p text:=current_setting('hr.qa.prep');m text:=current_setting('hr.qa.meeting');r jsonb;rev integer;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform pg_temp.hr_reject(format('select public.hr_conversation_start(%L,%L,1,%L,%L,1,current_date)',c,e,cid,t),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_conversation_templates(c,e)->'templates')=1,'leader gets eligible template');
 r:=public.hr_conversation_start(c,e,1,cid,t,1,current_date);perform pg_temp.hr_assert(r#>>'{conversation,revision}'='1','start saved');
 perform pg_temp.hr_assert(public.hr_conversation_start(c,e,1,cid,t,1,current_date)#>>'{conversation,revision}'='1','same ID idempotent');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 perform pg_temp.hr_reject(format('select public.hr_conversation_command(%L,%L,1,%L,1,''share'',''{}'')',c,e,cid),'22023');
 r:=public.hr_conversation_command(c,e,1,cid,1,'preparation',jsonb_build_object('answers',jsonb_build_object(p,'Synthetic private answer')));
 perform pg_temp.hr_assert(r->'conversation'->'preparation'->>p='Synthetic private answer','employee own preparation');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 perform pg_temp.hr_assert(public.hr_conversation_get(c,e,cid)#>'{conversation,preparation}'='{}'::jsonb,'leader cannot see unshared answer');
 perform pg_temp.hr_reject(format('select public.hr_conversation_command(%L,%L,1,%L,2,''preparation'',''{"answers":{}}'')',c,e,cid),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
 perform pg_temp.hr_reject(format('select public.hr_conversation_get(%L,%L,%L)',c,e,cid),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.outsider'),true);
 perform pg_temp.hr_reject(format('select public.hr_conversation_get(%L,%L,%L)',c,e,cid),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 r:=public.hr_conversation_command(c,e,1,cid,2,'share');perform pg_temp.hr_assert(r#>>'{conversation,stage}'='meeting','explicit share');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 r:=public.hr_conversation_command(c,e,1,cid,3,'meeting',jsonb_build_object('answers',jsonb_build_object(m,'Synthetic agreed summary'),'actions','[]'::jsonb,'next_on',''));
 perform pg_temp.hr_assert(r->'conversation'->'preparation'->>p='Synthetic private answer','manager preserves original');
 perform pg_temp.hr_reject(format('select public.hr_conversation_command(%L,%L,1,%L,3,''ready'',''{}'')',c,e,cid),'40001');
 r:=public.hr_conversation_command(c,e,1,cid,4,'ready');r:=public.hr_conversation_command(c,e,1,cid,5,'confirm');
 perform pg_temp.hr_assert(r#>>'{conversation,stage}'='awaiting','one side insufficient');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 r:=public.hr_conversation_command(c,e,1,cid,6,'confirm');perform pg_temp.hr_assert(r#>>'{conversation,stage}'='completed','both confirm');
 perform pg_temp.hr_assert(public.hr_conversation_get(c,e,cid,2)->'conversation'->'preparation'->>p='Synthetic private answer','historical original');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 r:=public.hr_employee_command(c,'leader',jsonb_build_object('id',e,'revision',1,'leader_id',current_setting('hr.qa.new'),'clear_old_leader_reader',false));
 perform pg_temp.hr_assert(r#>>'{employee,revision}'='2','relation revision changes');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 perform pg_temp.hr_reject(format('select public.hr_conversation_get(%L,%L,%L)',c,e,cid),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.new'),true);
 r:=public.hr_conversation_get(c,e,cid);perform pg_temp.hr_assert(r#>'{conversation,confirmations,leader}'='null'::jsonb,'new leader cannot inherit confirmation');
 perform pg_temp.hr_assert(r#>>'{conversation,stage}'='awaiting','new leader review required');
 r:=public.hr_conversation_command(c,e,2,cid,7,'confirm');perform pg_temp.hr_assert(r#>>'{conversation,stage}'='completed','new leader confirms personally');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 r:=public.hr_employee_command(c,'end',jsonb_build_object('id',e,'revision',2,'confirm','END_AND_DELETE'));
 perform pg_temp.hr_assert(r->>'access_blocked'='true' and r->>'receipt_id'=e::text,'employment closed and minimal receipt returned');
 perform pg_temp.hr_assert((r->>'deleted')::boolean=((r->>'purge_state')='complete'),'completion matches actual purge status');
 perform pg_temp.hr_reject('select public.hr_deletion_alert_list()','42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
 r:=public.hr_deletion_alert_list();perform pg_temp.hr_assert(exists(select 1 from jsonb_array_elements(r->'alerts') v where v->>'employee_id'=e::text),'systemadmin minimal alert present');
 perform pg_temp.hr_assert(public.hr_deletion_alert_ack(e)->>'read'='true','operator reads alert');
 perform pg_temp.hr_reject('select public.hr_alert_worker_reserve()','42501');
end$$;
reset role;
do $$begin
 perform pg_temp.hr_assert(not exists(select 1 from hr_private.artifacts where company_id=current_setting('hr.qa.company')::uuid),'all personal snapshots removed');
 perform pg_temp.hr_assert(not exists(select 1 from hr_private.conversations where company_id=current_setting('hr.qa.company')::uuid),'pointer removed');
 perform pg_temp.hr_assert((select count(*)=1 from hr_private.deletion_alerts where company_id=current_setting('hr.qa.company')::uuid),'one event');
 perform pg_temp.hr_assert(not exists(select 1 from hr_private.deletion_alert_settings where enabled),'mail remains disabled');
 if exists(select 1 from pg_trigger where tgname='hr_purge_completion_guard') then
  perform pg_temp.hr_assert((select state='pending' from hr_private.purge_receipts where id=current_setting('hr.qa.employee')::uuid),'existing H5b independent ack gate remains pending and is not bypassed');
 end if;
end$$;
select current_setting('hr.qa.count')::integer as assertions;
rollback;

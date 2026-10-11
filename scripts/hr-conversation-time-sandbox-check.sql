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

set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid;t uuid:=gen_random_uuid();cid uuid:=gen_random_uuid();p uuid:=gen_random_uuid();m uuid:=gen_random_uuid();r jsonb;v integer;bad text;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform public.hr_foundation_configure(c,0,true,'Synthetic clock QA','Synthetic clock basis',current_date+30);
 e:=(public.hr_employee_command(c,'create',jsonb_build_object('user_id',current_setting('hr.qa.self'),'leader_id',current_setting('hr.qa.old')))#>>'{employee,id}')::uuid;
 perform public.hr_template_save(c,t,0,jsonb_build_object('title','Synthetic clock conversation','kind','annual','intro','No personal data','questions',jsonb_build_array(jsonb_build_object('id',p,'topic','Work','prompt','How is work?','phase','preparation','required',true),jsonb_build_object('id',m,'topic','Meeting','prompt','What is agreed?','phase','meeting','required',true))),false);
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 foreach bad in array array['','9:00','24:00','12:60','09:00:00'] loop
 perform pg_temp.hr_reject(format('select public.hr_conversation_start_at(%L,%L,1,%L,%L,1,current_date,%L)',c,e,cid,t,bad),'22023');end loop;
 r:=public.hr_conversation_start_at(c,e,1,cid,t,1,current_date,'13:30');
 perform pg_temp.hr_assert(r#>>'{conversation,meeting_time}'='13:30' and r#>>'{conversation,meeting_timezone}'='Europe/Oslo','start preserves Norwegian clock');
 perform pg_temp.hr_assert(public.hr_conversation_start_at(c,e,1,cid,t,1,current_date+1,'14:45')#>>'{conversation,meeting_time}'='13:30','same ID retry retains original time');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 perform pg_temp.hr_assert(public.hr_conversation_get(c,e,cid)#>>'{conversation,meeting_time}'='13:30','employee reads agreed time');
 perform pg_temp.hr_reject(format('select public.hr_conversation_schedule(%L,%L,1,%L,1,current_date,''14:45'')',c,e,cid),'42501');
 r:=public.hr_conversation_command(c,e,1,cid,1,'preparation',jsonb_build_object('answers',jsonb_build_object(p,'Synthetic private preparation')));v:=(r->>'current_revision')::integer;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 perform pg_temp.hr_reject(format('select public.hr_conversation_schedule(%L,%L,1,%L,1,current_date,''14:45'')',c,e,cid),'40001');
 r:=public.hr_conversation_schedule(c,e,1,cid,v,current_date+1,'14:45');v:=(r->>'current_revision')::integer;
 perform pg_temp.hr_assert(r#>'{conversation,preparation}'='{}'::jsonb,'schedule reply does not leak private preparation');
 perform pg_temp.hr_assert(r#>>'{conversation,meeting_time}'='14:45' and r#>>'{conversation,on}'=(current_date+1)::text,'new date and clock saved');
 perform pg_temp.hr_assert((public.hr_conversation_schedule(c,e,1,cid,v,current_date+1,'14:45')->>'current_revision')::integer=v,'unchanged schedule creates no version');
 perform pg_temp.hr_assert(public.hr_conversation_get(c,e,cid,1)#>>'{conversation,meeting_time}'='13:30','history retains original clock');
 perform pg_temp.hr_assert(public.hr_conversation_list(c,e)#>>'{conversations,0,meeting_time}'='14:45','list contains current clock');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform pg_temp.hr_reject(format('select public.hr_conversation_schedule(%L,%L,1,%L,%s,current_date,''14:45'')',c,e,cid,v),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 perform pg_temp.hr_assert(public.hr_conversation_get(c,e,cid)#>>array['conversation','preparation',p::text]='Synthetic private preparation','reschedule retains private answers');
 r:=public.hr_conversation_command(c,e,1,cid,v,'share');v:=(r->>'current_revision')::integer;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 r:=public.hr_conversation_command(c,e,1,cid,v,'meeting',jsonb_build_object('answers',jsonb_build_object(m,'Synthetic meeting'),'actions','[]'::jsonb,'next_on',''));v:=(r->>'current_revision')::integer;
 perform pg_temp.hr_assert(r#>>'{conversation,meeting_time}'='14:45','ordinary meeting saves retain time');
 r:=public.hr_conversation_command(c,e,1,cid,v,'ready');v:=(r->>'current_revision')::integer;
 perform pg_temp.hr_reject(format('select public.hr_conversation_schedule(%L,%L,1,%L,%s,current_date,''15:00'')',c,e,cid,v),'22023');
 perform pg_temp.hr_assert(not has_function_privilege('anon','public.hr_conversation_start_at(uuid,uuid,integer,uuid,uuid,integer,date,text)','execute'),'anonymous start denied');
 perform pg_temp.hr_assert(not has_function_privilege('service_role','public.hr_conversation_schedule(uuid,uuid,integer,uuid,integer,date,text)','execute'),'service cannot schedule directly');
end$$;
reset role;
select current_setting('hr.qa.count')::integer as clock_assertions_pass;
rollback;

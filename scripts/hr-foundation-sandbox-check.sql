-- H1 Sandbox synthetic identities only. Roll back all fixtures.
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
 insert into public.kshms_member_access(company_id,user_id,role,enabled,changed_by) values(c,current_setting('hr.qa.ks')::uuid,'responsible',true,current_setting('hr.qa.admin')::uuid);
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;a uuid:=current_setting('hr.qa.admin')::uuid;
 u uuid:=current_setting('hr.qa.self')::uuid;old_id uuid:=current_setting('hr.qa.old')::uuid;
 new_id uuid:=current_setting('hr.qa.new')::uuid;reader uuid:=current_setting('hr.qa.reader')::uuid;
 r jsonb;eid uuid;rev integer;k text;begin
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform pg_temp.hr_assert((public.hr_foundation_state(c)->>'settings') is null,'no default activation');
 perform pg_temp.hr_reject(format('select public.hr_employee_list(%L)',c),'42501');
 r:=public.hr_foundation_configure(c,0,true,'Syntetisk administrasjon av ledertilgang','Syntetisk vurdert behandlingsgrunnlag',current_date+30);
 perform pg_temp.hr_assert((r->>'content_enabled')='false','content closed');
 perform pg_temp.hr_reject(format('select public.hr_foundation_configure(%L,0,true,%L,%L,current_date+30)',c,'QA purpose text','QA legal basis'),'40001');
 perform pg_temp.hr_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'create',jsonb_build_object('user_id',u,'content','secret')),'22023');
 perform pg_temp.hr_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'create',jsonb_build_object('user_id',current_setting('hr.qa.foreign'))),'42501');
 perform pg_temp.hr_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'create',jsonb_build_object('user_id',u,'leader_id',u)),'42501');
 r:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',u,'leader_id',old_id));eid:=(r#>>'{employee,id}')::uuid;
 perform set_config('hr.qa.employee',eid::text,true);
 perform pg_temp.hr_assert(r#>>'{employee,leader_id}'=old_id::text,'leader registered');
 perform pg_temp.hr_assert(jsonb_array_length(public.hr_employee_list(c)->'employees')=1,'admin sees employee');
 perform pg_temp.hr_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'create',jsonb_build_object('user_id',u)),'23505');
 foreach k in array array['self','old','admin'] loop
  perform set_config('request.jwt.claim.sub',current_setting('hr.qa.'||k),true);
  perform pg_temp.hr_assert(public.hr_employee_get(c,eid)#>>'{employee,id}'=eid::text,'authorized '||k);
 end loop;
 foreach k in array array['reader','new','ks','system','outsider','foreign'] loop
  perform set_config('request.jwt.claim.sub',current_setting('hr.qa.'||k),true);
  perform pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',c,eid),'42501');
  if k<>'foreign' then perform pg_temp.hr_assert(jsonb_array_length(public.hr_employee_list(c)->'employees')=0,'no list leak '||k);end if;
  perform pg_temp.hr_reject(format('select public.hr_foundation_state(%L)',c),'42501');
  perform pg_temp.hr_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'leader',jsonb_build_object('id',eid,'revision',1,'leader_id',new_id)),'42501');
 end loop;
 perform set_config('request.jwt.claim.sub',a::text,true);
 r:=public.hr_employee_command(c,'reader',jsonb_build_object('id',eid,'revision',1,'reader_id',reader,'reason','Syntetisk tjenstlig lesebehov'));rev:=(r#>>'{employee,revision}')::integer;
 perform pg_temp.hr_assert(r#>>'{employee,readers,0,granted_by}'=a::text and r#>>'{employee,readers,0,granted_at}' is not null,'grant attribution');
 perform set_config('request.jwt.claim.sub',reader::text,true);
 perform pg_temp.hr_assert(public.hr_employee_get(c,eid)#>>'{employee,id}'=eid::text,'explicit reader sees');
 perform pg_temp.hr_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'end',jsonb_build_object('id',eid,'revision',rev,'confirm','END_AND_DELETE')),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform pg_temp.hr_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'leader',jsonb_build_object('id',eid,'revision',1,'leader_id',new_id)),'40001');
 r:=public.hr_employee_command(c,'leader',jsonb_build_object('id',eid,'revision',rev,'leader_id',new_id));rev:=(r#>>'{employee,revision}')::integer;
 perform pg_temp.hr_assert(r#>>'{employee,id}'=eid::text,'leader change keeps employment identity');
 perform set_config('request.jwt.claim.sub',old_id::text,true);perform pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',c,eid),'42501');
 perform set_config('request.jwt.claim.sub',new_id::text,true);perform pg_temp.hr_assert(public.hr_employee_get(c,eid)#>>'{employee,id}'=eid::text,'new leader sees');
 perform set_config('request.jwt.claim.sub',a::text,true);
 r:=public.hr_employee_command(c,'reader',jsonb_build_object('id',eid,'revision',rev,'reader_id',new_id,'reason','Syntetisk ekstra lederlesing'));rev:=(r#>>'{employee,revision}')::integer;
 perform pg_temp.hr_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'leader',jsonb_build_object('id',eid,'revision',rev,'leader_id',old_id)),'22023');
 r:=public.hr_employee_command(c,'leader',jsonb_build_object('id',eid,'revision',rev,'leader_id',old_id,'clear_old_leader_reader',true));rev:=(r#>>'{employee,revision}')::integer;
 perform set_config('request.jwt.claim.sub',new_id::text,true);perform pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',c,eid),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);
 r:=public.hr_employee_command(c,'revoke_reader',jsonb_build_object('id',eid,'revision',rev,'reader_id',reader));rev:=(r#>>'{employee,revision}')::integer;
 perform set_config('request.jwt.claim.sub',reader::text,true);perform pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',c,eid),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform pg_temp.hr_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'end',jsonb_build_object('id',eid,'revision',rev)),'22023');
 r:=public.hr_employee_command(c,'end',jsonb_build_object('id',eid,'revision',rev,'confirm','END_AND_DELETE'));
 perform pg_temp.hr_assert(r->>'deleted'='true','end deletes');
 perform pg_temp.hr_assert(public.hr_employee_command(c,'end',jsonb_build_object('id',eid,'revision',rev,'confirm','END_AND_DELETE'))=r,'lost-response retry returns same receipt');
 perform pg_temp.hr_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'create',jsonb_build_object('user_id',u)),'42501');
 perform set_config('request.jwt.claim.sub',u::text,true);perform pg_temp.hr_reject(format('select public.hr_employee_list(%L)',c),'42501');
 perform set_config('request.jwt.claim.sub',old_id::text,true);perform pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',c,eid),'42501');
 perform set_config('request.jwt.claim.sub',a::text,true);perform pg_temp.hr_assert(jsonb_array_length(public.hr_employee_list(c)->'employees')=0,'ended absent from admin list');
 perform pg_temp.hr_reject('select * from hr_private.employees','42501');
 perform pg_temp.hr_reject(format('select hr_private.active_member(%L,%L)',c,a),'42501');
end$$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
-- Fresh profile/membership/active firm and departing leader cleanup.
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;r jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 r:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',current_setting('hr.qa.old')));
 perform set_config('hr.qa.leader_employee',r#>>'{employee,id}',true);
 r:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',current_setting('hr.qa.outsider'),'leader_id',current_setting('hr.qa.old')));
 perform set_config('hr.qa.second_employee',r#>>'{employee,id}',true);
 r:=public.hr_employee_command(c,'reader',jsonb_build_object('id',r#>>'{employee,id}','revision',1,'reader_id',current_setting('hr.qa.old'),'reason','Syntetisk tjenstlig lesebehov'));
end$$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
update public.profiles set deactivated=true where id=current_setting('hr.qa.old')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
select pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',current_setting('hr.qa.company'),current_setting('hr.qa.second_employee')),'42501');
reset role;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
update public.profiles set deactivated=false where id=current_setting('hr.qa.old')::uuid;
update public.user_active_company_scope set company_id=current_setting('hr.qa.foreign_company')::uuid where user_id=current_setting('hr.qa.old')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
select pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',current_setting('hr.qa.company'),current_setting('hr.qa.second_employee')),'42501');
reset role;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
update public.user_active_company_scope set company_id=current_setting('hr.qa.company')::uuid where user_id=current_setting('hr.qa.old')::uuid;
delete from public.sales_company_memberships where company_id=current_setting('hr.qa.company')::uuid and user_id=current_setting('hr.qa.old')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
select pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',current_setting('hr.qa.company'),current_setting('hr.qa.second_employee')),'42501');
reset role;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
insert into public.sales_company_memberships(company_id,user_id,workspace_role,is_primary) values(current_setting('hr.qa.company')::uuid,current_setting('hr.qa.old')::uuid,'ansatt',true);
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;r jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 r:=public.hr_employee_command(c,'end',jsonb_build_object('id',current_setting('hr.qa.leader_employee'),'revision',1,'confirm','END_AND_DELETE'));
 r:=public.hr_employee_get(c,current_setting('hr.qa.second_employee')::uuid);
 perform pg_temp.hr_assert(r#>>'{employee,leader_id}' is null and jsonb_array_length(r#>'{employee,readers}')=0,'departing leader assignments and own reader grants cleared');
 perform pg_temp.hr_assert(r#>>'{employee,revision}'='3','dependent employee revision fences old clients');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 perform pg_temp.hr_reject(format('select public.hr_employee_get(%L,%L)',c,current_setting('hr.qa.second_employee')),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 r:=public.hr_employee_command(c,'end',jsonb_build_object('id',current_setting('hr.qa.second_employee'),'revision',3,'confirm','END_AND_DELETE'));
 r:=public.hr_foundation_configure(c,1,false,'Syntetisk administrasjon av ledertilgang','Syntetisk vurdert behandlingsgrunnlag',current_date+30);
 perform pg_temp.hr_reject(format('select public.hr_employee_list(%L)',c),'42501');
 perform pg_temp.hr_assert(public.hr_foundation_state(c)#>>'{settings,enabled}'='false','admin can review disabled settings');
end$$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
-- Storage metadata fixture only: no file bytes or HTTP transport claimed.
insert into storage.objects(bucket_id,name) values('hr-private','synthetic-h1-metadata-only');
set local role authenticated;
select pg_temp.hr_assert((select count(*)=0 from storage.objects where bucket_id='hr-private'),'reserved private file metadata invisible even to firmaadmin');
select pg_temp.hr_reject('insert into storage.objects(bucket_id,name) values (''hr-private'',''synthetic-client-insert'')','42501');
with changed as (update storage.objects set name='synthetic-overwrite' where bucket_id='hr-private' returning id) select pg_temp.hr_assert((select count(*)=0 from changed),'no private file overwrite');
select pg_temp.hr_reject('delete from storage.objects where bucket_id=''hr-private''','42501');
reset role;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;begin
 perform pg_temp.hr_assert(not exists(select 1 from hr_private.employees where company_id=c),'employee physically removed');
 perform pg_temp.hr_assert(not exists(select 1 from hr_private.readers where company_id=c),'grants and reasons physically removed');
 perform pg_temp.hr_assert((select count(*)=3 from hr_private.closed_employments where company_id=c),'three minimal restore barriers');
 perform pg_temp.hr_assert((select public=false from storage.buckets where id='hr-private'),'reserved bucket private');
 perform pg_temp.hr_assert((select bool_and(relrowsecurity) from pg_class where relnamespace='hr_private'::regnamespace and relkind='r'),'all HR tables have RLS');
end$$;
set local role anon;
select pg_temp.hr_reject(format('select public.hr_employee_list(%L)',current_setting('hr.qa.company')),'42501');
set local role service_role;
select pg_temp.hr_reject(format('select public.hr_employee_list(%L)',current_setting('hr.qa.company')),'42501');
select pg_temp.hr_reject('select * from hr_private.employees','42501');
reset role;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.system'),true);
select current_setting('hr.qa.count')::integer as passed_assertions;
rollback;

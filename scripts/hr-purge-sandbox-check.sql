-- H2 menu context: synthetic identities only. Roll back all fixtures.
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
-- Everything below is isolated, synthetic and rolled back. No HTTP/browser login.
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;a uuid:=current_setting('hr.qa.admin')::uuid;u uuid:=current_setting('hr.qa.self')::uuid;x jsonb;eid uuid;other uuid;begin
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform public.hr_foundation_configure(c,0,true,'Syntetisk HR-register','Syntetisk vurdert grunnlag',current_date+30);
 x:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',u,'leader_id',current_setting('hr.qa.old')));eid:=(x#>>'{employee,id}')::uuid;
 perform public.hr_employee_command(c,'reader',jsonb_build_object('id',eid,'revision',1,'reader_id',current_setting('hr.qa.reader'),'reason','Syntetisk avtalt ekstra leser'));
 x:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',current_setting('hr.qa.new'),'leader_id',u));other:=(x#>>'{employee,id}')::uuid;
 perform public.hr_employee_command(c,'reader',jsonb_build_object('id',other,'revision',1,'reader_id',u,'reason','Syntetisk ekstra leser hos annen'));
 perform set_config('hr.qa.employee',eid::text,true);perform set_config('hr.qa.other',other::text,true);
 perform pg_temp.hr_reject(format('select public.hr_file_authorize(%L,%L)',c,gen_random_uuid()),'42501');
 perform pg_temp.hr_reject(format('select public.hr_purge_worker_authorize(%L)',repeat('a',64)),'42501');
end$$;
reset role;
create temp table hr_h3_snapshot(kind text,data jsonb);
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e hr_private.employees%rowtype;aid uuid;fid uuid;k text;begin
 update hr_private.runtime_state set content_enabled=true,restore_quarantined=false where singleton;
 select * into e from hr_private.employees where id=current_setting('hr.qa.employee')::uuid;
 foreach k in array array['content','version','draft','search','export'] loop
  insert into hr_private.artifacts(company_id,employee_id,employee_revision,kind,payload,review_on)
  values(c,e.id,e.revision,k,jsonb_build_object('synthetic_private_marker',k),current_date+30) returning id into aid;
  if k in ('content','export') then
   insert into hr_private.files(company_id,employee_id,artifact_id,employee_revision,size_bytes,mime_type,sha256)
   values(c,e.id,aid,e.revision,24,'application/pdf',repeat('a',64)) returning id into fid;
   perform set_config('hr.qa.file_'||k,fid::text,true);
  end if;
 end loop;
 insert into hr_private.artifacts(company_id,employee_id,employee_revision,kind,payload,review_on)
 select company_id,id,revision,'draft','{"synthetic_other_person":true}',current_date+30 from hr_private.employees where id=current_setting('hr.qa.other')::uuid;
 insert into hr_h3_snapshot select 'employee',to_jsonb(e);
 insert into hr_h3_snapshot select 'artifact',to_jsonb(a) from hr_private.artifacts a where employee_id=e.id;
 insert into hr_h3_snapshot select 'file',to_jsonb(f) from hr_private.files f where employee_id=e.id;
 perform pg_temp.hr_assert((select count(*)=5 from hr_private.artifacts where employee_id=e.id),'all five content families registered');
 perform pg_temp.hr_assert((select count(*)=2 from hr_private.files where employee_id=e.id),'private original and export registered');
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;f uuid:=current_setting('hr.qa.file_content')::uuid;k text;x jsonb;begin
 foreach k in array array['self','old','reader','admin'] loop
  perform set_config('request.jwt.claim.sub',current_setting('hr.qa.'||k),true);
  x:=public.hr_file_authorize(c,f);
  perform pg_temp.hr_assert(x#>>'{file,id}'=f::text and x#>>'{context,user_id}'=current_setting('hr.qa.'||k),'fresh authorized file '||k);
 end loop;
 foreach k in array array['new','ks','system','outsider','foreign'] loop
  perform set_config('request.jwt.claim.sub',current_setting('hr.qa.'||k),true);
  perform pg_temp.hr_reject(format('select public.hr_file_authorize(%L,%L)',c,f),'42501');
 end loop;
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform pg_temp.hr_reject(format('select public.hr_file_authorize(%L,%L)',current_setting('hr.qa.foreign_company'),f),'42501');
 perform public.hr_employee_command(c,'leader',jsonb_build_object('id',current_setting('hr.qa.employee'),'revision',2,'leader_id',current_setting('hr.qa.new')));
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.old'),true);
 perform pg_temp.hr_reject(format('select public.hr_file_authorize(%L,%L)',c,f),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.new'),true);
 perform pg_temp.hr_assert(public.hr_file_authorize(c,f)#>>'{file,id}'=f::text,'new leader reads registered historical file');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform public.hr_employee_command(c,'revoke_reader',jsonb_build_object('id',current_setting('hr.qa.employee'),'revision',3,'reader_id',current_setting('hr.qa.reader')));
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.reader'),true);
 perform pg_temp.hr_reject(format('select public.hr_file_authorize(%L,%L)',c,f),'42501');
 perform pg_temp.hr_reject(format('select public.hr_content_purge(%L,%L,4,%L)',c,current_setting('hr.qa.employee'),'PURGE_CONTENT'),'42501');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
 perform pg_temp.hr_reject(format('select public.hr_content_purge(%L,%L,3,%L)',c,current_setting('hr.qa.employee'),'PURGE_CONTENT'),'40001');
 perform pg_temp.hr_reject(format('select public.hr_employee_command(%L,%L,%L::jsonb)',c,'end',jsonb_build_object('id',current_setting('hr.qa.employee'),'revision',4,'confirm','wrong')),'22023');
 x:=public.hr_employee_command(c,'end',jsonb_build_object('id',current_setting('hr.qa.employee'),'revision',4,'confirm','END_AND_DELETE'));
 perform pg_temp.hr_assert(x->>'access_blocked'='true' and x->>'deleted'='false' and x->>'purge_state'='pending','do not claim full deletion before bytes');
 perform pg_temp.hr_assert(public.hr_employee_command(c,'end',jsonb_build_object('id',current_setting('hr.qa.employee'),'revision',4,'confirm','END_AND_DELETE'))=x,'closure retry keeps same pending receipt');
 perform pg_temp.hr_assert(public.hr_purge_status(c)#>>'{receipts,0,state}'='pending','admin sees true deletion state');
 perform set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
 perform pg_temp.hr_reject(format('select public.hr_file_authorize(%L,%L)',c,f),'42501');
 perform pg_temp.hr_reject('select public.get_hr_context()','42501');
end$$;
reset role;
select pg_temp.hr_assert((select count(*)=0 from hr_private.artifacts where employee_id=current_setting('hr.qa.employee')::uuid),'content/version/draft/search/export physically deleted');
select pg_temp.hr_assert((select count(*)=0 from hr_private.files where employee_id=current_setting('hr.qa.employee')::uuid),'file registry physically deleted');
select pg_temp.hr_assert((select count(*)=2 from hr_private.purge_objects),'both API byte deletion jobs retained');
select pg_temp.hr_assert((select count(*)=1 from hr_private.artifacts where employee_id=current_setting('hr.qa.other')::uuid),'other employee content preserved');
select pg_temp.hr_assert((select leader_id is null from hr_private.employees where id=current_setting('hr.qa.other')::uuid),'departing leader removed');
select pg_temp.hr_assert((select count(*)=0 from hr_private.readers where user_id=current_setting('hr.qa.self')::uuid),'departing extra reader removed');
update hr_private.purge_worker_settings set enabled=true where singleton;
create function pg_temp.hr_metadata_finish_guard(job uuid,attempt_id uuid,object_name text) returns boolean language plpgsql security definer set search_path='' as $$declare blocked boolean:=false;begin
 begin
  insert into storage.objects(bucket_id,name,metadata) values('hr-private',object_name,'{"size":24}');
  blocked:=not public.hr_purge_worker_finish(job,attempt_id,true);
  raise exception 'rollback metadata-only proof' using errcode='P9999';
 exception when sqlstate 'P9999' then null;end;
 return blocked;
end$$;
set local role service_role;
do $$declare j jsonb;old_attempt uuid;begin
 perform pg_temp.hr_assert(not public.hr_purge_worker_authorize(repeat('a',64)),'wrong worker token denied');
 j:=public.hr_purge_worker_reserve();perform pg_temp.hr_assert(j is not null,'worker reserves one bounded job');old_attempt:=(j->>'attempt')::uuid;
 perform pg_temp.hr_assert(not public.hr_purge_worker_finish((j->>'id')::uuid,gen_random_uuid(),true),'wrong attempt cannot acknowledge');
 perform pg_temp.hr_assert(pg_temp.hr_metadata_finish_guard((j->>'id')::uuid,old_attempt,j->>'object_path'),'remaining Storage metadata prevents false completion');
 perform pg_temp.hr_assert(not public.hr_purge_worker_finish((j->>'id')::uuid,old_attempt,false),'file API failure remains retry');
 perform set_config('hr.qa.retry_id',j->>'id',true);
 j:=public.hr_purge_worker_reserve();perform pg_temp.hr_assert(j is not null,'other file can proceed during retry backoff');
 perform pg_temp.hr_assert(public.hr_purge_worker_finish((j->>'id')::uuid,(j->>'attempt')::uuid,true),'absence proof acknowledged');
end$$;
reset role;
select pg_temp.hr_assert((select state='pending' from hr_private.purge_receipts where id=current_setting('hr.qa.employee')::uuid),'one remaining file keeps purge pending');
update hr_private.purge_objects set available_at=now()-interval '1 second',lease_until=now()-interval '1 second' where id=current_setting('hr.qa.retry_id')::uuid;
set local role service_role;
do $$declare j jsonb;begin
 j:=public.hr_purge_worker_reserve();perform pg_temp.hr_assert(j is not null,'expired lease/retry reclaimed');
 perform pg_temp.hr_assert(public.hr_purge_worker_finish((j->>'id')::uuid,(j->>'attempt')::uuid,true),'retry finish succeeds');
 perform pg_temp.hr_assert(not public.hr_purge_worker_finish((j->>'id')::uuid,(j->>'attempt')::uuid,true),'late finish cannot mutate cleaned receipt');
 perform pg_temp.hr_assert(public.hr_purge_worker_reserve() is null,'no residual purge jobs');
end$$;
reset role;
select pg_temp.hr_assert((select state='complete' and completed_at is not null from hr_private.purge_receipts where id=current_setting('hr.qa.employee')::uuid),'complete only after all API jobs');
-- Active employment can purge old content without ending the employee.
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.admin'),true);
do $$declare c uuid:=current_setting('hr.qa.company')::uuid;e uuid:=current_setting('hr.qa.other')::uuid;x jsonb;begin
 x:=public.hr_content_purge(c,e,3,'PURGE_CONTENT');
 perform pg_temp.hr_assert(x->>'purge_state'='complete','active content-only purge completes when no files');
 perform pg_temp.hr_assert(public.hr_employee_get(c,e)#>>'{employee,revision}'='4','employee and new revision preserved after content purge');
end$$;
reset role;
select pg_temp.hr_assert((select count(*)=0 from hr_private.artifacts where employee_id=current_setting('hr.qa.other')::uuid),'active employee old content deleted');
select pg_temp.hr_reject(format('insert into hr_private.artifacts(company_id,employee_id,employee_revision,kind,payload,review_on) values(%L,%L,2,%L,%L,current_date+30)',current_setting('hr.qa.company'),current_setting('hr.qa.other'),'draft','{}'),'42501');
-- Restore replay: export manifest independently of the restored table snapshot,
-- then restore ONLY this synthetic person's pre-delete rows in this rollback.
insert into hr_h3_snapshot values('manifest',hr_private.restore_manifest());
delete from hr_private.closed_employments where employee_id=current_setting('hr.qa.employee')::uuid;
delete from hr_private.purge_receipts where id=current_setting('hr.qa.employee')::uuid;
do $$declare s jsonb;begin
 select data into s from hr_h3_snapshot where kind='employee';
 insert into hr_private.employees select * from jsonb_populate_record(null::hr_private.employees,s);
 insert into hr_private.artifacts select * from jsonb_populate_recordset(null::hr_private.artifacts,(select jsonb_agg(data) from hr_h3_snapshot where kind='artifact'));
 insert into hr_private.files(id,company_id,employee_id,artifact_id,employee_revision,size_bytes,mime_type,sha256)
 select id,company_id,employee_id,artifact_id,employee_revision,size_bytes,mime_type,sha256 from jsonb_populate_recordset(null::hr_private.files,(select jsonb_agg(data) from hr_h3_snapshot where kind='file'));
 perform pg_temp.hr_assert((select count(*)=5 from hr_private.artifacts where employee_id=current_setting('hr.qa.employee')::uuid),'synthetic pre-delete contents restored');
 perform pg_temp.hr_assert(hr_private.restore_reconcile((select data from hr_h3_snapshot where kind='manifest'))=2,'off-snapshot manifest replayed');
 perform pg_temp.hr_assert((select not content_enabled and restore_quarantined from hr_private.runtime_state where singleton),'restore stays quarantined');
 perform pg_temp.hr_assert((select count(*)=0 from hr_private.employees where id=current_setting('hr.qa.employee')::uuid),'restored departed employee removed');
 perform pg_temp.hr_assert((select count(*)=0 from hr_private.artifacts where employee_id=current_setting('hr.qa.employee')::uuid),'restored content purged again');
 perform pg_temp.hr_assert((select count(*)=2 from hr_private.purge_objects),'restored files queued for API purge again');
end$$;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hr.qa.self'),true);
select pg_temp.hr_reject('select public.get_hr_context()','42501');
select pg_temp.hr_reject('select hr_private.restore_reconcile(''[]'')','42501');
set local role anon;
select pg_temp.hr_reject('select public.hr_file_authorize(null,null)','42501');
select pg_temp.hr_reject('select public.hr_purge_worker_reserve()','42501');
set local role service_role;
select pg_temp.hr_reject('select public.hr_file_authorize(null,null)','42501');
select pg_temp.hr_reject('select hr_private.restore_reconcile(''[]'')','42501');
reset role;
select pg_temp.hr_assert((select bool_and(prosecdef and proconfig=array['search_path=""']) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='hr_private'),'private helpers have empty search path');
select current_setting('hr.qa.count')::integer as passed_assertions;
rollback;

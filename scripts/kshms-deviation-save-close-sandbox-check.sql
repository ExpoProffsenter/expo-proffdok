-- Sandbox only. This bounded regression rolls back every synthetic row.
begin;
set local statement_timeout='10s';
set local lock_timeout='2s';
do $$ declare company uuid:=gen_random_uuid();uid uuid;sys uuid;kind text;begin
 insert into public.sales_company_scopes(id,normalized_name,display_name)
 values(company,public.sales_normalize_company_name('kshms-save-close-qa-'||company),'kshms-save-close-qa-'||company);
 perform set_config('kshms.save_close.company',company::text,true);
 select id into sys from public.profiles where system_role='systemadmin' and approved and not coalesce(deactivated,false) limit 1;
 assert sys is not null;
 perform set_config('kshms.save_close.sys',sys::text,true);
 foreach kind in array array['admin','employee'] loop
  uid:=gen_random_uuid();perform set_config('kshms.save_close.'||kind,uid::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)
  values(uid,'authenticated','authenticated','ks-save-close-qa-'||uid||'@example.invalid',now(),now(),'{}',jsonb_build_object('full_name','QA '||kind));
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role)
  values(uid,'ks-save-close-qa-'||uid||'@example.invalid','kshms-save-close-qa-'||company,true,false,
   case when kind='admin' then 'admin' else 'member' end,case when kind='admin' then 'firmaadmin' else 'ansatt' end)
  on conflict(id) do update set company_name=excluded.company_name,approved=true,deactivated=false,role=excluded.role,company_role=excluded.company_role,system_role=null;
  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role)
  values(company,uid,true,case when kind='admin' then 'firmaadmin' else 'ansatt' end)
  on conflict(company_id,user_id) do update set workspace_role=excluded.workspace_role;
  insert into public.user_active_company_scope(user_id,company_id) values(uid,company) on conflict(user_id) do update set company_id=excluded.company_id;
 end loop;
end $$;
set local role authenticated;
do $$ declare company uuid:=current_setting('kshms.save_close.company')::uuid;
 admin_id uuid:=current_setting('kshms.save_close.admin')::uuid;employee uuid:=current_setting('kshms.save_close.employee')::uuid;
 r jsonb;readback jsonb;payload jsonb;field text;n int:=0;begin
 perform set_config('request.jwt.claim.sub',current_setting('kshms.save_close.sys'),true);perform public.kshms_activate(company,true);
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 perform public.kshms_command(company,'access',jsonb_build_object('user_id',employee,'role','reader','enabled',true));
 r:=public.kshms_deviation_command(company,'create',jsonb_build_object('request_id',gen_random_uuid(),'title','Save then close regression',
  'event','Synthetic incident; no real case is changed','category','hms','responsible_id',employee,'due_on',current_date+1,'source_kind','company'));
 perform set_config('request.jwt.claim.sub',employee::text,true);
 payload:=jsonb_build_object('id',r->>'id','revision',r->'revision','cause','OK','improvement_action','OK','control_note','Checked and ready');
 r:=public.kshms_deviation_command(company,'save',payload);
 readback:=public.kshms_deviation_detail(company,(r->>'id')::uuid)->'case';
 assert readback->>'control_note'='Checked and ready','Save erased the control note';n:=n+1;
 assert readback->>'cause'='OK' and readback->>'improvement_action'='OK','Save lost the other notes';n:=n+1;
 assert readback->>'status'<>'closed' and readback->>'closed_by' is null and readback->>'closed_at' is null,'Saving a note signed the closure';n:=n+1;
 r:=public.kshms_deviation_command(company,'save',jsonb_build_object('id',r->>'id','revision',r->'revision','follow_up','OK'));
 assert r->>'control_note'='Checked and ready','Unrelated save erased the control note';n:=n+1;
 assert public.kshms_deviation_tasks(company)->>'count'='1','Ordinary save removed the task';n:=n+1;
 payload:=jsonb_build_object('id',r->>'id','revision',r->'revision','controlled',true,'cause','OK','improvement_action','OK','control_note','OK');
 foreach field in array array['cause','improvement_action','control_note'] loop
  begin
   perform public.kshms_deviation_command(company,'close',payload||jsonb_build_object(field,'  '));
   raise exception 'Blank closure field accepted';
  exception when others then if sqlerrm='Blank closure field accepted' then raise;end if;n:=n+1;end;
 end loop;
 begin
  perform public.kshms_deviation_command(company,'close',payload||jsonb_build_object('controlled',false));
  raise exception 'Unchecked closure accepted';
 exception when others then if sqlerrm='Unchecked closure accepted' then raise;end if;n:=n+1;end;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 begin perform public.kshms_deviation_command(company,'close',payload);raise exception 'Manager closed the employee case';
 exception when insufficient_privilege then n:=n+1;end;
 perform set_config('request.jwt.claim.sub',employee::text,true);
 -- The latest control text is sent only by close, without an intermediate save.
 r:=public.kshms_deviation_command(company,'close',payload);
 readback:=public.kshms_deviation_detail(company,(r->>'id')::uuid);
 assert readback->'case'->>'status'='closed' and readback->'case'->>'closed_by'=employee::text and readback->'case'->>'closed_at' is not null;n:=n+1;
 assert readback->'case'->>'cause'='OK' and readback->'case'->>'improvement_action'='OK' and readback->'case'->>'control_note'='OK','Direct close did not save the latest text';n:=n+1;
 assert exists(select 1 from jsonb_array_elements(readback->'events') e where e->>'action'='close' and e->'snapshot'->>'control_note'='OK'),'Closure history lost the text';n:=n+1;
 assert public.kshms_deviation_tasks(company)->>'count'='0','Confirmed closure left the task';n:=n+1;
 perform set_config('kshms.save_close.checks',n::text,true);
end $$;
select current_setting('kshms.save_close.checks')::int as passed_checks,'All synthetic data rolls back; no HTTP or email' as result;
rollback;

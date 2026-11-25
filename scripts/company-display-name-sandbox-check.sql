-- Synthetic identities only, no password or provider call. Always rolled back.
begin;
set local statement_timeout='20s';
set local lock_timeout='2s';
do $$declare c uuid:=gen_random_uuid();b uuid:=gen_random_uuid();u uuid;k text;begin
 insert into public.sales_company_scopes(id,normalized_name,display_name) values(c,'company-name-qa-'||c,'Synthetic original firm'),(b,'company-name-qa-'||b,'Synthetic other firm');
 perform set_config('name.qa.company',c::text,true);perform set_config('name.qa.other',b::text,true);
 foreach k in array array['admin','member'] loop
  u:=gen_random_uuid();perform set_config('name.qa.'||k,u::text,true);
  insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data) values(u,'authenticated','authenticated','company-name-qa-'||u||'@example.invalid',now(),now(),'{}','{}');
  insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role) values(u,'company-name-qa-'||u||'@example.invalid','company-name-qa-'||c,true,false,case when k='admin' then 'admin' else 'member' end,case when k='admin' then 'firmaadmin' else 'ansatt' end)
  on conflict(id) do update set company_name=excluded.company_name,approved=true,deactivated=false,role=excluded.role,company_role=excluded.company_role;
  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role) values(c,u,true,case when k='admin' then 'firmaadmin' else 'ansatt' end) on conflict(company_id,user_id) do update set workspace_role=excluded.workspace_role;
  insert into public.user_active_company_scope(user_id,company_id) values(u,c) on conflict(user_id) do update set company_id=excluded.company_id;
  insert into public.user_module_access(user_id,module_key) values(u,'projects') on conflict do nothing;
 end loop;
 perform set_config('name.qa.profiles',(select jsonb_agg(to_jsonb(p) order by id)::text from public.profiles p where id in(current_setting('name.qa.admin')::uuid,current_setting('name.qa.member')::uuid)),true);
 perform set_config('name.qa.memberships',(select jsonb_agg(to_jsonb(m) order by user_id)::text from public.sales_company_memberships m where company_id=c),true);
end$$;
set local role authenticated;
do $$declare c uuid:=current_setting('name.qa.company')::uuid;v jsonb;begin
 perform set_config('request.jwt.claim.sub',current_setting('name.qa.member'),true);
 begin perform public.rename_my_company_display_name(c,'Synthetic original firm','Should be denied');raise exception 'Member was allowed';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub',current_setting('name.qa.admin'),true);
 begin perform public.rename_my_company_display_name(current_setting('name.qa.other')::uuid,'Synthetic other firm','Should be denied');raise exception 'Foreign scope was allowed';exception when insufficient_privilege then null;end;
 begin perform public.rename_my_company_display_name(c,'Stale original','Synthetic renamed firm');raise exception 'Stale name was allowed';exception when serialization_failure then null;end;
 begin perform public.rename_my_company_display_name(c,'Synthetic original firm','Synthetic other firm');raise exception 'Duplicate name was allowed';exception when unique_violation then null;end;
 v:=public.rename_my_company_display_name(c,'Synthetic original firm','Synthetic renamed firm');
 if v->>'companyName'<>'Synthetic renamed firm' or (v->>'companyId')::uuid<>c then raise exception 'Saved readback failed';end if;
 perform set_config('request.jwt.claim.sub',current_setting('name.qa.member'),true);
 if public.get_my_company_profile()->>'companyName'<>'Synthetic renamed firm' then raise exception 'Shared member readback failed';end if;
 insert into public.projects(id,user_id,title,data) values(gen_random_uuid(),auth.uid(),'Synthetic name QA project','{"company":{"companyName":"Spoofed label"}}') returning id into c;
 perform set_config('name.qa.project',c::text,true);
 perform set_config('request.jwt.claim.sub',current_setting('name.qa.admin'),true);
 select jsonb_build_object('id',company_scope_id,'name',data->'company'->>'companyName') into v from public.projects where id=c;
 if v->>'id' is distinct from current_setting('name.qa.company') or v->>'name' is distinct from 'Synthetic renamed firm' then raise exception 'Admin could not read member project under stable scope/new label';end if;
end$$;
reset role;
do $$declare c uuid:=current_setting('name.qa.company')::uuid;begin
 if (select normalized_name from public.sales_company_scopes where id=c)<>'company-name-qa-'||c then raise exception 'Stable identity changed';end if;
 if (select jsonb_agg(to_jsonb(p) order by id) from public.profiles p where id in(current_setting('name.qa.admin')::uuid,current_setting('name.qa.member')::uuid)) is distinct from current_setting('name.qa.profiles')::jsonb then raise exception 'Profiles changed';end if;
 if (select jsonb_agg(to_jsonb(m) order by user_id) from public.sales_company_memberships m where company_id=c) is distinct from current_setting('name.qa.memberships')::jsonb then raise exception 'Memberships changed';end if;
 if has_function_privilege('anon','public.rename_my_company_display_name(uuid,text,text)','execute') or has_function_privilege('service_role','public.rename_my_company_display_name(uuid,text,text)','execute') or not has_function_privilege('authenticated','public.rename_my_company_display_name(uuid,text,text)','execute') then raise exception 'RPC grants wrong';end if;
end$$;
rollback;
select 'PASS: 12 live company-name/role/CAS/identity/ACL and real project-trigger/RLS checks; all synthetic fixtures rolled back' status;

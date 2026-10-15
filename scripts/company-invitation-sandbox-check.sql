-- Dedicated Sandbox only. Random synthetic account; entire signup and invitation roll back. No mail.
begin;
set local statement_timeout='25s';
set local lock_timeout='3s';
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.set_active_work_profile('e0000000-0000-4000-8000-000000000001');
do $$declare u uuid:=gen_random_uuid();email text;result jsonb;begin
 email:='company-invite-access-qa-'||u||'@example.invalid';
 perform set_config('company.invitation.qa.user',u::text,true);perform set_config('company.invitation.qa.email',email,true);
 result:=public.company_admin_invite_with_access('e0000000-0000-4000-8000-000000000001',email,'ansatt',
  '{"module_keys":["sales","store_offers"],"kshms":true,"hr":true,"kshms_role":"reader"}');
 assert result->>'accepted'='false','Expected pending new user';
 assert exists(select 1 from jsonb_array_elements(public.company_admin_snapshot()->'invites') i where i->>'email'=email and i->'access'->>'hr'='true'),'Saved choices missing';
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{}',true);
do $$declare u uuid:=current_setting('company.invitation.qa.user')::uuid;e text:=current_setting('company.invitation.qa.email');begin
 insert into auth.users(id,aud,role,email,created_at,updated_at,raw_app_meta_data,raw_user_meta_data) values(u,'authenticated','authenticated',e,now(),now(),'{}','{}');
 insert into public.profiles(id,email,company_name,approved,deactivated,role,company_role) values(u,e,'',false,false,'member','ansatt')
 on conflict(id) do update set email=excluded.email,company_name='',approved=false,deactivated=false,role='member',company_role='ansatt',system_role=null;
end $$;
select set_config('request.jwt.claim.sub',current_setting('company.invitation.qa.user'),true);
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('company.invitation.qa.user'),'email',current_setting('company.invitation.qa.email'),'role','authenticated')::text,true);
set local role authenticated;
do $$declare result jsonb;begin
 result:=public.accept_company_user_invite();assert result->>'accepted'='true','Invitation acceptance failed';
 result:=public.get_my_module_access();
 assert (result->'module_keys') @> '["sales","store_offers"]'::jsonb,'Chosen main modules absent';
 assert not (result->'module_keys' ? 'projects'),'Unchecked Projects was implicitly seeded';
 assert public.get_my_work_profile_state()->>'primary_company_id'='e0000000-0000-4000-8000-000000000001','Wrong primary company';
end $$;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$declare result jsonb;begin
 result:=public.people_modules_user_get('e0000000-0000-4000-8000-000000000001',current_setting('company.invitation.qa.user')::uuid);
 assert result->>'hr'='true' and result->>'kshms'='true','Chosen people grants absent';
end $$;
reset role;
select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$declare own uuid;result jsonb;begin
 own:=public.current_primary_company_scope_id();
 result:=public.company_admin_snapshot();assert result->>'company_id'=own::text,'Pro customer did not stay in own company';
 assert result->>'is_systemadmin'='false','Pro customer unexpectedly is systemadmin';
 assert result->>'can_switch_company'='false','Ordinary customer got company switching';
 begin perform public.company_admin_snapshot('e0000000-0000-4000-8000-000000000001');raise exception 'Pro customer accessed another firm';exception when insufficient_privilege then null;end;
 begin perform public.set_active_work_profile('e0000000-0000-4000-8000-000000000001');raise exception 'Pro customer switched to internal firm';exception when insufficient_privilege then null;end;
 begin perform public.set_managed_work_profiles(auth.uid(),array['e0000000-0000-4000-8000-000000000001']::uuid[]);raise exception 'Pro customer granted own workspaces';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select not exists(select 1 from auth.users where email like 'company-invite-access-qa-%@example.invalid') as clean;

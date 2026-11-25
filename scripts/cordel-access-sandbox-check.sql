-- Sandbox only. All fixture mutations roll back; no persistent user grants.
begin;
do $$
declare admin_id uuid; user_id uuid; original_company text; n bigint;
begin
 select id into admin_id from public.profiles where system_role='systemadmin' and approved and not coalesce(deactivated,false) limit 1;
 select p.id,p.company_name into user_id,original_company from public.profiles p join public.sales_company_scopes s on s.normalized_name=public.sales_normalize_company_name(p.company_name) where p.system_role is distinct from 'systemadmin' and p.approved and not coalesce(p.deactivated,false) limit 1;
 assert admin_id is not null and user_id is not null, 'Need Sandbox admin/user fixtures';
 select count(*) into n from public.user_feature_access;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 assert public.get_cordel_export_access(), 'Active Systemadmin must have access';
 perform public.set_cordel_export_access(user_id,false);
 assert not public.get_cordel_export_access(user_id), 'Revocation failed';
 perform public.set_cordel_export_access(user_id,true);
 perform set_config('request.jwt.claim.sub',user_id::text,true);
 assert public.get_cordel_export_access(), 'Granted user denied';
 begin
  perform public.set_cordel_export_access(user_id,true);
  raise exception 'Ordinary user could grant access';
 exception when insufficient_privilege then null;
 end;
 begin
  perform public.get_cordel_export_access(admin_id);
  raise exception 'Ordinary user could read another user';
 exception when insufficient_privilege then null;
 end;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 update public.profiles set company_role='firmaadmin' where id=user_id;
 perform set_config('request.jwt.claim.sub',user_id::text,true);
 begin
  perform public.set_cordel_export_access(user_id,true);
  raise exception 'Firmaadmin could grant access';
 exception when insufficient_privilege then null;
 end;
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 update public.profiles set company_name='Cordel QA changed firm' where id=user_id;
 perform set_config('request.jwt.claim.sub',user_id::text,true);
 assert not public.get_cordel_export_access(), 'Grant leaked across firm change';
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 update public.profiles set company_name=original_company,deactivated=true where id=user_id;
 perform set_config('request.jwt.claim.sub',user_id::text,true);
 assert not public.get_cordel_export_access(), 'Deactivated user allowed';
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 update public.profiles set deactivated=false,approved=false where id=user_id;
 perform set_config('request.jwt.claim.sub',user_id::text,true);
 assert not public.get_cordel_export_access(), 'Unapproved user allowed';
 perform set_config('request.jwt.claim.sub','',true);
 assert not public.get_cordel_export_access(), 'Anonymous access allowed';
 assert (select count(*) from public.user_feature_access)=n, 'Price grants changed';
 assert not has_table_privilege('authenticated','public.cordel_export_user_access','SELECT,INSERT,UPDATE,DELETE'), 'Direct table privileges';
 assert not has_function_privilege('anon','public.get_cordel_export_access(uuid)','EXECUTE'), 'Anonymous RPC enabled';
end $$;
rollback;
select 'Cordel access scenarios passed; all mutations rolled back' as result;

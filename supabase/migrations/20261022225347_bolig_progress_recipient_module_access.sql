-- Mirror the existing projects entitlement for non-current recipients without
-- impersonating them. Company, profile and Bolig-role checks are preserved.
create or replace function bolig_private.progress_member(c uuid,u uuid) returns boolean language sql stable set search_path='' as $$
 select exists(select 1 from public.profiles p join public.sales_company_memberships m on m.user_id=p.id
 join bolig_private.firms f on f.company_id=m.company_id and f.enabled
 left join bolig_private.member_access a on a.company_id=c and a.user_id=u
 where p.id=u and m.company_id=c and p.approved and not coalesce(p.deactivated,false)
 and p.role in('admin','member','ansatt','firmaadmin')
 and (p.system_role='systemadmin' or exists(select 1 from public.user_module_access modules where modules.user_id=p.id and modules.module_key='projects'))
 and (m.workspace_role='firmaadmin' or (m.workspace_role='ansatt' and a.access_role in('manager','reader'))))
$$;
revoke all on function bolig_private.progress_member(uuid,uuid) from public,anon,authenticated,service_role;
notify pgrst,'reload schema';

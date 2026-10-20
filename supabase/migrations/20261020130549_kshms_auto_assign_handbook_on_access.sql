-- Assignment follows existing, authorized access writes. No grant, publication,
-- acknowledgment or historical rewrite is performed by the helpers.
create function kshms_private.assign_current_handbook(c uuid,u uuid,actor uuid default null)
returns integer language plpgsql security definer set search_path='' as $$
declare added integer;by_user uuid;
begin
 -- Match publication's firm lock so access and publication cannot miss each other.
 perform 1 from public.company_module_access where company_id=c and module_key='kshms' and enabled for update;
 if not found or not exists(
  select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
  left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id
  where m.company_id=c and m.user_id=u and p.approved and not coalesce(p.deactivated,false)
  and p.role in ('admin','member','ansatt','firmaadmin') and (m.workspace_role='firmaadmin' or a.enabled)
 ) then return 0;end if;
 select id into by_user from public.profiles where id=actor;
 by_user:=coalesce(by_user,u);
 insert into public.kshms_assignments(company_id,version_id,user_id,assigned_by)
 select c,v.id,u,by_user from public.kshms_routines r
 cross join lateral(select id from public.kshms_versions where company_id=c and routine_id=r.id order by number desc limit 1) v
 where r.company_id=c and not r.archived
 on conflict(version_id,user_id) do nothing;
 get diagnostics added=row_count;
 if added>0 then
  insert into public.kshms_audit(company_id,actor_id,action,object_id) values(c,by_user,'auto_assign_current_handbook',u);
 end if;
 return added;
end $$;

create function kshms_private.on_handbook_access() returns trigger
language plpgsql security definer set search_path='' as $$
declare member record;
begin
 if tg_table_name='kshms_member_access' then
  perform kshms_private.assign_current_handbook(new.company_id,new.user_id,new.changed_by);
 elsif tg_table_name='sales_company_memberships' then
  perform kshms_private.assign_current_handbook(new.company_id,new.user_id,auth.uid());
 elsif tg_table_name='profiles' then
  for member in select company_id from public.sales_company_memberships where user_id=new.id order by company_id loop
   perform kshms_private.assign_current_handbook(member.company_id,new.id,auth.uid());
  end loop;
 elsif tg_table_name='company_module_access' then
  for member in select user_id from public.sales_company_memberships where company_id=new.company_id order by user_id loop
   perform kshms_private.assign_current_handbook(new.company_id,member.user_id,auth.uid());
  end loop;
 end if;
 return new;
end $$;

-- Private SECURITY DEFINER helpers are needed by authorized writes to otherwise
-- RPC-only tables. They are never directly callable by API roles.
revoke all on function kshms_private.assign_current_handbook(uuid,uuid,uuid),kshms_private.on_handbook_access()
 from public,anon,authenticated,service_role;
create trigger kshms_auto_assign_member_access after insert or update of enabled,role on public.kshms_member_access
 for each row when(new.enabled=true) execute function kshms_private.on_handbook_access();
create trigger kshms_auto_assign_membership after insert or update of workspace_role on public.sales_company_memberships
 for each row execute function kshms_private.on_handbook_access();
create trigger kshms_auto_assign_profile after insert or update of approved,deactivated,role on public.profiles
 for each row when(new.approved=true and not coalesce(new.deactivated,false) and new.role in ('admin','member','ansatt','firmaadmin'))
 execute function kshms_private.on_handbook_access();
create trigger kshms_auto_assign_company_access after insert or update of enabled on public.company_module_access
 for each row when(new.module_key='kshms' and new.enabled=true) execute function kshms_private.on_handbook_access();

-- Kenneth requested existing employees as well. Fill only missing assignments for
-- currently entitled, active internal members; the helper rechecks every pair.
-- Published content, access and employee acknowledgments are never altered.
do $$declare member record;begin
 for member in
  select m.company_id,m.user_id from public.sales_company_memberships m
  join public.profiles p on p.id=m.user_id
  join public.company_module_access ca on ca.company_id=m.company_id and ca.module_key='kshms' and ca.enabled
  left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id
  where p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin')
  and (m.workspace_role='firmaadmin' or a.enabled) order by m.company_id,m.user_id
 loop perform kshms_private.assign_current_handbook(member.company_id,member.user_id,null);end loop;
end$$;

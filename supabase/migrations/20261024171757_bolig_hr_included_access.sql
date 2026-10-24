-- Bolig includes HR module access for its active internal users. This is a
-- derived entitlement, not an employee registration, leader or readership grant.
-- No existing module grants, firm setup, time rows or personal records are changed.
-- A missing leader must produce FALSE, never SQL NULL: native callers use NOT
-- can_read(...) to deny detail reads. Preserve all legitimate readership paths.
create or replace function hr_private.can_read(c uuid,e hr_private.employees,u uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select e.company_id=c and hr_private.active_member(c,e.user_id) and hr_private.active_member(c,u)
 and (e.user_id=u or coalesce(e.leader_id=u,false) or exists(select 1 from public.sales_company_memberships m
 where m.company_id=c and m.user_id=u and m.workspace_role='firmaadmin')
 or exists(select 1 from hr_private.readers r where r.company_id=c and r.employee_id=e.id and r.user_id=u))
$$;
revoke all on function hr_private.can_read(uuid,hr_private.employees,uuid) from public,anon,authenticated,service_role;

create function bolig_private.hr_included(c uuid,u uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from bolig_private.firms f
  join public.sales_company_memberships m on m.company_id=f.company_id
  join public.profiles p on p.id=m.user_id
  left join bolig_private.member_access a on a.company_id=f.company_id and a.user_id=m.user_id
  where f.company_id=c and f.enabled and m.user_id=u
  and m.workspace_role in ('firmaadmin','ansatt') and p.approved and not coalesce(p.deactivated,false)
  and p.role in ('admin','member','ansatt','firmaadmin')
  and (m.workspace_role='firmaadmin' or a.access_role in ('reader','manager'))
  and (p.system_role='systemadmin' or exists(select 1 from public.user_module_access g where g.user_id=u and g.module_key='projects'))
 )
$$;
revoke all on function bolig_private.hr_included(uuid,uuid) from public,anon,authenticated,service_role;

create or replace function hr_private.has_module_access(c uuid,u uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select hr_private.active_member(c,u) and (
  bolig_private.hr_included(c,u) or (
   exists(select 1 from public.company_module_access where company_id=c and module_key='hr' and enabled)
   and (exists(select 1 from public.sales_company_memberships where company_id=c and user_id=u and workspace_role='firmaadmin')
    or exists(select 1 from hr_private.module_access where company_id=c and user_id=u and enabled))
  )
 )
$$;
revoke all on function hr_private.has_module_access(uuid,uuid) from public,anon,authenticated,service_role;

-- Include the source in administrative metadata. Raw standalone grants remain
-- unchanged, so existing CAS setters preserve them independently of the bundle.
create or replace function public.people_modules_company_get(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform kshms_private.require_module_manager(p_company_id);
 return jsonb_build_object('company_id',p_company_id,
  'kshms',coalesce((select enabled from public.company_module_access where company_id=p_company_id and module_key='kshms'),false),
  'hr',coalesce((select enabled from public.company_module_access where company_id=p_company_id and module_key='hr'),false),
  'bolig_hr_included',exists(select 1 from bolig_private.firms where company_id=p_company_id and enabled));
end $$;
create or replace function public.people_modules_user_get(p_company_id uuid,p_user_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r text;x jsonb;
begin
 perform kshms_private.require_module_manager(p_company_id);
 select m.workspace_role into r from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
 where m.company_id=p_company_id and m.user_id=p_user_id and m.workspace_role in ('firmaadmin','ansatt') and p.role in ('admin','member','ansatt','firmaadmin');
 if r is null then raise exception 'Brukeren er ikke intern medarbeider i dette firmaet.' using errcode='42501';end if;
 if not public.current_profile_is_systemadmin() and exists(select 1 from public.profiles where id=p_user_id and system_role='systemadmin')
 then raise exception 'Bare systemadministrator kan endre denne brukeren.' using errcode='42501';end if;
 x:=public.people_modules_company_get(p_company_id);
 return jsonb_build_object('company_id',p_company_id,'user_id',p_user_id,'company',x,'firmaadmin',r='firmaadmin',
  'kshms',coalesce((select enabled from public.kshms_member_access where company_id=p_company_id and user_id=p_user_id),false),
  'kshms_role',coalesce((select role from public.kshms_member_access where company_id=p_company_id and user_id=p_user_id),'reader'),
  'hr',coalesce((select enabled from hr_private.module_access where company_id=p_company_id and user_id=p_user_id),false),
  'bolig_hr_included',hr_private.active_member(p_company_id,p_user_id) and bolig_private.hr_included(p_company_id,p_user_id));
end $$;
revoke all on function public.people_modules_company_get(uuid),public.people_modules_user_get(uuid,uuid) from public,anon,service_role;
grant execute on function public.people_modules_company_get(uuid),public.people_modules_user_get(uuid,uuid) to authenticated;

-- Extend only the HR metadata predicate. Preserve progress/attendance and every
-- existing navigation, management and membership gate in the installed function.
do $patch$
declare body text;anchor text:='hr:=exists(select 1 from public.company_module_access where company_id=c and module_key=''hr'' and enabled);';
begin
 body:=pg_get_functiondef('public.get_my_personal_context()'::regprocedure);
 if position(anchor in body)=0 then raise exception 'Missing personal HR metadata anchor';end if;
 execute replace(body,anchor,'hr:=exists(select 1 from public.company_module_access where company_id=c and module_key=''hr'' and enabled) or (hr_private.active_member(c,u) and bolig_private.hr_included(c,u));');
end$patch$;

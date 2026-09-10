-- Expo ProffDok – FASE 41B.3
-- Systemadmin-oversikten trenger status/rolle for å vise arbeidsprofilkontroller
-- bare på godkjente, aktive ordinære brukere.

create or replace function public.list_managed_work_profiles()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case when not public.current_profile_is_systemadmin() then
    jsonb_build_object('is_systemadmin',false,'companies','[]'::jsonb,'users','[]'::jsonb)
  else jsonb_build_object(
    'is_systemadmin',true,
    'companies', coalesce((
      select jsonb_agg(jsonb_build_object('company_id',s.id,'company_name',s.display_name) order by s.display_name)
      from public.sales_company_scopes s
      where public.is_internal_work_profile_company(s.id)
    ), '[]'::jsonb),
    'users', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id',p.id,
        'email',p.email,
        'company_name',p.company_name,
        'system_role',p.system_role,
        'approved',coalesce(p.approved,false),
        'deactivated',coalesce(p.deactivated,false),
        'primary_company_id',(
          select s.id from public.sales_company_scopes s
          where s.normalized_name=public.sales_normalize_company_name(p.company_name)
          limit 1
        ),
        'workspace_company_ids',coalesce((
          select jsonb_agg(m.company_id order by m.is_primary desc,m.created_at)
          from public.sales_company_memberships m
          where m.user_id=p.id and public.is_internal_work_profile_company(m.company_id)
        ),'[]'::jsonb)
      ) order by lower(coalesce(p.email,'')))
      from public.profiles p
    ), '[]'::jsonb)
  ) end;
$$;

revoke all on function public.list_managed_work_profiles() from public;
grant execute on function public.list_managed_work_profiles() to authenticated;

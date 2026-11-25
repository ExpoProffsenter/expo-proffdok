-- Expo ProffDok – FASE 41B.3
-- Read-only samarbeidsliste for flerfirma-brukere. Returnerer kun prosjekter
-- i serverstyrt aktiv arbeidsprofil som gjeldende bruker allerede har RLS-tilgang til.

create or replace function public.list_active_work_profile_projects()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when auth.uid() is null
      or not public.current_user_has_module_access('projects')
      or not public.current_user_has_multiple_work_profiles()
    then jsonb_build_object(
      'company_id', public.current_active_company_scope_id(),
      'company_name', '',
      'projects', '[]'::jsonb
    )
    else jsonb_build_object(
      'company_id', public.current_active_company_scope_id(),
      'company_name', coalesce((
        select s.display_name
        from public.sales_company_scopes s
        where s.id = public.current_active_company_scope_id()
        limit 1
      ), ''),
      'projects', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'user_id', p.user_id,
            'created_at', p.created_at,
            'updated_at', p.updated_at,
            'locked', p.locked,
            'project', coalesce(p.data->'project', '{}'::jsonb),
            'warranty', coalesce(p.data->'warranty', '{}'::jsonb),
            'project_log', coalesce(p.data->'projectLog', '{}'::jsonb),
            'company_name', coalesce(p.data->'company'->>'companyName', s.display_name, ''),
            'owner_email', coalesce(owner.email, '')
          )
          order by p.updated_at desc nulls last, p.created_at desc
        )
        from public.projects p
        join public.sales_company_scopes s on s.id = p.company_scope_id
        left join public.profiles owner on owner.id = p.user_id
        where p.company_scope_id = public.current_active_company_scope_id()
          and public.project_row_access_allowed(p.company_scope_id, p.user_id)
      ), '[]'::jsonb)
    )
  end;
$$;

revoke all on function public.list_active_work_profile_projects() from public;
grant execute on function public.list_active_work_profile_projects() to authenticated;

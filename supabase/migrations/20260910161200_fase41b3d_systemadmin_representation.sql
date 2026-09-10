-- Expo ProffDok – FASE 41B.3D
-- Systemadministrator kan velge hvilket internt firma som representeres ved nytt arbeid.
-- Dette er ikke supportmodus og gir ikke ekstra medlemskap. Valget lagres i samme
-- serverstyrte aktive firmascope og kan bare peke på Ringside/Expo-gruppens tre firma.

create or replace function public.current_active_company_scope_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when not exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.approved,false) = true
        and coalesce(p.deactivated,false) = false
    ) then null::uuid
    when public.current_profile_is_systemadmin() then coalesce(
      (
        select a.company_id
        from public.user_active_company_scope a
        where a.user_id = auth.uid()
          and public.is_internal_work_profile_company(a.company_id)
        limit 1
      ),
      public.current_primary_company_scope_id()
    )
    else coalesce(
      (
        select a.company_id
        from public.user_active_company_scope a
        join public.sales_company_memberships m
          on m.user_id = a.user_id
         and m.company_id = a.company_id
        where a.user_id = auth.uid()
        limit 1
      ),
      public.current_primary_company_scope_id(),
      (
        select m.company_id
        from public.sales_company_memberships m
        where m.user_id = auth.uid()
        order by m.is_primary desc, m.created_at
        limit 1
      )
    )
  end;
$$;

create or replace function public.get_my_work_profile_state()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with flags as (
    select public.current_profile_is_systemadmin() as is_systemadmin
  ), mine as (
    select
      s.id as company_id,
      s.display_name,
      (s.id = public.current_primary_company_scope_id()) as is_primary,
      'systemadmin'::text as workspace_role,
      s.created_at,
      public.work_profile_company_profile(s.id) as company_profile
    from public.sales_company_scopes s, flags
    where flags.is_systemadmin
      and public.is_internal_work_profile_company(s.id)

    union all

    select
      m.company_id,
      s.display_name,
      m.is_primary,
      m.workspace_role,
      m.created_at,
      public.work_profile_company_profile(m.company_id) as company_profile
    from public.sales_company_memberships m
    join public.sales_company_scopes s on s.id = m.company_id
    cross join flags
    where not flags.is_systemadmin
      and m.user_id = auth.uid()
  ), state as (
    select
      flags.is_systemadmin,
      public.current_primary_company_scope_id() as primary_id,
      public.current_active_company_scope_id() as active_id,
      exists(
        select 1 from public.user_active_company_scope a
        where a.user_id = auth.uid()
      ) as has_explicit_selection,
      count(mine.company_id) filter (
        where public.is_internal_work_profile_company(mine.company_id)
      ) as internal_count
    from flags
    left join mine on true
    group by flags.is_systemadmin
  )
  select jsonb_build_object(
    'is_systemadmin', state.is_systemadmin,
    'primary_company_id', state.primary_id,
    'active_company_id', state.active_id,
    'has_explicit_selection', state.has_explicit_selection,
    'selection_required', (
      not state.is_systemadmin
      and state.internal_count > 1
      and not state.has_explicit_selection
    ),
    'can_switch', (state.internal_count > 1),
    'active_company_profile', public.work_profile_company_profile(state.active_id),
    'workspaces', coalesce((
      select jsonb_agg(jsonb_build_object(
        'company_id', mine.company_id,
        'company_name', mine.display_name,
        'is_primary', mine.is_primary,
        'workspace_role', mine.workspace_role,
        'company_profile', mine.company_profile
      ) order by mine.is_primary desc, mine.display_name)
      from mine
      where public.is_internal_work_profile_company(mine.company_id)
    ), '[]'::jsonb)
  )
  from state;
$$;

create or replace function public.set_active_work_profile(requested_company_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Du er ikke innlogget.' using errcode='42501';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id=auth.uid()
      and coalesce(p.approved,false)=true
      and coalesce(p.deactivated,false)=false
  ) then
    raise exception 'Brukeren er ikke godkjent eller aktiv.' using errcode='42501';
  end if;

  if not public.is_internal_work_profile_company(requested_company_id) then
    raise exception 'Firmabytte er bare aktivert for Ringside/Expo-gruppen.' using errcode='42501';
  end if;

  if not public.current_profile_is_systemadmin() and not exists (
    select 1 from public.sales_company_memberships m
    where m.user_id=auth.uid()
      and m.company_id=requested_company_id
  ) then
    raise exception 'Du har ikke tilgang til denne arbeidsprofilen.' using errcode='42501';
  end if;

  insert into public.user_active_company_scope(user_id,company_id,selected_at)
  values(auth.uid(),requested_company_id,now())
  on conflict(user_id) do update
    set company_id=excluded.company_id,
        selected_at=excluded.selected_at;

  return public.get_my_work_profile_state();
end;
$$;

revoke all on function public.current_active_company_scope_id() from public;
grant execute on function public.current_active_company_scope_id() to authenticated;
revoke all on function public.get_my_work_profile_state() from public;
grant execute on function public.get_my_work_profile_state() to authenticated;
revoke all on function public.set_active_work_profile(uuid) from public;
grant execute on function public.set_active_work_profile(uuid) to authenticated;

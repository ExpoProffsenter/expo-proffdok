-- SANDBOX ONLY: restore the existing main/Production workspace authorization.
-- Discovered during the ordinary-pro-customer invitation boundary check.
-- No company, membership or course data changes; this is not a Production migration.
begin;
set local lock_timeout='3s';
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

-- Expo ProffDok – FASE 41B.3
-- Ekstra arbeidsprofiler kan bare administreres for godkjente, aktive ordinære
-- brukere. Systemadministrator og inaktive/ventende kontoer avvises også server-side.

create or replace function public.set_managed_work_profiles(
  target_user_id uuid,
  requested_company_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile public.profiles%rowtype;
  v_primary_id uuid;
  v_requested uuid[] := coalesce(requested_company_ids,array[]::uuid[]);
  v_desired uuid[] := array[]::uuid[];
  v_id uuid;
begin
  if not public.current_profile_is_systemadmin() then
    raise exception 'Kun systemadministrator kan endre arbeidsprofiler.' using errcode='42501';
  end if;

  select * into v_profile from public.profiles where id=target_user_id;
  if not found then
    raise exception 'Brukeren finnes ikke.';
  end if;

  if coalesce(v_profile.system_role,'') = 'systemadmin' then
    raise exception 'Systemadministrator bruker ikke ekstra arbeidsprofiler.' using errcode='42501';
  end if;

  if not coalesce(v_profile.approved,false) or coalesce(v_profile.deactivated,false) then
    raise exception 'Arbeidsprofiler kan bare gis til godkjente, aktive brukere.' using errcode='42501';
  end if;

  select s.id into v_primary_id
  from public.sales_company_scopes s
  where s.normalized_name=public.sales_normalize_company_name(v_profile.company_name)
  limit 1;

  if v_primary_id is null then
    raise exception 'Brukeren må ha et gyldig primærfirma før arbeidsprofiler kan settes.';
  end if;

  if not public.is_internal_work_profile_company(v_primary_id) then
    if cardinality(v_requested) > 0 then
      raise exception 'Ekstra arbeidsprofiler kan bare gis til brukere i Ringside/Expo-gruppen.' using errcode='42501';
    end if;
    return jsonb_build_object('user_id',target_user_id,'workspace_company_ids','[]'::jsonb);
  end if;

  foreach v_id in array v_requested loop
    if not public.is_internal_work_profile_company(v_id) then
      raise exception 'Ugyldig arbeidsprofil.' using errcode='42501';
    end if;
    if not (v_id = any(v_desired)) then
      v_desired := array_append(v_desired,v_id);
    end if;
  end loop;

  if not (v_primary_id = any(v_desired)) then
    v_desired := array_append(v_desired,v_primary_id);
  end if;

  update public.sales_company_memberships
  set is_primary=false, updated_at=now()
  where user_id=target_user_id;

  foreach v_id in array v_desired loop
    insert into public.sales_company_memberships(
      company_id,user_id,is_primary,workspace_role,granted_by,updated_at
    ) values(
      v_id,
      target_user_id,
      v_id=v_primary_id,
      case when v_id=v_primary_id and v_profile.company_role='firmaadmin' then 'firmaadmin' else 'ansatt' end,
      auth.uid(),
      now()
    )
    on conflict(company_id,user_id) do update set
      is_primary=excluded.is_primary,
      workspace_role=excluded.workspace_role,
      granted_by=excluded.granted_by,
      updated_at=excluded.updated_at;
  end loop;

  delete from public.sales_company_memberships m
  where m.user_id=target_user_id
    and public.is_internal_work_profile_company(m.company_id)
    and not (m.company_id = any(v_desired));

  delete from public.user_active_company_scope a
  where a.user_id=target_user_id
    and not exists (
      select 1 from public.sales_company_memberships m
      where m.user_id=a.user_id and m.company_id=a.company_id
    );

  return jsonb_build_object(
    'user_id',target_user_id,
    'primary_company_id',v_primary_id,
    'workspace_company_ids',to_jsonb(v_desired)
  );
end;
$$;

revoke all on function public.set_managed_work_profiles(uuid,uuid[]) from public;
grant execute on function public.set_managed_work_profiles(uuid,uuid[]) to authenticated;

notify pgrst, 'reload schema';
commit;

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

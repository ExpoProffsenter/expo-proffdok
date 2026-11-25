-- Expo ProffDok – FASE 41B.2A
-- Vanlige brukere kan ha NULL i system_role. Behandle NULL som ikke-systemadmin.

create or replace function public.set_managed_sensitive_access(
  target_user_id uuid,
  p_view_internal_net_prices boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_target public.profiles%rowtype;
  v_company text := '';
  v_target_is_systemadmin boolean := false;
begin
  if v_uid is null or not public.current_profile_is_systemadmin() then
    raise exception 'Kun systemadministrator kan endre tilgang til interne nettopriser.' using errcode='42501';
  end if;

  select * into v_target
  from public.profiles
  where id = target_user_id;

  if v_target.id is null then
    raise exception 'Brukeren finnes ikke.' using errcode='P0002';
  end if;

  v_target_is_systemadmin := coalesce(v_target.system_role,'') = 'systemadmin';
  v_company := public.sales_normalize_company_name(v_target.company_name);

  if coalesce(p_view_internal_net_prices,false)
     and not v_target_is_systemadmin
     and v_company not in (
       public.sales_normalize_company_name('Ringside Rørleggerbedrift AS'),
       public.sales_normalize_company_name('Bademiljø Expo'),
       public.sales_normalize_company_name('Expo Proffsenter')
     ) then
    raise exception 'Nto-pristilgang kan bare gis til brukere i Ringside, Bademiljø Expo eller Expo Proffsenter.' using errcode='42501';
  end if;

  if coalesce(p_view_internal_net_prices,false) and not v_target_is_systemadmin then
    insert into public.user_feature_access (user_id, feature_key, granted_by, updated_at)
    values (target_user_id, 'view_internal_net_prices', v_uid, now())
    on conflict (user_id, feature_key)
    do update set granted_by = excluded.granted_by, updated_at = now();
  else
    delete from public.user_feature_access
    where user_id = target_user_id
      and feature_key = 'view_internal_net_prices';
  end if;

  return jsonb_build_object(
    'user_id', target_user_id,
    'feature_keys', to_jsonb(case
      when v_target_is_systemadmin then array['view_internal_net_prices']::text[]
      when coalesce(p_view_internal_net_prices,false) then array['view_internal_net_prices']::text[]
      else array[]::text[]
    end)
  );
end;
$$;

-- Expo ProffDok – FASE 41B.5C
-- Sikkerhetsgrense for Butikktilbud, Prissøk og internt vareregister.
-- Tilgang krever aktiv/godkjent bruker, eksplisitt store_offers-modul og aktivt
-- firmascope i Ringside/Expo-gruppens tre interne selskaper.
-- Kun systemadministrator kan gi eller fjerne store_offers.

create or replace function public.current_user_has_module_access(p_module_key text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.module_access_valid_key(p_module_key)
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.approved,false) = true
        and coalesce(p.deactivated,false) = false
        and (
          p.system_role = 'systemadmin'
          or exists (
            select 1
            from public.user_module_access uma
            where uma.user_id = p.id
              and uma.module_key = trim(p_module_key)
          )
        )
        and (
          trim(p_module_key) <> 'store_offers'
          or public.is_internal_work_profile_company(public.current_active_company_scope_id())
        )
    );
$$;

create or replace function public.current_user_module_keys()
returns text[]
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    array_agg(k order by case k when 'projects' then 1 when 'sales' then 2 when 'store_offers' then 3 else 99 end),
    array[]::text[]
  )
  from unnest(array['projects','sales','store_offers']::text[]) k
  where public.current_user_has_module_access(k);
$$;

create or replace function public.current_user_has_internal_store_catalog_access()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.is_internal_work_profile_company(public.current_active_company_scope_id())
    and public.current_user_has_module_access('store_offers');
$$;

create or replace function public.current_user_has_internal_store_price_search_access()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.current_user_has_internal_store_catalog_access();
$$;

create or replace function public.set_managed_module_access(
  target_user_id uuid,
  requested_module_keys text[] default array[]::text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_is_systemadmin boolean := false;
  v_is_firmaadmin boolean := false;
  v_actor_company text := '';
  v_target public.profiles%rowtype;
  v_requested text[] := array[]::text[];
  v_actor_keys text[] := array[]::text[];
  v_invalid text;
  v_had_store boolean := false;
  v_wants_store boolean := false;
  v_store_granted_by uuid;
  v_target_company_id uuid;
begin
  if v_uid is null then
    raise exception 'Du må være innlogget.' using errcode='42501';
  end if;

  v_is_systemadmin := public.current_profile_is_systemadmin();
  v_is_firmaadmin := public.current_profile_is_firmaadmin();
  if not v_is_systemadmin and not v_is_firmaadmin then
    raise exception 'Du har ikke tilgang til brukeradministrasjon.' using errcode='42501';
  end if;

  select * into v_target from public.profiles where id = target_user_id;
  if v_target.id is null then
    raise exception 'Brukeren finnes ikke.' using errcode='P0002';
  end if;

  select coalesce(p.company_name,'') into v_actor_company
  from public.profiles p where p.id = v_uid;

  if not v_is_systemadmin then
    if target_user_id = v_uid then
      raise exception 'Firmaadministrator kan ikke endre sin egen modultilgang.' using errcode='42501';
    end if;
    if v_target.system_role = 'systemadmin' then
      raise exception 'Systemadministrator kan ikke endres fra firma.' using errcode='42501';
    end if;
    if public.sales_normalize_company_name(v_target.company_name)
       <> public.sales_normalize_company_name(v_actor_company) then
      raise exception 'Brukeren tilhører ikke ditt firma.' using errcode='42501';
    end if;
  end if;

  select coalesce(array_agg(distinct trim(k) order by trim(k)), array[]::text[])
  into v_requested
  from unnest(coalesce(requested_module_keys, array[]::text[])) k
  where nullif(trim(k),'') is not null;

  select k into v_invalid
  from unnest(v_requested) k
  where not public.module_access_valid_key(k)
  limit 1;
  if v_invalid is not null then
    raise exception 'Ugyldig modultilgang: %', v_invalid using errcode='22023';
  end if;

  if 'store_offers' = any(v_requested) and not ('sales' = any(v_requested)) then
    v_requested := array_append(v_requested, 'sales');
  end if;

  select true, uma.granted_by
  into v_had_store, v_store_granted_by
  from public.user_module_access uma
  where uma.user_id = target_user_id
    and uma.module_key = 'store_offers'
  limit 1;
  v_had_store := coalesce(v_had_store,false);
  v_wants_store := 'store_offers' = any(v_requested);

  if not v_is_systemadmin and v_had_store is distinct from v_wants_store then
    raise exception 'Kun systemadministrator kan gi eller fjerne tilgang til Butikktilbud og Prissøk.' using errcode='42501';
  end if;

  if v_is_systemadmin and v_wants_store and coalesce(v_target.system_role,'') <> 'systemadmin' then
    select s.id into v_target_company_id
    from public.sales_company_scopes s
    where s.normalized_name = public.sales_normalize_company_name(v_target.company_name)
    limit 1;

    if v_target_company_id is null
       or not public.is_internal_work_profile_company(v_target_company_id) then
      raise exception 'Butikktilbud og Prissøk kan bare gis til brukere i Ringside Rørleggerbedrift AS, Bademiljø Expo eller Expo Proffsenter.' using errcode='42501';
    end if;
  end if;

  if not v_is_systemadmin then
    v_actor_keys := public.current_user_module_keys();
    if exists (
      select 1 from unnest(v_requested) k
      where k <> 'store_offers'
        and not (k = any(v_actor_keys))
    ) then
      raise exception 'Du kan bare gi tilgang til moduler du selv har.' using errcode='42501';
    end if;
  end if;

  delete from public.user_module_access
  where user_id = target_user_id;

  insert into public.user_module_access (user_id, module_key, granted_by)
  select
    target_user_id,
    k,
    case
      when k = 'store_offers' and not v_is_systemadmin
        then v_store_granted_by
      else v_uid
    end
  from unnest(v_requested) k;

  return jsonb_build_object(
    'user_id', target_user_id,
    'module_keys', to_jsonb(v_requested)
  );
end;
$$;

revoke all on function public.current_user_has_module_access(text) from public;
grant execute on function public.current_user_has_module_access(text) to authenticated;
revoke all on function public.current_user_module_keys() from public;
grant execute on function public.current_user_module_keys() to authenticated;
revoke all on function public.current_user_has_internal_store_catalog_access() from public;
grant execute on function public.current_user_has_internal_store_catalog_access() to authenticated;
revoke all on function public.current_user_has_internal_store_price_search_access() from public;
grant execute on function public.current_user_has_internal_store_price_search_access() to authenticated;
revoke all on function public.set_managed_module_access(uuid,text[]) from public;
grant execute on function public.set_managed_module_access(uuid,text[]) to authenticated;

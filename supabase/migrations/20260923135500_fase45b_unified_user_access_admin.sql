-- FASE 45B – samlet bruker- og tilgangsadministrasjon.
-- Bevarer eksisterende Production-modeller for godkjenning, firma, roller og interne moduler.
-- Utvider kun store_offers slik at Systemadmin eksplisitt kan gi Enkel ordre/proffkatalog
-- til brukere i firma med aktive proffleverandører, og samler «Din nto pris» på samme brukerkort.

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
          or (
            coalesce(p.system_role,'') <> 'systemadmin'
            and exists (
              select 1 from public.user_module_access sales_access
              where sales_access.user_id = p.id and sales_access.module_key = 'sales'
            )
            and public.company_has_pro_store_catalog_access(public.current_active_company_scope_id())
          )
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

create or replace function public.list_managed_module_access()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_is_systemadmin boolean := false;
  v_is_firmaadmin boolean := false;
  v_company_name text := '';
  v_users jsonb := '[]'::jsonb;
begin
  if v_uid is null then
    raise exception 'Du må være innlogget.' using errcode='42501';
  end if;

  v_is_systemadmin := public.current_profile_is_systemadmin();
  v_is_firmaadmin := public.current_profile_is_firmaadmin();
  if not v_is_systemadmin and not v_is_firmaadmin then
    raise exception 'Du har ikke tilgang til brukeradministrasjon.' using errcode='42501';
  end if;

  select coalesce(p.company_name,'') into v_company_name
  from public.profiles p where p.id = v_uid;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'user_id', p.id,
      'email', p.email,
      'company_name', p.company_name,
      'company_role', p.company_role,
      'system_role', p.system_role,
      'approved', coalesce(p.approved,false),
      'deactivated', coalesce(p.deactivated,false),
      'module_keys', to_jsonb(coalesce((
        select array_agg(uma.module_key order by uma.module_key)
        from public.user_module_access uma where uma.user_id = p.id
      ), array[]::text[])),
      'feature_keys', to_jsonb(case
        when p.system_role = 'systemadmin' then array['view_internal_net_prices']::text[]
        else coalesce((
          select array_agg(ufa.feature_key order by ufa.feature_key)
          from public.user_feature_access ufa where ufa.user_id = p.id
        ), array[]::text[])
      end),
      'company_scope_id', (
        select s.id from public.sales_company_scopes s
        where s.normalized_name = public.sales_normalize_company_name(p.company_name)
        limit 1
      ),
      'company_has_pro_catalog', coalesce((
        select public.company_has_pro_store_catalog_access(s.id)
        from public.sales_company_scopes s
        where s.normalized_name = public.sales_normalize_company_name(p.company_name)
        limit 1
      ), false),
      'pro_net_price_can_view', coalesce((
        select a.can_view_net_price
        from public.sales_company_scopes s
        join public.store_catalog_user_price_access a
          on a.company_id = s.id and a.user_id = p.id
        where s.normalized_name = public.sales_normalize_company_name(p.company_name)
        limit 1
      ), false)
    ) order by coalesce(p.company_name,''), coalesce(p.email,'')
  ), '[]'::jsonb)
  into v_users
  from public.profiles p
  where v_is_systemadmin
     or public.sales_normalize_company_name(p.company_name)
        = public.sales_normalize_company_name(v_company_name);

  return jsonb_build_object(
    'caller_module_keys', to_jsonb(public.current_user_module_keys()),
    'is_systemadmin', v_is_systemadmin,
    'is_firmaadmin', v_is_firmaadmin,
    'company_name', v_company_name,
    'users', v_users
  );
end;
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
  if v_uid is null then raise exception 'Du må være innlogget.' using errcode='42501'; end if;
  v_is_systemadmin := public.current_profile_is_systemadmin();
  v_is_firmaadmin := public.current_profile_is_firmaadmin();
  if not v_is_systemadmin and not v_is_firmaadmin then
    raise exception 'Du har ikke tilgang til brukeradministrasjon.' using errcode='42501';
  end if;

  select * into v_target from public.profiles where id = target_user_id;
  if v_target.id is null then raise exception 'Brukeren finnes ikke.' using errcode='P0002'; end if;
  select coalesce(p.company_name,'') into v_actor_company from public.profiles p where p.id=v_uid;

  if not v_is_systemadmin then
    if target_user_id=v_uid then raise exception 'Firmaadministrator kan ikke endre sin egen modultilgang.' using errcode='42501'; end if;
    if v_target.system_role='systemadmin' then raise exception 'Systemadministrator kan ikke endres fra firma.' using errcode='42501'; end if;
    if public.sales_normalize_company_name(v_target.company_name)<>public.sales_normalize_company_name(v_actor_company) then
      raise exception 'Brukeren tilhører ikke ditt firma.' using errcode='42501';
    end if;
  end if;

  select coalesce(array_agg(distinct trim(k) order by trim(k)),array[]::text[]) into v_requested
  from unnest(coalesce(requested_module_keys,array[]::text[])) k where nullif(trim(k),'') is not null;
  select k into v_invalid from unnest(v_requested) k where not public.module_access_valid_key(k) limit 1;
  if v_invalid is not null then raise exception 'Ugyldig modultilgang: %',v_invalid using errcode='22023'; end if;
  if 'store_offers'=any(v_requested) and not ('sales'=any(v_requested)) then v_requested:=array_append(v_requested,'sales'); end if;

  select true,uma.granted_by into v_had_store,v_store_granted_by
  from public.user_module_access uma where uma.user_id=target_user_id and uma.module_key='store_offers' limit 1;
  v_had_store:=coalesce(v_had_store,false); v_wants_store:='store_offers'=any(v_requested);

  if not v_is_systemadmin and v_had_store is distinct from v_wants_store then
    raise exception 'Kun systemadministrator kan gi eller fjerne tilgang til Butikktilbud / Enkel ordre.' using errcode='42501';
  end if;

  if v_is_systemadmin and v_wants_store and coalesce(v_target.system_role,'')<>'systemadmin' then
    select s.id into v_target_company_id from public.sales_company_scopes s
    where s.normalized_name=public.sales_normalize_company_name(v_target.company_name) limit 1;
    if v_target_company_id is null then
      raise exception 'Brukerens firma mangler gyldig firmascope.' using errcode='42501';
    end if;
    if not public.is_internal_work_profile_company(v_target_company_id)
       and not public.company_has_pro_store_catalog_access(v_target_company_id) then
      raise exception 'Aktiver minst én leverandør for firmaet under Proff vareregister før Enkel ordre gis til brukeren.' using errcode='42501';
    end if;
  end if;

  if not v_is_systemadmin then
    v_actor_keys:=public.current_user_module_keys();
    if exists(select 1 from unnest(v_requested) k where k<>'store_offers' and not(k=any(v_actor_keys))) then
      raise exception 'Du kan bare gi tilgang til moduler du selv har.' using errcode='42501';
    end if;
  end if;

  delete from public.user_module_access where user_id=target_user_id;
  insert into public.user_module_access(user_id,module_key,granted_by)
  select target_user_id,k,case when k='store_offers' and not v_is_systemadmin then v_store_granted_by else v_uid end
  from unnest(v_requested) k;

  if not v_wants_store then
    delete from public.store_catalog_user_price_access where user_id=target_user_id;
  end if;

  return jsonb_build_object('user_id',target_user_id,'module_keys',to_jsonb(v_requested));
end;
$$;

create or replace function public.set_managed_pro_catalog_net_price_access(
  target_user_id uuid,
  p_can_view boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid:=auth.uid();
  v_target public.profiles%rowtype;
  v_company_id uuid;
begin
  if v_uid is null or not public.current_profile_is_systemadmin() then
    raise exception 'Kun systemadministrator kan endre «Din nto pris» her.' using errcode='42501';
  end if;
  select * into v_target from public.profiles where id=target_user_id;
  if v_target.id is null then raise exception 'Brukeren finnes ikke.' using errcode='P0002'; end if;
  select s.id into v_company_id from public.sales_company_scopes s
  where s.normalized_name=public.sales_normalize_company_name(v_target.company_name) limit 1;
  if v_company_id is null then raise exception 'Brukerens firma mangler gyldig firmascope.' using errcode='42501'; end if;

  if coalesce(p_can_view,false) then
    if not public.company_has_pro_store_catalog_access(v_company_id) then
      raise exception 'Firmaet har ingen aktive leverandører i Proff vareregister.' using errcode='42501';
    end if;
    if not exists(select 1 from public.user_module_access where user_id=target_user_id and module_key='sales')
       or not exists(select 1 from public.user_module_access where user_id=target_user_id and module_key='store_offers') then
      raise exception 'Gi brukeren tilgang til Befaring/Tilbud og Enkel ordre før «Din nto pris» aktiveres.' using errcode='42501';
    end if;
  end if;

  insert into public.store_catalog_user_price_access(company_id,user_id,can_view_net_price,updated_by,updated_at)
  values(v_company_id,target_user_id,coalesce(p_can_view,false),v_uid,now())
  on conflict(company_id,user_id) do update
    set can_view_net_price=excluded.can_view_net_price,updated_by=v_uid,updated_at=now();

  return jsonb_build_object('user_id',target_user_id,'company_id',v_company_id,'can_view_net_price',coalesce(p_can_view,false));
end;
$$;

revoke all on function public.current_user_has_module_access(text) from public,anon;
revoke all on function public.current_user_module_keys() from public,anon;
revoke all on function public.list_managed_module_access() from public,anon;
revoke all on function public.set_managed_module_access(uuid,text[]) from public,anon;
revoke all on function public.set_managed_pro_catalog_net_price_access(uuid,boolean) from public,anon;
grant execute on function public.current_user_has_module_access(text) to authenticated;
grant execute on function public.current_user_module_keys() to authenticated;
grant execute on function public.list_managed_module_access() to authenticated;
grant execute on function public.set_managed_module_access(uuid,text[]) to authenticated;
grant execute on function public.set_managed_pro_catalog_net_price_access(uuid,boolean) to authenticated;

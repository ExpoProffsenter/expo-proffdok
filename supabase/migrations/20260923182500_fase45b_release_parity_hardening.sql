-- Expo ProffDok – FASE 45B release parity / hardening
--
-- Dette er siste idempotente normaliseringsmigrasjon før Production-kandidat.
-- Den gjør repo-migrasjonene uavhengige av mellomliggende Sandbox-hotfixer og
-- låser eksplisitt ned klientkall/grants. Ingen demo-/testdata opprettes her.

-- Interne hjelpefunksjoner skal ikke kunne kalles direkte av klientroller.
revoke all on function public.current_sales_company_id() from public, anon, authenticated;
revoke all on function public.company_has_pro_store_catalog_access(uuid) from public, anon, authenticated;

-- En mellomliggende Sandbox-hotfix introduserte denne eksplisitte firma-hjelperen.
-- Klienten bruker current_user_can_view_store_catalog_net_price(); fjern derfor
-- den foreldreløse varianten slik at ren Production-migrering og Sandbox ender likt.
drop function if exists public.current_user_can_view_pro_catalog_net_price(uuid);

-- Firmaadmin/Systemadmin kan styre «Din nto pris», men kun for en godkjent aktiv
-- bruker i valgt firma som faktisk har både sales + store_offers. Ved avslag kan
-- tilgangen alltid slås av slik at opprydding ikke blokkeres.
create or replace function public.set_store_catalog_user_net_price_access(
  p_company_id uuid,
  p_user_id uuid,
  p_can_view boolean
)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  v_actor_company uuid := public.current_active_company_scope_id();
  v_target public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Du må være innlogget.' using errcode='42501';
  end if;

  if not public.current_profile_is_systemadmin() and not public.current_profile_is_firmaadmin() then
    raise exception 'Du har ikke tilgang til å administrere prisinnsyn.' using errcode='42501';
  end if;

  if p_company_id is null or not exists(
    select 1 from public.sales_company_scopes s where s.id=p_company_id
  ) then
    raise exception 'Firmaet finnes ikke.' using errcode='P0002';
  end if;

  if not exists(
    select 1 from public.sales_company_memberships m
    where m.company_id=p_company_id and m.user_id=p_user_id
  ) then
    raise exception 'Brukeren tilhører ikke valgt firma.' using errcode='42501';
  end if;

  if not public.current_profile_is_systemadmin() and p_company_id<>v_actor_company then
    raise exception 'Du kan bare administrere prisinnsyn i aktivt firma.' using errcode='42501';
  end if;

  if not public.current_profile_is_systemadmin() and p_user_id=auth.uid() then
    raise exception 'Firmaadministrator kan ikke gi seg selv prisinnsyn.' using errcode='42501';
  end if;

  select * into v_target from public.profiles where id=p_user_id;
  if v_target.id is null then
    raise exception 'Brukeren finnes ikke.' using errcode='P0002';
  end if;

  if coalesce(p_can_view,false) then
    if coalesce(v_target.approved,false)=false or coalesce(v_target.deactivated,false)=true then
      raise exception 'Brukeren må være godkjent og aktiv før «Din nto pris» kan aktiveres.' using errcode='42501';
    end if;
    if not public.company_has_pro_store_catalog_access(p_company_id) then
      raise exception 'Firmaet har ingen aktive leverandører i Proff vareregister.' using errcode='42501';
    end if;
    if not exists(
      select 1 from public.user_module_access uma
      where uma.user_id=p_user_id and uma.module_key='sales'
    ) or not exists(
      select 1 from public.user_module_access uma
      where uma.user_id=p_user_id and uma.module_key='store_offers'
    ) then
      raise exception 'Gi brukeren Befaring/Tilbud og Enkel ordre før «Din nto pris» aktiveres.' using errcode='42501';
    end if;
  end if;

  insert into public.store_catalog_user_price_access(
    company_id,user_id,can_view_net_price,updated_by,updated_at
  ) values(
    p_company_id,p_user_id,coalesce(p_can_view,false),auth.uid(),now()
  )
  on conflict(company_id,user_id) do update
    set can_view_net_price=excluded.can_view_net_price,
        updated_by=auth.uid(),
        updated_at=now();

  return jsonb_build_object(
    'user_id',p_user_id,
    'company_id',p_company_id,
    'can_view_net_price',coalesce(p_can_view,false)
  );
end;
$$;

-- Gammel 2-args variant beholdes kun for migreringskompatibilitet, aldri klient.
revoke all on function public.set_store_catalog_user_net_price_access(uuid,boolean)
  from public,anon,authenticated;
revoke all on function public.set_store_catalog_user_net_price_access(uuid,uuid,boolean)
  from public,anon;
grant execute on function public.set_store_catalog_user_net_price_access(uuid,uuid,boolean)
  to authenticated;

-- Valg «Lag enkel ordre / Aktiver som prosjekt» er en mutasjon av salgssaken og
-- skal ikke kunne utføres av en tilfeldig innlogget bruker i samme firma.
create or replace function public.set_simple_order_activation_mode(
  p_request_ref text,
  p_mode text
)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  v_company_id uuid:=public.current_active_company_scope_id();
  v_mode text:=case when lower(trim(coalesce(p_mode,'')))='project' then 'project' else 'simple_order' end;
  v_payload jsonb;
begin
  if auth.uid() is null or v_company_id is null then
    raise exception 'Du har ikke tilgang til salgssaken.' using errcode='42501';
  end if;
  if not public.current_user_has_module_access('sales')
     or not public.current_user_has_module_access('store_offers') then
    raise exception 'Du har ikke tilgang til Enkel ordre.' using errcode='42501';
  end if;

  select r.payload into v_payload
  from public.sales_requests r
  where r.company_id=v_company_id
    and r.request_ref=trim(coalesce(p_request_ref,''))
  for update;

  if v_payload is null then
    raise exception 'Salgssaken finnes ikke.' using errcode='P0002';
  end if;

  if not exists(
    select 1
    from jsonb_array_elements(
      case when jsonb_typeof(v_payload->'offerLines')='array'
        then v_payload->'offerLines' else '[]'::jsonb end
    ) e(elem)
    where coalesce((e.elem->>'simpleOrder')::boolean,false)=true
       or e.elem->>'offerKind'='simple-order-v1'
  ) then
    raise exception 'Salgssaken er ikke en Enkel ordre.' using errcode='22023';
  end if;

  update public.sales_requests
  set payload=jsonb_set(v_payload,'{simpleOrderActivationMode}',to_jsonb(v_mode),true),
      updated_at=now()
  where company_id=v_company_id
    and request_ref=trim(coalesce(p_request_ref,''));

  return jsonb_build_object(
    'request_ref',trim(coalesce(p_request_ref,'')),
    'mode',v_mode
  );
end;
$$;
revoke all on function public.set_simple_order_activation_mode(text,text) from public,anon;
grant execute on function public.set_simple_order_activation_mode(text,text) to authenticated;

-- Normaliser eksplisitt klient-/triggergrants for 45B-overflaten.
revoke all on function public.current_user_can_view_store_catalog_net_price() from public,anon;
grant execute on function public.current_user_can_view_store_catalog_net_price() to authenticated;
revoke all on function public.current_user_has_pro_store_catalog_access() from public,anon;
grant execute on function public.current_user_has_pro_store_catalog_access() to authenticated;
revoke all on function public.list_store_catalog_suppliers() from public,anon;
grant execute on function public.list_store_catalog_suppliers() to authenticated;
revoke all on function public.list_store_catalog_company_scopes() from public,anon;
grant execute on function public.list_store_catalog_company_scopes() to authenticated;
revoke all on function public.set_store_catalog_company_supplier_access(uuid,text,numeric,boolean) from public,anon;
grant execute on function public.set_store_catalog_company_supplier_access(uuid,text,numeric,boolean) to authenticated;
revoke all on function public.list_store_catalog_company_supplier_access(uuid) from public,anon;
grant execute on function public.list_store_catalog_company_supplier_access(uuid) to authenticated;
revoke all on function public.list_store_catalog_user_net_price_access() from public,anon;
grant execute on function public.list_store_catalog_user_net_price_access() to authenticated;
revoke all on function public.search_pro_store_catalog(text,integer) from public,anon;
grant execute on function public.search_pro_store_catalog(text,integer) to authenticated;
revoke all on function public.search_pro_store_catalog_support(uuid,text,integer) from public,anon;
grant execute on function public.search_pro_store_catalog_support(uuid,text,integer) to authenticated;
revoke all on function public.set_managed_pro_catalog_net_price_access(uuid,boolean) from public,anon;
grant execute on function public.set_managed_pro_catalog_net_price_access(uuid,boolean) to authenticated;

revoke all on function public.fase45b_mark_simple_order_project() from public,anon,authenticated;
revoke all on function public.fase45b_block_simple_order_customer_portal() from public,anon,authenticated;
revoke all on function public.fase45b_revoke_customer_portal_on_simple_order() from public,anon,authenticated;
revoke all on function public.fase45b_seed_simple_order_accepted_products() from public,anon,authenticated;

-- Tabellene er RPC-only. RLS + direkte revoke er forsvar i dybden.
alter table public.store_catalog_company_supplier_access enable row level security;
alter table public.store_catalog_user_price_access enable row level security;
revoke all on public.store_catalog_company_supplier_access from anon,authenticated;
revoke all on public.store_catalog_user_price_access from anon,authenticated;

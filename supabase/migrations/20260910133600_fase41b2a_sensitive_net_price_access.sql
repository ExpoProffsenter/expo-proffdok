-- Expo ProffDok – FASE 41B.2A
-- Egen sensitiv brukerrettighet for interne nettopriser.
-- Hovedmoduler og firmatilgang endres ikke.
-- Systemadministrator har alltid tilgang. Nye øvrige brukere får ikke nto-tilgang automatisk.
-- Eksisterende godkjente Butikktilbud-brukere beholder dagens nto-innsyn ved migrering,
-- slik at produksjonsadferd ikke endres før systemadministrator eventuelt fjerner rettigheten.

create table if not exists public.user_feature_access (
  user_id uuid not null references public.profiles(id) on delete cascade,
  feature_key text not null,
  granted_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, feature_key),
  constraint user_feature_access_feature_key_check
    check (feature_key in ('view_internal_net_prices'))
);

alter table public.user_feature_access enable row level security;
revoke all on public.user_feature_access from anon, authenticated;

create or replace function public.feature_access_valid_key(p_feature_key text)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select coalesce(trim(p_feature_key),'') in ('view_internal_net_prices');
$$;

create or replace function public.current_user_has_feature_access(p_feature_key text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.feature_access_valid_key(p_feature_key)
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
            from public.user_feature_access ufa
            where ufa.user_id = p.id
              and ufa.feature_key = trim(p_feature_key)
          )
        )
    );
$$;

-- Bevar eksisterende produksjonsadferd for brukere som allerede kunne se nto i Butikktilbud.
insert into public.user_feature_access (user_id, feature_key, granted_by)
select distinct p.id, 'view_internal_net_prices', null::uuid
from public.profiles p
join public.sales_company_memberships m on m.user_id = p.id
join public.sales_company_scopes s on s.id = m.company_id
join public.user_module_access uma on uma.user_id = p.id and uma.module_key = 'store_offers'
where coalesce(p.approved,false) = true
  and coalesce(p.deactivated,false) = false
  and coalesce(p.system_role,'') <> 'systemadmin'
  and s.normalized_name in (
    public.sales_normalize_company_name('Ringside Rørleggerbedrift AS'),
    public.sales_normalize_company_name('Bademiljø Expo')
  )
on conflict (user_id, feature_key) do nothing;

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
  from public.profiles p
  where p.id = v_uid;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'user_id', p.id,
      'email', p.email,
      'company_name', p.company_name,
      'company_role', p.company_role,
      'system_role', p.system_role,
      'approved', coalesce(p.approved,false),
      'deactivated', coalesce(p.deactivated,false),
      'module_keys', to_jsonb(coalesce(
        (
          select array_agg(uma.module_key order by uma.module_key)
          from public.user_module_access uma
          where uma.user_id = p.id
        ),
        array[]::text[]
      )),
      'feature_keys', to_jsonb(case
        when p.system_role = 'systemadmin' then array['view_internal_net_prices']::text[]
        else coalesce(
          (
            select array_agg(ufa.feature_key order by ufa.feature_key)
            from public.user_feature_access ufa
            where ufa.user_id = p.id
          ),
          array[]::text[]
        )
      end)
    )
    order by coalesce(p.company_name,''), coalesce(p.email,'')
  ), '[]'::jsonb)
  into v_users
  from public.profiles p
  where
    v_is_systemadmin
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

  v_company := public.sales_normalize_company_name(v_target.company_name);

  if coalesce(p_view_internal_net_prices,false)
     and v_target.system_role <> 'systemadmin'
     and v_company not in (
       public.sales_normalize_company_name('Ringside Rørleggerbedrift AS'),
       public.sales_normalize_company_name('Bademiljø Expo'),
       public.sales_normalize_company_name('Expo Proffsenter')
     ) then
    raise exception 'Nto-pristilgang kan bare gis til brukere i Ringside, Bademiljø Expo eller Expo Proffsenter.' using errcode='42501';
  end if;

  if coalesce(p_view_internal_net_prices,false) and v_target.system_role <> 'systemadmin' then
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
      when v_target.system_role = 'systemadmin' then array['view_internal_net_prices']::text[]
      when coalesce(p_view_internal_net_prices,false) then array['view_internal_net_prices']::text[]
      else array[]::text[]
    end)
  );
end;
$$;

-- Butikktilbud: samme søk og samme firmatilgang som før, men sensitive felter maskeres server-side.
create or replace function public.search_internal_store_catalog(
  p_query text,
  p_limit integer default 30
)
returns table (
  id uuid,
  supplier_name text,
  supplier_product_number text,
  description text,
  gtin text,
  nobb_number text,
  product_url text,
  image_url text,
  product_group text,
  price_date date,
  purchase_net_ex_vat numeric,
  customer_price_ex_vat numeric,
  customer_price_incl_vat numeric,
  purchase_discount_percent numeric,
  gross_margin_percent numeric
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_query text := trim(coalesce(p_query,''));
  v_query_lower text := lower(trim(coalesce(p_query,'')));
  v_query_sku text := public.internal_store_catalog_normalize_sku(p_query);
  v_query_gtin text := public.internal_store_catalog_normalize_gtin(p_query);
  v_limit integer := least(greatest(coalesce(p_limit,30),1),50);
  v_can_net boolean := public.current_user_has_feature_access('view_internal_net_prices');
begin
  if not public.current_user_has_internal_store_catalog_access() then
    raise exception 'Du har ikke tilgang til internt vareregister.' using errcode='42501';
  end if;
  if exists(select 1 from public.internal_store_catalog_imports where status in ('loading','ready')) then
    raise exception 'Vareregisteret oppdateres akkurat nå. Prøv igjen når importen er aktivert.' using errcode='55000';
  end if;
  if length(v_query)<2 then return; end if;

  return query
  select
    i.id,i.supplier_name,i.supplier_product_number,i.description,i.gtin,i.nobb_number,
    i.product_url,i.image_url,i.product_group,i.price_date,
    case when v_can_net then i.purchase_net_ex_vat else null end,
    i.customer_price_ex_vat,i.customer_price_incl_vat,
    case when v_can_net then i.purchase_discount_percent else null end,
    case when v_can_net then i.gross_margin_percent else null end
  from public.internal_store_catalog_items i
  join public.internal_store_catalog_imports imp on imp.id=i.last_import_id and imp.status='active'
  where i.is_active=true
    and (
      i.supplier_product_number_key=v_query_sku
      or (v_query_gtin is not null and i.gtin=v_query_gtin)
      or i.search_text ilike '%'||v_query_lower||'%'
    )
  order by
    case
      when i.supplier_product_number_key=v_query_sku then 0
      when v_query_gtin is not null and i.gtin=v_query_gtin then 1
      when i.supplier_product_number_key like v_query_sku||'%' then 2
      else 3
    end,
    i.description,i.supplier_name
  limit v_limit;
end;
$$;

create or replace function public.internal_store_catalog_alternatives(
  p_item_id uuid
)
returns table (
  id uuid,
  supplier_name text,
  supplier_product_number text,
  description text,
  gtin text,
  nobb_number text,
  product_url text,
  image_url text,
  product_group text,
  price_date date,
  purchase_net_ex_vat numeric,
  customer_price_ex_vat numeric,
  customer_price_incl_vat numeric
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_gtin text;
  v_import_id uuid;
  v_can_net boolean := public.current_user_has_feature_access('view_internal_net_prices');
begin
  if not public.current_user_has_internal_store_catalog_access() then
    raise exception 'Du har ikke tilgang til internt vareregister.' using errcode='42501';
  end if;
  if exists(select 1 from public.internal_store_catalog_imports where status in ('loading','ready')) then
    raise exception 'Vareregisteret oppdateres akkurat nå. Prøv igjen når importen er aktivert.' using errcode='55000';
  end if;

  select i.gtin,i.last_import_id into v_gtin,v_import_id
  from public.internal_store_catalog_items i
  join public.internal_store_catalog_imports imp on imp.id=i.last_import_id and imp.status='active'
  where i.id=p_item_id and i.is_active=true;

  if v_gtin is null or v_import_id is null then return; end if;

  return query
  select
    i.id,i.supplier_name,i.supplier_product_number,i.description,i.gtin,i.nobb_number,
    i.product_url,i.image_url,i.product_group,i.price_date,
    case when v_can_net then i.purchase_net_ex_vat else null end,
    i.customer_price_ex_vat,i.customer_price_incl_vat
  from public.internal_store_catalog_items i
  where i.last_import_id=v_import_id and i.is_active=true and i.gtin=v_gtin
  order by
    case when v_can_net then i.purchase_net_ex_vat else i.customer_price_ex_vat end,
    i.supplier_name;
end;
$$;

-- Selvstendig Prissøk: alle tre interne firma kan bruke søket, men nto/rabatt/margin maskeres uten rettighet.
create or replace function public.search_internal_store_catalog_prices(
  p_query text,
  p_limit integer default 30
)
returns table (
  id uuid,
  supplier_name text,
  supplier_product_number text,
  description text,
  gtin text,
  nobb_number text,
  product_url text,
  image_url text,
  product_group text,
  price_date date,
  purchase_net_ex_vat numeric,
  customer_price_ex_vat numeric,
  customer_price_incl_vat numeric,
  purchase_discount_percent numeric,
  gross_margin_percent numeric
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_query text := trim(coalesce(p_query,''));
  v_query_lower text := lower(trim(coalesce(p_query,'')));
  v_query_sku text := public.internal_store_catalog_normalize_sku(p_query);
  v_query_gtin text := public.internal_store_catalog_normalize_gtin(p_query);
  v_limit integer := least(greatest(coalesce(p_limit,30),1),50);
  v_can_net boolean := public.current_user_has_feature_access('view_internal_net_prices');
begin
  if not public.current_user_has_internal_store_price_search_access() then
    raise exception 'Du har ikke tilgang til Prissøk.' using errcode='42501';
  end if;
  if exists(select 1 from public.internal_store_catalog_imports where status in ('loading','ready')) then
    raise exception 'Vareregisteret oppdateres akkurat nå. Prøv igjen når importen er aktivert.' using errcode='55000';
  end if;
  if length(v_query)<2 then return; end if;

  return query
  select
    i.id,i.supplier_name,i.supplier_product_number,i.description,i.gtin,i.nobb_number,
    i.product_url,i.image_url,i.product_group,i.price_date,
    case when v_can_net then i.purchase_net_ex_vat else null end,
    i.customer_price_ex_vat,i.customer_price_incl_vat,
    case when v_can_net then i.purchase_discount_percent else null end,
    case when v_can_net then i.gross_margin_percent else null end
  from public.internal_store_catalog_items i
  join public.internal_store_catalog_imports imp on imp.id=i.last_import_id and imp.status='active'
  where i.is_active=true
    and (
      i.supplier_product_number_key=v_query_sku
      or (v_query_gtin is not null and i.gtin=v_query_gtin)
      or i.search_text ilike '%'||v_query_lower||'%'
    )
  order by
    case
      when i.supplier_product_number_key=v_query_sku then 0
      when v_query_gtin is not null and i.gtin=v_query_gtin then 1
      when i.supplier_product_number_key like v_query_sku||'%' then 2
      else 3
    end,
    i.description,i.supplier_name
  limit v_limit;
end;
$$;

revoke all on function public.current_user_has_feature_access(text) from public, anon;
revoke all on function public.set_managed_sensitive_access(uuid,boolean) from public, anon;
grant execute on function public.current_user_has_feature_access(text) to authenticated;
grant execute on function public.set_managed_sensitive_access(uuid,boolean) to authenticated;

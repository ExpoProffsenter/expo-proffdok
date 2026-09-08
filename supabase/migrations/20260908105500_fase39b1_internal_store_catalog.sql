-- Expo ProffDok – FASE 39B.1
-- Internt vareregister for Ringside Rørleggerbedrift AS og Bademiljø Expo.
-- Nettopris er en egen intern sikkerhetssone og lagres aldri i kunde-/tilbuds-JSON.
-- ERP-import skjer via staging og atomisk aktivering. Eksisterende publiserte/aksepterte tilbud berøres ikke.

create extension if not exists pg_trgm with schema extensions;

create table if not exists public.internal_store_catalog_imports (
  id uuid primary key default gen_random_uuid(),
  source_filename text not null,
  source_size_bytes bigint null,
  source_sha256 text null,
  status text not null default 'loading',
  total_rows bigint not null default 0,
  accepted_rows bigint not null default 0,
  skipped_zero_price_rows bigint not null default 0,
  skipped_missing_sku_rows bigint not null default 0,
  malformed_rows bigint not null default 0,
  duplicate_rows bigint not null default 0,
  imported_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  activated_at timestamptz null,
  constraint internal_store_catalog_imports_status_check
    check (status in ('loading','active','archived','cancelled','failed'))
);

create table if not exists public.internal_store_catalog_stage (
  import_id uuid not null references public.internal_store_catalog_imports(id) on delete cascade,
  supplier_name text not null,
  supplier_key text not null,
  supplier_product_number text not null,
  supplier_product_number_key text not null,
  supplier_list_price_ex_vat numeric(14,2) null,
  purchase_discount_percent numeric(9,4) null,
  purchase_net_ex_vat numeric(14,2) not null,
  markup_percent numeric(9,4) null,
  gross_margin_percent numeric(9,4) null,
  customer_price_ex_vat numeric(14,2) not null,
  customer_price_incl_vat numeric(14,2) not null,
  product_group text null,
  price_date date null,
  source_flag_1 boolean not null default false,
  source_flag_2 boolean not null default false,
  source_flag_3 boolean not null default false,
  source_flag_4 boolean not null default false,
  description text not null default '',
  gtin text null,
  source_line_no bigint null,
  primary key (import_id, supplier_key, supplier_product_number_key)
);

create table if not exists public.internal_store_catalog_items (
  id uuid primary key default gen_random_uuid(),
  supplier_name text not null,
  supplier_key text not null,
  supplier_product_number text not null,
  supplier_product_number_key text not null,
  supplier_list_price_ex_vat numeric(14,2) null,
  purchase_discount_percent numeric(9,4) null,
  purchase_net_ex_vat numeric(14,2) not null,
  markup_percent numeric(9,4) null,
  gross_margin_percent numeric(9,4) null,
  customer_price_ex_vat numeric(14,2) not null,
  customer_price_incl_vat numeric(14,2) not null,
  product_group text null,
  price_date date null,
  source_flag_1 boolean not null default false,
  source_flag_2 boolean not null default false,
  source_flag_3 boolean not null default false,
  source_flag_4 boolean not null default false,
  description text not null default '',
  gtin text null,
  nobb_number text null,
  product_url text null,
  image_url text null,
  search_text text not null default '',
  is_active boolean not null default true,
  last_import_id uuid not null references public.internal_store_catalog_imports(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint internal_store_catalog_items_positive_prices
    check (
      purchase_net_ex_vat > 0
      and customer_price_ex_vat > 0
      and customer_price_incl_vat > 0
    ),
  constraint internal_store_catalog_items_supplier_sku_uq
    unique (supplier_key, supplier_product_number_key)
);

create index if not exists internal_store_catalog_items_active_idx
  on public.internal_store_catalog_items (is_active);
create index if not exists internal_store_catalog_items_gtin_idx
  on public.internal_store_catalog_items (gtin)
  where is_active = true and gtin is not null;
create index if not exists internal_store_catalog_items_supplier_sku_idx
  on public.internal_store_catalog_items (supplier_key, supplier_product_number_key)
  where is_active = true;
create index if not exists internal_store_catalog_items_search_trgm_idx
  on public.internal_store_catalog_items
  using gin (search_text extensions.gin_trgm_ops);

alter table public.internal_store_catalog_imports enable row level security;
alter table public.internal_store_catalog_stage enable row level security;
alter table public.internal_store_catalog_items enable row level security;

revoke all on public.internal_store_catalog_imports from anon, authenticated;
revoke all on public.internal_store_catalog_stage from anon, authenticated;
revoke all on public.internal_store_catalog_items from anon, authenticated;

grant select on public.internal_store_catalog_imports to authenticated;
grant select on public.internal_store_catalog_items to authenticated;

create or replace function public.current_user_has_internal_store_catalog_access()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    join public.sales_company_memberships m on m.user_id = p.id
    join public.sales_company_scopes s on s.id = m.company_id
    where p.id = auth.uid()
      and coalesce(p.approved,false) = true
      and coalesce(p.deactivated,false) = false
      and public.current_user_has_module_access('store_offers')
      and s.normalized_name in (
        public.sales_normalize_company_name('Ringside Rørleggerbedrift AS'),
        public.sales_normalize_company_name('Bademiljø Expo')
      )
  );
$$;

create or replace function public.current_user_can_manage_internal_store_catalog()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.current_user_has_internal_store_catalog_access()
    and (
      public.current_profile_is_systemadmin()
      or public.current_profile_is_firmaadmin()
    );
$$;

drop policy if exists internal_store_catalog_imports_select_allowed
  on public.internal_store_catalog_imports;
create policy internal_store_catalog_imports_select_allowed
on public.internal_store_catalog_imports
for select
to authenticated
using (public.current_user_has_internal_store_catalog_access());

drop policy if exists internal_store_catalog_items_select_allowed
  on public.internal_store_catalog_items;
create policy internal_store_catalog_items_select_allowed
on public.internal_store_catalog_items
for select
to authenticated
using (public.current_user_has_internal_store_catalog_access());

create or replace function public.internal_store_catalog_normalize_supplier(value text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select lower(regexp_replace(trim(coalesce(value,'')), '\s+', ' ', 'g'));
$$;

create or replace function public.internal_store_catalog_normalize_sku(value text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select upper(trim(coalesce(value,'')));
$$;

create or replace function public.internal_store_catalog_normalize_gtin(value text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select nullif(regexp_replace(coalesce(value,''), '\D', '', 'g'),'');
$$;

create or replace function public.internal_store_catalog_refresh_search_text()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.supplier_key := public.internal_store_catalog_normalize_supplier(new.supplier_name);
  new.supplier_product_number_key := public.internal_store_catalog_normalize_sku(new.supplier_product_number);
  new.gtin := public.internal_store_catalog_normalize_gtin(new.gtin);
  new.search_text := lower(concat_ws(
    ' ',
    new.supplier_name,
    new.supplier_product_number,
    new.description,
    new.gtin,
    new.nobb_number,
    new.product_group
  ));
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists internal_store_catalog_items_refresh_search_text
  on public.internal_store_catalog_items;
create trigger internal_store_catalog_items_refresh_search_text
before insert or update of
  supplier_name,
  supplier_product_number,
  description,
  gtin,
  nobb_number,
  product_group
on public.internal_store_catalog_items
for each row
execute function public.internal_store_catalog_refresh_search_text();

create or replace function public.begin_internal_store_catalog_import(
  p_source_filename text,
  p_source_size_bytes bigint default null,
  p_source_sha256 text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til å oppdatere internt vareregister.'
      using errcode = '42501';
  end if;

  if nullif(trim(coalesce(p_source_filename,'')),'') is null then
    raise exception 'Filnavn mangler.' using errcode = '22023';
  end if;

  insert into public.internal_store_catalog_imports (
    source_filename,
    source_size_bytes,
    source_sha256,
    imported_by
  )
  values (
    trim(p_source_filename),
    p_source_size_bytes,
    nullif(trim(coalesce(p_source_sha256,'')),''),
    auth.uid()
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.import_internal_store_catalog_batch(
  p_import_id uuid,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_input_count integer := 0;
  v_upserted_count integer := 0;
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til å oppdatere internt vareregister.'
      using errcode = '42501';
  end if;

  select status into v_status
  from public.internal_store_catalog_imports
  where id = p_import_id
  for update;

  if v_status is null then
    raise exception 'Importen finnes ikke.' using errcode = 'P0002';
  end if;
  if v_status <> 'loading' then
    raise exception 'Importen er ikke åpen for flere varer.' using errcode = '55000';
  end if;

  if jsonb_typeof(coalesce(p_items,'[]'::jsonb)) <> 'array' then
    raise exception 'Varebatch må være en JSON-liste.' using errcode = '22023';
  end if;

  v_input_count := jsonb_array_length(coalesce(p_items,'[]'::jsonb));
  if v_input_count > 2500 then
    raise exception 'Maks 2500 varer per importbatch.' using errcode = '22023';
  end if;

  with raw_incoming as (
    select
      trim(x.supplier_name) as supplier_name,
      public.internal_store_catalog_normalize_supplier(x.supplier_name) as supplier_key,
      trim(x.supplier_product_number) as supplier_product_number,
      public.internal_store_catalog_normalize_sku(x.supplier_product_number) as supplier_product_number_key,
      x.supplier_list_price_ex_vat,
      x.purchase_discount_percent,
      x.purchase_net_ex_vat,
      x.markup_percent,
      x.gross_margin_percent,
      x.customer_price_ex_vat,
      x.customer_price_incl_vat,
      nullif(trim(coalesce(x.product_group,'')),'') as product_group,
      x.price_date,
      coalesce(x.source_flag_1,false) as source_flag_1,
      coalesce(x.source_flag_2,false) as source_flag_2,
      coalesce(x.source_flag_3,false) as source_flag_3,
      coalesce(x.source_flag_4,false) as source_flag_4,
      trim(coalesce(x.description,'')) as description,
      public.internal_store_catalog_normalize_gtin(x.gtin) as gtin,
      x.source_line_no
    from jsonb_to_recordset(coalesce(p_items,'[]'::jsonb)) as x(
      supplier_name text,
      supplier_product_number text,
      supplier_list_price_ex_vat numeric,
      purchase_discount_percent numeric,
      purchase_net_ex_vat numeric,
      markup_percent numeric,
      gross_margin_percent numeric,
      customer_price_ex_vat numeric,
      customer_price_incl_vat numeric,
      product_group text,
      price_date date,
      source_flag_1 boolean,
      source_flag_2 boolean,
      source_flag_3 boolean,
      source_flag_4 boolean,
      description text,
      gtin text,
      source_line_no bigint
    )
    where nullif(trim(coalesce(x.supplier_name,'')),'') is not null
      and nullif(trim(coalesce(x.supplier_product_number,'')),'') is not null
      and coalesce(x.purchase_net_ex_vat,0) > 0
      and coalesce(x.customer_price_ex_vat,0) > 0
      and coalesce(x.customer_price_incl_vat,0) > 0
  ),
  incoming as (
    select distinct on (supplier_key, supplier_product_number_key) *
    from raw_incoming
    order by
      supplier_key,
      supplier_product_number_key,
      source_line_no desc nulls last
  ),
  upserted as (
    insert into public.internal_store_catalog_stage (
      import_id,
      supplier_name,
      supplier_key,
      supplier_product_number,
      supplier_product_number_key,
      supplier_list_price_ex_vat,
      purchase_discount_percent,
      purchase_net_ex_vat,
      markup_percent,
      gross_margin_percent,
      customer_price_ex_vat,
      customer_price_incl_vat,
      product_group,
      price_date,
      source_flag_1,
      source_flag_2,
      source_flag_3,
      source_flag_4,
      description,
      gtin,
      source_line_no
    )
    select
      p_import_id,
      supplier_name,
      supplier_key,
      supplier_product_number,
      supplier_product_number_key,
      supplier_list_price_ex_vat,
      purchase_discount_percent,
      purchase_net_ex_vat,
      markup_percent,
      gross_margin_percent,
      customer_price_ex_vat,
      customer_price_incl_vat,
      product_group,
      price_date,
      source_flag_1,
      source_flag_2,
      source_flag_3,
      source_flag_4,
      description,
      gtin,
      source_line_no
    from incoming
    on conflict (import_id, supplier_key, supplier_product_number_key)
    do update set
      supplier_name = excluded.supplier_name,
      supplier_product_number = excluded.supplier_product_number,
      supplier_list_price_ex_vat = excluded.supplier_list_price_ex_vat,
      purchase_discount_percent = excluded.purchase_discount_percent,
      purchase_net_ex_vat = excluded.purchase_net_ex_vat,
      markup_percent = excluded.markup_percent,
      gross_margin_percent = excluded.gross_margin_percent,
      customer_price_ex_vat = excluded.customer_price_ex_vat,
      customer_price_incl_vat = excluded.customer_price_incl_vat,
      product_group = excluded.product_group,
      price_date = excluded.price_date,
      source_flag_1 = excluded.source_flag_1,
      source_flag_2 = excluded.source_flag_2,
      source_flag_3 = excluded.source_flag_3,
      source_flag_4 = excluded.source_flag_4,
      description = excluded.description,
      gtin = excluded.gtin,
      source_line_no = excluded.source_line_no
    returning 1
  )
  select count(*) into v_upserted_count from upserted;

  return jsonb_build_object(
    'input_count', v_input_count,
    'upserted_count', v_upserted_count
  );
end;
$$;

create or replace function public.finalize_internal_store_catalog_import(
  p_import_id uuid,
  p_total_rows bigint,
  p_skipped_zero_price_rows bigint default 0,
  p_skipped_missing_sku_rows bigint default 0,
  p_malformed_rows bigint default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_stage_count bigint := 0;
  v_duplicate_rows bigint := 0;
  v_activated_at timestamptz := now();
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til å aktivere internt vareregister.'
      using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext('expo_proffdok_internal_store_catalog_finalize'));

  select status into v_status
  from public.internal_store_catalog_imports
  where id = p_import_id
  for update;

  if v_status is null then
    raise exception 'Importen finnes ikke.' using errcode = 'P0002';
  end if;
  if v_status <> 'loading' then
    raise exception 'Importen kan ikke aktiveres fra denne statusen.' using errcode = '55000';
  end if;

  select count(*) into v_stage_count
  from public.internal_store_catalog_stage
  where import_id = p_import_id;

  if v_stage_count = 0 then
    raise exception 'Importen inneholder ingen gyldige varer.' using errcode = '22023';
  end if;

  if coalesce(p_total_rows,0) < v_stage_count then
    raise exception 'Totalt antall rader kan ikke være lavere enn antall gyldige varer.'
      using errcode = '22023';
  end if;

  v_duplicate_rows := greatest(
    coalesce(p_total_rows,0)
      - v_stage_count
      - greatest(coalesce(p_skipped_zero_price_rows,0),0)
      - greatest(coalesce(p_skipped_missing_sku_rows,0),0)
      - greatest(coalesce(p_malformed_rows,0),0),
    0
  );

  update public.internal_store_catalog_items
  set is_active = false,
      updated_at = now()
  where is_active = true;

  insert into public.internal_store_catalog_items (
    supplier_name,
    supplier_key,
    supplier_product_number,
    supplier_product_number_key,
    supplier_list_price_ex_vat,
    purchase_discount_percent,
    purchase_net_ex_vat,
    markup_percent,
    gross_margin_percent,
    customer_price_ex_vat,
    customer_price_incl_vat,
    product_group,
    price_date,
    source_flag_1,
    source_flag_2,
    source_flag_3,
    source_flag_4,
    description,
    gtin,
    is_active,
    last_import_id
  )
  select
    s.supplier_name,
    s.supplier_key,
    s.supplier_product_number,
    s.supplier_product_number_key,
    s.supplier_list_price_ex_vat,
    s.purchase_discount_percent,
    s.purchase_net_ex_vat,
    s.markup_percent,
    s.gross_margin_percent,
    s.customer_price_ex_vat,
    s.customer_price_incl_vat,
    s.product_group,
    s.price_date,
    s.source_flag_1,
    s.source_flag_2,
    s.source_flag_3,
    s.source_flag_4,
    s.description,
    s.gtin,
    true,
    p_import_id
  from public.internal_store_catalog_stage s
  where s.import_id = p_import_id
  on conflict (supplier_key, supplier_product_number_key)
  do update set
    supplier_name = excluded.supplier_name,
    supplier_product_number = excluded.supplier_product_number,
    supplier_list_price_ex_vat = excluded.supplier_list_price_ex_vat,
    purchase_discount_percent = excluded.purchase_discount_percent,
    purchase_net_ex_vat = excluded.purchase_net_ex_vat,
    markup_percent = excluded.markup_percent,
    gross_margin_percent = excluded.gross_margin_percent,
    customer_price_ex_vat = excluded.customer_price_ex_vat,
    customer_price_incl_vat = excluded.customer_price_incl_vat,
    product_group = excluded.product_group,
    price_date = excluded.price_date,
    source_flag_1 = excluded.source_flag_1,
    source_flag_2 = excluded.source_flag_2,
    source_flag_3 = excluded.source_flag_3,
    source_flag_4 = excluded.source_flag_4,
    description = excluded.description,
    gtin = excluded.gtin,
    is_active = true,
    last_import_id = excluded.last_import_id;

  update public.internal_store_catalog_imports
  set status = 'archived'
  where status = 'active'
    and id <> p_import_id;

  update public.internal_store_catalog_imports
  set status = 'active',
      total_rows = greatest(coalesce(p_total_rows,0),0),
      accepted_rows = v_stage_count,
      skipped_zero_price_rows = greatest(coalesce(p_skipped_zero_price_rows,0),0),
      skipped_missing_sku_rows = greatest(coalesce(p_skipped_missing_sku_rows,0),0),
      malformed_rows = greatest(coalesce(p_malformed_rows,0),0),
      duplicate_rows = v_duplicate_rows,
      activated_at = v_activated_at
  where id = p_import_id;

  delete from public.internal_store_catalog_stage
  where import_id = p_import_id;

  return jsonb_build_object(
    'import_id', p_import_id,
    'status', 'active',
    'total_rows', greatest(coalesce(p_total_rows,0),0),
    'accepted_rows', v_stage_count,
    'skipped_zero_price_rows', greatest(coalesce(p_skipped_zero_price_rows,0),0),
    'skipped_missing_sku_rows', greatest(coalesce(p_skipped_missing_sku_rows,0),0),
    'malformed_rows', greatest(coalesce(p_malformed_rows,0),0),
    'duplicate_rows', v_duplicate_rows,
    'activated_at', v_activated_at
  );
end;
$$;

create or replace function public.cancel_internal_store_catalog_import(
  p_import_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til å avbryte internt vareregister.'
      using errcode = '42501';
  end if;

  delete from public.internal_store_catalog_stage
  where import_id = p_import_id;

  update public.internal_store_catalog_imports
  set status = 'cancelled'
  where id = p_import_id
    and status = 'loading';
end;
$$;

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
begin
  if not public.current_user_has_internal_store_catalog_access() then
    raise exception 'Du har ikke tilgang til internt vareregister.'
      using errcode = '42501';
  end if;

  if length(v_query) < 2 then
    return;
  end if;

  return query
  select
    i.id,
    i.supplier_name,
    i.supplier_product_number,
    i.description,
    i.gtin,
    i.nobb_number,
    i.product_url,
    i.image_url,
    i.product_group,
    i.price_date,
    i.purchase_net_ex_vat,
    i.customer_price_ex_vat,
    i.customer_price_incl_vat,
    i.purchase_discount_percent,
    i.gross_margin_percent
  from public.internal_store_catalog_items i
  where i.is_active = true
    and (
      i.supplier_product_number_key = v_query_sku
      or (v_query_gtin is not null and i.gtin = v_query_gtin)
      or i.search_text ilike '%' || v_query_lower || '%'
    )
  order by
    case
      when i.supplier_product_number_key = v_query_sku then 0
      when v_query_gtin is not null and i.gtin = v_query_gtin then 1
      when i.supplier_product_number_key like v_query_sku || '%' then 2
      else 3
    end,
    i.description,
    i.supplier_name
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
begin
  if not public.current_user_has_internal_store_catalog_access() then
    raise exception 'Du har ikke tilgang til internt vareregister.'
      using errcode = '42501';
  end if;

  select i.gtin into v_gtin
  from public.internal_store_catalog_items i
  where i.id = p_item_id
    and i.is_active = true;

  if v_gtin is null then
    return;
  end if;

  return query
  select
    i.id,
    i.supplier_name,
    i.supplier_product_number,
    i.description,
    i.gtin,
    i.nobb_number,
    i.product_url,
    i.image_url,
    i.product_group,
    i.price_date,
    i.purchase_net_ex_vat,
    i.customer_price_ex_vat,
    i.customer_price_incl_vat
  from public.internal_store_catalog_items i
  where i.is_active = true
    and i.gtin = v_gtin
  order by i.purchase_net_ex_vat, i.supplier_name;
end;
$$;

revoke all on function public.current_user_has_internal_store_catalog_access() from public, anon;
revoke all on function public.current_user_can_manage_internal_store_catalog() from public, anon;
revoke all on function public.begin_internal_store_catalog_import(text,bigint,text) from public, anon;
revoke all on function public.import_internal_store_catalog_batch(uuid,jsonb) from public, anon;
revoke all on function public.finalize_internal_store_catalog_import(uuid,bigint,bigint,bigint,bigint) from public, anon;
revoke all on function public.cancel_internal_store_catalog_import(uuid) from public, anon;
revoke all on function public.search_internal_store_catalog(text,integer) from public, anon;
revoke all on function public.internal_store_catalog_alternatives(uuid) from public, anon;

grant execute on function public.current_user_has_internal_store_catalog_access() to authenticated;
grant execute on function public.current_user_can_manage_internal_store_catalog() to authenticated;
grant execute on function public.begin_internal_store_catalog_import(text,bigint,text) to authenticated;
grant execute on function public.import_internal_store_catalog_batch(uuid,jsonb) to authenticated;
grant execute on function public.finalize_internal_store_catalog_import(uuid,bigint,bigint,bigint,bigint) to authenticated;
grant execute on function public.cancel_internal_store_catalog_import(uuid) to authenticated;
grant execute on function public.search_internal_store_catalog(text,integer) to authenticated;
grant execute on function public.internal_store_catalog_alternatives(uuid) to authenticated;

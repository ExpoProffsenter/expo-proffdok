-- Expo ProffDok – FASE 39B.2
-- Lagringseffektiv ERP-import: én katalogkopi, ingen full staging-kopi.
-- Varesøk sperres mens import pågår, slik at brukere aldri ser en halv prisoppdatering.

alter table public.internal_store_catalog_imports
  drop constraint if exists internal_store_catalog_imports_status_check;

alter table public.internal_store_catalog_imports
  add constraint internal_store_catalog_imports_status_check
  check (status in ('loading','ready','active','archived','cancelled','failed'));

-- Én fysisk rad per leverandør + varenummer. Nye ERP-importer oppdaterer raden på stedet.
alter table public.internal_store_catalog_items
  drop constraint if exists internal_store_catalog_items_import_supplier_sku_uq;

alter table public.internal_store_catalog_items
  drop constraint if exists internal_store_catalog_items_supplier_sku_uq;

alter table public.internal_store_catalog_items
  add constraint internal_store_catalog_items_supplier_sku_uq
  unique (supplier_key, supplier_product_number_key);

-- Redundante indekser fra den første versjonerte modellen fjernes.
drop index if exists public.internal_store_catalog_items_active_idx;
drop index if exists public.internal_store_catalog_items_supplier_sku_idx;
drop index if exists public.internal_store_catalog_items_last_import_idx;

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

  -- En avbrutt import kan trygt erstattes av en ny full gjennomkjøring av ERP-filen.
  -- Katalogsøk forblir sperret fra gammel import markeres failed til ny loading-rad er opprettet,
  -- fordi begge endringene skjer i samme transaksjon.
  update public.internal_store_catalog_imports
  set status = 'failed'
  where status in ('loading','ready');

  insert into public.internal_store_catalog_imports (
    source_filename,
    source_size_bytes,
    source_sha256,
    imported_by,
    status
  )
  values (
    trim(p_source_filename),
    p_source_size_bytes,
    nullif(trim(coalesce(p_source_sha256,'')),''),
    auth.uid(),
    'loading'
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
    order by supplier_key, supplier_product_number_key, source_line_no desc nulls last
  ),
  upserted as (
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
      true,
      p_import_id
    from incoming
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
      last_import_id = excluded.last_import_id
    returning 1
  )
  select count(*) into v_upserted_count from upserted;

  return jsonb_build_object(
    'input_count', v_input_count,
    'upserted_count', v_upserted_count
  );
end;
$$;

create or replace function public.prepare_internal_store_catalog_activation(
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
  v_seen_count bigint := 0;
  v_duplicate_rows bigint := 0;
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til å klargjøre internt vareregister.'
      using errcode = '42501';
  end if;

  select status into v_status
  from public.internal_store_catalog_imports
  where id = p_import_id
  for update;

  if v_status is null then
    raise exception 'Importen finnes ikke.' using errcode = 'P0002';
  end if;
  if v_status not in ('loading','ready') then
    raise exception 'Importen kan ikke klargjøres fra denne statusen.' using errcode = '55000';
  end if;

  select count(*) into v_seen_count
  from public.internal_store_catalog_items
  where last_import_id = p_import_id;

  if v_seen_count = 0 then
    raise exception 'Importen inneholder ingen gyldige varer.' using errcode = '22023';
  end if;

  if coalesce(p_total_rows,0) < v_seen_count then
    raise exception 'Totalt antall rader kan ikke være lavere enn antall gyldige varer.'
      using errcode = '22023';
  end if;

  v_duplicate_rows := greatest(
    coalesce(p_total_rows,0)
      - v_seen_count
      - greatest(coalesce(p_skipped_zero_price_rows,0),0)
      - greatest(coalesce(p_skipped_missing_sku_rows,0),0)
      - greatest(coalesce(p_malformed_rows,0),0),
    0
  );

  update public.internal_store_catalog_imports
  set status = 'ready',
      total_rows = greatest(coalesce(p_total_rows,0),0),
      accepted_rows = v_seen_count,
      skipped_zero_price_rows = greatest(coalesce(p_skipped_zero_price_rows,0),0),
      skipped_missing_sku_rows = greatest(coalesce(p_skipped_missing_sku_rows,0),0),
      malformed_rows = greatest(coalesce(p_malformed_rows,0),0),
      duplicate_rows = v_duplicate_rows
  where id = p_import_id;

  return jsonb_build_object(
    'import_id', p_import_id,
    'status', 'ready',
    'accepted_rows', v_seen_count,
    'duplicate_rows', v_duplicate_rows
  );
end;
$$;

create or replace function public.complete_internal_store_catalog_activation(
  p_import_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_expected bigint := 0;
  v_seen bigint := 0;
  v_activated_at timestamptz := now();
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til å aktivere internt vareregister.'
      using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext('expo_proffdok_internal_store_catalog_complete'));

  select status, accepted_rows
  into v_status, v_expected
  from public.internal_store_catalog_imports
  where id = p_import_id
  for update;

  if v_status is null then
    raise exception 'Importen finnes ikke.' using errcode = 'P0002';
  end if;
  if v_status <> 'ready' then
    raise exception 'Importen er ikke ferdig kontrollert.' using errcode = '55000';
  end if;

  select count(*) into v_seen
  from public.internal_store_catalog_items
  where last_import_id = p_import_id;

  if v_seen = 0 or v_seen <> v_expected then
    raise exception 'Antall importerte varer (%) stemmer ikke med forventet antall (%).', v_seen, v_expected
      using errcode = '55000';
  end if;

  -- Varer som ikke finnes i den nye ERP-filen blir inaktive. Ingen rad slettes her.
  update public.internal_store_catalog_items
  set is_active = false
  where last_import_id <> p_import_id
    and is_active = true;

  update public.internal_store_catalog_imports
  set status = 'archived'
  where status = 'active'
    and id <> p_import_id;

  update public.internal_store_catalog_imports
  set status = 'active',
      activated_at = v_activated_at
  where id = p_import_id;

  return jsonb_build_object(
    'import_id', p_import_id,
    'status', 'active',
    'accepted_rows', v_seen,
    'activated_at', v_activated_at
  );
end;
$$;

create or replace function public.get_pending_internal_store_catalog_import()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.internal_store_catalog_imports%rowtype;
  v_seen bigint := 0;
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til internt vareregister.'
      using errcode = '42501';
  end if;

  select * into v_row
  from public.internal_store_catalog_imports
  where status in ('loading','ready')
  order by created_at desc
  limit 1;

  if v_row.id is null then
    return null;
  end if;

  select count(*) into v_seen
  from public.internal_store_catalog_items
  where last_import_id = v_row.id;

  return jsonb_build_object(
    'id', v_row.id,
    'source_filename', v_row.source_filename,
    'source_size_bytes', v_row.source_size_bytes,
    'status', v_row.status,
    'total_rows', v_row.total_rows,
    'accepted_rows', case when v_row.accepted_rows > 0 then v_row.accepted_rows else v_seen end,
    'skipped_zero_price_rows', v_row.skipped_zero_price_rows,
    'skipped_missing_sku_rows', v_row.skipped_missing_sku_rows,
    'malformed_rows', v_row.malformed_rows,
    'duplicate_rows', v_row.duplicate_rows,
    'processed_rows', v_seen,
    'created_at', v_row.created_at
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
declare
  v_seen bigint := 0;
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til å avbryte internt vareregister.' using errcode = '42501';
  end if;

  select count(*) into v_seen
  from public.internal_store_catalog_items
  where last_import_id = p_import_id;

  if v_seen > 0 then
    raise exception 'Importen har allerede oppdatert varer. Velg samme ERP-fil og start importen på nytt for å fullføre trygt.'
      using errcode = '55000';
  end if;

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
    raise exception 'Du har ikke tilgang til internt vareregister.' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.internal_store_catalog_imports where status in ('loading','ready')
  ) then
    raise exception 'Vareregisteret oppdateres akkurat nå. Prøv igjen når importen er aktivert.' using errcode = '55000';
  end if;

  if length(v_query) < 2 then return; end if;

  return query
  select
    i.id, i.supplier_name, i.supplier_product_number, i.description, i.gtin,
    i.nobb_number, i.product_url, i.image_url, i.product_group, i.price_date,
    i.purchase_net_ex_vat, i.customer_price_ex_vat, i.customer_price_incl_vat,
    i.purchase_discount_percent, i.gross_margin_percent
  from public.internal_store_catalog_items i
  join public.internal_store_catalog_imports imp on imp.id = i.last_import_id and imp.status = 'active'
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
  v_import_id uuid;
begin
  if not public.current_user_has_internal_store_catalog_access() then
    raise exception 'Du har ikke tilgang til internt vareregister.' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.internal_store_catalog_imports where status in ('loading','ready')
  ) then
    raise exception 'Vareregisteret oppdateres akkurat nå. Prøv igjen når importen er aktivert.' using errcode = '55000';
  end if;

  select i.gtin, i.last_import_id into v_gtin, v_import_id
  from public.internal_store_catalog_items i
  join public.internal_store_catalog_imports imp on imp.id = i.last_import_id and imp.status = 'active'
  where i.id = p_item_id and i.is_active = true;

  if v_gtin is null or v_import_id is null then return; end if;

  return query
  select
    i.id, i.supplier_name, i.supplier_product_number, i.description, i.gtin,
    i.nobb_number, i.product_url, i.image_url, i.product_group, i.price_date,
    i.purchase_net_ex_vat, i.customer_price_ex_vat, i.customer_price_incl_vat
  from public.internal_store_catalog_items i
  where i.last_import_id = v_import_id
    and i.is_active = true
    and i.gtin = v_gtin
  order by i.purchase_net_ex_vat, i.supplier_name;
end;
$$;

revoke all on function public.begin_internal_store_catalog_import(text,bigint,text) from public, anon;
revoke all on function public.import_internal_store_catalog_batch(uuid,jsonb) from public, anon;
revoke all on function public.prepare_internal_store_catalog_activation(uuid,bigint,bigint,bigint,bigint) from public, anon;
revoke all on function public.complete_internal_store_catalog_activation(uuid) from public, anon;
revoke all on function public.get_pending_internal_store_catalog_import() from public, anon;
revoke all on function public.cancel_internal_store_catalog_import(uuid) from public, anon;
revoke all on function public.search_internal_store_catalog(text,integer) from public, anon;
revoke all on function public.internal_store_catalog_alternatives(uuid) from public, anon;

grant execute on function public.begin_internal_store_catalog_import(text,bigint,text) to authenticated;
grant execute on function public.import_internal_store_catalog_batch(uuid,jsonb) to authenticated;
grant execute on function public.prepare_internal_store_catalog_activation(uuid,bigint,bigint,bigint,bigint) to authenticated;
grant execute on function public.complete_internal_store_catalog_activation(uuid) to authenticated;
grant execute on function public.get_pending_internal_store_catalog_import() to authenticated;
grant execute on function public.cancel_internal_store_catalog_import(uuid) to authenticated;
grant execute on function public.search_internal_store_catalog(text,integer) to authenticated;
grant execute on function public.internal_store_catalog_alternatives(uuid) to authenticated;

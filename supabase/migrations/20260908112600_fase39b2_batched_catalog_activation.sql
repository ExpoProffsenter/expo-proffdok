-- Expo ProffDok – FASE 39B.2
-- Aktiverer store ERP-kataloger i små, gjenopptakbare batcher.
-- Gammel aktiv katalog forblir urørt til hele ny versjon er ferdig bygget.

alter table public.internal_store_catalog_imports
  drop constraint if exists internal_store_catalog_imports_status_check;

alter table public.internal_store_catalog_imports
  add constraint internal_store_catalog_imports_status_check
  check (status in ('loading','activating','active','archived','cancelled','failed'));

alter table public.internal_store_catalog_items
  drop constraint if exists internal_store_catalog_items_supplier_sku_uq;

alter table public.internal_store_catalog_items
  add constraint internal_store_catalog_items_import_supplier_sku_uq
  unique (last_import_id, supplier_key, supplier_product_number_key);

create index if not exists internal_store_catalog_items_last_import_idx
  on public.internal_store_catalog_items (last_import_id);

create or replace function public.get_pending_internal_store_catalog_import()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.internal_store_catalog_imports%rowtype;
  v_stage_count bigint := 0;
  v_prepared_count bigint := 0;
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til internt vareregister.'
      using errcode = '42501';
  end if;

  select * into v_row
  from public.internal_store_catalog_imports
  where status in ('loading','activating')
  order by created_at desc
  limit 1;

  if v_row.id is null then
    return null;
  end if;

  select count(*) into v_stage_count
  from public.internal_store_catalog_stage
  where import_id = v_row.id;

  select count(*) into v_prepared_count
  from public.internal_store_catalog_items
  where last_import_id = v_row.id;

  return jsonb_build_object(
    'id', v_row.id,
    'source_filename', v_row.source_filename,
    'source_size_bytes', v_row.source_size_bytes,
    'status', v_row.status,
    'total_rows', v_row.total_rows,
    'accepted_rows', case
      when v_row.accepted_rows > 0 then v_row.accepted_rows
      else v_stage_count + v_prepared_count
    end,
    'skipped_zero_price_rows', v_row.skipped_zero_price_rows,
    'skipped_missing_sku_rows', v_row.skipped_missing_sku_rows,
    'malformed_rows', v_row.malformed_rows,
    'duplicate_rows', v_row.duplicate_rows,
    'stage_rows', v_stage_count,
    'prepared_rows', v_prepared_count,
    'created_at', v_row.created_at
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
  v_stage_count bigint := 0;
  v_prepared_count bigint := 0;
  v_unique_count bigint := 0;
  v_duplicate_rows bigint := 0;
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til å aktivere internt vareregister.'
      using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext('expo_proffdok_internal_store_catalog_prepare'));

  select status into v_status
  from public.internal_store_catalog_imports
  where id = p_import_id
  for update;

  if v_status is null then
    raise exception 'Importen finnes ikke.' using errcode = 'P0002';
  end if;

  if v_status not in ('loading','activating') then
    raise exception 'Importen kan ikke aktiveres fra denne statusen.' using errcode = '55000';
  end if;

  select count(*) into v_stage_count
  from public.internal_store_catalog_stage
  where import_id = p_import_id;

  select count(*) into v_prepared_count
  from public.internal_store_catalog_items
  where last_import_id = p_import_id;

  v_unique_count := v_stage_count + v_prepared_count;

  if v_unique_count = 0 then
    raise exception 'Importen inneholder ingen gyldige varer.' using errcode = '22023';
  end if;

  if coalesce(p_total_rows,0) <= 0 then
    select total_rows into p_total_rows
    from public.internal_store_catalog_imports
    where id = p_import_id;
  end if;

  if coalesce(p_total_rows,0) < v_unique_count then
    raise exception 'Totalt antall rader kan ikke være lavere enn antall gyldige varer.'
      using errcode = '22023';
  end if;

  v_duplicate_rows := greatest(
    coalesce(p_total_rows,0)
      - v_unique_count
      - greatest(coalesce(p_skipped_zero_price_rows,0),0)
      - greatest(coalesce(p_skipped_missing_sku_rows,0),0)
      - greatest(coalesce(p_malformed_rows,0),0),
    0
  );

  update public.internal_store_catalog_imports
  set status = 'activating',
      total_rows = greatest(coalesce(p_total_rows,0),0),
      accepted_rows = v_unique_count,
      skipped_zero_price_rows = greatest(coalesce(p_skipped_zero_price_rows,0),0),
      skipped_missing_sku_rows = greatest(coalesce(p_skipped_missing_sku_rows,0),0),
      malformed_rows = greatest(coalesce(p_malformed_rows,0),0),
      duplicate_rows = v_duplicate_rows
  where id = p_import_id;

  return jsonb_build_object(
    'import_id', p_import_id,
    'status', 'activating',
    'accepted_rows', v_unique_count,
    'prepared_rows', v_prepared_count,
    'remaining_rows', v_stage_count,
    'duplicate_rows', v_duplicate_rows
  );
end;
$$;

create or replace function public.activate_internal_store_catalog_batch(
  p_import_id uuid,
  p_limit integer default 2500
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_limit integer := least(greatest(coalesce(p_limit,2500),100),5000);
  v_processed bigint := 0;
  v_remaining bigint := 0;
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til å aktivere internt vareregister.'
      using errcode = '42501';
  end if;

  select status into v_status
  from public.internal_store_catalog_imports
  where id = p_import_id
  for update;

  if v_status is null then
    raise exception 'Importen finnes ikke.' using errcode = 'P0002';
  end if;

  if v_status <> 'activating' then
    raise exception 'Importen er ikke klargjort for batch-aktivering.' using errcode = '55000';
  end if;

  with batch as materialized (
    select s.*
    from public.internal_store_catalog_stage s
    where s.import_id = p_import_id
    order by s.supplier_key, s.supplier_product_number_key
    limit v_limit
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
      b.supplier_name,
      b.supplier_key,
      b.supplier_product_number,
      b.supplier_product_number_key,
      b.supplier_list_price_ex_vat,
      b.purchase_discount_percent,
      b.purchase_net_ex_vat,
      b.markup_percent,
      b.gross_margin_percent,
      b.customer_price_ex_vat,
      b.customer_price_incl_vat,
      b.product_group,
      b.price_date,
      b.source_flag_1,
      b.source_flag_2,
      b.source_flag_3,
      b.source_flag_4,
      b.description,
      b.gtin,
      false,
      p_import_id
    from batch b
    on conflict (last_import_id, supplier_key, supplier_product_number_key)
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
      updated_at = now()
    returning supplier_key, supplier_product_number_key
  ),
  deleted as (
    delete from public.internal_store_catalog_stage s
    using batch b
    where s.import_id = p_import_id
      and s.import_id = b.import_id
      and s.supplier_key = b.supplier_key
      and s.supplier_product_number_key = b.supplier_product_number_key
    returning 1
  )
  select count(*) into v_processed from deleted;

  if v_processed < v_limit then
    select count(*) into v_remaining
    from public.internal_store_catalog_stage
    where import_id = p_import_id;
  else
    v_remaining := greatest(v_limit - v_processed, 0);
  end if;

  return jsonb_build_object(
    'import_id', p_import_id,
    'processed_rows', v_processed,
    'remaining_rows', v_remaining,
    'done', v_processed < v_limit and v_remaining = 0
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
  v_prepared bigint := 0;
  v_stage bigint := 0;
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

  if v_status <> 'activating' then
    raise exception 'Importen er ikke klar for fullføring.' using errcode = '55000';
  end if;

  select count(*) into v_stage
  from public.internal_store_catalog_stage
  where import_id = p_import_id;

  if v_stage <> 0 then
    raise exception 'Importen har fortsatt % varer igjen i staging.', v_stage
      using errcode = '55000';
  end if;

  select count(*) into v_prepared
  from public.internal_store_catalog_items
  where last_import_id = p_import_id;

  if v_prepared = 0 or v_prepared <> v_expected then
    raise exception 'Antall klargjorte varer (%) stemmer ikke med forventet antall (%).', v_prepared, v_expected
      using errcode = '55000';
  end if;

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
    'accepted_rows', v_prepared,
    'activated_at', v_activated_at
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
begin
  raise exception 'Aktiveringen er oppdatert for store vareregistre. Last siden på nytt og trykk «Aktiver nytt vareregister» igjen.'
    using errcode = '55000';
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
  join public.internal_store_catalog_imports imp
    on imp.id = i.last_import_id
   and imp.status = 'active'
  where
    i.supplier_product_number_key = v_query_sku
    or (v_query_gtin is not null and i.gtin = v_query_gtin)
    or i.search_text ilike '%' || v_query_lower || '%'
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
    raise exception 'Du har ikke tilgang til internt vareregister.'
      using errcode = '42501';
  end if;

  select i.gtin, i.last_import_id
  into v_gtin, v_import_id
  from public.internal_store_catalog_items i
  join public.internal_store_catalog_imports imp
    on imp.id = i.last_import_id
   and imp.status = 'active'
  where i.id = p_item_id;

  if v_gtin is null or v_import_id is null then
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
  where i.last_import_id = v_import_id
    and i.gtin = v_gtin
  order by i.purchase_net_ex_vat, i.supplier_name;
end;
$$;

revoke all on function public.get_pending_internal_store_catalog_import() from public, anon;
revoke all on function public.prepare_internal_store_catalog_activation(uuid,bigint,bigint,bigint,bigint) from public, anon;
revoke all on function public.activate_internal_store_catalog_batch(uuid,integer) from public, anon;
revoke all on function public.complete_internal_store_catalog_activation(uuid) from public, anon;

grant execute on function public.get_pending_internal_store_catalog_import() to authenticated;
grant execute on function public.prepare_internal_store_catalog_activation(uuid,bigint,bigint,bigint,bigint) to authenticated;
grant execute on function public.activate_internal_store_catalog_batch(uuid,integer) to authenticated;
grant execute on function public.complete_internal_store_catalog_activation(uuid) to authenticated;

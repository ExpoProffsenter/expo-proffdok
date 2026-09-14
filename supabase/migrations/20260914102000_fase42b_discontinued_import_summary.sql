-- Expo ProffDok – FASE 42B
-- Bevar Cordels «Utgått»-teller separat fra ekte duplikater i ERP-importen.
-- Ny v2-RPC brukes av FASE 42B-klienten; gammel RPC beholdes for bakoverkompatibilitet med main.

alter table public.internal_store_catalog_imports
  add column if not exists skipped_discontinued_rows bigint not null default 0;

create or replace function public.prepare_internal_store_catalog_activation_v2(
  p_import_id uuid,
  p_total_rows bigint,
  p_skipped_zero_price_rows bigint default 0,
  p_skipped_missing_sku_rows bigint default 0,
  p_malformed_rows bigint default 0,
  p_skipped_discontinued_rows bigint default 0
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
      - greatest(coalesce(p_skipped_discontinued_rows,0),0)
      - greatest(coalesce(p_skipped_zero_price_rows,0),0)
      - greatest(coalesce(p_skipped_missing_sku_rows,0),0)
      - greatest(coalesce(p_malformed_rows,0),0),
    0
  );

  update public.internal_store_catalog_imports
  set status = 'ready',
      total_rows = greatest(coalesce(p_total_rows,0),0),
      accepted_rows = v_seen_count,
      skipped_discontinued_rows = greatest(coalesce(p_skipped_discontinued_rows,0),0),
      skipped_zero_price_rows = greatest(coalesce(p_skipped_zero_price_rows,0),0),
      skipped_missing_sku_rows = greatest(coalesce(p_skipped_missing_sku_rows,0),0),
      malformed_rows = greatest(coalesce(p_malformed_rows,0),0),
      duplicate_rows = v_duplicate_rows
  where id = p_import_id;

  return jsonb_build_object(
    'import_id', p_import_id,
    'status', 'ready',
    'accepted_rows', v_seen_count,
    'skipped_discontinued_rows', greatest(coalesce(p_skipped_discontinued_rows,0),0),
    'duplicate_rows', v_duplicate_rows
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
    'skipped_discontinued_rows', v_row.skipped_discontinued_rows,
    'skipped_zero_price_rows', v_row.skipped_zero_price_rows,
    'skipped_missing_sku_rows', v_row.skipped_missing_sku_rows,
    'malformed_rows', v_row.malformed_rows,
    'duplicate_rows', v_row.duplicate_rows,
    'processed_rows', v_seen,
    'created_at', v_row.created_at
  );
end;
$$;

revoke all on function public.prepare_internal_store_catalog_activation_v2(uuid,bigint,bigint,bigint,bigint,bigint) from public, anon;
grant execute on function public.prepare_internal_store_catalog_activation_v2(uuid,bigint,bigint,bigint,bigint,bigint) to authenticated;

revoke all on function public.get_pending_internal_store_catalog_import() from public, anon;
grant execute on function public.get_pending_internal_store_catalog_import() to authenticated;

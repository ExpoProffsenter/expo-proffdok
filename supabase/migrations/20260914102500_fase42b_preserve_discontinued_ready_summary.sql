-- Expo ProffDok – FASE 42B
-- Ved reload av en ferdig kontrollert import kan klienten mangle lokal parser-summary.
-- Bevar da allerede lagret Utgått-teller i stedet for å skrive den tilbake til 0.

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
  v_stored_discontinued bigint := 0;
  v_effective_discontinued bigint := 0;
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til å klargjøre internt vareregister.' using errcode = '42501';
  end if;

  select status, skipped_discontinued_rows
  into v_status, v_stored_discontinued
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
    raise exception 'Totalt antall rader kan ikke være lavere enn antall gyldige varer.' using errcode = '22023';
  end if;

  v_effective_discontinued := greatest(
    greatest(coalesce(p_skipped_discontinued_rows,0),0),
    case when v_status = 'ready' then greatest(coalesce(v_stored_discontinued,0),0) else 0 end
  );

  v_duplicate_rows := greatest(
    coalesce(p_total_rows,0)
      - v_seen_count
      - v_effective_discontinued
      - greatest(coalesce(p_skipped_zero_price_rows,0),0)
      - greatest(coalesce(p_skipped_missing_sku_rows,0),0)
      - greatest(coalesce(p_malformed_rows,0),0),
    0
  );

  update public.internal_store_catalog_imports
  set status = 'ready',
      total_rows = greatest(coalesce(p_total_rows,0),0),
      accepted_rows = v_seen_count,
      skipped_discontinued_rows = v_effective_discontinued,
      skipped_zero_price_rows = greatest(coalesce(p_skipped_zero_price_rows,0),0),
      skipped_missing_sku_rows = greatest(coalesce(p_skipped_missing_sku_rows,0),0),
      malformed_rows = greatest(coalesce(p_malformed_rows,0),0),
      duplicate_rows = v_duplicate_rows
  where id = p_import_id;

  return jsonb_build_object(
    'import_id', p_import_id,
    'status', 'ready',
    'accepted_rows', v_seen_count,
    'skipped_discontinued_rows', v_effective_discontinued,
    'duplicate_rows', v_duplicate_rows
  );
end;
$$;

revoke all on function public.prepare_internal_store_catalog_activation_v2(uuid,bigint,bigint,bigint,bigint,bigint) from public, anon;
grant execute on function public.prepare_internal_store_catalog_activation_v2(uuid,bigint,bigint,bigint,bigint,bigint) to authenticated;

-- Expo ProffDok – FASE 42B
-- Rask aktivering av internt vareregister.
-- Aktiv import-ID er allerede autoritativ i søk/alternativer. Vi skal derfor ikke
-- masseoppdatere gamle varer til is_active=false ved hvert importbytte.
-- Det unngår statement timeout når mange Cordel-varer er utgått/fjernet.

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

  -- Ikke oppdater gamle katalograder her. Alle varesøk og leverandøralternativer
  -- kobler allerede mot imports-raden med status = active. Når gammel import
  -- arkiveres blir disse radene derfor umiddelbart usynlige uten en kostbar
  -- masseoppdatering av titusenvis av varer.
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

revoke all on function public.complete_internal_store_catalog_activation(uuid) from public, anon;
grant execute on function public.complete_internal_store_catalog_activation(uuid) to authenticated;

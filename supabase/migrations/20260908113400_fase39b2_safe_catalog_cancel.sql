-- Expo ProffDok – FASE 39B.2
-- En katalog som allerede bygges i batcher skal ikke kunne få staging slettet ved Avbryt.

create or replace function public.cancel_internal_store_catalog_import(
  p_import_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
begin
  if not public.current_user_can_manage_internal_store_catalog() then
    raise exception 'Du har ikke tilgang til å avbryte internt vareregister.'
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
    raise exception 'Aktiveringen er allerede startet. Fortsett aktiveringen i stedet for å avbryte.'
      using errcode = '55000';
  end if;

  delete from public.internal_store_catalog_stage
  where import_id = p_import_id;

  update public.internal_store_catalog_imports
  set status = 'cancelled'
  where id = p_import_id;
end;
$$;

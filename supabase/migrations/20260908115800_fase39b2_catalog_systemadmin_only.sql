-- Expo ProffDok – FASE 39B.2
-- Prisimport i det interne vareregisteret er en systemadministrativ handling.
-- Ringside/Bademiljø Expo-brukere med Butikktilbud kan fortsatt søke og bruke varer,
-- men kun Systemadministrator kan starte, fullføre eller avbryte ERP-prisimport.

create or replace function public.current_user_can_manage_internal_store_catalog()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.current_user_has_internal_store_catalog_access()
    and public.current_profile_is_systemadmin();
$$;

revoke all on function public.current_user_can_manage_internal_store_catalog() from public, anon;
grant execute on function public.current_user_can_manage_internal_store_catalog() to authenticated;

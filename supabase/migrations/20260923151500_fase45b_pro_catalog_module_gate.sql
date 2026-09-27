-- FASE 45B – eksplisitt modul-gate for proffkatalog.
-- Proffkatalog skal ikke være tilgjengelig kun fordi firmaet har leverandørtilgang.
-- Brukeren må være godkjent/aktiv og eksplisitt ha både sales og store_offers.

create or replace function public.current_user_has_pro_store_catalog_access()
returns boolean
language sql
stable
security definer
set search_path=public,pg_temp
as $$
  select
    public.current_user_has_module_access('sales')
    and public.current_user_has_module_access('store_offers')
    and public.company_has_pro_store_catalog_access(public.current_active_company_scope_id());
$$;

revoke all on function public.current_user_has_pro_store_catalog_access() from public,anon;
grant execute on function public.current_user_has_pro_store_catalog_access() to authenticated;

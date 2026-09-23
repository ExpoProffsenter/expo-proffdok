-- FASE 45B – Ekstern proffkunde får Enkel ordre gjennom eksisterende store_offers-flyt,
-- uten tilgang til Ringsides interne ERP-katalog.

create or replace function public.company_has_pro_store_catalog_access(p_company_id uuid)
returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
  select p_company_id is not null and exists(
    select 1 from public.store_catalog_company_supplier_access a
    where a.company_id=p_company_id and a.is_active=true
  );
$$;
revoke all on function public.company_has_pro_store_catalog_access(uuid) from public,anon;
grant execute on function public.company_has_pro_store_catalog_access(uuid) to authenticated;

create or replace function public.current_user_has_module_access(p_module_key text)
returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
  select public.module_access_valid_key(p_module_key)
    and exists(
      select 1 from public.profiles p
      where p.id=auth.uid()
        and coalesce(p.approved,false)=true
        and coalesce(p.deactivated,false)=false
        and (
          p.system_role='systemadmin'
          or (
            trim(p_module_key)<>'store_offers'
            and exists(
              select 1 from public.user_module_access uma
              where uma.user_id=p.id and uma.module_key=trim(p_module_key)
            )
          )
          or (
            trim(p_module_key)='store_offers'
            and (
              (
                public.is_internal_work_profile_company(public.current_active_company_scope_id())
                and exists(
                  select 1 from public.user_module_access uma
                  where uma.user_id=p.id and uma.module_key='store_offers'
                )
              )
              or (
                exists(
                  select 1 from public.user_module_access sales_access
                  where sales_access.user_id=p.id and sales_access.module_key='sales'
                )
                and public.company_has_pro_store_catalog_access(public.current_active_company_scope_id())
              )
            )
          )
        )
    );
$$;

create or replace function public.current_user_has_pro_store_catalog_access()
returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
  select public.current_user_has_module_access('sales')
    and public.company_has_pro_store_catalog_access(public.current_active_company_scope_id());
$$;

revoke all on function public.current_user_has_module_access(text) from public;
grant execute on function public.current_user_has_module_access(text) to authenticated;
revoke all on function public.current_user_has_pro_store_catalog_access() from public,anon;
grant execute on function public.current_user_has_pro_store_catalog_access() to authenticated;

-- current_user_has_internal_store_catalog_access() endres ikke.

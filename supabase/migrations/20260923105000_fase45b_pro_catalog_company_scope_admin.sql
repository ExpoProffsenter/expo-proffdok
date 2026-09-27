-- FASE 45B – firmavelger for Systemadmin og tydelig prisinnsyn per firma.
create or replace function public.list_store_catalog_company_scopes()
returns table(company_id uuid, display_name text)
language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
  if not public.current_profile_is_systemadmin() then
    raise exception 'Kun Systemadministrator kan administrere proffkundetilgang.' using errcode='42501';
  end if;
  return query select s.id,s.display_name from public.sales_company_scopes s order by s.display_name;
end; $$;
revoke all on function public.list_store_catalog_company_scopes() from public,anon;
grant execute on function public.list_store_catalog_company_scopes() to authenticated;

create or replace function public.list_store_catalog_user_net_price_access()
returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare v_company uuid:=public.current_sales_company_id();
begin
  if not public.current_profile_is_systemadmin() and not public.current_profile_is_firmaadmin() then
    raise exception 'Du har ikke tilgang til å administrere prisinnsyn.' using errcode='42501';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'user_id',p.id,
      'email',p.email,
      'company_id',m.company_id,
      'company_name',s.display_name,
      'can_view_net_price',coalesce(a.can_view_net_price,false)
    ) order by s.display_name,p.email)
    from public.sales_company_memberships m
    join public.profiles p on p.id=m.user_id
    join public.sales_company_scopes s on s.id=m.company_id
    left join public.store_catalog_user_price_access a on a.company_id=m.company_id and a.user_id=m.user_id
    where public.current_profile_is_systemadmin() or m.company_id=v_company
  ),'[]'::jsonb);
end; $$;
revoke all on function public.list_store_catalog_user_net_price_access() from public,anon;
grant execute on function public.list_store_catalog_user_net_price_access() to authenticated;

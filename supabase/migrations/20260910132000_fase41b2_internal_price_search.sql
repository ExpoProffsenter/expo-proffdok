-- Expo ProffDok – FASE 41B.2
-- Eget read-only Prissøk mot aktivt internt vareregister.
-- Eksisterende Butikktilbud-katalogtilgang beholdes uendret.

create or replace function public.current_user_has_internal_store_price_search_access()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select exists (
    select 1
    from public.profiles p
    join public.sales_company_memberships m on m.user_id = p.id
    join public.sales_company_scopes s on s.id = m.company_id
    where p.id = auth.uid()
      and coalesce(p.approved, false) = true
      and coalesce(p.deactivated, false) = false
      and s.normalized_name in (
        public.sales_normalize_company_name('Ringside Rørleggerbedrift AS'),
        public.sales_normalize_company_name('Bademiljø Expo'),
        public.sales_normalize_company_name('Expo Proffsenter')
      )
  );
$function$;

revoke all on function public.current_user_has_internal_store_price_search_access() from public;
grant execute on function public.current_user_has_internal_store_price_search_access() to authenticated;

create or replace function public.search_internal_store_catalog_prices(
  p_query text,
  p_limit integer default 30
)
returns table(
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
as $function$
declare
  v_query text := trim(coalesce(p_query, ''));
  v_query_lower text := lower(trim(coalesce(p_query, '')));
  v_query_sku text := public.internal_store_catalog_normalize_sku(p_query);
  v_query_gtin text := public.internal_store_catalog_normalize_gtin(p_query);
  v_limit integer := least(greatest(coalesce(p_limit, 30), 1), 50);
begin
  if not public.current_user_has_internal_store_price_search_access() then
    raise exception 'Du har ikke tilgang til Prissøk.' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.internal_store_catalog_imports
    where status in ('loading', 'ready')
  ) then
    raise exception 'Vareregisteret oppdateres akkurat nå. Prøv igjen når importen er aktivert.' using errcode = '55000';
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
$function$;

revoke all on function public.search_internal_store_catalog_prices(text, integer) from public;
grant execute on function public.search_internal_store_catalog_prices(text, integer) to authenticated;

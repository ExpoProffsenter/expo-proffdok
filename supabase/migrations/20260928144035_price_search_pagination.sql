-- FASE 45B follow-up – paginert Prissøk med korrekt totalt antall treff.
-- Den eksisterende RPC-en beholdes for bakoverkompatibilitet og gjenoppretting
-- av den midlertidige arbeidslisten.

create or replace function public.search_internal_store_catalog_prices_page(
  p_query text,
  p_limit integer default 30,
  p_offset integer default 0
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
  gross_margin_percent numeric,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_query text := trim(coalesce(p_query, ''));
  v_query_lower text := lower(trim(coalesce(p_query, '')));
  v_query_sku text := public.internal_store_catalog_normalize_sku(p_query);
  v_query_gtin text := public.internal_store_catalog_normalize_gtin(p_query);
  v_limit integer := least(greatest(coalesce(p_limit, 30), 1), 50);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_can_net boolean := public.current_user_has_feature_access('view_internal_net_prices');
begin
  if not public.current_user_has_internal_store_price_search_access() then
    raise exception 'Du har ikke tilgang til Prissøk.' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.internal_store_catalog_imports
    where status in ('loading', 'ready')
  ) then
    raise exception 'Vareregisteret oppdateres akkurat nå. Prøv igjen når importen er aktivert.'
      using errcode = '55000';
  end if;

  if length(v_query) < 2 then return; end if;

  return query
  with matched as (
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
      case when v_can_net then i.purchase_net_ex_vat else null end as purchase_net_ex_vat,
      i.customer_price_ex_vat,
      i.customer_price_incl_vat,
      case when v_can_net then i.purchase_discount_percent else null end as purchase_discount_percent,
      case when v_can_net then i.gross_margin_percent else null end as gross_margin_percent,
      case
        when i.supplier_product_number_key = v_query_sku then 0
        when v_query_gtin is not null and i.gtin = v_query_gtin then 1
        when i.supplier_product_number_key like v_query_sku || '%' then 2
        else 3
      end as match_rank
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
  )
  select
    m.id,
    m.supplier_name,
    m.supplier_product_number,
    m.description,
    m.gtin,
    m.nobb_number,
    m.product_url,
    m.image_url,
    m.product_group,
    m.price_date,
    m.purchase_net_ex_vat,
    m.customer_price_ex_vat,
    m.customer_price_incl_vat,
    m.purchase_discount_percent,
    m.gross_margin_percent,
    count(*) over()::bigint as total_count
  from matched m
  order by m.match_rank, m.description, m.supplier_name, m.id
  limit v_limit
  offset v_offset;
end;
$$;

revoke all on function public.search_internal_store_catalog_prices_page(text, integer, integer)
  from public, anon;
grant execute on function public.search_internal_store_catalog_prices_page(text, integer, integer)
  to authenticated;

comment on function public.search_internal_store_catalog_prices_page(text, integer, integer) is
  'Paginert internt Prissøk med totalt treffantall. Beholder tilgangskontroll og maskering av sensitive priser.';

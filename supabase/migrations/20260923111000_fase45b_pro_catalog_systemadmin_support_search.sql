-- FASE 45B – Systemadmin kan QA-se proffkundens katalog i eksisterende Sales-supportmodus.
create or replace function public.search_pro_store_catalog_support(
  p_company_id uuid,
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
  suggested_sale_price_ex_vat numeric,
  suggested_sale_price_incl_vat numeric,
  my_net_price_ex_vat numeric
)
language plpgsql stable security definer set search_path=public,pg_temp as $$
declare
  v_query text:=trim(coalesce(p_query,''));
  v_query_lower text:=lower(trim(coalesce(p_query,'')));
  v_query_sku text:=public.internal_store_catalog_normalize_sku(p_query);
  v_query_gtin text:=public.internal_store_catalog_normalize_gtin(p_query);
  v_limit integer:=least(greatest(coalesce(p_limit,30),1),50);
begin
  if not public.current_profile_is_systemadmin() then
    raise exception 'Kun Systemadministrator kan bruke supportvisning av proffkatalog.' using errcode='42501';
  end if;
  if not exists(select 1 from public.sales_company_scopes s where s.id=p_company_id) then
    raise exception 'Firmaet finnes ikke.' using errcode='P0002';
  end if;
  if length(v_query)<2 then return; end if;

  return query
  select i.id,i.supplier_name,i.supplier_product_number,i.description,i.gtin,i.nobb_number,
    i.product_url,i.image_url,i.product_group,i.price_date,
    i.customer_price_ex_vat,i.customer_price_incl_vat,
    round(i.customer_price_ex_vat*(1-a.discount_percent/100),2)
  from public.internal_store_catalog_items i
  join public.store_catalog_company_supplier_access a
    on a.company_id=p_company_id and a.supplier_key=i.supplier_key and a.is_active=true
  where i.is_active=true
    and (
      i.supplier_product_number_key=v_query_sku
      or (v_query_gtin is not null and i.gtin=v_query_gtin)
      or i.search_text ilike '%'||v_query_lower||'%'
    )
  order by case
    when i.supplier_product_number_key=v_query_sku then 0
    when v_query_gtin is not null and i.gtin=v_query_gtin then 1
    when i.supplier_product_number_key like v_query_sku||'%' then 2
    else 3 end,
    i.description,i.supplier_name
  limit v_limit;
end; $$;
revoke all on function public.search_pro_store_catalog_support(uuid,text,integer) from public,anon;
grant execute on function public.search_pro_store_catalog_support(uuid,text,integer) to authenticated;

-- Additive read-only customer search; existing internal search is unchanged.
create or replace function public.search_pro_store_catalog_smart(
  p_query text, p_limit integer default 30, p_offset integer default 0, p_company_id uuid default null
)
returns table (
  id uuid, supplier_name text, supplier_product_number text, description text,
  gtin text, nobb_number text, product_url text, image_url text, product_group text,
  price_date date, suggested_sale_price_ex_vat numeric,
  suggested_sale_price_incl_vat numeric, my_net_price_ex_vat numeric, total_count bigint, match_kind text
)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_query text := lower(trim(coalesce(p_query, '')));
  v_sku text := public.internal_store_catalog_normalize_sku(p_query);
  v_gtin text := public.internal_store_catalog_normalize_gtin(p_query);
  v_limit integer := least(greatest(coalesce(p_limit, 30), 1), 50);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_can_net boolean;
  v_company uuid;
  v_words text[];
  v_word text;
  v_pattern text;
  v_expanded text;
  v_direct text;
  v_groups text[] := array[]::text[];
  v_literals text[] := array[]::text[];
begin
  if auth.uid() is null then
    raise exception 'Innlogging kreves.' using errcode='42501';
  end if;
  if p_company_id is not null then
    if not coalesce(public.current_profile_is_systemadmin(),false) then
      raise exception 'Kun systemadministrator kan velge supportfirma.' using errcode='42501';
    end if;
    v_company := p_company_id;
    v_can_net := true;
  else
    if not coalesce(public.current_user_has_pro_store_catalog_access(),false) then
      raise exception 'Du har ikke tilgang til proff-vareregister.' using errcode='42501';
    end if;
    v_company := public.current_sales_company_id();
    v_can_net := coalesce(public.current_user_can_view_store_catalog_net_price(),false);
  end if;
  if exists (select 1 from public.internal_store_catalog_imports imp where imp.status in ('loading', 'ready')) then
    raise exception 'Vareregisteret oppdateres akkurat nå. Prøv igjen når importen er aktivert.' using errcode = '55000';
  end if;
  if length(v_query) < 2 then return; end if;
  if length(v_query) > 160 then
    raise exception 'Bruk høyst 160 tegn i varesøket.' using errcode = '22023';
  end if;
  select array_agg(word order by position) into v_words
  from regexp_split_to_table(v_query, '[^[:alnum:]æøå]+') with ordinality as t(word, position)
  where word <> '';
  if coalesce(cardinality(v_words), 0) = 0 then return; end if;
  if cardinality(v_words) > 10 then
    raise exception 'Bruk høyst ti søkeord. Alle ordene må finnes på varen.' using errcode = '22023';
  end if;

  foreach v_word in array v_words loop
    -- Values are quoted as SQL literals; no input is executable SQL or regex.
    -- Keep these predicates directly on search_text so the existing trigram index can be used.
    select '(' || string_agg(format('i.search_text ilike %L escape ''!''', pattern), ' or ') || ')'
      into v_expanded from unnest(public.internal_store_catalog_smart_patterns(v_word)) as p(pattern);
    v_pattern := '%' || replace(replace(replace(v_word, '!', '!!'), '%', '!%'), '_', '!_') || '%';
    v_groups := array_append(v_groups, v_expanded);
    v_literals := array_append(v_literals, format('i.search_text ilike %L escape ''!''', v_pattern));
  end loop;
  v_expanded := array_to_string(v_groups, ' and ');
  v_direct := array_to_string(v_literals, ' and ');

  return query execute format($query$
    with matched as (
      select i.id, i.supplier_name, i.supplier_product_number, i.description,
        i.gtin, i.nobb_number, i.product_url, i.image_url, i.product_group, i.price_date,
        i.customer_price_ex_vat as suggested_sale_price_ex_vat,
        i.customer_price_incl_vat as suggested_sale_price_incl_vat,
        case when $3 then round(i.customer_price_ex_vat*(1-a.discount_percent/100),2) else null end as my_net_price_ex_vat,
        case when i.supplier_product_number_key = $1 then 0
          when $2 is not null and i.gtin = $2 then 1
          when %s then 2 else 3 end as match_rank
      from public.internal_store_catalog_items i
      join public.internal_store_catalog_imports imp on imp.id = i.last_import_id and imp.status = 'active'
      join public.store_catalog_company_supplier_access a on a.company_id=$6 and a.supplier_key=i.supplier_key and a.is_active=true
      where i.is_active = true and (
        i.supplier_product_number_key = $1
        or ($2 is not null and i.gtin = $2)
        or (%s)
      )
    )
    select m.id, m.supplier_name, m.supplier_product_number, m.description,
      m.gtin, m.nobb_number, m.product_url, m.image_url, m.product_group, m.price_date,
      m.suggested_sale_price_ex_vat, m.suggested_sale_price_incl_vat, m.my_net_price_ex_vat, count(*) over()::bigint,
      case when m.match_rank < 2 then 'number' when m.match_rank = 2 then 'words' else 'related' end
    from matched m order by m.match_rank, m.description, m.supplier_name, m.id
    limit $4 offset $5
  $query$, v_direct, v_expanded)
  using v_sku, v_gtin, v_can_net, v_limit, v_offset, v_company;
end;
$$;
revoke all on function public.search_pro_store_catalog_smart(text, integer, integer, uuid) from public, anon;
grant execute on function public.search_pro_store_catalog_smart(text, integer, integer, uuid) to authenticated;
comment on function public.search_pro_store_catalog_smart(text,integer,integer,uuid) is 'Kundens leverandøravgrensede smartsøk. Bare veiledende salgspris og kundens egen avtalte pris; ingen interne prisfelt. Supportfirma krever systemadmin.';

-- Additive, read-only Prissøk. Old lookup/pagination and all catalog data stay intact.
-- Each word is an indexed LIKE condition, with bounded, explicit trade aliases.
create or replace function public.internal_store_catalog_smart_patterns(p_word text)
returns text[] language sql immutable security invoker set search_path = '' as $$
  select case lower(p_word)
    when 'servantbatteri' then array['%servant%batt%', '%servant%kran%', '%servbatt%']
    when 'servantkran' then array['%servant%kran%', '%servant%batt%', '%servbatt%']
    when 'servbatt' then array['%servbatt%', '%servant%batt%', '%servant%kran%']
    when 'dusjbatteri' then array['%dusj%batt%', '%dusj%kran%', '%dusj%armatur%']
    when 'dusjkran' then array['%dusj%kran%', '%dusj%batt%', '%dusj%armatur%']
    when 'dusjarmatur' then array['%dusj%armatur%', '%dusj%batt%', '%dusj%kran%']
    when 'kjøkkenbatteri' then array['%kjøkken%batt%', '%kjøkken%kran%', '%kjokken%batt%', '%kjokken%kran%']
    when 'kjokkenbatteri' then array['%kjokken%batt%', '%kjøkken%batt%', '%kjøkken%kran%', '%kjokken%kran%']
    when 'kjøkkenkran' then array['%kjøkken%kran%', '%kjøkken%batt%', '%kjokken%kran%', '%kjokken%batt%']
    when 'kjokkenkran' then array['%kjokken%kran%', '%kjøkken%kran%', '%kjøkken%batt%', '%kjokken%batt%']
    when 'kjokken' then array['%kjokken%', '%kjøkken%']
    when 'toalett' then array['%toalett%', '%klosett%', '%wc%']
    when 'klosett' then array['%klosett%', '%toalett%', '%wc%']
    when 'wc' then array['%wc%', '%toalett%', '%klosett%']
    when 'sort' then array['%sort%', '%svart%']
    when 'svart' then array['%svart%', '%sort%']
    when 'krom' then array['%krom%', '%chrome%']
    when 'chrome' then array['%chrome%', '%krom%']
    else array['%' || replace(replace(replace(lower(p_word), '!', '!!'), '%', '!%'), '_', '!_') || '%']
  end;
$$;
revoke all on function public.internal_store_catalog_smart_patterns(text) from public, anon, authenticated;

create or replace function public.search_internal_store_catalog_prices_smart(
  p_query text, p_limit integer default 30, p_offset integer default 0
)
returns table (
  id uuid, supplier_name text, supplier_product_number text, description text,
  gtin text, nobb_number text, product_url text, image_url text, product_group text,
  price_date date, purchase_net_ex_vat numeric, customer_price_ex_vat numeric,
  customer_price_incl_vat numeric, purchase_discount_percent numeric,
  gross_margin_percent numeric, total_count bigint, match_kind text
)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_query text := lower(trim(coalesce(p_query, '')));
  v_sku text := public.internal_store_catalog_normalize_sku(p_query);
  v_gtin text := public.internal_store_catalog_normalize_gtin(p_query);
  v_limit integer := least(greatest(coalesce(p_limit, 30), 1), 50);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_can_net boolean;
  v_words text[];
  v_word text;
  v_pattern text;
  v_expanded text;
  v_direct text;
  v_groups text[] := array[]::text[];
  v_literals text[] := array[]::text[];
begin
  if auth.uid() is null or not coalesce(public.current_user_has_internal_store_price_search_access(), false) then
    raise exception 'Du har ikke tilgang til Prissøk.' using errcode = '42501';
  end if;
  v_can_net := public.current_user_has_feature_access('view_internal_net_prices');
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
        case when $3 then i.purchase_net_ex_vat else null end as purchase_net_ex_vat,
        i.customer_price_ex_vat, i.customer_price_incl_vat,
        case when $3 then i.purchase_discount_percent else null end as purchase_discount_percent,
        case when $3 then i.gross_margin_percent else null end as gross_margin_percent,
        case when i.supplier_product_number_key = $1 then 0
          when $2 is not null and i.gtin = $2 then 1
          when %s then 2 else 3 end as match_rank
      from public.internal_store_catalog_items i
      join public.internal_store_catalog_imports imp on imp.id = i.last_import_id and imp.status = 'active'
      where i.is_active = true and (
        i.supplier_product_number_key = $1
        or ($2 is not null and i.gtin = $2)
        or (%s)
      )
    )
    select m.id, m.supplier_name, m.supplier_product_number, m.description,
      m.gtin, m.nobb_number, m.product_url, m.image_url, m.product_group, m.price_date,
      m.purchase_net_ex_vat, m.customer_price_ex_vat, m.customer_price_incl_vat,
      m.purchase_discount_percent, m.gross_margin_percent, count(*) over()::bigint,
      case when m.match_rank < 2 then 'number' when m.match_rank = 2 then 'words' else 'related' end
    from matched m order by m.match_rank, m.description, m.supplier_name, m.id
    limit $4 offset $5
  $query$, v_direct, v_expanded)
  using v_sku, v_gtin, v_can_net, v_limit, v_offset;
end;
$$;
revoke all on function public.search_internal_store_catalog_prices_smart(text, integer, integer) from public, anon;
grant execute on function public.search_internal_store_catalog_prices_smart(text, integer, integer) to authenticated;
comment on function public.search_internal_store_catalog_prices_smart(text, integer, integer) is
  'Lesende Prissøk: alle ord i fri rekkefølge, avgrensede fagaliaser, eksakte koder først, samme tilgang/nettomaskering og aktive import som eksisterende søk.';

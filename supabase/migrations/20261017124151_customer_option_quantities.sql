CREATE OR REPLACE FUNCTION public.accept_sales_offer(token uuid, accepted_name text, selected_options jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $$
declare
  offer_row public.sales_offers%rowtype;
  version_row public.sales_offer_versions%rowtype;
  result_payload jsonb;
  v_selected jsonb := coalesce(selected_options, '[]'::jsonb);
  v_invalid_count integer := 0;
  is_store boolean := false;
  submitted jsonb;
  published jsonb;
  canonical jsonb := '[]'::jsonb;
  seen_ids text[] := array[]::text[];
  replaced_ids text[] := array[]::text[];
  qty_text text;
  qty numeric;
  unit_text text;
  unit_price numeric;
  options_total numeric := 0;
begin
  if token is null then raise exception 'Offer not found' using errcode = 'P0002'; end if;
  if nullif(trim(coalesce(accepted_name, '')), '') is null then raise exception 'Accepted name is required' using errcode = '22023'; end if;
  if jsonb_typeof(v_selected) <> 'array' then raise exception 'Selected options must be an array' using errcode = '22023'; end if;

  select * into offer_row from public.sales_offers where public_token = token for update;
  if offer_row.id is null then raise exception 'Offer not found' using errcode = 'P0002'; end if;
  if offer_row.status = 'accepted' then raise exception 'Offer already accepted' using errcode = 'P0001'; end if;
  if offer_row.status = 'declined' then raise exception 'Tilbudet er allerede avvist.' using errcode = 'P0001'; end if;

  select * into version_row from public.sales_offer_versions where id = offer_row.active_version_id and offer_id = offer_row.id;
  if version_row.id is null then raise exception 'Active offer version not found' using errcode = 'P0002'; end if;

  select exists (
    select 1 from jsonb_array_elements(coalesce(version_row.lines, '[]'::jsonb)) e(elem)
    where e.elem->>'__storeOfferMeta' = 'true'
  ) into is_store;
  if is_store and now() >= version_row.created_at + make_interval(days => least(365, greatest(1, version_row.validity_days))) then raise exception 'Tilbudet er utløpt.' using errcode = 'P0001'; end if;

  select count(*) into v_invalid_count
  from jsonb_array_elements(v_selected) s(elem)
  where jsonb_typeof(s.elem) <> 'object'
     or nullif(trim(coalesce(s.elem->>'id','')), '') is null
     or not exists (select 1 from jsonb_array_elements(coalesce(version_row.options, '[]'::jsonb)) p(elem) where p.elem->>'id' = s.elem->>'id');
  if v_invalid_count > 0 then raise exception 'Selected option is not part of the published offer' using errcode = '22023'; end if;

  -- Only identity and a permitted quantity come from the browser.
  -- All prices, fixed quantities and metadata come from the published version.
  for submitted in select value from jsonb_array_elements(v_selected) loop
    if submitted->>'id' = any(seen_ids) then
      raise exception 'Samme opsjon kan ikke velges flere ganger.' using errcode = '22023';
    end if;
    seen_ids := array_append(seen_ids, submitted->>'id');
    select value into published from jsonb_array_elements(version_row.options)
      where value->>'id' = submitted->>'id';
    if published->>'optionType' = 'alternative' and nullif(published->>'replacementLineId','') is not null then
      if published->>'replacementLineId' = any(replaced_ids) then
        raise exception 'Velg bare ett alternativ per post.' using errcode = '22023';
      end if;
      replaced_ids := array_append(replaced_ids, published->>'replacementLineId');
    end if;
    unit_text := replace(regexp_replace(trim(coalesce(published->>'amount','')), '\s', '', 'g'), ',', '.');
    unit_text := regexp_replace(unit_text, '\.-$', '');
    unit_price := case when unit_text ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$' then unit_text::numeric else 0 end;
    qty_text := replace(regexp_replace(trim(coalesce(published->>'quantity','1')), '\s', '', 'g'), ',', '.');
    qty := case when qty_text ~ '^[+]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$' then qty_text::numeric else 1 end;
    if qty <= 0 then qty := 1; end if;
    if published->'customerCanChooseQuantity' = 'true'::jsonb then
      if published->>'optionType' = 'alternative' or unit_price < 0 then
        raise exception 'Antallsvalg gjelder bare tillegg med positiv eller null enhetspris.' using errcode = '22023';
      end if;
      qty_text := replace(trim(coalesce(submitted->>'quantity', nullif(published->>'quantity',''), '1')), ',', '.');
      if qty_text !~ '^[0-9]+([.][0-9]{1,3})?$' then
        raise exception 'Ugyldig antall på opsjon.' using errcode = '22023';
      end if;
      qty := qty_text::numeric;
      if qty <= 0 or qty > 100000 then
        raise exception 'Antall må være over 0 og høyst 100 000.' using errcode = '22023';
      end if;
      published := published || jsonb_build_object('quantity', qty);
    end if;
    options_total := options_total + unit_price * qty;
    canonical := canonical || jsonb_build_array(published);
  end loop;
  v_selected := canonical;

  result_payload := jsonb_build_object(
    'accepted_by', trim(accepted_name),
    'accepted_at', now(),
    'offer_id', offer_row.id,
    'version_id', version_row.id,
    'version_number', version_row.version_number,
    'selected_options', v_selected,
    'accepted_total', version_row.total_ex_vat + options_total,
    'version_snapshot', to_jsonb(version_row)
  );

  update public.sales_offers
  set status = 'accepted', accepted_at = now(), accepted_by = trim(accepted_name), accepted_payload = result_payload, updated_at = now()
  where id = offer_row.id;

  return result_payload;
end;
$$;


-- Version check shares the same row lock as acceptance, including an empty selection.
create or replace function public.accept_sales_offer_quantities(
  token uuid, accepted_name text, selected_options jsonb, expected_version_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare current_version uuid;
begin
  select active_version_id into current_version
    from public.sales_offers where public_token = token for update;
  if not found then raise exception 'Offer not found' using errcode = 'P0002'; end if;
  if expected_version_id is null or current_version is distinct from expected_version_id then
    raise exception 'Tilbudet er oppdatert. Last inn siden på nytt og kontroller tilbudet før aksept.' using errcode = '40001';
  end if;
  return public.accept_sales_offer(token, accepted_name, selected_options);
end;
$$;
revoke all on function public.accept_sales_offer_quantities(uuid,text,jsonb,uuid) from public;
grant execute on function public.accept_sales_offer_quantities(uuid,text,jsonb,uuid) to anon, authenticated;

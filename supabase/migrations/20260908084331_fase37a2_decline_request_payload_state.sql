-- Expo ProffDok – FASE 37A2
-- Digital avvisning av Butikktilbud synkroniseres til sales_requests slik at
-- intern Sales-liste viser Avvist uten å gjette fra mutable klientstate.

create or replace function public.decline_sales_offer(token uuid, declined_name text)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  offer_row public.sales_offers%rowtype;
  version_row public.sales_offer_versions%rowtype;
  decision_payload jsonb;
  is_store boolean := false;
  v_declined_at timestamptz := now();
begin
  if token is null then raise exception 'Offer not found' using errcode = 'P0002'; end if;
  if nullif(trim(coalesce(declined_name, '')), '') is null then raise exception 'Name is required' using errcode = '22023'; end if;

  select * into offer_row
  from public.sales_offers
  where public_token = token
  for update;

  if offer_row.id is null then raise exception 'Offer not found' using errcode = 'P0002'; end if;
  if offer_row.status = 'accepted' then raise exception 'Offer already accepted' using errcode = 'P0001'; end if;
  if offer_row.status = 'declined' then raise exception 'Offer already declined' using errcode = 'P0001'; end if;

  select * into version_row
  from public.sales_offer_versions
  where id = offer_row.active_version_id
    and offer_id = offer_row.id;

  if version_row.id is null then raise exception 'Active offer version not found' using errcode = 'P0002'; end if;

  select exists (
    select 1
    from jsonb_array_elements(coalesce(version_row.lines, '[]'::jsonb)) e(elem)
    where e.elem->>'__storeOfferMeta' = 'true'
  ) into is_store;

  if not is_store then raise exception 'Only store offers can be declined digitally' using errcode = '42501'; end if;
  if v_declined_at >= version_row.created_at + make_interval(days => least(365, greatest(1, version_row.validity_days))) then
    raise exception 'Tilbudet er utløpt.' using errcode = 'P0001';
  end if;

  decision_payload := jsonb_build_object(
    'declined_by', trim(declined_name),
    'declined_at', v_declined_at,
    'offer_id', offer_row.id,
    'version_id', version_row.id,
    'version_number', version_row.version_number,
    'version_snapshot', to_jsonb(version_row)
  );

  update public.sales_offers
  set status = 'declined',
      declined_at = v_declined_at,
      declined_by = trim(declined_name),
      declined_payload = decision_payload,
      updated_at = v_declined_at
  where id = offer_row.id;

  update public.sales_requests r
  set status = 'Avvist',
      payload = jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(coalesce(r.payload, '{}'::jsonb), '{status}', to_jsonb('Avvist'::text), true),
              '{statusClass}', to_jsonb('sales-status-quote'::text), true
            ),
            '{nextStep}', to_jsonb('Tilbudet er avvist'::text), true
          ),
          '{offerDeclinedAt}', to_jsonb(v_declined_at), true
        ),
        '{offerDeclinedBy}', to_jsonb(trim(declined_name)), true
      ),
      updated_at = v_declined_at
  where r.company_id = offer_row.company_id
    and r.request_ref = offer_row.request_ref;

  return decision_payload;
end;
$$;

revoke all on function public.decline_sales_offer(uuid,text) from public, authenticated;
grant execute on function public.decline_sales_offer(uuid,text) to anon;

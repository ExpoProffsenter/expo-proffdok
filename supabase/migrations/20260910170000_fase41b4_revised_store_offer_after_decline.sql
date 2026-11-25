-- Expo ProffDok – FASE 41B.4
-- Oppretter et nytt redigerbart Butikktilbud fra den faktisk avviste, publiserte
-- versjonen. Original sales_request, sales_offer, versjon, token og avvisningsdata
-- endres aldri. Ny sak får ny saksreferanse og publiseres senere som nytt offer/token.

create or replace function public.create_revised_store_offer_from_decline(
  public_offer_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_uid uuid := auth.uid();
  v_company_id uuid;
  v_offer public.sales_offers%rowtype;
  v_version public.sales_offer_versions%rowtype;
  v_request public.sales_requests%rowtype;
  v_store_meta jsonb := '{}'::jsonb;
  v_terms_meta jsonb := '{}'::jsonb;
  v_edit_lines jsonb := '[]'::jsonb;
  v_edit_options jsonb := '[]'::jsonb;
  v_payload jsonb;
  v_year text := to_char(now(), 'YYYY');
  v_next_number integer;
  v_new_ref text;
  v_created_at timestamptz := now();
begin
  if v_uid is null then
    raise exception 'Du må være innlogget for å lage revidert tilbud.' using errcode='42501';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_uid
      and coalesce(p.approved, false) = true
      and coalesce(p.deactivated, false) = false
  ) then
    raise exception 'Brukeren har ikke aktiv tilgang.' using errcode='42501';
  end if;

  if not public.current_user_has_module_access('sales')
     or not public.current_user_has_module_access('store_offers') then
    raise exception 'Du har ikke tilgang til å revidere Butikktilbud.' using errcode='42501';
  end if;

  if public_offer_token is null then
    raise exception 'Avvist tilbud mangler kundelenke.' using errcode='22023';
  end if;

  v_company_id := public.current_sales_company_scope_id();
  if v_company_id is null then
    raise exception 'Firmatilknytning mangler.' using errcode='42501';
  end if;

  select so.*
  into v_offer
  from public.sales_offers so
  where so.public_token = public_offer_token
  for update;

  if v_offer.id is null then
    raise exception 'Tilbudet finnes ikke.' using errcode='P0002';
  end if;
  if v_offer.company_id <> v_company_id then
    raise exception 'Det avviste tilbudet tilhører ikke aktivt firma.' using errcode='42501';
  end if;
  if v_offer.status <> 'declined' or v_offer.declined_at is null then
    raise exception 'Kun avviste Butikktilbud kan revideres.' using errcode='P0001';
  end if;

  select r.*
  into v_request
  from public.sales_requests r
  where r.company_id = v_offer.company_id
    and r.request_ref = v_offer.request_ref
  for update;

  if v_request.id is null or v_request.status <> 'Avvist' then
    raise exception 'Den avviste salgssaken mangler eller har ugyldig status.' using errcode='P0001';
  end if;

  if nullif(trim(coalesce(v_offer.declined_payload->>'version_id', '')), '') is not null
     and v_offer.declined_payload->>'version_id' <> v_offer.active_version_id::text then
    raise exception 'Avvisningshistorikken samsvarer ikke med aktiv publisert versjon.' using errcode='P0001';
  end if;

  select sov.*
  into v_version
  from public.sales_offer_versions sov
  where sov.id = v_offer.active_version_id
    and sov.offer_id = v_offer.id;

  if v_version.id is null then
    raise exception 'Avvist tilbudsversjon finnes ikke.' using errcode='P0002';
  end if;

  select e.elem
  into v_store_meta
  from jsonb_array_elements(coalesce(v_version.lines, '[]'::jsonb)) e(elem)
  where e.elem->>'__storeOfferMeta' = 'true'
  limit 1;

  if coalesce(v_store_meta, '{}'::jsonb) = '{}'::jsonb then
    raise exception 'Kun Butikktilbud kan revideres fra avvist status.' using errcode='42501';
  end if;

  select e.elem
  into v_terms_meta
  from jsonb_array_elements(coalesce(v_version.lines, '[]'::jsonb)) e(elem)
  where e.elem->>'__offerTermsMeta' = 'true'
  limit 1;
  v_terms_meta := coalesce(v_terms_meta, '{}'::jsonb);

  -- Behold Butikktilbud-meta, men fjern firmasnapshot/terms-meta fra editorlinjene.
  -- Eksisterende PDF-URL kan gjenbrukes, men storage-path nulles slik at en senere
  -- sletting/erstatning i den nye kladden aldri kan slette vedlegget fra historikken.
  select coalesce(
    jsonb_agg(
      case
        when jsonb_typeof(e.elem->'attachmentFile') = 'object'
          then jsonb_set(e.elem, '{attachmentFile,path}', to_jsonb(''::text), true)
        else e.elem
      end
      order by e.ord
    ),
    '[]'::jsonb
  )
  into v_edit_lines
  from jsonb_array_elements(coalesce(v_version.lines, '[]'::jsonb)) with ordinality e(elem, ord)
  where e.elem->>'__storeOfferMeta' = 'true'
     or (
       coalesce(e.elem->>'__companyMeta', 'false') <> 'true'
       and coalesce(e.elem->>'__offerTermsMeta', 'false') <> 'true'
     );

  select coalesce(
    jsonb_agg(
      case
        when jsonb_typeof(e.elem->'attachmentFile') = 'object'
          then jsonb_set(e.elem, '{attachmentFile,path}', to_jsonb(''::text), true)
        else e.elem
      end
      order by e.ord
    ),
    '[]'::jsonb
  )
  into v_edit_options
  from jsonb_array_elements(coalesce(v_version.options, '[]'::jsonb)) with ordinality e(elem, ord);

  -- Saksnummer tildeles under firmalås slik at samtidige revisjoner ikke kan få
  -- samme F-ÅÅÅÅ-nummer.
  perform pg_advisory_xact_lock(hashtextextended(v_company_id::text, 0));

  select greatest(
    coalesce(max(substring(r.request_ref from '([0-9]+)$')::integer), 41),
    41
  ) + 1
  into v_next_number
  from public.sales_requests r
  where r.company_id = v_company_id
    and r.request_ref ~ ('^F-' || v_year || '-[0-9]+$');

  v_new_ref := 'F-' || v_year || '-' || lpad(v_next_number::text, 4, '0');

  v_payload := jsonb_build_object(
    'id', v_new_ref,
    'title', coalesce(nullif(v_request.payload->>'title', ''), v_version.title, 'Butikktilbud'),
    'customer', coalesce(v_offer.customer_name, v_request.payload->>'customer', ''),
    'phone', coalesce(v_offer.customer_phone, v_request.payload->>'phone', ''),
    'email', coalesce(v_offer.customer_email, v_request.payload->>'email', ''),
    'address', coalesce(v_offer.customer_address, v_request.payload->>'address', ''),
    'postnr', coalesce(v_request.payload->>'postnr', ''),
    'city', coalesce(v_request.payload->>'city', ''),
    'source', coalesce(nullif(v_request.payload->>'source', ''), 'Butikktilbud / varesalg'),
    'note', coalesce(v_request.payload->>'note', ''),
    'responsible', coalesce(v_request.payload->>'responsible', ''),
    'projectResponsible', coalesce(v_request.payload->>'projectResponsible', v_request.payload->>'responsible', ''),
    'directOffer', true,
    'status', 'Tilbud',
    'statusClass', 'sales-status-quote',
    'nextStep', 'Rediger og publiser revidert tilbud',
    'iconName', 'send',
    'offerTitle', coalesce(v_version.title, ''),
    'offerIntro', coalesce(v_version.intro, ''),
    'offerLines', coalesce(v_edit_lines, '[]'::jsonb),
    'offerOptions', coalesce(v_edit_options, '[]'::jsonb),
    'offerReservations', coalesce(v_version.reservations, ''),
    'offerIncluded', coalesce(v_terms_meta->>'included', ''),
    'offerExcluded', coalesce(v_terms_meta->>'excluded', ''),
    'offerCustomerSupplied', coalesce(v_terms_meta->>'customerSupplied', ''),
    'offerTerms', coalesce(v_terms_meta->>'terms', ''),
    'offerPaymentTerms', coalesce(v_terms_meta->>'paymentTerms', ''),
    'offerValidityDays', coalesce(v_version.validity_days::text, '30'),
    'offerTotal', coalesce(v_version.total_ex_vat, 0),
    'storeOfferMeta', v_store_meta,
    'revisedFromRequestRef', v_offer.request_ref,
    'revisedFromOfferId', v_offer.id::text,
    'revisedFromOfferVersionId', v_version.id::text,
    'revisedFromOfferVersionNumber', v_version.version_number,
    'revisedFromDeclinedAt', v_offer.declined_at,
    'revisedFromDeclinedBy', coalesce(v_offer.declined_by, ''),
    'revisedOfferCreatedAt', v_created_at
  );

  insert into public.sales_requests (
    company_id,
    request_ref,
    status,
    payload,
    created_by,
    created_at,
    updated_at
  ) values (
    v_company_id,
    v_new_ref,
    'Tilbud',
    v_payload,
    v_uid,
    v_created_at,
    v_created_at
  );

  return jsonb_build_object(
    'request_ref', v_new_ref,
    'status', 'Tilbud',
    'revised_from_request_ref', v_offer.request_ref,
    'revised_from_version_number', v_version.version_number,
    'created_at', v_created_at
  );
end;
$$;

revoke all on function public.create_revised_store_offer_from_decline(uuid) from public, anon;
grant execute on function public.create_revised_store_offer_from_decline(uuid) to authenticated;

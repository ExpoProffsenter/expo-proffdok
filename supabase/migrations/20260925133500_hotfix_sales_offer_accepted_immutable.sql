-- Expo ProffDok – HOTFIX 2026-09-25
-- Akseptert tilbud er låst historikk. publish_sales_offer skal kunne lage nye
-- versjoner av åpne tilbud, men aldri gjenåpne et allerede akseptert tilbud.
-- Avvist-flyten endres ikke i denne hotfixen.

create or replace function public.publish_sales_offer(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_uid uuid := auth.uid();
  v_company_id uuid;
  v_requested_company_id uuid;
  v_offer_id uuid;
  v_version_id uuid;
  v_token uuid;
  v_next_version integer;
  v_existing_company_id uuid;
  v_existing_status text;
  v_existing_found boolean := false;
  v_published_by_name text;
  v_published_at timestamptz;
begin
  if v_uid is null then
    raise exception 'Du må være innlogget for å publisere tilbud.' using errcode='42501';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id=v_uid
      and coalesce(p.approved,false)=true
      and coalesce(p.deactivated,false)=false
  ) then
    raise exception 'Brukeren har ikke aktiv tilgang.' using errcode='42501';
  end if;

  if not public.current_user_has_module_access('sales') then
    raise exception 'Du har ikke tilgang til Befaring/Tilbud.' using errcode='42501';
  end if;
  if public.sales_publish_is_store_offer(payload)
     and not public.current_user_has_module_access('store_offers') then
    raise exception 'Du har ikke tilgang til Butikktilbud.' using errcode='42501';
  end if;

  select coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(u.raw_user_meta_data->>'name'), ''),
    nullif(trim(u.email), '')
  )
  into v_published_by_name
  from auth.users u
  where u.id=v_uid;

  if nullif(trim(coalesce(payload->>'support_company_id','')), '') is not null then
    begin
      v_requested_company_id := (payload->>'support_company_id')::uuid;
    exception when invalid_text_representation then
      raise exception 'Ugyldig firma for supportpublisering.' using errcode='22023';
    end;

    if not public.current_profile_is_systemadmin() then
      raise exception 'Kun systemadministrator kan publisere i supportmodus.' using errcode='42501';
    end if;
    if not exists (select 1 from public.sales_company_scopes s where s.id=v_requested_company_id) then
      raise exception 'Firmaet finnes ikke.' using errcode='22023';
    end if;
    v_company_id := v_requested_company_id;
  else
    v_company_id := public.current_sales_company_scope_id();
  end if;

  if v_company_id is null then
    raise exception 'Firmatilknytning mangler.' using errcode='42501';
  end if;

  if nullif(trim(coalesce(payload->>'offer_id','')), '') is not null then
    v_offer_id := (payload->>'offer_id')::uuid;
  else
    v_offer_id := gen_random_uuid();
  end if;

  select so.company_id, so.public_token, so.status
    into v_existing_company_id, v_token, v_existing_status
  from public.sales_offers so
  where so.id=v_offer_id
  for update;
  v_existing_found := found;

  if v_existing_found then
    if v_existing_company_id is null then
      raise exception 'Eksisterende tilbud mangler sikker firmatilhørighet og kan ikke republiseres.' using errcode='42501';
    end if;
    if v_existing_company_id <> v_company_id then
      raise exception 'Du har ikke tilgang til å publisere ny versjon av dette tilbudet.' using errcode='42501';
    end if;
    if lower(trim(coalesce(v_existing_status,''))) = 'accepted' then
      raise exception 'Akseptert tilbud er låst historikk og kan ikke republiseres.' using errcode='P0001';
    end if;

    update public.sales_offers
    set title = payload->>'title',
        customer_name = payload->>'customer_name',
        customer_email = payload->>'customer_email',
        customer_phone = payload->>'customer_phone',
        customer_address = payload->>'customer_address',
        status = 'sent',
        updated_at = now()
    where id=v_offer_id;
  else
    v_token := gen_random_uuid();
    insert into public.sales_offers (
      id, company_id, request_ref, customer_name, customer_email, customer_phone,
      customer_address, title, status, public_token
    ) values (
      v_offer_id, v_company_id, payload->>'request_ref', payload->>'customer_name',
      payload->>'customer_email', payload->>'customer_phone', payload->>'customer_address',
      payload->>'title', 'sent', v_token
    );
  end if;

  select coalesce(max(sov.version_number),0)+1
    into v_next_version
  from public.sales_offer_versions sov
  where sov.offer_id=v_offer_id;

  insert into public.sales_offer_versions (
    offer_id, version_number, title, intro, lines, options,
    reservations, validity_days, total_ex_vat, published_by, published_by_name
  ) values (
    v_offer_id, v_next_version, payload->>'title', payload->>'intro',
    coalesce(payload->'lines','[]'::jsonb), coalesce(payload->'options','[]'::jsonb),
    payload->>'reservations', coalesce((payload->>'validity_days')::integer,30),
    coalesce((payload->>'total_ex_vat')::numeric,0), v_uid, v_published_by_name
  ) returning id, created_at into v_version_id, v_published_at;

  update public.sales_offers
  set active_version_id=v_version_id, updated_at=now()
  where id=v_offer_id;

  return jsonb_build_object(
    'offer_id',v_offer_id,
    'version_id',v_version_id,
    'version_number',v_next_version,
    'public_token',v_token,
    'published_by',v_uid,
    'published_by_name',v_published_by_name,
    'published_at',v_published_at
  );
end;
$$;

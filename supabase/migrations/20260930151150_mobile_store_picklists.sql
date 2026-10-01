-- Mobil plukkliste: tre lagrede lister per innlogget intern bruker, på tvers av enheter.
-- Pris, bilder og kameraopptak lagres aldri. Tabellen er ikke direkte tilgjengelig via Data API.
create table public.mobile_store_picklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null,
  order_number text not null default '' check (char_length(order_number) <= 64),
  items jsonb not null,
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mobile_store_picklists_item_count check (
    jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 30
  )
);

create index mobile_store_picklists_user_updated_idx
  on public.mobile_store_picklists (user_id, updated_at desc);
alter table public.mobile_store_picklists enable row level security;
revoke all on table public.mobile_store_picklists from public, anon, authenticated;

-- Kun tre avgrensede RPC-er får lese/skrive. Auth, firma og modul kontrolleres hver gang.
create function public.list_mobile_store_picklists()
returns table (
  id uuid, company_id uuid, order_number text, items jsonb,
  revision integer, created_at timestamptz, updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.current_user_has_internal_store_catalog_access() then
    raise exception 'Du har ikke tilgang til plukklister.' using errcode = '42501';
  end if;

  return query
  select p.id, p.company_id, p.order_number, p.items,
         p.revision, p.created_at, p.updated_at
  from public.mobile_store_picklists p
  where p.user_id = v_uid
  order by p.updated_at desc, p.id;
end;
$$;

create function public.save_mobile_store_picklist(
  p_items jsonb,
  p_order_number text default '',
  p_id uuid default null,
  p_expected_revision integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_company_id uuid := public.current_active_company_scope_id();
  v_item jsonb;
  v_clean_items jsonb := '[]'::jsonb;
  v_seen uuid[] := array[]::uuid[];
  v_item_id uuid;
  v_product_number text;
  v_gtin text;
  v_quantity text;
  v_row public.mobile_store_picklists%rowtype;
begin
  if v_uid is null or v_company_id is null
     or not public.current_user_has_internal_store_catalog_access() then
    raise exception 'Du har ikke tilgang til plukklister.' using errcode = '42501';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) not between 1 and 30 then
    raise exception 'Plukklisten må ha mellom 1 og 30 varer.';
  end if;
  if char_length(coalesce(p_order_number, '')) > 64 then
    raise exception 'Ordrenummer kan være høyst 64 tegn.';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_item) <> 'object'
       or v_item - array['id','supplier_product_number','gtin','quantity'] <> '{}'::jsonb
       or coalesce(v_item->>'id', '') !~* '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' then
      raise exception 'Ugyldig vare i plukklisten.';
    end if;
    v_item_id := (v_item->>'id')::uuid;
    v_product_number := btrim(coalesce(v_item->>'supplier_product_number', ''));
    v_gtin := btrim(coalesce(v_item->>'gtin', ''));
    v_quantity := coalesce(v_item->>'quantity', '');
    if v_item_id = any(v_seen)
       or (v_product_number = '' and v_gtin = '')
       or char_length(v_product_number) > 128 or char_length(v_gtin) > 40
       or v_quantity !~ '^[0-9]+([.][0-9]{1,3})?$'
       or v_quantity::numeric not between 0.001 and 99999 then
      raise exception 'Ugyldig varenummer, EAN eller antall i plukklisten.';
    end if;
    v_seen := array_append(v_seen, v_item_id);
    v_clean_items := v_clean_items || jsonb_build_array(jsonb_build_object(
      'id', v_item_id, 'supplier_product_number', v_product_number,
      'gtin', v_gtin, 'quantity', v_quantity
    ));
  end loop;

  -- Profilraden er en per-bruker lås: samtidige enheter kan ikke opprette liste 4.
  perform 1 from public.profiles where id = v_uid for update;
  if not found then
    raise exception 'Brukerprofil mangler.' using errcode = '42501';
  end if;

  if p_id is null then
    if p_expected_revision is not null then
      raise exception 'Ugyldig listeversjon.';
    end if;
    if (select count(*) from public.mobile_store_picklists where user_id = v_uid) >= 3 then
      raise exception 'Du har allerede tre plukklister. Slett en liste før du lagrer en ny.';
    end if;
    insert into public.mobile_store_picklists (user_id, company_id, order_number, items)
    values (v_uid, v_company_id, btrim(coalesce(p_order_number, '')), v_clean_items)
    returning * into v_row;
  else
    if p_expected_revision is null or p_expected_revision < 1 then
      raise exception 'Ugyldig listeversjon.';
    end if;
    update public.mobile_store_picklists p
    set order_number = btrim(coalesce(p_order_number, '')),
        items = v_clean_items,
        revision = p.revision + 1,
        updated_at = now()
    where p.id = p_id and p.user_id = v_uid and p.revision = p_expected_revision
    returning p.* into v_row;
    if not found then
      raise exception 'Plukklisten er endret eller slettet på en annen enhet. Åpne listen på nytt før du lagrer.';
    end if;
  end if;

  return jsonb_build_object('id', v_row.id, 'revision', v_row.revision,
                            'updated_at', v_row.updated_at);
end;
$$;

create function public.delete_mobile_store_picklist(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.current_user_has_internal_store_catalog_access() then
    raise exception 'Du har ikke tilgang til plukklister.' using errcode = '42501';
  end if;
  delete from public.mobile_store_picklists p where p.id = p_id and p.user_id = v_uid;
  return found;
end;
$$;

revoke all on function public.list_mobile_store_picklists() from public, anon;
revoke all on function public.save_mobile_store_picklist(jsonb,text,uuid,integer) from public, anon;
revoke all on function public.delete_mobile_store_picklist(uuid) from public, anon;
grant execute on function public.list_mobile_store_picklists() to authenticated;
grant execute on function public.save_mobile_store_picklist(jsonb,text,uuid,integer) to authenticated;
grant execute on function public.delete_mobile_store_picklist(uuid) to authenticated;

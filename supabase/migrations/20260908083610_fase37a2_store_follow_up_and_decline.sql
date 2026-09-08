-- Expo ProffDok – FASE 37A2
-- Butikktilbud: flere idempotente påminnelser per publisert versjon,
-- digital avvisning og utløpssperre. Ordinære tilbud beholder eksisterende aksept.

alter table public.sales_offers
  add column if not exists declined_at timestamptz,
  add column if not exists declined_by text,
  add column if not exists declined_payload jsonb;

alter table public.sales_offer_follow_up_notifications
  add column if not exists reminder_number integer;

update public.sales_offer_follow_up_notifications
set reminder_number = 1
where reminder_number is null;

alter table public.sales_offer_follow_up_notifications
  alter column reminder_number set default 1,
  alter column reminder_number set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'sales_offer_follow_up_notifications_reminder_number_check'
      and conrelid = 'public.sales_offer_follow_up_notifications'::regclass
  ) then
    alter table public.sales_offer_follow_up_notifications
      add constraint sales_offer_follow_up_notifications_reminder_number_check
      check (reminder_number >= 1 and reminder_number <= 10);
  end if;
end $$;

alter table public.sales_offer_follow_up_notifications
  drop constraint if exists sales_offer_follow_up_notificatio_offer_id_offer_version_id_key;
drop index if exists public.sales_offer_follow_up_notificatio_offer_id_offer_version_id_key;
create unique index if not exists sales_offer_follow_up_offer_version_reminder_key
  on public.sales_offer_follow_up_notifications(offer_id, offer_version_id, reminder_number);

create or replace function public.accept_sales_offer(
  token uuid,
  accepted_name text,
  selected_options jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  offer_row public.sales_offers%rowtype;
  version_row public.sales_offer_versions%rowtype;
  result_payload jsonb;
  v_selected jsonb := coalesce(selected_options, '[]'::jsonb);
  v_invalid_count integer := 0;
  is_store boolean := false;
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
  if is_store and now() >= version_row.created_at + make_interval(days => least(365, greatest(1, version_row.validity_days))) then
    raise exception 'Tilbudet er utløpt.' using errcode = 'P0001';
  end if;

  select count(*) into v_invalid_count
  from jsonb_array_elements(v_selected) s(elem)
  where jsonb_typeof(s.elem) <> 'object'
     or nullif(trim(coalesce(s.elem->>'id','')), '') is null
     or not exists (
       select 1 from jsonb_array_elements(coalesce(version_row.options, '[]'::jsonb)) p(elem)
       where p.elem->>'id' = s.elem->>'id'
     );
  if v_invalid_count > 0 then raise exception 'Selected option is not part of the published offer' using errcode = '22023'; end if;

  result_payload := jsonb_build_object(
    'accepted_by', trim(accepted_name),
    'accepted_at', now(),
    'offer_id', offer_row.id,
    'version_id', version_row.id,
    'version_number', version_row.version_number,
    'selected_options', v_selected,
    'version_snapshot', to_jsonb(version_row)
  );

  update public.sales_offers
  set status = 'accepted', accepted_at = now(), accepted_by = trim(accepted_name),
      accepted_payload = result_payload, updated_at = now()
  where id = offer_row.id;

  return result_payload;
end;
$$;

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

  select * into offer_row from public.sales_offers where public_token = token for update;
  if offer_row.id is null then raise exception 'Offer not found' using errcode = 'P0002'; end if;
  if offer_row.status = 'accepted' then raise exception 'Offer already accepted' using errcode = 'P0001'; end if;
  if offer_row.status = 'declined' then raise exception 'Offer already declined' using errcode = 'P0001'; end if;

  select * into version_row from public.sales_offer_versions where id = offer_row.active_version_id and offer_id = offer_row.id;
  if version_row.id is null then raise exception 'Active offer version not found' using errcode = 'P0002'; end if;

  select exists (
    select 1 from jsonb_array_elements(coalesce(version_row.lines, '[]'::jsonb)) e(elem)
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
  set status = 'declined', declined_at = v_declined_at, declined_by = trim(declined_name),
      declined_payload = decision_payload, updated_at = v_declined_at
  where id = offer_row.id;

  return decision_payload;
end;
$$;

revoke all on function public.decline_sales_offer(uuid,text) from public, authenticated;
grant execute on function public.decline_sales_offer(uuid,text) to anon;

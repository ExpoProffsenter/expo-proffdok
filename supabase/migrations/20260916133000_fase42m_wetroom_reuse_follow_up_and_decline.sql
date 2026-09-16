-- Expo ProffDok – FASE 42M
-- Gjenbruker eksisterende oppfølgingsmotor og digital avvisning for ordinære
-- Våtromstilbud. Butikktilbudets metadata, standarder og scheduler beholdes.
-- Våtrom kommer kun med når en bruker eksplisitt lagrer en plan for eksakt aktiv versjon.

create or replace function public.set_wetroom_offer_follow_up_config(
  requested_request_ref text,
  requested_version_id uuid,
  requested_enabled boolean,
  requested_first_days integer default 7,
  requested_repeat_days integer default 7,
  requested_max_reminders integer default 3
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_company_id uuid := public.current_sales_company_scope_id();
  v_request public.sales_requests%rowtype;
  v_offer public.sales_offers%rowtype;
  v_version public.sales_offer_versions%rowtype;
  v_is_store boolean := false;
  v_now timestamptz := now();
  v_enabled_at timestamptz;
  v_first integer := least(90, greatest(1, coalesce(requested_first_days, 7)));
  v_repeat integer := least(90, greatest(1, coalesce(requested_repeat_days, 7)));
  v_max integer := least(10, greatest(1, coalesce(requested_max_reminders, 3)));
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_company_id is null then
    raise exception 'Company scope missing' using errcode = '42501';
  end if;
  if nullif(trim(coalesce(requested_request_ref, '')), '') is null or requested_version_id is null then
    raise exception 'Offer version is required' using errcode = '22023';
  end if;

  select * into v_request
  from public.sales_requests
  where company_id = v_company_id
    and request_ref = trim(requested_request_ref)
    and archived_at is null
  for update;
  if v_request.request_ref is null then
    raise exception 'Sales request not found' using errcode = 'P0002';
  end if;

  select * into v_offer
  from public.sales_offers
  where company_id = v_company_id
    and request_ref = v_request.request_ref
  for update;
  if v_offer.id is null or v_offer.active_version_id is null then
    raise exception 'Published offer not found' using errcode = 'P0002';
  end if;
  if v_offer.active_version_id <> requested_version_id then
    raise exception 'Tilbudsversjonen er endret. Last saken på nytt.' using errcode = 'P0001';
  end if;
  if v_offer.status <> 'sent' or v_offer.accepted_at is not null or v_offer.declined_at is not null then
    raise exception 'Oppfølgingsplan kan bare endres for et åpent tilbud.' using errcode = 'P0001';
  end if;

  select * into v_version
  from public.sales_offer_versions
  where id = requested_version_id
    and offer_id = v_offer.id;
  if v_version.id is null then
    raise exception 'Published offer version not found' using errcode = 'P0002';
  end if;

  select exists (
    select 1
    from jsonb_array_elements(coalesce(v_version.lines, '[]'::jsonb)) e(elem)
    where e.elem->>'__storeOfferMeta' = 'true'
  ) into v_is_store;
  if v_is_store then
    raise exception 'Butikktilbud følger eksisterende oppfølgingsplan.' using errcode = '42501';
  end if;

  v_enabled_at := public.sales_try_timestamptz(v_request.payload->>'wetroomFollowUpEnabledAt');
  if coalesce(requested_enabled, false) and (
    lower(coalesce(v_request.payload->>'wetroomFollowUpEnabled', 'false')) <> 'true'
    or coalesce(v_request.payload->>'wetroomFollowUpVersionId', '') <> requested_version_id::text
    or v_enabled_at is null
  ) then
    v_enabled_at := v_now;
  end if;

  update public.sales_requests
  set payload = coalesce(payload, '{}'::jsonb) || jsonb_build_object(
        'wetroomFollowUpEnabled', coalesce(requested_enabled, false),
        'wetroomFollowUpVersionId', requested_version_id::text,
        'wetroomFollowUpVersionNumber', v_version.version_number,
        'wetroomFollowUpFirstDays', v_first,
        'wetroomFollowUpRepeatDays', v_repeat,
        'wetroomFollowUpMaxReminders', v_max,
        'wetroomFollowUpEnabledAt', case when v_enabled_at is null then null else to_jsonb(v_enabled_at) end
      ),
      updated_at = v_now
  where company_id = v_company_id
    and request_ref = v_request.request_ref;

  return jsonb_build_object(
    'enabled', coalesce(requested_enabled, false),
    'request_ref', v_request.request_ref,
    'version_id', requested_version_id,
    'version_number', v_version.version_number,
    'first_days', v_first,
    'repeat_days', v_repeat,
    'max_reminders', v_max,
    'enabled_at', v_enabled_at
  );
end;
$$;

revoke all on function public.set_wetroom_offer_follow_up_config(text,uuid,boolean,integer,integer,integer) from public, anon;
grant execute on function public.set_wetroom_offer_follow_up_config(text,uuid,boolean,integer,integer,integer) to authenticated;

create or replace function public.list_sales_offer_follow_up_candidates(
  p_limit integer default 50,
  p_ignore_enabled boolean default false
)
returns table (
  offer_id uuid,
  offer_version_id uuid,
  company_id uuid,
  request_ref text,
  version_number integer,
  offer_title text,
  public_token uuid,
  customer_name text,
  customer_email text,
  customer_address text,
  published_by uuid,
  published_by_name text,
  lines jsonb,
  request_payload jsonb,
  source_email_sent_at timestamptz,
  reminder_number integer,
  max_reminders integer,
  store_offer boolean,
  existing_notification_id uuid,
  existing_notification_status text,
  existing_attempt_count integer
)
language sql
security definer
set search_path to 'pg_catalog', 'public'
as $$
  with cfg as (
    select enabled, rollout_at
    from public.sales_offer_follow_up_runtime
    where id = 1
  ),
  base as (
    select
      o.id as offer_id,
      v.id as offer_version_id,
      o.company_id,
      o.request_ref,
      v.version_number,
      v.title as offer_title,
      o.public_token,
      coalesce(nullif(o.customer_name, ''), nullif(r.payload->>'customer', ''), 'Kunde') as customer_name,
      lower(coalesce(nullif(o.customer_email, ''), nullif(r.payload->>'email', ''))) as customer_email,
      coalesce(nullif(o.customer_address, ''), nullif(r.payload->>'address', ''), '') as customer_address,
      v.published_by,
      v.published_by_name,
      v.lines,
      r.payload as request_payload,
      public.sales_try_timestamptz(r.payload->>'offerEmailSentAt') as source_email_sent_at,
      v.created_at as version_created_at,
      v.validity_days,
      coalesce(meta.store_offer, false) as store_offer,
      case
        when coalesce(meta.store_offer, false) then coalesce(meta.follow_up_enabled, true)
        else lower(coalesce(r.payload->>'wetroomFollowUpEnabled', 'false')) = 'true'
          and coalesce(r.payload->>'wetroomFollowUpVersionId', '') = v.id::text
      end as follow_up_enabled,
      case
        when coalesce(meta.store_offer, false) then coalesce(meta.first_days, 7)
        when coalesce(r.payload->>'wetroomFollowUpFirstDays', '') ~ '^[0-9]+$'
          then least(90, greatest(1, (r.payload->>'wetroomFollowUpFirstDays')::integer))
        else 7
      end as first_days,
      case
        when coalesce(meta.store_offer, false) then coalesce(meta.repeat_days, 7)
        when coalesce(r.payload->>'wetroomFollowUpRepeatDays', '') ~ '^[0-9]+$'
          then least(90, greatest(1, (r.payload->>'wetroomFollowUpRepeatDays')::integer))
        else 7
      end as repeat_days,
      case
        when coalesce(meta.store_offer, false) then coalesce(meta.max_reminders, 3)
        when coalesce(r.payload->>'wetroomFollowUpMaxReminders', '') ~ '^[0-9]+$'
          then least(10, greatest(1, (r.payload->>'wetroomFollowUpMaxReminders')::integer))
        else 3
      end as max_reminders,
      case
        when coalesce(meta.store_offer, false) then public.sales_try_timestamptz(r.payload->>'offerEmailSentAt')
        else greatest(
          public.sales_try_timestamptz(r.payload->>'offerEmailSentAt'),
          public.sales_try_timestamptz(r.payload->>'wetroomFollowUpEnabledAt')
        )
      end as schedule_anchor_at
    from cfg
    join public.sales_requests r on true
    join public.sales_offers o on o.company_id = r.company_id and o.request_ref = r.request_ref
    join public.sales_offer_versions v on v.id = o.active_version_id and v.offer_id = o.id
    left join lateral (
      select
        true as store_offer,
        case when lower(coalesce(e.elem->>'followUpEnabled','true')) = 'false' then false else true end as follow_up_enabled,
        case when coalesce(e.elem->>'followUpFirstDays','') ~ '^[0-9]+$' then least(90, greatest(1, (e.elem->>'followUpFirstDays')::integer)) else 7 end as first_days,
        case when coalesce(e.elem->>'followUpRepeatDays','') ~ '^[0-9]+$' then least(90, greatest(1, (e.elem->>'followUpRepeatDays')::integer)) else 7 end as repeat_days,
        case when coalesce(e.elem->>'followUpMaxReminders','') ~ '^[0-9]+$' then least(10, greatest(1, (e.elem->>'followUpMaxReminders')::integer)) else 3 end as max_reminders
      from jsonb_array_elements(coalesce(v.lines, '[]'::jsonb)) e(elem)
      where e.elem->>'__storeOfferMeta' = 'true'
      limit 1
    ) meta on true
    where (cfg.enabled or p_ignore_enabled)
      and r.archived_at is null
      and o.status = 'sent'
      and o.accepted_at is null
      and o.declined_at is null
      and o.public_token is not null
      and public.sales_try_timestamptz(r.payload->>'offerEmailSentAt') is not null
      and (
        (coalesce(meta.store_offer, false) = true
          and public.sales_try_timestamptz(r.payload->>'offerEmailSentAt') >= cfg.rollout_at)
        or
        (coalesce(meta.store_offer, false) = false
          and lower(coalesce(r.payload->>'wetroomFollowUpEnabled', 'false')) = 'true'
          and coalesce(r.payload->>'wetroomFollowUpVersionId', '') = v.id::text
          and public.sales_try_timestamptz(r.payload->>'wetroomFollowUpEnabledAt') >= cfg.rollout_at)
      )
      and coalesce(nullif(r.payload->>'offerEmailVersionNumber', ''), '-1') ~ '^[0-9]+$'
      and (r.payload->>'offerEmailVersionNumber')::integer = v.version_number
      and nullif(trim(r.payload->>'offerEmailSentTo'), '') is not null
      and lower(trim(r.payload->>'offerEmailSentTo')) = lower(trim(coalesce(o.customer_email, '')))
      and lower(trim(r.payload->>'offerEmailSentTo')) = lower(trim(coalesce(r.payload->>'email', '')))
      and now() < v.created_at + make_interval(days => least(365, greatest(1, v.validity_days)))
  ),
  scheduled as (
    select
      b.*,
      coalesce(s.sent_count, 0)::integer as sent_count,
      s.last_sent_at,
      (coalesce(s.sent_count, 0) + 1)::integer as next_reminder_number,
      case
        when coalesce(s.sent_count, 0) = 0 then b.schedule_anchor_at + make_interval(days => b.first_days)
        else greatest(b.source_email_sent_at, s.last_sent_at) + make_interval(days => b.repeat_days)
      end as due_at
    from base b
    left join lateral (
      select count(*)::integer as sent_count, max(n.sent_at) as last_sent_at
      from public.sales_offer_follow_up_notifications n
      where n.offer_id = b.offer_id
        and n.offer_version_id = b.offer_version_id
        and n.status = 'sent'
    ) s on true
  )
  select
    s.offer_id,
    s.offer_version_id,
    s.company_id,
    s.request_ref,
    s.version_number,
    s.offer_title,
    s.public_token,
    s.customer_name,
    s.customer_email,
    s.customer_address,
    s.published_by,
    s.published_by_name,
    s.lines,
    s.request_payload,
    s.source_email_sent_at,
    s.next_reminder_number,
    s.max_reminders,
    s.store_offer,
    n.id,
    n.status,
    coalesce(n.attempt_count, 0)
  from scheduled s
  left join public.sales_offer_follow_up_notifications n
    on n.offer_id = s.offer_id
   and n.offer_version_id = s.offer_version_id
   and n.reminder_number = s.next_reminder_number
  where s.follow_up_enabled
    and s.schedule_anchor_at is not null
    and s.sent_count < s.max_reminders
    and s.due_at <= now()
    and (
      n.id is null
      or (n.status = 'failed' and n.attempt_count < 3)
      or (n.status = 'pending' and n.attempt_count < 3 and coalesce(n.last_attempt_at, n.created_at) < now() - interval '60 minutes')
    )
  order by s.due_at asc
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;

revoke all on function public.list_sales_offer_follow_up_candidates(integer, boolean) from public, anon, authenticated;
grant execute on function public.list_sales_offer_follow_up_candidates(integer, boolean) to service_role;

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
  set status = 'declined', declined_at = v_declined_at, declined_by = trim(declined_name), declined_payload = decision_payload, updated_at = v_declined_at
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
  where r.company_id = offer_row.company_id and r.request_ref = offer_row.request_ref;

  return decision_payload;
end;
$$;

revoke all on function public.decline_sales_offer(uuid,text) from public, authenticated;
grant execute on function public.decline_sales_offer(uuid,text) to anon;

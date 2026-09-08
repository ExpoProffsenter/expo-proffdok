-- Expo ProffDok – FASE 37A2
-- Automatisk oppfølging gjelder kun Butikktilbud. Kandidater beregnes fra
-- eksakt publisert versjon, versjonslåst oppfølgingsplan og faktisk utsendt e-post.

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
set search_path = pg_catalog, public
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
      coalesce(meta.follow_up_enabled, true) as follow_up_enabled,
      coalesce(meta.first_days, 7) as first_days,
      coalesce(meta.repeat_days, 7) as repeat_days,
      coalesce(meta.max_reminders, 3) as max_reminders
    from cfg
    join public.sales_requests r on true
    join public.sales_offers o
      on o.company_id = r.company_id
     and o.request_ref = r.request_ref
    join public.sales_offer_versions v
      on v.id = o.active_version_id
     and v.offer_id = o.id
    left join lateral (
      select
        true as store_offer,
        case when lower(coalesce(e.elem->>'followUpEnabled','true')) = 'false' then false else true end as follow_up_enabled,
        case when coalesce(e.elem->>'followUpFirstDays','') ~ '^[0-9]+$'
          then least(90, greatest(1, (e.elem->>'followUpFirstDays')::integer)) else 7 end as first_days,
        case when coalesce(e.elem->>'followUpRepeatDays','') ~ '^[0-9]+$'
          then least(90, greatest(1, (e.elem->>'followUpRepeatDays')::integer)) else 7 end as repeat_days,
        case when coalesce(e.elem->>'followUpMaxReminders','') ~ '^[0-9]+$'
          then least(10, greatest(1, (e.elem->>'followUpMaxReminders')::integer)) else 3 end as max_reminders
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
      and public.sales_try_timestamptz(r.payload->>'offerEmailSentAt') >= cfg.rollout_at
      and coalesce(nullif(r.payload->>'offerEmailVersionNumber', ''), '-1') ~ '^[0-9]+$'
      and (r.payload->>'offerEmailVersionNumber')::integer = v.version_number
      and nullif(trim(r.payload->>'offerEmailSentTo'), '') is not null
      and lower(trim(r.payload->>'offerEmailSentTo')) = lower(trim(coalesce(o.customer_email, '')))
      and lower(trim(r.payload->>'offerEmailSentTo')) = lower(trim(coalesce(r.payload->>'email', '')))
      and coalesce(meta.store_offer, false) = true
      and now() < v.created_at + make_interval(days => least(365, greatest(1, v.validity_days)))
  ),
  scheduled as (
    select
      b.*,
      coalesce(s.sent_count, 0)::integer as sent_count,
      s.last_sent_at,
      (coalesce(s.sent_count, 0) + 1)::integer as next_reminder_number,
      case
        when coalesce(s.sent_count, 0) = 0
          then b.source_email_sent_at + make_interval(days => b.first_days)
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
    and s.sent_count < s.max_reminders
    and s.due_at <= now()
    and (
      n.id is null
      or (n.status = 'failed' and n.attempt_count < 3)
      or (
        n.status = 'pending'
        and n.attempt_count < 3
        and coalesce(n.last_attempt_at, n.created_at) < now() - interval '60 minutes'
      )
    )
  order by s.due_at asc
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;

revoke all on function public.list_sales_offer_follow_up_candidates(integer, boolean)
  from public, anon, authenticated;
grant execute on function public.list_sales_offer_follow_up_candidates(integer, boolean)
  to service_role;

-- Expo ProffDok – FASE 37A2
-- Automatisk tilbudsoppfølging etter 7 dager.
-- Denne migrasjonen oppretter kun sikker lagring/kandidatlogikk.
-- Runtime starter DEAKTIVERT. Cron og aktivering kommer først ved produksjonssluttføring.

create table if not exists public.sales_offer_follow_up_runtime (
  id smallint primary key default 1 check (id = 1),
  enabled boolean not null default false,
  rollout_at timestamptz not null default now(),
  cron_secret text not null default (
    replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
  ),
  updated_at timestamptz not null default now()
);

insert into public.sales_offer_follow_up_runtime (id, enabled, rollout_at)
values (1, false, now())
on conflict (id) do nothing;

alter table public.sales_offer_follow_up_runtime enable row level security;
revoke all on table public.sales_offer_follow_up_runtime from anon, authenticated;
grant select, update on table public.sales_offer_follow_up_runtime to service_role;

create table if not exists public.sales_offer_follow_up_notifications (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.sales_offers(id) on delete cascade,
  offer_version_id uuid not null references public.sales_offer_versions(id) on delete cascade,
  company_id uuid not null,
  request_ref text not null,
  recipient_email text not null,
  source_email_sent_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_attempt_at timestamptz,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (offer_id, offer_version_id)
);

create index if not exists sales_offer_follow_up_company_request_idx
  on public.sales_offer_follow_up_notifications(company_id, request_ref);

create index if not exists sales_offer_follow_up_status_idx
  on public.sales_offer_follow_up_notifications(status, sent_at);

alter table public.sales_offer_follow_up_notifications enable row level security;

revoke all on table public.sales_offer_follow_up_notifications from anon;
grant select on table public.sales_offer_follow_up_notifications to authenticated;
grant all on table public.sales_offer_follow_up_notifications to service_role;

DROP POLICY IF EXISTS sales_offer_follow_up_notifications_select ON public.sales_offer_follow_up_notifications;
CREATE POLICY sales_offer_follow_up_notifications_select
ON public.sales_offer_follow_up_notifications
FOR SELECT
TO authenticated
USING (
  company_id = public.current_sales_company_scope_id()
);

create or replace function public.sales_try_timestamptz(p_value text)
returns timestamptz
language plpgsql
immutable
strict
set search_path = pg_catalog
as $$
begin
  return p_value::timestamptz;
exception when others then
  return null;
end;
$$;

revoke all on function public.sales_try_timestamptz(text) from public, anon, authenticated;
grant execute on function public.sales_try_timestamptz(text) to service_role;

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
  )
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
    n.id as existing_notification_id,
    n.status as existing_notification_status,
    coalesce(n.attempt_count, 0) as existing_attempt_count
  from cfg
  join public.sales_requests r on true
  join public.sales_offers o
    on o.company_id = r.company_id
   and o.request_ref = r.request_ref
  join public.sales_offer_versions v
    on v.id = o.active_version_id
   and v.offer_id = o.id
  left join public.sales_offer_follow_up_notifications n
    on n.offer_id = o.id
   and n.offer_version_id = v.id
  where
    (cfg.enabled or p_ignore_enabled)
    and r.archived_at is null
    and o.status = 'sent'
    and o.accepted_at is null
    and o.public_token is not null
    and public.sales_try_timestamptz(r.payload->>'offerEmailSentAt') is not null
    and public.sales_try_timestamptz(r.payload->>'offerEmailSentAt') >= cfg.rollout_at
    and public.sales_try_timestamptz(r.payload->>'offerEmailSentAt') <= now() - interval '7 days'
    and coalesce(nullif(r.payload->>'offerEmailVersionNumber', ''), '-1') ~ '^[0-9]+$'
    and (r.payload->>'offerEmailVersionNumber')::integer = v.version_number
    and nullif(trim(r.payload->>'offerEmailSentTo'), '') is not null
    and lower(trim(r.payload->>'offerEmailSentTo')) = lower(trim(coalesce(o.customer_email, '')))
    and lower(trim(r.payload->>'offerEmailSentTo')) = lower(trim(coalesce(r.payload->>'email', '')))
    and (
      n.id is null
      or (
        n.status = 'failed'
        and n.attempt_count < 3
      )
      or (
        n.status = 'pending'
        and n.attempt_count < 3
        and coalesce(n.last_attempt_at, n.created_at) < now() - interval '60 minutes'
      )
    )
  order by public.sales_try_timestamptz(r.payload->>'offerEmailSentAt') asc
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;

revoke all on function public.list_sales_offer_follow_up_candidates(integer, boolean) from public, anon, authenticated;
grant execute on function public.list_sales_offer_follow_up_candidates(integer, boolean) to service_role;

comment on table public.sales_offer_follow_up_notifications is
  'FASE 37A2: idempotent revisjonsspor for én automatisk kundeoppfølging per publisert tilbudsversjon.';
comment on table public.sales_offer_follow_up_runtime is
  'FASE 37A2: serverside runtime-konfigurasjon. Starter deaktivert; rollout_at settes ved produksjonsaktivering.';

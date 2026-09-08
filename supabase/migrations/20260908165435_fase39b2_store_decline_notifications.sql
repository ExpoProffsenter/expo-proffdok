-- Expo ProffDok – FASE 39B.2
-- Idempotent varsel til publisher når kunden avviser et Butikktilbud.
-- Tabellen er kun intern serverlogg. RLS er aktiv og klientroller har ingen tilgang.

create table if not exists public.sales_offer_decline_notifications (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.sales_offers(id) on delete cascade,
  offer_version_id uuid not null references public.sales_offer_versions(id) on delete cascade,
  recipient_type text not null default 'publisher' check (recipient_type = 'publisher'),
  recipient_email text not null,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (offer_id, offer_version_id, recipient_type)
);

alter table public.sales_offer_decline_notifications enable row level security;
revoke all on table public.sales_offer_decline_notifications from anon, authenticated;

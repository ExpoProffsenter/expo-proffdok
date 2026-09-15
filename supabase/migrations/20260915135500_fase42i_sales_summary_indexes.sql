-- Expo ProffDok – FASE 42I
-- Indekser for lettvekts-Sales-oversikt når antall tilbud og oppfølgingslogger vokser.
-- Kun additive indekser; ingen data, RLS eller historikk endres.

create index if not exists sales_offers_company_request_updated_idx
  on public.sales_offers (company_id, request_ref, updated_at desc, created_at desc);

create index if not exists sales_offer_follow_up_company_request_status_sent_idx
  on public.sales_offer_follow_up_notifications (company_id, request_ref, status, sent_at desc);

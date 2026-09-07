-- Expo ProffDok – FASE 37A2 PRODUKSJONSAKTIVERING
-- Denne migrasjonen skal først anvendes ETTER at 37A2 er merged og produksjonsdeploy er READY.
-- rollout_at settes samtidig som enabled=true slik at eldre tilbud aldri blir retroaktive kandidater.

update public.sales_offer_follow_up_runtime
set
  enabled = true,
  rollout_at = now(),
  updated_at = now()
where id = 1;

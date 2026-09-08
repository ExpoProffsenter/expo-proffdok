-- Expo ProffDok – FASE 37A2
-- Scheduler opprettes mens runtime fortsatt er enabled=false.
-- Produksjonsaktivering skjer i egen sluttføringsmigrasjon.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

do $$
declare
  existing_job record;
begin
  for existing_job in
    select jobid from cron.job where jobname = 'sales-offer-auto-follow-up-daily'
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;

  perform cron.schedule(
    'sales-offer-auto-follow-up-daily',
    '15 7 * * *',
    $cron$
      select net.http_post(
        url := 'https://dqffxflaoyarbxyiyhop.supabase.co/functions/v1/sales-offer-auto-follow-up',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-expo-cron-secret', (
            select cron_secret
            from public.sales_offer_follow_up_runtime
            where id = 1
          )
        ),
        body := '{"source":"pg_cron"}'::jsonb,
        timeout_milliseconds := 20000
      );
    $cron$
  );
end;
$$;

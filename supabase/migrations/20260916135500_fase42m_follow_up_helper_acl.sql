-- Expo ProffDok – FASE 42M
-- Hardening for hjelpefunksjon og robust runtime-baseline.
-- Production har allerede runtime-rad; INSERT er derfor no-op der.

revoke all on function public.sales_try_timestamptz(text) from public, anon, authenticated;
grant execute on function public.sales_try_timestamptz(text) to service_role;

insert into public.sales_offer_follow_up_runtime (id, enabled, rollout_at)
values (1, false, now())
on conflict (id) do nothing;

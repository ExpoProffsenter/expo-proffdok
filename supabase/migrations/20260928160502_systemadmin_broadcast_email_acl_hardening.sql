-- Follow-up for environments where Supabase default privileges granted
-- service_role more rights than the broadcast functions require.

revoke all on table public.marketing_email_preferences
  from public, anon, authenticated, service_role;
revoke all on table public.marketing_email_preference_events
  from public, anon, authenticated, service_role;
revoke all on table public.systemadmin_email_campaigns
  from public, anon, authenticated, service_role;

grant select, update on table public.marketing_email_preferences to service_role;
grant select, insert, update on table public.systemadmin_email_campaigns to service_role;

drop policy if exists marketing_email_preferences_client_deny
  on public.marketing_email_preferences;
create policy marketing_email_preferences_client_deny
  on public.marketing_email_preferences
  for all to anon, authenticated
  using (false)
  with check (false);

drop policy if exists marketing_email_preference_events_client_deny
  on public.marketing_email_preference_events;
create policy marketing_email_preference_events_client_deny
  on public.marketing_email_preference_events
  for all to anon, authenticated
  using (false)
  with check (false);

drop policy if exists systemadmin_email_campaigns_client_deny
  on public.systemadmin_email_campaigns;
create policy systemadmin_email_campaigns_client_deny
  on public.systemadmin_email_campaigns
  for all to anon, authenticated
  using (false)
  with check (false);

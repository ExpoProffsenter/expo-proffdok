-- Oppfølging etter Sandbox-advisor: indekser FK-en og hold den interne
-- firmatilgangsfunksjonen utenfor den eksponerte authenticated-API-en.

create index if not exists company_module_access_granted_by_idx
  on public.company_module_access (granted_by);

revoke all on function public.company_has_store_offers_access(uuid)
  from public, anon, authenticated;

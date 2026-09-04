-- Expo ProffDok – FASE 35B hardening
-- Mottakere skal bare kunne endre read_at på prosjektvarsler.

revoke update on public.project_participant_notices from authenticated;
grant update (read_at) on public.project_participant_notices to authenticated;

-- FASE 45B – Enkel ordre skal aldri ha kundelink/kundeportal.
-- UE-portalen beholdes. Server-guard ligger på portaltilgangstabellen slik at også
-- fremtidige klienter eller direkte RPC-kall stoppes dersom de prøver å opprette
-- eller reaktivere kundetilgang for en enkel ordre.

create or replace function public.fase45b_block_simple_order_customer_portal()
returns trigger
language plpgsql
security definer
set search_path=public,pg_temp
as $$
begin
  if new.role = 'kunde' and exists (
    select 1
    from public.projects p
    where p.id = new.project_id
      and (
        lower(trim(coalesce(p.data->'project'->>'workflowType',''))) = 'simple_order'
        or coalesce((p.data->'project'->>'simpleOrder')::boolean,false) = true
      )
  ) then
    raise exception 'Enkel ordre har ikke kundelenke/kundeportal.' using errcode='42501';
  end if;
  return new;
end;
$$;

revoke all on function public.fase45b_block_simple_order_customer_portal() from public,anon,authenticated;

drop trigger if exists trg_fase45b_block_simple_order_customer_portal on public.project_portal_access;
create trigger trg_fase45b_block_simple_order_customer_portal
before insert or update on public.project_portal_access
for each row execute function public.fase45b_block_simple_order_customer_portal();

-- Forsvar i dybden: dersom et prosjekt mot formodning konverteres til Enkel ordre
-- etter at kundetilgang finnes, revokeres den idet prosjektet lagres. UE beholdes.
create or replace function public.fase45b_revoke_customer_portal_on_simple_order()
returns trigger
language plpgsql
security definer
set search_path=public,pg_temp
as $$
begin
  if lower(trim(coalesce(new.data->'project'->>'workflowType',''))) = 'simple_order'
     or coalesce((new.data->'project'->>'simpleOrder')::boolean,false) = true then
    update public.project_portal_access
    set revoked_at = coalesce(revoked_at,now()), updated_at=now()
    where project_id=new.id and role='kunde' and revoked_at is null;
  end if;
  return new;
end;
$$;

revoke all on function public.fase45b_revoke_customer_portal_on_simple_order() from public,anon,authenticated;

drop trigger if exists trg_fase45b_revoke_customer_portal_on_simple_order on public.projects;
create trigger trg_fase45b_revoke_customer_portal_on_simple_order
after insert or update of data on public.projects
for each row execute function public.fase45b_revoke_customer_portal_on_simple_order();

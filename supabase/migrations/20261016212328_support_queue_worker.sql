-- Only the new support queue is affected. No scheduler is activated here.
-- A crash after save/before browser invocation must leave a dispatchable message.
alter table support_private.outbox add column last_attempt_at timestamptz;
create index support_outbox_pending_idx on support_private.outbox(last_attempt_at) where state<>'accepted';
create function public.support_mail_pending() returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(id),'[]'::jsonb) from (
 select id from support_private.outbox where state not in ('accepted','review')
 and coalesce(lease_until,'-infinity')<now() and attempts<6
 and coalesce(last_attempt_at,'-infinity')<now()-interval '5 minutes'
 order by first_attempt_at nulls first,id limit 10) candidates
$$;
create function support_private.mark_attempt() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.state='sending' and new.attempts>old.attempts then new.last_attempt_at:=now(); end if;
 return new;
end; $$;
create trigger support_mail_attempt before update on support_private.outbox
 for each row execute function support_private.mark_attempt();
revoke all on function support_private.mark_attempt() from public,anon,authenticated,service_role;
revoke all on function public.support_mail_pending() from public,anon,authenticated;
grant execute on function public.support_mail_pending() to service_role;

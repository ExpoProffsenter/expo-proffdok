-- Revoked owners/agents must not occupy every slot of the retry batch.
-- Authorization is checked again under the claim lock before any delivery.
create or replace function public.support_mail_pending() returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(id),'[]'::jsonb) from (
 select o.id from support_private.outbox o
 join support_private.messages m on m.id=o.message_id
 join support_private.tickets t on t.id=m.ticket_id
 where o.state not in ('accepted','review') and o.attempts<6
 and coalesce(o.lease_until,'-infinity')<now()
 and coalesce(o.last_attempt_at,'-infinity')<now()-interval '5 minutes'
 and support_private.active_user(t.owner_id,t.company_id)
 and (m.kind<>'support' or exists(select 1 from public.profiles p where
  p.id=m.author_id and p.approved and not coalesce(p.deactivated,false) and p.system_role='systemadmin'))
 order by o.first_attempt_at nulls first,o.id limit 10) candidates
$$;
revoke all on function public.support_mail_pending() from public,anon,authenticated;
grant execute on function public.support_mail_pending() to service_role;

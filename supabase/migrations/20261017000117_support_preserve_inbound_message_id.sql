-- Internal activity notifications must not replace a conversation's Message-ID.
-- In particular, received mail keeps the ID used by the sender's email client.
create or replace function public.support_mail_finish(p_id uuid,p_lease_id uuid,p_state text,p_provider_id text default null,p_rfc_message_id text default null) returns void
language plpgsql security definer set search_path='' as $$
begin
 if p_state is null or p_state not in ('accepted','failed','uncertain') or (p_state='accepted' and coalesce(length(p_provider_id),0) not between 1 and 150)
 then raise exception 'Ugyldig sendestatus.' using errcode='22023';end if;
 update support_private.outbox set state=p_state,provider_id=p_provider_id,lease_until=null
 where id=p_id and lease_id=p_lease_id and state='sending';
 if found and p_state='accepted' and p_rfc_message_id ~ '^<[^<>[:space:]]+>$' and length(p_rfc_message_id)<=998 then
  update support_private.messages m set message_id=p_rfc_message_id
  from support_private.outbox o
  where o.id=p_id and o.message_id=m.id and o.audience='user'
  and m.kind='support' and m.source='app';
 end if;
end; $$;
revoke all on function public.support_mail_finish(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.support_mail_finish(uuid,uuid,text,text,text) to service_role;

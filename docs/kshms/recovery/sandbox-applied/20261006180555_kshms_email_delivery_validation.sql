begin;
create function public.kshms_email_validate(p_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare o public.kshms_notification_outbox%rowtype;d public.kshms_deviations%rowtype;
begin
 select * into o from public.kshms_notification_outbox where id=p_id;
 if o.id is null or o.status<>'sending' then return false;end if;
 select * into d from public.kshms_deviations where company_id=o.company_id and id=o.deviation_id;
 if d.status='closed' or d.responsible_id<>o.user_id or d.assignment_number<>o.assignment_number or not kshms_private.deviation_member(o.company_id,o.user_id)
 or o.attempts>20 or o.created_at<now()-interval '23 hours' then
  update public.kshms_notification_outbox set status='suppressed' where id=o.id;return false;
 end if;
 return true;
end $$;
revoke all on function public.kshms_email_validate(uuid) from public,anon,authenticated;
grant execute on function public.kshms_email_validate(uuid) to service_role;
commit;

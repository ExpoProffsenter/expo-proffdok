-- Explicit instruction from Kenneth: routine editions and reading reminders
-- stay in-app; never send email. Preserve assignments, receipts and sent audit.
create function kshms_private.block_routine_email_delivery() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if new.notification_kind='reading' and new.status in ('pending','sending') then
  new.status:='suppressed';
  new.last_error_code:='routine_email_disabled';
  new.reserved_at:=null;
 end if;
 return new;
end $$;
revoke all on function kshms_private.block_routine_email_delivery() from public,anon,authenticated,service_role;
create trigger kshms_block_routine_email_delivery before insert or update
on public.kshms_notification_outbox for each row
execute function kshms_private.block_routine_email_delivery();
update public.kshms_notification_outbox
set status='suppressed',last_error_code='routine_email_disabled',reserved_at=null
where notification_kind='reading' and status in ('pending','sending');

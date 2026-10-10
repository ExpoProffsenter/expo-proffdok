-- Weekly overdue deviation/RUH reminders. No transport activation or history edits.
alter table public.kshms_notification_outbox
 add column notification_phase text not null default 'assignment',
 add column reminder_on date,
 add column reminder_due_on date,
 add constraint kshms_notification_phase check (
  (notification_phase='assignment' and reminder_on is null and reminder_due_on is null)
  or (notification_phase='reminder' and notification_kind='deviation'
      and reminder_on is not null and reminder_due_on is not null));
alter table public.kshms_notification_outbox drop constraint kshms_notification_outbox_deviation_id_assignment_number_key;
create unique index kshms_deviation_assignment_notification
 on public.kshms_notification_outbox(deviation_id,assignment_number) where notification_phase='assignment';
create unique index kshms_deviation_reminder_notification
 on public.kshms_notification_outbox(deviation_id,assignment_number,reminder_on) where notification_phase='reminder';

alter table kshms_private.email_worker_settings add column reminders_enabled_since timestamptz not null default now();
create function kshms_private.reminder_activation() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.enabled is distinct from old.enabled then new.reminders_enabled_since:=now();end if;
 return new;
end $$;
create trigger kshms_reminder_activation before update on kshms_private.email_worker_settings
 for each row execute function kshms_private.reminder_activation();

create function kshms_private.reminder_slot(due_date date,today date) returns date
language sql immutable set search_path='' as $$
 select case when today>due_date then due_date+1+7*((today-due_date-1)/7) end;
$$;
create function kshms_private.reminder_access_since(c uuid,u uuid) returns timestamptz
language sql stable security definer set search_path='' as $$
 select greatest(module.updated_at,m.updated_at,
  case when m.workspace_role<>'firmaadmin' then a.changed_at end)
 from public.company_module_access module
 join public.sales_company_memberships m on m.company_id=module.company_id and m.user_id=u
 left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id
 where module.company_id=c and module.module_key='kshms';
$$;

-- Keep the established assignment checks for all six task kinds.
alter function kshms_private.notification_active(public.kshms_notification_outbox) rename to assignment_notification_active;
create function kshms_private.notification_active(o public.kshms_notification_outbox) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare since timestamptz;today date:=(now() at time zone 'Europe/Oslo')::date;
begin
 if not kshms_private.assignment_notification_active(o) then return false;end if;
 if o.notification_phase='assignment' then return true;end if;
 select greatest(reminders_enabled_since,kshms_private.reminder_access_since(o.company_id,o.user_id)) into since
 from kshms_private.email_worker_settings where singleton and enabled;
 return since is not null and o.created_at>=since and exists(
  select 1 from public.kshms_deviations d where d.id=o.deviation_id and d.company_id=o.company_id
  and d.due_on=o.reminder_due_on and o.reminder_on=kshms_private.reminder_slot(d.due_on,today));
end $$;

create function kshms_private.sync_deviation_reminders() returns void
language plpgsql security definer set search_path='' as $$
declare cfg kshms_private.email_worker_settings%rowtype;d public.kshms_deviations%rowtype;today date:=(now() at time zone 'Europe/Oslo')::date;
begin
 select * into cfg from kshms_private.email_worker_settings where singleton;
 if not cfg.enabled then return;end if;
 -- Only the current weekly slot is eligible, never a backlog of missed slots.
 -- Lock each case before a fresh queue read, including concurrent deadline edits.
 for d in select * from public.kshms_deviations where status<>'closed' and due_on<today
  order by due_on,id for update skip locked loop
  if kshms_private.deviation_member(d.company_id,d.responsible_id)
   and kshms_private.reminder_slot(d.due_on,today)>=(greatest(cfg.reminders_enabled_since,
    kshms_private.reminder_access_since(d.company_id,d.responsible_id)) at time zone 'Europe/Oslo')::date
   and not exists(select 1 from public.kshms_notification_outbox o where o.deviation_id=d.id
    and (o.created_at>now()-interval '7 days' or o.sent_at>now()-interval '7 days' or o.status in ('pending','sending'))) then
   insert into public.kshms_notification_outbox(company_id,deviation_id,user_id,assignment_number,notification_phase,reminder_on,reminder_due_on)
   values(d.company_id,d.id,d.responsible_id,d.assignment_number,'reminder',kshms_private.reminder_slot(d.due_on,today),d.due_on)
   on conflict do nothing;
  end if;
 end loop;
end $$;

-- Profiles have no activation timestamp. Fence queued reminders immediately
-- when eligibility changes, including a disable/re-enable between worker runs.
create function kshms_private.reminder_profile_change() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if row(new.approved,new.deactivated,new.role) is distinct from row(old.approved,old.deactivated,old.role) then
  update public.kshms_notification_outbox set status='suppressed',last_error_code='recipient_access_changed'
  where user_id=new.id and notification_phase='reminder' and status in('pending','sending');
 end if;
 return new;
end $$;
create trigger kshms_reminder_profile_change after update of approved,deactivated,role on public.profiles
 for each row execute function kshms_private.reminder_profile_change();

create or replace function public.kshms_deviation_tasks(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare today date:=(now() at time zone 'Europe/Oslo')::date;
begin
 perform kshms_private.require_context(p_company_id);
 return jsonb_build_object('company_id',p_company_id,'user_id',auth.uid(),'as_of',today,
 'count',(select count(*) from public.kshms_deviations where company_id=p_company_id and responsible_id=auth.uid() and status<>'closed'),
 'overdue',(select count(*) from public.kshms_deviations where company_id=p_company_id and responsible_id=auth.uid() and status<>'closed' and due_on<today),
 'due_today',(select count(*) from public.kshms_deviations where company_id=p_company_id and responsible_id=auth.uid() and status<>'closed' and due_on=today),
 'due_soon',(select count(*) from public.kshms_deviations where company_id=p_company_id and responsible_id=auth.uid() and status<>'closed' and due_on between today+1 and today+3),
 'items',(select coalesce(jsonb_agg(item order by due_on,id),'[]') from (
 select id,due_on,jsonb_build_object('id',id,'title',title,'due_on',due_on,'status',status,
 'deadline_status',case when due_on<today then 'overdue' when due_on=today then 'today' when due_on<=today+3 then 'soon' else 'later' end) item
 from public.kshms_deviations where company_id=p_company_id and responsible_id=auth.uid() and status<>'closed'
 order by due_on,id limit 20) tasks));
end $$;

revoke all on function kshms_private.reminder_activation(),kshms_private.reminder_slot(date,date),
 kshms_private.reminder_access_since(uuid,uuid),kshms_private.notification_active(public.kshms_notification_outbox),
 kshms_private.sync_deviation_reminders(),kshms_private.reminder_profile_change() from public,anon,authenticated,service_role;

-- Reservation exposes only the delivery phase, never case content.
create or replace function public.kshms_email_reserve() returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.kshms_notification_outbox%rowtype;cfg kshms_private.email_worker_settings%rowtype;recipient text;
begin
 select * into cfg from kshms_private.email_worker_settings where singleton;
 if not cfg.enabled or cfg.app_url !~ '^https://[^/]+/?$' then return null;end if;
 loop
  select * into o from public.kshms_notification_outbox
   where (status='pending' and available_at<=now()) or (status='sending' and reserved_at<now()-interval '10 minutes')
   order by available_at,id for update skip locked limit 1;
  if o.id is null then return null;end if;
  if not kshms_private.notification_active(o) then
   update public.kshms_notification_outbox set status='suppressed',last_error_code='assignment_inactive' where id=o.id;continue;
  end if;
  if o.attempts>=10 or o.first_attempt_at<now()-interval '23 hours' then
   update public.kshms_notification_outbox set status='failed',last_error_code='retry_limit' where id=o.id;continue;
  end if;
  select lower(trim(email)) into recipient from public.profiles where id=o.user_id;
  if o.delivery_email is not null and o.delivery_email is distinct from recipient then
   update public.kshms_notification_outbox set status='suppressed',last_error_code='recipient_changed' where id=o.id;continue;
  end if;
  if recipient is null or recipient !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or recipient ~ '\.(invalid|test|example)$' then
   update public.kshms_notification_outbox set status='suppressed',last_error_code='non_delivery_address' where id=o.id;continue;
  end if;
  update public.kshms_notification_outbox set status='sending',reserved_at=now(),attempts=attempts+1,
   first_attempt_at=coalesce(first_attempt_at,now()),delivery_email=recipient,delivery_app_url=coalesce(delivery_app_url,cfg.app_url),last_error_code=null
   where id=o.id returning * into o;
  return jsonb_build_object('id',o.id,'email',o.delivery_email,'app_url',o.delivery_app_url,'company_id',o.company_id,
   'notification_phase',o.notification_phase,'notification_kind',o.notification_kind,'object_id',o.object_id,'deviation_id',o.deviation_id,'attempt',o.attempts);
 end loop;
end $$;

create or replace function kshms_private.invoke_assignment_worker() returns void
language plpgsql security definer set search_path='' as $$
declare cfg kshms_private.email_worker_settings%rowtype;token text;
begin
 perform kshms_private.sync_due_reviews();
 select * into cfg from kshms_private.email_worker_settings where singleton;
 if not cfg.enabled then return;end if;
 perform kshms_private.sync_deviation_reminders();
 if cfg.endpoint !~ '^https://[a-z0-9]+\.supabase\.co/functions/v1/kshms-assignment-mailer$'
  or not exists(select 1 from public.kshms_notification_outbox where (status='pending' and available_at<=now()) or (status='sending' and reserved_at<now()-interval '10 minutes')) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-kshms-worker-token',token),body:='{}'::jsonb,timeout_milliseconds:=50000);
end $$;


revoke all on function public.kshms_email_reserve() from public,anon,authenticated;
grant execute on function public.kshms_email_reserve() to service_role;

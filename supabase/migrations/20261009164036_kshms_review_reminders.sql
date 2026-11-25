-- Handbook review reminders. Existing assignments and delivery fences remain.
alter table public.kshms_notification_outbox drop constraint kshms_notification_phase;
alter table public.kshms_notification_outbox add constraint kshms_notification_phase check (
 (notification_phase='assignment' and reminder_on is null and reminder_due_on is null)
 or (notification_phase='reminder' and notification_kind in('deviation','review')
     and reminder_on is not null and reminder_due_on is not null));
drop index public.kshms_notification_assignment;
create unique index kshms_notification_assignment
 on public.kshms_notification_outbox(notification_kind,object_id,user_id,assignment_number)
 where notification_kind<>'deviation' and notification_phase='assignment';
create unique index kshms_review_reminder_notification
 on public.kshms_notification_outbox(company_id,object_id,user_id,assignment_number,reminder_on)
 where notification_kind='review' and notification_phase='reminder';

create or replace function kshms_private.review_notification() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 perform kshms_private.notify_assignment(new.company_id,'review',new.company_id,new.responsible_user_id,
  new.next_review_on<(now() at time zone 'Europe/Oslo')::date,new.next_review_on);
 return new;
end $$;
create or replace function kshms_private.sync_due_reviews() returns void
language plpgsql security definer set search_path='' as $$
declare s public.kshms_settings%rowtype;
begin
 for s in select * from public.kshms_settings where next_review_on<(now() at time zone 'Europe/Oslo')::date
  order by company_id for update skip locked loop
  perform kshms_private.notify_assignment(s.company_id,'review',s.company_id,s.responsible_user_id,true,s.next_review_on);
 end loop;
end $$;

-- The original assignment records already timestamp each recipient/date generation.
-- Use them as an activation fence without rewriting any assignment history.
create function kshms_private.review_reminder_since(o public.kshms_notification_outbox) returns timestamptz
language sql stable security definer set search_path='' as $$
 select greatest(cfg.reminders_enabled_since,kshms_private.reminder_access_since(o.company_id,o.user_id),a.created_at)
 from kshms_private.email_worker_settings cfg
 join public.kshms_notification_outbox a on a.company_id=o.company_id and a.notification_kind='review'
  and a.object_id=o.object_id and a.user_id=o.user_id and a.assignment_number=o.assignment_number
  and a.notification_phase='assignment'
 where cfg.singleton and cfg.enabled;
$$;
alter function kshms_private.notification_active(public.kshms_notification_outbox) rename to deviation_notification_active;
create function kshms_private.notification_active(o public.kshms_notification_outbox) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare due date;since timestamptz;today date:=(now() at time zone 'Europe/Oslo')::date;
begin
 if o.notification_kind<>'review' then return kshms_private.deviation_notification_active(o);end if;
 if not kshms_private.deviation_member(o.company_id,o.user_id) then return false;end if;
 select s.next_review_on into due from public.kshms_settings s
 join kshms_private.notification_assignments n on n.company_id=s.company_id and n.notification_kind='review'
  and n.object_id=s.company_id and n.recipient_key='' and n.active and n.user_id=s.responsible_user_id
  and n.due_on=s.next_review_on and n.assignment_number=o.assignment_number
 where s.company_id=o.company_id and s.company_id=o.object_id and s.responsible_user_id=o.user_id
 and s.next_review_on<today
 and (exists(select 1 from public.sales_company_memberships m where m.company_id=o.company_id and m.user_id=o.user_id and m.workspace_role='firmaadmin')
  or exists(select 1 from public.kshms_member_access a where a.company_id=o.company_id and a.user_id=o.user_id and a.enabled and a.role='responsible'));
 if due is null then return false;end if;
 if o.notification_phase='assignment' then return true;end if;
 since:=kshms_private.review_reminder_since(o);
 return since is not null and o.created_at>=since and o.reminder_due_on=due
  and o.reminder_on=kshms_private.reminder_slot(due,today)
  and exists(select 1 from public.kshms_routines r join public.kshms_versions v on v.company_id=r.company_id and v.routine_id=r.id
   where r.company_id=o.company_id and not r.archived);
end $$;

create function kshms_private.sync_review_reminders() returns void
language plpgsql security definer set search_path='' as $$
declare cfg kshms_private.email_worker_settings%rowtype;s public.kshms_settings%rowtype;
 n kshms_private.notification_assignments%rowtype;o public.kshms_notification_outbox%rowtype;
 today date:=(now() at time zone 'Europe/Oslo')::date;slot date;since timestamptz;
begin
 select * into cfg from kshms_private.email_worker_settings where singleton;
 if not cfg.enabled then return;end if;
 for s in select * from public.kshms_settings where next_review_on<today
  order by next_review_on,company_id for update skip locked loop
  select * into n from kshms_private.notification_assignments where company_id=s.company_id
   and notification_kind='review' and object_id=s.company_id and recipient_key='' and active
   and user_id=s.responsible_user_id and due_on=s.next_review_on;
  if n.company_id is null then continue;end if;
  slot:=kshms_private.reminder_slot(s.next_review_on,today);
  o:=null;o.company_id:=s.company_id;o.notification_kind:='review';o.object_id:=s.company_id;
  o.user_id:=n.user_id;o.assignment_number:=n.assignment_number;o.notification_phase:='reminder';
  o.created_at:=now();o.reminder_on:=slot;o.reminder_due_on:=s.next_review_on;
  since:=kshms_private.review_reminder_since(o);
  if kshms_private.notification_active(o) and slot>=(since at time zone 'Europe/Oslo')::date
   and not exists(select 1 from public.kshms_notification_outbox q where q.company_id=s.company_id
    and q.notification_kind='review' and q.object_id=s.company_id
    and (q.created_at>now()-interval '7 days' or q.sent_at>now()-interval '7 days' or q.status in('pending','sending'))) then
   insert into public.kshms_notification_outbox(company_id,notification_kind,object_id,user_id,assignment_number,
    notification_phase,reminder_on,reminder_due_on)
   values(s.company_id,'review',s.company_id,n.user_id,n.assignment_number,'reminder',slot,s.next_review_on)
   on conflict do nothing;
  end if;
 end loop;
end $$;

create function public.kshms_review_task(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;today date:=(now() at time zone 'Europe/Oslo')::date;s public.kshms_settings%rowtype;task jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 if coalesce((x->>'responsible')::boolean,false) then
  select * into s from public.kshms_settings where company_id=p_company_id and responsible_user_id=auth.uid();
  if s.next_review_on<=today+7 and exists(select 1 from public.kshms_routines r
   join public.kshms_versions v on v.company_id=r.company_id and v.routine_id=r.id
   where r.company_id=p_company_id and not r.archived) then
   task:=jsonb_build_object('due_on',s.next_review_on,'settings_revision',s.revision,
    'deadline_status',case when s.next_review_on<today then 'overdue' when s.next_review_on=today then 'today' else 'soon' end);
  end if;
 end if;
 return jsonb_build_object('company_id',p_company_id,'user_id',auth.uid(),'as_of',today,'task',task);
end $$;
revoke all on function public.kshms_review_task(uuid) from public,anon,authenticated,service_role;
grant execute on function public.kshms_review_task(uuid) to authenticated;
revoke all on function kshms_private.review_reminder_since(public.kshms_notification_outbox),
 kshms_private.notification_active(public.kshms_notification_outbox),kshms_private.sync_review_reminders(),
 kshms_private.deviation_notification_active(public.kshms_notification_outbox) from public,anon,authenticated,service_role;

create or replace function kshms_private.invoke_assignment_worker() returns void
language plpgsql security definer set search_path='' as $$
declare cfg kshms_private.email_worker_settings%rowtype;token text;
begin
 perform kshms_private.sync_due_reviews();
 select * into cfg from kshms_private.email_worker_settings where singleton;
 if not cfg.enabled then return;end if;
 perform kshms_private.sync_deviation_reminders();
 perform kshms_private.sync_review_reminders();
 if cfg.endpoint !~ '^https://[a-z0-9]+\.supabase\.co/functions/v1/kshms-assignment-mailer$'
  or not exists(select 1 from public.kshms_notification_outbox where (status='pending' and available_at<=now()) or (status='sending' and reserved_at<now()-interval '10 minutes')) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-kshms-worker-token',token),body:='{}'::jsonb,timeout_milliseconds:=50000);
end $$;

-- Weekly follow-up for four open assignment kinds, not new working deadlines.
alter table public.kshms_notification_outbox add column reminder_assigned_at timestamptz;
alter table public.kshms_notification_outbox drop constraint kshms_notification_phase;
alter table public.kshms_notification_outbox add constraint kshms_notification_phase check (
 (notification_phase='assignment' and reminder_on is null and reminder_due_on is null and reminder_assigned_at is null)
 or (notification_phase='reminder' and reminder_on is not null and
  ((notification_kind in('deviation','review') and reminder_due_on is not null and reminder_assigned_at is null)
   or (notification_kind in('round','risk','sja','reading') and reminder_due_on is null and reminder_assigned_at is not null))));
create unique index kshms_task_reminder_notification
 on public.kshms_notification_outbox(notification_kind,object_id,user_id,assignment_number,reminder_on)
 where notification_kind in('round','risk','sja','reading') and notification_phase='reminder';

-- Worker checks recipients explicitly; it never impersonates them or changes JWTs.
-- Mirrors project ownership/admin/internal-work-profile rules for the assigned user.
create function kshms_private.task_reminder_project_access(c uuid,u uuid,pid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select pid is null or exists(
  select 1 from public.projects p join public.profiles profile on profile.id=u
  join public.sales_company_memberships m on m.company_id=c and m.user_id=u
  where p.id=pid and p.company_scope_id=c and profile.approved and not coalesce(profile.deactivated,false)
  and (profile.system_role='systemadmin' or (
   exists(select 1 from public.user_module_access a where a.user_id=u and a.module_key='projects')
   and (p.user_id=u or m.workspace_role='firmaadmin' or (
    public.is_internal_work_profile_company(c) and
    (select count(*) from public.sales_company_memberships memberships where memberships.user_id=u
     and public.is_internal_work_profile_company(memberships.company_id))>1)) )));
$$;
create function kshms_private.task_reminder_target(o public.kshms_notification_outbox) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare pid uuid;planned date;today date:=(now() at time zone 'Europe/Oslo')::date;
begin
 if o.notification_kind not in('round','risk','sja','reading') or not kshms_private.assignment_notification_active(o) then return false;end if;
 if o.notification_kind='reading' then
  return exists(select 1 from public.kshms_versions v join public.kshms_routines r on r.company_id=v.company_id and r.id=v.routine_id
   where v.company_id=o.company_id and v.id=o.object_id and not r.archived);
 elsif o.notification_kind='sja' then
  select project_id,nullif(content->>'planned_on','')::date into pid,planned
  from public.kshms_sjas where company_id=o.company_id and id=o.object_id;
 else
  select project_id,nullif(content->>'planned_on','')::date into pid,planned
  from public.kshms_executions where company_id=o.company_id and id=o.object_id;
 end if;
 return (planned is null or planned<=today) and kshms_private.task_reminder_project_access(o.company_id,o.user_id,pid);
end $$;
create function kshms_private.task_reminder_since(o public.kshms_notification_outbox) returns timestamptz
language sql stable security definer set search_path='' as $$
 select greatest(cfg.reminders_enabled_since,kshms_private.reminder_access_since(o.company_id,o.user_id),a.created_at,
  case when exists(select 1 from public.kshms_executions e where e.company_id=o.company_id and e.id=o.object_id and e.project_id is not null)
    or exists(select 1 from public.kshms_sjas s where s.company_id=o.company_id and s.id=o.object_id and s.project_id is not null)
   then (select updated_at from public.user_module_access m where m.user_id=o.user_id and m.module_key='projects') end)
 from kshms_private.email_worker_settings cfg join public.kshms_notification_outbox a
  on a.company_id=o.company_id and a.notification_kind=o.notification_kind and a.object_id=o.object_id
  and a.user_id=o.user_id and a.assignment_number=o.assignment_number and a.notification_phase='assignment'
 where cfg.singleton and cfg.enabled;
$$;
alter function kshms_private.notification_active(public.kshms_notification_outbox) rename to review_notification_active;
create function kshms_private.notification_active(o public.kshms_notification_outbox) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare assigned timestamptz;since timestamptz;today date:=(now() at time zone 'Europe/Oslo')::date;
begin
 if o.notification_phase<>'reminder' or o.notification_kind not in('round','risk','sja','reading')
  then return kshms_private.review_notification_active(o);end if;
 if not kshms_private.task_reminder_target(o) then return false;end if;
 select created_at into assigned from public.kshms_notification_outbox where company_id=o.company_id
  and notification_kind=o.notification_kind and object_id=o.object_id and user_id=o.user_id
  and assignment_number=o.assignment_number and notification_phase='assignment';
 since:=kshms_private.task_reminder_since(o);
 return since is not null and assigned<=now()-interval '7 days' and o.created_at>=since
  and o.reminder_assigned_at=assigned
  and o.reminder_on=kshms_private.reminder_slot((assigned at time zone 'Europe/Oslo')::date+6,today);
end $$;

create function kshms_private.sync_task_reminders() returns void
language plpgsql security definer set search_path='' as $$
declare cfg kshms_private.email_worker_settings%rowtype;a public.kshms_notification_outbox%rowtype;
 o public.kshms_notification_outbox%rowtype;since timestamptz;today date:=(now() at time zone 'Europe/Oslo')::date;
begin
 select * into cfg from kshms_private.email_worker_settings where singleton;
 if not cfg.enabled then return;end if;
 -- Lock one original assignment per recipient, so concurrent collectors deduplicate.
 for a in select original.* from public.kshms_notification_outbox original
  join kshms_private.notification_assignments n on n.company_id=original.company_id
   and n.notification_kind=original.notification_kind and n.object_id=original.object_id
   and n.user_id=original.user_id and n.assignment_number=original.assignment_number and n.active
   and n.recipient_key=case when original.notification_kind='reading' then original.user_id::text else '' end
  where original.notification_phase='assignment' and original.notification_kind in('round','risk','sja','reading')
   and original.created_at<=now()-interval '7 days'
  order by original.created_at,original.id for update of original skip locked loop
  o:=null;o.company_id:=a.company_id;o.notification_kind:=a.notification_kind;o.object_id:=a.object_id;
  o.user_id:=a.user_id;o.assignment_number:=a.assignment_number;o.notification_phase:='reminder';o.created_at:=now();
  o.reminder_assigned_at:=a.created_at;
  o.reminder_on:=kshms_private.reminder_slot((a.created_at at time zone 'Europe/Oslo')::date+6,today);
  since:=kshms_private.task_reminder_since(o);
  if kshms_private.notification_active(o) and o.reminder_on>=(since at time zone 'Europe/Oslo')::date
   and not exists(select 1 from public.kshms_notification_outbox q where q.company_id=a.company_id
    and q.notification_kind=a.notification_kind and q.object_id=a.object_id and q.user_id=a.user_id
    and (q.created_at>now()-interval '7 days' or q.sent_at>now()-interval '7 days' or q.status in('pending','sending'))) then
   insert into public.kshms_notification_outbox(company_id,notification_kind,object_id,user_id,assignment_number,
    notification_phase,reminder_on,reminder_assigned_at)
   values(a.company_id,a.notification_kind,a.object_id,a.user_id,a.assignment_number,'reminder',o.reminder_on,a.created_at)
   on conflict do nothing;
  end if;
 end loop;
end $$;

-- Reading the own task groups does not inspect transport enablement or enqueue mail.
create function public.kshms_assignment_reminder_tasks(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare groups jsonb;
begin
 perform kshms_private.require_context(p_company_id);
 select coalesce(jsonb_agg(jsonb_build_object('kind',kind,'count',count) order by kind),'[]'::jsonb) into groups
 from(select a.notification_kind as kind,count(*) as count from public.kshms_notification_outbox a
  where a.company_id=p_company_id and a.user_id=auth.uid() and a.notification_phase='assignment'
  and a.notification_kind in('round','risk','sja','reading') and a.created_at<=now()-interval '7 days'
  and kshms_private.task_reminder_target(a) group by a.notification_kind) counts;
 return jsonb_build_object('company_id',p_company_id,'user_id',auth.uid(),
  'as_of',(now() at time zone 'Europe/Oslo')::date,'groups',groups);
end $$;
revoke all on function public.kshms_assignment_reminder_tasks(uuid) from public,anon,authenticated,service_role;
grant execute on function public.kshms_assignment_reminder_tasks(uuid) to authenticated;
revoke all on function kshms_private.task_reminder_project_access(uuid,uuid,uuid),
 kshms_private.task_reminder_target(public.kshms_notification_outbox),kshms_private.task_reminder_since(public.kshms_notification_outbox),
 kshms_private.sync_task_reminders(),kshms_private.notification_active(public.kshms_notification_outbox),
 kshms_private.review_notification_active(public.kshms_notification_outbox) from public,anon,authenticated,service_role;

create or replace function kshms_private.invoke_assignment_worker() returns void
language plpgsql security definer set search_path='' as $$
declare cfg kshms_private.email_worker_settings%rowtype;token text;
begin
 perform kshms_private.sync_due_reviews();
 select * into cfg from kshms_private.email_worker_settings where singleton;
 if not cfg.enabled then return;end if;
 perform kshms_private.sync_deviation_reminders();perform kshms_private.sync_review_reminders();
 perform kshms_private.sync_task_reminders();
 if cfg.endpoint !~ '^https://[a-z0-9]+\.supabase\.co/functions/v1/kshms-assignment-mailer$'
  or not exists(select 1 from public.kshms_notification_outbox where (status='pending' and available_at<=now()) or (status='sending' and reserved_at<now()-interval '10 minutes')) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-kshms-worker-token',token),body:='{}'::jsonb,timeout_milliseconds:=50000);
end $$;

-- Shared transactional mail queue for every current KS/HMS responsibility.
-- Existing signed documents/editions are only read. No email transport is enabled.
alter table public.kshms_notification_outbox alter column deviation_id drop not null;
alter table public.kshms_notification_outbox
 add column notification_kind text not null default 'deviation',
 add column object_id uuid,
 add constraint kshms_notification_object check (
  (notification_kind='deviation' and deviation_id is not null and object_id is null)
  or (notification_kind in ('round','risk','sja','reading','review') and deviation_id is null and object_id is not null));
create unique index kshms_notification_assignment on public.kshms_notification_outbox(notification_kind,object_id,user_id,assignment_number) where notification_kind<>'deviation';

-- A private generation fences A→B→A reassignment without adding fields to history.
create table kshms_private.notification_assignments (
 company_id uuid not null references public.sales_company_scopes(id),
 notification_kind text not null check(notification_kind in ('round','risk','sja','reading','review')),
 object_id uuid not null, recipient_key text not null default '',
 user_id uuid references public.profiles(id), assignment_number bigint not null default 1,
 active boolean not null, due_on date,
 primary key(company_id,notification_kind,object_id,recipient_key));
create index kshms_notification_assignment_user on kshms_private.notification_assignments(user_id);
alter table kshms_private.notification_assignments enable row level security;
revoke all on kshms_private.notification_assignments from public,anon,authenticated,service_role;

create function kshms_private.notify_assignment(c uuid,k text,o uuid,u uuid,a boolean,d date default null) returns void
language plpgsql security definer set search_path='' as $$
declare n kshms_private.notification_assignments%rowtype; recipient_key_value text;
begin
 recipient_key_value:=case when k='reading' then u::text else '' end;
 a:=coalesce(a,false) and u is not null;
 insert into kshms_private.notification_assignments as existing(company_id,notification_kind,object_id,recipient_key,user_id,active,due_on)
 values(c,k,o,recipient_key_value,u,a,d)
 on conflict(company_id,notification_kind,object_id,recipient_key) do update
 set user_id=excluded.user_id,active=excluded.active,due_on=excluded.due_on,
 assignment_number=existing.assignment_number+case when existing.user_id is distinct from excluded.user_id
  or (not existing.active and excluded.active) or (k='review' and existing.due_on is distinct from excluded.due_on) then 1 else 0 end
 where row(existing.user_id,existing.active,existing.due_on) is distinct from row(excluded.user_id,excluded.active,excluded.due_on)
 returning * into n;
 if n.company_id is null then return;end if;
 update public.kshms_notification_outbox set status='suppressed',last_error_code='assignment_inactive'
 where company_id=c and notification_kind=k and object_id=o and status in('pending','sending')
 and (k<>'reading' or user_id=u) and (not a or user_id is distinct from u or assignment_number<>n.assignment_number);
 if a then
  insert into public.kshms_notification_outbox(company_id,notification_kind,object_id,user_id,assignment_number)
  values(c,k,o,u,n.assignment_number) on conflict do nothing;
 end if;
end $$;

create function kshms_private.execution_notification() returns trigger language plpgsql security definer set search_path='' as $$
begin perform kshms_private.notify_assignment(new.company_id,new.kind,new.id,new.responsible_id,new.status='draft');return new;end $$;
create trigger kshms_execution_notification after insert or update on public.kshms_executions for each row execute function kshms_private.execution_notification();
create function kshms_private.sja_notification() returns trigger language plpgsql security definer set search_path='' as $$
begin perform kshms_private.notify_assignment(new.company_id,'sja',new.id,new.leader_id,new.status='draft');return new;end $$;
create trigger kshms_sja_notification after insert or update on public.kshms_sjas for each row execute function kshms_private.sja_notification();
create function kshms_private.reading_notification() returns trigger language plpgsql security definer set search_path='' as $$
declare needed boolean;
begin
 select (v.requires_ack or v.number=1) and not exists(select 1 from public.kshms_acknowledgments ack where ack.version_id=v.id and ack.user_id=new.user_id)
 into needed from public.kshms_versions v join public.kshms_routines r on r.id=v.routine_id and r.company_id=v.company_id
 where v.company_id=new.company_id and v.id=new.version_id;
 perform kshms_private.notify_assignment(new.company_id,'reading',new.version_id,new.user_id,needed);
 return new;
end $$;
create trigger kshms_assignment_notification after insert on public.kshms_assignments for each row execute function kshms_private.reading_notification();
create function kshms_private.ack_notification() returns trigger language plpgsql security definer set search_path='' as $$
begin perform kshms_private.notify_assignment(new.company_id,'reading',new.version_id,new.user_id,false);return new;end $$;
create trigger kshms_ack_notification after insert on public.kshms_acknowledgments for each row execute function kshms_private.ack_notification();
create function kshms_private.review_notification() returns trigger language plpgsql security definer set search_path='' as $$
begin perform kshms_private.notify_assignment(new.company_id,'review',new.company_id,new.responsible_user_id,new.next_review_on<current_date,new.next_review_on);return new;end $$;
create trigger kshms_review_notification after insert or update on public.kshms_settings for each row execute function kshms_private.review_notification();
create function kshms_private.sync_due_reviews() returns void language plpgsql security definer set search_path='' as $$
declare s public.kshms_settings%rowtype;
begin
 for s in select * from public.kshms_settings where next_review_on<current_date loop
  perform kshms_private.notify_assignment(s.company_id,'review',s.company_id,s.responsible_user_id,true,s.next_review_on);
 end loop;
end $$;

create function kshms_private.notification_active(o public.kshms_notification_outbox) returns boolean
language plpgsql stable security definer set search_path='' as $$
begin
 if not kshms_private.deviation_member(o.company_id,o.user_id) then return false;end if;
 if o.notification_kind='deviation' then
  return exists(select 1 from public.kshms_deviations d where d.company_id=o.company_id and d.id=o.deviation_id
   and d.status<>'closed' and d.responsible_id=o.user_id and d.assignment_number=o.assignment_number);
 end if;
 if not exists(select 1 from kshms_private.notification_assignments n where n.company_id=o.company_id
  and n.notification_kind=o.notification_kind and n.object_id=o.object_id
  and n.recipient_key=case when o.notification_kind='reading' then o.user_id::text else '' end
  and n.user_id=o.user_id and n.assignment_number=o.assignment_number and n.active) then return false;end if;
 case o.notification_kind
 when 'round','risk' then
  return exists(select 1 from public.kshms_executions e where e.company_id=o.company_id and e.id=o.object_id
   and e.kind=o.notification_kind and e.status='draft' and e.responsible_id=o.user_id);
 when 'sja' then
  return exists(select 1 from public.kshms_sjas s where s.company_id=o.company_id and s.id=o.object_id and s.status='draft' and s.leader_id=o.user_id);
 when 'reading' then
  return exists(select 1 from public.kshms_assignments a join public.kshms_versions v on v.company_id=a.company_id and v.id=a.version_id
   join public.kshms_routines r on r.company_id=v.company_id and r.id=v.routine_id
   where a.company_id=o.company_id and a.version_id=o.object_id and a.user_id=o.user_id and (v.requires_ack or v.number=1)
   and not exists(select 1 from public.kshms_acknowledgments ack where ack.version_id=a.version_id and ack.user_id=a.user_id));
 when 'review' then
  return exists(select 1 from public.kshms_settings s where s.company_id=o.company_id and s.company_id=o.object_id
   and s.responsible_user_id=o.user_id and s.next_review_on<current_date
   and (exists(select 1 from public.sales_company_memberships m where m.company_id=o.company_id and m.user_id=o.user_id and m.workspace_role='firmaadmin')
     or exists(select 1 from public.kshms_member_access a where a.company_id=o.company_id and a.user_id=o.user_id and a.enabled and a.role='responsible')));
 else return false;
 end case;
end $$;

-- Valid-token health checks work while delivery is disabled. Normal sends still
-- require enabled=true in the edge handler and reservation RPC.
create or replace function public.kshms_email_worker_authorize(p_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare cfg kshms_private.email_worker_settings%rowtype;expected text;
begin
 select * into cfg from kshms_private.email_worker_settings where singleton;
 select decrypted_secret into expected from vault.decrypted_secrets where id=cfg.secret_id;
 if expected is null or length(coalesce(p_token,''))<>64 or p_token<>expected then return null;end if;
 return jsonb_build_object('enabled',cfg.enabled);
end $$;
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
   'notification_kind',o.notification_kind,'object_id',o.object_id,'deviation_id',o.deviation_id,'attempt',o.attempts);
 end loop;
end $$;
create or replace function public.kshms_email_validate_attempt(p_id uuid,p_attempt integer) returns boolean
language plpgsql security definer set search_path='' as $$
declare o public.kshms_notification_outbox%rowtype;recipient text;
begin
 select * into o from public.kshms_notification_outbox where id=p_id for update;
 if o.id is null or o.status<>'sending' or o.attempts<>p_attempt or o.reserved_at<now()-interval '9 minutes' then return false;end if;
 if not exists(select 1 from kshms_private.email_worker_settings where enabled) then return false;end if;
 if not kshms_private.notification_active(o) then
  update public.kshms_notification_outbox set status='suppressed',last_error_code='assignment_inactive' where id=o.id;return false;
 end if;
 select lower(trim(email)) into recipient from public.profiles where id=o.user_id;
 if recipient is distinct from o.delivery_email then
  update public.kshms_notification_outbox set status='suppressed',last_error_code='recipient_changed' where id=o.id;return false;
 end if;
 return true;
end $$;
-- Existing fenced finish/retry API and Resend idempotency keys are unchanged.
create or replace function kshms_private.invoke_assignment_worker() returns void
language plpgsql security definer set search_path='' as $$
declare cfg kshms_private.email_worker_settings%rowtype;token text;
begin
 perform kshms_private.sync_due_reviews();
 select * into cfg from kshms_private.email_worker_settings where singleton;
 if not cfg.enabled or cfg.endpoint !~ '^https://[a-z0-9]+\.supabase\.co/functions/v1/kshms-assignment-mailer$'
  or not exists(select 1 from public.kshms_notification_outbox where (status='pending' and available_at<=now()) or (status='sending' and reserved_at<now()-interval '10 minutes')) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-kshms-worker-token',token),body:='{}'::jsonb,timeout_milliseconds:=50000);
end $$;

-- Include currently outstanding app tasks once, without modifying documents.
do $$declare e record;begin
 for e in select company_id,kind,id,responsible_id from public.kshms_executions where status='draft' loop
  perform kshms_private.notify_assignment(e.company_id,e.kind,e.id,e.responsible_id,true);
 end loop;
 for e in select company_id,id,leader_id from public.kshms_sjas where status='draft' and leader_id is not null loop
  perform kshms_private.notify_assignment(e.company_id,'sja',e.id,e.leader_id,true);
 end loop;
 for e in select a.company_id,a.version_id,a.user_id from public.kshms_assignments a
  join public.kshms_versions v on v.company_id=a.company_id and v.id=a.version_id
  join public.kshms_routines r on r.company_id=v.company_id and r.id=v.routine_id
  where (v.requires_ack or v.number=1)
  and not exists(select 1 from public.kshms_acknowledgments ack where ack.version_id=a.version_id and ack.user_id=a.user_id) loop
  perform kshms_private.notify_assignment(e.company_id,'reading',e.version_id,e.user_id,true);
 end loop;
 perform kshms_private.sync_due_reviews();
end $$;
revoke all on function kshms_private.notify_assignment(uuid,text,uuid,uuid,boolean,date),kshms_private.execution_notification(),kshms_private.sja_notification(),
 kshms_private.reading_notification(),kshms_private.ack_notification(),kshms_private.review_notification(),kshms_private.sync_due_reviews(),
 kshms_private.notification_active(public.kshms_notification_outbox),kshms_private.invoke_assignment_worker() from public,anon,authenticated,service_role;
revoke all on function public.kshms_email_worker_authorize(text),public.kshms_email_reserve(),public.kshms_email_validate_attempt(uuid,integer) from public,anon,authenticated;
grant execute on function public.kshms_email_worker_authorize(text),public.kshms_email_reserve(),public.kshms_email_validate_attempt(uuid,integer) to service_role;

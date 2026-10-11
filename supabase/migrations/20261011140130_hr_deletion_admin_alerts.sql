-- Minimal operational alerts. Systemadmin gains no personal HR read right.
create table hr_private.deletion_alerts (
 receipt_id uuid primary key,company_id uuid not null,employee_id uuid not null,user_id uuid not null,
 kind text not null check(kind='employment'),through_revision integer not null,requested_at timestamptz not null,
 reviewed_at timestamptz,reviewed_by uuid references auth.users(id) on delete set null
);
create index hr_deletion_alerts_company on hr_private.deletion_alerts(company_id,receipt_id);
create index hr_deletion_alerts_reviewer on hr_private.deletion_alerts(reviewed_by);
create table hr_private.deletion_alert_deliveries (
 id uuid primary key default gen_random_uuid(),receipt_id uuid not null references hr_private.deletion_alerts(receipt_id),
 recipient_id uuid not null,status text not null default 'pending' check(status in('pending','sending','sent','failed','suppressed')),
 attempts integer not null default 0,attempt uuid,available_at timestamptz not null default now(),reserved_at timestamptz,
 recipient_email text,first_attempt_at timestamptz,sent_at timestamptz,unique(receipt_id,recipient_id)
);
create index hr_deletion_alert_deliveries_pending on hr_private.deletion_alert_deliveries(available_at,id) where status in('pending','sending');
create table hr_private.deletion_alert_settings (
 singleton boolean primary key default true check(singleton),enabled boolean not null default false,
 endpoint text not null default '',secret_id uuid not null
);
insert into hr_private.deletion_alert_settings(secret_id)
 values(vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'hr_deletion_alert_worker','Private HR operational alert transport'));
alter table hr_private.deletion_alerts enable row level security;
alter table hr_private.deletion_alert_deliveries enable row level security;
alter table hr_private.deletion_alert_settings enable row level security;
revoke all on hr_private.deletion_alerts,hr_private.deletion_alert_deliveries,hr_private.deletion_alert_settings from public,anon,authenticated,service_role;
create function hr_private.require_system_operator() returns uuid
language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and system_role='systemadmin' and approved and not coalesce(deactivated,false))
 then raise exception 'Bare aktiv systemadministrator kan lese slettevarsler.' using errcode='42501';end if;return auth.uid();end$$;
create function hr_private.queue_deletion_alert() returns trigger
language plpgsql security definer set search_path='' as $$begin
 if new.kind<>'employment' then return new;end if;
 insert into hr_private.deletion_alerts(receipt_id,company_id,employee_id,user_id,kind,through_revision,requested_at)
 values(new.id,new.company_id,new.employee_id,new.user_id,new.kind,new.through_revision,new.requested_at) on conflict do nothing;
 insert into hr_private.deletion_alert_deliveries(receipt_id,recipient_id)
 select new.id,id from public.profiles where system_role='systemadmin' and approved and not coalesce(deactivated,false) on conflict do nothing;return new;end$$;
create trigger hr_deletion_admin_notice after insert on hr_private.purge_receipts for each row execute function hr_private.queue_deletion_alert();
create function public.hr_deletion_alert_list(p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare u uuid;rows jsonb;begin
 u:=hr_private.require_system_operator();
 select coalesce(jsonb_agg(to_jsonb(q) order by q.receipt_id),'[]'::jsonb) into rows from(
 select a.receipt_id,a.company_id,a.employee_id,a.user_id,a.requested_at,a.reviewed_at,
 coalesce(s.display_name,'Firma fjernet') as company_name,coalesce(p.state,'pending') as purge_state,
 exists(select 1 from hr_private.deletion_alert_deliveries d where d.receipt_id=a.receipt_id and d.status='sent') as email_sent
 from hr_private.deletion_alerts a left join public.sales_company_scopes s on s.id=a.company_id left join hr_private.purge_receipts p on p.id=a.receipt_id
 where(p_after is null or a.receipt_id>p_after) order by a.receipt_id limit 50)q;
 perform hr_private.require_system_operator();return jsonb_build_object('user_id',u,'alerts',rows,
 'next',case when jsonb_array_length(rows)=50 then rows->49->>'receipt_id' else null end,
 'unread',(select count(*) from hr_private.deletion_alerts where reviewed_at is null));end$$;
create function public.hr_deletion_alert_ack(p_receipt_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare u uuid;begin
 u:=hr_private.require_system_operator();update hr_private.deletion_alerts set reviewed_at=coalesce(reviewed_at,now()),reviewed_by=coalesce(reviewed_by,u) where receipt_id=p_receipt_id;
 if not found then raise exception 'Varselet finnes ikke.' using errcode='22023';end if;
 return jsonb_build_object('user_id',u,'receipt_id',p_receipt_id,'read',true);end$$;
create function public.hr_alert_worker_authorize(p_token text) returns boolean
language sql security definer set search_path='' as $$select p_token is not null and length(p_token)=64 and exists(
 select 1 from hr_private.deletion_alert_settings c join vault.decrypted_secrets s on s.id=c.secret_id
 where c.singleton and c.enabled and s.decrypted_secret=p_token)$$;
create function public.hr_alert_worker_reserve() returns jsonb
language plpgsql security definer set search_path='' as $$declare d hr_private.deletion_alert_deliveries%rowtype;p public.profiles%rowtype;a hr_private.deletion_alerts%rowtype;begin
 if not exists(select 1 from hr_private.deletion_alert_settings where singleton and enabled) then return null;end if;
 select * into d from hr_private.deletion_alert_deliveries where(status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes')
 order by available_at,id for update skip locked limit 1;if d.id is null then return null;end if;
 select * into p from public.profiles where id=d.recipient_id;
 if p.id is null or p.system_role is distinct from 'systemadmin' or not coalesce(p.approved,false) or coalesce(p.deactivated,false)
 or p.email is null or p.email !~ '^[^@ ]+@[^@ ]+\.[^@ ]+$' or(d.recipient_email is not null and d.recipient_email<>p.email) then
 update hr_private.deletion_alert_deliveries set status='suppressed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 if d.attempts>=10 or(d.first_attempt_at is not null and d.first_attempt_at<now()-interval '23 hours') then
 update hr_private.deletion_alert_deliveries set status='failed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 select * into a from hr_private.deletion_alerts where receipt_id=d.receipt_id;
 update hr_private.deletion_alert_deliveries set status='sending',attempt=gen_random_uuid(),attempts=attempts+1,recipient_email=p.email,
 reserved_at=now(),first_attempt_at=coalesce(first_attempt_at,now()) where id=d.id returning * into d;
 return jsonb_build_object('id',d.id,'attempt',d.attempt,'to',p.email,'receipt',jsonb_build_object('id',a.receipt_id,'company_id',a.company_id,
 'employee_id',a.employee_id,'user_id',a.user_id,'kind',a.kind,'through_revision',a.through_revision,'requested_at',a.requested_at));end$$;
create function public.hr_alert_worker_validate(p_id uuid,p_attempt uuid) returns boolean
language sql security definer set search_path='' as $$select exists(select 1 from hr_private.deletion_alert_deliveries d join public.profiles p on p.id=d.recipient_id
 join hr_private.deletion_alert_settings c on c.singleton and c.enabled where d.id=p_id and d.attempt=p_attempt and d.status='sending'
 and p.system_role='systemadmin' and p.approved and not coalesce(p.deactivated,false) and p.email=d.recipient_email)$$;
create function public.hr_alert_worker_finish(p_id uuid,p_attempt uuid,p_sent boolean) returns boolean
language plpgsql security definer set search_path='' as $$begin
 update hr_private.deletion_alert_deliveries set status=case when p_sent then 'sent' when attempts>=10 then 'failed' else 'pending' end,
 sent_at=case when p_sent then now() else null end,available_at=now()+interval '15 minutes'
 where id=p_id and attempt=p_attempt and status='sending';return found;end$$;
create function hr_private.invoke_deletion_alert_worker() returns void
language plpgsql security definer set search_path='' as $$declare cfg hr_private.deletion_alert_settings%rowtype;token text;begin
 select * into cfg from hr_private.deletion_alert_settings where singleton;
 if not cfg.enabled or cfg.endpoint !~ '^https://[a-z0-9]{20}\.supabase\.co/functions/v1/hr-deletion-alerts$'
 or not exists(select 1 from hr_private.deletion_alert_deliveries where(status='pending' and available_at<=now())or(status='sending' and reserved_at<now()-interval '5 minutes')) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-hr-alert-token',token),body:='{}'::jsonb,timeout_milliseconds:=40000);end$$;
revoke all on function hr_private.require_system_operator(),hr_private.queue_deletion_alert(),hr_private.invoke_deletion_alert_worker() from public,anon,authenticated,service_role;
revoke all on function public.hr_deletion_alert_list(uuid),public.hr_deletion_alert_ack(uuid) from public,anon,authenticated,service_role;
grant execute on function public.hr_deletion_alert_list(uuid),public.hr_deletion_alert_ack(uuid) to authenticated;
revoke all on function public.hr_alert_worker_authorize(text),public.hr_alert_worker_reserve(),public.hr_alert_worker_validate(uuid,uuid),public.hr_alert_worker_finish(uuid,uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function public.hr_alert_worker_authorize(text),public.hr_alert_worker_reserve(),public.hr_alert_worker_validate(uuid,uuid),public.hr_alert_worker_finish(uuid,uuid,boolean) to service_role;
select cron.schedule('hr-deletion-alerts','* * * * *','select hr_private.invoke_deletion_alert_worker();');

notify pgrst,'reload schema';

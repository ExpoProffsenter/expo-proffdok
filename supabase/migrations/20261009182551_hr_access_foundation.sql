-- H1: administrative relationships only. No HR content/file/exports API.
create schema hr_private;
revoke all on schema hr_private from public, anon, authenticated, service_role;

create table hr_private.firms (
 company_id uuid primary key references public.sales_company_scopes(id) on delete cascade,
 enabled boolean not null default false,
 purpose text not null check (length(trim(purpose)) between 10 and 500),
 legal_basis text not null check (length(trim(legal_basis)) between 10 and 500),
 review_on date not null,
 revision integer not null default 1 check (revision > 0)
);
create table hr_private.employees (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references hr_private.firms(company_id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 leader_id uuid references auth.users(id) on delete set null,
 revision integer not null default 1 check (revision > 0),
 unique(company_id,user_id), unique(company_id,id),
 check (leader_id is distinct from user_id)
);
create index hr_employees_leader on hr_private.employees(company_id,leader_id);
create table hr_private.readers (
 company_id uuid not null,
 employee_id uuid not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 granted_by uuid references auth.users(id) on delete set null,
 granted_at timestamptz not null default now(),
 reason text not null check (length(trim(reason)) between 10 and 200),
 primary key(employee_id,user_id),
 foreign key(company_id,employee_id) references hr_private.employees(company_id,id) on delete cascade
);
create index hr_readers_user on hr_private.readers(company_id,user_id);
-- Minimal restore barrier / deletion receipt. No name, reason, leader or content.
-- Keep separately when restoring a backup; retention must be reviewed before release.
create table hr_private.closed_employments (
 employee_id uuid primary key,
 company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
 user_id uuid not null,
 deleted_at timestamptz not null default now(),
 previous_revision integer not null,
 unique(company_id,user_id)
);
alter table hr_private.firms enable row level security;
alter table hr_private.employees enable row level security;
alter table hr_private.readers enable row level security;
alter table hr_private.closed_employments enable row level security;
revoke all on all tables in schema hr_private from public, anon, authenticated, service_role;
alter default privileges in schema hr_private revoke execute on functions from public;

-- Fresh database membership/profile, never JWT metadata or support/KS grants.
create function hr_private.active_member(c uuid,u uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
 where m.company_id=c and m.user_id=u and m.workspace_role in ('firmaadmin','ansatt')
 and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin'))
 and not exists(select 1 from hr_private.closed_employments d where d.company_id=c and d.user_id=u)
$$;
create function hr_private.require_actor(c uuid, admin_only boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); a boolean;
begin
 if u is null or c is null or public.current_active_company_scope_id() is distinct from c
 or not hr_private.active_member(c,u) then
  raise exception 'HR-tilgang avslått eller arbeidsprofil endret.' using errcode='42501';
 end if;
 select workspace_role='firmaadmin' into a from public.sales_company_memberships where company_id=c and user_id=u;
 if admin_only and not coalesce(a,false) then raise exception 'Bare firmaadmin kan endre HR-registeret.' using errcode='42501'; end if;
 return jsonb_build_object('company_id',c,'user_id',u,'administer',coalesce(a,false));
end $$;
create function hr_private.require_context(c uuid, admin_only boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; f hr_private.firms%rowtype;
begin
 -- Shared lock serializes reads with relationship/closure/configuration writes.
 select * into f from hr_private.firms where company_id=c for share;
 x:=hr_private.require_actor(c,admin_only);
 if not coalesce(f.enabled,false) then raise exception 'HR-registeret er ikke aktivert.' using errcode='42501'; end if;
 return x;
end $$;
create function hr_private.can_read(c uuid,e hr_private.employees,u uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select e.company_id=c and hr_private.active_member(c,e.user_id) and hr_private.active_member(c,u)
 and (e.user_id=u or e.leader_id=u or exists(select 1 from public.sales_company_memberships m
 where m.company_id=c and m.user_id=u and m.workspace_role='firmaadmin')
 or exists(select 1 from hr_private.readers r where r.company_id=c and r.employee_id=e.id and r.user_id=u))
$$;
create function hr_private.employee_json(e hr_private.employees) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',e.id,'user_id',e.user_id,'email',(select email from public.profiles where id=e.user_id),
 'leader_id',e.leader_id,'revision',e.revision,
 'readers',coalesce((select jsonb_agg(jsonb_build_object('user_id',r.user_id,'granted_by',r.granted_by,
 'granted_at',r.granted_at,'reason',r.reason) order by r.user_id) from hr_private.readers r where r.employee_id=e.id),'[]'::jsonb))
$$;

create function public.hr_foundation_configure(p_company_id uuid,p_revision integer,p_enabled boolean,p_purpose text,p_legal_basis text,p_review_on date) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; f hr_private.firms%rowtype;
begin
 -- Serialize initial configuration too; does not alter company entitlements.
 perform pg_advisory_xact_lock(hashtextextended('hr-foundation:'||p_company_id::text,0));
 x:=hr_private.require_actor(p_company_id,true);
 select * into f from hr_private.firms where company_id=p_company_id for update;
 if p_revision is distinct from coalesce(f.revision,0) then raise exception 'HR-oppsettet er endret. Hent på nytt.' using errcode='40001'; end if;
 if p_enabled is null or p_review_on is null or p_review_on<(now() at time zone 'Europe/Oslo')::date
 or p_review_on>(now() at time zone 'Europe/Oslo')::date+366 then raise exception 'Velg en ny kontrollfrist innen ett år.' using errcode='22023'; end if;
 insert into hr_private.firms(company_id,enabled,purpose,legal_basis,review_on,revision)
 values(p_company_id,p_enabled,p_purpose,p_legal_basis,p_review_on,coalesce(f.revision,0)+1)
 on conflict(company_id) do update set enabled=excluded.enabled,purpose=excluded.purpose,legal_basis=excluded.legal_basis,review_on=excluded.review_on,revision=excluded.revision
 returning * into f;
 return jsonb_build_object('context',x,'settings',to_jsonb(f),'content_enabled',false);
end $$;
create function public.hr_foundation_state(p_company_id uuid,p_after_user uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; rows jsonb;
begin
 x:=hr_private.require_actor(p_company_id,true);
 select coalesce(jsonb_agg(to_jsonb(q) order by q.id),'[]'::jsonb) into rows from (
  select p.id,p.email from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
  where m.company_id=p_company_id and (p_after_user is null or p.id>p_after_user)
  and hr_private.active_member(p_company_id,p.id) order by p.id limit 100
 ) q;
 return jsonb_build_object('context',x,'settings',(select to_jsonb(f) from hr_private.firms f where company_id=p_company_id),
 'members',rows,'next',case when jsonb_array_length(rows)=100 then rows->99->>'id' else null end,'content_enabled',false);
end $$;
create function public.hr_employee_get(p_company_id uuid,p_employee_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; e hr_private.employees%rowtype;
begin
 x:=hr_private.require_context(p_company_id);
 select * into e from hr_private.employees where company_id=p_company_id and id=p_employee_id;
 if e.id is null or not hr_private.can_read(p_company_id,e,auth.uid()) then raise exception 'HR-medarbeideren er ikke tilgjengelig.' using errcode='42501'; end if;
 return jsonb_build_object('context',x,'employee',hr_private.employee_json(e),'content_enabled',false);
end $$;
create function public.hr_employee_list(p_company_id uuid,p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; rows jsonb;
begin
 x:=hr_private.require_context(p_company_id);
 select coalesce(jsonb_agg(hr_private.employee_json(q) order by q.id),'[]'::jsonb) into rows
 from (select e.* from hr_private.employees e where e.company_id=p_company_id and (p_after is null or e.id>p_after)
 and hr_private.can_read(p_company_id,e,auth.uid()) order by e.id limit 100) q;
 return jsonb_build_object('context',x,'employees',rows,'next',case when jsonb_array_length(rows)=100 then rows->99->>'id' else null end,'content_enabled',false);
end $$;
create function public.hr_employee_command(p_company_id uuid,p_action text,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; e hr_private.employees%rowtype; d hr_private.closed_employments%rowtype;
 id uuid; u uuid; leader uuid; rev integer; reader uuid; keys text[];
begin
 -- All H1 mutations are firmadmin-only and serialize at the firm boundary.
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 x:=hr_private.require_context(p_company_id,true);
 if p_action not in ('create','leader','reader','revoke_reader','end') or p_action is null or jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'Ugyldig HR-handling.' using errcode='22023'; end if;
 keys:=case p_action when 'create' then array['user_id','leader_id'] when 'leader' then array['id','revision','leader_id','clear_old_leader_reader'] when 'reader' then array['id','revision','reader_id','reason'] when 'revoke_reader' then array['id','revision','reader_id'] else array['id','revision','confirm'] end;
 if exists(select 1 from jsonb_object_keys(p_payload) k where not k=any(keys)) then raise exception 'Innhold eller ukjente felt kan ikke lagres i HR-fundamentet.' using errcode='22023'; end if;
 if p_action='create' then
  u:=(p_payload->>'user_id')::uuid; leader:=(p_payload->>'leader_id')::uuid;
  if not hr_private.active_member(p_company_id,u) or (leader is not null and (leader=u or not hr_private.active_member(p_company_id,leader))) then raise exception 'Velg aktive interne brukere i samme firma.' using errcode='42501'; end if;
  insert into hr_private.employees(company_id,user_id,leader_id) values(p_company_id,u,leader) returning * into e;
 else
  id:=(p_payload->>'id')::uuid; rev:=(p_payload->>'revision')::integer;
  select * into e from hr_private.employees where company_id=p_company_id and employees.id=id for update;
  if e.id is null then
   -- Idempotent acknowledgement after a lost closure response, no resurrection.
   select * into d from hr_private.closed_employments where company_id=p_company_id and employee_id=id;
   if p_action='end' and d.employee_id is not null and rev=d.previous_revision and p_payload->>'confirm'='END_AND_DELETE' then
    return jsonb_build_object('context',x,'deleted',true,'receipt_id',d.employee_id,'deleted_at',d.deleted_at);
   end if;
   raise exception 'HR-medarbeideren er ikke tilgjengelig.' using errcode='42501';
  end if;
  if rev is distinct from e.revision then raise exception 'HR-registeret er endret. Hent på nytt.' using errcode='40001'; end if;
  if p_action='leader' then
   leader:=(p_payload->>'leader_id')::uuid;
   if leader is not null and (leader=e.user_id or not hr_private.active_member(p_company_id,leader)) then raise exception 'Velg en aktiv leder i samme firma.' using errcode='42501'; end if;
   if leader is distinct from e.leader_id and exists(select 1 from hr_private.readers where employee_id=e.id and user_id=e.leader_id) then
    if p_payload->>'clear_old_leader_reader' is distinct from 'true' then raise exception 'Tidligere leder har ekstra lesetilgang. Fjern den uttrykkelig før lederbyttet.' using errcode='22023'; end if;
    delete from hr_private.readers where employee_id=e.id and user_id=e.leader_id;
   end if;
   update hr_private.employees set leader_id=leader,revision=revision+1 where employees.id=e.id returning * into e;
  elsif p_action in ('reader','revoke_reader') then
   reader:=(p_payload->>'reader_id')::uuid;
   if reader is null or reader=e.user_id then raise exception 'Velg en annen aktiv leser.' using errcode='22023'; end if;
   if p_action='reader' then
    if not hr_private.active_member(p_company_id,reader) then raise exception 'Leser er ikke aktiv i samme firma.' using errcode='42501'; end if;
    insert into hr_private.readers(company_id,employee_id,user_id,granted_by,reason) values(p_company_id,e.id,reader,auth.uid(),p_payload->>'reason')
    on conflict(employee_id,user_id) do update set granted_by=excluded.granted_by,granted_at=now(),reason=excluded.reason;
   else delete from hr_private.readers where employee_id=e.id and user_id=reader; end if;
   update hr_private.employees set revision=revision+1 where employees.id=e.id returning * into e;
  elsif p_action='end' then
   if p_payload->>'confirm' is distinct from 'END_AND_DELETE' then raise exception 'Bekreft avslutning og sletting uttrykkelig.' using errcode='22023'; end if;
   insert into hr_private.closed_employments(employee_id,company_id,user_id,previous_revision) values(e.id,p_company_id,e.user_id,e.revision) returning * into d;
   -- Remove the departing person's explicit grants and leader assignments elsewhere.
   update hr_private.employees o set revision=o.revision+1,leader_id=case when o.leader_id=e.user_id then null else o.leader_id end
    where o.company_id=p_company_id and o.id<>e.id and (o.leader_id=e.user_id or exists(select 1 from hr_private.readers r where r.employee_id=o.id and r.user_id=e.user_id));
   delete from hr_private.readers where company_id=p_company_id and user_id=e.user_id;
   delete from hr_private.employees where employees.id=e.id; -- cascades all readers/reasons
   return jsonb_build_object('context',x,'deleted',true,'receipt_id',d.employee_id,'deleted_at',d.deleted_at);
  end if;
 end if;
 return jsonb_build_object('context',x,'employee',hr_private.employee_json(e),'content_enabled',false);
end $$;

-- Reserved private bucket, deliberately no upload/read/update/delete policy.
-- API deletion + resumable purge must be delivered before any file is admitted.
insert into storage.buckets(id,name,public,file_size_limit) values('hr-private','hr-private',false,10485760);
revoke all on all functions in schema hr_private from public,anon,authenticated,service_role;
revoke all on function public.hr_foundation_state(uuid,uuid),public.hr_foundation_configure(uuid,integer,boolean,text,text,date),public.hr_employee_get(uuid,uuid),public.hr_employee_list(uuid,uuid),public.hr_employee_command(uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.hr_foundation_state(uuid,uuid),public.hr_foundation_configure(uuid,integer,boolean,text,text,date),public.hr_employee_get(uuid,uuid),public.hr_employee_list(uuid,uuid),public.hr_employee_command(uuid,text,jsonb) to authenticated;

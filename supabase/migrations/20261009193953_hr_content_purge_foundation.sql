-- H3: closed content surface, registered private files and resumable purge.
-- No client uploads, signed URLs or content editor are enabled by this migration.
create table hr_private.runtime_state (
 singleton boolean primary key default true check(singleton),
 content_enabled boolean not null default false,
 restore_quarantined boolean not null default true
);
insert into hr_private.runtime_state(singleton) values(true);
create table hr_private.artifacts (
 id uuid primary key default gen_random_uuid(), company_id uuid not null,
 employee_id uuid not null, employee_revision integer not null check(employee_revision>0),
 kind text not null check(kind in ('content','version','draft','search','export')),
 payload jsonb not null, review_on date not null,
 unique(company_id,employee_id,id),
 foreign key(company_id,employee_id) references hr_private.employees(company_id,id) on delete restrict
);
create index hr_artifacts_employee on hr_private.artifacts(company_id,employee_id,employee_revision);
create table hr_private.files (
 id uuid primary key default gen_random_uuid(), company_id uuid not null, employee_id uuid not null,
 artifact_id uuid not null, employee_revision integer not null check(employee_revision>0),
 size_bytes integer not null check(size_bytes between 1 and 10485760),
 mime_type text not null check(mime_type in ('application/pdf','image/jpeg','image/png')),
 sha256 text not null check(sha256 ~ '^[0-9a-f]{64}$'),
 object_path text generated always as (company_id::text||'/'||employee_id::text||'/'||id::text) stored unique,
 foreign key(company_id,employee_id,artifact_id) references hr_private.artifacts(company_id,employee_id,id) on delete restrict
);
create index hr_files_artifact on hr_private.files(company_id,employee_id,artifact_id);
create table hr_private.purge_receipts (
 id uuid primary key, company_id uuid not null, employee_id uuid not null,user_id uuid not null,
 kind text not null check(kind in ('employment','content')), through_revision integer not null check(through_revision>0),
 requested_at timestamptz not null default now(), completed_at timestamptz,
 state text not null check(state in ('pending','complete'))
);
create index hr_purge_receipts_employee on hr_private.purge_receipts(company_id,employee_id,through_revision);
create table hr_private.purge_objects (
 id uuid primary key default gen_random_uuid(), receipt_id uuid not null references hr_private.purge_receipts(id) on delete restrict,
 object_path text not null unique check(object_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}$'),
 attempt uuid, attempts integer not null default 0, lease_until timestamptz,
 available_at timestamptz not null default now(), removed boolean not null default false
);
create index hr_purge_objects_receipt on hr_private.purge_objects(receipt_id);
create index hr_purge_objects_due on hr_private.purge_objects(available_at,id) where not removed;
create table hr_private.purge_worker_settings (
 singleton boolean primary key default true check(singleton),enabled boolean not null default false,
 endpoint text not null default '',secret_id uuid not null
);
insert into hr_private.purge_worker_settings(secret_id)
 values(vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'hr_purge_worker','Private HR deletion worker authentication'));
-- Receipts must survive deletion of an auth user or company.
alter table hr_private.closed_employments drop constraint closed_employments_company_id_fkey;

create function hr_private.require_content_ready() returns void
language plpgsql security definer set search_path='' as $$begin
 if not exists(select 1 from hr_private.runtime_state where singleton and content_enabled and not restore_quarantined)
 then raise exception 'HR-innhold er stengt inntil fil-, slette- og restore-kontrollen er godkjent.' using errcode='42501';end if;
end$$;
create function hr_private.guard_artifact_write() returns trigger
language plpgsql security definer set search_path='' as $$declare e hr_private.employees%rowtype;begin
 perform hr_private.require_content_ready();
 select * into e from hr_private.employees where company_id=new.company_id and id=new.employee_id for share;
 if e.id is null or not hr_private.active_member(e.company_id,e.user_id) or new.employee_revision<>e.revision
 or exists(select 1 from hr_private.purge_receipts p where p.company_id=e.company_id and p.employee_id=e.id and p.through_revision>=new.employee_revision)
 then raise exception 'HR-innhold kan ikke gjenopprettes eller skrives med gammel revisjon.' using errcode='42501';end if;
 if tg_op='UPDATE' and (new.id,new.company_id,new.employee_id,new.employee_revision) is distinct from (old.id,old.company_id,old.employee_id,old.employee_revision)
 then raise exception 'HR-innholdets identitet er uforanderlig.' using errcode='22023';end if;
 return new;
end$$;
create trigger hr_artifact_write_guard before insert or update on hr_private.artifacts for each row execute function hr_private.guard_artifact_write();
create function hr_private.guard_file_write() returns trigger
language plpgsql security definer set search_path='' as $$declare a hr_private.artifacts%rowtype;begin
 perform hr_private.require_content_ready();
 select * into a from hr_private.artifacts where company_id=new.company_id and employee_id=new.employee_id and id=new.artifact_id for share;
 if a.id is null or new.employee_revision<>a.employee_revision
 or exists(select 1 from hr_private.purge_receipts p where p.company_id=a.company_id and p.employee_id=a.employee_id and p.through_revision>=a.employee_revision)
 then raise exception 'Filens HR-tilknytning er ikke tilgjengelig.' using errcode='42501';end if;
 if tg_op='UPDATE' then raise exception 'HR-filer er uforanderlige; ny fil får ny ID.' using errcode='22023';end if;
 return new;
end$$;
create trigger hr_file_write_guard before insert or update on hr_private.files for each row execute function hr_private.guard_file_write();

create function hr_private.purge_resources(e hr_private.employees,receipt uuid,mode text,through_rev integer) returns void
language plpgsql security definer set search_path='' as $$begin
 insert into hr_private.purge_receipts(id,company_id,employee_id,user_id,kind,through_revision,state)
 values(receipt,e.company_id,e.id,e.user_id,mode,through_rev,'pending')
 on conflict(id) do update set state='pending',completed_at=null;
 insert into hr_private.purge_objects(receipt_id,object_path)
 select receipt,f.object_path from hr_private.files f where f.company_id=e.company_id and f.employee_id=e.id and f.employee_revision<=through_rev
 on conflict(object_path) do nothing;
 -- Closure also captures canonical objects without a remaining registry row.
 if mode='employment' then
  insert into hr_private.purge_objects(receipt_id,object_path)
  select receipt,o.name from storage.objects o where o.bucket_id='hr-private'
   and o.name like e.company_id::text||'/'||e.id::text||'/%'
   and o.name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}$'
  on conflict(object_path) do nothing;
 end if;
 delete from hr_private.files f where f.company_id=e.company_id and f.employee_id=e.id and f.employee_revision<=through_rev;
 delete from hr_private.artifacts a where a.company_id=e.company_id and a.employee_id=e.id and a.employee_revision<=through_rev;
 if not exists(select 1 from hr_private.purge_objects where receipt_id=receipt and not removed) then
  update hr_private.purge_receipts set state='complete',completed_at=now() where id=receipt;
 end if;
end$$;
create function hr_private.on_employee_delete() returns trigger
language plpgsql security definer set search_path='' as $$begin
 insert into hr_private.closed_employments(employee_id,company_id,user_id,previous_revision)
 values(old.id,old.company_id,old.user_id,old.revision) on conflict(employee_id) do nothing;
 perform hr_private.purge_resources(old,old.id,'employment',old.revision);
 return old;
end$$;
create trigger hr_employee_full_purge before delete on hr_private.employees for each row execute function hr_private.on_employee_delete();
create function hr_private.closure_json(c uuid,employee uuid,ctx jsonb) returns jsonb
language sql security definer set search_path='' as $$
 select jsonb_build_object('context',ctx,'access_blocked',true,'deleted',coalesce(p.state='complete',true),
 'purge_state',coalesce(p.state,'complete'),'receipt_id',d.employee_id,'deleted_at',d.deleted_at,'purge_completed_at',p.completed_at)
 from hr_private.closed_employments d left join hr_private.purge_receipts p on p.id=d.employee_id
 where d.company_id=c and d.employee_id=employee
$$;

create function public.hr_file_authorize(p_company_id uuid,p_file_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;e hr_private.employees%rowtype;f hr_private.files%rowtype;begin
 x:=hr_private.require_context(p_company_id);perform hr_private.require_content_ready();
 select * into f from hr_private.files where company_id=p_company_id and id=p_file_id;
 select * into e from hr_private.employees where company_id=p_company_id and id=f.employee_id;
 if f.id is null or e.id is null or not hr_private.can_read(p_company_id,e,auth.uid())
 or exists(select 1 from hr_private.purge_receipts p where p.company_id=e.company_id and p.employee_id=e.id and p.through_revision>=f.employee_revision)
 then raise exception 'HR-filen er ikke tilgjengelig.' using errcode='42501';end if;
 return jsonb_build_object('context',x,'file',to_jsonb(f),'employee_revision',e.revision);
end$$;
create function public.hr_content_purge(p_company_id uuid,p_employee_id uuid,p_revision integer,p_confirm text) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;e hr_private.employees%rowtype;r uuid:=gen_random_uuid();begin
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 x:=hr_private.require_context(p_company_id,true);
 select * into e from hr_private.employees where company_id=p_company_id and id=p_employee_id for update;
 if e.id is null then raise exception 'HR-medarbeideren er ikke tilgjengelig.' using errcode='42501';end if;
 if e.revision is distinct from p_revision then raise exception 'HR-registeret er endret.' using errcode='40001';end if;
 if p_confirm is distinct from 'PURGE_CONTENT' then raise exception 'Bekreft innholdssletting uttrykkelig.' using errcode='22023';end if;
 perform hr_private.purge_resources(e,r,'content',e.revision);
 update hr_private.employees set revision=revision+1 where id=e.id;
 return jsonb_build_object('context',x,'receipt_id',r,'access_blocked',true,'purge_state',(select state from hr_private.purge_receipts where id=r));
end$$;
create function public.hr_purge_status(p_company_id uuid,p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;rows jsonb;begin
 x:=hr_private.require_actor(p_company_id,true);
 select coalesce(jsonb_agg(to_jsonb(q) order by q.id),'[]') into rows from
 (select id,kind,state,requested_at,completed_at from hr_private.purge_receipts where company_id=p_company_id and (p_after is null or id>p_after) order by id limit 100) q;
 return jsonb_build_object('context',x,'receipts',rows,'next',case when jsonb_array_length(rows)=100 then rows->99->>'id' else null end);
end$$;

-- Service-only bounded worker endpoints. Clients cannot reserve/acknowledge bytes.
create function public.hr_purge_worker_authorize(p_token text) returns boolean
language sql security definer set search_path='' as $$
 select exists(select 1 from hr_private.purge_worker_settings cfg join vault.decrypted_secrets s on s.id=cfg.secret_id
 where cfg.singleton and cfg.enabled and length(coalesce(p_token,''))=64 and s.decrypted_secret=p_token)
$$;
create function public.hr_purge_worker_reserve() returns jsonb
language plpgsql security definer set search_path='' as $$declare q hr_private.purge_objects%rowtype;begin
 if not exists(select 1 from hr_private.purge_worker_settings where singleton and enabled) then return null;end if;
 select * into q from hr_private.purge_objects where not removed and available_at<=now() and (lease_until is null or lease_until<now())
 order by available_at,id for update skip locked limit 1;
 if q.id is null then return null;end if;
 update hr_private.purge_objects set attempt=gen_random_uuid(),attempts=attempts+1,lease_until=now()+interval '90 seconds' where id=q.id returning * into q;
 return jsonb_build_object('id',q.id,'attempt',q.attempt,'object_path',q.object_path);
end$$;
create function public.hr_purge_worker_finish(p_id uuid,p_attempt uuid,p_removed boolean) returns boolean
language plpgsql security definer set search_path='' as $$declare q hr_private.purge_objects%rowtype;begin
 select * into q from hr_private.purge_objects where id=p_id for update;
 if q.id is null or q.attempt is distinct from p_attempt or q.lease_until<now() or q.removed then return false;end if;
 if p_removed is true and not exists(select 1 from storage.objects where bucket_id='hr-private' and name=q.object_path) then
  update hr_private.purge_objects set removed=true,lease_until=null where id=q.id;
 else
  update hr_private.purge_objects set lease_until=null,attempt=null,available_at=now()+make_interval(secs=>least(3600,30*greatest(1,q.attempts))) where id=q.id;
  return false;
 end if;
 if not exists(select 1 from hr_private.purge_objects where receipt_id=q.receipt_id and not removed) then
  update hr_private.purge_receipts set state='complete',completed_at=now() where id=q.receipt_id;
  delete from hr_private.purge_objects where receipt_id=q.receipt_id;
 end if;
 return true;
end$$;
create function hr_private.invoke_purge_worker() returns void
language plpgsql security definer set search_path='' as $$declare cfg hr_private.purge_worker_settings%rowtype;token text;begin
 select * into cfg from hr_private.purge_worker_settings where singleton;
 if not cfg.enabled or cfg.endpoint !~ '^https://[a-z]{20}\.supabase\.co/functions/v1/hr-file-access$'
 or not exists(select 1 from hr_private.purge_objects where not removed and available_at<=now() and (lease_until is null or lease_until<now())) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-hr-purge-token',token),body:='{}',timeout_milliseconds:=50000);
end$$;
select cron.schedule('hr-private-purge','* * * * *','select hr_private.invoke_purge_worker();');

-- Operator-only restore contract: replay a verified off-backup manifest while
-- quarantined. This cannot enable content; opening remains a separate release gate.
create function hr_private.restore_manifest(p_after uuid default null) returns jsonb
language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(q) order by q.id),'[]') from
 (select id,company_id,employee_id,user_id,kind,through_revision,requested_at from hr_private.purge_receipts where p_after is null or id>p_after order by id limit 100) q
$$;
create function hr_private.restore_reconcile(p_receipts jsonb) returns integer
language plpgsql security definer set search_path='' as $$declare v jsonb;e hr_private.employees%rowtype;old_receipt hr_private.purge_receipts%rowtype;n integer:=0;begin
 update hr_private.runtime_state set content_enabled=false,restore_quarantined=true where singleton;
 if jsonb_typeof(p_receipts) is distinct from 'array' or jsonb_array_length(p_receipts)>100 then raise exception 'Ugyldig restore-manifest.' using errcode='22023';end if;
 for v in select value from jsonb_array_elements(p_receipts) loop
  if jsonb_typeof(v) is distinct from 'object' or v->>'kind' is null or (v->>'kind') not in ('employment','content') or not (v ?& array['id','company_id','employee_id','user_id','kind','through_revision','requested_at'])
  then raise exception 'Ufullstendig restore-kvittering.' using errcode='22023';end if;
  if v->>'kind'='employment' and v->>'id' is distinct from v->>'employee_id' then raise exception 'Ugyldig avslutningskvittering.' using errcode='22023';end if;
  select * into old_receipt from hr_private.purge_receipts where id=(v->>'id')::uuid;
  if old_receipt.id is not null and (old_receipt.company_id,old_receipt.employee_id,old_receipt.user_id,old_receipt.kind,old_receipt.through_revision)
   is distinct from ((v->>'company_id')::uuid,(v->>'employee_id')::uuid,(v->>'user_id')::uuid,v->>'kind',(v->>'through_revision')::integer)
  then raise exception 'Restore-kvitteringen er endret.' using errcode='22023';end if;
  insert into hr_private.purge_receipts(id,company_id,employee_id,user_id,kind,through_revision,requested_at,state)
  values((v->>'id')::uuid,(v->>'company_id')::uuid,(v->>'employee_id')::uuid,(v->>'user_id')::uuid,v->>'kind',(v->>'through_revision')::integer,(v->>'requested_at')::timestamptz,'pending')
  on conflict(id) do update set state='pending',completed_at=null;
  select * into e from hr_private.employees where company_id=(v->>'company_id')::uuid and id=(v->>'employee_id')::uuid for update;
  if e.id is not null then
   if e.user_id is distinct from (v->>'user_id')::uuid then raise exception 'Restore-identitet stemmer ikke.' using errcode='22023';end if;
   perform hr_private.purge_resources(e,(v->>'id')::uuid,v->>'kind',(v->>'through_revision')::integer);
   if v->>'kind'='employment' then delete from hr_private.employees where id=e.id;
   else update hr_private.employees set revision=greatest(revision,(v->>'through_revision')::integer+1) where id=e.id;end if;
  end if;
  if v->>'kind'='employment' then
   insert into hr_private.closed_employments(employee_id,company_id,user_id,previous_revision,deleted_at)
   values((v->>'employee_id')::uuid,(v->>'company_id')::uuid,(v->>'user_id')::uuid,(v->>'through_revision')::integer,(v->>'requested_at')::timestamptz)
   on conflict(employee_id) do nothing;
  end if;
  n:=n+1;
 end loop;
 return n;
end$$;

alter table hr_private.runtime_state enable row level security;
alter table hr_private.artifacts enable row level security;
alter table hr_private.files enable row level security;
alter table hr_private.purge_receipts enable row level security;
alter table hr_private.purge_objects enable row level security;
alter table hr_private.purge_worker_settings enable row level security;
revoke all on all tables in schema hr_private from public,anon,authenticated,service_role;
revoke all on all functions in schema hr_private from public,anon,authenticated,service_role;
revoke all on function public.hr_file_authorize(uuid,uuid),public.hr_content_purge(uuid,uuid,integer,text),public.hr_purge_status(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.hr_file_authorize(uuid,uuid),public.hr_content_purge(uuid,uuid,integer,text),public.hr_purge_status(uuid,uuid) to authenticated;
revoke all on function public.hr_purge_worker_authorize(text),public.hr_purge_worker_reserve(),public.hr_purge_worker_finish(uuid,uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function public.hr_purge_worker_authorize(text),public.hr_purge_worker_reserve(),public.hr_purge_worker_finish(uuid,uuid,boolean) to service_role;

-- Preserve H1 actions/ACL; closure acknowledges complete physical purge only.
-- Disambiguate local employee ID from table column in live command. ACL unchanged.
create or replace function public.hr_employee_command(p_company_id uuid,p_action text,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; e hr_private.employees%rowtype; d hr_private.closed_employments%rowtype;
 employee_target uuid; u uuid; leader uuid; rev integer; reader uuid; keys text[];
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
  employee_target:=(p_payload->>'id')::uuid; rev:=(p_payload->>'revision')::integer;
  select * into e from hr_private.employees where company_id=p_company_id and employees.id=employee_target for update;
  if e.id is null then
   -- Idempotent acknowledgement after a lost closure response, no resurrection.
   select * into d from hr_private.closed_employments where company_id=p_company_id and employee_id=employee_target;
   if p_action='end' and d.employee_id is not null and rev=d.previous_revision and p_payload->>'confirm'='END_AND_DELETE' then
    return hr_private.closure_json(p_company_id,d.employee_id,x);
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
   return hr_private.closure_json(p_company_id,d.employee_id,x);
  end if;
 end if;
 return jsonb_build_object('context',x,'employee',hr_private.employee_json(e),'content_enabled',false);
end $$;


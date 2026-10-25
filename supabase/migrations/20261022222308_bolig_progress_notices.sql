-- Actual execution is separate from goods receipts and handover. All publication
-- is bound to the reviewed task/contact. Email transport defaults to paused.
create table bolig_private.progress_states(root_id uuid primary key references bolig_private.roots(id),revision bigint not null default 0);
create table bolig_private.progress_tasks(
 id uuid primary key,root_id uuid not null references bolig_private.roots(id),unit_id uuid not null,
 room_id uuid references bolig_private.rooms(id),title text not null check(length(trim(title)) between 2 and 120),
 owner_id uuid not null references auth.users(id),planned_start date not null,planned_end date not null,
 actual_start date,actual_end date,status text not null check(status in('planned','working','blocked','done')),
 predecessor_id uuid references bolig_private.progress_tasks(id),required boolean not null default true,
 note text not null default '' check(length(note)<=2000),archived boolean not null default false,
 revision bigint not null default 1,changed_at timestamptz not null default now(),
 foreign key(unit_id,root_id) references bolig_private.units(id,root_id),
 check(planned_end>=planned_start),check(actual_end is null or actual_end>=actual_start),
 check((status='done' and actual_start is not null and actual_end is not null) or (status<>'done' and actual_end is null)),
 check(status<>'working' or actual_start is not null));
create index bolig_progress_root_unit on bolig_private.progress_tasks(root_id,unit_id,planned_start,id);
create index bolig_progress_room on bolig_private.progress_tasks(room_id);
create index bolig_progress_owner on bolig_private.progress_tasks(owner_id);
create index bolig_progress_predecessor on bolig_private.progress_tasks(predecessor_id);
create table bolig_private.progress_notices(
 id uuid primary key,root_id uuid not null references bolig_private.roots(id),task_id uuid not null references bolig_private.progress_tasks(id),
 body text not null check(length(trim(body)) between 3 and 2000),publish_on date not null,
 basis text not null,approved_basis text,approved_by uuid references auth.users(id),approved_at timestamptz,
 published_at timestamptz,withdrawn boolean not null default false,created_at timestamptz not null default now());
create index bolig_progress_notice_root on bolig_private.progress_notices(root_id,task_id);
create index bolig_progress_notice_actor on bolig_private.progress_notices(approved_by);
create table bolig_private.progress_history(
 root_id uuid not null references bolig_private.roots(id),revision bigint not null,actor_id uuid not null references auth.users(id),
 action text not null,snapshot jsonb not null,created_at timestamptz not null default now(),primary key(root_id,revision));
create index bolig_progress_history_actor on bolig_private.progress_history(actor_id);
create table bolig_private.progress_receipts(root_id uuid not null references bolig_private.roots(id),actor_id uuid not null references auth.users(id),request_id uuid not null,fingerprint text not null,result jsonb not null,primary key(root_id,actor_id,request_id));
create index bolig_progress_receipt_actor on bolig_private.progress_receipts(actor_id);
create table bolig_private.progress_mail_settings(singleton boolean primary key default true check(singleton),enabled boolean not null default false,endpoint text not null default '',secret_id uuid not null);
create table bolig_private.progress_deliveries(
 id uuid primary key default gen_random_uuid(),root_id uuid not null references bolig_private.roots(id),task_id uuid not null references bolig_private.progress_tasks(id),
 notice_id uuid references bolig_private.progress_notices(id),kind text not null check(kind in('resident','owner')),
 generation text not null,slot text not null,recipient text not null,status text not null default 'pending' check(status in('pending','sending','accepted','suppressed','failed')),
 attempt uuid,attempts int not null default 0,reserved_at timestamptz,first_attempt_at timestamptz,accepted_at timestamptz,
 available_at timestamptz not null default now(),unique(task_id,kind,generation,slot));
create index bolig_progress_mail_pending on bolig_private.progress_deliveries(available_at,id) where status in('pending','sending');
create index bolig_progress_mail_root on bolig_private.progress_deliveries(root_id);
create index bolig_progress_mail_notice on bolig_private.progress_deliveries(notice_id);
-- Vault is private; the token is never projected or committed.
insert into bolig_private.progress_mail_settings(secret_id) values(vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'bolig_progress_worker','Private bolig progress notifications'));
DO $$declare t text;begin foreach t in array array['progress_states','progress_tasks','progress_notices','progress_history','progress_receipts','progress_mail_settings','progress_deliveries'] loop execute format('alter table bolig_private.%I enable row level security',t);execute format('revoke all on bolig_private.%I from public,anon,authenticated,service_role',t);end loop;end$$;

create function bolig_private.progress_member(c uuid,u uuid) returns boolean language sql stable set search_path='' as $$
 select exists(select 1 from public.profiles p join public.sales_company_memberships m on m.user_id=p.id
 join bolig_private.firms f on f.company_id=m.company_id and f.enabled
 left join bolig_private.member_access a on a.company_id=c and a.user_id=u
 where p.id=u and m.company_id=c and p.approved and not coalesce(p.deactivated,false)
 and p.role in('admin','member','ansatt','firmaadmin') and (m.workspace_role='firmaadmin' or (m.workspace_role='ansatt' and a.access_role in('manager','reader'))))
$$;
create function bolig_private.progress_active(t bolig_private.progress_tasks) returns boolean language sql stable set search_path='' as $$
 select not t.archived and exists(select 1 from bolig_private.roots r join bolig_private.units u on u.root_id=r.id
 join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id join bolig_private.firms f on f.company_id=r.company_id
 where r.id=t.root_id and u.id=t.unit_id and f.enabled and not r.archived and not u.archived and not e.archived and not b.archived)
 and (t.room_id is null or exists(select 1 from bolig_private.rooms where id=t.room_id and unit_id=t.unit_id and not archived))
$$;
create function bolig_private.progress_notice_basis(t bolig_private.progress_tasks,n bolig_private.progress_notices) returns text language sql stable set search_path='' as $$
 select md5(jsonb_build_array(t.id,t.title,t.room_id,t.planned_start,t.planned_end,t.archived,n.body,n.publish_on,
 (select jsonb_build_array(u.contact_name,u.contact_email,r.name) from bolig_private.units u left join bolig_private.rooms r on r.id=t.room_id where u.id=t.unit_id))::text)
$$;
create function bolig_private.progress_notice_valid(n bolig_private.progress_notices) returns boolean language sql stable set search_path='' as $$
 select not n.withdrawn and n.approved_basis=n.basis and n.approved_by is not null and exists(select 1 from bolig_private.progress_tasks t
 join bolig_private.roots r on r.id=t.root_id where t.id=n.task_id and bolig_private.progress_active(t)
 and bolig_private.progress_member(r.company_id,n.approved_by) and exists(select 1 from public.sales_company_memberships m left join bolig_private.member_access a on a.company_id=m.company_id and a.user_id=m.user_id where m.company_id=r.company_id and m.user_id=n.approved_by and (m.workspace_role='firmaadmin' or a.access_role='manager')) and n.basis=bolig_private.progress_notice_basis(t,n))
$$;

create function bolig_private.progress_workspace(c uuid,root uuid,unit uuid,action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare requested_unit uuid:=unit;ctx jsonb;r bolig_private.roots%rowtype;t bolig_private.progress_tasks%rowtype;n bolig_private.progress_notices%rowtype;
 rev bigint;rid uuid;fp text;receipt bolig_private.progress_receipts%rowtype;result jsonb;v_id uuid;v_room uuid;v_owner uuid;v_pred uuid;ps date;pe date;ast date;aend date;st text;title text;rows jsonb;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or coalesce((ctx->>'enabled')::boolean,false) is not true then raise exception 'Boligtilgang kreves.' using errcode='42501';end if;
 if action is null or action not in('get','save','archive','notice','approve','publish','withdraw') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>12000 then raise exception 'Ugyldig fremdriftshandling.' using errcode='22023';end if;
 select * into r from bolig_private.roots where id=root and company_id=c for update;
 if not found or (unit is not null and not exists(select 1 from bolig_private.units where id=unit and root_id=root)) then raise exception 'Boligprosjektet er ikke tilgjengelig.' using errcode='42501';end if;
 select coalesce((select revision from bolig_private.progress_states where root_id=root),0) into rev;
 if action<>'get' then
  if ctx->>'role' is distinct from 'manager' or r.archived then raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
  rid:=(payload->>'request_id')::uuid;fp:=md5(jsonb_build_array(action,payload)::text);
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  select * into receipt from bolig_private.progress_receipts where root_id=root and actor_id=auth.uid() and request_id=rid;
  if found then if receipt.fingerprint<>fp then raise exception 'Forsøket har annet innhold.' using errcode='PT409';end if;return receipt.result;end if;
  if (payload->>'revision')::bigint is distinct from rev then raise exception 'Fremdriften er endret. Kladden er beholdt. Hent siste status og se over før lagring.' using errcode='PT409';end if;
  v_id:=(payload->>'id')::uuid;
  if v_id is null then raise exception 'Velg aktivitet eller varsel.' using errcode='22023';end if;
  if action in('save','archive') then
   select * into t from bolig_private.progress_tasks where id=v_id;
   if t.id is not null and (t.root_id<>root or (unit is not null and t.unit_id<>unit)) then raise exception 'Aktiviteten er ikke tilgjengelig.' using errcode='42501';end if;
   if action='archive' then
    if t.id is null or payload->'confirmed' is distinct from 'true'::jsonb or length(trim(coalesce(payload->>'reason','')))<3 then raise exception 'Bekreft arkivering med begrunnelse.' using errcode='22023';end if;
    if exists(select 1 from bolig_private.progress_tasks where predecessor_id=t.id and not archived) then raise exception 'Fjern avhengige koblinger før arkivering.' using errcode='22023';end if;
    update bolig_private.progress_tasks set archived=true,revision=revision+1,changed_at=now(),note=t.note||E'\nArkivert: '||(payload->>'reason') where id=v_id returning * into t;
   else
    if t.archived then raise exception 'Arkivert aktivitet kan ikke endres.' using errcode='22023';end if;
    unit:=coalesce(unit,(payload->>'unit_id')::uuid);v_room:=nullif(payload->>'room_id','')::uuid;v_owner:=(payload->>'owner_id')::uuid;v_pred:=nullif(payload->>'predecessor_id','')::uuid;
    title:=trim(payload->>'title');ps:=(payload->>'planned_start')::date;pe:=(payload->>'planned_end')::date;
    ast:=nullif(payload->>'actual_start','')::date;aend:=nullif(payload->>'actual_end','')::date;st:=payload->>'status';
    if not exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=unit and u.root_id=root and not u.archived and not e.archived and not b.archived)
    or (v_room is not null and not exists(select 1 from bolig_private.rooms where id=v_room and unit_id=unit and not archived)) then raise exception 'Velg en aktiv bolig og et rom i boligen.' using errcode='42501';end if;
    if t.id is not null and t.unit_id<>unit then raise exception 'En aktivitet kan ikke flyttes mellom boliger.' using errcode='42501';end if;
    if not bolig_private.progress_member(c,v_owner) then raise exception 'Velg en aktiv ansvarlig med boligtilgang i firmaet.' using errcode='42501';end if;
    if ps is null or pe is null or pe<ps or pe>ps+730 or length(coalesce(title,'')) not between 2 and 120 or st is null or st not in('planned','working','blocked','done') or length(coalesce(payload->>'note',''))>2000
    or jsonb_typeof(payload->'required') is distinct from 'boolean' or (st='working' and ast is null) or (st='done' and (ast is null or aend is null)) or (st<>'done' and aend is not null) or (aend is not null and aend<ast)
    or ast>(now() at time zone 'Europe/Oslo')::date or aend>(now() at time zone 'Europe/Oslo')::date then raise exception 'Kontroller datoer, status og bekreftet utførelse. Faktiske datoer kan ikke ligge frem i tid.' using errcode='22023';end if;
    if v_pred=v_id or (v_pred is not null and not exists(select 1 from bolig_private.progress_tasks where id=v_pred and root_id=root and unit_id=unit and not archived)) then raise exception 'Velg en annen aktiv forgjenger i samme bolig.' using errcode='22023';end if;
    if exists(with recursive chain as(select id,predecessor_id from bolig_private.progress_tasks where id=v_pred union select p.id,p.predecessor_id from bolig_private.progress_tasks p join chain x on p.id=x.predecessor_id)select 1 from chain where id=v_id) then raise exception 'Avhengigheten danner en sirkel.' using errcode='22023';end if;
    if v_pred is not null and exists(select 1 from bolig_private.progress_tasks p where p.id=v_pred and (p.planned_end>ps or (st in('working','done') and (p.status<>'done' or p.actual_end>ast)))) then raise exception 'Forgjengeren må planlegges ferdig før start og være utført før arbeidet registreres.' using errcode='22023';end if;
    if exists(select 1 from bolig_private.progress_tasks d where d.predecessor_id=v_id and not d.archived and (d.planned_start<pe or (d.status in('working','done') and (st<>'done' or d.actual_start<aend)))) then raise exception 'Endringen bryter en avhengig aktivitet. Avklar den først.' using errcode='22023';end if;
    if t.status='done' and st<>'done' and length(trim(coalesce(payload->>'note','')))<3 then raise exception 'Skriv hvorfor arbeidet gjenåpnes.' using errcode='22023';end if;
    if t.id is null and (select count(*) from bolig_private.progress_tasks where root_id=root and not archived)>=4000 then raise exception 'Maksimalt 4000 aktive aktiviteter per prosjekt.' using errcode='22023';end if;
    insert into bolig_private.progress_tasks(id,root_id,unit_id,room_id,title,owner_id,planned_start,planned_end,actual_start,actual_end,status,predecessor_id,required,note)
    values(v_id,root,unit,v_room,title,v_owner,ps,pe,ast,aend,st,v_pred,(payload->>'required')::boolean,coalesce(payload->>'note',''))
    on conflict(id) do update set room_id=excluded.room_id,title=excluded.title,owner_id=excluded.owner_id,planned_start=excluded.planned_start,planned_end=excluded.planned_end,actual_start=excluded.actual_start,actual_end=excluded.actual_end,status=excluded.status,predecessor_id=excluded.predecessor_id,required=excluded.required,note=excluded.note,revision=progress_tasks.revision+1,changed_at=now() returning * into t;
   end if;
  elsif action='notice' then
   select * into t from bolig_private.progress_tasks where id=(payload->>'task_id')::uuid and root_id=root and (unit is null or unit_id=unit);
   if t.id is null or not bolig_private.progress_active(t) then raise exception 'Velg en aktiv aktivitet.' using errcode='42501';end if;
   if exists(select 1 from bolig_private.progress_notices where id=v_id) then raise exception 'Lag en ny varselutgave. Tidligere innhold bevares.' using errcode='PT409';end if;
   if jsonb_typeof(payload->'body') is distinct from 'string' or length(trim(payload->>'body')) not between 3 and 2000 or nullif(payload->>'publish_on','') is null then raise exception 'Skriv varsel og velg publiseringsdato.' using errcode='22023';end if;
   n.id:=v_id;n.root_id:=root;n.task_id:=t.id;n.body:=trim(payload->>'body');n.publish_on:=(payload->>'publish_on')::date;
   insert into bolig_private.progress_notices(id,root_id,task_id,body,publish_on,basis) values(n.id,root,t.id,n.body,n.publish_on,bolig_private.progress_notice_basis(t,n)) returning * into n;
  else
   select * into n from bolig_private.progress_notices where id=v_id and root_id=root for update;
   select * into t from bolig_private.progress_tasks where id=n.task_id and (unit is null or unit_id=unit);
   if n.id is null or t.id is null then raise exception 'Varselet er ikke tilgjengelig.' using errcode='42501';end if;
   if action='withdraw' then update bolig_private.progress_notices set withdrawn=true where id=v_id returning * into n;
   elsif action='approve' then
    if payload->'reviewed' is distinct from 'true'::jsonb or n.withdrawn or not bolig_private.progress_active(t) or payload->>'basis' is distinct from n.basis or n.basis<>bolig_private.progress_notice_basis(t,n) then raise exception 'Grunnlaget er endret. Lag ny varselutgave og gjennomgå innholdet.' using errcode='PT409';end if;
    if not exists(select 1 from bolig_private.units where id=t.unit_id and length(trim(contact_name))>=2 and contact_email<>'') then raise exception 'Lagre beboerens navn og e-post først.' using errcode='22023';end if;
    update bolig_private.progress_notices set approved_basis=basis,approved_by=auth.uid(),approved_at=now() where id=v_id returning * into n;
   elsif action='publish' then
    if payload->'reviewed' is distinct from 'true'::jsonb or not bolig_private.progress_notice_valid(n) or n.publish_on>(now() at time zone 'Europe/Oslo')::date then raise exception 'Godkjenn gjeldende varsel og kontroller publiseringsdato.' using errcode='PT409';end if;
    update bolig_private.progress_notices set published_at=coalesce(published_at,now()) where id=v_id returning * into n;
   end if;
  end if;
  insert into bolig_private.progress_states values(root,rev+1) on conflict(root_id) do update set revision=excluded.revision;rev:=rev+1;
  insert into bolig_private.progress_history(root_id,revision,actor_id,action,snapshot) values(root,rev,auth.uid(),action,jsonb_build_object('task',to_jsonb(t),'notice',to_jsonb(n),'reason',payload->'reason'));
 end if;
 unit:=requested_unit;
 select coalesce(jsonb_agg(to_jsonb(x)||jsonb_build_object('active',bolig_private.progress_active(x),'owner_active',bolig_private.progress_member(c,x.owner_id),'owner_name',(select coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email) from public.profiles p where p.id=x.owner_id),'room_name',(select name from bolig_private.rooms where id=x.room_id),'unit_number',(select number from bolig_private.units where id=x.unit_id),'address',(select e.address from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id where u.id=x.unit_id)) order by x.planned_start,x.id),'[]') into rows from bolig_private.progress_tasks x where x.root_id=root and (unit is null or x.unit_id=unit);
 result:=jsonb_build_object('context',ctx,'root_id',root,'unit_id',unit,'revision',rev,'tasks',rows,
 'units',(select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'number',u.number,'address',e.address) order by e.address,u.number),'[]') from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.root_id=root and not u.archived and not e.archived and not b.archived),
 'rooms',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'unit_id',unit_id,'name',name) order by name),'[]') from bolig_private.rooms where root_id=root and not archived and (unit is null or unit_id=unit)),
 'members',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email)) order by p.email),'[]') from public.profiles p where bolig_private.progress_member(c,p.id)),
 'notices',(select coalesce(jsonb_agg(to_jsonb(x)||jsonb_build_object('current',x.basis=bolig_private.progress_notice_basis(t,x),'valid',bolig_private.progress_notice_valid(x),'recipient',(select contact_email from bolig_private.units where id=t.unit_id),'title',t.title,'planned_start',t.planned_start,'planned_end',t.planned_end,'unit_number',(select number from bolig_private.units where id=t.unit_id)) order by x.created_at desc),'[]') from bolig_private.progress_notices x join bolig_private.progress_tasks t on t.id=x.task_id where x.root_id=root and (unit is null or t.unit_id=unit)),
 'deliveries',(select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'task_id',d.task_id,'notice_id',d.notice_id,'kind',d.kind,'status',d.status,'accepted_at',d.accepted_at)),'[]') from bolig_private.progress_deliveries d join bolig_private.progress_tasks t on t.id=d.task_id where d.root_id=root and (unit is null or t.unit_id=unit)),
 'history',(select coalesce(jsonb_agg(to_jsonb(h) order by h.revision desc),'[]') from(select revision,action,created_at,snapshot from bolig_private.progress_history where root_id=root and (unit is null or snapshot->'task'->>'unit_id'=unit::text) order by revision desc limit 30) h),
 'mail_enabled',coalesce((select enabled from bolig_private.progress_mail_settings where singleton),false));
 if action<>'get' then insert into bolig_private.progress_receipts values(root,auth.uid(),rid,fp,result);end if;return result;
end$$;
create function public.bolig_progress(p_company_id uuid,p_root_id uuid,p_unit_id uuid default null,p_action text default 'get',p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.progress_workspace(p_company_id,p_root_id,p_unit_id,p_action,p_payload)$$;

-- Preserve all prior completion controls, adding actual required work and its basis.
alter function bolig_private.completion_source(uuid,uuid,uuid) rename to completion_source_before_progress;
create function bolig_private.completion_source(c uuid,root uuid,unit uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare src jsonb;issues jsonb;basis jsonb;
begin
 src:=bolig_private.completion_source_before_progress(c,root,unit);
 select coalesce(jsonb_agg(jsonb_build_array(id,revision,status,archived) order by id),'[]') into basis from bolig_private.progress_tasks where root_id=root and unit_id=unit;
 select coalesce(jsonb_agg('Fremdrift: '||title||case when status<>'done' then ' er ikke utført.' else ' må avklares etter endret rom eller ansvarlig.' end),'[]') into issues from bolig_private.progress_tasks t where t.root_id=root and t.unit_id=unit and not t.archived and t.required and (t.status<>'done' or not bolig_private.progress_active(t) or not bolig_private.progress_member(c,t.owner_id));
 return src||jsonb_build_object('basis',md5(jsonb_build_array(src->>'basis',basis)::text),'issues',(src->'issues')||issues);
end$$;
-- Extend the allowlisted public portal projection; no internal notes/owners are shared.
DO $$declare body text;begin body:=pg_get_functiondef('bolig_private.portal_state(bolig_private.resident_portals)'::regprocedure);
 if position($needle$'offers',$needle$ in body)=0 then raise exception 'Unexpected portal projection';end if;
 body:=replace(body,$needle$'offers',$needle$,$new$'progress_notices',(select coalesce(jsonb_agg(jsonb_build_object('id',n.id,'body',n.body,'title',t.title,'start',t.planned_start,'end',t.planned_end,'published_at',n.published_at) order by n.published_at desc),'[]') from bolig_private.progress_notices n join bolig_private.progress_tasks t on t.id=n.task_id where t.unit_id=p.unit_id and n.published_at is not null and bolig_private.progress_notice_valid(n) and p.contact_basis=(select md5(jsonb_build_array(contact_name,contact_email)::text) from bolig_private.units where id=p.unit_id)), 'offers',$new$);execute body;end$$;

-- Revoke every private helper; only the checked gateway is available to users.
DO $$declare f record;begin for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='bolig_private' and (p.proname like 'progress_%' or p.proname='completion_source_before_progress') loop execute 'revoke all on function '||f.signature||' from public,anon,authenticated,service_role';end loop;end$$;
revoke all on function bolig_private.completion_source(uuid,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function bolig_private.progress_workspace(uuid,uuid,uuid,text,jsonb) to authenticated;
revoke all on function public.bolig_progress(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_progress(uuid,uuid,uuid,text,jsonb) to authenticated;
notify pgrst,'reload schema';

alter table bolig_private.progress_mail_settings add column enabled_since timestamptz;
create function bolig_private.progress_tick() returns void language plpgsql security definer set search_path='' as $$
declare today date:=(now() at time zone 'Europe/Oslo')::date;since timestamptz;
begin
 select enabled_since into since from bolig_private.progress_mail_settings where singleton and enabled;
 if since is null then return;end if;
 -- Future notices were explicitly approved; any changed basis suppresses publication.
 update bolig_private.progress_notices n set published_at=now() where published_at is null and publish_on<=today and approved_at>=since and bolig_private.progress_notice_valid(n);
 insert into bolig_private.progress_deliveries(root_id,task_id,notice_id,kind,generation,slot,recipient)
 select t.root_id,t.id,n.id,'resident',n.id::text,'published',u.contact_email from bolig_private.progress_notices n join bolig_private.progress_tasks t on t.id=n.task_id join bolig_private.units u on u.id=t.unit_id
 where n.published_at>=since and bolig_private.progress_notice_valid(n) on conflict do nothing;
 insert into bolig_private.progress_deliveries(root_id,task_id,kind,generation,slot,recipient)
 select t.root_id,t.id,'owner',t.revision::text,
 case when today>t.planned_end then 'overdue:'||((today-t.planned_end-1)/7)::text when today=t.planned_end then 'due' when today>=t.planned_end-2 then 'approaching' else 'assigned' end,p.email
 from bolig_private.progress_tasks t join bolig_private.roots r on r.id=t.root_id join public.profiles p on p.id=t.owner_id
 where t.status<>'done' and t.changed_at>=since and bolig_private.progress_active(t) and bolig_private.progress_member(r.company_id,t.owner_id)
 and p.email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 and not exists(select 1 from bolig_private.progress_deliveries d where d.task_id=t.id and d.kind='owner' and (d.status in('pending','sending') or d.accepted_at>now()-interval '1 day')) on conflict do nothing;
end$$;
create function bolig_private.progress_delivery_valid(d bolig_private.progress_deliveries) returns boolean language sql stable set search_path='' as $$
 select exists(select 1 from bolig_private.progress_tasks t join bolig_private.roots r on r.id=t.root_id
 join bolig_private.progress_mail_settings cfg on cfg.singleton and cfg.enabled and cfg.enabled_since is not null
 where t.id=d.task_id and bolig_private.progress_active(t) and
 case when d.kind='resident' then exists(select 1 from bolig_private.progress_notices n join bolig_private.units u on u.id=t.unit_id where n.id=d.notice_id and n.published_at>=cfg.enabled_since and bolig_private.progress_notice_valid(n) and d.recipient=u.contact_email)
 else t.status<>'done' and d.generation=t.revision::text and bolig_private.progress_member(r.company_id,t.owner_id)
 and d.recipient=(select email from public.profiles where id=t.owner_id)
 and d.slot=case when (now() at time zone 'Europe/Oslo')::date>t.planned_end then 'overdue:'||(((now() at time zone 'Europe/Oslo')::date-t.planned_end-1)/7)::text when (now() at time zone 'Europe/Oslo')::date=t.planned_end then 'due' when (now() at time zone 'Europe/Oslo')::date>=t.planned_end-2 then 'approaching' else 'assigned' end end)
$$;
create function public.bolig_progress_worker_authorize(p_token text) returns boolean language plpgsql security definer set search_path='' as $$declare secret text;begin
 if coalesce(p_token,'') !~ '^[a-f0-9]{64}$' then return false;end if;
 select decrypted_secret into secret from vault.decrypted_secrets v join bolig_private.progress_mail_settings cfg on cfg.secret_id=v.id where cfg.singleton and cfg.enabled and cfg.enabled_since is not null;
 return secret is not null and p_token=secret;end$$;
create function public.bolig_progress_worker_reserve() returns jsonb language plpgsql security definer set search_path='' as $$declare d bolig_private.progress_deliveries%rowtype;result jsonb;begin
 if not exists(select 1 from bolig_private.progress_mail_settings where singleton and enabled and enabled_since is not null) then return null;end if;
 perform bolig_private.progress_tick();
 select * into d from bolig_private.progress_deliveries where (status='pending' and available_at<=now()) or (status='sending' and reserved_at<now()-interval '5 minutes') order by available_at,id for update skip locked limit 1;
 if not found then return null;end if;
 if not bolig_private.progress_delivery_valid(d) or d.recipient !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(d.recipient)>254 or d.attempts>=8 or d.first_attempt_at<now()-interval '23 hours' then update bolig_private.progress_deliveries set status='suppressed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 update bolig_private.progress_deliveries set status='sending',attempt=gen_random_uuid(),attempts=attempts+1,reserved_at=now(),first_attempt_at=coalesce(first_attempt_at,now()) where id=d.id returning * into d;
 result:=jsonb_build_object('id',d.id,'attempt',d.attempt,'to',d.recipient,'kind',d.kind);
 if d.kind='resident' then select result||jsonb_build_object('body',n.body,'title',t.title,'start',t.planned_start,'end',t.planned_end) into result from bolig_private.progress_notices n join bolig_private.progress_tasks t on t.id=n.task_id where n.id=d.notice_id;end if;
 return result;
end$$;
create function public.bolig_progress_worker_validate(p_id uuid,p_attempt uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from bolig_private.progress_deliveries d where d.id=p_id and d.attempt=p_attempt and d.status='sending' and d.reserved_at>now()-interval '5 minutes' and bolig_private.progress_delivery_valid(d))
$$;
create function public.bolig_progress_worker_finish(p_id uuid,p_attempt uuid,p_accepted boolean) returns boolean language plpgsql security definer set search_path='' as $$begin
 if p_accepted is null then return false;end if;
 update bolig_private.progress_deliveries set status=case when p_accepted then 'accepted' else 'pending' end,accepted_at=case when p_accepted then now() else null end,available_at=now()+interval '15 minutes' where id=p_id and attempt=p_attempt and status='sending';return found;end$$;
create function bolig_private.invoke_progress_worker() returns void language plpgsql security definer set search_path='' as $$declare cfg bolig_private.progress_mail_settings%rowtype;token text;begin
 select * into cfg from bolig_private.progress_mail_settings where singleton;
 if not cfg.enabled or cfg.enabled_since is null or cfg.endpoint !~ '^https://[a-z0-9]{20}\.supabase\.co/functions/v1/bolig-progress-notifications$' then return;end if;
 if extract(hour from now() at time zone 'Europe/Oslo') not between 8 and 17 then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-bolig-worker-token',token),body:='{}'::jsonb,timeout_milliseconds:=40000);
end$$;
revoke all on function bolig_private.progress_tick(),bolig_private.progress_delivery_valid(bolig_private.progress_deliveries),bolig_private.invoke_progress_worker() from public,anon,authenticated,service_role;
revoke all on function public.bolig_progress_worker_authorize(text),public.bolig_progress_worker_reserve(),public.bolig_progress_worker_validate(uuid,uuid),public.bolig_progress_worker_finish(uuid,uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function public.bolig_progress_worker_authorize(text),public.bolig_progress_worker_reserve(),public.bolig_progress_worker_validate(uuid,uuid),public.bolig_progress_worker_finish(uuid,uuid,boolean) to service_role;
select cron.schedule('bolig-progress-notifications','* * * * *','select bolig_private.invoke_progress_worker();');
notify pgrst,'reload schema';

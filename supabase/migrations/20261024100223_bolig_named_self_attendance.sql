-- Named presence: explicit project membership, own status only, no payroll/time writes.
create table bolig_private.attendance_people(
 id uuid primary key default gen_random_uuid(), root_id uuid not null references bolig_private.roots(id),
 user_id uuid references auth.users(id), access_id uuid references bolig_private.partner_access(id),
 name text not null check(length(trim(name)) between 1 and 120), company text not null,
 enabled boolean not null default true, revision bigint not null default 1,
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 check((user_id is null) <> (access_id is null)),unique(root_id,user_id),unique(root_id,access_id));
create index bolig_attendance_people_user on bolig_private.attendance_people(user_id,root_id);
create index bolig_attendance_people_access on bolig_private.attendance_people(access_id);
create index bolig_attendance_people_creator on bolig_private.attendance_people(created_by);
create table bolig_private.attendance_person_visits(
 visit_id uuid primary key references bolig_private.attendance_visits(id), person_id uuid not null references bolig_private.attendance_people(id));
create index bolig_attendance_person_visits_person on bolig_private.attendance_person_visits(person_id);
create table bolig_private.attendance_requests(
 id uuid primary key, root_id uuid not null references bolig_private.roots(id),actor text not null,
 action text not null,payload jsonb not null,created_at timestamptz not null default now());
create index bolig_attendance_requests_root on bolig_private.attendance_requests(root_id);
do $$declare t text;begin foreach t in array array['attendance_people','attendance_person_visits','attendance_requests'] loop
 execute format('alter table bolig_private.%I enable row level security',t);
 execute format('revoke all on bolig_private.%I from public,anon,authenticated,service_role',t);
end loop;end$$;

create function bolig_private.attendance_person_view(person bolig_private.attendance_people) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',person.id,'root_id',person.root_id,'name',person.name,'company',person.company,
 'revision',person.revision,'project',(select title from bolig_private.roots where id=person.root_id),
 'visit',(select jsonb_build_object('id',v.id,'arrived_at',v.arrived_at) from bolig_private.attendance_person_visits x
 join bolig_private.attendance_visits v on v.id=x.visit_id where x.person_id=person.id and v.departed_at is null order by v.arrived_at desc limit 1))
$$;
revoke all on function bolig_private.attendance_person_view(bolig_private.attendance_people) from public,anon,authenticated,service_role;

create function bolig_private.attendance_people_workspace(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;person bolig_private.attendance_people%rowtype;p bolig_private.partner_access%rowtype;
 r bolig_private.roots%rowtype;receipt bolig_private.attendance_requests%rowtype;rid uuid;uid uuid;aid uuid;who text;label text;org text;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) or ctx->>'role'<>'manager' then raise exception 'Prosjektleder kreves.' using errcode='42501';end if;
 select * into r from bolig_private.roots where id=root and company_id=c for share;
 if not found then raise exception 'Prosjektet er ikke tilgjengelig.' using errcode='42501';end if;
 if action is null or action not in('get','add','toggle') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>4000 then raise exception 'Ugyldig deltakerhandling.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-attendance:'||root::text,0));
 who:='manager:'||auth.uid()::text;
 if action<>'get' then
  if r.archived then raise exception 'Arkivert prosjekt kan bare leses.' using errcode='42501';end if;
  rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'Lagrings-ID mangler.' using errcode='22023';end if;
  select * into receipt from bolig_private.attendance_requests where id=rid;
  if found then
   if receipt.root_id<>root or receipt.actor<>who or receipt.action<>action or receipt.payload is distinct from payload then raise exception 'Lagringsforsøket er endret.' using errcode='PT409';end if;
  else
   if action='add' then
    uid:=nullif(payload->>'user_id','')::uuid;aid:=nullif(payload->>'access_id','')::uuid;
    if (uid is null)=(aid is null) then raise exception 'Velg én ansatt eller én personlig UE-lenke.' using errcode='22023';end if;
    if uid is not null then
     if not exists(select 1 from public.sales_company_memberships m join public.profiles u on u.id=m.user_id where m.company_id=c and m.user_id=uid and m.workspace_role in('ansatt','firmaadmin') and u.approved and not coalesce(u.deactivated,false) and u.role in('admin','member','ansatt','firmaadmin')) then raise exception 'Ansatt er ikke aktiv i firmaet.' using errcode='42501';end if;
     label:=trim(payload->>'name');org:=ctx->>'company_name';
    else
     select * into p from bolig_private.partner_access where id=aid and root_id=root and kind='ue';
     if not found or not bolig_private.partner_active(p) then raise exception 'Velg en aktiv personlig UE-lenke fra dette prosjektet.' using errcode='42501';end if;
     label:=p.name;org:=p.organisation;
    end if;
    if length(coalesce(label,'')) not between 1 and 120 then raise exception 'Fyll ut deltakerens navn.' using errcode='22023';end if;
    if exists(select 1 from bolig_private.attendance_people where root_id=root and (user_id=uid or access_id=aid)) then raise exception 'Personen er allerede lagt til. Bruk Aktiver deltaker ved behov.' using errcode='22023';end if;
    insert into bolig_private.attendance_people(root_id,user_id,access_id,name,company,created_by) values(root,uid,aid,label,org,auth.uid());
   else
    select * into person from bolig_private.attendance_people where id=(payload->>'id')::uuid and root_id=root;
    if not found then raise exception 'Deltakeren tilhører ikke prosjektet.' using errcode='42501';end if;
    if (payload->>'revision')::bigint is distinct from person.revision then raise exception 'Deltakeren er endret. Hent siste liste.' using errcode='PT409';end if;
    if jsonb_typeof(payload->'enabled') is distinct from 'boolean' then raise exception 'Velg aktiv eller av.' using errcode='22023';end if;
    if not (payload->>'enabled')::boolean and exists(select 1 from bolig_private.attendance_person_visits x join bolig_private.attendance_visits v on v.id=x.visit_id where x.person_id=person.id and v.departed_at is null) then raise exception 'Registrer deltakeren ut før du deaktiverer.' using errcode='22023';end if;
    update bolig_private.attendance_people set enabled=(payload->>'enabled')::boolean,revision=revision+1 where id=person.id;
   end if;
   insert into bolig_private.attendance_requests values(rid,root,who,action,payload,now());
  end if;
 end if;
 return jsonb_build_object('context',ctx,'root_id',root,'receipt_id',rid,
 'people',coalesce((select jsonb_agg(to_jsonb(x) order by x.name) from bolig_private.attendance_people x where x.root_id=root),'[]'::jsonb),
 'users',coalesce((select jsonb_agg(jsonb_build_object('id',u.id,'email',u.email) order by u.email) from public.sales_company_memberships m join public.profiles u on u.id=m.user_id where m.company_id=c and m.workspace_role in('ansatt','firmaadmin') and u.approved and not coalesce(u.deactivated,false) and u.role in('admin','member','ansatt','firmaadmin')),'[]'::jsonb),
 'partners',coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'name',x.name,'company',x.organisation) order by x.name) from bolig_private.partner_access x where x.root_id=root and x.kind='ue' and bolig_private.partner_active(x)),'[]'::jsonb));
end$$;
revoke all on function bolig_private.attendance_people_workspace(uuid,uuid,text,jsonb) from public,anon;
grant execute on function bolig_private.attendance_people_workspace(uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_attendance_people(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.attendance_people_workspace(p_company_id,p_root_id,p_action,p_payload)$$;
revoke all on function public.bolig_attendance_people(uuid,uuid,text,jsonb) from public,anon;
grant execute on function public.bolig_attendance_people(uuid,uuid,text,jsonb) to authenticated;

create function bolig_resident_private.attendance_self(c uuid,token text,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare u uuid:=auth.uid();p bolig_private.partner_access%rowtype;person bolig_private.attendance_people%rowtype;
 receipt bolig_private.attendance_requests%rowtype;s bolig_private.attendance_states%rowtype;v bolig_private.attendance_visits%rowtype;
 rid uuid;root uuid;who text;old jsonb;entries jsonb;actor_id uuid;event_payload jsonb;
begin
 if action is null or action not in('get','in','out') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>4000 then raise exception 'Ugyldig registrering.' using errcode='22023';end if;
 if token is not null then
  if token !~ '^[a-f0-9]{64}$' then raise exception 'UE-lenken er ikke gyldig.' using errcode='42501';end if;
  select * into p from bolig_private.partner_access where token_hash=sha256(convert_to(token,'UTF8')) and kind='ue';
  if not found or not bolig_private.partner_active(p) then raise exception 'UE-lenken er utløpt eller trukket tilbake.' using errcode='42501';end if;
  select company_id into c from bolig_private.roots where id=p.root_id;
  who:='ue:'||p.id::text;actor_id:=p.created_by;
 else
  if u is null or c is distinct from public.current_active_company_scope_id() or not exists(select 1 from public.sales_company_memberships m join public.profiles pr on pr.id=m.user_id where m.company_id=c and m.user_id=u and m.workspace_role in('ansatt','firmaadmin') and pr.approved and not coalesce(pr.deactivated,false) and pr.role in('admin','member','ansatt','firmaadmin')) then raise exception 'Aktiv bruker og riktig arbeidsfirma kreves.' using errcode='42501';end if;
  who:='user:'||u::text;actor_id:=u;
 end if;
 if not exists(select 1 from bolig_private.firms where company_id=c and enabled) then raise exception 'Bemanning er ikke tilgjengelig i firmaet.' using errcode='42501';end if;
 if action<>'get' then
  select * into person from bolig_private.attendance_people where id=(payload->>'id')::uuid and ((token is null and user_id=u) or (token is not null and access_id=p.id));
  if not found then raise exception 'Du kan bare registrere din egen tilstedeværelse.' using errcode='42501';end if;
  root:=person.root_id;
  perform 1 from bolig_private.roots where id=root and company_id=c and not archived for share;
  if not found then raise exception 'Prosjektet er ikke aktivt.' using errcode='42501';end if;
  perform pg_advisory_xact_lock(hashtextextended('bolig-attendance:'||root::text,0));
  -- Re-read after serialization; a concurrent deactivation must win.
  select * into person from bolig_private.attendance_people where id=person.id;
  select * into s from bolig_private.attendance_states where root_id=root;
  if not person.enabled or not coalesce(s.enabled,false) then raise exception 'Du er ikke aktiv deltaker i et prosjekt med bemanning.' using errcode='42501';end if;
  rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'Registrerings-ID mangler.' using errcode='22023';end if;
  select * into receipt from bolig_private.attendance_requests where id=rid;
  if found then
   if receipt.root_id<>root or receipt.actor<>who or receipt.action<>action or receipt.payload is distinct from payload then raise exception 'Registreringsforsøket er endret.' using errcode='PT409';end if;
  else
   select v2.* into v from bolig_private.attendance_person_visits x join bolig_private.attendance_visits v2 on v2.id=x.visit_id where x.person_id=person.id and v2.departed_at is null order by v2.arrived_at desc limit 1;
   if (payload->>'revision')::bigint is distinct from person.revision or nullif(payload->>'visit_id','')::uuid is distinct from v.id then raise exception 'Status er endret. Hent siste status før du trykker igjen.' using errcode='PT409';end if;
   if (action='in' and v.id is not null) or (action='out' and v.id is null) then raise exception 'Status er endret. Hent siste status.' using errcode='PT409';end if;
   old:=case when v.id is not null then to_jsonb(v) else null end;
   if action='in' then
    insert into bolig_private.attendance_visits(id,root_id,name,company,arrived_at) values(gen_random_uuid(),root,person.name,person.company,clock_timestamp()) returning * into v;
    insert into bolig_private.attendance_person_visits values(v.id,person.id);
   else update bolig_private.attendance_visits set departed_at=greatest(clock_timestamp(),arrived_at) where id=v.id returning * into v;
   end if;
   update bolig_private.attendance_people set revision=revision+1 where id=person.id;
   update bolig_private.attendance_states set revision=revision+1 where root_id=root returning * into s;
   event_payload:=jsonb_build_object('reason',case when action='in' then 'Deltakeren registrerte seg inn' else 'Deltakeren registrerte seg ut' end,'person_id',person.id,'source',case when token is null then 'min_side' else 'ue_link' end,'source_label',case when token is null then person.name||' · Min side' else person.name||' · personlig UE-lenke' end,'access_id',p.id);
   insert into bolig_private.attendance_events values(rid,root,actor_id,now(),s.revision,'visit',event_payload,old,to_jsonb(v));
   insert into bolig_private.attendance_requests values(rid,root,who,action,payload,now());
  end if;
 end if;
 select coalesce(jsonb_agg(bolig_private.attendance_person_view(x) order by r.title,x.name),'[]'::jsonb) into entries
 from bolig_private.attendance_people x join bolig_private.roots r on r.id=x.root_id join bolig_private.attendance_states s2 on s2.root_id=x.root_id
 where r.company_id=c and not r.archived and s2.enabled and x.enabled and ((token is null and x.user_id=u) or (token is not null and x.access_id=p.id));
 return jsonb_build_object('context',jsonb_build_object('user_id',case when token is null then u else null end,'company_id',c),'id',p.id,'entries',entries,'receipt_id',rid);
end$$;
revoke all on function bolig_resident_private.attendance_self(uuid,text,text,jsonb) from public;
grant execute on function bolig_resident_private.attendance_self(uuid,text,text,jsonb) to anon,authenticated;
create function public.bolig_my_attendance(p_company_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_resident_private.attendance_self(p_company_id,null,p_action,p_payload)$$;
revoke all on function public.bolig_my_attendance(uuid,text,jsonb) from public,anon;
grant execute on function public.bolig_my_attendance(uuid,text,jsonb) to authenticated;
create function public.bolig_ue_attendance(p_token text,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_resident_private.attendance_self(null,p_token,p_action,p_payload)$$;
revoke all on function public.bolig_ue_attendance(text,text,jsonb) from public;
grant execute on function public.bolig_ue_attendance(text,text,jsonb) to anon,authenticated;

-- Add one own-project predicate to the existing landing metadata; preserve every other right.
do $patch$
declare body text;anchor text:='''personal_page'',ks or hr or exists';
begin
 body:=pg_get_functiondef('public.get_my_personal_context()'::regprocedure);
 if position(anchor in body)=0 then raise exception 'Missing personal page metadata anchor';end if;
 execute replace(body,anchor,'''personal_page'',ks or hr or exists(select 1 from bolig_private.attendance_people a join bolig_private.roots r on r.id=a.root_id join bolig_private.attendance_states s on s.root_id=r.id join bolig_private.firms f on f.company_id=r.company_id where a.user_id=u and a.enabled and r.company_id=c and not r.archived and s.enabled and f.enabled) or exists');
end$patch$;

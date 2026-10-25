-- Actual presence is isolated from planned staffing, payroll and time registration.
create table bolig_private.attendance_states(root_id uuid primary key references bolig_private.roots(id), enabled boolean not null default false, revision bigint not null default 0);
create table bolig_private.attendance_visits(id uuid primary key, root_id uuid not null references bolig_private.roots(id), name text not null, company text not null, arrived_at timestamptz not null, departed_at timestamptz, check(departed_at is null or departed_at>=arrived_at));
create index bolig_attendance_root on bolig_private.attendance_visits(root_id,arrived_at);
create table bolig_private.attendance_events(id uuid primary key, root_id uuid not null references bolig_private.roots(id), actor uuid not null references auth.users(id), created_at timestamptz not null default now(), revision bigint not null, action text not null, payload jsonb not null, before_value jsonb, after_value jsonb, unique(root_id,revision));
alter table bolig_private.attendance_states enable row level security;
alter table bolig_private.attendance_visits enable row level security;
alter table bolig_private.attendance_events enable row level security;
revoke all on bolig_private.attendance_states,bolig_private.attendance_visits,bolig_private.attendance_events from public,anon,authenticated,service_role;
create function bolig_private.attendance_workspace(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;s bolig_private.attendance_states%rowtype;e bolig_private.attendance_events%rowtype;v bolig_private.attendance_visits%rowtype;old jsonb;rid uuid;vid uuid;start_at timestamptz;end_at timestamptz;day date;lo timestamptz;hi timestamptz;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) or ctx->>'role' is distinct from 'manager' then raise exception 'Prosjektledertilgang kreves for bemanning.' using errcode='42501';end if;
 select * into r from bolig_private.roots where id=root and company_id=c for share;
 if not found then raise exception 'Prosjektet er ikke tilgjengelig i aktivt firma.' using errcode='42501';end if;
 if action is null or action not in ('get','enable','visit') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>10000 then raise exception 'Ugyldig bemanningshandling.' using errcode='22023';end if;
 day:=coalesce((payload->>'day')::date,(now() at time zone 'Europe/Oslo')::date);lo:=day::timestamp at time zone 'Europe/Oslo';hi:=(day+1)::timestamp at time zone 'Europe/Oslo';
 perform pg_advisory_xact_lock(hashtextextended('bolig-attendance:'||root::text,0));
 select * into s from bolig_private.attendance_states where root_id=root;
 if not found then s.root_id:=root;s.enabled:=false;s.revision:=0;end if;
 if action<>'get' then
  if r.archived then raise exception 'Arkivert prosjekt kan bare leses.' using errcode='42501';end if;
  rid:=(payload->>'request_id')::uuid;
  if rid is null then raise exception 'Lagrings-ID mangler.' using errcode='22023';end if;
  select * into e from bolig_private.attendance_events where id=rid;
  if found then
   if e.root_id<>root or e.actor<>auth.uid() or e.action<>action or e.payload is distinct from payload then raise exception 'Lagringsforsøket er endret.' using errcode='PT409';end if;
  else
   if (payload->>'revision')::bigint is distinct from s.revision then raise exception 'Listen er endret. Kladden er beholdt. Hent siste liste og se over før ny lagring.' using errcode='PT409';end if;
   if action='enable' then
    if jsonb_typeof(payload->'enabled') is distinct from 'boolean' then raise exception 'Velg aktiv eller av.' using errcode='22023';end if;
    old:=to_jsonb(s);s.enabled:=(payload->>'enabled')::boolean;
   else
    if not s.enabled then raise exception 'Aktiver bemanning i Oppsett først.' using errcode='22023';end if;
    vid:=(payload->>'id')::uuid;
    if vid is null then raise exception 'Registrerings-ID mangler.' using errcode='22023';end if;
    select * into v from bolig_private.attendance_visits where id=vid;
    if found then
     if v.root_id<>root then raise exception 'Registreringen tilhører et annet prosjekt.' using errcode='42501';end if;
     if length(trim(coalesce(payload->>'reason',''))) not between 3 and 500 then raise exception 'Skriv hvorfor registreringen rettes.' using errcode='22023';end if;
     old:=to_jsonb(v);
    end if;
    if length(trim(coalesce(payload->>'name',''))) not between 1 and 120 or length(trim(coalesce(payload->>'company',''))) not between 1 and 120
     or coalesce(payload->>'arrived','') !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$'
     or (nullif(payload->>'departed','') is not null and payload->>'departed' !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$') then raise exception 'Fyll ut navn, firma og gyldige tidspunkt.' using errcode='22023';end if;
    start_at:=(payload->>'arrived')::timestamp at time zone 'Europe/Oslo';end_at:=nullif(payload->>'departed','')::timestamp at time zone 'Europe/Oslo';
    if start_at>now() or end_at>now() or end_at<start_at then raise exception 'Tidspunkt kan ikke være fremtidige, og ut må være etter inn.' using errcode='22023';end if;
    insert into bolig_private.attendance_visits values(vid,root,trim(payload->>'name'),trim(payload->>'company'),start_at,end_at)
     on conflict(id) do update set name=excluded.name,company=excluded.company,arrived_at=excluded.arrived_at,departed_at=excluded.departed_at returning * into v;
   end if;
   s.revision:=s.revision+1;
   insert into bolig_private.attendance_states values(root,s.enabled,s.revision) on conflict(root_id) do update set enabled=excluded.enabled,revision=excluded.revision;
   insert into bolig_private.attendance_events values(rid,root,auth.uid(),now(),s.revision,action,payload,old,case when action='enable' then to_jsonb(s) else to_jsonb(v) end) returning * into e;
  end if;
 end if;
 return jsonb_build_object('context',ctx,'root_id',root,'enabled',s.enabled,'revision',s.revision,'day',day,'receipt_id',e.id,
  'visits',coalesce((select jsonb_agg(to_jsonb(x) order by x.arrived_at desc,x.id) from bolig_private.attendance_visits x where x.root_id=root and x.arrived_at<hi and (x.departed_at is null or x.departed_at>=lo)),'[]'::jsonb),
  'events',coalesce((select jsonb_agg(to_jsonb(x)||jsonb_build_object('actor_label',(select p.email from public.profiles p where p.id=x.actor)) order by x.revision desc) from bolig_private.attendance_events x where x.root_id=root and x.after_value->>'id' in (select a.id::text from bolig_private.attendance_visits a where a.root_id=root and a.arrived_at<hi and (a.departed_at is null or a.departed_at>=lo))),'[]'::jsonb));
end;$$;
revoke all on function bolig_private.attendance_workspace(uuid,uuid,text,jsonb) from public,anon;
grant execute on function bolig_private.attendance_workspace(uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_attendance(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.attendance_workspace(p_company_id,p_root_id,p_action,p_payload)$$;
revoke all on function public.bolig_attendance(uuid,uuid,text,jsonb) from public,anon;
grant execute on function public.bolig_attendance(uuid,uuid,text,jsonb) to authenticated;

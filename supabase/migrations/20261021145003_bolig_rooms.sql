-- Rooms are an additive unit sublevel. Existing project links, choice snapshots and
-- order drafts are unchanged. Only this gateway may read/write the private tables.
create table bolig_private.room_states(
 unit_id uuid primary key,root_id uuid not null,revision bigint not null default 0,
 foreign key(unit_id,root_id) references bolig_private.units(id,root_id));
create index bolig_room_states_root on bolig_private.room_states(root_id,unit_id);
create table bolig_private.rooms(
 id uuid primary key,unit_id uuid not null,root_id uuid not null,
 type text not null check(type in ('bathroom','laundry','wc','technical','other')),
 name text not null check(length(trim(name)) between 1 and 80),
 floor text not null default '' check(length(floor)<=40),
 archived boolean not null default false,revision bigint not null default 1,
 foreign key(unit_id,root_id) references bolig_private.units(id,root_id));
create index bolig_rooms_root_unit on bolig_private.rooms(root_id,unit_id,id);
create index bolig_rooms_unit on bolig_private.rooms(unit_id,id);
create unique index bolig_rooms_active_name on bolig_private.rooms(unit_id,lower(trim(name))) where not archived;
create table bolig_private.room_versions(
 unit_id uuid not null,root_id uuid not null,revision bigint not null,
 snapshot jsonb not null,created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),primary key(unit_id,revision),
 foreign key(unit_id,root_id) references bolig_private.units(id,root_id));
create index bolig_room_versions_root on bolig_private.room_versions(root_id,unit_id,revision desc);
create index bolig_room_versions_actor on bolig_private.room_versions(created_by);
alter table bolig_private.room_states enable row level security;
alter table bolig_private.rooms enable row level security;
alter table bolig_private.room_versions enable row level security;
revoke all on bolig_private.room_states,bolig_private.rooms,bolig_private.room_versions from public,anon,authenticated,service_role;

create function bolig_private.rooms_workspace(c uuid,root uuid,unit uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;v_rev bigint;v_id uuid;v_rooms jsonb;v_archived boolean;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not (ctx->>'enabled')::boolean then raise exception 'Boligprosjekter er ikke tilgjengelig i aktivt firma.' using errcode='42501';end if;
 if action is null or action not in ('list','save','archive') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>2000 then raise exception 'Ugyldig romhandling.' using errcode='22023';end if;
 -- Serialize with structure/archive commands; no changes to their revisions.
 select * into r from bolig_private.roots where id=root and company_id=c for share;
 if not found then raise exception 'Boligprosjektet er ikke tilgjengelig i aktivt firma.' using errcode='42501';end if;
 perform 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
 where u.id=unit and u.root_id=root and not u.archived and not e.archived and not b.archived;
 if not found then raise exception 'Boligen er ikke tilgjengelig.' using errcode='42501';end if;
 if action<>'list' then
  if ctx->>'role'<>'manager' or r.archived then raise exception 'Prosjektleder og aktivt boligprosjekt kreves.' using errcode='42501';end if;
  perform pg_advisory_xact_lock(hashtextextended('bolig-rooms:'||unit::text,0));
 end if;
 select coalesce((select revision from bolig_private.room_states where unit_id=unit),0) into v_rev;
 if action<>'list' then
  if expected is distinct from v_rev then raise exception 'Rommene er endret. Utkastet er beholdt. Hent siste romoversikt.' using errcode='PT409';end if;
  if jsonb_typeof(payload->'id') is distinct from 'string' then raise exception 'Rom-ID mangler.' using errcode='22023';end if;
  v_id:=(payload->>'id')::uuid;
  if exists(select 1 from bolig_private.rooms where id=v_id and (unit_id<>unit or root_id<>root)) then raise exception 'Rommet er ikke tilgjengelig i boligen.' using errcode='42501';end if;
  if action='save' then
   if jsonb_typeof(payload->'type') is distinct from 'string' or coalesce(payload->>'type','') not in ('bathroom','laundry','wc','technical','other')
    or jsonb_typeof(payload->'name') is distinct from 'string' or coalesce(length(trim(payload->>'name')),0) not between 1 and 80
    or jsonb_typeof(payload->'floor') is distinct from 'string' or length(payload->>'floor')>40
   then raise exception 'Velg romtype, et navn på 1–80 tegn og eventuell etasje på inntil 40 tegn.' using errcode='22023';end if;
   if exists(select 1 from bolig_private.rooms where id=v_id and archived) then raise exception 'Gjenopprett rommet før redigering.' using errcode='22023';end if;
   if not exists(select 1 from bolig_private.rooms where id=v_id) and (select count(*) from bolig_private.rooms where unit_id=unit)>=60 then raise exception 'Inntil 60 rom per bolig, inkludert arkiverte rom.' using errcode='22023';end if;
   insert into bolig_private.rooms(id,unit_id,root_id,type,name,floor) values(v_id,unit,root,payload->>'type',trim(payload->>'name'),trim(payload->>'floor'))
   on conflict(id) do update set type=excluded.type,name=excluded.name,floor=excluded.floor,revision=bolig_private.rooms.revision+1;
  else
   if jsonb_typeof(payload->'archived') is distinct from 'boolean' then raise exception 'Velg arkivering eller gjenoppretting.' using errcode='22023';end if;
   v_archived:=(payload->>'archived')::boolean;
   update bolig_private.rooms set archived=v_archived,revision=revision+1 where id=v_id and unit_id=unit and root_id=root;
   if not found then raise exception 'Rommet er ikke tilgjengelig i boligen.' using errcode='42501';end if;
  end if;
  v_rev:=v_rev+1;
  insert into bolig_private.room_states(unit_id,root_id,revision) values(unit,root,v_rev) on conflict(unit_id) do update set revision=excluded.revision;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'room_'||action,v_id,v_rev);
 end if;
 select coalesce(jsonb_agg(to_jsonb(x) order by x.archived,x.name,x.id),'[]') into v_rooms from bolig_private.rooms x where x.unit_id=unit and x.root_id=root;
 if action<>'list' then
  insert into bolig_private.room_versions(unit_id,root_id,revision,snapshot,created_by) values(unit,root,v_rev,v_rooms,auth.uid());
 end if;
 return jsonb_build_object('context',ctx,'root_id',root,'unit_id',unit,'revision',v_rev,'root_archived',r.archived,'rooms',v_rooms);
end$$;
revoke all on function bolig_private.rooms_workspace(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,authenticated,service_role;
grant execute on function bolig_private.rooms_workspace(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;
create function public.bolig_rooms(p_company_id uuid,p_root_id uuid,p_unit_id uuid,p_action text default 'list',p_revision bigint default null,p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$
 select bolig_private.rooms_workspace(p_company_id,p_root_id,p_unit_id,p_action,p_revision,p_payload);
$$;
revoke all on function public.bolig_rooms(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function public.bolig_rooms(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;

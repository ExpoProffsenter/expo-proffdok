-- Existing clients remain compatible until an area is explicitly started in the new UI.
alter table stocktake_private.sessions add column areas_enabled boolean not null default false;
-- Additive stocktake workflow. Existing quantities, line identities and Cordel bytes stay intact.
create table stocktake_private.areas (
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null references stocktake_private.sessions(id) on delete cascade,
 name text not null, name_key text not null,
 status text not null default 'paused' check (status in ('counting','paused','done')),
 owner_id uuid references public.profiles(id), note text not null default '',
 revision bigint not null default 1, updated_at timestamptz not null default now(),
 unique(session_id,name_key), check ((status='counting') = (owner_id is not null))
);
create index stocktake_areas_owner on stocktake_private.areas(owner_id) where owner_id is not null;
create table stocktake_private.events (
 id bigint generated always as identity primary key,
 session_id uuid not null references stocktake_private.sessions(id) on delete cascade,
 area_id uuid references stocktake_private.areas(id), command_id uuid,
 actor_id uuid not null references public.profiles(id), actor_label text not null,
 action text not null, before_value jsonb, after_value jsonb,
 created_at timestamptz not null default clock_timestamp()
);
create index stocktake_events_session on stocktake_private.events(session_id,id desc);
create index stocktake_events_area on stocktake_private.events(area_id,id desc);
create index stocktake_events_actor on stocktake_private.events(actor_id);
alter table stocktake_private.areas enable row level security;
alter table stocktake_private.events enable row level security;
revoke all on stocktake_private.areas,stocktake_private.events from public,anon,authenticated,service_role;
revoke all on all sequences in schema stocktake_private from public,anon,authenticated,service_role;

-- Preserve only the actually known starting state, never invent earlier count events.
insert into stocktake_private.areas(session_id,name,name_key,status)
 select l.session_id,min(l.location),lower(btrim(l.location)),case when bool_and(s.closed) then 'done' else 'paused' end
 from stocktake_private.lines l join stocktake_private.sessions s on s.id=l.session_id
 group by l.session_id,lower(btrim(l.location));
create function stocktake_private.actor_label(p_actor uuid) returns text
language sql security definer set search_path='' as $$
 select coalesce(nullif(to_jsonb(p)->>'email',''),p_actor::text) from public.profiles p where p.id=p_actor;
$$;
revoke all on function stocktake_private.actor_label(uuid) from public,anon,authenticated,service_role;
insert into stocktake_private.events(session_id,area_id,actor_id,actor_label,action,after_value,created_at)
 select l.session_id,a.id,l.updated_by,stocktake_private.actor_label(l.updated_by),'baseline',to_jsonb(l),l.updated_at
 from stocktake_private.lines l join stocktake_private.areas a on a.session_id=l.session_id and a.name_key=lower(btrim(l.location));

-- Keep the proven catalogue identity, quantity, revision and command-replay logic private.
alter function public.stocktake_record(uuid,uuid,uuid,jsonb) set schema stocktake_private;
alter function stocktake_private.stocktake_record(uuid,uuid,uuid,jsonb) rename to record_base;
revoke all on function stocktake_private.record_base(uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;
alter function public.stocktake_get(uuid,uuid,integer) set schema stocktake_private;
alter function stocktake_private.stocktake_get(uuid,uuid,integer) rename to get_base;
revoke all on function stocktake_private.get_base(uuid,uuid,integer) from public,anon,authenticated,service_role;

create function stocktake_private.record(p_company_id uuid,p_id uuid,p_command_id uuid,p_input jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s stocktake_private.sessions%rowtype; a stocktake_private.areas%rowtype;
 cmd stocktake_private.commands%rowtype; result jsonb; old_value jsonb; before_area jsonb;
 action text:=p_input->>'action'; v_location text; requested_name text; actor text;
begin
 perform stocktake_private.check_actor(p_company_id);
 -- All area transitions, counting, close and replay use the same short transaction lock.
 select * into s from stocktake_private.sessions where id=p_id and company_id=p_company_id for update;
 if not found then raise exception 'Tellingen finnes ikke i dette firmaet.' using errcode='42501';end if;
 if p_command_id is null or jsonb_typeof(p_input) is distinct from 'object' then raise exception 'Ugyldig registrering.' using errcode='22023';end if;
 select * into cmd from stocktake_private.commands where id=p_command_id;
 if found then
  if cmd.session_id<>p_id or cmd.actor_id<>auth.uid() or cmd.payload<>p_input then raise exception 'Registreringsnøkkelen er allerede brukt.' using errcode='22023';end if;
  return cmd.result;
 end if;
 if s.closed then raise exception 'Tellingen er avsluttet.' using errcode='55000';end if;
 actor:=stocktake_private.actor_label(auth.uid());
 if action='area_create' then
  if p_input-array['action','name']<>'{}'::jsonb then raise exception 'Ugyldig område.' using errcode='22023';end if;
  requested_name:=btrim(p_input->>'name');
  if coalesce(length(requested_name),0) not between 1 and 120 or requested_name~'[[:cntrl:]]' then raise exception 'Skriv navn på hylle eller område, uten linjeskift.' using errcode='22023';end if;
  if exists(select 1 from stocktake_private.areas where session_id=p_id and name_key=lower(requested_name)) then raise exception 'Området finnes allerede. Velg det i oversikten.' using errcode='PT409';end if;
  insert into stocktake_private.areas(session_id,name,name_key,status,owner_id) values(p_id,requested_name,lower(requested_name),'counting',auth.uid()) returning * into a;
 elsif action in ('area_claim','area_takeover','area_pause','area_done','area_reopen') then
  if p_input-array['action','area_id','revision','note']<>'{}'::jsonb then raise exception 'Ugyldig områdeendring.' using errcode='22023';end if;
  select * into a from stocktake_private.areas where id=(p_input->>'area_id')::uuid and session_id=p_id;
  if not found or (p_input->>'revision')::bigint is distinct from a.revision then raise exception 'Området er endret. Hent tellingen på nytt før du fortsetter.' using errcode='PT409';end if;
  before_area:=to_jsonb(a)||jsonb_build_object('owner_label',stocktake_private.actor_label(a.owner_id));
  if action='area_claim' and a.status<>'paused' or action='area_reopen' and a.status<>'done'
   or action='area_takeover' and (a.status<>'counting' or a.owner_id=auth.uid()) then raise exception 'Områdets status er endret. Hent tellingen på nytt.' using errcode='PT409';end if;
  if action in ('area_pause','area_done') and (a.status<>'counting' or a.owner_id is distinct from auth.uid()) then raise exception 'En annen teller har området. Hent tellingen på nytt.' using errcode='PT409';end if;
  if p_input ? 'note' and (jsonb_typeof(p_input->'note')<>'string' or length(p_input->>'note')>1000) then raise exception 'Merknaden kan ha høyst 1000 tegn.' using errcode='22023';end if;
  update stocktake_private.areas set status=case when action='area_pause' then 'paused' when action='area_done' then 'done' else 'counting' end,
   owner_id=case when action in ('area_pause','area_done') then null else auth.uid() end,
   note=case when action in ('area_pause','area_done') then coalesce(p_input->>'note',note) else note end,
   revision=revision+1,updated_at=clock_timestamp() where id=a.id returning * into a;
 elsif action in ('add','set','delete','close') then
  if action='close' then
   if s.areas_enabled and exists(select 1 from stocktake_private.areas where session_id=p_id and status<>'done') then raise exception 'Gjør ferdig områdene før tellingen avsluttes.' using errcode='55000';end if;
  else
   if action='add' then v_location:=btrim(coalesce(p_input->>'location',''));
   else select to_jsonb(l) into old_value from stocktake_private.lines l where l.session_id=p_id and l.id=(p_input->>'line_id')::uuid;v_location:=old_value->>'location';end if;
   select * into a from stocktake_private.areas where session_id=p_id and name_key=lower(btrim(v_location));
   if s.areas_enabled and (a.id is null or a.status<>'counting' or a.owner_id is distinct from auth.uid()
    or (p_input->>'area_revision')::bigint is distinct from a.revision) then
    raise exception 'Velg området og start eller overta tellingen før du registrerer. Området kan ha blitt overtatt av en annen.' using errcode='PT409';end if;
   if action='add' then
    select to_jsonb(l) into old_value from stocktake_private.lines l where l.session_id=p_id and lower(btrim(l.location))=lower(v_location) and
     lower(l.supplier)=lower(btrim(case when nullif(p_input->>'catalog_id','') is not null then (select supplier_name from public.internal_store_catalog_items where id=(p_input->>'catalog_id')::uuid) else p_input->>'supplier' end)) and
     lower(l.number)=lower(btrim(case when nullif(p_input->>'catalog_id','') is not null then (select supplier_product_number from public.internal_store_catalog_items where id=(p_input->>'catalog_id')::uuid) else p_input->>'number' end));
   end if;
  end if;
  result:=stocktake_private.record_base(p_company_id,p_id,p_command_id,p_input-'area_revision');
  if result ? 'error' then return result;end if;
  if action='add' and a.id is null then
   insert into stocktake_private.areas(session_id,name,name_key) values(p_id,result->>'location',lower(btrim(result->>'location'))) returning * into a;
  end if;
  if action='close' and not s.areas_enabled then update stocktake_private.areas set status='done',owner_id=null,revision=revision+1 where session_id=p_id;end if;
  -- The outer receipt binds the complete payload, including ownership revision.
  update stocktake_private.commands set payload=p_input where id=p_command_id;
  insert into stocktake_private.events(session_id,area_id,command_id,actor_id,actor_label,action,before_value,after_value)
   values(p_id,a.id,p_command_id,auth.uid(),actor,action,old_value,result);
  return result;
 else raise exception 'Ukjent registrering.' using errcode='22023';end if;
 update stocktake_private.sessions set areas_enabled=true,revision=revision+1,updated_at=clock_timestamp() where id=p_id;
 result:=jsonb_build_object('area',to_jsonb(a),'session_revision',s.revision+1);
 insert into stocktake_private.commands values(p_command_id,p_id,auth.uid(),p_input,result);
 insert into stocktake_private.events(session_id,area_id,command_id,actor_id,actor_label,action,before_value,after_value)
  values(p_id,a.id,p_command_id,auth.uid(),actor,action,before_area,to_jsonb(a));
 return result;
exception when sqlstate '22023' or sqlstate '22P02' or sqlstate 'PT409' or sqlstate '55000' then
 return jsonb_build_object('error',sqlerrm,'code',sqlstate);
end;$$;
revoke all on function stocktake_private.record(uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;
grant usage on schema stocktake_private to authenticated;
grant execute on function stocktake_private.record(uuid,uuid,uuid,jsonb) to authenticated;
create function public.stocktake_record(p_company_id uuid,p_id uuid,p_command_id uuid,p_input jsonb) returns jsonb
language sql security invoker set search_path='' as $$select stocktake_private.record(p_company_id,p_id,p_command_id,p_input);$$;
revoke all on function public.stocktake_record(uuid,uuid,uuid,jsonb) from public,anon,service_role;
grant execute on function public.stocktake_record(uuid,uuid,uuid,jsonb) to authenticated;

create function stocktake_private.get(p_company_id uuid,p_id uuid,p_offset integer,p_area_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 perform stocktake_private.check_actor(p_company_id);
 perform 1 from stocktake_private.sessions where id=p_id and company_id=p_company_id for share;
 if not found then raise exception 'Tellingen finnes ikke i dette firmaet.' using errcode='42501';end if;
 result:=stocktake_private.get_base(p_company_id,p_id,p_offset);
 if p_area_id is not null then
  if not exists(select 1 from stocktake_private.areas where id=p_area_id and session_id=p_id) then raise exception 'Området finnes ikke i tellingen.' using errcode='42501';end if;
  result:=result||jsonb_build_object('session_total',result->'total','total',(select count(*) from stocktake_private.lines l join stocktake_private.areas a on a.id=p_area_id and a.session_id=l.session_id and a.name_key=lower(btrim(l.location))),
   'items',coalesce((select jsonb_agg(to_jsonb(l) order by l.id) from (select l.* from stocktake_private.lines l join stocktake_private.areas a on a.id=p_area_id and a.session_id=l.session_id and a.name_key=lower(btrim(l.location)) order by l.id limit 100 offset greatest(coalesce(p_offset,0),0)) l),'[]'::jsonb));
 end if;
 return result||jsonb_build_object('areas',coalesce((select jsonb_agg(to_jsonb(a)||jsonb_build_object('owner_label',stocktake_private.actor_label(a.owner_id),
  'line_count',(select count(*) from stocktake_private.lines l where l.session_id=p_id and lower(btrim(l.location))=a.name_key),
  'last_count',(select jsonb_build_object('description',e.after_value->>'description','number',e.after_value->>'number','actor_label',e.actor_label,'created_at',e.created_at)
   from stocktake_private.events e where e.area_id=a.id and e.action in ('baseline','add','set') order by e.id desc limit 1)) order by a.name_key,a.id)
  from stocktake_private.areas a where a.session_id=p_id),'[]'::jsonb));
end;$$;
revoke all on function stocktake_private.get(uuid,uuid,integer,uuid) from public,anon,authenticated,service_role;
grant execute on function stocktake_private.get(uuid,uuid,integer,uuid) to authenticated;
create function public.stocktake_get(p_company_id uuid,p_id uuid,p_offset integer default 0) returns jsonb
language sql security invoker set search_path='' as $$select stocktake_private.get(p_company_id,p_id,p_offset,null);$$;
revoke all on function public.stocktake_get(uuid,uuid,integer) from public,anon,service_role;
grant execute on function public.stocktake_get(uuid,uuid,integer) to authenticated;

create function stocktake_private.history(p_company_id uuid,p_id uuid,p_area_id uuid,p_offset integer) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform stocktake_private.check_actor(p_company_id);
 perform 1 from stocktake_private.sessions where id=p_id and company_id=p_company_id for share;
 if not found then raise exception 'Tellingen finnes ikke i dette firmaet.' using errcode='42501';end if;
 if p_area_id is not null and not exists(select 1 from stocktake_private.areas where id=p_area_id and session_id=p_id) then raise exception 'Området finnes ikke i tellingen.' using errcode='42501';end if;
 return jsonb_build_object('session_id',p_id,'area_id',p_area_id,'total',(select count(*) from stocktake_private.events where session_id=p_id and (p_area_id is null or area_id=p_area_id)),
 'items',coalesce((select jsonb_agg(to_jsonb(e) order by e.id desc) from (select * from stocktake_private.events where session_id=p_id and (p_area_id is null or area_id=p_area_id) order by id desc limit 50 offset greatest(coalesce(p_offset,0),0)) e),'[]'::jsonb));
end;$$;
revoke all on function stocktake_private.history(uuid,uuid,uuid,integer) from public,anon,authenticated,service_role;
grant execute on function stocktake_private.history(uuid,uuid,uuid,integer) to authenticated;
create function public.stocktake_history(p_company_id uuid,p_id uuid,p_area_id uuid default null,p_offset integer default 0) returns jsonb
language sql security invoker set search_path='' as $$select stocktake_private.history(p_company_id,p_id,p_area_id,p_offset);$$;
revoke all on function public.stocktake_history(uuid,uuid,uuid,integer) from public,anon,service_role;
grant execute on function public.stocktake_history(uuid,uuid,uuid,integer) to authenticated;

create function public.stocktake_area_get(p_company_id uuid,p_id uuid,p_area_id uuid,p_offset integer default 0) returns jsonb
language sql security invoker set search_path='' as $$select stocktake_private.get(p_company_id,p_id,p_offset,p_area_id);$$;
revoke all on function public.stocktake_area_get(uuid,uuid,uuid,integer) from public,anon,service_role;
grant execute on function public.stocktake_area_get(uuid,uuid,uuid,integer) to authenticated;

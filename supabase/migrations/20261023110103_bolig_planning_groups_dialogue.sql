-- Bolig only: explicit planning groups and optional resident dialogue.
create table bolig_private.coordination_states (
 root_id uuid primary key references bolig_private.roots(id),revision bigint not null default 0,
 messaging_enabled boolean not null default false,manager_id uuid references auth.users(id)
);
create index bolig_coordination_manager on bolig_private.coordination_states(manager_id);
create table bolig_private.planning_groups (
 id uuid primary key,root_id uuid not null references bolig_private.roots(id),name text not null check(length(trim(name)) between 2 and 80),
 unique(root_id,name)
);
create index bolig_planning_group_root on bolig_private.planning_groups(root_id);
create table bolig_private.planning_group_units (
 unit_id uuid primary key references bolig_private.units(id),group_id uuid not null references bolig_private.planning_groups(id) on delete cascade
);
create index bolig_planning_group_members on bolig_private.planning_group_units(group_id);
alter table bolig_private.units add column messaging_override boolean;
alter table bolig_private.resident_events add column read_at timestamptz,add column handled_at timestamptz;
create index bolig_dialogue_pending on bolig_private.resident_events(portal_id,created_at,id) where kind='message' and handled_at is null;
-- Preserve established active dialogues. Newly created projects inherit OFF.
insert into bolig_private.coordination_states(root_id,messaging_enabled,manager_id)
 select r.id,true,r.created_by from bolig_private.roots r where exists(select 1 from bolig_private.resident_portals p where p.root_id=r.id and not p.revoked);
alter table bolig_private.coordination_states enable row level security;
alter table bolig_private.planning_groups enable row level security;
alter table bolig_private.planning_group_units enable row level security;
revoke all on bolig_private.coordination_states,bolig_private.planning_groups,bolig_private.planning_group_units from public,anon,authenticated,service_role;
create function bolig_private.dialogue_enabled(unit uuid) returns boolean language sql stable set search_path='' as $$
 select coalesce(u.messaging_override,s.messaging_enabled,false) from bolig_private.units u left join bolig_private.coordination_states s on s.root_id=u.root_id where u.id=unit
$$;
create function bolig_private.dialogue_manager(root uuid) returns uuid language sql stable set search_path='' as $$
 select coalesce(s.manager_id,r.created_by) from bolig_private.roots r left join bolig_private.coordination_states s on s.root_id=r.id where r.id=root
$$;
create function bolig_private.dialogue_manager_active(c uuid,u uuid) returns boolean language sql stable set search_path='' as $$
 select bolig_private.progress_member(c,u) and (exists(select 1 from public.sales_company_memberships m where m.company_id=c and m.user_id=u and m.workspace_role='firmaadmin')
 or exists(select 1 from bolig_private.member_access m where m.company_id=c and m.user_id=u and m.access_role='manager'))
$$;
create function bolig_private.dialogue_mark(p bolig_private.resident_portals,through_id uuid,handled boolean) returns void language plpgsql set search_path='' as $$
declare e bolig_private.resident_events%rowtype;
begin
 select * into e from bolig_private.resident_events where id=through_id and portal_id=p.id and contact_basis=p.contact_basis and kind='message' and sender='resident';
 if not found then raise exception 'Meldingen er endret. Hent siste samtale.' using errcode='PT409';end if;
 update bolig_private.resident_events set read_at=coalesce(read_at,now()),handled_at=case when handled then coalesce(handled_at,now()) else handled_at end
 where portal_id=p.id and contact_basis=p.contact_basis and kind='message' and sender='resident' and (created_at,id)<=(e.created_at,e.id);
end$$;
create function bolig_private.coordination(c uuid,root uuid,action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;rev bigint;rid uuid;fp text;receipt bolig_private.progress_receipts%rowtype;gid uuid;ids uuid[];u uuid;result jsonb;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or coalesce((ctx->>'enabled')::boolean,false) is not true then raise exception 'Boligtilgang kreves.' using errcode='42501';end if;
 select * into r from bolig_private.roots where id=root and company_id=c for update;
 if not found then raise exception 'Prosjektet er ikke tilgjengelig.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 if action is null or action not in('get','group','remove_group','settings','units') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>100000 then raise exception 'Ugyldig samordning.' using errcode='22023';end if;
 rev:=coalesce((select revision from bolig_private.coordination_states where root_id=root),0);
 if action<>'get' then
  if ctx->>'role' is distinct from 'manager' or r.archived then raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
  rid:=(payload->>'request_id')::uuid;fp:=md5(jsonb_build_array('coordination',action,payload)::text);
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  select * into receipt from bolig_private.progress_receipts where root_id=root and actor_id=auth.uid() and request_id=rid;
  if found then if receipt.fingerprint<>fp then raise exception 'Forsøket har annet innhold.' using errcode='PT409';end if;return receipt.result;end if;
  if (payload->>'revision')::bigint is distinct from rev then raise exception 'Oppsettet er endret. Kladden beholdes. Hent siste status.' using errcode='PT409';end if;
  insert into bolig_private.coordination_states(root_id,manager_id) values(root,r.created_by) on conflict do nothing;
  if action in('group','units') then
   if jsonb_typeof(payload->'unit_ids') is distinct from 'array' or jsonb_array_length(payload->'unit_ids') not between 1 and 500 then raise exception 'Velg fra 1 til 500 boliger.' using errcode='22023';end if;
   select array_agg(value::uuid) into ids from jsonb_array_elements_text(payload->'unit_ids');
   if array_position(ids,null) is not null or cardinality(ids)<>(select count(distinct x) from unnest(ids) x) then raise exception 'Boligutvalget må være unikt.' using errcode='22023';end if;
   if exists(select 1 from unnest(ids) x where not exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=x and u.root_id=root and not u.archived and not e.archived and not b.archived)) then raise exception 'En bolig er ikke tilgjengelig.' using errcode='42501';end if;
  end if;
  if action='group' then
   gid:=(payload->>'id')::uuid;
   if gid is null or length(trim(coalesce(payload->>'name',''))) not between 2 and 80 then raise exception 'Gi gruppen et navn (2–80 tegn).' using errcode='22023';end if;
   if exists(select 1 from bolig_private.planning_groups where id=gid and root_id<>root) then raise exception 'Gruppen er ikke tilgjengelig.' using errcode='42501';end if;
   if exists(select 1 from bolig_private.planning_group_units x join bolig_private.planning_groups g on g.id=x.group_id where x.unit_id=any(ids) and g.id<>gid) and payload->'move_confirmed' is distinct from 'true'::jsonb then raise exception 'Bekreft flytting av boliger fra andre grupper.' using errcode='22023';end if;
   if not exists(select 1 from bolig_private.planning_groups where id=gid) and (select count(*) from bolig_private.planning_groups where root_id=root)>=100 then raise exception 'Maksimalt 100 grupper per prosjekt.' using errcode='22023';end if;
   insert into bolig_private.planning_groups values(gid,root,trim(payload->>'name')) on conflict(id) do update set name=excluded.name;
   delete from bolig_private.planning_group_units where group_id=gid or unit_id=any(ids);
   insert into bolig_private.planning_group_units select x,gid from unnest(ids) x;
  elsif action='remove_group' then
   delete from bolig_private.planning_groups where id=(payload->>'id')::uuid and root_id=root;
   if not found then raise exception 'Gruppen er endret.' using errcode='PT409';end if;
  elsif action='settings' then
   if jsonb_typeof(payload->'enabled') is distinct from 'boolean' or not bolig_private.dialogue_manager_active(c,(payload->>'manager_id')::uuid) then raise exception 'Velg aktiv ansvarlig prosjektleder og av/på.' using errcode='22023';end if;
   update bolig_private.coordination_states set messaging_enabled=(payload->>'enabled')::boolean,manager_id=(payload->>'manager_id')::uuid where root_id=root;
  elsif action='units' then
   if payload->>'mode' not in('inherit','on','off') or payload->>'mode' is null then raise exception 'Velg arvet, på eller av.' using errcode='22023';end if;
   update bolig_private.units set messaging_override=case payload->>'mode' when 'on' then true when 'off' then false else null end where id=any(ids);
  end if;
  update bolig_private.coordination_states set revision=revision+1 where root_id=root;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'coordination_'||action,root,rev+1);
 end if;
 result:=jsonb_build_object('context',ctx,'root_id',root,'revision',coalesce((select revision from bolig_private.coordination_states where root_id=root),0),
 'messaging_enabled',coalesce((select messaging_enabled from bolig_private.coordination_states where root_id=root),false),'manager_id',bolig_private.dialogue_manager(root),
 'members',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email)) order by p.email),'[]') from public.profiles p where bolig_private.dialogue_manager_active(c,p.id)),
 'groups',(select coalesce(jsonb_agg(jsonb_build_object('id',g.id,'name',g.name,'unit_ids',(select coalesce(jsonb_agg(gu.unit_id),'[]') from bolig_private.planning_group_units gu join bolig_private.units u on u.id=gu.unit_id where gu.group_id=g.id and not u.archived)) order by g.name),'[]') from bolig_private.planning_groups g where g.root_id=root),
 'units',(select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'number',u.number,'entrance_id',e.id,'block_id',b.id,'address',e.address,'override',u.messaging_override,'enabled',bolig_private.dialogue_enabled(u.id)) order by b.name,e.address,u.number),'[]') from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.root_id=root and not u.archived and not e.archived and not b.archived),
 'inbox',(select coalesce(jsonb_agg(to_jsonb(x) order by x.latest_at desc),'[]') from (
  select u.id unit_id,u.number,u.contact_name,e.address,b.id block_id,p.id portal_id,p.revoked,p.expires_at,
   bolig_private.dialogue_enabled(u.id) enabled,count(*) filter(where v.read_at is null)::int unread,count(*)::int pending,
   max(v.created_at) latest_at,(array_agg(v.id order by v.created_at desc,v.id desc))[1] through_id,
   (array_agg(left(v.body,180) order by v.created_at desc,v.id desc))[1] preview
  from bolig_private.resident_portals p join bolig_private.units u on u.id=p.unit_id join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
  join bolig_private.resident_events v on v.portal_id=p.id and v.contact_basis=p.contact_basis and v.kind='message' and v.sender='resident' and v.handled_at is null
  where p.root_id=root and not u.archived and not e.archived and not b.archived and p.contact_basis=md5(jsonb_build_array(u.contact_name,u.contact_email)::text)
  group by u.id,e.address,b.id,p.id) x));
 if action<>'get' then insert into bolig_private.progress_receipts values(root,auth.uid(),rid,fp,result);end if;
 return result;
end$$;
revoke all on function bolig_private.coordination(uuid,uuid,text,jsonb),bolig_private.dialogue_enabled(uuid),bolig_private.dialogue_manager(uuid),bolig_private.dialogue_manager_active(uuid,uuid),bolig_private.dialogue_mark(bolig_private.resident_portals,uuid,boolean) from public,anon,authenticated,service_role;
create function public.bolig_coordination(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.coordination(p_company_id,p_root_id,p_action,p_payload)$$;
grant execute on function bolig_private.coordination(uuid,uuid,text,jsonb) to authenticated;
revoke all on function public.bolig_coordination(uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.bolig_coordination(uuid,uuid,text,jsonb) to authenticated;
-- Extend only the established portal contract. Guards run on the server too.
do $$declare definition text;anchor text;begin
 definition:=pg_get_functiondef('bolig_private.portal_state(bolig_private.resident_portals)'::regprocedure);
 anchor:=$a$'id',p.id,'menu_version'$a$;
 if position(anchor in definition)=0 then raise exception 'Portal state anchor missing';end if;
 definition:=replace(definition,anchor,$a$'messaging_enabled',bolig_private.dialogue_enabled(p.unit_id),'manager_contact',(select pr.email from public.profiles pr where pr.id=bolig_private.dialogue_manager(p.root_id) and bolig_private.dialogue_manager_active((select company_id from bolig_private.roots where id=p.root_id),pr.id)),'id',p.id,'menu_version'$a$);
 definition:=replace(definition,$a$'status',x.status,'review_note'$a$,$a$'read_at',x.read_at,'handled_at',x.handled_at,'status',x.status,'review_note'$a$);
 execute definition;
 definition:=pg_get_functiondef('bolig_private.resident_portal(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 anchor:=$a$'reply','apply','review'$a$;
 if position(anchor in definition)=0 then raise exception 'Portal actions anchor missing';end if;
 definition:=replace(definition,anchor,$a$'reply','apply','review','read','handled'$a$);
 anchor:=$a$if action='offer' then$a$;
 if position(anchor in definition)=0 then raise exception 'Portal command anchor missing';end if;
 definition:=replace(definition,anchor,$a$if action in('read','handled') then
   perform bolig_private.dialogue_mark(p,(payload->>'through_id')::uuid,action='handled');
  elsif action='offer' then$a$);
 anchor:=$a$elsif action='reply' then$a$;
 definition:=replace(definition,anchor,anchor||$a$
   if not bolig_private.dialogue_enabled(unit) then raise exception 'Meldinger er slått av for boligen.' using errcode='22023';end if;
   if nullif(payload->>'through_id','') is not null then perform bolig_private.dialogue_mark(p,(payload->>'through_id')::uuid,true);end if;$a$);
 execute definition;
 definition:=pg_get_functiondef('bolig_resident_private.portal(text,text,jsonb)'::regprocedure);
 anchor:=$a$else
   if length(coalesce(note,'')) not between 2 and 2000$a$;
 if position(anchor in definition)=0 then raise exception 'Resident message anchor missing';end if;
 definition:=replace(definition,anchor,$a$else
   if not bolig_private.dialogue_enabled(p.unit_id) then raise exception 'Meldinger er slått av. Kontakt prosjektleder direkte.' using errcode='22023';end if;
   if length(coalesce(note,'')) not between 2 and 2000$a$);
 execute definition;
end$$;
notify pgrst,'reload schema';
-- Message notifications share the existing Bolig transport gate, token and retry
-- worker, but never contain message text. Enabling transport does not mail history.
create table bolig_private.dialogue_deliveries(
 id uuid primary key default gen_random_uuid(),portal_id uuid not null references bolig_private.resident_portals(id),
 event_id uuid not null references bolig_private.resident_events(id),kind text not null check(kind in('manager_message','resident_message')),
 recipient text not null,manager_id uuid,contact_basis text not null,
 status text not null default 'pending' check(status in('pending','sending','accepted','suppressed')),
 attempt uuid,attempts int not null default 0,reserved_at timestamptz,first_attempt_at timestamptz,accepted_at timestamptz,
 available_at timestamptz not null,link text,unique(portal_id,kind,event_id,recipient)
);
create index bolig_dialogue_queue on bolig_private.dialogue_deliveries(available_at,id) where status in('pending','sending');
create index bolig_dialogue_queue_event on bolig_private.dialogue_deliveries(event_id);
create table bolig_private.dialogue_links(token_hash bytea primary key,portal_id uuid not null references bolig_private.resident_portals(id),contact_basis text not null,expires_at timestamptz not null);
create index bolig_dialogue_link_portal on bolig_private.dialogue_links(portal_id);
alter table bolig_private.dialogue_deliveries enable row level security;
alter table bolig_private.dialogue_links enable row level security;
revoke all on bolig_private.dialogue_deliveries,bolig_private.dialogue_links from public,anon,authenticated,service_role;
create table bolig_private.dialogue_mail_settings(singleton boolean primary key default true check(singleton),portal_origin text not null default 'https://expo-proffdok.app');
insert into bolig_private.dialogue_mail_settings(singleton) values(true);
alter table bolig_private.dialogue_mail_settings enable row level security;
revoke all on bolig_private.dialogue_mail_settings from public,anon,authenticated,service_role;
create function bolig_private.dialogue_live(p bolig_private.resident_portals) returns boolean language sql stable set search_path='' as $$
 select not p.revoked and p.expires_at>now() and bolig_private.dialogue_enabled(p.unit_id) and exists(
 select 1 from bolig_private.units u join bolig_private.roots r on r.id=u.root_id join bolig_private.firms f on f.company_id=r.company_id
 join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
 where u.id=p.unit_id and f.enabled and not r.archived and not u.archived and not e.archived and not b.archived and p.contact_basis=md5(jsonb_build_array(u.contact_name,u.contact_email)::text))
$$;
create function bolig_private.dialogue_tick() returns void language plpgsql set search_path='' as $$
begin
 if not exists(select 1 from bolig_private.progress_mail_settings where singleton and enabled and enabled_since is not null) then return;end if;
 insert into bolig_private.dialogue_deliveries(portal_id,event_id,kind,recipient,manager_id,contact_basis,available_at)
 select p.id,v.id,case when v.sender='resident' then 'manager_message' else 'resident_message' end,
 case when v.sender='resident' then pr.email else u.contact_email end,
 case when v.sender='resident' then pr.id else null end,p.contact_basis,v.created_at+interval '2 minutes'
 from bolig_private.resident_portals p join bolig_private.units u on u.id=p.unit_id join bolig_private.roots r on r.id=p.root_id
 join bolig_private.progress_mail_settings cfg on cfg.singleton and cfg.enabled and cfg.enabled_since is not null
 join public.profiles pr on pr.id=bolig_private.dialogue_manager(p.root_id)
 join lateral(select * from bolig_private.resident_events ev where ev.portal_id=p.id and ev.contact_basis=p.contact_basis and ev.kind in('message','reply') order by ev.created_at desc,ev.id desc limit 1) v on true
 where bolig_private.dialogue_live(p) and bolig_private.dialogue_manager_active(r.company_id,pr.id) and v.created_at>=cfg.enabled_since
 and (v.sender='manager' or (v.read_at is null and v.handled_at is null))
 on conflict do nothing;
 -- Retain a short bounded lifetime for notification capabilities.
 delete from bolig_private.dialogue_links where expires_at<now()-interval '1 day';
end$$;
create function bolig_private.dialogue_delivery_valid(d bolig_private.dialogue_deliveries) returns boolean language sql stable set search_path='' as $$
 select exists(select 1 from bolig_private.resident_portals p join bolig_private.units u on u.id=p.unit_id join bolig_private.roots r on r.id=p.root_id
 join bolig_private.resident_events v on v.id=d.event_id
 join bolig_private.progress_mail_settings cfg on cfg.singleton and cfg.enabled and cfg.enabled_since is not null
 where p.id=d.portal_id and bolig_private.dialogue_live(p) and p.contact_basis=d.contact_basis and v.created_at>=cfg.enabled_since
 and v.contact_basis=p.contact_basis and v.portal_id=p.id and not exists(select 1 from bolig_private.resident_events later where later.portal_id=p.id and later.contact_basis=p.contact_basis and later.kind in('message','reply') and (later.created_at,later.id)>(v.created_at,v.id))
 and case when d.kind='manager_message' then v.sender='resident' and v.read_at is null and v.handled_at is null and d.manager_id=bolig_private.dialogue_manager(p.root_id)
 and bolig_private.dialogue_manager_active(r.company_id,d.manager_id) and d.recipient=(select email from public.profiles where id=d.manager_id)
 else v.sender='manager' and d.recipient=u.contact_email end)
$$;
-- Reuse the existing service-only worker endpoints without broadening grants.
alter function public.bolig_progress_worker_reserve() set schema bolig_private;
alter function bolig_private.bolig_progress_worker_reserve() rename to reserve_before_dialogue;
alter function public.bolig_progress_worker_validate(uuid,uuid) set schema bolig_private;
alter function bolig_private.bolig_progress_worker_validate(uuid,uuid) rename to validate_before_dialogue;
alter function public.bolig_progress_worker_finish(uuid,uuid,boolean) set schema bolig_private;
alter function bolig_private.bolig_progress_worker_finish(uuid,uuid,boolean) rename to finish_before_dialogue;
revoke all on function bolig_private.reserve_before_dialogue(),bolig_private.validate_before_dialogue(uuid,uuid),bolig_private.finish_before_dialogue(uuid,uuid,boolean) from public,anon,authenticated,service_role;
create function public.bolig_progress_worker_reserve() returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;d bolig_private.dialogue_deliveries%rowtype;p bolig_private.resident_portals%rowtype;raw text;origin text;
begin
 result:=bolig_private.reserve_before_dialogue();if result is not null then return result;end if;
 if not exists(select 1 from bolig_private.progress_mail_settings where singleton and enabled and enabled_since is not null) then return null;end if;
 perform bolig_private.dialogue_tick();
 select * into d from bolig_private.dialogue_deliveries where (status='pending' and available_at<=now()) or(status='sending' and reserved_at<now()-interval '5 minutes') order by available_at,id for update skip locked limit 1;
 if not found then return null;end if;
 if not bolig_private.dialogue_delivery_valid(d) or d.recipient !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(d.recipient)>254 or d.attempts>=8 or d.first_attempt_at<now()-interval '23 hours' then update bolig_private.dialogue_deliveries set status='suppressed' where id=d.id;return jsonb_build_object('suppressed',true);end if;
 select portal_origin into origin from bolig_private.dialogue_mail_settings where singleton;
 if origin not in('https://expo-proffdok.app','https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app','https://expo-proffdok-git-demo-ringside.vercel.app') then raise exception 'Ukjent portalvert.' using errcode='22023';end if;
 if d.link is null then
  if d.kind='resident_message' then
   select * into p from bolig_private.resident_portals where id=d.portal_id;
   raw:=encode(sha256(convert_to(gen_random_uuid()::text||gen_random_uuid()::text,'UTF8')),'hex');
   insert into bolig_private.dialogue_links values(sha256(convert_to(raw,'UTF8')),p.id,p.contact_basis,least(p.expires_at,now()+interval '7 days'));
   d.link:=origin||'/bolig-kunde.html#portal='||raw;
  else d.link:=origin;end if;
 end if;
 update bolig_private.dialogue_deliveries set status='sending',attempt=gen_random_uuid(),attempts=attempts+1,reserved_at=now(),first_attempt_at=coalesce(first_attempt_at,now()),link=d.link where id=d.id returning * into d;
 return jsonb_build_object('id',d.id,'attempt',d.attempt,'to',d.recipient,'kind',d.kind,'url',d.link);
end$$;
create function public.bolig_progress_worker_validate(p_id uuid,p_attempt uuid) returns boolean language sql stable security definer set search_path='' as $$
 select bolig_private.validate_before_dialogue(p_id,p_attempt) or exists(select 1 from bolig_private.dialogue_deliveries d where d.id=p_id and d.attempt=p_attempt and d.status='sending' and d.reserved_at>now()-interval '5 minutes' and bolig_private.dialogue_delivery_valid(d))
$$;
create function public.bolig_progress_worker_finish(p_id uuid,p_attempt uuid,p_accepted boolean) returns boolean language plpgsql security definer set search_path='' as $$
begin
 if p_accepted is null then return false;end if;
 if bolig_private.finish_before_dialogue(p_id,p_attempt,p_accepted) then return true;end if;
 update bolig_private.dialogue_deliveries set status=case when p_accepted then 'accepted' else 'pending' end,accepted_at=case when p_accepted then now() else null end,available_at=now()+interval '15 minutes' where id=p_id and attempt=p_attempt and status='sending';return found;
end$$;
revoke all on function public.bolig_progress_worker_reserve(),public.bolig_progress_worker_validate(uuid,uuid),public.bolig_progress_worker_finish(uuid,uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function public.bolig_progress_worker_reserve(),public.bolig_progress_worker_validate(uuid,uuid),public.bolig_progress_worker_finish(uuid,uuid,boolean) to service_role;
-- A notification link resolves only to its original, still-current contact.
create function bolig_private.dialogue_link_portal(token text) returns uuid language sql stable set search_path='' as $$
 select l.portal_id from bolig_private.dialogue_links l join bolig_private.resident_portals p on p.id=l.portal_id
 where l.token_hash=sha256(convert_to(token,'UTF8')) and l.expires_at>now() and l.contact_basis=p.contact_basis and bolig_private.dialogue_live(p)
$$;
revoke all on function bolig_private.dialogue_live(bolig_private.resident_portals),bolig_private.dialogue_tick(),bolig_private.dialogue_delivery_valid(bolig_private.dialogue_deliveries),bolig_private.dialogue_link_portal(text) from public,anon,authenticated,service_role;
do $$declare definition text;anchor text;begin
 definition:=pg_get_functiondef('bolig_resident_private.portal(text,text,jsonb)'::regprocedure);
 anchor:=$a$where token_hash=sha256(convert_to(token,'UTF8'))$a$;
 if position(anchor in definition)=0 then raise exception 'Portal token anchor missing';end if;
 definition:=replace(definition,anchor,anchor||$a$ or id=bolig_private.dialogue_link_portal(token)$a$);execute definition;
 definition:=pg_get_functiondef('bolig_private.portal_state(bolig_private.resident_portals)'::regprocedure);
 anchor:=$a$'messaging_enabled',bolig_private.dialogue_enabled(p.unit_id)$a$;
 if position(anchor in definition)=0 then raise exception 'Dialogue status anchor missing';end if;
 definition:=replace(definition,anchor,$a$'message_mail_enabled',coalesce((select enabled and enabled_since is not null from bolig_private.progress_mail_settings where singleton),false),$a$||anchor);execute definition;
end$$;
notify pgrst,'reload schema';

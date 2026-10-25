-- Room quantities refer to a frozen unit choice. They never add goods or alter
-- prices, choice history, or order exclusions. Only the authenticated RPC is exposed.
create table bolig_private.room_content_versions(
 unit_id uuid not null,root_id uuid not null,revision bigint not null,
 source_choice_revision bigint not null,source_rooms_revision bigint not null,
 allocations jsonb not null,created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),primary key(unit_id,revision),
 foreign key(unit_id,root_id) references bolig_private.units(id,root_id),
 foreign key(unit_id,source_choice_revision) references bolig_private.choice_versions(unit_id,revision));
create index bolig_room_content_root on bolig_private.room_content_versions(root_id,unit_id,revision desc);
create index bolig_room_content_unit_root on bolig_private.room_content_versions(unit_id,root_id);
create index bolig_room_content_choice on bolig_private.room_content_versions(unit_id,source_choice_revision);
create index bolig_room_content_actor on bolig_private.room_content_versions(created_by);
alter table bolig_private.room_content_versions enable row level security;
revoke all on bolig_private.room_content_versions from public,anon,authenticated,service_role;

create function bolig_private.room_content(c uuid,root uuid,unit uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
 declare workspace jsonb;ctx jsonb;choice bolig_private.choice_versions%rowtype;latest bolig_private.room_content_versions%rowtype;
 a jsonb;pos integer;rid uuid;qty numeric;nr bigint;normalized jsonb:='[]';pairs text[]:='{}';pair text;room_name text;
 begin
 if action is null or action not in ('get','save') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>150000 then raise exception 'Ugyldig rominnhold.' using errcode='22023';end if;
 -- Reuse fresh company/role/root/unit checks. A root share lock fences structural archive.
 workspace:=bolig_private.rooms_workspace(c,root,unit,'list',null,'{}');ctx:=workspace->'context';
 if action='save' then
  if ctx->>'role'<>'manager' or (workspace->>'root_archived')::boolean then raise exception 'Prosjektleder og aktivt boligprosjekt kreves.' using errcode='42501';end if;
  -- Same lock as choices, then rooms: the checked quantities and room names cannot change during save.
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
  perform pg_advisory_xact_lock(hashtextextended('bolig-rooms:'||unit::text,0));
  workspace:=bolig_private.rooms_workspace(c,root,unit,'list',null,'{}');
 end if;
 select * into choice from bolig_private.choice_versions where unit_id=unit order by revision desc limit 1;
 select * into latest from bolig_private.room_content_versions where unit_id=unit order by revision desc limit 1;
 if action='save' then
  if expected is distinct from coalesce(latest.revision,0) or choice.revision is null or (payload->>'choice_revision')::bigint is distinct from choice.revision or (payload->>'rooms_revision')::bigint is distinct from (workspace->>'revision')::bigint then raise exception 'Varer, rom eller romfordeling er endret. Utkastet er beholdt. Hent siste grunnlag og se over fordelingen.' using errcode='PT409';end if;
  if jsonb_typeof(payload->'allocations') is distinct from 'array' or jsonb_array_length(payload->'allocations')>1000 then raise exception 'Fordel inntil 1000 vareandeler.' using errcode='22023';end if;
  for a in select value from jsonb_array_elements(payload->'allocations') loop
   if jsonb_typeof(a) is distinct from 'object' or jsonb_typeof(a->'position') is distinct from 'number' or (a->>'position')::numeric<>trunc((a->>'position')::numeric) or (a->>'position')::numeric not between 0 and jsonb_array_length(choice.snapshot->'goods')-1 or jsonb_typeof(a->'quantity') is distinct from 'number' or (a->>'quantity')::numeric not between 0.001 and 10000 or (a->>'quantity')::numeric<>round((a->>'quantity')::numeric,3) or jsonb_typeof(a->'room_id') is distinct from 'string' then raise exception 'Kontroller vare, rom og antall med inntil tre desimaler.' using errcode='22023';end if;
   pos:=(a->>'position')::integer;rid:=(a->>'room_id')::uuid;qty:=(a->>'quantity')::numeric;
   select name into room_name from bolig_private.rooms where id=rid and unit_id=unit and root_id=root and not archived;
   if not found then raise exception 'Velg et aktivt rom i denne boligen.' using errcode='42501';end if;
   pair:=pos::text||':'||rid::text;
   if pair=any(pairs) then raise exception 'Samme vare og rom kan bare stå én gang.' using errcode='22023';end if;
   pairs:=array_append(pairs,pair);
   normalized:=normalized||jsonb_build_array(jsonb_build_object('position',pos,'room_id',rid,'room_name',room_name,'quantity',qty));
  end loop;
  if exists(select 1 from jsonb_array_elements(normalized) x group by (x->>'position')::int having sum((x->>'quantity')::numeric)>((choice.snapshot->'goods'->((x->>'position')::int))->>'quantity')::numeric) then raise exception 'Fordelt antall kan ikke overstige antallet i boligvalget.' using errcode='22023';end if;
  select coalesce(jsonb_agg(x order by (x->>'position')::int,x->>'room_id'),'[]') into normalized from jsonb_array_elements(normalized) x;
  nr:=coalesce(latest.revision,0)+1;
  insert into bolig_private.room_content_versions(unit_id,root_id,revision,source_choice_revision,source_rooms_revision,allocations,created_by) values(unit,root,nr,choice.revision,(workspace->>'revision')::bigint,normalized,auth.uid()) returning * into latest;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'room_content',unit,nr);
 end if;
 return workspace||jsonb_build_object('selection',case when choice.revision is null then null else to_jsonb(choice)-'root_id' end,'content',case when latest.revision is null then null else to_jsonb(latest)-'root_id' end);
 end$$;
revoke all on function bolig_private.room_content(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,authenticated,service_role;
grant execute on function bolig_private.room_content(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;
create function public.bolig_room_content(p_company_id uuid,p_root_id uuid,p_unit_id uuid,p_action text default 'get',p_revision bigint default null,p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.room_content(p_company_id,p_root_id,p_unit_id,p_action,p_revision,p_payload);$$;
revoke all on function public.bolig_room_content(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function public.bolig_room_content(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;

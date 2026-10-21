-- Atomic project creation. Existing structure, entities, histories and access gateway stay intact.
alter table bolig_private.blocks
 add column building_type text not null default 'apartment' check(building_type in ('apartment','house','duplex','multi')),
 add column address text not null default '' check(length(address)<=200),
 add column house_floors integer not null default 2 check(house_floors between 1 and 30);
create table bolig_private.creation_receipts(
 company_id uuid not null references public.sales_company_scopes(id),
 actor_id uuid not null references auth.users(id),request_id uuid not null,
 root_id uuid not null references bolig_private.roots(id),payload jsonb not null,
 created_at timestamptz not null default now(),primary key(company_id,actor_id,request_id));
create index bolig_creation_actor on bolig_private.creation_receipts(actor_id);
create index bolig_creation_root on bolig_private.creation_receipts(root_id);
alter table bolig_private.creation_receipts enable row level security;
revoke all on bolig_private.creation_receipts from public,anon,authenticated,service_role;
create function bolig_private.create_plan(c uuid,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb; request_id uuid; previous bolig_private.creation_receipts%rowtype;
 r uuid; b uuid; e uuid; item jsonb; entrance jsonb; counts jsonb; count_value jsonb;
 total int:=0; floor_no int; position_no int; result jsonb; type_name text; address_name text;
begin
 ctx:=bolig_private.context(c);
 if not (ctx->>'enabled')::boolean or ctx->>'role'<>'manager' then raise exception 'Prosjektledertilgang i aktivt firma kreves.' using errcode='42501';end if;
 if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>200000 then raise exception 'Ugyldig prosjektoppsett.' using errcode='22023';end if;
 begin request_id:=(payload->>'request_id')::uuid; exception when invalid_text_representation then raise exception 'Opprettelsen mangler gyldig referanse.' using errcode='22023';end;
 if request_id is null then raise exception 'Opprettelsen mangler referanse.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-plan:'||c::text||':'||auth.uid()::text||':'||request_id::text,0));
 select * into previous from bolig_private.creation_receipts cr where cr.company_id=c and cr.actor_id=auth.uid() and cr.request_id=request_id;
 if found then
  if previous.payload is distinct from payload then raise exception 'Denne opprettelsen har et annet lagret oppsett. Hent prosjektet før du starter et nytt.' using errcode='PT409';end if;
  result:=bolig_private.workspace(c,'get',previous.root_id,null,'{}');
  return result||jsonb_build_object('receipt',jsonb_build_object('request_id',request_id,'root_id',previous.root_id,'created',false));
 end if;
 if jsonb_typeof(payload->'title') is distinct from 'string' or length(trim(payload->>'title')) not between 1 and 160
 or jsonb_typeof(payload->'reference') is distinct from 'string' or length(payload->>'reference')>80 then raise exception 'Fyll inn gyldig prosjektnavn og prosjektnummer.' using errcode='22023';end if;
 if jsonb_typeof(payload->'buildings') is distinct from 'array' then raise exception 'Legg til bygg.' using errcode='22023';end if;
 if jsonb_array_length(payload->'buildings') not between 1 and 100 then raise exception 'Velg 1–100 bygg.' using errcode='22023';end if;
 -- Validate the entire plan before creating anything; every write is in the same transaction.
 for item in select value from jsonb_array_elements(payload->'buildings') loop
  type_name:=item->>'building_type';
  if jsonb_typeof(item) is distinct from 'object' or type_name is null or type_name not in ('apartment','house','duplex','multi')
  or jsonb_typeof(item->'name') is distinct from 'string' or length(trim(item->>'name')) not between 1 and 100
  or jsonb_typeof(item->'address') is distinct from 'string' or length(trim(item->>'address')) not between 1 and 200
  or jsonb_typeof(item->'house_floors') is distinct from 'number' or (item->>'house_floors') !~ '^([1-9]|[12][0-9]|30)$'
  then raise exception 'Se over byggnavn, boligtype, adresse og etasjer.' using errcode='22023';end if;
  if jsonb_typeof(item->'entrances') is distinct from 'array' then raise exception 'Legg til boligfordeling.' using errcode='22023';end if;
  if jsonb_array_length(item->'entrances') not between 1 and 100 or (type_name<>'apartment' and jsonb_array_length(item->'entrances')<>1) then raise exception 'Se over antall oppganger.' using errcode='22023';end if;
  for entrance in select value from jsonb_array_elements(item->'entrances') loop
   if jsonb_typeof(entrance) is distinct from 'object' or jsonb_typeof(entrance->'address') is distinct from 'string' or length(trim(entrance->>'address')) not between 1 and 200 then raise exception 'Fyll inn adresse for hver oppgang.' using errcode='22023';end if;
   counts:=entrance->'counts';
   if jsonb_typeof(counts) is distinct from 'array' then raise exception 'Fyll inn boligantall per etasje.' using errcode='22023';end if;
   if jsonb_array_length(counts) not between 1 and 30 then raise exception 'Velg 1–30 etasjer.' using errcode='22023';end if;
   if type_name='house' and counts<>'[1]'::jsonb then raise exception 'En enebolig skal ha én husstand.' using errcode='22023';end if;
   for count_value in select value from jsonb_array_elements(counts) loop
    if jsonb_typeof(count_value) is distinct from 'number' or count_value::text !~ '^([1-9]|1[0-9]|20)$' then raise exception 'Velg 1–20 boliger per etasje.' using errcode='22023';end if;
    total:=total+(count_value::text)::int;
   end loop;
   if type_name='duplex' and (select sum(value::text::int) from jsonb_array_elements(counts))<>2 then raise exception 'En tomannsbolig skal ha to boliger.' using errcode='22023';end if;
  end loop;
 end loop;
 if total>2000 then raise exception 'Maksimalt 2 000 boliger per hovedprosjekt.' using errcode='22023';end if;
 insert into bolig_private.roots(company_id,title,reference,created_by) values(c,trim(payload->>'title'),trim(payload->>'reference'),auth.uid()) returning id into r;
 for item in select value from jsonb_array_elements(payload->'buildings') loop
  insert into bolig_private.blocks(root_id,name,building_type,address,house_floors) values(r,trim(item->>'name'),item->>'building_type',trim(item->>'address'),(item->>'house_floors')::int) returning id into b;
  for entrance in select value from jsonb_array_elements(item->'entrances') loop
   counts:=entrance->'counts';
   insert into bolig_private.entrances(root_id,block_id,address,counts) values(r,b,trim(entrance->>'address'),counts) returning id into e;
   for floor_no in 1..jsonb_array_length(counts) loop
    for position_no in 1..(counts->>(floor_no-1))::int loop
     insert into bolig_private.units(root_id,entrance_id,floor,position,number) values(r,e,floor_no,position_no,case when item->>'building_type'='house' then 'Bolig' else 'H'||lpad(floor_no::text,2,'0')||lpad(position_no::text,2,'0') end);
    end loop;
   end loop;
  end loop;
 end loop;
 insert into bolig_private.creation_receipts(company_id,actor_id,request_id,root_id,payload) values(c,auth.uid(),request_id,r,payload);
 insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,r,auth.uid(),'create_plan',r,1);
 result:=bolig_private.workspace(c,'get',r,null,'{}');
 return result||jsonb_build_object('receipt',jsonb_build_object('request_id',request_id,'root_id',r,'created',true));
end$$;
revoke all on function bolig_private.create_plan(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function bolig_private.create_plan(uuid,jsonb) to authenticated;
create or replace function public.bolig_workspace(p_company_id uuid default null,p_action text default 'context',p_root_id uuid default null,p_revision bigint default null,p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$
 select case when p_action='create_plan' then bolig_private.create_plan(coalesce(p_company_id,public.current_active_company_scope_id()),p_payload)
 else bolig_private.workspace(coalesce(p_company_id,public.current_active_company_scope_id()),p_action,p_root_id,p_revision,p_payload) end;
$$;

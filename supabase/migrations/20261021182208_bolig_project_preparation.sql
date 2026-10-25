-- Project preparation is atomic, previewed and replay-safe. Existing immutable
-- choices/orders remain authoritative; bulk templates only fill missing scopes.
alter table bolig_private.units add column official_number text not null default '' check(length(official_number)<=40);
create unique index bolig_units_official_number on bolig_private.units(entrance_id,official_number) where official_number<>'';
create table bolig_private.room_templates(
 id uuid primary key,root_id uuid not null references bolig_private.roots(id),
 name text not null check(length(trim(name)) between 1 and 100),definition jsonb not null,
 revision bigint not null default 1,changed_by uuid not null references auth.users(id),changed_at timestamptz not null default now(),unique(root_id,name));
create index bolig_room_templates_root on bolig_private.room_templates(root_id,id);
create index bolig_room_templates_actor on bolig_private.room_templates(changed_by);
create table bolig_private.preparation_receipts(
 root_id uuid not null references bolig_private.roots(id),actor_id uuid not null references auth.users(id),request_id uuid not null,
 payload jsonb not null,result jsonb not null,created_at timestamptz not null default now(),primary key(root_id,actor_id,request_id));
create index bolig_preparation_receipts_actor on bolig_private.preparation_receipts(actor_id);
alter table bolig_private.room_templates enable row level security;
alter table bolig_private.preparation_receipts enable row level security;
revoke all on bolig_private.room_templates,bolig_private.preparation_receipts from public,anon,authenticated,service_role;

create function bolig_private.preparation_basis(root uuid) returns jsonb language sql set search_path='' as $$
 select jsonb_build_object('structure_revision',r.revision,'catalog_revision',coalesce((select revision from bolig_private.catalog_states where root_id=root),0),
 'content',md5(coalesce((select jsonb_agg(jsonb_build_array(u.id,coalesce(s.revision,0),coalesce(v.revision,0)) order by u.id)::text
 from bolig_private.units u left join bolig_private.room_states s on s.unit_id=u.id
 left join lateral(select revision from bolig_private.choice_versions where unit_id=u.id order by revision desc limit 1) v on true where u.root_id=root), '[]')),
 'templates',md5(coalesce((select jsonb_agg(jsonb_build_array(id,revision) order by id)::text from bolig_private.room_templates where root_id=root),'[]')))
 from bolig_private.roots r where r.id=root;
$$;
revoke all on function bolig_private.preparation_basis(uuid) from public,anon,authenticated,service_role;

create function bolig_private.preparation(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;basis jsonb;data jsonb;kind text;entry jsonb;row_data jsonb;definition jsonb;
 request_id uuid;prior bolig_private.preparation_receipts%rowtype;result jsonb;proposal jsonb:='[]';
 b bolig_private.blocks%rowtype;e bolig_private.entrances%rowtype;u bolig_private.units%rowtype;room bolig_private.rooms%rowtype;
 t_id uuid;room_id uuid;unit_id uuid;selected uuid[];seen uuid[]:='{}';counts jsonb;count_value jsonb;households int;f int;p int;
 add_count int;hide_count int;restore_count int;room_adds jsonb;parts jsonb;state jsonb;part jsonb;snapshot jsonb;
 rooms_revision bigint;choice_revision bigint;catalog_revision bigint;goods_count int;why text;status text;existing boolean;
 new_name text;old_name text;temp_name text;official text;affected int:=0;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not (ctx->>'enabled')::boolean then raise exception 'Boligprosjekter er ikke tilgjengelig.' using errcode='42501';end if;
 if action is null or action not in ('get','preview','save','template_save') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>500000 then raise exception 'Ugyldig klargjøring.' using errcode='22023';end if;
 if action<>'get' and payload->>'intent' is distinct from action then raise exception 'Lagringshandlingen er endret. Se over oppsettet.' using errcode='22023';end if;
 -- Match workspace get's existing UPDATE lock directly; avoid SHARE->UPDATE
 -- upgrades between concurrent reads. Every writer takes root before child locks.
 select * into r from bolig_private.roots where id=root and company_id=c for update;
 if not found then raise exception 'Prosjektet tilhører ikke aktivt firma.' using errcode='42501';end if;
 if action<>'get' and (ctx->>'role'<>'manager' or r.archived) then raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
 if action in ('save','template_save') then
  request_id:=(payload->>'request_id')::uuid;
  if request_id is null then raise exception 'Lagringen mangler kvitteringsreferanse.' using errcode='22023';end if;
  select * into prior from bolig_private.preparation_receipts where root_id=root and actor_id=auth.uid() and preparation_receipts.request_id=(payload->>'request_id')::uuid;
  if found then
   if prior.payload is distinct from payload then raise exception 'Kvitteringen gjelder et annet oppsett.' using errcode='PT409';end if;
   return prior.result||jsonb_build_object('context',ctx,'replayed',true);
  end if;
 end if;
 basis:=bolig_private.preparation_basis(root);catalog_revision:=(basis->>'catalog_revision')::bigint;
 if action='get' then
  result:=bolig_private.workspace(c,'get',root,null,'{}');
  return result||jsonb_build_object('root_id',root,'basis',basis,
   'templates',coalesce((select jsonb_agg(to_jsonb(t) order by name,id) from bolig_private.room_templates t where root_id=root),'[]'),
   'packages',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'line_count',jsonb_array_length(lines)) order by name,id) from bolig_private.packages where root_id=root and not archived),'[]'),
   'unit_states',coalesce((select jsonb_agg(jsonb_build_object('unit_id',unit_row.id,'rooms',coalesce(s.revision,0),'choice',coalesce(v.revision,0)) order by unit_row.id) from bolig_private.units unit_row left join bolig_private.room_states s on s.unit_id=unit_row.id left join lateral(select cv.revision from bolig_private.choice_versions cv where cv.unit_id=unit_row.id order by cv.revision desc limit 1) v on true where unit_row.root_id=root),'[]'));
 end if;
 if payload->'basis' is distinct from basis then raise exception 'Prosjektet, rommene eller pakkene er endret. Hent siste grunnlag og forhåndsvis på nytt. Kladden er beholdt.' using errcode='PT409';end if;
 data:=payload->'data';kind:=payload->>'kind';
 if jsonb_typeof(data) is distinct from 'object' or kind is null or kind not in ('numbering','building','template') or (action='template_save' and kind<>'template') then raise exception 'Velg oppgave.' using errcode='22023';end if;

 if kind='numbering' then
  if jsonb_typeof(data->'rows') is distinct from 'array' or jsonb_array_length(data->'rows') not between 1 and 2000 then raise exception 'Velg 1–2000 boliger.' using errcode='22023';end if;
  for entry in select value from jsonb_array_elements(data->'rows') loop
   unit_id:=(entry->>'id')::uuid;
   select x.* into u from bolig_private.units x join bolig_private.entrances en on en.id=x.entrance_id join bolig_private.blocks bl on bl.id=en.block_id where x.id=unit_id and x.root_id=root and not x.archived and not en.archived and not bl.archived;
   if not found or unit_id=any(seen) then raise exception 'Velg hver aktiv bolig én gang i dette prosjektet.' using errcode='42501';end if;seen:=array_append(seen,unit_id);
   new_name:=trim(entry->>'number');official:=upper(trim(entry->>'official_number'));
   if jsonb_typeof(entry->'number') is distinct from 'string' or length(new_name) not between 1 and 60 or jsonb_typeof(entry->'official_number') is distinct from 'string' or length(official)>40 then raise exception 'Fyll inn leilighetsnummer på 1–60 tegn og eventuelt offisielt bolignummer på inntil 40 tegn.' using errcode='22023';end if;
   proposal:=proposal||jsonb_build_array(jsonb_build_object('id',unit_id,'entrance_id',u.entrance_id,'before',u.number,'number',new_name,'official_before',u.official_number,'official_number',official,'status',case when new_name=u.number and official=u.official_number then 'unchanged' else 'ready' end));
  end loop;
  -- Validate final names, including archived/untargeted units. Swaps are allowed.
  if exists(select 1 from bolig_private.units x left join jsonb_array_elements(proposal) v on (v->>'id')::uuid=x.id where x.root_id=root group by x.entrance_id,coalesce(v->>'number',x.number) having count(*)>1)
   or exists(select 1 from bolig_private.units x left join jsonb_array_elements(proposal) v on (v->>'id')::uuid=x.id where x.root_id=root and coalesce(v->>'official_number',x.official_number)<>'' group by x.entrance_id,coalesce(v->>'official_number',x.official_number) having count(*)>1)
   then raise exception 'To boliger i samme oppgang har samme nummer. Kontroller også skjulte boliger.' using errcode='23505';end if;
  if action='save' then
   -- Temporary unique labels make non-deferrable index swaps safe inside this transaction.
   for entry in select value from jsonb_array_elements(proposal) where value->>'status'='ready' loop
    loop
     temp_name:='~preparation:'||gen_random_uuid()::text;
     exit when not exists(select 1 from bolig_private.units where entrance_id=(entry->>'entrance_id')::uuid and (number=temp_name or official_number=temp_name));
    end loop;
    update bolig_private.units set number=temp_name,official_number='' where id=(entry->>'id')::uuid;
   end loop;
   for entry in select value from jsonb_array_elements(proposal) where value->>'status'='ready' loop
    update bolig_private.units set number=entry->>'number',official_number=entry->>'official_number' where id=(entry->>'id')::uuid;affected:=affected+1;
   end loop;
  end if;
 elsif kind='building' then
  select * into b from bolig_private.blocks where id=(data->>'id')::uuid and root_id=root and not archived;
  if not found then raise exception 'Velg et aktivt bygg i dette prosjektet.' using errcode='42501';end if;
  select * into e from bolig_private.entrances where id=(data->>'entrance_id')::uuid and block_id=b.id and root_id=root and not archived;
  if not found then raise exception 'Velg en aktiv oppgang i bygget.' using errcode='42501';end if;
  if jsonb_typeof(data->'name') is distinct from 'string' or length(trim(data->>'name')) not between 1 and 100 or jsonb_typeof(data->'address') is distinct from 'string' or length(trim(data->>'address')) not between 1 and 200
   or jsonb_typeof(data->'entrance_address') is distinct from 'string' or length(trim(data->>'entrance_address')) not between 1 and 200
   or coalesce(data->>'building_type','') not in ('apartment','house','duplex','multi') or coalesce(data->>'house_floors','') !~ '^([1-9]|[12][0-9]|30)$' then raise exception 'Se over byggnavn, type, adresser og etasjer.' using errcode='22023';end if;
  counts:=data->'counts';
  if jsonb_typeof(counts) is distinct from 'array' or jsonb_array_length(counts) not between 1 and 30 then raise exception 'Velg 1–30 etasjer.' using errcode='22023';end if;
  households:=0;
  for count_value in select value from jsonb_array_elements(counts) loop
   if jsonb_typeof(count_value)<>'number' or count_value::text !~ '^([1-9]|1[0-9]|20)$' then raise exception 'Velg 1–20 boliger per etasje.' using errcode='22023';end if;
   households:=households+count_value::text::int;
  end loop;
  if data->>'building_type'<>'apartment' and (select count(*) from bolig_private.entrances where block_id=b.id)<>1 then raise exception 'Bygg med flere oppganger må beholde typen Leilighetsbygg.' using errcode='22023';end if;
  if (data->>'building_type'='house' and counts<>'[1]'::jsonb) or (data->>'building_type'='duplex' and households<>2) then raise exception 'Enebolig skal ha én bolig og tomannsbolig to. Etasjer i huset er et eget felt.' using errcode='22023';end if;
  if exists(select 1 from bolig_private.blocks where root_id=root and id<>b.id and name=trim(data->>'name')) or exists(select 1 from bolig_private.entrances where root_id=root and id<>e.id and address=trim(data->>'entrance_address')) then raise exception 'Byggnavn eller oppgangens adresse finnes allerede.' using errcode='23505';end if;
  select count(*) filter(where counts->>(x.floor-1) is null or x.position>(counts->>(x.floor-1))::int) into hide_count from bolig_private.units x where entrance_id=e.id and not archived;
  add_count:=0;restore_count:=0;
  for f in 1..jsonb_array_length(counts) loop
   for p in 1..(counts->>(f-1))::int loop
    select * into u from bolig_private.units where entrance_id=e.id and floor=f and position=p;
    if not found then
     add_count:=add_count+1;
     new_name:='H'||lpad(f::text,2,'0')||lpad(p::text,2,'0');
     if exists(select 1 from bolig_private.units where entrance_id=e.id and number=new_name) then raise exception 'Et nytt automatisk nummer finnes allerede. Rett nummereringen før utvidelse.' using errcode='23505';end if;
    elsif u.archived then restore_count:=restore_count+1;end if;
   end loop;
  end loop;
  if (select count(*) from bolig_private.units where root_id=root)+add_count>2000 then raise exception 'Inntil 2000 boliger inkludert skjulte.' using errcode='22023';end if;
  proposal:=jsonb_build_array(jsonb_build_object('id',b.id,'name',trim(data->>'name'),'before',b.name,'added',add_count,'hidden',hide_count,'restored',restore_count,'households',households,'status','ready'));
  if action='save' then
   update bolig_private.blocks set name=trim(data->>'name'),address=trim(data->>'address'),building_type=data->>'building_type',house_floors=(data->>'house_floors')::int where id=b.id;
   -- Existing resize reuses stable unit IDs and preserves all contacts/history.
   perform bolig_private.workspace(c,'resize',root,r.revision,jsonb_build_object('id',e.id,'address',trim(data->>'entrance_address'),'counts',counts));
   affected:=1;
  end if;
 elsif kind='template' then
  definition:=data->'definition';
  if jsonb_typeof(definition) is distinct from 'object' or jsonb_typeof(definition->'rooms') is distinct from 'array' or jsonb_array_length(definition->'rooms')>60 then raise exception 'Velg inntil 60 rom i malen.' using errcode='22023';end if;
  seen:='{}';
  for entry in select value from jsonb_array_elements(definition->'rooms') loop
   t_id:=(entry->>'key')::uuid;
   if t_id is null or t_id=any(seen) or coalesce(entry->>'type','') not in ('bathroom','laundry','wc','technical','other') or jsonb_typeof(entry->'name') is distinct from 'string' or length(trim(entry->>'name')) not between 1 and 80 or jsonb_typeof(entry->'floor') is distinct from 'string' or length(entry->>'floor')>40 then raise exception 'Se over romtype, navn og etasje i malen.' using errcode='22023';end if;seen:=array_append(seen,t_id);
   if nullif(entry->>'package_id','') is not null then perform bolig_private.package_snapshot(root,(entry->>'package_id')::uuid,'[]',catalog_revision);end if;
  end loop;
  if exists(select 1 from jsonb_array_elements(definition->'rooms') x group by lower(trim(x->>'name')) having count(*)>1) then raise exception 'Rommene i malen må ha ulike navn.' using errcode='23505';end if;
  if nullif(definition->>'common_package_id','') is not null then perform bolig_private.package_snapshot(root,(definition->>'common_package_id')::uuid,'[]',catalog_revision);end if;
  if jsonb_array_length(definition->'rooms')=0 and nullif(definition->>'common_package_id','') is null then raise exception 'Legg til rom eller velg fellespakke.' using errcode='22023';end if;
  if action='template_save' then
   t_id:=(data->>'id')::uuid;
   if t_id is null or jsonb_typeof(data->'name') is distinct from 'string' or length(trim(data->>'name')) not between 1 and 100 then raise exception 'Gi rommalen et navn.' using errcode='22023';end if;
   if exists(select 1 from bolig_private.room_templates where id=t_id and root_id<>root) then raise exception 'Malen er ikke tilgjengelig.' using errcode='42501';end if;
   insert into bolig_private.room_templates(id,root_id,name,definition,changed_by) values(t_id,root,trim(data->>'name'),definition,auth.uid()) on conflict(id) do update set name=excluded.name,definition=excluded.definition,revision=bolig_private.room_templates.revision+1,changed_by=auth.uid(),changed_at=now();
   proposal:=jsonb_build_array(jsonb_build_object('id',t_id,'name',trim(data->>'name'),'status','ready'));affected:=1;
  else
   if jsonb_typeof(data->'unit_ids') is distinct from 'array' or jsonb_array_length(data->'unit_ids') not between 1 and 500 or jsonb_typeof(data->'include_existing') is distinct from 'boolean' then raise exception 'Velg 1–500 boliger og hvordan eksisterende innhold skal håndteres.' using errcode='22023';end if;
   select array_agg(value::uuid order by value::uuid) into selected from jsonb_array_elements_text(data->'unit_ids');
   if cardinality(selected)<>(select count(distinct x) from unnest(selected) x) then raise exception 'Velg hver bolig én gang.' using errcode='22023';end if;
   foreach unit_id in array selected loop
    select x.* into u from bolig_private.units x join bolig_private.entrances en on en.id=x.entrance_id join bolig_private.blocks bl on bl.id=en.block_id where x.id=unit_id and x.root_id=root and not x.archived and not en.archived and not bl.archived;
    if not found then raise exception 'En valgt bolig er ikke aktiv i dette prosjektet.' using errcode='42501';end if;
    state:=bolig_private.package_choices(c,root,unit_id,'get',null,'{}');choice_revision:=coalesce((state->'selection'->>'revision')::bigint,0);rooms_revision:=(state->>'rooms_revision')::bigint;
    existing:=choice_revision>0 or jsonb_array_length(state->'rooms')>0;
    why:='';status:='ready';room_adds:='[]';parts:='[]';goods_count:=coalesce(jsonb_array_length(state->'selection'->'snapshot'->'goods'),0);
    if existing and not (data->>'include_existing')::boolean then status:='skipped';why:='Har egne rom eller boligvalg. Beholdes.';
    else
     for entry in select value from jsonb_array_elements(definition->'rooms') loop
      select * into room from bolig_private.rooms where rooms.unit_id=unit_id and lower(trim(name))=lower(trim(entry->>'name')) order by archived,id limit 1;
      if found then
       if room.archived or room.type<>entry->>'type' then status:='review';why:='Romnavn finnes med annen type eller i arkivet. Se over boligen først.';exit;end if;
       room_id:=room.id;
      else
       room_id:=md5(unit_id::text||':'||(entry->>'key'))::uuid;
       if exists(select 1 from bolig_private.rooms where id=room_id) then status:='review';why:='Et rom fra denne malen er omdøpt eller arkivert. Se over boligen først.';exit;end if;
       room_adds:=room_adds||jsonb_build_array(entry||jsonb_build_object('id',room_id));
      end if;
      if nullif(entry->>'package_id','') is not null and not exists(select 1 from jsonb_array_elements(state->'components') x where x->>'scope_id'=room_id::text) then
       snapshot:=bolig_private.package_snapshot(root,(entry->>'package_id')::uuid,'[]',catalog_revision);
       goods_count:=goods_count+jsonb_array_length(snapshot->'goods');
       parts:=parts||jsonb_build_array(jsonb_build_object('scope_id',room_id,'package_id',entry->>'package_id','room_name',entry->>'name'));
      end if;
     end loop;
     if nullif(definition->>'common_package_id','') is not null and not exists(select 1 from jsonb_array_elements(state->'components') x where x->>'scope_id'='common') then
      snapshot:=bolig_private.package_snapshot(root,(definition->>'common_package_id')::uuid,'[]',catalog_revision);goods_count:=goods_count+jsonb_array_length(snapshot->'goods');
      parts:=parts||jsonb_build_array(jsonb_build_object('scope_id','common','package_id',definition->>'common_package_id','room_name','Felles for boligen'));
     end if;
     if jsonb_array_length(state->'rooms')+jsonb_array_length(room_adds)>60 or goods_count>1000 then status:='review';why:='For mange rom eller varelinjer. Se over boligen først.';end if;
     if status='ready' and jsonb_array_length(room_adds)=0 and jsonb_array_length(parts)=0 then status:='unchanged';why:='Rom og pakker finnes allerede. Egne valg beholdes.';end if;
    end if;
    entry:=jsonb_build_object('id',unit_id,'number',u.number,'entrance_id',u.entrance_id,'status',status,'reason',why,'new_rooms',case when status='ready' then jsonb_array_length(room_adds) else 0 end,'new_packages',case when status='ready' then jsonb_array_length(parts) else 0 end,'goods_count',goods_count,'rooms',room_adds,'parts',parts);
    proposal:=proposal||jsonb_build_array(entry);
    if action='save' and status='ready' then
     for row_data in select value from jsonb_array_elements(room_adds) loop
      perform bolig_private.rooms_workspace(c,root,unit_id,'save',rooms_revision,row_data);rooms_revision:=rooms_revision+1;
     end loop;
     for row_data in select value from jsonb_array_elements(parts) loop
      perform bolig_private.package_choices(c,root,unit_id,'save',choice_revision,row_data||jsonb_build_object('option_ids','[]'::jsonb,'catalog_revision',catalog_revision,'rooms_revision',rooms_revision));choice_revision:=choice_revision+1;
     end loop;
     affected:=affected+1;
    end if;
   end loop;
  end if;
 end if;
 if action in ('save','template_save') then
  if kind='numbering' and affected>0 then update bolig_private.roots set revision=revision+1,updated_at=now() where id=root;end if;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,revision) values(c,root,auth.uid(),'prepare_'||kind,(select revision from bolig_private.roots where id=root));
 end if;
 result:=jsonb_build_object('context',ctx,'root_id',root,'basis',case when action='preview' then basis else bolig_private.preparation_basis(root) end,'proposal',proposal,'affected',affected,'kind',kind,'receipt',case when action in ('save','template_save') then jsonb_build_object('request_id',request_id,'affected',affected) else null end);
 if action in ('save','template_save') then insert into bolig_private.preparation_receipts(root_id,actor_id,request_id,payload,result) values(root,auth.uid(),request_id,payload,result);end if;
 return result;
end$$;
revoke all on function bolig_private.preparation(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.preparation(uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_prepare(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.preparation(p_company_id,p_root_id,p_action,p_payload);$$;
revoke all on function public.bolig_prepare(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_prepare(uuid,uuid,text,jsonb) to authenticated;

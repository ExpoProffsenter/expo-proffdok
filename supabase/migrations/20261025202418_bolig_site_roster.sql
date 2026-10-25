-- Additive statutory site roster. No existing attendance, portal, HR or mail function changes.
create table bolig_private.site_roster_state(
 root_id uuid primary key references bolig_private.roots(id), revision bigint not null default 0,
 settings jsonb not null default '{}', reviewed_on date, reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz, reviewed_revision bigint);
create table bolig_private.site_roster_employers(
 id uuid primary key, root_id uuid not null references bolig_private.roots(id),
 name text not null, organisation_number text not null default '',
 registration_required boolean not null default true, exemption_reason text not null default '',
 unique(id,root_id), check(length(name) between 1 and 160));
create index site_roster_employers_root on bolig_private.site_roster_employers(root_id);
create unique index site_roster_employer_number on bolig_private.site_roster_employers(root_id,organisation_number) where organisation_number<>'';
create table bolig_private.site_roster_people(
 id uuid primary key, root_id uuid not null references bolig_private.roots(id),
 source_person_id uuid references bolig_private.attendance_people(id),
 source_visit_id uuid references bolig_private.attendance_visits(id), name text not null,
 birth_date date, employer_id uuid, employment_type text not null default 'employed', hirer_id uuid,
 card_status text not null default 'number', card_number text not null default '',
 application_reference text not null default '', starts_on date not null, ends_on date,
 foreign key(employer_id,root_id) references bolig_private.site_roster_employers(id,root_id),
 foreign key(hirer_id,root_id) references bolig_private.site_roster_employers(id,root_id),
 unique(root_id,source_person_id), unique(root_id,source_visit_id),
 check(source_person_id is null or source_visit_id is null),
 check(employment_type in('employed','hired','self_employed')),
 check(card_status in('number','applied')),check(length(name) between 1 and 120),
 check(ends_on is null or ends_on>=starts_on));
create index site_roster_people_root on bolig_private.site_roster_people(root_id,starts_on,ends_on);
create index site_roster_people_employer on bolig_private.site_roster_people(employer_id,root_id);
create index site_roster_people_hirer on bolig_private.site_roster_people(hirer_id,root_id);
create index site_roster_people_source_person on bolig_private.site_roster_people(source_person_id);
create index site_roster_people_source_visit on bolig_private.site_roster_people(source_visit_id);
create unique index site_roster_person_identity on bolig_private.site_roster_people(root_id,lower(name),birth_date,coalesce(employer_id,'00000000-0000-0000-0000-000000000000'::uuid)) where birth_date is not null;
create table bolig_private.site_roster_versions(
 id uuid primary key, root_id uuid not null references bolig_private.roots(id),
 revision bigint not null, actor_id uuid not null references auth.users(id),
 created_at timestamptz not null default clock_timestamp(), day date not null,
 action text not null, payload_hash bytea not null, snapshot jsonb not null,
 unique(root_id,revision));
create index site_roster_versions_day on bolig_private.site_roster_versions(root_id,day,revision desc);
create index site_roster_versions_actor on bolig_private.site_roster_versions(actor_id);
create index site_roster_state_reviewer on bolig_private.site_roster_state(reviewed_by);
do $$declare t text;begin foreach t in array array['site_roster_state','site_roster_employers','site_roster_people','site_roster_versions'] loop
 execute format('alter table bolig_private.%I enable row level security',t);
 execute format('revoke all on bolig_private.%I from public,anon,authenticated,service_role',t);
end loop;end$$;

create function bolig_private.site_roster_text(v jsonb,k text,max_length integer) returns text
language plpgsql immutable set search_path='' as $$declare s text;begin
 if v?k and jsonb_typeof(v->k) not in('string','null') then raise exception 'Ugyldig tekstfelt: %',k using errcode='22023';end if;
 s:=btrim(coalesce(v->>k,''));
 if length(s)>max_length or s ~ '[\x00-\x08\x0B\x0C\x0E-\x1F]' then raise exception 'Teksten er for lang eller inneholder ugyldige tegn: %',k using errcode='22023';end if;
 return s;
end$$;
revoke all on function bolig_private.site_roster_text(jsonb,text,integer) from public,anon,authenticated,service_role;

create function bolig_private.site_roster_payload(root uuid) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('format',1,'root_id',r.id,'project_title',r.title,'project_reference',r.reference,
 'company_name',c.display_name,'revision',coalesce(s.revision,0),
 'site',jsonb_build_object('name',r.title,'address',coalesce((select string_agg(e.address,', ' order by e.address) from bolig_private.entrances e where e.root_id=r.id and not e.archived),''),'client_name','','keeper_name','','ended_on',null)||coalesce(s.settings,'{}'),
 'review',jsonb_build_object('day',s.reviewed_on,'by',s.reviewed_by,'at',s.reviewed_at,'revision',s.reviewed_revision,'name',(select p.email from public.profiles p where p.id=s.reviewed_by)),
 'employers',coalesce((select jsonb_agg(to_jsonb(e)-'root_id' order by e.name,e.id) from bolig_private.site_roster_employers e where e.root_id=r.id),'[]'),
 'people',coalesce((select jsonb_agg(to_jsonb(p)-'root_id' order by p.name,p.id) from bolig_private.site_roster_people p where p.root_id=r.id),'[]'))
 from bolig_private.roots r join public.sales_company_scopes c on c.id=r.company_id
 left join bolig_private.site_roster_state s on s.root_id=r.id where r.id=root
$$;
revoke all on function bolig_private.site_roster_payload(uuid) from public,anon,authenticated,service_role;

create function bolig_private.site_roster_missing(doc jsonb,day date) returns jsonb
language plpgsql immutable set search_path='' as $$
declare result jsonb:='[]';fields jsonb;person jsonb;employer jsonb;active jsonb;
begin
 fields:='[]';
 if btrim(coalesce(doc#>>'{site,name}',''))='' then fields:=fields||jsonb_build_array('Navn på byggeplassen');end if;
 if btrim(coalesce(doc#>>'{site,address}',''))='' then fields:=fields||jsonb_build_array('Byggeplassens adresse');end if;
 if btrim(coalesce(doc#>>'{site,client_name}',''))='' then fields:=fields||jsonb_build_array('Byggherrens navn');end if;
 if jsonb_array_length(fields)>0 then result:=result||jsonb_build_array(jsonb_build_object('kind','site','id',doc->>'root_id','title','Byggeplassen','fields',fields));end if;
 select coalesce(jsonb_agg(p),'[]') into active from jsonb_array_elements(doc->'people') p
 where (p->>'starts_on')::date<=day and ((p->>'ends_on') is null or (p->>'ends_on')::date>=day);
 for person in select value from jsonb_array_elements(active) loop
  fields:='[]';
  if person->>'birth_date' is null then fields:=fields||jsonb_build_array('Fødselsdato');end if;
  if person->>'employer_id' is null then fields:=fields||jsonb_build_array('Arbeidsgiver / enmannsbedrift');end if;
  if person->>'employment_type'='hired' and person->>'hirer_id' is null then fields:=fields||jsonb_build_array('Innleievirksomhet');end if;
  if person->>'card_status'='number' and btrim(person->>'card_number')='' then fields:=fields||jsonb_build_array('HMS-kortnummer');end if;
  if person->>'card_status'='applied' and length(btrim(person->>'application_reference'))<3 then fields:=fields||jsonb_build_array('Dokumentasjonsreferanse til HMS-kortsøknad');end if;
  if jsonb_array_length(fields)>0 then result:=result||jsonb_build_array(jsonb_build_object('kind','person','id',person->>'id','title',person->>'name','fields',fields));end if;
 end loop;
 for employer in select e from jsonb_array_elements(doc->'employers') e
 where exists(select 1 from jsonb_array_elements(active) p where p->>'employer_id'=e->>'id' or p->>'hirer_id'=e->>'id') loop
  fields:='[]';
  if (employer->>'registration_required')::boolean and employer->>'organisation_number'='' then fields:=fields||jsonb_build_array('Organisasjonsnummer');end if;
  if not (employer->>'registration_required')::boolean and length(btrim(employer->>'exemption_reason'))<3 then fields:=fields||jsonb_build_array('Begrunnelse for manglende registreringsplikt');end if;
  if jsonb_array_length(fields)>0 then result:=result||jsonb_build_array(jsonb_build_object('kind','employer','id',employer->>'id','title',employer->>'name','fields',fields));end if;
 end loop;
 return result;
end$$;
revoke all on function bolig_private.site_roster_missing(jsonb,date) from public,anon,authenticated,service_role;

create function bolig_private.site_roster_workspace(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;s bolig_private.site_roster_state%rowtype;
 receipt bolig_private.site_roster_versions%rowtype;version bolig_private.site_roster_versions%rowtype;
 person bolig_private.site_roster_people%rowtype;employer bolig_private.site_roster_employers%rowtype;
 rid uuid;entity uuid;source_person uuid;source_visit uuid;eid uuid;hid uuid;today date;day date;
 expected bigint;doc jsonb;missing jsonb;site jsonb;v jsonb;name text;org text;reason text;kind text;card text;
 birth date;starts date;ends date;ended date;required boolean;readonly boolean;hash bytea;historical boolean:=false;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) or ctx->>'role' is distinct from 'manager' then raise exception 'Prosjektledertilgang kreves for oversiktslisten.' using errcode='42501';end if;
 perform 1 from bolig_private.roots where id=root and company_id=c;
 if not found then raise exception 'Prosjektet er ikke tilgjengelig i aktivt firma.' using errcode='42501';end if;
 if action is null or action not in('get','settings','employer','person','review') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>20000 then raise exception 'Ugyldig handling i oversiktslisten.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-site-roster:'||root::text,0));
 -- Validate again after queueing, including a concurrent access revocation.
 ctx:=bolig_private.context(c);
 if not coalesce((ctx->>'enabled')::boolean,false) or ctx->>'role' is distinct from 'manager' then raise exception 'Prosjektledertilgangen er endret.' using errcode='42501';end if;
 if action='get' then select * into r from bolig_private.roots where id=root and company_id=c;
 else select * into r from bolig_private.roots where id=root and company_id=c for share;end if;
 if not found then raise exception 'Prosjektet er ikke tilgjengelig.' using errcode='42501';end if;
 today:=(clock_timestamp() at time zone 'Europe/Oslo')::date;
 day:=coalesce(nullif(payload->>'day','')::date,today);
 if day>today then raise exception 'Velg i dag eller en tidligere dato. Planlagt arbeidsperiode settes på personen.' using errcode='22023';end if;
 select * into s from bolig_private.site_roster_state where root_id=root;
 if not found then s.root_id:=root;s.revision:=0;s.settings:='{}';end if;
 if action<>'get' then
  if r.archived then raise exception 'Arkivert prosjekt kan bare leses.' using errcode='42501';end if;
  if day<>today or nullif(payload->>'snapshot_id','') is not null then raise exception 'Historiske versjoner kan bare leses. Gjør rettingen i dagens liste.' using errcode='22023';end if;
  rid:=(payload->>'request_id')::uuid;expected:=(payload->>'revision')::bigint;
  if rid is null then raise exception 'Lagrings-ID mangler.' using errcode='22023';end if;
  hash:=sha256(convert_to(payload::text,'UTF8'));
  select * into receipt from bolig_private.site_roster_versions where id=rid;
  if found then
   if receipt.root_id<>root or receipt.actor_id<>auth.uid() or receipt.action<>action or receipt.payload_hash<>hash then raise exception 'Lagringsforsøket er endret.' using errcode='PT409';end if;
  else
   if expected is distinct from s.revision then raise exception 'Oversiktslisten er endret. Kladden er beholdt. Hent siste liste og se over før ny lagring.' using errcode='PT409';end if;
   v:=payload->'values';
   if action<>'review' and jsonb_typeof(v) is distinct from 'object' then raise exception 'Feltene mangler.' using errcode='22023';end if;
   if action='settings' then
    ended:=nullif(v->>'ended_on','')::date;
    if ended>today then raise exception 'Faktisk avslutningsdato kan ikke være i fremtiden.' using errcode='22023';end if;
    s.settings:=jsonb_build_object('name',bolig_private.site_roster_text(v,'name',160),'address',bolig_private.site_roster_text(v,'address',1000),
     'client_name',bolig_private.site_roster_text(v,'client_name',160),'keeper_name',bolig_private.site_roster_text(v,'keeper_name',160),'ended_on',ended);
   elsif action='employer' then
    entity:=(v->>'id')::uuid;name:=bolig_private.site_roster_text(v,'name',160);
    if entity is null or name='' then raise exception 'Fyll ut virksomhetens navn.' using errcode='22023';end if;
    select * into employer from bolig_private.site_roster_employers where id=entity;
    if found and employer.root_id<>root then raise exception 'Virksomheten tilhører et annet prosjekt.' using errcode='42501';end if;
    if not found and (select count(*) from bolig_private.site_roster_employers where root_id=root)>=500 then raise exception 'Listen har nådd grensen på 500 virksomheter.' using errcode='22023';end if;
    org:=regexp_replace(bolig_private.site_roster_text(v,'organisation_number',30),'\s','','g');
    if org<>'' and org!~'^[0-9]{9}$' then raise exception 'Et norsk organisasjonsnummer skal ha ni sifre.' using errcode='22023';end if;
    if jsonb_typeof(v->'registration_required') is distinct from 'boolean' then raise exception 'Velg om virksomheten er registreringspliktig.' using errcode='22023';end if;
    required:=(v->>'registration_required')::boolean;reason:=bolig_private.site_roster_text(v,'exemption_reason',500);
    if org<>'' and exists(select 1 from bolig_private.site_roster_employers where root_id=root and organisation_number=org and id<>entity) then raise exception 'Virksomheten er allerede registrert med dette organisasjonsnummeret.' using errcode='PT409';end if;
    insert into bolig_private.site_roster_employers values(entity,root,name,org,required,case when required then '' else reason end)
    on conflict(id) do update set name=excluded.name,organisation_number=excluded.organisation_number,registration_required=excluded.registration_required,exemption_reason=excluded.exemption_reason;
   elsif action='person' then
    entity:=(v->>'id')::uuid;name:=bolig_private.site_roster_text(v,'name',120);
    if entity is null or name='' then raise exception 'Fyll ut personens navn.' using errcode='22023';end if;
    select * into person from bolig_private.site_roster_people where id=entity;
    if found and person.root_id<>root then raise exception 'Personen tilhører et annet prosjekt.' using errcode='42501';end if;
    if not found and (select count(*) from bolig_private.site_roster_people where root_id=root)>=2000 then raise exception 'Listen har nådd grensen på 2000 personer.' using errcode='22023';end if;
    source_person:=nullif(v->>'source_person_id','')::uuid;source_visit:=nullif(v->>'source_visit_id','')::uuid;
    if source_person is not null and source_visit is not null then raise exception 'Velg bare én kilde for personen.' using errcode='22023';end if;
    if person.id is not null and (source_person is distinct from person.source_person_id or source_visit is distinct from person.source_visit_id) then raise exception 'Kildetilknytningen til en lagret person kan ikke endres.' using errcode='22023';end if;
    if source_person is not null and not exists(select 1 from bolig_private.attendance_people where id=source_person and root_id=root) then raise exception 'Deltakeren tilhører ikke dette prosjektet.' using errcode='42501';end if;
    if source_visit is not null and not exists(select 1 from bolig_private.attendance_visits x where x.id=source_visit and x.root_id=root and not exists(select 1 from bolig_private.attendance_person_visits pv where pv.visit_id=x.id)) then raise exception 'Den manuelle registreringen er ikke tilgjengelig i prosjektet.' using errcode='42501';end if;
    if exists(select 1 from bolig_private.site_roster_people where root_id=root and id<>entity and ((source_person is not null and source_person_id=source_person) or (source_visit is not null and source_visit_id=source_visit))) then raise exception 'Deltakeren er allerede i oversiktslisten.' using errcode='PT409';end if;
    eid:=nullif(v->>'employer_id','')::uuid;hid:=nullif(v->>'hirer_id','')::uuid;
    if (eid is not null and not exists(select 1 from bolig_private.site_roster_employers where id=eid and root_id=root)) or (hid is not null and not exists(select 1 from bolig_private.site_roster_employers where id=hid and root_id=root)) then raise exception 'Velg virksomheter fra dette prosjektet.' using errcode='42501';end if;
    birth:=nullif(v->>'birth_date','')::date;starts:=coalesce(nullif(v->>'starts_on','')::date,today);ends:=nullif(v->>'ends_on','')::date;
    if birth>today or (ends is not null and ends<starts) then raise exception 'Kontroller fødselsdato og arbeidsperiode.' using errcode='22023';end if;
    kind:=coalesce(v->>'employment_type','employed');card:=coalesce(v->>'card_status','number');
    if kind not in('employed','hired','self_employed') or card not in('number','applied') then raise exception 'Velg gyldig arbeidsforhold og HMS-kortstatus.' using errcode='22023';end if;
    if kind<>'hired' then hid:=null;end if;
    if birth is not null and exists(select 1 from bolig_private.site_roster_people z where z.root_id=root and z.id<>entity and lower(z.name)=lower(name) and z.birth_date=birth and z.employer_id is not distinct from eid) then raise exception 'Personen finnes allerede med samme navn, fødselsdato og arbeidsgiver.' using errcode='PT409';end if;
    insert into bolig_private.site_roster_people values(entity,root,source_person,source_visit,name,birth,eid,kind,hid,card,
     case when card='number' then bolig_private.site_roster_text(v,'card_number',60) else '' end,
     case when card='applied' then bolig_private.site_roster_text(v,'application_reference',500) else '' end,starts,ends)
    on conflict(id) do update set name=excluded.name,birth_date=excluded.birth_date,employer_id=excluded.employer_id,employment_type=excluded.employment_type,hirer_id=excluded.hirer_id,
     card_status=excluded.card_status,card_number=excluded.card_number,application_reference=excluded.application_reference,starts_on=excluded.starts_on,ends_on=excluded.ends_on;
   else
    if payload->'confirmed' is distinct from 'true'::jsonb then raise exception 'Bekreft at dagens liste er kontrollert.' using errcode='22023';end if;
    doc:=bolig_private.site_roster_payload(root);missing:=bolig_private.site_roster_missing(doc,today);
    if jsonb_array_length(missing)>0 then raise exception 'Fyll ut de markerte opplysningene før du bekrefter daglig kontroll.' using errcode='22023';end if;
   end if;
   s.revision:=s.revision+1;
   if action='review' then s.reviewed_on:=today;s.reviewed_by:=auth.uid();s.reviewed_at:=clock_timestamp();s.reviewed_revision:=s.revision;end if;
   insert into bolig_private.site_roster_state values(root,s.revision,s.settings,s.reviewed_on,s.reviewed_by,s.reviewed_at,s.reviewed_revision)
    on conflict(root_id) do update set revision=excluded.revision,settings=excluded.settings,reviewed_on=excluded.reviewed_on,reviewed_by=excluded.reviewed_by,reviewed_at=excluded.reviewed_at,reviewed_revision=excluded.reviewed_revision;
   doc:=bolig_private.site_roster_payload(root);
   insert into bolig_private.site_roster_versions values(rid,root,s.revision,auth.uid(),clock_timestamp(),today,action,hash,
    doc||jsonb_build_object('captured_at',clock_timestamp(),'actor_name',(select p.email from public.profiles p where p.id=auth.uid()))) returning * into receipt;
  end if;
 end if;
 if nullif(payload->>'snapshot_id','') is not null then
  select * into version from bolig_private.site_roster_versions where id=(payload->>'snapshot_id')::uuid and root_id=root;
  if not found then raise exception 'Den arkiverte versjonen er ikke tilgjengelig.' using errcode='42501';end if;
  day:=version.day;doc:=version.snapshot;historical:=true;
 elsif day<today then
  select h.* into version from bolig_private.site_roster_versions h where h.root_id=root and h.day<=day order by h.revision desc limit 1;
  -- Explicit qualification avoids mixing the selected project day with the column.
  if found then doc:=version.snapshot;else doc:=null;end if;historical:=true;
 else doc:=bolig_private.site_roster_payload(root);end if;
 missing:=case when doc is null then '[]'::jsonb else bolig_private.site_roster_missing(doc,day) end;
 readonly:=r.archived or historical;
 return jsonb_build_object('context',ctx,'root_id',root,'today',today,'day',day,'revision',s.revision,'receipt_id',receipt.id,
 'readonly',readonly,'document',doc,'missing',missing,'snapshot_id',version.id,'source_day',version.day,
 'checked',coalesce(doc is not null and doc#>>'{review,day}'=day::text and (doc#>>'{review,revision}')::bigint=(doc->>'revision')::bigint,false),
 'retain_until',case when nullif(doc#>>'{site,ended_on}','') is not null then ((doc#>>'{site,ended_on}')::date+interval '6 months')::date else null end,
 'history',coalesce((select jsonb_agg(x order by x.revision desc) from (select h.id,h.revision,h.created_at,h.day,h.action,h.snapshot->>'actor_name' as actor_name from bolig_private.site_roster_versions h where h.root_id=root and (nullif(payload->>'before_revision','') is null or h.revision<(payload->>'before_revision')::bigint) order by h.revision desc limit 30) x),'[]'),
 'candidates',case when readonly then '[]'::jsonb else coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'kind','person','name',p.name,'company',p.company,'enabled',p.enabled,'registered_id',(select x.id from bolig_private.site_roster_people x where x.root_id=root and x.source_person_id=p.id)) order by p.name,p.id) from bolig_private.attendance_people p where p.root_id=root),'[]')||
 coalesce((select jsonb_agg(x order by x.arrived_at desc) from (select v.id,'visit' as kind,v.name,v.company,v.arrived_at,(select p.id from bolig_private.site_roster_people p where p.root_id=root and p.source_visit_id=v.id) as registered_id from bolig_private.attendance_visits v where v.root_id=root and (v.arrived_at at time zone 'Europe/Oslo')::date=today and not exists(select 1 from bolig_private.attendance_person_visits pv where pv.visit_id=v.id) order by v.arrived_at desc limit 200) x),'[]') end);
end$$;
revoke all on function bolig_private.site_roster_workspace(uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function bolig_private.site_roster_workspace(uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_site_roster(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.site_roster_workspace(p_company_id,p_root_id,p_action,p_payload)$$;
revoke all on function public.bolig_site_roster(uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.bolig_site_roster(uuid,uuid,text,jsonb) to authenticated;

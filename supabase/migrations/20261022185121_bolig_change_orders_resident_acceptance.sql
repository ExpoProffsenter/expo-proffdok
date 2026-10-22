-- Separate commercial decisions. A resident acceptance never edits a purchase
-- order or silently substitutes a newer choice. Originals remain authoritative.
create table bolig_private.commercial_documents (
 id uuid primary key default gen_random_uuid(),
 root_id uuid not null references bolig_private.roots(id),
 unit_id uuid not null references bolig_private.units(id),
 group_id uuid not null, version integer not null,
 kind text not null check(kind in ('choice','change')),
 status text not null default 'draft' check(status in ('draft','approved','published','accepted','declined','revoked','superseded','handled')),
 revision bigint not null default 1,
 snapshot jsonb not null,
 token_hash bytea unique, expires_at timestamptz,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default clock_timestamp(), approved_at timestamptz,
 accepted_at timestamptz, accepted_name text, decision_request_id uuid,
 handling_note text, handled_at timestamptz,
 unique(group_id,version)
);
create index bolig_commercial_unit on bolig_private.commercial_documents(unit_id,created_at desc);
create index bolig_commercial_root on bolig_private.commercial_documents(root_id);
create index bolig_commercial_actor on bolig_private.commercial_documents(created_by);
create unique index bolig_commercial_one_acceptance on bolig_private.commercial_documents(group_id)
 where status in ('accepted','handled');
create table bolig_private.commercial_receipts (
 root_id uuid not null references bolig_private.roots(id),
 actor_id uuid not null references auth.users(id), request_id uuid not null,
 payload_hash bytea not null, result jsonb not null,
 primary key(root_id,actor_id,request_id)
);
create index bolig_commercial_receipt_actor on bolig_private.commercial_receipts(actor_id);
alter table bolig_private.commercial_documents enable row level security;
alter table bolig_private.commercial_receipts enable row level security;
revoke all on bolig_private.commercial_documents,bolig_private.commercial_receipts from public,anon,authenticated,service_role;

create function bolig_private.commercial_goods(goods jsonb) returns jsonb
language sql immutable set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('key',g->>'key','name',g->>'name','sku',coalesce(g->>'sku',''),
  'quantity',g->'quantity','unit',g->>'unit','room_name',coalesce(g->>'room_name',''),
  'section_name',coalesce(g->>'section_name','')) order by n),'[]'::jsonb)
 from jsonb_array_elements(goods) with ordinality x(g,n)
$$;
revoke all on function bolig_private.commercial_goods(jsonb) from public,anon,authenticated,service_role;

create function bolig_private.commercial_view(d bolig_private.commercial_documents) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',d.id,'kind',d.kind,'version',d.version,'status',
 case when d.status='published' and d.expires_at<=now() then 'expired' else d.status end,
 'revision',d.revision,'snapshot',d.snapshot-'order_id'-'order_basis'-'choice_revision','expires_at',d.expires_at,'created_at',d.created_at,
 'accepted_at',d.accepted_at,'accepted_name',d.accepted_name,'handled_at',d.handled_at)
$$;
revoke all on function bolig_private.commercial_view(bolig_private.commercial_documents) from public,anon,authenticated,service_role;

create function bolig_private.commerce(c uuid,root uuid,unit uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare state jsonb;ctx jsonb;doc bolig_private.commercial_documents%rowtype;
 receipt bolig_private.commercial_receipts%rowtype;cv bolig_private.choice_versions%rowtype;
 po bolig_private.purchase_orders%rowtype;rid uuid;group_ref uuid;fingerprint bytea;
 next_version int;kind text;reason text;items jsonb;g jsonb;original jsonb;clean jsonb;
 goods jsonb:='[]';before_goods jsonb:='[]';keys text[]:='{}';snapshot jsonb;
 total bigint;delta bigint;identity jsonb;result jsonb;raw_token text;
begin
 if action is null or action not in ('get','create','approve','publish','revoke','handled')
 or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>450000 then
  raise exception 'Ugyldig avtalegrunnlag.' using errcode='22023';end if;
 state:=bolig_private.deliveries(c,root,unit,'get','{}');ctx:=state->'context';
 select * into cv from bolig_private.choice_versions where unit_id=unit and root_id=root order by revision desc limit 1;
 if action<>'get' then
  if ctx->>'role' is distinct from 'manager' or not exists(
   select 1 from bolig_private.roots r join bolig_private.units u on u.root_id=r.id
    join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
   where r.id=root and r.company_id=c and u.id=unit and not r.archived and not u.archived and not e.archived and not b.archived)
  then raise exception 'Prosjektleder og aktiv bolig kreves.' using errcode='42501';end if;
  rid:=(payload->>'request_id')::uuid;
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  fingerprint:=sha256(convert_to(jsonb_build_object('unit',unit,'action',action,'payload',payload)::text,'UTF8'));
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
  state:=bolig_private.deliveries(c,root,unit,'get','{}');
  select * into cv from bolig_private.choice_versions where unit_id=unit and root_id=root order by revision desc limit 1;
  select * into receipt from bolig_private.commercial_receipts where root_id=root and actor_id=auth.uid() and request_id=rid;
  if found then
   if receipt.payload_hash<>fingerprint then raise exception 'Referansen tilhører et annet forsøk.' using errcode='PT409';end if;
   return receipt.result;
  end if;
 end if;
 if action='create' then
  kind:=payload->>'kind';reason:=trim(payload->>'reason');
  if kind is null or kind not in ('choice','change') or jsonb_typeof(payload->'reason') is distinct from 'string'
  or length(reason) not between 3 and 2000 then raise exception 'Beskriv grunnlaget til beboeren (3–2000 tegn).' using errcode='22023';end if;
  if (select count(*) from bolig_private.commercial_documents where root_id=root and unit_id=unit)>=200 then
   raise exception 'Boligen har nådd grensen på 200 avtaleutgaver.' using errcode='22023';end if;
  select jsonb_build_object('project',r.title,'reference',r.reference,'unit',u.number,
    'official_number',u.official_number,'address',e.address,'block',b.name,'company',ctx->>'company_name') into identity
   from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id
    join bolig_private.blocks b on b.id=e.block_id join bolig_private.roots r on r.id=u.root_id where u.id=unit;
  if kind='choice' then
   if cv.revision is null or (payload->>'choice_revision')::bigint is distinct from cv.revision then
    raise exception 'Boligvalget er endret eller mangler. Hent siste grunnlag.' using errcode='PT409';end if;
   goods:=bolig_private.commercial_goods(cv.snapshot->'goods');
   total:=(cv.snapshot->>'total_cents')::bigint;delta:=0;
   snapshot:=jsonb_build_object('identity',identity,'goods',goods,'before_goods','[]'::jsonb,'reason',reason,
    'choice_revision',cv.revision,'total_cents',total,'delta_cents',0,'base_included',true);
  else
   select * into po from bolig_private.purchase_orders where id=(payload->>'order_id')::uuid and unit_id=unit and root_id=root for update;
   if not found or po.status='cancelled' or (payload->>'delivery_revision')::bigint is distinct from (state->>'revision')::bigint then
    raise exception 'Bestillingen er endret. Hent siste grunnlag.' using errcode='PT409';end if;
   if po.mail_request_id is not null and exists(select 1 from bolig_private.order_mail_attempts where id=po.mail_request_id and sent_at is null) then
    raise exception 'Bestillingssendingen må avklares før en endring opprettes.' using errcode='PT409';end if;
   if jsonb_typeof(payload->'delta_cents') is distinct from 'number' or abs((payload->>'delta_cents')::numeric)>1000000000
    or (payload->>'delta_cents')::numeric<>trunc((payload->>'delta_cents')::numeric) then
    raise exception 'Oppgi pristillegg eller fratrekk inkl. mva.' using errcode='22023';end if;
   delta:=(payload->>'delta_cents')::bigint;
   items:=payload->'lines';
   if jsonb_typeof(items) is distinct from 'array' or jsonb_array_length(items)>1000 then
    raise exception 'Kontroller varelinjene.' using errcode='22023';end if;
   for g in select value from jsonb_array_elements(items) loop
    if jsonb_typeof(g) is distinct from 'object' or coalesce(g->>'key','') !~ '^[a-zA-Z0-9/-]{1,150}$'
     or g->>'key'=any(keys) then raise exception 'Varelinjene må ha ulike nøkler.' using errcode='22023';end if;
    keys:=array_append(keys,g->>'key');
    clean:=bolig_private.catalog_content(jsonb_build_object('sections',coalesce(payload->'sections','[]'::jsonb),
     'lines',jsonb_build_array(g||jsonb_build_object('key','validate','section_id',coalesce(g->>'section_id','')))),false)->'lines'->0;
    select value into original from jsonb_array_elements(po.snapshot->'goods') where value->>'key'=g->>'key';
    if coalesce((select (po.received->>(n-1)::text)::numeric from jsonb_array_elements(po.snapshot->'goods') with ordinality x(v,n) where v->>'key'=g->>'key'),0)>(clean->>'quantity')::numeric then
     raise exception 'Antall kan ikke reduseres under allerede mottatt mengde.' using errcode='22023';end if;
    clean:=clean||jsonb_build_object('key',g->>'key','room_name',coalesce(original->>'room_name','Felles for boligen'),
      'section_name',coalesce(nullif(clean->>'section_name',''),original->>'section_name',''));
    goods:=goods||jsonb_build_array(clean);
   end loop;
   for original in select value from jsonb_array_elements(po.snapshot->'goods') loop
    if not (original->>'key')=any(keys) and coalesce((select (po.received->>(n-1)::text)::numeric from jsonb_array_elements(po.snapshot->'goods') with ordinality x(v,n) where v->>'key'=original->>'key'),0)>0 then
     raise exception 'En allerede mottatt vare kan ikke fjernes. Registrer retur og avklar bestillingen først.' using errcode='22023';end if;
   end loop;
   before_goods:=bolig_private.commercial_goods(po.snapshot->'goods');goods:=bolig_private.commercial_goods(goods);
   if before_goods=goods and delta=0 then raise exception 'Ingen varer eller pris er endret.' using errcode='22023';end if;
   snapshot:=jsonb_build_object('identity',identity,'goods',goods,'before_goods',before_goods,'reason',reason,
    'order_id',po.id,'order_number',po.number,'order_status',po.status,'order_basis',md5(po.snapshot::text),
    'choice_revision',po.source_choice_revision,'delta_cents',delta,'total_cents',null,'base_included',true);
  end if;
  group_ref:=nullif(payload->>'group_id','')::uuid;
  if group_ref is null then group_ref:=gen_random_uuid();next_version:=1;
  else
   select * into doc from bolig_private.commercial_documents where group_id=group_ref and root_id=root and unit_id=unit order by version desc limit 1;
   if not found or doc.kind<>kind or (kind='change' and doc.snapshot->>'order_id' is distinct from snapshot->>'order_id')
    or exists(select 1 from bolig_private.commercial_documents where group_id=group_ref and status in ('accepted','handled')) then
    raise exception 'Avtalerekken er endret eller allerede akseptert. Opprett et nytt grunnlag.' using errcode='PT409';end if;
   next_version:=doc.version+1;
  end if;
  insert into bolig_private.commercial_documents(root_id,unit_id,group_id,version,kind,snapshot,created_by)
   values(root,unit,group_ref,next_version,kind,snapshot,auth.uid()) returning * into doc;
 elsif action<>'get' then
  select * into doc from bolig_private.commercial_documents where id=(payload->>'document_id')::uuid and root_id=root and unit_id=unit for update;
  if not found then raise exception 'Avtalen er ikke tilgjengelig.' using errcode='42501';end if;
  if (payload->>'revision')::bigint is distinct from doc.revision then raise exception 'Avtalen er endret. Hent siste status.' using errcode='PT409';end if;
  if action='approve' then
   if doc.status<>'draft' then raise exception 'Bare en kladd kan godkjennes.' using errcode='PT409';end if;
   update bolig_private.commercial_documents set status='approved',approved_at=now(),revision=revision+1 where id=doc.id;
  elsif action='publish' then
   if doc.status<>'approved' then raise exception 'Gjennomgå og godkjenn grunnlaget først.' using errcode='PT409';end if;
   raw_token:=payload->>'token';
   if raw_token is null or raw_token !~ '^[0-9a-f]{64}$' then raise exception 'Ugyldig lenkenøkkel.' using errcode='22023';end if;
   update bolig_private.commercial_documents set status='published',token_hash=sha256(convert_to(raw_token,'UTF8')),
    expires_at=now()+interval '30 days',revision=revision+1 where id=doc.id;
  elsif action='revoke' then
   if doc.status not in ('draft','approved','published') then raise exception 'En avgjort avtale kan ikke tilbakekalles.' using errcode='PT409';end if;
   update bolig_private.commercial_documents set status='revoked',revision=revision+1 where id=doc.id;
  elsif action='handled' then
   reason:=trim(payload->>'note');
   if doc.kind<>'change' or doc.status<>'accepted' or jsonb_typeof(payload->'note') is distinct from 'string'
    or length(reason) not between 10 and 2000 then raise exception 'Dokumenter leverandøravklaringen og hvordan endringen er bestilt (10–2000 tegn).' using errcode='22023';end if;
   update bolig_private.commercial_documents set status='handled',handling_note=reason,handled_at=now(),revision=revision+1 where id=doc.id;
  end if;
 end if;
 if action not in ('get','create') then select * into doc from bolig_private.commercial_documents where id=doc.id;end if;
 result:=jsonb_build_object('context',ctx,'root_id',root,'unit_id',unit,'document_id',doc.id,'choice_revision',coalesce(cv.revision,0),
  'selection',case when cv.revision is null then null else jsonb_build_object('goods',bolig_private.commercial_goods(cv.snapshot->'goods'),'total_cents',cv.snapshot->'total_cents') end,
  'delivery_revision',state->'revision','orders',(select coalesce(jsonb_agg(x),'[]') from (
    select jsonb_build_object('id',o.id,'number',o.number,'status',o.status,'goods',bolig_private.commercial_goods(o.snapshot->'goods')) x
    from bolig_private.purchase_orders o where o.root_id=root and o.unit_id=unit and o.status<>'cancelled' order by o.created_at desc) q),
  'documents',(select coalesce(jsonb_agg(bolig_private.commercial_view(d)||jsonb_build_object('snapshot',d.snapshot,'group_id',d.group_id,'handling_note',d.handling_note) order by d.created_at desc,d.id),'[]')
   from bolig_private.commercial_documents d where d.root_id=root and d.unit_id=unit));
 if action<>'get' then
  insert into bolig_private.commercial_receipts values(root,auth.uid(),rid,fingerprint,result);
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision)
   values(c,root,auth.uid(),'commerce_'||action,doc.id,doc.revision);
 end if;
 return result;
end$$;
revoke all on function bolig_private.commerce(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.commerce(uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_commerce(p_company_id uuid,p_root_id uuid,p_unit_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.commerce(p_company_id,p_root_id,p_unit_id,p_action,p_payload)$$;
revoke all on function public.bolig_commerce(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_commerce(uuid,uuid,uuid,text,jsonb) to authenticated;

-- Only the bearer of a 256-bit capability can read this immutable agreement.
-- No resident contact, internal notes, purchase prices, attachments or other unit
-- information is projected. The capability is stored hashed, never as cleartext.
create schema bolig_resident_private;
revoke all on schema bolig_resident_private from public,anon,authenticated,service_role;
grant usage on schema bolig_resident_private to anon,authenticated;
create function bolig_resident_private.resident_decision(token text,action text,expected uuid,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare d bolig_private.commercial_documents%rowtype;root uuid;name text;rid uuid;
begin
 if token is null or token !~ '^[0-9a-f]{64}$' or action is null or action not in ('get','accept','decline')
  or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>3000 then
  raise exception 'Lenken er ikke tilgjengelig.' using errcode='42501';end if;
 select root_id into root from bolig_private.commercial_documents where token_hash=sha256(convert_to(token,'UTF8'));
 if root is null then raise exception 'Lenken er ikke tilgjengelig.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into d from bolig_private.commercial_documents where token_hash=sha256(convert_to(token,'UTF8')) for update;
 if not exists(select 1 from bolig_private.roots r join bolig_private.firms f on f.company_id=r.company_id
   join bolig_private.units u on u.root_id=r.id join bolig_private.entrances e on e.id=u.entrance_id
   join bolig_private.blocks b on b.id=e.block_id where r.id=d.root_id and u.id=d.unit_id
    and f.enabled and not r.archived and not u.archived and not e.archived and not b.archived)
  or d.status not in ('published','accepted','declined','handled') then
  raise exception 'Lenken er ikke tilgjengelig. Kontakt prosjektleder.' using errcode='42501';end if;
 if d.expires_at<=now() and d.status='published' then raise exception 'Svarfristen er utløpt. Kontakt prosjektleder.' using errcode='42501';end if;
 if action<>'get' then
  name:=trim(payload->>'name');rid:=(payload->>'request_id')::uuid;
  if expected is distinct from d.id or rid is null or jsonb_typeof(payload->'name') is distinct from 'string'
   or length(name) not between 2 and 120 or payload->'confirmed' is distinct from 'true'::jsonb then
   raise exception 'Kontroller navn, bekreftelse og avtaleutgave.' using errcode='22023';end if;
  if d.status in ('accepted','declined','handled') then
   if d.decision_request_id=rid and d.accepted_name=name and
    ((action='accept' and d.status in ('accepted','handled')) or (action='decline' and d.status='declined')) then
     return bolig_private.commercial_view(d);end if;
   raise exception 'Svaret er allerede registrert. Kontakt prosjektleder ved endringer.' using errcode='PT409';end if;
  if exists(select 1 from bolig_private.commercial_documents where group_id=d.group_id and status in ('accepted','handled')) then
   raise exception 'En annen utgave er allerede akseptert. Kontakt prosjektleder.' using errcode='PT409';end if;
  update bolig_private.commercial_documents set status=case when action='accept' then 'accepted' else 'declined' end,
    accepted_at=now(),accepted_name=name,decision_request_id=rid,revision=revision+1 where id=d.id returning * into d;
  if action='accept' then
   update bolig_private.commercial_documents set status='superseded',revision=revision+1
    where group_id=d.group_id and id<>d.id and status in ('draft','approved','published');
  end if;
 end if;
 return bolig_private.commercial_view(d);
end$$;
revoke all on function bolig_resident_private.resident_decision(text,text,uuid,jsonb) from public,service_role;
grant execute on function bolig_resident_private.resident_decision(text,text,uuid,jsonb) to anon,authenticated;
create function public.bolig_resident_decision(p_token text,p_action text default 'get',p_document_id uuid default null,p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_resident_private.resident_decision(p_token,p_action,p_document_id,p_payload)$$;
revoke all on function public.bolig_resident_decision(text,text,uuid,jsonb) from public,service_role;
grant execute on function public.bolig_resident_decision(text,text,uuid,jsonb) to anon,authenticated;

-- Commercial commitments are part of the completion basis. An accepted change
-- requires explicit supplier/ordering followup before completion can be green.
alter function bolig_private.completion_source(uuid,uuid,uuid) rename to completion_source_before_commerce;
revoke all on function bolig_private.completion_source_before_commerce(uuid,uuid,uuid) from public,anon,authenticated,service_role;
create function bolig_private.completion_source(c uuid,root uuid,unit uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare src jsonb;docs jsonb;pending int;
begin
 src:=bolig_private.completion_source_before_commerce(c,root,unit);
 select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'revision',d.revision,'status',d.status) order by d.id),'[]'),
  count(*) filter(where d.kind='change' and d.status='accepted') into docs,pending
 from bolig_private.commercial_documents d where d.root_id=root and d.unit_id=unit and d.status in ('accepted','handled');
 if docs='[]'::jsonb then return src;end if;
 return src||jsonb_build_object('basis',md5((src->>'basis')||docs::text),'issues',(src->'issues')||
  case when pending>0 then jsonb_build_array(pending||' aksepterte endringsordrer må avklares med leverandør og dokumenteres under Endringer og beboeraksept.') else '[]'::jsonb end);
end$$;
revoke all on function bolig_private.completion_source(uuid,uuid,uuid) from public,anon,authenticated,service_role;

-- Explicit supplier confirmation changes fulfillment, never the original order.
alter table bolig_private.purchase_orders add column effective_snapshot jsonb;
alter table bolig_private.commercial_documents add column fulfillment_applied_at timestamptz;
alter table bolig_private.commercial_documents add column fulfillment_reference text;

-- Resolve old parallel pending choice records without removing any acceptance.
update bolig_private.commercial_documents d set status='superseded',revision=revision+1
where d.kind='choice' and d.status in ('draft','approved','published') and exists(
 select 1 from bolig_private.commercial_documents a where a.root_id=d.root_id and a.unit_id=d.unit_id and a.kind='choice' and a.status='accepted');

create function bolig_private.guard_commercial_acceptance() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.status='accepted' and old.status is distinct from 'accepted' then
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||new.root_id::text,0));
  if new.kind='choice' then
   if exists(select 1 from bolig_private.commercial_documents d where d.root_id=new.root_id and d.unit_id=new.unit_id and d.kind='choice' and d.status='accepted' and d.id<>new.id) then raise exception 'Boligvalget er allerede akseptert.' using errcode='PT409';end if;
   update bolig_private.commercial_documents set status='superseded',revision=revision+1 where root_id=new.root_id and unit_id=new.unit_id and kind='choice' and id<>new.id and status in ('draft','approved','published');
  else
   if not exists(select 1 from bolig_private.purchase_orders o where o.id=(new.snapshot->>'order_id')::uuid and o.root_id=new.root_id and o.unit_id=new.unit_id and o.status<>'cancelled' and new.snapshot->>'order_basis' in (md5(coalesce(o.effective_snapshot,o.snapshot)::text),md5((coalesce(o.effective_snapshot,o.snapshot)->'goods')::text))) then raise exception 'Leveransen er endret. Be prosjektleder om et oppdatert grunnlag.' using errcode='PT409';end if;
  end if;
 end if;
 return new;
end$$;
revoke all on function bolig_private.guard_commercial_acceptance() from public,anon,authenticated,service_role;
create trigger bolig_commercial_acceptance_guard before update on bolig_private.commercial_documents for each row execute function bolig_private.guard_commercial_acceptance();

-- Hide full internal goods metadata from bearer-token projection.
create or replace function bolig_private.commercial_view(d bolig_private.commercial_documents) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',d.id,'kind',d.kind,'version',d.version,'status',
 case when d.status='published' and d.expires_at<=now() then 'expired' else d.status end,
 'revision',d.revision,'snapshot',d.snapshot-'supplier_order'-'fulfillment_goods'-'order_id'-'order_basis'-'choice_revision','expires_at',d.expires_at,'created_at',d.created_at,
 'accepted_at',d.accepted_at,'accepted_name',d.accepted_name,'handled_at',d.handled_at)
$$;
create function bolig_private.apply_commercial_delivery(c uuid,root uuid,unit uuid,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare s jsonb;ctx jsonb;d bolig_private.commercial_documents%rowtype;o bolig_private.purchase_orders%rowtype;
 g jsonb;oldg jsonb;goods jsonb;counts jsonb:='{}';amount numeric;idx int:=0;note text;ref text;rid uuid;fp bytea;receipt_row bolig_private.commercial_receipts%rowtype;result jsonb;
begin
 s:=bolig_private.deliveries(c,root,unit,'get','{}');ctx:=s->'context';
 if ctx->>'role' is distinct from 'manager' or not exists(select 1 from bolig_private.roots r join bolig_private.units u on u.root_id=r.id join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where r.id=root and r.company_id=c and u.id=unit and not r.archived and not u.archived and not e.archived and not b.archived) then raise exception 'Prosjektleder og aktiv bolig kreves.' using errcode='42501';end if;
 rid:=(payload->>'request_id')::uuid;fp:=sha256(convert_to(jsonb_build_object('unit',unit,'action','apply','payload',payload)::text,'UTF8'));
 if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into receipt_row from bolig_private.commercial_receipts where root_id=root and actor_id=auth.uid() and request_id=rid;
 if found then if receipt_row.payload_hash<>fp then raise exception 'Referansen tilhører et annet forsøk.' using errcode='PT409';end if;return receipt_row.result;end if;
 select * into d from bolig_private.commercial_documents where id=(payload->>'document_id')::uuid and root_id=root and unit_id=unit for update;
 if not found then raise exception 'Avtalen er ikke tilgjengelig.' using errcode='42501';end if;
 if d.kind<>'change' or d.status not in ('accepted','handled') or d.fulfillment_applied_at is not null or d.revision is distinct from (payload->>'revision')::bigint then raise exception 'Endringen er ikke klar eller er allerede fulgt opp.' using errcode='PT409';end if;
 note:=trim(payload->>'note');ref:=trim(payload->>'reference');
 if payload->'reviewed' is distinct from 'true'::jsonb or jsonb_typeof(payload->'note') is distinct from 'string' or length(note) not between 10 and 2000 or jsonb_typeof(payload->'reference') is distinct from 'string' or length(ref) not between 2 and 160 then raise exception 'Bekreft leverandøravklaring, referanse og gjennomgått endring.' using errcode='22023';end if;
 select * into o from bolig_private.purchase_orders where id=(d.snapshot->>'order_id')::uuid and root_id=root and unit_id=unit for update;
 if not found or o.status not in ('ordered','partial','delivered') or d.snapshot->>'order_basis' not in (md5(coalesce(o.effective_snapshot,o.snapshot)::text),md5((coalesce(o.effective_snapshot,o.snapshot)->'goods')::text)) then raise exception 'Bestillingen er endret eller ikke bekreftet bestilt. Hent siste grunnlag.' using errcode='PT409';end if;
 o.snapshot:=coalesce(o.effective_snapshot,o.snapshot);
 goods:=d.snapshot->'fulfillment_goods';
 -- Legacy accepted documents can be followed up with their reviewed public goods.
 if goods is null then select coalesce(jsonb_agg(coalesce(old.oldg,'{}'::jsonb)||x.g order by x.n),'[]'::jsonb) into goods from jsonb_array_elements(d.snapshot->'goods') with ordinality x(g,n) left join lateral(select value oldg from jsonb_array_elements(o.snapshot->'goods') where value->>'key'=x.g->>'key' and (value->>'sku',value->>'name',value->>'unit') is not distinct from (x.g->>'sku',x.g->>'name',x.g->>'unit')) old on true;end if;
 for oldg in select value from jsonb_array_elements(o.snapshot->'goods') loop
  select coalesce((o.received->>(n-1)::text)::numeric,0) into amount from jsonb_array_elements(o.snapshot->'goods') with ordinality x(g,n) where g->>'key'=oldg->>'key';
  if amount>0 and not exists(select 1 from jsonb_array_elements(goods) x(v) where x.v->>'key'=oldg->>'key' and (x.v->>'quantity')::numeric>=amount and (x.v->>'sku',x.v->>'name',x.v->>'unit') is not distinct from (oldg->>'sku',oldg->>'name',oldg->>'unit')) then raise exception 'Mottaket er endret. Registrer retur eller klargjør en ny endring.' using errcode='PT409';end if;
 end loop;
 for g in select value from jsonb_array_elements(goods) loop
  select coalesce((o.received->>(n-1)::text)::numeric,0) into amount from jsonb_array_elements(o.snapshot->'goods') with ordinality x(v,n) where v->>'key'=g->>'key';
  counts:=jsonb_set(counts,array[idx::text],to_jsonb(coalesce(amount,0)));idx:=idx+1;
 end loop;
 update bolig_private.purchase_orders set effective_snapshot=jsonb_set(o.snapshot,'{goods}',goods),received=counts,status=case
 when not exists(select 1 from jsonb_array_elements(goods) with ordinality x(g,n) where coalesce((counts->>(x.n-1)::text)::numeric,0)<>(x.g->>'quantity')::numeric) then 'delivered'
 when exists(select 1 from jsonb_each_text(counts) x where x.value::numeric>0) then 'partial' else 'ordered' end where id=o.id;
 update bolig_private.commercial_documents set status='handled',handling_note=note,handled_at=now(),fulfillment_applied_at=now(),fulfillment_reference=ref,revision=revision+1 where id=d.id;
 update bolig_private.delivery_states set revision=revision+1 where root_id=root;
 insert into bolig_private.delivery_events(root_id,unit_id,order_id,action,payload,actor_id) values(root,unit,o.id,'amendment_applied',jsonb_build_object('document_id',d.id,'reference',ref,'note',note),auth.uid());
 insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'commerce_apply',d.id,d.revision+1);
 result:=bolig_private.commerce(c,root,unit,'get','{}');
 insert into bolig_private.commercial_receipts values(root,auth.uid(),rid,fp,result);return result;
end$$;
revoke all on function bolig_private.apply_commercial_delivery(uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;

create or replace function bolig_private.commerce(c uuid,root uuid,unit uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare state jsonb;ctx jsonb;doc bolig_private.commercial_documents%rowtype;
 receipt bolig_private.commercial_receipts%rowtype;cv bolig_private.choice_versions%rowtype;
 po bolig_private.purchase_orders%rowtype;rid uuid;group_ref uuid;fingerprint bytea;
 next_version int;kind text;reason text;items jsonb;g jsonb;original jsonb;clean jsonb;
 goods jsonb:='[]';before_goods jsonb:='[]';keys text[]:='{}';snapshot jsonb;
 total bigint;delta bigint;identity jsonb;result jsonb;raw_token text;
begin
 if action is null or action not in ('get','create','approve','publish','revoke','handled','apply')
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
 if action='apply' then return bolig_private.apply_commercial_delivery(c,root,unit,payload);end if;
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
   if exists(select 1 from bolig_private.commercial_documents where root_id=root and unit_id=unit and commercial_documents.kind='choice' and status='accepted') then raise exception 'Boligvalget er allerede akseptert. Samle nye endringer i en endringsordre.' using errcode='PT409';end if;
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
   if exists(select 1 from bolig_private.commercial_documents d where d.root_id=root and d.unit_id=unit and d.kind='change' and d.snapshot->>'order_id'=po.id::text and d.status in ('accepted','handled') and d.fulfillment_applied_at is null) then raise exception 'Avklar og oppdater leveransen for forrige aksepterte endring først.' using errcode='PT409';end if;
   po.snapshot:=coalesce(po.effective_snapshot,po.snapshot);
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
    if coalesce((select (po.received->>(n-1)::text)::numeric from jsonb_array_elements(po.snapshot->'goods') with ordinality x(v,n) where v->>'key'=g->>'key'),0)>0 and (original->>'sku',original->>'name',original->>'unit') is distinct from (clean->>'sku',clean->>'name',clean->>'unit') then raise exception 'Registrer retur før en mottatt vare erstattes.' using errcode='22023';end if;
    clean:=clean||coalesce((select jsonb_object_agg(k,v) from jsonb_each(original) x(k,v) where k in ('room_id','scope_id','room_allocations','source_key')),'{}'::jsonb);
    clean:=clean||jsonb_build_object('key',g->>'key','room_name',coalesce(original->>'room_name','Felles for boligen'),
      'section_name',coalesce(nullif(clean->>'section_name',''),original->>'section_name',''));
    goods:=goods||jsonb_build_array(clean);
   end loop;
   for original in select value from jsonb_array_elements(po.snapshot->'goods') loop
    if not (original->>'key')=any(keys) and coalesce((select (po.received->>(n-1)::text)::numeric from jsonb_array_elements(po.snapshot->'goods') with ordinality x(v,n) where v->>'key'=original->>'key'),0)>0 then
     raise exception 'En allerede mottatt vare kan ikke fjernes. Registrer retur og avklar bestillingen først.' using errcode='22023';end if;
   end loop;
   items:=goods;before_goods:=bolig_private.commercial_goods(po.snapshot->'goods');goods:=bolig_private.commercial_goods(goods);
   if before_goods=goods and delta=0 then raise exception 'Ingen varer eller pris er endret.' using errcode='22023';end if;
   snapshot:=jsonb_build_object('identity',identity,'goods',goods,'before_goods',before_goods,'reason',reason,
    'supplier_order',po.snapshot-'goods','fulfillment_goods',items,'order_id',po.id,'order_number',po.number,'order_status',po.status,'order_basis',md5((po.snapshot->'goods')::text),
    'choice_revision',po.source_choice_revision,'delta_cents',delta,'total_cents',null,'base_included',true);
  end if;
  group_ref:=nullif(payload->>'group_id','')::uuid;
  if group_ref is null then select d.group_id into group_ref from bolig_private.commercial_documents d where d.root_id=root and d.unit_id=unit and d.kind=kind and (kind='choice' or (d.snapshot->>'order_id'=po.id::text and d.snapshot->>'order_basis'=snapshot->>'order_basis')) and d.status in ('draft','approved','published','declined','revoked','superseded') and not exists(select 1 from bolig_private.commercial_documents x where x.group_id=d.group_id and x.status in ('accepted','handled')) order by d.created_at desc,d.id limit 1;end if;
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
    select jsonb_build_object('id',o.id,'number',o.number,'status',o.status,'goods',coalesce(o.effective_snapshot,o.snapshot)->'goods') x
    from bolig_private.purchase_orders o where o.root_id=root and o.unit_id=unit and o.status<>'cancelled' order by o.created_at desc) q),
  'documents',(select coalesce(jsonb_agg(bolig_private.commercial_view(d)||jsonb_build_object('snapshot',d.snapshot,'group_id',d.group_id,'handling_note',d.handling_note,'fulfillment_applied_at',d.fulfillment_applied_at,'fulfillment_reference',d.fulfillment_reference) order by d.created_at desc,d.id),'[]')
   from bolig_private.commercial_documents d where d.root_id=root and d.unit_id=unit));
 if action<>'get' then
  insert into bolig_private.commercial_receipts values(root,auth.uid(),rid,fingerprint,result);
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision)
   values(c,root,auth.uid(),'commerce_'||action,doc.id,doc.revision);
 end if;
 return result;
end$$;
-- Existing receive/return validation runs against confirmed effective goods.
-- The original snapshot remains stored and is separately projected for history.
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_private.deliveries(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 anchor:=$a$o.snapshot->'goods'$a$;
 if position(anchor in body)=0 then raise exception 'Missing delivery goods anchor';end if;
 body:=replace(body,anchor,$a$coalesce(o.effective_snapshot,o.snapshot)->'goods'$a$);
 body:=replace(body,$a$set snapshot=jsonb_set(snapshot,'{supplier_reference}',to_jsonb(trim(payload->>'supplier_reference')))$a$,$a$set effective_snapshot=case when effective_snapshot is not null then jsonb_set(effective_snapshot,'{supplier_reference}',to_jsonb(trim(payload->>'supplier_reference'))) else null end,snapshot=jsonb_set(snapshot,'{supplier_reference}',to_jsonb(trim(payload->>'supplier_reference')))$a$);
 body:=replace(body,$a$action,payload-'request_id'-'revision',auth.uid()$a$,$a$action,(payload-'request_id'-'revision')||case when action='receive' then jsonb_build_object('goods',coalesce(o.effective_snapshot,o.snapshot)->'goods') else '{}'::jsonb end,auth.uid()$a$);
 anchor:=$a$to_jsonb(po)-'root_id'$a$;
 if position(anchor in body)=0 then raise exception 'Missing order projection anchor';end if;
 body:=replace(body,anchor,$a$(to_jsonb(po)-'root_id'-'effective_snapshot')||jsonb_build_object('snapshot',coalesce(po.effective_snapshot,po.snapshot),'original_snapshot',case when po.effective_snapshot is not null then po.snapshot else null end)$a$);execute body;
 body:=pg_get_functiondef('bolig_private.completion_source(uuid,uuid,uuid)'::regprocedure);
 anchor:=$a$d.kind='change' and d.status='accepted'$a$;
 if position(anchor in body)=0 then raise exception 'Missing completion commerce anchor';end if;
 body:=replace(body,anchor,$a$d.kind='change' and d.fulfillment_applied_at is null$a$);execute body;
end$patch$;

-- FDV includes un-ordered selections plus the confirmed effective supplier goods.
create function bolig_private.effective_unit_goods(root uuid,unit uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(g order by sort,n),'[]'::jsonb) from (
 select g,0 sort,n from bolig_private.choice_versions cv cross join lateral jsonb_array_elements(cv.snapshot->'goods') with ordinality x(g,n)
 where cv.root_id=$1 and cv.unit_id=$2 and cv.revision=(select max(revision) from bolig_private.choice_versions where root_id=$1 and unit_id=$2)
 and not exists(select 1 from bolig_private.purchase_orders o cross join lateral jsonb_array_elements(o.snapshot->'goods') og where o.root_id=$1 and o.unit_id=$2 and o.status<>'cancelled' and og->>'key'=g->>'key')
 union all
 select g,1 sort,n from bolig_private.purchase_orders o cross join lateral jsonb_array_elements(coalesce(o.effective_snapshot,o.snapshot)->'goods') with ordinality x(g,n) where o.root_id=$1 and o.unit_id=$2 and o.status<>'cancelled'
 ) x
$$;
revoke all on function bolig_private.effective_unit_goods(uuid,uuid) from public,anon,authenticated,service_role;
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_private.fdv_rows(uuid,uuid)'::regprocedure);
 anchor:=$a$coalesce(v.snapshot->'goods','[]')$a$;
 if position(anchor in body)=0 then raise exception 'Missing FDV source anchor';end if;
 body:=replace(body,anchor,$a$bolig_private.effective_unit_goods($1,u.id)$a$);execute body;
end$patch$;

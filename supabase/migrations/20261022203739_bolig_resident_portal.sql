-- One revocable capability per unit/contact. Published alternatives are frozen;
-- resident requests never change selections, accept agreements or place orders.
create table bolig_private.resident_portals (
 id uuid primary key default gen_random_uuid(), root_id uuid not null references bolig_private.roots(id),
 unit_id uuid not null unique references bolig_private.units(id), revision bigint not null default 0,
 token_hash bytea unique, expires_at timestamptz, revoked boolean not null default true,
 contact_basis text, menu_version bigint not null default 0, source_revision bigint,
 offers jsonb not null default '[]', published_offers jsonb not null default '[]',
 documents jsonb not null default '[]', created_by uuid not null references auth.users(id)
);
create index bolig_portal_root on bolig_private.resident_portals(root_id);
create index bolig_portal_actor on bolig_private.resident_portals(created_by);
create table bolig_private.resident_events (
 id uuid primary key default gen_random_uuid(), portal_id uuid not null references bolig_private.resident_portals(id),
 kind text not null check(kind in ('request','message','reply','document','publish','revoke')),
 sender text not null check(sender in ('resident','manager')), contact_basis text, body text not null default '',
 snapshot jsonb, status text not null default 'pending', review_note text,
 created_at timestamptz not null default clock_timestamp(), actor_id uuid references auth.users(id)
);
create index bolig_resident_event_portal on bolig_private.resident_events(portal_id,created_at desc);
create index bolig_resident_event_actor on bolig_private.resident_events(actor_id);
create table bolig_private.resident_receipts (
 portal_id uuid not null references bolig_private.resident_portals(id), actor text not null,
 request_id uuid not null, fingerprint bytea not null, result jsonb not null,
 primary key(portal_id,actor,request_id)
);
alter table bolig_private.resident_portals enable row level security;
alter table bolig_private.resident_events enable row level security;
alter table bolig_private.resident_receipts enable row level security;
revoke all on bolig_private.resident_portals,bolig_private.resident_events,bolig_private.resident_receipts from public,anon,authenticated,service_role;

create function bolig_private.portal_offer(o jsonb) returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_object('id',o->'id','title',o->'title','total_cents',o->'snapshot'->'total_cents',
 'goods',bolig_private.commercial_goods(o->'snapshot'->'goods'))
$$;
revoke all on function bolig_private.portal_offer(jsonb) from public,anon,authenticated,service_role;

create function bolig_private.portal_state(p bolig_private.resident_portals) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',p.id,'menu_version',p.menu_version,'expires_at',p.expires_at,
 'identity',(select jsonb_build_object('project',r.title,'company',c.display_name,'block',b.name,'unit',u.number,'address',e.address)
 from bolig_private.roots r join public.sales_company_scopes c on c.id=r.company_id
 join bolig_private.units u on u.root_id=r.id join bolig_private.entrances e on e.id=u.entrance_id
 join bolig_private.blocks b on b.id=e.block_id where r.id=p.root_id and u.id=p.unit_id),
 'offers',(select coalesce(jsonb_agg(bolig_private.portal_offer(o)),'[]') from jsonb_array_elements(p.published_offers) o),
 'documents',p.documents,
 'events',(select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'kind',x.kind,'sender',x.sender,'body',x.body,
 'offer',case when x.kind='request' then bolig_private.portal_offer(x.snapshot) else null end,
 'status',x.status,'review_note',x.review_note,'created_at',x.created_at) order by x.created_at),'[]')
 from (select * from bolig_private.resident_events where portal_id=p.id and contact_basis=p.contact_basis and kind in ('request','message','reply') order by created_at desc limit 100) x),
 'agreements',(select coalesce(jsonb_agg(bolig_private.commercial_view(d) order by d.created_at desc),'[]')
 from bolig_private.commercial_documents d where d.root_id=p.root_id and d.unit_id=p.unit_id
 and d.status in ('published','accepted','declined','handled') and (d.status<>'published' or d.expires_at>now())))
$$;
revoke all on function bolig_private.portal_state(bolig_private.resident_portals) from public,anon,authenticated,service_role;

create function bolig_private.resident_portal(c uuid,root uuid,unit uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare s jsonb;ctx jsonb;p bolig_private.resident_portals%rowtype;ev bolig_private.resident_events%rowtype;
 receipt bolig_private.resident_receipts%rowtype;rid uuid;fp bytea;result jsonb;offer jsonb;cv bigint;note text;v_id uuid;
begin
 if action is null or action not in ('get','offer','remove_offer','publish','revoke','document','remove_document','reply','apply','review')
 or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>30000 then raise exception 'Ugyldig portalhandling.' using errcode='22023';end if;
 s:=bolig_private.package_choices(c,root,unit,'get',null,'{}');ctx:=s->'context';
 if action<>'get' and (ctx->>'role' is distinct from 'manager' or (s->>'root_archived')::boolean
 or not exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=unit and not u.archived and not e.archived and not b.archived)) then raise exception 'Prosjektleder og aktiv bolig kreves.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into p from bolig_private.resident_portals where unit_id=unit and root_id=root for update;
 if action<>'get' then
  if p.id is null then insert into bolig_private.resident_portals(root_id,unit_id,created_by) values(root,unit,auth.uid()) returning * into p;end if;
  rid:=(payload->>'request_id')::uuid;fp:=sha256(convert_to(jsonb_build_object('action',action,'payload',payload)::text,'UTF8'));
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  select * into receipt from bolig_private.resident_receipts where portal_id=p.id and actor=auth.uid()::text and request_id=rid;
  if found then if receipt.fingerprint<>fp then raise exception 'Referansen er brukt til et annet forsøk.' using errcode='PT409';end if;return receipt.result;end if;
  if (payload->>'revision')::bigint is distinct from p.revision then raise exception 'Portalen er endret. Kladden er beholdt. Hent siste status.' using errcode='PT409';end if;
  s:=bolig_private.package_choices(c,root,unit,'get',null,'{}');cv:=coalesce((s->'selection'->>'revision')::bigint,0);
  if action='offer' then
   if cv=0 or (payload->>'choice_revision')::bigint is distinct from cv then raise exception 'Lagre boligvalget og hent siste grunnlag.' using errcode='PT409';end if;
   if jsonb_array_length(p.offers)>=12 then raise exception 'Inntil 12 valgmuligheter. Fjern et alternativ først.' using errcode='22023';end if;
   note:=trim(payload->>'title');if jsonb_typeof(payload->'title') is distinct from 'string' or length(note) not between 2 and 100 then raise exception 'Gi valgmuligheten et navn (2–100 tegn).' using errcode='22023';end if;
   if payload->'current'='true'::jsonb then offer:=s->'selection'->'snapshot';
   else
    s:=bolig_private.package_choices(c,root,unit,'preview',cv,payload->'choice');offer:=s->'proposal';
   end if;
   update bolig_private.resident_portals set offers=offers||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'title',note,'source_revision',cv,'snapshot',offer)) where id=p.id;
  elsif action='remove_offer' then
   update bolig_private.resident_portals set offers=(select coalesce(jsonb_agg(o),'[]') from jsonb_array_elements(p.offers) o where o->>'id'<>payload->>'offer_id') where id=p.id;
  elsif action='publish' then
   if coalesce(payload->>'token','') !~ '^[0-9a-f]{64}$' or payload->'reviewed' is distinct from 'true'::jsonb then raise exception 'Se gjennom invitasjonen og bekreft delingen.' using errcode='22023';end if;
   if not exists(select 1 from bolig_private.units where id=unit and length(trim(contact_name))>=2 and contact_email<>'') then raise exception 'Lagre navn og e-post på boligens kontakt først.' using errcode='22023';end if;
   if exists(select 1 from jsonb_array_elements(p.offers) o where (o->>'source_revision')::bigint<>cv) then raise exception 'Boligvalget er endret. Klargjør valgmulighetene på nytt før deling.' using errcode='PT409';end if;
   update bolig_private.resident_portals set token_hash=sha256(convert_to(payload->>'token','UTF8')),expires_at=now()+interval '30 days',revoked=false,
    contact_basis=(select md5(jsonb_build_array(contact_name,contact_email)::text) from bolig_private.units where id=unit),
    menu_version=menu_version+1,source_revision=cv,published_offers=offers where id=p.id;
  elsif action='revoke' then update bolig_private.resident_portals set revoked=true where id=p.id;
  elsif action='document' then
   note:=trim(payload->>'title');
   if length(coalesce(note,'')) not between 2 and 160 or coalesce(payload->>'url','') !~ '^https://[^[:space:]@]+$' or length(payload->>'url')>2000
    or jsonb_array_length(p.documents)>=30 then raise exception 'Oppgi dokumentnavn og en gyldig https-lenke (maks 30 dokumenter).' using errcode='22023';end if;
   update bolig_private.resident_portals set documents=documents||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'title',note,'url',payload->>'url')) where id=p.id;
  elsif action='remove_document' then
   update bolig_private.resident_portals set documents=(select coalesce(jsonb_agg(o),'[]') from jsonb_array_elements(p.documents) o where o->>'id'<>payload->>'document_id') where id=p.id;
  elsif action='reply' then
   note:=trim(payload->>'body');if length(coalesce(note,'')) not between 2 and 2000 then raise exception 'Skriv en melding (2–2000 tegn).' using errcode='22023';end if;
   if (select count(*) from bolig_private.resident_events where portal_id=p.id and kind in ('message','reply'))>=500 then raise exception 'Meldingsgrensen er nådd. Kontakt beboeren direkte.' using errcode='22023';end if;
   insert into bolig_private.resident_events(portal_id,kind,sender,contact_basis,body,actor_id) values(p.id,'reply','manager',coalesce(p.contact_basis,(select md5(jsonb_build_array(contact_name,contact_email)::text) from bolig_private.units where id=unit)),note,auth.uid());
  elsif action in ('apply','review') then
   select * into ev from bolig_private.resident_events where id=(payload->>'event_id')::uuid and portal_id=p.id and contact_basis=p.contact_basis and kind='request' for update;
   if not found or ev.status<>'pending' then raise exception 'Valget er allerede gjennomgått eller er ikke tilgjengelig.' using errcode='PT409';end if;
   note:=trim(payload->>'note');if length(coalesce(note,'')) not between 3 and 2000 then raise exception 'Skriv en tilbakemelding til beboeren (3–2000 tegn).' using errcode='22023';end if;
   if action='apply' then
    if cv is distinct from (ev.snapshot->>'source_revision')::bigint or exists(select 1 from bolig_private.purchase_orders where root_id=root and unit_id=unit and status<>'cancelled')
    or exists(select 1 from bolig_private.commercial_documents where root_id=root and unit_id=unit and status in ('published','accepted','handled')) then
     raise exception 'Boligen har endret grunnlag, delt avtale eller bestilling. Følg opp med en endringsavtale; eksisterende grunnlag beholdes.' using errcode='PT409';end if;
    insert into bolig_private.choice_versions(root_id,unit_id,revision,snapshot,created_by) values(root,unit,cv+1,ev.snapshot->'snapshot',auth.uid());
   end if;
   update bolig_private.resident_events set status=case when action='apply' then 'applied' else 'reviewed' end,review_note=note where id=ev.id;
  end if;
  update bolig_private.resident_portals set revision=revision+1 where id=p.id returning * into p;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'portal_'||action,p.id,p.revision);
 end if;
 s:=bolig_private.package_choices(c,root,unit,'get',null,'{}');
 result:=jsonb_build_object('context',ctx,'root_id',root,'unit_id',unit,'revision',coalesce(p.revision,0),
 'choice_revision',coalesce((s->'selection'->>'revision')::bigint,0),'catalog_revision',s->'revision','rooms_revision',s->'rooms_revision',
 'components',s->'components','options',s->'options','packages',s->'packages',
 'contact',(select jsonb_build_object('name',contact_name,'email',contact_email) from bolig_private.units where id=unit),
 'portal',case when p.id is null then null else bolig_private.portal_state(p)||jsonb_build_object('revoked',p.revoked,'offers_draft',(select coalesce(jsonb_agg(bolig_private.portal_offer(o)),'[]') from jsonb_array_elements(p.offers) o)) end);
 if action<>'get' then insert into bolig_private.resident_receipts values(p.id,auth.uid()::text,rid,fp,result);end if;
 return result;
end$$;
revoke all on function bolig_private.resident_portal(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.resident_portal(uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_resident_portal(p_company_id uuid,p_root_id uuid,p_unit_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.resident_portal(p_company_id,p_root_id,p_unit_id,p_action,p_payload)$$;
revoke all on function public.bolig_resident_portal(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_resident_portal(uuid,uuid,uuid,text,jsonb) to authenticated;

-- Exact same decision contract and acceptance trigger as the existing agreement page.
create function bolig_resident_private.portal_decision(portal bolig_private.resident_portals,action text,expected uuid,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare d bolig_private.commercial_documents%rowtype;root uuid;name text;rid uuid;
begin
 root:=portal.root_id;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into d from bolig_private.commercial_documents where id=expected and root_id=portal.root_id and unit_id=portal.unit_id for update;
 if d.id is null or not exists(select 1 from bolig_private.roots r join bolig_private.firms f on f.company_id=r.company_id
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
revoke all on function bolig_resident_private.portal_decision(bolig_private.resident_portals,text,uuid,jsonb) from public,anon,authenticated,service_role;
create function bolig_resident_private.portal(token text,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare p bolig_private.resident_portals%rowtype;root uuid;rid uuid;fp bytea;receipt bolig_private.resident_receipts%rowtype;
 offer jsonb;note text;result jsonb;actor text;
begin
 if token is null or token !~ '^[0-9a-f]{64}$' or action is null or action not in ('get','request','message','accept','decline')
 or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>5000 then raise exception 'Portallenken er ikke tilgjengelig.' using errcode='42501';end if;
 select root_id into root from bolig_private.resident_portals where token_hash=sha256(convert_to(token,'UTF8'));
 if root is null then raise exception 'Portallenken er ikke tilgjengelig.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into p from bolig_private.resident_portals where token_hash=sha256(convert_to(token,'UTF8')) for update;
 if p.id is null or p.revoked or p.expires_at<=now() or not exists(
 select 1 from bolig_private.units u join bolig_private.roots r on r.id=u.root_id
 join bolig_private.firms f on f.company_id=r.company_id join bolig_private.entrances e on e.id=u.entrance_id
 join bolig_private.blocks b on b.id=e.block_id where u.id=p.unit_id and r.id=p.root_id and f.enabled
 and not r.archived and not u.archived and not e.archived and not b.archived
 and p.contact_basis=md5(jsonb_build_array(u.contact_name,u.contact_email)::text)) then
 raise exception 'Portallenken er utløpt eller tilbakekalt. Kontakt prosjektleder.' using errcode='42501';end if;
 if action in ('accept','decline') then
  perform bolig_resident_private.portal_decision(p,action,(payload->>'document_id')::uuid,payload);
 elsif action in ('request','message') then
  rid:=(payload->>'request_id')::uuid;fp:=sha256(convert_to(jsonb_build_object('action',action,'payload',payload)::text,'UTF8'));
  actor:=encode(p.token_hash,'hex');
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  select * into receipt from bolig_private.resident_receipts where portal_id=p.id and resident_receipts.actor=actor and request_id=rid;
  if found then if receipt.fingerprint<>fp then raise exception 'Referansen er brukt til et annet forsøk.' using errcode='PT409';end if;return bolig_private.portal_state(p);end if;
  note:=trim(payload->>'body');
  if action='request' then
   if (payload->>'menu_version')::bigint is distinct from p.menu_version then raise exception 'Valgmulighetene er endret. Hent siste status og se over valget.' using errcode='PT409';end if;
   select o into offer from jsonb_array_elements(p.published_offers) o where o->>'id'=payload->>'offer_id';
   if offer is null or length(coalesce(note,''))>2000 then raise exception 'Velg en delt valgmulighet.' using errcode='22023';end if;
   if exists(select 1 from bolig_private.resident_events where portal_id=p.id and contact_basis=p.contact_basis and kind='request' and status='pending') then raise exception 'Et valg venter allerede på gjennomgang. Send prosjektleder en melding ved endringer.' using errcode='PT409';end if;
   if (select count(*) from bolig_private.resident_events where portal_id=p.id and kind='request')>=50 then raise exception 'Valggrensen er nådd. Kontakt prosjektleder.' using errcode='22023';end if;
  else
   if length(coalesce(note,'')) not between 2 and 2000 then raise exception 'Skriv en melding (2–2000 tegn).' using errcode='22023';end if;
   if (select count(*) from bolig_private.resident_events where portal_id=p.id and kind in ('message','reply'))>=500 then raise exception 'Meldingsgrensen er nådd. Kontakt prosjektleder direkte.' using errcode='22023';end if;
  end if;
  insert into bolig_private.resident_events(portal_id,kind,sender,contact_basis,body,snapshot) values(p.id,action,'resident',p.contact_basis,coalesce(note,''),offer);
  update bolig_private.resident_portals set revision=revision+1 where id=p.id returning * into p;
  result:=bolig_private.portal_state(p);
  insert into bolig_private.resident_receipts values(p.id,actor,rid,fp,'{}');
 end if;
 return bolig_private.portal_state(p);
end$$;
revoke all on function bolig_resident_private.portal(text,text,jsonb) from public,service_role;
grant execute on function bolig_resident_private.portal(text,text,jsonb) to anon,authenticated;
create function public.bolig_portal(p_token text,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_resident_private.portal(p_token,p_action,p_payload)$$;
revoke all on function public.bolig_portal(text,text,jsonb) from public,service_role;
grant execute on function public.bolig_portal(text,text,jsonb) to anon,authenticated;

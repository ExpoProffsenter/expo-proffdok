-- Applies to existing published portals when enabled at release. Nothing is auto-accepted or emailed.
-- Root override isolates Preview QA; global enablement includes existing Aamodthagen without replacing any project/link.
alter table bolig_private.roots add column resident_confirmation_enabled boolean not null default false;
alter table bolig_private.resident_portals add column changes_until timestamptz,
 add column changes_basis bigint, add column changes_revision bigint not null default 0;

-- Durable receipts belong only to an explicit resident confirmation, never routine mail.
create table bolig_private.confirmation_mail_settings(singleton boolean primary key default true check(singleton),
 enabled boolean not null default false, flow_enabled boolean not null default false, enabled_since timestamptz, test_recipient text, test_root uuid references bolig_private.roots(id), endpoint text not null default '', secret_id uuid not null, check ((test_recipient is null)=(test_root is null)));
insert into bolig_private.confirmation_mail_settings(secret_id) select secret_id from bolig_private.progress_mail_settings where singleton;
create table bolig_private.confirmation_deliveries(
 id uuid primary key default gen_random_uuid(),document_id uuid not null references bolig_private.commercial_documents(id),
 portal_id uuid not null references bolig_private.resident_portals(id),kind text not null check(kind in ('resident','manager')),
 recipient text not null,manager_id uuid references auth.users(id),contact_basis text not null,
 status text not null default 'pending' check(status in ('pending','sending','sent','suppressed')),
 attempt uuid,first_attempt_at timestamptz,reserved_at timestamptz,available_at timestamptz not null default now(),
 sent_at timestamptz,created_at timestamptz not null default clock_timestamp(), unique(document_id,kind));
alter table bolig_private.confirmation_deliveries enable row level security;
alter table bolig_private.confirmation_mail_settings enable row level security;
revoke all on bolig_private.confirmation_deliveries,bolig_private.confirmation_mail_settings from public,anon,authenticated,service_role;


create function bolig_private.direct_confirmation_enabled(root uuid) returns boolean
language sql stable set search_path='' as $$
 select coalesce((select flow_enabled from bolig_private.confirmation_mail_settings where singleton),false)
 or coalesce((select resident_confirmation_enabled from bolig_private.roots where id=root),false)
$$;
revoke all on function bolig_private.direct_confirmation_enabled(uuid) from public,anon,authenticated,service_role;

alter function bolig_private.portal_state(bolig_private.resident_portals) rename to portal_state_before_direct_confirmation;
revoke all on function bolig_private.portal_state_before_direct_confirmation(bolig_private.resident_portals) from public,anon,authenticated,service_role;
create function bolig_private.portal_state(p bolig_private.resident_portals) returns jsonb
language sql stable set search_path='' as $$
 select bolig_private.portal_state_before_direct_confirmation(p)||jsonb_build_object(
 'direct_confirmation',bolig_private.direct_confirmation_enabled(p.root_id),'changes_revision',p.changes_revision,'changes_until',p.changes_until,
 'confirmation',case when d.id is null then null else bolig_private.commercial_view(d) end,
 'confirmation_mail',coalesce((select jsonb_agg(jsonb_build_object('kind',m.kind,'status',case when m.status='sent' then 'sent' when m.status='suppressed' then 'suppressed' when cfg.enabled then 'pending' else 'paused' end)) from bolig_private.confirmation_deliveries m cross join bolig_private.confirmation_mail_settings cfg where m.document_id=d.id),'[]'),
 'choice_locked',d.id is not null and not coalesce(p.changes_until>clock_timestamp(),false),
 'choice_deadline_at',coalesce(p.changes_until,bolig_private.choice_deadline_at(p.root_id,u.choice_deadline)),
 'choice_deadline',case when p.changes_until is not null then (p.changes_until at time zone 'Europe/Oslo')::date else u.choice_deadline end,
 'choices_closed',coalesce(clock_timestamp()>=coalesce(p.changes_until,bolig_private.choice_deadline_at(p.root_id,u.choice_deadline)),false))
 from bolig_private.units u left join lateral(select x.* from bolig_private.commercial_documents x
 where x.root_id=p.root_id and x.unit_id=p.unit_id and x.kind='choice' and x.token_hash is not null and x.status in ('accepted','handled')
 order by x.accepted_at desc,x.created_at desc,x.id desc limit 1) d on true where u.id=p.unit_id
$$;
revoke all on function bolig_private.portal_state(bolig_private.resident_portals) from public,anon,authenticated,service_role;

-- Get/message/old agreement decisions retain their canonical capability validation.
alter function bolig_resident_private.portal(text,text,jsonb) rename to portal_before_direct_confirmation;
revoke all on function bolig_resident_private.portal_before_direct_confirmation(text,text,jsonb) from public,anon,authenticated,service_role;
create function bolig_resident_private.portal(token text,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare state jsonb;p bolig_private.resident_portals%rowtype;prior bolig_private.resident_receipts%rowtype;
 old_doc bolig_private.commercial_documents%rowtype;doc bolig_private.commercial_documents%rowtype;
 offer jsonb;cv bigint;rid uuid;fp bytea;actor text;name text;deadline timestamptz;manager uuid;c uuid;identity jsonb;v int;
begin
 state:=bolig_resident_private.portal_before_direct_confirmation(token,'get','{}');
 if action='request' and exists(select 1 from bolig_private.resident_portals rp where rp.id=(state->>'id')::uuid and bolig_private.direct_confirmation_enabled(rp.root_id)) then raise exception 'Se gjennom varer og pris og bruk Bekreft bestilling.' using errcode='PT409';end if;
 if action is distinct from 'confirm' then return bolig_resident_private.portal_before_direct_confirmation(token,action,payload);end if;
 if state->'direct_confirmation' is distinct from 'true'::jsonb then raise exception 'Bestillingsbekreftelse er ikke aktivert for prosjektet.' using errcode='42501';end if;
 if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>6000 then raise exception 'Ugyldig bekreftelse.' using errcode='22023';end if;
 select * into p from bolig_private.resident_portals where id=(state->>'id')::uuid for update;
 rid:=(payload->>'request_id')::uuid;name:=trim(payload->>'name');actor:=encode(p.token_hash,'hex');
 if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
 fp:=sha256(convert_to(jsonb_build_array('confirm',payload)::text,'UTF8'));
 select * into prior from bolig_private.resident_receipts where portal_id=p.id and resident_receipts.actor=actor and request_id=rid;
 if found then
  if prior.fingerprint<>fp then raise exception 'Referansen tilhører en annen bekreftelse.' using errcode='PT409';end if;
  return bolig_private.portal_state(p);
 end if;
 if payload->'confirmed' is distinct from 'true'::jsonb or jsonb_typeof(payload->'name') is distinct from 'string'
 or length(name) not between 2 and 120 or length(coalesce(payload->>'body',''))>2000 then
 raise exception 'Oppgi fullt navn og bekreft at varer og pris er kontrollert.' using errcode='22023';end if;
 if (payload->>'menu_version')::bigint is distinct from p.menu_version
 or (payload->>'changes_revision')::bigint is distinct from p.changes_revision then
 raise exception 'Valggrunnlaget er endret. Hent siste status og kontroller på nytt.' using errcode='PT409';end if;
 select * into old_doc from bolig_private.commercial_documents where root_id=p.root_id and unit_id=p.unit_id
 and kind='choice' and token_hash is not null and status in ('accepted','handled') order by accepted_at desc,created_at desc,id desc limit 1;
 if old_doc.id is not null and not coalesce(p.changes_until>clock_timestamp(),false) then
 raise exception 'Bestillingen er bekreftet og låst. Kontakt prosjektleder for å åpne for endringer.' using errcode='PT409';end if;
 select coalesce(p.changes_until,bolig_private.choice_deadline_at(p.root_id,u.choice_deadline)) into deadline
 from bolig_private.units u where u.id=p.unit_id;
 if deadline is not null and clock_timestamp()>=deadline then raise exception 'Bestillingsfristen er utløpt.' using errcode='PT409';end if;
 select coalesce(max(revision),0) into cv from bolig_private.choice_versions where root_id=p.root_id and unit_id=p.unit_id;
 if cv is distinct from coalesce(p.changes_basis,p.source_revision) then
 raise exception 'Boligens grunnlag er endret. Prosjektleder må klargjøre valgene på nytt.' using errcode='PT409';end if;
 if p.combine_base_id is not null then offer:=bolig_private.portal_combine(p.published_offers,p.combine_base_id,payload->'offer_ids');
 else
  if payload ? 'offer_ids' then raise exception 'Velg ett publisert pakkealternativ.' using errcode='22023';end if;
  select o into offer from jsonb_array_elements(p.published_offers) o where o->>'id'=payload->>'offer_id';
 end if;
 if offer is null then raise exception 'Velg en publisert pakke.' using errcode='22023';end if;
 -- Only an active, explicitly assigned project leader receives the internal receipt.
 manager:=bolig_private.dialogue_manager(p.root_id);
 select r.company_id into c from bolig_private.roots r where r.id=p.root_id;
 if manager is null or not bolig_private.dialogue_manager_active(c,manager) then
 raise exception 'Prosjektet mangler en aktiv prosjektleder for bestillingsbekreftelsen. Kontakt prosjektleder.' using errcode='PT409';end if;
 if (select count(*) from bolig_private.commercial_documents where root_id=p.root_id and unit_id=p.unit_id)>=200 then raise exception 'Boligen har nådd grensen på 200 avtaleutgaver.' using errcode='22023';end if;
 identity:=state->'identity';
 insert into bolig_private.choice_versions(root_id,unit_id,revision,snapshot,created_by)
 values(p.root_id,p.unit_id,cv+1,offer->'snapshot',manager);
 select 1+count(*) into v from bolig_private.commercial_documents x where x.root_id=p.root_id and x.unit_id=p.unit_id and x.snapshot->>'source'='resident';
 -- Preserve old accepted rows, timestamps and decisions. Current selection is a new immutable version.
 insert into bolig_private.commercial_documents(root_id,unit_id,group_id,version,kind,status,snapshot,created_by,approved_at,accepted_at,accepted_name,decision_request_id,token_hash,expires_at)
 values(p.root_id,p.unit_id,gen_random_uuid(),v,'choice','accepted',jsonb_build_object(
 'source','resident','identity',identity,'goods',bolig_private.portal_goods(offer->'snapshot'->'goods'),
 'before_goods',coalesce(old_doc.snapshot->'goods','[]'::jsonb),'reason',coalesce(payload->>'body',''),
 'choice_revision',cv+1,'total_cents',offer->'snapshot'->'total_cents','delta_cents',
 (offer->'snapshot'->>'total_cents')::bigint-coalesce((old_doc.snapshot->>'total_cents')::bigint,0),
 'base_included',true,'price_details',bolig_private.portal_offer(offer)->'price_details',
 'selected_offer_ids',case when p.combine_base_id is null then jsonb_build_array(offer->'id') else payload->'offer_ids' end,
 'previous_document_id',old_doc.id,'requires_supplier_followup',exists(select 1 from bolig_private.purchase_orders where root_id=p.root_id and unit_id=p.unit_id and status<>'cancelled')),
 manager,clock_timestamp(),clock_timestamp(),name,rid,sha256(convert_to(gen_random_uuid()::text||gen_random_uuid()::text,'UTF8')),p.expires_at) returning * into doc;
 update bolig_private.commercial_documents set status='superseded',revision=revision+1 where root_id=p.root_id and unit_id=p.unit_id
 and kind='choice' and status in ('draft','approved','published');
 update bolig_private.resident_events set status='reviewed',review_note='Beboeren har bekreftet en bestilling. Det tidligere innsendte ønsket beholdes i historikken.'
 where portal_id=p.id and contact_basis=p.contact_basis and kind='request' and status='pending';
 insert into bolig_private.confirmation_deliveries(document_id,portal_id,kind,recipient,contact_basis)
 select doc.id,p.id,'resident',u.contact_email,p.contact_basis from bolig_private.units u where u.id=p.unit_id;
 insert into bolig_private.confirmation_deliveries(document_id,portal_id,kind,recipient,manager_id,contact_basis)
 select doc.id,p.id,'manager',pr.email,manager,p.contact_basis from public.profiles pr where pr.id=manager;
 update bolig_private.resident_portals set changes_until=null,changes_basis=null,changes_revision=changes_revision+1,revision=revision+1 where id=p.id returning * into p;
 insert into bolig_private.resident_receipts values(p.id,actor,rid,fp,jsonb_build_object('document_id',doc.id));
 insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision)
 values(c,p.root_id,manager,'resident_confirm',doc.id,doc.revision);
 return bolig_private.portal_state(p);
end$$;
revoke all on function bolig_resident_private.portal(text,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function bolig_resident_private.portal(text,text,jsonb) to anon,authenticated;

-- Existing authenticated RPC, with read-only preview and per-unit reopening.
alter function bolig_private.resident_portal(uuid,uuid,uuid,text,jsonb) rename to resident_portal_before_direct_confirmation;
revoke all on function bolig_private.resident_portal_before_direct_confirmation(uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
create function bolig_private.resident_portal(c uuid,root uuid,unit uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare result jsonb;p bolig_private.resident_portals%rowtype;rid uuid;fp bytea;prior bolig_private.resident_receipts%rowtype;until_at timestamptz;cv bigint;
begin
 result:=bolig_private.resident_portal_before_direct_confirmation(c,root,unit,'get','{}');
 if action in ('reopen','close_changes','preview') then
  if result->'context'->>'role' is distinct from 'manager' or (result->'context'->>'enabled')::boolean is not true then
   raise exception 'Prosjektledertilgang kreves.' using errcode='42501';end if;
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
  select * into p from bolig_private.resident_portals where root_id=root and unit_id=unit for update;
  if p.id is null then raise exception 'Klargjør portalen først.' using errcode='22023';end if;
  if action='preview' then return result||jsonb_build_object('preview',bolig_private.portal_state(p));end if;
  if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>2000 then raise exception 'Ugyldig gjenåpning.' using errcode='22023';end if;
  if not exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
   join bolig_private.roots r on r.id=u.root_id where u.id=unit and r.id=root and not r.archived and not u.archived and not e.archived and not b.archived)
  then raise exception 'Aktiv bolig kreves.' using errcode='42501';end if;
  rid:=(payload->>'request_id')::uuid;fp:=sha256(convert_to(jsonb_build_array(action,payload)::text,'UTF8'));
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  select * into prior from bolig_private.resident_receipts where portal_id=p.id and actor=auth.uid()::text and request_id=rid;
  if found then
   if prior.fingerprint<>fp then raise exception 'Referansen er brukt til en annen handling.' using errcode='PT409';end if;
   return result;
  end if;
  if (payload->>'revision')::bigint is distinct from p.revision then raise exception 'Portalen er endret. Hent siste status.' using errcode='PT409';end if;
  if action='reopen' then
   if exists(select 1 from bolig_private.commercial_documents d where d.root_id=root and d.unit_id=unit and d.kind='change' and d.status in ('accepted','handled') and d.snapshot->>'source' is distinct from 'shop') then
    raise exception 'Boligen har en individuell endringsavtale. Følg opp denne i Endringer og beboeraksept før nye pakkevalg; tidligere avtaler og ordre beholdes.' using errcode='PT409';end if;
   if p.revoked or p.contact_basis is distinct from (select md5(jsonb_build_array(contact_name,contact_email)::text) from bolig_private.units where id=unit) then
    raise exception 'Klargjør gyldig portaltilgang for beboeren først.' using errcode='PT409';end if;
   until_at:=bolig_private.choice_deadline_at(root,(payload->>'deadline')::date);
   if until_at is null or until_at<=clock_timestamp() or until_at>clock_timestamp()+interval '366 days' then
    raise exception 'Velg en ny frist frem i tid (inntil ett år).' using errcode='22023';end if;
   select coalesce(max(revision),0) into cv from bolig_private.choice_versions where root_id=root and unit_id=unit;
   update bolig_private.resident_portals set changes_until=until_at,changes_basis=cv,changes_revision=changes_revision+1,
    expires_at=greatest(expires_at,until_at+interval '1 day'),revision=revision+1 where id=p.id;
  else update bolig_private.resident_portals set changes_until=null,changes_basis=null,changes_revision=changes_revision+1,revision=revision+1 where id=p.id;
  end if;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision)
   values(c,root,auth.uid(),'portal_'||action,p.id,p.revision+1);
  result:=bolig_private.resident_portal_before_direct_confirmation(c,root,unit,'get','{}');
  insert into bolig_private.resident_receipts values(p.id,auth.uid()::text,rid,fp,'{}');
 elsif action in ('apply','review') and bolig_private.direct_confirmation_enabled(root) then
  raise exception 'Beboeren bekrefter bestillingen selv i portalen. Innsendte ønsker er beholdt i historikken.' using errcode='PT409';
 else result:=bolig_private.resident_portal_before_direct_confirmation(c,root,unit,action,payload);
 end if;
 return result;
end$$;
revoke all on function bolig_private.resident_portal(uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function bolig_private.resident_portal(uuid,uuid,uuid,text,jsonb) to authenticated;

-- Existing frozen-version image signer also serves exact confirmed historic goods.
create or replace function bolig_resident_private.image_paths(token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare state jsonb;root uuid;company uuid;result jsonb;
begin
 state:=public.bolig_portal(token,'get','{}');
 select p.root_id,r.company_id into root,company from bolig_private.resident_portals p join bolig_private.roots r on r.id=p.root_id where p.id=(state->>'id')::uuid;
 select coalesce(jsonb_agg(distinct path),'[]') into result from (
 select substring(g->>'image_url' from '/storage/v1/object/public/bolig-catalog-images/([^?#]+)$') path
 from jsonb_array_elements((state->'offers')||coalesce((select jsonb_agg(jsonb_build_object('goods',d->'snapshot'->'goods')) from jsonb_array_elements(state->'agreements') d),'[]')) o
 cross join lateral jsonb_array_elements(coalesce(o->'goods','[]')) g
 ) paths where path ~ ('^'||company::text||'/'||root::text||'/[a-f0-9-]{36}\.jpg$');
 return result;
end$$;
notify pgrst,'reload schema';

create function bolig_private.confirmation_delivery_valid(job bolig_private.confirmation_deliveries) returns boolean
language sql stable set search_path='' as $$
 select exists(select 1 from bolig_private.resident_portals p join bolig_private.units u on u.id=p.unit_id
 join bolig_private.roots r on r.id=p.root_id join bolig_private.firms f on f.company_id=r.company_id
 join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
 join bolig_private.commercial_documents d on d.id=job.document_id
 join bolig_private.confirmation_mail_settings cfg on cfg.singleton and cfg.enabled and cfg.enabled_since is not null
 where p.id=job.portal_id and d.unit_id=u.id and d.root_id=r.id and d.status in ('accepted','handled') and d.snapshot->>'source'='resident'
 and (cfg.test_root is null or p.root_id=cfg.test_root) and job.created_at>=cfg.enabled_since and not p.revoked and f.enabled and not r.archived and not u.archived and not e.archived and not b.archived
 and p.contact_basis=job.contact_basis and job.contact_basis=md5(jsonb_build_array(u.contact_name,u.contact_email)::text)
 and job.recipient ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 and case when job.kind='resident' then lower(job.recipient)=lower(u.contact_email)
 else job.manager_id=bolig_private.dialogue_manager(r.id) and bolig_private.dialogue_manager_active(r.company_id,job.manager_id)
 and exists(select 1 from public.profiles pr where pr.id=job.manager_id and lower(pr.email)=lower(job.recipient)) end)
$$;
revoke all on function bolig_private.confirmation_delivery_valid(bolig_private.confirmation_deliveries) from public,anon,authenticated,service_role;
create function public.bolig_confirmation_worker_authorize(p_token text) returns boolean
language sql security definer set search_path='' as $$
 select coalesce(length(p_token)=64 and exists(select 1 from bolig_private.confirmation_mail_settings cfg
 join vault.decrypted_secrets v on v.id=cfg.secret_id where cfg.singleton and cfg.enabled and cfg.enabled_since is not null
 and sha256(convert_to(p_token,'UTF8'))=sha256(convert_to(v.decrypted_secret,'UTF8'))),false)
$$;
revoke all on function public.bolig_confirmation_worker_authorize(text) from public,anon,authenticated;
grant execute on function public.bolig_confirmation_worker_authorize(text) to service_role;
create function public.bolig_confirmation_worker_reserve() returns jsonb
language plpgsql security definer set search_path='' as $$
declare job bolig_private.confirmation_deliveries%rowtype;d bolig_private.commercial_documents%rowtype;
begin
 if not exists(select 1 from bolig_private.confirmation_mail_settings where singleton and enabled and enabled_since is not null) then return null;end if;
 for job in select * from bolig_private.confirmation_deliveries where
 (status='pending' and available_at<=now()) or (status='sending' and reserved_at<now()-interval '5 minutes')
 order by created_at,id for update skip locked limit 30 loop
  if not bolig_private.confirmation_delivery_valid(job) or coalesce(job.first_attempt_at,now())<now()-interval '23 hours' then
   update bolig_private.confirmation_deliveries set status='suppressed' where id=job.id;continue;
  end if;
  update bolig_private.confirmation_deliveries set status='sending',attempt=gen_random_uuid(),reserved_at=now(),
   first_attempt_at=coalesce(first_attempt_at,now()) where id=job.id returning * into job;
  select * into d from bolig_private.commercial_documents where id=job.document_id;
  return jsonb_build_object('id',job.id,'attempt',job.attempt,'kind',job.kind,'to',coalesce((select test_recipient from bolig_private.confirmation_mail_settings where singleton),job.recipient),
   'document',bolig_private.commercial_view(d),'company',d.snapshot->'identity'->>'company');
 end loop;
 return null;
end$$;
revoke all on function public.bolig_confirmation_worker_reserve() from public,anon,authenticated;
grant execute on function public.bolig_confirmation_worker_reserve() to service_role;
create function public.bolig_confirmation_worker_validate(p_id uuid,p_attempt uuid) returns boolean
language sql security definer set search_path='' as $$
 select coalesce((select status='sending' and attempt=p_attempt and reserved_at>now()-interval '5 minutes'
 and bolig_private.confirmation_delivery_valid(d) from bolig_private.confirmation_deliveries d where id=p_id),false)
$$;
revoke all on function public.bolig_confirmation_worker_validate(uuid,uuid) from public,anon,authenticated;
grant execute on function public.bolig_confirmation_worker_validate(uuid,uuid) to service_role;
create function public.bolig_confirmation_worker_finish(p_id uuid,p_attempt uuid,p_sent boolean) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if p_sent is null then return false;end if;
 update bolig_private.confirmation_deliveries set status=case when p_sent then 'sent' else 'pending' end,
 sent_at=case when p_sent then now() else null end,available_at=now()+interval '5 minutes'
 where id=p_id and status='sending' and attempt=p_attempt;
 return found;
end$$;
revoke all on function public.bolig_confirmation_worker_finish(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.bolig_confirmation_worker_finish(uuid,uuid,boolean) to service_role;
create function bolig_private.invoke_confirmation_worker() returns void
language plpgsql security definer set search_path='' as $$
declare cfg bolig_private.confirmation_mail_settings%rowtype;token text;
begin
 select * into cfg from bolig_private.confirmation_mail_settings where singleton;
 if not cfg.enabled or cfg.enabled_since is null or cfg.endpoint !~ '^https://[a-z0-9]{20}\.supabase\.co/functions/v1/bolig-confirmation-email$'
 or not exists(select 1 from bolig_private.confirmation_deliveries where status in ('pending','sending')) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 if token is null then return;end if;
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('content-type','application/json','x-bolig-worker-token',token),body:='{}'::jsonb,timeout_milliseconds:=40000);
end$$;
revoke all on function bolig_private.invoke_confirmation_worker() from public,anon,authenticated,service_role;
select cron.schedule('bolig-confirmation-email','* * * * *','select bolig_private.invoke_confirmation_worker();');

do $$declare body text; anchor text:=$a$and x.status in ('accepted','handled') order by x.accepted_at,x.created_at,x.id$a$;begin
 body:=pg_get_functiondef('bolig_private.work_order(uuid,uuid,uuid)'::regprocedure);
 if position(anchor in body)=0 then raise exception 'Unexpected work-order change loop';end if;
 execute replace(body,anchor,$a$and x.status in ('accepted','handled') and (base.snapshot->>'source' is distinct from 'resident' or x.snapshot->>'source'='shop' or x.accepted_at>=base.accepted_at) order by x.accepted_at,x.created_at,x.id$a$);
end$$;

-- A published portal uses direct confirmation; standalone manually prepared agreements remain supported.
alter function bolig_private.commerce(uuid,uuid,uuid,text,jsonb) rename to commerce_before_direct_confirmation;
revoke all on function bolig_private.commerce_before_direct_confirmation(uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
create function bolig_private.commerce(c uuid,root uuid,unit uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare result jsonb;
begin
 result:=bolig_private.commerce_before_direct_confirmation(c,root,unit,action,payload);
 return result||jsonb_build_object('resident_direct_confirmation',exists(select 1 from bolig_private.resident_portals p
 where p.root_id=root and p.unit_id=unit and not p.revoked and p.token_hash is not null and bolig_private.direct_confirmation_enabled(root)));
end$$;
revoke all on function bolig_private.commerce(uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function bolig_private.commerce(uuid,uuid,uuid,text,jsonb) to authenticated;
notify pgrst,'reload schema';

-- Contact replacement revokes any old permission to change choices as well as links.
do $$declare name text;body text;anchor text:='set revoked=true,token_hash=null,revision=revision+1';begin
 foreach name in array array['revoke_contact_links','revoke_additional_contact_links'] loop
  select pg_get_functiondef(p.oid) into body from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='bolig_private' and p.proname=name;
  if position(anchor in body)=0 then raise exception 'Unexpected contact-revocation definition: %',name;end if;
  execute replace(body,anchor,'set revoked=true,token_hash=null,changes_until=null,changes_basis=null,changes_revision=changes_revision+1,revision=revision+1');
 end loop;
end$$;

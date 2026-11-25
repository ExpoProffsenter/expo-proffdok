-- Explicit, reviewed order e-mails. Canonical immutable snapshots, one send per order.
alter table bolig_private.purchase_orders add column mail_request_id uuid;
create table bolig_private.order_mail_attempts (
 id uuid primary key,
 root_id uuid not null references bolig_private.roots(id) on delete cascade,
 unit_id uuid not null references bolig_private.units(id) on delete cascade,
 order_id uuid not null references bolig_private.purchase_orders(id),
 actor_id uuid not null references auth.users(id),
 input jsonb not null,
 snapshot jsonb not null,
 created_at timestamptz not null default clock_timestamp(),
 provider_id text,
 sent_at timestamptz
);
create index bolig_order_mail_root on bolig_private.order_mail_attempts(root_id,unit_id);
create index bolig_order_mail_order on bolig_private.order_mail_attempts(order_id);
create index bolig_order_mail_actor on bolig_private.order_mail_attempts(actor_id,created_at);
alter table bolig_private.order_mail_attempts enable row level security;
revoke all on bolig_private.order_mail_attempts from public,anon,authenticated,service_role;

create function bolig_private.order_mail(c uuid,root uuid,unit uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;o bolig_private.purchase_orders%rowtype;m bolig_private.order_mail_attempts%rowtype;
 snapshot jsonb;goods jsonb:='[]';item jsonb;fag text;email text;sender text;company jsonb;request_id uuid;idx int:=0;state jsonb;
begin
 state:=bolig_private.deliveries(c,root,unit,'get','{}');ctx:=state->'context';
 if ctx->>'role' is distinct from 'manager' or not coalesce(public.get_cordel_export_access(),false) then raise exception 'Prosjektleder- og Cordel-tilgang kreves for bestilling med vedlegg.' using errcode='42501';end if;
 select * into r from bolig_private.roots where id=root and company_id=c for share;
 if r.archived or not exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=unit and not u.archived and not e.archived and not b.archived) then raise exception 'Prosjekt og bolig må være aktive.' using errcode='42501';end if;
 if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>200000 or coalesce(payload->>'request_id','') !~ '^[0-9a-f-]{36}$' then raise exception 'Ugyldig bestillingsforsøk.' using errcode='22023';end if;
 request_id:=(payload->>'request_id')::uuid;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into m from bolig_private.order_mail_attempts where id=request_id;
 if action in ('inspect','begin') then
  if not found or m.root_id<>root or m.unit_id<>unit or m.actor_id<>auth.uid() then raise exception 'Bestillingsforsøket er ikke tilgjengelig.' using errcode='42501';end if;
  if m.provider_id is not null then return jsonb_build_object('id',m.id,'snapshot',m.snapshot,'sent',true);end if;
  if m.created_at<clock_timestamp()-interval '23 hours' then raise exception 'Forsøket er utløpt. Kontroller mottatt e-post før videre bestilling. Ikke lag et nytt forsøk.' using errcode='PT409';end if;
  select * into o from bolig_private.purchase_orders where id=m.order_id for update;
  if o.status<>'prepared' or o.snapshot is distinct from m.input->'order_snapshot' or (o.mail_request_id is not null and o.mail_request_id<>m.id) then raise exception 'Ordren er endret eller har et annet sendeforsøk. Kontroller bestillingen.' using errcode='PT409';end if;
  if action='begin' then update bolig_private.purchase_orders set mail_request_id=m.id where id=o.id;end if;
  return jsonb_build_object('id',m.id,'snapshot',m.snapshot,'sent',false);
 elsif action is distinct from 'prepare' then raise exception 'Ukjent handling.' using errcode='22023';end if;
 if found then
  if m.root_id<>root or m.unit_id<>unit or m.actor_id<>auth.uid() or m.input->'request' is distinct from payload then raise exception 'Sendereferansen er brukt til et annet forsøk.' using errcode='PT409';end if;
  return jsonb_build_object('id',m.id,'snapshot',m.snapshot,'sent',m.provider_id is not null);
 end if;
 select * into o from bolig_private.purchase_orders where id=(payload->>'order_id')::uuid and root_id=root and unit_id=unit for update;
 if not found or o.status<>'prepared' or o.mail_request_id is not null then raise exception 'Kun et klargjort grunnlag uten pågående sending kan sendes.' using errcode='PT409';end if;
 if (select count(*) from bolig_private.order_mail_attempts where actor_id=auth.uid() and created_at>now()-interval '1 hour')>=30 then raise exception 'For mange bestillingsforsøk. Vent litt.' using errcode='54000';end if;
 if (payload->>'revision')::bigint is distinct from (state->>'revision')::bigint then raise exception 'Bestillingsgrunnlaget er endret. Se over siste versjon.' using errcode='PT409';end if;
 email:=lower(trim(payload->>'to'));
 if jsonb_typeof(payload->'to') is distinct from 'string' or length(email)>254 or email !~ '^[^[:space:]@,;<>]+@[^[:space:]@,;<>]+[.][^[:space:]@,;<>]+$' or jsonb_typeof(payload->'fag') is distinct from 'array' or jsonb_array_length(payload->'fag')<>jsonb_array_length(o.snapshot->'goods') then raise exception 'Kontroller mottaker og Cordel-fagområde for hver vare.' using errcode='22023';end if;
 for item in select value from jsonb_array_elements(o.snapshot->'goods') loop
  fag:=trim(payload->'fag'->>idx);
  if jsonb_typeof(payload->'fag'->idx) is distinct from 'string' or coalesce(length(fag),0) not between 1 and 160 or fag ~ '[;[:cntrl:]]' or coalesce(trim(item->>'sku'),'')='' or item->>'sku' ~ '[;[:cntrl:]]' or fag !~ '^[ -~ -ÿ€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]+$' or item->>'sku' !~ '^[ -~ -ÿ€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]+$' then raise exception 'Hver vare må ha gyldig varenummer og leverandør/fagområde for Cordel.' using errcode='22023';end if;
  -- Explicit allowlist: never serialize margins, contact records or source prices.
  goods:=goods||jsonb_build_array(jsonb_build_object('name',item->>'name','sku',item->>'sku','quantity',item->'quantity','unit',item->>'unit','room_name',coalesce(item->>'room_name','Felles for boligen'),'section_name',coalesce(item->>'section_name',''),'supplier',fag));
  idx:=idx+1;
 end loop;
 select au.email into sender from auth.users au where au.id=auth.uid();
 company:=public.work_profile_company_profile(c);
 if coalesce(sender,'')='' or coalesce(company->>'companyName','')='' then raise exception 'Kontroller firmaprofil og avsenderens e-postadresse.' using errcode='22023';end if;
 snapshot:=jsonb_build_object('to',email,'replyTo',sender,'company',company,'order_id',o.id,'order_number',o.number,'reference',o.snapshot->>'reference','supplier_reference',o.snapshot->>'supplier_reference','supplier',o.snapshot->>'supplier','identity',o.snapshot->'identity','address',o.snapshot->>'address','requested_date',o.snapshot->>'requested_date','note',o.snapshot->>'note','delivery_note',o.snapshot->>'delivery_note','delivery_mode',o.snapshot->>'delivery_mode','goods',goods);
 insert into bolig_private.order_mail_attempts(id,root_id,unit_id,order_id,actor_id,input,snapshot) values(request_id,root,unit,o.id,auth.uid(),jsonb_build_object('request',payload,'order_snapshot',o.snapshot),snapshot) returning * into m;
 return jsonb_build_object('id',m.id,'snapshot',m.snapshot,'sent',false);
end$$;
revoke all on function bolig_private.order_mail(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.order_mail(uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_order_mail(p_company_id uuid,p_root_id uuid,p_unit_id uuid,p_action text,p_payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select bolig_private.order_mail(p_company_id,p_root_id,p_unit_id,p_action,p_payload)$$;
revoke all on function public.bolig_order_mail(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_order_mail(uuid,uuid,uuid,text,jsonb) to authenticated;

create function bolig_private.order_mail_complete(request_id uuid,provider text) returns void language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare m bolig_private.order_mail_attempts%rowtype;o bolig_private.purchase_orders%rowtype;
begin
 if coalesce(length(provider),0) not between 1 and 150 then raise exception 'Ugyldig leverandørkvittering.' using errcode='22023';end if;
 select * into m from bolig_private.order_mail_attempts where id=request_id;
 if not found then raise exception 'Sendeforsøket finnes ikke.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||m.root_id::text,0));
 select * into m from bolig_private.order_mail_attempts where id=request_id for update;
 if m.provider_id is not null then return;end if;
 select * into o from bolig_private.purchase_orders where id=m.order_id for update;
 if o.mail_request_id is distinct from request_id then raise exception 'Sendeforsøket er ikke aktivt.' using errcode='22023';end if;
 update bolig_private.order_mail_attempts set provider_id=provider,sent_at=clock_timestamp() where id=request_id;
 update bolig_private.purchase_orders set status='ordered',ordered_at=(now() at time zone 'Europe/Oslo')::date where id=o.id;
 update bolig_private.delivery_states set revision=revision+1 where root_id=m.root_id;
 insert into bolig_private.delivery_events(root_id,unit_id,order_id,action,payload,actor_id) values(m.root_id,m.unit_id,o.id,'mail_sent',jsonb_build_object('to',m.snapshot->>'to','request_id',m.id),m.actor_id);
end$$;
revoke all on function bolig_private.order_mail_complete(uuid,text) from public,anon,authenticated;
grant execute on function bolig_private.order_mail_complete(uuid,text) to service_role;
create function public.bolig_order_mail_complete(p_request_id uuid,p_provider_id text) returns void language sql security invoker set search_path='' as $$select bolig_private.order_mail_complete(p_request_id,p_provider_id)$$;
revoke all on function public.bolig_order_mail_complete(uuid,text) from public,anon,authenticated;
grant execute on function public.bolig_order_mail_complete(uuid,text) to service_role;
grant usage on schema bolig_private to service_role;

-- Guard local edits as soon as delivery to the provider may have started.
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_private.deliveries(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 anchor:=$a$  if action='ordered' then$a$;
 if position(anchor in body)=0 then raise exception 'Missing delivery send guard anchor';end if;
 body:=replace(body,anchor,$a$  if o.mail_request_id is not null and action in ('ordered','cancel','supplier_reference') then raise exception 'En e-postsending er påbegynt. Avklar samme sendeforsøk før du endrer ordren.' using errcode='PT409';end if;
  if action='ordered' then$a$);
 execute body;
end$patch$;

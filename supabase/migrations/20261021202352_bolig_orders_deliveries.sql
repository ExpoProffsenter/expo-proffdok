-- Internal order records and goods receipts. No e-mail/Cordel side effects.
create table bolig_private.delivery_states (
 root_id uuid primary key references bolig_private.roots(id) on delete cascade,
 revision bigint not null default 0,
 settings jsonb not null default '{"address":"","note":""}',
 units jsonb not null default '{}'
);
create table bolig_private.purchase_orders (
 id uuid primary key default gen_random_uuid(),
 root_id uuid not null references bolig_private.roots(id) on delete cascade,
 unit_id uuid not null references bolig_private.units(id) on delete cascade,
 source_choice_revision bigint not null,
 source_draft_revision bigint not null,
 number text not null,
 status text not null check(status in ('prepared','ordered','partial','delivered','cancelled')),
 snapshot jsonb not null,
 received jsonb not null default '{}',
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default clock_timestamp(),
 ordered_at date
);
create index bolig_purchase_orders_unit on bolig_private.purchase_orders(unit_id,created_at desc);
create index bolig_purchase_orders_root on bolig_private.purchase_orders(root_id);
create index bolig_purchase_orders_actor on bolig_private.purchase_orders(created_by);
create table bolig_private.delivery_events (
 id uuid primary key default gen_random_uuid(),
 root_id uuid not null references bolig_private.roots(id) on delete cascade,
 unit_id uuid not null references bolig_private.units(id) on delete cascade,
 order_id uuid references bolig_private.purchase_orders(id),
 action text not null,
 payload jsonb not null,
 actor_id uuid not null references auth.users(id),
 created_at timestamptz not null default clock_timestamp()
);
create index bolig_delivery_events_root on bolig_private.delivery_events(root_id,unit_id,created_at);
create index bolig_delivery_events_order on bolig_private.delivery_events(order_id);
create index bolig_delivery_events_actor on bolig_private.delivery_events(actor_id);
create table bolig_private.delivery_receipts (
 root_id uuid not null references bolig_private.roots(id) on delete cascade,
 actor_id uuid not null references auth.users(id),
 request_id uuid not null,
 action text not null,
 payload jsonb not null,
 result jsonb not null,
 primary key(root_id,actor_id,request_id)
);
create index bolig_delivery_receipts_actor on bolig_private.delivery_receipts(actor_id);
alter table bolig_private.delivery_states enable row level security;
alter table bolig_private.purchase_orders enable row level security;
alter table bolig_private.delivery_events enable row level security;
alter table bolig_private.delivery_receipts enable row level security;
revoke all on bolig_private.delivery_states,bolig_private.purchase_orders,bolig_private.delivery_events,bolig_private.delivery_receipts from public,anon,authenticated,service_role;

create function bolig_private.deliveries(c uuid,root uuid,unit uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;s bolig_private.delivery_states%rowtype;
 d bolig_private.order_draft_versions%rowtype;cv bolig_private.choice_versions%rowtype;
 o bolig_private.purchase_orders%rowtype;receipt bolig_private.delivery_receipts%rowtype;
 us jsonb;goods jsonb;item jsonb;line jsonb;counts jsonb;result jsonb;request_id uuid;
 positions int[];pos int;qty numeric;total numeric;address text;ordered_day date;fully boolean;has_any boolean;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) then raise exception 'Boligprosjekter er ikke tilgjengelig.' using errcode='42501';end if;
 select * into r from bolig_private.roots where id=root and company_id=c for share;
 if not found or not exists(select 1 from bolig_private.units where id=unit and root_id=root) then raise exception 'Boligen tilhører ikke aktivt hovedprosjekt og firma.' using errcode='42501';end if;
 if action is distinct from 'get' then
  if ctx->>'role' is distinct from 'manager' or r.archived or not exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=unit and not u.archived and not e.archived and not b.archived) then raise exception 'Prosjektleder og aktiv bolig kreves.' using errcode='42501';end if;
  if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>100000 or coalesce(payload->>'request_id','') !~ '^[0-9a-f-]{36}$' then raise exception 'Ugyldig bestillingsgrunnlag.' using errcode='22023';end if;
  request_id:=(payload->>'request_id')::uuid;
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
  select * into receipt from bolig_private.delivery_receipts where root_id=root and actor_id=auth.uid() and delivery_receipts.request_id=request_id;
  if found then
   if receipt.action is distinct from action or receipt.payload is distinct from payload then raise exception 'Referansen er brukt til et annet forsøk.' using errcode='PT409';end if;
   return receipt.result;
  end if;
  insert into bolig_private.delivery_states(root_id) values(root) on conflict do nothing;
 end if;
 select * into s from bolig_private.delivery_states where root_id=root;
 if action is distinct from 'get' and (payload->>'revision')::bigint is distinct from coalesce(s.revision,0) then raise exception 'Bestillinger eller leveringsoppsett er endret. Hent siste grunnlag og se over kladden.' using errcode='PT409';end if;
 us:=coalesce(s.units->unit::text,'{"address_mode":"common","address":"","order_mode":"combined","delivery_mode":"combined"}');
 if action='settings' then
  if jsonb_typeof(payload->'settings') is distinct from 'object' or jsonb_typeof(payload->'settings'->'address') is distinct from 'string' or length(payload->'settings'->>'address')>1000 or jsonb_typeof(payload->'settings'->'note') is distinct from 'string' or length(payload->'settings'->>'note')>1000 then raise exception 'Kontroller leveringsadresse og merknad.' using errcode='22023';end if;
  update bolig_private.delivery_states set settings=jsonb_build_object('address',trim(payload->'settings'->>'address'),'note',trim(payload->'settings'->>'note')) where root_id=root;
 elsif action='unit_settings' then
  item:=payload->'settings';
  if jsonb_typeof(item) is distinct from 'object' or coalesce(item->>'address_mode','') not in ('common','individual') or coalesce(item->>'order_mode','') not in ('combined','split') or coalesce(item->>'delivery_mode','') not in ('combined','partial') or jsonb_typeof(item->'address') is distinct from 'string' or length(item->>'address')>1000 then raise exception 'Kontroller boligoppsettet.' using errcode='22023';end if;
  us:=jsonb_build_object('address_mode',item->>'address_mode','address',trim(item->>'address'),'order_mode',item->>'order_mode','delivery_mode',item->>'delivery_mode');
  update bolig_private.delivery_states set units=jsonb_set(units,array[unit::text],us,true) where root_id=root;
 elsif action='create' then
  select * into cv from bolig_private.choice_versions where unit_id=unit order by revision desc limit 1;
  select * into d from bolig_private.order_draft_versions where unit_id=unit order by revision desc limit 1;
  if payload->'review' is distinct from 'true'::jsonb then raise exception 'Kontroller bestillingen før lagring.' using errcode='22023';end if;
  if d.revision is null or d.revision is distinct from (payload->>'draft_revision')::bigint or d.source_choice_revision is distinct from cv.revision then raise exception 'Lagre et bestillingsutkast fra gjeldende boligvalg først.' using errcode='PT409';end if;
  if exists(select 1 from bolig_private.purchase_orders where unit_id=unit and status<>'cancelled' and source_choice_revision<>cv.revision) then raise exception 'Boligvalget er endret etter en bestilling. Avklar tidligere bestillinger før flere varer bestilles.' using errcode='PT409';end if;
  if (select count(*) from bolig_private.purchase_orders where unit_id=unit)>=100 then raise exception 'Inntil 100 bestillinger per bolig.' using errcode='22023';end if;
  if jsonb_typeof(payload->'positions') is distinct from 'array' or jsonb_array_length(payload->'positions') not between 1 and 1000 or exists(select 1 from jsonb_array_elements(payload->'positions') x where jsonb_typeof(x)<>'number' or x::text !~ '^[0-9]+$') then raise exception 'Velg minst én gyldig varelinje.' using errcode='22023';end if;
  select array_agg(x::int) into positions from jsonb_array_elements_text(payload->'positions') x;
  if cardinality(positions)<>(select count(distinct x) from unnest(positions) x) or exists(select 1 from unnest(positions) x where x<0 or x>=jsonb_array_length(d.snapshot->'goods')) then raise exception 'Kontroller vareutvalget.' using errcode='22023';end if;
  select jsonb_agg(g order by n) into goods from jsonb_array_elements(d.snapshot->'goods') with ordinality x(g,n) where (n-1)::int=any(positions);
  if exists(select 1 from jsonb_array_elements(goods) g join bolig_private.purchase_orders po on po.unit_id=unit and po.status<>'cancelled' cross join lateral jsonb_array_elements(po.snapshot->'goods') og where bolig_private.same_good(g,og)) then raise exception 'En eller flere varer finnes allerede i en bestilling. Se over gjenstående varer.' using errcode='PT409';end if;
  if us->>'order_mode'='combined' and (exists(select 1 from bolig_private.purchase_orders where unit_id=unit and status<>'cancelled') or cardinality(positions)<>jsonb_array_length(d.snapshot->'goods')) then raise exception 'Samlet bestilling skal ha alle varer. Velg delt bestilling for å bestille i flere omganger.' using errcode='22023';end if;
  address:=case when us->>'address_mode'='individual' then us->>'address' else s.settings->>'address' end;
  if coalesce(length(trim(address)),0)=0 then raise exception 'Legg inn leveringsadresse først.' using errcode='22023';end if;
  foreach address in array array['reference','supplier','supplier_reference','note','requested_date'] loop
   if jsonb_typeof(payload->address) is distinct from 'string' or length(payload->>address)>(case when address='note' then 1000 else 160 end) then raise exception 'Kontroller bestillingsfeltene.' using errcode='22023';end if;
  end loop;
  if trim(payload->>'reference')='' or trim(payload->>'supplier')='' then raise exception 'Fyll inn Vårt ordrenummer og leverandør.' using errcode='22023';end if;
  if payload->>'requested_date'<>'' then ordered_day:=(payload->>'requested_date')::date;end if;
  address:=case when us->>'address_mode'='individual' then us->>'address' else s.settings->>'address' end;
  insert into bolig_private.purchase_orders(root_id,unit_id,source_choice_revision,source_draft_revision,number,status,snapshot,created_by)
  values(root,unit,cv.revision,d.revision,'B-'||(s.revision+1),'prepared',jsonb_build_object('goods',goods,'identity',(select jsonb_build_object('project',r.title,'project_reference',r.reference,'unit_id',u.id,'number',u.number,'official_number',u.official_number,'block',b.name,'address',e.address,'floor',u.floor) from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=unit),'reference',trim(payload->>'reference'),'supplier',trim(payload->>'supplier'),'supplier_reference',trim(payload->>'supplier_reference'),'note',trim(payload->>'note'),'requested_date',payload->>'requested_date','address',address,'delivery_note',s.settings->>'note','order_mode',us->>'order_mode','delivery_mode',us->>'delivery_mode'),auth.uid()) returning * into o;
 elsif action in ('ordered','receive','cancel','supplier_reference') then
  select * into o from bolig_private.purchase_orders where id=(payload->>'order_id')::uuid and unit_id=unit and root_id=root for update;
  if not found then raise exception 'Bestillingen er ikke tilgjengelig.' using errcode='42501';end if;
  if action='ordered' then
   if o.status<>'prepared' or payload->'confirmed' is distinct from 'true'::jsonb or coalesce(payload->>'date','')='' then raise exception 'Bekreft at bestillingen faktisk er lagt hos leverandøren.' using errcode='22023';end if;
   ordered_day:=(payload->>'date')::date;
   if ordered_day>current_date then raise exception 'Bestillingsdato kan ikke være i fremtiden.' using errcode='22023';end if;
   update bolig_private.purchase_orders set status='ordered',ordered_at=ordered_day where id=o.id;
  elsif action='cancel' then
   if o.status<>'prepared' or payload->'confirmed' is distinct from 'true'::jsonb then raise exception 'Kun klargjort grunnlag kan annulleres her. Avklar bestilte varer med leverandøren.' using errcode='22023';end if;
   update bolig_private.purchase_orders set status='cancelled' where id=o.id;
  elsif action='supplier_reference' then
   if o.status='cancelled' or jsonb_typeof(payload->'supplier_reference') is distinct from 'string' or length(payload->>'supplier_reference')>160 then raise exception 'Kontroller leverandørordrenummeret.' using errcode='22023';end if;
   -- Metadata only: frozen goods, identity, addresses and purchase references stay unchanged.
   update bolig_private.purchase_orders set snapshot=jsonb_set(snapshot,'{supplier_reference}',to_jsonb(trim(payload->>'supplier_reference'))) where id=o.id;
  else
   if o.status not in ('ordered','partial','delivered') or jsonb_typeof(payload->'lines') is distinct from 'array' or jsonb_array_length(payload->'lines') not between 1 and 1000 or jsonb_typeof(payload->'note') is distinct from 'string' or length(payload->>'note')>1000 then raise exception 'Registrer mottak på en faktisk bestilt ordre.' using errcode='22023';end if;
   ordered_day:=(payload->>'date')::date;
   if ordered_day is null or ordered_day>current_date or ordered_day<o.ordered_at then raise exception 'Mottaksdato må være fra bestillingsdato til i dag.' using errcode='22023';end if;
   counts:=o.received;positions:='{}';
   for line in select value from jsonb_array_elements(payload->'lines') loop
    if jsonb_typeof(line->'position') is distinct from 'number' or line->>'position' !~ '^[0-9]+$' or jsonb_typeof(line->'quantity') is distinct from 'number' then raise exception 'Kontroller mottatte mengder.' using errcode='22023';end if;
    pos:=(line->>'position')::int;qty:=(line->>'quantity')::numeric;
    if pos=any(positions) or pos<0 or pos>=jsonb_array_length(o.snapshot->'goods') or qty=0 or qty<>round(qty,3) then raise exception 'Bruk unike varelinjer og inntil tre desimaler.' using errcode='22023';end if;
    positions:=array_append(positions,pos);
    total:=coalesce((counts->>pos::text)::numeric,0)+qty;
    if total<0 or total>(o.snapshot->'goods'->pos->>'quantity')::numeric then raise exception 'Mottatt mengde må være mellom null og bestilt mengde.' using errcode='22023';end if;
    if qty<0 and trim(payload->>'note')='' then raise exception 'Beskriv hvorfor mottaket korrigeres.' using errcode='22023';end if;
    counts:=jsonb_set(counts,array[pos::text],to_jsonb(total),true);
   end loop;
   select bool_and(coalesce((counts->>(n-1)::text)::numeric,0)=(g->>'quantity')::numeric),bool_or(coalesce((counts->>(n-1)::text)::numeric,0)>0) into fully,has_any from jsonb_array_elements(o.snapshot->'goods') with ordinality x(g,n);
   if o.snapshot->>'delivery_mode'='combined' and has_any and not fully then raise exception 'Samlet levering krever at alle varer er mottatt. Velg dellevering før bestillingen klargjøres.' using errcode='22023';end if;
   update bolig_private.purchase_orders set received=counts,status=case when fully then 'delivered' when has_any then 'partial' else 'ordered' end where id=o.id;
  end if;
 elsif action is distinct from 'get' then raise exception 'Ukjent handling.' using errcode='22023';
 end if;
 if action<>'get' then
  update bolig_private.delivery_states set revision=revision+1 where root_id=root returning * into s;
  insert into bolig_private.delivery_events(root_id,unit_id,order_id,action,payload,actor_id) values(root,unit,o.id,action,payload-'request_id'-'revision',auth.uid());
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'delivery_'||action,coalesce(o.id,unit),s.revision);
 end if;
 result:=jsonb_build_object('context',ctx,'root_id',root,'unit_id',unit,'revision',coalesce(s.revision,0),'settings',coalesce(s.settings,'{"address":"","note":""}'),'unit_settings',coalesce(s.units->unit::text,'{"address_mode":"common","address":"","order_mode":"combined","delivery_mode":"combined"}'),'orders',coalesce((select jsonb_agg(to_jsonb(po)-'root_id' order by created_at desc,id) from bolig_private.purchase_orders po where unit_id=unit and root_id=root),'[]'),'events',coalesce((select jsonb_agg(to_jsonb(e)-'root_id' order by created_at desc,id) from bolig_private.delivery_events e where unit_id=unit and root_id=root),'[]'));
 if action<>'get' then insert into bolig_private.delivery_receipts values(root,auth.uid(),request_id,action,payload,result);end if;
 return result;
end$$;
revoke all on function bolig_private.deliveries(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.deliveries(uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_deliveries(p_company_id uuid,p_root_id uuid,p_unit_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.deliveries(p_company_id,p_root_id,p_unit_id,p_action,p_payload)$$;
revoke all on function public.bolig_deliveries(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_deliveries(uuid,uuid,uuid,text,jsonb) to authenticated;

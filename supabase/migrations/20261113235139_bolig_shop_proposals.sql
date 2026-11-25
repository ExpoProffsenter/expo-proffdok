-- Explicit project-bound shop sales. No membership, active-company or role changes.
alter table bolig_private.partner_commerce_access add column publish_shop boolean not null default false;

create or replace function bolig_private.commerce_collaborator(c uuid,root uuid,permission text default 'read') returns boolean
language sql stable set search_path='' as $$
 select auth.uid() is not null and exists(
 select 1 from bolig_private.partner_commerce_access g join bolig_private.partner_access p on p.id=g.access_id
 join bolig_private.roots r on r.id=p.root_id join public.profiles u on u.id=g.user_id
 join auth.users account on account.id=g.user_id
 where g.root_id=p.root_id and g.user_id=auth.uid() and g.enabled and r.id=root and r.company_id=c and p.access_mode='project'
 and lower(account.email)=lower(p.email) and bolig_private.partner_active(p) and u.approved and not coalesce(u.deactivated,false)
 and exists(select 1 from public.sales_company_memberships m where m.user_id=g.user_id and m.workspace_role in ('ansatt','firmaadmin') and public.is_internal_work_profile_company(m.company_id))
 and (permission='read' or permission='edit_choices' and g.edit_choices or permission='edit_catalog' and g.edit_catalog or permission='publish_shop' and g.publish_shop))
$$;

create or replace function bolig_private.commerce_read_context(c uuid,root uuid) returns jsonb
language plpgsql stable set search_path='' as $$
declare ctx jsonb;
begin
 begin
  ctx:=bolig_private.context(c);
  if coalesce((ctx->>'enabled')::boolean,false) and ctx->>'role'='manager' then return ctx;end if;
 exception when sqlstate '42501' then null;
 end;
 if not bolig_private.commerce_collaborator(c,root,'read') and coalesce((ctx->>'enabled')::boolean,false) then return ctx;end if;
 if not bolig_private.commerce_collaborator(c,root,'read') then raise exception 'Prosjekttilgangen er ikke tilgjengelig.' using errcode='42501';end if;
 return jsonb_build_object('company_id',c,'user_id',auth.uid(),'role','reader','enabled',true,'manage_access',false,
 'company_name',(select display_name from public.sales_company_scopes where id=c),'collaboration_root',root,
 'publish_shop',bolig_private.commerce_collaborator(c,root,'publish_shop'),
 'edit_choices',bolig_private.commerce_collaborator(c,root,'edit_choices'),
 'edit_catalog',bolig_private.commerce_collaborator(c,root,'edit_catalog'));
end$$;

create or replace function bolig_private.partner_commerce_manage(c uuid,root uuid,access uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;p bolig_private.partner_access%rowtype;g bolig_private.partner_commerce_access%rowtype;target uuid;
 rid uuid;fp bytea;prior bolig_private.partner_receipts%rowtype;result jsonb;actor_key text;
begin
 ctx:=bolig_private.context(c);
 if ctx->>'role' is distinct from 'manager' or not coalesce((ctx->>'enabled')::boolean,false) then raise exception 'Prosjektleder kreves.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into p from bolig_private.partner_access where id=access and root_id=root;
 if p.id is null or p.access_mode<>'project' or not bolig_private.partner_active(p)
 or not exists(select 1 from bolig_private.roots where id=root and company_id=c) then raise exception 'Velg en aktiv prosjekttilgang.' using errcode='42501';end if;
 if action is null or action not in('get','save') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>5000 then raise exception 'Ugyldig personrettighet.' using errcode='22023';end if;
 select u.id into target from auth.users u join public.profiles pr on pr.id=u.id
 where lower(u.email)=lower(p.email) and pr.approved and not coalesce(pr.deactivated,false)
 and exists(select 1 from public.sales_company_memberships m where m.user_id=u.id and m.workspace_role in ('ansatt','firmaadmin') and public.is_internal_work_profile_company(m.company_id));
 select * into g from bolig_private.partner_commerce_access where access_id=access;
 if action='save' then
  if target is null then raise exception 'Kontaktens e-post må tilhøre en godkjent bruker hos Bademiljø Expo, Expo Proffsenter eller Ringside.' using errcode='22023';end if;
  if payload->'reviewed' is distinct from 'true'::jsonb or jsonb_typeof(payload->'enabled') is distinct from 'boolean'
   or jsonb_typeof(payload->'edit_choices') is distinct from 'boolean' or jsonb_typeof(payload->'edit_catalog') is distinct from 'boolean' or (payload ? 'publish_shop' and jsonb_typeof(payload->'publish_shop') is distinct from 'boolean')
   then raise exception 'Se over og bekreft personens rettigheter.' using errcode='22023';end if;
  rid:=(payload->>'request_id')::uuid;
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  actor_key:='commerce-manager/'||auth.uid()::text;
  fp:=sha256(convert_to(jsonb_build_array(access,expected,payload)::text,'UTF8'));
  select * into prior from bolig_private.partner_receipts where root_id=root and actor=actor_key and request_id=rid;
  if found then
   if prior.fingerprint<>fp then raise exception 'Referansen gjelder en annen handling.' using errcode='PT409';end if;
   return prior.result||jsonb_build_object('replayed',true);
  end if;
  if expected is distinct from coalesce(g.revision,0) then raise exception 'Personrettigheten er endret. Hent siste status.' using errcode='PT409';end if;
  insert into bolig_private.partner_commerce_access(access_id,root_id,user_id,enabled,edit_choices,edit_catalog,revision,publish_shop) values(access,root,target,(payload->>'enabled')::boolean,(payload->>'edit_choices')::boolean,(payload->>'edit_catalog')::boolean,coalesce(g.revision,0)+1,coalesce((payload->>'publish_shop')::boolean,false))
   on conflict(access_id) do update set user_id=excluded.user_id,enabled=excluded.enabled,edit_choices=excluded.edit_choices,edit_catalog=excluded.edit_catalog,revision=excluded.revision,publish_shop=excluded.publish_shop returning * into g;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'partner_commerce_permissions',access,g.revision);
 end if;
 result:=jsonb_build_object('context',ctx,'root_id',root,'access_id',access,'registered',target is not null,'revision',coalesce(g.revision,0),
 'publish_shop',coalesce(g.publish_shop,false),'enabled',coalesce(g.enabled,false),'edit_choices',coalesce(g.edit_choices,false),'edit_catalog',coalesce(g.edit_catalog,false));
 if action='save' then insert into bolig_private.partner_receipts values(root,actor_key,rid,fp,result);end if;
 return result;
end$$;


create function bolig_private.shop_portal_live(p bolig_private.resident_portals) returns boolean language sql stable set search_path='' as $$
 select not p.revoked and p.expires_at>now() and exists(
 select 1 from bolig_private.units u join bolig_private.roots r on r.id=u.root_id join bolig_private.firms f on f.company_id=r.company_id
 join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
 where u.id=p.unit_id and f.enabled and not r.archived and not u.archived and not e.archived and not b.archived and p.contact_basis=md5(jsonb_build_array(u.contact_name,u.contact_email)::text))
$$;
revoke all on function bolig_private.shop_portal_live(bolig_private.resident_portals) from public,anon,authenticated,service_role;

-- Public projections contain only customer-facing data. Accepted versions never mutate.
create function bolig_private.shop_basis(root uuid,unit uuid) returns text language sql stable set search_path='' as $$
 select md5(jsonb_build_array(
 (select max(revision) from bolig_private.choice_versions where root_id=root and unit_id=unit),
 (select choice_deadline from bolig_private.units where id=unit and root_id=root),
 (select jsonb_agg(jsonb_build_array(id,status,revision) order by id) from bolig_private.commercial_documents where root_id=root and unit_id=unit and snapshot->>'source'='shop'),
 (select jsonb_build_array(id,revision,contact_basis) from bolig_private.resident_portals where root_id=root and unit_id=unit))::text)
$$;
revoke all on function bolig_private.shop_basis(uuid,uuid) from public,anon,authenticated,service_role;

create function bolig_private.shop_proposal(c uuid,root uuid,unit uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;p bolig_private.resident_portals%rowtype;cv bolig_private.choice_versions%rowtype;
 d bolig_private.commercial_documents%rowtype;prior bolig_private.partner_receipts%rowtype;
 rid uuid;fp bytea;result jsonb;basis text;actor_key text;lines jsonb:='[]';goods jsonb:='[]';g jsonb;clean jsonb;
 qty numeric;price bigint;install bigint;total bigint:=0;line_total bigint;idx int:=0;group_ref uuid;next_version int:=1;title text;
begin
 -- Authorization precedes even idempotent replay. The caller cannot choose another firm's unit.
 if not bolig_private.commerce_collaborator(c,root,'read') or not exists(
 select 1 from bolig_private.units u join bolig_private.roots r on r.id=u.root_id join bolig_private.firms f on f.company_id=r.company_id
 join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
 where u.id=unit and r.id=root and r.company_id=c and f.enabled and not r.archived and not u.archived and not e.archived and not b.archived)
 then raise exception 'Prosjekttilgangen eller boligen er ikke tilgjengelig.' using errcode='42501';end if;
 ctx:=bolig_private.commerce_read_context(c,root)||jsonb_build_object('publish_shop',bolig_private.commerce_collaborator(c,root,'publish_shop'));
 if action is null or action not in ('get','publish') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>1500000 then raise exception 'Ugyldig butikkforslag.' using errcode='22023';end if;
 if action='publish' and not bolig_private.commerce_collaborator(c,root,'publish_shop') then raise exception 'Du har ikke rettighet til å oppdatere beboerportalen.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into p from bolig_private.resident_portals where root_id=root and unit_id=unit;
 select * into cv from bolig_private.choice_versions where root_id=root and unit_id=unit order by revision desc limit 1;
 basis:=bolig_private.shop_basis(root,unit);
 if action='publish' then
  rid:=(payload->>'request_id')::uuid;actor_key:='shop/'||auth.uid()::text;
  fp:=sha256(convert_to(jsonb_build_array(unit,payload)::text,'UTF8'));
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  select * into prior from bolig_private.partner_receipts where root_id=root and actor=actor_key and request_id=rid;
  if found then
   if prior.fingerprint<>fp then raise exception 'Referansen gjelder et annet forslag.' using errcode='PT409';end if;
   return prior.result||jsonb_build_object('replayed',true);
  end if;
  if p.id is null or not bolig_private.shop_portal_live(p) or p.token_hash is null then raise exception 'Prosjektleder må aktivere beboerportalen for denne boligen først.' using errcode='PT409';end if;
  if exists(select 1 from bolig_private.units u where u.id=unit and u.choice_deadline is not null and clock_timestamp()>=(u.choice_deadline+1)::timestamp at time zone 'Europe/Oslo') then raise exception 'Bestillingsfristen er utløpt. Prosjektleder må sette ny frist.' using errcode='PT409';end if;
  if cv.revision is null then raise exception 'Prosjektleder må lagre boligens grunnpakke først.' using errcode='PT409';end if;
  if payload->>'basis' is distinct from basis then raise exception 'Boligen eller forslaget er oppdatert. Hent siste status og kontroller prisene igjen.' using errcode='PT409';end if;
  title:=trim(payload->>'title');
  if jsonb_typeof(payload->'title') is distinct from 'string' or length(title) not between 2 and 160
  or payload->'reviewed' is distinct from 'true'::jsonb or jsonb_typeof(payload->'lines') is distinct from 'array'
  or jsonb_array_length(payload->'lines') not between 1 and 50 then raise exception 'Kontroller tittel, varer og kundens totalpris.' using errcode='22023';end if;
  for g in select value from jsonb_array_elements(payload->'lines') loop
   if jsonb_typeof(g) is distinct from 'object' or coalesce(length(trim(g->>'name')),0) not between 2 and 160
   or coalesce(length(g->>'sku'),0)>160 or coalesce(length(g->>'room_name'),0)>100 or coalesce(length(g->>'unit'),0) not between 1 and 20
   or jsonb_typeof(g->'quantity') is distinct from 'number' or (g->>'quantity') !~ '^[0-9]+(\.[0-9]{1,3})?$'
   or jsonb_typeof(g->'price_cents') is distinct from 'number' or (g->>'price_cents') !~ '^[0-9]{1,10}$'
   or jsonb_typeof(g->'installation_cents') is distinct from 'number' or (g->>'installation_cents') !~ '^[0-9]{1,10}$'
   or coalesce(length(g->>'image_url'),0)>120000 or (coalesce(g->>'image_url','')<>'' and g->>'image_url' !~ '^https://[^[:space:]]+$' and g->>'image_url' !~ '^data:image/jpeg;base64,/9j/[A-Za-z0-9+/]*={0,2}$')
   then raise exception 'Kontroller varenavn, antall og priser inkludert mva.' using errcode='22023';end if;
   qty:=(g->>'quantity')::numeric;price:=(g->>'price_cents')::bigint;install:=(g->>'installation_cents')::bigint;
   if qty<=0 or qty>10000 or price>100000000 or install>100000000 then raise exception 'Antall eller pris er utenfor tillatt område.' using errcode='22023';end if;
   line_total:=round(qty*price)+install;total:=total+line_total;idx:=idx+1;
   if total>1000000000 then raise exception 'Tillegget er for stort. Del det opp.' using errcode='22023';end if;
   clean:=jsonb_build_object('key','shop-'||rid::text||'-'||idx,'name',trim(g->>'name'),'sku',coalesce(g->>'sku',''),
    'room_name',coalesce(g->>'room_name',''),'quantity',qty,'unit',g->>'unit','image_url',coalesce(g->>'image_url',''));
   lines:=lines||jsonb_build_array(clean||jsonb_build_object('price_cents',price,'installation_cents',install,'line_total_cents',line_total));
   goods:=goods||jsonb_build_array(clean);
   if install>0 then goods:=goods||jsonb_build_array(jsonb_build_object('key','shop-'||rid::text||'-'||idx||'-install','name','Montering av '||trim(g->>'name'),'sku','','room_name',coalesce(g->>'room_name',''),'quantity',1,'unit','jobb'));end if;
  end loop;
  -- One pending shop supplement per apartment. All salespeople see it and use a common basis.
  select * into d from bolig_private.commercial_documents where root_id=root and unit_id=unit and snapshot->>'source'='shop'
   and status='published' order by created_at desc,id limit 1;
  if d.id is not null then group_ref:=d.group_id;next_version:=d.version+1;
   update bolig_private.commercial_documents set status='superseded',revision=revision+1 where id=d.id;
  else group_ref:=gen_random_uuid();end if;
  insert into bolig_private.commercial_documents(root_id,unit_id,group_id,version,kind,status,snapshot,created_by,approved_at,token_hash,expires_at)
  values(root,unit,group_ref,next_version,'change','published',jsonb_build_object('source','shop','reason',title,'shop_lines',lines,
   'goods',goods,'before_goods','[]'::jsonb,'base_goods',bolig_private.commercial_goods(cv.snapshot->'goods'),'base_included',true,
   'delta_cents',total,'total_cents',null,'choice_revision',cv.revision,
   'identity',(bolig_private.portal_state(p))->'identity'),auth.uid(),now(),sha256(convert_to(gen_random_uuid()::text,'UTF8')),least(p.expires_at,now()+interval '30 days')) returning * into d;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'shop_publish',d.id,d.revision);
 end if;
 result:=jsonb_build_object('context',ctx,'root_id',root,'unit_id',unit,'basis',bolig_private.shop_basis(root,unit),
 'portal_ready',coalesce(bolig_private.shop_portal_live(p) and p.token_hash is not null,false),'has_base',cv.revision is not null,
 'base_goods',bolig_private.commercial_goods(coalesce(cv.snapshot->'goods','[]')),
 'documents',coalesce((select jsonb_agg(bolig_private.commercial_view(x) order by x.created_at desc,x.id) from bolig_private.commercial_documents x
 where x.root_id=root and x.unit_id=unit and x.snapshot->>'source'='shop'),'[]'));
 if action='publish' then insert into bolig_private.partner_receipts values(root,actor_key,rid,fp,result);end if;
 return result;
end$$;
revoke all on function bolig_private.shop_proposal(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.shop_proposal(uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_shop_proposal(p_company_id uuid,p_root_id uuid,p_unit_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.shop_proposal(p_company_id,p_root_id,p_unit_id,p_action,p_payload)$$;
revoke all on function public.bolig_shop_proposal(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_shop_proposal(uuid,uuid,uuid,text,jsonb) to authenticated;

-- Shop supplements add goods; they never overwrite selections or existing orders.
-- Existing choice/order acceptance checks remain unchanged for every other document.
do $$declare body text;anchor text;begin
 body:=pg_get_functiondef('bolig_private.guard_commercial_acceptance()'::regprocedure);
 anchor:='if new.kind=''choice'' then';
 if position(anchor in body)=0 then raise exception 'Missing acceptance guard anchor';end if;
 body:=replace(body,anchor,$a$if new.snapshot->>'source'='shop' then
   if (new.snapshot->>'choice_revision')::bigint is distinct from (select max(revision) from bolig_private.choice_versions where root_id=new.root_id and unit_id=new.unit_id)
   then raise exception 'Grunnpakken er endret. Be butikken oppdatere forslaget.' using errcode='PT409';end if;
  elsif new.kind='choice' then$a$);execute body;
 -- Register a separately confirmed shop order so receipt and FDV use the existing order flow.
 body:=pg_get_functiondef('bolig_private.apply_commercial_delivery(uuid,uuid,uuid,jsonb)'::regprocedure);
 anchor:=' select * into o from bolig_private.purchase_orders where id=';
 if position(anchor in body)=0 then raise exception 'Missing supplier follow-up anchor';end if;
 body:=replace(body,anchor,$a$
 if d.snapshot->>'source'='shop' then
  insert into bolig_private.purchase_orders(root_id,unit_id,source_choice_revision,source_draft_revision,number,status,snapshot,created_by,ordered_at)
  values(root,unit,(d.snapshot->>'choice_revision')::bigint,0,'T-'||left(d.id::text,8),'ordered',
   jsonb_build_object('goods',d.snapshot->'goods','identity',d.snapshot->'identity','reference',ref,'supplier','Butikktillegg','supplier_reference',ref,'note',note,'address',d.snapshot->'identity'->>'address'),auth.uid(),current_date) returning * into o;
  update bolig_private.commercial_documents set status='handled',handling_note=note,handled_at=now(),fulfillment_applied_at=now(),fulfillment_reference=ref,revision=revision+1 where id=d.id;
  update bolig_private.delivery_states set revision=revision+1 where root_id=root;
  insert into bolig_private.delivery_events(root_id,unit_id,order_id,action,payload,actor_id) values(root,unit,o.id,'amendment_applied',jsonb_build_object('document_id',d.id,'reference',ref,'note',note),auth.uid());
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'shop_order_confirmed',d.id,d.revision+1);
  result:=bolig_private.commerce(c,root,unit,'get','{}');
  insert into bolig_private.commercial_receipts values(root,auth.uid(),rid,fp,result);return result;
 end if;
 select * into o from bolig_private.purchase_orders where id=$a$);execute body;
end$$;
notify pgrst,'reload schema';

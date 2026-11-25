-- Reuse immutable unit choices: independently frozen common/room components,
-- one aggregate goods list and one order draft. Legacy snapshots are never edited.
create function bolig_private.same_good(a jsonb,b jsonb) returns boolean language sql immutable set search_path='' as $$
 select (a->>'key'=b->>'key' or (coalesce(a->>'scope_id','common')='common' and coalesce(b->>'scope_id','common')='common' and coalesce(a->>'source_key',a->>'key')=coalesce(b->>'source_key',b->>'key')))
 and coalesce(a->>'sku','')=coalesce(b->>'sku','') and a->>'name'=b->>'name' and a->'quantity'=b->'quantity' and a->>'unit'=b->>'unit';$$;
revoke all on function bolig_private.same_good(jsonb,jsonb) from public,anon,authenticated,service_role;

create function bolig_private.package_snapshot(root uuid,pkg_id uuid,ids jsonb,cat_rev bigint) returns jsonb
language plpgsql set search_path='' as $$
#variable_conflict use_variable
declare pkg bolig_private.packages%rowtype;o bolig_private.options%rowtype;oid uuid;seen uuid[]:='{}';replaced text[]:='{}';opts jsonb:='[]';goods jsonb;credit bigint;total bigint:=0;
begin
 select * into pkg from bolig_private.packages where id=pkg_id and root_id=root and not archived;
 if not found then raise exception 'Velg en tilgjengelig grunnpakke.' using errcode='22023';end if;
 if jsonb_typeof(ids) is distinct from 'array' or jsonb_array_length(ids)>100 then raise exception 'Velg inntil 100 tilvalg per pakke.' using errcode='22023';end if;
 for oid in select value::uuid from jsonb_array_elements_text(ids) loop
  if oid=any(seen) then raise exception 'Samme tilvalg kan bare velges én gang per rom eller fellespakke.' using errcode='22023';end if;seen:=array_append(seen,oid);
  select * into o from bolig_private.options where id=oid and root_id=root and not archived;
  if not found then raise exception 'Et tilvalg er ikke tilgjengelig.' using errcode='22023';end if;
  if o.replace_key<>'' then
   if o.replace_key=any(replaced) or not exists(select 1 from jsonb_array_elements(pkg.lines) l where l->>'key'=o.replace_key) then raise exception 'Tilvalg passer ikke til pakken, eller flere tilvalg erstatter samme vare.' using errcode='22023';end if;
   replaced:=array_append(replaced,o.replace_key);
  end if;
  credit:=0;
  if o.deduct_base then
   select (l->>'credit_cents')::bigint into credit from jsonb_array_elements(pkg.lines) l where l->>'key'=o.replace_key;
   if credit is null then raise exception 'Grunnsum mangler for fratrekk.' using errcode='22023';end if;
  end if;
  opts:=opts||jsonb_build_array((to_jsonb(o)-'root_id')||jsonb_build_object('deduction_cents',credit,'net_cents',o.price_cents-credit));total:=total+o.price_cents-credit;
 end loop;
 select coalesce(jsonb_agg(l order by n),'[]') into goods from jsonb_array_elements(pkg.lines) with ordinality g(l,n) where not (l->>'key'=any(replaced));
 select goods||coalesce(jsonb_agg(jsonb_build_object('key',x->>'id','name',x->>'name','sku',x->>'sku','quantity',x->'quantity','unit',x->>'unit','image_url',x->>'image_url','product_url',x->>'product_url') order by n),'[]') into goods from jsonb_array_elements(opts) with ordinality g(x,n);
 return jsonb_build_object('package',to_jsonb(pkg)-'root_id','options',opts,'goods',goods,'total_cents',total,'catalog_revision',cat_rev,'allocations','[]'::jsonb);
end$$;
revoke all on function bolig_private.package_snapshot(uuid,uuid,jsonb,bigint) from public,anon,authenticated,service_role;

-- A legacy writer must never replace a scoped selection and silently drop rooms.
alter function bolig_private.catalog(uuid,uuid,text,bigint,jsonb) rename to catalog_legacy;
revoke all on function bolig_private.catalog_legacy(uuid,uuid,text,bigint,jsonb) from public,anon,authenticated,service_role;
create function bolig_private.catalog(c uuid,root uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if action='choose' then
  perform bolig_private.catalog_legacy(c,root,'unit',null,payload);
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
  if (select snapshot->>'format' from bolig_private.choice_versions where unit_id=(payload->>'unit_id')::uuid order by revision desc limit 1)='scoped-v1' then raise exception 'Boligen bruker rompakker. Endre fellespakke eller rompakke i Rom og oversikt.' using errcode='PT409';end if;
 end if;
 return bolig_private.catalog_legacy(c,root,action,expected,payload);
end$$;
revoke all on function bolig_private.catalog(uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function bolig_private.catalog(uuid,uuid,text,bigint,jsonb) to authenticated;
create or replace function public.bolig_catalog(p_company_id uuid,p_root_id uuid,p_action text default 'state',p_revision bigint default null,p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.catalog(p_company_id,p_root_id,p_action,p_revision,p_payload);$$;

create function bolig_private.package_choices(c uuid,root uuid,unit uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare workspace jsonb;state jsonb;choice jsonb;persisted jsonb;components jsonb:='[]';part jsonb;old_part jsonb;sid text;rid uuid;room_name text;proposal jsonb;goods jsonb:='[]';opts jsonb:='[]';g jsonb;o jsonb;a jsonb;allocs jsonb;nr bigint;rev bigint;total bigint:=0;min_rev bigint;identity jsonb;legacy boolean;remove_part boolean;position bigint;old_position bigint;
begin
 if action is null or action not in ('get','preview','save') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>12000 then raise exception 'Ugyldig pakkevalg.' using errcode='22023';end if;
 workspace:=bolig_private.rooms_workspace(c,root,unit,'list',null,'{}');
 if action<>'get' then
  if workspace->'context'->>'role'<>'manager' or (workspace->>'root_archived')::boolean then raise exception 'Prosjektleder og aktivt boligprosjekt kreves.' using errcode='42501';end if;
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
  perform pg_advisory_xact_lock(hashtextextended('bolig-rooms:'||unit::text,0));
  workspace:=bolig_private.rooms_workspace(c,root,unit,'list',null,'{}');
 end if;
 state:=bolig_private.catalog_legacy(c,root,'unit',null,jsonb_build_object('unit_id',unit));
 choice:=state->'selection';nr:=coalesce((choice->>'revision')::bigint,0);rev:=(state->>'revision')::bigint;
 legacy:=nr>0 and coalesce(choice->'snapshot'->>'format','')<>'scoped-v1';
 if legacy then
  select coalesce((select allocations from bolig_private.room_content_versions where unit_id=unit and source_choice_revision=nr order by revision desc limit 1),'[]') into allocs;
  components:=jsonb_build_array(((choice->'snapshot')-'identity'-'status'-'base_payer'-'options_payer')||jsonb_build_object('scope_id','common','room_id',null,'room_name','Felles for boligen','allocations',allocs));
 elsif nr>0 then components:=choice->'snapshot'->'components';end if;
 persisted:=components;
 if action<>'get' then
  if expected is distinct from nr or (payload->>'catalog_revision')::bigint is distinct from rev or (payload->>'rooms_revision')::bigint is distinct from (workspace->>'revision')::bigint then raise exception 'Pakker, rom eller boligvalg er endret. Utkastet er beholdt. Hent siste grunnlag og se over valget.' using errcode='PT409';end if;
  sid:=payload->>'scope_id';
  if sid is null or (sid<>'common' and sid !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') or (payload ? 'remove' and jsonb_typeof(payload->'remove')<>'boolean') or (payload ? 'clear_allocations' and jsonb_typeof(payload->'clear_allocations')<>'boolean') then raise exception 'Velg rom eller fellespakke.' using errcode='22023';end if;
  remove_part:=coalesce((payload->>'remove')::boolean,false);
  if sid='common' then rid:=null;room_name:='Felles for boligen';
  else
   rid:=sid::uuid;sid:=rid::text;
   select name into room_name from bolig_private.rooms where id=rid and unit_id=unit and root_id=root and (not archived or remove_part);
   if not found then raise exception 'Velg et aktivt rom i denne boligen.' using errcode='42501';end if;
  end if;
  if sid is null or sid='' then raise exception 'Velg rom eller fellespakke.' using errcode='22023';end if;
  select x into old_part from jsonb_array_elements(components) x where x->>'scope_id'=sid;
  if remove_part then
   if old_part is null then raise exception 'Det finnes ingen pakke å fjerne her.' using errcode='22023';end if;
  else
   part:=bolig_private.package_snapshot(root,(payload->>'package_id')::uuid,payload->'option_ids',rev)||jsonb_build_object('scope_id',sid,'room_id',rid,'room_name',room_name);
   -- Preserve manual shares for unchanged common goods, including their frozen names.
   if sid='common' and old_part is not null and not coalesce((payload->>'clear_allocations')::boolean,false) then
    allocs:='[]';
    for g,position in select value,n-1 from jsonb_array_elements(part->'goods') with ordinality x(value,n) loop
     select n-1 into old_position from jsonb_array_elements(old_part->'goods') with ordinality x(value,n) where bolig_private.same_good(value,g) limit 1;
     if old_position is not null then
      for a in select value from jsonb_array_elements(coalesce(old_part->'allocations','[]')) where (value->>'position')::bigint=old_position loop allocs:=allocs||jsonb_build_array(a||jsonb_build_object('position',position));end loop;
     end if;
    end loop;
    part:=part||jsonb_build_object('allocations',allocs);
   end if;
  end if;
  select coalesce(jsonb_agg(x order by x->>'scope_id'),'[]') into components from (select x from jsonb_array_elements(components) x where x->>'scope_id'<>sid union all select part where not remove_part) q;
  min_rev:=rev;
  for part in select value from jsonb_array_elements(components) order by case when value->>'scope_id'='common' then 0 else 1 end,value->>'scope_id' loop
   total:=total+(part->>'total_cents')::bigint;min_rev:=least(min_rev,(part->>'catalog_revision')::bigint);
   for g,position in select value,n-1 from jsonb_array_elements(part->'goods') with ordinality x(value,n) loop
    select coalesce(jsonb_agg(value order by value->>'room_id'),'[]') into allocs from jsonb_array_elements(coalesce(part->'allocations','[]')) where (value->>'position')::bigint=position;
    goods:=goods||jsonb_build_array(g||jsonb_build_object('key',(part->>'scope_id')||'/'||(g->>'key'),'source_key',g->>'key','scope_id',part->>'scope_id','room_id',part->'room_id','room_name',part->>'room_name','room_allocations',allocs));
   end loop;
   for o in select value from jsonb_array_elements(part->'options') loop opts:=opts||jsonb_build_array(o||jsonb_build_object('source_option_id',o->>'id','id',(part->>'scope_id')||'/'||(o->>'id'),'scope_id',part->>'scope_id','room_name',part->>'room_name'));end loop;
  end loop;
  if jsonb_array_length(goods)<>(select count(distinct x->>'key') from jsonb_array_elements(goods) x) then raise exception 'Varelinjene har like nøkler. Rediger pakken før du fortsetter.' using errcode='22023';end if;
  if jsonb_array_length(goods)>1000 then raise exception 'Inntil 1000 varelinjer samlet per bolig. Del opp grunnlaget før du fortsetter.' using errcode='22023';end if;
  select jsonb_build_object('unit_id',u.id,'number',u.number,'contact_name',u.contact_name,'address',e.address,'block',b.name) into identity from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=unit;
  proposal:=jsonb_build_object('format','scoped-v1','status','draft','catalog_revision',min_rev,'components',components,'package',jsonb_build_object('id',null,'name',case when jsonb_array_length(components)=0 then 'Ingen pakker valgt' else 'Felles- og rompakker' end,'lines','[]'::jsonb),'options',opts,'goods',goods,'total_cents',total,'identity',identity,'base_payer','sameie','options_payer','beboer');
  if action='save' then
   insert into bolig_private.choice_versions(unit_id,root_id,revision,snapshot,created_by) values(unit,root,nr+1,proposal,auth.uid());
   insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'package_scope',unit,nr+1);
   state:=bolig_private.catalog_legacy(c,root,'unit',null,jsonb_build_object('unit_id',unit));
  end if;
 end if;
 return state||jsonb_build_object('root_archived',workspace->'root_archived','rooms',workspace->'rooms','rooms_revision',workspace->'revision','components',case when action='preview' then persisted else components end,'legacy',legacy,'proposal',case when action='preview' then proposal else null end);
end$$;
revoke all on function bolig_private.package_choices(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function bolig_private.package_choices(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;
create function public.bolig_package_choices(p_company_id uuid,p_root_id uuid,p_unit_id uuid,p_action text default 'get',p_revision bigint default null,p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.package_choices(p_company_id,p_root_id,p_unit_id,p_action,p_revision,p_payload);$$;
revoke all on function public.bolig_package_choices(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function public.bolig_package_choices(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;

-- Manual quantity allocation remains available for legacy choices only.
alter function bolig_private.room_content(uuid,uuid,uuid,text,bigint,jsonb) rename to room_content_legacy;
revoke all on function bolig_private.room_content_legacy(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,authenticated,service_role;
create function bolig_private.room_content(c uuid,root uuid,unit uuid,action text,expected bigint,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare state jsonb;
begin
 state:=bolig_private.room_content_legacy(c,root,unit,'get',null,'{}');
 if action='get' then return state;end if;
 if state->'selection'->'snapshot'->>'format'='scoped-v1' then raise exception 'Varer styres nå av fellespakke og rompakker. Endre riktig pakke i Rom og oversikt.' using errcode='PT409';end if;
 return bolig_private.room_content_legacy(c,root,unit,action,expected,payload);
end$$;
revoke all on function bolig_private.room_content(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function bolig_private.room_content(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;
create or replace function public.bolig_room_content(p_company_id uuid,p_root_id uuid,p_unit_id uuid,p_action text default 'get',p_revision bigint default null,p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.room_content(p_company_id,p_root_id,p_unit_id,p_action,p_revision,p_payload);$$;

-- Preserve exclusions for unchanged stable goods when choice positions move.
create or replace function bolig_private.order_draft(c uuid,root uuid,unit uuid,action text,expected bigint,choice_revision bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;choice bolig_private.choice_versions%rowtype;draft bolig_private.order_draft_versions%rowtype;nr bigint;positions int[];goods jsonb;suggested jsonb;source_snapshot jsonb;
begin
 ctx:=bolig_private.context(c);
 if not (ctx->>'enabled')::boolean then raise exception 'Boligprosjekter er ikke tilgjengelig.' using errcode='42501';end if;
 select * into r from bolig_private.roots where id=root and company_id=c for share;
 if not found or not exists(select 1 from bolig_private.units where id=unit and root_id=root) then raise exception 'Boligen tilhører ikke aktivt hovedprosjekt og firma.' using errcode='42501';end if;
 if action='save' then
  if ctx->>'role'<>'manager' or r.archived or not exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=unit and not u.archived and not e.archived and not b.archived) then raise exception 'Prosjektleder og aktiv bolig kreves.' using errcode='42501';end if;
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 elsif action is distinct from 'get' then raise exception 'Ukjent handling.' using errcode='22023';end if;
 select * into choice from bolig_private.choice_versions where unit_id=unit order by revision desc limit 1;
 select * into draft from bolig_private.order_draft_versions where unit_id=unit order by revision desc limit 1;
 if action='save' then
  if choice.revision is null or choice_revision is distinct from choice.revision or expected is distinct from coalesce(draft.revision,0) then raise exception 'Boligvalg eller bestillingsutkast er endret. Hent siste grunnlag.' using errcode='PT409';end if;
  if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>10000 or jsonb_typeof(payload->'selected_positions') is distinct from 'array' or jsonb_array_length(payload->'selected_positions') not between 1 and 1000 then raise exception 'Velg minst én og inntil 1000 varelinjer.' using errcode='22023';end if;
  select array_agg(value::int) into positions from jsonb_array_elements_text(payload->'selected_positions');
  if cardinality(positions)<>(select count(distinct x) from unnest(positions) x) or exists(select 1 from unnest(positions) x where x<0 or x>=jsonb_array_length(choice.snapshot->'goods')) then raise exception 'Kontroller hvilke varelinjer som skal med.' using errcode='22023';end if;
  select jsonb_agg(value order by ord) into goods from jsonb_array_elements(choice.snapshot->'goods') with ordinality g(value,ord) where (ord-1)::int=any(positions);
  nr:=coalesce(draft.revision,0)+1;
  insert into bolig_private.order_draft_versions(unit_id,root_id,revision,source_choice_revision,snapshot,created_by) values(unit,root,nr,choice.revision,jsonb_build_object('status','draft','selected_positions',to_jsonb(positions),'goods',goods,'identity',choice.snapshot->'identity','excluded_count',jsonb_array_length(choice.snapshot->'goods')-cardinality(positions)),auth.uid()) returning * into draft;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'order_draft',unit,nr);
 end if;
 select snapshot into source_snapshot from bolig_private.choice_versions where unit_id=unit and revision=draft.source_choice_revision;
 select coalesce(jsonb_agg((n-1)::int order by n),'[]') into suggested from jsonb_array_elements(coalesce(choice.snapshot->'goods','[]')) with ordinality current_goods(g,n)
 where not exists(select 1 from jsonb_array_elements(coalesce(source_snapshot->'goods','[]')) with ordinality old_goods(old_g,old_n) where not coalesce(draft.snapshot->'selected_positions','[]') @> to_jsonb((old_n-1)::int) and bolig_private.same_good(old_g,g));
 return jsonb_build_object('context',ctx,'root_id',root,'unit_id',unit,'suggested_positions',suggested,'selection',case when choice.revision is null then null else to_jsonb(choice)-'root_id' end,'draft',case when draft.revision is null then null else to_jsonb(draft)-'root_id' end);
end$$;

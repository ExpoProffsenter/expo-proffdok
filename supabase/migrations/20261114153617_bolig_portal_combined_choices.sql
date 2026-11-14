-- Opt-in combinations of published, frozen alternatives. Existing portals keep single choice.
alter table bolig_private.resident_portals add column combine_base_id uuid;

create function bolig_private.portal_frozen_selection(base jsonb, alternatives jsonb) returns jsonb
language plpgsql immutable set search_path='' as $$
declare part jsonb;candidate jsonb;o jsonb;existing jsonb;g jsonb;opts jsonb;goods jsonb;parts jsonb:='[]';all_goods jsonb:='[]';all_opts jsonb:='[]';total bigint:=0;subtotal bigint;replaced text[];sid text;
begin
 if base->>'format' is distinct from 'scoped-v1' or jsonb_array_length(coalesce(base->'components','[]'))=0 then
 raise exception 'Kombinering krever lagrede rom- eller fellespakker.' using errcode='22023';end if;
 for part in select value from jsonb_array_elements(base->'components') loop
  sid:=part->>'scope_id';opts:='[]';goods:='[]';replaced:='{}';subtotal:=0;
  if jsonb_array_length(coalesce(part->'options','[]'))<>0 or jsonb_array_length(coalesce(part->'allocations','[]'))<>0 then
   raise exception 'Velg en grunnpakke uten tilvalg eller manuell romfordeling som utgangspunkt.' using errcode='22023';end if;
  for candidate in select value from jsonb_array_elements(alternatives) loop
   if candidate->>'format' is distinct from 'scoped-v1' or jsonb_array_length(candidate->'components')<>jsonb_array_length(base->'components') then
    raise exception 'Alternativene må ha samme rom og grunnpakker.' using errcode='22023';end if;
   select value into existing from jsonb_array_elements(candidate->'components') where value->>'scope_id'=sid;
   if existing is null or existing->'package' is distinct from part->'package' or existing->'catalog_revision' is distinct from part->'catalog_revision'
    or jsonb_array_length(coalesce(existing->'allocations','[]'))<>0 then
    raise exception 'Alternativene må bygge på samme pakkeutgave uten manuell romfordeling.' using errcode='22023';end if;
   for o in select value from jsonb_array_elements(existing->'options') loop
    select value into g from jsonb_array_elements(opts) where value->>'id'=o->>'id';
    if g is not null then
     if g is distinct from o then raise exception 'Samme tilvalg har ulikt prisgrunnlag. Klargjør alternativene på nytt.' using errcode='22023';end if;
     continue;
    end if;
    if coalesce(o->>'replace_key','')<>'' then
     if o->>'replace_key'=any(replaced) then raise exception 'To valgte alternativer erstatter samme vare. Velg ett av dem.' using errcode='22023';end if;
     if not exists(select 1 from jsonb_array_elements(part->'package'->'lines') l where l->>'key'=o->>'replace_key') then raise exception 'Erstattet grunnvare mangler.' using errcode='22023';end if;
     replaced:=array_append(replaced,o->>'replace_key');
    end if;
    if o->>'net_cents' is null or (o->>'net_cents')::bigint<>(o->>'price_cents')::bigint-(o->>'deduction_cents')::bigint then raise exception 'Tilvalgsprisen mangler.' using errcode='22023';end if;
    opts:=opts||jsonb_build_array(o);subtotal:=subtotal+(o->>'net_cents')::bigint;
   end loop;
  end loop;
  select coalesce(jsonb_agg(l order by n),'[]') into goods from jsonb_array_elements(part->'package'->'lines') with ordinality x(l,n) where not(l->>'key'=any(replaced));
  for o in select value from jsonb_array_elements(opts) order by value->>'id' loop goods:=goods||bolig_private.option_goods(o);end loop;
  parts:=parts||jsonb_build_array(part||jsonb_build_object('options',opts,'goods',goods,'total_cents',subtotal));
  for g in select value from jsonb_array_elements(goods) loop
   all_goods:=all_goods||jsonb_build_array(g||jsonb_build_object('key',sid||'/'||(g->>'key'),'source_key',g->>'key','scope_id',sid,'room_id',part->'room_id','room_name',part->>'room_name','room_allocations','[]'::jsonb));
  end loop;
  for o in select value from jsonb_array_elements(opts) loop
   all_opts:=all_opts||jsonb_build_array(o||jsonb_build_object('source_option_id',o->>'id','id',sid||'/'||(o->>'id'),'scope_id',sid,'room_name',part->>'room_name'));
  end loop;
  total:=total+subtotal;
 end loop;
 if jsonb_array_length(all_goods)>1000 then raise exception 'For mange varer i kombinasjonen.' using errcode='22023';end if;
 return base||jsonb_build_object('components',parts,'options',all_opts,'goods',all_goods,'total_cents',total);
end$$;
revoke all on function bolig_private.portal_frozen_selection(jsonb,jsonb) from public,anon,authenticated,service_role;

create function bolig_private.portal_combine(offers jsonb,base_id uuid,ids jsonb) returns jsonb
language plpgsql immutable set search_path='' as $$
declare base jsonb;o jsonb;selected jsonb:='[]';snapshot jsonb;names text[]:='{}';v text;seen text[]:='{}';rebuilt jsonb;
begin
 select x into base from jsonb_array_elements(offers) x where x->>'id'=base_id::text;
 if base is null or jsonb_typeof(ids) is distinct from 'array' or jsonb_array_length(ids)>12 then raise exception 'Velg delte tilvalg fra denne portalen.' using errcode='22023';end if;
 -- Validate every published alternative against its frozen components. Manual overrides stay single-choice.
 for o in select value from jsonb_array_elements(offers) loop
  if o->'source_revision' is distinct from base->'source_revision' then raise exception 'Alternativene har ulikt boliggrunnlag.' using errcode='22023';end if;
  rebuilt:=bolig_private.portal_frozen_selection(base->'snapshot',jsonb_build_array(o->'snapshot'));
  if rebuilt->'total_cents' is distinct from o->'snapshot'->'total_cents' or
   (select jsonb_agg(x order by x->>'key') from jsonb_array_elements(rebuilt->'goods') x) is distinct from
   (select jsonb_agg(x order by x->>'key') from jsonb_array_elements(o->'snapshot'->'goods') x) then
    raise exception 'Manuelt tilpassede varer kan ikke kombineres automatisk. Bruk separate pakkealternativer eller butikktillegg.' using errcode='22023';end if;
 end loop;
 for v in select value from jsonb_array_elements_text(ids) order by value loop
  if v=any(seen) or v=base_id::text then raise exception 'Velg hvert tilvalg bare én gang.' using errcode='22023';end if;seen:=array_append(seen,v);
  select x into o from jsonb_array_elements(offers) x where x->>'id'=v;
  if o is null then raise exception 'Et tilvalg er ikke delt med denne boligen.' using errcode='22023';end if;
  selected:=selected||jsonb_build_array(o->'snapshot');names:=array_append(names,o->>'title');
 end loop;
 snapshot:=bolig_private.portal_frozen_selection(base->'snapshot',selected);
 return jsonb_build_object('id',base_id,'source_revision',base->'source_revision','title',case when cardinality(names)=0 then base->>'title' else array_to_string(names,' + ') end,'snapshot',snapshot,'selected_offer_ids',ids);
end$$;
revoke all on function bolig_private.portal_combine(jsonb,uuid,jsonb) from public,anon,authenticated,service_role;

create function bolig_private.portal_goods(goods jsonb) returns jsonb language sql immutable set search_path='' as $$
 select coalesce(jsonb_agg(bolig_private.commercial_goods(jsonb_build_array(g))->0 || jsonb_build_object('image_url',case when coalesce(g->>'image_url','') ~ '^https://' then g->>'image_url' else '' end) order by n),'[]') from jsonb_array_elements(goods) with ordinality x(g,n)
$$;
revoke all on function bolig_private.portal_goods(jsonb) from public,anon,authenticated,service_role;
create or replace function bolig_private.portal_offer(o jsonb) returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_object('id',o->'id','title',o->'title','total_cents',o->'snapshot'->'total_cents','goods',bolig_private.portal_goods(o->'snapshot'->'goods'),
 'selected_offer_ids',o->'selected_offer_ids',
 'price_details',(select coalesce(jsonb_agg(jsonb_build_object('id',v->>'id','name',v->>'name','room_name',v->>'room_name','price_cents',v->'price_cents','deduction_cents',v->'deduction_cents','net_cents',v->'net_cents','replace_key',v->>'replace_key')),'[]') from jsonb_array_elements(coalesce(o->'snapshot'->'options','[]')) v))
$$;

alter function bolig_private.portal_state(bolig_private.resident_portals) rename to portal_state_before_combinations;
revoke all on function bolig_private.portal_state_before_combinations(bolig_private.resident_portals) from public,anon,authenticated,service_role;
create function bolig_private.portal_state(p bolig_private.resident_portals) returns jsonb language sql stable set search_path='' as $$
 select bolig_private.portal_state_before_combinations(p)||jsonb_build_object('combine_base_id',p.combine_base_id)
$$;
revoke all on function bolig_private.portal_state(bolig_private.resident_portals) from public,anon,authenticated,service_role;

-- Keep all existing authorization, contact, deadline, replay and acceptance guards.
do $migration$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_private.resident_portal(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 anchor:='update bolig_private.resident_portals set token_hash=';
 if position(anchor in body)=0 then raise exception 'Missing publish anchor';end if;
 body:=replace(body,anchor,$patch$if not (payload ? 'combine_base_id') then
 payload:=payload||jsonb_build_object('combine_base_id',p.combine_base_id);end if;
 if nullif(payload->>'combine_base_id','') is not null then
 perform bolig_private.portal_combine(p.offers,(payload->>'combine_base_id')::uuid,'[]');end if;
 update bolig_private.resident_portals set combine_base_id=nullif(payload->>'combine_base_id','')::uuid where id=p.id;
 update bolig_private.resident_portals set token_hash=$patch$);
 execute body;
 body:=pg_get_functiondef('bolig_resident_private.portal(text,text,jsonb)'::regprocedure);
 anchor:=$a$select o into offer from jsonb_array_elements(p.published_offers) o where o->>'id'=payload->>'offer_id';$a$;
 if position(anchor in body)=0 then raise exception 'Missing resident choice anchor';end if;
 body:=replace(body,anchor,$patch$if p.combine_base_id is not null then
 offer:=bolig_private.portal_combine(p.published_offers,p.combine_base_id,payload->'offer_ids');
 else
 if payload ? 'offer_ids' then raise exception 'Denne portalen bruker ett pakkealternativ.' using errcode='22023';end if;
 select o into offer from jsonb_array_elements(p.published_offers) o where o->>'id'=payload->>'offer_id';
 end if;$patch$);
 execute body;
end$migration$;
notify pgrst,'reload schema';

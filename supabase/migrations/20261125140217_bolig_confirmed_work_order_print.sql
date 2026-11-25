-- Read-only artisan sheet. Prices, contact data, tokens and drafts never enter it.
create function bolig_private.work_order(c uuid, root uuid, unit uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare state jsonb;ctx jsonb;d bolig_private.commercial_documents%rowtype;
 base bolig_private.commercial_documents%rowtype;ev bolig_private.resident_events%rowtype;
 cv jsonb;goods jsonb:='[]';raw_goods jsonb:='[]';g jsonb;image text;identity jsonb;
 sources jsonb:='[]';notes jsonb:='[]';result jsonb;accepted boolean:=false;since_at timestamptz;
begin
 state:=bolig_private.package_choices(c,root,unit,'get',null,'{}');ctx:=state->'context';
 if ctx->>'role' is distinct from 'manager' or coalesce((ctx->>'enabled')::boolean,false)=false then
  raise exception 'Prosjektledertilgang kreves for bestillingsutskrift.' using errcode='42501';end if;
 select * into base from bolig_private.commercial_documents x where x.root_id=root and x.unit_id=unit
  and x.kind='choice' and x.status in ('accepted','handled') order by x.accepted_at desc,x.created_at desc limit 1;
 if base.id is not null then
  accepted:=true;since_at:=base.accepted_at;goods:=base.snapshot->'goods';identity:=base.snapshot->'identity';
  select snapshot into cv from bolig_private.choice_versions x where x.root_id=root and x.unit_id=unit and x.revision=(base.snapshot->>'choice_revision')::bigint;
  raw_goods:=coalesce(cv->'goods','[]');
  sources:=jsonb_build_array(jsonb_build_object('id',base.id,'version',base.version,'title','Boligvalg','at',base.accepted_at));
  notes:=jsonb_build_array(jsonb_build_object('title','Boligvalg','text',base.snapshot->>'reason','blocks',coalesce(base.snapshot->'text_blocks','[]')));
 else
  -- A submitted choice is printable, but is never described as an accepted agreement.
  select e.* into ev from bolig_private.resident_events e join bolig_private.resident_portals p on p.id=e.portal_id
   where p.root_id=root and p.unit_id=unit and e.kind='request' and e.sender='resident' and e.contact_basis=p.contact_basis
   order by e.created_at desc,e.id desc limit 1;
  if ev.id is null then raise exception 'Ingen kundebekreftet bestilling eller innsendte beboervalg er registrert for boligen.' using errcode='22023';end if;
  goods:=ev.snapshot->'snapshot'->'goods';raw_goods:=coalesce(goods,'[]');since_at:=ev.created_at;
  sources:=jsonb_build_array(jsonb_build_object('id',ev.id,'title',ev.snapshot->>'title','status',ev.status,'at',ev.created_at));
  notes:=jsonb_build_array(jsonb_build_object('title','Beboerens merknad','text',ev.body));
 end if;
 if identity is null then
  select jsonb_build_object('project',r.title,'company',ctx->>'company_name','block',b.name,'unit',u.number,'address',e.address) into identity
   from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id join bolig_private.roots r on r.id=u.root_id
   where u.id=unit and r.id=root;
 end if;
 -- Enrich only from that exact frozen choice version, never today's catalogue.
 select coalesce(jsonb_agg(item || jsonb_build_object('image_url',coalesce((select x->>'image_url' from jsonb_array_elements(raw_goods) x
   where x->>'key'=item->>'key' and x->>'name'=item->>'name' and coalesce(x->>'sku','')=coalesce(item->>'sku','') limit 1),'')) order by n),'[]') into goods
   from jsonb_array_elements(coalesce(goods,'[]')) with ordinality z(item,n);
 if accepted then
  for d in select * from bolig_private.commercial_documents x where x.root_id=root and x.unit_id=unit and x.kind='change'
    and x.status in ('accepted','handled') order by x.accepted_at,x.created_at,x.id loop
   -- Each ordinary change replaces its frozen order subset. Shop supplements add their own unique keys.
   select coalesce(jsonb_agg(x order by n),'[]') into goods from jsonb_array_elements(goods) with ordinality z(x,n)
    where not exists(select 1 from jsonb_array_elements(coalesce(d.snapshot->'before_goods','[]')) old where old->>'key'=x->>'key')
    and not exists(select 1 from jsonb_array_elements(coalesce(d.snapshot->'goods','[]')) newer where newer->>'key'=x->>'key');
   for g in select value from jsonb_array_elements(coalesce(d.snapshot->'goods','[]')) loop
    image:=coalesce(g->>'image_url',(select x->>'image_url' from jsonb_array_elements(raw_goods) x where x->>'key'=g->>'key' and x->>'name'=g->>'name' and coalesce(x->>'sku','')=coalesce(g->>'sku','') limit 1),'');
    goods:=goods||jsonb_build_array(g||jsonb_build_object('image_url',image));
   end loop;
   sources:=sources||jsonb_build_array(jsonb_build_object('id',d.id,'version',d.version,'title',d.snapshot->>'reason','at',d.accepted_at));
   notes:=notes||jsonb_build_array(jsonb_build_object('title',d.snapshot->>'reason','text','','blocks',coalesce(d.snapshot->'text_blocks','[]')));
  end loop;
 end if;
 -- Whitelist the price-free output; historic notes stay attached to their source, not guessed new positions.
 select coalesce(jsonb_agg(jsonb_build_object('key',item->>'key','name',item->>'name','sku',coalesce(item->>'sku',''),'quantity',item->'quantity','unit',item->>'unit',
  'room_name',coalesce(item->>'room_name',''),'section_name',coalesce(item->>'section_name',''),'image_url',coalesce(item->>'image_url','')) order by n),'[]') into goods from jsonb_array_elements(goods) with ordinality z(item,n);
 result:=jsonb_build_object('context',ctx,'root_id',root,'unit_id',unit,'identity',identity,'confirmed',accepted,'sources',sources,'goods',goods,'notes',notes);
 return result||jsonb_build_object('basis',md5(result::text));
end$$;
revoke all on function bolig_private.work_order(uuid,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function bolig_private.work_order(uuid,uuid,uuid) to authenticated;
create function public.bolig_work_order(p_company_id uuid,p_root_id uuid,p_unit_id uuid) returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.work_order(p_company_id,p_root_id,p_unit_id)$$;
revoke all on function public.bolig_work_order(uuid,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.bolig_work_order(uuid,uuid,uuid) to authenticated;
notify pgrst,'reload schema';

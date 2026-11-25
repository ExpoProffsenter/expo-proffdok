-- Apartment-only goods overrides. Frozen choices and orders remain immutable.
-- Shared catalogs are never written by this command.
alter function bolig_private.package_choices(uuid,uuid,uuid,text,bigint,jsonb) rename to package_choices_standard;
revoke all on function bolig_private.package_choices_standard(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,authenticated,service_role;
create function bolig_private.package_choices(c uuid,root uuid,unit uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare state jsonb;
begin
 state:=bolig_private.package_choices_standard(c,root,unit,'get',null,'{}');
 if action in ('preview','save') then
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
  state:=bolig_private.package_choices_standard(c,root,unit,'get',null,'{}');
  if exists(select 1 from jsonb_array_elements(state->'components') p where p->>'scope_id'=payload->>'scope_id' and p ? 'customization') then
   raise exception 'Denne pakken er tilpasset bare denne boligen. Bruk Tilpass denne leiligheten, eller gjenopprett det opprinnelige pakkevalget der før du velger en annen pakke.' using errcode='PT409';
  end if;
 end if;
 return bolig_private.package_choices_standard(c,root,unit,action,expected,payload);
end$$;
revoke all on function bolig_private.package_choices(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function bolig_private.package_choices(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;

create function bolig_private.unit_customization(c uuid,root uuid,unit uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare state jsonb;part jsonb;base jsonb;components jsonb;proposal jsonb;content jsonb;goods jsonb:='[]';options jsonb:='[]';normalized jsonb:='[]';l jsonb;g jsonb;p jsonb;o jsonb;a jsonb;allocs jsonb;keys text[]:='{}';sid text;reason text;adjustment bigint;nr bigint;total bigint:=0;minimum bigint;idx bigint;old_idx bigint;identity jsonb;
begin
 if action is null or action not in ('get','preview','save','reset_preview','reset') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>450000 then raise exception 'Ugyldig boligtilpasning.' using errcode='22023';end if;
 state:=bolig_private.package_choices_standard(c,root,unit,'get',null,'{}');
 if action='get' then return state;end if;
 if state->'context'->>'role'<>'manager' or (state->>'root_archived')::boolean then raise exception 'Prosjektleder og aktivt boligprosjekt kreves.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 perform pg_advisory_xact_lock(hashtextextended('bolig-rooms:'||unit::text,0));
 state:=bolig_private.package_choices_standard(c,root,unit,'get',null,'{}');
 if not exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=unit and u.root_id=root and not u.archived and not e.archived and not b.archived) then raise exception 'Velg en aktiv bolig.' using errcode='42501';end if;
 nr:=coalesce((state->'selection'->>'revision')::bigint,0);
 if expected is distinct from nr or (payload->>'catalog_revision')::bigint is distinct from (state->>'revision')::bigint or (payload->>'rooms_revision')::bigint is distinct from (state->>'rooms_revision')::bigint then raise exception 'Boligvalg, rom eller pakker er endret. Kladden er beholdt. Hent siste grunnlag og se over endringene.' using errcode='PT409';end if;
 -- Prepared orders must be explicitly cancelled too; an order may already be mailed.
 if exists(select 1 from bolig_private.purchase_orders po where po.unit_id=unit and po.root_id=root and po.status<>'cancelled') then raise exception 'Boligen har en klargjort eller bestilt ordre. Avklar ordren før varegrunnlaget endres. Usendte grunnlag kan annulleres; bestilte varer krever en egen endringsordre.' using errcode='PT409';end if;
 sid:=payload->>'scope_id';
 select value into part from jsonb_array_elements(state->'components') where value->>'scope_id'=sid;
 if part is null or (sid<>'common' and not exists(select 1 from bolig_private.rooms where id=(part->>'room_id')::uuid and unit_id=unit and root_id=root and not archived)) then raise exception 'Velg en eksisterende pakke i et aktivt rom eller fellespakken.' using errcode='42501';end if;
 reason:=trim(payload->>'reason');
 if jsonb_typeof(payload->'reason') is distinct from 'string' or coalesce(length(reason),0) not between 3 and 1000 then raise exception 'Beskriv hvorfor denne boligen tilpasses (3–1000 tegn).' using errcode='22023';end if;
 base:=coalesce(part->'customization'->'base',part-'customization');
 if action in ('reset_preview','reset') then
  if not part ? 'customization' then raise exception 'Pakken har ingen individuell tilpasning.' using errcode='22023';end if;
  part:=base;
 else
  if jsonb_typeof(payload->'adjustment_cents') is distinct from 'number' or (payload->>'adjustment_cents')::numeric<>trunc((payload->>'adjustment_cents')::numeric) or abs((payload->>'adjustment_cents')::numeric)>1000000000 then raise exception 'Skriv et gyldig pristillegg eller fratrekk.' using errcode='22023';end if;
  adjustment:=(payload->>'adjustment_cents')::bigint;
  if jsonb_typeof(payload->'lines') is distinct from 'array' or jsonb_array_length(payload->'lines') not between 1 and 1000 then raise exception 'Bruk mellom 1 og 1000 varelinjer.' using errcode='22023';end if;
  for l,idx in select value,n-1 from jsonb_array_elements(payload->'lines') with ordinality x(value,n) loop
   if coalesce(l->>'key','') !~ '^[a-zA-Z0-9/-]{1,150}$' or l->>'key'=any(keys) then raise exception 'Varelinjene må ha ulike, gyldige nøkler.' using errcode='22023';end if;
   keys:=array_append(keys,l->>'key');
   -- Reuse catalog validation and an explicit allowlist; discard caller-supplied prices/room IDs.
   content:=bolig_private.catalog_content(jsonb_build_object('sections',coalesce(payload->'sections','[]'),'lines',jsonb_build_array(l||jsonb_build_object('key','validate'))),false);
   g:=(content->'lines'->0)||jsonb_build_object('key',l->>'key');
   normalized:=normalized||jsonb_build_array(g);
  end loop;
  allocs:='[]';
  for g,idx in select value,n-1 from jsonb_array_elements(normalized) with ordinality x(value,n) loop
   select n-1 into old_idx from jsonb_array_elements(part->'goods') with ordinality x(value,n) where bolig_private.same_good(value,g) limit 1;
   if old_idx is not null then
    for a in select value from jsonb_array_elements(coalesce(part->'allocations','[]')) where (value->>'position')::bigint=old_idx loop allocs:=allocs||jsonb_build_array(a||jsonb_build_object('position',idx));end loop;
   end if;
  end loop;
  part:=part||jsonb_build_object('goods',normalized,'allocations',allocs,'total_cents',(base->>'total_cents')::bigint+adjustment,'customization',jsonb_build_object('base',base,'sections',coalesce(payload->'sections','[]'),'adjustment_cents',adjustment,'reason',reason,'by',auth.uid(),'at',now()));
 end if;
 select jsonb_agg(case when value->>'scope_id'=sid then part else value end order by n) into components from jsonb_array_elements(state->'components') with ordinality x(value,n);
 minimum:=(state->>'revision')::bigint;
 for p in select value from jsonb_array_elements(components) order by case when value->>'scope_id'='common' then 0 else 1 end,value->>'scope_id' loop
  total:=total+(p->>'total_cents')::bigint;minimum:=least(minimum,(p->>'catalog_revision')::bigint);
  for g,idx in select value,n-1 from jsonb_array_elements(p->'goods') with ordinality x(value,n) loop
   select coalesce(jsonb_agg(value),'[]') into allocs from jsonb_array_elements(coalesce(p->'allocations','[]')) where (value->>'position')::bigint=idx;
   goods:=goods||jsonb_build_array(g||jsonb_build_object('key',(p->>'scope_id')||'/'||(g->>'key'),'source_key',g->>'key','scope_id',p->>'scope_id','room_id',p->'room_id','room_name',p->>'room_name','room_allocations',allocs));
  end loop;
  for o in select value from jsonb_array_elements(p->'options') loop options:=options||jsonb_build_array(o||jsonb_build_object('source_option_id',o->>'id','id',(p->>'scope_id')||'/'||(o->>'id'),'scope_id',p->>'scope_id','room_name',p->>'room_name'));end loop;
 end loop;
 if jsonb_array_length(goods)>1000 or jsonb_array_length(goods)<>(select count(distinct value->>'key') from jsonb_array_elements(goods)) then raise exception 'Boligen kan ha inntil 1000 ulike varelinjer.' using errcode='22023';end if;
 select jsonb_build_object('unit_id',u.id,'number',u.number,'contact_name',u.contact_name,'address',e.address,'block',b.name) into identity from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=unit;
 proposal:=jsonb_build_object('format','scoped-v1','status','draft','catalog_revision',minimum,'components',components,'package',jsonb_build_object('id',null,'name','Felles- og rompakker','lines','[]'::jsonb),'options',options,'goods',goods,'total_cents',total,'identity',identity,'base_payer','sameie','options_payer','beboer','customization_event',jsonb_build_object('scope_id',sid,'reason',reason,'action',action,'by',auth.uid(),'at',now()));
 if action in ('save','reset') then
  insert into bolig_private.choice_versions(unit_id,root_id,revision,snapshot,created_by) values(unit,root,nr+1,proposal,auth.uid());
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'unit_customization',unit,nr+1);
  return bolig_private.package_choices_standard(c,root,unit,'get',null,'{}');
 end if;
 return state||jsonb_build_object('proposal',proposal);
end$$;
revoke all on function bolig_private.unit_customization(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function bolig_private.unit_customization(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;
create function public.bolig_unit_customization(p_company_id uuid,p_root_id uuid,p_unit_id uuid,p_action text default 'get',p_revision bigint default null,p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.unit_customization(p_company_id,p_root_id,p_unit_id,p_action,p_revision,p_payload)$$;
revoke all on function public.bolig_unit_customization(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function public.bolig_unit_customization(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;

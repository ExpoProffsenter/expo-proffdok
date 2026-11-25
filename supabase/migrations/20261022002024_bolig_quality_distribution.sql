-- A previewed, atomic distribution creates independent controls and never edits
-- existing answers. Receipts make lost-response replay safe without duplication.
create table bolig_private.quality_distribution_receipts(
 root_id uuid not null references bolig_private.roots(id),actor_id uuid not null references auth.users(id),
 request_id uuid not null,payload jsonb not null,result jsonb not null,created_at timestamptz not null default clock_timestamp(),
 primary key(root_id,actor_id,request_id));
create index bolig_quality_distribution_actor on bolig_private.quality_distribution_receipts(actor_id);
alter table bolig_private.quality_distribution_receipts enable row level security;
revoke all on bolig_private.quality_distribution_receipts from public,anon,authenticated,service_role;

create function bolig_private.quality_distribution(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare access jsonb;ctx jsonb;targets jsonb;sources jsonb;project_lists jsonb;templates jsonb;plan jsonb:='[]';entry jsonb;target jsonb;source jsonb;definition jsonb;current_data jsonb;row_data jsonb;args jsonb;existing bool;revision bigint;source_revision bigint;basis text;request uuid;receipt bolig_private.quality_distribution_receipts%rowtype;result jsonb;added int:=0;skipped int:=0;max_ops int:=0;
begin
 if action is null or action not in ('get','preview','apply') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>500000 then raise exception 'Ugyldig fordeling av sjekklister.' using errcode='22023';end if;
 if action='apply' then perform 1 from bolig_private.roots where id=root and company_id=c for update;end if;
 access:=bolig_private.quality_scope(c,root,root);ctx:=access->'context';
 if ctx->>'role'<>'manager' or (access->>'archived')::boolean then raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
 select coalesce(jsonb_agg(t order by t->>'block',t->>'title',t->>'room'),'[]') into targets from (
 select jsonb_build_object('scope_id',u.id,'room_id',null,'block_id',b.id,'block',b.name,'title',u.number||case when e.address='' then ' · Adresse ikke angitt' else ' · '||e.address end,'room',null) t
 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.root_id=root and not u.archived and not e.archived and not b.archived
 union all select jsonb_build_object('scope_id',u.id,'room_id',room.id,'block_id',b.id,'block',b.name,'title',u.number||case when e.address='' then ' · Adresse ikke angitt' else ' · '||e.address end,'room',room.name)
 from bolig_private.rooms room join bolig_private.units u on u.id=room.unit_id join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where room.root_id=root and not room.archived and not u.archived and not e.archived and not b.archived) q;
 select coalesce(jsonb_agg(jsonb_build_object('id',x->>'id','scope_id',q.scope_id,'title',x#>>'{definition,title}','scope_title',case when q.scope_id=root then 'Prosjekt' else coalesce((select number from bolig_private.units where id=q.scope_id),(select name from bolig_private.blocks where id=q.scope_id)) end) order by x#>>'{definition,title}'),'[]') into project_lists from bolig_private.quality_states q cross join lateral jsonb_array_elements(q.data->'checks') x where q.root_id=root and not coalesce((x->>'archived')::boolean,false) and (q.scope_id=root or exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=q.scope_id and not u.archived and not e.archived and not b.archived) or exists(select 1 from bolig_private.blocks b where b.id=q.scope_id and not b.archived));
 templates:='[]';
 if exists(select 1 from public.company_module_access where company_id=c and module_key='kshms' and enabled) then
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'title',content->>'title','number',number) order by content->>'title'),'[]') into templates from(select distinct on(v.template_id) v.id,v.number,v.content from public.kshms_checklist_versions v join public.kshms_checklist_templates t on t.id=v.template_id and t.company_id=c where v.company_id=c and not t.archived order by v.template_id,v.number desc) q;
 end if;
 if action='get' then return jsonb_build_object('context',ctx,'root_id',root,'targets',targets,'project_lists',project_lists,'templates',templates);end if;
 if jsonb_typeof(payload->'targets') is distinct from 'array' or jsonb_array_length(payload->'targets') not between 1 and 2000 or jsonb_typeof(payload->'sources') is distinct from 'array' or jsonb_array_length(payload->'sources') not between 1 and 20 or jsonb_typeof(payload->'required') is distinct from 'boolean' then raise exception 'Velg sjekklister, boliger/rom og om kontrollene er påkrevde.' using errcode='22023';end if;
 if (select count(*) from (select distinct t->>'scope_id',coalesce(t->>'room_id','') from jsonb_array_elements(payload->'targets') t) q)<>jsonb_array_length(payload->'targets') then raise exception 'Hvert mål kan bare velges én gang.' using errcode='22023';end if;
 if (select count(*) from (select distinct s::text from jsonb_array_elements(payload->'sources') s) q)<>jsonb_array_length(payload->'sources') then raise exception 'Hver sjekkliste kan bare velges én gang.' using errcode='22023';end if;
 for target in select value from jsonb_array_elements(payload->'targets') loop
  if not exists(select 1 from jsonb_array_elements(targets) t where t->>'scope_id'=target->>'scope_id' and coalesce(t->>'room_id','')=coalesce(target->>'room_id','')) then raise exception 'En valgt bolig eller et rom er ikke aktivt i prosjektet. Oppdater fordelingen.' using errcode='42501';end if;
 end loop;
 if action='apply' then
  request:=nullif(payload->>'request_id','')::uuid;
  if request is null then raise exception 'Fordelingen mangler referanse.' using errcode='22023';end if;
  select * into receipt from bolig_private.quality_distribution_receipts where root_id=root and actor_id=auth.uid() and request_id=request;
  if found then
   if receipt.payload is distinct from payload then raise exception 'Fordelingen har et annet lagret innhold.' using errcode='PT409';end if;
   return receipt.result||jsonb_build_object('context',ctx,'replayed',true);
  end if;
 end if;
 for target in select value from jsonb_array_elements(payload->'targets') order by value->>'scope_id',value->>'room_id' loop
  select data,q.revision into current_data,revision from bolig_private.quality_states q where q.root_id=root and q.scope_id=(target->>'scope_id')::uuid;
  revision:=coalesce(revision,0);current_data:=coalesce(current_data,'{"checks":[]}');
  for source in select value from jsonb_array_elements(payload->'sources') order by value::text loop
   definition:=null;source_revision:=null;args:=jsonb_build_object('required',payload->'required','room_id',target->>'room_id');
   if source->>'kind'='template' then
    if not exists(select 1 from jsonb_array_elements(templates) t where t->>'id'=source->>'id') then raise exception 'Firmamalen er endret eller ikke tilgjengelig. Velg siste publiserte utgave.' using errcode='PT409';end if;
    select v.content into definition from public.kshms_checklist_versions v where v.id=(source->>'id')::uuid and v.company_id=c;
    args:=args||jsonb_build_object('version_id',source->>'id');
    select exists(select 1 from jsonb_array_elements(current_data->'checks') x where not coalesce((x->>'archived')::boolean,false) and x->>'source_version_id'=source->>'id' and coalesce(x->>'room_id','')=coalesce(target->>'room_id','')) into existing;
   elsif source->>'kind'='project' then
    if not exists(select 1 from jsonb_array_elements(project_lists) x where x->>'id'=source->>'id' and x->>'scope_id'=source->>'scope_id') then raise exception 'Prosjektlisten er ikke tilgjengelig. Oppdater fordelingen.' using errcode='42501';end if;
    select x,q.revision into row_data,source_revision from bolig_private.quality_states q cross join lateral jsonb_array_elements(q.data->'checks') x where q.root_id=root and q.scope_id=(source->>'scope_id')::uuid and x->>'id'=source->>'id';
    definition:=row_data->'definition';args:=args||jsonb_build_object('copy_scope_id',source->>'scope_id','copy_check_id',source->>'id');
    select exists(select 1 from jsonb_array_elements(current_data->'checks') x where not coalesce((x->>'archived')::boolean,false) and (x->>'id'=source->>'id' or x->>'copy_check_id'=source->>'id' and x->>'copy_scope_id'=source->>'scope_id') and coalesce(x->>'room_id','')=coalesce(target->>'room_id','')) into existing;
   else raise exception 'Velg firmamal eller prosjektliste.' using errcode='22023';end if;
   entry:=jsonb_build_object('scope_id',target->>'scope_id','room_id',target->>'room_id','title',definition->>'title','revision',revision,'source_revision',source_revision,'definition_hash',md5(definition::text),'args',args,'skip',existing);
   plan:=plan||jsonb_build_array(entry);max_ops:=max_ops+1;
   if max_ops>2000 then raise exception 'Fordel høyst 2 000 nye kontroller om gangen.' using errcode='22023';end if;
   if existing then skipped:=skipped+1;else added:=added+1;end if;
  end loop;
 end loop;
 basis:=md5(plan::text);result:=jsonb_build_object('context',ctx,'root_id',root,'basis',basis,'added',added,'skipped',skipped,'plan',plan-'args');
 if action='preview' then return result;end if;
 if payload->>'basis' is distinct from basis then raise exception 'Grunnlaget er endret. Se over en ny forhåndsvisning. Valgene dine er beholdt.' using errcode='PT409';end if;
 for entry in select value from jsonb_array_elements(plan) where value->'skip'='false'::jsonb loop
  select coalesce(q.revision,0) into revision from bolig_private.quality_states q where q.root_id=root and q.scope_id=(entry->>'scope_id')::uuid;
  perform bolig_private.quality(c,root,(entry->>'scope_id')::uuid,'check_add',coalesce(revision,0),entry->'args');
 end loop;
 result:=result||jsonb_build_object('plan',null,'replayed',false);
 insert into bolig_private.quality_distribution_receipts(root_id,actor_id,request_id,payload,result) values(root,auth.uid(),request,payload,result);
 return result;
end$$;
revoke all on function bolig_private.quality_distribution(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.quality_distribution(uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_quality_distribution(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.quality_distribution(p_company_id,p_root_id,p_action,p_payload)$$;
revoke all on function public.bolig_quality_distribution(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_quality_distribution(uuid,uuid,text,jsonb) to authenticated;
notify pgrst,'reload schema';

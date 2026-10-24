-- Project-wide, function-based partner access. Existing selected-row links stay narrow.
alter table bolig_private.partner_access add column access_mode text not null default 'selected' check(access_mode in('selected','project'));
alter table bolig_private.partner_access add column features text[] not null default '{}';
alter table bolig_private.partner_access add column supplier_name text not null default '';

create function bolig_private.partner_allowed(p bolig_private.partner_access,kind text,target uuid) returns boolean
language sql stable set search_path='' as $$
 select case when p.access_mode='selected' then case when kind='order' then target=any(p.order_ids) when kind='task' then target=any(p.task_ids) else false end
 when kind='task' then 'progress'=any(p.features) and exists(select 1 from bolig_private.progress_tasks t where t.id=target and t.root_id=p.root_id)
 when kind='order' then 'orders'=any(p.features) and exists(select 1 from bolig_private.purchase_orders o where o.id=target and o.root_id=p.root_id and lower(trim(o.snapshot->>'supplier'))=lower(trim(p.supplier_name)))
 else false end
$$;
revoke all on function bolig_private.partner_allowed(bolig_private.partner_access,text,uuid) from public,anon,authenticated,service_role;

create function bolig_private.partner_checklists(root uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(row_data order by row_data->>'address',row_data->>'number',row_data->>'title'),'[]') from (
 select jsonb_build_object('id',x->>'id','scope_id',q.scope_id,'title',x#>>'{definition,title}','trade',x#>>'{definition,trade}',
 'number',coalesce(u.number,b.name,'Prosjekt'),'address',coalesce(e.address,''),'room_name',room.name,
 'status',x->>'status','required',x->'required','completed_at',x->>'completed_at',
 'points',(select coalesce(jsonb_agg(jsonb_build_object('id',pt->>'id','title',pt->>'title','guidance',pt->>'guidance','status',x->'answers'->(pt->>'id')->>'status') order by n),'[]') from jsonb_array_elements(x#>'{definition,points}') with ordinality p(pt,n))) row_data
 from bolig_private.quality_states q cross join lateral jsonb_array_elements(q.data->'checks') x
 left join bolig_private.units u on u.id=q.scope_id and u.root_id=root
 left join bolig_private.entrances e on e.id=u.entrance_id
 left join bolig_private.blocks ub on ub.id=e.block_id
 left join bolig_private.blocks b on b.id=q.scope_id and b.root_id=root
 left join bolig_private.rooms room on room.id=nullif(x->>'room_id','')::uuid and room.unit_id=u.id and room.root_id=root
 where q.root_id=root and not coalesce((x->>'archived')::boolean,false)
 and (q.scope_id=root or (b.id is not null and not b.archived) or (u.id is not null and not u.archived and not e.archived and not ub.archived))
 and (nullif(x->>'room_id','') is null or (room.id is not null and not room.archived))
 ) rows
$$;
revoke all on function bolig_private.partner_checklists(uuid) from public,anon,authenticated,service_role;

create or replace function bolig_private.partner_view(p bolig_private.partner_access) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',p.id,'name',p.name,'organisation',p.organisation,'kind',p.kind,'expires_at',p.expires_at,
 'active',bolig_private.partner_active(p),'revoked',p.revoked,'revision',p.revision,'access_mode',p.access_mode,
 'features',case when p.access_mode='project' then to_jsonb(p.features) else to_jsonb(array_remove(array[case when cardinality(p.order_ids)>0 then 'orders' end,case when cardinality(p.task_ids)>0 then 'progress' end],null)) end,
 'supplier_name',case when 'orders'=any(p.features) then p.supplier_name else '' end,
 'unit_count',(select count(*) from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.root_id=p.root_id and not u.archived and not e.archived and not b.archived),
 'project',(select jsonb_build_object('title',r.title,'reference',r.reference,'company',c.display_name) from bolig_private.roots r join public.sales_company_scopes c on c.id=r.company_id where r.id=p.root_id),
 'orders',(select coalesce(jsonb_agg(v order by v->>'address',v->>'number',v->>'title'),'[]') from (select bolig_private.partner_target(p.root_id,'order',o.id) v from bolig_private.purchase_orders o where o.root_id=p.root_id and bolig_private.partner_allowed(p,'order',o.id)) s where v is not null),
 'tasks',(select coalesce(jsonb_agg(v order by v->>'planned_start',v->>'address',v->>'number',v->>'title'),'[]') from (select bolig_private.partner_target(p.root_id,'task',t.id) v from bolig_private.progress_tasks t where t.root_id=p.root_id and bolig_private.partner_allowed(p,'task',t.id)) s where v is not null),
 'checklists',case when p.access_mode='project' and 'checklists'=any(p.features) then bolig_private.partner_checklists(p.root_id) else '[]'::jsonb end,
 'events',(select coalesce(jsonb_agg(to_jsonb(e)-'access_id'||jsonb_build_object('current',e.basis=bolig_private.partner_target(p.root_id,e.kind,e.target_id)->>'basis') order by e.created_at desc,e.id),'[]') from (select * from bolig_private.partner_events where access_id=p.id and bolig_private.partner_allowed(p,kind,target_id) order by created_at desc,id limit 200) e))
$$;

-- Preserve exact old attempts and old grants. All public calls still reauthorize.
alter function bolig_private.partners(uuid,uuid,text,jsonb) rename to partners_selected_v1;
revoke all on function bolig_private.partners_selected_v1(uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
create function bolig_private.partners(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare state jsonb;ctx jsonb;p bolig_private.partner_access%rowtype;receipt bolig_private.partner_receipts%rowtype;
 rid uuid;created uuid;fp bytea;features text[];supplier text;days int;
begin
 -- Existing manager/reader, company, module and project checks, including reads.
 state:=bolig_private.partners_selected_v1(c,root,'get','{}');ctx:=state->'context';
 if action is null or action not in('get','create','revoke','permissions') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>100000 then raise exception 'Ugyldig tilgangsgrunnlag.' using errcode='22023';end if;
 if action='create' and coalesce(payload->>'access_mode','selected')='selected' or action='revoke' then
  state:=bolig_private.partners_selected_v1(c,root,action,payload);
 elsif action in('create','permissions') then
  if ctx->>'role'<>'manager' then raise exception 'Prosjektleder kreves.' using errcode='42501';end if;
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
  rid:=(payload->>'request_id')::uuid;
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  fp:=sha256(convert_to(jsonb_build_array(action,payload)::text,'UTF8'));
  select * into receipt from bolig_private.partner_receipts where root_id=root and actor=auth.uid()::text and request_id=rid;
  if found then
   if receipt.fingerprint<>fp then raise exception 'Referansen er brukt til noe annet.' using errcode='PT409';end if;
   created:=(receipt.result->>'created_id')::uuid;
  else
   if payload->>'access_mode' is distinct from 'project' or payload->'reviewed' is distinct from 'true'::jsonb or jsonb_typeof(payload->'features') is distinct from 'array' or jsonb_array_length(payload->'features') not between 1 and 3 then raise exception 'Velg minst én funksjon for hele prosjektet.' using errcode='22023';end if;
   select array_agg(v order by v) into features from jsonb_array_elements_text(payload->'features') v;
   if exists(select 1 from unnest(features) v where v is null or v not in('progress','checklists','orders')) or cardinality(features)<>(select count(distinct v) from unnest(features) v) then raise exception 'Velg gyldige funksjoner én gang.' using errcode='22023';end if;
   supplier:=trim(coalesce(payload->>'supplier_name',''));
   if 'orders'=any(features) and length(supplier) not between 2 and 160 then raise exception 'Velg hvilken leverandørs bestillinger som deles i prosjektet.' using errcode='22023';end if;
   if not 'orders'=any(features) then supplier:='';end if;
   if coalesce(payload->'order_ids','[]')<>'[]'::jsonb or coalesce(payload->'task_ids','[]')<>'[]'::jsonb then raise exception 'Prosjekttilgang styres av funksjoner, ikke enkeltleiligheter.' using errcode='22023';end if;
   created:=(payload->>'id')::uuid;
   if created is null then raise exception 'Tilgangsreferanse mangler.' using errcode='22023';end if;
   if action='create' then
    if (select count(*) from bolig_private.partner_access where root_id=root)>=300 then raise exception 'Tilgangsgrensen er nådd.' using errcode='22023';end if;
    if coalesce(payload->>'token','') !~ '^[0-9a-f]{64}$' or length(trim(coalesce(payload->>'name',''))) not between 2 and 120 or length(trim(coalesce(payload->>'organisation',''))) not between 2 and 160 or length(coalesce(payload->>'email',''))>254 or coalesce(payload->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or coalesce(payload->>'kind','') not in('supplier','ue') then raise exception 'Fyll inn bedrift og kontaktperson.' using errcode='22023';end if;
    days:=(payload->>'days')::int;
    if days is null or days not between 1 and 90 then raise exception 'Velg 1–90 dager.' using errcode='22023';end if;
    insert into bolig_private.partner_access(id,root_id,name,email,organisation,kind,token_hash,order_ids,task_ids,expires_at,created_by,access_mode,features,supplier_name)
    values(created,root,trim(payload->>'name'),lower(trim(payload->>'email')),trim(payload->>'organisation'),payload->>'kind',sha256(convert_to(payload->>'token','UTF8')),'{}','{}',clock_timestamp()+make_interval(days=>days),auth.uid(),'project',features,supplier);
   else
    select * into p from bolig_private.partner_access where id=created and root_id=root for update;
    if p.id is null or p.revoked or p.access_mode<>'project' then raise exception 'Denne tilgangen kan ikke endres. Opprett en ny prosjekttilgang.' using errcode='42501';end if;
    if (payload->>'revision')::bigint is distinct from p.revision then raise exception 'Tilgangen eller oppfølgingen er endret. Hent siste status og se over valgene.' using errcode='PT409';end if;
    update bolig_private.partner_access set features=features,supplier_name=supplier,revision=revision+1 where id=created;
   end if;
   insert into bolig_private.partner_receipts values(root,auth.uid()::text,rid,fp,jsonb_build_object('created_id',created));
   insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'partner_'||action,created,coalesce(p.revision,0)+1);
  end if;
  state:=bolig_private.partners_selected_v1(c,root,'get','{}')||jsonb_build_object('created_id',created);
 end if;
 return state||jsonb_build_object('checklists',bolig_private.partner_checklists(root),
 'unit_count',(select count(*) from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.root_id=root and not u.archived and not e.archived and not b.archived),
 'suppliers',(select coalesce(jsonb_agg(name order by name),'[]') from (select distinct trim(snapshot->>'supplier') name from bolig_private.purchase_orders where root_id=root and trim(coalesce(snapshot->>'supplier',''))<>'') s));
end$$;
revoke all on function bolig_private.partners(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.partners(uuid,uuid,text,jsonb) to authenticated;

-- The capability gateway uses the identical function gate on every response/replay.
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_resident_private.partner(text,text,jsonb)'::regprocedure);
 anchor:=$a$coalesce(case when payload->>'kind'='order' then (payload->>'target_id')::uuid=any(p.order_ids) else (payload->>'target_id')::uuid=any(p.task_ids) end,false)$a$;
 if position(anchor in body)=0 then raise exception 'Missing partner response boundary';end if;
 execute replace(body,anchor,$a$coalesce(bolig_private.partner_allowed(p,payload->>'kind',(payload->>'target_id')::uuid),false)$a$);
end$patch$;

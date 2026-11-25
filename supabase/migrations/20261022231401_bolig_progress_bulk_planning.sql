-- One atomic plan for bulk setup, timeline dates, completion and reviewed notices.
-- Existing single-task and notice actions retain their validation and semantics.
create function bolig_private.progress_batch(c uuid,root uuid,unit uuid,payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare state jsonb; ctx jsonb; mode text; rid uuid; fp text; rev bigint; result jsonb;
 receipt bolig_private.progress_receipts%rowtype; item jsonb; ids uuid[]; before_rows jsonb; after_rows jsonb;
begin
 -- Existing gateway locks the root and reauthorizes before any state is read.
 state:=bolig_private.progress_workspace(c,root,unit,'get','{}');ctx:=state->'context';
 if ctx->>'role' is distinct from 'manager' or exists(select 1 from bolig_private.roots where id=root and archived) then
  raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
 if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>300000
 or payload->'reviewed' is distinct from 'true'::jsonb
 or coalesce(payload->>'mode','') not in('create','dates') or jsonb_typeof(payload->'items') is distinct from 'array' then
  raise exception 'Gjennomgå masseplanen før lagring.' using errcode='22023';end if;
 mode:=payload->>'mode';rev:=(state->>'revision')::bigint;rid:=(payload->>'request_id')::uuid;
 fp:=md5(jsonb_build_array('batch',unit,payload)::text);
 if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
 select * into receipt from bolig_private.progress_receipts where root_id=root and actor_id=auth.uid() and request_id=rid;
 if found then
  if receipt.fingerprint<>fp then raise exception 'Forsøket har annet innhold.' using errcode='PT409';end if;
  return receipt.result;
 end if;
 if (payload->>'revision')::bigint is distinct from rev then raise exception 'Fremdriften er endret. Kladden er beholdt. Hent siste status og forhåndsvis på nytt.' using errcode='PT409';end if;
 if jsonb_array_length(payload->'items') not between 1 and 400 then raise exception 'Velg mellom 1 og 400 aktiviteter per lagring.' using errcode='22023';end if;
 select array_agg((x->>'id')::uuid) into ids from jsonb_array_elements(payload->'items') x;
 if array_position(ids,null) is not null or cardinality(ids)<>(select count(distinct x) from unnest(ids) x) then raise exception 'Aktivitetsreferansene må være unike.' using errcode='22023';end if;
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into before_rows from bolig_private.progress_tasks t where t.id=any(ids);
 for item in select value from jsonb_array_elements(payload->'items') loop
  if jsonb_typeof(item) is distinct from 'object' or nullif(item->>'planned_start','') is null or nullif(item->>'planned_end','') is null
  or (item->>'planned_end')::date<(item->>'planned_start')::date or (item->>'planned_end')::date>(item->>'planned_start')::date+730 then
   raise exception 'Kontroller planlagte datoer.' using errcode='22023';end if;
  if mode='create' then
   if exists(select 1 from bolig_private.progress_tasks where id=(item->>'id')::uuid) then raise exception 'Aktiviteten finnes allerede. Forhåndsvis på nytt.' using errcode='PT409';end if;
   if length(trim(coalesce(item->>'title',''))) not between 2 and 120 or jsonb_typeof(item->'required') is distinct from 'boolean' then raise exception 'Skriv navn på arbeidet og velg om det er påkrevd.' using errcode='22023';end if;
   if not bolig_private.progress_member(c,(item->>'owner_id')::uuid) then raise exception 'Velg en aktiv ansvarlig med boligtilgang.' using errcode='42501';end if;
   if not exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
    where u.id=(item->>'unit_id')::uuid and u.root_id=root and (unit is null or u.id=unit) and not u.archived and not e.archived and not b.archived) then raise exception 'En valgt bolig er ikke tilgjengelig.' using errcode='42501';end if;
   -- Dependencies may refer only to an earlier item in this same new template.
   if nullif(item->>'predecessor_id','') is not null and not exists(select 1 from bolig_private.progress_tasks p where p.id=(item->>'predecessor_id')::uuid and p.id=any(ids) and p.root_id=root and p.unit_id=(item->>'unit_id')::uuid) then
    raise exception 'Malens forgjenger må stå tidligere i samme bolig.' using errcode='22023';end if;
   insert into bolig_private.progress_tasks(id,root_id,unit_id,title,owner_id,planned_start,planned_end,status,predecessor_id,required)
   values((item->>'id')::uuid,root,(item->>'unit_id')::uuid,trim(item->>'title'),(item->>'owner_id')::uuid,(item->>'planned_start')::date,(item->>'planned_end')::date,'planned',nullif(item->>'predecessor_id','')::uuid,(item->>'required')::boolean);
  else
   if not exists(select 1 from bolig_private.progress_tasks t where t.id=(item->>'id')::uuid and t.root_id=root and (unit is null or t.unit_id=unit) and bolig_private.progress_active(t)) then raise exception 'En aktivitet er ikke tilgjengelig.' using errcode='42501';end if;
   if exists(select 1 from bolig_private.progress_tasks t where t.id=(item->>'id')::uuid and (t.actual_start is not null or t.actual_end is not null or t.status not in('planned','blocked'))) then raise exception 'Påbegynt eller utført arbeid må avklares enkeltvis.' using errcode='22023';end if;
   update bolig_private.progress_tasks set planned_start=(item->>'planned_start')::date,planned_end=(item->>'planned_end')::date,revision=revision+1,changed_at=now() where id=(item->>'id')::uuid;
  end if;
 end loop;
 -- Validate the final graph, not intermediate dates while a whole chain moves.
 if exists(select 1 from bolig_private.progress_tasks d join bolig_private.progress_tasks p on p.id=d.predecessor_id
  where d.root_id=root and not d.archived and (p.archived or p.unit_id<>d.unit_id or p.planned_end>d.planned_start)) then
  raise exception 'Planen bryter en avhengighet. Ta med hele kjeden eller juster datoene.' using errcode='22023';end if;
 if (select count(*) from bolig_private.progress_tasks where root_id=root and not archived)>4000 then raise exception 'Maksimalt 4000 aktive aktiviteter per prosjekt.' using errcode='22023';end if;
 select jsonb_agg(to_jsonb(t)) into after_rows from bolig_private.progress_tasks t where t.id=any(ids);
 insert into bolig_private.progress_states values(root,rev+1) on conflict(root_id) do update set revision=excluded.revision;
 insert into bolig_private.progress_history(root_id,revision,actor_id,action,snapshot)
 values(root,rev+1,auth.uid(),'batch_'||mode,jsonb_build_object('before',before_rows,'tasks',after_rows,'count',cardinality(ids)));
 result:=bolig_private.progress_workspace(c,root,unit,'get','{}');
 insert into bolig_private.progress_receipts values(root,auth.uid(),rid,fp,result);
 return result;
end$$;
revoke all on function bolig_private.progress_batch(uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;
-- Private helpers are callable only through the existing authenticated gateway.
create or replace function public.bolig_progress(p_company_id uuid,p_root_id uuid,p_unit_id uuid default null,p_action text default 'get',p_payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if p_action='batch' then return bolig_private.progress_batch(p_company_id,p_root_id,p_unit_id,p_payload);end if;
 return bolig_private.progress_workspace(p_company_id,p_root_id,p_unit_id,p_action,p_payload);
end$$;
revoke all on function public.bolig_progress(uuid,uuid,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.bolig_progress(uuid,uuid,uuid,text,jsonb) to authenticated;
create function bolig_private.progress_scoped_history(snapshot jsonb,unit uuid) returns jsonb language sql immutable set search_path='' as $$
 select case when unit is null or snapshot->'tasks' is null then snapshot else
 jsonb_build_object('tasks',coalesce((select jsonb_agg(t) from jsonb_array_elements(snapshot->'tasks') t where t->>'unit_id'=unit::text),'[]'),
 'before',coalesce((select jsonb_agg(t) from jsonb_array_elements(snapshot->'before') t where t->>'unit_id'=unit::text),'[]'),
 'count',(select count(*) from jsonb_array_elements(snapshot->'tasks') t where t->>'unit_id'=unit::text)) end
$$;
revoke all on function bolig_private.progress_scoped_history(jsonb,uuid) from public,anon,authenticated,service_role;
-- Enrich the existing active-unit projection for building/entrance/floor selection.
do $$declare definition text;old text:=$anchor$jsonb_build_object('id',u.id,'number',u.number,'address',e.address)$anchor$;begin
 definition:=pg_get_functiondef('bolig_private.progress_workspace(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 if position(old in definition)=0 then raise exception 'Progress unit projection anchor missing';end if;
 definition:=replace(definition,old,$anchor$jsonb_build_object('id',u.id,'number',u.number,'address',e.address,'block_id',b.id,'block_name',b.name,'entrance_id',e.id,'floor',u.floor,'position',u.position)$anchor$);
 old:=$anchor$select revision,action,created_at,snapshot from bolig_private.progress_history where root_id=root and (unit is null or snapshot->'task'->>'unit_id'=unit::text)$anchor$;
 if position(old in definition)=0 then raise exception 'Progress history projection anchor missing';end if;
 definition:=replace(definition,old,$anchor$select revision,action,created_at,bolig_private.progress_scoped_history(snapshot,unit) snapshot from bolig_private.progress_history where root_id=root and (unit is null or snapshot->'task'->>'unit_id'=unit::text or exists(select 1 from jsonb_array_elements(snapshot->'tasks') history_task where history_task->>'unit_id'=unit::text))$anchor$);
 execute definition;
end$$;
notify pgrst,'reload schema';

-- Refuse to replace a later, unreviewed function version. No grants are changed.
do $guard$
begin
 if (select md5(prosrc) from pg_proc where oid='bolig_private.my_project_tasks(uuid,jsonb)'::regprocedure)
    not in ('28ae5446fd6364d6896790484cb2e819','4938e4fcbd6fb8c27528f1f429c53ecd') then
  raise exception 'Task reader has changed; compare the current definition before applying location migration.';
 end if;
end
$guard$;
-- Add location to already authorized task rows; no new tasks, rights or writes.
create or replace function bolig_private.my_project_tasks(c uuid,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;ks jsonb;rows jsonb;total bigint;cursor text;next_cursor text;selected_row jsonb;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) then raise exception 'Boligtilgang kreves.' using errcode='42501';end if;
 if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>2000 then raise exception 'Ugyldig oppgavelesing.' using errcode='22023';end if;
 cursor:=coalesce(payload->>'after','');if length(cursor)>150 then raise exception 'Ugyldig neste side.' using errcode='22023';end if;
 begin ks:=public.get_kshms_context();exception when insufficient_privilege then ks:=null;end;
 if ks->>'company_id' is distinct from c::text or ks->>'user_id' is distinct from auth.uid()::text or not coalesce((ks->>'enabled')::boolean,false) then ks:=null;end if;
 with scopes as(select s.* from bolig_private.integrated_scopes(c) s join public.projects p on p.id=s.project_id where public.project_row_access_allowed(p.company_scope_id,p.user_id)),
 tasks as(
  select t.id,'progress'::text kind,t.root_id,t.unit_id,t.room_id,null::uuid project_id,t.title,t.planned_end due_on,'Planlagt ferdig'::text date_label,t.status
  from bolig_private.progress_tasks t join bolig_private.roots r on r.id=t.root_id
  where r.company_id=c and t.owner_id=auth.uid() and t.status<>'done' and bolig_private.progress_active(t) and bolig_private.progress_member(c,auth.uid())
  union all
  select d.id,'deviation',s.root_id,s.unit_id,null::uuid,d.project_id,d.title,d.due_on,'Frist',d.status
  from public.kshms_deviations d join scopes s on s.project_id=d.project_id where ks is not null and d.company_id=c and d.responsible_id=auth.uid() and d.status<>'closed' and kshms_private.deviation_visible(d,ks)
  union all
  select e.id,e.kind,s.root_id,s.unit_id,null::uuid,e.project_id,e.content->>'title',nullif(e.content->>'planned_on','')::date,'Planlagt kontroll',e.status
  from public.kshms_executions e join scopes s on s.project_id=e.project_id where ks is not null and e.company_id=c and e.responsible_id=auth.uid() and e.status='draft' and kshms_private.execution_visible(e,ks)
 ),prepared as(
  select t.*,r.title project_title,u.number unit_number,room.name room_name,
   b.name block_name,coalesce(nullif(e.address,''),nullif(b.address,'')) address,
   coalesce(t.due_on::text,'9999-12-31')||':'||t.kind||':'||t.id::text sort_key
  from tasks t join bolig_private.roots r on r.id=t.root_id left join bolig_private.units u on u.id=t.unit_id left join bolig_private.rooms room on room.id=t.room_id
  left join bolig_private.entrances e on e.id=u.entrance_id and e.root_id=r.id
  left join bolig_private.blocks b on b.id=e.block_id and b.root_id=r.id
 ),page as(select * from prepared where sort_key>cursor order by sort_key limit 101)
 select (select count(*) from prepared),coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_key) from(select * from page order by sort_key limit 100)x),'[]'::jsonb),
  case when(select count(*) from page)>100 then(select sort_key from page order by sort_key offset 99 limit 1) else null end,(select to_jsonb(z) from prepared z where z.id::text=payload->>'selected_id' and z.kind=payload->>'selected_kind' limit 1) into total,rows,next_cursor,selected_row;
 return jsonb_build_object('context',ctx,'ks_context',ks,'as_of',(now() at time zone 'Europe/Oslo')::date,'count',total,'items',rows,'next',next_cursor,'selected',selected_row);
end$$;

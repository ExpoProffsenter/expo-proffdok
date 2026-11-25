-- Read-only project lists and persistent tasks. Existing commands and grants stay intact.
create function public.kshms_project_execution_state(
 p_company_id uuid,p_project_id uuid,p_kind text,p_status text default 'all',
 p_query text default '',p_before timestamptz default null,p_before_id uuid default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;p public.projects%rowtype;records jsonb;members jsonb;templates jsonb;cursor jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 p:=kshms_private.project_checklist_access(p_company_id,p_project_id,false);
 if p_kind is null or p_kind not in('round','risk') or p_status is null or p_status not in('all','draft','completed')
 or length(coalesce(p_query,''))>160 or (p_before is null)<>(p_before_id is null)
 then raise exception 'Ugyldig søk etter prosjektets gjennomføringer.';end if;
 with page as (
  select e.* from public.kshms_executions e
  where e.company_id=p_company_id and e.project_id=p_project_id and e.kind=p_kind
  and kshms_private.execution_visible(e,x) and (p_status='all' or e.status=p_status)
  and (coalesce(p_query,'')='' or strpos(lower(e.content->>'title'),lower(p_query))>0)
  and (p_before is null or (e.updated_at,e.id)<(p_before,p_before_id))
  order by e.updated_at desc,e.id desc limit 101
 ),shown as (select * from page order by updated_at desc,id desc limit 100)
 select (select coalesce(jsonb_agg(jsonb_build_object('id',id,'project_id',project_id,'title',content->>'title',
  'workplace',content->>'workplace','planned_on',content->>'planned_on','status',status,'revision',revision,
  'updated_at',updated_at,'completed_at',completed_at,'completed_identity',completed_identity)
  order by updated_at desc,id desc),'[]') from shown),
  case when (select count(*) from page)>100 then (select jsonb_build_object('updated_at',updated_at,'id',id)
   from shown order by updated_at,id limit 1) else null end into records,cursor;
 select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'identity',kshms_private.identity_snapshot(u.id)) order by u.email),'[]')
 into members from public.sales_company_memberships m join public.profiles u on u.id=m.user_id
 where m.company_id=p_company_id and kshms_private.deviation_member(p_company_id,u.id);
 with current_editions as (
  select distinct on(v.template_id) v.* from public.kshms_checklist_versions v
  join public.kshms_checklist_templates t on t.id=v.template_id and not t.archived
  where v.company_id=p_company_id order by v.template_id,v.number desc
 ) select coalesce(jsonb_agg(jsonb_build_object('id',id,'number',number,'content',content) order by content->>'title'),'[]')
 into templates from current_editions;
 return jsonb_build_object('context',x||jsonb_build_object('project_id',p.id),
  'project',jsonb_build_object('id',p.id,'name',coalesce(nullif(p.data#>>'{project,projectName}',''),p.title),
   'locked',coalesce(p.locked,false) or coalesce((p.data#>>'{project,locked}')::boolean,false)),
  'records',records,'next',cursor,'members',members,'templates',templates);
end $$;

create function public.kshms_execution_tasks(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;result jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 with pending as (
  select e.id,e.kind,e.project_id,e.content->>'title' as title,nullif(e.content->>'planned_on','')::date as due_on
  from public.kshms_executions e where e.company_id=p_company_id and e.responsible_id=auth.uid()
  and e.status='draft' and kshms_private.execution_visible(e,x)
 ),shown as (select * from pending order by due_on nulls last,id limit 20)
 select jsonb_build_object('company_id',p_company_id,'user_id',auth.uid(),
  'count',(select count(*) from pending),'overdue',(select count(*) from pending where due_on<current_date),
  'items',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'kind',kind,'project_id',project_id,
   'title',title,'due_on',due_on) order by due_on nulls last,id),'[]') from shown)) into result;
 return result;
end $$;

revoke all on function public.kshms_project_execution_state(uuid,uuid,text,text,text,timestamptz,uuid),
 public.kshms_execution_tasks(uuid) from public,anon;
grant execute on function public.kshms_project_execution_state(uuid,uuid,text,text,text,timestamptz,uuid),
 public.kshms_execution_tasks(uuid) to authenticated;
notify pgrst,'reload schema';

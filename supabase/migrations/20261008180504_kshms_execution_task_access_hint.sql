-- Assigned recipients receive a minimal task even when project access is missing.
-- No project title, ID or execution content is exposed without the existing gate.
create or replace function public.kshms_execution_tasks(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;result jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 with assigned as (
  select e.*,kshms_private.execution_visible(e,x) as accessible from public.kshms_executions e
  where e.company_id=p_company_id and e.responsible_id=auth.uid() and e.status='draft'
 ),pending as (
  select id,kind,accessible,case when accessible then project_id else null end as project_id,
   case when accessible then content->>'title' else 'Gjennomføring tildelt deg – prosjekttilgang kreves' end as title,
   case when accessible then nullif(content->>'planned_on','')::date else null end as due_on
  from assigned
 ),shown as (select * from pending order by due_on nulls last,id limit 20)
 select jsonb_build_object('company_id',p_company_id,'user_id',auth.uid(),
  'count',(select count(*) from pending),'overdue',(select count(*) from pending where due_on<current_date),
  'items',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'kind',kind,'accessible',accessible,
   'project_id',project_id,'title',title,'due_on',due_on) order by due_on nulls last,id),'[]') from shown)) into result;
 return result;
end $$;
revoke all on function public.kshms_execution_tasks(uuid) from public,anon;
grant execute on function public.kshms_execution_tasks(uuid) to authenticated;
notify pgrst,'reload schema';

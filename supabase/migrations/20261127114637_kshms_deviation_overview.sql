-- Shared register, personal follow-up and project views use the same cases.
create function public.kshms_deviation_overview(
 p_company_id uuid, p_status text default 'open', p_query text default '',
 p_before timestamptz default null, p_before_id uuid default null,
 p_project_id uuid default null, p_from date default null, p_to date default null,
 p_view text default 'register'
) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; project public.projects; result jsonb; page jsonb; counts jsonb; last_row jsonb;
begin
 x:=kshms_private.require_context(p_company_id, p_view='inspection');
 if p_status is null or p_status not in ('open','closed','all')
   or p_view is null or p_view not in ('register','mine','project','inspection')
   or length(coalesce(p_query,''))>200 or ((p_before is null)<>(p_before_id is null))
   or p_from>p_to then
  raise exception 'Ugyldig avviksfilter.';
 end if;
 if p_view='project' then
  if p_project_id is null then raise exception 'Velg et lagret prosjekt.'; end if;
  project:=kshms_private.project_checklist_access(p_company_id,p_project_id,false);
  x:=x||jsonb_build_object('project_id',project.id);
 end if;

 with visible as (
  select d.* from public.kshms_deviations d
  where d.company_id=p_company_id and kshms_private.deviation_visible(d,x)
    and (p_project_id is null or d.project_id=p_project_id)
    and (p_view<>'project' or (d.category<>'ruh' and d.source_kind='company'))
    and (p_view<>'mine' or d.responsible_id=auth.uid())
    and (p_from is null or d.created_at>=p_from::timestamp at time zone 'Europe/Oslo')
    and (p_to is null or d.created_at<(p_to+1)::timestamp at time zone 'Europe/Oslo')
    and (coalesce(p_query,'')='' or strpos(lower(d.title||' '||d.event||' '||coalesce(d.responsible_identity->>'name','')),lower(p_query))>0)
 ), page_rows as (
  select d.*,coalesce(nullif(p.data#>>'{project,projectName}',''),p.title) as project_name
  from visible d
  left join public.projects p on p.id=d.project_id and p.company_scope_id=p_company_id
    and public.project_row_access_allowed(p.company_scope_id,p.user_id)
  where (p_status='all' or (p_status='closed')=(d.status='closed'))
    and (p_before is null or (d.created_at,d.id)<(p_before,p_before_id))
  order by d.created_at desc,d.id desc limit 50
 )
 select (select coalesce(jsonb_agg(to_jsonb(d) order by d.created_at desc,d.id desc),'[]'::jsonb) from page_rows d),
        (select jsonb_build_object('open',count(*) filter (where status<>'closed'),'closed',count(*) filter (where status='closed')) from visible)
 into page,counts;
 last_row:=page->(jsonb_array_length(page)-1);
 result:=jsonb_build_object('context',x,'cases',page,'counts',counts,
  'next',case when jsonb_array_length(page)=50 then jsonb_build_object('before',last_row->>'created_at','id',last_row->>'id') end,
  'members',(select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'identity',kshms_private.identity_snapshot(u.id),
     'firmaadmin',m.workspace_role='firmaadmin') order by u.email,u.id),'[]'::jsonb)
   from public.sales_company_memberships m join public.profiles u on u.id=m.user_id
   where m.company_id=p_company_id and kshms_private.deviation_member(p_company_id,u.id)));
 if p_view='project' then
  result:=result||jsonb_build_object('project',jsonb_build_object('id',project.id,
   'name',coalesce(nullif(project.data#>>'{project,projectName}',''),project.title),
   'locked',coalesce(project.locked,false) or coalesce((project.data#>>'{project,locked}')::boolean,false)));
 end if;
 return result;
end $$;
revoke all on function public.kshms_deviation_overview(uuid,text,text,timestamptz,uuid,uuid,date,date,text) from public,anon;
grant execute on function public.kshms_deviation_overview(uuid,text,text,timestamptz,uuid,uuid,date,date,text) to authenticated;

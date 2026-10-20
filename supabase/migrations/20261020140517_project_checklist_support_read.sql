-- Explicit read-only support route. Ordinary active-company checks and every
-- write RPC remain unchanged. Resolve the company from the actual project.
create function public.project_checklist_support_state(p_project_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare p public.projects%rowtype;rows jsonb;
begin
 if auth.uid() is null or not coalesce(public.current_profile_is_systemadmin(),false)
 then raise exception 'Bare aktiv systemadministrator kan lese i supportmodus.' using errcode='42501';end if;
 select * into p from public.projects where id=p_project_id;
 if p.id is null or p.company_scope_id is null or not coalesce(public.project_row_access_allowed(p.company_scope_id,p.user_id),false)
 then raise exception 'Prosjektet er ikke tilgjengelig i supportmodus.' using errcode='42501';end if;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.sequence desc),'[]'::jsonb) into rows
 from kshms_private.project_checklist_runs r where r.company_id=p.company_scope_id and r.project_id=p.id;
 return jsonb_build_object('context',jsonb_build_object('company_id',p.company_scope_id,'project_id',p.id,'user_id',auth.uid(),'support_read_only',true),
  'runs',rows,'checklist',coalesce(p.data->'checklist','{}'::jsonb));
end $$;
revoke all on function public.project_checklist_support_state(uuid) from public,anon,service_role;
grant execute on function public.project_checklist_support_state(uuid) to authenticated;

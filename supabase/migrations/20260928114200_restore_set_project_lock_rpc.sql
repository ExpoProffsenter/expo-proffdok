-- Restore the existing Production project-lock RPC in older demo baselines.
-- The function keeps the relational lock columns and projects.data lock mirror atomic.

create or replace function public.set_project_lock(
  p_project_id uuid,
  p_locked boolean,
  p_locked_by text default null::text
)
returns public.projects
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_row public.projects%rowtype;
  v_data jsonb;
  v_locked_at_text text;
  v_locked_by_text text;
begin
  if auth.uid() is null then
    raise exception 'Du må være innlogget.' using errcode='42501';
  end if;

  select * into v_row from public.projects where id=p_project_id;
  if not found then raise exception 'Project not found' using errcode='P0002'; end if;
  if not public.project_row_access_allowed(v_row.company_scope_id,v_row.user_id) then
    raise exception 'Du har ikke tilgang til dette prosjektet.' using errcode='42501';
  end if;

  v_locked_at_text := case when p_locked then now()::text else '' end;
  v_locked_by_text := case when p_locked then coalesce(nullif(auth.jwt()->>'email',''),nullif(p_locked_by,''),'Ukjent') else '' end;
  v_data := coalesce(v_row.data,'{}'::jsonb);
  v_data := jsonb_set(v_data,'{project,locked}',to_jsonb(p_locked),true);
  v_data := jsonb_set(v_data,'{project,status}',to_jsonb(case when p_locked then 'locked' else 'active' end),true);
  v_data := jsonb_set(v_data,'{project,lockedAt}',to_jsonb(v_locked_at_text),true);
  v_data := jsonb_set(v_data,'{project,lockedBy}',to_jsonb(v_locked_by_text),true);

  update public.projects
  set locked=p_locked,
      locked_at=case when p_locked then now() else null end,
      locked_by=case when p_locked then v_locked_by_text else null end,
      data=v_data,
      updated_at=now()
  where id=p_project_id
  returning * into v_row;
  return v_row;
end;
$function$;

revoke all on function public.set_project_lock(uuid, boolean, text) from public, anon;
grant execute on function public.set_project_lock(uuid, boolean, text) to authenticated, service_role;

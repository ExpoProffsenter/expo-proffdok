create or replace function public.project_progress_plan_write_allowed(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.projects pr
    join public.profiles me on me.id = auth.uid()
    left join public.sales_company_scopes s
      on s.normalized_name = public.sales_normalize_company_name(me.company_name)
    where pr.id = p_project_id
      and coalesce(pr.locked,false) = false
      and coalesce(me.approved,false) = true
      and coalesce(me.deactivated,false) = false
      and (
        pr.user_id = auth.uid()
        or (
          s.id = pr.company_scope_id
          and (me.company_role = 'firmaadmin' or me.system_role = 'systemadmin')
        )
      )
  );
$$;

revoke all on function public.project_progress_plan_access_allowed(uuid) from public;
revoke all on function public.project_progress_plan_access_allowed(uuid) from anon;
grant execute on function public.project_progress_plan_access_allowed(uuid) to authenticated, service_role;

revoke all on function public.project_progress_plan_write_allowed(uuid) from public;
revoke all on function public.project_progress_plan_write_allowed(uuid) from anon;
grant execute on function public.project_progress_plan_write_allowed(uuid) to authenticated, service_role;

create or replace function public.sync_project_progress_plan_scope()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_scope_id uuid;
  v_locked boolean;
begin
  select p.company_scope_id, coalesce(p.locked,false)
    into v_scope_id, v_locked
  from public.projects p
  where p.id = new.project_id;

  if v_scope_id is null then
    raise exception 'Fant ikke prosjekt eller firmascope for fremdriftsplanen.' using errcode = '23503';
  end if;

  if v_locked then
    raise exception 'Fremdriftsplanen kan ikke endres på et låst prosjekt.' using errcode = '42501';
  end if;

  if auth.uid() is not null and not public.project_progress_plan_write_allowed(new.project_id) then
    raise exception 'Brukeren har ikke skrivetilgang til fremdriftsplanen.' using errcode = '42501';
  end if;

  new.company_scope_id := v_scope_id;
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  if tg_op = 'INSERT' then
    new.created_at := coalesce(new.created_at, now());
    new.created_by := coalesce(auth.uid(), new.created_by);
  else
    new.created_at := old.created_at;
    new.created_by := old.created_by;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_project_progress_plan_scope() from public;
revoke all on function public.sync_project_progress_plan_scope() from anon;
revoke all on function public.sync_project_progress_plan_scope() from authenticated;

drop policy if exists project_progress_plans_insert_internal on public.project_progress_plans;
create policy project_progress_plans_insert_internal
on public.project_progress_plans for insert to authenticated
with check (public.project_progress_plan_write_allowed(project_id));

drop policy if exists project_progress_plans_update_internal on public.project_progress_plans;
create policy project_progress_plans_update_internal
on public.project_progress_plans for update to authenticated
using (public.project_progress_plan_write_allowed(project_id))
with check (public.project_progress_plan_write_allowed(project_id));

revoke all on table public.project_progress_plans from anon;
revoke all on table public.project_progress_plans from authenticated;
grant select, insert, update on table public.project_progress_plans to authenticated;
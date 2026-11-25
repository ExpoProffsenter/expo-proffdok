create table if not exists public.project_progress_plans (
  project_id uuid primary key references public.projects(id) on delete cascade,
  company_scope_id uuid not null references public.sales_company_scopes(id),
  customer_visible boolean not null default false,
  plan jsonb not null default '{"version":1,"activities":[]}'::jsonb,
  created_by uuid null references auth.users(id),
  updated_by uuid null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_progress_plans_plan_object check (jsonb_typeof(plan) = 'object')
);

comment on table public.project_progress_plans is 'Fase 35A: prosjektets operative fremdriftsplan. Egen livssyklus fra projects.data og låst tilbud.';
comment on column public.project_progress_plans.customer_visible is 'Kunden ser planen i kundeportal kun når bedriften eksplisitt har aktivert deling.';

create or replace function public.project_progress_plan_access_allowed(p_project_id uuid)
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
grant execute on function public.project_progress_plan_access_allowed(uuid) to authenticated;

create or replace function public.sync_project_progress_plan_scope()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_scope_id uuid;
begin
  select p.company_scope_id into v_scope_id
  from public.projects p
  where p.id = new.project_id;

  if v_scope_id is null then
    raise exception 'Fant ikke prosjekt eller firmascope for fremdriftsplanen.' using errcode = '23503';
  end if;

  if auth.uid() is not null and not public.project_progress_plan_access_allowed(new.project_id) then
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

drop trigger if exists trg_project_progress_plans_scope on public.project_progress_plans;
create trigger trg_project_progress_plans_scope
before insert or update on public.project_progress_plans
for each row execute function public.sync_project_progress_plan_scope();

alter table public.project_progress_plans enable row level security;
revoke all on table public.project_progress_plans from anon;
grant select, insert, update on table public.project_progress_plans to authenticated;

drop policy if exists project_progress_plans_select_internal on public.project_progress_plans;
create policy project_progress_plans_select_internal
on public.project_progress_plans for select to authenticated
using (public.project_progress_plan_access_allowed(project_id));

drop policy if exists project_progress_plans_insert_internal on public.project_progress_plans;
create policy project_progress_plans_insert_internal
on public.project_progress_plans for insert to authenticated
with check (public.project_progress_plan_access_allowed(project_id));

drop policy if exists project_progress_plans_update_internal on public.project_progress_plans;
create policy project_progress_plans_update_internal
on public.project_progress_plans for update to authenticated
using (public.project_progress_plan_access_allowed(project_id))
with check (public.project_progress_plan_access_allowed(project_id));

create index if not exists idx_project_progress_plans_company_scope
  on public.project_progress_plans(company_scope_id);

create or replace function public.verify_project_portal_access(p_project_id uuid, p_role text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text := lower(trim(coalesce(p_role,'')));
  v_code text := upper(regexp_replace(coalesce(p_code,''), '\s+', '', 'g'));
  v_project public.projects%rowtype;
  v_access public.project_portal_access%rowtype;
  v_data jsonb;
  v_valid_until timestamptz := null;
  v_progress public.project_progress_plans%rowtype;
  v_progress_payload jsonb := null;
begin
  if v_role not in ('kunde','underleverandor') or v_code = '' then
    return jsonb_build_object('ok', false, 'error', 'invalid_or_expired');
  end if;

  select * into v_project from public.projects where id = p_project_id;
  if not found then return jsonb_build_object('ok', false, 'error', 'invalid_or_expired'); end if;

  select * into v_access from public.project_portal_access
  where project_id = p_project_id and role = v_role and revoked_at is null and access_code = v_code;
  if not found then return jsonb_build_object('ok', false, 'error', 'invalid_or_expired'); end if;

  if coalesce(v_project.locked,false) = true then
    if v_project.locked_at is null or now() > v_project.locked_at + interval '30 days' then
      return jsonb_build_object('ok', false, 'error', 'invalid_or_expired');
    end if;
    v_valid_until := v_project.locked_at + interval '30 days';
  end if;

  select * into v_progress from public.project_progress_plans where project_id = p_project_id;
  if found then
    v_progress_payload := coalesce(v_progress.plan, '{"version":1,"activities":[]}'::jsonb)
      || jsonb_build_object(
        'customerVisible', coalesce(v_progress.customer_visible,false),
        'updatedAt', v_progress.updated_at
      );
  end if;

  if v_role = 'kunde' then
    v_data := coalesce(v_project.data, '{}'::jsonb) - 'internalNotes' - 'access' - 'user';
    v_data := v_data #- '{project,portalAccess}';
    if jsonb_typeof(v_data->'projectLog') = 'object' then
      v_data := jsonb_set(v_data, '{projectLog}', (v_data->'projectLog') - 'draft', true);
    end if;
    if v_progress_payload is not null and coalesce(v_progress.customer_visible,false) then
      v_data := jsonb_set(v_data, '{progressPlan}', v_progress_payload, true);
    else
      v_data := v_data - 'progressPlan';
    end if;
  else
    v_data := jsonb_build_object(
      'company', coalesce(v_project.data->'company', '{}'::jsonb),
      'project', (coalesce(v_project.data->'project', '{}'::jsonb) - 'portalAccess'),
      'checked', coalesce(v_project.data->'checked', '{}'::jsonb),
      'productDocs', coalesce(v_project.data->'productDocs', '{}'::jsonb),
      'manualProducts', coalesce(v_project.data->'manualProducts', '{}'::jsonb),
      'surf', coalesce(v_project.data->'surf', '{}'::jsonb),
      'bathroomEquipment', coalesce(v_project.data->'bathroomEquipment', '{}'::jsonb),
      'photos', coalesce(v_project.data->'photos', '[]'::jsonb),
      'inst', coalesce(v_project.data->'inst', '[]'::jsonb),
      'files', coalesce(v_project.data->'files', '[]'::jsonb),
      'checklist', coalesce(v_project.data->'checklist', '{}'::jsonb),
      'warranty', coalesce(v_project.data->'warranty', '{}'::jsonb)
    );
    if v_progress_payload is not null then
      v_data := jsonb_set(v_data, '{progressPlan}', v_progress_payload, true);
    end if;
  end if;

  return jsonb_build_object(
    'ok', true,
    'role', v_role,
    'upload_secret', v_access.upload_secret::text,
    'access_policy', 'active_project_plus_locked_30_days',
    'locked_grace_days', 30,
    'valid_until', v_valid_until,
    'project', jsonb_build_object(
      'id',v_project.id,
      'title',v_project.title,
      'data',v_data,
      'locked',coalesce(v_project.locked,false),
      'locked_at',v_project.locked_at,
      'updated_at',v_project.updated_at
    )
  );
end;
$$;

revoke all on function public.verify_project_portal_access(uuid,text,text) from public;
grant execute on function public.verify_project_portal_access(uuid,text,text) to anon, authenticated;
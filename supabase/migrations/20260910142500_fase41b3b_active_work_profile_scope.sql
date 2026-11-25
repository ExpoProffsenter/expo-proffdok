-- Expo ProffDok – FASE 41B.3B
-- Kobler Sales, prosjekter og internt vareoppslag til serverstyrt aktiv arbeidsprofil.
-- Enkeltfirma-brukere får samme scope som før. Flerfirma-brukere kan samarbeide
-- i valgt internt firma, men kan ikke slette andres prosjekter.

create or replace function public.current_sales_company_scope_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when public.current_user_has_module_access('sales')
      then public.current_active_company_scope_id()
    else null::uuid
  end;
$$;

create or replace function public.resolve_sales_company_scope()
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_scope_id uuid;
  v_profile_name text;
  v_normalized text;
begin
  if v_uid is null then
    raise exception 'Du er ikke innlogget.' using errcode='P0001';
  end if;

  v_scope_id := public.current_active_company_scope_id();
  if v_scope_id is not null then
    return v_scope_id;
  end if;

  select trim(coalesce(p.company_name,''))
    into v_profile_name
  from public.profiles p
  where p.id=v_uid
    and coalesce(p.approved,false)=true
    and coalesce(p.deactivated,false)=false;

  v_normalized := public.sales_normalize_company_name(v_profile_name);
  if v_normalized='' then
    raise exception 'Firmaprofil mangler. Registrer firma før Befaring/Tilbud kan brukes.' using errcode='P0001';
  end if;

  select s.id into v_scope_id
  from public.sales_company_scopes s
  where s.normalized_name=v_normalized
  limit 1;

  if v_scope_id is null then
    insert into public.sales_company_scopes(normalized_name,display_name)
    values(v_normalized,v_profile_name)
    returning id into v_scope_id;
  end if;

  update public.sales_company_memberships
  set is_primary=false,updated_at=now()
  where user_id=v_uid and company_id<>v_scope_id and is_primary=true;

  insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role,updated_at)
  select
    v_scope_id,
    v_uid,
    true,
    case when p.company_role='firmaadmin' then 'firmaadmin' else 'ansatt' end,
    now()
  from public.profiles p
  where p.id=v_uid
  on conflict(company_id,user_id) do update set
    is_primary=true,
    workspace_role=excluded.workspace_role,
    updated_at=excluded.updated_at;

  return v_scope_id;
end;
$$;

create or replace function public.current_user_has_internal_store_catalog_access()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    join public.sales_company_scopes s
      on s.id=public.current_active_company_scope_id()
    where p.id=auth.uid()
      and coalesce(p.approved,false)=true
      and coalesce(p.deactivated,false)=false
      and public.current_user_has_module_access('store_offers')
      and s.normalized_name in (
        public.sales_normalize_company_name('Ringside Rørleggerbedrift AS'),
        public.sales_normalize_company_name('Bademiljø Expo')
      )
  );
$$;

create or replace function public.current_user_has_internal_store_price_search_access()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    join public.sales_company_scopes s
      on s.id=public.current_active_company_scope_id()
    where p.id=auth.uid()
      and coalesce(p.approved,false)=true
      and coalesce(p.deactivated,false)=false
      and s.normalized_name in (
        public.sales_normalize_company_name('Ringside Rørleggerbedrift AS'),
        public.sales_normalize_company_name('Bademiljø Expo'),
        public.sales_normalize_company_name('Expo Proffsenter')
      )
  );
$$;

create or replace function public.project_row_access_allowed(
  p_company_scope_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id=auth.uid()
      and coalesce(p.approved,false)=true
      and coalesce(p.deactivated,false)=false
      and (
        p.system_role='systemadmin'
        or (
          public.current_user_has_module_access('projects')
          and p_company_scope_id=public.current_active_company_scope_id()
          and (
            p_user_id=auth.uid()
            or public.current_active_company_role()='firmaadmin'
            or (
              public.current_user_has_multiple_work_profiles()
              and public.is_internal_work_profile_company(p_company_scope_id)
            )
          )
        )
      )
  );
$$;

create or replace function public.project_row_delete_allowed(
  p_company_scope_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id=auth.uid()
      and coalesce(p.approved,false)=true
      and coalesce(p.deactivated,false)=false
      and (
        p.system_role='systemadmin'
        or (
          public.current_user_has_module_access('projects')
          and p_company_scope_id=public.current_active_company_scope_id()
          and (
            p_user_id=auth.uid()
            or public.current_active_company_role()='firmaadmin'
          )
        )
      )
  );
$$;

create or replace function public.project_row_insert_allowed(
  p_company_scope_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id=auth.uid()
      and coalesce(p.approved,false)=true
      and coalesce(p.deactivated,false)=false
      and public.current_user_has_module_access('projects')
      and p_user_id=auth.uid()
      and p_company_scope_id=public.current_active_company_scope_id()
  );
$$;

create or replace function public.sync_project_company_scope_id()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_scope_id uuid := null;
  v_profile_name text := '';
  v_normalized text := '';
  v_embedded_name text := '';
begin
  if tg_op='UPDATE' then
    new.company_scope_id:=old.company_scope_id;
    new.user_id:=old.user_id;
    return new;
  end if;

  if auth.uid() is not null and new.user_id=auth.uid() then
    v_scope_id:=public.current_active_company_scope_id();

    if v_scope_id is null then
      select trim(coalesce(p.company_name,'')) into v_profile_name
      from public.profiles p
      where p.id=auth.uid()
        and coalesce(p.approved,false)=true
        and coalesce(p.deactivated,false)=false;
      v_normalized:=public.sales_normalize_company_name(v_profile_name);
      if v_normalized='' then
        raise exception 'Aktiv firmatilknytning mangler.' using errcode='42501';
      end if;
      select s.id into v_scope_id from public.sales_company_scopes s where s.normalized_name=v_normalized limit 1;
      if v_scope_id is null then
        insert into public.sales_company_scopes(normalized_name,display_name)
        values(v_normalized,v_profile_name)
        returning id into v_scope_id;
      end if;
    end if;

    new.company_scope_id:=v_scope_id;
    return new;
  end if;

  v_embedded_name:=public.sales_normalize_company_name(coalesce(
    new.data->'company'->>'companyName',
    new.data->'company'->>'company_name',
    ''
  ));
  if v_embedded_name<>'' then
    select s.id into v_scope_id
    from public.sales_company_scopes s
    where s.normalized_name=v_embedded_name
    limit 1;
  end if;
  new.company_scope_id:=coalesce(v_scope_id,new.company_scope_id);
  return new;
end;
$$;

create or replace function public.project_progress_plan_access_allowed(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.projects pr
    where pr.id=p_project_id
      and public.project_row_access_allowed(pr.company_scope_id,pr.user_id)
  );
$$;

create or replace function public.project_progress_plan_write_allowed(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.projects pr
    where pr.id=p_project_id
      and coalesce(pr.locked,false)=false
      and public.project_row_access_allowed(pr.company_scope_id,pr.user_id)
  );
$$;

-- Samarbeidsbruker kan arbeide i prosjektet, men sletting av andres prosjekt
-- krever fortsatt eierskap eller firmaadministrator.
drop policy if exists projects_delete_scoped_authenticated on public.projects;
create policy projects_delete_scoped_authenticated
on public.projects
for delete
to authenticated
using (public.project_row_delete_allowed(company_scope_id,user_id));

revoke all on function public.project_row_delete_allowed(uuid,uuid) from public;
grant execute on function public.project_row_delete_allowed(uuid,uuid) to authenticated;

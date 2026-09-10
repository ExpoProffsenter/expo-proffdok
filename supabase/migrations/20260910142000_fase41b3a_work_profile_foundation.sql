-- Expo ProffDok – FASE 41B.3A
-- Serverstyrte arbeidsprofiler for utvalgte interne brukere.
-- Bakoverkompatibel foundation: eksisterende bruker beholder sitt primærfirma,
-- ingen ekstra arbeidsprofil tildeles automatisk og eksisterende Sales/Prosjekt-RLS
-- kobles ikke om før 41B.3B.

alter table public.sales_company_memberships
  add column if not exists is_primary boolean not null default false,
  add column if not exists workspace_role text not null default 'ansatt',
  add column if not exists granted_by uuid null references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.sales_company_memberships'::regclass
      and conname = 'sales_company_memberships_workspace_role_check'
  ) then
    alter table public.sales_company_memberships
      add constraint sales_company_memberships_workspace_role_check
      check (workspace_role in ('ansatt','firmaadmin'));
  end if;
end $$;

-- Marker dagens profilfirma som primært medlemskap uten å endre hvilke firma
-- brukeren allerede er medlem av.
update public.sales_company_memberships m
set
  is_primary = (s.normalized_name = public.sales_normalize_company_name(p.company_name)),
  workspace_role = case when p.company_role = 'firmaadmin' then 'firmaadmin' else 'ansatt' end,
  updated_at = now()
from public.profiles p, public.sales_company_scopes s
where m.user_id = p.id
  and m.company_id = s.id;

-- Sørg for at godkjente profiler med eksisterende scope har et primært medlemskap.
insert into public.sales_company_memberships (
  company_id, user_id, is_primary, workspace_role, updated_at
)
select
  s.id,
  p.id,
  true,
  case when p.company_role = 'firmaadmin' then 'firmaadmin' else 'ansatt' end,
  now()
from public.profiles p
join public.sales_company_scopes s
  on s.normalized_name = public.sales_normalize_company_name(p.company_name)
where coalesce(p.approved,false) = true
  and coalesce(p.deactivated,false) = false
  and public.sales_normalize_company_name(p.company_name) <> ''
on conflict (company_id,user_id) do update
set
  is_primary = true,
  workspace_role = excluded.workspace_role,
  updated_at = now();

-- Hvis gamle data mot formodning hadde mer enn ett primærflagg, behold bare
-- profilfirmaet. Indeksen beskytter fremtidig konsistens.
with ranked as (
  select
    m.company_id,
    m.user_id,
    row_number() over (
      partition by m.user_id
      order by
        case when s.normalized_name = public.sales_normalize_company_name(p.company_name) then 0 else 1 end,
        m.created_at,
        m.company_id
    ) as rn
  from public.sales_company_memberships m
  join public.profiles p on p.id = m.user_id
  join public.sales_company_scopes s on s.id = m.company_id
  where m.is_primary = true
)
update public.sales_company_memberships m
set is_primary = (r.rn = 1), updated_at = now()
from ranked r
where m.company_id = r.company_id
  and m.user_id = r.user_id
  and m.is_primary is distinct from (r.rn = 1);

create unique index if not exists sales_company_memberships_one_primary_per_user
  on public.sales_company_memberships(user_id)
  where is_primary = true;

create table if not exists public.user_active_company_scope (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
  selected_at timestamptz not null default now()
);

alter table public.user_active_company_scope enable row level security;
revoke all on table public.user_active_company_scope from anon, authenticated;

create or replace function public.is_internal_work_profile_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.sales_company_scopes s
    where s.id = p_company_id
      and s.normalized_name in (
        public.sales_normalize_company_name('Ringside Rørleggerbedrift AS'),
        public.sales_normalize_company_name('Bademiljø Expo'),
        public.sales_normalize_company_name('Expo Proffsenter')
      )
  );
$$;

create or replace function public.current_primary_company_scope_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (
      select m.company_id
      from public.sales_company_memberships m
      where m.user_id = auth.uid()
        and m.is_primary = true
      order by m.created_at
      limit 1
    ),
    (
      select s.id
      from public.profiles p
      join public.sales_company_scopes s
        on s.normalized_name = public.sales_normalize_company_name(p.company_name)
      where p.id = auth.uid()
        and coalesce(p.approved,false) = true
        and coalesce(p.deactivated,false) = false
      limit 1
    )
  );
$$;

create or replace function public.current_active_company_scope_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when not exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.approved,false) = true
        and coalesce(p.deactivated,false) = false
    ) then null::uuid
    else coalesce(
      (
        select a.company_id
        from public.user_active_company_scope a
        join public.sales_company_memberships m
          on m.user_id = a.user_id
         and m.company_id = a.company_id
        where a.user_id = auth.uid()
        limit 1
      ),
      public.current_primary_company_scope_id(),
      (
        select m.company_id
        from public.sales_company_memberships m
        where m.user_id = auth.uid()
        order by m.is_primary desc, m.created_at
        limit 1
      )
    )
  end;
$$;

create or replace function public.current_active_company_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when public.current_profile_is_systemadmin() then 'systemadmin'
    else coalesce(
      (
        select m.workspace_role
        from public.sales_company_memberships m
        where m.user_id = auth.uid()
          and m.company_id = public.current_active_company_scope_id()
        limit 1
      ),
      (
        select case when p.company_role = 'firmaadmin' then 'firmaadmin' else 'ansatt' end
        from public.profiles p
        where p.id = auth.uid()
        limit 1
      ),
      'ansatt'
    )
  end;
$$;

create or replace function public.current_user_has_multiple_work_profiles()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select (
    select count(*)
    from public.sales_company_memberships m
    where m.user_id = auth.uid()
      and public.is_internal_work_profile_company(m.company_id)
  ) > 1;
$$;

create or replace function public.work_profile_company_profile(p_company_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when not (
      public.current_profile_is_systemadmin()
      or exists (
        select 1
        from public.sales_company_memberships mine
        where mine.user_id = auth.uid()
          and mine.company_id = p_company_id
      )
    ) then null::jsonb
    else (
      select jsonb_build_object(
        'companyId', s.id,
        'companyName', s.display_name,
        'orgNumber', coalesce((
          select nullif(trim(p.org_number),'')
          from public.sales_company_memberships m
          join public.profiles p on p.id = m.user_id
          where m.company_id = s.id and nullif(trim(coalesce(p.org_number,'')),'') is not null
          order by case when p.company_role='firmaadmin' then 0 else 1 end, m.is_primary desc, m.created_at
          limit 1
        ), ''),
        'address', coalesce((
          select nullif(trim(p.address),'')
          from public.sales_company_memberships m
          join public.profiles p on p.id = m.user_id
          where m.company_id = s.id and nullif(trim(coalesce(p.address,'')),'') is not null
          order by case when p.company_role='firmaadmin' then 0 else 1 end, m.is_primary desc, m.created_at
          limit 1
        ), ''),
        'phone', coalesce((
          select nullif(trim(p.phone),'')
          from public.sales_company_memberships m
          join public.profiles p on p.id = m.user_id
          where m.company_id = s.id and nullif(trim(coalesce(p.phone,'')),'') is not null
          order by case when p.company_role='firmaadmin' then 0 else 1 end, m.is_primary desc, m.created_at
          limit 1
        ), ''),
        'email', coalesce((
          select nullif(trim(p.email),'')
          from public.sales_company_memberships m
          join public.profiles p on p.id = m.user_id
          where m.company_id = s.id and nullif(trim(coalesce(p.email,'')),'') is not null
          order by case when p.company_role='firmaadmin' then 0 else 1 end, m.is_primary desc, m.created_at
          limit 1
        ), ''),
        'website', coalesce((
          select nullif(trim(p.website),'')
          from public.sales_company_memberships m
          join public.profiles p on p.id = m.user_id
          where m.company_id = s.id and nullif(trim(coalesce(p.website,'')),'') is not null
          order by case when p.company_role='firmaadmin' then 0 else 1 end, m.is_primary desc, m.created_at
          limit 1
        ), ''),
        'logoUrl', coalesce((
          select nullif(trim(p.logo_url),'')
          from public.sales_company_memberships m
          join public.profiles p on p.id = m.user_id
          where m.company_id = s.id and nullif(trim(coalesce(p.logo_url,'')),'') is not null
          order by case when p.company_role='firmaadmin' then 0 else 1 end, m.is_primary desc, m.created_at
          limit 1
        ), '/expo-logo.png')
      )
      from public.sales_company_scopes s
      where s.id = p_company_id
    )
  end;
$$;

create or replace function public.get_my_work_profile_state()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with mine as (
    select
      m.company_id,
      s.display_name,
      m.is_primary,
      m.workspace_role,
      m.created_at,
      public.work_profile_company_profile(m.company_id) as company_profile
    from public.sales_company_memberships m
    join public.sales_company_scopes s on s.id = m.company_id
    where m.user_id = auth.uid()
  ), state as (
    select
      public.current_primary_company_scope_id() as primary_id,
      public.current_active_company_scope_id() as active_id,
      exists(select 1 from public.user_active_company_scope a where a.user_id=auth.uid()) as has_explicit_selection,
      count(*) filter (where public.is_internal_work_profile_company(company_id)) as internal_count
    from mine
  )
  select jsonb_build_object(
    'primary_company_id', state.primary_id,
    'active_company_id', state.active_id,
    'has_explicit_selection', state.has_explicit_selection,
    'selection_required', (state.internal_count > 1 and not state.has_explicit_selection),
    'can_switch', (state.internal_count > 1),
    'active_company_profile', public.work_profile_company_profile(state.active_id),
    'workspaces', coalesce((
      select jsonb_agg(jsonb_build_object(
        'company_id', mine.company_id,
        'company_name', mine.display_name,
        'is_primary', mine.is_primary,
        'workspace_role', mine.workspace_role,
        'company_profile', mine.company_profile
      ) order by mine.is_primary desc, mine.display_name)
      from mine
      where public.is_internal_work_profile_company(mine.company_id)
    ), '[]'::jsonb)
  )
  from state;
$$;

create or replace function public.set_active_work_profile(requested_company_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Du er ikke innlogget.' using errcode='42501';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id=auth.uid()
      and coalesce(p.approved,false)=true
      and coalesce(p.deactivated,false)=false
  ) then
    raise exception 'Brukeren er ikke godkjent eller aktiv.' using errcode='42501';
  end if;
  if not exists (
    select 1 from public.sales_company_memberships m
    where m.user_id=auth.uid() and m.company_id=requested_company_id
  ) then
    raise exception 'Du har ikke tilgang til denne arbeidsprofilen.' using errcode='42501';
  end if;
  if not public.is_internal_work_profile_company(requested_company_id) then
    raise exception 'Arbeidsprofilbytte er bare aktivert for Ringside/Expo-gruppen.' using errcode='42501';
  end if;

  insert into public.user_active_company_scope(user_id,company_id,selected_at)
  values(auth.uid(),requested_company_id,now())
  on conflict(user_id) do update
    set company_id=excluded.company_id, selected_at=excluded.selected_at;

  return public.get_my_work_profile_state();
end;
$$;

create or replace function public.list_managed_work_profiles()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case when not public.current_profile_is_systemadmin() then
    jsonb_build_object('is_systemadmin',false,'companies','[]'::jsonb,'users','[]'::jsonb)
  else jsonb_build_object(
    'is_systemadmin',true,
    'companies', coalesce((
      select jsonb_agg(jsonb_build_object('company_id',s.id,'company_name',s.display_name) order by s.display_name)
      from public.sales_company_scopes s
      where public.is_internal_work_profile_company(s.id)
    ), '[]'::jsonb),
    'users', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id',p.id,
        'email',p.email,
        'company_name',p.company_name,
        'primary_company_id',(
          select s.id from public.sales_company_scopes s
          where s.normalized_name=public.sales_normalize_company_name(p.company_name)
          limit 1
        ),
        'workspace_company_ids',coalesce((
          select jsonb_agg(m.company_id order by m.is_primary desc,m.created_at)
          from public.sales_company_memberships m
          where m.user_id=p.id and public.is_internal_work_profile_company(m.company_id)
        ),'[]'::jsonb)
      ) order by lower(coalesce(p.email,'')))
      from public.profiles p
    ), '[]'::jsonb)
  ) end;
$$;

create or replace function public.set_managed_work_profiles(
  target_user_id uuid,
  requested_company_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile public.profiles%rowtype;
  v_primary_id uuid;
  v_requested uuid[] := coalesce(requested_company_ids,array[]::uuid[]);
  v_desired uuid[] := array[]::uuid[];
  v_id uuid;
begin
  if not public.current_profile_is_systemadmin() then
    raise exception 'Kun systemadministrator kan endre arbeidsprofiler.' using errcode='42501';
  end if;

  select * into v_profile from public.profiles where id=target_user_id;
  if not found then raise exception 'Brukeren finnes ikke.'; end if;

  select s.id into v_primary_id
  from public.sales_company_scopes s
  where s.normalized_name=public.sales_normalize_company_name(v_profile.company_name)
  limit 1;

  if v_primary_id is null then
    raise exception 'Brukeren må ha et gyldig primærfirma før arbeidsprofiler kan settes.';
  end if;

  if not public.is_internal_work_profile_company(v_primary_id) then
    if cardinality(v_requested) > 0 then
      raise exception 'Ekstra arbeidsprofiler kan bare gis til brukere i Ringside/Expo-gruppen.' using errcode='42501';
    end if;
    return jsonb_build_object('user_id',target_user_id,'workspace_company_ids','[]'::jsonb);
  end if;

  foreach v_id in array v_requested loop
    if not public.is_internal_work_profile_company(v_id) then
      raise exception 'Ugyldig arbeidsprofil.' using errcode='42501';
    end if;
    if not (v_id = any(v_desired)) then v_desired := array_append(v_desired,v_id); end if;
  end loop;
  if not (v_primary_id = any(v_desired)) then v_desired := array_append(v_desired,v_primary_id); end if;

  update public.sales_company_memberships
  set is_primary=false, updated_at=now()
  where user_id=target_user_id;

  foreach v_id in array v_desired loop
    insert into public.sales_company_memberships(
      company_id,user_id,is_primary,workspace_role,granted_by,updated_at
    ) values(
      v_id,
      target_user_id,
      v_id=v_primary_id,
      case when v_id=v_primary_id and v_profile.company_role='firmaadmin' then 'firmaadmin' else 'ansatt' end,
      auth.uid(),
      now()
    )
    on conflict(company_id,user_id) do update set
      is_primary=excluded.is_primary,
      workspace_role=excluded.workspace_role,
      granted_by=excluded.granted_by,
      updated_at=excluded.updated_at;
  end loop;

  delete from public.sales_company_memberships m
  where m.user_id=target_user_id
    and public.is_internal_work_profile_company(m.company_id)
    and not (m.company_id = any(v_desired));

  delete from public.user_active_company_scope a
  where a.user_id=target_user_id
    and not exists (
      select 1 from public.sales_company_memberships m
      where m.user_id=a.user_id and m.company_id=a.company_id
    );

  return jsonb_build_object(
    'user_id',target_user_id,
    'primary_company_id',v_primary_id,
    'workspace_company_ids',to_jsonb(v_desired)
  );
end;
$$;

create or replace function public.sync_profile_primary_work_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_new_scope uuid;
  v_old_scope uuid;
  v_new_norm text := public.sales_normalize_company_name(new.company_name);
  v_old_norm text := case when tg_op='UPDATE' then public.sales_normalize_company_name(old.company_name) else '' end;
  v_internal_transition boolean := false;
begin
  if v_new_norm='' then return new; end if;

  select id into v_new_scope from public.sales_company_scopes where normalized_name=v_new_norm limit 1;
  if v_new_scope is null then
    insert into public.sales_company_scopes(normalized_name,display_name)
    values(v_new_norm,trim(new.company_name))
    returning id into v_new_scope;
  end if;

  if tg_op='UPDATE' and v_old_norm<>'' then
    select id into v_old_scope from public.sales_company_scopes where normalized_name=v_old_norm limit 1;
  end if;

  if tg_op='UPDATE' and v_new_norm is distinct from v_old_norm then
    v_internal_transition := coalesce(public.is_internal_work_profile_company(v_old_scope),false)
      and public.is_internal_work_profile_company(v_new_scope);
    if not v_internal_transition then
      delete from public.sales_company_memberships
      where user_id=new.id and company_id<>v_new_scope;
    end if;
  end if;

  update public.sales_company_memberships
  set is_primary=false, updated_at=now()
  where user_id=new.id and company_id<>v_new_scope and is_primary=true;

  insert into public.sales_company_memberships(
    company_id,user_id,is_primary,workspace_role,updated_at
  ) values(
    v_new_scope,
    new.id,
    true,
    case when new.company_role='firmaadmin' then 'firmaadmin' else 'ansatt' end,
    now()
  )
  on conflict(company_id,user_id) do update set
    is_primary=true,
    workspace_role=excluded.workspace_role,
    updated_at=excluded.updated_at;

  if tg_op='UPDATE' and v_new_norm is distinct from v_old_norm then
    insert into public.user_active_company_scope(user_id,company_id,selected_at)
    values(new.id,v_new_scope,now())
    on conflict(user_id) do update set company_id=excluded.company_id, selected_at=excluded.selected_at;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_primary_work_profile on public.profiles;
create trigger profiles_sync_primary_work_profile
after insert or update of company_name, company_role on public.profiles
for each row execute function public.sync_profile_primary_work_profile();

revoke all on function public.set_active_work_profile(uuid) from public;
revoke all on function public.set_managed_work_profiles(uuid,uuid[]) from public;
revoke all on function public.list_managed_work_profiles() from public;
revoke all on function public.get_my_work_profile_state() from public;
grant execute on function public.set_active_work_profile(uuid) to authenticated;
grant execute on function public.set_managed_work_profiles(uuid,uuid[]) to authenticated;
grant execute on function public.list_managed_work_profiles() to authenticated;
grant execute on function public.get_my_work_profile_state() to authenticated;

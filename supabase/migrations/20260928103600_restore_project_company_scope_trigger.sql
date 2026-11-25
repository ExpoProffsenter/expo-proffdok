-- Restore the authoritative project scope hook used by Production.
--
-- The permanent demo-sandbox was created from a baseline snapshot whose
-- migration history did not include this trigger/function pair. Without the
-- BEFORE trigger, new authenticated project rows reach the INSERT RLS check
-- with company_scope_id = null and are rejected even for their owner.

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
  v_company_profile jsonb := null;
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
      select s.id into v_scope_id
      from public.sales_company_scopes s
      where s.normalized_name=v_normalized
      limit 1;
      if v_scope_id is null then
        insert into public.sales_company_scopes(normalized_name,display_name)
        values(v_normalized,v_profile_name)
        returning id into v_scope_id;
      end if;
    end if;

    new.company_scope_id:=v_scope_id;
    v_company_profile:=public.work_profile_company_profile(v_scope_id);

    if v_company_profile is not null then
      new.data:=jsonb_set(
        coalesce(new.data,'{}'::jsonb),
        '{company}',
        jsonb_build_object(
          'companyName',coalesce(v_company_profile->>'companyName',''),
          'orgNumber',coalesce(v_company_profile->>'orgNumber',''),
          'address',coalesce(v_company_profile->>'address',''),
          'phone',coalesce(v_company_profile->>'phone',''),
          'email',coalesce(v_company_profile->>'email',''),
          'website',coalesce(v_company_profile->>'website',''),
          'logoUrl',coalesce(v_company_profile->>'logoUrl','/expo-logo.png')
        ),
        true
      );
    end if;
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

drop trigger if exists projects_sync_company_scope_id on public.projects;
create trigger projects_sync_company_scope_id
before insert or update of data, company_scope_id on public.projects
for each row
execute function public.sync_project_company_scope_id();

revoke all on function public.sync_project_company_scope_id() from public;
grant execute on function public.sync_project_company_scope_id() to service_role;

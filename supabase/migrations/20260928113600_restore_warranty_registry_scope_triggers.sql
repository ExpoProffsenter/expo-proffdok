-- Restore the existing Production warranty-registry guards in environments whose
-- demo baseline was created without the trigger functions. Idempotent by design.

create or replace function public.project_data_has_signed_contract(project_data jsonb)
returns boolean
language sql
immutable
set search_path to 'public', 'pg_temp'
as $function$
  select exists (
    select 1
    from jsonb_array_elements(
      case
        when jsonb_typeof(project_data->'tilbud'->'files') = 'array'
          then project_data->'tilbud'->'files'
        else '[]'::jsonb
      end
    ) as f
    where lower(trim(coalesce(f->>'documentType',''))) = 'contract'
       or lower(trim(coalesce(f->>'contractSource',''))) in ('expo','external')
       or lower(coalesce(f->>'name','')) ~ '(kontrakt|contract)'
  );
$function$;

revoke all on function public.project_data_has_signed_contract(jsonb) from public;
grant execute on function public.project_data_has_signed_contract(jsonb) to anon, authenticated, service_role;

create or replace function public.sync_warranty_registry_company_scope()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_company_scope_id uuid;
  v_user_id uuid;
begin
  if new.project_id is null then
    raise exception 'Garantiregistrering krever et lagret prosjekt.' using errcode = '23502';
  end if;

  select p.company_scope_id, p.user_id
    into v_company_scope_id, v_user_id
  from public.projects p
  where p.id = new.project_id;

  if v_company_scope_id is null then
    raise exception 'Fant ikke prosjekt eller firmascope for garantiregistreringen.' using errcode = '23503';
  end if;

  if auth.uid() is not null
     and not public.project_row_access_allowed(v_company_scope_id, v_user_id) then
    raise exception 'Brukeren har ikke tilgang til prosjektet.' using errcode = '42501';
  end if;

  new.company_scope_id := v_company_scope_id;
  return new;
end;
$function$;

revoke all on function public.sync_warranty_registry_company_scope() from public, anon, authenticated;
grant execute on function public.sync_warranty_registry_company_scope() to service_role;

create or replace function public.enforce_warranty_signed_contract_before_issue()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_project_data jsonb;
begin
  if new.project_id is null then
    raise exception 'Garantien kan ikke utstedes før prosjektet er lagret.' using errcode = '23514';
  end if;

  select p.data
    into v_project_data
  from public.projects p
  where p.id = new.project_id
    and p.company_scope_id = new.company_scope_id;

  if v_project_data is null then
    raise exception 'Garantien kan ikke utstedes fordi prosjektet ikke finnes i riktig firma.' using errcode = '23514';
  end if;

  if not public.project_data_has_signed_contract(v_project_data) then
    raise exception 'Garantien kan ikke utstedes før signert kontrakt er lagt i Avtalegrunnlag. Bruk signert Expo-kontrakt eller last opp bedriftens egen signerte kontrakt.' using errcode = '23514';
  end if;

  return new;
end;
$function$;

grant execute on function public.enforce_warranty_signed_contract_before_issue() to anon, authenticated, service_role;

drop trigger if exists trg_sync_warranty_registry_company_scope on public.warranty_registry;
create trigger trg_sync_warranty_registry_company_scope
before insert or update of project_id, company_scope_id on public.warranty_registry
for each row execute function public.sync_warranty_registry_company_scope();

drop trigger if exists trg_warranty_registry_require_signed_contract on public.warranty_registry;
create trigger trg_warranty_registry_require_signed_contract
before insert on public.warranty_registry
for each row execute function public.enforce_warranty_signed_contract_before_issue();

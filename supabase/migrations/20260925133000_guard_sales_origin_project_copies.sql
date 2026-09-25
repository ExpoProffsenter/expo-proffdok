-- Expo ProffDok hotfix 2026-09-25
-- Prevents detached duplicate projects from the same real Sales request and
-- carries the customer's immutable accepted options into the project snapshot.

create or replace function public.guard_sales_origin_project_insert()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_request_ref text;
  v_selected_options jsonb;
begin
  v_request_ref := nullif(new.data #>> '{project,salesOrigin,requestRef}', '');
  if v_request_ref is null then
    return new;
  end if;

  select o.accepted_payload->'selected_options'
    into v_selected_options
  from public.sales_offers o
  where o.company_id = new.company_scope_id
    and o.request_ref = v_request_ref
    and o.status = 'accepted'
  order by o.accepted_at desc nulls last, o.updated_at desc
  limit 1;

  if jsonb_typeof(v_selected_options) = 'array' then
    new.data := jsonb_set(
      new.data,
      '{project,salesOrigin,acceptedOptions}',
      v_selected_options,
      true
    );
  end if;

  -- Synthetic DEMO refs may deliberately be duplicated for demo scenarios.
  if v_request_ref not like 'DEMO-%' and exists (
    select 1
    from public.projects p
    where p.company_scope_id is not distinct from new.company_scope_id
      and p.data #>> '{project,salesOrigin,requestRef}' = v_request_ref
  ) then
    raise exception 'Sales-saken % har allerede et aktivert prosjekt.', v_request_ref
      using errcode = '23505';
  end if;

  return new;
end;
$$;

revoke all on function public.guard_sales_origin_project_insert() from public, anon, authenticated;
grant execute on function public.guard_sales_origin_project_insert() to postgres, service_role;

drop trigger if exists trg_guard_sales_origin_project_insert on public.projects;
create trigger trg_guard_sales_origin_project_insert
before insert on public.projects
for each row
execute function public.guard_sales_origin_project_insert();

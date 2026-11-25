-- Sandbox caught an ambiguous PL/pgSQL column reference in the profile inheritance
-- trigger. Keep this idempotent follow-up because the first migration is already in
-- Sandbox history; Production will safely apply both definitions.

CREATE OR REPLACE FUNCTION public.sync_profile_company_store_offers_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_company_id uuid;
begin
  if nullif(public.sales_normalize_company_name(new.company_name), '') is null then
    delete from public.user_module_access
    where user_id = new.id and module_key = 'store_offers';
    return new;
  end if;

  select s.id
  into v_company_id
  from public.sales_company_scopes s
  where s.normalized_name = public.sales_normalize_company_name(new.company_name)
  limit 1;

  if v_company_id is not null and public.company_has_store_offers_access(v_company_id) then
    insert into public.user_module_access (user_id, module_key, granted_by)
    select new.id, module_row.module_key, a.granted_by
    from public.company_module_access a
    cross join unnest(array['sales', 'store_offers']::text[]) as module_row(module_key)
    where a.company_id = v_company_id
      and a.module_key = 'store_offers'
      and a.enabled = true
    on conflict (user_id, module_key) do nothing;
  else
    delete from public.user_module_access
    where user_id = new.id and module_key = 'store_offers';
  end if;

  return new;
end;
$function$;

revoke all on function public.sync_profile_company_store_offers_access()
  from public, anon, authenticated;

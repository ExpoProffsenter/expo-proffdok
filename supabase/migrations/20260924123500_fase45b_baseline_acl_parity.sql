-- FASE 45B – sluttparitet mot gjeldende Production-baseline.
-- Sandbox har historiske branch-hotfixer som har gitt enkelte eksisterende
-- SECURITY DEFINER-funksjoner bredere EXECUTE enn Production. Denne migrasjonen
-- er idempotent og gjør ingen dataendringer. Den reetablerer kun ACL/search_path
-- som allerede gjelder i Production før 45B.

alter function public.module_access_valid_key(text)
  set search_path = public, pg_temp;

revoke all on function public.current_profile_is_firmaadmin() from public, anon;
grant execute on function public.current_profile_is_firmaadmin() to authenticated;

revoke all on function public.current_profile_is_systemadmin() from public, anon;
grant execute on function public.current_profile_is_systemadmin() to authenticated;

revoke all on function public.current_sales_company_scope_id() from public, anon;
grant execute on function public.current_sales_company_scope_id() to authenticated;

revoke all on function public.get_my_module_access() from public, anon;
grant execute on function public.get_my_module_access() to authenticated;

revoke all on function public.get_sales_support_company_profile(uuid) from public, anon;
grant execute on function public.get_sales_support_company_profile(uuid) to authenticated;

revoke all on function public.list_sales_request_summaries(uuid) from public, anon;
grant execute on function public.list_sales_request_summaries(uuid) to authenticated;

revoke all on function public.list_sales_support_companies() from public, anon;
grant execute on function public.list_sales_support_companies() to authenticated;

revoke all on function public.resolve_sales_company_scope() from public, anon;
grant execute on function public.resolve_sales_company_scope() to authenticated;

revoke all on function public.resolve_sales_support_company_scope(uuid) from public, anon;
grant execute on function public.resolve_sales_support_company_scope(uuid) to authenticated;

revoke all on function public.resolve_sales_support_company_scope_by_name(text) from public, anon;
grant execute on function public.resolve_sales_support_company_scope_by_name(text) to authenticated;

-- Trigger/helper: skal ikke være klientkallbar. Dette er allerede Production-fasit.
revoke all on function public.fase38a_transition_seed_modules_on_approval()
  from public, anon, authenticated;

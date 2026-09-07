-- Expo ProffDok – FASE 38A1
-- Supabase-prosjektet har eksplisitte standardgrants til anon/authenticated.
-- Nye interne modultilgangsfunksjoner skal ikke kunne kalles som anon.

revoke execute on function public.current_user_has_module_access(text) from public, anon;
revoke execute on function public.current_user_module_keys() from public, anon;
revoke execute on function public.get_my_module_access() from public, anon;
revoke execute on function public.list_managed_module_access() from public, anon;
revoke execute on function public.set_managed_module_access(uuid,text[]) from public, anon;

grant execute on function public.current_user_has_module_access(text) to authenticated;
grant execute on function public.current_user_module_keys() to authenticated;
grant execute on function public.get_my_module_access() to authenticated;
grant execute on function public.list_managed_module_access() to authenticated;
grant execute on function public.set_managed_module_access(uuid,text[]) to authenticated;

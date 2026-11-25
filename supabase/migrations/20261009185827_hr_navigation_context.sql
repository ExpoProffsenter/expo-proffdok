-- H2 menu metadata only. Reuse H1 actor gate; no individual records or grants.
create function public.get_hr_context() returns jsonb
language plpgsql security definer set search_path='' as $$
declare c uuid:=public.current_active_company_scope_id(); x jsonb; enabled boolean;
begin
 x:=hr_private.require_actor(c);
 select f.enabled into enabled from hr_private.firms f where f.company_id=c;
 return x || jsonb_build_object('available',coalesce((x->>'administer')::boolean,false) or coalesce(enabled,false),
  'enabled',coalesce(enabled,false),'content_enabled',false,
  'company_name',(select s.display_name from public.sales_company_scopes s where s.id=c));
end $$;
revoke all on function public.get_hr_context() from public,anon,authenticated,service_role;
grant execute on function public.get_hr_context() to authenticated;

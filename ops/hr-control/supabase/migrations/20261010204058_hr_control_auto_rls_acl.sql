-- CONTROL PROJECT ONLY. Dashboard-created event trigger is not a public RPC.
do $$ begin
 if to_regprocedure('public.rls_auto_enable()') is not null then
  revoke all on function public.rls_auto_enable() from public,anon,authenticated,service_role;
 end if;
end $$;

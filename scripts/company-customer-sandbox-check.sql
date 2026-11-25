-- Run only in Sandbox; all test customer records roll back.
begin;
do $$
declare v_admin uuid; v_member uuid; v_scope_a uuid; v_scope_b uuid; a jsonb; b jsonb;
begin
 select id into v_admin from public.profiles where system_role='systemadmin' and approved and not coalesce(deactivated,false) limit 1;
 select p.id into v_member from public.profiles p join public.sales_company_memberships m on m.user_id=p.id where p.system_role is distinct from 'systemadmin' and p.approved and not coalesce(p.deactivated,false) limit 1;
 assert v_admin is not null and v_member is not null;
 perform set_config('request.jwt.claim.sub',v_admin::text,true);
 v_scope_a:=public.company_customer_scope();
 a:=public.save_company_customer('{"customer":"QA fixed customer A","email":"qa-a@example.invalid","projectSecret":"must not persist"}',null,null,v_scope_a);
 assert not (a->'customer' ? 'projectSecret');
 assert jsonb_array_length(public.search_company_customers('QA fixed customer A')->'customers')=1;
 perform set_config('request.jwt.claim.sub',v_member::text,true);
 v_scope_b:=public.company_customer_scope(); assert v_scope_a<>v_scope_b;
 assert jsonb_array_length(public.search_company_customers('QA fixed customer A')->'customers')=0,'Cross-firm read';
 begin
  perform public.save_company_customer('{"customer":"Cross firm edit"}',(a->>'id')::uuid,1,v_scope_b);
  raise exception 'Cross firm update allowed';
 exception when serialization_failure then null;
 end;
 begin
  perform public.save_company_customer('{"customer":"Wrong expected scope"}',null,null,v_scope_a);
  raise exception 'Scope switching write allowed';
 exception when insufficient_privilege then null;
 end;
 b:=public.save_company_customer('{"customer":"QA fixed customer B"}',null,null,v_scope_b);
 b:=public.save_company_customer('{"customer":"QA updated customer B"}',(b->>'id')::uuid,1,v_scope_b);
 assert (b->>'revision')::bigint=2;
 begin
  perform public.save_company_customer('{"customer":"Old revision"}',(b->>'id')::uuid,1,v_scope_b);
  raise exception 'Stale update allowed';
 exception when serialization_failure then null;
 end;
 perform set_config('request.jwt.claim.sub','',true);
 begin
  perform public.search_company_customers(''); raise exception 'Anonymous read allowed';
 exception when insufficient_privilege then null;
 end;
 assert not has_table_privilege('authenticated','public.company_customer_profiles','SELECT,INSERT,UPDATE,DELETE');
 assert not has_function_privilege('anon','public.search_company_customers(text)','EXECUTE');
end $$;
rollback;
select 'Customer scope, revision and opt-in records passed; rollback complete' as result;

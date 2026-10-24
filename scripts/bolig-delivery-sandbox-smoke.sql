-- Sandbox only. Entire authenticated exercise rolls back; no e-mail provider call.
begin;
select set_config('request.jwt.claim.sub',(select id::text from auth.users where email='demo@expo-proffdok.no'),true);
set local role authenticated;
do $qa$
declare c uuid:='e0000000-0000-4000-8000-000000000001';r uuid:='756f2df1-18cd-4dcf-9f9b-272a14432973';u uuid:='4a9a3538-99ce-40f9-b02a-111b6ad9e5d4';s jsonb;d jsonb;o jsonb;m jsonb;ref uuid:=gen_random_uuid();
begin
 s:=public.bolig_deliveries(c,r,u,'get','{}');
 s:=public.bolig_deliveries(c,r,u,'settings',jsonb_build_object('revision',s->'revision','request_id',gen_random_uuid(),'settings',jsonb_build_object('address','QA leveringsgate 99','note','Kun rollback-test')));
 s:=public.bolig_deliveries(c,r,u,'unit_settings',jsonb_build_object('revision',s->'revision','request_id',gen_random_uuid(),'settings',jsonb_build_object('address_mode','common','address','','order_mode','split','delivery_mode','partial')));
 d:=public.bolig_order_draft(c,r,u,'get',null,null,'{}');
 s:=public.bolig_deliveries(c,r,u,'create',jsonb_build_object('revision',s->'revision','request_id',ref,'draft_revision',d->'draft'->'revision','positions','[0]'::jsonb,'reference','QA-ROLLBACK','supplier','QA Grossist','supplier_reference','','requested_date','2026-11-12','note','Kun test','review',true));
 o:=s->'orders'->0;
 if o->>'status'<>'prepared' or o->'snapshot'->>'address'<>'QA leveringsgate 99' then raise exception 'QA prepared snapshot mismatch';end if;
 m:=public.bolig_order_mail(c,r,u,'prepare',jsonb_build_object('request_id',gen_random_uuid(),'order_id',o->'id','revision',s->'revision','to','qa@example.invalid','fag','["QA Fag"]'::jsonb));
 if m->'snapshot'->>'to'<>'qa@example.invalid' or m->'snapshot'->'identity'->>'project' is null then raise exception 'QA mail mismatch';end if;
 s:=public.bolig_deliveries(c,r,u,'ordered',jsonb_build_object('revision',s->'revision','request_id',gen_random_uuid(),'order_id',o->'id','date','2026-10-21','confirmed',true));
 s:=public.bolig_deliveries(c,r,u,'receive',jsonb_build_object('revision',s->'revision','request_id',gen_random_uuid(),'order_id',o->'id','date','2026-10-21','note','Halvparten mottatt','lines',jsonb_build_array(jsonb_build_object('position',0,'quantity',(o->'snapshot'->'goods'->0->>'quantity')::numeric/2))));
 if s->'orders'->0->>'status'<>'partial' then raise exception 'QA partial status mismatch';end if;
 perform set_config('qa.bolig_delivery_result','PASS authenticated order, optional supplier reference, canonical e-mail snapshot, partial receipt; full rollback',true);
end$qa$;
select current_setting('qa.bolig_delivery_result') as result;
rollback;

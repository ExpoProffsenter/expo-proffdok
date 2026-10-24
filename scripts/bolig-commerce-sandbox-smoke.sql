-- Run only against Sandbox. All synthetic writes roll back, no mail/provider.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';r jsonb;s jsonb;t jsonb;d jsonb;a jsonb;
 root uuid;unit uuid;pkg uuid;oid uuid;did uuid;token text:=encode(sha256(convert_to(gen_random_uuid()::text||gen_random_uuid()::text,'UTF8')),'hex');answer uuid:=gen_random_uuid();
begin
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA COMMERCE ROLLBACK','reference','QA-ROLLBACK','buildings',jsonb_build_array(jsonb_build_object('name','QA Bygg','building_type','apartment','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts','[1]'::jsonb))))));
 root:=(r#>>'{root,id}')::uuid;unit:=(r#>>'{units,0,id}')::uuid;
 s:=public.bolig_catalog(c,root,'package',0,jsonb_build_object('name','QA Grunnpakke','lines',jsonb_build_array(jsonb_build_object('key','basin','name','QA Servant','sku','QA001','quantity',1,'unit','stk'))));
 pkg:=(s#>>'{packages,0,id}')::uuid;
 t:=public.bolig_package_choices(c,root,unit);
 t:=public.bolig_package_choices(c,root,unit,'save',0,jsonb_build_object('scope_id','common','package_id',pkg,'option_ids','[]'::jsonb,'catalog_revision',t->'revision','rooms_revision',t->'rooms_revision'));
 s:=public.bolig_commerce(c,root,unit,'create',jsonb_build_object('request_id',gen_random_uuid(),'kind','choice','choice_revision',1,'reason','QA – syntetisk grunnlag, ingen avtale med virkelig beboer'));
 did:=(s->>'document_id')::uuid;
 select x into d from jsonb_array_elements(s->'documents') x where x->>'id'=did::text;
 s:=public.bolig_commerce(c,root,unit,'approve',jsonb_build_object('request_id',gen_random_uuid(),'document_id',did,'revision',d->'revision'));
 select x into d from jsonb_array_elements(s->'documents') x where x->>'id'=did::text;
 s:=public.bolig_commerce(c,root,unit,'publish',jsonb_build_object('request_id',gen_random_uuid(),'document_id',did,'revision',d->'revision','token',token));
 perform set_config('request.jwt.claim.sub','',true);execute 'set local role anon';
 a:=public.bolig_resident_decision(token);
 if a->>'status'<>'published' or a#>>'{snapshot,goods,0,sku}'<>'QA001' or a ? 'root_id' or a#>'{snapshot,order_id}' is not null then raise exception 'Public projection incorrect';end if;
 a:=public.bolig_resident_decision(token,'accept',did,jsonb_build_object('name','QA Syntetisk Beboer','confirmed',true,'request_id',answer));
 if a->>'status'<>'accepted' then raise exception 'No accepted receipt';end if;
 if public.bolig_resident_decision(token,'accept',did,jsonb_build_object('name','QA Syntetisk Beboer','confirmed',true,'request_id',answer)) is distinct from a then raise exception 'Replay changed receipt';end if;
 execute 'set local role authenticated';perform set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
 s:=public.bolig_commerce(c,root,unit);
 select x into d from jsonb_array_elements(s->'documents') x where x->>'id'=did::text;
 if d->>'status'<>'accepted' or d->>'accepted_name'<>'QA Syntetisk Beboer' then raise exception 'Internal readback differs';end if;
end$$;
reset role;
rollback;
select 'PASS sandbox commerce: real manager and anon gateways, acceptance, exact replay and private projection; all writes rolled back' as result;

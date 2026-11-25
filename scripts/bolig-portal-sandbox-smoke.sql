-- Only Sandbox. Synthetic portal, real RPCs and anon boundary, no mail. Rollback.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';r jsonb;s jsonb;t jsonb;v jsonb;root uuid;unit uuid;pkg uuid;offer uuid;event uuid;
 token text:=encode(sha256(convert_to(gen_random_uuid()::text||gen_random_uuid()::text,'UTF8')),'hex');attempt uuid:=gen_random_uuid();
begin
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA PORTAL ROLLBACK','reference','QA-PORTAL-ROLLBACK','buildings',jsonb_build_array(jsonb_build_object('name','QA Bygg','building_type','apartment','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts','[1]'::jsonb))))));
 root:=(r#>>'{root,id}')::uuid;unit:=(r#>>'{units,0,id}')::uuid;
 r:=public.bolig_workspace(c,'unit',root,(r#>>'{root,revision}')::bigint,jsonb_build_object('id',unit,'number','H0101','contact_name','QA Beboer','contact_email','qa@example.invalid'));
 s:=public.bolig_catalog(c,root,'package',0,jsonb_build_object('name','QA Grunnpakke','lines',jsonb_build_array(jsonb_build_object('key','basin','name','QA Servant','sku','QA001','quantity',1,'unit','stk'))));pkg:=(s#>>'{packages,0,id}')::uuid;
 t:=public.bolig_package_choices(c,root,unit);t:=public.bolig_package_choices(c,root,unit,'save',0,jsonb_build_object('scope_id','common','package_id',pkg,'option_ids','[]'::jsonb,'catalog_revision',t->'revision','rooms_revision',t->'rooms_revision'));
 s:=public.bolig_resident_portal(c,root,unit,'offer',jsonb_build_object('request_id',gen_random_uuid(),'revision',0,'current',true,'title','QA Grunnpakke','choice_revision',1));offer:=(s#>>'{portal,offers_draft,0,id}')::uuid;
 s:=public.bolig_resident_portal(c,root,unit,'publish',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','token',token,'reviewed',true));
 perform set_config('request.jwt.claim.sub','',true);execute 'set local role anon';
 v:=public.bolig_portal(token);if v#>>'{offers,0,goods,0,sku}'<>'QA001' or v ? 'contact' or v ? 'root_id' then raise exception 'Portal projection failed';end if;
 v:=public.bolig_portal(token,'request',jsonb_build_object('request_id',attempt,'offer_id',offer,'menu_version',1,'body','QA forespørsel'));
 v:=public.bolig_portal(token,'request',jsonb_build_object('request_id',attempt,'offer_id',offer,'menu_version',1,'body','QA forespørsel'));
 if jsonb_array_length(v->'events')<>1 then raise exception 'Replay created duplicate';end if;event:=(v#>>'{events,0,id}')::uuid;
 execute 'reset role';perform set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);execute 'set local role authenticated';
 s:=public.bolig_resident_portal(c,root,unit);s:=public.bolig_resident_portal(c,root,unit,'apply',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','event_id',event,'note','QA gjennomgått uten ekte kunde'));
 t:=public.bolig_package_choices(c,root,unit);if t#>>'{selection,revision}'<>'2' then raise exception 'Reviewed selection not applied';end if;
 s:=public.bolig_resident_portal(c,root,unit,'revoke',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision'));
 perform set_config('request.jwt.claim.sub','',true);execute 'set local role anon';
 begin perform public.bolig_portal(token);raise exception 'Revoked link remained active';exception when insufficient_privilege then null;end;
end$$;
rollback;

-- Only Sandbox. Synthetic portal, real RPCs and anon boundary, no mail. Rollback.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';r jsonb;s jsonb;t jsonb;v jsonb;root uuid;unit uuid;pkg uuid;offer uuid;event uuid;portal uuid;doc uuid;mail_id uuid:=gen_random_uuid();payload jsonb;
 doc_token text:=repeat('b',64);
 token text:=encode(sha256(convert_to(gen_random_uuid()::text||gen_random_uuid()::text,'UTF8')),'hex');attempt uuid:=gen_random_uuid();
begin
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA RESIDENT MAIL ROLLBACK','reference','QA-RESIDENT-MAIL-ROLLBACK','buildings',jsonb_build_array(jsonb_build_object('name','QA Bygg','building_type','apartment','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts','[1]'::jsonb))))));
 root:=(r#>>'{root,id}')::uuid;unit:=(r#>>'{units,0,id}')::uuid;
 r:=public.bolig_workspace(c,'unit',root,(r#>>'{root,revision}')::bigint,jsonb_build_object('id',unit,'number','H0101','contact_name','QA Beboer','contact_email','qa@example.invalid'));
 s:=public.bolig_catalog(c,root,'package',0,jsonb_build_object('name','QA Grunnpakke','lines',jsonb_build_array(jsonb_build_object('key','basin','name','QA Servant','sku','QA001','quantity',1,'unit','stk'))));pkg:=(s#>>'{packages,0,id}')::uuid;
 t:=public.bolig_package_choices(c,root,unit);t:=public.bolig_package_choices(c,root,unit,'save',0,jsonb_build_object('scope_id','common','package_id',pkg,'option_ids','[]'::jsonb,'catalog_revision',t->'revision','rooms_revision',t->'rooms_revision'));
 s:=public.bolig_resident_portal(c,root,unit,'offer',jsonb_build_object('request_id',gen_random_uuid(),'revision',0,'current',true,'title','QA Grunnpakke','choice_revision',1));offer:=(s#>>'{portal,offers_draft,0,id}')::uuid;
 s:=public.bolig_resident_portal(c,root,unit,'publish',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','token',token,'reviewed',true));
 portal:=(s#>>'{portal,id}')::uuid;
 payload:=jsonb_build_object('token',token);
 v:=public.bolig_resident_link_mail(c,root,unit,portal,'portal','get',payload);
 if v#>>'{snapshot,to}'<>'qa@example.invalid' or v->'enabled'<>'false'::jsonb or v::text like '%'||token||'%' then raise exception 'Unsafe mail read';end if;
 payload:=payload||jsonb_build_object('request_id',mail_id,'revision',v->'revision','to',v#>>'{snapshot,to}');
 v:=public.bolig_resident_link_mail(c,root,unit,portal,'portal','prepare',payload);
 if public.bolig_resident_link_mail(c,root,unit,portal,'portal','prepare',payload)<>v then raise exception 'Changed mail replay';end if;
 begin perform public.bolig_resident_link_mail(c,root,unit,portal,'portal','begin',payload);raise exception 'Paused mail began';exception when sqlstate 'PT409' then null;end;
 v:=public.bolig_resident_link_mail(c,root,unit,portal,'reminder','get',jsonb_build_object('token',token));
 if v#>>'{snapshot,kind}'<>'reminder' then raise exception 'Wrong reminder variant';end if;
 v:=public.bolig_commerce(c,root,unit,'create',jsonb_build_object('request_id',gen_random_uuid(),'kind','choice','choice_revision',1,'reason','QA mail rollback, ingen ekte avtale'));doc:=(v->>'document_id')::uuid;
 select x into t from jsonb_array_elements(v->'documents') x where x->>'id'=doc::text;
 v:=public.bolig_commerce(c,root,unit,'approve',jsonb_build_object('request_id',gen_random_uuid(),'document_id',doc,'revision',t->'revision'));
 select x into t from jsonb_array_elements(v->'documents') x where x->>'id'=doc::text;
 v:=public.bolig_commerce(c,root,unit,'publish',jsonb_build_object('request_id',gen_random_uuid(),'document_id',doc,'revision',t->'revision','token',doc_token));
 v:=public.bolig_resident_link_mail(c,root,unit,doc,'agreement','get',jsonb_build_object('token',doc_token));
 if v#>>'{snapshot,document_kind}'<>'choice' or v#>>'{snapshot,to}'<>'qa@example.invalid' then raise exception 'Wrong agreement snapshot';end if;
 v:=public.bolig_resident_link_mail(c,root,unit,doc,'agreement','prepare',jsonb_build_object('request_id',gen_random_uuid(),'token',doc_token,'revision',v->'revision','to',v#>>'{snapshot,to}'));
 s:=public.bolig_resident_portal(c,root,unit,'revoke',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision'));
 begin perform public.bolig_resident_link_mail(c,root,unit,portal,'portal','prepare',payload);raise exception 'Revoked replay allowed';exception when insufficient_privilege then null;end;
end$$;
rollback;
select 'PASS – native portal/reminder/agreement, canonical recipient, paused begin, exact retry, revocation, all rolled back; no mail' as result;

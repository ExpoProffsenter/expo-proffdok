-- Sandbox only. Actual authenticated/anon RPCs with synthetic rows; always rollback.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';owner_id uuid:='d0000000-0000-4000-8000-000000000001';r jsonb;s jsonb;p jsonb;v jsonb;root uuid;u uuid;neighbor uuid;pkg uuid;gid uuid:=gen_random_uuid();first_msg uuid;second_msg uuid;
 token text:=encode(sha256(convert_to(gen_random_uuid()::text||gen_random_uuid()::text,'UTF8')),'hex');day date:=(now() at time zone 'Europe/Oslo')::date+4;items jsonb:='[]';
begin
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA STAMME DIALOG ROLLBACK','reference','QA-COORD-ROLLBACK','buildings',jsonb_build_array(jsonb_build_object('name','QA Stammebygg','building_type','apartment','address','QA Stammevei','house_floors',2,'entrances',jsonb_build_array(jsonb_build_object('address','QA Stammevei','counts','[1,1]'::jsonb))))));
 root:=(r#>>'{root,id}')::uuid;u:=(r#>>'{units,0,id}')::uuid;neighbor:=(r#>>'{units,1,id}')::uuid;
 s:=public.bolig_coordination(c,root);if s->>'messaging_enabled'<>'false' then raise exception 'New project dialogue must default off';end if;
 s:=public.bolig_coordination(c,root,'group',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','id',gid,'name','QA Stamme A','unit_ids',jsonb_build_array(u,neighbor)));
 if jsonb_array_length(s#>'{groups,0,unit_ids}')<>2 then raise exception 'Explicit group mismatch';end if;
 for v in select jsonb_build_object('unit_id',x,'title',t) from unnest(array[u,neighbor]) x cross join unnest(array['QA Rørlegger','QA Elektro']) t loop
  items:=items||jsonb_build_array(v||jsonb_build_object('id',gen_random_uuid(),'planned_start',day,'planned_end',day,'owner_id',owner_id,'required',true));
 end loop;
 p:=public.bolig_progress(c,root,null,'batch',jsonb_build_object('request_id',gen_random_uuid(),'revision',0,'mode','create','reviewed',true,'items',items));
 if jsonb_array_length(p->'tasks')<>4 or exists(select 1 from jsonb_array_elements(p->'tasks') x where x->>'predecessor_id' is not null or x->>'planned_start'<>day::text) then raise exception 'Parallel plan mismatch';end if;
 s:=public.bolig_coordination(c,root,'settings',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','enabled',true,'manager_id',owner_id));
 r:=public.bolig_workspace(c,'unit',root,(r#>>'{root,revision}')::bigint,jsonb_build_object('id',u,'number','H0101','contact_name','QA Beboer','contact_email','qa@example.invalid'));
 p:=public.bolig_catalog(c,root,'package',0,jsonb_build_object('name','QA Grunnpakke','lines',jsonb_build_array(jsonb_build_object('key','basin','name','QA Servant','sku','QA001','quantity',1,'unit','stk'))));pkg:=(p#>>'{packages,0,id}')::uuid;
 p:=public.bolig_package_choices(c,root,u);p:=public.bolig_package_choices(c,root,u,'save',0,jsonb_build_object('scope_id','common','package_id',pkg,'option_ids','[]'::jsonb,'catalog_revision',p->'revision','rooms_revision',p->'rooms_revision'));
 p:=public.bolig_resident_portal(c,root,u,'offer',jsonb_build_object('request_id',gen_random_uuid(),'revision',0,'current',true,'title','QA Grunnpakke','choice_revision',1));
 p:=public.bolig_resident_portal(c,root,u,'publish',jsonb_build_object('request_id',gen_random_uuid(),'revision',p->'revision','token',token,'reviewed',true));
 perform set_config('request.jwt.claim.sub','',true);execute 'set local role anon';
 v:=public.bolig_portal(token,'message',jsonb_build_object('request_id',gen_random_uuid(),'body','QA første melding'));first_msg:=(v#>>'{events,0,id}')::uuid;
 execute 'reset role';perform set_config('request.jwt.claim.sub',owner_id::text,true);execute 'set local role authenticated';
 s:=public.bolig_coordination(c,root);if s#>>'{inbox,0,unread}'<>'1' or s#>>'{inbox,0,pending}'<>'1' then raise exception 'New message missing in inbox';end if;
 p:=public.bolig_resident_portal(c,root,u);p:=public.bolig_resident_portal(c,root,u,'read',jsonb_build_object('request_id',gen_random_uuid(),'revision',p->'revision','through_id',first_msg));
 s:=public.bolig_coordination(c,root);if s#>>'{inbox,0,unread}'<>'0' or s#>>'{inbox,0,pending}'<>'1' then raise exception 'Reading incorrectly handled message';end if;
 perform set_config('request.jwt.claim.sub','',true);execute 'set local role anon';
 v:=public.bolig_portal(token,'message',jsonb_build_object('request_id',gen_random_uuid(),'body','QA ny melding'));second_msg:=(v#>>'{events,1,id}')::uuid;
 execute 'reset role';perform set_config('request.jwt.claim.sub',owner_id::text,true);execute 'set local role authenticated';
 p:=public.bolig_resident_portal(c,root,u);p:=public.bolig_resident_portal(c,root,u,'handled',jsonb_build_object('request_id',gen_random_uuid(),'revision',p->'revision','through_id',first_msg));
 s:=public.bolig_coordination(c,root);if s#>>'{inbox,0,unread}'<>'1' or s#>>'{inbox,0,pending}'<>'1' then raise exception 'Earlier handling lost newer message';end if;
 s:=public.bolig_coordination(c,root,'units',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','unit_ids',jsonb_build_array(u),'mode','off'));
 if s#>>'{inbox,0,pending}'<>'1' then raise exception 'Disabling discarded pending followup';end if;
 perform set_config('request.jwt.claim.sub','',true);execute 'set local role anon';
 begin perform public.bolig_portal(token,'message',jsonb_build_object('request_id',gen_random_uuid(),'body','QA must be denied'));raise exception 'Disabled message accepted';exception when invalid_parameter_value then null;end;
 v:=public.bolig_portal(token);if jsonb_array_length(v->'events')<>2 or v->>'messaging_enabled'<>'false' then raise exception 'Disabled history mismatch';end if;
 execute 'reset role';if (select enabled from bolig_private.progress_mail_settings where singleton) or exists(select 1 from bolig_private.dialogue_deliveries) then raise exception 'Unexpected email or enabled transport';end if;
end$$;
rollback;
select 'PASS actual Sandbox coordination: explicit group, parallel plan, real portal message, read/handled boundary, retained history, server disabled gate; all synthetic writes rolled back' as result;

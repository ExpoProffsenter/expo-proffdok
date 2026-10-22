-- Sandbox only: synthetic plan, approval/publication, replay, completion and revocation.
-- No provider call; every temporary record rolls back.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';u uuid:='d0000000-0000-4000-8000-000000000001';r jsonb;s jsonb;v jsonb;root uuid;unit uuid;t uuid:=gen_random_uuid();nid uuid:=gen_random_uuid();req uuid:=gen_random_uuid();p jsonb;today date:=(now() at time zone 'Europe/Oslo')::date;
begin
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA FREMDRIFT ROLLBACK','reference','QA-PROGRESS-ROLLBACK','buildings',jsonb_build_array(jsonb_build_object('name','QA Bygg','building_type','apartment','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts','[2]'::jsonb))))));
 root:=(r#>>'{root,id}')::uuid;unit:=(r#>>'{units,0,id}')::uuid;
 r:=public.bolig_workspace(c,'unit',root,(r#>>'{root,revision}')::bigint,jsonb_build_object('id',unit,'number','H0101','contact_name','QA Beboer','contact_email','qa@example.invalid'));
 p:=jsonb_build_object('request_id',req,'revision',0,'id',t,'title','QA Monter bad','owner_id',u,'planned_start',today,'planned_end',today,'status','planned','required',true);
 s:=public.bolig_progress(c,root,unit,'save',p);
 if s#>>'{tasks,0,status}'<>'planned' or s->'mail_enabled'<>'false'::jsonb then raise exception 'Plan/paused transport mismatch';end if;
 v:=public.bolig_progress(c,root,unit,'save',p);if v->'revision'<>s->'revision' then raise exception 'Replay changed revision';end if;
 s:=public.bolig_progress(c,root,unit,'notice',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','id',nid,'task_id',t,'body','QA Planlagt arbeid. Ingen ekte mottaker.','publish_on',today));
 s:=public.bolig_progress(c,root,unit,'approve',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','id',nid,'basis',s#>>'{notices,0,basis}','reviewed',true));
 s:=public.bolig_progress(c,root,unit,'publish',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','id',nid,'reviewed',true));
 if s#>>'{notices,0,published_at}' is null then raise exception 'Approved publication missing';end if;
 s:=public.bolig_progress(c,root,unit,'save',p||jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','title','QA Endret arbeidsplan'));
 if s#>>'{notices,0,valid}'<>'false' then raise exception 'Stale plan still approved';end if;
 v:=public.bolig_progress(c,root,(r#>>'{units,1,id}')::uuid); -- r after unit update still includes both units
 if jsonb_array_length(v->'tasks')<>0 then raise exception 'Neighbor plan leaked';end if;
 execute 'reset role';
 v:=bolig_private.completion_source(c,root,unit);if not exists(select 1 from jsonb_array_elements_text(v->'issues') x where x like 'Fremdrift:%') then raise exception 'Unfinished required work did not block';end if;
 if exists(select 1 from bolig_private.progress_deliveries where root_id=root) then raise exception 'Paused worker created delivery';end if;
 execute 'set local role anon';
 begin perform public.bolig_progress(c,root,unit);raise exception 'Anonymous progress access';exception when insufficient_privilege then null;end;
end$$;
rollback;

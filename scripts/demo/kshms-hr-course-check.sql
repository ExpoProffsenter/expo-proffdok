-- SANDBOX/DEMO ONLY. Every scenario rolls back, including fictional signatures.
begin;
set local statement_timeout='30s';
create function pg_temp.assert_ok(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'Course QA failed: %',label;end if;end$$;
do $$declare s jsonb;after_reset jsonb;c uuid;u uuid;a jsonb;r jsonb;content jsonb;answers jsonb;old_sja uuid;old_execution_ids uuid[];sid uuid;target_id uuid;rev integer;original_count integer;begin
 select payload into s from public.demo_sandbox_snapshots where snapshot_key='people-course-v1';
 c:=(s->>'company_id')::uuid;u:=(s->>'user_id')::uuid;
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform pg_temp.assert_ok((public.demo_kshms_hr_course_preflight()->>'ok')::boolean,'saved course preflight');
 perform pg_temp.assert_ok(not has_function_privilege('anon','public.demo_kshms_hr_course_reset()','EXECUTE'),'anon denied');
 perform pg_temp.assert_ok(not has_function_privilege('service_role','public.demo_kshms_hr_course_reset()','EXECUTE'),'service role denied');
 perform pg_temp.assert_ok(has_function_privilege('authenticated','public.demo_kshms_hr_course_reset()','EXECUTE'),'authenticated RPC grant');
 select count(*) into original_count from public.kshms_sjas where company_id=c;
 old_sja:=(s#>>'{sja,id}')::uuid;
 select k.content,k.revision into content,rev from public.kshms_sjas k where k.id=old_sja;
 content:=content||jsonb_build_object('reviewed_on','2026-10-10','communication','FIKTIV QA i transaksjon som rulles tilbake.');
 r:=public.kshms_sja_command(c,'sign',gen_random_uuid(),jsonb_build_object('id',old_sja,'revision',rev,'project_id',s#>'{sja,project_id}','content',content,'prepared',true,'statement','Jeg har gjennomgått denne SJA-en sammen med deltakerne. Arbeidsoppgaven, farene, tiltakene og beredskapen er vurdert for forholdene på stedet. Nødvendige tiltak er kontrollert før arbeidet starter. Ved endringer eller uavklart risiko stanser vi og vurderer arbeidet på nytt.'));
 perform pg_temp.assert_ok(r#>>'{sja,status}'='signed','fictional SJA sign through ordinary RPC');
 old_execution_ids:='{}';
 for a in select value from jsonb_array_elements(s->'executions') loop
  target_id:=(a->>'id')::uuid;old_execution_ids:=array_append(old_execution_ids,target_id);
  select k.content,k.revision into content,rev from public.kshms_executions k where k.id=target_id;
  if a->>'kind'='round' then
   select jsonb_object_agg(point->>'id',jsonb_build_object('status','ok','comment','FIKTIV QA i transaksjon som rulles tilbake.','photos','[]'::jsonb,'responsible_id','','due_on','')) into answers from jsonb_array_elements(content->'points') point;
   content:=content||jsonb_build_object('answers',answers);
  else content:=jsonb_set(content,'{acceptance,confirmed}','true');end if;
  r:=public.kshms_execution_command(c,'complete',gen_random_uuid(),jsonb_build_object('id',target_id,'kind',a->>'kind','revision',rev,'project_id',a->'project_id','template_version_id',a->'template_version_id','content',content,'confirmed',true,'statement','Jeg bekrefter at jeg har gjennomført og kontrollert dokumentasjonen sammen med de oppgitte deltakerne.'));
  perform pg_temp.assert_ok(r#>>'{record,status}'='completed','fictional execution complete through ordinary RPC');
 end loop;
 r:=public.demo_kshms_hr_course_reset();
 perform pg_temp.assert_ok((r->>'ok')::boolean,'reset after fictional sign/complete');
 select payload into after_reset from public.demo_sandbox_snapshots where snapshot_key='people-course-v1';
 perform pg_temp.assert_ok((after_reset#>>'{sja,id}')::uuid<>old_sja,'reset creates fresh SJA');
 perform pg_temp.assert_ok(exists(select 1 from public.kshms_sjas k where k.id=old_sja and k.status='signed'),'signed SJA preserved');
 perform pg_temp.assert_ok((select count(*)=original_count+1 from public.kshms_sjas where company_id=c),'SJA history not deleted');
 perform pg_temp.assert_ok((select count(*)=2 from public.kshms_executions where id=any(old_execution_ids) and status='completed'),'completed executions preserved');
 perform pg_temp.assert_ok(not exists(select 1 from jsonb_array_elements(after_reset->'executions') x where (x->>'id')::uuid=any(old_execution_ids)),'fresh execution drafts');
 perform pg_temp.assert_ok(not exists(select 1 from public.kshms_executions e join jsonb_array_elements(after_reset->'executions') x on e.id=(x->>'id')::uuid where e.status<>'draft'),'reset drafts are unfinished');
 begin
  update public.profiles set deactivated=true where id=u;
  begin perform public.demo_kshms_hr_course_preflight();raise exception 'Disabled user unexpectedly allowed';exception when insufficient_privilege then null;end;
  raise no_data_found using message='Rollback deactivation fixture';
 exception when no_data_found then if sqlerrm<>'Rollback deactivation fixture' then raise;end if;end;
 update kshms_private.email_worker_settings set enabled=true where singleton;
 begin perform public.demo_kshms_hr_course_reset();raise exception 'Enabled Sandbox transport unexpectedly allowed';exception when raise_exception then if sqlerrm='Enabled Sandbox transport unexpectedly allowed' then raise;end if;end;
 update kshms_private.email_worker_settings set enabled=false where singleton;
 perform pg_temp.assert_ok(exists(select 1 from hr_private.runtime_state where singleton and not content_enabled and restore_quarantined),'private HR remains closed');
 perform set_config('request.jwt.claim.sub','',true);
 begin perform public.demo_kshms_hr_course_preflight();raise exception 'Non-demo user unexpectedly allowed';exception when raise_exception then if sqlerrm='Non-demo user unexpectedly allowed' then raise;end if;end;
end$$;
select 'PASS: dedicated scope/ACL, ordinary sign/complete, reset preserves immutable history, deactivation and transport guards, HR gate; all rolled back' as result;
rollback;

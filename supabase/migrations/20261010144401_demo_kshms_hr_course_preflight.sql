-- SANDBOX/DEMO ONLY. Never install on Production or merge demo back to main.
do $$begin
 if not exists(select 1 from public.demo_sandbox_snapshots where snapshot_key='golden-v1')
 then raise exception 'Dedicated Demo Sandbox baseline required';end if;
end$$;

create function public.demo_kshms_hr_course_preflight() returns jsonb
language plpgsql security definer set search_path='' as $$
declare s jsonb;c uuid;checks jsonb;templates integer;sja_ok boolean;execution_count integer;checklist_ok boolean;ruh_ok boolean;safe boolean;
begin
 perform public.demo_sandbox_assert_user();
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.approved and not coalesce(p.deactivated,false)) then raise exception 'Aktiv, godkjent demobruker kreves.' using errcode='42501';end if;
 select payload into s from public.demo_sandbox_snapshots where snapshot_key='people-course-v1';
 c:=(s->>'company_id')::uuid;
 if c is distinct from public.current_active_company_scope_id() then raise exception 'Velg Expo Proffsenter i Demo Sandbox.' using errcode='42501';end if;
 select count(*) into templates from jsonb_array_elements(coalesce(s->'templates','[]')) a
 join hr_private.conversation_template_versions v on v.template_id=(a->>'id')::uuid and v.company_id=c and v.revision=1;
 select exists(select 1 from public.kshms_sjas where id=(s#>>'{sja,id}')::uuid and company_id=c) into sja_ok;
 select count(*) into execution_count from jsonb_array_elements(coalesce(s->'executions','[]')) a
 join public.kshms_executions e on e.id=(a->>'id')::uuid and e.company_id=c;
 select exists(select 1 from public.kshms_checklist_versions where id=(s#>>'{checklist,version_id}')::uuid and company_id=c) into checklist_ok;
 select exists(select 1 from public.kshms_deviations where id=(s#>>'{deviation,id}')::uuid and company_id=c) into ruh_ok;
 safe:=exists(select 1 from kshms_private.email_worker_settings where singleton and not enabled)
 and exists(select 1 from hr_private.runtime_state where singleton and not content_enabled and restore_quarantined);
 checks:=jsonb_build_array(
 jsonb_build_object('key','course_hr_templates','ok',templates=3,'detail',templates||'/3 generelle HR-maler med bevart originalutgave'),
 jsonb_build_object('key','course_safety_examples','ok',sja_ok and execution_count=2 and checklist_ok and ruh_ok,'detail','SJA, vernerunde, risiko, sjekkliste og RUH er lagret i demofirmaet'),
 jsonb_build_object('key','course_privacy_transport','ok',safe,'detail','Ingen e-postutsending; personlig HR-innhold er sperret'));
 return jsonb_build_object('ok',templates=3 and sja_ok and execution_count=2 and checklist_ok and ruh_ok and safe,'checks',checks);
end$$;

create function public.demo_kshms_hr_course_reset() returns jsonb
language plpgsql security definer set search_path='' as $$
declare s jsonb;c uuid;u uuid;a jsonb;result jsonb;target_id uuid;rev integer;state text;items jsonb:='[]';
begin
 perform public.demo_sandbox_assert_user();
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.approved and not coalesce(p.deactivated,false)) then raise exception 'Aktiv, godkjent demobruker kreves.' using errcode='42501';end if;u:=auth.uid();
 perform pg_advisory_xact_lock(hashtextextended('demo-people-course:'||u::text,0));
 select payload into s from public.demo_sandbox_snapshots where snapshot_key='people-course-v1' for update;
 if s is null or (s->>'user_id')::uuid<>u or (s->>'company_id')::uuid is distinct from public.current_active_company_scope_id()
 then raise exception 'Velg Expo Proffsenter i Demo Sandbox før kursreset.' using errcode='42501';end if;
 if not exists(select 1 from kshms_private.email_worker_settings where singleton and not enabled)
 then raise exception 'Sandbox e-post skal være avslått.';end if;
 c:=(s->>'company_id')::uuid;
 for a in select value from jsonb_array_elements(s->'templates') loop
  select revision into rev from hr_private.conversation_templates where id=(a->>'id')::uuid and company_id=c;
  if rev is null then raise exception 'Kursmal mangler; kontroller seed/preflight.';end if;
  perform public.hr_template_save(c,(a->>'id')::uuid,rev,a->'content',false);
 end loop;
 a:=s->'sja';target_id:=(a->>'id')::uuid;
 select revision,status into rev,state from public.kshms_sjas where kshms_sjas.id=target_id and company_id=c;
 if state is distinct from 'draft' then target_id:=gen_random_uuid();rev:=0;end if;
 result:=public.kshms_sja_command(c,'save',gen_random_uuid(),jsonb_build_object('id',target_id,'revision',rev,'project_id',a->'project_id','content',a->'content'));
 s:=jsonb_set(s,'{sja,id}',to_jsonb(target_id));
 for a in select value from jsonb_array_elements(s->'executions') loop
  target_id:=(a->>'id')::uuid;
  select revision,status into rev,state from public.kshms_executions e where e.id=target_id and company_id=c;
  if state is distinct from 'draft' then target_id:=gen_random_uuid();rev:=0;end if;
  result:=public.kshms_execution_command(c,'save',gen_random_uuid(),jsonb_build_object('id',target_id,'kind',a->>'kind','revision',rev,'project_id',a->'project_id','template_version_id',a->'template_version_id','content',a->'content'));
  items:=items||jsonb_build_array(a||jsonb_build_object('id',target_id));
 end loop;
 s:=jsonb_set(s,'{executions}',items);
 a:=s->'deviation';target_id:=(a->>'id')::uuid;
 select status into state from public.kshms_deviations d where d.id=target_id and company_id=c;
 if state='closed' then
  result:=public.kshms_deviation_command(c,'create',(a->'content')||jsonb_build_object('request_id',gen_random_uuid()));
  s:=jsonb_set(s,'{deviation,id}',result->'id');
 end if;
 update public.demo_sandbox_snapshots set payload=s,updated_at=now(),updated_by=u where snapshot_key='people-course-v1';
 return public.demo_kshms_hr_course_preflight();
end$$;
revoke all on function public.demo_kshms_hr_course_preflight(),public.demo_kshms_hr_course_reset() from public,anon,authenticated,service_role;
grant execute on function public.demo_kshms_hr_course_preflight(),public.demo_kshms_hr_course_reset() to authenticated;
notify pgrst,'reload schema';

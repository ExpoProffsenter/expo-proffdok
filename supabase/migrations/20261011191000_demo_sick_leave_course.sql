-- SANDBOX/DEMO ONLY. Add one synthetic, unconfirmed course plan; retain existing cases.
-- Requires the dedicated golden course and all email transports disabled.
do $$declare s jsonb;course jsonb;c uuid;u uuid;member uuid;e hr_private.employees%rowtype;
 t hr_private.conversation_templates%rowtype;tpl jsonb;r jsonb;answers jsonb;cid uuid:=gen_random_uuid();begin
 select payload into s from public.demo_sandbox_snapshots where snapshot_key='people-course-v1' for update;
 select payload into course from public.demo_sandbox_snapshots where snapshot_key='conversation-course-v1';
 c:=(s->>'company_id')::uuid;u:=(s->>'user_id')::uuid;
 if s is null or course is null or not exists(select 1 from public.demo_sandbox_snapshots where snapshot_key='golden-v1')
 or not exists(select 1 from public.profiles where id=u and email='demo@expo-proffdok.no' and approved and not coalesce(deactivated,false))
 or not exists(select 1 from hr_private.runtime_state where singleton and content_enabled and not restore_quarantined)
 or exists(select 1 from kshms_private.email_worker_settings where enabled)
 or exists(select 1 from hr_private.deletion_alert_settings where enabled)
 or exists(select 1 from hr_private.followup_settings where enabled)
 then raise exception 'Dedicated Sandbox course with open HR and disabled email required';end if;
 if exists(select 1 from public.demo_sandbox_snapshots where snapshot_key='sick-leave-course-v1') then return;end if;
 select * into e from hr_private.employees where id=(course->>'employee_id')::uuid and company_id=c;
 member:=e.user_id;
 if e.id is null or e.leader_id is distinct from u
 or not exists(select 1 from public.profiles where id=member and email='demo.ansatt2@expo-proffdok.invalid' and approved and not coalesce(deactivated,false))
 then raise exception 'Existing synthetic employee and course leader required';end if;
 if exists(select 1 from hr_private.sick_leave_cases sc join hr_private.artifacts a on a.id=sc.current_artifact_id where sc.company_id=c and sc.employee_id=e.id and a.payload->>'case_status'='active')
 then raise exception 'Do not overwrite an existing active employee case';end if;
 select ct.* into t from hr_private.conversation_templates ct join jsonb_array_elements(s->'templates') item on ct.id=(item->>'id')::uuid
 where ct.company_id=c and not ct.archived and item#>>'{content,kind}'='sickleave';
 select content into tpl from hr_private.conversation_template_versions where template_id=t.id and company_id=c and revision=t.revision;
 if tpl->>'kind' is distinct from 'sickleave' or tpl->>'title' not like 'DEMO – %' then raise exception 'Dedicated DEMO sick-leave template required';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 r:=public.hr_sick_leave_start(c,e.id,e.revision,cid,t.id,t.revision,current_date-21,'partial');
 perform set_config('request.jwt.claim.sub',member::text,true);
 select jsonb_object_agg(q->>'id','DEMO – Fiktivt innspill: avtal kontakt og prøv tilpassede arbeidsoppgaver sammen. Ingen diagnose eller virkelige personalopplysninger.') into answers from jsonb_array_elements(tpl->'questions') q where q->>'phase'='preparation';
 r:=public.hr_sick_leave_command(c,e.id,e.revision,cid,1,'preparation',jsonb_build_object('answers',answers));
 r:=public.hr_sick_leave_command(c,e.id,e.revision,cid,2,'share');
 perform set_config('request.jwt.claim.sub',u::text,true);
 select jsonb_object_agg(q->>'id','DEMO – Fiktiv plan: avklar egnede oppgaver og kontaktform sammen. Vurder tiltakene ved neste oppfølging. Dette er en ubekreftet kurskladd.') into answers from jsonb_array_elements(tpl->'questions') q where q->>'phase'='meeting';
 r:=public.hr_sick_leave_command(c,e.id,e.revision,cid,3,'meeting',jsonb_build_object('answers',answers,'actions',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'task','DEMO – Avklar tilpassede arbeidsoppgaver med leder','owner_id',member,'due_on',current_date+7,'done',false)),'next_on',current_date+7));
 insert into public.demo_sandbox_snapshots(snapshot_key,payload,updated_by) values('sick-leave-course-v1',jsonb_build_object('company_id',c,'user_id',u,'employee_id',e.id,'case_id',cid,'synthetic',true),u);
end$$;

create or replace function public.demo_kshms_hr_course_preflight() returns jsonb
language plpgsql security definer set search_path='' as $$
declare s jsonb;c uuid;checks jsonb;templates integer;sja_ok boolean;execution_count integer;checklist_ok boolean;ruh_ok boolean;safe boolean;shape_ok boolean;sample_ok boolean;sick_ok boolean;course jsonb;sick jsonb;
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
 shape_ok:=jsonb_typeof(s#>'{sja,content}')='object' and jsonb_typeof(s#>'{checklist,content}')='object'
 and not exists(select 1 from jsonb_array_elements(coalesce(s->'templates','[]')) a where jsonb_typeof(a->'content') is distinct from 'object')
 and not exists(select 1 from jsonb_array_elements(coalesce(s->'executions','[]')) a where jsonb_typeof(a->'content') is distinct from 'object');
 safe:=exists(select 1 from kshms_private.email_worker_settings where singleton and not enabled)
 and exists(select 1 from hr_private.deletion_alert_settings where singleton and not enabled)
 and exists(select 1 from hr_private.followup_settings where singleton and not enabled)
 and exists(select 1 from hr_private.runtime_state where singleton and content_enabled and not restore_quarantined)
 and not exists(select 1 from hr_private.files where company_id=c);
 select payload into course from public.demo_sandbox_snapshots where snapshot_key='conversation-course-v1';
 sample_ok:=exists(select 1 from hr_private.employees e
 join public.profiles p on p.id=e.user_id
 join hr_private.conversations cv on cv.employee_id=e.id and cv.company_id=c
 join hr_private.artifacts a on a.id=cv.current_artifact_id and a.company_id=c
 where e.id=(course->>'employee_id')::uuid and cv.id=(course->>'conversation_id')::uuid
 and e.company_id=c and e.leader_id=auth.uid() and e.user_id='d0000000-0000-4000-8000-000000000103'::uuid
 and p.email='demo.ansatt2@expo-proffdok.invalid' and p.approved and not coalesce(p.deactivated,false)
 and hr_private.active_member(c,e.user_id) and hr_private.active_member(c,e.leader_id)
 and exists(select 1 from hr_private.module_access m where m.company_id=c and m.user_id=e.user_id and m.enabled)
 and exists(select 1 from hr_private.module_access m where m.company_id=c and m.user_id=e.leader_id and m.enabled)
 and a.payload#>>'{template,title}' like 'DEMO – %' and (a.payload->>'shared')::boolean
 and a.payload->>'stage' in('meeting','awaiting','completed'));

 select payload into sick from public.demo_sandbox_snapshots where snapshot_key='sick-leave-course-v1';
 sick_ok:=exists(select 1 from hr_private.sick_leave_cases cv
 join hr_private.employees e on e.id=cv.employee_id and e.company_id=cv.company_id
 join public.profiles p on p.id=e.user_id
 join hr_private.artifacts a on a.id=cv.current_artifact_id and a.company_id=c
 where cv.id=(sick->>'case_id')::uuid and cv.employee_id=(sick->>'employee_id')::uuid and cv.company_id=c
 and e.leader_id=auth.uid() and e.user_id='d0000000-0000-4000-8000-000000000103'::uuid
 and p.email='demo.ansatt2@expo-proffdok.invalid' and p.approved and not coalesce(p.deactivated,false)
 and hr_private.active_member(c,e.user_id) and hr_private.active_member(c,e.leader_id)
 and exists(select 1 from hr_private.module_access m where m.company_id=c and m.user_id=e.user_id and m.enabled)
 and exists(select 1 from hr_private.module_access m where m.company_id=c and m.user_id=e.leader_id and m.enabled)
 and a.payload#>>'{template,title}' like 'DEMO – %' and a.payload->>'type'='sickleave'
 and (a.payload->>'shared')::boolean and a.payload->>'stage' in('meeting','awaiting','completed')
 and a.payload->>'case_status' in('active','closed') and a.payload->'milestones' ?& array['plan','meeting1','activity','meeting2']);

 checks:=jsonb_build_array(
 jsonb_build_object('key','course_hr_templates','ok',templates=3,'detail',templates||'/3 generelle HR-maler med bevart originalutgave'),
 jsonb_build_object('key','course_safety_examples','ok',sja_ok and execution_count=2 and checklist_ok and ruh_ok and shape_ok,'detail','SJA, vernerunde, risiko, sjekkliste og RUH er lagret i demofirmaet'),
 jsonb_build_object('key','course_privacy_transport','ok',safe,'detail','Ingen KS/HMS-, HR-slette- eller fristmail; samtaler åpne, ingen HR-filer'),
 jsonb_build_object('key','course_hr_conversation','ok',sample_ok,'detail','Fiktiv medarbeider og leder med delt DEMO-samtale'),
 jsonb_build_object('key','course_sick_leave','ok',sick_ok,'detail','Fiktiv sykefraværsplan med frister og ubekreftet møtekladd'));
 return jsonb_build_object('ok',templates=3 and sja_ok and execution_count=2 and checklist_ok and ruh_ok and shape_ok and safe and sample_ok and sick_ok,'checks',checks);
end$$;

notify pgrst,'reload schema';

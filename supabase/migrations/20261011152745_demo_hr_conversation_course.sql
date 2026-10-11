-- SANDBOX/DEMO ONLY. Intentional course contract update after approved #220.
-- No Production target: requires the existing golden/course snapshots and exact synthetic identities.
-- Existing employee/contact answers are retained. Only a new synthetic example is added.
do $$declare s jsonb;c uuid;u uuid;member uuid:='d0000000-0000-4000-8000-000000000103';
 e jsonb;eid uuid;cid uuid:=gen_random_uuid();t jsonb;tpl jsonb;r jsonb;answers jsonb;begin
 select payload into s from public.demo_sandbox_snapshots where snapshot_key='people-course-v1' for update;
 c:=(s->>'company_id')::uuid;u:=(s->>'user_id')::uuid;
 if s is null or not exists(select 1 from public.demo_sandbox_snapshots where snapshot_key='golden-v1')
 or not exists(select 1 from public.profiles where id=u and email='demo@expo-proffdok.no' and approved and not coalesce(deactivated,false))
 or not exists(select 1 from public.profiles where id=member and email='demo.ansatt2@expo-proffdok.invalid' and approved and not coalesce(deactivated,false))
 then raise exception 'Existing dedicated synthetic Sandbox course required';end if;
 if exists(select 1 from public.demo_sandbox_snapshots where snapshot_key='conversation-course-v1') then return;end if;
 if exists(select 1 from hr_private.employees where company_id=c and user_id=member) then raise exception 'Do not overwrite an existing employee';end if;
 if not exists(select 1 from hr_private.runtime_state where singleton and content_enabled and not restore_quarantined)
 or exists(select 1 from kshms_private.email_worker_settings where enabled)
 or exists(select 1 from hr_private.deletion_alert_settings where enabled)
 then raise exception 'Open conversation gate and disabled Sandbox mail required';end if;
 select a into t from jsonb_array_elements(s->'templates') a where a#>>'{content,kind}'='annual';
 tpl:=t->'content';
 perform set_config('request.jwt.claim.sub',u::text,true);
 e:=public.people_modules_user_get(c,member);
 perform public.people_modules_user_set(c,member,e,(e->>'kshms')::boolean,e->>'kshms_role',true);
 e:=public.hr_employee_command(c,'create',jsonb_build_object('user_id',member,'leader_id',u));eid:=(e#>>'{employee,id}')::uuid;
 r:=public.hr_conversation_start(c,eid,1,cid,(t->>'id')::uuid,1,current_date);
 perform set_config('request.jwt.claim.sub',member::text,true);
 select jsonb_object_agg(q->>'id','DEMO – Fiktivt svar: vi ønsker tydelige oppgaver, godt samarbeid og mer øvelse. Ingen virkelige personalopplysninger.') into answers from jsonb_array_elements(tpl->'questions') q where q->>'phase'='preparation';
 r:=public.hr_conversation_command(c,eid,1,cid,1,'preparation',jsonb_build_object('answers',answers));
 r:=public.hr_conversation_command(c,eid,1,cid,2,'share');
 perform set_config('request.jwt.claim.sub',u::text,true);
 select jsonb_object_agg(q->>'id','DEMO – Fiktivt møtereferat: avklar oppgaver sammen og følg opp opplæringen. Dette er en kladd uten bekreftelser.') into answers from jsonb_array_elements(tpl->'questions') q where q->>'phase'='meeting';
 r:=public.hr_conversation_command(c,eid,1,cid,3,'meeting',jsonb_build_object('answers',answers,'actions','[]'::jsonb,'next_on',''));
 insert into public.demo_sandbox_snapshots(snapshot_key,payload,updated_by) values('conversation-course-v1',jsonb_build_object('company_id',c,'user_id',u,'employee_id',eid,'conversation_id',cid,'synthetic',true),u);
end$$;

create or replace function public.demo_kshms_hr_course_preflight() returns jsonb
language plpgsql security definer set search_path='' as $$
declare s jsonb;c uuid;checks jsonb;templates integer;sja_ok boolean;execution_count integer;checklist_ok boolean;ruh_ok boolean;safe boolean;shape_ok boolean;sample_ok boolean;course jsonb;
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

 checks:=jsonb_build_array(
 jsonb_build_object('key','course_hr_templates','ok',templates=3,'detail',templates||'/3 generelle HR-maler med bevart originalutgave'),
 jsonb_build_object('key','course_safety_examples','ok',sja_ok and execution_count=2 and checklist_ok and ruh_ok and shape_ok,'detail','SJA, vernerunde, risiko, sjekkliste og RUH er lagret i demofirmaet'),
 jsonb_build_object('key','course_privacy_transport','ok',safe,'detail','Ingen KS/HMS- eller HR-varselmail; samtaler åpne, ingen HR-filer'),
 jsonb_build_object('key','course_hr_conversation','ok',sample_ok,'detail','Fiktiv medarbeider og leder med delt DEMO-samtale'));
 return jsonb_build_object('ok',templates=3 and sja_ok and execution_count=2 and checklist_ok and ruh_ok and shape_ok and safe and sample_ok,'checks',checks);
end$$;

notify pgrst,'reload schema';

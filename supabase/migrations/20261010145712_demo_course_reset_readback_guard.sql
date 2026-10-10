-- SANDBOX/DEMO ONLY. Repair missing reset readback from untouched course drafts.
do $$declare s jsonb;a jsonb;items jsonb:='[]';r jsonb;u uuid;c uuid;begin
 select payload into s from public.demo_sandbox_snapshots where snapshot_key='people-course-v1' for update;
 if s is null then return;end if;
 u:=(s->>'user_id')::uuid;c:=(s->>'company_id')::uuid;
 if not exists(select 1 from public.profiles where id=u and email='demo@expo-proffdok.no' and approved and not coalesce(deactivated,false)) then raise exception 'Dedicated approved demo user required';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 for a in select value from jsonb_array_elements(s->'executions') loop
  if jsonb_typeof(a->'content') is distinct from 'object' then
   r:=public.kshms_execution_detail(c,(a->>'id')::uuid);
   if r#>>'{record,status}' is distinct from 'draft' or r#>>'{record,content,title}' not like 'DEMO – %' then raise exception 'Untouched demo draft required for reset readback';end if;
   a:=a||jsonb_build_object('content',r#>'{record,content}');
  end if;
  items:=items||jsonb_build_array(a);
 end loop;
 update public.demo_sandbox_snapshots set payload=jsonb_set(s,'{executions}',items),updated_at=now(),updated_by=u where snapshot_key='people-course-v1';
end$$;

create or replace function public.demo_kshms_hr_course_preflight() returns jsonb
language plpgsql security definer set search_path='' as $$
declare s jsonb;c uuid;checks jsonb;templates integer;sja_ok boolean;execution_count integer;checklist_ok boolean;ruh_ok boolean;safe boolean;shape_ok boolean;
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
 and exists(select 1 from hr_private.runtime_state where singleton and not content_enabled and restore_quarantined);
 checks:=jsonb_build_array(
 jsonb_build_object('key','course_hr_templates','ok',templates=3,'detail',templates||'/3 generelle HR-maler med bevart originalutgave'),
 jsonb_build_object('key','course_safety_examples','ok',sja_ok and execution_count=2 and checklist_ok and ruh_ok and shape_ok,'detail','SJA, vernerunde, risiko, sjekkliste og RUH er lagret i demofirmaet'),
 jsonb_build_object('key','course_privacy_transport','ok',safe,'detail','Ingen e-postutsending; personlig HR-innhold er sperret'));
 return jsonb_build_object('ok',templates=3 and sja_ok and execution_count=2 and checklist_ok and ruh_ok and shape_ok and safe,'checks',checks);
end$$;

notify pgrst,'reload schema';

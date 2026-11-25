-- Always run in a rollback transaction, optionally immediately after the migration.
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $qa$
declare c uuid:='e0000000-0000-4000-8000-000000000001';u uuid:=auth.uid();root uuid;aid uuid:=gen_random_uuid();token text:=encode(sha256(convert_to(gen_random_uuid()::text,'UTF8')),'hex');
 s jsonb;baseline jsonb;person jsonb;otherperson jsonb;enter jsonb;exit jsonb;visit uuid;rid uuid;previous jsonb;
begin
 s:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA SELF ROLLBACK','reference','QA-SELF-SMOKE','buildings',jsonb_build_array(jsonb_build_object('name','QA bygg','building_type','house','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts','[1]'::jsonb))))));root:=(s#>>'{root,id}')::uuid;baseline:=public.bolig_workspace(c,'get',root);
 s:=public.bolig_attendance_people(c,root,'add',jsonb_build_object('request_id',gen_random_uuid(),'user_id',u,'name','QA Demo Person'));person:=s#>'{people,0}';
 if jsonb_array_length(public.bolig_my_attendance(c)->'entries')<>0 then raise exception 'Disabled presence card shown';end if;
 perform public.bolig_attendance(c,root,'enable',jsonb_build_object('request_id',gen_random_uuid(),'revision',0,'enabled',true));
 s:=public.bolig_my_attendance(c);if jsonb_array_length(s->'entries')<>1 then raise exception 'Own card not visible';end if;
 enter:=jsonb_build_object('request_id',gen_random_uuid(),'id',person->>'id','revision',1,'visit_id',null);s:=public.bolig_my_attendance(c,'in',enter);visit:=(s#>>'{entries,0,visit,id}')::uuid;
 if visit is null or public.bolig_my_attendance(c,'in',enter)#>>'{entries,0,visit,id}'<>visit::text then raise exception 'Missing stable arrival';end if;
 exit:=jsonb_build_object('request_id',gen_random_uuid(),'id',person->>'id','revision',2,'visit_id',visit);s:=public.bolig_my_attendance(c,'out',exit);
 if s#>>'{entries,0,visit}' is not null or public.bolig_my_attendance(c,'in',enter)#>>'{entries,0,visit}' is not null then raise exception 'Old retry resurrected arrival';end if;
 perform public.bolig_partners(c,root,'create',jsonb_build_object('request_id',gen_random_uuid(),'id',aid,'token',token,'name','QA UE Person','email','qa@example.invalid','organisation','QA UE Firma','kind','ue','days',1,'access_mode','project','features','["progress"]'::jsonb,'reviewed',true));
 s:=public.bolig_attendance_people(c,root,'add',jsonb_build_object('request_id',gen_random_uuid(),'access_id',aid));select x into otherperson from jsonb_array_elements(s->'people') x where x->>'access_id'=aid::text;
 s:=public.bolig_ue_attendance(token);if jsonb_array_length(s->'entries')<>1 or s#>>'{entries,0,name}'<>'QA UE Person' then raise exception 'UE isolation failed';end if;
 begin perform public.bolig_ue_attendance(token,'in',jsonb_build_object('request_id',gen_random_uuid(),'id',person->>'id','revision',3,'visit_id',null));raise exception 'UE wrote internal user';exception when insufficient_privilege then null;end;
 enter:=jsonb_build_object('request_id',gen_random_uuid(),'id',otherperson->>'id','revision',1,'visit_id',null);s:=public.bolig_ue_attendance(token,'in',enter);visit:=(s#>>'{entries,0,visit,id}')::uuid;
 if visit is null then raise exception 'UE arrival missing';end if;
 perform public.bolig_ue_attendance(token,'out',jsonb_build_object('request_id',gen_random_uuid(),'id',otherperson->>'id','revision',2,'visit_id',visit));
 s:=public.bolig_attendance(c,root);if jsonb_array_length(s->'visits')<>2 or jsonb_array_length(s->'events')<>4 then raise exception 'Shared manager ledger missing';end if;
 if public.bolig_workspace(c,'get',root)<>baseline then raise exception 'Existing project mutated';end if;
 begin perform 1 from bolig_private.attendance_people;raise exception 'Direct table read allowed';exception when insufficient_privilege then null;end;
 perform public.bolig_partners(c,root,'revoke',jsonb_build_object('request_id',gen_random_uuid(),'id',aid));
 begin perform public.bolig_ue_attendance(token);raise exception 'Revoked UE allowed';exception when insufficient_privilege then null;end;
end;$qa$;
reset role;

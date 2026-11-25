begin;
set local lock_timeout='3s';
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $qa$
declare c uuid:='e0000000-0000-4000-8000-000000000001';r jsonb;b jsonb;s jsonb;p jsonb;root uuid;visit uuid:=gen_random_uuid();
begin
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA ATTENDANCE ROLLBACK','reference','QA-ATTENDANCE-SMOKE','buildings',jsonb_build_array(jsonb_build_object('name','QA bygg','building_type','house','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts','[1]'::jsonb))))));root:=(r#>>'{root,id}')::uuid;b:=public.bolig_workspace(c,'get',root);
 s:=public.bolig_attendance(c,root);if s->>'enabled'<>'false' then raise exception 'Must default off';end if;
 s:=public.bolig_attendance(c,root,'enable',jsonb_build_object('request_id',gen_random_uuid(),'revision',0,'enabled',true,'day','2026-01-15'));
 p:=jsonb_build_object('request_id',gen_random_uuid(),'revision',1,'id',visit,'name','QA Person','company','QA Firma','arrived','2026-01-15T07:00','departed','','day','2026-01-15');
 s:=public.bolig_attendance(c,root,'visit',p);if jsonb_array_length(s->'visits')<>1 or s->>'receipt_id'<>p->>'request_id' then raise exception 'Missing visit receipt';end if;
 if public.bolig_attendance(c,root,'visit',p)<>s then raise exception 'Replay mismatch';end if;
 begin perform public.bolig_attendance(c,root,'visit',p||jsonb_build_object('name','Changed'));raise exception 'Changed replay allowed';exception when sqlstate 'PT409' then null;end;
 p:=p||jsonb_build_object('request_id',gen_random_uuid(),'revision',2,'departed','2026-01-15T15:00','reason','Glemt utregistrering');s:=public.bolig_attendance(c,root,'visit',p);
 if jsonb_array_length(s->'events')<>2 or s#>>'{events,0,before_value,departed_at}' is not null then raise exception 'Original history lost';end if;
 if public.bolig_workspace(c,'get',root)<>b then raise exception 'Existing project changed';end if;
 begin perform 1 from bolig_private.attendance_visits;raise exception 'Direct read allowed';exception when insufficient_privilege then null;end;
end;$qa$;
rollback;

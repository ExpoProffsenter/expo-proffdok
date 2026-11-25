-- Synthetic cloud SQL smoke; all rows (including mail preparation) roll back.
-- This checks real gateways/RLS, not Storage bytes or email delivery.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';r jsonb;s jsonb;root uuid;unit uuid;block uuid;checkid uuid;pid uuid:=gen_random_uuid();remarks jsonb;protocol uuid;confirmation uuid;mail jsonb;rid uuid:=gen_random_uuid();path text;doc uuid;completion jsonb;
begin
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA NATIVE SMOKE - ROLLBACK','reference','QA-SMOKE','buildings',jsonb_build_array(jsonb_build_object('name','Bygg A','building_type','apartment','address','Syntetisk gate 1','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','Syntetisk gate 1','counts','[1]'::jsonb))))));
 root:=(r#>>'{root,id}')::uuid;unit:=(r#>>'{units,0,id}')::uuid;block:=(r#>>'{blocks,0,id}')::uuid;
 s:=public.bolig_quality(c,root,unit);
 if s->>'kind'<>'unit' or (s->>'revision')::int<>0 or s#>>'{context,user_id}'<>auth.uid()::text then raise exception 'Wrong scoped context';end if;
 s:=public.bolig_quality(c,root,unit,'check_add',0,jsonb_build_object('content',jsonb_build_object('title','Native kontroll','trade','Felles – alle fag','instructions','Syntetisk kontroll','points',jsonb_build_array(jsonb_build_object('id',pid,'title','Funksjon kontrollert','guidance','','image_required',false,'comment_required',true)))));
 checkid:=(s#>>'{data,checks,0,id}')::uuid;
 completion:=public.bolig_completion(c,root,unit);
 if not exists(select 1 from jsonb_array_elements(completion->'rows') x cross join lateral jsonb_array_elements_text(x->'issues') issue where x->>'scope_id'=unit::text and issue like '%ikke fullført i Boligprosjekter%') then raise exception 'Native checklist did not block completion';end if;
 s:=public.bolig_quality(c,root,unit,'check_save',(s->>'revision')::bigint,jsonb_build_object('id',checkid,'complete',true,'answers',jsonb_build_object(pid::text,jsonb_build_object('status','OK','comment','Faktisk gateway testet','values','{}'::jsonb,'documents','[]'::jsonb))));
 if s#>>'{data,checks,0,status}'<>'completed' then raise exception 'Checklist not completed';end if;
 begin perform public.bolig_quality(c,root,unit,'check_save',(s->>'revision')::bigint,jsonb_build_object('id',checkid,'complete',false,'answers','{}'::jsonb));raise exception 'Completed edit accepted';exception when sqlstate 'PT409' then null;end;
 path:=c::text||'/'||root::text||'/'||unit::text||'/'||gen_random_uuid()::text||'.pdf';
 insert into storage.objects(bucket_id,name,metadata) values('bolig-documents',path,'{"mimetype":"application/pdf","size":100}');
 remarks:=jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'text','Syntetisk justering','evidence','Justert og kontrollert','rectified',true,'documents','[]'::jsonb));
 s:=public.bolig_quality(c,root,unit,'protocol_add',(s->>'revision')::bigint,jsonb_build_object('title','Ekstern syntetisk protokoll','file',jsonb_build_object('path',path,'name','qa-protokoll.pdf','title','QA Protokoll','kind','protocol'),'remarks',remarks,'no_remarks',''));
 protocol:=(s#>>'{data,protocols,0,id}')::uuid;doc:=(s#>>'{data,documents,0,id}')::uuid;
 if s#>>'{data,protocols,0,document_id}'<>doc::text then raise exception 'Atomic original not linked';end if;
 s:=public.bolig_quality(c,root,unit,'protocol_confirm',(s->>'revision')::bigint,jsonb_build_object('id',protocol,'reason','Syntetiske merknader kontrollert og rettet'));
 confirmation:=(s#>>'{data,protocols,0,confirmation,id}')::uuid;
 mail:=public.bolig_protocol_mail(c,root,unit,'prepare',jsonb_build_object('protocol_id',protocol,'confirmation_id',confirmation,'request_id',rid,'to','qa@example.invalid'));
 if (mail->>'sent')::boolean or mail->>'begun_at' is not null or mail#>>'{snapshot,to}'<>'qa@example.invalid' then raise exception 'Prepare unexpectedly sent or changed recipient';end if;
 mail:=public.bolig_protocol_mail(c,root,unit,'begin',jsonb_build_object('request_id',rid));
 if mail->>'begun_at' is null then raise exception 'Claim not persisted';end if;
 begin perform public.bolig_protocol_mail_complete(rid,'fake-provider');raise exception 'Authenticated acknowledged provider';exception when insufficient_privilege then null;end;
 if public.bolig_quality(c,root,block)->>'kind'<>'block' or public.bolig_quality(c,root,root)->>'kind'<>'project' then raise exception 'Wrong common scopes';end if;
 begin perform public.bolig_quality(c,root,gen_random_uuid());raise exception 'Foreign scope accepted';exception when insufficient_privilege then null;end;
 raise notice 'PASS cloud native quality: checklist, frozen run, completion blocker, atomic protocol/RLS, rectification identity, canonical email prepare/claim, service-only ack, unit/block/project scope. All rollback.';
end$$;
select 'PASS cloud native quality gateways/RLS; all synthetic writes rolled back' as native_quality_smoke;
rollback;

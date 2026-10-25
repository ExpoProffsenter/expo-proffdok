-- Native Sandbox authorization and gateways; all metadata writes roll back.
begin;
set local lock_timeout='3s';
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $qa$
declare c uuid:='e0000000-0000-4000-8000-000000000001';r jsonb;s jsonb;before_root jsonb;p jsonb;first_result jsonb;
 root uuid;block uuid;unit uuid;room uuid:=gen_random_uuid();sheet uuid:=gen_random_uuid();attempt uuid:=gen_random_uuid();path text;
begin
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA VISUAL ROLLBACK','reference','QA-VISUAL-SMOKE','buildings',jsonb_build_array(jsonb_build_object('name','QA bildebygg','building_type','apartment','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts','[2]'::jsonb))))));
 root:=(r#>>'{root,id}')::uuid;block:=(r#>>'{blocks,0,id}')::uuid;unit:=(r#>>'{units,0,id}')::uuid;
 before_root:=public.bolig_workspace(c,'get',root);
 s:=public.bolig_visuals(c,root,block);
 if jsonb_array_length(s->'targets')<>2 or s->'sheets'<>'[]'::jsonb then raise exception 'Wrong visual scope';end if;
 path:=c::text||'/'||root::text||'/'||block::text||'/'||gen_random_uuid()::text||'.jpg';
 insert into storage.objects(bucket_id,name) values('bolig-project-visuals',path);
 p:=jsonb_build_object('request_id',attempt,'sheet_id',sheet,'title','QA fasade','path',path,'width',1200,'height',800,'archived',false,'basis',s->>'basis','markers',jsonb_build_array(jsonb_build_object('id',unit,'x',.1,'y',.2,'w',.1,'h',.1)));
 first_result:=public.bolig_visuals(c,root,block,'publish',0,p);
 if first_result->>'receipt_id'<>attempt::text or (first_result->>'receipt_revision')::int<>1 then raise exception 'Missing visual receipt';end if;
 if public.bolig_visuals(c,root,block,'publish',0,p)<>first_result then raise exception 'Exact visual replay changed';end if;
 if public.bolig_workspace(c,'get',root)<>before_root then raise exception 'Visual changed existing structure';end if;
 begin perform public.bolig_visuals(c,root,block,'publish',0,p||jsonb_build_object('title','Changed retry'));raise exception 'Changed visual replay accepted';exception when sqlstate 'PT409' then null;end;
 begin perform public.bolig_visuals(c,root,block,'publish',1,p||jsonb_build_object('request_id',gen_random_uuid(),'markers',jsonb_build_array(jsonb_build_object('id',room,'x',.1,'y',.2,'w',.1,'h',.1))));raise exception 'Foreign marker accepted';exception when sqlstate 'PT409' then null;end;
 s:=public.bolig_rooms(c,root,unit,'save',0,jsonb_build_object('id',room,'name','Bad 1','type','bathroom','floor','1'));
 s:=public.bolig_visuals(c,root,unit);
 if jsonb_array_length(s->'targets')<>1 or s#>>'{targets,0,id}'<>room::text then raise exception 'Wrong room marker scope';end if;
 begin perform public.bolig_visuals(c,root,unit,'publish',0,p||jsonb_build_object('request_id',gen_random_uuid(),'sheet_id',gen_random_uuid(),'basis',s->>'basis'));raise exception 'Other scope file accepted';exception when insufficient_privilege then null;end;
 if not public.bolig_visual_file_access(path,false) then raise exception 'Manager cannot read saved visual';end if;
end$qa$;
rollback;
select 'PASS – native Sandbox visual scope, room IDs, immutable version, exact retry, foreign marker/file rejection and unchanged structure; all writes rolled back' result;

-- Sandbox pilot only. Native UE copy/answers/audit are rolled back. No email.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $test$
declare c uuid:='e0000000-0000-4000-8000-000000000001';s jsonb;p jsonb;r jsonb;root uuid;unit uuid;point uuid:=gen_random_uuid();token text:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');a uuid:=gen_random_uuid();
begin
 -- Build an independent source: user testing can add required fields or change
 -- the order of checklists in the shared pilot, which must not be reset by QA.
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','QA UE – rollback','reference','QA-UE-ROLLBACK','buildings',jsonb_build_array(jsonb_build_object('name','QA Bygg','building_type','apartment','address','','house_floors',1,'entrances',jsonb_build_array(jsonb_build_object('address','','counts','[1]'::jsonb))))));
 root:=(r#>>'{root,id}')::uuid;unit:=(r#>>'{units,0,id}')::uuid;
 s:=public.bolig_quality(c,root,unit,'check_add',0,jsonb_build_object('required',false,'content',jsonb_build_object('title','QA UE kilde','trade','Felles – alle fag','instructions','Kun fiktiv test','points',jsonb_build_array(jsonb_build_object('id',point,'title','Funksjon kontrollert','guidance','','image_required',false,'comment_required',false)))));
 perform set_config('qa.ue.root',root::text,true);perform set_config('qa.ue.scope',unit::text,true);perform set_config('qa.ue.source',(s#>'{data,checks,0}')::text,true);
 p:=jsonb_build_object('id',a,'request_id',gen_random_uuid(),'name','QA UE ROLLBACK','email','ue@qa.invalid','organisation','QA UE Firma','kind','ue','days',7,'token',token,'access_mode','project','features',jsonb_build_array('checklists','quality_write'),'reviewed',true);
 s:=public.bolig_partners(c,root,'create',p);
 perform set_config('qa.ue.token',token,true);perform set_config('qa.ue.grant',a::text,true);
end$test$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $test$
declare token text:=current_setting('qa.ue.token');s jsonb;p jsonb;r jsonb;own jsonb;answer jsonb;file jsonb;copied uuid:=gen_random_uuid();
begin
 s:=public.bolig_partner_portal(token);
 p:=jsonb_build_object('id',copied,'request_id',gen_random_uuid(),'scope_id',s#>>'{checklists,0,scope_id}','source_id',s#>>'{checklists,0,id}','source_scope_id',s#>>'{checklists,0,scope_id}');
 r:=public.bolig_partner_quality(token,'check_add',p);
 if jsonb_array_length(r#>'{quality,checks}')<>1 or public.bolig_partner_quality(token,'check_add',p) is distinct from r then raise exception 'Copy replay failed';end if;
 own:=r#>'{quality,checks,0}';
 answer:=jsonb_build_object('id',copied,'scope_id',own->>'scope_id','revision',own->'revision','request_id',gen_random_uuid(),'answers',jsonb_build_object(own#>>'{record,definition,points,0,id}',jsonb_build_object('status','OK','comment','QA UE kontrollert')),'complete',true);
 r:=public.bolig_partner_quality(token,'check_save',answer);
 if r#>>'{quality,checks,0,record,status}'<>'completed' or public.bolig_partner_quality(token,'check_save',answer) is distinct from r or r#>>'{quality,checks,0,record,completed_partner_id}'<>current_setting('qa.ue.grant') or r#>>'{quality,checks,0,record,completed_by}' is not null then raise exception 'Native external identity/replay failed';end if;
 file:=jsonb_build_object('id',gen_random_uuid(),'scope_id',own->>'scope_id','name','qa.pdf','mime','application/pdf','size',20,'sha256',repeat('a',64));
 r:=public.bolig_partner_quality(token,'file_prepare',file);
 if r->>'path' is null then raise exception 'File reservation failed';end if;
 begin perform public.bolig_partner_quality(token,'document',jsonb_build_object('id',file->>'id','scope_id',own->>'scope_id','request_id',gen_random_uuid(),'title','Uten fil'));raise exception 'Unuploaded file accepted';exception when invalid_parameter_value then null;end;
 begin perform public.bolig_partner_quality(token,'file_get',jsonb_build_object('id',file->>'id'));raise exception 'Unregistered file readable';exception when insufficient_privilege then null;end;
end$test$;
reset role;
do $test$begin
 if (select count(*) from bolig_private.quality_events where partner_id=current_setting('qa.ue.grant')::uuid and actor_id is null)<>2 then raise exception 'Native external audit missing';end if;
 if (select original.node from bolig_private.quality_states q cross join lateral jsonb_array_elements(q.data->'checks') as original(node) where q.root_id=current_setting('qa.ue.root')::uuid and q.scope_id=current_setting('qa.ue.scope')::uuid and original.node->>'id'=current_setting('qa.ue.source')::jsonb->>'id') is distinct from current_setting('qa.ue.source')::jsonb then raise exception 'Original changed';end if;
end$test$;
rollback;
select 'PASS – real native UE copy/save/replay, external audit without issuer impersonation, original unchanged, upload reservation and unuploaded/unregistered denial; all rolled back' result;

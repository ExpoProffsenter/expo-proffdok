-- Sandbox pilot only. No email; every temporary grant/response is rolled back.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $smoke$
declare c uuid:='e0000000-0000-4000-8000-000000000001';root uuid:='80821082-c64a-41a9-91cb-db2aa049ed2e';s jsonb;p jsonb;r jsonb;token text:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');a uuid:=gen_random_uuid();
begin
 s:=public.bolig_partners(c,root);
 -- The shared pilot may gain checklists through ordinary user testing. Match
 -- the manager's fresh baseline exactly, rather than assuming it still has one.
 if jsonb_array_length(s->'checklists')=0 then raise exception 'Pilot checklist baseline missing';end if;
 perform set_config('qa.partner.checklist_count',jsonb_array_length(s->'checklists')::text,true);
 p:=jsonb_build_object('id',a,'request_id',gen_random_uuid(),'name','QA Project ROLLBACK','email','partner@qa.invalid','organisation','QA Prosjektpartner','kind','ue','days',7,'access_mode','project','features',jsonb_build_array('progress','checklists','orders'),'supplier_name',s#>>'{suppliers,0}','reviewed',true,'token',token);
 r:=public.bolig_partners(c,root,'create',p);
 if r->>'created_id'<>a::text or public.bolig_partners(c,root,'create',p) is distinct from r then raise exception 'Project grant replay failed';end if;
 perform set_config('qa.partner.token',token,true);perform set_config('qa.partner.access',a::text,true);
end$smoke$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $smoke$
declare token text:=current_setting('qa.partner.token');s jsonb;p jsonb;r jsonb;
begin
 s:=public.bolig_partner_portal(token);
 if s->>'access_mode'<>'project' or (s->>'unit_count')::int<>40 or jsonb_array_length(s->'tasks')<>161 or jsonb_array_length(s->'orders')<>1 or jsonb_array_length(s->'checklists')<>current_setting('qa.partner.checklist_count')::int then raise exception 'Project feature projection failed';end if;
 if (s->'checklists')::text ~ 'by_name|completed_by|answers|comment|documents|fdv|contact_email|values' or s ? 'email' or s ? 'token_hash' then raise exception 'Checklist/privacy filter failed';end if;
 if not exists(select 1 from jsonb_array_elements(s->'checklists') as check_view(node) cross join lateral jsonb_array_elements(check_view.node->'points') as point_view(node) where point_view.node->>'status'='Avvik') then raise exception 'Checklist point status absent';end if;
 p:=jsonb_build_object('request_id',gen_random_uuid(),'kind','order','target_id',s#>>'{orders,0,id}','basis',s#>>'{orders,0,basis}','status','confirmed','date','2026-11-02','reference','QA-ONLY','body','QA syntetisk');
 r:=public.bolig_partner_portal(token,'respond',p);
 if jsonb_array_length(r->'events')<>1 or public.bolig_partner_portal(token,'respond',p) is distinct from r then raise exception 'Project reply replay failed';end if;
 perform set_config('qa.partner.answer',p::text,true);
 begin perform public.bolig_partner_portal(token,'check_save','{}');raise exception 'Checklist write allowed';exception when insufficient_privilege then null;end;
end$smoke$;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $smoke$
declare c uuid:='e0000000-0000-4000-8000-000000000001';root uuid:='80821082-c64a-41a9-91cb-db2aa049ed2e';a uuid:=current_setting('qa.partner.access');s jsonb;p jsonb;r jsonb;
begin
 s:=public.bolig_partners(c,root);select x into r from jsonb_array_elements(s->'partners') x where x->>'id'=a::text;
 p:=jsonb_build_object('id',a,'revision',r->'revision','request_id',gen_random_uuid(),'access_mode','project','features',jsonb_build_array('checklists'),'reviewed',true);
 r:=public.bolig_partners(c,root,'permissions',p);
 if public.bolig_partners(c,root,'permissions',p) is distinct from r then raise exception 'Permission replay failed';end if;
end$smoke$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $smoke$
declare s jsonb;token text:=current_setting('qa.partner.token');
begin
 s:=public.bolig_partner_portal(token);
 if s->'features'<>'["checklists"]' or s->'orders'<>'[]' or s->'tasks'<>'[]' or s->'events'<>'[]' or jsonb_array_length(s->'checklists')<>current_setting('qa.partner.checklist_count')::int then raise exception 'Removed features leaked';end if;
 begin perform public.bolig_partner_portal(token,'respond',current_setting('qa.partner.answer')::jsonb);raise exception 'Removed function replay allowed';exception when insufficient_privilege then null;end;
end$smoke$;
reset role;
rollback;
select 'PASS – project 40 units/161 activities, supplier orders, read-only checklist status, private fields omitted, exact grant/reply/permission replay, removed functions denied before replay; all temporary writes rolled back' result;

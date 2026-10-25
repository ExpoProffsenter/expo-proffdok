-- Isolated real Sandbox transaction: no transport, no retained links or messages.
begin;
set local lock_timeout='3s';
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $qa$
declare s jsonb;p jsonb;token text:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');access uuid:=gen_random_uuid();attempt uuid:=gen_random_uuid();
begin
 s:=public.bolig_partners('e0000000-0000-4000-8000-000000000001','80821082-c64a-41a9-91cb-db2aa049ed2e','create',jsonb_build_object('id',access,'request_id',gen_random_uuid(),'name','QA MAIL ROLLBACK','email','mail-qa@qa.invalid','organisation','QA UE Firma','kind','ue','days',1,'token',token,'access_mode','project','features',jsonb_build_array('checklists'),'reviewed',true));
 s:=public.bolig_partner_mail('e0000000-0000-4000-8000-000000000001','80821082-c64a-41a9-91cb-db2aa049ed2e',access);
 if s->'enabled'<>'false'::jsonb or s#>>'{snapshot,to}'<>'mail-qa@qa.invalid' or s::text like '%'||token||'%' then raise exception 'Unsafe invitation read';end if;
 p:=jsonb_build_object('request_id',attempt,'token',token,'revision',s->'revision','to','mail-qa@qa.invalid');
 s:=public.bolig_partner_mail('e0000000-0000-4000-8000-000000000001','80821082-c64a-41a9-91cb-db2aa049ed2e',access,'prepare',p);
 if s->>'id'<>attempt::text or s#>>'{snapshot,company,companyName}'<>'Expo Proffsenter' or s->'sent'<>'false'::jsonb or s::text like '%'||token||'%' then raise exception 'Unsafe invitation snapshot';end if;
 if public.bolig_partner_mail('e0000000-0000-4000-8000-000000000001','80821082-c64a-41a9-91cb-db2aa049ed2e',access,'prepare',p)<>s then raise exception 'Replay changed snapshot';end if;
 begin perform public.bolig_partner_mail('e0000000-0000-4000-8000-000000000001','80821082-c64a-41a9-91cb-db2aa049ed2e',access,'begin',p);raise exception 'Paused mail claimed';exception when sqlstate 'PT409' then null;end;
 begin perform public.bolig_partner_mail('e0000000-0000-4000-8000-000000000001','80821082-c64a-41a9-91cb-db2aa049ed2e',access,'prepare',p||jsonb_build_object('token',repeat('0',64)));raise exception 'Foreign token accepted';exception when insufficient_privilege then null;end;
 s:=public.bolig_partners('e0000000-0000-4000-8000-000000000001','80821082-c64a-41a9-91cb-db2aa049ed2e','revoke',jsonb_build_object('id',access,'request_id',gen_random_uuid()));
 begin perform public.bolig_partner_mail('e0000000-0000-4000-8000-000000000001','80821082-c64a-41a9-91cb-db2aa049ed2e',access,'prepare',p);raise exception 'Revoked receipt replayed';exception when insufficient_privilege then null;end;
end$qa$;
rollback;
select 'PASS – native invitation recipient/profile, no raw token, exact prepare retry, paused begin, foreign token and revoked replay denied; all rolled back' result;

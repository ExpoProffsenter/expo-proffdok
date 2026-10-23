-- Sandbox only. Existing synthetic pilot preserved; every temporary access/svar rolls back.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $smoke$
declare c uuid:='e0000000-0000-4000-8000-000000000001';root uuid:='80821082-c64a-41a9-91cb-db2aa049ed2e';s jsonb;p jsonb;r jsonb;o jsonb;t jsonb;token text:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');a uuid:=gen_random_uuid();answer jsonb;
begin
 s:=public.bolig_partners(c,root);o:=s#>'{orders,0}';t:=s#>'{tasks,0}';
 if o is null or t is null then raise exception 'Pilot source unavailable';end if;
 p:=jsonb_build_object('id',a,'request_id',gen_random_uuid(),'name','QA Partner ROLLBACK','email','partner@qa.invalid','organisation','QA Leverandør','kind','supplier','days',7,'order_ids',jsonb_build_array(o->>'id'),'task_ids',jsonb_build_array(t->>'id'),'reviewed',true,'token',token,'basis',jsonb_build_object(o->>'id',o->>'basis',t->>'id',t->>'basis'));
 r:=public.bolig_partners(c,root,'create',p);
 if r->>'created_id'<>a::text or public.bolig_partners(c,root,'create',p) is distinct from r then raise exception 'Invalid replay';end if;
 perform set_config('qa.partner.token',token,true);perform set_config('qa.partner.access',a::text,true);
end$smoke$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $smoke$
declare token text:=current_setting('qa.partner.token');s jsonb;p jsonb;r jsonb;
begin
 s:=public.bolig_partner_portal(token);
 if jsonb_array_length(s->'orders')<>1 or jsonb_array_length(s->'tasks')<>1 or s ? 'email' or s ? 'token_hash' then raise exception 'Scope/privacy failed';end if;
 p:=jsonb_build_object('request_id',gen_random_uuid(),'kind','order','target_id',s#>>'{orders,0,id}','basis',s#>>'{orders,0,basis}','status','confirmed','date','2026-11-02','reference','QA-LEV-42','body','QA – syntetisk dato');
 r:=public.bolig_partner_portal(token,'respond',p);
 if jsonb_array_length(r->'events')<>1 or public.bolig_partner_portal(token,'respond',p) is distinct from r then raise exception 'Reply replay failed';end if;
 begin perform public.bolig_partner_portal(token,'document',jsonb_build_object('id',s#>>'{orders,0,id}'));raise exception 'Document action allowed';exception when insufficient_privilege then null;end;
end$smoke$;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.bolig_partners('e0000000-0000-4000-8000-000000000001','80821082-c64a-41a9-91cb-db2aa049ed2e','revoke',jsonb_build_object('id',current_setting('qa.partner.access'),'request_id',gen_random_uuid()))->>'created_id';
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$begin
 begin perform public.bolig_partner_portal(current_setting('qa.partner.token'));raise exception 'Revoked link allowed';exception when insufficient_privilege then null;end;
end$$;
rollback;
select 'PASS – narrow authenticated share, anon read/reply/replay, forbidden document action and revoked access; all temporary writes rolled back' result;

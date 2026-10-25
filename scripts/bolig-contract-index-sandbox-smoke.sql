-- Existing synthetic Sandbox identities; all test changes roll back.
begin;
set local statement_timeout='20s';set local lock_timeout='2s';
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';root uuid;ident uuid:=gen_random_uuid();b jsonb;p jsonb;r jsonb;denied boolean:=false;
begin
 root:=(public.bolig_workspace(c,'create',null,null,'{"title":"QA indeks – rollback","reference":"QA-INDEX-ROLLBACK"}')#>>'{root,id}')::uuid;
 b:=jsonb_build_object('reference','QA hovedkontrakt punkt 8','file_id',null,'series','block_total','base_month','2025-01','target_month','2026-01','base_index',100,'target_index',110,'factor',0.9,'origin','manual','lines',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'kind','base','name','Grunnleveranse til byggherre','amount_cents',100000000,'selected',true),jsonb_build_object('id',gen_random_uuid(),'kind','option','name','Opsjon A','amount_cents',20000000,'selected',false)));
 r:=public.bolig_contract_index(c,root,'preview',jsonb_build_object('basis',b));
 assert (r#>>'{data,calculation,adjustment_cents}')::bigint=9000000,'Selected parts/factor wrong';
 assert jsonb_array_length(public.bolig_contract_index(c,root)->'data'->'reports')=0,'Preview wrote history';
 p:=jsonb_build_object('id',ident,'basis',b,'revision',0);
 r:=public.bolig_contract_index(c,root,'approve',p);
 assert r#>>'{data,report,id}'=ident::text,'Approval receipt wrong';
 assert public.bolig_contract_index(c,root,'approve',p)->'data'->'report'=r->'data'->'report','Retry changed approved record';
 assert jsonb_array_length(public.bolig_contract_index(c,root)->'data'->'reports')=1,'Duplicate approval';
 begin perform 1 from bolig_private.contract_index_reports;exception when insufficient_privilege then denied:=true;end;assert denied,'Raw private table accessible';
 perform public.bolig_contracts(c,root,'grant',jsonb_build_object('user_id','d0000000-0000-4000-8000-000000000101','role','reader','revision',0));
 perform set_config('qa.index.root',root::text,true);perform set_config('qa.index.report',ident::text,true);perform set_config('qa.index.payload',p::text,true);
end$$;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000101',true);
set local role authenticated;
do $$declare c uuid:='e0000000-0000-4000-8000-000000000001';root uuid:=current_setting('qa.index.root')::uuid;denied boolean:=false;
begin
 assert public.bolig_contract_index(c,root,'report',jsonb_build_object('id',current_setting('qa.index.report')))#>>'{data,report,revision}'='1','Reader history missing';
 begin perform public.bolig_contract_index(c,root,'approve',current_setting('qa.index.payload')::jsonb);exception when insufficient_privilege then denied:=true;end;assert denied,'Reader can approve';
end$$;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.bolig_contracts('e0000000-0000-4000-8000-000000000001',current_setting('qa.index.root')::uuid,'grant',jsonb_build_object('user_id','d0000000-0000-4000-8000-000000000101','role','none','revision',1))->>'allowed' grant_saved;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000101',true);
set local role authenticated;
do $$declare denied boolean:=false;begin
 begin perform public.bolig_contract_index('e0000000-0000-4000-8000-000000000001',current_setting('qa.index.root')::uuid);exception when insufficient_privilege then denied:=true;end;assert denied,'Revoked reader can read amounts';
end$$;
reset role;set local role anon;
do $$declare denied boolean:=false;begin
 begin perform public.bolig_contract_index('e0000000-0000-4000-8000-000000000001',current_setting('qa.index.root')::uuid);exception when insufficient_privilege then denied:=true;end;assert denied,'Anonymous index RPC accessible';
end$$;
select 'PASS native contract index: selected parts, factor, preview, approval, exact retry, reader/write/table/anon gates and revocation; all synthetic changes rollback' result;
rollback;

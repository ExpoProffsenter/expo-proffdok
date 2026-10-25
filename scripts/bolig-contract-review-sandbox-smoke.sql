-- Existing synthetic Sandbox actors only. No actual contract or Storage bytes.
-- All temporary root/ACL/version/Storage metadata rows roll back.
begin;
set local statement_timeout='20s';set local lock_timeout='2s';
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';root uuid;doc uuid:=gen_random_uuid();fid uuid:=gen_random_uuid();r jsonb;p jsonb;path text;
begin
 r:=public.bolig_workspace(c,'create',null,null,jsonb_build_object('title','QA privat kontraktsområde – rollback','reference','QA-CONTRACT-ROLLBACK'));
 root:=(r#>>'{root,id}')::uuid;
 r:=public.bolig_contracts(c,root);assert r->>'allowed'='true' and r->>'manage'='true','Creator contract management missing';
 p:=jsonb_build_object('id',fid,'document_id',doc,'revision',0,'title','QA original','kind','contract','name','qa-original.pdf','mime','application/pdf','size',100,'sha256',repeat('a',64),'comment','Synthetic metadata only');
 r:=public.bolig_contracts(c,root,'prepare',p);path:=r->>'path';
 assert public.bolig_contracts(c,root)->'documents'='[]'::jsonb,'Unfinished file leaked in list';
 perform set_config('qa.contract.root',root::text,true);perform set_config('qa.contract.file',fid::text,true);perform set_config('qa.contract.doc',doc::text,true);perform set_config('qa.contract.path',path,true);
end$$;
reset role;
insert into storage.objects(bucket_id,name,metadata) values('bolig-contracts',current_setting('qa.contract.path'),'{"size":100,"mimetype":"application/pdf"}');
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';root uuid:=current_setting('qa.contract.root')::uuid;fid uuid:=current_setting('qa.contract.file')::uuid;r jsonb;denied boolean:=false;
begin
 assert not exists(select 1 from storage.objects where bucket_id='bolig-contracts'),'Creator can directly read Storage';
 r:=public.bolig_contracts(c,root,'finish',jsonb_build_object('id',fid));assert r->>'receipt_id'=fid::text and r#>>'{file,version}'='1','Native upload receipt missing';
 assert public.bolig_contracts(c,root,'finish',jsonb_build_object('id',fid))->'file'=r->'file','Exact retry changed version';
 assert jsonb_array_length(public.bolig_contracts(c,root,'history',jsonb_build_object('document_id',current_setting('qa.contract.doc')))->'versions')=1,'Native version history missing';
 perform public.bolig_contracts(c,root,'grant',jsonb_build_object('user_id','d0000000-0000-4000-8000-000000000101','role','reader','revision',0));
 begin perform 1 from bolig_private.contract_files;exception when insufficient_privilege then denied:=true;end;assert denied,'Private table accessible';
end$$;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';root uuid:=current_setting('qa.contract.root')::uuid;tid uuid:=gen_random_uuid();job uuid:=gen_random_uuid();r jsonb;v jsonb;denied boolean:=false;
begin
 r:=public.bolig_contract_review(c,root,'save_text',jsonb_build_object('id',tid,'file_id',current_setting('qa.contract.file'),'pages',jsonb_build_array(jsonb_build_object('number',1,'text','Endringer skal varsles skriftlig før arbeidet starter.','method','pdf','confidence',null))));
 assert r#>>'{data,id}'=tid::text,'Native text receipt missing';
 assert jsonb_array_length(public.bolig_contract_review(c,root,'search','{"query":"varsles"}')->'data'->'matches')=1,'Native private search missing';
 perform public.bolig_contract_review(c,root,'begin',jsonb_build_object('id',job,'text_ids',jsonb_build_array(tid),'question','Hva står om varsling?'));
 v:=jsonb_build_object('findings',jsonb_build_array(jsonb_build_object('kind','requirement','topic','notification','title','QA varsel','explanation','Kontroller formuleringen i originalen.','sources',jsonb_build_array(jsonb_build_object('text_id',tid,'page',1,'quote','Endringer skal varsles skriftlig')))),'not_found','[]'::jsonb,'limitations',jsonb_build_array('Syntetisk forslag, ikke faktisk modellkjøring.'));
 r:=public.bolig_contract_review(c,root,'finish',jsonb_build_object('id',job,'result',v));assert r#>>'{data,state}'='ready','Native saved review missing';
 begin perform 1 from bolig_private.contract_texts;exception when insufficient_privilege then denied:=true;end;assert denied,'Raw text table accessible';
 denied:=false;begin perform 1 from bolig_private.contract_reviews;exception when insufficient_privilege then denied:=true;end;assert denied,'Raw review table accessible';
 perform set_config('qa.contract.text',tid::text,true);perform set_config('qa.contract.review',job::text,true);
end$$;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000101',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';root uuid:=current_setting('qa.contract.root')::uuid;r jsonb;denied boolean:=false;
begin
 r:=public.bolig_contracts(c,root);assert r->>'allowed'='true' and r->>'manage'='false','Explicit reader role missing';
 assert public.bolig_contracts(c,root,'file',jsonb_build_object('id',current_setting('qa.contract.file')))->>'path'=current_setting('qa.contract.path'),'Reader file gate missing';
 begin perform public.bolig_contracts(c,root,'grant',jsonb_build_object('user_id','d0000000-0000-4000-8000-000000000102','role','manager','revision',0));exception when insufficient_privilege then denied:=true;end;assert denied,'Reader can delegate';
 assert not exists(select 1 from storage.objects where bucket_id='bolig-contracts'),'Reader can directly read Storage';
 assert public.bolig_contract_review(c,root,'review',jsonb_build_object('id',current_setting('qa.contract.review')))#>>'{data,state}'='ready','Reader cannot read review';
 denied:=false;begin perform public.bolig_contract_review(c,root,'begin',jsonb_build_object('id',gen_random_uuid(),'text_ids',jsonb_build_array(current_setting('qa.contract.text')),'question',''));exception when insufficient_privilege then denied:=true;end;assert denied,'Reader can start model job';
end$$;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.bolig_contracts('e0000000-0000-4000-8000-000000000001',current_setting('qa.contract.root')::uuid,'grant',jsonb_build_object('user_id','d0000000-0000-4000-8000-000000000101','role','none','revision',1))->>'allowed' grant_saved;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000101',true);
set local role authenticated;
do $$declare r jsonb;denied boolean:=false;begin
 r:=public.bolig_contracts('e0000000-0000-4000-8000-000000000001',current_setting('qa.contract.root')::uuid);
 assert r->>'allowed'='false' and not r?'documents' and not r?'people','Revocation leaked metadata';
 begin perform public.bolig_contract_review('e0000000-0000-4000-8000-000000000001',current_setting('qa.contract.root')::uuid,'text',jsonb_build_object('id',current_setting('qa.contract.text')));exception when insufficient_privilege then denied:=true;end;assert denied,'Revoked reader can read text';denied:=false;
 begin perform public.bolig_contracts('e0000000-0000-4000-8000-000000000001',current_setting('qa.contract.root')::uuid,'file',jsonb_build_object('id',current_setting('qa.contract.file')));exception when insufficient_privilege then denied:=true;end;assert denied,'Revoked file still readable';
end$$;
reset role;set local role anon;
do $$declare denied boolean:=false;begin
 begin perform public.bolig_contracts('e0000000-0000-4000-8000-000000000001',current_setting('qa.contract.root')::uuid);exception when insufficient_privilege then denied:=true;end;assert denied,'Anonymous RPC accessible';
 assert not exists(select 1 from storage.objects where bucket_id='bolig-contracts'),'Anonymous Storage accessible';
 denied:=false;begin perform public.bolig_contract_review('e0000000-0000-4000-8000-000000000001',current_setting('qa.contract.root')::uuid);exception when insufficient_privilege then denied:=true;end;assert denied,'Anonymous text/review RPC accessible';
end$$;
select 'PASS native private contract text/search/source/review, reader/write gates, Storage/table/anon denials and revocation; synthetic metadata only, rollback' result;
rollback;

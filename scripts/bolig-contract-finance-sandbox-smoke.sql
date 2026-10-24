-- Existing synthetic Sandbox identities; every change rolls back.
begin;
set local statement_timeout='20s';set local lock_timeout='2s';
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000001';root uuid;ident uuid:=gen_random_uuid();line uuid:=gen_random_uuid();b jsonb;i jsonb;p jsonb;r jsonb;denied boolean:=false;
begin
 root:=(public.bolig_workspace(c,'create',null,null,'{"title":"QA økonomi – rollback","reference":"QA-FINANCE-ROLLBACK"}')#>>'{root,id}')::uuid;
 b:=jsonb_build_object('reference','QA månedlig utført verdi','file_id',null,'series','block_total','base_month','2025-01','target_month','2025-01','base_index',100,'target_index',100,'factor',0.9,'origin','manual','lines',jsonb_build_array(jsonb_build_object('id',line,'kind','base','name','Grunnleveranse','amount_cents',100000000,'selected',true)));
 perform public.bolig_contract_finance(c,root,'agreement',jsonb_build_object('id',gen_random_uuid(),'revision',0,'input',b));
 i:=jsonb_build_object('mode','period','method','earned','number','QA-INV-1','date','2026-01-31','period','2026-01','reason','','credit_of',null,'apply_index',true,'target_month','2026-01','target_index',110,'origin','manual','values',jsonb_build_array(jsonb_build_object('id',line,'principal_cents',20000000,'index_cents',0)));
 r:=public.bolig_contract_finance(c,root,'preview',jsonb_build_object('input',i));
 assert r#>>'{data,result,principal_cents}'='20000000','Principal wrong';assert r#>>'{data,result,index_cents}'='1800000','Index wrong';
 assert jsonb_array_length(public.bolig_contract_finance(c,root)#>'{data,entries}')=0,'Preview counted as billed';
 p:=jsonb_build_object('id',ident,'revision',1,'input',i);r:=public.bolig_contract_finance(c,root,'register',p);
 assert public.bolig_contract_finance(c,root,'register',p)#>'{data,entry}'=r#>'{data,entry}','Lost receipt retry changed result';
 i:=jsonb_set(jsonb_set(jsonb_set(i,'{number}','"QA-INV-2"'),'{period}','"2026-02"'),'{values,0,principal_cents}','40000000');
 r:=public.bolig_contract_finance(c,root,'preview',jsonb_build_object('input',i));assert r#>>'{data,result,principal_cents}'='20000000','Cumulative principal includes prior index or double bills';
 perform public.bolig_contract_finance(c,root,'register',jsonb_build_object('id',gen_random_uuid(),'revision',2,'input',i));
 i:=i||jsonb_build_object('mode','credit','method','credit','number','QA-CREDIT-1','reason','QA delkreditering','credit_of',ident,'apply_index',false,'values',jsonb_build_array(jsonb_build_object('id',line,'principal_cents',10000000,'index_cents',900000)));
 perform public.bolig_contract_finance(c,root,'register',jsonb_build_object('id',gen_random_uuid(),'revision',3,'input',i));
 r:=public.bolig_contract_finance(c,root);
 assert r#>>'{data,totals,0,principal_cents}'='30000000','Credits not deducted';assert r#>>'{data,totals,0,index_cents}'='2700000','Index credit not deducted';
 i:=i||jsonb_build_object('mode','period','method','documented','number','QA-DOC-MONTH','date','2026-03-31','period','2026-03','reason','QA dokumentert denne måneden','credit_of',null,'apply_index',true,'target_month','2026-03','target_index',110,'values',jsonb_build_array(jsonb_build_object('id',line,'principal_cents',5000000,'index_cents',0)));
 r:=public.bolig_contract_finance(c,root,'preview',jsonb_build_object('input',i));assert r#>>'{data,result,principal_cents}'='5000000','Documented month reduced by prior invoicing';
 r:=public.bolig_contract_finance(c,root,'register',jsonb_build_object('id',gen_random_uuid(),'revision',4,'input',i));assert r#>>'{data,entry,input,method}'='documented','Billing basis not retained';
 r:=public.bolig_contract_finance(c,root);assert r#>>'{data,totals,0,principal_cents}'='35000000','Documented month not accumulated';assert r#>>'{data,totals,0,index_cents}'='3150000','Documented index not accumulated';
 i:=i||jsonb_build_object('method','payment','number','QA-SPLIT-MAIN','period','2026-04','separate_index',true,'values',jsonb_build_array(jsonb_build_object('id',line,'principal_cents',10000000,'index_cents',0)));
 r:=public.bolig_contract_finance(c,root,'preview',jsonb_build_object('input',i));assert r#>>'{data,result,index_cents}'='0','Separate index billed on main invoice';assert r#>>'{data,result,index_invoice,result,index_cents}'='900000','Separate index basis wrong';
 ident:=gen_random_uuid();p:=jsonb_build_object('id',ident,'revision',5,'input',i);r:=public.bolig_contract_finance(c,root,'register',p);
 assert public.bolig_contract_finance(c,root,'register',p)#>'{data,entry}'=r#>'{data,entry}','Split main retry changed receipt';
 r:=public.bolig_contract_finance(c,root);assert r#>>'{data,totals,0,principal_cents}'='45000000','Main principal missing';assert r#>>'{data,totals,0,index_cents}'='3150000','Unissued index counted';assert jsonb_array_length(r#>'{data,index_invoices}')=1,'Stored index basis missing';
 i:=(i-'separate_index')||jsonb_build_object('mode','manual','method','manual','number','QA-SPLIT-INDEX','apply_index',false,'index_of',ident,'reason','QA indeks til separat a konto','values',jsonb_build_array(jsonb_build_object('id',line,'principal_cents',0,'index_cents',900000)));
 p:=jsonb_build_object('id',gen_random_uuid(),'revision',6,'input',i);r:=public.bolig_contract_finance(c,root,'register',p);assert public.bolig_contract_finance(c,root,'register',p)#>'{data,entry}'=r#>'{data,entry}','Separate index retry duplicated receipt';
 r:=public.bolig_contract_finance(c,root);assert r#>>'{data,totals,0,principal_cents}'='45000000','Index repeated principal';assert r#>>'{data,totals,0,index_cents}'='4050000','Separate index missing';assert jsonb_array_length(r#>'{data,index_invoices}')=0,'Issued index still pending';
 begin perform public.bolig_contract_finance(c,root,'preview',jsonb_build_object('input',i||'{"number":"QA-DUPLICATE-INDEX"}'));exception when sqlstate 'PT409' then denied:=true;end;assert denied,'Same index source could be billed twice';denied:=false;
 begin perform 1 from bolig_private.contract_finance_events;exception when insufficient_privilege then denied:=true;end;assert denied,'Raw private table accessible';
 perform public.bolig_contracts(c,root,'grant',jsonb_build_object('user_id','d0000000-0000-4000-8000-000000000101','role','reader','revision',0));
 perform set_config('qa.finance.root',root::text,true);perform set_config('qa.finance.payload',p::text,true);
end$$;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000101',true);
set local role authenticated;
do $$declare c uuid:='e0000000-0000-4000-8000-000000000001';root uuid:=current_setting('qa.finance.root')::uuid;denied boolean:=false;begin
 assert jsonb_array_length(public.bolig_contract_finance(c,root)#>'{data,entries}')=6,'Reader missing history';
 begin perform public.bolig_contract_finance(c,root,'register',current_setting('qa.finance.payload')::jsonb);exception when insufficient_privilege then denied:=true;end;assert denied,'Reader can register';
end$$;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.bolig_contracts('e0000000-0000-4000-8000-000000000001',current_setting('qa.finance.root')::uuid,'grant',jsonb_build_object('user_id','d0000000-0000-4000-8000-000000000101','role','none','revision',1))->>'allowed' grant_saved;
reset role;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000101',true);
set local role authenticated;
do $$declare denied boolean:=false;begin
 begin perform public.bolig_contract_finance('e0000000-0000-4000-8000-000000000001',current_setting('qa.finance.root')::uuid);exception when insufficient_privilege then denied:=true;end;assert denied,'Revoked reader can read';
end$$;
reset role;set local role anon;
do $$declare denied boolean:=false;begin
 begin perform public.bolig_contract_finance('e0000000-0000-4000-8000-000000000001',current_setting('qa.finance.root')::uuid);exception when insufficient_privilege then denied:=true;end;assert denied,'Anonymous finance RPC accessible';
end$$;
select 'PASS native finance: agreement, cumulative/monthly a konto, separate index invoice, durable source, no duplicate index/principal, credit, immutable retry, reader/write/table/anon gates and revocation; all changes rollback' result;
rollback;

-- SANDBOX ONLY, synthetic pilot. Caller supplies qa.pilot_company and auth.uid().
-- Idempotent: an existing example is never reset. Wrap in a caller transaction.
do $pilot$
declare c uuid:=current_setting('qa.pilot_company')::uuid; actor uuid:=auth.uid();
 rec jsonb;s jsonb;p jsonb;v jsonb;d jsonb;o jsonb;original jsonb;entry jsonb;template jsonb;preview jsonb;
 root uuid;unit uuid;unit2 uuid;unit3 uuid;unit4 uuid;pkg uuid;opt uuid;room uuid;doc uuid;pid uuid:=gen_random_uuid();checkid uuid;
 ids jsonb;groupids jsonb;tasks jsonb:='[]';decisions jsonb;payload jsonb;req uuid;task uuid;result jsonb;rev bigint;taskrev bigint;
 token text:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
 agreement_token text:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
 answer uuid:=gen_random_uuid(); b int;i int;
begin
 if exists(select 1 from jsonb_array_elements(public.bolig_workspace(c,'list')->'roots') r where r->>'reference'='QA-PILOT-40-20261023') then return;end if;
 rec:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','DEMO – Boligpilot med 40 leiligheter','reference','QA-PILOT-40-20261023','buildings',jsonb_build_array(
 jsonb_build_object('name','Pilotbygg A','building_type','apartment','address','Demoparken 101','house_floors',5,'entrances',jsonb_build_array(jsonb_build_object('address','Demoparken 101','counts','[4,4,4,4,4]'::jsonb))),
 jsonb_build_object('name','Pilotbygg B','building_type','apartment','address','Demoparken 103','house_floors',5,'entrances',jsonb_build_array(jsonb_build_object('address','Demoparken 103','counts','[4,4,4,4,4]'::jsonb))))));
 root:=(rec#>>'{root,id}')::uuid;
 select jsonb_agg(x->'id' order by e->>'address',(x->>'floor')::int,(x->>'position')::int) into ids from jsonb_array_elements(rec->'units') x join jsonb_array_elements(rec->'entrances') e on e->>'id'=x->>'entrance_id';
 unit:=(ids->>0)::uuid;unit2:=(ids->>1)::uuid;unit3:=(ids->>2)::uuid;unit4:=(ids->>3)::uuid;
 if jsonb_array_length(ids)<>40 then raise exception 'Pilot must have 40 apartments';end if;
 -- Two real catalog goods, one optional addition. Room template uses existing bulk engine.
 s:=public.bolig_catalog(c,root,'package',0,jsonb_build_object('name','DEMO – Standard bad','lines',jsonb_build_array(
 jsonb_build_object('key','basin','name','DEMO Servant','sku','DEMO-PILOT-001','quantity',1,'unit','stk'),
 jsonb_build_object('key','tap','name','DEMO Servantbatteri','sku','DEMO-PILOT-002','quantity',1,'unit','stk'))));pkg:=(s#>>'{packages,0,id}')::uuid;
 s:=public.bolig_catalog(c,root,'option',(s->>'revision')::bigint,jsonb_build_object('name','DEMO – Ekstra speil','sku','DEMO-PILOT-003','quantity',1,'unit','stk','price_cents',250000,'replace_key','','deduct_base',false));opt:=(s#>>'{options,0,id}')::uuid;
 p:=public.bolig_prepare(c,root);
 template:=jsonb_build_object('id',gen_random_uuid(),'name','DEMO – Standard leilighet med bad','definition',jsonb_build_object('rooms',jsonb_build_array(jsonb_build_object('key',gen_random_uuid(),'name','Bad','type','bathroom','floor','','package_id',pkg)),'common_package_id',null),'unit_ids',ids,'include_existing',false);
 p:=public.bolig_prepare(c,root,'template_save',jsonb_build_object('kind','template','intent','template_save','basis',p->'basis','data',template,'request_id',gen_random_uuid()));
 p:=public.bolig_prepare(c,root);
 preview:=public.bolig_prepare(c,root,'preview',jsonb_build_object('kind','template','intent','preview','basis',p->'basis','data',template));
 p:=public.bolig_prepare(c,root,'save',jsonb_build_object('kind','template','intent','save','basis',p->'basis','data',template,'request_id',gen_random_uuid()));
 -- One individual option; the other 39 remain standard.
 p:=public.bolig_package_choices(c,root,unit2);room:=(p#>>'{rooms,0,id}')::uuid;
 p:=public.bolig_package_choices(c,root,unit2,'save',(p#>>'{selection,revision}')::bigint,jsonb_build_object('scope_id',room,'package_id',pkg,'option_ids',jsonb_build_array(opt),'catalog_revision',p->'revision','rooms_revision',p->'rooms_revision'));
 -- Save real explicit riser groups in each building. All four trades share one Gantt.
 s:=public.bolig_coordination(c,root);
 for entry in select value from jsonb_array_elements(rec->'blocks') loop
  select jsonb_agg(u->'id') into groupids from jsonb_array_elements(rec->'units') u join jsonb_array_elements(rec->'entrances') e on e->>'id'=u->>'entrance_id' where e->>'block_id'=entry->>'id' and (u->>'position')::int=1;
  s:=public.bolig_coordination(c,root,'group',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','id',gen_random_uuid(),'name','DEMO – '||(entry->>'name')||' stamme 1','unit_ids',groupids));
 end loop;
 s:=public.bolig_coordination(c,root,'settings',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','enabled',false,'manager_id',actor));
 s:=public.bolig_coordination(c,root,'units',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','unit_ids',jsonb_build_array(unit4),'mode','on'));
 for entry in select value from jsonb_array_elements(rec->'units') loop
  for i in 0..3 loop tasks:=tasks||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'unit_id',entry->>'id','owner_id',actor,'title',case i when 0 then 'DEMO Tildekking' when 1 then 'DEMO Riving' when 2 then 'DEMO Rørlegger' else 'DEMO Elektro' end,'planned_start','2026-10-26'::date+least(i,2)+case when entry->>'id'=unit3::text then 3 else 0 end,'planned_end','2026-10-26'::date+least(i,2)+case when entry->>'id'=unit3::text then 3 else 0 end,'predecessor_id',null,'required',false));end loop;
 end loop;
 p:=public.bolig_progress(c,root,null,'batch',jsonb_build_object('request_id',gen_random_uuid(),'revision',0,'mode','create','reviewed',true,'items',tasks));
 -- A standard agreement is accepted through the actual anonymous resident gateway.
 rec:=public.bolig_workspace(c,'get',root);select x into entry from jsonb_array_elements(rec->'units') x where x->>'id'=unit::text;
 rec:=public.bolig_workspace(c,'unit',root,(rec#>>'{root,revision}')::bigint,jsonb_build_object('id',unit,'number',entry->>'number','contact_name','DEMO – Fiktiv pilotbeboer','contact_email','pilot.standard@example.invalid','contact_phone',''));
 s:=public.bolig_commerce(c,root,unit,'create',jsonb_build_object('request_id',gen_random_uuid(),'kind','choice','choice_revision',1,'reason','DEMO – standardvalg, ingen ekte avtale'));doc:=(s->>'document_id')::uuid;
 select x into d from jsonb_array_elements(s->'documents') x where x->>'id'=doc::text;
 s:=public.bolig_commerce(c,root,unit,'approve',jsonb_build_object('request_id',gen_random_uuid(),'document_id',doc,'revision',d->'revision'));select x into d from jsonb_array_elements(s->'documents') x where x->>'id'=doc::text;
 s:=public.bolig_commerce(c,root,unit,'publish',jsonb_build_object('request_id',gen_random_uuid(),'document_id',doc,'revision',d->'revision','token',agreement_token));
 perform set_config('request.jwt.claim.sub','',true);perform set_config('qa.user','',true);execute 'set local role anon';
 result:=public.bolig_resident_decision(agreement_token,'accept',doc,jsonb_build_object('request_id',answer,'name','DEMO – Fiktiv pilotbeboer','confirmed',true));
 execute 'set local role authenticated';perform set_config('request.jwt.claim.sub',actor::text,true);perform set_config('qa.user',actor::text,true);
 if result->>'status'<>'accepted' then raise exception 'Pilot agreement not accepted';end if;
 -- Supplier order and partial receipt are deliberately marked fictional.
 s:=public.bolig_deliveries(c,root,unit);s:=public.bolig_deliveries(c,root,unit,'settings',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','settings',jsonb_build_object('address','DEMO – Demoparken 101','note','Fiktiv pilot, ingen utsending')));
 s:=public.bolig_deliveries(c,root,unit,'unit_settings',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','settings',jsonb_build_object('address_mode','common','address','','order_mode','combined','delivery_mode','partial')));
 p:=public.bolig_order_draft(c,root,unit,'save',0,1,jsonb_build_object('selected_positions','[0,1]'::jsonb));
 s:=public.bolig_deliveries(c,root,unit,'create',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','draft_revision',p#>'{draft,revision}','positions','[0,1]'::jsonb,'reference','DEMO-PILOT-ORDER','supplier','DEMO – Fiktiv leverandør','supplier_reference','','requested_date','','note','Kun pilot. Ikke sendt til leverandør.','review',true));o:=s#>'{orders,0}';original:=o->'snapshot';
 s:=public.bolig_deliveries(c,root,unit,'ordered',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','order_id',o->'id','date','2026-10-23','confirmed',true));
 s:=public.bolig_deliveries(c,root,unit,'receive',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','order_id',o->'id','date','2026-10-23','note','DEMO – én vare mottatt','lines',jsonb_build_array(jsonb_build_object('position',0,'quantity',1))));
 if s#>>'{orders,0,status}'<>'partial' then raise exception 'Pilot should retain partial delivery';end if;
 -- Proposed change after ordering: source order remains byte-for-byte frozen.
 p:=public.bolig_commerce(c,root,unit,'create',jsonb_build_object('request_id',gen_random_uuid(),'kind','change','order_id',o->'id','delivery_revision',s->'revision','reason','DEMO – ønsker ett ekstra batteri etter bestilling','delta_cents',125000,'lines',jsonb_build_array((o#>'{snapshot,goods,0}'),(o#>'{snapshot,goods,1}')||jsonb_build_object('quantity',2))));
 if (public.bolig_deliveries(c,root,unit)#>'{orders,0,snapshot}') is distinct from original then raise exception 'Pilot change rewrote supplier order';end if;
 -- One actual minor restpoint, linked to an existing-engine follow-up activity.
 s:=public.bolig_quality(c,root,unit,'check_add',0,jsonb_build_object('required',false,'content',jsonb_build_object('title','DEMO – Sluttkontroll','trade','Felles – alle fag','instructions','Kun fiktiv pilot','points',jsonb_build_array(jsonb_build_object('id',pid,'title','Rosett kontrollert','guidance','','image_required',false,'comment_required',false)))));checkid:=(s#>>'{data,checks,0,id}')::uuid;
 s:=public.bolig_quality(c,root,unit,'check_save',(s->>'revision')::bigint,jsonb_build_object('id',checkid,'complete',true,'answers',jsonb_build_object(pid::text,jsonb_build_object('status','Avvik','severity','minor','comment','DEMO – rosett justeres etter overtakelsen','values','{}'::jsonb,'documents','[]'::jsonb))));
 v:=public.bolig_handover_review(c,root,unit);select x into entry from jsonb_array_elements(v->'cases') x where x->>'category'='Restpunkt' limit 1;
 if entry is null then raise exception 'Pilot restpoint missing';end if;
 task:=gen_random_uuid();p:=public.bolig_handover_followup(c,root,unit,'create',jsonb_build_object('request_id',gen_random_uuid(),'basis',v->'basis','case_id',entry->>'id','task_id',task,'unit_id',unit,'title','DEMO – Etterjuster rosett','owner_id',actor,'planned_start','2026-10-29','planned_end','2026-10-30'));
 -- Paper notice is deliberately a draft; no resident publication or email.
 p:=public.bolig_progress(c,root,unit);p:=public.bolig_progress(c,root,unit,'notice',jsonb_build_object('request_id',gen_random_uuid(),'revision',p->'revision','id',gen_random_uuid(),'task_id',task,'body','DEMO – Vi kommer for å etterjustere rosetten. Avtal tilgang med prosjektets kontaktperson.','publish_on','2026-10-23'));
 v:=public.bolig_handover_review(c,root,unit);decisions:='[]';
 for entry in select value from jsonb_array_elements(v->'cases') loop decisions:=decisions||jsonb_build_array(jsonb_build_object('id',entry->>'id','decision','carry','reason','DEMO – Prosjektleder har vurdert det fiktive forholdet. Videre oppfølging beholdes åpen.','owner_id',actor,'critical_confirmed',true));end loop;
 v:=public.bolig_handover_review(c,root,unit,'record',(v->>'revision')::bigint,jsonb_build_object('request_id',gen_random_uuid(),'basis',v->'basis','decisions',decisions,'confirmed',true,'date','2026-10-23','reference','DEMO – Fiktiv pilotprotokoll, ikke en virkelig overtakelse'));
 if v->'record'='null'::jsonb then raise exception 'Pilot handover missing';end if;
 -- Dialogue enabled for only one apartment; retain one clearly fictitious question.
 rec:=public.bolig_workspace(c,'get',root);select x into entry from jsonb_array_elements(rec->'units') x where x->>'id'=unit4::text;
 rec:=public.bolig_workspace(c,'unit',root,(rec#>>'{root,revision}')::bigint,jsonb_build_object('id',unit4,'number',entry->>'number','contact_name','DEMO – Fiktiv dialogkontakt','contact_email','pilot.dialog@example.invalid','contact_phone',''));
 p:=public.bolig_resident_portal(c,root,unit4);p:=public.bolig_resident_portal(c,root,unit4,'publish',jsonb_build_object('request_id',gen_random_uuid(),'revision',p->'revision','reviewed',true,'token',token));
 perform set_config('request.jwt.claim.sub','',true);perform set_config('qa.user','',true);execute 'set local role anon';
 p:=public.bolig_portal(token,'message',jsonb_build_object('request_id',gen_random_uuid(),'body','DEMO – Kan vi avtale tilgang til leiligheten? Dette er en fiktiv pilotmelding.'));
 execute 'set local role authenticated';perform set_config('request.jwt.claim.sub',actor::text,true);perform set_config('qa.user',actor::text,true);
end$pilot$;

-- SANDBOX ONLY. Synthetic, isolated demo; never resets an existing example.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
do $$declare c uuid:='e0000000-0000-4000-8000-000000000001';actor uuid:='d0000000-0000-4000-8000-000000000001';r jsonb;s jsonb;v jsonb;p jsonb;root uuid;unit uuid;pkg uuid;selected jsonb:='[]';items jsonb:='[]';item jsonb;first_id uuid;second_id uuid;t uuid;i int;
 token text:=encode(sha256(convert_to(gen_random_uuid()::text||gen_random_uuid()::text,'UTF8')),'hex');
begin
 if not exists(select 1 from bolig_private.progress_mail_settings where singleton and not enabled) then raise exception 'Sandbox mail must remain off';end if;
 if exists(select 1 from bolig_private.roots where company_id=c and reference='QA-STAMME-DIALOG-20261023') then return;end if;
 set local role authenticated;
 r:=public.bolig_workspace(c,'create_plan',null,null,jsonb_build_object('request_id',gen_random_uuid(),'title','DEMO – Stammeplan og meldinger','reference','QA-STAMME-DIALOG-20261023','buildings',jsonb_build_array(jsonb_build_object('name','Stammebygg A','building_type','apartment','address','Demoveien 70','house_floors',4,'entrances',jsonb_build_array(jsonb_build_object('address','Demoveien 70','counts','[2,2,2,2]'::jsonb))))));root:=(r#>>'{root,id}')::uuid;
 for item in select value from jsonb_array_elements(r->'units') where (value->>'position')::int=1 order by (value->>'floor')::int loop
  selected:=selected||jsonb_build_array(item->'id');unit:=(item->>'id')::uuid;first_id:=gen_random_uuid();second_id:=gen_random_uuid();
  for i in 0..3 loop
   t:=case i when 0 then first_id when 1 then second_id else gen_random_uuid() end;
   items:=items||jsonb_build_array(jsonb_build_object('id',t,'unit_id',unit,'owner_id',actor,'title',case i when 0 then 'Tildekking' when 1 then 'Riving' when 2 then 'Rørlegger' else 'Elektro' end,'planned_start','2026-10-26'::date+least(i,2),'planned_end','2026-10-26'::date+least(i,2),'predecessor_id',case i when 1 then first_id when 2 then second_id else null end,'required',true));
  end loop;
 end loop;
 if jsonb_array_length(selected)<>4 then raise exception 'Expected four explicit demo apartments';end if;
 s:=public.bolig_coordination(c,root);s:=public.bolig_coordination(c,root,'group',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','id',gen_random_uuid(),'name','DEMO – Stamme A','unit_ids',selected));
 s:=public.bolig_coordination(c,root,'settings',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','enabled',false,'manager_id',actor));
 s:=public.bolig_coordination(c,root,'units',jsonb_build_object('request_id',gen_random_uuid(),'revision',s->'revision','unit_ids',selected,'mode','on'));
 p:=public.bolig_progress(c,root,null,'batch',jsonb_build_object('request_id',gen_random_uuid(),'revision',0,'mode','create','reviewed',true,'items',items));
 unit:=(selected->>0)::uuid;r:=public.bolig_workspace(c,'unit',root,(r#>>'{root,revision}')::bigint,jsonb_build_object('id',unit,'number','H0101','contact_name','DEMO – Fiktiv beboer','contact_email','demo.stamme@example.invalid'));
 p:=public.bolig_catalog(c,root,'package',0,jsonb_build_object('name','DEMO – Grunnpakke','lines',jsonb_build_array(jsonb_build_object('key','basin','name','DEMO Servant','sku','DEMO-STAMME-001','quantity',1,'unit','stk'))));pkg:=(p#>>'{packages,0,id}')::uuid;
 p:=public.bolig_package_choices(c,root,unit);p:=public.bolig_package_choices(c,root,unit,'save',0,jsonb_build_object('scope_id','common','package_id',pkg,'option_ids','[]'::jsonb,'catalog_revision',p->'revision','rooms_revision',p->'rooms_revision'));
 p:=public.bolig_resident_portal(c,root,unit,'offer',jsonb_build_object('request_id',gen_random_uuid(),'revision',0,'current',true,'title','DEMO – Standardvalg','choice_revision',1));
 p:=public.bolig_resident_portal(c,root,unit,'publish',jsonb_build_object('request_id',gen_random_uuid(),'revision',p->'revision','token',token,'reviewed',true));
 perform set_config('request.jwt.claim.sub','',true);execute 'set local role anon';
 v:=public.bolig_portal(token,'message',jsonb_build_object('request_id',gen_random_uuid(),'body','DEMO – Hei! Kan vi avtale hvordan dere får tilgang til leiligheten når arbeidet starter? Dette er en fiktiv melding til demonstrasjon.'));
 reset role;
 if exists(select 1 from bolig_private.dialogue_deliveries) then raise exception 'Unexpected demo email';end if;
end$$;
commit;
select jsonb_build_object('title',title,'id',id,'units',(select count(*) from bolig_private.units u where u.root_id=r.id),'tasks',(select count(*) from bolig_private.progress_tasks t where t.root_id=r.id)) as demo from bolig_private.roots r where reference='QA-STAMME-DIALOG-20261023';

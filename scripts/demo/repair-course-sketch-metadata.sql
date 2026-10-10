-- SANDBOX/DEMO ONLY: preserve the uploaded JPG; restore its missing sketch type.
begin;
do $$declare r public.sales_requests%rowtype;photos jsonb;begin
 select * into strict r from public.sales_requests where request_ref='DEMO-02-BEFARING';
 if not exists(select 1 from public.demo_sandbox_snapshots where snapshot_key='golden-v1')
 or not exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id where m.company_id=r.company_id and p.email='demo@expo-proffdok.no')
 then raise exception 'Dedicated demo baseline required';end if;
 if not exists(select 1 from jsonb_array_elements(r.payload->'inspectionPhotos') a where a->>'id'='bathroom-sketch-DEMO-02-BEFARING') then raise exception 'Existing uploaded demo sketch required';end if;
 insert into public.demo_sandbox_snapshots(snapshot_key,payload,updated_at)
 values('course-sketch-metadata-before-20261010',jsonb_build_object('request_id',r.id,'inspectionPhotos',r.payload->'inspectionPhotos'),now()) on conflict(snapshot_key) do nothing;
 select jsonb_agg(case when a->>'id'='bathroom-sketch-DEMO-02-BEFARING' then a||jsonb_build_object('kind','bathroom-sketch') else a end order by n)
 into photos from jsonb_array_elements(r.payload->'inspectionPhotos') with ordinality t(a,n);
 update public.sales_requests set payload=jsonb_set(payload,'{inspectionPhotos}',photos) where id=r.id;
end$$;
commit;

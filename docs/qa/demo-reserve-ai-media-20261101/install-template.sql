
DO $repair$
DECLARE
 p public.projects%rowtype; s public.demo_sandbox_snapshots%rowtype;
 golden_project jsonb; golden_index integer; media jsonb; golden_media jsonb;
 original_media jsonb; original_golden_media jsonb;
 mappings jsonb := $mapping$__IMAGE_MAPPINGS__$mapping$::jsonb;
 entry jsonb; protected_hash text; protected_golden_hash text;
 photo_count integer; point_count integer;
BEGIN
 IF current_database() <> 'postgres' THEN RAISE EXCEPTION 'Unexpected database'; END IF;
 SELECT * INTO STRICT p FROM public.projects WHERE id='a0000000-0000-4000-8000-000000000002' FOR UPDATE;
 IF p.title <> 'DEMO – RESERVE – Ferdig våtrom med garanti' OR p.data#>>'{project,demoSuiteKey}' <> 'golden-demo-v1' THEN RAISE EXCEPTION 'Wrong target'; END IF;
 IF md5((p.data-'photos'-'checklist')::text)<>'81376df8a2c5210e1b07ae11497eb9bd' OR NOT p.locked THEN RAISE EXCEPTION 'Protected project data changed'; END IF;
 SELECT * INTO STRICT s FROM public.demo_sandbox_snapshots WHERE snapshot_key='golden-v1' FOR UPDATE;
 IF md5((s.payload-'projects')::text)<>'3959bbc48c42ab79b6d3998b4432b8a9' THEN RAISE EXCEPTION 'Golden snapshot changed outside project data'; END IF;
 SELECT e,ord::integer-1 INTO STRICT golden_project,golden_index FROM jsonb_array_elements(s.payload->'projects') WITH ORDINALITY q(e,ord) WHERE e->>'id'=p.id::text;
 original_media:=jsonb_build_object('photos',p.data->'photos','checklist',p.data->'checklist');
 original_golden_media:=jsonb_build_object('photos',golden_project#>'{data,photos}','checklist',golden_project#>'{data,checklist}');
 media:=original_media;golden_media:=original_golden_media;
 protected_hash:=md5((p.data-'photos'-'checklist')::text);
 protected_golden_hash:=md5((s.payload#-array['projects',golden_index::text,'data','photos']#-array['projects',golden_index::text,'data','checklist'])::text);
 IF jsonb_array_length(media->'photos')<>7 OR jsonb_array_length(golden_media->'photos')<>7 THEN RAISE EXCEPTION 'Expected seven gallery photos'; END IF;
 FOR entry IN SELECT value FROM jsonb_array_elements(mappings) LOOP
  IF position(to_jsonb(entry->>'old')::text in media::text)=0 OR position(to_jsonb(entry->>'old')::text in golden_media::text)=0 THEN RAISE EXCEPTION 'Missing original photo %',entry->>'key'; END IF;
  media:=replace(media::text,to_jsonb(entry->>'old')::text,to_jsonb(entry->>'new')::text)::jsonb;
  golden_media:=replace(golden_media::text,to_jsonb(entry->>'old')::text,to_jsonb(entry->>'new')::text)::jsonb;
 END LOOP;
 IF md5(regexp_replace((media->'checklist')::text,'"url": "[^"]*"','"url": ""','g'))<>'cd86a44deb44bfa6ce0aca91065767a7' THEN RAISE EXCEPTION 'Checklist changed outside URLs'; END IF;
 INSERT INTO public.demo_sandbox_snapshots(snapshot_key,payload,updated_at,updated_by)
 VALUES('backup-reserve-media-before-ai-20261101',jsonb_build_object('version',1,'project_id',p.id,'live_media',original_media,'golden_media',original_golden_media,'capturedAt',now()),now(),null);
 UPDATE public.projects SET data=jsonb_set(jsonb_set(data,'{photos}',media->'photos'),'{checklist}',media->'checklist') WHERE id=p.id;
 UPDATE public.demo_sandbox_snapshots SET payload=jsonb_set(jsonb_set(payload,array['projects',golden_index::text,'data','photos'],golden_media->'photos'),array['projects',golden_index::text,'data','checklist'],golden_media->'checklist'),updated_at=now() WHERE snapshot_key='golden-v1';
 SELECT * INTO STRICT p FROM public.projects WHERE id=p.id;
 SELECT * INTO STRICT s FROM public.demo_sandbox_snapshots WHERE snapshot_key='golden-v1';
 IF md5((p.data-'photos'-'checklist')::text)<>protected_hash OR NOT p.locked THEN RAISE EXCEPTION 'Unrelated project field changed'; END IF;
 IF md5((s.payload#-array['projects',golden_index::text,'data','photos']#-array['projects',golden_index::text,'data','checklist'])::text)<>protected_golden_hash THEN RAISE EXCEPTION 'Unrelated Golden field changed'; END IF;
 SELECT count(*) INTO photo_count FROM jsonb_array_elements(p.data->'photos') x WHERE x->>'url' LIKE 'data:image/jpeg;base64,%';
 SELECT count(*) INTO point_count FROM jsonb_each(p.data->'checklist') g CROSS JOIN LATERAL jsonb_each(g.value) c CROSS JOIN LATERAL jsonb_array_elements(coalesce(c.value->'photos','[]')) x WHERE x->>'url' LIKE 'data:image/jpeg;base64,%';
 IF photo_count<>7 OR point_count<>5 THEN RAISE EXCEPTION 'Expected seven gallery and five checkpoint image references, got %/%',photo_count,point_count; END IF;
 IF p.data->'photos'<>media->'photos' OR p.data->'checklist'<>media->'checklist' THEN RAISE EXCEPTION 'Trigger changed intended media'; END IF;
END $repair$;

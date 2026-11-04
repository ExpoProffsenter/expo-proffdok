-- HISTORISK KONTROLL, allerede utført 2026-11-04. Bevisst ROLLBACK som standard.
begin;
set local lock_timeout = '3s';
do $repair$
declare
 live_row public.projects%rowtype;
 source_row public.projects%rowtype;
 golden_row public.demo_sandbox_snapshots%rowtype;
 old_live jsonb; new_live jsonb; old_golden jsonb; new_golden jsonb;
 expected_payload jsonb; photo jsonb; entry record; item record;
 source_url text; p text[]; changed_live integer:=0; changed_golden integer:=0; changed_gallery integer:=0;
 after_row public.projects%rowtype;
begin
 select * into strict live_row from public.projects where id='a0000000-0000-4000-8000-000000000001' for update;
 select * into strict source_row from public.projects where id='a0000000-0000-4000-8000-000000000002' for share;
 select * into strict golden_row from public.demo_sandbox_snapshots where snapshot_key='golden-v1' for update;
 if live_row.locked or md5(live_row.data::text)<>'a32354ec299402ce6e4d70b1844742a0'
    or md5(source_row.data::text)<>'448e9f47a70c493781cbcb69b98f41b4'
    or md5(golden_row.payload::text)<>'e7a7bba6334ecaedd8a5b6bc27b16afd'
    or golden_row.payload#>>'{projects,0,id}'<>live_row.id::text then
   raise exception 'Media baseline changed; no write allowed';
 end if;
 old_live:=live_row.data; new_live:=old_live;
 old_golden:=golden_row.payload#>'{projects,0,data}'; new_golden:=old_golden;
 for entry in select * from (values
 ('Membran / tetting','Tettebånd montert','demo-check-tetteband','/demo-images/membran-tetteband.jpg','DEMO – Membran og tettebånd'),
 ('Membran / tetting','Rørmansjetter montert','demo-check-ror','/demo-images/ror-mansjett.jpg','DEMO – Rørmansjett'),
 ('Primer / underlag','Primer påført','demo-check-primer','/demo-images/underlag-primer.jpg','DEMO – Underlag og primer'),
 ('Sopro AEB 815 / TG 20918 – Rør og sluk','Sluk og mansjett er dokumentert med bilde før flislegging','demo-check-sluk','/demo-images/slukmansjett.jpg','DEMO – Slukmansjett')
 ) v(category,point,photo_id,old_url,source_name)
 loop
   select value->>'url' into strict source_url from jsonb_array_elements(source_row.data->'photos') where value->>'name'=entry.source_name;
   if source_url not like 'data:image/jpeg;base64,%' or length(source_url)<10000 then raise exception 'Invalid approved source'; end if;
   select value,ordinality-1 as idx into strict item from jsonb_array_elements(old_live#>array['checklist',entry.category,entry.point,'photos']) with ordinality where value->>'id'=entry.photo_id;
   if item.value->>'url'<>entry.old_url then raise exception 'Live checkpoint URL changed'; end if;
   p:=array['checklist',entry.category,entry.point,'photos',item.idx::text,'url'];
   new_live:=jsonb_set(new_live,p,to_jsonb(source_url),false); changed_live:=changed_live+1;
   select value,ordinality-1 as idx into strict item from jsonb_array_elements(old_golden#>array['checklist',entry.category,entry.point,'photos']) with ordinality where value->>'id'=entry.photo_id;
   if item.value->>'url'<>entry.old_url then raise exception 'Golden checkpoint URL changed'; end if;
   p:=array['checklist',entry.category,entry.point,'photos',item.idx::text,'url'];
   new_golden:=jsonb_set(new_golden,p,to_jsonb(source_url),false); changed_golden:=changed_golden+1;
 end loop;
 for item in select value,ordinality-1 as idx from jsonb_array_elements(old_golden->'photos') with ordinality loop
   select value->>'url' into strict source_url from jsonb_array_elements(source_row.data->'photos') where value->>'name'=item.value->>'name';
   if source_url not like 'data:image/jpeg;base64,%' then raise exception 'Invalid gallery source'; end if;
   if item.value->>'url' not like '/demo-images/%' then raise exception 'Golden gallery already changed'; end if;
   new_golden:=jsonb_set(new_golden,array['photos',item.idx::text,'url'],to_jsonb(source_url),false);changed_gallery:=changed_gallery+1;
 end loop;
 if changed_live<>4 or changed_golden<>4 or changed_gallery<>6 then raise exception 'Unexpected repair count'; end if;
 if (new_live-'checklist')<>(old_live-'checklist') or (new_golden-'photos'-'checklist')<>(old_golden-'photos'-'checklist') then raise exception 'Non-media data changed'; end if;
 insert into public.demo_sandbox_snapshots(snapshot_key,payload)
 values('backup-hoved-media-before-portable-20261104',jsonb_build_object('version',1,'project_id',live_row.id,'live_checklist',old_live->'checklist','golden_photos',old_golden->'photos','golden_checklist',old_golden->'checklist'));
 update public.projects set data=new_live where id=live_row.id;
 select * into strict after_row from public.projects where id=live_row.id;
 if after_row.data<>new_live or (to_jsonb(after_row)-'data')<>(to_jsonb(live_row)-'data') then raise exception 'Unexpected post-trigger project mutation'; end if;
 expected_payload:=jsonb_set(golden_row.payload,'{projects,0,data}',new_golden,false);
 update public.demo_sandbox_snapshots set payload=expected_payload where snapshot_key='golden-v1';
 if (select payload from public.demo_sandbox_snapshots where snapshot_key='golden-v1')<>expected_payload then raise exception 'Unexpected golden payload'; end if;
 if (select md5(data::text) from public.projects where id=source_row.id)<>md5(source_row.data::text) then raise exception 'Approved source changed'; end if;
end $repair$;
select 'HOVED' as target,md5(data::text) as checksum,md5((data-'checklist')::text) as nonchecklist_checksum,
 (select count(*) from jsonb_path_query(data,'strict $.**.url') x where x#>>'{}' like '%demo-images%') as legacy_references
 from public.projects where id='a0000000-0000-4000-8000-000000000001'
union all select 'golden-v1',md5(payload::text),null,null from public.demo_sandbox_snapshots where snapshot_key='golden-v1';
rollback;

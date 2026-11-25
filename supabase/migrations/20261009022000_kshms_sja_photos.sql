-- Bounded, versioned SJA photo snapshots in the existing private JSON content.
-- No table, Storage, RLS, grant or policy changes.
create or replace function kshms_private.sja_content(d jsonb,signing boolean default false) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb:='{}'; k text; v text; grp text; row_data jsonb; cleaned jsonb; rows_data jsonb; ids uuid[]; row_id uuid; fields text[]; leader uuid; photo_data jsonb; encoded text;
begin
 if jsonb_typeof(d) is distinct from 'object' or octet_length(d::text)>1350000 then raise exception 'SJA-en er for stor eller mangler innhold.'; end if;
 foreach k in array array['title','workplace','project_reference','task','planned_on','reviewed_on','routines','equipment','ppe','emergency','stop_conditions','communication'] loop
  v:=kshms_private.sja_text(d,k,case when k='title' then 160 else 4000 end);
  if k in ('planned_on','reviewed_on') and v<>'' then
   if v !~ '^\d{4}-\d{2}-\d{2}$' or to_char(v::date,'YYYY-MM-DD')<>v then raise exception 'Velg en gyldig dato.'; end if;
  end if;
  if signing and k not in ('project_reference','routines') and v='' then raise exception 'Fyll ut oppgave, sted, datoer, utstyr, beredskap og gjennomgang før signering.'; end if;
  result:=result||jsonb_build_object(k,v);
 end loop;
 if result->>'title'='' then raise exception 'Skriv et navn på jobben før du lagrer.'; end if;
 leader:=nullif(kshms_private.sja_text(d,'leader_id',36),'')::uuid;
 if signing and leader is null then raise exception 'Velg ansvarlig prosjektleder før signering.'; end if;
 result:=result||jsonb_build_object('leader_id',coalesce(leader::text,''));
 foreach grp in array array['steps','participants'] loop
  if jsonb_typeof(d->grp) is distinct from 'array' then raise exception 'Arbeidstrinn og deltakere må ha gyldige rader.'; end if;
  if jsonb_array_length(d->grp) not between 1 and (case when grp='steps' then 30 else 40 end) then raise exception 'Bruk 1–30 arbeidstrinn og 1–40 deltakere.'; end if;
  fields:=case when grp='steps' then array['activity','hazard','consequence','measures','owner','check'] else array['name','role','company','involvement'] end;
  rows_data:='[]';ids:='{}';
  for row_data in select value from jsonb_array_elements(d->grp) loop
   if jsonb_typeof(row_data) is distinct from 'object' then raise exception 'Ugyldig SJA-rad.'; end if;
   row_id:=nullif(kshms_private.sja_text(row_data,'id',36),'')::uuid;
   if row_id is null or row_id=any(ids) then raise exception 'Hver SJA-rad må ha egen ID.'; end if;
   ids:=array_append(ids,row_id);cleaned:=jsonb_build_object('id',row_id);
   foreach k in array fields loop
    v:=kshms_private.sja_text(row_data,k,2000);
    if signing and not (grp='participants' and k='company') and v='' then raise exception 'Fyll ut arbeidstrinn, farer, konsekvenser, tiltak, ansvar, kontroll og deltakernes gjennomgang.'; end if;
    cleaned:=cleaned||jsonb_build_object(k,v);
   end loop;
   rows_data:=rows_data||jsonb_build_array(cleaned);
  end loop;
  result:=result||jsonb_build_object(grp,rows_data);
 end loop;
 if d ? 'photos' and jsonb_typeof(d->'photos') is distinct from 'array' then raise exception 'SJA-bildene må være en liste.'; end if;
 if jsonb_array_length(coalesce(d->'photos','[]'::jsonb))>3 then raise exception 'Bruk inntil tre bilder i SJA-en.'; end if;
 rows_data:='[]';ids:='{}';
 for photo_data in select value from jsonb_array_elements(coalesce(d->'photos','[]'::jsonb)) loop
  if jsonb_typeof(photo_data) is distinct from 'object' then raise exception 'Ugyldig SJA-bilde.'; end if;
  row_id:=nullif(kshms_private.sja_text(photo_data,'id',36),'')::uuid;
  v:=kshms_private.sja_text(photo_data,'data',400000);encoded:=split_part(v,',',2);
  if row_id is null or row_id=any(ids) or v !~ '^data:image/jpeg;base64,([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$' or octet_length(decode(encoded,'base64'))>300000 then raise exception 'SJA-bildet må være et gyldig, komprimert JPG-bilde.'; end if;
  ids:=array_append(ids,row_id);rows_data:=rows_data||jsonb_build_array(jsonb_build_object('id',row_id,'data',v));
 end loop;
 return result||jsonb_build_object('photos',rows_data);
end $$;

revoke all on function kshms_private.sja_content(jsonb,boolean) from public,anon,authenticated;

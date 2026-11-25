-- Bounded photos per risk row in the existing private execution JSON snapshot.
-- No table, Storage, RLS, grant or policy changes.
create or replace function kshms_private.execution_content(c jsonb,kind text,finished boolean) returns jsonb language plpgsql set search_path='' as $$
declare clean jsonb;arr jsonb:='[]';answers jsonb:='{}';p jsonb;a jsonb;r jsonb;photo jsonb;photos jsonb;k text;v text;pid uuid;ids uuid[]:='{}';photo_ids uuid[];answer_status text;low integer;medium integer;before_p integer;before_c integer;after_p integer;after_c integer;decision text;effect text;
begin
 if jsonb_typeof(c) is distinct from 'object' or octet_length(c::text)>3500000 then raise exception 'Gjennomføringen er for stor eller ugyldig.';end if;
 clean:=jsonb_build_object('points','[]'::jsonb,'answers','{}'::jsonb,'risks','[]'::jsonb);
 foreach k in array array['title','workplace','planned_on','responsible_id','participants','review','reference','routines','basis'] loop
  v:=kshms_private.execution_text(c,k,case k when 'title' then 160 when 'workplace' then 600 when 'reference' then 600 when 'planned_on' then 10 when 'responsible_id' then 36 when 'routines' then 4000 else 5000 end);
  if k='title' and v='' then raise exception 'Skriv et navn før du lagrer.';end if;
  if finished and k in('workplace','planned_on','responsible_id','participants','review') and v='' then raise exception 'Fyll ut arbeidssted, dato, ansvarlig, deltakere og gjennomgang før fullføring.';end if;
  if k='planned_on' and v<>'' then if v!~'^\d{4}-\d{2}-\d{2}$' or to_char(v::date,'YYYY-MM-DD')<>v then raise exception 'Velg en gyldig dato.';end if;end if;
  if k='responsible_id' and v<>'' then perform v::uuid;end if;
  clean:=clean||jsonb_build_object(k,v);
 end loop;
 if jsonb_typeof(c->'acceptance') is distinct from 'object' then raise exception 'Oppgi vurderingsgrenser.';end if;
 low:=nullif(c#>>'{acceptance,low_max}','')::integer;medium:=nullif(c#>>'{acceptance,medium_max}','')::integer;
 if kind='risk' and (low is null or medium is null or low<1 or low>=medium or medium>=25) then raise exception 'Lav grense må være mindre enn moderat grense. Bruk 1–24.';end if;
 clean:=clean||jsonb_build_object('acceptance',jsonb_build_object('low_max',low,'medium_max',medium,'description',kshms_private.execution_text(c->'acceptance','description',2000),'confirmed',coalesce(c#>'{acceptance,confirmed}'='true'::jsonb,false)));
 if kind='round' then
  if jsonb_typeof(c->'points') is distinct from 'array' or jsonb_array_length(c->'points') not between 1 and 100 or jsonb_typeof(c->'answers') is distinct from 'object' then raise exception 'Legg til 1–100 sjekkpunkter.';end if;
  for p in select value from jsonb_array_elements(c->'points') loop
   pid:=(p->>'id')::uuid;if pid is null or pid=any(ids) then raise exception 'Sjekkpunktene må ha ulike ID-er.';end if;ids:=array_append(ids,pid);
   p:=jsonb_build_object('id',pid,'title',kshms_private.execution_text(p,'title',600),'guidance',kshms_private.execution_text(p,'guidance',2000),'image_required',coalesce(p->'image_required'='true'::jsonb,false),'comment_required',coalesce(p->'comment_required'='true'::jsonb,false));
   a:=coalesce(c->'answers'->pid::text,'{}');answer_status:=coalesce(a->>'status','');if answer_status not in('','ok','deviation','na') then raise exception 'Velg OK, avvik eller ikke aktuelt.';end if;
   photos:=coalesce(a->'photos','[]');if jsonb_typeof(photos) is distinct from 'array' or jsonb_array_length(photos)>3 then raise exception 'Bruk inntil tre bilder per sjekkpunkt.';end if;
   for photo in select value from jsonb_array_elements(photos) loop
    if nullif(photo->>'id','')::uuid is null or jsonb_typeof(photo->'data') is distinct from 'string' or length(photo->>'data')>400000 or photo->>'data'!~'^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$' then raise exception 'Ugyldig dokumentasjonsbilde.';end if;
   end loop;
   a:=jsonb_build_object('status',answer_status,'comment',kshms_private.execution_text(a,'comment'),'responsible_id',kshms_private.execution_text(a,'responsible_id',36),'due_on',kshms_private.execution_text(a,'due_on',10),'photos',photos);
   if a->>'responsible_id'<>'' then perform (a->>'responsible_id')::uuid;end if;
   if a->>'due_on'<>'' then if a->>'due_on'!~'^\d{4}-\d{2}-\d{2}$' or to_char((a->>'due_on')::date,'YYYY-MM-DD')<>a->>'due_on' then raise exception 'Velg en gyldig frist.';end if;end if;
   if finished then
    if p->>'title'='' or answer_status='' then raise exception 'Hvert sjekkpunkt må ha tekst og svar.';end if;
    if ((p->>'comment_required')::boolean or answer_status in('deviation','na')) and a->>'comment'='' then raise exception 'Skriv påkrevd kommentar eller begrunnelse.';end if;
    if (p->>'image_required')::boolean and answer_status<>'na' and jsonb_array_length(photos)=0 then raise exception 'Legg til påkrevd bilde.';end if;
    if answer_status='deviation' and (a->>'responsible_id'='' or a->>'due_on'='') then raise exception 'Velg ansvarlig og frist for hvert avvik.';end if;
   end if;
   arr:=arr||jsonb_build_array(p);answers:=answers||jsonb_build_object(pid::text,a);
  end loop;
  return clean||jsonb_build_object('points',arr,'answers',answers);
 elsif kind='risk' then
  if jsonb_typeof(c->'risks') is distinct from 'array' or jsonb_array_length(c->'risks') not between 1 and 100 then raise exception 'Legg til 1–100 farer.';end if;
  if finished and (clean->>'basis'='' or clean#>>'{acceptance,description}'='' or clean#>'{acceptance,confirmed}' is distinct from 'true'::jsonb) then raise exception 'Beskriv vurderingsgrunnlag og bekreft firmaets grenser og akseptkrav.';end if;
  for r in select value from jsonb_array_elements(c->'risks') loop
   pid:=(r->>'id')::uuid;if pid is null or pid=any(ids) then raise exception 'Farene må ha ulike ID-er.';end if;ids:=array_append(ids,pid);
   p:=jsonb_build_object('id',pid);
   foreach k in array array['activity','hazard','consequence','existing_measures','planned_measures','follow_up','reason','owner_id','due_on','verified_on'] loop
    v:=kshms_private.execution_text(r,k,case when k='owner_id' then 36 when k in('due_on','verified_on') then 10 else 5000 end);
    if finished and k<>'verified_on' and v='' then raise exception 'Dokumenter fare, konsekvens, tiltak, ansvarlig, frist, oppfølging og begrunnelse.';end if;
    if k='owner_id' and v<>'' then perform v::uuid;end if;
    if k in('due_on','verified_on') and v<>'' then if v!~'^\d{4}-\d{2}-\d{2}$' or to_char(v::date,'YYYY-MM-DD')<>v then raise exception 'Velg gyldige tiltaksdatoer.';end if;end if;
    p:=p||jsonb_build_object(k,v);
   end loop;
   foreach k in array array['probability_before','consequence_before','probability_after','consequence_after'] loop
    v:=r->>k;if v is not null and (v!~'^[1-5]$') then raise exception 'Sannsynlighet og konsekvens må være 1–5.';end if;
    if finished and v is null then raise exception 'Vurder risiko før og etter tiltak.';end if;p:=p||jsonb_build_object(k,v::integer);
   end loop;
   photos:=coalesce(r->'photos','[]');if jsonb_typeof(photos) is distinct from 'array' or jsonb_array_length(photos)>3 then raise exception 'Bruk inntil tre bilder per fare.';end if;photo_ids:='{}';
   for photo in select value from jsonb_array_elements(photos) loop
    pid:=nullif(photo->>'id','')::uuid;
    if pid is null or pid=any(photo_ids) or jsonb_typeof(photo->'data') is distinct from 'string' or length(photo->>'data')>400000 or photo->>'data'!~'^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$' then raise exception 'Ugyldig risikobilde.';end if;
    photo_ids:=array_append(photo_ids,pid);
   end loop;p:=p||jsonb_build_object('photos',photos);
   decision:=coalesce(r->>'decision','');effect:=coalesce(r->>'effect_status','planned');if decision not in('','accepted','needs_action','stop') or effect not in('planned','verified') then raise exception 'Velg gyldig beslutning og tiltaksstatus.';end if;
   if finished and (decision='' or (effect='verified' and p->>'verified_on'='') or (decision='accepted' and (effect<>'verified' or p->>'verified_on'='' or (p->>'probability_after')::integer*(p->>'consequence_after')::integer>medium))) then raise exception 'Aksept krever kontrollert effekt og begrunnelse. Høy eller forventet risiko må ha videre tiltak eller stans.';end if;
   arr:=arr||jsonb_build_array(p||jsonb_build_object('decision',decision,'effect_status',effect));
  end loop;
  return clean||jsonb_build_object('risks',arr);
 else raise exception 'Ukjent gjennomføring.';end if;
end $$;

revoke all on function kshms_private.execution_content(jsonb,text,boolean) from public,anon,authenticated;

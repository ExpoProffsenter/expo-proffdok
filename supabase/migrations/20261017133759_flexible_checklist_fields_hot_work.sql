-- Private canonical validators; no new public API, tables, RLS or mail behavior.
create or replace function kshms_private.checklist_fields(fields jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare f jsonb;row jsonb;result jsonb:='[]';seen jsonb:='{}';fid uuid;parent jsonb;opts jsonb;
begin
 if jsonb_typeof(fields) is distinct from 'array' or jsonb_array_length(fields)>40 then raise exception 'Bruk inntil 40 underpunkter per sjekkpunkt.';end if;
 for f in select value from jsonb_array_elements(fields) loop
  fid:=nullif(f->>'id','')::uuid;
  if fid is null or seen ? fid::text or jsonb_typeof(f->'label') is distinct from 'string' or length(trim(f->>'label')) not between 1 and 600
   or coalesce(f->>'type','') not in('text','number','yesno','single','multiple','date','time','confirmation')
   or (f ? 'required' and jsonb_typeof(f->'required')<>'boolean') then raise exception 'Ugyldig underpunkt.';end if;
  row:=jsonb_build_object('id',fid,'label',trim(f->>'label'),'type',f->>'type','required',coalesce(f->'required'='true'::jsonb,false));
  if f ? 'min' then
   if f->>'type'<>'number' or jsonb_typeof(f->'min') is distinct from 'number' then raise exception 'Minsteverdi må være et tall.';end if;row:=row||jsonb_build_object('min',f->'min');
  end if;
  if f->>'type' in('single','multiple') then
   opts:=f->'options';if jsonb_typeof(opts) is distinct from 'array' or jsonb_array_length(opts) not between 2 and 20 then raise exception 'Bruk 2–20 svaralternativer.';end if;
   select jsonb_agg(trim(value#>>'{}') order by ord) into opts from jsonb_array_elements(opts) with ordinality q(value,ord);
   if exists(select 1 from jsonb_array_elements(f->'options') v where jsonb_typeof(v)<>'string')
    or exists(select 1 from jsonb_array_elements_text(opts) v where length(v) not between 1 and 160)
    or (select count(distinct lower(v)) from jsonb_array_elements_text(opts) v)<>jsonb_array_length(opts) then raise exception 'Svaralternativene må være ulike og ha gyldig tekst.';end if;
   row:=row||jsonb_build_object('options',opts);
  end if;
  if f->'when' is not null and f->'when'<>'null'::jsonb then
   parent:=seen->(f#>>'{when,field_id}');opts:=case when parent->>'type'='yesno' then '["Ja","Nei","Ikke aktuelt"]'::jsonb else parent->'options' end;
   if parent is null or parent->>'type' not in('yesno','single','multiple') or not coalesce(opts ? (f#>>'{when,equals}'),false) then raise exception 'Betingelsen må vise til et tidligere valg.';end if;
   row:=row||jsonb_build_object('when',jsonb_build_object('field_id',parent->>'id','equals',f#>>'{when,equals}'));
  end if;
  seen:=seen||jsonb_build_object(fid::text,row);result:=result||jsonb_build_array(row);
 end loop;return result;
end $$;
create or replace function kshms_private.checklist_visible_fields(fields jsonb,vals jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare f jsonb;result jsonb:='[]';visible jsonb:='{}';v jsonb;begin
 for f in select value from jsonb_array_elements(fields) loop
  v:=vals->(f#>>'{when,field_id}');
  if not(f ? 'when') or (visible ? (f#>>'{when,field_id}') and (v=to_jsonb(f#>>'{when,equals}') or jsonb_typeof(v)='array' and v ? (f#>>'{when,equals}'))) then
   result:=result||jsonb_build_array(f);visible:=visible||jsonb_build_object(f->>'id',true);
  end if;
 end loop;return result;
end $$;
create or replace function kshms_private.checklist_values(fields jsonb,vals jsonb,finished boolean) returns jsonb language plpgsql immutable set search_path='' as $$
declare f jsonb;v jsonb;result jsonb:='{}';key text;txt text;begin
 if jsonb_typeof(vals) is distinct from 'object' or octet_length(vals::text)>250000 then raise exception 'Ugyldige svar i underpunkter.';end if;
 for key in select jsonb_object_keys(vals) loop if not exists(select 1 from jsonb_array_elements(fields) cf(value) where cf.value->>'id'=key) then raise exception 'Svaret tilhører ikke denne malutgaven.';end if;end loop;
 for f in select value from jsonb_array_elements(fields) loop
  v:=vals->(f->>'id');if v is null or v='null'::jsonb or v='""'::jsonb then continue;end if;txt:=v#>>'{}';
  if f->>'type'='confirmation' then
   if jsonb_typeof(v) is distinct from 'object' or jsonb_typeof(v->'confirmed') is distinct from 'boolean' then raise exception 'Ugyldig bekreftelse.';end if;
   if v->'confirmed'='true'::jsonb then perform (v->>'confirmation_id')::uuid;if nullif(v->>'confirmation_id','') is null then raise exception 'Bekreft på nytt med egen innlogging.';end if;v:=jsonb_build_object('confirmed',true,'confirmation_id',v->>'confirmation_id');else v:=jsonb_build_object('confirmed',false);end if;
  elsif f->>'type'='multiple' then
   if jsonb_typeof(v) is distinct from 'array' or jsonb_array_length(v)>20 then raise exception 'Ugyldig flervalg.';end if;
   if exists(select 1 from jsonb_array_elements(v) x where jsonb_typeof(x)<>'string' or not(f->'options' ? (x#>>'{}')))
    or (select count(distinct value) from jsonb_array_elements(v))<>jsonb_array_length(v) then raise exception 'Ugyldige svaralternativer.';end if;
   select coalesce(jsonb_agg(value order by ord),'[]') into v from jsonb_array_elements(f->'options') with ordinality q(value,ord) where vals->(f->>'id') ? (value#>>'{}');
  else
   if jsonb_typeof(v) is distinct from 'string' or length(txt)>5000 then raise exception 'Ugyldig tekstsvar.';end if;
   if f->>'type'='number' then
    if txt!~'^-?([0-9]+\.?[0-9]*|\.[0-9]+)$' then raise exception 'Ugyldig tall.';end if;
    if f ? 'min' and txt::numeric<(f->>'min')::numeric then raise exception 'Verdien må være minst %',f->>'min';end if;
   end if;
   if f->>'type'='date' and (txt!~'^\d{4}-\d{2}-\d{2}$' or to_char(txt::date,'YYYY-MM-DD')<>txt) then raise exception 'Ugyldig dato.';end if;
   if f->>'type'='time' and txt!~'^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Ugyldig klokkeslett.';end if;
   if f->>'type'='yesno' and txt not in('Ja','Nei','Ikke aktuelt') or f->>'type'='single' and not(f->'options' ? txt) then raise exception 'Ugyldig valg.';end if;
  end if;
  result:=result||jsonb_build_object(f->>'id',v);
 end loop;
 if finished then
  for f in select value from jsonb_array_elements(kshms_private.checklist_visible_fields(fields,result)) loop
   v:=result->(f->>'id');
   if f->'required'='true'::jsonb and (v is null or v='""'::jsonb or v='[]'::jsonb or f->>'type'='confirmation' and v->'confirmed' is distinct from 'true'::jsonb) then raise exception 'Fyll ut underpunktet: %',f->>'label';end if;
  end loop;
 end if;return result;
end $$;
-- Hash the exact preceding point definitions and answers, excluding confirmation
-- stamps. Future sections can be filled without rewriting the pre-start proof.
create or replace function kshms_private.checklist_prefix_add(prefix jsonb,point jsonb,answer jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare vals jsonb:=coalesce(answer->'values','{}');f jsonb;begin
 for f in select value from jsonb_array_elements(coalesce(point->'fields','[]')) loop if f->>'type'='confirmation' then vals:=vals-(f->>'id');end if;end loop;
 return prefix||jsonb_build_array(jsonb_build_object('point',point,'answer',(answer-'values'-'responsible_identity')||case when point ? 'fields' then jsonb_build_object('values',vals) else '{}'::jsonb end));
end $$;
create or replace function kshms_private.checklist_sign_values(fields jsonb,vals jsonb,previous jsonb,prefix jsonb) returns jsonb language plpgsql stable set search_path='' as $$
declare f jsonb;v jsonb;old jsonb;digest text:=encode(sha256(convert_to(prefix::text,'UTF8')),'hex');row jsonb;item jsonb;begin
 for f in select value from jsonb_array_elements(kshms_private.checklist_visible_fields(fields,vals)) loop
  v:=vals->(f->>'id');if f->>'type'<>'confirmation' or v->'confirmed' is distinct from 'true'::jsonb then continue;end if;
  -- Every required non-confirmation answer in the signed prefix must exist.
  for item in select value from jsonb_array_elements(prefix) loop
   if nullif(item#>>'{answer,status}','') is null then raise exception 'Vurder punktene før du bekrefter.';end if;
   for row in select value from jsonb_array_elements(kshms_private.checklist_visible_fields(coalesce(item#>'{point,fields}','[]'),coalesce(item#>'{answer,values}','{}'))) loop
    if row->>'type'<>'confirmation' and row->'required'='true'::jsonb and (item#>array['answer','values',row->>'id'] is null or item#>array['answer','values',row->>'id'] in ('""'::jsonb,'[]'::jsonb)) then raise exception 'Fyll ut før du bekrefter: %',row->>'label';end if;
   end loop;
  end loop;
  old:=previous->(f->>'id');
  if old->'confirmed'='true'::jsonb and old->>'signed_at' is not null and old->>'confirmation_id'=v->>'confirmation_id' then
   if old->>'content_hash' is distinct from digest then raise exception 'Opplysninger før bekreftelsen er endret. Fjern bekreftelsen, lagre og bekreft på nytt.';end if;v:=old;
  else
   if auth.uid() is null then raise exception 'Logg inn for egen bekreftelse.' using errcode='42501';end if;
   v:=jsonb_build_object('confirmed',true,'confirmation_id',v->>'confirmation_id','signed_by',auth.uid(),'identity',kshms_private.identity_snapshot(auth.uid()),'signed_at',now(),'content_hash',digest);
  end if;
  vals:=vals||jsonb_build_object(f->>'id',v);
 end loop;return vals;
end $$;

-- Version-pinned checklist subforms. Published snapshots stay immutable and
-- retain the exact dependency editions used when the parent was published.
create or replace function kshms_private.checklist_content(p_content jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb; point jsonb; clean jsonb; points jsonb:='[]'; titles text[]:='{}'; ids uuid[]:='{}'; point_id uuid; subform_id uuid; title text;
begin
 if jsonb_typeof(p_content) is distinct from 'object' or length(trim(coalesce(p_content->>'title',''))) not between 1 and 160
 or coalesce(p_content->>'trade','') not in ('Felles – alle fag','Rørlegger','Tømrer','Elektriker','Murer/flislegger','Maler','Ventilasjon','Annet fag')
 or length(trim(coalesce(p_content->>'instructions','')))>4000 or jsonb_typeof(p_content->'points') is distinct from 'array' then raise exception 'Skriv navn, velg fag og legg inn sjekkpunkter.'; end if;
 if jsonb_array_length(p_content->'points') not between 1 and 100 then raise exception 'Legg inn 1–100 sjekkpunkter.'; end if;
 for point in select value from jsonb_array_elements(p_content->'points') loop
  begin point_id:=nullif(point->>'id','')::uuid; exception when invalid_text_representation then raise exception 'Hvert sjekkpunkt må ha egen tekst og gyldige felt.'; end;
  begin subform_id:=nullif(point->>'subform_version_id','')::uuid; exception when invalid_text_representation then raise exception 'Velg en gyldig publisert underskjemaversjon.'; end;
  title:=trim(coalesce(point->>'title',''));
  if point_id is null or point_id=any(ids) or length(title) not between 1 and 600 or lower(title)=any(titles)
  or length(trim(coalesce(point->>'guidance','')))>2000
  or (point ? 'image_required' and jsonb_typeof(point->'image_required')<>'boolean')
  or (point ? 'comment_required' and jsonb_typeof(point->'comment_required')<>'boolean') then raise exception 'Hvert sjekkpunkt må ha egen tekst og gyldige felt.'; end if;
  clean:=jsonb_build_object('id',point_id,'title',title,'guidance',trim(coalesce(point->>'guidance','')),
   'image_required',coalesce((point->>'image_required')::boolean,false),'comment_required',coalesce((point->>'comment_required')::boolean,false));
  if point ? 'fields' and point->'fields'<>'[]'::jsonb then clean:=clean||jsonb_build_object('fields',kshms_private.checklist_fields(point->'fields'));end if;
  if point->'allow_na'='false'::jsonb then clean:=clean||jsonb_build_object('allow_na',false);end if;
  if subform_id is not null then clean:=clean||jsonb_build_object('subform_version_id',subform_id); end if;
  points:=points||jsonb_build_array(clean);ids:=array_append(ids,point_id);titles:=array_append(titles,lower(title));
 end loop;
 result:=jsonb_build_object('title',trim(p_content->>'title'),'trade',p_content->>'trade','instructions',trim(coalesce(p_content->>'instructions','')),'points',points);
 return result;
end $$;


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
   p:=jsonb_build_object('id',pid,'title',kshms_private.execution_text(p,'title',600),'guidance',kshms_private.execution_text(p,'guidance',2000),'image_required',coalesce(p->'image_required'='true'::jsonb,false),'comment_required',coalesce(p->'comment_required'='true'::jsonb,false))||case when c->'points'->(jsonb_array_length(arr)) ? 'fields' and c->'points'->(jsonb_array_length(arr))->'fields'<>'[]'::jsonb then jsonb_build_object('fields',kshms_private.checklist_fields(c->'points'->(jsonb_array_length(arr))->'fields')) else '{}'::jsonb end||case when c->'points'->(jsonb_array_length(arr))->'allow_na'='false'::jsonb then jsonb_build_object('allow_na',false) else '{}'::jsonb end;
   a:=coalesce(c->'answers'->pid::text,'{}');answer_status:=coalesce(a->>'status','');if answer_status not in('','ok','deviation','na') then raise exception 'Velg OK, avvik eller ikke aktuelt.';end if;
   photos:=coalesce(a->'photos','[]');if jsonb_typeof(photos) is distinct from 'array' or jsonb_array_length(photos)>3 then raise exception 'Bruk inntil tre bilder per sjekkpunkt.';end if;
   for photo in select value from jsonb_array_elements(photos) loop
    if nullif(photo->>'id','')::uuid is null or jsonb_typeof(photo->'data') is distinct from 'string' or length(photo->>'data')>400000 or photo->>'data'!~'^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$' then raise exception 'Ugyldig dokumentasjonsbilde.';end if;
   end loop;
   a:=jsonb_build_object('status',answer_status,'comment',kshms_private.execution_text(a,'comment'),'responsible_id',kshms_private.execution_text(a,'responsible_id',36),'due_on',kshms_private.execution_text(a,'due_on',10),'photos',photos);
   if p->'allow_na'='false'::jsonb and answer_status='na' then raise exception 'Punktet kan ikke markeres som ikke aktuelt.';end if;
   if p ? 'fields' then a:=a||jsonb_build_object('values',kshms_private.checklist_values(p->'fields',coalesce(c->'answers'->pid::text->'values','{}'),finished and answer_status<>'na'));end if;
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


create or replace function public.kshms_execution_command(p_company_id uuid,p_action text,p_request_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare x jsonb;e public.kshms_executions%rowtype;receipt public.kshms_execution_commands%rowtype;version_row public.kshms_checklist_versions%rowtype;p public.projects%rowtype;id uuid;project uuid;version uuid;kind text;c jsonb;target uuid;digest text;statement_value text:='Jeg bekrefter at jeg har gjennomført og kontrollert dokumentasjonen sammen med de oppgitte deltakerne.';point jsonb;answer jsonb;risk jsonb;cases jsonb;case_row jsonb;response jsonb;prefix jsonb:='[]';vals jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 if p_action is null or p_action not in('save','complete') or p_request_id is null or jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>3500000 then raise exception 'Ugyldig lagringsforespørsel.';end if;
 perform 1 from public.company_module_access where company_id=p_company_id and module_key='kshms' for update;x:=kshms_private.require_context(p_company_id);
 id:=(p_payload->>'id')::uuid;kind:=p_payload->>'kind';project:=nullif(p_payload->>'project_id','')::uuid;version:=nullif(p_payload->>'template_version_id','')::uuid;
 if id is null or kind not in('round','risk') then raise exception 'Ugyldig gjennomføring.';end if;
 if project is not null then p:=kshms_private.project_checklist_access(p_company_id,project,true);end if;
 digest:=encode(extensions.digest(convert_to(jsonb_build_object('action',p_action,'payload',p_payload)::text,'UTF8'),'sha256'),'hex');
 select * into receipt from public.kshms_execution_commands where company_id=p_company_id and request_id=p_request_id;
 if receipt.request_id is not null then if receipt.actor_id<>auth.uid() or receipt.payload_hash<>digest then raise exception 'Forespørselen er brukt med annen tekst eller bruker.' using errcode='40001';end if;return receipt.result;end if;
 select * into e from public.kshms_executions where kshms_executions.id=id and company_id=p_company_id for update;
 if e.id is not null then
  if not kshms_private.execution_visible(e,x) then raise exception 'Gjennomføringen er ikke tilgjengelig.' using errcode='42501';end if;
  if e.status='completed' then raise exception 'Fullført dokumentasjon kan ikke endres. Start en ny gjennomføring.' using errcode='42501';end if;
  if e.revision is distinct from (p_payload->>'revision')::bigint then raise exception 'En annen person har lagret endringer. Sammenlign med lagret utgave.' using errcode='40001';end if;
  if row(e.kind,e.project_id,e.template_version_id) is distinct from row(kind,project,version) then raise exception 'Prosjekt og malutgave er faste etter første lagring.';end if;
 else
  if (p_payload->>'revision')::bigint is distinct from 0::bigint or exists(select 1 from public.kshms_executions existing where existing.id=id) then raise exception 'Gjennomføringen er ikke tilgjengelig.' using errcode='42501';end if;
  if version is not null then
   if kind<>'round' then raise exception 'Risikovurdering bruker egne jobbspesifikke farer.';end if;
   select v.* into version_row from public.kshms_checklist_versions v join public.kshms_checklist_templates t on t.id=v.template_id and not t.archived where v.id=version and v.company_id=p_company_id;
   if version_row.id is null then raise exception 'Velg en tilgjengelig publisert firmamal.' using errcode='42501';end if;
   e.template_snapshot:=jsonb_build_object('id',version_row.id,'template_id',version_row.template_id,'number',version_row.number,'content_hash',version_row.content_hash,'content',version_row.content);
  end if;
 end if;
 c:=kshms_private.execution_content(p_payload->'content',kind,p_action='complete');
 if version is not null and c->'points' is distinct from e.template_snapshot#>'{content,points}' then raise exception 'En publisert malutgave kan ikke omskrives i gjennomføringen.';end if;
 target:=nullif(c->>'responsible_id','')::uuid;if not kshms_private.deviation_member(p_company_id,target) then raise exception 'Velg en aktiv ansvarlig med KS/HMS-tilgang.' using errcode='42501';end if;
 if kind='round' then
  for point in select value from jsonb_array_elements(c->'points') loop
   answer:=c->'answers'->(point->>'id');prefix:=kshms_private.checklist_prefix_add(prefix,point,answer);
   if point ? 'fields' then vals:=kshms_private.checklist_sign_values(point->'fields',answer->'values',coalesce(e.content->'answers'->(point->>'id')->'values','{}'),prefix);c:=jsonb_set(c,array['answers',point->>'id','values'],vals);end if;
  end loop;
 end if;
 if p_action='complete' and (target<>auth.uid() or p_payload->'confirmed' is distinct from 'true'::jsonb or p_payload->>'statement' is distinct from statement_value) then raise exception 'Bare valgt ansvarlig kan fullføre med egen bekreftelse.' using errcode='42501';end if;
 if kind='round' then
  cases:=c->'answers';for point in select value from jsonb_array_elements(c->'points') loop answer:=cases->(point->>'id');
   if answer->>'responsible_id'<>'' then
    if not kshms_private.deviation_member(p_company_id,(answer->>'responsible_id')::uuid) then raise exception 'Velg en aktiv tiltaksansvarlig med KS/HMS-tilgang.' using errcode='42501';end if;
    answer:=answer||jsonb_build_object('responsible_identity',kshms_private.identity_snapshot((answer->>'responsible_id')::uuid));cases:=cases||jsonb_build_object(point->>'id',answer);
   end if;
  end loop;c:=c||jsonb_build_object('answers',cases);
 else
  cases:='[]';for risk in select value from jsonb_array_elements(c->'risks') loop
   if risk->>'owner_id'<>'' then if not kshms_private.deviation_member(p_company_id,(risk->>'owner_id')::uuid) then raise exception 'Velg en aktiv tiltaksansvarlig med KS/HMS-tilgang.' using errcode='42501';end if;risk:=risk||jsonb_build_object('owner_identity',kshms_private.identity_snapshot((risk->>'owner_id')::uuid));end if;cases:=cases||jsonb_build_array(risk);
  end loop;c:=c||jsonb_build_object('risks',cases);
 end if;
 if e.id is null then
  insert into public.kshms_executions(id,company_id,kind,project_id,template_version_id,template_snapshot,content,responsible_id,responsible_identity,created_by,creator_identity,updated_by,updated_identity)
  values(id,p_company_id,kind,project,version,e.template_snapshot,c,target,kshms_private.identity_snapshot(target),auth.uid(),kshms_private.identity_snapshot(auth.uid()),auth.uid(),kshms_private.identity_snapshot(auth.uid())) returning * into e;
 else update public.kshms_executions set content=c,responsible_id=target,responsible_identity=kshms_private.identity_snapshot(target),updated_by=auth.uid(),updated_identity=kshms_private.identity_snapshot(auth.uid()),updated_at=now(),revision=revision+1 where kshms_executions.id=e.id returning * into e;end if;
 if p_action='complete' then
  if kind='round' then for point in select value from jsonb_array_elements(c->'points') loop answer:=c->'answers'->(point->>'id');if answer->>'status'='deviation' then
   case_row:=public.kshms_deviation_command(p_company_id,'create',jsonb_build_object('request_id',gen_random_uuid(),'title',left('Kontrollavvik: '||(point->>'title'),160),'event','Fra vernerunde/kontroll «'||(c->>'title')||'», punkt «'||(point->>'title')||'».'||E'\n'||(answer->>'comment'),'category','hms','responsible_id',answer->>'responsible_id','due_on',answer->>'due_on','project_id',project,'source_kind','company','source_key','execution:'||e.id::text||':'||(point->>'id'),'immediate_action',''));
   insert into public.kshms_execution_deviations(execution_id,point_id,deviation_id,point_title) values(e.id,(point->>'id')::uuid,(case_row->>'id')::uuid,point->>'title');
  end if;end loop;end if;
  update public.kshms_executions set status='completed',completed_by=auth.uid(),completed_identity=kshms_private.identity_snapshot(auth.uid()),completed_at=now(),statement=statement_value where kshms_executions.id=e.id returning * into e;
 end if;
 response:=jsonb_build_object('record',jsonb_build_object('id',e.id,'company_id',e.company_id,'revision',e.revision,'status',e.status));insert into public.kshms_execution_commands(company_id,request_id,actor_id,payload_hash,result) values(p_company_id,p_request_id,auth.uid(),digest,response);return response;
end $$;

-- Allow adding own points to a draft; completed controls keep their definition.
-- Qualify the category variable in concurrent-control lookups.
create or replace function public.project_checklist_command(p_company_id uuid,p_project_id uuid,p_action text,p_request_id uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
<<checklist_write>>
declare p public.projects%rowtype;r kshms_private.project_checklist_runs%rowtype;receipt kshms_private.project_checklist_receipts%rowtype;
 v public.kshms_checklist_versions%rowtype;instance jsonb;def jsonb;answers jsonb:='{}';a jsonb;item text;previous jsonb;req jsonb;
 rid uuid;category text;payload_hash text;result jsonb;predecessor uuid;canonical jsonb;prefix jsonb:='[]';vals jsonb;fields jsonb;begin
 p:=kshms_private.project_checklist_access(p_company_id,p_project_id,true);
 if p_request_id is null or p_action not in ('save','complete') or jsonb_typeof(p_payload) is distinct from 'object'
 then raise exception 'Ugyldig sjekklistelagring.';end if;
 payload_hash:=encode(sha256(convert_to(p_action||p_payload::text,'UTF8')),'hex');
 select * into receipt from kshms_private.project_checklist_receipts q where q.company_id=p_company_id and q.project_id=p_project_id and q.request_id=p_request_id;
 if found then
  if receipt.actor_id<>auth.uid() or receipt.payload_hash<>payload_hash then raise exception 'Lagringsforsøket er endret.' using errcode='40001';end if;
  return receipt.result;
 end if;
 rid:=(p_payload->>'id')::uuid;def:=p_payload->'definition';category:=def->>'category';
 if rid is null or nullif(trim(category),'') is null or length(category)>800 or jsonb_typeof(def->'items') is distinct from 'array'
 or jsonb_array_length(def->'items') not between 1 and 200 or jsonb_typeof(p_payload->'answers') is distinct from 'object'
 then raise exception 'Sjekklisten mangler gyldige punkter.';end if;
 select * into r from kshms_private.project_checklist_runs where id=rid;
 if found then
  if r.company_id<>p_company_id or r.project_id<>p_project_id or r.category<>category then raise exception 'Kontrollen tilhører et annet prosjekt.' using errcode='42501';end if;
  if r.status<>'draft' or r.revision<>coalesce((p_payload->>'revision')::bigint,-1) or (r.definition<>def and (category not like 'Egne sjekkpunkter%' or r.definition->>'source_version_id' is not null or def->>'source_version_id' is not null))
  then raise exception 'En annen person har lagret eller fullført denne kontrollen. Kladden er beholdt. Åpne den lagrede kontrollen og sammenlign.' using errcode='40001';end if;
 else
  select id into predecessor from kshms_private.project_checklist_runs q where q.project_id=p_project_id and q.category=checklist_write.category order by sequence desc limit 1;
  if coalesce((p_payload->>'revision')::bigint,-1)<>0 or predecessor is distinct from (p_payload->>'predecessor_id')::uuid
  or exists(select 1 from kshms_private.project_checklist_runs q where q.project_id=p_project_id and q.category=checklist_write.category and q.status='draft')
  then raise exception 'En annen person har startet eller lagret kontrollen. Kladden er beholdt. Åpne den lagrede kontrollen og sammenlign.' using errcode='40001';end if;
  select value into instance from jsonb_array_elements(coalesce(p.data#>'{project,kshmsChecklistInstances}','[]'::jsonb)) where value->>'category'=category limit 1;
  if instance is not null then
   select * into v from public.kshms_checklist_versions where id=(instance->>'version_id')::uuid and company_id=p_company_id;
   if v.id is null or def->>'source_version_id' is distinct from v.id::text
   or def->'items' is distinct from (select jsonb_agg(point->'title') from jsonb_array_elements(v.content->'points') point)
   or coalesce(def->'requirements','{}') is distinct from (select jsonb_object_agg(point->>'title',jsonb_build_object('image_required',point->'image_required','comment_required',point->'comment_required','guidance',point->'guidance')||case when point ? 'fields' then jsonb_build_object('fields',point->'fields') else '{}'::jsonb end||case when point->'allow_na'='false'::jsonb then jsonb_build_object('allow_na',false) else '{}'::jsonb end) from jsonb_array_elements(v.content->'points') point)
   then raise exception 'Den innhentede malutgaven er endret. Åpne sjekklisten på nytt.';end if;
  elsif def->>'source_version_id' is not null then raise exception 'Malutgaven finnes ikke i dette prosjektet.' using errcode='42501';end if;
 end if;
 if (select count(distinct value) from jsonb_array_elements_text(def->'items'))<>jsonb_array_length(def->'items') then raise exception 'Sjekkpunktene må ha ulik tekst.';end if;
 for item in select jsonb_array_elements_text(def->'items') loop
  if nullif(trim(item),'') is null or length(item)>2000 then raise exception 'Ugyldig sjekkpunkt.';end if;
  a:=coalesce(p_payload->'answers'->item,'{}'::jsonb);previous:=coalesce(p.data#>array['checklist',category,item],'{}'::jsonb);
  if jsonb_typeof(a)<>'object' or coalesce(a->>'status','') not in ('','Ok','Ikke aktuelt','Avvik','Lukket avvik')
  or length(coalesce(a->>'comment',''))>20000 or jsonb_typeof(coalesce(a->'photos','[]'))<>'array'
  or jsonb_array_length(coalesce(a->'photos','[]'))>100 then raise exception 'Ugyldig svar eller dokumentasjon.';end if;
  -- Preserve source links when starting the next control. The existing guard
  -- resolves their current authoritative status when the project is updated.
  if previous->>'ks_deviation_id' is not null then
   a:=a||jsonb_build_object('ks_deviation_id',previous->'ks_deviation_id','status',previous->'status',
    'closedAt',previous->'closedAt','closedBy',previous->'closedBy','closeComment',previous->'closeComment');
  elsif a->>'ks_deviation_id' is not null then raise exception 'Avvikslenken finnes ikke i prosjektet.';end if;
  req:=coalesce(def->'requirements'->item,'{}'::jsonb);
  if req->'allow_na'='false'::jsonb and a->>'status'='Ikke aktuelt' then raise exception 'Punktet kan ikke markeres som ikke aktuelt.';end if;
  if req ? 'fields' then
   fields:=kshms_private.checklist_fields(req->'fields');vals:=kshms_private.checklist_values(fields,coalesce(a->'values','{}'),p_action='complete' and coalesce(a->>'status','')<>'Ikke aktuelt');a:=a||jsonb_build_object('values',vals);
  end if;
  prefix:=kshms_private.checklist_prefix_add(prefix,req||jsonb_build_object('title',item),a);
  if req ? 'fields' then
   vals:=kshms_private.checklist_sign_values(fields,vals,coalesce(r.answers->item->'values','{}'),prefix);a:=a||jsonb_build_object('values',vals);
  end if;
  if p_action='complete' then
   req:=coalesce(def->'requirements'->item,'{}'::jsonb);
   if nullif(a->>'status','') is null then raise exception 'Vurder alle punktene før du fullfører. Mangler: %',item;end if;
   if a->>'status'<>'Ikke aktuelt' then
    if coalesce((req->>'documentation_either')::boolean,false) then
     if nullif(trim(a->>'comment'),'') is null and not exists(select 1 from jsonb_array_elements(coalesce(a->'photos','[]')) photo where nullif(trim(photo->>'url'),'') is not null) then raise exception 'Legg til bilde eller kommentar: %',item;end if;
    else
     if coalesce((req->>'comment_required')::boolean,false) and nullif(trim(a->>'comment'),'') is null then raise exception 'Legg til kommentar: %',item;end if;
     if coalesce((req->>'image_required')::boolean,false) and not exists(select 1 from jsonb_array_elements(coalesce(a->'photos','[]')) photo where nullif(trim(photo->>'url'),'') is not null) then raise exception 'Legg til bilde: %',item;end if;
    end if;
   end if;
  end if;
  answers:=answers||jsonb_build_object(item,a);
 end loop;
 if r.id is null then
  insert into kshms_private.project_checklist_runs(id,company_id,project_id,category,definition,answers,status,created_by,updated_by,updated_identity)
  values(rid,p_company_id,p_project_id,category,def,answers,'draft',auth.uid(),auth.uid(),kshms_private.identity_snapshot(auth.uid())) returning * into r;
 else
  update kshms_private.project_checklist_runs set answers=checklist_write.answers,definition=def,revision=revision+1,updated_at=now(),updated_by=auth.uid(),updated_identity=kshms_private.identity_snapshot(auth.uid()) where id=r.id returning * into r;
 end if;
 update public.projects set data=jsonb_set(coalesce(data,'{}'::jsonb),'{checklist}',
  jsonb_set(coalesce(data->'checklist','{}'::jsonb),array[category],coalesce(data->'checklist'->category,'{}'::jsonb)||answers,true),true),updated_at=now()
 where id=p_project_id returning data->'checklist'->category into canonical;
 select jsonb_object_agg(value,canonical->value) into answers from jsonb_array_elements_text(def->'items');
 update kshms_private.project_checklist_runs set answers=checklist_write.answers,
  status=case when p_action='complete' then 'completed' else 'draft' end,
  completed_at=case when p_action='complete' then now() end,completed_by=case when p_action='complete' then auth.uid() end,
  completed_identity=case when p_action='complete' then kshms_private.identity_snapshot(auth.uid()) end
 where id=r.id returning * into r;
 result:=jsonb_build_object('context',jsonb_build_object('company_id',p_company_id,'project_id',p_project_id,'user_id',auth.uid()),'run',to_jsonb(r),'answers',canonical);
 insert into kshms_private.project_checklist_receipts values(p_company_id,p_project_id,p_request_id,auth.uid(),payload_hash,result);
 insert into public.kshms_audit(company_id,actor_id,action,object_id) values(p_company_id,auth.uid(),'project-checklist-'||p_action,r.id);
 return result;
end $$;

revoke all on function kshms_private.checklist_fields(jsonb),kshms_private.checklist_visible_fields(jsonb,jsonb),kshms_private.checklist_values(jsonb,jsonb,boolean),kshms_private.checklist_prefix_add(jsonb,jsonb,jsonb),kshms_private.checklist_sign_values(jsonb,jsonb,jsonb,jsonb) from public,anon,authenticated;
notify pgrst,'reload schema';

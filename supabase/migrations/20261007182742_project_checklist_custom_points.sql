-- Allow adding own points to a draft; completed controls keep their definition.
-- Qualify the category variable in concurrent-control lookups.
create or replace function public.project_checklist_command(p_company_id uuid,p_project_id uuid,p_action text,p_request_id uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
<<checklist_write>>
declare p public.projects%rowtype;r kshms_private.project_checklist_runs%rowtype;receipt kshms_private.project_checklist_receipts%rowtype;
 v public.kshms_checklist_versions%rowtype;instance jsonb;def jsonb;answers jsonb:='{}';a jsonb;item text;previous jsonb;req jsonb;
 rid uuid;category text;payload_hash text;result jsonb;predecessor uuid;canonical jsonb;begin
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
   or coalesce(def->'requirements','{}') is distinct from (select jsonb_object_agg(point->>'title',jsonb_build_object('image_required',point->'image_required','comment_required',point->'comment_required','guidance',point->'guidance')) from jsonb_array_elements(v.content->'points') point)
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
notify pgrst,'reload schema';

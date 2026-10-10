-- Version-pinned checklist subforms. Published snapshots stay immutable and
-- retain the exact dependency editions used when the parent was published.
create or replace function kshms_private.checklist_content(p_content jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb; point jsonb; clean jsonb; points jsonb:='[]'; titles text[]:='{}'; ids uuid[]:='{}'; point_id uuid; subform_id uuid; title text;
begin
 if jsonb_typeof(p_content) is distinct from 'object' or length(trim(coalesce(p_content->>'title',''))) not between 1 and 160
 or coalesce(p_content->>'trade','') not in ('Rørlegger','Tømrer','Elektriker','Murer/flislegger','Maler','Ventilasjon','Annet fag')
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
  if subform_id is not null then clean:=clean||jsonb_build_object('subform_version_id',subform_id); end if;
  points:=points||jsonb_build_array(clean);ids:=array_append(ids,point_id);titles:=array_append(titles,lower(title));
 end loop;
 result:=jsonb_build_object('title',trim(p_content->>'title'),'trade',p_content->>'trade','instructions',trim(coalesce(p_content->>'instructions','')),'points',points);
 return result;
end $$;

create or replace function kshms_private.checklist_snapshot_contains_template(p_content jsonb,p_template_id uuid) returns boolean language plpgsql immutable set search_path='' as $$
declare dependency jsonb;
begin
 for dependency in select value from jsonb_array_elements(coalesce(p_content->'dependencies','[]'::jsonb)) loop
  if nullif(dependency->>'template_id','')::uuid=p_template_id or kshms_private.checklist_snapshot_contains_template(dependency->'content',p_template_id) then return true; end if;
 end loop;
 return false;
end $$;

create or replace function kshms_private.checklist_point_uuid(p_template_id uuid,p_parent_point_id uuid,p_version_id uuid,p_point_id uuid) returns uuid language sql immutable set search_path='' as $$
 select (substr(x,1,8)||'-'||substr(x,9,4)||'-'||substr(x,13,4)||'-'||substr(x,17,4)||'-'||substr(x,21,12))::uuid
 from (select md5(p_template_id::text||':'||p_parent_point_id::text||':'||p_version_id::text||':'||p_point_id::text) x) q
$$;

create or replace function kshms_private.checklist_snapshot(p_company_id uuid,p_template_id uuid,p_content jsonb) returns jsonb language plpgsql stable set search_path='' as $$
declare clean jsonb:=kshms_private.checklist_content(p_content); point jsonb; child jsonb; flat_points jsonb:='[]'; dependencies jsonb:='[]';
 subform_id uuid; subform public.kshms_checklist_versions%rowtype; subform_template public.kshms_checklist_templates%rowtype; child_title text; child_clean jsonb;
begin
 for point in select value from jsonb_array_elements(clean->'points') loop
  flat_points:=flat_points||jsonb_build_array(point-'subform_version_id');subform_id:=nullif(point->>'subform_version_id','')::uuid;
  if subform_id is null then continue; end if;
  select v.* into subform from public.kshms_checklist_versions v where v.id=subform_id and v.company_id=p_company_id;
  if not found then raise exception 'Underskjemaet er ikke tilgjengelig i dette firmaet. Oppdater og prøv igjen.' using errcode='42501'; end if;
  select t.* into subform_template from public.kshms_checklist_templates t where t.id=subform.template_id and t.company_id=p_company_id;
  if not found or subform_template.archived then raise exception 'Underskjemaet er arkivert eller utilgjengelig. Velg en aktiv publisert utgave.'; end if;
  if subform.template_id=p_template_id or kshms_private.checklist_snapshot_contains_template(subform.content,p_template_id) then raise exception 'Underskjemaet lager en sirkel. Fjern koblingen før lagring.'; end if;
  dependencies:=dependencies||jsonb_build_array(jsonb_build_object('version_id',subform.id,'template_id',subform.template_id,'number',subform.number,
   'content_hash',subform.content_hash,'title',subform.content->>'title','trade',subform.content->>'trade','content',subform.content));
  for child in select value from jsonb_array_elements(subform.content->'points') loop
   child_title:='Underskjema · '||(subform.content->>'title')||' · '||(child->>'title');
   if length(child_title)>600 then raise exception 'Et underskjemapunkt blir lengre enn 600 tegn etter navngiving.'; end if;
   child_clean:=(child-'subform_version_id')||jsonb_build_object('id',kshms_private.checklist_point_uuid(p_template_id,(point->>'id')::uuid,subform.id,(child->>'id')::uuid),'title',child_title);
   flat_points:=flat_points||jsonb_build_array(child_clean);
  end loop;
 end loop;
 if jsonb_array_length(flat_points)>100 then raise exception 'Sjekklisten og underskjemaene kan til sammen ha inntil 100 utføringspunkter.'; end if;
 return clean||jsonb_build_object('root_points',clean->'points','points',flat_points,'dependencies',dependencies);
end $$;

create or replace function public.kshms_checklist_state(p_company_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;begin
 x:=kshms_private.require_context(p_company_id,true);
 return jsonb_build_object('context',x,'templates',coalesce((select jsonb_agg(to_jsonb(t) order by t.updated_at desc,t.id) from public.kshms_checklist_templates t where t.company_id=p_company_id),'[]'::jsonb),
 'versions',coalesce((select jsonb_agg(to_jsonb(v) order by v.published_at desc,v.number desc,v.id) from public.kshms_checklist_versions v where v.company_id=p_company_id),'[]'::jsonb));
end $$;

create or replace function public.kshms_checklist_command(p_company_id uuid,p_action text,p_request_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; t public.kshms_checklist_templates%rowtype; v public.kshms_checklist_versions%rowtype; receipt public.kshms_checklist_commands%rowtype;
 content jsonb; snapshot jsonb; content_hash text; payload_hash text; template_id uuid; result jsonb;
begin
 x:=kshms_private.require_context(p_company_id,true,p_action='publish');
 perform 1 from public.company_module_access where company_id=p_company_id and module_key='kshms' for update;
 x:=kshms_private.require_context(p_company_id,true,p_action='publish');
 if p_request_id is null or p_action not in ('save','publish','archive') or jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'Invalid checklist command'; end if;
 payload_hash:=encode(sha256(convert_to(p_action||p_payload::text,'UTF8')),'hex');
 select * into receipt from public.kshms_checklist_commands where company_id=p_company_id and request_id=p_request_id;
 if found then
  if receipt.actor_id<>auth.uid() or receipt.payload_hash<>payload_hash then raise exception 'Request reused with different content' using errcode='40001'; end if;
  return receipt.result;
 end if;
 template_id:=(p_payload->>'id')::uuid;
 if template_id is null then raise exception 'Missing checklist id'; end if;
 select * into t from public.kshms_checklist_templates where id=template_id and company_id=p_company_id for update;
 if not found then
  if p_action='archive' or coalesce((p_payload->>'revision')::bigint,-1)<>0 then raise exception 'Sjekklisten er endret. Oppdater og sammenlign teksten.' using errcode='40001'; end if;
  content:=kshms_private.checklist_content(p_payload->'content');
  perform kshms_private.checklist_snapshot(p_company_id,template_id,content);
  insert into public.kshms_checklist_templates(id,company_id,draft,created_by,updated_by) values(template_id,p_company_id,content,auth.uid(),auth.uid()) returning * into t;
 else
  if t.archived or t.revision<>coalesce((p_payload->>'revision')::bigint,-1) then raise exception 'Sjekklisten er endret eller arkivert. Oppdater og sammenlign teksten.' using errcode='40001'; end if;
  if p_action='archive' then
   update public.kshms_checklist_templates set archived=true,revision=revision+1,updated_by=auth.uid(),updated_at=now() where id=t.id returning * into t;
  else
   content:=kshms_private.checklist_content(p_payload->'content');
   perform kshms_private.checklist_snapshot(p_company_id,template_id,content);
   update public.kshms_checklist_templates set draft=content,revision=revision+1,updated_by=auth.uid(),updated_at=now() where id=t.id returning * into t;
  end if;
 end if;
 if p_action='publish' then
  snapshot:=kshms_private.checklist_snapshot(p_company_id,t.id,content);
  content_hash:=encode(sha256(convert_to(snapshot::text,'UTF8')),'hex');
  select * into v from public.kshms_checklist_versions cv where cv.company_id=p_company_id and cv.template_id=t.id order by cv.number desc limit 1;
  if v.id is null or v.content_hash<>content_hash then
   insert into public.kshms_checklist_versions(company_id,template_id,number,content,content_hash,published_by,published_identity)
   values(p_company_id,t.id,coalesce(v.number,0)+1,snapshot,content_hash,auth.uid(),kshms_private.identity_snapshot(auth.uid())) returning * into v;
  end if;
 end if;
 result:=jsonb_build_object('template',to_jsonb(t),'version',case when v.id is null then null else to_jsonb(v) end);
 insert into public.kshms_checklist_commands(company_id,request_id,actor_id,payload_hash,result) values(p_company_id,p_request_id,auth.uid(),payload_hash,result);
 insert into public.kshms_audit(company_id,actor_id,action,object_id) values(p_company_id,auth.uid(),'checklist-'||p_action,t.id);
 return result;
end $$;

revoke all on function kshms_private.checklist_content(jsonb),kshms_private.checklist_snapshot_contains_template(jsonb,uuid),kshms_private.checklist_point_uuid(uuid,uuid,uuid,uuid),kshms_private.checklist_snapshot(uuid,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.kshms_checklist_state(uuid),public.kshms_checklist_command(uuid,text,uuid,jsonb) from public,anon;
grant execute on function public.kshms_checklist_state(uuid),public.kshms_checklist_command(uuid,text,uuid,jsonb) to authenticated;
notify pgrst,'reload schema';

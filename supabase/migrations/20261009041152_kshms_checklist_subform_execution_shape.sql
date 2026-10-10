-- Keep dependency references in root_points/dependencies. Execution points must
-- retain the established point-only shape used by standalone and project runs.
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
revoke all on function kshms_private.checklist_snapshot(uuid,uuid,jsonb) from public,anon,authenticated;

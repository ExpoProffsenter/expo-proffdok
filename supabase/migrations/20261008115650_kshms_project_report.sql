-- Optional, read-only report snapshots. Selection is per export, never written
-- into the project's public/portal JSON. Existing project and case gates apply.
create function public.kshms_project_report(p_company_id uuid,p_project_id uuid,p_sja_ids uuid[] default null,p_ruh_ids uuid[] default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; p public.projects%rowtype; sjas jsonb; ruhs jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 if p_project_id is null then raise exception 'Velg et lagret prosjekt.'; end if;
 p:=kshms_private.project_checklist_access(p_company_id,p_project_id,false);
 x:=x||jsonb_build_object('project_id',p.id);
 if (p_sja_ids is null)<>(p_ruh_ids is null) then raise exception 'Ugyldig rapportvalg.'; end if;
 if p_sja_ids is null then
  select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'title',s.content->>'title','status',s.status,'signed_at',s.signed_at) order by s.updated_at desc,s.id),'[]') into sjas
  from public.kshms_sjas s where s.company_id=p_company_id and s.project_id=p_project_id
  and (s.status='signed' or s.created_by=auth.uid() or s.leader_id=auth.uid() or (x->>'manage')::boolean);
  select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'title',d.title,'status',d.status) order by d.created_at desc,d.id),'[]') into ruhs
  from public.kshms_deviations d where d.company_id=p_company_id and d.project_id=p_project_id and d.category='ruh' and kshms_private.deviation_visible(d,x);
  return jsonb_build_object('context',x,'choices',jsonb_build_object('sjas',sjas,'ruhs',ruhs));
 end if;
 if cardinality(p_sja_ids)>100 or cardinality(p_ruh_ids)>100
 or cardinality(p_sja_ids)<>(select count(distinct i) from unnest(p_sja_ids) i)
 or cardinality(p_ruh_ids)<>(select count(distinct i) from unnest(p_ruh_ids) i) then raise exception 'Velg inntil 100 ulike SJA-er og 100 ulike RUH-er.'; end if;
 select coalesce(jsonb_agg(to_jsonb(s) order by array_position(p_sja_ids,s.id)),'[]') into sjas
 from public.kshms_sjas s where s.company_id=p_company_id and s.project_id=p_project_id and s.id=any(p_sja_ids)
 and (s.status='signed' or s.created_by=auth.uid() or s.leader_id=auth.uid() or (x->>'manage')::boolean);
 select coalesce(jsonb_agg(to_jsonb(d) order by array_position(p_ruh_ids,d.id)),'[]') into ruhs
 from public.kshms_deviations d where d.company_id=p_company_id and d.project_id=p_project_id and d.id=any(p_ruh_ids) and d.category='ruh' and kshms_private.deviation_visible(d,x);
 if jsonb_array_length(sjas)<>cardinality(p_sja_ids) or jsonb_array_length(ruhs)<>cardinality(p_ruh_ids) then
  raise exception 'Et valgt dokument er ikke lenger tilgjengelig på dette prosjektet. Oppdater listen og velg på nytt.' using errcode='42501';
 end if;
 return jsonb_build_object('context',x,'sjas',sjas,'ruhs',ruhs);
end $$;
revoke all on function public.kshms_project_report(uuid,uuid,uuid[],uuid[]) from public,anon;
grant execute on function public.kshms_project_report(uuid,uuid,uuid[],uuid[]) to authenticated;
notify pgrst,'reload schema';

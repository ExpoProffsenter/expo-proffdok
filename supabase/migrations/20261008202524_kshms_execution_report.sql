-- Additive read-only report selection; existing SJA/RUH RPC and all commands remain unchanged.
create function public.kshms_project_execution_report(p_company_id uuid,p_project_id uuid,p_round_ids uuid[] default null,p_risk_ids uuid[] default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;p public.projects%rowtype;rounds jsonb;risks jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 if p_project_id is null then raise exception 'Velg et lagret prosjekt.';end if;
 p:=kshms_private.project_checklist_access(p_company_id,p_project_id,false);
 x:=x||jsonb_build_object('project_id',p.id);
 if (p_round_ids is null)<>(p_risk_ids is null) then raise exception 'Ugyldig rapportvalg.';end if;
 if p_round_ids is null then
  select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'title',e.content->>'title','status',e.status,'completed_at',e.completed_at) order by e.updated_at desc,e.id),'[]') into rounds
  from public.kshms_executions e where e.company_id=p_company_id and e.project_id=p_project_id and e.kind='round' and kshms_private.execution_visible(e,x);
  select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'title',e.content->>'title','status',e.status,'completed_at',e.completed_at) order by e.updated_at desc,e.id),'[]') into risks
  from public.kshms_executions e where e.company_id=p_company_id and e.project_id=p_project_id and e.kind='risk' and kshms_private.execution_visible(e,x);
  return jsonb_build_object('context',x,'choices',jsonb_build_object('rounds',rounds,'risks',risks));
 end if;
 if cardinality(p_round_ids)>100 or cardinality(p_risk_ids)>100
 or cardinality(p_round_ids)<>(select count(distinct i) from unnest(p_round_ids) i)
 or cardinality(p_risk_ids)<>(select count(distinct i) from unnest(p_risk_ids) i) then raise exception 'Velg inntil 100 ulike kontroller og 100 ulike risikovurderinger.';end if;
 select coalesce(jsonb_agg(to_jsonb(e)||jsonb_build_object('project_name',coalesce(p.data#>>'{project,projectName}',p.title)) order by array_position(p_round_ids,e.id)),'[]') into rounds
 from public.kshms_executions e where e.company_id=p_company_id and e.project_id=p_project_id and e.kind='round' and e.id=any(p_round_ids) and kshms_private.execution_visible(e,x);
 select coalesce(jsonb_agg(to_jsonb(e)||jsonb_build_object('project_name',coalesce(p.data#>>'{project,projectName}',p.title)) order by array_position(p_risk_ids,e.id)),'[]') into risks
 from public.kshms_executions e where e.company_id=p_company_id and e.project_id=p_project_id and e.kind='risk' and e.id=any(p_risk_ids) and kshms_private.execution_visible(e,x);
 if jsonb_array_length(rounds)<>cardinality(p_round_ids) or jsonb_array_length(risks)<>cardinality(p_risk_ids) then raise exception 'Et valgt dokument er ikke lenger tilgjengelig på dette prosjektet. Oppdater listen og velg på nytt.' using errcode='42501';end if;
 if octet_length(rounds::text)+octet_length(risks::text)>12000000 then raise exception 'Dokumentvalget er for stort. Velg færre dokumenter per rapport.';end if;
 return jsonb_build_object('context',x,'rounds',rounds,'risks',risks);
end $$;
revoke all on function public.kshms_project_execution_report(uuid,uuid,uuid[],uuid[]) from public,anon;
grant execute on function public.kshms_project_execution_report(uuid,uuid,uuid[],uuid[]) to authenticated;
notify pgrst,'reload schema';

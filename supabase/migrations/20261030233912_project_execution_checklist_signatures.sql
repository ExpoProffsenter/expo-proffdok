alter table kshms_private.project_checklist_runs add column signatures jsonb not null default '{}' check(jsonb_typeof(signatures)='object');
-- Planning has its own established completion contract and is explicitly excluded.
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('public.project_checklist_command(uuid,uuid,text,uuid,jsonb)'::regprocedure);
 anchor:=$a$ update kshms_private.project_checklist_runs set answers=checklist_write.answers,
  status=case$a$;
 if (length(body)-length(replace(body,anchor,'')))/length(anchor)<>1 then raise exception 'Missing project signature completion anchor';end if;
 body:=replace(body,anchor,$a$ update kshms_private.project_checklist_runs set answers=checklist_write.answers,
  signatures=case when checklist_write.category='Prosjektering – kontroll av grunnlag og løsninger' then '{}'::jsonb else
   kshms_private.execution_checklist_signatures(p_payload->'signatures',r.signatures,
    jsonb_build_object('company_id',p_company_id,'project_id',p_project_id,'definition',def,'answers',checklist_write.answers,
     'project',jsonb_build_object('title',p.title,'name',p.data#>'{project,projectName}','address',p.data#>'{project,address}','postnr',p.data#>'{project,postnr}','city',p.data#>'{project,city}','customer',p.data#>'{project,customer}')),r.id,r.revision,p_action='complete' and (coalesce(p_payload->>'signature_contract','')='execution-v1' or (select enforced from kshms_private.execution_signature_rollout where singleton))) end,
  status=case$a$);
 execute body;
end $patch$;
notify pgrst,'reload schema';

create function public.project_checklist_signed_command(p_company_id uuid,p_project_id uuid,p_action text,p_request_id uuid,p_payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select public.project_checklist_command(p_company_id,p_project_id,p_action,p_request_id,p_payload||jsonb_build_object('signature_contract','execution-v1'))$$;
revoke all on function public.project_checklist_signed_command(uuid,uuid,text,uuid,jsonb) from public,anon,service_role;
grant execute on function public.project_checklist_signed_command(uuid,uuid,text,uuid,jsonb) to authenticated;

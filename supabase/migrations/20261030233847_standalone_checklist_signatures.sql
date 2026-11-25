alter table checklist_private.runs add column signatures jsonb not null default '{}' check(jsonb_typeof(signatures)='object');
-- Exact insertion anchors fail closed if the established command contract moves.
do $patch$
declare body text;anchor text;replacement text;
begin
 body:=pg_get_functiondef('public.standalone_checklist_command(uuid,text,uuid,jsonb)'::regprocedure);
 anchor:='declare x jsonb;';
 if (length(body)-length(replace(body,anchor,'')))/length(anchor)<>1 then raise exception 'Missing standalone signature declaration anchor';end if;
 body:=replace(body,anchor,'declare signed_signatures jsonb;x jsonb;');
 anchor:=E' if r.id is null then\n  insert into checklist_private.runs';
 replacement:=$a$ signed_signatures:=kshms_private.execution_checklist_signatures(p_payload->'signatures',r.signatures,
  jsonb_build_object('company_id',p_company_id,'created_by',auth.uid(),'definition',def,'version_id',ver,'order_number',ord,'work_site',site,'external_project',ext,'customer_name',customer,'answers',clean_answers),rid,coalesce(r.revision,0)+1,p_action='complete' and (coalesce(p_payload->>'signature_contract','')='execution-v1' or (select enforced from kshms_private.execution_signature_rollout where singleton)));
 if r.id is null then
  insert into checklist_private.runs$a$;
 if (length(body)-length(replace(body,anchor,'')))/length(anchor)<>1 then raise exception 'Missing standalone signature persistence anchor';end if;
 body:=replace(body,anchor,replacement);
 anchor:=$a$ if p_action='complete' then update checklist_private.runs set status='completed'$a$;
 if (length(body)-length(replace(body,anchor,'')))/length(anchor)<>1 then raise exception 'Missing standalone signature completion anchor';end if;
 body:=replace(body,anchor,$a$ update checklist_private.runs set signatures=signed_signatures where id=rid returning * into r;
 if p_action='complete' then update checklist_private.runs set status='completed'$a$);
 execute body;
end $patch$;
notify pgrst,'reload schema';

create function public.standalone_checklist_signed_command(p_company_id uuid,p_action text,p_request_id uuid,p_payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select public.standalone_checklist_command(p_company_id,p_action,p_request_id,p_payload||jsonb_build_object('signature_contract','execution-v1'))$$;
revoke all on function public.standalone_checklist_signed_command(uuid,text,uuid,jsonb) from public,anon,service_role;
grant execute on function public.standalone_checklist_signed_command(uuid,text,uuid,jsonb) to authenticated;

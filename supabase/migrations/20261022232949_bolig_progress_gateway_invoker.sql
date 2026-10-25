-- Preserve the established thin SECURITY INVOKER gateway. Batch dispatch belongs
-- inside the already authenticated private workspace, not an exposed definer.
do $$declare definition text;anchor text:=E'begin\n ctx:=bolig_private.context(c);';begin
 definition:=pg_get_functiondef('bolig_private.progress_workspace(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 if position(anchor in definition)=0 then raise exception 'Progress workspace authorization anchor missing';end if;
 definition:=replace(definition,anchor,E'begin\n if action=''batch'' then return bolig_private.progress_batch(c,root,unit,payload);end if;\n ctx:=bolig_private.context(c);');
 execute definition;
end$$;
create or replace function public.bolig_progress(p_company_id uuid,p_root_id uuid,p_unit_id uuid default null,p_action text default 'get',p_payload jsonb default '{}')
returns jsonb language sql security invoker set search_path='' as $$select bolig_private.progress_workspace(p_company_id,p_root_id,p_unit_id,p_action,p_payload)$$;
notify pgrst,'reload schema';

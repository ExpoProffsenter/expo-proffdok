-- One canonical manager assessment for all new actual handover registrations.
-- Legacy records remain readable, but the former strict-control shortcut must
-- not bypass a manager's explicit obstacle or a changed open-case list.
do $patch$
declare body text;
begin
 body:=pg_get_functiondef('bolig_private.completion(uuid,uuid,uuid,text,bigint,jsonb)'::regprocedure);
 if position(' if action<>''get'' then' in body)=0 then raise exception 'Missing completion authorization anchor';end if;
 body:=replace(body,' if action<>''get'' then',E' if action=''handover'' then raise exception ''Registrer faktisk overtakelse gjennom prosjektleders vurdering av åpne forhold.'' using errcode=''PT409'';end if;\n if action<>''get'' then');
 execute body;
end$patch$;
notify pgrst,'reload schema';

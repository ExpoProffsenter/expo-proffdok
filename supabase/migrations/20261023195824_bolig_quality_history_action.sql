-- In the native quality reader, action/reason are also PL/pgSQL variables.
-- Qualify event columns so history reports the stored action and reason.
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_private.quality(uuid,uuid,uuid,text,bigint,jsonb)'::regprocedure);
 anchor:='select revision,action,actor_name,created_at,reason from bolig_private.quality_events where root_id=root and scope_id=scope order by revision desc limit 100';
 if position(anchor in body)=0 then raise exception 'Missing native quality history projection';end if;
 execute replace(body,anchor,'select ev.revision,ev.action,ev.actor_name,ev.created_at,ev.reason from bolig_private.quality_events ev where ev.root_id=root and ev.scope_id=scope order by ev.revision desc limit 100');
end$patch$;

-- The earlier effective-goods patch matched o.snapshot inside po.snapshot.
-- Repair only that malformed alias; preserve original duplicate-order checks.
do $patch$
declare body text;anchor text:='pcoalesce(o.effective_snapshot,o.snapshot)';
begin
 body:=pg_get_functiondef('bolig_private.deliveries(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 if position(anchor in body)=0 then raise exception 'Missing malformed effective order alias';end if;
 execute replace(body,anchor,'coalesce(po.effective_snapshot,po.snapshot)');
end$patch$;
notify pgrst,'reload schema';

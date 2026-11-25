-- Keep the normal purchase-order identity contract for exports and downstream UI.
-- No existing order or accepted agreement is rewritten.
do $$declare body text;anchor text;begin
 body:=pg_get_functiondef('bolig_private.apply_commercial_delivery(uuid,uuid,uuid,jsonb)'::regprocedure);
 anchor:=$a$'identity',d.snapshot->'identity','reference',ref,'supplier','Butikktillegg'$a$;
 if position(anchor in body)=0 then raise exception 'Missing shop order identity anchor';end if;
 body:=replace(body,anchor,$a$'identity',(d.snapshot->'identity')||jsonb_build_object('number',d.snapshot->'identity'->>'unit','unit_id',unit),'reference',ref,'supplier','Butikktillegg'$a$);
 execute body;
end$$;
notify pgrst,'reload schema';

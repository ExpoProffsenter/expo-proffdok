-- A request can wait for the project lock across midnight. Enforce the actual
-- decision time after the lock, rather than the transaction start timestamp.
do $patch$
declare signature text;body text;anchor text;
begin
 foreach signature in array array['bolig_resident_private.resident_decision(text,text,uuid,jsonb)',
  'bolig_resident_private.portal_decision(bolig_private.resident_portals,text,uuid,jsonb)'] loop
  body:=pg_get_functiondef(signature::regprocedure);
  anchor:=$a$if d.expires_at<=now() and d.status='published'$a$;
  if position(anchor in body)=0 then raise exception 'Missing acceptance deadline anchor: %',signature;end if;
  execute replace(body,anchor,$a$if d.expires_at<=clock_timestamp() and d.status='published'$a$);
 end loop;
 body:=pg_get_functiondef('bolig_private.agreement_expiry(jsonb,timestamp with time zone)'::regprocedure);
 anchor:=$a$if expiry<=now() then$a$;
 if position(anchor in body)=0 then raise exception 'Missing publication clock anchor';end if;
 execute replace(body,anchor,$a$if expiry<=clock_timestamp() then$a$);
end$patch$;
alter function bolig_private.agreement_expiry(jsonb,timestamptz) volatile;

-- Root writes serialize under a shared advisory lock. Record insertion time,
-- not transaction start, so queued replies are ordered by their actual commit path.
alter table bolig_private.partner_events alter column created_at set default clock_timestamp();
alter table bolig_private.partner_access alter column created_at set default clock_timestamp();
-- A request that waited for the lock must re-check expiry against the actual clock.
do $patch$
declare body text;anchor text:='p.expires_at>now()';
begin
 body:=pg_get_functiondef('bolig_private.partner_active(bolig_private.partner_access)'::regprocedure);
 if position(anchor in body)=0 then raise exception 'Missing partner expiry guard';end if;
 execute replace(body,anchor,'p.expires_at>clock_timestamp()');
end$patch$;
alter function bolig_private.partner_active(bolig_private.partner_access) volatile;

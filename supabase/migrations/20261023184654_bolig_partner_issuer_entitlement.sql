-- Reuse the existing non-current-user entitlement check. A capability cannot
-- outlive the issuer's current Projects entitlement or Bolig membership.
do $patch$
declare body text;anchor text:='where r.id=p.root_id and not r.archived';
begin
 body:=pg_get_functiondef('bolig_private.partner_active(bolig_private.partner_access)'::regprocedure);
 if position(anchor in body)=0 then raise exception 'Missing partner issuer boundary';end if;
 execute replace(body,anchor,'where r.id=p.root_id and bolig_private.progress_member(r.company_id,p.created_by) and not r.archived');
end$patch$;

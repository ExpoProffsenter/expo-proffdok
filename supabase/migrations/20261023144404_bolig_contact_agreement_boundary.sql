-- A change of resident/contact revokes capabilities permanently, including A-B-A.
-- Commercial snapshots, decisions, receipts and supplier orders are untouched.
create function bolig_private.revoke_contact_links() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if (old.contact_name,old.contact_email) is distinct from (new.contact_name,new.contact_email) then
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||new.root_id::text,0));
  update bolig_private.resident_portals set revoked=true,token_hash=null,revision=revision+1 where unit_id=new.id;
  update bolig_private.commercial_documents set token_hash=null where unit_id=new.id and token_hash is not null;
  update bolig_private.progress_notices n set approved_basis=null where n.task_id in(select id from bolig_private.progress_tasks where unit_id=new.id) and approved_basis is not null;
 end if;
 return new;
end$$;
revoke all on function bolig_private.revoke_contact_links() from public,anon,authenticated,service_role;
create trigger bolig_contact_links_after_change after update of contact_name,contact_email on bolig_private.units
for each row execute function bolig_private.revoke_contact_links();

-- A newly published portal cannot reveal or decide an agreement whose resident
-- capability was revoked. Project managers retain the complete internal history.
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_private.portal_state(bolig_private.resident_portals)'::regprocedure);
 anchor:='where d.root_id=p.root_id and d.unit_id=p.unit_id';
 if position(anchor in body)=0 then raise exception 'Missing portal agreement boundary';end if;
 execute replace(body,anchor,anchor||' and d.token_hash is not null');
 body:=pg_get_functiondef('bolig_resident_private.portal_decision(bolig_private.resident_portals,text,uuid,jsonb)'::regprocedure);
 anchor:='if d.id is null or not exists';
 if position(anchor in body)=0 then raise exception 'Missing portal decision boundary';end if;
 execute replace(body,anchor,'if d.id is null or d.token_hash is null or not exists');
end$patch$;
notify pgrst,'reload schema';

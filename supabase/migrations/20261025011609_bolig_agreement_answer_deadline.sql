-- A chosen date includes the whole calendar day in Europe/Oslo. Store the
-- exclusive next-midnight boundary in the existing, server-enforced expires_at.
-- Published and accepted historical agreements are deliberately unchanged.
create function bolig_private.agreement_expiry(payload jsonb, fallback timestamptz) returns timestamptz
language plpgsql stable set search_path='' as $$
declare due date;expiry timestamptz;
begin
 if payload ? 'acceptance_deadline' then
  if jsonb_typeof(payload->'acceptance_deadline') is distinct from 'string'
   or (payload->>'acceptance_deadline') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
   raise exception 'Velg en gyldig svarfrist for beboeren.' using errcode='22023';end if;
  begin
   due:=(payload->>'acceptance_deadline')::date;
  exception when invalid_datetime_format or datetime_field_overflow then
   raise exception 'Velg en gyldig svarfrist for beboeren.' using errcode='22023';
  end;
  expiry:=(due+1)::timestamp at time zone 'Europe/Oslo';
 else
  -- Compatibility for an older client or a pending exact retry. A saved draft's
  -- chosen deadline always wins over the old 30-day default.
  expiry:=coalesce(fallback,now()+interval '30 days');
 end if;
 if expiry<=now() then
  raise exception 'Svarfristen er passert. Velg en ny dato før du oppretter beboerlenken.' using errcode='22023';end if;
 return expiry;
end$$;
revoke all on function bolig_private.agreement_expiry(jsonb,timestamptz) from public,anon,authenticated,service_role;

-- Keep the existing authorization, scope/revision checks, lock, audit and exact
-- receipt replay in the same transaction. Fail closed if the baseline changes.
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_private.commerce(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 anchor:=$a$insert into bolig_private.commercial_documents(root_id,unit_id,group_id,version,kind,snapshot,created_by)
   values(root,unit,group_ref,next_version,kind,snapshot,auth.uid())$a$;
 if position(anchor in body)=0 then raise exception 'Missing agreement draft deadline anchor';end if;
 body:=replace(body,anchor,$a$insert into bolig_private.commercial_documents(root_id,unit_id,group_id,version,kind,snapshot,created_by,expires_at)
   values(root,unit,group_ref,next_version,kind,snapshot,auth.uid(),case when payload ? 'acceptance_deadline' then bolig_private.agreement_expiry(payload,null) else null end)$a$);
 anchor:=$a$expires_at=now()+interval '30 days',revision=revision+1 where id=doc.id$a$;
 if position(anchor in body)=0 then raise exception 'Missing agreement publication deadline anchor';end if;
 body:=replace(body,anchor,$a$expires_at=bolig_private.agreement_expiry(payload,doc.expires_at),revision=revision+1 where id=doc.id$a$);
 execute body;
end$patch$;

-- Several owners share the existing unit portal and commercial state.
-- The existing contact is the primary delivery contact. No mail transport is enabled.
alter table bolig_private.units add column additional_contacts jsonb not null default '[]';
create function bolig_private.valid_additional_contacts(contacts jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare item jsonb; seen text[]:='{}';
begin
 if jsonb_typeof(contacts) is distinct from 'array' or jsonb_array_length(contacts)>9 then return false;end if;
 for item in select value from jsonb_array_elements(contacts) loop
  if jsonb_typeof(item) is distinct from 'object'
   or jsonb_typeof(item->'id') is distinct from 'string' or (item->>'id') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   or jsonb_typeof(item->'name') is distinct from 'string' or length(trim(item->>'name')) not between 2 and 120
   or jsonb_typeof(item->'email') is distinct from 'string' or length(item->>'email')>254
   or ((item->>'email')<>'' and (item->>'email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
   or jsonb_typeof(item->'phone') is distinct from 'string' or length(item->>'phone')>40
   or item - array['id','name','email','phone'] <> '{}'::jsonb
   or item->>'id'=any(seen)
  then return false;end if;
  seen:=array_append(seen,item->>'id');
 end loop;
 return true;
end$$;
revoke all on function bolig_private.valid_additional_contacts(jsonb) from public,anon,authenticated,service_role;
alter table bolig_private.units add constraint bolig_additional_contacts_valid check(bolig_private.valid_additional_contacts(additional_contacts));

-- Removing/changing an owner must invalidate the shared capability, including A->B->A.
-- Ordinary unit edits without an owner change preserve the portal.
create function bolig_private.revoke_additional_contact_links() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if old.additional_contacts is distinct from new.additional_contacts then
  update bolig_private.resident_portals set revoked=true,token_hash=null,revision=revision+1 where unit_id=new.id;
  update bolig_private.commercial_documents set token_hash=null where unit_id=new.id and token_hash is not null;
 end if;
 return new;
end$$;
revoke all on function bolig_private.revoke_additional_contact_links() from public,anon,authenticated,service_role;
create trigger bolig_additional_contact_links_after_change after update of additional_contacts on bolig_private.units
for each row execute function bolig_private.revoke_additional_contact_links();

alter function bolig_private.workspace(uuid,text,uuid,bigint,jsonb) rename to workspace_before_household_contacts;
create function bolig_private.workspace(c uuid,action text,root uuid,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare result jsonb;ctx jsonb; r bolig_private.roots%rowtype; u bolig_private.units%rowtype;
 item jsonb; contacts jsonb; row_payload jsonb; seen uuid[]:='{}'; target uuid; req uuid;
 prior bolig_private.preparation_receipts%rowtype; receipt_payload jsonb;
begin
 if action='unit' and payload ? 'additional_contacts' then
  contacts:=payload->'additional_contacts';
  if not bolig_private.valid_additional_contacts(contacts) then raise exception 'Se over navn, e-post og mobil på de andre eierne (maks ni).' using errcode='22023';end if;
  -- Original gateway validates current firm, role, root revision, unit and linked project.
  result:=bolig_private.workspace_before_household_contacts(c,action,root,expected,payload-'additional_contacts');
  target:=(payload->>'id')::uuid;
  update bolig_private.units set additional_contacts=contacts where id=target and root_id=root;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision)
   values(c,root,auth.uid(),'household_contacts',target,(result#>>'{root,revision}')::bigint);
  return bolig_private.workspace_before_household_contacts(c,'get',root,null,'{}');
 elsif action='resident_import' then
  ctx:=bolig_private.context(c);
  if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) or ctx->>'role' is distinct from 'manager' then raise exception 'Prosjektledertilgang i aktivt firma kreves.' using errcode='42501';end if;
  if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>500000
   or jsonb_typeof(payload->'rows') is distinct from 'array' or jsonb_array_length(payload->'rows') not between 1 and 500
   or payload->'reviewed' is distinct from 'true'::jsonb then raise exception 'Se over 1–500 boligkontakter før lagring.' using errcode='22023';end if;
  req:=(payload->>'request_id')::uuid;
  if req is null then raise exception 'Importen mangler kvitteringsreferanse.' using errcode='22023';end if;
  select * into r from bolig_private.roots where id=root and company_id=c for update;
  if not found or r.archived then raise exception 'Velg et aktivt boligprosjekt i firmaet.' using errcode='42501';end if;
  receipt_payload:=jsonb_build_object('intent','resident_import','revision',expected,'data',payload);
  select * into prior from bolig_private.preparation_receipts pr where pr.root_id=root and pr.actor_id=auth.uid() and pr.request_id=req;
  if found then
   if prior.payload is distinct from receipt_payload then raise exception 'Kvitteringen gjelder et annet importgrunnlag.' using errcode='PT409';end if;
   return bolig_private.workspace_before_household_contacts(c,'get',root,null,'{}')||jsonb_build_object('receipt',prior.result,'replayed',true);
  end if;
  if r.revision is distinct from expected then raise exception 'Prosjektet er endret. Hent siste versjon og se over importen på nytt.' using errcode='PT409';end if;
  for item in select value from jsonb_array_elements(payload->'rows') loop
   target:=(item->>'id')::uuid;
   select un.* into u from bolig_private.units un join bolig_private.entrances e on e.id=un.entrance_id join bolig_private.blocks b on b.id=e.block_id
    where un.id=target and un.root_id=root and not un.archived and not e.archived and not b.archived;
   if not found or target=any(seen) then raise exception 'Velg hver aktiv bolig én gang i prosjektet.' using errcode='42501';end if;
   seen:=array_append(seen,target);
   if item->'before' is distinct from jsonb_build_object('name',u.contact_name,'email',u.contact_email,'phone',u.contact_phone,'additional_contacts',u.additional_contacts)
    then raise exception 'Kontakten er endret. Se over importen på nytt.' using errcode='PT409';end if;
   if jsonb_typeof(item->'name') is distinct from 'string' or length(trim(item->>'name')) not between 2 and 120
    or jsonb_typeof(item->'email') is distinct from 'string' or jsonb_typeof(item->'phone') is distinct from 'string'
    or not bolig_private.valid_additional_contacts(item->'additional_contacts')
    then raise exception 'Se over hovedkontakt og andre eiere.' using errcode='22023';end if;
   row_payload:=jsonb_build_object('id',u.id,'number',u.number,'contact_name',item->>'name','contact_email',item->>'email','contact_phone',item->>'phone','project_id',u.project_id,'additional_contacts',item->'additional_contacts');
   result:=bolig_private.workspace(c,'unit',root,r.revision,row_payload);
   r.revision:=(result#>>'{root,revision}')::bigint;
  end loop;
  insert into bolig_private.preparation_receipts(root_id,actor_id,request_id,payload,result)
   values(root,auth.uid(),req,receipt_payload,jsonb_build_object('request_id',req,'root_id',root,'units',cardinality(seen)));
  return result||jsonb_build_object('receipt',jsonb_build_object('request_id',req,'root_id',root,'units',cardinality(seen)));
 end if;
 return bolig_private.workspace_before_household_contacts(c,action,root,expected,payload);
end$$;
revoke all on function bolig_private.workspace(uuid,text,uuid,bigint,jsonb) from public,anon,authenticated,service_role;
grant execute on function bolig_private.workspace(uuid,text,uuid,bigint,jsonb) to authenticated;

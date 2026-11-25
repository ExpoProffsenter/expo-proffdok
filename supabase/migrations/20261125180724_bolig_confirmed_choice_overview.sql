-- Price-free confirmation state after the existing overview authorization.
alter function bolig_private.overview(uuid,uuid) rename to overview_before_direct_confirmation;
revoke all on function bolig_private.overview_before_direct_confirmation(uuid,uuid) from public,anon,authenticated,service_role;
create function bolig_private.overview(c uuid,root uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare result jsonb;rows jsonb;
begin
 result:=bolig_private.overview_before_direct_confirmation(c,root);
 select coalesce(jsonb_agg(row||case when d.id is null then '{}'::jsonb else jsonb_build_object(
  'resident_confirmed',true,'resident_choice_locked',not coalesce(p.changes_until>clock_timestamp(),false),
  'resident_version',d.version,'resident_requires_supplier_followup',coalesce((d.snapshot->>'requires_supplier_followup')::boolean,false)) end order by n),'[]') into rows
 from jsonb_array_elements(result->'units') with ordinality x(row,n)
 left join bolig_private.resident_portals p on p.root_id=root and p.unit_id=(row->>'unit_id')::uuid
 left join lateral(select a.* from bolig_private.commercial_documents a where a.root_id=root and a.unit_id=p.unit_id
  and a.kind='choice' and a.status in ('accepted','handled') and a.snapshot->>'source'='resident' and a.token_hash is not null
  order by a.accepted_at desc,a.created_at desc,a.id desc limit 1) d on true;
 return result||jsonb_build_object('units',rows);
end$$;
revoke all on function bolig_private.overview(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function bolig_private.overview(uuid,uuid) to authenticated;

-- The accepted document and its choice revision are written in the same transaction.
-- Write the accepted document first so the immutable-choice trigger can verify the exact new revision.
do $$declare body text;anchor text:=$a$ insert into bolig_private.choice_versions(root_id,unit_id,revision,snapshot,created_by)
 values(p.root_id,p.unit_id,cv+1,offer->'snapshot',manager);$a$;target text:=$a$p.expires_at) returning * into doc;$a$;begin
 body:=pg_get_functiondef('bolig_resident_private.portal(text,text,jsonb)'::regprocedure);
 if position(anchor in body)=0 or position(target in body)=0 then raise exception 'Unexpected direct-confirmation write order';end if;
 body:=replace(body,anchor,'');body:=replace(body,target,target||E'\n'||anchor);execute body;
end$$;
create function bolig_private.guard_confirmed_choice_version() returns trigger
language plpgsql security definer set search_path='' as $$
declare d bolig_private.commercial_documents%rowtype;
begin
 select * into d from bolig_private.commercial_documents x where x.root_id=new.root_id and x.unit_id=new.unit_id
 and x.kind='choice' and x.status in ('accepted','handled') and x.snapshot->>'source'='resident' and x.token_hash is not null
 order by x.accepted_at desc,x.created_at desc,x.id desc limit 1;
 if d.id is not null and (new.revision is distinct from (d.snapshot->>'choice_revision')::bigint
  or bolig_private.portal_goods(new.snapshot->'goods') is distinct from d.snapshot->'goods'
  or new.snapshot->'total_cents' is distinct from d.snapshot->'total_cents') then
  raise exception 'Bestillingen er bekreftet og låst. Åpne for endringer i beboerportalen og la beboeren bekrefte den nye utgaven.' using errcode='PT409';
 end if;
 return new;
end$$;
revoke all on function bolig_private.guard_confirmed_choice_version() from public,anon,authenticated,service_role;
create trigger bolig_confirmed_choice_version_guard before insert on bolig_private.choice_versions
for each row execute function bolig_private.guard_confirmed_choice_version();
notify pgrst,'reload schema';

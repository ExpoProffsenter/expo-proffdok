-- Group operations freeze explicit unit IDs; groups are filters, never live recipients.
alter table bolig_private.units add column choice_deadline date;
create table bolig_private.resident_batch_receipts (
 root_id uuid not null references bolig_private.roots(id),actor_id uuid not null references auth.users(id),
 request_id uuid not null,payload_hash bytea not null,result jsonb not null,created_at timestamptz not null default clock_timestamp(),
 primary key(root_id,actor_id,request_id)
);
create index bolig_resident_batch_actor on bolig_private.resident_batch_receipts(actor_id);
alter table bolig_private.resident_batch_receipts enable row level security;
revoke all on bolig_private.resident_batch_receipts from public,anon,authenticated,service_role;

create function bolig_private.resident_batch_rows(root uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(x.row order by x.block_name,x.number,x.id),'[]') from (
 select b.name block_name,u.number,u.id,jsonb_build_object(
 'id',u.id,'number',u.number,'block_id',b.id,'block_name',b.name,'address',e.address,
 'group_id',g.id,'group_name',g.name,'deadline',u.choice_deadline,
 'contacts',jsonb_build_array(jsonb_build_object('name',u.contact_name,'email',u.contact_email))||u.additional_contacts,
 'portal_active',coalesce(not p.revoked and p.expires_at>clock_timestamp(),false),
 'portal_revision',coalesce(p.revision,0),'offer_count',coalesce(jsonb_array_length(p.offers),0),
 'basis',md5(jsonb_build_array(to_jsonb(u),to_jsonb(e),to_jsonb(b),g.id,g.name,p.revision,p.menu_version,
 (select revision from bolig_private.roots where id=root))::text)) row
 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
 left join bolig_private.planning_group_units gu on gu.unit_id=u.id left join bolig_private.planning_groups g on g.id=gu.group_id
 left join bolig_private.resident_portals p on p.unit_id=u.id
 where u.root_id=root and not u.archived and not e.archived and not b.archived
 ) x
$$;
revoke all on function bolig_private.resident_batch_rows(uuid) from public,anon,authenticated,service_role;

create function bolig_private.resident_batch(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;rows jsonb;item jsonb;row jsonb;result jsonb;prior bolig_private.resident_batch_receipts%rowtype;
 rid uuid;fp bytea;ids uuid[];target uuid;date_value date;portals jsonb:='[]';r jsonb;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or ctx->>'role' is distinct from 'manager' or not coalesce((ctx->>'enabled')::boolean,false)
 or not bolig_private.progress_member(c,auth.uid()) or not exists(select 1 from bolig_private.roots where id=root and company_id=c and not archived)
 then raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
 if action is null or action not in('get','deadlines','publish') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>300000
 then raise exception 'Ugyldig samlet handling.' using errcode='22023';end if;
 perform 1 from bolig_private.roots where id=root and company_id=c and not archived for update;
 if not found then raise exception 'Prosjektet er ikke aktivt.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 if action<>'get' then
  rid:=(payload->>'request_id')::uuid;fp:=sha256(convert_to(jsonb_build_object('action',action,'payload',payload)::text,'UTF8'));
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  select * into prior from bolig_private.resident_batch_receipts where root_id=root and actor_id=auth.uid() and request_id=rid;
  if found then
   if prior.payload_hash<>fp then raise exception 'Referansen tilhører en annen handling.' using errcode='PT409';end if;
   return prior.result||jsonb_build_object('context',ctx,'replayed',true);
  end if;
 end if;
 rows:=bolig_private.resident_batch_rows(root);
 if action<>'get' then
  if payload->'reviewed' is distinct from 'true'::jsonb or jsonb_typeof(payload->'units') is distinct from 'array'
   or jsonb_array_length(payload->'units') not between 1 and 500 then raise exception 'Se over og bekreft 1–500 boliger.' using errcode='22023';end if;
  select array_agg((x->>'id')::uuid) into ids from jsonb_array_elements(payload->'units') x;
  if (select count(distinct x) from unnest(ids)x)<>cardinality(ids) then raise exception 'Samme bolig er valgt flere ganger.' using errcode='22023';end if;
  -- Validate the entire confirmed snapshot before any write.
  for item in select value from jsonb_array_elements(payload->'units') loop
   select x into row from jsonb_array_elements(rows)x where x->>'id'=item->>'id';
   if row is null then raise exception 'En valgt bolig er ikke tilgjengelig.' using errcode='42501';end if;
   if row->>'basis' is distinct from item->>'basis' then raise exception 'Boliggrunnlaget er endret. Hent siste oversikt og bekreft på nytt.' using errcode='PT409';end if;
   if action='publish' and (row->>'portal_active')::boolean and payload->'replace_links' is distinct from 'true'::jsonb
   then raise exception 'Bekreft at gamle lenker erstattes for valgte boliger.' using errcode='22023';end if;
  end loop;
  if action='deadlines' then
   if coalesce(payload->>'deadline','')!~'^\d{4}-\d{2}-\d{2}$' then raise exception 'Velg en bestillingsfrist.' using errcode='22023';end if;
   date_value:=(payload->>'deadline')::date;
   if date_value<(clock_timestamp() at time zone 'Europe/Oslo')::date then raise exception 'Fristen kan ikke settes tilbake i tid.' using errcode='22023';end if;
   update bolig_private.units set choice_deadline=date_value where root_id=root and id=any(ids);
  else
   for item in select value from jsonb_array_elements(payload->'units') loop
    r:=bolig_private.resident_portal(c,root,(item->>'id')::uuid,'publish',jsonb_build_object(
     'request_id',item->>'request_id','revision',item->'portal_revision','token',item->>'token','reviewed',true));
    portals:=portals||jsonb_build_array(jsonb_build_object('unit_id',item->>'id','target_id',r#>>'{portal,id}','revision',r#>'{portal,menu_version}'));
   end loop;
  end if;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision)
   values(c,root,auth.uid(),'resident_batch_'||action,root,(select revision from bolig_private.roots where id=root));
 end if;
 result:=jsonb_build_object('context',ctx,'root_id',root,'units',bolig_private.resident_batch_rows(root),'portals',portals,
 'mail_enabled',coalesce((select enabled from bolig_private.resident_link_mail_settings where singleton),false));
 if action<>'get' then insert into bolig_private.resident_batch_receipts values(root,auth.uid(),rid,fp,result,clock_timestamp());end if;
 return result;
end$$;
revoke all on function bolig_private.resident_batch(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.resident_batch(uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_resident_batch(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.resident_batch(p_company_id,p_root_id,p_action,p_payload)$$;
revoke all on function public.bolig_resident_batch(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_resident_batch(uuid,uuid,text,jsonb) to authenticated;

-- Preserve all earlier portal guards and idempotent retry before enforcing a new deadline.
do $$declare body text;anchor text:='  if action=''request'' then';begin
 body:=pg_get_functiondef('bolig_resident_private.portal(text,text,jsonb)'::regprocedure);
 if position(anchor in body)=0 then raise exception 'Missing portal request deadline anchor';end if;
 body:=replace(body,anchor,anchor||E'\n   if exists(select 1 from bolig_private.units u where u.id=p.unit_id and u.choice_deadline is not null and clock_timestamp()>=(u.choice_deadline+1)::timestamp at time zone ''Europe/Oslo'') then raise exception ''Bestillingsfristen er utløpt. Kontakt prosjektleder for ny frist.'' using errcode=''PT409'';end if;');
 execute body;
end$$;
alter function bolig_private.portal_state(bolig_private.resident_portals) rename to portal_state_before_batch;
create function bolig_private.portal_state(p bolig_private.resident_portals) returns jsonb
language sql stable set search_path='' as $$
 select bolig_private.portal_state_before_batch(p)||jsonb_build_object(
 'choice_deadline',u.choice_deadline,'choices_closed',coalesce(clock_timestamp()>=(u.choice_deadline+1)::timestamp at time zone 'Europe/Oslo',false),
 'shared_household',jsonb_array_length(u.additional_contacts)>0) from bolig_private.units u where u.id=p.unit_id
$$;
revoke all on function bolig_private.portal_state(bolig_private.resident_portals) from public,anon,authenticated,service_role;

-- Registered co-owners may receive the same portal. Agreements retain their existing single-recipient contract.
do $$declare body text;anchor text;begin
 body:=pg_get_functiondef('bolig_private.resident_link_mail_command(uuid,uuid,uuid,uuid,text,text,jsonb)'::regprocedure);
 anchor:=' if length(u.contact_email)>254';
 if position(anchor in body)=0 then raise exception 'Missing recipient validation anchor';end if;
 body:=replace(body,anchor,E' u.contact_email:=lower(trim(u.contact_email));\n if kind in (''portal'',''reminder'') and nullif(payload->>''to'','''') is not null and payload->>''to'' is distinct from u.contact_email then\n  if not exists(select 1 from jsonb_array_elements(u.additional_contacts) x where lower(trim(x->>''email''))=payload->>''to'') then raise exception ''Mottakeren er ikke registrert på boligen.'' using errcode=''42501'';end if;\n  select x->>''name'' into u.contact_name from jsonb_array_elements(u.additional_contacts) x where lower(trim(x->>''email''))=payload->>''to'' limit 1;\n  u.contact_email:=payload->>''to'';\n end if;\n'||anchor);
 body:=replace(body,'''origin'',cfg.site_origin);','''origin'',cfg.site_origin,''shared_household'',jsonb_array_length(u.additional_contacts)>0);');
 -- Per-recipient replay/rate guards allow several owners without leaking recipients to one another.
 body:=replace(body,'where target_id=target and','where target_id=target and recipient=u.contact_email and');
 execute body;
end$$;
notify pgrst,'reload schema';

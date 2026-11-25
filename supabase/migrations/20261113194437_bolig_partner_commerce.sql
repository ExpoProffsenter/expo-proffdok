-- Explicit, account-bound commercial access attached to an existing named partner.
-- A bearer partner link alone never permits reading prices or writing choices.
create table bolig_private.partner_commerce_access (
 access_id uuid primary key references bolig_private.partner_access(id),
 root_id uuid not null references bolig_private.roots(id),
 user_id uuid not null references auth.users(id),
 enabled boolean not null default true,
 edit_choices boolean not null default false,
 edit_catalog boolean not null default false,
 revision bigint not null default 1
);
create index bolig_partner_commerce_user on bolig_private.partner_commerce_access(user_id);
alter table bolig_private.partner_commerce_access enable row level security;
revoke all on bolig_private.partner_commerce_access from public,anon,authenticated,service_role;

create function bolig_private.commerce_collaborator(c uuid,root uuid,permission text default 'read') returns boolean
language sql stable set search_path='' as $$
 select auth.uid() is not null and exists(
 select 1 from bolig_private.partner_commerce_access g join bolig_private.partner_access p on p.id=g.access_id
 join bolig_private.roots r on r.id=p.root_id join public.profiles u on u.id=g.user_id
 join auth.users account on account.id=g.user_id
 where g.root_id=p.root_id and g.user_id=auth.uid() and g.enabled and r.id=root and r.company_id=c and p.access_mode='project'
 and lower(account.email)=lower(p.email) and bolig_private.partner_active(p) and u.approved and not coalesce(u.deactivated,false)
 and exists(select 1 from public.sales_company_memberships m where m.user_id=g.user_id and m.workspace_role in ('ansatt','firmaadmin') and public.is_internal_work_profile_company(m.company_id))
 and (permission='read' or permission='edit_choices' and g.edit_choices or permission='edit_catalog' and g.edit_catalog))
$$;
revoke all on function bolig_private.commerce_collaborator(uuid,uuid,text) from public,anon,authenticated,service_role;

-- Read context is scoped to these two commercial projections only. It never
-- grants the manager role, changes active company or changes global membership.
create function bolig_private.commerce_read_context(c uuid,root uuid) returns jsonb
language plpgsql stable set search_path='' as $$
declare ctx jsonb;
begin
 begin
  ctx:=bolig_private.context(c);
  if coalesce((ctx->>'enabled')::boolean,false) and ctx->>'role'='manager' then return ctx;end if;
 exception when sqlstate '42501' then null;
 end;
 if not bolig_private.commerce_collaborator(c,root,'read') and coalesce((ctx->>'enabled')::boolean,false) then return ctx;end if;
 if not bolig_private.commerce_collaborator(c,root,'read') then raise exception 'Prosjekttilgangen er ikke tilgjengelig.' using errcode='42501';end if;
 return jsonb_build_object('company_id',c,'user_id',auth.uid(),'role','reader','enabled',true,'manage_access',false,
 'company_name',(select display_name from public.sales_company_scopes where id=c),'collaboration_root',root,
 'edit_choices',bolig_private.commerce_collaborator(c,root,'edit_choices'),
 'edit_catalog',bolig_private.commerce_collaborator(c,root,'edit_catalog'));
end$$;
revoke all on function bolig_private.commerce_read_context(uuid,uuid) from public,anon,authenticated,service_role;

create function bolig_private.partner_commerce_manage(c uuid,root uuid,access uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;p bolig_private.partner_access%rowtype;g bolig_private.partner_commerce_access%rowtype;target uuid;
 rid uuid;fp bytea;prior bolig_private.partner_receipts%rowtype;result jsonb;actor_key text;
begin
 ctx:=bolig_private.context(c);
 if ctx->>'role' is distinct from 'manager' or not coalesce((ctx->>'enabled')::boolean,false) then raise exception 'Prosjektleder kreves.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into p from bolig_private.partner_access where id=access and root_id=root;
 if p.id is null or p.access_mode<>'project' or not bolig_private.partner_active(p)
 or not exists(select 1 from bolig_private.roots where id=root and company_id=c) then raise exception 'Velg en aktiv prosjekttilgang.' using errcode='42501';end if;
 if action is null or action not in('get','save') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>5000 then raise exception 'Ugyldig personrettighet.' using errcode='22023';end if;
 select u.id into target from auth.users u join public.profiles pr on pr.id=u.id
 where lower(u.email)=lower(p.email) and pr.approved and not coalesce(pr.deactivated,false)
 and exists(select 1 from public.sales_company_memberships m where m.user_id=u.id and m.workspace_role in ('ansatt','firmaadmin') and public.is_internal_work_profile_company(m.company_id));
 select * into g from bolig_private.partner_commerce_access where access_id=access;
 if action='save' then
  if target is null then raise exception 'Kontaktens e-post må tilhøre en godkjent bruker hos Bademiljø Expo, Expo Proffsenter eller Ringside.' using errcode='22023';end if;
  if payload->'reviewed' is distinct from 'true'::jsonb or jsonb_typeof(payload->'enabled') is distinct from 'boolean'
   or jsonb_typeof(payload->'edit_choices') is distinct from 'boolean' or jsonb_typeof(payload->'edit_catalog') is distinct from 'boolean'
   then raise exception 'Se over og bekreft personens rettigheter.' using errcode='22023';end if;
  rid:=(payload->>'request_id')::uuid;
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  actor_key:='commerce-manager/'||auth.uid()::text;
  fp:=sha256(convert_to(jsonb_build_array(access,expected,payload)::text,'UTF8'));
  select * into prior from bolig_private.partner_receipts where root_id=root and actor=actor_key and request_id=rid;
  if found then
   if prior.fingerprint<>fp then raise exception 'Referansen gjelder en annen handling.' using errcode='PT409';end if;
   return prior.result||jsonb_build_object('replayed',true);
  end if;
  if expected is distinct from coalesce(g.revision,0) then raise exception 'Personrettigheten er endret. Hent siste status.' using errcode='PT409';end if;
  insert into bolig_private.partner_commerce_access values(access,root,target,(payload->>'enabled')::boolean,(payload->>'edit_choices')::boolean,(payload->>'edit_catalog')::boolean,coalesce(g.revision,0)+1)
   on conflict(access_id) do update set user_id=excluded.user_id,enabled=excluded.enabled,edit_choices=excluded.edit_choices,edit_catalog=excluded.edit_catalog,revision=excluded.revision returning * into g;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'partner_commerce_permissions',access,g.revision);
 end if;
 result:=jsonb_build_object('context',ctx,'root_id',root,'access_id',access,'registered',target is not null,'revision',coalesce(g.revision,0),
 'enabled',coalesce(g.enabled,false),'edit_choices',coalesce(g.edit_choices,false),'edit_catalog',coalesce(g.edit_catalog,false));
 if action='save' then insert into bolig_private.partner_receipts values(root,actor_key,rid,fp,result);end if;
 return result;
end$$;
revoke all on function bolig_private.partner_commerce_manage(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function bolig_private.partner_commerce_manage(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;
create function public.bolig_partner_commerce_access(p_company_id uuid,p_root_id uuid,p_access_id uuid,p_action text default 'get',p_revision bigint default null,p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.partner_commerce_manage(p_company_id,p_root_id,p_access_id,p_action,p_revision,p_payload)$$;
revoke all on function public.bolig_partner_commerce_access(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function public.bolig_partner_commerce_access(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;

create function bolig_private.my_collaborations(root uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare selected_root bolig_private.roots%rowtype;
begin
 if auth.uid() is null then raise exception 'Logg inn med din egen bruker.' using errcode='42501';end if;
 if root is null then return jsonb_build_object('user_id',auth.uid(),'projects',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'title',r.title,'company',s.display_name) order by r.title,r.id)
 from bolig_private.roots r join public.sales_company_scopes s on s.id=r.company_id where bolig_private.commerce_collaborator(r.company_id,r.id,'read')),'[]'));end if;
 select * into selected_root from bolig_private.roots where id=root;
 if selected_root.id is null or not bolig_private.commerce_collaborator(selected_root.company_id,selected_root.id,'read') then raise exception 'Prosjekttilgangen er utløpt eller tilbakekalt.' using errcode='42501';end if;
 return jsonb_build_object('user_id',auth.uid(),'root',jsonb_build_object('id',selected_root.id,'title',selected_root.title,'archived',selected_root.archived),
 'context',bolig_private.commerce_read_context(selected_root.company_id,selected_root.id),
 'units',coalesce((select jsonb_agg(jsonb_build_object('id',u.id,'number',u.number,'contact_name',u.contact_name,'address',e.address) order by e.address,u.number,u.id)
 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
 where u.root_id=root and not u.archived and not e.archived and not b.archived),'[]'));
end$$;
revoke all on function bolig_private.my_collaborations(uuid) from public,anon,service_role;
grant execute on function bolig_private.my_collaborations(uuid) to authenticated;
create function public.bolig_my_collaborations(p_root_id uuid default null) returns jsonb language sql security invoker set search_path='' as $$select bolig_private.my_collaborations(p_root_id)$$;
revoke all on function public.bolig_my_collaborations(uuid) from public,anon,service_role;
grant execute on function public.bolig_my_collaborations(uuid) to authenticated;

-- Local authorization extensions. No generic workspace/context/member gate changes.
do $$declare body text;anchor text;signature text;
begin
 foreach signature in array array['bolig_private.catalog_legacy(uuid,uuid,text,bigint,jsonb)','bolig_private.rooms_workspace(uuid,uuid,uuid,text,bigint,jsonb)'] loop
  body:=pg_get_functiondef(signature::regprocedure);anchor:='ctx:=bolig_private.context(c);';
  if position(anchor in body)=0 then raise exception 'Missing commercial context anchor: %',signature;end if;
  body:=replace(body,anchor,'ctx:=bolig_private.commerce_read_context(c,root);');
  if signature like '%catalog_legacy%' then
   anchor:='if ctx->>''role''<>''manager'' or r.archived then';
   if position(anchor in body)=0 then raise exception 'Missing catalog permission anchor';end if;
   body:=replace(body,anchor,'if (ctx->>''role''<>''manager'' and not (action in (''package'',''option'',''archive'') and bolig_private.commerce_collaborator(c,root,''edit_catalog''))) or r.archived then');
  end if;
  execute body;
 end loop;
 foreach signature in array array['bolig_private.package_choices_standard(uuid,uuid,uuid,text,bigint,jsonb)','bolig_private.unit_customization(uuid,uuid,uuid,text,bigint,jsonb)'] loop
  body:=pg_get_functiondef(signature::regprocedure);
  anchor:=case when signature like '%package_choices_standard%' then 'workspace->''context''->>''role''<>''manager''' else 'state->''context''->>''role''<>''manager''' end;
  if position(anchor in body)=0 then raise exception 'Missing choices permission anchor';end if;
  body:=replace(body,anchor,'('||anchor||' and not bolig_private.commerce_collaborator(c,root,''edit_choices''))');
  -- A collaborator must not replace a pending/accepted agreement or prepared order.
  anchor:=' perform pg_advisory_xact_lock(hashtextextended(''bolig-rooms:''||unit::text,0));';
  if position(anchor in body)=0 then raise exception 'Missing choices lock anchor';end if;
  body:=replace(body,anchor,anchor||E'\n if bolig_private.commerce_collaborator(c,root,''read'') and (exists(select 1 from bolig_private.commercial_documents where root_id=root and unit_id=unit and status in (''published'',''accepted'',''handled'')) or exists(select 1 from bolig_private.purchase_orders where root_id=root and unit_id=unit and status<>''cancelled'')) then raise exception ''Boligen har en avtale eller ordre. Prosjektleder må behandle endringen som et tillegg.'' using errcode=''PT409'';end if;');
  execute body;
 end loop;
end$$;
-- Existing non-commercial projections retain their original internal-user gate.
do $$declare signature text;body text;begin
 foreach signature in array array['bolig_private.resident_portal(uuid,uuid,uuid,text,jsonb)','bolig_private.room_content(uuid,uuid,uuid,text,bigint,jsonb)'] loop
  body:=pg_get_functiondef(signature::regprocedure);
  if position(E'\nbegin\n' in body)=0 then raise exception 'Missing internal gate anchor';end if;
  body:=replace(body,E'\nbegin\n',E'\nbegin\n perform bolig_private.context(c);\n');
  execute body;
 end loop;
 if to_regprocedure('app_support_private.guard_and_audit()') is not null then
  execute 'create trigger app_support_write_guard after insert or update on bolig_private.partner_commerce_access for each row execute function app_support_private.guard_and_audit()';
  execute 'create trigger app_support_delete_guard before delete on bolig_private.partner_commerce_access for each row execute function app_support_private.guard_and_audit()';
  execute 'create trigger app_support_truncate_guard before truncate on bolig_private.partner_commerce_access for each statement execute function app_support_private.guard_and_audit()';
 end if;
end$$;
notify pgrst,'reload schema';

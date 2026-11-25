-- Narrow capability links for named partners. No grants to core tables, no mail,
-- no writes to orders, receipts or the project plan. Public gateways are invokers.
create table bolig_private.partner_access (
 id uuid primary key,root_id uuid not null references bolig_private.roots(id),
 name text not null check(length(trim(name)) between 2 and 120),
 email text not null check(length(email) between 3 and 254),
 organisation text not null check(length(trim(organisation)) between 2 and 160),
 kind text not null check(kind in ('supplier','ue')),token_hash bytea not null unique,
 order_ids uuid[] not null,task_ids uuid[] not null,
 expires_at timestamptz not null,revoked boolean not null default false,
 revision bigint not null default 1,created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create index bolig_partner_root on bolig_private.partner_access(root_id);
create index bolig_partner_creator on bolig_private.partner_access(created_by);
create table bolig_private.partner_events (
 id uuid primary key default gen_random_uuid(),access_id uuid not null references bolig_private.partner_access(id),
 target_id uuid not null,kind text not null check(kind in ('order','task')),
 basis text not null,status text not null check(status in ('confirmed','issue')),
 promised_date date,reference text not null default '',body text not null,
 created_at timestamptz not null default now()
);
create index bolig_partner_event_access on bolig_private.partner_events(access_id,created_at desc);
create table bolig_private.partner_receipts (
 root_id uuid not null references bolig_private.roots(id),actor text not null,request_id uuid not null,
 fingerprint bytea not null,result jsonb not null,primary key(root_id,actor,request_id)
);
DO $$declare t text;begin foreach t in array array['partner_access','partner_events','partner_receipts'] loop
 execute format('alter table bolig_private.%I enable row level security',t);
 execute format('revoke all on bolig_private.%I from public,anon,authenticated,service_role',t);
end loop;end$$;

create function bolig_private.partner_target(root uuid,kind text,target uuid) returns jsonb
language plpgsql stable set search_path='' as $$
#variable_conflict use_variable
declare result jsonb;
begin
 if kind='order' then
  select jsonb_build_object('id',o.id,'kind','order','title',o.number,'number',u.number,'address',e.address,
   'delivery_address',coalesce(o.effective_snapshot,o.snapshot)->>'address',
   'reference',coalesce(o.effective_snapshot,o.snapshot)->>'reference',
   'supplier_reference',o.snapshot->>'supplier_reference',
   'requested_date',coalesce(o.effective_snapshot,o.snapshot)->>'requested_date','status',o.status,
   'goods',(select coalesce(jsonb_agg(jsonb_build_object('name',g->>'name','sku',g->>'sku','quantity',g->'quantity','unit',g->>'unit','room_name',g->>'room_name','received',coalesce(o.received->(n-1)::text,'0'::jsonb)) order by n),'[]') from jsonb_array_elements(coalesce(o.effective_snapshot,o.snapshot)->'goods') with ordinality x(g,n))) into result
  from bolig_private.purchase_orders o join bolig_private.units u on u.id=o.unit_id
  join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
  where o.id=target and o.root_id=root and o.status in ('ordered','partial','delivered') and not u.archived and not e.archived and not b.archived;
 elsif kind='task' then
  select jsonb_build_object('id',t.id,'kind','task','title',t.title,'number',u.number,'address',e.address,
   'room_name',(select name from bolig_private.rooms where id=t.room_id),
   'planned_start',t.planned_start,'planned_end',t.planned_end,'status',t.status,'revision',t.revision) into result
  from bolig_private.progress_tasks t join bolig_private.units u on u.id=t.unit_id join bolig_private.entrances e on e.id=u.entrance_id
  where t.id=target and t.root_id=root and bolig_private.progress_active(t);
 end if;
 if result is null then return null;end if;
 return result||jsonb_build_object('basis',md5(result::text));
end$$;
revoke all on function bolig_private.partner_target(uuid,text,uuid) from public,anon,authenticated,service_role;

create function bolig_private.partner_active(p bolig_private.partner_access) returns boolean
language sql stable set search_path='' as $$
 select not p.revoked and p.expires_at>now() and exists(
 select 1 from bolig_private.roots r join bolig_private.firms f on f.company_id=r.company_id
 join public.sales_company_memberships m on m.company_id=r.company_id and m.user_id=p.created_by
 join public.profiles u on u.id=m.user_id left join bolig_private.member_access a on a.company_id=m.company_id and a.user_id=m.user_id
 where r.id=p.root_id and not r.archived and f.enabled and u.approved and not coalesce(u.deactivated,false)
 and u.role in('admin','member','ansatt','firmaadmin') and (m.workspace_role='firmaadmin' or (m.workspace_role='ansatt' and a.access_role='manager')))
$$;
revoke all on function bolig_private.partner_active(bolig_private.partner_access) from public,anon,authenticated,service_role;

create function bolig_private.partner_view(p bolig_private.partner_access) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',p.id,'name',p.name,'organisation',p.organisation,'kind',p.kind,'expires_at',p.expires_at,
 'active',bolig_private.partner_active(p),'revoked',p.revoked,'revision',p.revision,
 'project',(select jsonb_build_object('title',r.title,'reference',r.reference,'company',c.display_name) from bolig_private.roots r join public.sales_company_scopes c on c.id=r.company_id where r.id=p.root_id),
 'orders',(select coalesce(jsonb_agg(v order by v->>'number',v->>'title'),'[]') from (select bolig_private.partner_target(p.root_id,'order',x) v from unnest(p.order_ids) x) s where v is not null),
 'tasks',(select coalesce(jsonb_agg(v order by v->>'planned_start',v->>'number',v->>'title'),'[]') from (select bolig_private.partner_target(p.root_id,'task',x) v from unnest(p.task_ids) x) s where v is not null),
 'events',(select coalesce(jsonb_agg(to_jsonb(e)-'access_id'||jsonb_build_object('current',e.basis=bolig_private.partner_target(p.root_id,e.kind,e.target_id)->>'basis') order by e.created_at desc,e.id),'[]') from (select * from bolig_private.partner_events where access_id=p.id order by created_at desc,id limit 200) e))
$$;
revoke all on function bolig_private.partner_view(bolig_private.partner_access) from public,anon,authenticated,service_role;

create function bolig_private.partners(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;p bolig_private.partner_access%rowtype;rid uuid;fp bytea;receipt bolig_private.partner_receipts%rowtype;
 oid uuid[];tid uuid[];x uuid;result jsonb;created uuid;days int;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) or ctx->>'role' not in('manager','reader')
 or not exists(select 1 from bolig_private.roots where id=root and company_id=c and not archived) then raise exception 'Prosjektet er ikke tilgjengelig.' using errcode='42501';end if;
 if action is null or action not in ('get','create','revoke') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>100000 then raise exception 'Ugyldig tilgangsgrunnlag.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 if action<>'get' then
  if ctx->>'role'<>'manager' then raise exception 'Prosjektleder kreves.' using errcode='42501';end if;
  rid:=(payload->>'request_id')::uuid;
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  fp:=sha256(convert_to(jsonb_build_array(action,payload)::text,'UTF8'));
  select * into receipt from bolig_private.partner_receipts where root_id=root and actor=auth.uid()::text and request_id=rid;
  if found then
   if receipt.fingerprint<>fp then raise exception 'Referansen er brukt til noe annet.' using errcode='PT409';end if;
   created:=(receipt.result->>'created_id')::uuid;
  elsif action='create' then
   if (select count(*) from bolig_private.partner_access where root_id=root)>=300 then raise exception 'Tilgangsgrensen er nådd.' using errcode='22023';end if;
   if payload->'reviewed' is distinct from 'true'::jsonb or coalesce(payload->>'token','') !~ '^[0-9a-f]{64}$'
   or length(trim(coalesce(payload->>'name',''))) not between 2 and 120
   or length(trim(coalesce(payload->>'organisation',''))) not between 2 and 160
   or length(coalesce(payload->>'email',''))>254 or coalesce(payload->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
   or coalesce(payload->>'kind','') not in('supplier','ue')
   or jsonb_typeof(payload->'order_ids') is distinct from 'array' or jsonb_typeof(payload->'task_ids') is distinct from 'array'
   or jsonb_array_length(payload->'order_ids')+jsonb_array_length(payload->'task_ids') not between 1 and 200 then raise exception 'Fyll inn kontakt og velg inntil 200 ordre eller aktiviteter.' using errcode='22023';end if;
   days:=(payload->>'days')::int;
   if days is null or days not between 1 and 90 then raise exception 'Velg 1–90 dager.' using errcode='22023';end if;
   select coalesce(array_agg(v::uuid),'{}') into oid from jsonb_array_elements_text(payload->'order_ids') v;
   select coalesce(array_agg(v::uuid),'{}') into tid from jsonb_array_elements_text(payload->'task_ids') v;
   if cardinality(oid)<>(select count(distinct v) from unnest(oid) v) or cardinality(tid)<>(select count(distinct v) from unnest(tid) v) then raise exception 'Velg hver rad én gang.' using errcode='22023';end if;
   foreach x in array oid loop
    if bolig_private.partner_target(root,'order',x) is null then raise exception 'Ordren er ikke tilgjengelig.' using errcode='42501';end if;
    if payload->'basis'->>x::text is distinct from bolig_private.partner_target(root,'order',x)->>'basis' then raise exception 'Ordregrunnlaget er endret. Se over siste versjon.' using errcode='PT409';end if;
   end loop;
   foreach x in array tid loop
    if bolig_private.partner_target(root,'task',x) is null then raise exception 'Aktiviteten er ikke tilgjengelig.' using errcode='42501';end if;
    if payload->'basis'->>x::text is distinct from bolig_private.partner_target(root,'task',x)->>'basis' then raise exception 'Fremdriften er endret. Se over siste versjon.' using errcode='PT409';end if;
   end loop;
   created:=(payload->>'id')::uuid;
   if created is null then raise exception 'Tilgangsreferanse mangler.' using errcode='22023';end if;
   insert into bolig_private.partner_access(id,root_id,name,email,organisation,kind,token_hash,order_ids,task_ids,expires_at,created_by)
   values(created,root,trim(payload->>'name'),lower(trim(payload->>'email')),trim(payload->>'organisation'),payload->>'kind',sha256(convert_to(payload->>'token','UTF8')),oid,tid,now()+make_interval(days=>days),auth.uid());
  else
   select * into p from bolig_private.partner_access where id=(payload->>'id')::uuid and root_id=root for update;
   if p.id is null then raise exception 'Tilgangen finnes ikke i dette prosjektet.' using errcode='42501';end if;
   update bolig_private.partner_access set revoked=true,revision=revision+1 where id=p.id;
  end if;
  if receipt.request_id is null then
   insert into bolig_private.partner_receipts values(root,auth.uid()::text,rid,fp,jsonb_build_object('created_id',created));
   insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'partner_'||action,coalesce(created,p.id),1);
  end if;
 end if;
 result:=jsonb_build_object('context',ctx,'root_id',root,'created_id',created,
 'orders',(select coalesce(jsonb_agg(v order by v->>'number',v->>'title'),'[]') from (select bolig_private.partner_target(root,'order',id) v from bolig_private.purchase_orders where root_id=root) s where v is not null),
 'tasks',(select coalesce(jsonb_agg(v order by v->>'planned_start',v->>'number',v->>'title'),'[]') from (select bolig_private.partner_target(root,'task',id) v from bolig_private.progress_tasks where root_id=root) s where v is not null),
 'partners',(select coalesce(jsonb_agg(bolig_private.partner_view(a)||jsonb_build_object('email',a.email,'order_ids',to_jsonb(a.order_ids),'task_ids',to_jsonb(a.task_ids)) order by a.created_at desc),'[]') from bolig_private.partner_access a where root_id=root));
 return result;
end$$;
revoke all on function bolig_private.partners(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.partners(uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_partners(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_private.partners(p_company_id,p_root_id,p_action,p_payload)$$;
revoke all on function public.bolig_partners(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_partners(uuid,uuid,text,jsonb) to authenticated;

create function bolig_resident_private.partner(token text,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare p bolig_private.partner_access%rowtype;root uuid;rid uuid;fp bytea;receipt bolig_private.partner_receipts%rowtype;target jsonb;day date;body text;ref text;
begin
 if token is null or token !~ '^[0-9a-f]{64}$' or action is null or action not in('get','respond') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>6000 then raise exception 'Tilgangslenken er ikke tilgjengelig.' using errcode='42501';end if;
 select root_id into root from bolig_private.partner_access where token_hash=sha256(convert_to(token,'UTF8'));
 if root is null then raise exception 'Tilgangslenken er ikke tilgjengelig.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into p from bolig_private.partner_access where token_hash=sha256(convert_to(token,'UTF8')) for update;
 if p.id is null or not bolig_private.partner_active(p) then raise exception 'Tilgangen er utløpt eller trukket tilbake. Kontakt prosjektleder.' using errcode='42501';end if;
 if action='respond' then
  if coalesce(payload->>'kind','') not in('order','task') or (payload->>'target_id')::uuid is null
  or not coalesce(case when payload->>'kind'='order' then (payload->>'target_id')::uuid=any(p.order_ids) else (payload->>'target_id')::uuid=any(p.task_ids) end,false) then raise exception 'Denne raden er ikke delt med deg.' using errcode='42501';end if;
  target:=bolig_private.partner_target(root,payload->>'kind',(payload->>'target_id')::uuid);
  if target is null then raise exception 'Denne raden er ikke lenger tilgjengelig.' using errcode='42501';end if;
  rid:=(payload->>'request_id')::uuid;
  if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
  fp:=sha256(convert_to(payload::text,'UTF8'));
  select * into receipt from bolig_private.partner_receipts where root_id=root and actor=p.id::text and request_id=rid;
  if found then
   if receipt.fingerprint<>fp then raise exception 'Referansen er brukt til et annet svar.' using errcode='PT409';end if;
   return bolig_private.partner_view(p);
  end if;
  if payload->>'basis' is distinct from target->>'basis' then raise exception 'Grunnlaget er endret. Se over siste datoer og varer før du svarer.' using errcode='PT409';end if;
  body:=trim(coalesce(payload->>'body',''));ref:=trim(coalesce(payload->>'reference',''));day:=nullif(payload->>'date','')::date;
  if coalesce(payload->>'status','') not in('confirmed','issue') or length(body)>2000 or length(ref)>160
  or (payload->>'status'='confirmed' and day is null) or (payload->>'status'='issue' and length(body)<3)
  or (day is not null and (day<'2000-01-01'::date or day>'2100-12-31'::date)) then raise exception 'Bekreft dato, eller beskriv avviket.' using errcode='22023';end if;
  if (select count(*) from bolig_private.partner_events where access_id=p.id)>=2000 then raise exception 'Svargrensen er nådd. Kontakt prosjektleder.' using errcode='22023';end if;
  insert into bolig_private.partner_events(access_id,target_id,kind,basis,status,promised_date,reference,body) values(p.id,(payload->>'target_id')::uuid,payload->>'kind',target->>'basis',payload->>'status',day,ref,body);
  update bolig_private.partner_access set revision=revision+1 where id=p.id returning * into p;
  insert into bolig_private.partner_receipts values(root,p.id::text,rid,fp,'{}');
 end if;
 return bolig_private.partner_view(p);
end$$;
revoke all on function bolig_resident_private.partner(text,text,jsonb) from public,service_role;
grant execute on function bolig_resident_private.partner(text,text,jsonb) to anon,authenticated;
create function public.bolig_partner_portal(p_token text,p_action text default 'get',p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_resident_private.partner(p_token,p_action,p_payload)$$;
revoke all on function public.bolig_partner_portal(text,text,jsonb) from public,service_role;
grant execute on function public.bolig_partner_portal(text,text,jsonb) to anon,authenticated;

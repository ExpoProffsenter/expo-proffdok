-- Project-owned catalog and immutable, internal choice drafts. No orders/acceptance.
create table bolig_private.catalog_states(root_id uuid primary key references bolig_private.roots(id),revision bigint not null default 0);
create table bolig_private.packages(id uuid primary key default gen_random_uuid(),root_id uuid not null references bolig_private.roots(id),name text not null check(length(trim(name)) between 1 and 120),lines jsonb not null,archived boolean not null default false,revision bigint not null default 1,unique(root_id,name));
create index bolig_packages_root on bolig_private.packages(root_id,id);
create table bolig_private.options(id uuid primary key default gen_random_uuid(),root_id uuid not null references bolig_private.roots(id),name text not null check(length(trim(name)) between 1 and 120),sku text not null default '' check(length(sku)<=80),quantity numeric(10,3) not null check(quantity>0 and quantity<=10000),unit text not null check(length(trim(unit)) between 1 and 20),price_cents bigint not null check(price_cents between 0 and 1000000000),replace_key text not null default '',deduct_base boolean not null default false,archived boolean not null default false,revision bigint not null default 1,unique(root_id,name));
create index bolig_options_root on bolig_private.options(root_id,id);
alter table bolig_private.units add constraint bolig_units_id_root_unique unique(id,root_id);
create table bolig_private.choice_versions(unit_id uuid not null,root_id uuid not null references bolig_private.roots(id),revision bigint not null,snapshot jsonb not null,created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),primary key(unit_id,revision),foreign key(unit_id,root_id) references bolig_private.units(id,root_id));
create index bolig_choices_root on bolig_private.choice_versions(root_id,unit_id,revision desc);
create index bolig_choices_actor on bolig_private.choice_versions(created_by);
alter table bolig_private.catalog_states enable row level security;
alter table bolig_private.packages enable row level security;
alter table bolig_private.options enable row level security;
alter table bolig_private.choice_versions enable row level security;
revoke all on bolig_private.catalog_states,bolig_private.packages,bolig_private.options,bolig_private.choice_versions from public,anon,authenticated,service_role;

create function bolig_private.catalog(c uuid,root uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;rev bigint;v_id uuid;u_id uuid;pkg bolig_private.packages%rowtype;
 line jsonb;opt record;v_lines jsonb;v_options jsonb:='[]';goods jsonb;keys text[]:='{}';option_ids uuid[];replacement_keys text[]:='{}';nr bigint;deduction bigint;net bigint;total bigint:=0;choice jsonb;identity jsonb;
begin
 ctx:=bolig_private.context(c);
 if not (ctx->>'enabled')::boolean then raise exception 'Boligprosjekter er ikke tilgjengelig.' using errcode='42501';end if;
 if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>100000 then raise exception 'Ugyldig innhold.' using errcode='22023';end if;
 select * into r from bolig_private.roots where id=root and company_id=c for share;
 if not found then raise exception 'Hovedprosjektet er ikke tilgjengelig i aktivt firma.' using errcode='42501';end if;
 if action not in ('state','unit') then
  if ctx->>'role'<>'manager' or r.archived then raise exception 'Prosjektleder og aktivt hovedprosjekt kreves.' using errcode='42501';end if;
  perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 end if;
 select coalesce((select revision from bolig_private.catalog_states where root_id=root),0) into rev;
 if action not in ('state','unit') and expected is distinct from rev then raise exception 'Grunnpakker eller tilvalg er endret. Kladden er beholdt. Hent siste versjon.' using errcode='PT409';end if;
 if action='package' then
  v_id:=nullif(payload->>'id','')::uuid;v_lines:=payload->'lines';
  if v_id is not null and not exists(select 1 from bolig_private.packages where id=v_id and root_id=root) then raise exception 'Pakken tilhører ikke hovedprosjektet.' using errcode='42501';end if;
  if jsonb_typeof(v_lines) is distinct from 'array' or jsonb_array_length(v_lines) not between 1 and 100 then raise exception 'Legg inn mellom 1 og 100 varelinjer.' using errcode='22023';end if;
  for line in select value from jsonb_array_elements(v_lines) loop
   if jsonb_typeof(line) is distinct from 'object' or coalesce(line->>'key','') !~ '^[a-zA-Z0-9-]{1,60}$' or line->>'key'=any(keys)
    or coalesce(length(trim(line->>'name')),0) not between 1 and 160 or coalesce(length(line->>'sku'),0)>80
    or jsonb_typeof(line->'quantity') is distinct from 'number' or (line->>'quantity')::numeric not between 0.001 and 10000
    or coalesce(jsonb_typeof(line->'credit_cents'),'null') not in ('number','null') or (line->>'credit_cents')::numeric not between 0 and 1000000000 or (line->>'credit_cents')::numeric<>trunc((line->>'credit_cents')::numeric)
    or (line->>'quantity')::numeric<>round((line->>'quantity')::numeric,3) or coalesce(length(trim(line->>'unit')),0) not between 1 and 20
   then raise exception 'Kontroller navn, varenummer, antall og enhet på varelinjene.' using errcode='22023';end if;
   keys:=array_append(keys,line->>'key');
  end loop;
  select jsonb_agg(jsonb_build_object('key',x->>'key','name',trim(x->>'name'),'sku',coalesce(trim(x->>'sku'),''),'quantity',(x->>'quantity')::numeric,'unit',trim(x->>'unit'),'credit_cents',(x->>'credit_cents')::bigint) order by ord) into v_lines from jsonb_array_elements(v_lines) with ordinality a(x,ord);
  if v_id is null then
   if (select count(*) from bolig_private.packages where root_id=root)>=100 then raise exception 'Inntil 100 grunnpakker per hovedprosjekt.' using errcode='22023';end if;
   insert into bolig_private.packages(root_id,name,lines) values(root,trim(payload->>'name'),v_lines) returning id into v_id;
  else update bolig_private.packages set name=trim(payload->>'name'),lines=v_lines,revision=revision+1 where id=v_id and root_id=root;end if;
 elsif action='option' then
  v_id:=nullif(payload->>'id','')::uuid;
  if v_id is not null and not exists(select 1 from bolig_private.options where id=v_id and root_id=root) then raise exception 'Tilvalget tilhører ikke hovedprosjektet.' using errcode='42501';end if;
  if jsonb_typeof(payload->'deduct_base') is distinct from 'boolean' or ((payload->>'deduct_base')::boolean and coalesce(payload->>'replace_key','')='')
   or jsonb_typeof(payload->'price_cents') is distinct from 'number' or (payload->>'price_cents')::numeric<>trunc((payload->>'price_cents')::numeric)
   or jsonb_typeof(payload->'quantity') is distinct from 'number' or (payload->>'quantity')::numeric<>round((payload->>'quantity')::numeric,3)
   or (coalesce(payload->>'replace_key','')<>'' and not exists(select 1 from bolig_private.packages p cross join lateral jsonb_array_elements(p.lines) l where p.root_id=root and not p.archived and l->>'key'=payload->>'replace_key'))
  then raise exception 'Kontroller pris, antall og hvilken standardvare som erstattes.' using errcode='22023';end if;
  if v_id is null then
   if (select count(*) from bolig_private.options where root_id=root)>=1000 then raise exception 'Inntil 1000 tilvalg per hovedprosjekt.' using errcode='22023';end if;
   insert into bolig_private.options(root_id,name,sku,quantity,unit,price_cents,replace_key,deduct_base) values(root,trim(payload->>'name'),coalesce(trim(payload->>'sku'),''),(payload->>'quantity')::numeric,trim(payload->>'unit'),(payload->>'price_cents')::bigint,coalesce(payload->>'replace_key',''),(payload->>'deduct_base')::boolean) returning id into v_id;
  else update bolig_private.options set name=trim(payload->>'name'),sku=coalesce(trim(payload->>'sku'),''),quantity=(payload->>'quantity')::numeric,unit=trim(payload->>'unit'),price_cents=(payload->>'price_cents')::bigint,replace_key=coalesce(payload->>'replace_key',''),deduct_base=(payload->>'deduct_base')::boolean,revision=revision+1 where id=v_id and root_id=root;end if;
 elsif action='archive' then
  if jsonb_typeof(payload->'archived') is distinct from 'boolean' then raise exception 'Velg skjuling eller gjenoppretting.' using errcode='22023';end if;
  v_id:=(payload->>'id')::uuid;
  if payload->>'kind'='package' then update bolig_private.packages set archived=(payload->>'archived')::boolean,revision=revision+1 where id=v_id and root_id=root;
  elsif payload->>'kind'='option' then update bolig_private.options set archived=(payload->>'archived')::boolean,revision=revision+1 where id=v_id and root_id=root;
  else raise exception 'Ugyldig liste.' using errcode='22023';end if;
  if not found then raise exception 'Innholdet tilhører ikke hovedprosjektet.' using errcode='42501';end if;
 elsif action='choose' then
  u_id:=(payload->>'unit_id')::uuid;
  select jsonb_build_object('unit_id',u.id,'number',u.number,'contact_name',u.contact_name,'address',e.address,'block',b.name) into identity from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.id=u_id and u.root_id=root and not u.archived and not e.archived and not b.archived;
  if identity is null then raise exception 'Velg en aktiv bolig i hovedprosjektet.' using errcode='42501';end if;
  select coalesce(max(revision),0) into nr from bolig_private.choice_versions where unit_id=u_id;
  if (payload->>'choice_revision')::bigint is distinct from nr then raise exception 'Boligvalget er endret. Kladden er beholdt. Hent siste versjon.' using errcode='PT409';end if;
  select * into pkg from bolig_private.packages where id=(payload->>'package_id')::uuid and root_id=root and not archived;
  if not found then raise exception 'Velg en tilgjengelig grunnpakke.' using errcode='22023';end if;
  if jsonb_typeof(payload->'option_ids') is distinct from 'array' or jsonb_array_length(payload->'option_ids')>100 then raise exception 'Velg inntil 100 tilvalg.' using errcode='22023';end if;
  select coalesce(array_agg(value::uuid),'{}') into option_ids from jsonb_array_elements_text(payload->'option_ids');
  if cardinality(option_ids)<>(select count(distinct x) from unnest(option_ids) x) then raise exception 'Samme tilvalg kan ikke velges flere ganger.' using errcode='22023';end if;
  for v_id in select unnest(option_ids) loop
   select * into opt from bolig_private.options where id=v_id and root_id=root and not archived;
   if not found then raise exception 'Et tilvalg er ikke tilgjengelig.' using errcode='22023';end if;
   if opt.replace_key<>'' then
    if opt.replace_key=any(replacement_keys) or not exists(select 1 from jsonb_array_elements(pkg.lines) l where l->>'key'=opt.replace_key) then raise exception 'Tilvalg passer ikke til pakken, eller flere tilvalg erstatter samme vare.' using errcode='22023';end if;
    replacement_keys:=array_append(replacement_keys,opt.replace_key);
   end if;
   deduction:=0;
   if opt.deduct_base and opt.replace_key<>'' then select (l->>'credit_cents')::bigint into deduction from jsonb_array_elements(pkg.lines) l where l->>'key'=opt.replace_key;
    if deduction is null then raise exception 'Grunnsum mangler for fratrekk. Oppgi grunnsummen eller velg alternativ uten fratrekk.' using errcode='22023';end if;end if;
   net:=opt.price_cents-deduction;
   v_options:=v_options||jsonb_build_array((to_jsonb(opt)-'root_id')||jsonb_build_object('deduction_cents',deduction,'net_cents',net));total:=total+net;
  end loop;
  select coalesce(jsonb_agg(l),'[]') into goods from jsonb_array_elements(pkg.lines) l where not (l->>'key'=any(replacement_keys));
  for line in select value from jsonb_array_elements(v_options) loop goods:=goods||jsonb_build_array(jsonb_build_object('key',line->>'id','name',line->>'name','sku',line->>'sku','quantity',line->'quantity','unit',line->>'unit'));end loop;
  choice:=jsonb_build_object('status','draft','catalog_revision',rev,'package',to_jsonb(pkg)-'root_id','options',v_options,'goods',goods,'total_cents',total,'identity',identity,'base_payer','sameie','options_payer','beboer');
  insert into bolig_private.choice_versions(unit_id,root_id,revision,snapshot,created_by) values(u_id,root,nr+1,choice,auth.uid());
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'choice',u_id,nr+1);
 elsif action not in ('state','unit') then raise exception 'Ukjent handling.' using errcode='22023';end if;
 if action in ('package','option','archive') then
  insert into bolig_private.catalog_states(root_id,revision) values(root,1) on conflict(root_id) do update set revision=bolig_private.catalog_states.revision+1 returning revision into rev;
  insert into bolig_private.audit(company_id,root_id,actor_id,action,entity_id,revision) values(c,root,auth.uid(),'catalog_'||action,v_id,rev);
 end if;
 if action in ('unit','choose') then
  u_id:=(payload->>'unit_id')::uuid;
  if not exists(select 1 from bolig_private.units where id=u_id and root_id=root) then raise exception 'Boligen tilhører ikke hovedprosjektet.' using errcode='42501';end if;
 end if;
 return jsonb_build_object('context',ctx,'root_id',root,'revision',rev,'packages',coalesce((select jsonb_agg(to_jsonb(p) order by p.name,p.id) from bolig_private.packages p where p.root_id=root),'[]'),
 'options',coalesce((select jsonb_agg(to_jsonb(o) order by o.name,o.id) from bolig_private.options o where o.root_id=root),'[]'),
 'unit_id',u_id,'selection',(select to_jsonb(cv)-'root_id' from bolig_private.choice_versions cv where cv.unit_id=u_id order by cv.revision desc limit 1),
 'history',coalesce((select jsonb_agg(to_jsonb(h) order by h.revision desc) from (select revision,created_at,snapshot from bolig_private.choice_versions where unit_id=u_id order by revision desc limit 20) h),'[]'));
end$$;
revoke all on function bolig_private.catalog(uuid,uuid,text,bigint,jsonb) from public,anon,authenticated,service_role;
grant execute on function bolig_private.catalog(uuid,uuid,text,bigint,jsonb) to authenticated;
create function public.bolig_catalog(p_company_id uuid,p_root_id uuid,p_action text default 'state',p_revision bigint default null,p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.catalog(p_company_id,p_root_id,p_action,p_revision,p_payload);$$;
revoke all on function public.bolig_catalog(uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function public.bolig_catalog(uuid,uuid,text,bigint,jsonb) to authenticated;

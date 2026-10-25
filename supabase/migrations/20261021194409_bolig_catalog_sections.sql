-- Add ordered, price-neutral content sections and multi-product option packages.
-- No historical choice/order snapshot is rewritten. Existing RPC authority,
-- catalog revision locks, reader/manager checks and root isolation stay in force.
alter table bolig_private.packages add column sections jsonb not null default '[]' check(jsonb_typeof(sections)='array');
alter table bolig_private.options add column sections jsonb not null default '[]' check(jsonb_typeof(sections)='array');
alter table bolig_private.options add column lines jsonb not null default '[]' check(jsonb_typeof(lines)='array');

create function bolig_private.catalog_content(payload jsonb, base boolean) returns jsonb
language plpgsql immutable set search_path='' as $$
declare sections jsonb:=coalesce(payload->'sections','[]');lines jsonb:=coalesce(payload->'lines','[]');s jsonb;l jsonb;ids text[]:='{}';keys text[]:='{}';normalized_sections jsonb:='[]';normalized_lines jsonb:='[]';sid text;section_name text;
begin
 if jsonb_typeof(sections) is distinct from 'array' or jsonb_array_length(sections)>30 or jsonb_typeof(lines) is distinct from 'array' or jsonb_array_length(lines) not between 1 and 100 then raise exception 'Bruk inntil 30 avsnitt og mellom 1 og 100 varer per pakke.' using errcode='22023';end if;
 for s in select value from jsonb_array_elements(sections) loop
  if jsonb_typeof(s) is distinct from 'object' or coalesce(s->>'id','') !~ '^[a-zA-Z0-9-]{1,60}$' or s->>'id'=any(ids) or jsonb_typeof(s->'name') is distinct from 'string' or coalesce(length(trim(s->>'name')),0) not between 1 and 120 or coalesce(length(s->>'description'),0)>1000 or (s ? 'description' and jsonb_typeof(s->'description')<>'string') then raise exception 'Gi hvert avsnitt et navn og en unik ID. Kort tekst kan ha inntil 1000 tegn.' using errcode='22023';end if;
  ids:=array_append(ids,s->>'id');
  normalized_sections:=normalized_sections||jsonb_build_array(jsonb_build_object('id',s->>'id','name',trim(s->>'name'),'description',coalesce(s->>'description','')));
 end loop;
 for l in select value from jsonb_array_elements(lines) loop
  sid:=coalesce(l->>'section_id','');
  if jsonb_typeof(l) is distinct from 'object' or coalesce(l->>'key','') !~ '^[a-zA-Z0-9-]{1,60}$' or l->>'key'=any(keys) or (sid<>'' and not sid=any(ids)) or (l ? 'section_id' and jsonb_typeof(l->'section_id')<>'string')
   or jsonb_typeof(l->'name') is distinct from 'string' or coalesce(length(trim(l->>'name')),0) not between 1 and 160 or coalesce(length(l->>'sku'),0)>80 or (l ? 'sku' and jsonb_typeof(l->'sku')<>'string')
   or jsonb_typeof(l->'quantity') is distinct from 'number' or (l->>'quantity')::numeric not between 0.001 and 10000 or (l->>'quantity')::numeric<>round((l->>'quantity')::numeric,3)
   or jsonb_typeof(l->'unit') is distinct from 'string' or coalesce(length(trim(l->>'unit')),0) not between 1 and 20
   or not bolig_private.valid_product_url(coalesce(l->>'image_url','')) or not bolig_private.valid_product_url(coalesce(l->>'product_url',''))
   or (base and (coalesce(jsonb_typeof(l->'credit_cents'),'null') not in ('number','null') or (l->>'credit_cents')::numeric not between 0 and 1000000000 or (l->>'credit_cents')::numeric<>trunc((l->>'credit_cents')::numeric)))
  then raise exception 'Kontroller avsnitt, beskrivelse, varenummer, antall og bilde på hver vare.' using errcode='22023';end if;
  keys:=array_append(keys,l->>'key');
  select x->>'name' into section_name from jsonb_array_elements(normalized_sections) x where x->>'id'=sid;
  normalized_lines:=normalized_lines||jsonb_build_array(jsonb_build_object('key',l->>'key','name',trim(l->>'name'),'sku',coalesce(l->>'sku',''),'quantity',(l->>'quantity')::numeric,'unit',trim(l->>'unit'),'credit_cents',case when base then (l->>'credit_cents')::bigint else null end,'image_url',coalesce(l->>'image_url',''),'product_url',coalesce(l->>'product_url',''),'section_id',sid,'section_name',coalesce(section_name,'')));
 end loop;
 -- Persist the same order as the editor: ordered sections, then unsectioned goods.
 select coalesce(jsonb_agg(x.item order by coalesce(array_position(ids,x.item->>'section_id'),2147483647),x.n),'[]') into normalized_lines from jsonb_array_elements(normalized_lines) with ordinality x(item,n);
 return jsonb_build_object('sections',normalized_sections,'lines',normalized_lines);
end$$;
revoke all on function bolig_private.catalog_content(jsonb,boolean) from public,anon,authenticated,service_role;

create function bolig_private.option_goods(o jsonb) returns jsonb language sql immutable set search_path='' as $$
 select case when jsonb_array_length(coalesce(o->'lines','[]'))=0 then jsonb_build_array(jsonb_build_object('key',o->>'id','name',o->>'name','sku',o->>'sku','quantity',o->'quantity','unit',o->>'unit','image_url',o->>'image_url','product_url',o->>'product_url'))
 else (select jsonb_agg((l-'credit_cents')||jsonb_build_object('key',case when l->>'key'='legacy' then o->>'id' else (o->>'id')||'/'||(l->>'key') end,'option_name',o->>'name') order by n) from jsonb_array_elements(o->'lines') with ordinality x(l,n)) end;
$$;
revoke all on function bolig_private.option_goods(jsonb) from public,anon,authenticated,service_role;

-- Change only the catalog content branches in the current guarded implementation.
-- Exact source anchors make drift fail the migration instead of silently losing a guard.
do $migration$
declare body text;old text;replacement text;
begin
 body:=pg_get_functiondef('bolig_private.catalog_legacy(uuid,uuid,text,bigint,jsonb)'::regprocedure);
 old:=' if action=''package'' then';
 replacement:=$patch$ if action in ('package','option') then
  if payload ? 'sections' or payload ? 'lines' and action='option' then
   content:=bolig_private.catalog_content(payload,action='package');
   payload:=payload||content;
  elsif action='package' and exists(select 1 from bolig_private.packages where id=nullif(payload->>'id','')::uuid and root_id=root and sections<>'[]')
   or action='option' and exists(select 1 from bolig_private.options where id=nullif(payload->>'id','')::uuid and root_id=root and (sections<>'[]' or lines<>'[]')) then
   raise exception 'Pakken har avsnitt eller flere varer. Oppdater siden før du redigerer. Kladden er beholdt.' using errcode='PT409';
  end if;
 end if;
 if action='package' then$patch$;
 if position(old in body)=0 then raise exception 'Missing catalog content anchor';end if;body:=replace(body,old,replacement);
 body:=replace(body,'declare ctx jsonb;', 'declare content jsonb;ctx jsonb;');
 old:='''product_url'',coalesce(x->>''product_url'','''')) order by ord)';
 replacement:='''product_url'',coalesce(x->>''product_url'',''''),''section_id'',coalesce(x->>''section_id'',''''),''section_name'',coalesce(x->>''section_name'','''')) order by ord)';
 if position(old in body)=0 then raise exception 'Missing package lines anchor';end if;body:=replace(body,old,replacement);
 old:='insert into bolig_private.packages(root_id,name,lines) values(root,trim(payload->>''name''),v_lines)';
 replacement:='insert into bolig_private.packages(root_id,name,lines,sections) values(root,trim(payload->>''name''),v_lines,coalesce(payload->''sections'',''[]''))';
 if position(old in body)=0 then raise exception 'Missing package insert anchor';end if;body:=replace(body,old,replacement);
 old:='set name=trim(payload->>''name''),lines=v_lines,revision=revision+1';
 replacement:='set name=trim(payload->>''name''),lines=v_lines,sections=coalesce(payload->''sections'',''[]''),revision=revision+1';
 if position(old in body)=0 then raise exception 'Missing package update anchor';end if;body:=replace(body,old,replacement);
 old:='replace_key,deduct_base,image_url,product_url) values';replacement:='replace_key,deduct_base,image_url,product_url,sections,lines) values';
 if position(old in body)=0 then raise exception 'Missing option insert anchor';end if;body:=replace(body,old,replacement);
 old:='coalesce(payload->>''product_url'','''')) returning id into v_id;';replacement:='coalesce(payload->>''product_url'',''''),coalesce(payload->''sections'',''[]''),coalesce(payload->''lines'',''[]'')) returning id into v_id;';
 if position(old in body)=0 then raise exception 'Missing option values anchor';end if;body:=replace(body,old,replacement);
 old:='product_url=coalesce(payload->>''product_url'',''''),revision=revision+1';replacement:='product_url=coalesce(payload->>''product_url'',''''),sections=coalesce(payload->''sections'',''[]''),lines=coalesce(payload->''lines'',''[]''),revision=revision+1';
 if position(old in body)=0 then raise exception 'Missing option update anchor';end if;body:=replace(body,old,replacement);
 old:=$anchor$goods:=goods||jsonb_build_array(jsonb_build_object('key',line->>'id','name',line->>'name','sku',line->>'sku','quantity',line->'quantity','unit',line->>'unit','image_url',line->>'image_url','product_url',line->>'product_url'));$anchor$;
 replacement:='goods:=goods||bolig_private.option_goods(line);';
 if position(old in body)=0 then raise exception 'Missing legacy goods anchor';end if;body:=replace(body,old,replacement);
 old:='  choice:=jsonb_build_object';replacement:=$patch$  if jsonb_array_length(goods)>1000 then raise exception 'Inntil 1000 varelinjer samlet per bolig.' using errcode='22023';end if;
  choice:=jsonb_build_object$patch$;
 if position(old in body)=0 then raise exception 'Missing choice size anchor';end if;body:=replace(body,old,replacement);
 execute body;
 body:=pg_get_functiondef('bolig_private.package_snapshot(uuid,uuid,jsonb,bigint)'::regprocedure);
 old:=$anchor$select goods||coalesce(jsonb_agg(jsonb_build_object('key',x->>'id','name',x->>'name','sku',x->>'sku','quantity',x->'quantity','unit',x->>'unit','image_url',x->>'image_url','product_url',x->>'product_url') order by n),'[]') into goods from jsonb_array_elements(opts) with ordinality g(x,n);$anchor$;
 replacement:=$patch$select goods||coalesce(jsonb_agg(l order by n,m),'[]') into goods from jsonb_array_elements(opts) with ordinality g(x,n) cross join lateral jsonb_array_elements(bolig_private.option_goods(x)) with ordinality h(l,m);$patch$;
 if position(old in body)=0 then raise exception 'Missing scoped goods anchor';end if;body:=replace(body,old,replacement);
 execute body;
end$migration$;

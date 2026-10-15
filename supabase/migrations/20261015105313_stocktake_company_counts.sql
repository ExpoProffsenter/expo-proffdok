-- Separate, price-free company stocktakes. No changes to picklists or catalog data.
create schema stocktake_private;
revoke all on schema stocktake_private from public,anon,authenticated;
create table stocktake_private.settings(
 company_id uuid primary key references public.sales_company_scopes(id),
 enabled boolean not null default false, revision integer not null default 1
);
create table stocktake_private.sessions(
 id uuid primary key, company_id uuid not null references public.sales_company_scopes(id),
 created_by uuid not null references public.profiles(id), title text not null,
 warehouse text not null, count_date date not null, closed boolean not null default false,
 revision bigint not null default 1, created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index stocktake_sessions_company on stocktake_private.sessions(company_id,created_at desc,id);
create table stocktake_private.lines(
 id uuid primary key default gen_random_uuid(), session_id uuid not null references stocktake_private.sessions(id) on delete cascade,
 line_key text not null, catalog_id uuid, supplier text not null, number text not null,
 description text not null, gtin text not null, location text not null,
 quantity numeric(15,3) not null check(quantity between 0 and 999999999), revision integer not null default 1,
 updated_by uuid not null references public.profiles(id), updated_at timestamptz not null default now(),
 unique(session_id,line_key)
);
create index stocktake_lines_page on stocktake_private.lines(session_id,id);
create table stocktake_private.commands(
 id uuid primary key, session_id uuid not null references stocktake_private.sessions(id) on delete cascade,
 actor_id uuid not null references public.profiles(id), payload jsonb not null,result jsonb not null
);
alter table stocktake_private.settings enable row level security;
alter table stocktake_private.sessions enable row level security;
alter table stocktake_private.lines enable row level security;
alter table stocktake_private.commands enable row level security;
revoke all on all tables in schema stocktake_private from public,anon,authenticated;

create function stocktake_private.check_actor(p_company_id uuid,p_require_enabled boolean default true) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and approved is true and deactivated is not true)
 or p_company_id is null or p_company_id is distinct from public.current_active_company_scope_id()
 or not coalesce(public.current_user_has_internal_store_price_search_access(),false)
 or not (coalesce(public.current_profile_is_systemadmin(),false) or exists(select 1 from public.sales_company_memberships where user_id=auth.uid() and company_id=p_company_id))
 then raise exception 'Du har ikke tilgang til varetelling i dette firmaet.' using errcode='42501'; end if;
 if p_require_enabled then
  -- This row lock keeps disable and subsequent counting commands ordered.
  perform 1 from stocktake_private.settings where company_id=p_company_id and enabled for share;
  if not found then raise exception 'Varetelling er ikke aktivert på firmaet.' using errcode='42501'; end if;
 end if;
end; $$;
revoke all on function stocktake_private.check_actor(uuid,boolean) from public,anon,authenticated;

create function public.stocktake_admin_get(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not coalesce(public.current_profile_is_systemadmin(),false)
 or not exists(select 1 from public.profiles where id=auth.uid() and approved is true and deactivated is not true)
 then raise exception 'Kun systemadministrator kan aktivere varetelling.' using errcode='42501'; end if;
 if not exists(select 1 from public.sales_company_scopes where id=p_company_id) then raise exception 'Firmaet finnes ikke.' using errcode='22023'; end if;
 return jsonb_build_object('company_id',p_company_id,'enabled',coalesce((select enabled from stocktake_private.settings where company_id=p_company_id),false),
 'revision',coalesce((select revision from stocktake_private.settings where company_id=p_company_id),0));
end; $$;

create function public.stocktake_admin_set(p_company_id uuid,p_enabled boolean,p_expected_revision integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_old jsonb;
begin
 v_old:=public.stocktake_admin_get(p_company_id);
 perform 1 from public.sales_company_scopes where id=p_company_id for update;
 v_old:=public.stocktake_admin_get(p_company_id);
 if p_enabled is null or p_expected_revision is distinct from (v_old->>'revision')::integer
 then raise exception 'Tilgangen er endret. Hent firmaet på nytt.' using errcode='40001'; end if;
 insert into stocktake_private.settings(company_id,enabled) values(p_company_id,p_enabled)
 on conflict(company_id) do update set enabled=excluded.enabled,revision=stocktake_private.settings.revision+1;
 return public.stocktake_admin_get(p_company_id);
end; $$;

create function public.stocktake_context() returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_company uuid:=public.current_active_company_scope_id(); v_enabled boolean;
begin
 perform stocktake_private.check_actor(v_company,false);
 select enabled into v_enabled from stocktake_private.settings where company_id=v_company;
 return jsonb_build_object('company_id',v_company,'user_id',auth.uid(),'company_name',(select display_name from public.sales_company_scopes where id=v_company),
 'enabled',coalesce(v_enabled,false));
end; $$;

create function public.stocktake_list(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform stocktake_private.check_actor(p_company_id);
 return coalesce((select jsonb_agg(to_jsonb(s) order by s.created_at desc,s.id) from (
 select s.*, (select count(*) from stocktake_private.lines l where l.session_id=s.id) as line_count
 from stocktake_private.sessions s where s.company_id=p_company_id order by s.created_at desc,s.id limit 200
 ) s),'[]'::jsonb);
end; $$;

create function public.stocktake_create(p_company_id uuid,p_id uuid,p_title text,p_warehouse text,p_date date) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_session stocktake_private.sessions%rowtype;
begin
 perform stocktake_private.check_actor(p_company_id);
 if p_id is null or length(btrim(p_title)) not between 1 and 120 or length(btrim(p_warehouse)) not between 1 and 80
 or p_title is null or p_warehouse is null or p_date is null or p_title~'[[:cntrl:]]' or p_warehouse~'[[:cntrl:]]'
 then raise exception 'Fyll ut navn, lager og telledato.' using errcode='22023'; end if;
 insert into stocktake_private.sessions(id,company_id,created_by,title,warehouse,count_date)
 values(p_id,p_company_id,auth.uid(),btrim(p_title),btrim(p_warehouse),p_date) on conflict(id) do nothing;
 select * into v_session from stocktake_private.sessions where id=p_id;
 if v_session.company_id<>p_company_id or v_session.created_by<>auth.uid() or v_session.title<>btrim(p_title) or v_session.warehouse<>btrim(p_warehouse) or v_session.count_date<>p_date
 then raise exception 'Tellingen er allerede opprettet med andre opplysninger.' using errcode='22023'; end if;
 return to_jsonb(v_session);
end; $$;

create function public.stocktake_get(p_company_id uuid,p_id uuid,p_offset integer default 0) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_session stocktake_private.sessions%rowtype;
begin
 perform stocktake_private.check_actor(p_company_id);
 select * into v_session from stocktake_private.sessions where id=p_id and company_id=p_company_id;
 if not found then raise exception 'Tellingen finnes ikke i dette firmaet.' using errcode='42501'; end if;
 return jsonb_build_object('session',to_jsonb(v_session),'total',(select count(*) from stocktake_private.lines where session_id=p_id),
 'items',coalesce((select jsonb_agg(to_jsonb(l) order by l.id) from (select * from stocktake_private.lines where session_id=p_id order by id limit 100 offset greatest(coalesce(p_offset,0),0)) l),'[]'::jsonb));
end; $$;

create function public.stocktake_record(p_company_id uuid,p_id uuid,p_command_id uuid,p_input jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_session stocktake_private.sessions%rowtype; v_command stocktake_private.commands%rowtype;
 v_line stocktake_private.lines%rowtype; v_product record; v_quantity numeric; v_supplier text; v_number text;
 v_description text; v_gtin text; v_location text; v_key text; v_catalog uuid; v_result jsonb;
begin
 perform stocktake_private.check_actor(p_company_id);
 select * into v_session from stocktake_private.sessions where id=p_id and company_id=p_company_id for update;
 if not found then raise exception 'Tellingen finnes ikke i dette firmaet.' using errcode='42501'; end if;
 if p_command_id is null or jsonb_typeof(p_input) is distinct from 'object' then raise exception 'Ugyldig registrering.' using errcode='22023'; end if;
 select * into v_command from stocktake_private.commands where id=p_command_id;
 if found then
  if v_command.session_id<>p_id or v_command.actor_id<>auth.uid() or v_command.payload<>p_input then raise exception 'Registreringsnøkkelen er allerede brukt.' using errcode='22023'; end if;
  return v_command.result;
 end if;
 if v_session.closed then raise exception 'Tellingen er avsluttet. Opprett en ny telling.' using errcode='55000'; end if;
 if p_input->>'action'='close' then
  if p_input-array['action','revision']<>'{}'::jsonb then raise exception 'Ugyldig avslutning.' using errcode='22023'; end if;
  if (p_input->>'revision')::bigint is distinct from v_session.revision then raise exception 'Tellingen er endret av en annen bruker. Hent på nytt før avslutning.' using errcode='40001'; end if;
  update stocktake_private.sessions set closed=true where id=p_id;
  v_result:=jsonb_build_object('closed',true);
 elsif p_input->>'action' in ('set','delete') then
  if p_input-array['action','line_id','revision','quantity']<>'{}'::jsonb then raise exception 'Ugyldig vareendring.' using errcode='22023'; end if;
  select * into v_line from stocktake_private.lines where id=(p_input->>'line_id')::uuid and session_id=p_id;
  if not found or (p_input->>'revision')::integer is distinct from v_line.revision then raise exception 'Varen er endret av en annen bruker. Hent på nytt.' using errcode='40001'; end if;
  if p_input->>'action'='delete' then
   delete from stocktake_private.lines where id=v_line.id;v_result:=jsonb_build_object('deleted',v_line.id);
  else
   if coalesce(p_input->>'quantity','')!~'^[0-9]{1,9}([.][0-9]{1,3})?$' then raise exception 'Antall må være 0 eller mer, med høyst tre desimaler.' using errcode='22023'; end if;
   v_quantity:=(p_input->>'quantity')::numeric;
   update stocktake_private.lines set quantity=v_quantity,revision=revision+1,updated_by=auth.uid(),updated_at=now() where id=v_line.id returning * into v_line;
   v_result:=to_jsonb(v_line);
  end if;
 elsif p_input->>'action'='add' then
  if p_input-array['action','catalog_id','supplier','number','description','gtin','location','quantity']<>'{}'::jsonb
  or coalesce(p_input->>'quantity','')!~'^[0-9]{1,9}([.][0-9]{1,3})?$' then raise exception 'Ugyldig vare eller antall. Bruk høyst tre desimaler.' using errcode='22023'; end if;
  v_quantity:=(p_input->>'quantity')::numeric;v_location:=btrim(coalesce(p_input->>'location',''));
  if nullif(p_input->>'catalog_id','') is not null then
   v_catalog:=(p_input->>'catalog_id')::uuid;
   if exists(select 1 from public.internal_store_catalog_imports where status in ('loading','ready')) then raise exception 'Vareregisteret oppdateres. Prøv igjen om litt.' using errcode='55000'; end if;
   select i.* into v_product from public.internal_store_catalog_items i join public.internal_store_catalog_imports imp on imp.id=i.last_import_id and imp.status='active' where i.id=v_catalog and i.is_active;
   if not found then raise exception 'Varen er ikke aktiv. Søk på nytt eller legg den inn manuelt.' using errcode='22023'; end if;
   v_supplier:=btrim(v_product.supplier_name);v_number:=btrim(v_product.supplier_product_number);v_description:=btrim(v_product.description);v_gtin:=coalesce(v_product.gtin,'');
  else
   v_supplier:=btrim(p_input->>'supplier');v_number:=btrim(p_input->>'number');v_description:=btrim(p_input->>'description');v_gtin:=btrim(coalesce(p_input->>'gtin',''));
  end if;
  if coalesce(length(v_supplier),0) not between 1 and 120 or coalesce(length(v_number),0) not between 1 and 120 or coalesce(length(v_description),0) not between 1 and 500
  or length(v_gtin)>50 or length(v_location)>120 or (v_supplier||v_number||v_description||v_gtin||v_location)~'[[:cntrl:]]'
  then raise exception 'Fyll ut leverandør, varenummer og beskrivelse. Fjern linjeskift.' using errcode='22023'; end if;
  v_key:=md5(jsonb_build_array(lower(v_supplier),lower(v_number),lower(v_location))::text);
  insert into stocktake_private.lines(session_id,line_key,catalog_id,supplier,number,description,gtin,location,quantity,updated_by)
  values(p_id,v_key,v_catalog,v_supplier,v_number,v_description,v_gtin,v_location,v_quantity,auth.uid())
  on conflict(session_id,line_key) do update set quantity=stocktake_private.lines.quantity+excluded.quantity,revision=stocktake_private.lines.revision+1,updated_by=auth.uid(),updated_at=now() returning * into v_line;
  v_result:=to_jsonb(v_line);
 else raise exception 'Ukjent registrering.' using errcode='22023'; end if;
 update stocktake_private.sessions set revision=revision+1,updated_at=now() where id=p_id;
 v_result:=v_result||jsonb_build_object('session_revision',v_session.revision+1);
 insert into stocktake_private.commands values(p_command_id,p_id,auth.uid(),p_input,v_result);
 return v_result;
exception when sqlstate '22023' or sqlstate '22P02' or sqlstate '23514' or sqlstate '40001' or sqlstate '55000' then
 return jsonb_build_object('error',case when sqlstate='23514' then 'Samlet antall er for stort.' else sqlerrm end,'code',sqlstate);
end; $$;

revoke all on function public.stocktake_admin_get(uuid),public.stocktake_admin_set(uuid,boolean,integer),public.stocktake_context(),public.stocktake_list(uuid),public.stocktake_create(uuid,uuid,text,text,date),public.stocktake_get(uuid,uuid,integer),public.stocktake_record(uuid,uuid,uuid,jsonb) from public,anon;
grant execute on function public.stocktake_admin_get(uuid),public.stocktake_admin_set(uuid,boolean,integer),public.stocktake_context(),public.stocktake_list(uuid),public.stocktake_create(uuid,uuid,text,text,date),public.stocktake_get(uuid,uuid,integer),public.stocktake_record(uuid,uuid,uuid,jsonb) to authenticated;

-- Expo ProffDok – FASE 45B (SANDBOX/DEMO first)
-- Datadrevet leverandørtilgang for proffkunder.
-- Ringsides purchase_net_ex_vat og øvrig intern kalkyle returneres aldri fra proff-RPC-ene.

create table if not exists public.store_catalog_company_supplier_access (
  company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
  supplier_key text not null,
  supplier_name text not null,
  discount_percent numeric(7,4) not null default 0,
  is_active boolean not null default true,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id, supplier_key),
  constraint store_catalog_company_supplier_discount_check check (discount_percent >= 0 and discount_percent <= 100)
);
create table if not exists public.store_catalog_user_price_access (
  company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  can_view_net_price boolean not null default false,
  updated_by uuid null references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (company_id, user_id)
);
alter table public.store_catalog_company_supplier_access enable row level security;
alter table public.store_catalog_user_price_access enable row level security;
revoke all on public.store_catalog_company_supplier_access from anon,authenticated;
revoke all on public.store_catalog_user_price_access from anon,authenticated;

create or replace function public.current_sales_company_id() returns uuid language sql stable security definer set search_path=public,pg_temp as $$
 select m.company_id from public.sales_company_memberships m join public.profiles p on p.id=m.user_id where m.user_id=auth.uid() and coalesce(p.approved,false)=true and coalesce(p.deactivated,false)=false order by m.company_id limit 1;
$$;
create or replace function public.current_user_can_view_store_catalog_net_price() returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce((select a.can_view_net_price from public.store_catalog_user_price_access a where a.company_id=public.current_sales_company_id() and a.user_id=auth.uid()),false);
$$;
create or replace function public.current_user_has_pro_store_catalog_access() returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select public.current_user_has_module_access('store_offers') and exists(select 1 from public.store_catalog_company_supplier_access a where a.company_id=public.current_sales_company_id() and a.is_active=true);
$$;
create or replace function public.list_store_catalog_suppliers() returns table(supplier_key text,supplier_name text) language plpgsql stable security definer set search_path=public,pg_temp as $$
begin if not public.current_profile_is_systemadmin() then raise exception 'Kun Systemadministrator kan administrere leverandørtilganger.' using errcode='42501'; end if; return query select i.supplier_key,min(i.supplier_name)::text from public.internal_store_catalog_items i where i.is_active=true group by i.supplier_key order by min(i.supplier_name); end; $$;
create or replace function public.set_store_catalog_company_supplier_access(p_company_id uuid,p_supplier_key text,p_discount_percent numeric,p_is_active boolean default true) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_supplier_key text:=public.internal_store_catalog_normalize_supplier(p_supplier_key); v_supplier_name text; v_discount numeric:=round(coalesce(p_discount_percent,0),4); begin
 if not public.current_profile_is_systemadmin() then raise exception 'Kun Systemadministrator kan administrere leverandørtilganger.' using errcode='42501'; end if;
 if not exists(select 1 from public.sales_company_scopes s where s.id=p_company_id) then raise exception 'Firmaet finnes ikke.' using errcode='P0002'; end if;
 if v_discount<0 or v_discount>100 then raise exception 'Rabatt må være mellom 0 og 100 prosent.' using errcode='22023'; end if;
 select i.supplier_name into v_supplier_name from public.internal_store_catalog_items i where i.is_active=true and i.supplier_key=v_supplier_key order by i.supplier_name limit 1;
 if v_supplier_name is null then raise exception 'Leverandøren finnes ikke i aktivt vareregister.' using errcode='P0002'; end if;
 insert into public.store_catalog_company_supplier_access(company_id,supplier_key,supplier_name,discount_percent,is_active,created_by,updated_at) values(p_company_id,v_supplier_key,v_supplier_name,v_discount,coalesce(p_is_active,true),auth.uid(),now()) on conflict(company_id,supplier_key) do update set supplier_name=excluded.supplier_name,discount_percent=excluded.discount_percent,is_active=excluded.is_active,updated_at=now();
 return jsonb_build_object('company_id',p_company_id,'supplier_key',v_supplier_key,'supplier_name',v_supplier_name,'discount_percent',v_discount,'is_active',coalesce(p_is_active,true)); end; $$;
create or replace function public.list_store_catalog_company_supplier_access(p_company_id uuid) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
begin if not public.current_profile_is_systemadmin() then raise exception 'Kun Systemadministrator kan administrere leverandørtilganger.' using errcode='42501'; end if; return coalesce((select jsonb_agg(jsonb_build_object('company_id',a.company_id,'supplier_key',a.supplier_key,'supplier_name',a.supplier_name,'discount_percent',a.discount_percent,'is_active',a.is_active) order by a.supplier_name) from public.store_catalog_company_supplier_access a where a.company_id=p_company_id),'[]'::jsonb); end; $$;
create or replace function public.set_store_catalog_user_net_price_access(p_user_id uuid,p_can_view boolean) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_actor_company uuid:=public.current_sales_company_id(); v_target_company uuid; begin
 if not public.current_profile_is_systemadmin() and not public.current_profile_is_firmaadmin() then raise exception 'Du har ikke tilgang til å administrere prisinnsyn.' using errcode='42501'; end if;
 select m.company_id into v_target_company from public.sales_company_memberships m where m.user_id=p_user_id order by m.company_id limit 1;
 if v_target_company is null then raise exception 'Brukeren har ikke gyldig firmatilknytning.' using errcode='P0002'; end if;
 if not public.current_profile_is_systemadmin() and v_target_company<>v_actor_company then raise exception 'Brukeren tilhører ikke ditt firma.' using errcode='42501'; end if;
 if not public.current_profile_is_systemadmin() and p_user_id=auth.uid() then raise exception 'Firmaadministrator kan ikke gi seg selv prisinnsyn.' using errcode='42501'; end if;
 insert into public.store_catalog_user_price_access(company_id,user_id,can_view_net_price,updated_by,updated_at) values(v_target_company,p_user_id,coalesce(p_can_view,false),auth.uid(),now()) on conflict(company_id,user_id) do update set can_view_net_price=excluded.can_view_net_price,updated_by=auth.uid(),updated_at=now();
 return jsonb_build_object('user_id',p_user_id,'company_id',v_target_company,'can_view_net_price',coalesce(p_can_view,false)); end; $$;
create or replace function public.list_store_catalog_user_net_price_access() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare v_company uuid:=public.current_sales_company_id(); begin if not public.current_profile_is_systemadmin() and not public.current_profile_is_firmaadmin() then raise exception 'Du har ikke tilgang til å administrere prisinnsyn.' using errcode='42501'; end if; return coalesce((select jsonb_agg(jsonb_build_object('user_id',p.id,'email',p.email,'company_name',p.company_name,'can_view_net_price',coalesce(a.can_view_net_price,false)) order by p.email) from public.sales_company_memberships m join public.profiles p on p.id=m.user_id left join public.store_catalog_user_price_access a on a.company_id=m.company_id and a.user_id=m.user_id where public.current_profile_is_systemadmin() or m.company_id=v_company),'[]'::jsonb); end; $$;
create or replace function public.search_pro_store_catalog(p_query text,p_limit integer default 30) returns table(id uuid,supplier_name text,supplier_product_number text,description text,gtin text,nobb_number text,product_url text,image_url text,product_group text,price_date date,suggested_sale_price_ex_vat numeric,suggested_sale_price_incl_vat numeric,my_net_price_ex_vat numeric) language plpgsql stable security definer set search_path=public,pg_temp as $$
declare v_query text:=trim(coalesce(p_query,'')); v_query_lower text:=lower(trim(coalesce(p_query,''))); v_query_sku text:=public.internal_store_catalog_normalize_sku(p_query); v_query_gtin text:=public.internal_store_catalog_normalize_gtin(p_query); v_limit integer:=least(greatest(coalesce(p_limit,30),1),50); v_company uuid:=public.current_sales_company_id(); v_show_net boolean:=public.current_user_can_view_store_catalog_net_price(); begin
 if not public.current_user_has_pro_store_catalog_access() then raise exception 'Du har ikke tilgang til proff-vareregister.' using errcode='42501'; end if; if length(v_query)<2 then return; end if;
 return query select i.id,i.supplier_name,i.supplier_product_number,i.description,i.gtin,i.nobb_number,i.product_url,i.image_url,i.product_group,i.price_date,i.customer_price_ex_vat,i.customer_price_incl_vat,case when v_show_net then round(i.customer_price_ex_vat*(1-a.discount_percent/100),2) else null end from public.internal_store_catalog_items i join public.store_catalog_company_supplier_access a on a.company_id=v_company and a.supplier_key=i.supplier_key and a.is_active=true where i.is_active=true and (i.supplier_product_number_key=v_query_sku or (v_query_gtin is not null and i.gtin=v_query_gtin) or i.search_text ilike '%'||v_query_lower||'%') order by case when i.supplier_product_number_key=v_query_sku then 0 when v_query_gtin is not null and i.gtin=v_query_gtin then 1 when i.supplier_product_number_key like v_query_sku||'%' then 2 else 3 end,i.description,i.supplier_name limit v_limit; end; $$;

revoke all on function public.current_sales_company_id() from public,anon;
revoke all on function public.current_user_can_view_store_catalog_net_price() from public,anon;
revoke all on function public.current_user_has_pro_store_catalog_access() from public,anon;
revoke all on function public.list_store_catalog_suppliers() from public,anon;
revoke all on function public.set_store_catalog_company_supplier_access(uuid,text,numeric,boolean) from public,anon;
revoke all on function public.list_store_catalog_company_supplier_access(uuid) from public,anon;
revoke all on function public.set_store_catalog_user_net_price_access(uuid,boolean) from public,anon;
revoke all on function public.list_store_catalog_user_net_price_access() from public,anon;
revoke all on function public.search_pro_store_catalog(text,integer) from public,anon;
grant execute on function public.current_user_can_view_store_catalog_net_price() to authenticated;
grant execute on function public.current_user_has_pro_store_catalog_access() to authenticated;
grant execute on function public.list_store_catalog_suppliers() to authenticated;
grant execute on function public.set_store_catalog_company_supplier_access(uuid,text,numeric,boolean) to authenticated;
grant execute on function public.list_store_catalog_company_supplier_access(uuid) to authenticated;
grant execute on function public.set_store_catalog_user_net_price_access(uuid,boolean) to authenticated;
grant execute on function public.list_store_catalog_user_net_price_access() to authenticated;
grant execute on function public.search_pro_store_catalog(text,integer) to authenticated;

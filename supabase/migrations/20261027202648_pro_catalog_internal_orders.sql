-- Add only the explicitly authorized internal Prissøk audience to the new order gateway.
-- Existing catalog/price/access functions, memberships and grants stay unchanged.
create function pro_catalog_order_private.item_allowed(p_company_id uuid,p_item_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select p_company_id=public.current_active_company_scope_id() and exists(
  select 1 from public.internal_store_catalog_items i where i.id=p_item_id and i.is_active and (
   (coalesce(public.current_user_has_internal_store_price_search_access(),false) and exists(
    select 1 from public.internal_store_catalog_imports imp where imp.id=i.last_import_id and imp.status='active'))
   or (coalesce(public.current_user_has_pro_store_catalog_access(),false) and exists(
    select 1 from public.store_catalog_company_supplier_access a where a.company_id=p_company_id and a.supplier_key=i.supplier_key and a.is_active))
  )
 );
$$;
revoke all on function pro_catalog_order_private.item_allowed(uuid,uuid) from public,anon,authenticated;
create or replace function pro_catalog_order_private.require_access(p_company_id uuid default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare c uuid:=public.current_active_company_scope_id();
begin
 if auth.uid() is null or c is null or (p_company_id is not null and c<>p_company_id)
 or not (coalesce(public.current_user_has_pro_store_catalog_access(),false) or coalesce(public.current_user_has_internal_store_price_search_access(),false))
 or not exists(select 1 from public.profiles p join public.sales_company_memberships m on m.user_id=p.id where p.id=auth.uid() and m.company_id=c and p.approved and not coalesce(p.deactivated,false))
 then raise exception 'Du har ikke tilgang til varebestilling i dette firmaet.' using errcode='42501'; end if;
 return c;
end $$;

create or replace function public.pro_catalog_order_context() returns jsonb language plpgsql security definer set search_path='' as $$
declare c uuid:=pro_catalog_order_private.require_access(); reply text;
begin
 select lower(trim(u.email)) into reply from auth.users u where u.id=auth.uid();
 if coalesce(reply,'')='' then raise exception 'Kontoen mangler e-postadresse.' using errcode='22023'; end if;
 return jsonb_build_object('internal_catalog',coalesce(public.current_user_has_internal_store_price_search_access(),false),'company_id',c,'user_id',auth.uid(),'company',public.work_profile_company_profile(c),'replyTo',reply,
 'contacts',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'name',t.name,'email',t.email) order by t.name,t.email) from pro_catalog_order_private.contacts t where t.company_id=c),'[]'::jsonb));
end $$;

create or replace function public.pro_catalog_order_prepare(p_company_id uuid,p_request_id uuid,p_order jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare c uuid:=pro_catalog_order_private.require_access(p_company_id); old pro_catalog_order_private.orders; ctx jsonb;
 goods jsonb:='[]'; line jsonb; item record; qty numeric; recipient text:=lower(trim(p_order->>'to')); recipient_name text:=trim(p_order->>'recipient_name');
 delivery_date text:=coalesce(p_order->>'requested_date',''); delivery_time text:=coalesce(p_order->>'requested_time',''); snapshot jsonb;
begin
 if p_request_id is null or jsonb_typeof(p_order)<>'object' or octet_length(p_order::text)>40000 then raise exception 'Ugyldig bestilling.' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
 select * into old from pro_catalog_order_private.orders where id=p_request_id for update;
 if found then
  if old.company_id<>c or old.user_id<>auth.uid() or old.input<>p_order then raise exception 'Bestillings-ID er brukt til et annet grunnlag.' using errcode='22023'; end if;
  -- Provider idempotency expires after 24h. Never silently send again after that window.
  if old.provider_id is null and old.created_at<now()-interval '23 hours' then raise exception 'Sendingen må avklares med mottaker før en ny bestilling opprettes.' using errcode='PT409'; end if;
  for line in select value from jsonb_array_elements(old.snapshot->'goods') loop
   if not exists(select 1 from public.internal_store_catalog_items i where pro_catalog_order_private.item_allowed(c,i.id) and i.id=(line->>'id')::uuid and i.is_active and i.supplier_product_number=line->>'sku' and i.supplier_name=line->>'supplier' and i.description=line->>'name') then raise exception 'Vareutvalget eller tilgangen er endret. Bestillingen må kontrolleres på nytt.' using errcode='42501'; end if;
  end loop;
  return jsonb_build_object('id',old.id,'snapshot',old.snapshot,'sent',old.provider_id is not null);
 end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,1));
 if (select count(*) from pro_catalog_order_private.orders where user_id=auth.uid() and created_at>now()-interval '1 day')>=100 then raise exception 'For mange bestillingsforsøk. Kontakt oss.' using errcode='22023'; end if;
 if coalesce(length(recipient),0) not between 3 and 254 or recipient !~ '^[^[:space:]@,;<>]+@[^[:space:]@,;<>]+\.[^[:space:]@,;<>]+$' or coalesce(length(recipient_name),0) not between 1 and 120 then raise exception 'Fyll ut mottaker og en gyldig e-postadresse.' using errcode='22023'; end if;
 if coalesce(length(trim(p_order->>'address')),0) not between 1 and 500 or coalesce(length(p_order->>'reference'),0)>120 or coalesce(length(p_order->>'note'),0)>2000 then raise exception 'Kontroller leveringsadresse og referanse.' using errcode='22023'; end if;
 if delivery_date<>'' then
  if delivery_date !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Ugyldig leveringsdato.' using errcode='22023'; end if;
  perform delivery_date::date;
 end if;
 if (delivery_time<>'' and (delivery_date='' or delivery_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')) then raise exception 'Velg leveringsdato før klokkeslett (norsk tid).' using errcode='22023'; end if;
 if jsonb_typeof(p_order->'items') is distinct from 'array' then raise exception 'Velg varer.' using errcode='22023'; end if;
 if jsonb_array_length(p_order->'items') not between 1 and 100 then raise exception 'Velg mellom 1 og 100 varer.' using errcode='22023'; end if;
 for line in select value from jsonb_array_elements(p_order->'items') loop
  if coalesce(line->>'quantity','') !~ '^\d{1,5}([.,]\d{1,3})?$' then raise exception 'Ugyldig antall.' using errcode='22023'; end if;
  qty:=replace(line->>'quantity',',','.')::numeric;
  if qty<=0 or qty>99999 then raise exception 'Antall må være over null og høyst 99999.' using errcode='22023'; end if;
  select i.id,i.supplier_name,i.supplier_product_number,i.description into item from public.internal_store_catalog_items i where pro_catalog_order_private.item_allowed(c,i.id) and i.id=(line->>'id')::uuid and i.is_active;
  if not found then raise exception 'En vare er ikke lenger tilgjengelig i firmaets katalog.' using errcode='42501'; end if;
  if item.supplier_product_number ~ '[;\r\n]' or item.supplier_name ~ '[;\r\n]' or trim(item.supplier_product_number)='' or trim(item.supplier_name)='' then raise exception 'Varen mangler gyldig varenummer eller leverandør.' using errcode='22023'; end if;
  if exists(select 1 from jsonb_array_elements(goods) g where g->>'id'=item.id::text) then raise exception 'Samme vare er valgt flere ganger.' using errcode='22023'; end if;
  goods:=goods||jsonb_build_array(jsonb_build_object('id',item.id,'sku',item.supplier_product_number,'supplier',item.supplier_name,'name',item.description,'quantity',qty,'unit',''));
 end loop;
 ctx:=public.pro_catalog_order_context();
 snapshot:=jsonb_build_object('order_number','V-'||upper(p_request_id::text),'company',ctx->'company','replyTo',ctx->>'replyTo','to',recipient,'recipient_name',recipient_name,'reference',trim(coalesce(p_order->>'reference','')),'address',trim(p_order->>'address'),'requested_date',delivery_date,'requested_time',delivery_time,'note',trim(coalesce(p_order->>'note','')),'goods',goods);
 insert into pro_catalog_order_private.orders(id,company_id,user_id,input,snapshot) values(p_request_id,c,auth.uid(),p_order,snapshot);
 return jsonb_build_object('id',p_request_id,'snapshot',snapshot,'sent',false);
end $$;
-- Return an explicit allowlist. Internal purchase prices never enter the order lookup.
create function public.pro_catalog_order_search(p_query text,p_limit integer default 12)
returns table(id uuid,supplier_name text,supplier_product_number text,description text,suggested_sale_price_ex_vat numeric,my_net_price_ex_vat numeric)
language plpgsql stable security definer set search_path='' as $$
begin
 perform pro_catalog_order_private.require_access();
 if coalesce(public.current_user_has_internal_store_price_search_access(),false) then
  return query select s.id,s.supplier_name,s.supplier_product_number,s.description,s.customer_price_ex_vat,null::numeric
   from public.search_internal_store_catalog_prices(p_query,p_limit) s;
 else
  return query select s.id,s.supplier_name,s.supplier_product_number,s.description,s.suggested_sale_price_ex_vat,s.my_net_price_ex_vat
   from public.search_pro_store_catalog(p_query,p_limit) s;
 end if;
end $$;
revoke all on function public.pro_catalog_order_search(text,integer) from public,anon,authenticated;
grant execute on function public.pro_catalog_order_search(text,integer) to authenticated;
-- Explicitly preserve the private helper and exposed API ACLs after replacement.
revoke all on function pro_catalog_order_private.require_access(uuid) from public,anon,authenticated;
revoke all on function public.pro_catalog_order_context(),public.pro_catalog_order_prepare(uuid,uuid,jsonb) from public,anon;
grant execute on function public.pro_catalog_order_context(),public.pro_catalog_order_prepare(uuid,uuid,jsonb) to authenticated;

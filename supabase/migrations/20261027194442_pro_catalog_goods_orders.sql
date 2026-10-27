-- Additive, price-free pro-customer orders. Existing catalog/access/mail flows stay unchanged.
create schema pro_catalog_order_private;
revoke all on schema pro_catalog_order_private from public,anon,authenticated;
create table pro_catalog_order_private.contacts (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
 name text not null check(length(name) between 1 and 120), email text not null check(length(email) between 3 and 254),
 unique(company_id,email)
);
create table pro_catalog_order_private.orders (
 id uuid primary key, company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, input jsonb not null, snapshot jsonb not null,
 created_at timestamptz not null default now(), begun_at timestamptz, provider_id text
);
create index pro_catalog_orders_scope on pro_catalog_order_private.orders(company_id,user_id,created_at desc);
alter table pro_catalog_order_private.contacts enable row level security;
alter table pro_catalog_order_private.orders enable row level security;
revoke all on all tables in schema pro_catalog_order_private from public,anon,authenticated;

create function pro_catalog_order_private.require_access(p_company_id uuid default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare c uuid:=public.current_active_company_scope_id();
begin
 if auth.uid() is null or c is null or (p_company_id is not null and c<>p_company_id)
 or not coalesce(public.current_user_has_pro_store_catalog_access(),false)
 or not exists(select 1 from public.profiles p join public.sales_company_memberships m on m.user_id=p.id where p.id=auth.uid() and m.company_id=c and p.approved and not coalesce(p.deactivated,false))
 then raise exception 'Du har ikke tilgang til varebestilling i dette firmaet.' using errcode='42501'; end if;
 return c;
end $$;

create function public.pro_catalog_order_context() returns jsonb language plpgsql security definer set search_path='' as $$
declare c uuid:=pro_catalog_order_private.require_access(); reply text;
begin
 select lower(trim(u.email)) into reply from auth.users u where u.id=auth.uid();
 if coalesce(reply,'')='' then raise exception 'Kontoen mangler e-postadresse.' using errcode='22023'; end if;
 return jsonb_build_object('company_id',c,'user_id',auth.uid(),'company',public.work_profile_company_profile(c),'replyTo',reply,
 'contacts',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'name',t.name,'email',t.email) order by t.name,t.email) from pro_catalog_order_private.contacts t where t.company_id=c),'[]'::jsonb));
end $$;

create function public.pro_catalog_order_contact(p_company_id uuid,p_action text,p_contact jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare c uuid:=pro_catalog_order_private.require_access(p_company_id); n text:=trim(p_contact->>'name'); e text:=lower(trim(p_contact->>'email'));
begin
 if p_action='delete' then delete from pro_catalog_order_private.contacts where company_id=c and id=(p_contact->>'id')::uuid;
 elsif p_action='save' then
  if coalesce(length(n),0) not between 1 and 120 or coalesce(length(e),0) not between 3 and 254 or e !~ '^[^[:space:]@,;<>]+@[^[:space:]@,;<>]+\.[^[:space:]@,;<>]+$' then raise exception 'Fyll ut navn og gyldig mottakeradresse.' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(c::text,0));
  if (select count(*) from pro_catalog_order_private.contacts where company_id=c)>=100 and not exists(select 1 from pro_catalog_order_private.contacts where company_id=c and email=e) then raise exception 'Maksimalt 100 lagrede mottakere per firma.' using errcode='22023'; end if;
  insert into pro_catalog_order_private.contacts(company_id,name,email) values(c,n,e) on conflict(company_id,email) do update set name=excluded.name;
 else raise exception 'Ukjent handling.' using errcode='22023'; end if;
 return public.pro_catalog_order_context();
end $$;

create function public.pro_catalog_order_prepare(p_company_id uuid,p_request_id uuid,p_order jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
   if not exists(select 1 from public.internal_store_catalog_items i join public.store_catalog_company_supplier_access a on a.company_id=c and a.supplier_key=i.supplier_key and a.is_active where i.id=(line->>'id')::uuid and i.is_active and i.supplier_product_number=line->>'sku' and i.supplier_name=line->>'supplier' and i.description=line->>'name') then raise exception 'Vareutvalget eller tilgangen er endret. Bestillingen må kontrolleres på nytt.' using errcode='42501'; end if;
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
  select i.id,i.supplier_name,i.supplier_product_number,i.description into item from public.internal_store_catalog_items i join public.store_catalog_company_supplier_access a on a.company_id=c and a.supplier_key=i.supplier_key and a.is_active where i.id=(line->>'id')::uuid and i.is_active;
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

create function public.pro_catalog_order_begin(p_company_id uuid,p_request_id uuid,p_order jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r jsonb;
begin
 r:=public.pro_catalog_order_prepare(p_company_id,p_request_id,p_order);
 update pro_catalog_order_private.orders set begun_at=coalesce(begun_at,now()) where id=p_request_id and user_id=auth.uid() and company_id=p_company_id;
 return r;
end $$;
create function public.pro_catalog_order_complete(p_request_id uuid,p_provider_id text) returns void language plpgsql security definer set search_path='' as $$
begin
 -- EXECUTE is granted only to service_role; no public/authenticated completion.
 if coalesce(length(p_provider_id),0) not between 1 and 150 then raise exception 'Ugyldig kvittering.' using errcode='22023'; end if;
 update pro_catalog_order_private.orders set provider_id=coalesce(provider_id,p_provider_id) where id=p_request_id and begun_at is not null;
 if not found then raise exception 'Bestillingen er ikke sendt.' using errcode='22023'; end if;
end $$;
revoke all on all functions in schema pro_catalog_order_private from public,anon,authenticated;
revoke all on function public.pro_catalog_order_context(),public.pro_catalog_order_contact(uuid,text,jsonb),public.pro_catalog_order_prepare(uuid,uuid,jsonb),public.pro_catalog_order_begin(uuid,uuid,jsonb),public.pro_catalog_order_complete(uuid,text) from public,anon,authenticated;
grant execute on function public.pro_catalog_order_context(),public.pro_catalog_order_contact(uuid,text,jsonb),public.pro_catalog_order_prepare(uuid,uuid,jsonb),public.pro_catalog_order_begin(uuid,uuid,jsonb) to authenticated;
grant execute on function public.pro_catalog_order_complete(uuid,text) to service_role;

-- Company address book and short-lived, immutable email retry receipts.
-- No prices are accepted or persisted. Existing catalog/access functions are unchanged.
create schema if not exists supplier_order_private;
revoke all on schema supplier_order_private from public, anon, authenticated;
create table supplier_order_private.contacts (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
 name text not null check (length(name) between 1 and 120),
 email text not null check (length(email) <= 254),
 unique(company_id,email)
);
create table supplier_order_private.deliveries (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
 input jsonb not null,
 snapshot jsonb not null,
 provider_id text,
 created_at timestamptz not null default now()
);
create index supplier_order_delivery_cleanup_idx on supplier_order_private.deliveries(created_at);
create index supplier_order_delivery_actor_idx on supplier_order_private.deliveries(user_id,created_at);
alter table supplier_order_private.contacts enable row level security;
alter table supplier_order_private.deliveries enable row level security;
revoke all on all tables in schema supplier_order_private from public,anon,authenticated;

create function supplier_order_private.check_actor(p_company_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or p_company_id is null
 or p_company_id is distinct from public.current_active_company_scope_id()
 or not coalesce(public.current_user_has_internal_store_price_search_access(),false)
 or not (coalesce(public.current_profile_is_systemadmin(),false) or exists(
   select 1 from public.sales_company_memberships where user_id=auth.uid() and company_id=p_company_id
 )) then raise exception 'Du har ikke tilgang til bestillinger for dette firmaet.' using errcode='42501'; end if;
end; $$;
revoke all on function supplier_order_private.check_actor(uuid) from public,anon,authenticated;

create function public.supplier_order_context(p_company_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 perform supplier_order_private.check_actor(p_company_id);
 return jsonb_build_object('company',public.work_profile_company_profile(p_company_id),
 'replyTo',(select email from auth.users where id=auth.uid()),
 'contacts',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'email',email) order by name,email)
 from supplier_order_private.contacts where company_id=p_company_id),'[]'::jsonb));
end; $$;

create function public.supplier_order_contact_delete(p_company_id uuid,p_id uuid) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 perform supplier_order_private.check_actor(p_company_id);
 delete from supplier_order_private.contacts where id=p_id and company_id=p_company_id;
 return found;
end; $$;

create function public.supplier_order_prepare(p_company_id uuid,p_request_id uuid,p_order jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 v_row supplier_order_private.deliveries%rowtype;
 v_item jsonb; v_items jsonb:='[]'; v_seen uuid[]:='{}'; v_id uuid;
 v_product record; v_snapshot jsonb; v_email text; v_name text;
begin
 perform supplier_order_private.check_actor(p_company_id);
 if p_request_id is null or jsonb_typeof(p_order) is distinct from 'object'
 or p_order - array['to','supplierName','reference','deliveryAddress','message','items','remember'] <> '{}'::jsonb
 then raise exception 'Ugyldig bestilling.' using errcode='22023'; end if;
 -- Serialize requests for the actor, including the hourly limit and replay check.
 perform 1 from public.profiles where id=auth.uid() for update;
 select * into v_row from supplier_order_private.deliveries where id=p_request_id;
 if found then
   if v_row.user_id<>auth.uid() or v_row.company_id<>p_company_id or v_row.input<>p_order
     then raise exception 'Bestillingsnøkkelen er allerede brukt.' using errcode='22023'; end if;
   if v_row.created_at < now()-interval '23 hours'
     then raise exception 'Bestillingsforsøket er utløpt. Kontroller mottatt e-post før du lager en ny bestilling.' using errcode='22023'; end if;
   return jsonb_build_object('id',v_row.id,'snapshot',v_row.snapshot,'sent',v_row.provider_id is not null);
 end if;
 if (select count(*) from supplier_order_private.deliveries where user_id=auth.uid() and created_at>now()-interval '1 hour')>=30
 then raise exception 'For mange bestillinger. Vent litt og prøv igjen.' using errcode='54000'; end if;
 foreach v_name in array array['to','supplierName','reference','deliveryAddress','message'] loop
   if jsonb_typeof(p_order->v_name) is distinct from 'string'
     then raise exception 'Ugyldig tekstfelt.' using errcode='22023'; end if;
 end loop;
 v_email:=lower(btrim(p_order->>'to')); v_name:=btrim(p_order->>'supplierName');
 if length(v_email)>254 or v_email !~ '^[^[:space:]@,;<>]+@[^[:space:]@,;<>]+[.][^[:space:]@,;<>]+$'
 or length(v_name) not between 1 and 120 or v_name ~ '[[:cntrl:]]'
 or length(p_order->>'reference')>120 or (p_order->>'reference') ~ '[[:cntrl:]]'
 or length(p_order->>'deliveryAddress')>500 or length(p_order->>'message')>2000
 or jsonb_typeof(p_order->'remember') is distinct from 'boolean'
 or jsonb_typeof(p_order->'items') is distinct from 'array'
 then raise exception 'Kontroller mottaker, navn og bestillingsfelt.' using errcode='22023'; end if;
 if jsonb_array_length(p_order->'items') not between 1 and 30
 then raise exception 'Velg mellom 1 og 30 varer.' using errcode='22023'; end if;
 if exists(select 1 from public.internal_store_catalog_imports where status in ('loading','ready'))
 then raise exception 'Vareregisteret oppdateres. Prøv igjen om litt.' using errcode='55000'; end if;
 for v_item in select value from jsonb_array_elements(p_order->'items') loop
   if jsonb_typeof(v_item) is distinct from 'object' or v_item-array['id','quantity']<>'{}'::jsonb
   or coalesce(v_item->>'id','') !~* '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
   or coalesce(v_item->>'quantity','') !~ '^[0-9]+([.][0-9]{1,3})?$'
   then raise exception 'Ugyldig vare eller antall.' using errcode='22023'; end if;
   v_id:=(v_item->>'id')::uuid;
   if v_id=any(v_seen) or (v_item->>'quantity')::numeric not between 0.001 and 99999
   then raise exception 'Ugyldig vare eller antall.' using errcode='22023'; end if;
   select i.id,i.description,i.supplier_name,i.supplier_product_number,i.gtin into v_product
   from public.internal_store_catalog_items i join public.internal_store_catalog_imports imp
   on imp.id=i.last_import_id and imp.status='active' where i.id=v_id and i.is_active;
   if not found then raise exception 'En vare er ikke lenger aktiv. Oppdater plukklisten.' using errcode='22023'; end if;
   v_seen:=array_append(v_seen,v_id);
   v_items:=v_items || jsonb_build_array(jsonb_build_object('id',v_product.id,'description',v_product.description,
     'supplier',v_product.supplier_name,'number',v_product.supplier_product_number,'gtin',v_product.gtin,
     'quantity',v_item->>'quantity'));
 end loop;
 v_snapshot:=jsonb_build_object('to',v_email,'supplierName',v_name,'reference',btrim(p_order->>'reference'),
 'deliveryAddress',btrim(p_order->>'deliveryAddress'),'message',btrim(p_order->>'message'),'items',v_items,
 'company',public.work_profile_company_profile(p_company_id),'replyTo',(select email from auth.users where id=auth.uid()),
 'remember',(p_order->>'remember')::boolean);
 if nullif(v_snapshot->'company'->>'companyName','') is null or nullif(v_snapshot->>'replyTo','') is null
 then raise exception 'Avsender mangler. Kontroller firmaprofilen.' using errcode='22023'; end if;
 insert into supplier_order_private.deliveries(id,user_id,company_id,input,snapshot)
 values(p_request_id,auth.uid(),p_company_id,p_order,v_snapshot);
 return jsonb_build_object('id',p_request_id,'snapshot',v_snapshot,'sent',false);
end; $$;

-- Only the authenticated worker may acknowledge the provider response and save contacts.
create function public.supplier_order_complete(p_id uuid,p_provider_id text) returns void
language plpgsql security definer set search_path='' as $$
declare v_row supplier_order_private.deliveries%rowtype;
begin
 if p_provider_id is null or length(p_provider_id) not between 1 and 150 then raise exception 'Ugyldig kvittering.'; end if;
 select * into v_row from supplier_order_private.deliveries where id=p_id for update;
 if not found then raise exception 'Bestillingen finnes ikke.'; end if;
 if v_row.provider_id is not null then return; end if;
 if (v_row.snapshot->>'remember')::boolean then
   insert into supplier_order_private.contacts(company_id,name,email)
   values(v_row.company_id,v_row.snapshot->>'supplierName',v_row.snapshot->>'to')
   on conflict(company_id,email) do update set name=excluded.name;
 end if;
 update supplier_order_private.deliveries set provider_id=p_provider_id where id=p_id;
end; $$;
revoke all on function public.supplier_order_context(uuid) from public,anon;
revoke all on function public.supplier_order_contact_delete(uuid,uuid) from public,anon;
revoke all on function public.supplier_order_prepare(uuid,uuid,jsonb) from public,anon;
revoke all on function public.supplier_order_complete(uuid,text) from public,anon,authenticated;
grant execute on function public.supplier_order_context(uuid) to authenticated;
grant execute on function public.supplier_order_contact_delete(uuid,uuid) to authenticated;
grant execute on function public.supplier_order_prepare(uuid,uuid,jsonb) to authenticated;
grant execute on function public.supplier_order_complete(uuid,text) to service_role;
-- Retry receipts are not order history. Only the saved address book is retained.
select cron.schedule('supplier-order-receipt-cleanup','20 3 * * *',
 $$delete from supplier_order_private.deliveries where created_at < now()-interval '2 days'$$);

-- Customer profiles are opt-in and scoped exclusively by authenticated work profile.
create table public.company_customer_profiles (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.sales_company_scopes(id) on delete cascade,
 customer jsonb not null,
 revision bigint not null default 1,
 created_by uuid not null references public.profiles(id),
 updated_at timestamptz not null default now()
);
create index company_customer_profiles_scope_idx on public.company_customer_profiles(company_id);
alter table public.company_customer_profiles enable row level security;
revoke all on public.company_customer_profiles from public,anon,authenticated;
create function public.company_customer_scope()
returns uuid language plpgsql stable security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_scope uuid:=public.current_active_company_scope_id();
begin
 if v_uid is null or v_scope is null or not exists(select 1 from public.profiles p where p.id=v_uid and p.approved and not coalesce(p.deactivated,false)) then
  raise exception 'Aktiv, godkjent firmatilknytning kreves.' using errcode='42501';
 end if;
 if not exists(select 1 from public.sales_company_memberships m where m.user_id=v_uid and m.company_id=v_scope) and not public.current_profile_is_systemadmin() then
  raise exception 'Du har ikke tilgang til dette firmaet.' using errcode='42501';
 end if;
 return v_scope;
end $$;
create function public.search_company_customers(p_query text default '')
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_scope uuid:=public.company_customer_scope(); v_query text:=lower(trim(coalesce(p_query,'')));
begin
 return jsonb_build_object('company_id',v_scope,'customers',coalesce((select jsonb_agg(to_jsonb(r)) from (
 select id,customer,revision from public.company_customer_profiles
 where company_id=v_scope and (v_query='' or strpos(lower(customer->>'customer'),v_query)>0 or strpos(lower(customer->>'email'),v_query)>0)
 order by lower(customer->>'customer'),id limit 30
 ) r),'[]'::jsonb));
end $$;
create function public.save_company_customer(p_customer jsonb,p_id uuid default null,p_expected_revision bigint default null,p_expected_company_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_scope uuid:=public.company_customer_scope(); v_data jsonb; v_row public.company_customer_profiles%rowtype;
begin
 if p_expected_company_id is distinct from v_scope then raise exception 'Arbeidsfirmaet er endret. Åpne kunderegisteret på nytt.' using errcode='42501'; end if;
 v_data:=jsonb_build_object('customer',trim(coalesce(p_customer->>'customer','')),'email',trim(coalesce(p_customer->>'email','')),'phone',trim(coalesce(p_customer->>'phone','')),'address',trim(coalesce(p_customer->>'address','')),'postnr',trim(coalesce(p_customer->>'postnr','')),'city',trim(coalesce(p_customer->>'city','')));
 if v_data->>'customer'='' then raise exception 'Kundenavn må fylles ut.'; end if;
 if octet_length(v_data::text)>6000 then raise exception 'Kundeinformasjonen er for lang.'; end if;
 if p_id is null then
  insert into public.company_customer_profiles(company_id,customer,created_by) values(v_scope,v_data,auth.uid()) returning * into v_row;
 else
  update public.company_customer_profiles set customer=v_data,revision=revision+1,updated_at=now()
  where id=p_id and company_id=v_scope and revision=p_expected_revision returning * into v_row;
  if not found then raise exception 'Kunden er endret eller ikke tilgjengelig. Søk kunden på nytt.' using errcode='40001'; end if;
 end if;
 return jsonb_build_object('id',v_row.id,'customer',v_row.customer,'revision',v_row.revision);
end $$;
revoke all on function public.company_customer_scope() from public,anon,authenticated;
revoke all on function public.search_company_customers(text) from public,anon;
revoke all on function public.save_company_customer(jsonb,uuid,bigint,uuid) from public,anon;
grant execute on function public.search_company_customers(text) to authenticated;
grant execute on function public.save_company_customer(jsonb,uuid,bigint,uuid) to authenticated;

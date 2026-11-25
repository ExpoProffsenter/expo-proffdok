-- Expo ProffDok – FASE 38A1
-- Generell modultilgang på brukernivå.
-- Systemadministrator kan tildele alle moduler.
-- Firmaadministrator kan delegere egne moduler til brukere i eget firma.
-- Butikktilbud er en tilleggstilgang til Befaring/Tilbud.
-- Eksisterende godkjente brukere beholder dagens tilgang ved migrering.

create table if not exists public.user_module_access (
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_key text not null,
  granted_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, module_key),
  constraint user_module_access_module_key_check
    check (module_key in ('projects','sales','store_offers'))
);

alter table public.user_module_access enable row level security;

revoke insert, update, delete on public.user_module_access from anon, authenticated;
grant select on public.user_module_access to authenticated;

create or replace function public.module_access_valid_key(p_module_key text)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select coalesce(trim(p_module_key),'') in ('projects','sales','store_offers');
$$;

create or replace function public.current_user_has_module_access(p_module_key text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.module_access_valid_key(p_module_key)
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.approved,false) = true
        and coalesce(p.deactivated,false) = false
        and (
          p.system_role = 'systemadmin'
          or exists (
            select 1
            from public.user_module_access uma
            where uma.user_id = p.id
              and uma.module_key = trim(p_module_key)
          )
        )
    );
$$;

create or replace function public.current_user_module_keys()
returns text[]
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when public.current_profile_is_systemadmin()
      then array['projects','sales','store_offers']::text[]
    else coalesce(
      (
        select array_agg(uma.module_key order by uma.module_key)
        from public.user_module_access uma
        where uma.user_id = auth.uid()
      ),
      array[]::text[]
    )
  end;
$$;

-- Bevar eksisterende tilgang. Butikktilbud var før 38A avgrenset med Ringside-org.nr.
insert into public.user_module_access (user_id, module_key, granted_by)
select p.id, module_key, null
from public.profiles p
cross join lateral (
  values ('projects'::text), ('sales'::text)
) modules(module_key)
where coalesce(p.approved,false) = true
on conflict (user_id, module_key) do nothing;

insert into public.user_module_access (user_id, module_key, granted_by)
select p.id, 'store_offers', null
from public.profiles p
where coalesce(p.approved,false) = true
  and regexp_replace(coalesce(p.org_number,''), '\D', '', 'g') = '915407692'
on conflict (user_id, module_key) do nothing;

create policy user_module_access_select_managed
on public.user_module_access
for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_profile_is_systemadmin()
  or (
    public.current_profile_is_firmaadmin()
    and exists (
      select 1
      from public.profiles target
      join public.profiles actor on actor.id = auth.uid()
      where target.id = user_module_access.user_id
        and public.sales_normalize_company_name(target.company_name)
            = public.sales_normalize_company_name(actor.company_name)
    )
  )
);

create or replace function public.get_my_module_access()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'module_keys', to_jsonb(public.current_user_module_keys()),
    'is_systemadmin', public.current_profile_is_systemadmin(),
    'is_firmaadmin', public.current_profile_is_firmaadmin()
  );
$$;

create or replace function public.list_managed_module_access()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_is_systemadmin boolean := false;
  v_is_firmaadmin boolean := false;
  v_company_name text := '';
  v_users jsonb := '[]'::jsonb;
begin
  if v_uid is null then
    raise exception 'Du må være innlogget.' using errcode='42501';
  end if;

  v_is_systemadmin := public.current_profile_is_systemadmin();
  v_is_firmaadmin := public.current_profile_is_firmaadmin();

  if not v_is_systemadmin and not v_is_firmaadmin then
    raise exception 'Du har ikke tilgang til brukeradministrasjon.' using errcode='42501';
  end if;

  select coalesce(p.company_name,'') into v_company_name
  from public.profiles p
  where p.id = v_uid;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'user_id', p.id,
      'email', p.email,
      'company_name', p.company_name,
      'company_role', p.company_role,
      'system_role', p.system_role,
      'approved', coalesce(p.approved,false),
      'deactivated', coalesce(p.deactivated,false),
      'module_keys', to_jsonb(coalesce(
        (
          select array_agg(uma.module_key order by uma.module_key)
          from public.user_module_access uma
          where uma.user_id = p.id
        ),
        array[]::text[]
      ))
    )
    order by coalesce(p.company_name,''), coalesce(p.email,'')
  ), '[]'::jsonb)
  into v_users
  from public.profiles p
  where
    v_is_systemadmin
    or public.sales_normalize_company_name(p.company_name)
       = public.sales_normalize_company_name(v_company_name);

  return jsonb_build_object(
    'caller_module_keys', to_jsonb(public.current_user_module_keys()),
    'is_systemadmin', v_is_systemadmin,
    'is_firmaadmin', v_is_firmaadmin,
    'company_name', v_company_name,
    'users', v_users
  );
end;
$$;

create or replace function public.set_managed_module_access(
  target_user_id uuid,
  requested_module_keys text[] default array[]::text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_is_systemadmin boolean := false;
  v_is_firmaadmin boolean := false;
  v_actor_company text := '';
  v_target public.profiles%rowtype;
  v_requested text[] := array[]::text[];
  v_actor_keys text[] := array[]::text[];
  v_invalid text;
begin
  if v_uid is null then
    raise exception 'Du må være innlogget.' using errcode='42501';
  end if;

  v_is_systemadmin := public.current_profile_is_systemadmin();
  v_is_firmaadmin := public.current_profile_is_firmaadmin();
  if not v_is_systemadmin and not v_is_firmaadmin then
    raise exception 'Du har ikke tilgang til brukeradministrasjon.' using errcode='42501';
  end if;

  select * into v_target from public.profiles where id = target_user_id;
  if v_target.id is null then
    raise exception 'Brukeren finnes ikke.' using errcode='P0002';
  end if;

  select coalesce(p.company_name,'') into v_actor_company
  from public.profiles p where p.id = v_uid;

  if not v_is_systemadmin then
    if target_user_id = v_uid then
      raise exception 'Firmaadministrator kan ikke endre sin egen modultilgang.' using errcode='42501';
    end if;
    if v_target.system_role = 'systemadmin' then
      raise exception 'Systemadministrator kan ikke endres fra firma.' using errcode='42501';
    end if;
    if public.sales_normalize_company_name(v_target.company_name)
       <> public.sales_normalize_company_name(v_actor_company) then
      raise exception 'Brukeren tilhører ikke ditt firma.' using errcode='42501';
    end if;
  end if;

  select coalesce(array_agg(distinct trim(k) order by trim(k)), array[]::text[])
  into v_requested
  from unnest(coalesce(requested_module_keys, array[]::text[])) k
  where nullif(trim(k),'') is not null;

  select k into v_invalid
  from unnest(v_requested) k
  where not public.module_access_valid_key(k)
  limit 1;
  if v_invalid is not null then
    raise exception 'Ugyldig modultilgang: %', v_invalid using errcode='22023';
  end if;

  -- Butikktilbud er en tilleggstilgang til Befaring/Tilbud.
  if 'store_offers' = any(v_requested) and not ('sales' = any(v_requested)) then
    v_requested := array_append(v_requested, 'sales');
  end if;

  if not v_is_systemadmin then
    v_actor_keys := public.current_user_module_keys();
    if exists (
      select 1 from unnest(v_requested) k
      where not (k = any(v_actor_keys))
    ) then
      raise exception 'Du kan bare gi tilgang til moduler du selv har.' using errcode='42501';
    end if;
  end if;

  delete from public.user_module_access
  where user_id = target_user_id;

  insert into public.user_module_access (user_id, module_key, granted_by)
  select target_user_id, k, v_uid
  from unnest(v_requested) k;

  return jsonb_build_object(
    'user_id', target_user_id,
    'module_keys', to_jsonb(v_requested)
  );
end;
$$;

revoke all on function public.get_my_module_access() from public;
revoke all on function public.list_managed_module_access() from public;
revoke all on function public.set_managed_module_access(uuid,text[]) from public;
grant execute on function public.get_my_module_access() to authenticated;
grant execute on function public.list_managed_module_access() to authenticated;
grant execute on function public.set_managed_module_access(uuid,text[]) to authenticated;
grant execute on function public.current_user_has_module_access(text) to authenticated;

-- Prosjekter: samme firmascope som før, men modulrettighet er nå et ekstra krav.
create or replace function public.project_row_access_allowed(
  p_company_scope_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    left join public.sales_company_scopes s
      on s.normalized_name = public.sales_normalize_company_name(p.company_name)
    where p.id = auth.uid()
      and coalesce(p.approved,false) = true
      and coalesce(p.deactivated,false) = false
      and (
        p.system_role = 'systemadmin'
        or (
          public.current_user_has_module_access('projects')
          and s.id = p_company_scope_id
          and (p_user_id = auth.uid() or p.company_role = 'firmaadmin')
        )
      )
  );
$$;

create or replace function public.project_row_insert_allowed(
  p_company_scope_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    join public.sales_company_scopes s
      on s.normalized_name = public.sales_normalize_company_name(p.company_name)
    where p.id = auth.uid()
      and coalesce(p.approved,false) = true
      and coalesce(p.deactivated,false) = false
      and public.current_user_has_module_access('projects')
      and p_user_id = auth.uid()
      and s.id = p_company_scope_id
  );
$$;

-- Sales: medlemskap gir bare firmascope når brukeren faktisk har Befaring/Tilbud.
create or replace function public.current_sales_company_scope_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select m.company_id
  from public.sales_company_memberships m
  where m.user_id = auth.uid()
    and public.current_user_has_module_access('sales')
  order by m.created_at
  limit 1;
$$;

create or replace function public.sales_payload_is_store_offer(p_payload jsonb)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select
    (
      coalesce(p_payload->>'source','') = 'Butikktilbud / varesalg'
      and lower(coalesce(p_payload->>'directOffer','false')) = 'true'
    )
    or exists (
      select 1
      from jsonb_array_elements(
        case when jsonb_typeof(p_payload->'offerLines') = 'array'
          then p_payload->'offerLines' else '[]'::jsonb end
      ) line
      where lower(coalesce(line->>'__storeOfferMeta','false')) = 'true'
         or coalesce(line->>'id','') = '__expo_store_offer_meta__'
    );
$$;

create or replace function public.sales_template_is_store_offer(p_payload jsonb)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select coalesce(p_payload->>'templateKind','') = 'store-offer-text-v1';
$$;

create or replace function public.sales_publish_is_store_offer(p_payload jsonb)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from jsonb_array_elements(
      case when jsonb_typeof(p_payload->'lines') = 'array'
        then p_payload->'lines' else '[]'::jsonb end
    ) line
    where lower(coalesce(line->>'__storeOfferMeta','false')) = 'true'
       or coalesce(line->>'id','') = '__expo_store_offer_meta__'
  );
$$;

-- Store-rader og store-maler krever eksplisitt Butikktilbud-tilgang.
drop policy if exists sales_requests_select_company on public.sales_requests;
drop policy if exists sales_requests_insert_company on public.sales_requests;
drop policy if exists sales_requests_update_company on public.sales_requests;

create policy sales_requests_select_company
on public.sales_requests
for select
to authenticated
using (
  public.current_profile_is_systemadmin()
  or (
    company_id = public.current_sales_company_scope_id()
    and (
      not public.sales_payload_is_store_offer(payload)
      or public.current_user_has_module_access('store_offers')
    )
  )
);

create policy sales_requests_insert_company
on public.sales_requests
for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    public.current_profile_is_systemadmin()
    or company_id = public.current_sales_company_scope_id()
  )
  and (
    not public.sales_payload_is_store_offer(payload)
    or public.current_user_has_module_access('store_offers')
  )
);

create policy sales_requests_update_company
on public.sales_requests
for update
to authenticated
using (
  public.current_profile_is_systemadmin()
  or (
    company_id = public.current_sales_company_scope_id()
    and (
      not public.sales_payload_is_store_offer(payload)
      or public.current_user_has_module_access('store_offers')
    )
  )
)
with check (
  public.current_profile_is_systemadmin()
  or (
    company_id = public.current_sales_company_scope_id()
    and (
      not public.sales_payload_is_store_offer(payload)
      or public.current_user_has_module_access('store_offers')
    )
  )
);

drop policy if exists sales_offer_templates_select_company on public.sales_offer_templates;
drop policy if exists sales_offer_templates_insert_company on public.sales_offer_templates;
drop policy if exists sales_offer_templates_update_company on public.sales_offer_templates;
drop policy if exists sales_offer_templates_delete_company on public.sales_offer_templates;

create policy sales_offer_templates_select_company
on public.sales_offer_templates
for select
to authenticated
using (
  public.current_profile_is_systemadmin()
  or (
    company_id = public.current_sales_company_scope_id()
    and (
      not public.sales_template_is_store_offer(payload)
      or public.current_user_has_module_access('store_offers')
    )
  )
);

create policy sales_offer_templates_insert_company
on public.sales_offer_templates
for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    public.current_profile_is_systemadmin()
    or company_id = public.current_sales_company_scope_id()
  )
  and (
    not public.sales_template_is_store_offer(payload)
    or public.current_user_has_module_access('store_offers')
  )
);

create policy sales_offer_templates_update_company
on public.sales_offer_templates
for update
to authenticated
using (
  public.current_profile_is_systemadmin()
  or (
    company_id = public.current_sales_company_scope_id()
    and (
      not public.sales_template_is_store_offer(payload)
      or public.current_user_has_module_access('store_offers')
    )
  )
)
with check (
  public.current_profile_is_systemadmin()
  or (
    company_id = public.current_sales_company_scope_id()
    and (
      not public.sales_template_is_store_offer(payload)
      or public.current_user_has_module_access('store_offers')
    )
  )
);

create policy sales_offer_templates_delete_company
on public.sales_offer_templates
for delete
to authenticated
using (
  public.current_profile_is_systemadmin()
  or (
    company_id = public.current_sales_company_scope_id()
    and (
      not public.sales_template_is_store_offer(payload)
      or public.current_user_has_module_access('store_offers')
    )
  )
);

-- Publisering av Butikktilbud må kontrolleres server-side i tillegg til UI.
create or replace function public.publish_sales_offer(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_company_id uuid;
  v_requested_company_id uuid;
  v_offer_id uuid;
  v_version_id uuid;
  v_token uuid;
  v_next_version integer;
  v_existing_company_id uuid;
  v_existing_found boolean := false;
  v_published_by_name text;
  v_published_at timestamptz;
begin
  if v_uid is null then
    raise exception 'Du må være innlogget for å publisere tilbud.' using errcode='42501';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id=v_uid
      and coalesce(p.approved,false)=true
      and coalesce(p.deactivated,false)=false
  ) then
    raise exception 'Brukeren har ikke aktiv tilgang.' using errcode='42501';
  end if;

  if not public.current_user_has_module_access('sales') then
    raise exception 'Du har ikke tilgang til Befaring/Tilbud.' using errcode='42501';
  end if;
  if public.sales_publish_is_store_offer(payload)
     and not public.current_user_has_module_access('store_offers') then
    raise exception 'Du har ikke tilgang til Butikktilbud.' using errcode='42501';
  end if;

  select coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(u.raw_user_meta_data->>'name'), ''),
    nullif(trim(u.email), '')
  )
  into v_published_by_name
  from auth.users u
  where u.id=v_uid;

  if nullif(trim(coalesce(payload->>'support_company_id','')), '') is not null then
    begin
      v_requested_company_id := (payload->>'support_company_id')::uuid;
    exception when invalid_text_representation then
      raise exception 'Ugyldig firma for supportpublisering.' using errcode='22023';
    end;

    if not public.current_profile_is_systemadmin() then
      raise exception 'Kun systemadministrator kan publisere i supportmodus.' using errcode='42501';
    end if;
    if not exists (select 1 from public.sales_company_scopes s where s.id=v_requested_company_id) then
      raise exception 'Firmaet finnes ikke.' using errcode='22023';
    end if;
    v_company_id := v_requested_company_id;
  else
    v_company_id := public.current_sales_company_scope_id();
  end if;

  if v_company_id is null then
    raise exception 'Firmatilknytning mangler.' using errcode='42501';
  end if;

  if nullif(trim(coalesce(payload->>'offer_id','')), '') is not null then
    v_offer_id := (payload->>'offer_id')::uuid;
  else
    v_offer_id := gen_random_uuid();
  end if;

  select so.company_id, so.public_token
    into v_existing_company_id, v_token
  from public.sales_offers so
  where so.id=v_offer_id
  for update;
  v_existing_found := found;

  if v_existing_found then
    if v_existing_company_id is null then
      raise exception 'Eksisterende tilbud mangler sikker firmatilhørighet og kan ikke republiseres.' using errcode='42501';
    end if;
    if v_existing_company_id <> v_company_id then
      raise exception 'Du har ikke tilgang til å publisere ny versjon av dette tilbudet.' using errcode='42501';
    end if;

    update public.sales_offers
    set title = payload->>'title',
        customer_name = payload->>'customer_name',
        customer_email = payload->>'customer_email',
        customer_phone = payload->>'customer_phone',
        customer_address = payload->>'customer_address',
        status = 'sent',
        updated_at = now()
    where id=v_offer_id;
  else
    v_token := gen_random_uuid();
    insert into public.sales_offers (
      id, company_id, request_ref, customer_name, customer_email, customer_phone,
      customer_address, title, status, public_token
    ) values (
      v_offer_id, v_company_id, payload->>'request_ref', payload->>'customer_name',
      payload->>'customer_email', payload->>'customer_phone', payload->>'customer_address',
      payload->>'title', 'sent', v_token
    );
  end if;

  select coalesce(max(sov.version_number),0)+1
    into v_next_version
  from public.sales_offer_versions sov
  where sov.offer_id=v_offer_id;

  insert into public.sales_offer_versions (
    offer_id, version_number, title, intro, lines, options,
    reservations, validity_days, total_ex_vat, published_by, published_by_name
  ) values (
    v_offer_id, v_next_version, payload->>'title', payload->>'intro',
    coalesce(payload->'lines','[]'::jsonb), coalesce(payload->'options','[]'::jsonb),
    payload->>'reservations', coalesce((payload->>'validity_days')::integer,30),
    coalesce((payload->>'total_ex_vat')::numeric,0), v_uid, v_published_by_name
  ) returning id, created_at into v_version_id, v_published_at;

  update public.sales_offers
  set active_version_id=v_version_id, updated_at=now()
  where id=v_offer_id;

  return jsonb_build_object(
    'offer_id',v_offer_id,
    'version_id',v_version_id,
    'version_number',v_next_version,
    'public_token',v_token,
    'published_by',v_uid,
    'published_by_name',v_published_by_name,
    'published_at',v_published_at
  );
end;
$$;

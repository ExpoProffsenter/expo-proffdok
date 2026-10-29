-- Explicit case-handler identity. Names, publishers and signature snapshots are not identities.
-- No historical assignment/backfill and no email is performed by this migration.
create schema if not exists sales_handler_private;
revoke all on schema sales_handler_private from public, anon, authenticated;

create table sales_handler_private.request_handlers (
 request_id uuid primary key references public.sales_requests(id) on delete cascade deferrable initially deferred,
 company_id uuid not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 display_name text not null,
 revision bigint not null check (revision>0),
 assigned_by uuid not null,
 assigned_at timestamptz not null default now()
);
alter table sales_handler_private.request_handlers enable row level security;
revoke all on table sales_handler_private.request_handlers from public, anon, authenticated;

-- Metadata supplies only a presentation label. UUID membership/access and Auth email
-- are checked independently and never inferred from a display name or profile email.
create function sales_handler_private.identity(c uuid,u uuid,store_offer boolean)
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('userId',p.id,'displayName',left(coalesce(
  nullif(trim(a.raw_user_meta_data->>'full_name'),''),
  nullif(trim(a.raw_user_meta_data->>'fullName'),''),
  nullif(trim(a.raw_user_meta_data->>'display_name'),''),
  nullif(trim(a.raw_user_meta_data->>'name'),''),trim(a.email)),160),
  'email',lower(trim(a.email)))
 from public.profiles p
 join auth.users a on a.id=p.id
 join public.sales_company_memberships m on m.user_id=p.id and m.company_id=c
 where p.id=u and p.approved and not coalesce(p.deactivated,false)
 and p.role in ('admin','member','ansatt','firmaadmin')
 and m.workspace_role in ('ansatt','firmaadmin')
 and (p.system_role='systemadmin' or exists(select 1 from public.user_module_access x where x.user_id=p.id and x.module_key='sales'))
 and a.email_confirmed_at is not null and a.deleted_at is null
 and (a.banned_until is null or a.banned_until<=now())
 and length(trim(a.email))<=254
 and trim(a.email) ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 and (not store_offer or (public.company_has_store_offers_access(c)
  and (public.is_internal_work_profile_company(c) or public.company_has_pro_store_catalog_access(c))))
$$;

create function sales_handler_private.require_actor(c uuid,store_offer boolean)
returns void language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or c is null or public.current_active_company_scope_id() is distinct from c
 or not exists(select 1 from auth.users a where a.id=auth.uid() and a.deleted_at is null
  and (a.banned_until is null or a.banned_until<=now()))
 or not public.current_user_has_module_access('sales')
 or not exists(select 1 from public.profiles p where p.id=auth.uid() and p.approved
  and not coalesce(p.deactivated,false) and (p.system_role='systemadmin' or (
   p.role in ('admin','member','ansatt','firmaadmin') and exists(select 1 from public.sales_company_memberships m
    where m.company_id=c and m.user_id=p.id and m.workspace_role in ('ansatt','firmaadmin')))))
 or (store_offer and not public.current_user_has_module_access('store_offers'))
 then raise exception 'Saksbehandler kan bare velges i ditt aktive arbeidsfirma med gyldig tilgang.' using errcode='42501'; end if;
end $$;

create function public.sales_case_handler_candidates(p_company_id uuid,p_store_offer boolean default false)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if p_store_offer is null then raise exception 'Tilbudstype mangler.' using errcode='22023'; end if;
 perform sales_handler_private.require_actor(p_company_id,p_store_offer);
 select coalesce(jsonb_agg(i.identity order by i.identity->>'displayName',i.identity->>'email',i.identity->>'userId'),'[]'::jsonb)
 into result from (select sales_handler_private.identity(p_company_id,m.user_id,p_store_offer) identity
  from public.sales_company_memberships m where m.company_id=p_company_id) i where i.identity is not null;
 return result;
end $$;

-- Binding is private and separate from the JSON document: ordinary saves/autosaves,
-- old browser tabs and publisher/signature enrichment cannot replace a handler.
create function sales_handler_private.mirror_request()
returns trigger language plpgsql security definer set search_path='' as $$
declare binding sales_handler_private.request_handlers%rowtype; ident jsonb; chosen uuid;
begin
 if tg_op='UPDATE' and (new.id is distinct from old.id or new.company_id is distinct from old.company_id
  or new.request_ref is distinct from old.request_ref) and exists(select 1 from sales_handler_private.request_handlers h where h.request_id=old.id)
 then raise exception 'En bundet salgssak kan ikke flyttes til en annen identitet.' using errcode='42501'; end if;
 select * into binding from sales_handler_private.request_handlers h where h.request_id=new.id;
 if tg_op='INSERT' and binding.request_id is null
 and not exists(select 1 from public.sales_requests r where r.company_id=new.company_id and r.request_ref=new.request_ref)
 and coalesce(new.payload->>'responsibleUserId','')<>'' then
  -- New explicit UI selection only. Upsert's INSERT branch may target an existing
  -- company/reference, in which case its subsequent UPDATE must use the old binding.
  begin chosen:=(new.payload->>'responsibleUserId')::uuid;
  exception when invalid_text_representation then raise exception 'Velg en gyldig saksbehandler.' using errcode='22023'; end;
  perform sales_handler_private.require_actor(new.company_id,public.sales_payload_is_store_offer(new.payload));
  ident:=sales_handler_private.identity(new.company_id,chosen,public.sales_payload_is_store_offer(new.payload));
  if ident is null then raise exception 'Saksbehandleren har ikke lenger tilgang. Velg på nytt.' using errcode='42501'; end if;
  insert into sales_handler_private.request_handlers(request_id,company_id,user_id,display_name,revision,assigned_by)
   values(new.id,new.company_id,chosen,ident->>'displayName',1,auth.uid()) returning * into binding;
 end if;
 if binding.request_id is not null then
  new.payload:=coalesce(new.payload,'{}'::jsonb)||jsonb_build_object('responsibleUserId',binding.user_id,
   'responsibleRevision',binding.revision,'responsible',binding.display_name,'projectResponsible',binding.display_name);
 else
  -- Legacy names remain visible, but arbitrary payload IDs cannot acquire authority.
  new.payload:=(coalesce(new.payload,'{}'::jsonb)-'responsibleUserId')||jsonb_build_object('responsibleRevision',0);
 end if;
 return new;
end $$;
-- Alphabetical trigger order: mirror before sales_requests_refresh_list_payload,
-- so the existing summary projection receives the canonical display name too.
create trigger sales_requests_case_handler_identity before insert or update on public.sales_requests
 for each row execute function sales_handler_private.mirror_request();

create function public.sales_set_case_handler(p_company_id uuid,p_request_ref text,p_user_id uuid,p_expected_revision bigint default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.sales_requests%rowtype; binding sales_handler_private.request_handlers%rowtype; ident jsonb; next_revision bigint;
begin
 perform sales_handler_private.require_actor(p_company_id,false);
 select * into r from public.sales_requests where company_id=p_company_id and request_ref=p_request_ref for update;
 if r.id is null then raise exception 'Salgssaken finnes ikke i aktivt firma.' using errcode='42501'; end if;
 perform sales_handler_private.require_actor(p_company_id,public.sales_payload_is_store_offer(r.payload));
 select * into binding from sales_handler_private.request_handlers where request_id=r.id for update;
 if p_expected_revision is null or p_expected_revision<0 then raise exception 'Versjon for saksbehandler mangler.' using errcode='22023'; end if;
 if coalesce(binding.revision,0)<>p_expected_revision then
  raise exception 'Saksbehandleren er endret. Hent saken på nytt før du velger.' using errcode='PT409'; end if;
 ident:=sales_handler_private.identity(p_company_id,p_user_id,public.sales_payload_is_store_offer(r.payload));
 if ident is null then raise exception 'Saksbehandleren har ikke lenger tilgang. Velg på nytt.' using errcode='42501'; end if;
 next_revision:=coalesce(binding.revision,0)+1;
 insert into sales_handler_private.request_handlers(request_id,company_id,user_id,display_name,revision,assigned_by)
 values(r.id,p_company_id,p_user_id,ident->>'displayName',next_revision,auth.uid())
 on conflict(request_id) do update set user_id=excluded.user_id,display_name=excluded.display_name,
  revision=excluded.revision,assigned_by=excluded.assigned_by,assigned_at=now();
 update public.sales_requests set payload=payload,updated_at=now() where id=r.id;
 return ident||jsonb_build_object('revision',next_revision);
end $$;

-- Service-only, fresh canonical lookup at notification time. No publisher,
-- customer-supplied recipient, name matching or immutable version signature fallback.
create function public.sales_acceptance_case_handler(p_offer_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare o public.sales_offers%rowtype; r public.sales_requests%rowtype; binding sales_handler_private.request_handlers%rowtype; ident jsonb; matches bigint; accepted_lines jsonb; store_offer boolean;
begin
 select * into o from public.sales_offers where id=p_offer_id;
 if o.id is null then return jsonb_build_object('status','missing_offer'); end if;
 if o.status is distinct from 'accepted' then return jsonb_build_object('status','not_accepted'); end if;
 select v.lines into accepted_lines from public.sales_offer_versions v where v.offer_id=o.id
  and v.id::text=o.accepted_payload->>'version_id';
 if not found then return jsonb_build_object('status','missing_accepted_version'); end if;
 select count(*) into matches from public.sales_requests where company_id=o.company_id and request_ref=o.request_ref;
 if matches<>1 then return jsonb_build_object('status',case when matches=0 then 'missing_request' else 'ambiguous_request' end); end if;
 select * into r from public.sales_requests where company_id=o.company_id and request_ref=o.request_ref;
 select * into binding from sales_handler_private.request_handlers where request_id=r.id and company_id=o.company_id;
 if binding.request_id is null then return jsonb_build_object('status','missing_handler'); end if;
 store_offer:=public.sales_payload_is_store_offer(r.payload)
  or public.sales_payload_is_store_offer(jsonb_build_object('offerLines',accepted_lines));
 ident:=sales_handler_private.identity(o.company_id,binding.user_id,store_offer);
 if ident is null then return jsonb_build_object('status','handler_ineligible'); end if;
 return ident||jsonb_build_object('status','ready','revision',binding.revision);
end $$;

revoke all on all functions in schema sales_handler_private from public, anon, authenticated;
revoke all on function public.sales_case_handler_candidates(uuid,boolean) from public, anon;
revoke all on function public.sales_set_case_handler(uuid,text,uuid,bigint) from public, anon;
revoke all on function public.sales_acceptance_case_handler(uuid) from public, anon, authenticated;
grant execute on function public.sales_case_handler_candidates(uuid,boolean) to authenticated;
grant execute on function public.sales_set_case_handler(uuid,text,uuid,bigint) to authenticated;
grant execute on function public.sales_acceptance_case_handler(uuid) to service_role;

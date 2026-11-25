-- Reuse actual own consent in the primary firm only for byte-equivalent JSONB
-- content. Derived receipts retain the original actor/time/statement and source.
alter table public.kshms_acknowledgments
 add column shared_from_company_id uuid,
 add column shared_from_version_id uuid,
 add column shared_from_company_name text,
 add column shared_at timestamptz,
 add constraint kshms_ack_shared_complete check (
  (shared_from_company_id is null and shared_from_version_id is null and shared_from_company_name is null and shared_at is null)
  or (shared_from_company_id is not null and shared_from_version_id is not null and shared_from_company_name is not null and shared_at is not null
   and shared_from_company_id<>company_id and shared_from_version_id<>version_id)),
 add constraint kshms_ack_shared_original foreign key(shared_from_version_id,user_id)
 references public.kshms_acknowledgments(version_id,user_id);
create index kshms_ack_shared_original_idx on public.kshms_acknowledgments(shared_from_version_id,user_id);

create function kshms_private.primary_handbook(u uuid) returns uuid
language sql stable security definer set search_path='' as $$
 select m.company_id from public.sales_company_memberships m
 join public.profiles p on p.id=m.user_id
 join public.company_module_access ca on ca.company_id=m.company_id and ca.module_key='kshms' and ca.enabled
 left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id
 where m.user_id=u and m.is_primary and p.approved and not coalesce(p.deactivated,false)
 and p.role in ('admin','member','ansatt','firmaadmin') and (m.workspace_role='firmaadmin' or a.enabled)
 order by m.company_id limit 1;
$$;

create function kshms_private.reuse_primary_ack(c uuid,u uuid) returns integer
language plpgsql security definer set search_path='' as $$
declare primary_id uuid;added integer;
begin
 primary_id:=kshms_private.primary_handbook(u);
 if primary_id is null or primary_id=c or not exists(
  select 1 from public.sales_company_memberships m
  join public.company_module_access ca on ca.company_id=m.company_id and ca.module_key='kshms' and ca.enabled
  left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id
  where m.company_id=c and m.user_id=u and (m.workspace_role='firmaadmin' or a.enabled)
 ) then return 0;end if;
 with candidates as (
  select distinct on (target.id) target.id,original.version_id original_id,original.acknowledged_at,original.statement,original.user_identity,
   coalesce(nullif(s.display_name,''),s.normalized_name,s.id::text) company_name
  from public.kshms_assignments assigned
  join public.kshms_versions target on target.id=assigned.version_id and target.company_id=c
  join public.kshms_routines tr on tr.id=target.routine_id and tr.company_id=c and not tr.archived
  join public.kshms_versions source on source.company_id=primary_id and source.content_hash=target.content_hash and source.content=target.content
  join public.kshms_routines sr on sr.id=source.routine_id and sr.company_id=primary_id and not sr.archived
  join public.kshms_assignments own_source on own_source.version_id=source.id and own_source.user_id=u and own_source.company_id=primary_id
  join public.kshms_acknowledgments original on original.version_id=source.id and original.user_id=u and original.company_id=primary_id and original.shared_from_version_id is null
  join public.sales_company_scopes s on s.id=primary_id
  where assigned.company_id=c and assigned.user_id=u
  and not exists(select 1 from public.kshms_acknowledgments existing where existing.version_id=target.id and existing.user_id=u)
  order by target.id,original.acknowledged_at,original.version_id
 ), inserted as (
  insert into public.kshms_acknowledgments(company_id,version_id,user_id,acknowledged_at,statement,user_identity,
   shared_from_company_id,shared_from_version_id,shared_from_company_name,shared_at)
  select c,id,u,acknowledged_at,statement,user_identity,primary_id,original_id,company_name,now() from candidates
  on conflict(version_id,user_id) do nothing returning version_id
 ) insert into public.kshms_audit(company_id,actor_id,action,object_id)
 select c,u,'ack_shared_primary',version_id from inserted;
 get diagnostics added=row_count;
 return added;
end $$;

create function kshms_private.on_primary_ack() returns trigger
language plpgsql security definer set search_path='' as $$
declare target record;
begin
 if new.shared_from_version_id is not null then return new;end if;
  for target in select distinct company_id from public.kshms_assignments where user_id=new.user_id and company_id<>new.company_id order by company_id loop
   perform kshms_private.reuse_primary_ack(target.company_id,new.user_id);
  end loop;
 return new;
end $$;
revoke all on function kshms_private.primary_handbook(uuid),kshms_private.reuse_primary_ack(uuid,uuid),kshms_private.on_primary_ack()
 from public,anon,authenticated,service_role;
create trigger kshms_share_primary_ack after insert on public.kshms_acknowledgments for each row execute function kshms_private.on_primary_ack();

CREATE OR REPLACE FUNCTION public.kshms_get_state(p_company_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare x jsonb; mg boolean; member record; primary_id uuid;
begin
 x:=kshms_private.require_context(p_company_id); mg:=(x->>'manage')::boolean;
 -- Unique target receipts make retries safe. This read repair also resolves a
 -- consent/assignment committed concurrently in different company transactions.
 for member in select distinct user_id from public.kshms_assignments
  where company_id=p_company_id and (mg or user_id=auth.uid()) order by user_id loop
  perform kshms_private.reuse_primary_ack(p_company_id,member.user_id);
 end loop;
 primary_id:=kshms_private.primary_handbook(auth.uid());
 x:=x||jsonb_build_object('primary_company_id',primary_id,'primary_company_name',
  (select coalesce(nullif(display_name,''),normalized_name,id::text) from public.sales_company_scopes where id=primary_id));
 return jsonb_build_object('context',x,
 'settings',(select to_jsonb(s) from public.kshms_settings s where s.company_id=p_company_id),
 'routines',(select coalesce(jsonb_agg(case when mg then to_jsonb(r) else jsonb_build_object('id',r.id,'company_id',r.company_id,'archived',r.archived,'reference_number',r.reference_number) end order by r.updated_at desc),'[]') from public.kshms_routines r where r.company_id=p_company_id and (mg or exists(select 1 from public.kshms_assignments a where a.company_id=p_company_id and a.user_id=auth.uid() and a.version_id in(select id from public.kshms_versions where routine_id=r.id)))),
 'versions',(select coalesce(jsonb_agg(to_jsonb(v)||jsonb_build_object('publisher_identity',coalesce(v.publisher_identity,kshms_private.identity_snapshot(v.published_by)||jsonb_build_object('source','current_account'))) order by v.number desc),'[]') from public.kshms_versions v where v.company_id=p_company_id and (mg or exists(select 1 from public.kshms_assignments a where a.version_id=v.id and a.user_id=auth.uid()))),
 'assignments',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from public.kshms_assignments a where a.company_id=p_company_id and (mg or a.user_id=auth.uid())),
 'acknowledgments',(select coalesce(jsonb_agg(to_jsonb(a)||jsonb_build_object('user_identity',coalesce(a.user_identity,kshms_private.identity_snapshot(a.user_id)||jsonb_build_object('source','current_account')))),'[]') from public.kshms_acknowledgments a where a.company_id=p_company_id and (mg or a.user_id=auth.uid())),
 'reviews',(select coalesce(jsonb_agg(to_jsonb(r) order by r.signed_at desc),'[]') from public.kshms_reviews r where r.company_id=p_company_id and mg),
 'members',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'email',p.email,'name',kshms_private.identity_snapshot(p.id)->>'name','workspace_role',m.workspace_role,'role',a.role,'enabled',coalesce(a.enabled,false)) order by p.email),'[]') from public.sales_company_memberships m join public.profiles p on p.id=m.user_id left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id where m.company_id=p_company_id and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin') and mg));
end $function$
;


-- Backfill only proven own original consent. No original receipt is rewritten.
do $$declare member record;begin
 for member in select distinct company_id,user_id from public.kshms_assignments order by company_id,user_id loop
  perform kshms_private.reuse_primary_ack(member.company_id,member.user_id);
 end loop;
end$$;

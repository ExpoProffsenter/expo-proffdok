-- Additive, self-only acknowledgment. Existing single acknowledgment, table
-- privileges, immutable receipts and notification workers remain canonical.
create function public.kshms_acknowledge_batch(
 p_company_id uuid, p_user_id uuid, p_version_ids uuid[], p_statement text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 actor uuid := auth.uid();
 confirmed_at timestamptz;
 identity jsonb;
 inserted_count integer;
begin
 perform kshms_private.require_context(p_company_id);
 if actor is null or p_user_id is distinct from actor then
  raise exception 'Bekreftelse kan bare registreres på egen bruker.' using errcode='42501';
 end if;
 if p_statement is distinct from 'Jeg bekrefter at jeg har lest og forstått alle rutineutgavene i listen, forstår mitt ansvar og vil følge rutinene. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen gjelder min egen gjennomgang av de oppførte utgavene; den erstatter ikke opplæring eller faktisk utførelse.' then
  raise exception 'Bekreft at alle oppførte rutineutgaver er lest og forstått.' using errcode='22023';
 end if;
 if p_version_ids is null or coalesce(pg_catalog.array_ndims(p_version_ids),0)<>1
  or pg_catalog.cardinality(p_version_ids) not between 1 and 500
  or exists(select 1 from pg_catalog.unnest(p_version_ids) id where id is null)
  or (select count(distinct id) from pg_catalog.unnest(p_version_ids) id)<>pg_catalog.cardinality(p_version_ids) then
  raise exception 'En entydig liste med 1 til 500 rutineutgaver kreves.' using errcode='22023';
 end if;
 -- Same serialization boundary as the existing publication/access commands.
 perform 1 from public.company_module_access
 where company_id=p_company_id and module_key='kshms' for update;
 perform kshms_private.require_context(p_company_id);
 if auth.uid() is distinct from actor then
  raise exception 'Brukeren er endret.' using errcode='42501';
 end if;
 if exists(
  select 1 from pg_catalog.unnest(p_version_ids) requested(id)
  where not exists(
   select 1 from public.kshms_assignments a
   join public.kshms_versions v on v.company_id=a.company_id and v.id=a.version_id
   join public.kshms_routines r on r.company_id=v.company_id and r.id=v.routine_id
   where a.company_id=p_company_id and a.user_id=actor and a.version_id=requested.id and not r.archived
  )
 ) then
  raise exception 'En oppført utgave er ikke lenger aktiv og tildelt deg.' using errcode='42501';
 end if;
 -- New assignments/editions must be presented and read before new consent.
 if exists(
  select 1 from public.kshms_assignments a
  join public.kshms_versions v on v.company_id=a.company_id and v.id=a.version_id
  join public.kshms_routines r on r.company_id=v.company_id and r.id=v.routine_id
  left join public.kshms_acknowledgments ack on ack.version_id=a.version_id and ack.user_id=a.user_id
  where a.company_id=p_company_id and a.user_id=actor and not r.archived
  and ack.version_id is null and not (a.version_id=any(p_version_ids))
 ) then
  raise exception 'Listen over rutineutgaver er endret. Les nye utgaver og bekreft den oppdaterte listen.' using errcode='40001';
 end if;
 confirmed_at:=pg_catalog.clock_timestamp();
 identity:=kshms_private.identity_snapshot(actor);
 with inserted as (
  insert into public.kshms_acknowledgments(company_id,version_id,user_id,acknowledged_at,statement,user_identity)
  select p_company_id,id,actor,confirmed_at,p_statement,identity from pg_catalog.unnest(p_version_ids) id
  on conflict (version_id,user_id) do nothing returning version_id
 ), audited as (
  insert into public.kshms_audit(company_id,actor_id,action,object_id,at)
  select p_company_id,actor,'ack_batch',version_id,confirmed_at from inserted returning object_id
 ) select count(*) into inserted_count from audited;
 return pg_catalog.jsonb_build_object('inserted_count',inserted_count,'version_count',pg_catalog.cardinality(p_version_ids),'acknowledged_at',confirmed_at);
end $$;
revoke all on function public.kshms_acknowledge_batch(uuid,uuid,uuid[],text) from public,anon,authenticated,service_role;
grant execute on function public.kshms_acknowledge_batch(uuid,uuid,uuid[],text) to authenticated;
comment on function public.kshms_acknowledge_batch(uuid,uuid,uuid[],text) is 'Atomisk egen lesebekreftelse av nøyaktig oppførte tildelte rutineutgaver; tidspunkt og identitet settes av serveren.';

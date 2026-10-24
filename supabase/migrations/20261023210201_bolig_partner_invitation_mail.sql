-- Explicit partner invitations use the established authenticated mail transport.
-- Store only message metadata and the existing token hash, never a raw link.
create table bolig_private.partner_mail_settings (
 singleton boolean primary key default true check(singleton),
 enabled boolean not null default false,
 site_origin text not null default 'https://expo-proffdok.app' check(site_origin ~ '^https://[a-z0-9.-]+(:[0-9]+)?$')
);
insert into bolig_private.partner_mail_settings(singleton) values(true);
create table bolig_private.partner_mail (
 id uuid primary key, root_id uuid not null references bolig_private.roots(id),
 access_id uuid not null references bolig_private.partner_access(id),
 actor_id uuid not null references auth.users(id), access_revision bigint not null,
 recipient text not null, token_hash bytea not null, snapshot jsonb not null,
 created_at timestamptz not null default clock_timestamp(), begun_at timestamptz,
 sent_at timestamptz, provider_id text
);
create index bolig_partner_mail_root on bolig_private.partner_mail(root_id);
create index bolig_partner_mail_access on bolig_private.partner_mail(access_id,created_at desc);
create index bolig_partner_mail_actor on bolig_private.partner_mail(actor_id);
alter table bolig_private.partner_mail_settings enable row level security;
alter table bolig_private.partner_mail enable row level security;
revoke all on bolig_private.partner_mail_settings,bolig_private.partner_mail from public,anon,authenticated,service_role;

create function bolig_private.partner_mail_command(c uuid,root uuid,access uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;p bolig_private.partner_access%rowtype;cfg bolig_private.partner_mail_settings%rowtype;
 rec bolig_private.partner_mail%rowtype;rid uuid;profile jsonb;snapshot jsonb;history jsonb;
begin
 if action is null or action not in('get','prepare','begin') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>2000 then raise exception 'Ugyldig e-posthandling.' using errcode='22023';end if;
 ctx:=bolig_private.context(c);
 if auth.uid() is null or ctx->>'role'<>'manager' or not coalesce((ctx->>'enabled')::boolean,false)
 or not bolig_private.progress_member(c,auth.uid()) or not exists(select 1 from bolig_private.roots where id=root and company_id=c and not archived) then raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into p from bolig_private.partner_access where id=access and root_id=root for update;
 if p.id is null or not bolig_private.partner_active(p) then raise exception 'Tilgangen er utløpt, tilbakekalt eller stanset.' using errcode='42501';end if;
 select * into cfg from bolig_private.partner_mail_settings where singleton;
 profile:=public.work_profile_company_profile(c);
 snapshot:=jsonb_build_object('project',(select title from bolig_private.roots where id=root),'reference',(select reference from bolig_private.roots where id=root),
 'name',p.name,'organisation',p.organisation,'kind',p.kind,'to',p.email,'expires_at',p.expires_at,'access_mode',p.access_mode,
 'features',to_jsonb(p.features),'supplier_name',p.supplier_name,'company',profile,'origin',cfg.site_origin);
 if action='get' then
  select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'recipient',m.recipient,'created_at',m.created_at,'begun_at',m.begun_at,'sent_at',m.sent_at,'own',m.actor_id=auth.uid()) order by m.created_at desc),'[]') into history
   from (select * from bolig_private.partner_mail where access_id=access and root_id=root order by created_at desc limit 20) m;
  return jsonb_build_object('context',ctx,'root_id',root,'access_id',access,'revision',p.revision,'snapshot',snapshot,'enabled',cfg.enabled,'history',history);
 end if;
 rid:=nullif(payload->>'request_id','')::uuid;
 if rid is null or coalesce(payload->>'token','')!~'^[0-9a-f]{64}$' or sha256(convert_to(payload->>'token','UTF8'))<>p.token_hash then raise exception 'Lenken stemmer ikke med denne kontakten.' using errcode='42501';end if;
 if lower(trim(coalesce(payload->>'to','')))<>p.email or length(p.email)>254 or p.email!~'^[^[:space:]@,;<>]+@[^[:space:]@,;<>]+[.][^[:space:]@,;<>]+$' or p.email ~ '[\r\n]' then raise exception 'Kontroller kontaktens e-postadresse.' using errcode='22023';end if;
 if (payload->>'revision')::bigint is distinct from p.revision then raise exception 'Tilgangen er endret. Hent siste status og se over mottaker og funksjoner.' using errcode='PT409';end if;
 select * into rec from bolig_private.partner_mail where id=rid;
 if rec.id is not null then
  if rec.root_id<>root or rec.access_id<>access or rec.actor_id<>auth.uid() then raise exception 'Sendingen er ikke tilgjengelig for din bruker.' using errcode='42501';end if;
  if rec.access_revision<>p.revision or rec.recipient<>p.email or rec.token_hash<>p.token_hash or rec.snapshot->>'origin'<>cfg.site_origin then raise exception 'Tilgangsgrunnlaget er endret. Denne sendingen kan ikke startes.' using errcode='PT409';end if;
 elsif action<>'prepare' then raise exception 'Sendingen finnes ikke.' using errcode='42501';
 else
  if exists(select 1 from bolig_private.partner_mail where access_id=access and begun_at is not null and sent_at is null) then raise exception 'En tidligere sending må avklares. Prøv samme sending igjen.' using errcode='PT409';end if;
  if exists(select 1 from bolig_private.partner_mail where access_id=access and sent_at>clock_timestamp()-interval '1 minute') then raise exception 'Lenken er nettopp sendt. Vent ett minutt før du sender på nytt.' using errcode='PT409';end if;
  if (select count(*) from bolig_private.partner_mail where access_id=access and created_at>clock_timestamp()-interval '24 hours')>=10 then raise exception 'Mange sendingsforsøk i dag. Kontroller sendingshistorikken.' using errcode='PT409';end if;
  insert into bolig_private.partner_mail(id,root_id,access_id,actor_id,access_revision,recipient,token_hash,snapshot) values(rid,root,access,auth.uid(),p.revision,p.email,p.token_hash,snapshot) returning * into rec;
 end if;
 if rec.sent_at is null and rec.begun_at<clock_timestamp()-interval '23 hours' then raise exception 'Sendestatus er uavklart etter 23 timer. Be systemadmin kontrollere kvitteringen.' using errcode='PT409';end if;
 if action='begin' and rec.sent_at is null then
  if not coalesce(cfg.enabled,false) then raise exception 'E-postutsending er pauset i dette miljøet.' using errcode='PT409';end if;
  if exists(select 1 from bolig_private.partner_mail where access_id=access and id<>rid and begun_at is not null and sent_at is null) then raise exception 'En annen sending må avklares først.' using errcode='PT409';end if;
  if exists(select 1 from bolig_private.partner_mail where access_id=access and id<>rid and sent_at>clock_timestamp()-interval '1 minute') then raise exception 'Lenken er nettopp sendt. Vent ett minutt før du sender på nytt.' using errcode='PT409';end if;
  update bolig_private.partner_mail set begun_at=coalesce(begun_at,clock_timestamp()) where id=rid returning * into rec;
 end if;
 return jsonb_build_object('context',ctx,'root_id',root,'access_id',access,'id',rec.id,'snapshot',rec.snapshot,'enabled',cfg.enabled,'sent',rec.sent_at is not null,'sent_at',rec.sent_at,'begun_at',rec.begun_at);
end$$;
revoke all on function bolig_private.partner_mail_command(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.partner_mail_command(uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_partner_mail(p_company_id uuid,p_root_id uuid,p_access_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.partner_mail_command(p_company_id,p_root_id,p_access_id,p_action,p_payload)$$;
revoke all on function public.bolig_partner_mail(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_partner_mail(uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_partner_mail_complete(p_request_id uuid,p_provider_id text) returns void
language plpgsql security definer set search_path='' as $$begin
 if length(trim(coalesce(p_provider_id,''))) not between 1 and 150 then raise exception 'Ugyldig e-postkvittering.' using errcode='22023';end if;
 update bolig_private.partner_mail set sent_at=coalesce(sent_at,clock_timestamp()),provider_id=p_provider_id where id=p_request_id and begun_at is not null and (provider_id is null or provider_id=p_provider_id);
 if not found then raise exception 'Sendingen er ikke startet eller har en annen kvittering.' using errcode='PT409';end if;
end$$;
revoke all on function public.bolig_partner_mail_complete(uuid,text) from public,anon,authenticated;
grant execute on function public.bolig_partner_mail_complete(uuid,text) to service_role;
notify pgrst,'reload schema';

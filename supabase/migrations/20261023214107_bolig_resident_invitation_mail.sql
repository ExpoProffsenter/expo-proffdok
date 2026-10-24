-- Explicit sending of existing resident links. No publication or decision side effects.
create table bolig_private.resident_link_mail_settings (
 singleton boolean primary key default true check(singleton),enabled boolean not null default false,
 site_origin text not null default 'https://expo-proffdok.app' check(site_origin ~ '^https://[a-z0-9.-]+(:[0-9]+)?$')
);
insert into bolig_private.resident_link_mail_settings(singleton) values(true);
create table bolig_private.resident_link_mail (
 id uuid primary key,root_id uuid not null references bolig_private.roots(id),unit_id uuid not null references bolig_private.units(id),
 target_id uuid not null,kind text not null check(kind in('portal','reminder','agreement')),
 actor_id uuid not null references auth.users(id),access_revision bigint not null,recipient text not null,
 token_hash bytea not null,snapshot jsonb not null,created_at timestamptz not null default clock_timestamp(),
 begun_at timestamptz,sent_at timestamptz,provider_id text
);
create index bolig_resident_link_mail_root on bolig_private.resident_link_mail(root_id);
create index bolig_resident_link_mail_unit on bolig_private.resident_link_mail(unit_id,target_id,created_at desc);
create index bolig_resident_link_mail_actor on bolig_private.resident_link_mail(actor_id);
alter table bolig_private.resident_link_mail_settings enable row level security;
alter table bolig_private.resident_link_mail enable row level security;
revoke all on bolig_private.resident_link_mail_settings,bolig_private.resident_link_mail from public,anon,authenticated,service_role;
create function bolig_private.resident_link_mail_command(c uuid,root uuid,unit uuid,target uuid,kind text,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;u bolig_private.units%rowtype;p bolig_private.resident_portals%rowtype;d bolig_private.commercial_documents%rowtype;
 cfg bolig_private.resident_link_mail_settings%rowtype;rec bolig_private.resident_link_mail%rowtype;
 rev bigint;expiry timestamptz;hash bytea;rid uuid;snapshot jsonb;history jsonb;doc_kind text;doc_version int;
begin
 if action is null or action not in('get','prepare','begin') or kind is null or kind not in('portal','reminder','agreement') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>2000 then raise exception 'Ugyldig e-posthandling.' using errcode='22023';end if;
 ctx:=bolig_private.context(c);
 if auth.uid() is null or ctx->>'role'<>'manager' or not coalesce((ctx->>'enabled')::boolean,false)
 or not bolig_private.progress_member(c,auth.uid()) or not exists(select 1 from bolig_private.roots where id=root and company_id=c and not archived) then raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into u from bolig_private.units where id=unit and root_id=root;
 if u.id is null or coalesce(payload->>'token','')!~'^[0-9a-f]{64}$' then raise exception 'Boligen eller lenken er ikke tilgjengelig.' using errcode='42501';end if;
 hash:=sha256(convert_to(payload->>'token','UTF8'));
 if kind in('portal','reminder') then
  select * into p from bolig_private.resident_portals where id=target and root_id=root and unit_id=unit for update;
  if p.id is null or p.token_hash is distinct from hash or p.revoked or p.expires_at is null or p.expires_at<=clock_timestamp() then raise exception 'Portallenken er utløpt eller tilbakekalt.' using errcode='42501';end if;
  -- Identical capability checks to the real resident page, including contact/hierarchy.
  perform bolig_resident_private.portal(payload->>'token','get','{}');
  rev:=p.menu_version;expiry:=p.expires_at;
 else
  select * into d from bolig_private.commercial_documents where id=target and root_id=root and unit_id=unit for update;
  if d.id is null or d.token_hash is distinct from hash or d.status<>'published' or d.expires_at is null or d.expires_at<=clock_timestamp() then raise exception 'Avtalen venter ikke lenger på svar, eller lenken er utløpt.' using errcode='42501';end if;
  perform bolig_resident_private.resident_decision(payload->>'token','get',null,'{}');
  rev:=d.revision;expiry:=d.expires_at;doc_kind:=d.kind;doc_version:=d.version;
 end if;
 if length(u.contact_email)>254 or u.contact_email!~'^[^[:space:]@,;<>]+@[^[:space:]@,;<>]+[.][^[:space:]@,;<>]+$' or u.contact_email ~ '[\r\n]' then raise exception 'Kontroller e-post under Leilighetsinformasjon.' using errcode='22023';end if;
 select * into cfg from bolig_private.resident_link_mail_settings where singleton;
 snapshot:=jsonb_build_object('kind',kind,'document_kind',doc_kind,'version',doc_version,'name',u.contact_name,'to',u.contact_email,
 'unit',u.number,'address',(select address from bolig_private.entrances where id=u.entrance_id),
 'project',(select title from bolig_private.roots where id=root),'reference',(select reference from bolig_private.roots where id=root),
 'expires_at',expiry,'company',public.work_profile_company_profile(c),'origin',cfg.site_origin);
 if action='get' then
  select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'kind',m.kind,'recipient',m.recipient,'created_at',m.created_at,'begun_at',m.begun_at,'sent_at',m.sent_at,'own',m.actor_id=auth.uid()) order by m.created_at desc),'[]') into history
  from(select * from bolig_private.resident_link_mail where root_id=root and unit_id=unit and target_id=target order by created_at desc limit 20) m;
  return jsonb_build_object('context',ctx,'root_id',root,'unit_id',unit,'target_id',target,'kind',kind,'revision',rev,'snapshot',snapshot,'enabled',cfg.enabled,'history',history);
 end if;
 rid:=nullif(payload->>'request_id','')::uuid;
 if rid is null then raise exception 'Forsøksreferanse mangler.' using errcode='22023';end if;
 if payload->>'to' is distinct from u.contact_email then raise exception 'Mottakeren er endret. Hent siste status.' using errcode='22023';end if;
 if (payload->>'revision')::bigint is distinct from rev then raise exception 'Lenkegrunnlaget er endret. Se over siste versjon.' using errcode='PT409';end if;
 select * into rec from bolig_private.resident_link_mail where id=rid;
 if rec.id is not null then
  if rec.root_id<>root or rec.unit_id<>unit or rec.target_id<>target or rec.kind<>kind or rec.actor_id<>auth.uid() then raise exception 'Sendingen er ikke tilgjengelig for din bruker.' using errcode='42501';end if;
  if rec.access_revision<>rev or rec.recipient<>u.contact_email or rec.token_hash<>hash or rec.snapshot->>'origin'<>cfg.site_origin then raise exception 'Grunnlaget er endret. Denne sendingen kan ikke startes.' using errcode='PT409';end if;
 elsif action<>'prepare' then raise exception 'Sendingen finnes ikke.' using errcode='42501';
 else
  if exists(select 1 from bolig_private.resident_link_mail where target_id=target and begun_at is not null and sent_at is null) then raise exception 'En tidligere sending må avklares. Prøv samme sending igjen.' using errcode='PT409';end if;
  if exists(select 1 from bolig_private.resident_link_mail where target_id=target and sent_at>clock_timestamp()-interval '1 minute') then raise exception 'Lenken er nettopp sendt. Vent ett minutt før du sender på nytt.' using errcode='PT409';end if;
  if (select count(*) from bolig_private.resident_link_mail where target_id=target and created_at>clock_timestamp()-interval '24 hours')>=10 then raise exception 'Mange sendingsforsøk i dag. Kontroller historikken.' using errcode='PT409';end if;
  insert into bolig_private.resident_link_mail(id,root_id,unit_id,target_id,kind,actor_id,access_revision,recipient,token_hash,snapshot) values(rid,root,unit,target,kind,auth.uid(),rev,u.contact_email,hash,snapshot) returning * into rec;
 end if;
 if rec.sent_at is null and rec.begun_at<clock_timestamp()-interval '23 hours' then raise exception 'Sendestatus er uavklart etter 23 timer. Be systemadmin kontrollere kvitteringen.' using errcode='PT409';end if;
 if action='begin' and rec.sent_at is null then
  if not coalesce(cfg.enabled,false) then raise exception 'E-postutsending er pauset i dette miljøet.' using errcode='PT409';end if;
  if exists(select 1 from bolig_private.resident_link_mail where target_id=target and id<>rid and begun_at is not null and sent_at is null) then raise exception 'En annen sending må avklares først.' using errcode='PT409';end if;
  if exists(select 1 from bolig_private.resident_link_mail where target_id=target and id<>rid and sent_at>clock_timestamp()-interval '1 minute') then raise exception 'Lenken er nettopp sendt. Vent ett minutt.' using errcode='PT409';end if;
  update bolig_private.resident_link_mail set begun_at=coalesce(begun_at,clock_timestamp()) where id=rid returning * into rec;
 end if;
 return jsonb_build_object('context',ctx,'root_id',root,'unit_id',unit,'target_id',target,'kind',kind,'id',rec.id,'snapshot',rec.snapshot,'enabled',cfg.enabled,'sent',rec.sent_at is not null,'sent_at',rec.sent_at,'begun_at',rec.begun_at);
end$$;
revoke all on function bolig_private.resident_link_mail_command(uuid,uuid,uuid,uuid,text,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.resident_link_mail_command(uuid,uuid,uuid,uuid,text,text,jsonb) to authenticated;
create function public.bolig_resident_link_mail(p_company_id uuid,p_root_id uuid,p_unit_id uuid,p_target_id uuid,p_kind text,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.resident_link_mail_command(p_company_id,p_root_id,p_unit_id,p_target_id,p_kind,p_action,p_payload)$$;
revoke all on function public.bolig_resident_link_mail(uuid,uuid,uuid,uuid,text,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_resident_link_mail(uuid,uuid,uuid,uuid,text,text,jsonb) to authenticated;
create function public.bolig_resident_link_mail_complete(p_request_id uuid,p_provider_id text) returns void
language plpgsql security definer set search_path='' as $$begin
 if length(trim(coalesce(p_provider_id,''))) not between 1 and 150 then raise exception 'Ugyldig e-postkvittering.' using errcode='22023';end if;
 update bolig_private.resident_link_mail set sent_at=coalesce(sent_at,clock_timestamp()),provider_id=p_provider_id where id=p_request_id and begun_at is not null and (provider_id is null or provider_id=p_provider_id);
 if not found then raise exception 'Sendingen er ikke startet eller har en annen kvittering.' using errcode='PT409';end if;
end$$;
revoke all on function public.bolig_resident_link_mail_complete(uuid,text) from public,anon,authenticated;
grant execute on function public.bolig_resident_link_mail_complete(uuid,text) to service_role;
notify pgrst,'reload schema';

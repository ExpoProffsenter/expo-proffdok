-- Confirmation delivery is explicit and separate from documenting rectification.
-- Provider retries always reuse the same frozen message and idempotency key.
create table bolig_private.protocol_mail (
 id uuid primary key,root_id uuid not null references bolig_private.roots(id),scope_id uuid not null,
 protocol_id uuid not null,confirmation_id uuid not null,actor_id uuid not null references auth.users(id),
 recipient text not null,snapshot jsonb not null,created_at timestamptz not null default clock_timestamp(),
 begun_at timestamptz,sent_at timestamptz,provider_id text,
 unique(root_id,scope_id,protocol_id,confirmation_id,recipient)
);
create index bolig_protocol_mail_actor on bolig_private.protocol_mail(actor_id);
alter table bolig_private.protocol_mail enable row level security;
revoke all on bolig_private.protocol_mail from public,anon,authenticated,service_role;
create function public.bolig_protocol_mail(p_company_id uuid,p_root_id uuid,p_scope_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path='' as $$begin return bolig_private.protocol_mail_command(p_company_id,p_root_id,p_scope_id,p_action,p_payload);end$$;
create function bolig_private.protocol_mail_command(c uuid,root uuid,scope uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare s jsonb;d jsonb;protocol jsonb;rec bolig_private.protocol_mail%rowtype;rid uuid;pid uuid;recipient text;snapshot jsonb;history jsonb;profile jsonb;
begin
 if action is null or action not in ('list','prepare','inspect','begin') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>4000 then raise exception 'Ugyldig e-posthandling.' using errcode='22023';end if;
 if action<>'list' then perform 1 from bolig_private.roots where id=root and company_id=c for update;end if;
 s:=bolig_private.quality_scope(c,root,scope);
 if s#>>'{context,role}'<>'manager' or (s->>'archived')::boolean then raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
 pid:=nullif(payload->>'protocol_id','')::uuid;
 select data into d from bolig_private.quality_states where root_id=root and scope_id=scope;
 select p into protocol from jsonb_array_elements(coalesce(d->'protocols','[]')) p where p->>'id'=pid::text and not coalesce((p->>'superseded')::boolean,false);
 if action='list' then
  select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'recipient',m.recipient,'created_at',m.created_at,'begun_at',m.begun_at,'sent_at',m.sent_at,'confirmation_id',m.confirmation_id,'snapshot',m.snapshot) order by m.created_at desc),'[]') into history from bolig_private.protocol_mail m where m.root_id=root and m.scope_id=scope and m.protocol_id=pid and m.actor_id=auth.uid();
  return jsonb_build_object('context',s->'context','root_id',root,'scope_id',scope,'history',history);
 end if;
 rid:=nullif(payload->>'request_id','')::uuid;
 if rid is null then raise exception 'Sendingen mangler en unik ID.' using errcode='22023';end if;
 select * into rec from bolig_private.protocol_mail where id=rid and root_id=root and scope_id=scope and actor_id=auth.uid();
 if rec.id is not null then
  if action='prepare' and (rec.protocol_id<>pid or rec.recipient<>lower(trim(payload->>'to')) or rec.confirmation_id::text is distinct from payload->>'confirmation_id') then raise exception 'Sendings-ID-en gjelder annet innhold.' using errcode='PT409';end if;
  if rec.sent_at is not null then return jsonb_build_object('context',s->'context','root_id',root,'scope_id',scope,'id',rec.id,'snapshot',rec.snapshot,'sent',true,'sent_at',rec.sent_at);end if;
  pid:=rec.protocol_id;select p into protocol from jsonb_array_elements(d->'protocols') p where p->>'id'=pid::text and not coalesce((p->>'superseded')::boolean,false);
  if protocol#>>'{confirmation,id}' is distinct from rec.confirmation_id::text then raise exception 'Protokollen eller bekreftelsen er endret. Denne sendingen kan ikke startes.' using errcode='PT409';end if;
 elsif action<>'prepare' then raise exception 'Sendingen finnes ikke for din bruker.' using errcode='42501';
 else
  if exists(select 1 from bolig_private.protocol_mail where id=rid) then raise exception 'Sendings-ID-en er allerede brukt.' using errcode='42501';end if;
  recipient:=lower(trim(coalesce(payload->>'to','')));
  if length(recipient)>254 or recipient!~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?[.][a-zA-Z]{2,63}$' or recipient ~ '[\r\n]' then raise exception 'Skriv én gyldig e-postadresse.' using errcode='22023';end if;
  if protocol is null or protocol->'confirmation' is null or protocol#>>'{confirmation,id}' is distinct from payload->>'confirmation_id' then raise exception 'Lagre og kontroller gjeldende rettingsbekreftelse først.' using errcode='PT409';end if;
  if exists(select 1 from bolig_private.protocol_mail m where m.root_id=root and m.scope_id=scope and m.protocol_id=pid and m.confirmation_id::text=protocol#>>'{confirmation,id}' and m.begun_at is not null and m.sent_at is null) then raise exception 'En tidligere sending må avklares. Prøv den samme sendingen igjen før du lager en ny.' using errcode='PT409';end if;
  select * into rec from bolig_private.protocol_mail m where m.root_id=root and m.scope_id=scope and m.protocol_id=pid and m.confirmation_id::text=protocol#>>'{confirmation,id}' and m.recipient=recipient;
  if rec.id is not null then
   if rec.actor_id<>auth.uid() then raise exception 'Bekreftelsen er allerede klargjort eller sendt til mottakeren av en annen prosjektleder.' using errcode='PT409';end if;
  else
   profile:=public.work_profile_company_profile(c);
   snapshot:=jsonb_build_object('project',(select title from bolig_private.roots where id=root),'scope',s->>'title','protocol',protocol,'original',(select jsonb_build_object('title',doc->>'title','name',doc->>'name') from jsonb_array_elements(d->'documents') doc where doc->>'id'=protocol->>'document_id'),'to',recipient,'company',profile);
   insert into bolig_private.protocol_mail(id,root_id,scope_id,protocol_id,confirmation_id,actor_id,recipient,snapshot) values(rid,root,scope,pid,(protocol#>>'{confirmation,id}')::uuid,auth.uid(),recipient,snapshot) returning * into rec;
  end if;
 end if;
 if rec.begun_at is not null and rec.begun_at<clock_timestamp()-interval '23 hours' and rec.sent_at is null then raise exception 'Sendestatus er uavklart etter 23 timer. Be systemadmin kontrollere e-postkvitteringen før en ny sending.' using errcode='PT409';end if;
 if action='begin' and rec.sent_at is null then update bolig_private.protocol_mail set begun_at=coalesce(begun_at,clock_timestamp()) where id=rec.id returning * into rec;end if;
 return jsonb_build_object('context',s->'context','root_id',root,'scope_id',scope,'id',rec.id,'snapshot',rec.snapshot,'sent',rec.sent_at is not null,'sent_at',rec.sent_at,'begun_at',rec.begun_at);
end$$;
revoke all on function public.bolig_protocol_mail(uuid,uuid,uuid,text,jsonb),bolig_private.protocol_mail_command(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_protocol_mail(uuid,uuid,uuid,text,jsonb),bolig_private.protocol_mail_command(uuid,uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_protocol_mail_complete(p_request_id uuid,p_provider_id text) returns void language plpgsql security definer set search_path='' as $$
begin
 if length(trim(coalesce(p_provider_id,''))) not between 1 and 150 then raise exception 'Ugyldig e-postkvittering.';end if;
 update bolig_private.protocol_mail set sent_at=coalesce(sent_at,clock_timestamp()),provider_id=p_provider_id where id=p_request_id and begun_at is not null and (provider_id is null or provider_id=p_provider_id);
 if not found then raise exception 'Sendingen er ikke startet eller har en annen kvittering.';end if;
end$$;
revoke all on function public.bolig_protocol_mail_complete(uuid,text) from public,anon,authenticated;
grant execute on function public.bolig_protocol_mail_complete(uuid,text) to service_role;

notify pgrst,'reload schema';

-- Job-specific SJA drafts and immutable signatures. Uses existing KS/company gates.
create table public.kshms_sjas (
 id uuid primary key, company_id uuid not null references public.sales_company_scopes(id),
 content jsonb not null, revision bigint not null default 1 check(revision>0), status text not null default 'draft' check(status in ('draft','signed')),
 leader_id uuid references public.profiles(id), leader_identity jsonb,
 created_by uuid not null references public.profiles(id), creator_identity jsonb not null,
 updated_by uuid not null references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 signed_by uuid references public.profiles(id), signed_identity jsonb, signed_at timestamptz, statement text,
 check((status='draft' and signed_by is null and signed_identity is null and signed_at is null and statement is null)
    or (status='signed' and leader_id is not null and signed_by=leader_id and signed_by is not null and signed_identity is not null and signed_at is not null and statement is not null)),
 unique(company_id,id)
);
create index kshms_sjas_company_updated_idx on public.kshms_sjas(company_id,updated_at desc,id);
create index kshms_sjas_creator_idx on public.kshms_sjas(created_by);
create index kshms_sjas_updated_by_idx on public.kshms_sjas(updated_by);
create index kshms_sjas_leader_idx on public.kshms_sjas(leader_id);
create index kshms_sjas_signer_idx on public.kshms_sjas(signed_by);
create table public.kshms_sja_commands (
 company_id uuid not null references public.sales_company_scopes(id), request_id uuid not null,
 actor_id uuid not null references public.profiles(id), payload_hash text not null, result jsonb not null,
 created_at timestamptz not null default now(), primary key(company_id,request_id)
);
create index kshms_sja_commands_actor_idx on public.kshms_sja_commands(actor_id);
alter table public.kshms_sjas enable row level security;
alter table public.kshms_sja_commands enable row level security;
-- Tables are private to guarded RPCs, matching existing KS domains.
revoke all on public.kshms_sjas,public.kshms_sja_commands from public,anon,authenticated;
create trigger kshms_sja_command_immutable before update or delete on public.kshms_sja_commands for each row execute function kshms_private.immutable_record();
create function kshms_private.sja_protect_signed() returns trigger language plpgsql set search_path='' as $$
begin
 if old.status='signed' then raise exception 'En signert SJA kan ikke endres. Lag en ny analyse ved endringer.' using errcode='42501'; end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end $$;
create trigger kshms_sja_signed_immutable before update or delete on public.kshms_sjas for each row execute function kshms_private.sja_protect_signed();

create function kshms_private.sja_text(d jsonb,k text,lim integer default 4000) returns text language plpgsql immutable set search_path='' as $$
declare v text;
begin
 if d ? k and jsonb_typeof(d->k) not in ('string','null') then raise exception 'SJA-feltene må inneholde tekst.'; end if;
 v:=regexp_replace(coalesce(d->>k,''),'^\s+|\s+$','','g');
 if length(v)>lim then raise exception 'Et SJA-felt er for langt.'; end if;
 return v;
end $$;
create function kshms_private.sja_content(d jsonb,signing boolean default false) returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb:='{}'; k text; v text; grp text; row_data jsonb; cleaned jsonb; rows_data jsonb; ids uuid[]; row_id uuid; fields text[]; leader uuid;
begin
 if jsonb_typeof(d) is distinct from 'object' or octet_length(d::text)>150000 then raise exception 'SJA-en er for stor eller mangler innhold.'; end if;
 foreach k in array array['title','workplace','project_reference','task','planned_on','reviewed_on','routines','equipment','ppe','emergency','stop_conditions','communication'] loop
  v:=kshms_private.sja_text(d,k,case when k='title' then 160 else 4000 end);
  if k in ('planned_on','reviewed_on') and v<>'' then
   if v !~ '^\d{4}-\d{2}-\d{2}$' or to_char(v::date,'YYYY-MM-DD')<>v then raise exception 'Velg en gyldig dato.'; end if;
  end if;
  if signing and k not in ('project_reference','routines') and v='' then raise exception 'Fyll ut oppgave, sted, datoer, utstyr, beredskap og gjennomgang før signering.'; end if;
  result:=result||jsonb_build_object(k,v);
 end loop;
 if result->>'title'='' then raise exception 'Skriv et navn på jobben før du lagrer.'; end if;
 leader:=nullif(kshms_private.sja_text(d,'leader_id',36),'')::uuid;
 if signing and leader is null then raise exception 'Velg ansvarlig prosjektleder før signering.'; end if;
 result:=result||jsonb_build_object('leader_id',coalesce(leader::text,''));
 foreach grp in array array['steps','participants'] loop
  if jsonb_typeof(d->grp) is distinct from 'array' then raise exception 'Arbeidstrinn og deltakere må ha gyldige rader.'; end if;
  if jsonb_array_length(d->grp) not between 1 and (case when grp='steps' then 30 else 40 end) then raise exception 'Bruk 1–30 arbeidstrinn og 1–40 deltakere.'; end if;
  fields:=case when grp='steps' then array['activity','hazard','consequence','measures','owner','check'] else array['name','role','company','involvement'] end;
  rows_data:='[]';ids:='{}';
  for row_data in select value from jsonb_array_elements(d->grp) loop
   if jsonb_typeof(row_data) is distinct from 'object' then raise exception 'Ugyldig SJA-rad.'; end if;
   row_id:=nullif(kshms_private.sja_text(row_data,'id',36),'')::uuid;
   if row_id is null or row_id=any(ids) then raise exception 'Hver SJA-rad må ha egen ID.'; end if;
   ids:=array_append(ids,row_id);cleaned:=jsonb_build_object('id',row_id);
   foreach k in array fields loop
    v:=kshms_private.sja_text(row_data,k,2000);
    if signing and not (grp='participants' and k='company') and v='' then raise exception 'Fyll ut arbeidstrinn, farer, konsekvenser, tiltak, ansvar, kontroll og deltakernes gjennomgang.'; end if;
    cleaned:=cleaned||jsonb_build_object(k,v);
   end loop;
   rows_data:=rows_data||jsonb_build_array(cleaned);
  end loop;
  result:=result||jsonb_build_object(grp,rows_data);
 end loop;
 return result;
end $$;

create function public.kshms_sja_state(p_company_id uuid,p_query text default '',p_status text default 'all') returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; result jsonb;
begin
 x:=kshms_private.require_context(p_company_id);
 if p_status not in ('all','draft','signed') or length(coalesce(p_query,''))>160 then raise exception 'Ugyldig SJA-søk.'; end if;
 with visible as (
  select s.* from public.kshms_sjas s where s.company_id=p_company_id
  and (s.status='signed' or s.created_by=auth.uid() or s.leader_id=auth.uid() or (x->>'manage')::boolean)
  and (p_status='all' or s.status=p_status)
  and (coalesce(p_query,'')='' or strpos(lower((s.content->>'title')||' '||(s.content->>'workplace')||' '||(s.content->>'project_reference')),lower(p_query))>0)
 ), recent as (select * from visible order by updated_at desc,id limit 100)
 select jsonb_build_object('context',x,'total',(select count(*) from visible),
  'items',(select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'company_id',r.company_id,'revision',r.revision,'status',r.status,'title',r.content->>'title','workplace',r.content->>'workplace','project_reference',r.content->>'project_reference','leader_id',r.leader_id,'leader_identity',r.leader_identity,'signed_identity',r.signed_identity,'signed_at',r.signed_at) order by r.updated_at desc,r.id),'[]') from recent r),
  'members',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'identity',kshms_private.identity_snapshot(p.id)) order by p.email),'[]') from public.sales_company_memberships m join public.profiles p on p.id=m.user_id where m.company_id=p_company_id and kshms_private.deviation_member(p_company_id,p.id))) into result;
 return result;
end $$;
create function public.kshms_sja_detail(p_company_id uuid,p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; s public.kshms_sjas%rowtype;
begin
 x:=kshms_private.require_context(p_company_id);
 select * into s from public.kshms_sjas where company_id=p_company_id and id=p_id;
 if found and not (s.status='signed' or s.created_by=auth.uid() or s.leader_id=auth.uid() or (x->>'manage')::boolean) then raise exception 'SJA-en er ikke tilgjengelig.' using errcode='42501'; end if;
 return jsonb_build_object('context',x,'sja',case when s.id is null then null else to_jsonb(s) end);
end $$;
create function public.kshms_sja_command(p_company_id uuid,p_action text,p_request_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb; s public.kshms_sjas%rowtype; receipt public.kshms_sja_commands%rowtype; sja_id uuid; content_data jsonb; leader uuid; payload_digest text; result jsonb;
 statement_value constant text:='Jeg har gjennomgått denne SJA-en sammen med deltakerne. Arbeidsoppgaven, farene, tiltakene og beredskapen er vurdert for forholdene på stedet. Nødvendige tiltak er kontrollert før arbeidet starter. Ved endringer eller uavklart risiko stanser vi og vurderer arbeidet på nytt.';
begin
 x:=kshms_private.require_context(p_company_id);
 perform 1 from public.company_module_access where company_id=p_company_id and module_key='kshms' for update;
 x:=kshms_private.require_context(p_company_id);
 if p_action is null or p_action not in ('save','sign') or p_request_id is null or jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'Ugyldig SJA-kommando.'; end if;
 payload_digest:=encode(sha256(convert_to(p_action||p_payload::text,'UTF8')),'hex');
 select * into receipt from public.kshms_sja_commands where company_id=p_company_id and request_id=p_request_id;
 if found then
  if receipt.actor_id<>auth.uid() or receipt.payload_hash<>payload_digest then raise exception 'Forespørselen er brukt med annen tekst eller bruker.' using errcode='40001'; end if;
  return receipt.result;
 end if;
 sja_id:=(p_payload->>'id')::uuid;
 if sja_id is null then raise exception 'SJA-ID mangler.'; end if;
 select * into s from public.kshms_sjas where id=sja_id and company_id=p_company_id for update;
 if found then
  if s.status='signed' then raise exception 'SJA-en er signert og kan ikke endres.' using errcode='42501'; end if;
  if not ((x->>'manage')::boolean or s.created_by=auth.uid() or s.leader_id=auth.uid()) then raise exception 'Du kan ikke endre denne SJA-en.' using errcode='42501'; end if;
  if s.revision<>coalesce((p_payload->>'revision')::bigint,-1) then raise exception 'En kollega har lagret en nyere SJA. Sammenlign før du fortsetter.' using errcode='40001'; end if;
 else
  if exists(select 1 from public.kshms_sjas other where other.id=sja_id) then raise exception 'SJA-en er ikke tilgjengelig.' using errcode='42501'; end if;
  if coalesce((p_payload->>'revision')::bigint,-1)<>0 then raise exception 'SJA-en ble ikke funnet. Kladden er beholdt.' using errcode='40001'; end if;
 end if;
 content_data:=kshms_private.sja_content(p_payload->'content',p_action='sign');leader:=nullif(content_data->>'leader_id','')::uuid;
 if leader is not null and not kshms_private.deviation_member(p_company_id,leader) then raise exception 'Velg en aktiv intern prosjektleder med KS/HMS-tilgang.' using errcode='42501'; end if;
 if p_action='sign' and (leader<>auth.uid() or p_payload->>'statement' is distinct from statement_value or p_payload->'prepared' is distinct from 'true'::jsonb) then raise exception 'Bare valgt ansvarlig prosjektleder kan signere etter egen bekreftelse.' using errcode='42501'; end if;
 if s.id is null then
  insert into public.kshms_sjas(id,company_id,content,leader_id,leader_identity,created_by,creator_identity,updated_by)
  values(sja_id,p_company_id,content_data,leader,case when leader is null then null else kshms_private.identity_snapshot(leader) end,auth.uid(),kshms_private.identity_snapshot(auth.uid()),auth.uid()) returning * into s;
 else
  update public.kshms_sjas set content=content_data,leader_id=leader,leader_identity=case when leader is null then null else kshms_private.identity_snapshot(leader) end,revision=revision+1,updated_by=auth.uid(),updated_at=now() where id=s.id returning * into s;
 end if;
 if p_action='sign' then
  update public.kshms_sjas set status='signed',signed_by=auth.uid(),signed_identity=kshms_private.identity_snapshot(auth.uid()),signed_at=now(),statement=statement_value where id=s.id returning * into s;
 end if;
 result:=jsonb_build_object('sja',to_jsonb(s));
 insert into public.kshms_sja_commands(company_id,request_id,actor_id,payload_hash,result) values(p_company_id,p_request_id,auth.uid(),payload_digest,result);
 insert into public.kshms_audit(company_id,actor_id,action,object_id) values(p_company_id,auth.uid(),'sja-'||p_action,s.id);
 return result;
end $$;
revoke all on function kshms_private.sja_protect_signed(),kshms_private.sja_text(jsonb,text,integer),kshms_private.sja_content(jsonb,boolean) from public,anon,authenticated;
revoke all on function public.kshms_sja_state(uuid,text,text),public.kshms_sja_detail(uuid,uuid),public.kshms_sja_command(uuid,text,uuid,jsonb) from public,anon;
grant execute on function public.kshms_sja_state(uuid,text,text),public.kshms_sja_detail(uuid,uuid),public.kshms_sja_command(uuid,text,uuid,jsonb) to authenticated;

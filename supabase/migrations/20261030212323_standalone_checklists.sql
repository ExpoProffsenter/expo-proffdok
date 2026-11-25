-- Independent checklist controls. No project rows, grants or existing RPCs change.
create schema checklist_private;
revoke all on schema checklist_private from public,anon,authenticated;
create table checklist_private.runs (
 id uuid primary key, company_id uuid not null references public.sales_company_scopes(id),
 created_by uuid not null references auth.users(id), definition jsonb not null,
 version_id uuid references public.kshms_checklist_versions(id), answers jsonb not null default '{}',
 order_number text not null default '', revision bigint not null default 1,
 status text not null default 'draft' check(status in ('draft','completed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 updated_identity jsonb not null, completed_at timestamptz,
 check(length(order_number)<=100),check((status='completed')=(completed_at is not null))
);
create index standalone_checklist_owner on checklist_private.runs(company_id,created_by,updated_at desc,id);
create index standalone_checklist_version on checklist_private.runs(version_id);
create table checklist_private.receipts (
 request_id uuid primary key,company_id uuid not null,actor_id uuid not null,payload_hash text not null,result jsonb not null
);
create table checklist_private.mail_requests (
 id uuid primary key,company_id uuid not null,actor_id uuid not null,
 run_id uuid not null references checklist_private.runs(id),revision bigint not null,recipient text not null,
 snapshot jsonb not null,created_at timestamptz not null default now(),pdf_content text,
 provider_id text,sent_at timestamptz,check(octet_length(pdf_content)<=10000000)
);
create index standalone_checklist_mail_owner on checklist_private.mail_requests(company_id,actor_id,created_at desc);
create index standalone_checklist_mail_run on checklist_private.mail_requests(run_id,created_at desc);
alter table checklist_private.runs enable row level security;
alter table checklist_private.receipts enable row level security;
alter table checklist_private.mail_requests enable row level security;
revoke all on all tables in schema checklist_private from public,anon,authenticated;
create trigger standalone_checklist_immutable before update or delete on checklist_private.runs
 for each row execute function kshms_private.protect_completed_checklist();

create function checklist_private.context(c uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or c is null or c is distinct from public.current_active_company_scope_id()
 or not exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
  where m.company_id=c and m.user_id=auth.uid() and p.approved and not coalesce(p.deactivated,false)
  and p.role in ('admin','member','ansatt','firmaadmin') and m.workspace_role in ('firmaadmin','ansatt','admin','member'))
 then raise exception 'Sjekklister er ikke tilgjengelige i aktivt arbeidsfirma.' using errcode='42501';end if;
 return jsonb_build_object('company_id',c,'user_id',auth.uid(),'enabled',true);
end $$;

create function public.standalone_checklist_workspace(p_company_id uuid,p_id uuid default null,p_before timestamptz default null,p_before_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;rows jsonb;versions jsonb;r checklist_private.runs%rowtype;history jsonb;
begin
 x:=checklist_private.context(p_company_id);
 if p_id is not null then
  select * into r from checklist_private.runs where id=p_id and company_id=p_company_id and created_by=auth.uid();
  if r.id is null then raise exception 'Sjekklisten er ikke tilgjengelig.' using errcode='42501';end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'recipient',m.recipient,'revision',m.revision,'created_at',m.created_at,'sent_at',m.sent_at) order by m.created_at desc),'[]') into history
   from (select * from checklist_private.mail_requests where run_id=r.id and actor_id=auth.uid() order by created_at desc limit 10)m;
  return jsonb_build_object('context',x,'record',to_jsonb(r),'mail_history',history);
 end if;
 select coalesce(jsonb_agg(to_jsonb(v) order by v.content->>'title'),'[]') into versions from public.kshms_checklist_versions v
 join public.kshms_checklist_templates t on t.id=v.template_id and t.company_id=p_company_id and not t.archived
 where v.company_id=p_company_id and not exists(select 1 from public.kshms_checklist_versions newer where newer.template_id=v.template_id and newer.number>v.number);
 select coalesce(jsonb_agg(to_jsonb(q) order by q.updated_at desc,q.id desc),'[]') into rows from
 (select id,order_number,revision,status,updated_at,definition->>'title' title from checklist_private.runs where company_id=p_company_id and created_by=auth.uid()
 and (p_before is null or (updated_at,id)<(p_before,p_before_id)) order by updated_at desc,id desc limit 51)q;
 return jsonb_build_object('context',x,'versions',versions,'records',case when jsonb_array_length(rows)>50 then rows-50 else rows end,
 'next',case when jsonb_array_length(rows)>50 then jsonb_build_object('updated_at',rows->49->'updated_at','id',rows->49->'id') else null end);
end $$;

create function public.standalone_checklist_command(p_company_id uuid,p_action text,p_request_id uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;r checklist_private.runs%rowtype;receipt checklist_private.receipts%rowtype;v public.kshms_checklist_versions%rowtype;
 rid uuid;ver uuid;def jsonb;clean_answers jsonb:='{}';point jsonb;a jsonb;photos jsonb;photo jsonb;vals jsonb;prefix jsonb:='[]';digest text;ord text;
begin
 x:=checklist_private.context(p_company_id);
 if p_request_id is null or p_action not in('save','complete') or jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>3500000
 then raise exception 'Ugyldig eller for stor sjekkliste.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
 digest:=encode(sha256(convert_to(p_action||p_payload::text,'UTF8')),'hex');
 select * into receipt from checklist_private.receipts where request_id=p_request_id;
 if found then
  if receipt.company_id<>p_company_id or receipt.actor_id<>auth.uid() or receipt.payload_hash<>digest then raise exception 'Lagringsforsøket er endret.' using errcode='PT409';end if;
  return receipt.result;
 end if;
 rid:=(p_payload->>'id')::uuid;ver:=nullif(p_payload->>'version_id','')::uuid;
 if rid is null then raise exception 'Sjekklisten mangler ID.';end if;
 perform pg_advisory_xact_lock(hashtextextended(rid::text,1));
 select * into r from checklist_private.runs where id=rid for update;
 if found then
  if r.company_id<>p_company_id or r.created_by<>auth.uid() then raise exception 'Sjekklisten tilhører en annen bruker eller bedrift.' using errcode='42501';end if;
  if r.status<>'draft' or r.revision<>coalesce((p_payload->>'revision')::bigint,-1) then raise exception 'En nyere sjekkliste er lagret. Kladden er beholdt; åpne lagret utgave og sammenlign.' using errcode='PT409';end if;
  def:=r.definition;
  if ver is distinct from r.version_id or p_payload->'definition' is distinct from def then raise exception 'Sjekklisteutgaven er låst etter første lagring.' using errcode='PT409';end if;
 elsif coalesce((p_payload->>'revision')::bigint,-1)<>0 then raise exception 'Sjekklisten må åpnes på nytt.' using errcode='PT409';
 elsif ver is not null then
  select version.* into v from public.kshms_checklist_versions version join public.kshms_checklist_templates t on t.id=version.template_id
   where version.id=ver and version.company_id=p_company_id and t.company_id=p_company_id and not t.archived;
  if v.id is null or p_payload->'definition' is distinct from v.content then raise exception 'Firmamalen er ikke tilgjengelig eller er endret.' using errcode='42501';end if;
  def:=v.content;
 else
  def:=kshms_private.checklist_content(p_payload->'definition');
  if exists(select 1 from jsonb_array_elements(def->'points')p where p->>'subform_version_id' is not null) then raise exception 'Bruk en publisert firmamal når du trenger underskjema.';end if;
 end if;
 ord:=kshms_private.execution_text(p_payload,'order_number',100);
 if jsonb_typeof(p_payload->'answers') is distinct from 'object' then raise exception 'Ugyldige sjekklistsvar.';end if;
 for point in select value from jsonb_array_elements(def->'points') loop
  a:=coalesce(p_payload->'answers'->(point->>'id'),'{}');
  if jsonb_typeof(a) is distinct from 'object' or coalesce(a->>'status','') not in('','Ok','Avvik','Ikke aktuelt') or length(coalesce(a->>'comment',''))>20000 then raise exception 'Ugyldig svar eller kommentar.';end if;
  if point->'allow_na'='false'::jsonb and a->>'status'='Ikke aktuelt' then raise exception 'Punktet tillater ikke Ikke aktuelt.';end if;
  photos:=coalesce(a->'photos','[]');
  if jsonb_typeof(photos) is distinct from 'array' or jsonb_array_length(photos)>3 then raise exception 'Bruk inntil tre bilder per sjekkpunkt.';end if;
  for photo in select value from jsonb_array_elements(photos) loop
   if jsonb_typeof(photo) is distinct from 'object' or coalesce(photo->>'data','')!~'^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$' or length(photo->>'data')>400000
   then raise exception 'Ugyldig dokumentasjonsbilde.';end if;
  end loop;
  vals:=kshms_private.checklist_values(coalesce(point->'fields','[]'),coalesce(a->'values','{}'),p_action='complete' and coalesce(a->>'status','')<>'Ikke aktuelt');
  a:=jsonb_build_object('status',coalesce(a->>'status',''),'comment',coalesce(a->>'comment',''),'photos',photos,'values',vals);
  prefix:=kshms_private.checklist_prefix_add(prefix,point,a);
  a:=a||jsonb_build_object('values',kshms_private.checklist_sign_values(coalesce(point->'fields','[]'),vals,coalesce(r.answers->(point->>'id')->'values','{}'),prefix));
  if p_action='complete' then
   if nullif(a->>'status','') is null then raise exception 'Svar på alle sjekkpunktene før du fullfører.';end if;
   if (a->>'status'='Avvik' or (point->'comment_required'='true'::jsonb and a->>'status'<>'Ikke aktuelt')) and nullif(btrim(a->>'comment'),'') is null then raise exception 'Skriv påkrevd kommentar eller beskriv avviket.';end if;
   if point->'image_required'='true'::jsonb and a->>'status'<>'Ikke aktuelt' and jsonb_array_length(photos)=0 then raise exception 'Legg til påkrevd bilde.';end if;
  end if;
  clean_answers:=clean_answers||jsonb_build_object(point->>'id',a);
 end loop;
 if r.id is null then
  insert into checklist_private.runs(id,company_id,created_by,definition,version_id,answers,order_number,updated_identity)
   values(rid,p_company_id,auth.uid(),def,ver,clean_answers,ord,kshms_private.identity_snapshot(auth.uid())) returning * into r;
 else update checklist_private.runs set answers=clean_answers,order_number=ord,revision=revision+1,updated_at=now(),updated_identity=kshms_private.identity_snapshot(auth.uid()) where id=rid returning * into r;end if;
 if p_action='complete' then update checklist_private.runs set status='completed',completed_at=now() where id=rid returning * into r;end if;
 insert into checklist_private.receipts values(p_request_id,p_company_id,auth.uid(),digest,jsonb_build_object('context',x,'record',to_jsonb(r)));
 return jsonb_build_object('context',x,'record',to_jsonb(r));
end $$;

create function public.standalone_checklist_mail(p_company_id uuid,p_id uuid,p_revision bigint,p_request_id uuid,p_to text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;r checklist_private.runs%rowtype;m checklist_private.mail_requests%rowtype;recipient text;
begin
 x:=checklist_private.context(p_company_id);recipient:=btrim(p_to);
 if p_request_id is null or recipient is null or length(recipient)>254 or recipient!~'^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$' or recipient~'[\r\n]' then raise exception 'Skriv én gyldig e-postadresse.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,2));
 select * into r from checklist_private.runs where id=p_id and company_id=p_company_id and created_by=auth.uid();
 if r.id is null then raise exception 'Sjekklisten er ikke tilgjengelig.' using errcode='42501';end if;
 select * into m from checklist_private.mail_requests where id=p_request_id;
 if found then
  if m.company_id<>p_company_id or m.actor_id<>auth.uid() or m.run_id<>p_id or m.revision<>p_revision or m.recipient<>recipient then raise exception 'Mottaker eller dokument er endret. Gjenoppta den opprinnelige sendingen.' using errcode='PT409';end if;
  if m.sent_at is not null then return jsonb_build_object('id',m.id,'sent',true);end if;
  if m.created_at<now()-interval '20 hours' then raise exception 'Sendingen må avklares før du oppretter en ny. Kontroller sendingshistorikken.' using errcode='PT409';end if;
 else
  if (select count(*) from checklist_private.mail_requests where company_id=p_company_id and actor_id=auth.uid() and created_at>now()-interval '1 hour')>=10 then raise exception 'Du kan sende høyst ti sjekklister per time.' using errcode='22023';end if;
  if r.revision<>p_revision then raise exception 'Sjekklisten er endret. Åpne lagret utgave før sending.' using errcode='PT409';end if;
  insert into checklist_private.mail_requests(id,company_id,actor_id,run_id,revision,recipient,snapshot)
   values(p_request_id,p_company_id,auth.uid(),p_id,p_revision,recipient,jsonb_build_object('record',to_jsonb(r),'company',public.work_profile_company_profile(p_company_id))) returning * into m;
 end if;
 if r.revision<>m.revision then raise exception 'Sjekklisten er endret. Sendingen er stoppet.' using errcode='PT409';end if;
 return jsonb_build_object('id',m.id,'sent',false,'snapshot',m.snapshot,'recipient',m.recipient,'created_at',m.created_at);
end $$;

-- Only the authenticated Edge worker can freeze PDF bytes and acknowledge a provider receipt.
create function public.standalone_checklist_mail_file(p_request_id uuid,p_content text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m checklist_private.mail_requests%rowtype;
begin
 select * into m from checklist_private.mail_requests where id=p_request_id for update;
 if m.id is null or m.created_at<now()-interval '20 hours' then raise exception 'Sendingen er ikke tilgjengelig.';end if;
 if m.sent_at is not null then return jsonb_build_object('sent',true);end if;
 if m.pdf_content is null then
  if p_content is null or length(p_content) not between 100 and 10000000 or p_content!~'^JVBERi0[A-Za-z0-9+/]+=*$' then raise exception 'PDF-vedlegget er ugyldig eller for stort.';end if;
  update checklist_private.mail_requests set pdf_content=p_content where id=m.id returning * into m;
 end if;
 return jsonb_build_object('content',m.pdf_content,'sent',false);
end $$;
create function public.standalone_checklist_mail_complete(p_request_id uuid,p_provider_id text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if nullif(p_provider_id,'') is null or length(p_provider_id)>150 then raise exception 'Ugyldig sendingskvittering.';end if;
 update checklist_private.mail_requests set sent_at=coalesce(sent_at,now()),provider_id=coalesce(provider_id,p_provider_id),pdf_content=null where id=p_request_id;
 if not found then raise exception 'Sendingen finnes ikke.';end if;
end $$;
revoke all on all functions in schema checklist_private from public,anon,authenticated;
revoke all on function public.standalone_checklist_workspace(uuid,uuid,timestamptz,uuid),public.standalone_checklist_command(uuid,text,uuid,jsonb),public.standalone_checklist_mail(uuid,uuid,bigint,uuid,text) from public,anon;
grant execute on function public.standalone_checklist_workspace(uuid,uuid,timestamptz,uuid),public.standalone_checklist_command(uuid,text,uuid,jsonb),public.standalone_checklist_mail(uuid,uuid,bigint,uuid,text) to authenticated;
revoke all on function public.standalone_checklist_mail_file(uuid,text),public.standalone_checklist_mail_complete(uuid,text) from public,anon,authenticated;
grant execute on function public.standalone_checklist_mail_file(uuid,text),public.standalone_checklist_mail_complete(uuid,text) to service_role;

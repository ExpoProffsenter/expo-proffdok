-- External jobs need traceable job details. Existing completed history is untouched.
alter table checklist_private.runs
 add column work_site text not null default '' check(length(work_site)<=400),
 add column external_project text not null default '' check(length(external_project)<=200),
 add column customer_name text not null default '' check(length(customer_name)<=160);

create or replace function public.standalone_checklist_workspace(p_company_id uuid,p_id uuid default null,p_before timestamptz default null,p_before_id uuid default null)
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
 (select id,order_number,work_site,external_project,customer_name,revision,status,updated_at,definition->>'title' title from checklist_private.runs where company_id=p_company_id and created_by=auth.uid()
 and (p_before is null or (updated_at,id)<(p_before,p_before_id)) order by updated_at desc,id desc limit 51)q;
 return jsonb_build_object('context',x,'versions',versions,'records',case when jsonb_array_length(rows)>50 then rows-50 else rows end,
 'next',case when jsonb_array_length(rows)>50 then jsonb_build_object('updated_at',rows->49->'updated_at','id',rows->49->'id') else null end);
end $$;

create or replace function public.standalone_checklist_command(p_company_id uuid,p_action text,p_request_id uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;r checklist_private.runs%rowtype;receipt checklist_private.receipts%rowtype;v public.kshms_checklist_versions%rowtype;
 rid uuid;ver uuid;def jsonb;clean_answers jsonb:='{}';point jsonb;a jsonb;photos jsonb;photo jsonb;vals jsonb;prefix jsonb:='[]';digest text;ord text;site text;ext text;customer text;
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
 site:=kshms_private.execution_text(p_payload,'work_site',400);
 ext:=kshms_private.execution_text(p_payload,'external_project',200);
 customer:=kshms_private.execution_text(p_payload,'customer_name',160);
 if nullif(btrim(ord),'') is null then raise exception 'Fyll inn ordrenummer.' using errcode='22023';end if;
 if nullif(btrim(site),'') is null then raise exception 'Fyll inn arbeidssted/adresse.' using errcode='22023';end if;
 -- Confirmation hashes include the job context, not just the answers.
 prefix:=jsonb_build_array(jsonb_build_object('point',jsonb_build_object('title','Arbeidsopplysninger','fields','[]'::jsonb),'answer',jsonb_build_object('status','Ok','values',jsonb_build_object('order_number',ord,'work_site',site,'external_project',ext,'customer_name',customer))));
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
  insert into checklist_private.runs(id,company_id,created_by,definition,version_id,answers,order_number,work_site,external_project,customer_name,updated_identity)
   values(rid,p_company_id,auth.uid(),def,ver,clean_answers,ord,site,ext,customer,kshms_private.identity_snapshot(auth.uid())) returning * into r;
 else update checklist_private.runs set answers=clean_answers,order_number=ord,work_site=site,external_project=ext,customer_name=customer,revision=revision+1,updated_at=now(),updated_identity=kshms_private.identity_snapshot(auth.uid()) where id=rid returning * into r;end if;
 if p_action='complete' then update checklist_private.runs set status='completed',completed_at=now() where id=rid returning * into r;end if;
 insert into checklist_private.receipts values(p_request_id,p_company_id,auth.uid(),digest,jsonb_build_object('context',x,'record',to_jsonb(r)));
 return jsonb_build_object('context',x,'record',to_jsonb(r));
end $$;

create or replace function public.standalone_checklist_mail(p_company_id uuid,p_id uuid,p_revision bigint,p_request_id uuid,p_to text)
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
  if nullif(btrim(r.order_number),'') is null or nullif(btrim(r.work_site),'') is null then
   raise exception 'Sjekklisten må ha ordrenummer og arbeidssted/adresse før PDF kan sendes.' using errcode='22023';end if;
  if (select count(*) from checklist_private.mail_requests where company_id=p_company_id and actor_id=auth.uid() and created_at>now()-interval '1 hour')>=10 then raise exception 'Du kan sende høyst ti sjekklister per time.' using errcode='22023';end if;
  if r.revision<>p_revision then raise exception 'Sjekklisten er endret. Åpne lagret utgave før sending.' using errcode='PT409';end if;
  insert into checklist_private.mail_requests(id,company_id,actor_id,run_id,revision,recipient,snapshot)
   values(p_request_id,p_company_id,auth.uid(),p_id,p_revision,recipient,jsonb_build_object('record',to_jsonb(r),'company',public.work_profile_company_profile(p_company_id))) returning * into m;
 end if;
 if r.revision<>m.revision then raise exception 'Sjekklisten er endret. Sendingen er stoppet.' using errcode='PT409';end if;
 return jsonb_build_object('id',m.id,'sent',false,'snapshot',m.snapshot,'recipient',m.recipient,'created_at',m.created_at);
end $$;

-- Explicit UE write permission. Existing read grants stay read-only.
alter table bolig_private.quality_events alter column actor_id drop not null;
alter table bolig_private.quality_events add column partner_id uuid references bolig_private.partner_access(id);
alter table bolig_private.quality_events add constraint quality_actor_present check(actor_id is not null or partner_id is not null);
create index bolig_quality_partner on bolig_private.quality_events(partner_id);
create table bolig_private.partner_uploads(id uuid primary key,access_id uuid not null references bolig_private.partner_access(id),scope_id uuid not null,path text not null unique,name text not null,mime text not null,size bigint not null,sha256 text not null,registered boolean not null default false,created_at timestamptz not null default clock_timestamp());
create index bolig_partner_upload_access on bolig_private.partner_uploads(access_id);
alter table bolig_private.partner_uploads enable row level security;
revoke all on bolig_private.partner_uploads from public,anon,authenticated,service_role;

-- Broaden only private file formats, not access or mutation policies.
update storage.buckets set allowed_mime_types=allowed_mime_types||array['text/plain','text/csv','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] where id='bolig-documents';
do $patch$ declare body text;begin
 body:=pg_get_functiondef('public.bolig_document_access(text,boolean)'::regprocedure);
 if position('(pdf|jpg|png|webp)' in body)=0 then raise exception 'Missing document extensions';end if;
 execute replace(body,'(pdf|jpg|png|webp)','(pdf|jpg|png|webp|txt|csv|docx|xlsx)');
 body:=pg_get_functiondef('bolig_private.partners(uuid,uuid,text,jsonb)'::regprocedure);
 if position('not between 1 and 3' in body)=0 then raise exception 'Missing partner feature validation';end if;
 body:=replace(body,'not between 1 and 3','not between 1 and 4');
 body:=replace(body,$a$not in('progress','checklists','orders')$a$,$a$not in('progress','checklists','orders','quality_write')$a$);
 body:=replace(body,$a$   supplier:=trim$a$,$a$   if 'quality_write'=any(features) and (not 'checklists'=any(features) or coalesce(case when action='create' then payload->>'kind' else (select kind from bolig_private.partner_access where id=(payload->>'id')::uuid and root_id=root) end,'')<>'ue') then raise exception 'Utfylling og opplasting krever UE og Sjekklister.' using errcode='22023';end if;
   supplier:=trim$a$);execute body;
end$patch$;

create function bolig_private.partner_scopes(root uuid) returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title) order by title),'[]') from (
 select id,title from bolig_private.roots where id=root and not archived
 union all select id,name from bolig_private.blocks where root_id=root and not archived
 union all select u.id,e.address||' · '||u.number from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.root_id=root and not u.archived and not e.archived and not b.archived) s
$$;
revoke all on function bolig_private.partner_scopes(uuid) from public,anon,authenticated,service_role;

-- Reuse native answer validation verbatim. External identity is explicit and never
-- impersonates the issuer, an employee or a logged-in personal signature.
do $build$
declare body text;fragment text;start_at int;end_at int;
begin
 body:=pg_get_functiondef('kshms_private.checklist_sign_values(jsonb,jsonb,jsonb,jsonb)'::regprocedure);
 body:=replace(body,'kshms_private.checklist_sign_values(fields jsonb, vals jsonb, previous jsonb, prefix jsonb)','bolig_private.partner_sign_values(fields jsonb, vals jsonb, previous jsonb, prefix jsonb, pid uuid, identity text)');
 if position('partner_sign_values' in body)=0 then raise exception 'Missing signing contract';end if;
 body:=replace(body,$a$if auth.uid() is null then raise exception 'Logg inn for egen bekreftelse.' using errcode='42501';end if;$a$,'');
 body:=replace(body,'kshms_private.identity_snapshot(auth.uid())',$a$jsonb_build_object('name',identity,'via','partner_link','partner_id',pid)$a$);
 body:=replace(body,'auth.uid()','pid');execute body;
 body:=pg_get_functiondef('bolig_private.quality(uuid,uuid,uuid,text,bigint,jsonb)'::regprocedure);
 start_at:=position($a$if row->>'status'='completed' then$a$ in body);
 end_at:=position($a$   end if;
   select jsonb_agg(case when x->>'id'=rid::text then row else x end$a$ in body);
 if start_at=0 or end_at<=start_at then raise exception 'Missing native answer contract';end if;
 fragment:=substring(body from start_at for end_at-start_at);
 fragment:=regexp_replace(fragment,'\mrow\M','rec','g');
 fragment:=replace(fragment,'auth.uid()','null::uuid');
 fragment:=replace(fragment,'kshms_private.checklist_sign_values(coalesce(point->''fields'',''[]''),v,coalesce(old->''values'',''{}''),prefix)','bolig_private.partner_sign_values(coalesce(point->''fields'',''[]''),v,coalesce(old->''values'',''{}''),prefix,pid,identity)');
 execute 'create function bolig_private.partner_answers(d jsonb,rec jsonb,payload jsonb,identity text,pid uuid) returns jsonb language plpgsql set search_path='''' as $fn$ declare finished boolean;answers jsonb;point jsonb;answer jsonb;old jsonb;clean jsonb;v jsonb;prefix jsonb:=''[]'';now_at timestamptz:=clock_timestamp();begin '||fragment||' return rec||jsonb_build_object(''updated_partner_id'',pid,''completed_partner_id'',case when finished then pid end);end$fn$';
end$build$;
revoke all on function bolig_private.partner_sign_values(jsonb,jsonb,jsonb,jsonb,uuid,text),bolig_private.partner_answers(jsonb,jsonb,jsonb,text,uuid) from public,anon,authenticated,service_role;

create function bolig_private.partner_quality_view(p bolig_private.partner_access) returns jsonb language sql stable set search_path='' as $$
 select case when p.access_mode='project' and 'checklists'=any(p.features) then jsonb_build_object(
 'scopes',bolig_private.partner_scopes(p.root_id),
 'checks',(select coalesce(jsonb_agg(jsonb_build_object('scope_id',q.scope_id,'revision',q.revision,'record',x) order by x->>'at'),'[]') from bolig_private.quality_states q cross join lateral jsonb_array_elements(q.data->'checks') x where q.root_id=p.root_id and x->>'partner_id'=p.id::text and not coalesce((x->>'archived')::boolean,false) and exists(select 1 from jsonb_array_elements(bolig_private.partner_scopes(p.root_id)) s where s->>'id'=q.scope_id::text)),
 'documents',(select coalesce(jsonb_agg(jsonb_build_object('scope_id',q.scope_id,'revision',q.revision,'id',x->>'id','title',x->>'title','name',x->>'name','kind',x->>'kind','at',x->>'at') order by x->>'at'),'[]') from bolig_private.quality_states q cross join lateral jsonb_array_elements(q.data->'documents') x where q.root_id=p.root_id and x->>'partner_id'=p.id::text and exists(select 1 from jsonb_array_elements(bolig_private.partner_scopes(p.root_id)) s where s->>'id'=q.scope_id::text))) else null end
$$;
revoke all on function bolig_private.partner_quality_view(bolig_private.partner_access) from public,anon,authenticated,service_role;
do $patch$ declare body text;begin
 body:=pg_get_functiondef('bolig_private.partner_view(bolig_private.partner_access)'::regprocedure);
 if position($a$'checklists',$a$ in body)=0 then raise exception 'Missing partner projection';end if;
 execute replace(body,$a$'checklists',$a$,$a$'quality',bolig_private.partner_quality_view(p),'checklists',$a$);
end$patch$;

create function bolig_resident_private.partner_quality(token text,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare p bolig_private.partner_access%rowtype;root uuid;c uuid;scope uuid;d jsonb;row jsonb;source jsonb;nr bigint;rid uuid;request uuid;fp bytea;receipt bolig_private.partner_receipts%rowtype;up bolig_private.partner_uploads%rowtype;entry jsonb;identity text;ext text;result jsonb;
begin
 if token is null or token !~ '^[0-9a-f]{64}$' or action is null or action not in('check_add','check_save','file_prepare','file_get','file_authorize','document','authorize') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>500000 then raise exception 'Ugyldig UE-handling.' using errcode='42501';end if;
 select root_id into root from bolig_private.partner_access where token_hash=sha256(convert_to(token,'UTF8'));
 if root is null then raise exception 'Tilgangen er ikke tilgjengelig.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-catalog:'||root::text,0));
 select * into p from bolig_private.partner_access where token_hash=sha256(convert_to(token,'UTF8')) for update;
 if not bolig_private.partner_active(p) or p.access_mode<>'project' or not 'checklists'=any(p.features) then raise exception 'Tilgangen er stanset eller Sjekklister er ikke delt.' using errcode='42501';end if;
 select company_id into c from bolig_private.roots where id=root for update;
 if action='file_get' then
  select * into up from bolig_private.partner_uploads where id=(payload->>'id')::uuid and access_id=p.id and registered;
  if up.id is null or not exists(select 1 from jsonb_array_elements(bolig_private.partner_scopes(root)) s where s->>'id'=up.scope_id::text) then raise exception 'Filen er ikke delt med deg.' using errcode='42501';end if;
  return jsonb_build_object('path',up.path,'name',up.name,'mime',up.mime);
 end if;
 if p.kind<>'ue' or not 'quality_write'=any(p.features) then raise exception 'UE trenger rett til utfylling og opplasting.' using errcode='42501';end if;
 if action='authorize' then return jsonb_build_object('id',p.id);end if;
 scope:=(payload->>'scope_id')::uuid;rid:=(payload->>'id')::uuid;
 if scope is null or rid is null or not exists(select 1 from jsonb_array_elements(bolig_private.partner_scopes(root)) s where s->>'id'=scope::text) then raise exception 'Velg en aktiv leilighet, et bygg eller prosjektet.' using errcode='42501';end if;
 if action in('file_prepare','file_authorize') then
  select * into up from bolig_private.partner_uploads where id=rid;
  if action='file_authorize' then
   if up.id is null or up.access_id<>p.id or up.scope_id<>scope then raise exception 'Filen tilhører ikke din tilgang.' using errcode='42501';end if;
  else
   ext:=case payload->>'mime' when 'application/pdf' then 'pdf' when 'image/jpeg' then 'jpg' when 'image/png' then 'png' when 'image/webp' then 'webp' when 'text/plain' then 'txt' when 'text/csv' then 'csv' when 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' then 'docx' when 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' then 'xlsx' end;
   if ext is null or length(coalesce(payload->>'name','')) not between 1 and 180 or coalesce((payload->>'size')::bigint,0) not between 1 and 20971520 or coalesce(payload->>'sha256','') !~ '^[a-f0-9]{64}$' then raise exception 'Velg PDF, bilde, Word, Excel eller tekst på inntil 20 MB.' using errcode='22023';end if;
   if up.id is not null then
    if up.access_id<>p.id or up.scope_id<>scope or up.name<>payload->>'name' or up.mime<>payload->>'mime' or up.size<>(payload->>'size')::bigint or up.sha256<>payload->>'sha256' then raise exception 'Filen i forsøket er endret.' using errcode='PT409';end if;
   else
    if (select count(*) from bolig_private.partner_uploads where access_id=p.id)>=2000 then raise exception 'Filgrensen er nådd.' using errcode='22023';end if;
    insert into bolig_private.partner_uploads(id,access_id,scope_id,path,name,mime,size,sha256) values(rid,p.id,scope,c||'/'||root||'/'||scope||'/'||rid||'.'||ext,payload->>'name',payload->>'mime',(payload->>'size')::bigint,payload->>'sha256') returning * into up;
   end if;
  end if;
  return jsonb_build_object('id',up.id,'path',up.path,'mime',up.mime,'name',up.name,'registered',up.registered);
 end if;
 request:=(payload->>'request_id')::uuid;
 if request is null or payload ? 'required' then raise exception 'Ugyldig forsøk eller endring av interne krav.' using errcode='22023';end if;
 fp:=sha256(convert_to(jsonb_build_array(action,payload)::text,'UTF8'));
 select * into receipt from bolig_private.partner_receipts where root_id=root and actor=p.id::text and request_id=request;
 if found then
  if receipt.fingerprint<>fp then raise exception 'Forsøksreferansen er brukt til annet innhold.' using errcode='PT409';end if;
  return bolig_private.partner_view(p)||jsonb_build_object('saved_id',receipt.result->'saved_id');
 end if;
 select data,revision into d,nr from bolig_private.quality_states where root_id=root and scope_id=scope;
 d:=coalesce(d,'{"checks":[],"documents":[],"protocols":[],"fdv":{}}');nr:=coalesce(nr,0);
 if action='check_save' then
  select x into row from jsonb_array_elements(d->'checks') x where x->>'id'=rid::text and x->>'partner_id'=p.id::text and not coalesce((x->>'archived')::boolean,false);
  if row is null then raise exception 'Du kan bare endre egne utfyllinger.' using errcode='42501';end if;
  if (payload->>'revision')::bigint is distinct from nr then raise exception 'Dokumentasjonen er endret. Kladden er beholdt. Se over siste versjon.' using errcode='PT409';end if;
  -- Only the partner's own registered files may be attached, including direct calls.
  if exists(select 1 from jsonb_each(payload->'answers') a cross join lateral jsonb_array_elements_text(coalesce(a.value->'documents','[]')) ref where not exists(select 1 from jsonb_array_elements(d->'documents') doc where doc->>'id'=ref and doc->>'partner_id'=p.id::text)) then raise exception 'Velg egne lagrede vedlegg.' using errcode='42501';end if;
  identity:='UE-lenke: '||p.name||' · '||p.organisation;
  row:=bolig_private.partner_answers(d,row,payload,identity,p.id);
  select jsonb_agg(case when x->>'id'=rid::text then row else x end order by n) into result from jsonb_array_elements(d->'checks') with ordinality z(x,n);d:=jsonb_set(d,'{checks}',result);
 elsif action='check_add' then
  if jsonb_array_length(d->'checks')>=50 or exists(select 1 from jsonb_array_elements(d->'checks') x where x->>'id'=rid::text) then raise exception 'Kontrollen finnes allerede, eller området har 50 kontroller.' using errcode='PT409';end if;
  if payload ? 'source_id' then
   select x into source from bolig_private.quality_states q cross join lateral jsonb_array_elements(q.data->'checks') x where q.root_id=root and q.scope_id=(payload->>'source_scope_id')::uuid and x->>'id'=payload->>'source_id' and not coalesce((x->>'archived')::boolean,false) and exists(select 1 from jsonb_array_elements(bolig_private.partner_checklists(root)) v where v->>'id'=x->>'id' and v->>'scope_id'=q.scope_id::text);
   if source is null then raise exception 'Sjekklisten er ikke tilgjengelig.' using errcode='42501';end if;
   entry:=source->'definition';
  else entry:=kshms_private.checklist_content(payload->'content');if exists(select 1 from jsonb_array_elements(entry->'points') pt where nullif(pt->>'subform_version_id','') is not null) then raise exception 'Bruk prosjektets sjekkliste for faste underskjema.' using errcode='22023';end if;end if;
  identity:='UE-lenke: '||p.name||' · '||p.organisation;
  row:=jsonb_build_object('id',rid,'partner_id',p.id,'copy_check_id',payload->>'source_id','definition',entry,'status','draft','answers','{}'::jsonb,'required',false,'sequence',1,'by_name',identity,'at',clock_timestamp());
  d:=jsonb_set(d,'{checks}',d->'checks'||jsonb_build_array(row));
 else
  select * into up from bolig_private.partner_uploads where id=rid and access_id=p.id and scope_id=scope and not registered;
  if up.id is null or not exists(select 1 from storage.objects o where o.bucket_id='bolig-documents' and o.name=up.path) or length(trim(coalesce(payload->>'title',''))) not between 1 and 160 then raise exception 'Last opp filen og gi den en tittel først.' using errcode='22023';end if;
  if jsonb_array_length(d->'documents')>=200 then raise exception 'Inntil 200 filer per arbeidsområde.' using errcode='22023';end if;
  identity:='UE-lenke: '||p.name||' · '||p.organisation;
  entry:=jsonb_build_object('id',rid,'partner_id',p.id,'name',up.name,'title',trim(payload->>'title'),'path',up.path,'kind',case when up.mime like 'image/%' then 'photo' else 'document' end,'by_name',identity,'at',clock_timestamp());
  d:=jsonb_set(d,'{documents}',d->'documents'||jsonb_build_array(entry));update bolig_private.partner_uploads set registered=true where id=rid;
 end if;
 if octet_length(d::text)>1500000 then raise exception 'Arbeidsområdet har for mye dokumentasjon.' using errcode='22023';end if;
 nr:=nr+1;insert into bolig_private.quality_states(root_id,scope_id,revision,data) values(root,scope,nr,d) on conflict(root_id,scope_id) do update set revision=excluded.revision,data=excluded.data;
 insert into bolig_private.quality_events(root_id,scope_id,revision,action,actor_id,partner_id,actor_name,snapshot) values(root,scope,nr,'partner_'||action,null,p.id,identity,d);
 insert into bolig_private.partner_receipts values(root,p.id::text,request,fp,jsonb_build_object('saved_id',rid));
 return bolig_private.partner_view(p)||jsonb_build_object('saved_id',rid);
exception when raise_exception then raise exception '%',SQLERRM using errcode='22023';
end$$;
revoke all on function bolig_resident_private.partner_quality(text,text,jsonb) from public,service_role;
grant execute on function bolig_resident_private.partner_quality(text,text,jsonb) to anon,authenticated;
create function public.bolig_partner_quality(p_token text,p_action text,p_payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bolig_resident_private.partner_quality(p_token,p_action,p_payload)$$;
revoke all on function public.bolig_partner_quality(text,text,jsonb) from public,service_role;
grant execute on function public.bolig_partner_quality(text,text,jsonb) to anon,authenticated;
notify pgrst,'reload schema';

-- Native, scope-bound documentation. Original orders and published KS templates
-- stay immutable. All writes are revision-checked and retain full audit snapshots.
create table bolig_private.quality_states (
 root_id uuid not null references bolig_private.roots(id),scope_id uuid not null,
 revision bigint not null default 0,data jsonb not null default '{"checks":[],"documents":[],"protocols":[],"fdv":{}}',
 primary key(root_id,scope_id)
);
create table bolig_private.quality_events (
 id bigint generated always as identity primary key,root_id uuid not null,scope_id uuid not null,
 revision bigint not null,action text not null,actor_id uuid not null references auth.users(id),
 actor_name text not null,created_at timestamptz not null default clock_timestamp(),reason text not null default '',snapshot jsonb not null,
 foreign key(root_id,scope_id) references bolig_private.quality_states(root_id,scope_id),unique(root_id,scope_id,revision)
);
create index bolig_quality_events_actor on bolig_private.quality_events(actor_id);
alter table bolig_private.quality_states enable row level security;
alter table bolig_private.quality_events enable row level security;
revoke all on bolig_private.quality_states,bolig_private.quality_events from public,anon,authenticated,service_role;

create function bolig_private.quality_scope(c uuid,root uuid,scope uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb:=bolig_private.context(c);result jsonb;
begin
 if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) or not exists(select 1 from bolig_private.roots where id=root and company_id=c) then raise exception 'Boligprosjektet er ikke tilgjengelig i aktivt firma.' using errcode='42501';end if;
 select jsonb_build_object('kind',kind,'title',title) into result from (
 select 'project' kind,r.title from bolig_private.roots r where r.id=root and scope=root
 union all select 'block',b.name from bolig_private.blocks b where b.root_id=root and b.id=scope and not b.archived
 union all select 'unit',u.number||' · '||e.address from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.root_id=root and u.id=scope and not u.archived and not e.archived and not b.archived
 ) s;
 if result is null then raise exception 'Velg en aktiv bolig, et bygg eller prosjektet.' using errcode='42501';end if;
 return result||jsonb_build_object('context',ctx,'archived',(select archived from bolig_private.roots where id=root));
end$$;
revoke all on function bolig_private.quality_scope(uuid,uuid,uuid) from public,anon,authenticated,service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('bolig-documents','bolig-documents',false,20971520,array['application/pdf','image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create function public.bolig_document_access(object_name text,writing boolean default false) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare s jsonb;
begin
 if object_name !~ '^[a-f0-9-]{36}/[a-f0-9-]{36}/[a-f0-9-]{36}/[a-f0-9-]{36}[.](pdf|jpg|png|webp)$' then return false;end if;
 s:=bolig_private.quality_scope(split_part(object_name,'/',1)::uuid,split_part(object_name,'/',2)::uuid,split_part(object_name,'/',3)::uuid);
 return not writing or (s#>>'{context,role}'='manager' and not (s->>'archived')::boolean);
exception when invalid_text_representation or insufficient_privilege then return false;
end$$;
revoke all on function public.bolig_document_access(text,boolean) from public,anon,service_role;
grant execute on function public.bolig_document_access(text,boolean) to authenticated;
create policy bolig_documents_read on storage.objects for select to authenticated using(bucket_id='bolig-documents' and public.bolig_document_access(name,false));
create policy bolig_documents_insert on storage.objects for insert to authenticated with check(bucket_id='bolig-documents' and public.bolig_document_access(name,true));
-- No UPDATE or DELETE. Replacements are new versions; audit references never break.

-- FDV belongs to documentation, not the identity/quantity used by ordering.
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_private.catalog_content(jsonb,boolean)'::regprocedure);
 anchor:=$a$or not bolig_private.valid_product_url(coalesce(l->>'image_url',''))$a$;
 if position(anchor in body)=0 then raise exception 'Missing catalog URL validation anchor';end if;
 body:=replace(body,anchor,$a$or not bolig_private.valid_product_url(coalesce(l->>'fdv_url','')) or not bolig_private.valid_product_url(coalesce(l->>'image_url',''))$a$);
 anchor:=$a$'product_url',coalesce(l->>'product_url','')$a$;
 if position(anchor in body)=0 then raise exception 'Missing catalog FDV output anchor';end if;
 body:=replace(body,anchor,$a$'fdv_url',coalesce(l->>'fdv_url',''),'product_url',coalesce(l->>'product_url','')$a$);execute body;
 body:=pg_get_functiondef('bolig_private.catalog_legacy(uuid,uuid,text,bigint,jsonb)'::regprocedure);
 anchor:=$a$if not bolig_private.valid_product_url(coalesce(line->>'image_url',''))$a$;
 if position(anchor in body)=0 then raise exception 'Missing legacy FDV validation anchor';end if;
 body:=replace(body,anchor,$a$if not bolig_private.valid_product_url(coalesce(line->>'fdv_url','')) or not bolig_private.valid_product_url(coalesce(line->>'image_url',''))$a$);
 anchor:=$a$'product_url',coalesce(x->>'product_url','')$a$;
 if position(anchor in body)=0 then raise exception 'Missing package FDV anchor';end if;
 body:=replace(body,anchor,$a$'fdv_url',coalesce(x->>'fdv_url',''),'product_url',coalesce(x->>'product_url','')$a$);execute body;
end$patch$;

-- Current selected products, with their immutable choice revision. Explicit FDV
-- corrections are keyed by product identity and never rewrite a historical order.
create function bolig_private.fdv_rows(root uuid,scope uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('unit_id',u.id,'unit',u.number,'block',b.name,'choice_revision',v.revision,
 'key',md5(jsonb_build_object('key',g->>'key','name',g->>'name','sku',g->>'sku','quantity',g->'quantity','unit',g->>'unit')::text),
 'name',g->>'name','sku',g->>'sku','quantity',g->'quantity','unit_name',g->>'unit','room',g->>'room_name',
 'fdv_url',coalesce(q.data#>>array['fdv',md5(jsonb_build_object('key',g->>'key','name',g->>'name','sku',g->>'sku','quantity',g->'quantity','unit',g->>'unit')::text),'url'],g->>'fdv_url',''),
 'corrected',coalesce(q.data->'fdv','{}') ? md5(jsonb_build_object('key',g->>'key','name',g->>'name','sku',g->>'sku','quantity',g->'quantity','unit',g->>'unit')::text),
 'product_url',g->>'product_url') order by b.name,u.number,n),'[]')
 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id
 cross join lateral(select cv.* from bolig_private.choice_versions cv where cv.root_id=$1 and cv.unit_id=u.id order by cv.revision desc limit 1) v
 cross join lateral jsonb_array_elements(coalesce(v.snapshot->'goods','[]')) with ordinality x(g,n)
 left join bolig_private.quality_states q on q.root_id=$1 and q.scope_id=u.id
 where u.root_id=$1 and ($2=$1 or $2=b.id or $2=u.id) and not u.archived and not e.archived and not b.archived;
$$;
revoke all on function bolig_private.fdv_rows(uuid,uuid) from public,anon,authenticated,service_role;

create function bolig_private.quality_source(root uuid,scope uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare d jsonb;issues jsonb:='[]';r jsonb;n int;goods jsonb;
begin
 select data into d from bolig_private.quality_states where root_id=root and scope_id=scope;
 if d is null then return jsonb_build_object('basis',scope,'issues',issues);end if;
 select count(*) into n from jsonb_array_elements(d->'checks') x where not coalesce((x->>'archived')::boolean,false) and x->>'status'<>'completed';
 if n>0 then issues:=issues||jsonb_build_array(n||' sjekklister er ikke fullført i Boligprosjekter.');end if;
 select count(*) into n from jsonb_array_elements(d->'checks') x cross join lateral jsonb_each(x->'answers') a where not coalesce((x->>'archived')::boolean,false) and a.value->>'status'='Avvik';
 if n>0 then issues:=issues||jsonb_build_array(n||' åpne avvik i boligsjekklistene.');end if;
 select count(*) into n from jsonb_array_elements(d->'checks') x where not coalesce((x->>'archived')::boolean,false) and nullif(x->>'room_id','') is not null and not exists(select 1 from bolig_private.rooms room where room.id=(x->>'room_id')::uuid and room.unit_id=scope and room.root_id=root and not room.archived);
 if n>0 then issues:=issues||jsonb_build_array(n||' kontroller er knyttet til arkiverte rom. Avklar kontrollene før ferdigstilling.');end if;
 select count(*) into n from jsonb_array_elements(d->'protocols') x where not coalesce((x->>'superseded')::boolean,false) and x->'confirmation' is null;
 if n>0 then issues:=issues||jsonb_build_array(n||' eksterne protokoller mangler bekreftelse på retting.');end if;
 goods:=bolig_private.fdv_rows(root,scope);
 return jsonb_build_object('basis',md5(jsonb_build_object('data',d,'goods',goods)::text),'issues',issues);
end$$;
revoke all on function bolig_private.quality_source(uuid,uuid) from public,anon,authenticated,service_role;

create function bolig_private.quality_file(c uuid,root uuid,scope uuid,entry jsonb,rid uuid,identity text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
   if jsonb_typeof(entry) is distinct from 'object' or length(trim(coalesce(entry->>'name',''))) not between 1 and 180 or length(trim(coalesce(entry->>'title',''))) not between 1 and 160 or coalesce(entry->>'kind','') not in ('photo','document','protocol','fdv')
    or not starts_with(coalesce(entry->>'path',''),c::text||'/'||root::text||'/'||scope::text||'/') or not public.bolig_document_access(entry->>'path',true)
    or (entry->>'kind'='photo' and coalesce(entry->>'path','') !~ '[.](jpg|png|webp)$')
    or not exists(select 1 from storage.objects o where o.bucket_id='bolig-documents' and o.name=entry->>'path') then raise exception 'Last opp en fil i dette arbeidsområdet før du lagrer.' using errcode='22023';end if;
 return jsonb_build_object('id',rid,'name',entry->>'name','title',trim(entry->>'title'),'path',entry->>'path','kind',entry->>'kind','by',auth.uid(),'by_name',identity,'at',clock_timestamp());

end$$;
revoke all on function bolig_private.quality_file(uuid,uuid,uuid,jsonb,uuid,text) from public,anon,authenticated,service_role;

create function public.bolig_quality(p_company_id uuid,p_root_id uuid,p_scope_id uuid,p_action text default 'get',p_revision bigint default null,p_payload jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path='' as $$begin return bolig_private.quality(p_company_id,p_root_id,p_scope_id,p_action,p_revision,p_payload);end$$;
-- Function body resolves after the private implementation is created below.

create function bolig_private.quality(c uuid,root uuid,scope uuid,action text,expected bigint,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare s jsonb;ctx jsonb;d jsonb;nr bigint;entry jsonb;row jsonb;rid uuid;points jsonb;point jsonb;answers jsonb;answer jsonb;clean jsonb;prefix jsonb:='[]';old jsonb;f jsonb;v jsonb;identity text;reason text;room uuid;goods jsonb;templates jsonb;fdv_files jsonb;finished bool;now_at timestamptz:=clock_timestamp();version public.kshms_checklist_versions%rowtype;
begin
 if action is null or action not in ('get','history','check_add','check_save','check_reopen','check_archive','document','protocol_add','protocol_save','protocol_confirm','protocol_reopen','fdv_link') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>500000 then raise exception 'Ugyldig dokumentasjonshandling.' using errcode='22023';end if;
 if action not in ('get','history') then perform 1 from bolig_private.roots where id=root and company_id=c for update;end if;
 s:=bolig_private.quality_scope(c,root,scope);ctx:=s->'context';
 if action='history' then
  select snapshot into d from bolig_private.quality_events where root_id=root and scope_id=scope and revision=expected;
  if d is null then raise exception 'Dokumentasjonsutgaven finnes ikke.' using errcode='42501';end if;
  return s||jsonb_build_object('root_id',root,'scope_id',scope,'revision',expected,'data',d);
 end if;
 select data,revision into d,nr from bolig_private.quality_states where root_id=root and scope_id=scope;
 d:=coalesce(d,'{"checks":[],"documents":[],"protocols":[],"fdv":{}}');nr:=coalesce(nr,0);
 if action not in ('get','history') then
  if ctx->>'role'<>'manager' or (s->>'archived')::boolean then raise exception 'Prosjektleder og aktivt prosjekt kreves.' using errcode='42501';end if;
  if expected is distinct from nr then raise exception 'Dokumentasjonen er endret. Kladden er beholdt. Hent siste versjon og se over før lagring.' using errcode='PT409';end if;
  rid:=coalesce(nullif(payload->>'id','')::uuid,gen_random_uuid());reason:=trim(coalesce(payload->>'reason',''));
  select coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email) into identity from public.profiles p where p.id=auth.uid();
  if action in ('document','check_add','protocol_add') and (exists(select 1 from jsonb_array_elements(d->'checks') x where x->>'id'=rid::text) or exists(select 1 from jsonb_array_elements(d->'documents') x where x->>'id'=rid::text) or exists(select 1 from jsonb_array_elements(d->'protocols') x where x->>'id'=rid::text)) then raise exception 'Denne registreringen finnes allerede. Hent siste dokumentasjon før du prøver igjen.' using errcode='PT409';end if;
  if action='document' then
   entry:=bolig_private.quality_file(c,root,scope,payload->'file',rid,identity);
   if jsonb_array_length(d->'documents')>=200 or exists(select 1 from jsonb_array_elements(d->'documents') x where x->>'path'=entry->>'path') then raise exception 'Filen er allerede registrert, eller området har 200 filer.' using errcode='PT409';end if;
   d:=jsonb_set(d,'{documents}',d->'documents'||jsonb_build_array(entry));
  elsif action='check_add' then
   if jsonb_array_length(d->'checks')>=50 then raise exception 'Inntil 50 kontroller per arbeidsområde.' using errcode='22023';end if;
   room:=nullif(payload->>'room_id','')::uuid;
   if room is not null and not exists(select 1 from bolig_private.rooms where id=room and unit_id=scope and root_id=root and not archived) then raise exception 'Velg et aktivt rom i denne boligen.' using errcode='22023';end if;
   if nullif(payload->>'version_id','') is not null then
    if not exists(select 1 from public.company_module_access where company_id=c and module_key='kshms' and enabled) then raise exception 'Firmaets sjekklistebibliotek er ikke aktivert.' using errcode='42501';end if;
    select v.* into version from public.kshms_checklist_versions v join public.kshms_checklist_templates t on t.id=v.template_id and t.company_id=c where v.id=(payload->>'version_id')::uuid and v.company_id=c and not t.archived and v.number=(select max(v2.number) from public.kshms_checklist_versions v2 where v2.template_id=v.template_id and v2.company_id=c);
    if version.id is null then raise exception 'Malutgaven er ikke tilgjengelig i firmaet.' using errcode='42501';end if;
    clean:=version.content;
   else
    clean:=kshms_private.checklist_content(payload->'content');
    if exists(select 1 from jsonb_array_elements(clean->'points') p where nullif(p->>'subform_version_id','') is not null) then raise exception 'Hent en publisert firmamal for versjonsfaste underskjema.' using errcode='22023';end if;
   end if;
   entry:=jsonb_build_object('id',rid,'definition',clean,'source_version_id',version.id,'source_hash',version.content_hash,'source_number',version.number,'room_id',room,'status','draft','answers','{}'::jsonb,'sequence',1,'by_name',identity,'at',now_at);
   d:=jsonb_set(d,'{checks}',d->'checks'||jsonb_build_array(entry));
  elsif action in ('check_save','check_reopen','check_archive') then
   select x into row from jsonb_array_elements(d->'checks') x where x->>'id'=rid::text and not coalesce((x->>'archived')::boolean,false);
   if row is null then raise exception 'Kontrollen er ikke tilgjengelig.' using errcode='42501';end if;
   if action in ('check_reopen','check_archive') then
    if length(reason) not between 3 and 2000 then raise exception 'Beskriv hvorfor kontrollen gjenåpnes eller arkiveres.' using errcode='22023';end if;
    if action='check_reopen' then
     if row->>'status'<>'completed' then raise exception 'Kontrollen er allerede åpen.' using errcode='PT409';end if;
     row:=row||jsonb_build_object('status','draft','sequence',(row->>'sequence')::int+1,'completed_by',null,'completed_at',null,'reason',reason);
    else row:=row||jsonb_build_object('archived',true,'reason',reason);end if;
   else
    if row->>'status'='completed' then raise exception 'Gjenåpne kontrollen med en begrunnelse først.' using errcode='PT409';end if;
    if jsonb_typeof(payload->'answers') is distinct from 'object' or jsonb_typeof(payload->'complete') is distinct from 'boolean' then raise exception 'Kontroller svarene før lagring.' using errcode='22023';end if;
    finished:=(payload->>'complete')::boolean;answers:='{}';
    for point in select value from jsonb_array_elements(row#>'{definition,points}') loop
     answer:=coalesce(payload->'answers'->(point->>'id'),'{}');old:=coalesce(row->'answers'->(point->>'id'),'{}');
     if coalesce(answer->>'status','') not in ('','OK','Avvik','Ikke aktuelt','Lukket avvik') or coalesce(length(answer->>'comment'),0)>4000 or (point->'allow_na'='false'::jsonb and answer->>'status'='Ikke aktuelt') then raise exception 'Kontroller svar og kommentar: %',point->>'title' using errcode='22023';end if;
     if old->>'status'='Avvik' and coalesce(answer->>'status','') not in ('Avvik','Lukket avvik') then raise exception 'Lukk avviket med en beskrivelse av rettingen.' using errcode='22023';end if;
     clean:=jsonb_build_object('status',coalesce(answer->>'status',''),'comment',coalesce(answer->>'comment',''),'documents',coalesce(answer->'documents','[]'));
     if jsonb_typeof(clean->'documents')<>'array' or jsonb_array_length(clean->'documents')>20 or exists(select 1 from jsonb_array_elements_text(clean->'documents') ref where not exists(select 1 from jsonb_array_elements(d->'documents') doc where doc->>'id'=ref)) then raise exception 'Vedlegg må være lagret i dette arbeidsområdet.' using errcode='22023';end if;
     if answer->>'status'='Lukket avvik' then
      if old->>'status' not in ('Avvik','Lukket avvik') or length(trim(coalesce(answer->>'comment','')))<3 then raise exception 'Lagre avviket først. Beskriv rettingen når det lukkes.' using errcode='22023';end if;
      clean:=clean||case when old->>'status'='Lukket avvik' and old->>'comment'=answer->>'comment' then jsonb_build_object('rectified_by',old->'rectified_by','rectified_at',old->'rectified_at') else jsonb_build_object('rectified_by',auth.uid(),'rectified_at',now_at) end;
     end if;
     v:=kshms_private.checklist_values(coalesce(point->'fields','[]'),coalesce(answer->'values','{}'),finished);
     v:=kshms_private.checklist_sign_values(coalesce(point->'fields','[]'),v,coalesce(old->'values','{}'),prefix);
     clean:=clean||jsonb_build_object('values',v);prefix:=kshms_private.checklist_prefix_add(prefix,point,clean);answers:=answers||jsonb_build_object(point->>'id',clean);
     if finished and (clean->>'status'='' or point->'comment_required'='true'::jsonb and length(trim(clean->>'comment'))<3 or point->'image_required'='true'::jsonb and not exists(select 1 from jsonb_array_elements(d->'documents') doc where doc->>'kind'='photo' and clean->'documents' ? (doc->>'id'))) then raise exception 'Svar og legg ved påkrevd dokumentasjon: %',point->>'title' using errcode='22023';end if;
    end loop;
    if exists(select 1 from jsonb_object_keys(payload->'answers') key where not exists(select 1 from jsonb_array_elements(row#>'{definition,points}') p where p->>'id'=key)) then raise exception 'Svaret tilhører ikke denne kontrollen.' using errcode='22023';end if;
    row:=row||jsonb_build_object('answers',answers,'status',case when finished then 'completed' else 'draft' end,'completed_by',case when finished then auth.uid() end,'completed_at',case when finished then now_at end,'completed_by_name',case when finished then identity end,'updated_by_name',identity,'updated_at',now_at);
   end if;
   select jsonb_agg(case when x->>'id'=rid::text then row else x end order by n) into points from jsonb_array_elements(d->'checks') with ordinality q(x,n);d:=jsonb_set(d,'{checks}',points);
  elsif action='fdv_link' then
   if s->>'kind'<>'unit' or not exists(select 1 from jsonb_array_elements(bolig_private.fdv_rows(root,scope)) g where g->>'key'=payload->>'key') or not bolig_private.valid_product_url(coalesce(payload->>'url','')) or length(reason) not between 3 and 2000 then raise exception 'Velg en aktuell vare, bruk en HTTPS-lenke og beskriv endringen.' using errcode='22023';end if;
   select g into row from jsonb_array_elements(bolig_private.fdv_rows(root,scope)) g where g->>'key'=payload->>'key';
   d:=jsonb_set(d,array['fdv'],(d->'fdv')||jsonb_build_object(payload->>'key',jsonb_build_object('product',row->>'name','url',coalesce(payload->>'url',''),'reason',reason,'by',auth.uid(),'by_name',identity,'at',now_at)));
  else
   if action='protocol_add' then
    if nullif(payload#>>'{file,path}','') is not null then
     entry:=bolig_private.quality_file(c,root,scope,(payload->'file')||jsonb_build_object('kind','protocol','title',payload->>'title'),gen_random_uuid(),identity);
     if jsonb_array_length(d->'documents')>=200 then raise exception 'Inntil 200 filer per arbeidsområde.' using errcode='22023';end if;
     d:=jsonb_set(d,'{documents}',d->'documents'||jsonb_build_array(entry));payload:=payload||jsonb_build_object('document_id',entry->>'id');
    end if;
    if jsonb_array_length(d->'protocols')>=50 or length(trim(coalesce(payload->>'title',''))) not between 1 and 160 or not exists(select 1 from jsonb_array_elements(d->'documents') doc where doc->>'id'=payload->>'document_id' and doc->>'kind'='protocol') then raise exception 'Last opp protokollen og gi den et navn først.' using errcode='22023';end if;
    if nullif(payload->>'replaces','') is not null then
     if length(reason) not between 3 and 2000 or not exists(select 1 from jsonb_array_elements(d->'protocols') p where p->>'id'=payload->>'replaces' and not coalesce((p->>'superseded')::boolean,false)) then raise exception 'Velg gjeldende protokoll og beskriv hvorfor ny utgave brukes.' using errcode='22023';end if;
     select jsonb_agg(case when x->>'id'=payload->>'replaces' then x||jsonb_build_object('superseded',true,'replaced_by',rid) else x end order by n) into points from jsonb_array_elements(d->'protocols') with ordinality q(x,n);d:=jsonb_set(d,'{protocols}',points);
    end if;
    row:=jsonb_build_object('id',rid,'title',trim(payload->>'title'),'document_id',payload->>'document_id','remarks','[]'::jsonb,'no_remarks','','at',now_at,'by_name',identity);
   else
    select x into row from jsonb_array_elements(d->'protocols') x where x->>'id'=rid::text and not coalesce((x->>'superseded')::boolean,false);
    if row is null then raise exception 'Protokollen er ikke tilgjengelig.' using errcode='42501';end if;
   end if;
   if action='protocol_reopen' then
    if row->'confirmation' is null or length(reason) not between 3 and 2000 then raise exception 'Beskriv hvorfor bekreftelsen gjenåpnes.' using errcode='22023';end if;
    row:=(row-'confirmation')||jsonb_build_object('reopen_reason',reason);
   elsif action='protocol_confirm' then
    if row->'confirmation' is not null then raise exception 'Protokollen er allerede bekreftet.' using errcode='PT409';end if;
    if length(reason) not between 3 and 4000 or (jsonb_array_length(row->'remarks')=0 and length(row->>'no_remarks')<3) or exists(select 1 from jsonb_array_elements(row->'remarks') x where x->'rectified'<>'true'::jsonb) then raise exception 'Kontroller alle merknader, beskriv rettingen og skriv en samlet bekreftelse.' using errcode='22023';end if;
    row:=row||jsonb_build_object('confirmation',jsonb_build_object('id',gen_random_uuid(),'by',auth.uid(),'by_name',identity,'at',now_at,'note',reason));
   else
    if row->'confirmation' is not null then raise exception 'Gjenåpne bekreftelsen før du endrer merknader.' using errcode='PT409';end if;
    if jsonb_typeof(payload->'remarks') is distinct from 'array' or jsonb_array_length(payload->'remarks')>100 or coalesce(length(payload->>'no_remarks'),0)>2000 then raise exception 'Bruk inntil 100 merknader.' using errcode='22023';end if;
    points:='[]';
    for point in select value from jsonb_array_elements(payload->'remarks') loop
     if length(trim(coalesce(point->>'text',''))) not between 1 and 2000 or jsonb_typeof(point->'rectified') is distinct from 'boolean' or coalesce(length(point->>'evidence'),0)>4000 or point->'rectified'='true'::jsonb and length(trim(coalesce(point->>'evidence','')))<3 then raise exception 'Beskriv hver merknad og dokumenter det som er rettet.' using errcode='22023';end if;
     clean:=jsonb_build_object('id',(point->>'id')::uuid,'text',trim(point->>'text'),'rectified',point->'rectified','evidence',coalesce(point->>'evidence',''),'documents',coalesce(point->'documents','[]'));
     if clean->>'id' is null or exists(select 1 from jsonb_array_elements(points) p where p->>'id'=clean->>'id') or jsonb_typeof(clean->'documents')<>'array' or jsonb_array_length(clean->'documents')>20 or exists(select 1 from jsonb_array_elements_text(clean->'documents') ref where not exists(select 1 from jsonb_array_elements(d->'documents') doc where doc->>'id'=ref)) then raise exception 'Kontroller merknads-ID og lagrede vedlegg.' using errcode='22023';end if;
     points:=points||jsonb_build_array(clean);
    end loop;
    row:=row||jsonb_build_object('remarks',points,'no_remarks',trim(coalesce(payload->>'no_remarks','')));
   end if;
   if action='protocol_add' then d:=jsonb_set(d,'{protocols}',d->'protocols'||jsonb_build_array(row));
   else select jsonb_agg(case when x->>'id'=rid::text then row else x end order by n) into points from jsonb_array_elements(d->'protocols') with ordinality q(x,n);d:=jsonb_set(d,'{protocols}',points);end if;
  end if;
  if octet_length(d::text)>1500000 then raise exception 'Arbeidsområdet har for mye dokumentasjon. Fordel dokumenter på boliger og bygg.' using errcode='22023';end if;
  nr:=nr+1;insert into bolig_private.quality_states(root_id,scope_id,revision,data) values(root,scope,nr,d) on conflict(root_id,scope_id) do update set revision=excluded.revision,data=excluded.data;
  insert into bolig_private.quality_events(root_id,scope_id,revision,action,actor_id,actor_name,reason,snapshot) values(root,scope,nr,action,auth.uid(),identity,reason,d);
 end if;
 if exists(select 1 from public.company_module_access where company_id=c and module_key='kshms' and enabled) then
  select coalesce(jsonb_agg(to_jsonb(tpl) order by tpl.content->>'title'),'[]') into templates from (select distinct on (cv.template_id) cv.id,cv.template_id,cv.number,cv.content,cv.content_hash from public.kshms_checklist_versions cv join public.kshms_checklist_templates t on t.id=cv.template_id and t.company_id=c where cv.company_id=c and not t.archived order by cv.template_id,cv.number desc) tpl;
 else templates:='[]';end if;
 goods:=bolig_private.fdv_rows(root,scope);
 fdv_files:=coalesce((select jsonb_agg(doc||jsonb_build_object('scope_id',q.scope_id,'scope_title',case when q.scope_id=root then (select title from bolig_private.roots where id=root) else coalesce((select number from bolig_private.units where id=q.scope_id),(select name from bolig_private.blocks where id=q.scope_id)) end) order by q.scope_id,doc->>'title') from bolig_private.quality_states q cross join lateral jsonb_array_elements(q.data->'documents') doc where q.root_id=root and doc->>'kind'='fdv' and (q.scope_id=scope or exists(select 1 from bolig_private.units u join bolig_private.entrances e on e.id=u.entrance_id join bolig_private.blocks b on b.id=e.block_id where u.root_id=root and not u.archived and not e.archived and not b.archived and u.id=q.scope_id and (scope=root or scope=b.id)) or scope=root and exists(select 1 from bolig_private.blocks b where b.id=q.scope_id and b.root_id=root and not b.archived))),'[]');
 return s||jsonb_build_object('root_id',root,'scope_id',scope,'revision',nr,'data',d,'fdv',goods,'templates',templates,
 'rooms',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name) order by name) from bolig_private.rooms where root_id=root and unit_id=scope and not archived),'[]'),
 'history',coalesce((select jsonb_agg(to_jsonb(h) order by h.revision desc) from(select revision,action,actor_name,created_at,reason from bolig_private.quality_events where root_id=root and scope_id=scope order by revision desc limit 100) h),'[]'),
 'fdv_documents',fdv_files,
 'basis',md5(jsonb_build_object('data',d,'goods',goods,'files',fdv_files)::text));
end$$;
revoke all on function bolig_private.quality(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function bolig_private.quality(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;
revoke all on function public.bolig_quality(uuid,uuid,uuid,text,bigint,jsonb) from public,anon,service_role;
grant execute on function public.bolig_quality(uuid,uuid,uuid,text,bigint,jsonb) to authenticated;

-- Native controls are part of the completion basis at every level. Optional
-- linked single-project data remains an additional source, never a prerequisite.
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_private.completion_tree(uuid,uuid)'::regprocedure);
 anchor:=$a$  select coalesce(jsonb_agg(value order by value->>'scope_id'),'[]') into child$a$;
 if position(anchor in body)=0 then raise exception 'Missing native completion anchor';end if;
 body:=replace(body,anchor,$a$  src:=src||jsonb_build_object('basis',md5((src->>'basis')||(bolig_private.quality_source(root,r.scope_id)->>'basis')),'issues',(src->'issues')||(bolig_private.quality_source(root,r.scope_id)->'issues'));
  select coalesce(jsonb_agg(value order by value->>'scope_id'),'[]') into child$a$);
 body:=replace(body,$a$(r.kind<>'unit' or item->>'basis'=proof)$a$,$a$(item->>'basis'=proof)$a$);execute body;
end$patch$;

notify pgrst,'reload schema';

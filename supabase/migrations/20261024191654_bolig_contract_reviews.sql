-- Private, immutable text snapshots and review proposals. Existing originals,
-- authorizers, portals, exports and task/reminder engines stay unchanged.
-- Text is browser-prepared and attributed to its submitting manager. Results
-- are manager-submitted work proposals, not provider attestations or approvals.
-- Citation matching verifies the saved text snapshot, not OCR accuracy in a scan.
create table bolig_private.contract_texts(
 id uuid primary key,file_id uuid not null references bolig_private.contract_files(id),
 root_id uuid not null references bolig_private.roots(id),pages jsonb not null,
 created_by uuid not null references auth.users(id),created_at timestamptz not null default now());
create index bolig_contract_texts_file on bolig_private.contract_texts(file_id,created_at desc,id);
create index bolig_contract_texts_root on bolig_private.contract_texts(root_id);
create index bolig_contract_texts_actor on bolig_private.contract_texts(created_by);
create table bolig_private.contract_reviews(
 id uuid primary key,root_id uuid not null references bolig_private.roots(id),text_ids uuid[] not null,
 question text not null default '',state text not null check(state in('running','ready','failed')),
 result jsonb,created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),
 finished_at timestamptz,check((state='ready')=(result is not null)));
create index bolig_contract_reviews_root on bolig_private.contract_reviews(root_id,created_at desc);
create index bolig_contract_reviews_actor on bolig_private.contract_reviews(created_by);
alter table bolig_private.contract_texts enable row level security;
alter table bolig_private.contract_reviews enable row level security;
revoke all on bolig_private.contract_texts,bolig_private.contract_reviews from public,anon,authenticated,service_role;

create function bolig_private.contract_review_workspace(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare access jsonb;ctx jsonb;ident uuid;fid uuid;ids uuid[];item jsonb;ref jsonb;page jsonb;
 saved_text bolig_private.contract_texts%rowtype;j bolig_private.contract_reviews%rowtype;
 result jsonb;query text;total bigint;pos integer;quote text;
begin
 access:=bolig_private.contract_workspace(c,root,'get','{}');ctx:=access->'context';
 if not coalesce((access->>'allowed')::boolean,false) then raise exception 'Privat kontraktstilgang kreves.' using errcode='42501';end if;
 if action is null or action not in('get','text','search','save_text','begin','finish','fail','review')
  or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>1200000 then raise exception 'Ugyldig kontraktsgjennomgang.' using errcode='22023';end if;
 if action in('save_text','begin','finish','fail') and not coalesce((access->>'manage')::boolean,false) then raise exception 'Kontraktsadministrator og aktivt prosjekt kreves.' using errcode='42501';end if;
 if action='save_text' then
  if exists(select 1 from jsonb_object_keys(payload) k where k not in('id','file_id','pages')) then raise exception 'Ukjente tekstfelt.' using errcode='22023';end if;
  ident:=(payload->>'id')::uuid;fid:=(payload->>'file_id')::uuid;
  perform bolig_private.contract_workspace(c,root,'file',jsonb_build_object('id',fid));
  if ident is null or jsonb_typeof(payload->'pages') is distinct from 'array' or jsonb_array_length(payload->'pages') not between 1 and 200 then raise exception 'Dokumentet må ha 1–200 sider.' using errcode='22023';end if;
  pos:=0;
  for page in select value from jsonb_array_elements(payload->'pages') loop
   pos:=pos+1;
   if jsonb_typeof(page) is distinct from 'object' or exists(select 1 from jsonb_object_keys(page) k where k not in('number','text','method','confidence'))
    or (page->>'number')::integer is distinct from pos or jsonb_typeof(page->'text') is distinct from 'string'
    or length(page->>'text')>50000 or (page->>'text')~'[\x01-\x08\x0B\x0C\x0E-\x1F]'
    or page->>'method' is null or page->>'method' not in('pdf','ocr')
    or (page->>'method'='ocr' and (jsonb_typeof(page->'confidence') is distinct from 'number' or (page->>'confidence')::numeric not between 0 and 100))
    or (page->>'method'='pdf' and page->'confidence' is distinct from 'null'::jsonb)
    then raise exception 'Ugyldig side eller tekstkvalitet.' using errcode='22023';end if;
  end loop;
  select * into saved_text from bolig_private.contract_texts where id=ident;
  if found then
   if saved_text.root_id<>root or saved_text.file_id<>fid or saved_text.pages is distinct from payload->'pages' then raise exception 'Tekstforsøket har et annet grunnlag.' using errcode='PT409';end if;
  else
   if (select count(*) from bolig_private.contract_texts where file_id=fid)>=20 then raise exception 'Tekstgrensen for denne filversjonen er nådd.' using errcode='22023';end if;
   insert into bolig_private.contract_texts(id,file_id,root_id,pages,created_by) values(ident,fid,root,payload->'pages',auth.uid()) returning * into saved_text;
  end if;
  result:=to_jsonb(saved_text);
 elsif action='text' then
  select * into saved_text from bolig_private.contract_texts where id=(payload->>'id')::uuid and root_id=root;
  if not found then raise exception 'Teksten er ikke tilgjengelig.' using errcode='42501';end if;
  result:=to_jsonb(saved_text);
 elsif action='search' then
  query:=trim(payload->>'query');
  if query is null or length(query) not between 2 and 160 then raise exception 'Skriv 2–160 tegn.' using errcode='22023';end if;
  result:=jsonb_build_object('matches',coalesce((select jsonb_agg(v) from (
   select t.id text_id,p.value->'number' page,p.value->>'text' text,p.value->>'method' method,p.value->'confidence' confidence,
    d.title,bolig_private.contract_file_json(f) file
   from bolig_private.contract_documents d join bolig_private.contract_files f on f.document_id=d.id and f.version=d.revision
   join lateral(select * from bolig_private.contract_texts t2 where t2.file_id=f.id order by created_at desc,id desc limit 1)t on true
   cross join lateral jsonb_array_elements(t.pages)p
   where d.root_id=root and strpos(lower(p.value->>'text'),lower(query))>0 order by d.title,(p.value->>'number')::integer limit 50)v),'[]'));
 elsif action='begin' then
  if exists(select 1 from jsonb_object_keys(payload) k where k not in('id','text_ids','question')) then raise exception 'Ukjente analysefelt.' using errcode='22023';end if;
  ident:=(payload->>'id')::uuid;query:=trim(coalesce(payload->>'question',''));
  if ident is null or jsonb_typeof(payload->'text_ids') is distinct from 'array' or jsonb_array_length(payload->'text_ids') not between 1 and 10 or length(query)>500 then raise exception 'Velg 1–10 lesbare dokumentversjoner og et kort spørsmål.' using errcode='22023';end if;
  select array_agg(value::uuid order by n) into ids from jsonb_array_elements_text(payload->'text_ids') with ordinality a(value,n);
  if cardinality(ids)<>(select count(distinct x) from unnest(ids)x) then raise exception 'Dupliserte dokumentversjoner.' using errcode='22023';end if;
  if (select count(*) from bolig_private.contract_texts where id=any(ids) and root_id=root)<>cardinality(ids) then raise exception 'Tekstgrunnlaget er ikke tilgjengelig.' using errcode='42501';end if;
  select sum(length(p.value->>'text')) into total from bolig_private.contract_texts t cross join lateral jsonb_array_elements(t.pages)p where t.id=any(ids);
  if total<40 or total>160000 then raise exception 'Velg lesbar tekst på inntil 160 000 tegn. Del opp gjennomgangen ved behov.' using errcode='22023';end if;
  select * into j from bolig_private.contract_reviews where id=ident;
  if found then
   if j.root_id<>root or j.text_ids<>ids or j.question<>query then raise exception 'Forsøket har et annet grunnlag.' using errcode='PT409';end if;
   if j.state<>'ready' then raise exception 'Forsøket er allerede startet. Hent status før et nytt forsøk.' using errcode='PT409';end if;
  else
   if exists(select 1 from bolig_private.contract_reviews where root_id=root and created_at>now()-interval '30 seconds') then raise exception 'Vent litt før du starter en ny gjennomgang.' using errcode='PT429';end if;
   if (select count(*) from bolig_private.contract_reviews where root_id=root and created_at>now()-interval '1 day')>=20 then raise exception 'Dagens grense på 20 gjennomganger er nådd for prosjektet.' using errcode='PT429';end if;
   insert into bolig_private.contract_reviews(id,root_id,text_ids,question,state,created_by) values(ident,root,ids,query,'running',auth.uid()) returning * into j;
  end if;
  result:=to_jsonb(j)||jsonb_build_object('sources',(select jsonb_agg(to_jsonb(t)||jsonb_build_object('file',bolig_private.contract_file_json(f),'title',d.title) order by array_position(ids,t.id))
   from bolig_private.contract_texts t join bolig_private.contract_files f on f.id=t.file_id join bolig_private.contract_documents d on d.id=f.document_id where t.id=any(ids)));
 elsif action in('finish','fail','review') then
  select * into j from bolig_private.contract_reviews where id=(payload->>'id')::uuid and root_id=root;
  if not found then raise exception 'Gjennomgangen er ikke tilgjengelig.' using errcode='42501';end if;
  if action in('finish','fail') and j.created_by<>auth.uid() then raise exception 'Forsøket tilhører en annen person.' using errcode='42501';end if;
  if action='finish' then
   result:=payload->'result';
   if j.state='ready' and j.result is distinct from result then raise exception 'Lagret gjennomgang kan ikke overskrives.' using errcode='PT409';end if;
   if j.state='failed' then raise exception 'Forsøket er avsluttet uten resultat.' using errcode='PT409';end if;
   if jsonb_typeof(result) is distinct from 'object' or octet_length(result::text)>100000
    or exists(select 1 from jsonb_object_keys(result) k where k not in('findings','not_found','limitations'))
    or jsonb_typeof(result->'findings') is distinct from 'array' or jsonb_array_length(result->'findings')>60
    or jsonb_typeof(result->'not_found') is distinct from 'array' or jsonb_array_length(result->'not_found')>20
    or jsonb_typeof(result->'limitations') is distinct from 'array' or jsonb_array_length(result->'limitations')>20 then raise exception 'Ugyldig analyseformat.' using errcode='22023';end if;
   for item in select value from jsonb_array_elements(result->'not_found') union all select value from jsonb_array_elements(result->'limitations') loop
    if jsonb_typeof(item) is distinct from 'string' or length(item#>>'{}') not between 1 and 500 then raise exception 'Ugyldig analysemerknad.' using errcode='22023';end if;
   end loop;
   for item in select value from jsonb_array_elements(result->'findings') loop
    if jsonb_typeof(item) is distinct from 'object' or exists(select 1 from jsonb_object_keys(item) k where k not in('kind','topic','title','explanation','sources'))
     or coalesce(item->>'kind','') not in('requirement','risk','uncertain') or coalesce(item->>'topic','') not in('delivery','deadline','payment','notification','documentation','change','guarantee','other')
     or length(coalesce(item->>'title','')) not between 1 and 160 or length(coalesce(item->>'explanation','')) not between 1 and 1200
     or jsonb_typeof(item->'sources') is distinct from 'array' or jsonb_array_length(item->'sources') not between 1 and 6 then raise exception 'Et funn mangler gyldig kilde.' using errcode='22023';end if;
    for ref in select value from jsonb_array_elements(item->'sources') loop
     if jsonb_typeof(ref) is distinct from 'object' or exists(select 1 from jsonb_object_keys(ref) k where k not in('text_id','page','quote')) then raise exception 'Ugyldig kilde.' using errcode='22023';end if;
     ident:=(ref->>'text_id')::uuid;pos:=(ref->>'page')::integer;quote:=ref->>'quote';
     if ident is null or not ident=any(j.text_ids) or pos is null or pos<1 or length(coalesce(quote,'')) not between 8 and 800 then raise exception 'Kilden er utenfor gjennomgangen.' using errcode='22023';end if;
     select p.value into page from bolig_private.contract_texts t cross join lateral jsonb_array_elements(t.pages)p where t.id=ident and (p.value->>'number')::integer=pos;
     if page is null or strpos(lower(regexp_replace(page->>'text','\s+',' ','g')),lower(regexp_replace(quote,'\s+',' ','g')))=0 then raise exception 'Kildeutdraget finnes ikke på angitt side.' using errcode='22023';end if;
    end loop;
   end loop;
   update bolig_private.contract_reviews set state='ready',result=payload->'result',finished_at=coalesce(finished_at,now()) where id=j.id returning * into j;
  elsif action='fail' and j.state='running' then
   update bolig_private.contract_reviews set state='failed',finished_at=now() where id=j.id returning * into j;
  end if;
  result:=to_jsonb(j)||jsonb_build_object('sources',(select jsonb_agg(to_jsonb(t)||jsonb_build_object('file',bolig_private.contract_file_json(f),'title',d.title) order by array_position(j.text_ids,t.id))
   from bolig_private.contract_texts t join bolig_private.contract_files f on f.id=t.file_id join bolig_private.contract_documents d on d.id=f.document_id where t.id=any(j.text_ids)));
 else
  result:=jsonb_build_object('texts',coalesce((select jsonb_agg(v) from(select distinct on(file_id)id,file_id,created_at,jsonb_array_length(pages) page_count,
   (select count(*) from jsonb_array_elements(pages)p where length(trim(p->>'text'))<40 or (p->>'method'='ocr' and (p->>'confidence')::numeric<70)) uncertain_pages
   from bolig_private.contract_texts where root_id=root order by file_id,created_at desc,id desc)v),'[]'),
   'reviews',coalesce((select jsonb_agg(v) from(select id,text_ids,question,state,created_by,created_at,finished_at from bolig_private.contract_reviews where root_id=root order by created_at desc limit 30)v),'[]'));
 end if;
 return jsonb_build_object('context',ctx,'root_id',root,'data',result);
end$$;
revoke all on function bolig_private.contract_review_workspace(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.contract_review_workspace(uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_contract_review(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.contract_review_workspace(p_company_id,p_root_id,p_action,p_payload)$$;
revoke all on function public.bolig_contract_review(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_contract_review(uuid,uuid,text,jsonb) to authenticated;

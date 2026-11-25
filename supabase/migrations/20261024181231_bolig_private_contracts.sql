-- Separate contract originals and ACL. No ordinary project, portal, completion,
-- export or HR authorizer is modified. No existing data is copied.
create table bolig_private.contract_access(
 root_id uuid not null references bolig_private.roots(id), user_id uuid not null references auth.users(id),
 access_role text not null check(access_role in('none','reader','manager')), revision bigint not null default 1,
 changed_by uuid not null references auth.users(id),changed_at timestamptz not null default now(),primary key(root_id,user_id));
create index bolig_contract_access_user on bolig_private.contract_access(user_id,root_id);
create index bolig_contract_access_actor on bolig_private.contract_access(changed_by);
create table bolig_private.contract_documents(
 id uuid primary key,root_id uuid not null references bolig_private.roots(id),title text not null,
 kind text not null check(kind in('contract','attachment','addition')),revision bigint not null default 0,
 unique(id,root_id));
create index bolig_contract_documents_root on bolig_private.contract_documents(root_id);
create table bolig_private.contract_files(
 id uuid primary key,root_id uuid not null,document_id uuid not null,expected_revision bigint not null,
 request jsonb not null,name text not null,mime text not null,size_bytes bigint not null,
 sha256 text not null,object_path text not null unique,created_by uuid not null references auth.users(id),creator_label text not null,
 created_at timestamptz not null default now(),version bigint,ready_at timestamptz,
 foreign key(document_id,root_id) references bolig_private.contract_documents(id,root_id),
 unique(document_id,version),check((version is null)=(ready_at is null)));
create index bolig_contract_files_root on bolig_private.contract_files(root_id,document_id,version desc);
create index bolig_contract_files_actor on bolig_private.contract_files(created_by);
create table bolig_private.contract_events(
 id bigint generated always as identity primary key,root_id uuid not null references bolig_private.roots(id),
 actor_id uuid not null references auth.users(id),action text not null,entity_id uuid not null,
 revision bigint not null,created_at timestamptz not null default now());
create index bolig_contract_events_root on bolig_private.contract_events(root_id,id desc);
create index bolig_contract_events_actor on bolig_private.contract_events(actor_id);
alter table bolig_private.contract_access enable row level security;
alter table bolig_private.contract_documents enable row level security;
alter table bolig_private.contract_files enable row level security;
alter table bolig_private.contract_events enable row level security;
revoke all on bolig_private.contract_access,bolig_private.contract_documents,bolig_private.contract_files,bolig_private.contract_events from public,anon,authenticated,service_role;
revoke all on sequence bolig_private.contract_events_id_seq from public,anon,authenticated,service_role;

create function bolig_private.contract_file_json(f bolig_private.contract_files) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',f.id,'document_id',f.document_id,'version',f.version,'name',f.name,'mime',f.mime,
 'size_bytes',f.size_bytes,'sha256',f.sha256,'created_at',f.ready_at,'comment',f.request->>'comment',
 'created_by',f.created_by,'creator',f.creator_label)
$$;
revoke all on function bolig_private.contract_file_json(bolig_private.contract_files) from public,anon,authenticated,service_role;

create function bolig_private.contract_workspace(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;r bolig_private.roots%rowtype;role_name text;manager boolean;target uuid;expected bigint;
 a bolig_private.contract_access%rowtype;d bolig_private.contract_documents%rowtype;f bolig_private.contract_files%rowtype;
 doc uuid;fid uuid;title text;kind text;mime text;ext text;size bigint;sha text;filename text;result jsonb;role_to_set text;
begin
 ctx:=bolig_private.context(c);
 if auth.uid() is null or not coalesce((ctx->>'enabled')::boolean,false) then raise exception 'Boligtilgang kreves.' using errcode='42501';end if;
 select * into r from bolig_private.roots where id=root and company_id=c for share;
 if not found then raise exception 'Prosjektet er ikke tilgjengelig.' using errcode='42501';end if;
 if action is null or action not in('get','history','file','prepare','finish','grant') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>8000 then raise exception 'Ugyldig kontraktshandling.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('bolig-contract:'||root::text,0));
 ctx:=bolig_private.context(c);
 if not coalesce((ctx->>'enabled')::boolean,false) then raise exception 'Boligtilgangen er endret.' using errcode='42501';end if;
 -- Deliberately no firmaadmin/systemadmin/ordinary Bolig manager bypass.
 role_name:=case when r.created_by=auth.uid() and ctx->>'role'='manager' then 'manager'
  else coalesce((select access_role from bolig_private.contract_access where root_id=root and user_id=auth.uid()),'none') end;
 if role_name='none' then
  if action='get' then return jsonb_build_object('context',ctx,'root_id',root,'allowed',false);end if;
  raise exception 'Privat kontraktstilgang kreves.' using errcode='42501';
 end if;
 manager:=role_name='manager';
 if action in('prepare','finish','grant') then
  if not manager or r.archived then raise exception 'Kontraktsadministrator og aktivt prosjekt kreves.' using errcode='42501';end if;
 end if;
 if action='grant' then
  if exists(select 1 from jsonb_object_keys(payload) k where k not in('user_id','role','revision')) then raise exception 'Ukjente tilgangsfelt.' using errcode='22023';end if;
  target:=(payload->>'user_id')::uuid;role_to_set:=payload->>'role';expected:=(payload->>'revision')::bigint;
  if target is null or target=auth.uid() or target=r.created_by or role_to_set is null or role_to_set not in('none','reader','manager') then raise exception 'Velg en annen person og en gyldig rolle.' using errcode='22023';end if;
  if role_to_set<>'none' and not bolig_private.progress_member(c,target) then raise exception 'Velg en aktiv intern bruker med Bolig-tilgang i samme firma.' using errcode='42501';end if;
  if role_to_set='none' and not bolig_private.progress_member(c,target) and not exists(select 1 from bolig_private.contract_access where root_id=root and user_id=target) then raise exception 'Brukeren har ingen kontraktstilgang i dette prosjektet.' using errcode='42501';end if;
  select * into a from bolig_private.contract_access where root_id=root and user_id=target;
  if expected is distinct from coalesce(a.revision,0) then raise exception 'Tilgangen er endret. Hent siste oversikt.' using errcode='PT409';end if;
  insert into bolig_private.contract_access(root_id,user_id,access_role,revision,changed_by)
   values(root,target,role_to_set,coalesce(a.revision,0)+1,auth.uid())
   on conflict(root_id,user_id) do update set access_role=excluded.access_role,revision=excluded.revision,changed_by=excluded.changed_by,changed_at=now();
  insert into bolig_private.contract_events(root_id,actor_id,action,entity_id,revision) values(root,auth.uid(),'grant_'||role_to_set,target,coalesce(a.revision,0)+1);
 end if;
 if action='prepare' then
  if exists(select 1 from jsonb_object_keys(payload) k where k not in('id','document_id','revision','title','kind','name','mime','size','sha256','comment')) then raise exception 'Ukjente dokumentfelt.' using errcode='22023';end if;
  fid:=(payload->>'id')::uuid;doc:=(payload->>'document_id')::uuid;expected:=(payload->>'revision')::bigint;
  title:=trim(payload->>'title');kind:=payload->>'kind';filename:=payload->>'name';mime:=payload->>'mime';size:=(payload->>'size')::bigint;sha:=payload->>'sha256';
  ext:=case mime when 'application/pdf' then 'pdf' when 'image/jpeg' then 'jpg' when 'image/png' then 'png' end;
  if fid is null or doc is null or expected is null or expected<0 or title is null or length(title) not between 1 and 120
   or kind is null or kind not in('contract','attachment','addition') or ext is null or size is null or size not between 1 and 20971520
   or sha is null or sha!~'^[a-f0-9]{64}$' or filename is null or length(filename) not between 1 and 180
   or filename~'[[:cntrl:]/\\]' or lower(filename)!~('\.'||case ext when 'jpg' then '(jpg|jpeg)' else ext end||'$')
   or length(coalesce(payload->>'comment',''))>500 then raise exception 'Velg tittel og en gyldig PDF, JPG eller PNG på inntil 20 MB.' using errcode='22023';end if;
  select * into f from bolig_private.contract_files where id=fid;
  if found then
   if f.root_id<>root or f.created_by<>auth.uid() or f.request is distinct from payload then raise exception 'Opplastingsforsøket tilhører et annet grunnlag.' using errcode='PT409';end if;
  else
   select * into d from bolig_private.contract_documents where id=doc;
   if found and (d.root_id<>root or d.title<>title or d.kind<>kind) then raise exception 'Dokumentet eller tittelen er endret. Hent siste oversikt.' using errcode='PT409';end if;
   if expected is distinct from coalesce(d.revision,0) then raise exception 'En ny versjon finnes. Se siste versjon før ny opplasting.' using errcode='PT409';end if;
   if (select count(*) from bolig_private.contract_files where root_id=root)>=2000 or (select count(*) from bolig_private.contract_files where document_id=doc)>=100 then raise exception 'Versjonsgrensen er nådd.' using errcode='22023';end if;
   if d.id is null then
    if (select count(*) from bolig_private.contract_documents where root_id=root)>=200 then raise exception 'Dokumentgrensen er nådd.' using errcode='22023';end if;
    insert into bolig_private.contract_documents(id,root_id,title,kind) values(doc,root,title,kind);
   end if;
   insert into bolig_private.contract_files(id,root_id,document_id,expected_revision,request,name,mime,size_bytes,sha256,object_path,created_by,creator_label)
    values(fid,root,doc,expected,payload,filename,mime,size,sha,c::text||'/'||root::text||'/'||doc::text||'/'||fid::text||'.'||ext,auth.uid(),coalesce((select nullif(to_jsonb(p)->>'full_name','') from public.profiles p where p.id=auth.uid()),'Prosjektmedarbeider')) returning * into f;
  end if;
  return jsonb_build_object('context',ctx,'root_id',root,'id',f.id,'path',f.object_path,'ready',f.ready_at is not null);
 end if;
 if action in('finish','file') then
  if exists(select 1 from jsonb_object_keys(payload) k where k<>'id') then raise exception 'Ukjente filfelt.' using errcode='22023';end if;
  select * into f from bolig_private.contract_files where id=(payload->>'id')::uuid and root_id=root;
  if not found then raise exception 'Dokumentet er ikke tilgjengelig.' using errcode='42501';end if;
  if action='finish' then
   if f.created_by<>auth.uid() then raise exception 'Opplastingen tilhører en annen bruker.' using errcode='42501';end if;
   if f.ready_at is null then
    select * into d from bolig_private.contract_documents where id=f.document_id;
    if d.revision<>f.expected_revision then raise exception 'En kollega har lagret en ny versjon. Hent siste grunnlag.' using errcode='PT409';end if;
    if not exists(select 1 from storage.objects o where o.bucket_id='bolig-contracts' and o.name=f.object_path
     and (o.metadata->>'size')::bigint=f.size_bytes and o.metadata->>'mimetype'=f.mime) then raise exception 'Filen er ikke ferdig lagret. Prøv samme opplasting igjen.' using errcode='22023';end if;
    update bolig_private.contract_files set version=d.revision+1,ready_at=now() where id=f.id returning * into f;
    update bolig_private.contract_documents set revision=d.revision+1 where id=d.id;
    insert into bolig_private.contract_events(root_id,actor_id,action,entity_id,revision) values(root,auth.uid(),'upload',f.id,f.version);
   end if;
   return jsonb_build_object('context',ctx,'root_id',root,'receipt_id',f.id,'file',bolig_private.contract_file_json(f));
  end if;
  if f.ready_at is null then raise exception 'Dokumentet er ikke ferdig lagret.' using errcode='42501';end if;
  return jsonb_build_object('context',ctx,'root_id',root,'path',f.object_path,'file',bolig_private.contract_file_json(f));
 end if;
 if action='history' then
  doc:=(payload->>'document_id')::uuid;
  if not exists(select 1 from bolig_private.contract_documents where id=doc and root_id=root and revision>0) then raise exception 'Dokumentet er ikke tilgjengelig.' using errcode='42501';end if;
  return jsonb_build_object('context',ctx,'root_id',root,'document_id',doc,'versions',coalesce((select jsonb_agg(bolig_private.contract_file_json(v) order by v.version desc) from bolig_private.contract_files v where v.document_id=doc and v.root_id=root and v.ready_at is not null),'[]'));
 end if;
 return jsonb_build_object('context',ctx,'root_id',root,'allowed',true,'manage',manager and not r.archived,'owner_id',r.created_by,
  'documents',coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'title',v.title,'kind',v.kind,'revision',v.revision,'file',bolig_private.contract_file_json(f2)) order by case v.kind when 'contract' then 0 when 'addition' then 1 else 2 end,v.title,v.id)
   from bolig_private.contract_documents v join bolig_private.contract_files f2 on f2.document_id=v.id and f2.version=v.revision where v.root_id=root and v.revision>0),'[]'),
  'people',case when manager then coalesce((select jsonb_agg(jsonb_build_object('id',m.user_id,'name',coalesce(nullif(to_jsonb(p)->>'full_name',''),p.email),'role',coalesce(a2.access_role,'none'),'revision',coalesce(a2.revision,0),'active',bolig_private.progress_member(c,m.user_id),'owner',m.user_id=r.created_by) order by p.email)
    from public.sales_company_memberships m join public.profiles p on p.id=m.user_id left join bolig_private.contract_access a2 on a2.root_id=root and a2.user_id=m.user_id
    where m.company_id=c and (bolig_private.progress_member(c,m.user_id) or a2.user_id is not null)),'[]') else '[]'::jsonb end);
end$$;
revoke all on function bolig_private.contract_workspace(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.contract_workspace(uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_contracts(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.contract_workspace(p_company_id,p_root_id,p_action,p_payload)$$;
revoke all on function public.bolig_contracts(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_contracts(uuid,uuid,text,jsonb) to authenticated;

-- Originals can only pass through the authenticated Edge gateway. There are no
-- browser SELECT/INSERT/UPDATE/DELETE policies, public URLs or signed URL grants.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('bolig-contracts','bolig-contracts',false,20971520,array['application/pdf','image/jpeg','image/png']);
-- Restrictive fence also defeats any legacy permissive policy on other buckets.
-- For every existing bucket this expression is TRUE, preserving its own rules.
create policy bolig_contract_storage_fence on storage.objects as restrictive for all to anon,authenticated
 using(bucket_id<>'bolig-contracts') with check(bucket_id<>'bolig-contracts');

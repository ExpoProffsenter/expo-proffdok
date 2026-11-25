begin;
create table public.kshms_deviation_files(
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null,
 deviation_id uuid not null,
 name text not null check(length(name) between 1 and 200),
 object_name text not null unique,
 mime_type text not null,
 size_bytes bigint not null check(size_bytes between 1 and 10485760),
 uploaded_by uuid not null references public.profiles(id),
 uploaded_at timestamptz,
 created_at timestamptz not null default now(),
 foreign key(company_id,deviation_id) references public.kshms_deviations(company_id,id)
);
create index kshms_deviation_files_case on public.kshms_deviation_files(company_id,deviation_id,created_at,id);
create index kshms_deviation_files_uploader on public.kshms_deviation_files(uploaded_by);
alter table public.kshms_deviation_files enable row level security;
revoke all on public.kshms_deviation_files from public,anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('kshms-private','kshms-private',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
create function public.kshms_deviation_file_access(p_name text,p_write boolean default false) returns boolean language plpgsql stable security definer set search_path='' as $$
declare x jsonb;f public.kshms_deviation_files%rowtype;d public.kshms_deviations%rowtype;
begin
 x:=kshms_private.context();
 if not coalesce((x->>'enabled')::boolean,false) then return false;end if;
 select * into f from public.kshms_deviation_files where object_name=p_name and company_id=(x->>'company_id')::uuid;
 if f.id is null then return false;end if;
 select * into d from public.kshms_deviations where company_id=f.company_id and id=f.deviation_id;
 return kshms_private.deviation_visible(d,x) and case when p_write then f.uploaded_by=auth.uid() and f.uploaded_at is null and d.status<>'closed' else f.uploaded_at is not null end;
end $$;
create policy kshms_files_read on storage.objects for select to authenticated using(bucket_id='kshms-private' and public.kshms_deviation_file_access(name,false));
create policy kshms_files_insert on storage.objects for insert to authenticated with check(bucket_id='kshms-private' and public.kshms_deviation_file_access(name,true));
-- No object UPDATE/DELETE policies: files/history cannot be replaced after signing/closure.
create function public.kshms_deviation_file_command(p_company_id uuid,p_action text,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;d public.kshms_deviations%rowtype;f public.kshms_deviation_files%rowtype;o storage.objects%rowtype;extension text;object_name text;
begin
 x:=kshms_private.require_context(p_company_id);
 perform 1 from public.company_module_access where company_id=p_company_id and module_key='kshms' for update;
 x:=kshms_private.require_context(p_company_id);
 select * into d from public.kshms_deviations where id=(p_payload->>'deviation_id')::uuid and company_id=p_company_id for update;
 if d.id is null or not kshms_private.deviation_visible(d,x) then raise exception 'Case access denied' using errcode='42501';end if;
 if d.status='closed' then raise exception 'Closed case cannot receive files';end if;
 if p_action='reserve' then
  if (select count(*) from public.kshms_deviation_files where company_id=p_company_id and deviation_id=d.id)>=50 then raise exception 'Maximum 50 files per case';end if;
  extension:=case p_payload->>'mime_type' when 'application/pdf' then 'pdf' when 'image/jpeg' then 'jpg' when 'image/png' then 'png' when 'image/webp' then 'webp' when 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' then 'docx' when 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' then 'xlsx' else null end;
  if extension is null then raise exception 'Unsupported file type';end if;
  object_name:=p_company_id||'/'||d.id||'/'||gen_random_uuid()||'.'||extension;
  insert into public.kshms_deviation_files(company_id,deviation_id,name,object_name,mime_type,size_bytes,uploaded_by)
  values(p_company_id,d.id,trim(p_payload->>'name'),object_name,p_payload->>'mime_type',(p_payload->>'size_bytes')::bigint,auth.uid()) returning * into f;
 elsif p_action='commit' then
  select * into f from public.kshms_deviation_files where id=(p_payload->>'id')::uuid and company_id=p_company_id and deviation_id=d.id and uploaded_by=auth.uid() for update;
  if f.id is null then raise exception 'Reserved file access denied' using errcode='42501';end if;
  if f.uploaded_at is not null then return to_jsonb(f);end if;
  select * into o from storage.objects where bucket_id='kshms-private' and name=f.object_name;
  if o.id is null or (o.metadata->>'size')::bigint is distinct from f.size_bytes or o.metadata->>'mimetype' is distinct from f.mime_type then raise exception 'Upload missing or file metadata mismatch';end if;
  update public.kshms_deviation_files set uploaded_at=now() where id=f.id returning * into f;
  insert into public.kshms_deviation_events(company_id,deviation_id,actor_id,actor_identity,action,snapshot)
   values(p_company_id,d.id,auth.uid(),kshms_private.identity_snapshot(auth.uid()),'file',jsonb_build_object('name',f.name,'id',f.id,'size_bytes',f.size_bytes));
 else raise exception 'Unsupported file action';end if;
 return to_jsonb(f);
end $$;
create function public.kshms_deviation_files(p_company_id uuid,p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;d public.kshms_deviations%rowtype;
begin
 x:=kshms_private.require_context(p_company_id);
 select * into d from public.kshms_deviations where company_id=p_company_id and id=p_id;
 if d.id is null or not kshms_private.deviation_visible(d,x) then raise exception 'Case access denied' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(to_jsonb(f) order by created_at,id),'[]') from public.kshms_deviation_files f where company_id=p_company_id and deviation_id=p_id and uploaded_at is not null);
end $$;
revoke all on function public.kshms_deviation_file_access(text,boolean),public.kshms_deviation_file_command(uuid,text,jsonb),public.kshms_deviation_files(uuid,uuid) from public,anon;
grant execute on function public.kshms_deviation_file_access(text,boolean),public.kshms_deviation_file_command(uuid,text,jsonb),public.kshms_deviation_files(uuid,uuid) to authenticated;
commit;

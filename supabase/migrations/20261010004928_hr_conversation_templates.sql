-- Generic company questions only. Does not open private employee content.
create table hr_private.conversation_templates (
 id uuid primary key,
 company_id uuid not null references hr_private.firms(company_id) on delete cascade,
 revision integer not null check(revision>0),
 archived boolean not null default false,
 unique(company_id,id)
);
create index hr_conversation_templates_company on hr_private.conversation_templates(company_id,id);
create table hr_private.conversation_template_versions (
 company_id uuid not null,
 template_id uuid not null,
 revision integer not null check(revision>0),
 content jsonb not null,
 archived boolean not null,
 saved_by uuid references auth.users(id) on delete set null,
 saved_at timestamptz not null default now(),
 primary key(template_id,revision),
 foreign key(company_id,template_id) references hr_private.conversation_templates(company_id,id) on delete cascade
);
create index hr_conversation_template_versions_actor on hr_private.conversation_template_versions(saved_by);
alter table hr_private.conversation_templates enable row level security;
alter table hr_private.conversation_template_versions enable row level security;
revoke all on hr_private.conversation_templates,hr_private.conversation_template_versions from public,anon,authenticated,service_role;

create function hr_private.validate_conversation_template(v jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare q jsonb; seen uuid[]:='{}'; qid uuid;
begin
 if jsonb_typeof(v) is distinct from 'object' or octet_length(v::text)>30000
 or not v ?& array['title','kind','intro','questions']
 or exists(select 1 from jsonb_object_keys(v) k where not k=any(array['title','kind','intro','questions']))
 or jsonb_typeof(v->'title') is distinct from 'string' or length(trim(v->>'title')) not between 3 and 120
 or jsonb_typeof(v->'kind') is distinct from 'string' or v->>'kind' not in ('annual','probation','followup','custom')
 or jsonb_typeof(v->'intro') is distinct from 'string' or length(v->>'intro')>1000
 or jsonb_typeof(v->'questions') is distinct from 'array' then
  raise exception 'Ugyldig samtalemal. Bruk bare generelle malfelt.' using errcode='22023';
 end if;
 if jsonb_array_length(v->'questions') not between 1 and 24 then
  raise exception 'Malen må ha 1–24 spørsmål.' using errcode='22023';
 end if;
 for q in select value from jsonb_array_elements(v->'questions') loop
  if jsonb_typeof(q) is distinct from 'object' or not q ?& array['id','topic','prompt','phase','required']
  or exists(select 1 from jsonb_object_keys(q) k where not k=any(array['id','topic','prompt','phase','required']))
  or jsonb_typeof(q->'id') is distinct from 'string' or (q->>'id') !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
  or jsonb_typeof(q->'topic') is distinct from 'string' or length(trim(q->>'topic')) not between 1 and 80
  or jsonb_typeof(q->'prompt') is distinct from 'string' or length(trim(q->>'prompt')) not between 3 and 500
  or jsonb_typeof(q->'phase') is distinct from 'string' or q->>'phase' not in ('preparation','meeting')
  or jsonb_typeof(q->'required') is distinct from 'boolean' then
   raise exception 'Et spørsmål har ugyldige felt eller lengde.' using errcode='22023';
  end if;
  qid:=(q->>'id')::uuid;
  if qid=any(seen) then raise exception 'Spørsmål må ha ulike identiteter.' using errcode='22023'; end if;
  seen:=array_append(seen,qid);
 end loop;
end $$;

create function public.hr_template_list(p_company_id uuid,p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; rows jsonb;
begin
 x:=hr_private.require_context(p_company_id,true);
 select coalesce(jsonb_agg(to_jsonb(q) order by q.id),'[]'::jsonb) into rows from (
  select t.id,t.revision,t.archived,v.content->>'title' as title,v.content->>'kind' as kind,
   jsonb_array_length(v.content->'questions') as question_count,v.saved_at
  from hr_private.conversation_templates t join hr_private.conversation_template_versions v
   on v.company_id=t.company_id and v.template_id=t.id and v.revision=t.revision
  where t.company_id=p_company_id and (p_after is null or t.id>p_after) order by t.id limit 20
 ) q;
 x:=hr_private.require_context(p_company_id,true);
 return jsonb_build_object('context',x,'templates',rows,'next',case when jsonb_array_length(rows)=20 then rows->19->>'id' else null end,'content_enabled',false);
end $$;

create function public.hr_template_get(p_company_id uuid,p_template_id uuid,p_version integer default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; t hr_private.conversation_templates%rowtype; v hr_private.conversation_template_versions%rowtype;
begin
 x:=hr_private.require_context(p_company_id,true);
 select * into t from hr_private.conversation_templates where company_id=p_company_id and id=p_template_id;
 if t.id is null then raise exception 'Malen er ikke tilgjengelig i firmaet.' using errcode='42501'; end if;
 select * into v from hr_private.conversation_template_versions where company_id=p_company_id and template_id=t.id and revision=coalesce(p_version,t.revision);
 if v.template_id is null then raise exception 'Malutgaven finnes ikke.' using errcode='22023'; end if;
 x:=hr_private.require_context(p_company_id,true);
 return jsonb_build_object('context',x,'template',jsonb_build_object('id',t.id,'revision',t.revision,'archived',t.archived),
  'version',jsonb_build_object('revision',v.revision,'content',v.content,'archived',v.archived,'saved_at',v.saved_at),'content_enabled',false);
end $$;

create function public.hr_template_history(p_company_id uuid,p_template_id uuid,p_before integer default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; rows jsonb; t hr_private.conversation_templates%rowtype;
begin
 x:=hr_private.require_context(p_company_id,true);
 select * into t from hr_private.conversation_templates where company_id=p_company_id and id=p_template_id;
 if t.id is null then raise exception 'Malen er ikke tilgjengelig i firmaet.' using errcode='42501'; end if;
 if p_before is not null and p_before<1 then raise exception 'Ugyldig historikkgrense.' using errcode='22023'; end if;
 select coalesce(jsonb_agg(to_jsonb(q) order by q.revision desc),'[]'::jsonb) into rows from (
  select revision,archived,saved_at,content->>'title' as title from hr_private.conversation_template_versions
  where company_id=p_company_id and template_id=p_template_id and (p_before is null or revision<p_before)
  order by revision desc limit 20
 ) q;
 x:=hr_private.require_context(p_company_id,true);
 return jsonb_build_object('context',x,'versions',rows,'next',case when jsonb_array_length(rows)=20 then rows->19->>'revision' else null end,'content_enabled',false);
end $$;

create function public.hr_template_save(p_company_id uuid,p_template_id uuid,p_revision integer,p_content jsonb,p_archived boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb; t hr_private.conversation_templates%rowtype; old_content jsonb;
begin
 -- Same lock order as HR administration. Serializes first creation and quota too.
 perform 1 from hr_private.firms where company_id=p_company_id for update;
 x:=hr_private.require_context(p_company_id,true);
 if p_template_id is null or p_revision is null or p_revision<0 or p_archived is null then
  raise exception 'Malidentitet, revisjon og arkivvalg kreves.' using errcode='22023';
 end if;
 perform hr_private.validate_conversation_template(p_content);
 select * into t from hr_private.conversation_templates where id=p_template_id for update;
 if t.id is not null and t.company_id<>p_company_id then raise exception 'Malen er ikke tilgjengelig i firmaet.' using errcode='42501'; end if;
 if p_revision is distinct from coalesce(t.revision,0) then raise exception 'Malen er endret. Hent ny utgave før du lagrer.' using errcode='40001'; end if;
 if t.id is null then
  if p_archived then raise exception 'En ny mal kan ikke starte som arkivert.' using errcode='22023'; end if;
  if (select count(*) from hr_private.conversation_templates where company_id=p_company_id)>=50 then
   raise exception 'Firmaet har nådd grensen på 50 maler, inkludert arkiverte.' using errcode='22023';
  end if;
  insert into hr_private.conversation_templates(id,company_id,revision,archived) values(p_template_id,p_company_id,1,false) returning * into t;
 else
  select content into old_content from hr_private.conversation_template_versions where template_id=t.id and revision=t.revision;
  if old_content=p_content and t.archived=p_archived then return public.hr_template_get(p_company_id,t.id); end if;
  if t.archived and p_archived and old_content<>p_content then raise exception 'Gjenåpne malen før innholdet endres.' using errcode='22023'; end if;
  update hr_private.conversation_templates set revision=revision+1,archived=p_archived where id=t.id returning * into t;
 end if;
 insert into hr_private.conversation_template_versions(company_id,template_id,revision,content,archived,saved_by)
 values(p_company_id,t.id,t.revision,p_content,t.archived,auth.uid());
 perform hr_private.require_context(p_company_id,true);
 return public.hr_template_get(p_company_id,t.id);
end $$;

revoke all on function hr_private.validate_conversation_template(jsonb) from public,anon,authenticated,service_role;
revoke all on function public.hr_template_list(uuid,uuid),public.hr_template_get(uuid,uuid,integer),public.hr_template_history(uuid,uuid,integer),public.hr_template_save(uuid,uuid,integer,jsonb,boolean) from public,anon,authenticated,service_role;
grant execute on function public.hr_template_list(uuid,uuid),public.hr_template_get(uuid,uuid,integer),public.hr_template_history(uuid,uuid,integer),public.hr_template_save(uuid,uuid,integer,jsonb,boolean) to authenticated;

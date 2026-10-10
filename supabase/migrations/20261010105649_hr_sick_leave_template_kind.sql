-- Generic sick-leave template kind only. No new personal content or privileges.
create or replace function hr_private.validate_conversation_template(v jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare q jsonb; seen uuid[]:='{}'; qid uuid;
begin
 if jsonb_typeof(v) is distinct from 'object' or octet_length(v::text)>30000
 or not v ?& array['title','kind','intro','questions']
 or exists(select 1 from jsonb_object_keys(v) k where not k=any(array['title','kind','intro','questions']))
 or jsonb_typeof(v->'title') is distinct from 'string' or length(trim(v->>'title')) not between 3 and 120
 or jsonb_typeof(v->'kind') is distinct from 'string' or v->>'kind' not in ('annual','probation','followup','sickleave','custom')
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

-- CREATE OR REPLACE preserves owner and the existing restricted EXECUTE ACL.

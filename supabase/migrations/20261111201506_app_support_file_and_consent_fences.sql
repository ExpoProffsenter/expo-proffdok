-- Existing embedded images are files too; support cannot replace or clear them.
-- Personal terms acceptance remains the actual user's action.
-- Existing clients normalize a missing archive timestamp to an empty string.
-- Empty is not a soft deletion; a real timestamp remains blocked.
create or replace function app_support_private.removes_content(old_value jsonb,new_value jsonb) returns boolean
language plpgsql immutable set search_path=pg_catalog,pg_temp as $$
declare k text; v jsonb; replacement jsonb; identity_key text; identity_value jsonb; pos int; remaining jsonb; match_pos int;
begin
 if old_value is null or old_value='null'::jsonb then return false; end if;
 if jsonb_typeof(old_value)='object' then
  if jsonb_typeof(new_value) is distinct from 'object' then return true; end if;
  if lower(coalesce(new_value->>'status','')) in ('deleted','removed','archived')
   and new_value->>'status' is distinct from old_value->>'status' then return true; end if;
  foreach k in array array['path','storagePath','filePath','objectPath','imageDataUrl','imageUrl'] loop
   if nullif(old_value->>k,'') is not null and old_value->k is distinct from new_value->k then return true; end if;
  end loop;
  foreach k in array array['deleted_at','deletedAt','archived_at','archivedAt'] loop
   if nullif(btrim(old_value->>k),'') is null and nullif(btrim(new_value->>k),'') is not null then return true; end if;
  end loop;
  foreach k in array array['deleted','is_deleted','isDeleted','archived','is_archived','isArchived'] loop
   if old_value->k is distinct from 'true'::jsonb and new_value->k='true'::jsonb then return true; end if;
  end loop;
  for k,v in select * from jsonb_each(old_value) loop
   if k in ('deleted_at','deletedAt','archived_at','archivedAt') and v='null'::jsonb and nullif(btrim(new_value->>k),'') is not null then return true; end if;
   if k in ('deleted','is_deleted','isDeleted','archived','is_archived','isArchived') and v is distinct from 'true'::jsonb and new_value->k='true'::jsonb then return true; end if;
   if not new_value ? k then return true; end if;
   if jsonb_typeof(v) in ('array','object') and app_support_private.removes_content(v,new_value->k) then return true; end if;
  end loop;
 elsif jsonb_typeof(old_value)='array' then
  if jsonb_typeof(new_value) is distinct from 'array' or jsonb_array_length(new_value)<jsonb_array_length(old_value) then return true; end if;
  pos:=0; remaining:=new_value;
  for v in select * from jsonb_array_elements(old_value) loop
   identity_key:=null;
   if jsonb_typeof(v)='object' then
    foreach k in array array['id','uuid','key','path','storagePath','filePath','objectPath'] loop
     if nullif(v->>k,'') is not null then identity_key:=k; exit; end if;
    end loop;
   end if;
   if identity_key is not null then
    identity_value:=v->identity_key;
    select value,(ordinality-1)::int into replacement,match_pos from jsonb_array_elements(remaining) with ordinality
     where value->identity_key=identity_value limit 1;
    if replacement is null then return true; end if;
    remaining:=remaining-match_pos;
   elsif jsonb_typeof(v) not in ('object','array') then
    select value,(ordinality-1)::int into replacement,match_pos from jsonb_array_elements(remaining) with ordinality
     where value=v limit 1;
    if replacement is null then return true; end if;
    remaining:=remaining-match_pos;
   else replacement:=new_value->pos;
   end if;
   if jsonb_typeof(v) in ('array','object') and app_support_private.removes_content(v,replacement) then return true; end if;
   pos:=pos+1;
  end loop;
 end if;
 return false;
end $$;
revoke all on function app_support_private.removes_content(jsonb,jsonb) from public,anon,authenticated;

create or replace function app_support_private.guard_and_audit() returns trigger
language plpgsql security definer set search_path=pg_catalog,public,pg_temp as $$
declare sid text; s app_support_private.sessions; before_row jsonb; after_row jsonb; k text;
begin
 sid:=coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}')->>'x-expo-support-session';
 if nullif(sid,'') is null and nullif(current_setting('app.support.session_id',true),'') is null then
  if tg_level='STATEMENT' then return null; end if;
  if tg_op='DELETE' then return old; else return new; end if;
 end if;
 s:=app_support_private.request_session();
 if sid::uuid is distinct from s.id then raise exception 'Supportøkten samsvarer ikke med forespørselen.' using errcode='42501'; end if;
 if tg_op in ('DELETE','TRUNCATE') then raise exception 'Sletting er sperret i supportmodus.' using errcode='42501'; end if;
 -- Membership, account/permission changes and external delivery are separate admin actions.
 if tg_table_schema='net' or tg_table_name='user_terms_acceptance' or tg_table_name ~* '(membership|module_access|supplier_access|user_access|profiles|active_company_scope|outbox|email|mail_settings|api_key|secret)' then
  raise exception 'Tilgangsendring eller utsending er ikke tillatt fra supportvisningen.' using errcode='42501';
 end if;
 after_row:=to_jsonb(new);
 if tg_op='UPDATE' then
  before_row:=to_jsonb(old);
  foreach k in array array['id','company_id','company_scope_id','user_id','created_by','owner_id'] loop
   if before_row ? k and before_row->k is distinct from after_row->k then raise exception 'Eier og firmatilknytning kan ikke flyttes i supportmodus.' using errcode='42501'; end if;
  end loop;
  if app_support_private.removes_content(before_row,after_row) then
   raise exception 'Endringen fjerner eksisterende innhold. Sletting er sperret i supportmodus.' using errcode='42501';
  end if;
 end if;
 insert into app_support_private.audit(session_id,actor_id,target_user_id,company_id,action,resource,before_value,after_value)
 values(s.id,s.actor_id,s.target_user_id,s.company_id,lower(tg_op),tg_table_schema||'.'||tg_table_name,
 app_support_private.redact_audit(before_row),app_support_private.redact_audit(after_row));
 return new;
end $$;


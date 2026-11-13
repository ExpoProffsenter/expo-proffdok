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
  foreach k in array array['path','storagePath','filePath','objectPath'] loop
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

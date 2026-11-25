-- Storage does not execute PostgREST's pre-request hook. Each existing policy
-- evaluates its ORIGINAL expression only after request-local support setup.
-- SECURITY INVOKER preserves the original SQL/RLS permissions and policy roles.
create table app_support_private.storage_policy_snapshots (
 policy_name text primary key, command text not null, using_expression text,
 check_expression text, roles name[] not null, permissive text not null
);
alter table app_support_private.storage_policy_snapshots enable row level security;
revoke all on app_support_private.storage_policy_snapshots from public,anon,authenticated;
insert into app_support_private.storage_policy_snapshots
 select policyname,cmd,qual,with_check,roles,permissive from pg_policies
 where schemaname='storage' and tablename='objects';

create function app_support_private.prepare_storage_request(operation text) returns void
language plpgsql security definer set search_path=pg_catalog,public,pg_temp as $$
declare headers jsonb:=coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}');
begin
 if nullif(headers->>'x-expo-support-session','') is null then return; end if;
 if operation in ('UPDATE','DELETE') or coalesce(headers->>'x-upsert','false')='true' then
  raise exception 'Filer kan legges til, men ikke slettes eller erstattes i supportmodus.' using errcode='42501';
 end if;
 perform app_support_private.prepare_request();
end $$;
revoke all on function app_support_private.prepare_storage_request(text) from public;
grant usage on schema app_support_private to anon;
grant execute on function app_support_private.prepare_storage_request(text) to anon,authenticated;

do $migration$
declare p record; side text; expr text; fn text; body text; operation text;
begin
 for p in select * from app_support_private.storage_policy_snapshots loop
  foreach side in array array['USING','WITH CHECK'] loop
   expr:=case when side='USING' then p.using_expression else p.check_expression end;
   if expr is null then continue; end if;
   operation:=case when p.command='ALL' then 'SELECT' else p.command end;
   fn:='storage_policy_'||md5(p.policy_name||side);
   body:=format('declare allowed boolean; begin perform app_support_private.prepare_storage_request(%L); select (%s) into allowed from (select (candidate).*) objects; return allowed; end',operation,expr);
   execute format('create function app_support_private.%I(candidate storage.objects) returns boolean language plpgsql volatile security invoker set search_path=pg_catalog,public,storage,pg_temp as %L',fn,body);
   execute format('revoke all on function app_support_private.%I(storage.objects) from public',fn);
   execute format('grant execute on function app_support_private.%I(storage.objects) to anon,authenticated',fn);
   execute format('alter policy %I on storage.objects %s (app_support_private.%I(objects))',p.policy_name,side,fn);
  end loop;
 end loop;
end $migration$;

-- ALL policies also participate in updates/deletes, so add independent fences.
create policy app_support_no_storage_delete on storage.objects as restrictive for delete to authenticated
 using (nullif(coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}')->>'x-expo-support-session','') is null);
create policy app_support_no_storage_replace on storage.objects as restrictive for update to authenticated
 using (nullif(coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}')->>'x-expo-support-session','') is null)
 with check (nullif(coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}')->>'x-expo-support-session','') is null);

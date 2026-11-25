-- Company invitations are access administration, never customer-project work.
-- Install after company_invitation_management, before enabling support transport.
do $$
declare definition text;
  previous text := 'if tg_table_schema=''net'' or tg_table_name=''user_terms_acceptance'' or tg_table_name ~*';
  replacement text := 'if tg_table_schema in (''net'',''company_invitation_private'') or tg_table_name in (''user_terms_acceptance'',''company_user_invites'') or tg_table_name ~*';
begin
  definition := pg_get_functiondef('app_support_private.guard_and_audit()'::regprocedure);
  if strpos(definition,previous)=0 then
    raise exception 'Support guard definition changed; review invitation fence before installation.';
  end if;
  execute replace(definition,previous,replacement);
end $$;

-- Cover both installation orders: support first in Sandbox; invitations first in Production.
do $$ declare relation_name text; trigger_name text; trigger_events text; expected_type integer; existing_guard oid; existing_type integer; begin
  foreach relation_name in array array['public.company_user_invites','company_invitation_private.deliveries'] loop
    if to_regclass(relation_name) is null then
      raise exception 'Install company_invitation_management before support invitation fences: %',relation_name;
    end if;
    foreach trigger_name in array array['app_support_write_guard','app_support_delete_guard','app_support_truncate_guard'] loop
      trigger_events:=case trigger_name when 'app_support_write_guard' then 'after insert or update' when 'app_support_delete_guard' then 'before delete' else 'before truncate' end;
      expected_type:=case trigger_name when 'app_support_write_guard' then 21 when 'app_support_delete_guard' then 11 else 34 end;
      select tgfoid,tgtype into existing_guard,existing_type from pg_trigger where tgrelid=to_regclass(relation_name) and tgname=trigger_name and not tgisinternal;
      if found then
        if existing_guard <> 'app_support_private.guard_and_audit()'::regprocedure::oid or existing_type<>expected_type then
          raise exception 'Existing support trigger changed: %.%',relation_name,trigger_name;
        end if;
      else
        execute format('create trigger %I %s on %s for each %s execute function app_support_private.guard_and_audit()',trigger_name,trigger_events,relation_name,case when trigger_name='app_support_truncate_guard' then 'statement' else 'row' end);
      end if;
    end loop;
  end loop;
end $$;
notify pgrst,'reload schema';

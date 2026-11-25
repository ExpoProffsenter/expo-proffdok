-- Validate the canonical row AFTER existing normalization triggers. In particular,
-- an upsert's INSERT branch strips the handler ID until UPDATE restores it.
-- Raising from AFTER still rolls back the entire statement and its audit writes.
-- DELETE and TRUNCATE remain blocked before execution.
do $$ declare t record; begin
 for t in select n.nspname,c.relname from pg_trigger g
 join pg_class c on c.oid=g.tgrelid join pg_namespace n on n.oid=c.relnamespace
 where g.tgname='app_support_write_guard' and not g.tgisinternal
 and n.nspname<>'net' -- extension-owned delivery queue keeps its BEFORE fence
 loop
  execute format('drop trigger app_support_write_guard on %I.%I',t.nspname,t.relname);
  execute format('create trigger app_support_write_guard after insert or update on %I.%I for each row execute function app_support_private.guard_and_audit()',t.nspname,t.relname);
  execute format('create trigger app_support_delete_guard before delete on %I.%I for each row execute function app_support_private.guard_and_audit()',t.nspname,t.relname);
 end loop;
end $$;

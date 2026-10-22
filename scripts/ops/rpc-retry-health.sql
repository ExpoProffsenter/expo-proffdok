-- Read-only operator postflight. No customer data, grants or public RPC endpoint.
with risky as (
 select p.oid::regprocedure::text signature
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where p.prokind='f' and n.nspname not in ('pg_catalog','information_schema')
 and p.prosrc ~* $pattern$(errcode[[:space:]]*=[[:space:]]*'(40[0-9A-Z]{3}|serialization_failure|deadlock_detected|transaction_rollback)'|raise[[:space:]]+sqlstate[[:space:]]+'40[0-9A-Z]{3}'|raise[[:space:]]+(serialization_failure|deadlock_detected|transaction_rollback)\M)$pattern$
)
select now() as checked_at,
 (select count(*) from risky) as manually_retrying_functions,
 (select coalesce(jsonb_agg(signature),'[]') from risky) as functions_to_review,
 (select count(*) from pg_stat_activity where pid<>pg_backend_pid() and usename='authenticator' and state='active' and query_start<now()-interval '30 seconds') as long_api_queries,
 (select xact_rollback from pg_stat_database where datname=current_database()) as rollback_counter;

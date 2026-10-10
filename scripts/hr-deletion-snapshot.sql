-- Operator-only full snapshot. No incremental UUID cursor: newly inserted UUIDs
-- can sort before yesterday's cursor. Lock writers for this single statement.
-- Export the result privately, then sync with the independent ledger tool.
begin;
set local statement_timeout='30s';
set local lock_timeout='5s';
lock table hr_private.purge_receipts in share mode;
-- The independently configured project binding is mandatory, never inferred from
-- a restored database. Set hr.ledger.project in the operator session first.
select jsonb_build_object('format',1,'project',current_setting('hr.ledger.project'),'receipts',
 coalesce(jsonb_agg(jsonb_build_object('id',id,'company_id',company_id,
 'employee_id',employee_id,'user_id',user_id,'kind',kind,
 'through_revision',through_revision,'requested_at',requested_at) order by id),'[]'::jsonb))
from hr_private.purge_receipts;
commit;

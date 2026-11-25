-- Cover the composite artifact FK used by the existing private purge domain.
create index hr_sick_leave_artifact on hr_private.sick_leave_cases(company_id,employee_id,current_artifact_id);

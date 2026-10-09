-- H2 review: cover FK cascades independent of company-scoped read indexes.
create index hr_employees_user_fk on hr_private.employees(user_id);
create index hr_employees_leader_fk on hr_private.employees(leader_id);
create index hr_readers_employee_fk on hr_private.readers(company_id,employee_id);
create index hr_readers_user_fk on hr_private.readers(user_id);
create index hr_readers_granter_fk on hr_private.readers(granted_by);

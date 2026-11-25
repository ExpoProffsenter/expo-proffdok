begin;
-- Tenant-first indexes serve lists; these cover profile FKs and retention work.
create index kshms_deviations_responsible_fk on public.kshms_deviations(responsible_id);
create index kshms_deviations_handler_fk on public.kshms_deviations(handler_id);
create index kshms_deviations_creator_fk on public.kshms_deviations(created_by);
commit;

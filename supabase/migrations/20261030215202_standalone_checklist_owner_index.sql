-- Cover auth.users ownership lookups, including user lifecycle operations.
create index if not exists standalone_checklist_created_by
  on checklist_private.runs (created_by);

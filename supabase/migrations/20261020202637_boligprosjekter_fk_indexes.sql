-- Cover composite entrance and root audit foreign keys without changing access rules.
create index if not exists bolig_units_entrance_root on bolig_private.units(entrance_id,root_id);
create index if not exists bolig_audit_root on bolig_private.audit(root_id);

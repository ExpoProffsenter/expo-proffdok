-- Cover unit foreign keys used by archival/deletion and per-unit history reads.
create index bolig_delivery_events_unit on bolig_private.delivery_events(unit_id);
create index bolig_order_mail_unit on bolig_private.order_mail_attempts(unit_id);

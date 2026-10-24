-- Cover composite room foreign keys in their declared column order.
create index bolig_room_states_unit_root on bolig_private.room_states(unit_id,root_id);
create index bolig_rooms_unit_root on bolig_private.rooms(unit_id,root_id);
create index bolig_room_versions_unit_root on bolig_private.room_versions(unit_id,root_id);

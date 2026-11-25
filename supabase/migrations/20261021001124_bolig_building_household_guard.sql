-- Keep the new house semantics valid through the pre-existing structure commands too.
create function bolig_private.check_household_structure() returns trigger
language plpgsql security invoker set search_path='' as $$
declare kind text;begin
 select building_type into kind from bolig_private.blocks where id=new.block_id and root_id=new.root_id;
 if kind='house' and new.counts<>'[1]'::jsonb then raise exception 'En enebolig skal ha én husstand. Etasjene i huset er ikke nye boliger.' using errcode='22023';end if;
 if kind='duplex' and (select sum(value::text::int) from jsonb_array_elements(new.counts))<>2 then raise exception 'En tomannsbolig skal ha to boliger.' using errcode='22023';end if;
 if kind in ('house','duplex','multi') and exists(select 1 from bolig_private.entrances where block_id=new.block_id and id<>new.id) then raise exception 'Dette bygget har allerede en boligfordeling. Endre den eksisterende fordelingen.' using errcode='22023';end if;
 return new;
end$$;
revoke all on function bolig_private.check_household_structure() from public,anon,authenticated,service_role;
create trigger bolig_household_structure before insert or update of block_id,counts on bolig_private.entrances for each row execute function bolig_private.check_household_structure();

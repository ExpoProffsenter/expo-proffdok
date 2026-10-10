-- HR module grants are assignments too; remove them on employment closure.
create function hr_private.clear_closed_module_access() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 delete from hr_private.module_access where company_id=new.company_id and user_id=new.user_id;
 return new;
end $$;
revoke all on function hr_private.clear_closed_module_access() from public,anon,authenticated,service_role;
create trigger hr_module_access_closed after insert or update on hr_private.closed_employments
for each row execute function hr_private.clear_closed_module_access();

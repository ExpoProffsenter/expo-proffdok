-- Expo ProffDok – FASE 38A1 overgangsvern.
-- Backend er migrert før 38A-UI er i produksjon. Dersom en bruker godkjennes
-- gjennom gammel produksjons-UI i overgangsvinduet, behold legacy tilgang.
-- En senere 38A-migrasjon fjerner triggeren før fase-slutt.

create or replace function public.fase38a_transition_seed_modules_on_approval()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(new.approved,false) = true
     and coalesce(old.approved,false) = false
     and not exists (
       select 1 from public.user_module_access uma where uma.user_id = new.id
     ) then
    insert into public.user_module_access (user_id,module_key,granted_by)
    values
      (new.id,'projects',null),
      (new.id,'sales',null)
    on conflict (user_id,module_key) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists fase38a_transition_seed_modules_on_approval on public.profiles;
create trigger fase38a_transition_seed_modules_on_approval
after update of approved on public.profiles
for each row
execute function public.fase38a_transition_seed_modules_on_approval();

revoke execute on function public.fase38a_transition_seed_modules_on_approval() from public, anon, authenticated;

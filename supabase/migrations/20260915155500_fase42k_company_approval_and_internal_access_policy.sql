-- Expo ProffDok – FASE 42K
-- Nye brukere kan ikke godkjennes uten firma. Eksisterende godkjente legacy-brukere
-- berøres ikke før de eventuelt endrer firma. Flytting ut av interne firma rydder
-- Butikktilbud og sensitiv intern prisrettighet server-side.

create or replace function public.fase42k_require_company_before_approval()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if coalesce(new.approved, false) = true
     and (tg_op = 'INSERT' or coalesce(old.approved, false) = false)
     and nullif(trim(coalesce(new.company_name, '')), '') is null then
    raise exception 'Velg firma før brukeren godkjennes.' using errcode = '23514';
  end if;
  return new;
end;
$function$;

drop trigger if exists fase42k_require_company_before_approval on public.profiles;
create trigger fase42k_require_company_before_approval
before insert or update of approved on public.profiles
for each row execute function public.fase42k_require_company_before_approval();

create or replace function public.fase42k_cleanup_internal_access_on_company_change()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_company text := public.sales_normalize_company_name(new.company_name);
  v_allowed boolean := v_company in (
    public.sales_normalize_company_name('Ringside Rørleggerbedrift AS'),
    public.sales_normalize_company_name('Bademiljø Expo'),
    public.sales_normalize_company_name('Expo Proffsenter')
  );
begin
  if not coalesce(v_allowed, false) then
    delete from public.user_module_access
    where user_id = new.id
      and module_key = 'store_offers';

    delete from public.user_feature_access
    where user_id = new.id
      and feature_key = 'view_internal_net_prices';
  end if;
  return new;
end;
$function$;

drop trigger if exists fase42k_cleanup_internal_access_on_company_change on public.profiles;
create trigger fase42k_cleanup_internal_access_on_company_change
after update of company_name on public.profiles
for each row
when (old.company_name is distinct from new.company_name)
execute function public.fase42k_cleanup_internal_access_on_company_change();

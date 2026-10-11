-- Explicit display-name edit only. Stable company identity and all historical
-- normalized names, memberships, projects and document snapshots are preserved.
create function public.rename_my_company_display_name(p_company_id uuid,p_expected_name text,p_name text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();new_name text:=btrim(p_name);old_name text;primary_id uuid;begin
 if actor is null then raise exception 'Du må være innlogget.' using errcode='42501';end if;
 perform 1 from public.profiles where id=actor and approved and not coalesce(deactivated,false) for share;
 if not found then raise exception 'Brukeren må være godkjent og aktiv.' using errcode='42501';end if;
 primary_id:=public.current_primary_company_scope_id();
 if p_company_id is null or p_company_id is distinct from primary_id then raise exception 'Du kan bare endre ditt primærfirma her.' using errcode='42501';end if;
 perform 1 from public.sales_company_memberships where company_id=p_company_id and user_id=actor and workspace_role='firmaadmin' for share;
 if not found and not public.current_profile_is_systemadmin() then raise exception 'Bare firmaadmin eller systemadmin kan endre firmanavnet.' using errcode='42501';end if;
 if new_name is null or length(new_name) not between 2 and 100 or new_name ~ '[[:cntrl:]]' then raise exception 'Skriv et firmanavn med 2–100 tegn.' using errcode='22023';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('company-display-name:'||public.sales_normalize_company_name(new_name),0));
 select display_name into old_name from public.sales_company_scopes where id=p_company_id for update;
 if not found then raise exception 'Firmaet finnes ikke.' using errcode='P0002';end if;
 if old_name is distinct from p_expected_name then raise exception 'Firmanavnet er endret av andre. Hent navnet på nytt.' using errcode='40001';end if;
 if exists(select 1 from public.sales_company_scopes where id<>p_company_id and (normalized_name=public.sales_normalize_company_name(new_name) or public.sales_normalize_company_name(display_name)=public.sales_normalize_company_name(new_name))) then raise exception 'Navnet tilhører allerede et annet registrert firma.' using errcode='23505';end if;
 update public.sales_company_scopes set display_name=new_name where id=p_company_id;
 return public.get_my_company_profile();
end$$;
revoke all on function public.rename_my_company_display_name(uuid,text,text) from public,anon,authenticated,service_role;
grant execute on function public.rename_my_company_display_name(uuid,text,text) to authenticated;

-- Expose only the project-owning company's public logo, after existing portal guards.
alter function bolig_private.portal_state(bolig_private.resident_portals) rename to portal_state_before_brand;
create function bolig_private.portal_state(p bolig_private.resident_portals) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_set(bolig_private.portal_state_before_brand(p),'{identity,logo_url}',
 to_jsonb(coalesce(public.work_profile_company_profile(r.company_id)->>'logoUrl','')))
 from bolig_private.roots r where r.id=p.root_id
$$;
revoke all on function bolig_private.portal_state(bolig_private.resident_portals) from public,anon,authenticated,service_role;
notify pgrst,'reload schema';

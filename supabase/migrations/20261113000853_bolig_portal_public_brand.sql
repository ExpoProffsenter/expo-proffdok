-- Portal visitors have no auth.uid(). Do not use the signed-in company profile API.
-- Called only from the already authorized private portal projection; expose logo only.
create or replace function bolig_private.portal_state(p bolig_private.resident_portals) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_set(bolig_private.portal_state_before_brand(p),'{identity,logo_url}',to_jsonb(coalesce(
  (select nullif(trim(c.logo_url),'') from public.companies c
   where public.sales_normalize_company_name(c.company_name)=s.normalized_name order by c.created_at,c.id limit 1),
  (select nullif(trim(pr.logo_url),'') from public.profiles pr
   where public.sales_normalize_company_name(pr.company_name)=s.normalized_name
   order by case when pr.company_role='firmaadmin' and coalesce(pr.approved,false) and not coalesce(pr.deactivated,false) then 0 else 1 end,pr.created_at,pr.id limit 1),
  case when s.normalized_name=public.sales_normalize_company_name('Ringside Rørleggerbedrift AS') then '/brands/ringside-rorleggerbedrift.png'
       when s.normalized_name=public.sales_normalize_company_name('Bademiljø Expo') then '/brands/bademiljo-expo-ringside.png'
       when s.normalized_name=public.sales_normalize_company_name('Expo Proffsenter') then '/expo-logo.png' else '' end)))
 from bolig_private.roots r join public.sales_company_scopes s on s.id=r.company_id where r.id=p.root_id
$$;
revoke all on function bolig_private.portal_state(bolig_private.resident_portals) from public,anon,authenticated,service_role;
notify pgrst,'reload schema';

-- Only images already published to this valid portal, inside its own project.
create function bolig_resident_private.image_paths(token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare state jsonb;root uuid;company uuid;result jsonb;
begin
 state:=public.bolig_portal(token,'get','{}');
 select p.root_id,r.company_id into root,company from bolig_private.resident_portals p
 join bolig_private.roots r on r.id=p.root_id where p.id=(state->>'id')::uuid;
 select coalesce(jsonb_agg(distinct path),'[]') into result from (
 select substring(g->>'image_url' from '/storage/v1/object/public/bolig-catalog-images/([^?#]+)$') as path
 from jsonb_array_elements(state->'offers') o cross join lateral jsonb_array_elements(o->'goods') g
 ) paths where path ~ ('^'||company::text||'/'||root::text||'/[a-f0-9-]{36}\.jpg$');
 return result;
end$$;
revoke all on function bolig_resident_private.image_paths(text) from public,anon,authenticated,service_role;
grant execute on function bolig_resident_private.image_paths(text) to anon,authenticated;
create function public.bolig_portal_image_paths(p_token text) returns jsonb
language sql security invoker set search_path='' as $$select bolig_resident_private.image_paths(p_token)$$;
revoke all on function public.bolig_portal_image_paths(text) from public,anon,authenticated,service_role;
grant execute on function public.bolig_portal_image_paths(text) to anon,authenticated;
notify pgrst,'reload schema';

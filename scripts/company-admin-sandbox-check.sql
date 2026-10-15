-- Dedicated Sandbox only. Existing Demo users; every mutation rolls back. No mail.
begin;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.set_active_work_profile('e0000000-0000-4000-8000-000000000003');
do $$
declare c uuid:='e0000000-0000-4000-8000-000000000003';u uuid:='d0000000-0000-4000-8000-000000000101';r jsonb;before_primary text;
begin
 select company_name into strict before_primary from public.profiles where id=u;
 r:=public.company_admin_snapshot();assert r->>'company_name'='Bademiljø Expo','Wrong selected company';
 r:=public.company_admin_invite(c,'company-admin-rollback@example.invalid','ansatt');
 assert r->>'company_id'=c::text and r->>'company_name'='Bademiljø Expo','Wrong invitation company';
 assert r->'company_profile'->>'logoUrl'='/brands/bademiljo-expo-ringside.png','Wrong logo';
 r:=public.company_admin_invite(c,'demo.ks@expo-proffdok.invalid','ansatt');assert r->>'accepted'='true','Existing internal account not joined';
 -- Membership rows are deliberately inaccessible directly; use the authorized snapshot.
 r:=public.company_admin_snapshot(c);
 assert exists(select 1 from jsonb_array_elements(r->'users') j where j->>'id'=u::text and j->>'is_primary'='false'),'Extra membership missing';
 assert (select company_name from public.profiles where id=u)=before_primary,'Primary company moved';
 r:=public.company_admin_set_role(c,u,'ansatt','firmaadmin');
 assert (public.people_modules_user_get(c,u)->>'firmaadmin')::boolean,'People grant did not inherit firmarole';
 begin perform public.company_admin_set_role(c,u,'ansatt','ansatt');raise exception 'Stale role accepted';exception when serialization_failure then null;end;
 begin perform public.company_admin_snapshot('e0000000-0000-4000-8000-000000000002');raise exception 'Wrong firm accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select not exists(select 1 from public.company_user_invites where email='company-admin-rollback@example.invalid') as clean;

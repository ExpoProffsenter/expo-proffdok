-- Display identity only. Existing callers authorize the same employee before serializing.
-- User-editable name is never an authorization claim, recipient, or relationship key.
-- No grants, memberships, access checks, case payloads, mail or triggers change.
create or replace function hr_private.employee_json(e hr_private.employees) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',e.id,'user_id',e.user_id,'email',(select email from public.profiles where id=e.user_id),
 'full_name',(select left(nullif(trim(case when jsonb_typeof(u.raw_user_meta_data->'full_name')='string'
   then u.raw_user_meta_data->>'full_name' end),''),120) from auth.users u where u.id=e.user_id),
 'leader_id',e.leader_id,'revision',e.revision,
 'readers',coalesce((select jsonb_agg(jsonb_build_object('user_id',r.user_id,'granted_by',r.granted_by,
 'granted_at',r.granted_at,'reason',r.reason) order by r.user_id) from hr_private.readers r where r.employee_id=e.id),'[]'::jsonb))
$$;

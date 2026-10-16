-- Additive validation on private KS/HMS schedules. No public API/grant change.
-- Legacy plans may omit both fields; no existing sessions are rewritten.
create function kshms_private.progress_staffing_valid(p_plan jsonb)
returns boolean language plpgsql immutable set search_path='' as $$
declare a jsonb;s jsonb;crew numeric;skip_sunday boolean;begin
 if p_plan ? 'excludeSundays' and jsonb_typeof(p_plan->'excludeSundays') is distinct from 'boolean' then return false;end if;
 skip_sunday:=coalesce((p_plan->>'excludeSundays')::boolean,false);
 for a in select value from jsonb_array_elements(p_plan->'activities') loop
  if a ? 'crewSize' and a->'crewSize'<>'null'::jsonb then
   if jsonb_typeof(a->'crewSize') is distinct from 'number' then return false;end if;
   crew:=(a->>'crewSize')::numeric;
   if crew<1 or crew>999 or crew<>trunc(crew) then return false;end if;
  end if;
  if skip_sunday then
   for s in select value from jsonb_array_elements(a->'sessions') loop
    if extract(isodow from (s->>'date')::date)=7 then return false;end if;
   end loop;
  end if;
 end loop;
 return true;
exception when others then return false;
end $$;
revoke all on function kshms_private.progress_staffing_valid(jsonb) from public,anon,authenticated,service_role;
alter table kshms_private.progress_plans add constraint kshms_progress_staffing_valid check(kshms_private.progress_staffing_valid(plan));

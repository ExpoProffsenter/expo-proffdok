-- Participants are planned workers, not deadline owners. No access grants or mail.
create function kshms_private.progress_member(p_company uuid,p_user uuid)
returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
 left join public.kshms_member_access a on a.company_id=m.company_id and a.user_id=m.user_id
 where m.company_id=p_company and m.user_id=p_user and p.approved and not coalesce(p.deactivated,false)
 and p.role in ('admin','member','ansatt','firmaadmin') and (m.workspace_role='firmaadmin' or a.enabled));
$$;
revoke all on function kshms_private.progress_member(uuid,uuid) from public,anon,authenticated,service_role;

create function kshms_private.progress_participants_validate() returns trigger
language plpgsql security invoker set search_path='' as $$
declare a jsonb;u jsonb;uid uuid;retained boolean;begin
 for a in select value from jsonb_array_elements(new.plan->'activities') loop
  if not a ? 'assigneeIds' then continue;end if;
  if jsonb_typeof(a->'assigneeIds') is distinct from 'array' then raise exception 'Ugyldige deltakere.' using errcode='22023';end if;
  if jsonb_array_length(a->'assigneeIds')>50 or exists(select 1 from jsonb_array_elements(a->'assigneeIds') z group by z having count(*)>1)
  then raise exception 'Velg høyst 50 ulike deltakere per oppgave.' using errcode='22023';end if;
  for u in select value from jsonb_array_elements(a->'assigneeIds') loop
   if jsonb_typeof(u)<>'string' or u#>>'{}' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   then raise exception 'Ugyldig deltaker-ID.' using errcode='22023';end if;
   uid:=(u#>>'{}')::uuid;retained:=false;
   if tg_op='UPDATE' and old.company_id=new.company_id then
    select exists(select 1 from jsonb_array_elements(old.plan->'activities') z where z->>'id'=a->>'id' and coalesce(z->'assigneeIds','[]') @> jsonb_build_array(uid::text)) into retained;
   end if;
   if not retained and not kshms_private.progress_member(new.company_id,uid)
   then raise exception 'Deltakeren må være aktiv i dette firmaet og ha KS/HMS-tilgang. Oppdater deltakerlisten.' using errcode='42501';end if;
  end loop;
 end loop;
 return new;
end $$;
revoke all on function kshms_private.progress_participants_validate() from public,anon,authenticated,service_role;
create trigger kshms_progress_participants_validate before insert or update of plan,company_id on kshms_private.progress_plans
for each row execute function kshms_private.progress_participants_validate();

create function public.kshms_progress_people(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;begin
 x:=kshms_private.require_context(p_company_id);
 return jsonb_build_object('context',x,'people',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',kshms_private.identity_snapshot(p.id)->>'name') order by kshms_private.identity_snapshot(p.id)->>'name',p.id),'[]')
 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id where m.company_id=p_company_id and kshms_private.progress_member(p_company_id,p.id)));
end $$;

create function public.kshms_progress_mine(p_company_id uuid,p_id uuid default null,p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;today date:=(now() at time zone 'Europe/Oslo')::date;items jsonb;record jsonb;more boolean;begin
 x:=kshms_private.require_context(p_company_id);
 -- Filter both in SQL and in the returned JSON. Never send colleagues' tasks.
 with mine as (
  select p.*,p.plan||jsonb_build_object('activities',(select coalesce(jsonb_agg(a order by ord),'[]') from jsonb_array_elements(p.plan->'activities') with ordinality z(a,ord) where coalesce(a->'assigneeIds','[]') @> jsonb_build_array(auth.uid()::text))) personal_plan
  from kshms_private.progress_plans p where p.company_id=p_company_id and not p.archived and (p_id is null or p.id=p_id) and (p_after is null or p.id>p_after)
  and p.plan @> jsonb_build_object('activities',jsonb_build_array(jsonb_build_object('assigneeIds',jsonb_build_array(auth.uid()::text))))
 ), active as (
  select m.*,b.first_date,b.last_date from mine m cross join lateral (
   select min(s->>'date') first_date,max(s->>'date') last_date from jsonb_array_elements(m.personal_plan->'activities') a cross join lateral jsonb_array_elements(a->'sessions') s where a->>'status'<>'Ferdig'
  ) b where today::text between b.first_date and b.last_date order by m.id limit 101
 )
 select coalesce(jsonb_agg(case when p_id is null then jsonb_build_object('id',id,'company_id',company_id,'title',title,'address',address,'reference',reference,'revision',revision,'first_date',first_date,'last_date',last_date)
 else to_jsonb(active)-'personal_plan'-'first_date'-'last_date'||jsonb_build_object('plan',personal_plan) end order by id),'[]') into items from active;
 if p_id is not null then
  record:=items->0;if record is null then raise exception 'Du har ingen aktive oppgaver i denne planen nå.' using errcode='42501';end if;
  return jsonb_build_object('context',x,'active_date',today,'record',record);
 end if;
 more:=jsonb_array_length(items)>100;if more then items:=items-100;end if;
 return jsonb_build_object('context',x,'active_date',today,'plans',items,'next',case when more then items->-1->>'id' else null end);
end $$;
revoke all on function public.kshms_progress_people(uuid),public.kshms_progress_mine(uuid,uuid,uuid) from public,anon,service_role;
grant execute on function public.kshms_progress_people(uuid),public.kshms_progress_mine(uuid,uuid,uuid) to authenticated;

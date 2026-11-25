-- Personal landing metadata is company-license based; content remains user scoped.
create function public.get_my_personal_context() returns jsonb
language plpgsql security definer set search_path='' as $$
declare c uuid:=public.current_active_company_scope_id();u uuid:=auth.uid();admin boolean;ks boolean;hr boolean;usable_hr boolean;
begin
 if u is null or c is null or not exists(select 1 from public.sales_company_memberships m join public.profiles p on p.id=m.user_id
  where m.company_id=c and m.user_id=u and m.workspace_role in ('firmaadmin','ansatt')
  and p.approved and not coalesce(p.deactivated,false) and p.role in ('admin','member','ansatt','firmaadmin'))
 then raise exception 'Aktiv intern bruker og arbeidsprofil kreves.' using errcode='42501';end if;
 select workspace_role='firmaadmin' into admin from public.sales_company_memberships where company_id=c and user_id=u;
 ks:=exists(select 1 from public.company_module_access where company_id=c and module_key='kshms' and enabled);
 hr:=exists(select 1 from public.company_module_access where company_id=c and module_key='hr' and enabled);
 usable_hr:=hr_private.has_module_access(c,u) and (admin or exists(select 1 from hr_private.firms where company_id=c and enabled));
 return jsonb_build_object('company_id',c,'user_id',u,'company_name',(select display_name from public.sales_company_scopes where id=c),
  'personal_page',ks or hr,'company_kshms',ks,'company_hr',hr,
  'hr_management',usable_hr and (admin or exists(select 1 from hr_private.employees e
   where e.company_id=c and e.leader_id=u and hr_private.active_member(c,e.user_id))), 'content_enabled',false);
end$$;

create function public.hr_personal_list(p_company_id uuid,p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;rows jsonb;begin
 x:=hr_private.require_context(p_company_id);
 select coalesce(jsonb_agg(hr_private.employee_json(q) order by q.id),'[]'::jsonb) into rows from
 (select e.* from hr_private.employees e where e.company_id=p_company_id and (p_after is null or e.id>p_after)
  and hr_private.can_read(p_company_id,e,auth.uid())
  and (e.user_id=auth.uid() or exists(select 1 from hr_private.readers r where r.employee_id=e.id and r.company_id=p_company_id and r.user_id=auth.uid()))
  order by e.id limit 100) q;
 return jsonb_build_object('context',x,'employees',rows,'next',case when jsonb_array_length(rows)=100 then rows->99->>'id' else null end,'content_enabled',false);
end$$;

create function public.hr_management_list(p_company_id uuid,p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;rows jsonb;a boolean;begin
 x:=hr_private.require_context(p_company_id);a:=(x->>'administer')::boolean;
 if not a and not exists(select 1 from hr_private.employees e where e.company_id=p_company_id and e.leader_id=auth.uid() and hr_private.active_member(p_company_id,e.user_id))
 then raise exception 'HR-arbeidsflaten er for firmaadmin og registrert nærmeste leder.' using errcode='42501';end if;
 select coalesce(jsonb_agg(hr_private.employee_json(q) order by q.id),'[]'::jsonb) into rows from
 (select e.* from hr_private.employees e where e.company_id=p_company_id and (p_after is null or e.id>p_after)
  and hr_private.can_read(p_company_id,e,auth.uid()) and (a or e.leader_id=auth.uid()) order by e.id limit 100) q;
 return jsonb_build_object('context',x,'employees',rows,'next',case when jsonb_array_length(rows)=100 then rows->99->>'id' else null end,'content_enabled',false);
end$$;

revoke all on function public.get_my_personal_context(),public.hr_personal_list(uuid,uuid),public.hr_management_list(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.get_my_personal_context(),public.hr_personal_list(uuid,uuid),public.hr_management_list(uuid,uuid) to authenticated;

-- Contact content is prepared, but never bypasses H3's CLOSED runtime gate.
-- It is an existing purge-managed artifact, not Auth metadata/public/company data.
create index hr_artifacts_contact on hr_private.artifacts(company_id,employee_id)
 where kind='content' and payload->>'type'='contact_profile';
create function public.hr_contact_get(p_company_id uuid,p_employee_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;e hr_private.employees%rowtype;a hr_private.artifacts%rowtype;ready boolean;
begin
 x:=hr_private.require_context(p_company_id);
 select * into e from hr_private.employees where company_id=p_company_id
  and (case when p_employee_id is null then user_id=auth.uid() else id=p_employee_id end);
 if e.id is null and p_employee_id is null then return jsonb_build_object('context',x,'registered',false,'available',false);end if;
 if e.id is null or not hr_private.can_read(p_company_id,e,auth.uid())
 then raise exception 'Kontaktprofilen er ikke tilgjengelig.' using errcode='42501';end if;
 select content_enabled and not restore_quarantined into ready from hr_private.runtime_state where singleton;
 if not coalesce(ready,false) then return jsonb_build_object('context',x,'registered',true,'available',false,'employee',jsonb_build_object('id',e.id,'revision',e.revision));end if;
 perform hr_private.require_content_ready();
 select * into a from hr_private.artifacts where company_id=p_company_id and employee_id=e.id
  and kind='content' and payload->>'type'='contact_profile'
  and not exists(select 1 from hr_private.purge_receipts p where p.company_id=e.company_id and p.employee_id=e.id and p.through_revision>=employee_revision)
  order by (payload->>'revision')::integer desc,id desc limit 1;
 return jsonb_build_object('context',x,'registered',true,'available',true,'employee',jsonb_build_object('id',e.id,'revision',e.revision),
  'editable',e.user_id=auth.uid(),'revision',coalesce((a.payload->>'revision')::integer,0),'data',coalesce(a.payload->'data','{}'::jsonb));
end$$;

create function public.hr_contact_save(p_company_id uuid,p_employee_id uuid,p_employee_revision integer,p_contact_revision integer,p_data jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare x jsonb;e hr_private.employees%rowtype;old_revision integer;fields jsonb:='{}';k text;v text;r date;
begin
 -- Same lock order as register/closure: firm then employee. Fresh access each call.
 select review_on into r from hr_private.firms where company_id=p_company_id for update;
 x:=hr_private.require_context(p_company_id);perform hr_private.require_content_ready();
 select * into e from hr_private.employees where company_id=p_company_id and id=p_employee_id for update;
 if e.id is null or e.user_id is distinct from auth.uid() or not hr_private.can_read(p_company_id,e,auth.uid())
 then raise exception 'Bare medarbeideren kan endre egen kontaktprofil.' using errcode='42501';end if;
 if e.revision is distinct from p_employee_revision then raise exception 'Medarbeidertilgangen er endret.' using errcode='40001';end if;
 if r is null or r<(now() at time zone 'Europe/Oslo')::date then raise exception 'Firmaadmin må fornye HR-kontrollfristen før lagring.' using errcode='22023';end if;
 if p_data is null or jsonb_typeof(p_data)<>'object' or pg_column_size(p_data)>6000
 then raise exception 'Ugyldig kontaktprofil.' using errcode='22023';end if;
 for k,v in select key,value from jsonb_each_text(p_data) loop
  if k not in ('address','postal_code','city','relative_name','relative_relationship','relative_phone','relative_email') or jsonb_typeof(p_data->k)<>'string'
  then raise exception 'Ugyldig kontaktfelt.' using errcode='22023';end if;
  v:=trim(v);
  if length(v)>(case k when 'address' then 160 when 'postal_code' then 20 when 'city' then 80 when 'relative_name' then 120 when 'relative_relationship' then 60 when 'relative_phone' then 40 else 254 end)
  then raise exception 'Kontaktfeltet er for langt.' using errcode='22023';end if;
  if v<>'' then fields:=fields||jsonb_build_object(k,v);end if;
 end loop;
 select coalesce(max((payload->>'revision')::integer),0) into old_revision from hr_private.artifacts
  where company_id=p_company_id and employee_id=e.id and kind='content' and payload->>'type'='contact_profile';
 if old_revision is distinct from p_contact_revision then raise exception 'Kontaktprofilen er endret i en annen økt.' using errcode='40001';end if;
 -- Contact corrections replace earlier values; no unnecessary relative history.
 delete from hr_private.artifacts where company_id=p_company_id and employee_id=e.id and kind='content' and payload->>'type'='contact_profile';
 insert into hr_private.artifacts(company_id,employee_id,employee_revision,kind,payload,review_on)
 values(p_company_id,e.id,e.revision,'content',jsonb_build_object('type','contact_profile','revision',old_revision+1,'data',fields),r);
 return jsonb_build_object('context',x,'employee',jsonb_build_object('id',e.id,'revision',e.revision),'revision',old_revision+1);
end$$;
revoke all on function public.hr_contact_get(uuid,uuid),public.hr_contact_save(uuid,uuid,integer,integer,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.hr_contact_get(uuid,uuid),public.hr_contact_save(uuid,uuid,integer,integer,jsonb) to authenticated;

-- Optional company preference. Missing value means off. Existing grants and authorization are retained.
create or replace function public.time_setup_save(p_company_id uuid,p_revision integer,p_content jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;s time_private.settings;cat jsonb;oldcat jsonb;key text;v text;uid uuid;ids text[]:=array[]::text[];begin
 x:=time_private.actor(p_company_id,false);if not(x->>'time_admin')::boolean then raise exception 'Bare timeansvarlig eller firmaadmin kan lagre.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('time-setup:'||p_company_id::text,0));
 select * into s from time_private.settings where company_id=p_company_id for update;
 if coalesce(s.revision,0) is distinct from p_revision then raise exception 'Timeoppsettet er endret. Hent på nytt.' using errcode='40001';end if;
 if jsonb_typeof(p_content)<>'object' or p_content is null or not(p_content?&array['enabled','categories','employee_numbers','project_numbers','managers','export','deadline_day','deadline_time']) or octet_length(p_content::text)>250000
 or exists(select 1 from jsonb_object_keys(p_content) k where k not in('mobile_shortcut','enabled','categories','employee_numbers','project_numbers','managers','export','deadline_day','deadline_time'))
 or (p_content?'mobile_shortcut' and jsonb_typeof(p_content->'mobile_shortcut') is distinct from 'boolean')
 or jsonb_typeof(p_content->'enabled') is distinct from 'boolean' or jsonb_typeof(p_content->'categories') is distinct from 'array'
 or jsonb_array_length(p_content->'categories') not between 1 and 100
 or jsonb_typeof(p_content->'employee_numbers') is distinct from 'object' or jsonb_typeof(p_content->'project_numbers') is distinct from 'object'
 or jsonb_typeof(p_content->'managers') is distinct from 'array' or jsonb_array_length(p_content->'managers')>10
 or (p_content->>'deadline_day')!~'^[0-6]$' or (p_content->>'deadline_time')!~'^([01][0-9]|2[0-3]):[0-5][0-9]$'
 then raise exception 'Kontroller timeoppsettet.' using errcode='22023';end if;
 if not(x->>'administer')::boolean and p_content->'managers' is distinct from s.content->'managers' then raise exception 'Firmaadmin velger timeansvarlige.' using errcode='42501';end if;
 for v in select jsonb_array_elements_text(p_content->'managers') loop
 uid:=v::uuid;if not hr_private.has_module_access(p_company_id,uid) then raise exception 'Timeansvarlig må ha aktiv HR-tilgang i firmaet.' using errcode='42501';end if;end loop;
 for cat in select jsonb_array_elements(p_content->'categories') loop
 uid:=(cat->>'id')::uuid;
 if uid is null or uid::text=any(ids) or jsonb_typeof(cat)<>'object' or not(cat?&array['id','name','kind','unit','payroll_code','active','project_required','receipt_required']) or cat->>'name' is null or cat->>'kind' is null or cat->>'unit' is null or length(trim(cat->>'name')) not between 1 and 80 or cat->>'kind' not in('work','overtime','absence','travel','allowance','expense')
 or cat->>'unit' not in('hours','km','nok','count') or length(coalesce(cat->>'payroll_code',''))>40
 or coalesce(cat->>'payroll_code','')~'[[:cntrl:]]' or jsonb_typeof(cat->'active') is distinct from 'boolean'
 or jsonb_typeof(cat->'project_required') is distinct from 'boolean' or jsonb_typeof(cat->'receipt_required') is distinct from 'boolean'
 or(cat->>'kind' in('work','overtime') and cat->>'unit'<>'hours') or(cat->>'kind'='expense' and(cat->>'unit'<>'nok' or not(cat->>'receipt_required')::boolean))
 or exists(select 1 from jsonb_object_keys(cat) k where k not in('id','name','kind','unit','payroll_code','active','project_required','receipt_required'))
 then raise exception 'Kontroller navn, type, enhet og lønnskode for hver kategori.' using errcode='22023';end if;
 ids:=array_append(ids,uid::text);
 select value into oldcat from jsonb_array_elements(s.content->'categories') where value->>'id'=uid::text;
 if oldcat is not null and(cat->>'kind',cat->>'unit') is distinct from(oldcat->>'kind',oldcat->>'unit') and exists(select 1 from time_private.sheets sh,jsonb_array_elements(sh.entries) e where sh.company_id=p_company_id and e->>'category_id'=uid::text)
 then raise exception 'En brukt kategori beholder type og enhet. Opprett en ny kategori.' using errcode='22023';end if;
 end loop;
 if exists(select 1 from time_private.sheets sh,jsonb_array_elements(sh.entries) e where sh.company_id=p_company_id and not(e->>'category_id'=any(ids))) then raise exception 'Brukte kategorier kan deaktiveres, ikke fjernes.' using errcode='22023';end if;
 for key,v in select * from jsonb_each_text(p_content->'employee_numbers') loop
 uid:=key::uuid;if length(trim(v)) not between 1 and 40 or v~'[[:cntrl:]]' or not exists(select 1 from hr_private.employees where company_id=p_company_id and user_id=uid) and not exists(select 1 from time_private.sheets where company_id=p_company_id and user_id=uid) then raise exception 'Kontroller ansattnumrene.' using errcode='22023';end if;end loop;
 if exists(select 1 from jsonb_each_text(p_content->'employee_numbers') group by value having count(*)>1) then raise exception 'Ansattnumre må være unike i firmaet.' using errcode='22023';end if;
 for key,v in select * from jsonb_each_text(p_content->'project_numbers') loop
 uid:=key::uuid;if length(trim(v)) not between 1 and 40 or v~'[[:cntrl:]]' or not exists(select 1 from public.projects where id=uid and company_scope_id=p_company_id) then raise exception 'Kontroller prosjektnumrene.' using errcode='22023';end if;end loop;
 cat:=p_content->'export';
 if jsonb_typeof(cat)<>'object' or not(cat?&array['separator','decimal','date_format','columns']) or cat->>'separator' is null or cat->>'decimal' is null or cat->>'date_format' is null or cat->>'separator' not in(';',',') or cat->>'decimal' not in('.',',') or cat->>'date_format' not in('yyyy-mm-dd','dd.mm.yyyy') or jsonb_typeof(cat->'columns') is distinct from 'array' or jsonb_array_length(cat->'columns') not between 4 and 10
 then raise exception 'Kontroller CSV-oppsettet.' using errcode='22023';end if;
 ids:=array[]::text[];for oldcat in select jsonb_array_elements(cat->'columns') loop
 if oldcat->>'key' is null or oldcat->>'label' is null or oldcat->>'key' not in('employee_number','on','payroll_code','quantity','unit','project_number','category','note','entry_id','receipts') or oldcat->>'key'=any(ids) or length(trim(oldcat->>'label')) not between 1 and 80 then raise exception 'Kontroller eksportkolonnene.' using errcode='22023';end if;
 ids:=array_append(ids,oldcat->>'key');end loop;
 if not(ids@>array['employee_number','on','payroll_code','quantity']) then raise exception 'Ansattnummer, dato, lønnsart og antall må være med i eksporten.' using errcode='22023';end if;
 insert into time_private.settings(company_id,revision,content,changed_by,enabled_since) values(p_company_id,p_revision+1,p_content,auth.uid(),case when(p_content->>'enabled')::boolean then(now() at time zone 'Europe/Oslo')::date else null end)
 on conflict(company_id) do update set revision=excluded.revision,content=excluded.content,changed_by=excluded.changed_by,changed_at=now(),enabled_since=case when not(p_content->>'enabled')::boolean then null else coalesce(time_private.settings.enabled_since,excluded.enabled_since) end;
 insert into time_private.enrollments(company_id,employee_id,from_on) select p_company_id,e.id,(now() at time zone 'Europe/Oslo')::date from hr_private.employees e where e.company_id=p_company_id on conflict do nothing;
 return public.time_setup_get(p_company_id);
end$$;

create or replace function public.time_tasks_get(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;e hr_private.employees;review_count integer;returned_count integer;begin
 x:=time_private.actor(p_company_id,false);select * into e from hr_private.employees where company_id=p_company_id and user_id=auth.uid();
 select count(*) into review_count from time_private.sheets s where company_id=p_company_id and state='submitted' and time_private.can_review(s,auth.uid());
 select count(*) into returned_count from time_private.sheets s where company_id=p_company_id and employee_id=e.id and state='returned';
 return jsonb_build_object('context',x,'registered',e.id is not null,'enabled',coalesce((select(content->>'enabled')::boolean from time_private.settings where company_id=p_company_id),false),
 'mobile_shortcut',e.id is not null and coalesce((select (content->>'enabled')::boolean and (content->>'mobile_shortcut')::boolean from time_private.settings where company_id=p_company_id),false),
 'missing_week',case when e.id is not null then time_private.missing_week(p_company_id,e.id) else null end,'returned_count',returned_count,'review_count',review_count,
 'can_manage',(x->>'time_admin')::boolean or exists(select 1 from hr_private.employees where company_id=p_company_id and leader_id=auth.uid()),
 'email_enabled',exists(select 1 from time_private.mail_settings where singleton and enabled));
end$$;
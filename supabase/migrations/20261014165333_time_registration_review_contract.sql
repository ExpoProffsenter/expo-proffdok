-- Sandbox had an earlier time prototype. Align reviewed contracts without changing existing payroll rows or HR functions.
alter table time_private.timers add column if not exists external_project text;
create or replace function time_private.is_admin(c uuid,u uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select hr_private.has_module_access(c,u) and (exists(select 1 from public.sales_company_memberships where company_id=c and user_id=u and workspace_role='firmaadmin')
 or exists(select 1 from time_private.settings s,jsonb_array_elements_text(s.content->'managers') m where s.company_id=c and m=u::text))
$$;

create or replace function time_private.actor(c uuid,enabled_only boolean default true) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;s time_private.settings;begin
 x:=hr_private.require_context(c);perform hr_private.require_content_ready();
 select * into s from time_private.settings where company_id=c for share;
 if enabled_only and not coalesce((s.content->>'enabled')::boolean,false) then raise exception 'Timeregistrering er ikke aktivert. Kontakt firmaadmin.' using errcode='42501';end if;
 return x||jsonb_build_object('time_admin',time_private.is_admin(c,auth.uid()));
end$$;

create or replace function time_private.can_read(s time_private.sheets,u uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select hr_private.has_module_access(s.company_id,u) and (
 time_private.is_admin(s.company_id,u) or exists(select 1 from hr_private.employees e where e.company_id=s.company_id and e.id=s.employee_id and e.user_id=s.user_id
 and hr_private.active_member(e.company_id,e.user_id) and (e.user_id=u or(e.leader_id=u and s.state in('submitted','approved','returned')))))
$$;

create or replace function time_private.can_review(s time_private.sheets,u uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select u<>s.user_id and hr_private.has_module_access(s.company_id,u) and(time_private.is_admin(s.company_id,u)
 or exists(select 1 from hr_private.employees e where e.company_id=s.company_id and e.id=s.employee_id and e.leader_id=u and hr_private.active_member(e.company_id,e.user_id)))
$$;

create or replace function time_private.sheet_json(s time_private.sheets) returns jsonb
language sql security definer set search_path='' as $$select to_jsonb(s)||jsonb_build_object('can_review',time_private.can_review(s,auth.uid()),
 'files',coalesce((select jsonb_agg(jsonb_build_object('id',f.id,'name',f.name,'size_bytes',f.size_bytes,'mime_type',f.mime_type,'sha256',f.sha256) order by f.created_at)
 from time_private.files f where f.sheet_id=s.id and f.ready),'[]'::jsonb))$$;

create or replace function public.time_setup_get(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;s time_private.settings;members jsonb;begin
 x:=time_private.actor(p_company_id,false);
 if not(x->>'time_admin')::boolean then raise exception 'Bare timeansvarlig eller firmaadmin kan åpne timeoppsettet.' using errcode='42501';end if;
 select * into s from time_private.settings where company_id=p_company_id;
 select coalesce(jsonb_agg(to_jsonb(q) order by q.label,q.user_id),'[]') into members from(
 select e.id employee_id,e.user_id,coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),p.email,'Medarbeider') label,
 hr_private.has_module_access(p_company_id,e.user_id) active from hr_private.employees e join public.profiles p on p.id=e.user_id join auth.users u on u.id=e.user_id where e.company_id=p_company_id
 union select null,sh.user_id,max(sh.employee_label),false from time_private.sheets sh where sh.company_id=p_company_id and not exists(select 1 from hr_private.employees e where e.company_id=p_company_id and e.user_id=sh.user_id) group by sh.user_id
 )q;
 if jsonb_array_length(members)>1000 then raise exception 'Timeoppsettet krever paginering for dette firmaet.' using errcode='54000';end if;
 return jsonb_build_object('context',x,'revision',coalesce(s.revision,0),'content',s.content,'members',members);
end$$;

create or replace function public.time_setup_save(p_company_id uuid,p_revision integer,p_content jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;s time_private.settings;cat jsonb;oldcat jsonb;key text;v text;uid uuid;ids text[]:=array[]::text[];begin
 x:=time_private.actor(p_company_id,false);if not(x->>'time_admin')::boolean then raise exception 'Bare timeansvarlig eller firmaadmin kan lagre.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('time-setup:'||p_company_id::text,0));
 select * into s from time_private.settings where company_id=p_company_id for update;
 if coalesce(s.revision,0) is distinct from p_revision then raise exception 'Timeoppsettet er endret. Hent på nytt.' using errcode='40001';end if;
 if jsonb_typeof(p_content)<>'object' or p_content is null or not(p_content?&array['enabled','categories','employee_numbers','project_numbers','managers','export','deadline_day','deadline_time']) or octet_length(p_content::text)>250000
 or exists(select 1 from jsonb_object_keys(p_content) k where k not in('enabled','categories','employee_numbers','project_numbers','managers','export','deadline_day','deadline_time'))
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

create or replace function public.time_sheet_get(p_company_id uuid,p_week date,p_employee_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;e hr_private.employees;s time_private.sheets;cfg jsonb;begin
 x:=time_private.actor(p_company_id,false);
 if p_week is null or extract(isodow from p_week)<>1 then raise exception 'Velg en mandag som ukestart.' using errcode='22023';end if;
 select * into e from hr_private.employees where company_id=p_company_id and(case when p_employee_id is null then user_id=auth.uid() else id=p_employee_id end) for share;
 select * into s from time_private.sheets where company_id=p_company_id and employee_id=coalesce(p_employee_id,e.id) and week_on=p_week;
 if s.id is not null and not time_private.can_read(s,auth.uid()) or s.id is null and(e.id is null or e.user_id<>auth.uid() and not(time_private.is_admin(p_company_id,auth.uid()) or e.leader_id=auth.uid())) then raise exception 'Timeuken er ikke tilgjengelig.' using errcode='42501';end if;
 select content into cfg from time_private.settings where company_id=p_company_id;
 return jsonb_build_object('context',x,'employee',case when e.id is null then jsonb_build_object('id',s.employee_id,'user_id',s.user_id,'label',s.employee_label,'archived',true) else jsonb_build_object('id',e.id,'user_id',e.user_id,'label',coalesce(hr_private.employee_json(e)->>'full_name',hr_private.employee_json(e)->>'email'),'leader_id',e.leader_id) end,
 'settings_revision',coalesce((select revision from time_private.settings where company_id=p_company_id),0),'settings',cfg-'employee_numbers'-'project_numbers'-'managers',
 'sheet',case when s.id is not null then time_private.sheet_json(s) else null end);
end$$;

create or replace function public.time_projects(p_company_id uuid,p_query text default '',p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare rows jsonb;begin
 perform time_private.actor(p_company_id,false);
 select coalesce(jsonb_agg(to_jsonb(q) order by q.id),'[]') into rows from(select p.id,coalesce(nullif(p.data->>'projectName',''),nullif(p.data->>'name',''),'Prosjekt') label,
 coalesce(p.data->>'projectNumber',p.data->>'projectNo','') number from public.projects p where p.company_scope_id=p_company_id
 and public.project_row_access_allowed(p.company_scope_id,p.user_id) and(p_after is null or p.id>p_after)
 and coalesce(p.data->>'projectName',p.data->>'name','Prosjekt') ilike '%'||left(coalesce(p_query,''),80)||'%' order by p.id limit 50)q;
 return jsonb_build_object('context',time_private.actor(p_company_id,false),'projects',rows,'next',case when jsonb_array_length(rows)=50 then rows->49->>'id' else null end);
end$$;

create or replace function time_private.validate_entries(c uuid,sid uuid,uid uuid,w date,items jsonb,complete boolean) returns jsonb
language plpgsql security definer set search_path='' as $$declare external_ref text;item jsonb;cat jsonb;cfg jsonb;result jsonb:='[]';ids text[]:=array[]::text[];fileid text;pid uuid;n numeric;span integer;pause integer;startmin integer;endmin integer;startlocal timestamp;endlocal timestamp;startutc timestamptz;endutc timestamptz;begin
 if jsonb_typeof(items) is distinct from 'array' or jsonb_array_length(items)>200 or octet_length(items::text)>250000 then raise exception 'En uke kan ha høyst 200 linjer.' using errcode='22023';end if;
 select content into cfg from time_private.settings where company_id=c;
 for item in select jsonb_array_elements(items) loop
 if(item->>'id') is null or(item->>'id')::uuid::text=any(ids) or jsonb_typeof(item)<>'object' or exists(select 1 from jsonb_object_keys(item) k where k not in('id','on','category_id','project_id','external_project','mode','quantity','start','end','pause','next_day','note','files'))
 or item->>'on' is null or(item->>'on')::date not between w and w+6 or length(coalesce(item->>'note',''))>500
 or jsonb_typeof(item->'files') is distinct from 'array' or jsonb_array_length(item->'files')>5
 then raise exception 'Kontroller dato, kategori, merknad og vedlegg.' using errcode='22023';end if;
 ids:=array_append(ids,(item->>'id')::uuid::text);
 select value into cat from jsonb_array_elements(cfg->'categories') where value->>'id'=item->>'category_id' and(value->>'active')::boolean;
 if cat is null then raise exception 'Velg en aktiv timekategori.' using errcode='22023';end if;
 pid:=nullif(item->>'project_id','')::uuid;
 external_ref:=nullif(trim(item->>'external_project'),'');
 if jsonb_typeof(item->'external_project') is not null and jsonb_typeof(item->'external_project') not in('string','null') or length(external_ref)>240 or external_ref~'[[:cntrl:]]' or pid is not null and external_ref is not null then raise exception 'Velg ett prosjekt fra ProffDok eller skriv en prosjektreferanse på høyst 240 tegn.' using errcode='22023';end if;
 if pid is not null and not exists(select 1 from public.projects p where p.id=pid and p.company_scope_id=c and public.project_row_access_allowed(p.company_scope_id,p.user_id)) then raise exception 'Prosjektet er ikke tilgjengelig i firmaet.' using errcode='42501';end if;
 if(cat->>'project_required')::boolean and pid is null and external_ref is null then raise exception 'Denne kategorien krever prosjekt.' using errcode='22023';end if;
 if item->>'mode'='clock' and cat->>'unit'='hours' then
 if(item->>'start')!~'^([01][0-9]|2[0-3]):[0-5][0-9]$' or(item->>'end')!~'^([01][0-9]|2[0-3]):[0-5][0-9]$' or jsonb_typeof(item->'next_day') is distinct from 'boolean' then raise exception 'Kontroller klokkeslett.' using errcode='22023';end if;
 startmin:=extract(hour from(item->>'start')::time)::integer*60+extract(minute from(item->>'start')::time)::integer;
 endmin:=extract(hour from(item->>'end')::time)::integer*60+extract(minute from(item->>'end')::time)::integer+case when(item->>'next_day')::boolean then 1440 else 0 end;
 pause:=(item->>'pause')::integer;span:=endmin-startmin;
 if pause is null or pause<0 or span<=0 or span>1440 or pause>=span then raise exception 'Kontroller pause og neste dag.' using errcode='22023';end if;
 startlocal:=(item->>'on')::date+(item->>'start')::time;endlocal:=(item->>'on')::date+(item->>'end')::time+case when(item->>'next_day')::boolean then interval '1 day' else interval '0' end;
 startutc:=startlocal at time zone 'Europe/Oslo';endutc:=endlocal at time zone 'Europe/Oslo';
 if startutc at time zone 'Europe/Oslo'<>startlocal or endutc at time zone 'Europe/Oslo'<>endlocal or(startutc-interval '1 hour') at time zone 'Europe/Oslo'=startlocal or(endutc-interval '1 hour') at time zone 'Europe/Oslo'=endlocal then raise exception 'Klokkeslettet er tvetydig ved omstilling til sommertid/vintertid. Bruk antall timer for denne registreringen.' using errcode='22023';end if;
 n:=round((extract(epoch from endutc-startutc)/60-pause)::numeric/60,4);
 elsif item->>'mode'='quantity' then
 if(item->>'quantity')!~'^[0-9]+(\.[0-9]{1,2})?$' then raise exception 'Før et positivt antall med høyst to desimaler.' using errcode='22023';end if;n:=(item->>'quantity')::numeric;
 else raise exception 'Velg antall eller klokkeslett.' using errcode='22023';end if;
 if n is null or n<=0 or n>1000000 or(cat->>'unit'='hours' and n>24) then raise exception 'Kontroller antallet.' using errcode='22023';end if;
 for fileid in select jsonb_array_elements_text(item->'files') loop
 if not exists(select 1 from time_private.files f where f.id=fileid::uuid and f.company_id=c and f.user_id=uid and f.sheet_id=sid and f.ready and exists(select 1 from storage.objects o where o.bucket_id='time-private' and o.name=f.object_path)) then raise exception 'Et vedlegg mangler eller tilhører en annen uke.' using errcode='42501';end if;end loop;
 if complete and(cat->>'receipt_required')::boolean and jsonb_array_length(item->'files')=0 then raise exception 'Denne kategorien krever kvittering før innlevering.' using errcode='22023';end if;
 result:=result||jsonb_build_array(item||jsonb_build_object('quantity',n,'external_project',external_ref,'category',cat-'payroll_code','project_label',coalesce(external_ref,(select coalesce(p.data->>'projectName',p.data->>'name','Prosjekt') from public.projects p where p.id=pid)),
 'project_number',coalesce(external_ref,cfg#>>array['project_numbers',pid::text],(select coalesce(p.data->>'projectNumber',p.data->>'projectNo','') from public.projects p where p.id=pid),'')));
 end loop;
 -- Clock intervals cannot overlap, including the next calendar day. Quantity-only entries have no fabricated clock interval.
 if exists(select 1 from jsonb_array_elements(result) a,jsonb_array_elements(result) b where a->>'id'<b->>'id' and a->>'mode'='clock' and b->>'mode'='clock'
 and tsrange((a->>'on')::date+(a->>'start')::time,(a->>'on')::date+(a->>'end')::time+case when(a->>'next_day')::boolean then interval '1 day' else interval '0' end,'[)')
 &&tsrange((b->>'on')::date+(b->>'start')::time,(b->>'on')::date+(b->>'end')::time+case when(b->>'next_day')::boolean then interval '1 day' else interval '0' end,'[)')) then raise exception 'To klokkeslettføringer overlapper. Kontroller dagene.' using errcode='22023';end if;
 return result;
end$$;

create or replace function public.time_sheet_command(p_company_id uuid,p_week date,p_employee_id uuid,p_revision integer,p_operation_id uuid,p_action text,p_entries jsonb default '[]',p_empty_week boolean default false,p_note text default '') returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;e hr_private.employees;s time_private.sheets;op time_private.operations;request jsonb;items jsonb;result jsonb;begin
 x:=time_private.actor(p_company_id);if p_operation_id is null or p_action is null or p_action not in('save','submit','withdraw','approve','return','reopen') or p_week is null or extract(isodow from p_week)<>1 or p_week not between date '2020-01-01' and current_date+366 or p_empty_week is null then raise exception 'Ugyldig timehandling.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('time-week:'||p_company_id::text||coalesce(p_employee_id::text,'')||p_week::text,0));
 select * into e from hr_private.employees where company_id=p_company_id and id=p_employee_id for share;
 select * into s from time_private.sheets where company_id=p_company_id and employee_id=p_employee_id and week_on=p_week for update;
 if s.id is not null and not time_private.can_read(s,auth.uid()) or s.id is null and(e.id is null or e.user_id<>auth.uid()) then raise exception 'Timeuken er ikke tilgjengelig.' using errcode='42501';end if;
 request:=jsonb_build_object('week',p_week,'employee',p_employee_id,'revision',p_revision,'action',p_action,'entries',p_entries,'empty',p_empty_week,'note',p_note);
 perform pg_advisory_xact_lock(hashtextextended('time-op:'||p_company_id::text||auth.uid()::text||p_operation_id::text,0));
 select * into op from time_private.operations where company_id=p_company_id and actor_id=auth.uid() and id=p_operation_id;
 if op.id is not null then if op.request is distinct from request then raise exception 'Handlings-ID er allerede brukt.' using errcode='40001';end if;return op.response;end if;
 if coalesce(s.revision,0) is distinct from p_revision then raise exception 'Uken er endret. Hent den lagrede utgaven før du fortsetter.' using errcode='40001';end if;
 if s.export_locked then raise exception 'Uken inngår i lønnseksport og kan ikke endres.' using errcode='22023';end if;
 if p_action in('save','submit','withdraw') then
 if e.id is null or e.user_id<>auth.uid() or not hr_private.active_member(p_company_id,e.user_id) then raise exception 'Du kan bare føre egne timer.' using errcode='42501';end if;
 if p_action='withdraw' and s.state is distinct from 'submitted' or p_action in('save','submit') and s.id is not null and s.state not in('draft','returned') then raise exception 'Uken kan ikke redigeres nå.' using errcode='22023';end if;
 if s.id is null then
 insert into time_private.sheets(company_id,employee_id,user_id,employee_label,week_on,revision) values(p_company_id,e.id,e.user_id,left(coalesce(hr_private.employee_json(e)->>'full_name',hr_private.employee_json(e)->>'email','Medarbeider'),180),p_week,0) returning * into s;
 end if;
 if p_action<>'withdraw' then
 items:=time_private.validate_entries(p_company_id,s.id,e.user_id,p_week,p_entries,p_action='submit');
 if p_action='submit' and jsonb_array_length(items)=0 and not p_empty_week or jsonb_array_length(items)>0 and p_empty_week then raise exception 'Før timer eller bekreft at uken er uten registreringer.' using errcode='22023';end if;
 if p_action='submit' and e.leader_id is null and not exists(select 1 from public.sales_company_memberships m where m.company_id=p_company_id and m.user_id<>e.user_id and time_private.is_admin(p_company_id,m.user_id)) then raise exception 'Firmaadmin må registrere en annen leder eller timeansvarlig før innlevering.' using errcode='22023';end if;
 s.entries:=items;s.empty_week:=p_empty_week;end if;
 s.state:=case p_action when 'submit' then 'submitted' when 'withdraw' then 'draft' else s.state end;
 if p_action='submit' then s.submitted_at:=now();s.return_note:='';end if;
 else
 if not time_private.can_review(s,auth.uid()) then raise exception 'Du kan ikke godkjenne egne eller andre lederes timer.' using errcode='42501';end if;
 if p_action in('approve','return') and s.state<>'submitted' or p_action='reopen' and s.state<>'approved' then raise exception 'Uken har en annen status.' using errcode='22023';end if;
 if p_action in('return','reopen') and length(trim(coalesce(p_note,''))) not between 5 and 300 then raise exception 'Skriv en kort begrunnelse på 5–300 tegn.' using errcode='22023';end if;
 s.state:=case p_action when 'approve' then 'approved' else 'returned' end;s.return_note:=case p_action when 'approve' then '' else trim(p_note) end;
 s.approved_at:=case p_action when 'approve' then now() else null end;s.approved_by:=case p_action when 'approve' then auth.uid() else null end;
 end if;
 s.revision:=s.revision+1;s.updated_at:=now();
 update time_private.sheets set revision=s.revision,state=s.state,entries=s.entries,empty_week=s.empty_week,return_note=s.return_note,submitted_at=s.submitted_at,approved_at=s.approved_at,approved_by=s.approved_by,updated_at=s.updated_at where id=s.id;
 insert into time_private.history values(s.id,s.revision,auth.uid(),p_action,now(),to_jsonb(s));
 result:=public.time_sheet_get(p_company_id,p_week,p_employee_id);
 insert into time_private.operations(company_id,actor_id,id,request,response) values(p_company_id,auth.uid(),p_operation_id,request,result);
 return result;
end$$;

create or replace function public.time_review_list(p_company_id uuid,p_from date,p_to date,p_after uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;rows jsonb;begin
 x:=time_private.actor(p_company_id,false);
 if p_from is null or p_to is null or p_to<p_from or p_to-p_from>93 then raise exception 'Velg en periode på høyst 94 dager.' using errcode='22023';end if;
 select coalesce(jsonb_agg(time_private.sheet_json(q::time_private.sheets) order by q.week_on desc,q.id),'[]') into rows from(select s.* from time_private.sheets s where s.company_id=p_company_id
 and s.week_on<=p_to and s.week_on+6>=p_from and(s.state<>'draft' or(time_private.is_admin(p_company_id,auth.uid()) and s.user_id<>auth.uid())) and time_private.can_read(s,auth.uid()) and(p_after is null or s.id>p_after) order by s.id limit 50)q;
 return jsonb_build_object('context',x,'sheets',rows,'next',case when jsonb_array_length(rows)=50 then(select max((value->>'id')::text) from jsonb_array_elements(rows)) else null end);
end$$;

create or replace function public.time_history(p_company_id uuid,p_sheet_id uuid,p_before integer default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare s time_private.sheets;rows jsonb;begin
 perform time_private.actor(p_company_id,false);select * into s from time_private.sheets where company_id=p_company_id and id=p_sheet_id;
 if s.id is null or not time_private.can_read(s,auth.uid()) then raise exception 'Historikken er ikke tilgjengelig.' using errcode='42501';end if;
 select coalesce(jsonb_agg(to_jsonb(q) order by revision desc),'[]') into rows from(select revision,action,saved_at,actor_id,snapshot from time_private.history where sheet_id=s.id and(p_before is null or revision<p_before) order by revision desc limit 20)q;
 return jsonb_build_object('context',time_private.actor(p_company_id,false),'history',rows,'next',case when jsonb_array_length(rows)=20 then rows->19->>'revision' else null end);
end$$;

create or replace function public.time_file_begin(p_company_id uuid,p_sheet_id uuid,p_id uuid,p_name text,p_size integer,p_mime text,p_sha256 text) returns jsonb
language plpgsql security definer set search_path='' as $$declare s time_private.sheets;f time_private.files;begin
 perform time_private.actor(p_company_id);select * into s from time_private.sheets where company_id=p_company_id and id=p_sheet_id for share;
 if s.id is null or s.user_id<>auth.uid() or s.state not in('draft','returned') or s.export_locked or not time_private.can_read(s,auth.uid()) then raise exception 'Vedlegg kan bare legges til i egen åpne uke.' using errcode='42501';end if;
 select * into f from time_private.files where id=p_id;
 if f.id is not null then if(f.sheet_id,f.name,f.size_bytes,f.mime_type,f.sha256) is distinct from(p_sheet_id,p_name,p_size,p_mime,p_sha256) then raise exception 'Fil-ID er allerede brukt.' using errcode='40001';end if;
 else
 if(select count(*) from time_private.files where sheet_id=s.id)>=50 then raise exception 'En uke kan ha høyst 50 vedlegg.' using errcode='22023';end if;
 insert into time_private.files(id,sheet_id,company_id,user_id,name,size_bytes,mime_type,sha256) values(p_id,s.id,p_company_id,auth.uid(),p_name,p_size,p_mime,p_sha256) returning * into f;end if;
 return jsonb_build_object('context',time_private.actor(p_company_id),'file',to_jsonb(f));
end$$;

create or replace function public.time_file_access(p_path text,p_write boolean default false) returns boolean
language plpgsql security definer set search_path='' as $$declare f time_private.files;s time_private.sheets;begin
 select * into f from time_private.files where object_path=p_path;select * into s from time_private.sheets where id=f.sheet_id;
 if f.id is null or auth.uid() is null then return false;end if;
 perform time_private.actor(f.company_id,p_write);
 return time_private.can_read(s,auth.uid()) and(case when p_write then f.user_id=auth.uid() and not f.ready and f.created_at>now()-interval '1 hour' and s.state in('draft','returned') and not s.export_locked else f.ready end);
 exception when sqlstate '42501' then return false;
end$$;

create or replace function public.time_file_finish(p_company_id uuid,p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare f time_private.files;s time_private.sheets;meta jsonb;begin
 perform time_private.actor(p_company_id);select * into f from time_private.files where company_id=p_company_id and id=p_id for update;
 select * into s from time_private.sheets where id=f.sheet_id for share;
 if f.id is null or f.user_id<>auth.uid() or not time_private.can_read(s,auth.uid()) or s.state not in('draft','returned') then raise exception 'Vedlegget er ikke tilgjengelig.' using errcode='42501';end if;
 select metadata into meta from storage.objects where bucket_id='time-private' and name=f.object_path;
 if meta is null or coalesce(meta->>'size',meta->>'contentLength')::bigint is distinct from f.size_bytes::bigint or meta->>'mimetype' is distinct from f.mime_type then raise exception 'Opplastingen er ikke bekreftet. Prøv igjen.' using errcode='22023';end if;
 update time_private.files set ready=true where id=f.id;f.ready:=true;
 return jsonb_build_object('context',time_private.actor(p_company_id),'file',to_jsonb(f));
end$$;

create or replace function public.time_file_get(p_company_id uuid,p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare f time_private.files;begin
 perform time_private.actor(p_company_id,false);select * into f from time_private.files where company_id=p_company_id and id=p_id;
 if f.id is null or not public.time_file_access(f.object_path,false) then raise exception 'Vedlegget er ikke tilgjengelig.' using errcode='42501';end if;
 return jsonb_build_object('context',time_private.actor(p_company_id,false),'file',to_jsonb(f));
end$$;

create or replace function public.time_export_get(p_company_id uuid,p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;b time_private.exports;begin
 x:=time_private.actor(p_company_id,false);if not(x->>'time_admin')::boolean then raise exception 'Bare timeansvarlig eller firmaadmin kan eksportere.' using errcode='42501';end if;
 select * into b from time_private.exports where company_id=p_company_id and id=p_id;if b.id is null then raise exception 'Eksporten finnes ikke.' using errcode='42501';end if;
 return jsonb_build_object('context',x,'batch',to_jsonb(b)-'request');
end$$;

create or replace function public.time_export_create(p_company_id uuid,p_id uuid,p_from date,p_to date,p_settings_revision integer) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;cfg time_private.settings;b time_private.exports;s time_private.sheets;item jsonb;cat jsonb;rows jsonb:='[]';number text;code text;request jsonb;begin
 x:=time_private.actor(p_company_id);if not(x->>'time_admin')::boolean then raise exception 'Bare timeansvarlig eller firmaadmin kan eksportere.' using errcode='42501';end if;
 if p_id is null or p_from is null or p_to is null or p_to<p_from or p_to-p_from>93 then raise exception 'Velg en lønnsperiode på høyst 94 dager.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('time-export:'||p_company_id::text,0));
 request:=jsonb_build_object('from',p_from,'to',p_to,'settings_revision',p_settings_revision);
 select * into b from time_private.exports where id=p_id;
 if b.id is not null then if b.company_id<>p_company_id or b.actor_id<>auth.uid() or b.request is distinct from request then raise exception 'Eksport-ID er allerede brukt.' using errcode='40001';end if;return public.time_export_get(p_company_id,p_id);end if;
 select * into cfg from time_private.settings where company_id=p_company_id for share;
 if cfg.revision is distinct from p_settings_revision then raise exception 'Eksportoppsettet er endret. Hent på nytt.' using errcode='40001';end if;
 for s in select * from time_private.sheets where company_id=p_company_id and state='approved' and week_on<=p_to and week_on+6>=p_from order by id for update loop
 for item in select value from jsonb_array_elements(s.entries) where(value->>'on')::date between p_from and p_to loop
 if exists(select 1 from time_private.exported_entries where sheet_id=s.id and revision=s.revision and entry_id=(item->>'id')::uuid) then continue;end if;
 number:=trim(cfg.content#>>array['employee_numbers',s.user_id::text]);select value into cat from jsonb_array_elements(cfg.content->'categories') where value->>'id'=item->>'category_id';code:=trim(cat->>'payroll_code');
 if coalesce(number,'')='' or coalesce(code,'')='' then raise exception 'Ansattnummer eller lønnskode mangler. Kontroller HR → Timeoppsett.' using errcode='22023';end if;
 if(item#>>'{category,project_required}')::boolean and coalesce(cfg.content#>>array['project_numbers',item->>'project_id'],item->>'project_number','')='' then raise exception 'Prosjektnummer mangler. Kontroller timeoppsettet.' using errcode='22023';end if;
 rows:=rows||jsonb_build_array(jsonb_build_object('employee_number',number,'on',item->>'on','payroll_code',code,'quantity',item->'quantity','unit',item#>>'{category,unit}',
 'project_number',coalesce(cfg.content#>>array['project_numbers',item->>'project_id'],item->>'project_number',''),'category',item#>>'{category,name}','note',item->>'note','entry_id',item->>'id',
 'receipts',coalesce((select string_agg(f.name,' | ' order by f.id) from time_private.files f where f.id in(select value::uuid from jsonb_array_elements_text(item->'files'))),''),'sheet_id',s.id,'revision',s.revision));
 end loop;end loop;
 if jsonb_array_length(rows)=0 then raise exception 'Ingen nye godkjente linjer i perioden. Tidligere eksport kan lastes ned igjen.' using errcode='22023';end if;
 if jsonb_array_length(rows)>10000 then raise exception 'Del lønnsperioden i mindre eksporter.' using errcode='54000';end if;
 insert into time_private.exports values(p_id,p_company_id,auth.uid(),p_from,p_to,now(),cfg.content->'export',rows,request);
 insert into time_private.exported_entries select(value->>'sheet_id')::uuid,(value->>'revision')::integer,(value->>'entry_id')::uuid,p_id from jsonb_array_elements(rows);
 update time_private.sheets set export_locked=true where id in(select distinct(value->>'sheet_id')::uuid from jsonb_array_elements(rows));
 return public.time_export_get(p_company_id,p_id);
end$$;

create or replace function public.time_export_list(p_company_id uuid,p_before timestamptz default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;rows jsonb;begin
 x:=time_private.actor(p_company_id,false);if not(x->>'time_admin')::boolean then raise exception 'Bare timeansvarlig eller firmaadmin kan se eksportarkivet.' using errcode='42501';end if;
 select coalesce(jsonb_agg(to_jsonb(q) order by created_at desc),'[]') into rows from(select b.id,b.from_on,b.to_on,b.created_at,jsonb_array_length(b.rows) line_count from time_private.exports b where b.company_id=p_company_id and(p_before is null or b.created_at<p_before) order by b.created_at desc limit 30)q;
 return jsonb_build_object('context',x,'exports',rows,'next',case when jsonb_array_length(rows)=30 then rows->29->>'created_at' else null end);
end$$;

create or replace function time_private.missing_week(c uuid,eid uuid) returns date
language plpgsql stable security definer set search_path='' as $$declare cfg time_private.settings;d date:=(now() at time zone 'Europe/Oslo')::date;w date;deadline timestamp;begin
 select * into cfg from time_private.settings where company_id=c;
 if not coalesce((cfg.content->>'enabled')::boolean,false) or cfg.enabled_since is null then return null;end if;
 select day::date into w from generate_series(date_trunc('week',greatest(cfg.enabled_since,coalesce((select from_on from time_private.enrollments where employee_id=eid),d))::timestamp),date_trunc('week',d::timestamp)-interval '1 week',interval '1 week') day
 where(now() at time zone 'Europe/Oslo')>=day::date+7+(cfg.content->>'deadline_day')::integer+(cfg.content->>'deadline_time')::time
 and not exists(select 1 from time_private.sheets where company_id=c and employee_id=eid and week_on=day::date and state in('submitted','approved')) order by day limit 1;
 return w;
end$$;

create or replace function public.time_tasks_get(p_company_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;e hr_private.employees;review_count integer;returned_count integer;begin
 x:=time_private.actor(p_company_id,false);select * into e from hr_private.employees where company_id=p_company_id and user_id=auth.uid();
 select count(*) into review_count from time_private.sheets s where company_id=p_company_id and state='submitted' and time_private.can_review(s,auth.uid());
 select count(*) into returned_count from time_private.sheets s where company_id=p_company_id and employee_id=e.id and state='returned';
 return jsonb_build_object('context',x,'registered',e.id is not null,'enabled',coalesce((select(content->>'enabled')::boolean from time_private.settings where company_id=p_company_id),false),
 'missing_week',case when e.id is not null then time_private.missing_week(p_company_id,e.id) else null end,'returned_count',returned_count,'review_count',review_count,
 'can_manage',(x->>'time_admin')::boolean or exists(select 1 from hr_private.employees where company_id=p_company_id and leader_id=auth.uid()),
 'email_enabled',exists(select 1 from time_private.mail_settings where singleton and enabled));
end$$;

create or replace function time_private.delivery_live(job time_private.deliveries) returns boolean
language plpgsql stable security definer set search_path='' as $$declare e hr_private.employees;s time_private.sheets;begin
 if not hr_private.has_module_access(job.company_id,job.recipient_id) or not exists(select 1 from hr_private.firms where company_id=job.company_id and enabled)
 or not exists(select 1 from hr_private.runtime_state where singleton and content_enabled and not restore_quarantined)
 or not exists(select 1 from time_private.settings where company_id=job.company_id and(content->>'enabled')::boolean) then return false;end if;
 select * into e from hr_private.employees where company_id=job.company_id and id=job.employee_id;
 if e.id is null or not hr_private.active_member(e.company_id,e.user_id) then return false;end if;
 select * into s from time_private.sheets where company_id=job.company_id and employee_id=e.id and week_on=job.week_on;
 if job.kind='missing' then return time_private.missing_week(job.company_id,e.id)=job.week_on and(job.recipient_id=e.user_id or job.recipient_id=e.leader_id or time_private.is_admin(e.company_id,job.recipient_id));end if;
 if job.kind='returned' then return s.state='returned' and s.revision=job.source_revision and job.recipient_id=e.user_id;end if;
 return s.state='submitted' and s.revision=job.source_revision and job.recipient_id<>e.user_id and(job.recipient_id=e.leader_id or time_private.is_admin(e.company_id,job.recipient_id));
end$$;

create or replace function time_private.queue_notices() returns void
language plpgsql security definer set search_path='' as $$declare cfg record;e hr_private.employees;s time_private.sheets;w date;u uuid;period date:=date_trunc('week',now() at time zone 'Europe/Oslo')::date;kind text;begin
 if not exists(select 1 from time_private.mail_settings where singleton and enabled) then return;end if;
 for cfg in select * from time_private.settings where(content->>'enabled')::boolean loop
 for e in select * from hr_private.employees where company_id=cfg.company_id and hr_private.has_module_access(company_id,user_id) loop
 w:=time_private.missing_week(cfg.company_id,e.id);
 if w is not null then
 for u in select m.user_id from public.sales_company_memberships m where m.company_id=cfg.company_id and hr_private.has_module_access(m.company_id,m.user_id)
 and(m.user_id=e.user_id or m.user_id=e.leader_id or time_private.is_admin(m.company_id,m.user_id)) loop
 insert into time_private.deliveries(company_id,employee_id,recipient_id,week_on,kind,period_on) values(cfg.company_id,e.id,u,w,'missing',period) on conflict do nothing;end loop;end if;
 for s in select * from time_private.sheets where company_id=cfg.company_id and employee_id=e.id and state in('submitted','returned') loop
 kind:=case s.state when 'submitted' then 'review' else 'returned' end;
 for u in select m.user_id from public.sales_company_memberships m where m.company_id=cfg.company_id and hr_private.has_module_access(m.company_id,m.user_id)
 and(case when kind='returned' then m.user_id=e.user_id else m.user_id<>e.user_id and(m.user_id=e.leader_id or time_private.is_admin(m.company_id,m.user_id)) end) loop
 insert into time_private.deliveries(company_id,employee_id,recipient_id,week_on,kind,period_on,source_revision) values(cfg.company_id,e.id,u,s.week_on,kind,period,s.revision) on conflict do nothing;end loop;end loop;end loop;end loop;
 update time_private.deliveries q set state='suppressed' where q.state in('pending','sending') and not time_private.delivery_live(q);
end$$;

create or replace function public.time_mail_authorize(p_token text) returns boolean
language sql security definer set search_path='' as $$select exists(select 1 from time_private.mail_settings cfg join vault.decrypted_secrets s on s.id=cfg.secret_id where cfg.singleton and cfg.enabled and length(coalesce(p_token,''))=64 and s.decrypted_secret=p_token)$$;

create or replace function public.time_mail_reserve() returns jsonb
language plpgsql security definer set search_path='' as $$declare q time_private.deliveries;email text;begin
 if not exists(select 1 from time_private.mail_settings where singleton and enabled) or extract(hour from(now() at time zone 'Europe/Oslo')) not between 8 and 17 then return null;end if;
 perform time_private.queue_notices();select * into q from time_private.deliveries where state in('pending','sending') and available_at<=now() and(lease_until is null or lease_until<now()) order by available_at,id for update skip locked limit 1;
 if q.id is null then return null;end if;
 select p.email into email from public.profiles p where p.id=q.recipient_id;
 if not time_private.delivery_live(q) or coalesce(email,'')='' then update time_private.deliveries set state='suppressed' where id=q.id;return null;end if;
 update time_private.deliveries set state='sending',attempt=gen_random_uuid(),lease_until=now()+interval '90 seconds' where id=q.id returning * into q;
 return jsonb_build_object('id',q.id,'attempt',q.attempt,'to',email);
end$$;

create or replace function public.time_mail_validate(p_id uuid,p_attempt uuid,p_to text) returns boolean
language sql security definer set search_path='' as $$select exists(select 1 from time_private.deliveries q where id=p_id and attempt=p_attempt and state='sending' and lease_until>now() and time_private.delivery_live(q) and exists(select 1 from public.profiles p where p.id=q.recipient_id and p.email=p_to)) and exists(select 1 from time_private.mail_settings where singleton and enabled)$$;

create or replace function public.time_mail_finish(p_id uuid,p_attempt uuid,p_provider_id text) returns boolean
language plpgsql security definer set search_path='' as $$declare q time_private.deliveries;begin
 select * into q from time_private.deliveries where id=p_id for update;
 if q.id is null or q.attempt is distinct from p_attempt or q.state<>'sending' or q.lease_until<now() then return false;end if;
 if p_provider_id is not null and length(p_provider_id) between 1 and 150 then update time_private.deliveries set state='sent',sent_at=now(),lease_until=null where id=q.id;
 else update time_private.deliveries set state='pending',attempt=null,lease_until=null,available_at=now()+interval '15 minutes' where id=q.id;end if;return true;
end$$;

create or replace function time_private.dispatch_notices() returns void
language plpgsql security definer set search_path='' as $$declare cfg time_private.mail_settings;token text;begin
 select * into cfg from time_private.mail_settings where singleton;
 if not cfg.enabled or cfg.endpoint!~'^https://[a-z]{20}\.supabase\.co/functions/v1/time-notifications$' then return;end if;
 perform time_private.queue_notices();if not exists(select 1 from time_private.deliveries where state in('pending','sending') and available_at<=now() and(lease_until is null or lease_until<now())) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where id=cfg.secret_id;
 perform net.http_post(url:=cfg.endpoint,headers:=jsonb_build_object('Content-Type','application/json','x-time-token',token),body:='{}'::jsonb,timeout_milliseconds:=10000);
end$$;

create or replace function time_private.enroll_employee() returns trigger language plpgsql security definer set search_path='' as $$begin
 if exists(select 1 from time_private.settings where company_id=new.company_id and(content->>'enabled')::boolean) then insert into time_private.enrollments values(new.company_id,new.id,(now() at time zone 'Europe/Oslo')::date) on conflict do nothing;end if;return new;
end$$;

create or replace function public.time_timer_get(p_company_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$declare x jsonb;t time_private.timers;begin
 x:=time_private.actor(p_company_id,false);select * into t from time_private.timers where company_id=p_company_id and user_id=auth.uid() and exists(select 1 from hr_private.employees e where e.id=employee_id and e.user_id=auth.uid());
 return jsonb_build_object('context',x,'timer',case when t.id is null then null else to_jsonb(t) end);
end$$;

create or replace function public.time_timer_command_v2(p_company_id uuid,p_action text,p_id uuid,p_category_id uuid default null,p_project_id uuid default null,p_note text default '',p_pause integer default 0,p_external_project text default null) returns jsonb
language plpgsql security definer set search_path='' as $$declare x jsonb;t time_private.timers;e hr_private.employees;s time_private.sheets;item jsonb;start_on timestamp;end_on timestamp;w date;r jsonb;begin
 x:=time_private.actor(p_company_id);select * into e from hr_private.employees where company_id=p_company_id and user_id=auth.uid() for share;
 if e.id is null or p_id is null or p_action is null or p_action not in('start','stop','cancel') then raise exception 'Kontroller tidtakingen og medarbeiderregistreringen.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('time-timer:'||p_company_id::text||auth.uid()::text,0));
 select * into t from time_private.timers where company_id=p_company_id and user_id=auth.uid() for update;
 if p_action='start' then
 if t.id is not null then if t.id=p_id then return public.time_timer_get(p_company_id);end if;raise exception 'Du har allerede en tidtaking. Stopp den først.' using errcode='22023';end if;
 w:=date_trunc('week',now() at time zone 'Europe/Oslo')::date;
 select * into s from time_private.sheets where company_id=p_company_id and employee_id=e.id and week_on=w;
 if s.id is not null and(s.state not in('draft','returned') or s.export_locked) then raise exception 'Uken kan ikke redigeres. Trekk tilbake innleveringen først.' using errcode='22023';end if;
 item:=time_private.validate_entries(p_company_id,s.id,e.user_id,w,jsonb_build_array(jsonb_build_object('id',p_id,'on',(now() at time zone 'Europe/Oslo')::date,'category_id',p_category_id,'project_id',p_project_id,'external_project',p_external_project,'mode','quantity','quantity','0.01','start','07:00','end','15:00','pause',0,'next_day',false,'note',p_note,'files','[]'::jsonb)),false);
 if item#>>'{0,category,unit}'<>'hours' then raise exception 'Tidtaking krever en kategori med timer.' using errcode='22023';end if;
 insert into time_private.timers(company_id,user_id,employee_id,id,category_id,project_id,note,external_project) values(p_company_id,auth.uid(),e.id,p_id,p_category_id,p_project_id,p_note,nullif(trim(p_external_project),''));
 elsif t.id is null then
 -- A repeated stop cannot create a second line; only return the authorized result already saved.
 if p_action='stop' and exists(select 1 from time_private.sheets sh,jsonb_array_elements(sh.entries) j where sh.company_id=p_company_id and sh.user_id=auth.uid() and j->>'id'=p_id::text) then return public.time_timer_get(p_company_id);end if;
 raise exception 'Tidtakingen er allerede avsluttet. Hent uken på nytt.' using errcode='40001';
 else
 if t.id<>p_id or t.employee_id<>e.id then raise exception 'Tidtakingen er endret. Hent på nytt.' using errcode='40001';end if;
 if p_action='stop' then
 start_on:=t.started_at at time zone 'Europe/Oslo';end_on:=now() at time zone 'Europe/Oslo';w:=date_trunc('week',start_on)::date;
 if end_on-start_on>interval '24 hours' or end_on<=start_on or p_pause is null or p_pause<0 then raise exception 'Tidtakingen må være mellom ett minutt og 24 timer. Avbryt og før manuelt ved behov.' using errcode='22023';end if;
 select * into s from time_private.sheets where company_id=p_company_id and employee_id=e.id and week_on=w;
 item:=jsonb_build_object('id',t.id,'on',start_on::date,'category_id',t.category_id,'project_id',t.project_id,'external_project',t.external_project,'mode','clock','quantity','','start',to_char(start_on,'HH24:MI'),'end',to_char(end_on,'HH24:MI'),'pause',p_pause,'next_day',end_on::date>start_on::date,'note',t.note,'files','[]'::jsonb);
 r:=public.time_sheet_command(p_company_id,w,e.id,coalesce(s.revision,0),t.id,'save',coalesce((select jsonb_agg(j-'category'-'project_label'-'project_number') from jsonb_array_elements(s.entries) j),'[]'::jsonb)||jsonb_build_array(item),false,'');
 end if;
 delete from time_private.timers where company_id=p_company_id and user_id=auth.uid();
 end if;
 return public.time_timer_get(p_company_id);
end$$;

create or replace function public.time_timer_command(p_company_id uuid,p_action text,p_id uuid,p_category_id uuid default null,p_project_id uuid default null,p_note text default '',p_pause integer default 0) returns jsonb language sql security definer set search_path='' as $$select public.time_timer_command_v2(p_company_id,p_action,p_id,p_category_id,p_project_id,p_note,p_pause,null)$$;
revoke all on function public.time_mail_validate(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.time_mail_validate(uuid,uuid,text) to service_role;
revoke all on function public.time_timer_command_v2(uuid,text,uuid,uuid,uuid,text,integer,text) from public,anon,service_role;
grant execute on function public.time_timer_command_v2(uuid,text,uuid,uuid,uuid,text,integer,text) to authenticated;
select cron.unschedule(jobid) from cron.job where jobname='time-registration-cleanup';

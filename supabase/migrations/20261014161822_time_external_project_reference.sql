-- External ERP projects remain time references, never new ProffDok projects or access grants.
alter table time_private.timers add column external_project text check(length(external_project)<=240);

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
 if jsonb_typeof(item->'external_project') is not null and jsonb_typeof(item->'external_project') not in('string','null') or length(external_ref)>240 or external_ref~'[[:cntrl:]]' or pid is not null and external_ref is not null then raise exception 'Velg ett prosjekt fra ProffDok, eller skriv nummer, navn eller adresse manuelt (høyst 240 tegn).' using errcode='22023';end if;
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

create or replace function public.time_timer_command(p_company_id uuid,p_action text,p_id uuid,p_category_id uuid default null,p_project_id uuid default null,p_note text default '',p_pause integer default 0) returns jsonb
language sql security definer set search_path='' as $$select public.time_timer_command_v2(p_company_id,p_action,p_id,p_category_id,p_project_id,p_note,p_pause,null)$$;
revoke all on function public.time_timer_command_v2(uuid,text,uuid,uuid,uuid,text,integer,text) from public,anon,service_role;
grant execute on function public.time_timer_command_v2(uuid,text,uuid,uuid,uuid,text,integer,text) to authenticated;

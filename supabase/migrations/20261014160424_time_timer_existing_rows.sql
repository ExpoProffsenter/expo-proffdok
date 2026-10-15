-- Keep strict entry validation; only writable fields may be resubmitted from saved rows.
create or replace function public.time_timer_command(p_company_id uuid,p_action text,p_id uuid,p_category_id uuid default null,p_project_id uuid default null,p_note text default '',p_pause integer default 0) returns jsonb
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
 item:=time_private.validate_entries(p_company_id,s.id,e.user_id,w,jsonb_build_array(jsonb_build_object('id',p_id,'on',(now() at time zone 'Europe/Oslo')::date,'category_id',p_category_id,'project_id',p_project_id,'mode','quantity','quantity','0.01','start','07:00','end','15:00','pause',0,'next_day',false,'note',p_note,'files','[]'::jsonb)),false);
 if item#>>'{0,category,unit}'<>'hours' then raise exception 'Tidtaking krever en kategori med timer.' using errcode='22023';end if;
 insert into time_private.timers(company_id,user_id,employee_id,id,category_id,project_id,note) values(p_company_id,auth.uid(),e.id,p_id,p_category_id,p_project_id,p_note);
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
 item:=jsonb_build_object('id',t.id,'on',start_on::date,'category_id',t.category_id,'project_id',t.project_id,'mode','clock','quantity','','start',to_char(start_on,'HH24:MI'),'end',to_char(end_on,'HH24:MI'),'pause',p_pause,'next_day',end_on::date>start_on::date,'note',t.note,'files','[]'::jsonb);
 r:=public.time_sheet_command(p_company_id,w,e.id,coalesce(s.revision,0),t.id,'save',coalesce((select jsonb_agg(j-'category'-'project_label'-'project_number') from jsonb_array_elements(s.entries) j),'[]'::jsonb)||jsonb_build_array(item),false,'');
 end if;
 delete from time_private.timers where company_id=p_company_id and user_id=auth.uid();
 end if;
 return public.time_timer_get(p_company_id);
end$$;

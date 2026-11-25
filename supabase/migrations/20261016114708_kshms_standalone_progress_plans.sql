-- Firm-owned, independent schedules. Existing project plans/portals are untouched.
create table kshms_private.progress_plans(
 id uuid primary key,
 company_id uuid not null references public.sales_company_scopes(id),
 title text not null check(length(btrim(title)) between 1 and 160),
 address text not null default '' check(length(address)<=250),
 reference text not null default '' check(length(reference)<=100),
 revision integer not null default 1 check(revision>0),
 plan jsonb not null default '{"version":1,"activities":[],"source":null}',
 archived boolean not null default false,
 created_by uuid references public.profiles(id) on delete set null,
 updated_by uuid references public.profiles(id) on delete set null,
 updated_at timestamptz not null default now()
);
alter table kshms_private.progress_plans enable row level security;
revoke all on kshms_private.progress_plans from public,anon,authenticated,service_role;
create index kshms_progress_plans_company_page on kshms_private.progress_plans(company_id,archived,id);

create function public.kshms_progress_list(p_company_id uuid,p_archived boolean default false,p_after uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;rows jsonb;last_id uuid;more boolean;begin
 x:=kshms_private.require_context(p_company_id);
 select coalesce(jsonb_agg(to_jsonb(v) order by v.id),'[]'::jsonb) into rows from
 (select id,title,address,reference,revision,archived,updated_at from kshms_private.progress_plans
 where company_id=p_company_id and archived=p_archived and (p_after is null or id>p_after) order by id limit 100) v;
 if jsonb_array_length(rows)>0 then last_id:=(rows->-1->>'id')::uuid;end if;
 select exists(select 1 from kshms_private.progress_plans where company_id=p_company_id and archived=p_archived and id>last_id) into more;
 return jsonb_build_object('context',x,'plans',rows,'next',case when more then last_id else null end);
end $$;

create function public.kshms_progress_get(p_company_id uuid,p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;r kshms_private.progress_plans%rowtype;begin
 x:=kshms_private.require_context(p_company_id);
 select * into r from kshms_private.progress_plans where company_id=p_company_id and id=p_id;
 if not found then raise exception 'Planen finnes ikke i valgt firma.' using errcode='42501';end if;
 return jsonb_build_object('context',x,'record',to_jsonb(r));
end $$;

create function public.kshms_progress_save(p_company_id uuid,p_id uuid,p_revision integer,p_title text,p_address text,p_reference text,p_plan jsonb,p_archived boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare x jsonb;r kshms_private.progress_plans%rowtype;a jsonb;s jsonb;v date;begin
 x:=kshms_private.require_context(p_company_id,true);
 if p_id is null or p_revision is null or p_revision<0 or p_archived is null or p_title is null or length(btrim(p_title)) not between 1 and 160
 or p_address is null or length(p_address)>250 or p_reference is null or length(p_reference)>100
 or p_plan is null or jsonb_typeof(p_plan)<>'object' or pg_column_size(p_plan)>500000
 or p_plan->'version' is distinct from '1'::jsonb or jsonb_typeof(p_plan->'activities') is distinct from 'array'
 or coalesce(p_plan->'source','null')<>'null'::jsonb
 then raise exception 'Ugyldig fremdriftsplan.' using errcode='22023';end if;
 if jsonb_array_length(p_plan->'activities')>500 then raise exception 'Planen kan ha høyst 500 arbeidsoperasjoner.' using errcode='22023';end if;
 if exists(select 1 from jsonb_array_elements(p_plan->'activities') z group by z->>'id' having count(*)>1)
 then raise exception 'Arbeidsoperasjonene må ha ulike ID-er.' using errcode='22023';end if;
 for a in select value from jsonb_array_elements(p_plan->'activities') loop
  if jsonb_typeof(a)<>'object' or coalesce(length(btrim(a->>'id')),0) not between 1 and 120 or coalesce(length(btrim(a->>'title')),0) not between 1 and 200
  or length(coalesce(a->>'trade',''))>160 or length(coalesce(a->>'resource',''))>250
  or coalesce(a->>'status','') not in ('Ikke startet','Pågår','Avventer','Ferdig')
  or (coalesce(a->>'nsCode','')<>'' and (a->>'nsCode' !~ '^[2-7][0-9]{1,3}$' or coalesce(a->>'nsKind','') not in ('building','system')))
  or jsonb_typeof(a->'sessions') is distinct from 'array' then raise exception 'Ugyldig arbeidsoperasjon eller fagkode.' using errcode='22023';end if;
  if jsonb_array_length(a->'sessions')>1000 or exists(select 1 from jsonb_array_elements(a->'sessions') z group by z->>'id' having count(*)>1)
  then raise exception 'For mange eller doble arbeidsøkter.' using errcode='22023';end if;
  for s in select value from jsonb_array_elements(a->'sessions') loop
   if jsonb_typeof(s)<>'object' or coalesce(length(s->>'id'),0) not between 1 and 120 or coalesce(s->>'date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    or coalesce(s->>'startTime','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or coalesce(s->>'endTime','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    or s->>'endTime'<=s->>'startTime' or length(coalesce(s->>'note',''))>5000 then raise exception 'Arbeidsøkten må ha gyldig dato og fra–til-tid.' using errcode='22023';end if;
   begin v:=(s->>'date')::date;exception when others then raise exception 'Ugyldig dato.' using errcode='22023';end;
  end loop;
 end loop;
 select * into r from kshms_private.progress_plans where id=p_id for update;
 if found then
  if r.company_id<>p_company_id then raise exception 'Feil firma.' using errcode='42501';end if;
  if r.revision<>p_revision then raise exception 'Planen er endret i en annen økt. Kladden er beholdt; hent lagret plan før du fortsetter.' using errcode='40001';end if;
  update kshms_private.progress_plans set title=btrim(p_title),address=btrim(p_address),reference=btrim(p_reference),plan=p_plan,archived=p_archived,revision=revision+1,updated_by=auth.uid(),updated_at=now() where id=p_id;
 else
  if p_revision<>0 then raise exception 'Planen er endret eller fjernet.' using errcode='40001';end if;
  begin
   insert into kshms_private.progress_plans(id,company_id,title,address,reference,plan,archived,created_by,updated_by)
   values(p_id,p_company_id,btrim(p_title),btrim(p_address),btrim(p_reference),p_plan,p_archived,auth.uid(),auth.uid());
  exception when unique_violation then raise exception 'Planen er allerede opprettet. Hent den lagrede planen.' using errcode='40001';end;
 end if;
 insert into public.kshms_audit(company_id,actor_id,action,object_id) values(p_company_id,auth.uid(),'progress_plan_saved',p_id);
 return public.kshms_progress_get(p_company_id,p_id);
end $$;
revoke all on function public.kshms_progress_list(uuid,boolean,uuid),public.kshms_progress_get(uuid,uuid),public.kshms_progress_save(uuid,uuid,integer,text,text,text,jsonb,boolean) from public,anon,service_role;
grant execute on function public.kshms_progress_list(uuid,boolean,uuid),public.kshms_progress_get(uuid,uuid),public.kshms_progress_save(uuid,uuid,integer,text,text,text,jsonb,boolean) to authenticated;

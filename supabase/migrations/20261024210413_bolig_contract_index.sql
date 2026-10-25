-- Contract-side calculations only. No package, resident, order or billing write.
create table bolig_private.contract_index_reports(
 id uuid primary key,root_id uuid not null references bolig_private.roots(id),
 revision bigint not null,basis jsonb not null,calculation jsonb not null,
 created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),
 unique(root_id,revision));
create index bolig_contract_index_actor on bolig_private.contract_index_reports(created_by);
alter table bolig_private.contract_index_reports enable row level security;
revoke all on bolig_private.contract_index_reports from public,anon,authenticated,service_role;

create function bolig_private.contract_index_calculate(b jsonb) returns jsonb
language plpgsql immutable set search_path='' as $$
declare l jsonb;lines jsonb:='[]';ids uuid[]:='{}';ident uuid;amount numeric;delta numeric;
 i0 numeric;i1 numeric;factor numeric;rate numeric;total bigint:=0;change bigint:=0;base_count integer:=0;selected_count integer:=0;
begin
 if jsonb_typeof(b) is distinct from 'object' or octet_length(b::text)>30000
  or exists(select 1 from jsonb_object_keys(b) k where k not in('reference','file_id','series','base_month','target_month','base_index','target_index','factor','origin','lines'))
  or jsonb_typeof(b->'reference') is distinct from 'string' or length(trim(b->>'reference')) not between 1 and 500
  or coalesce(b->>'series','') not in('block_total','block_plumbing','commercial_plumbing')
  or coalesce(b->>'origin','') not in('manual','ssb-client')
  or coalesce(b->>'base_month','') !~ '^(19|20)[0-9]{2}-(0[1-9]|1[0-2])$'
  or coalesce(b->>'target_month','') !~ '^(19|20)[0-9]{2}-(0[1-9]|1[0-2])$'
  or b->>'base_month'>b->>'target_month'
  or jsonb_typeof(b->'base_index') is distinct from 'number'
  or jsonb_typeof(b->'target_index') is distinct from 'number'
  or jsonb_typeof(b->'factor') is distinct from 'number'
  or jsonb_typeof(b->'lines') is distinct from 'array' or jsonb_array_length(b->'lines') not between 1 and 51
  or (b ? 'file_id' and jsonb_typeof(b->'file_id') not in('null','string'))
 then raise exception 'Kontroller avtalehenvisning, indeks, måneder og leveransegrunnlag.' using errcode='22023';end if;
 i0:=(b->>'base_index')::numeric;i1:=(b->>'target_index')::numeric;factor:=(b->>'factor')::numeric;
 if i0 not between 0.0001 and 1000000 or i1 not between 0.0001 and 1000000 or factor not between 0 and 1
  or i0<>round(i0,4) or i1<>round(i1,4) or factor<>round(factor,4)
 then raise exception 'Indekstall må være positive. Reduksjonsfaktor skal være mellom 0 og 1 med inntil fire desimaler.' using errcode='22023';end if;
 rate:=(i1/i0-1)*factor;
 for l in select value from jsonb_array_elements(b->'lines') loop
  if jsonb_typeof(l) is distinct from 'object'
   or exists(select 1 from jsonb_object_keys(l) k where k not in('id','kind','name','amount_cents','selected'))
   or jsonb_typeof(l->'id') is distinct from 'string' or coalesce(l->>'kind','') not in('base','option')
   or jsonb_typeof(l->'name') is distinct from 'string' or length(trim(l->>'name')) not between 1 and 120
   or jsonb_typeof(l->'amount_cents') is distinct from 'number' or jsonb_typeof(l->'selected') is distinct from 'boolean'
  then raise exception 'Kontroller navn, beløp og avkryssing for hver leveransedel.' using errcode='22023';end if;
  ident:=(l->>'id')::uuid;amount:=(l->>'amount_cents')::numeric;
  if ident=any(ids) or amount not between 0 and 1000000000000 or amount<>trunc(amount) then raise exception 'Ugyldig eller duplisert leveransedel.' using errcode='22023';end if;
  ids:=array_append(ids,ident);
  if l->>'kind'='base' then base_count:=base_count+1;end if;
  if (l->>'selected')::boolean and amount>0 then selected_count:=selected_count+1;end if;
  -- Round each monetary adjustment once, in cents; no rounded rate in the math.
  delta:=case when (l->>'selected')::boolean then round(amount*(i1-i0)*factor/i0) else 0 end;
  if abs(delta)>1000000000000 or amount+delta>2000000000000 then raise exception 'Reguleringen er for stor. Kontroller indekstallene.' using errcode='22023';end if;
  total:=total+amount;change:=change+delta::bigint;
  lines:=lines||jsonb_build_array(l||jsonb_build_object('adjustment_cents',delta::bigint,'new_amount_cents',(amount+delta)::bigint));
 end loop;
 if base_count<>1 or selected_count=0 then raise exception 'Oppgi én grunnleveranse og kryss av minst én del med beløp.' using errcode='22023';end if;
 return jsonb_build_object('raw_percent',(i1/i0-1)*100,'applied_percent',rate*100,'lines',lines,'original_cents',total,'adjustment_cents',change,'new_cents',total+change,'formula','beløp × (ny indeks / basisindeks − 1) × reduksjonsfaktor','rounding','Hver linjes regulering avrundes til nærmeste øre.');
end$$;
revoke all on function bolig_private.contract_index_calculate(jsonb) from public,anon,authenticated,service_role;

create function bolig_private.contract_index_workspace(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare access jsonb;answer jsonb;b jsonb;calculation jsonb;report bolig_private.contract_index_reports%rowtype;
 ident uuid;current_revision bigint;file jsonb;
begin
 access:=bolig_private.contract_workspace(c,root,'get','{}');
 if not coalesce((access->>'allowed')::boolean,false) then raise exception 'Privat kontraktstilgang kreves.' using errcode='42501';end if;
 if action is null or action not in('get','preview','approve','report') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>32000 then raise exception 'Ugyldig indeksforespørsel.' using errcode='22023';end if;
 if action in('preview','approve') and not coalesce((access->>'manage')::boolean,false) then raise exception 'Kontraktsadministrator og aktivt prosjekt kreves.' using errcode='42501';end if;
 if action='approve' then
  perform 1 from bolig_private.roots where id=root for update;
  access:=bolig_private.contract_workspace(c,root,'get','{}');
  if not coalesce((access->>'manage')::boolean,false) then raise exception 'Kontraktstilgangen er endret.' using errcode='42501';end if;
 end if;
 select coalesce(max(revision),0) into current_revision from bolig_private.contract_index_reports where root_id=root;
 if action in('preview','approve') then
  if exists(select 1 from jsonb_object_keys(payload) k where k not in('basis','id','revision')) then raise exception 'Ukjente reguleringsfelt.' using errcode='22023';end if;
  b:=payload->'basis';calculation:=bolig_private.contract_index_calculate(b);
  if coalesce(b->>'file_id','')<>'' then
   file:=bolig_private.contract_workspace(c,root,'file',jsonb_build_object('id',(b->>'file_id')::uuid))->'file';
  end if;
  calculation:=calculation||jsonb_build_object('file',file,'series_name',case b->>'series' when 'block_total' then 'Boligblokk i alt' when 'block_plumbing' then 'Rørleggerarbeid i boligblokk' else 'Rørleggerarbeid i kontor- og forretningsbygg' end,'ssb_table',case when b->>'series'='commercial_plumbing' then '04534' else '08655' end);
  if action='approve' then
   ident:=(payload->>'id')::uuid;
   if ident is null then raise exception 'Forsøket mangler ID.' using errcode='22023';end if;
   select * into report from bolig_private.contract_index_reports where id=ident;
   if found then
    if report.root_id<>root or report.basis is distinct from b then raise exception 'Forsøket gjelder et annet grunnlag.' using errcode='PT409';end if;
   else
    if jsonb_typeof(payload->'revision') is distinct from 'number' or (payload->>'revision')::numeric is distinct from current_revision::numeric then raise exception 'En ny beregning er godkjent. Hent siste historikk og forhåndsvis på nytt.' using errcode='PT409';end if;
    if exists(select 1 from bolig_private.contract_index_reports where root_id=root and basis=b) then raise exception 'Samme beregningsgrunnlag er allerede godkjent. Se historikken.' using errcode='PT409';end if;
    insert into bolig_private.contract_index_reports(id,root_id,revision,basis,calculation,created_by) values(ident,root,current_revision+1,b,calculation,auth.uid()) returning * into report;
   end if;
   answer:=jsonb_build_object('report',to_jsonb(report),'revision',greatest(current_revision,report.revision));
  else answer:=jsonb_build_object('basis',b,'calculation',calculation,'revision',current_revision);end if;
 elsif action='report' then
  select * into report from bolig_private.contract_index_reports where id=(payload->>'id')::uuid and root_id=root;
  if not found then raise exception 'Beregningen er ikke tilgjengelig.' using errcode='42501';end if;
  answer:=jsonb_build_object('report',to_jsonb(report),'revision',current_revision);
 else
  answer:=jsonb_build_object('revision',current_revision,'reports',coalesce((select jsonb_agg(v) from (select id,revision,created_at,created_by,basis->>'reference' reference,basis->>'target_month' target_month,calculation->'adjustment_cents' adjustment_cents from bolig_private.contract_index_reports where root_id=root order by revision desc limit 50)v),'[]'));
 end if;
 return jsonb_build_object('context',access->'context','root_id',root,'data',answer);
end$$;
revoke all on function bolig_private.contract_index_workspace(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function bolig_private.contract_index_workspace(uuid,uuid,text,jsonb) to authenticated;
create function public.bolig_contract_index(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select bolig_private.contract_index_workspace(p_company_id,p_root_id,p_action,p_payload)$$;
revoke all on function public.bolig_contract_index(uuid,uuid,text,jsonb) from public,anon,service_role;
grant execute on function public.bolig_contract_index(uuid,uuid,text,jsonb) to authenticated;

-- Editable invoice register. A save stores principal and index together; numbers may follow later.
-- Existing rows and legacy receipts remain readable. Every explicit edit keeps a private before/after receipt.
create table bolig_private.contract_finance_changes(
 request_id uuid primary key,root_id uuid not null references bolig_private.roots(id),
 entry_id uuid not null references bolig_private.contract_finance_events(id),
 request jsonb not null,before_value jsonb,after_value jsonb not null,
 saved_by uuid not null references auth.users(id),saved_at timestamptz not null default now());
create index bolig_finance_changes_root on bolig_private.contract_finance_changes(root_id,entry_id);
create index bolig_finance_changes_actor on bolig_private.contract_finance_changes(saved_by);
alter table bolig_private.contract_finance_changes enable row level security;
revoke all on bolig_private.contract_finance_changes from public,anon,authenticated,service_role;

create function bolig_private.contract_finance_save(c uuid,root uuid,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare access jsonb;rev bigint;agreement jsonb;calc_agreement jsonb;input jsonb;result jsonb;basis jsonb;
 old bolig_private.contract_finance_events%rowtype;original bolig_private.contract_finance_events%rowtype;event bolig_private.contract_finance_events%rowtype;
 receipt bolig_private.contract_finance_changes%rowtype;ident uuid;request_id uuid;line_id uuid;l jsonb;v jsonb;calc_line jsonb;old_line jsonb;
 lines jsonb:='[]';ids uuid[]:='{}';principal numeric;idx numeric;prior_p numeric;prior_i numeric;credited_p numeric;credited_i numeric;
 total_p bigint:=0;total_i bigint:=0;mode text;method text;number text;index_number text;credit_id uuid;with_index boolean;
begin
 perform 1 from bolig_private.roots where id=root and company_id=c for update;
 access:=bolig_private.contract_workspace(c,root,'get','{}');
 if not coalesce((access->>'allowed')::boolean,false) or not coalesce((access->>'manage')::boolean,false) then raise exception 'Kontraktsadministrator og aktivt prosjekt kreves.' using errcode='42501';end if;
 if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>60000 or exists(select 1 from jsonb_object_keys(payload) k where k not in('id','request_id','entry_revision','revision','input')) then raise exception 'Ugyldig lagring.' using errcode='22023';end if;
 ident:=(payload->>'id')::uuid;request_id:=(payload->>'request_id')::uuid;input:=payload->'input';
 if ident is null or request_id is null then raise exception 'Lagringen mangler ID.' using errcode='22023';end if;
 select coalesce(max(revision),0) into rev from bolig_private.contract_finance_events where root_id=root;
 select * into receipt from bolig_private.contract_finance_changes ch where ch.request_id=request_id;
 if found then
  if receipt.root_id<>root or receipt.request is distinct from payload or receipt.saved_by<>auth.uid() then raise exception 'Lagringsforsøket gjelder et annet grunnlag.' using errcode='PT409';end if;
  return jsonb_build_object('context',access->'context','root_id',root,'data',jsonb_build_object('entry',receipt.after_value,'revision',rev));
 end if;
 if jsonb_typeof(payload->'revision') is distinct from 'number' or (payload->>'revision')::numeric is distinct from rev::numeric then raise exception 'Oversikten er endret. Hent siste oversikt før du lagrer på nytt.' using errcode='PT409';end if;
 select * into old from bolig_private.contract_finance_events where id=ident;
 if found and (old.root_id<>root or old.kind='agreement') then raise exception 'Fakturaen er ikke tilgjengelig.' using errcode='42501';end if;
 if old.id is not null and (jsonb_typeof(payload->'entry_revision') is distinct from 'number' or (payload->>'entry_revision')::numeric is distinct from old.revision::numeric) then raise exception 'Denne fakturaen er endret av en annen lagring. Åpne den siste fakturaversjonen før du endrer den.' using errcode='PT409';end if;
 select e.input into agreement from bolig_private.contract_finance_events e where e.root_id=root and e.kind='agreement' order by revision desc limit 1;
 if agreement is null then raise exception 'Lagre kontraktssum og vilkår først.' using errcode='22023';end if;
 calc_agreement:=coalesce(old.result->'agreement',agreement);
 mode:=input->>'mode';method:=input->>'method';number:=trim(input->>'number');index_number:=trim(input->>'index_number');
 if jsonb_typeof(input) is distinct from 'object' or exists(select 1 from jsonb_object_keys(input) k where k not in('mode','method','number','index_number','date','period','reason','credit_of','values','apply_index','target_month','target_index','origin','index_published','index_confirmed'))
  or coalesce(mode,'') not in('period','manual','credit') or (mode='period' and coalesce(method,'') not in('payment','documented')) or (mode<>'period' and method is distinct from mode)
  or jsonb_typeof(input->'number') is distinct from 'string' or jsonb_typeof(input->'index_number') is distinct from 'string' or length(number)>80 or length(index_number)>80
  or coalesce(input->>'date','') !~ '^(19|20)[0-9]{2}-(0[1-9]|1[0-2])-[0-3][0-9]$' or coalesce(input->>'period','') !~ '^(19|20)[0-9]{2}-(0[1-9]|1[0-2])$'
  or (input ? 'index_confirmed' and jsonb_typeof(input->'index_confirmed') is distinct from 'boolean')
  or jsonb_typeof(input->'reason') is distinct from 'string' or length(input->>'reason')>500 or jsonb_typeof(input->'apply_index') is distinct from 'boolean'
  or jsonb_typeof(input->'values') is distinct from 'array' or jsonb_array_length(input->'values')<>jsonb_array_length(agreement->'lines')
 then raise exception 'Kontroller dato, fakturanumre og beløp.' using errcode='22023';end if;
 perform (input->>'date')::date;
 if (number<>'' and lower(number)=lower(index_number)) or exists(select 1 from bolig_private.contract_finance_events e where e.root_id=root and e.id<>ident and e.kind in('invoice','credit') and exists(select 1 from unnest(array[number,index_number]) n where n<>'' and lower(n) in(lower(trim(e.input->>'number')),lower(trim(e.input->>'index_number'))))) then raise exception 'Fakturanummeret er allerede brukt. Kontroller begge fakturanumrene.' using errcode='PT409';end if;
 with_index:=(input->>'apply_index')::boolean;
 if with_index and mode<>'period' then raise exception 'Tidligere fakturaer og kreditnotaer bruker registrerte indeksbeløp.' using errcode='22023';end if;
 if with_index then
  if input->>'index_published' is not null and (input->>'index_published')::date>(input->>'date')::date then raise exception 'En senere publisering kan ikke brukes på denne fakturadatoen.' using errcode='22023';end if;
  if not (coalesce((input->>'index_confirmed')::boolean,false) or (coalesce(input->>'index_published','') ~ '^\d{4}-\d{2}-\d{2}$' and (input->>'index_published')::date<=(input->>'date')::date)) or coalesce(input->>'target_month','')>=left(input->>'date',7) then raise exception 'Indeksen må være publisert senest på fakturadatoen.' using errcode='22023';end if;
  basis:=calc_agreement||jsonb_build_object('target_month',input->'target_month','target_index',input->'target_index','origin',input->'origin');
  perform bolig_private.contract_index_calculate(basis||jsonb_build_object('lines',(select jsonb_agg(x||jsonb_build_object('selected',true)) from jsonb_array_elements(calc_agreement->'lines') x)));
 end if;
 if mode='credit' then
  credit_id:=(input->>'credit_of')::uuid;
  select * into original from bolig_private.contract_finance_events where id=credit_id and root_id=root and kind='invoice' and id<>ident;
  if not found then raise exception 'Velg opprinnelig faktura i dette prosjektet.' using errcode='42501';end if;
 elsif input->>'credit_of' is not null then raise exception 'Kun kreditnota kan vise til opprinnelig faktura.' using errcode='22023';end if;
 if old.id is not null and (old.kind='credit') is distinct from (mode='credit') then raise exception 'En lagret faktura kan ikke endres til kreditnota eller omvendt.' using errcode='22023';end if;
 for v in select value from jsonb_array_elements(input->'values') loop
  if jsonb_typeof(v) is distinct from 'object' or exists(select 1 from jsonb_object_keys(v) k where k not in('id','principal_cents','index_cents')) or jsonb_typeof(v->'principal_cents') is distinct from 'number' or jsonb_typeof(v->'index_cents') is distinct from 'number' then raise exception 'Ugyldig fakturalinje.' using errcode='22023';end if;
  line_id:=(v->>'id')::uuid;principal:=(v->>'principal_cents')::numeric;idx:=(v->>'index_cents')::numeric;
  select value into l from jsonb_array_elements(agreement->'lines') where value->>'id'=line_id::text;
  if l is null or line_id=any(ids) or principal not between 0 and 1000000000000 or principal<>trunc(principal) or abs(idx)>1000000000000 or idx<>trunc(idx) then raise exception 'Ukjent, duplisert eller ugyldig fakturalinje.' using errcode='22023';end if;
  ids:=array_append(ids,line_id);
  select coalesce(sum((x->>'principal_cents')::numeric),0),coalesce(sum((x->>'index_cents')::numeric),0) into prior_p,prior_i from bolig_private.contract_finance_events e cross join lateral jsonb_array_elements(e.result->'lines') x where e.root_id=root and e.id<>ident and e.kind in('invoice','credit') and x->>'id'=line_id::text;
  if mode='credit' then
   select value into old_line from jsonb_array_elements(original.result->'lines') where value->>'id'=line_id::text;
   select coalesce(sum((x->>'principal_cents')::numeric),0),coalesce(sum((x->>'index_cents')::numeric),0) into credited_p,credited_i from bolig_private.contract_finance_events e cross join lateral jsonb_array_elements(e.result->'lines') x where e.root_id=root and e.id<>ident and e.kind='credit' and e.input->>'credit_of'=credit_id::text and x->>'id'=line_id::text;
   if principal>coalesce((old_line->>'principal_cents')::numeric,0)+credited_p or (idx<>0 and (sign(idx)<>sign(coalesce((old_line->>'index_cents')::numeric,0)+credited_i) or abs(idx)>abs(coalesce((old_line->>'index_cents')::numeric,0)+credited_i))) then raise exception 'Kreditnotaen overstiger opprinnelig faktura.' using errcode='22023';end if;
   principal:=-principal;idx:=-idx;
  else
   if mode='period' then
    if idx<>0 then raise exception 'Indeksen beregnes på serveren.' using errcode='22023';end if;
    select value into calc_line from jsonb_array_elements(calc_agreement->'lines') where value->>'id'=line_id::text;
    idx:=case when with_index and coalesce((calc_line->>'selected')::boolean,false) then round(principal*((input->>'target_index')::numeric-(calc_agreement->>'base_index')::numeric)*(calc_agreement->>'factor')::numeric/(calc_agreement->>'base_index')::numeric) else 0 end;
   end if;
   if prior_p+principal>(l->>'amount_cents')::numeric then raise exception 'Fakturert a konto overstiger avtalt beløp.' using errcode='22023';end if;
   select coalesce(sum((x->>'principal_cents')::numeric),0),coalesce(sum((x->>'index_cents')::numeric),0) into credited_p,credited_i from bolig_private.contract_finance_events e cross join lateral jsonb_array_elements(e.result->'lines') x where e.root_id=root and e.kind='credit' and e.input->>'credit_of'=ident::text and x->>'id'=line_id::text;
   if principal+credited_p<0 or (credited_i<>0 and (sign(idx)<>sign(-credited_i) or abs(idx)<abs(credited_i))) then raise exception 'Fakturaen kan ikke settes lavere enn allerede krediterte beløp.' using errcode='22023';end if;
  end if;
  if abs(idx)>1000000000000 then raise exception 'Indeksbeløpet er for stort.' using errcode='22023';end if;
  total_p:=total_p+principal::bigint;total_i:=total_i+idx::bigint;
  lines:=lines||jsonb_build_array(jsonb_build_object('id',line_id,'name',l->>'name','kind',l->>'kind','contract_cents',l->'amount_cents','selected',l->'selected','prior_principal_cents',prior_p,'prior_index_cents',prior_i,'principal_cents',principal,'index_cents',idx,'remaining_cents',(l->>'amount_cents')::numeric-prior_p-principal));
 end loop;
 if (total_p=0 and total_i=0) or (mode<>'credit' and total_p+total_i<=0) or (mode='credit' and total_p+total_i>=0) then raise exception 'Kontroller beløp og fortegn.' using errcode='22023';end if;
 input:=input||jsonb_build_object('number',number,'index_number',index_number);
 if old.input ? 'index_of' then input:=input||jsonb_build_object('index_of',old.input->'index_of');end if;
 result:=jsonb_build_object('lines',lines,'principal_cents',total_p,'index_cents',total_i,'total_cents',total_p+total_i,'agreement',calc_agreement,'index_basis',case when with_index then basis else coalesce(old.result->'index_basis','null'::jsonb) end,'ledger_revision',rev,'updated_at',now());
 if old.id is null then
  insert into bolig_private.contract_finance_events(id,root_id,revision,kind,input,result,created_by) values(ident,root,rev+1,case when mode='credit' then 'credit' else 'invoice' end,input,result,auth.uid()) returning * into event;
 else
  update bolig_private.contract_finance_events e set revision=rev+1,input=input,result=result where e.id=ident returning * into event;
 end if;
 insert into bolig_private.contract_finance_changes(request_id,root_id,entry_id,request,before_value,after_value,saved_by) values(request_id,root,ident,payload,case when old.id is not null then to_jsonb(old) else null end,to_jsonb(event),auth.uid());
 return jsonb_build_object('context',access->'context','root_id',root,'data',jsonb_build_object('entry',to_jsonb(event),'revision',rev+1));
end$$;
revoke all on function bolig_private.contract_finance_save(uuid,uuid,jsonb) from public,anon,service_role;
grant execute on function bolig_private.contract_finance_save(uuid,uuid,jsonb) to authenticated;
create or replace function public.bolig_contract_finance(p_company_id uuid,p_root_id uuid,p_action text default 'get',p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$select case when p_action='save' then bolig_private.contract_finance_save(p_company_id,p_root_id,p_payload) else bolig_private.contract_finance_workspace(p_company_id,p_root_id,p_action,p_payload) end$$;
-- Keep number uniqueness across both slots, including older clients using the legacy registration action.
create function bolig_private.finance_invoice_number_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if new.kind in('invoice','credit') then
  if (trim(coalesce(new.input->>'number',''))<>'' and lower(trim(new.input->>'number'))=lower(trim(new.input->>'index_number')))
   or exists(select 1 from bolig_private.contract_finance_events e where e.root_id=new.root_id and e.id<>new.id and e.kind in('invoice','credit') and exists(select 1 from unnest(array[new.input->>'number',new.input->>'index_number']) n where trim(coalesce(n,''))<>'' and lower(trim(n)) in(lower(trim(e.input->>'number')),lower(trim(e.input->>'index_number')))))
  then raise exception 'Fakturanummeret er allerede brukt.' using errcode='PT409';end if;
 end if;
 return new;
end$$;
revoke all on function bolig_private.finance_invoice_number_guard() from public,anon,authenticated,service_role;
create trigger bolig_finance_invoice_numbers before insert or update of input on bolig_private.contract_finance_events for each row execute function bolig_private.finance_invoice_number_guard();

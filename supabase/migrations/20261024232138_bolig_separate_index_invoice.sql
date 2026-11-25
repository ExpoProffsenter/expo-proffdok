-- Separate issued a konto principal from its immutable, not-yet-invoiced index basis.
-- Existing unsplit invoices, ACL, root locks, revisions and exact retries remain intact.
create or replace function bolig_private.contract_finance_workspace(c uuid,root uuid,action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare access jsonb;rev bigint;agreement jsonb;input jsonb;result jsonb;answer jsonb;
 event bolig_private.contract_finance_events%rowtype;original bolig_private.contract_finance_events%rowtype;
 ident uuid;l jsonb;v jsonb;old_line jsonb;lines jsonb:='[]';totals jsonb;list jsonb;basis jsonb;
 principal numeric;idx numeric;prior_p numeric;prior_i numeric;remaining_p numeric;remaining_i numeric;
 total_p bigint:=0;total_i bigint:=0;ids uuid[]:='{}';line_id uuid;latest_period text;
 split_index boolean:=false;index_source uuid;source_event bolig_private.contract_finance_events%rowtype;pending jsonb;
 mode text;method text;number text;credit_id uuid;with_index boolean;before_rev bigint;
begin
 -- Lock before contract_workspace takes its SHARE lock. Two writers must not
 -- hold SHARE locks while both wait to upgrade to UPDATE. Authorization follows
 -- the wait, so revoked rights cannot be used after queuing.
 if action in('agreement','register') then
  perform 1 from bolig_private.roots where id=root and company_id=c for update;
 end if;
 access:=bolig_private.contract_workspace(c,root,'get','{}');
 if not coalesce((access->>'allowed')::boolean,false) then raise exception 'Privat kontraktstilgang kreves.' using errcode='42501';end if;
 if action is null or action not in('get','entry','agreement','preview','register') or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>60000 then raise exception 'Ugyldig økonomiforespørsel.' using errcode='22023';end if;
 if action in('agreement','preview','register') and not coalesce((access->>'manage')::boolean,false) then raise exception 'Kontraktsadministrator og aktivt prosjekt kreves.' using errcode='42501';end if;

 select coalesce(max(revision),0) into rev from bolig_private.contract_finance_events where root_id=root;
 select e.input into agreement from bolig_private.contract_finance_events e where root_id=root and kind='agreement' order by revision desc limit 1;
 -- Exact retries return the original immutable receipt, even after later entries.
 if action in('agreement','register') then
  ident:=(payload->>'id')::uuid;input:=payload->'input';
  if ident is null then raise exception 'Forsøket mangler ID.' using errcode='22023';end if;
  select * into event from bolig_private.contract_finance_events where id=ident;
  if found then
   if event.root_id<>root or event.input is distinct from input or (action='agreement') is distinct from (event.kind='agreement') then raise exception 'Forsøket gjelder et annet grunnlag.' using errcode='PT409';end if;
   return jsonb_build_object('context',access->'context','root_id',root,'data',jsonb_build_object('entry',to_jsonb(event),'revision',rev));
  end if;
  if jsonb_typeof(payload->'revision') is distinct from 'number' or (payload->>'revision')::numeric is distinct from rev::numeric then raise exception 'Oversikten er endret. Hent siste oversikt og forhåndsvis på nytt.' using errcode='PT409';end if;
 end if;
 if action='agreement' then
  if exists(select 1 from jsonb_object_keys(payload) k where k not in('id','revision','input')) then raise exception 'Ukjente felt.' using errcode='22023';end if;
  -- Reuse the established exact numeric/line validator without changing it.
  -- The temporary selection only validates the contract, including an agreement with no index selections.
  perform bolig_private.contract_index_calculate(input||jsonb_build_object('lines',(select jsonb_agg(x||jsonb_build_object('selected',true)) from jsonb_array_elements(input->'lines') x)));
  if exists(select 1 from jsonb_array_elements(input->'lines') x where x->>'id' is distinct from ((x->>'id')::uuid)::text) then raise exception 'Ugyldig leveranse-ID.' using errcode='22023';end if;
  if input->>'target_month' is distinct from input->>'base_month' or input->'target_index' is distinct from input->'base_index' or input->'file_id' is distinct from 'null'::jsonb then raise exception 'Avtalegrunnlaget bruker basismåned og basisindeks.' using errcode='22023';end if;
  -- Validate original boolean selections too, not just the temporary validation copy.
  if exists(select 1 from jsonb_array_elements(input->'lines') x where jsonb_typeof(x->'selected') is distinct from 'boolean') then raise exception 'Velg hvilke deler som reguleres.' using errcode='22023';end if;
  if agreement is not null then
   for l in select value from jsonb_array_elements(agreement->'lines') loop
    select value into v from jsonb_array_elements(input->'lines') where value->>'id'=l->>'id';
    if v is null or v->>'kind' is distinct from l->>'kind' then raise exception 'Eksisterende leveransedeler må beholdes. Sett beløpet til null hvis delen utgår og ikke er fakturert.' using errcode='22023';end if;
   end loop;
  end if;
  for l in select value from jsonb_array_elements(input->'lines') loop
   select coalesce(sum((x->>'principal_cents')::numeric),0) into prior_p from bolig_private.contract_finance_events e cross join lateral jsonb_array_elements(e.result->'lines') x where e.root_id=root and e.kind in('invoice','credit') and x->>'id'=l->>'id';
   if (l->>'amount_cents')::numeric<prior_p then raise exception 'Avtalebeløpet kan ikke være lavere enn netto fakturert hovedstol.' using errcode='22023';end if;
  end loop;
  if agreement=input then raise exception 'Avtalegrunnlaget er allerede lagret.' using errcode='PT409';end if;
  result:=jsonb_build_object('agreement',input);
  insert into bolig_private.contract_finance_events(id,root_id,revision,kind,input,result,created_by) values(ident,root,rev+1,'agreement',input,result,auth.uid()) returning * into event;
  answer:=jsonb_build_object('entry',to_jsonb(event),'revision',rev+1);
 elsif action in('preview','register') then
  if agreement is null then raise exception 'Lagre avtalegrunnlaget først.' using errcode='22023';end if;
  if exists(select 1 from jsonb_object_keys(payload) k where k not in('id','revision','input')) then raise exception 'Ukjente felt.' using errcode='22023';end if;
  input:=payload->'input';mode:=input->>'mode';method:=input->>'method';number:=trim(input->>'number');
  if jsonb_typeof(input) is distinct from 'object' or exists(select 1 from jsonb_object_keys(input) k where k not in('mode','method','number','date','period','reason','credit_of','values','apply_index','target_month','target_index','origin','separate_index','index_of'))
   or coalesce(mode,'') not in('period','manual','credit') or coalesce(method,'') not in('earned','payment','documented','manual','credit')
   or (mode='period' and method not in('earned','payment','documented')) or (mode<>'period' and method<>mode)
   or jsonb_typeof(input->'number') is distinct from 'string' or length(number)>80 or (length(number)=0 and (action='register' or mode<>'period'))
   or coalesce(input->>'date','') !~ '^(19|20)[0-9]{2}-(0[1-9]|1[0-2])-[0-3][0-9]$'
   or coalesce(input->>'period','') !~ '^(19|20)[0-9]{2}-(0[1-9]|1[0-2])$'
   or jsonb_typeof(input->'reason') is distinct from 'string' or length(input->>'reason')>500
   or jsonb_typeof(input->'apply_index') is distinct from 'boolean'
   or (input ? 'separate_index' and jsonb_typeof(input->'separate_index') is distinct from 'boolean')
   or (input ? 'index_of' and jsonb_typeof(input->'index_of') is distinct from 'string')
   or jsonb_typeof(input->'values') is distinct from 'array' or jsonb_array_length(input->'values')<>jsonb_array_length(agreement->'lines')
  then raise exception 'Kontroller fakturanummer, dato, periode og beløp.' using errcode='22023';end if;
  perform (input->>'date')::date;
  if exists(select 1 from bolig_private.contract_finance_events e where e.root_id=root and e.kind in('invoice','credit') and lower(trim(e.input->>'number'))=lower(number)) then raise exception 'Faktura- eller kreditnotanummeret er allerede registrert.' using errcode='PT409';end if;
  with_index:=(input->>'apply_index')::boolean;split_index:=coalesce((input->>'separate_index')::boolean,false);
  if split_index and (mode<>'period' or not with_index) then raise exception 'Separat indeksgrunnlag krever en a konto-periode med indeks.' using errcode='22023';end if;
  if input ? 'index_of' then
   if mode<>'manual' then raise exception 'Separat indeksfaktura registreres med eget fakturanummer.' using errcode='22023';end if;
   index_source:=(input->>'index_of')::uuid;
   select * into source_event from bolig_private.contract_finance_events where id=index_source and root_id=root and kind='invoice';
   if not found or coalesce((source_event.result->'index_invoice'->'result'->>'index_cents')::bigint,0)<=0 then raise exception 'Indeksgrunnlaget er ikke tilgjengelig.' using errcode='42501';end if;
   if exists(select 1 from bolig_private.contract_finance_events e where e.root_id=root and e.input->>'index_of'=index_source::text) then raise exception 'Indeksfakturaen er allerede registrert. Kontroller historikken.' using errcode='PT409';end if;
   if exists(select 1 from bolig_private.contract_finance_events e where e.root_id=root and e.kind='credit' and e.input->>'credit_of'=index_source::text) then raise exception 'A konto er kreditert. Kontroller og før eventuell indeks manuelt fra økonomisystemet.' using errcode='22023';end if;
   if input->>'period' is distinct from source_event.input->>'period' then raise exception 'Indeksfakturaen må vise samme avregningsperiode som a konto-grunnlaget.' using errcode='22023';end if;
  end if;
  if mode<>'period' and with_index then raise exception 'Historiske beløp og kreditnotaer føres fra økonomisystemet.' using errcode='22023';end if;
  if mode='period' then
   select max(e.input->>'period') into latest_period from bolig_private.contract_finance_events e where root_id=root and kind in('invoice','credit');
   if input->>'period'<latest_period then raise exception 'Ny a konto-periode kan ikke være før siste registrerte periode. Tidligere fakturaer føres som historiske.' using errcode='22023';end if;
  end if;
  if mode='credit' then
   if length(trim(input->>'reason'))=0 then raise exception 'Oppgi årsak til kreditnotaen.' using errcode='22023';end if;
   credit_id:=(input->>'credit_of')::uuid;
   select * into original from bolig_private.contract_finance_events where id=credit_id and root_id=root and kind='invoice';
   if not found then raise exception 'Velg en registrert faktura i dette prosjektet.' using errcode='42501';end if;
  elsif input->>'credit_of' is not null then raise exception 'Kun kreditnota kan vise til en tidligere faktura.' using errcode='22023';end if;
  if with_index then
   basis:=agreement||jsonb_build_object('target_month',input->'target_month','target_index',input->'target_index','origin',input->'origin');
   perform bolig_private.contract_index_calculate(basis||jsonb_build_object('lines',(select jsonb_agg(x||jsonb_build_object('selected',true)) from jsonb_array_elements(agreement->'lines') x)));
  end if;
  for v in select value from jsonb_array_elements(input->'values') loop
   if jsonb_typeof(v) is distinct from 'object' or exists(select 1 from jsonb_object_keys(v) k where k not in('id','principal_cents','index_cents'))
    or jsonb_typeof(v->'id') is distinct from 'string' or jsonb_typeof(v->'principal_cents') is distinct from 'number' or jsonb_typeof(v->'index_cents') is distinct from 'number'
   then raise exception 'Ugyldig fakturalinje.' using errcode='22023';end if;
   line_id:=(v->>'id')::uuid;principal:=(v->>'principal_cents')::numeric;idx:=(v->>'index_cents')::numeric;
   select value into l from jsonb_array_elements(agreement->'lines') where value->>'id'=line_id::text;
   if l is null or line_id=any(ids) or principal not between 0 and 1000000000000 or principal<>trunc(principal) or abs(idx)>1000000000000 or idx<>trunc(idx) then raise exception 'Ukjent, duplisert eller ugyldig fakturalinje.' using errcode='22023';end if;
   ids:=array_append(ids,line_id);
   if index_source is not null then
    select value into old_line from jsonb_array_elements(source_event.result->'index_invoice'->'result'->'lines') where value->>'id'=line_id::text;
    if principal<>0 or idx is distinct from coalesce((old_line->>'index_cents')::numeric,0) then raise exception 'Indeksfakturaen må bruke det lagrede indeksgrunnlaget uten ny hovedstol.' using errcode='22023';end if;
   end if;
   select coalesce(sum((x->>'principal_cents')::numeric),0),coalesce(sum((x->>'index_cents')::numeric),0) into prior_p,prior_i from bolig_private.contract_finance_events e cross join lateral jsonb_array_elements(e.result->'lines') x where e.root_id=root and e.kind in('invoice','credit') and x->>'id'=line_id::text;
   if mode='credit' then
    select value into old_line from jsonb_array_elements(original.result->'lines') where value->>'id'=line_id::text;
    select coalesce(sum((x->>'principal_cents')::numeric),0),coalesce(sum((x->>'index_cents')::numeric),0) into remaining_p,remaining_i from bolig_private.contract_finance_events e cross join lateral jsonb_array_elements(e.result->'lines') x where e.root_id=root and e.kind='credit' and e.input->>'credit_of'=credit_id::text and x->>'id'=line_id::text;
    remaining_p:=coalesce((old_line->>'principal_cents')::numeric,0)+remaining_p;remaining_i:=coalesce((old_line->>'index_cents')::numeric,0)+remaining_i;
    if principal>remaining_p or (idx<>0 and (sign(idx)<>sign(remaining_i) or abs(idx)>abs(remaining_i))) then raise exception 'Kreditnotaen overstiger det som gjenstår på opprinnelig faktura.' using errcode='22023';end if;
    principal:=-principal;idx:=-idx;
   else
    if mode='period' then
     if idx<>0 then raise exception 'Periodens indeks beregnes på serveren.' using errcode='22023';end if;
     if method='earned' then principal:=principal-prior_p;end if;
     if principal<0 then raise exception 'Utført verdi er lavere enn fakturert hovedstol. Registrer eventuell kreditnota fra økonomisystemet først.' using errcode='22023';end if;
     idx:=case when with_index and (l->>'selected')::boolean then round(principal*((input->>'target_index')::numeric-(agreement->>'base_index')::numeric)*(agreement->>'factor')::numeric/(agreement->>'base_index')::numeric) else 0 end;
    end if;
    if prior_p+principal>(l->>'amount_cents')::numeric then raise exception 'Hovedstolen overstiger avtalt beløp. Kontroller opsjonen eller oppdater avtalegrunnlaget.' using errcode='22023';end if;
   end if;
   if abs(idx)>1000000000000 then raise exception 'Indeksbeløpet er for stort.' using errcode='22023';end if;
   total_p:=total_p+principal::bigint;total_i:=total_i+idx::bigint;
   lines:=lines||jsonb_build_array(jsonb_build_object('id',line_id,'name',l->>'name','kind',l->>'kind','contract_cents',l->'amount_cents','selected',l->'selected','prior_principal_cents',prior_p,'prior_index_cents',prior_i,'principal_cents',principal,'index_cents',idx,'remaining_cents',(l->>'amount_cents')::numeric-prior_p-principal));
  end loop;
  if total_p=0 and total_i=0 then raise exception 'Oppgi et beløp for perioden.' using errcode='22023';end if;
  if (mode<>'credit' and total_p+total_i<=0) or (mode='credit' and total_p+total_i>=0) then raise exception 'Kontroller fortegn og samlet faktura-/kreditnotabeløp.' using errcode='22023';end if;
  result:=jsonb_build_object('lines',lines,'principal_cents',total_p,'index_cents',total_i,'total_cents',total_p+total_i,'agreement',agreement,'index_basis',case when with_index then basis else null end,'ledger_revision',rev);
  if index_source is not null then
   result:=result||jsonb_build_object('index_basis',source_event.result->'index_invoice'->'result'->'index_basis');
  end if;
  if split_index then
   if action='register' and total_i<0 then raise exception 'Negativ indeks må føres som fradrag på a konto. Velg bort separat indeksfaktura.' using errcode='22023';end if;
   result:=result||jsonb_build_object('index_invoice',jsonb_build_object('input',input,'result',result),'index_cents',0,'total_cents',total_p,'lines',(select jsonb_agg(x||jsonb_build_object('index_cents',0)) from jsonb_array_elements(lines) x));
  end if;
  if action='register' then
   insert into bolig_private.contract_finance_events(id,root_id,revision,kind,input,result,created_by) values(ident,root,rev+1,case when mode='credit' then 'credit' else 'invoice' end,input,result,auth.uid()) returning * into event;
   answer:=jsonb_build_object('entry',to_jsonb(event),'revision',rev+1);
  else answer:=jsonb_build_object('input',input,'result',result,'revision',rev);end if;
 elsif action='entry' then
  select * into event from bolig_private.contract_finance_events where root_id=root and id=(payload->>'id')::uuid and kind in('invoice','credit');
  if not found then raise exception 'Posten er ikke tilgjengelig.' using errcode='42501';end if;
  answer:=jsonb_build_object('entry',to_jsonb(event),'revision',rev);
 else
  if exists(select 1 from jsonb_object_keys(payload) k where k not in('before_revision')) then raise exception 'Ukjente oversiktsfelt.' using errcode='22023';end if;
  before_rev:=coalesce((payload->>'before_revision')::bigint,rev+1);
  select coalesce(jsonb_agg(t),'[]') into totals from (
   select part.value->>'id' id,part.value->>'name' name,part.value->>'kind' kind,(part.value->>'amount_cents')::bigint contract_cents,
   coalesce((select sum((x->>'principal_cents')::bigint) from bolig_private.contract_finance_events e cross join lateral jsonb_array_elements(e.result->'lines') x where e.root_id=root and e.kind in('invoice','credit') and x->>'id'=part.value->>'id'),0) principal_cents,
   coalesce((select sum((x->>'index_cents')::bigint) from bolig_private.contract_finance_events e cross join lateral jsonb_array_elements(e.result->'lines') x where e.root_id=root and e.kind in('invoice','credit') and x->>'id'=part.value->>'id'),0) index_cents
   from jsonb_array_elements(agreement->'lines') part(value))t;
  select coalesce(jsonb_agg(t order by revision desc),'[]') into list from (select * from bolig_private.contract_finance_events where root_id=root and kind in('invoice','credit') and revision<before_rev order by revision desc limit 50)t;
  select coalesce(jsonb_agg(t.source order by t.revision),'[]') into pending from (
   select e.revision,jsonb_build_object('entry_id',e.id,'input',e.result->'index_invoice'->'input','result',e.result->'index_invoice'->'result') source
   from bolig_private.contract_finance_events e
   where e.root_id=root and e.kind='invoice' and coalesce((e.result->'index_invoice'->'result'->>'index_cents')::bigint,0)>0
   and not exists(select 1 from bolig_private.contract_finance_events linked where linked.root_id=root and (linked.input->>'index_of'=e.id::text or (linked.kind='credit' and linked.input->>'credit_of'=e.id::text)))
   order by e.revision limit 50)t;
  answer:=jsonb_build_object('revision',rev,'agreement',agreement,'totals',totals,'entries',list,'index_invoices',pending);
 end if;
 return jsonb_build_object('context',access->'context','root_id',root,'data',answer);
end$$;

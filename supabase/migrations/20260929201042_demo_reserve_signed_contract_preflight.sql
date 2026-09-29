-- DEMO SANDBOX ONLY. Never apply this fixture repair to Production.
-- The original Golden snapshot predates the signed-contract warranty guard:
-- DEMO-002 has an issued warranty but no contract document. The PDF is a
-- clearly fictional static asset at /demo-documents/DEMO-002-signert-kontrakt.pdf.
-- Keep the guard; repair only this synthetic project and its Golden copy.

do $repair$
declare
  v_golden public.demo_sandbox_snapshots%rowtype;
  v_reserve public.projects%rowtype;
  v_saved_project jsonb;
  v_file jsonb := jsonb_build_object(
    'id', 'demo-reserve-signed-contract',
    'name', 'DEMO-002-signert-kontrakt.pdf',
    'url', '/demo-documents/DEMO-002-signert-kontrakt.pdf',
    'type', 'application/pdf',
    'mimeType', 'application/pdf',
    'size', 45224,
    'documentType', 'contract',
    'contractSource', 'external',
    'contractConfirmedAt', '2026-09-15T13:00:00Z',
    'createdAt', '2026-09-15T13:00:00Z',
    'demoOnly', true
  );
  v_projects jsonb;
begin
  select * into v_golden
  from public.demo_sandbox_snapshots
  where snapshot_key = 'golden-v1'
  for update;
  if not found then
    raise exception 'Demo repair: Golden snapshot is missing.';
  end if;

  select * into v_reserve
  from public.projects
  where data->'project'->>'demoSuiteKey' = 'golden-demo-v1'
    and data->'project'->>'demoStage' = 'finished'
    and data->'project'->>'projectNumber' = 'DEMO-002'
  for update;
  if not found then
    raise exception 'Demo repair: DEMO-002 reserve project is missing.';
  end if;

  select project.value into v_saved_project
  from jsonb_array_elements(v_golden.payload->'projects') project(value)
  where project.value->>'id' = v_reserve.id::text;
  if v_saved_project is null
     or v_saved_project->'data'->'project'->>'projectNumber' <> 'DEMO-002'
     or (select count(*) from jsonb_array_elements(v_golden.payload->'projects') p
         where p->>'id' = v_reserve.id::text) <> 1
     or (select count(*) from jsonb_array_elements(v_golden.payload->'warranty_registry') w
         where w->>'project_id' = v_reserve.id::text and w->>'status' = 'issued') <> 1
     or (select count(*) from public.warranty_registry w
         where w.project_id = v_reserve.id and w.status = 'issued') <> 1 then
    raise exception 'Demo repair: expected one matching reserve and issued warranty in live and Golden data.';
  end if;

  -- Preserve the previous Golden and live project rows for an exact rollback.
  insert into public.demo_sandbox_snapshots(snapshot_key, payload, updated_at, updated_by)
  values ('backup-golden-v1-before-reserve-contract-20260929',
          v_golden.payload, now(), v_golden.updated_by)
  on conflict (snapshot_key) do nothing;
  insert into public.demo_sandbox_snapshots(snapshot_key, payload, updated_at, updated_by)
  values ('backup-live-reserve-before-contract-20260929',
          jsonb_build_object('projects', jsonb_build_array(to_jsonb(v_reserve))),
          now(), v_golden.updated_by)
  on conflict (snapshot_key) do nothing;

  if not public.project_data_has_signed_contract(v_saved_project->'data') then
    select jsonb_agg(
      case when p.value->>'id' = v_reserve.id::text then
        jsonb_set(
          p.value,
          '{data,tilbud,files}',
          coalesce(p.value->'data'->'tilbud'->'files', '[]'::jsonb) || jsonb_build_array(v_file),
          true
        )
      else p.value end
      order by p.ordinality
    ) into v_projects
    from jsonb_array_elements(v_golden.payload->'projects') with ordinality p(value, ordinality);

    update public.demo_sandbox_snapshots
    set payload = jsonb_set(payload, '{projects}', v_projects, true), updated_at = now()
    where snapshot_key = 'golden-v1';
  end if;

  if not public.project_data_has_signed_contract(v_reserve.data) then
    update public.projects
    set data = jsonb_set(
      data,
      '{tilbud,files}',
      coalesce(data->'tilbud'->'files', '[]'::jsonb) || jsonb_build_array(v_file),
      true
    )
    where id = v_reserve.id;
  end if;

  if not public.project_data_has_signed_contract(
      (select p.value->'data'
       from public.demo_sandbox_snapshots s,
            jsonb_array_elements(s.payload->'projects') p(value)
       where s.snapshot_key = 'golden-v1' and p.value->>'id' = v_reserve.id::text)
    ) or not (select public.project_data_has_signed_contract(data)
              from public.projects where id = v_reserve.id) then
    raise exception 'Demo repair: reserve contract did not persist in both places.';
  end if;
end;
$repair$;

-- The existing preflight checked the signed Sales contract and issued reserve
-- warranty separately. Check their project relationship and the Golden payload
-- so the same reset failure is visible before a presentation.
create or replace function public.demo_sandbox_preflight()
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'auth', 'storage'
as $function$
declare
  v_base jsonb;
  v_checks jsonb;
  v_trigger_count int;
  v_function_count int;
  v_empty_list_payload int;
  v_projection_ok boolean;
  v_projection_check jsonb;
  v_golden jsonb;
  v_live_missing int;
  v_golden_count int;
  v_golden_missing int;
  v_contract_ok boolean;
  v_contract_check jsonb;
begin
  v_base := public.demo_sandbox_preflight_core();

  select count(*) into v_trigger_count
  from pg_trigger t
  join pg_class r on r.oid=t.tgrelid
  join pg_namespace n on n.oid=r.relnamespace
  where n.nspname='public'
    and r.relname='sales_requests'
    and not t.tgisinternal
    and t.tgname in ('sales_requests_refresh_list_payload','trg_sales_requests_creator_snapshot');

  select count(*) into v_function_count
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname in ('sales_requests_refresh_list_payload','set_sales_request_creator_snapshot');

  select count(*) into v_empty_list_payload
  from public.sales_requests
  where list_payload is null or list_payload='{}'::jsonb;

  v_projection_ok := v_trigger_count=2 and v_function_count=2 and v_empty_list_payload=0;
  v_projection_check := jsonb_build_object(
    'key','sales_projection_backend',
    'ok',v_projection_ok,
    'detail',v_trigger_count||'/2 triggere · '||v_function_count||'/2 funksjoner · '||v_empty_list_payload||' tomme list_payload'
  );

  select payload into v_golden
  from public.demo_sandbox_snapshots where snapshot_key='golden-v1';

  select count(*) into v_live_missing
  from public.warranty_registry w
  join public.projects p on p.id=w.project_id
  where p.data->'project'->>'demoSuiteKey'='golden-demo-v1'
    and not public.project_data_has_signed_contract(p.data);

  select count(*), count(*) filter (where not exists (
    select 1 from jsonb_array_elements(coalesce(v_golden->'projects','[]'::jsonb)) p
    where p->>'id'=w.value->>'project_id'
      and public.project_data_has_signed_contract(p->'data')
  )) into v_golden_count, v_golden_missing
  from jsonb_array_elements(coalesce(v_golden->'warranty_registry','[]'::jsonb)) w(value);

  v_contract_ok := v_live_missing=0 and v_golden_count>0 and v_golden_missing=0;
  v_contract_check := jsonb_build_object(
    'key','warranty_contract',
    'ok',v_contract_ok,
    'detail','Aktiv demo: '||v_live_missing||' garanti(er) uten kontrakt · Golden: '||v_golden_missing||' av '||v_golden_count||' mangler kontrakt'
  );

  v_checks := coalesce(v_base->'checks','[]'::jsonb)
    || jsonb_build_array(v_projection_check, v_contract_check);

  return jsonb_build_object(
    'ok',coalesce((v_base->>'ok')::boolean,false) and v_projection_ok and v_contract_ok,
    'checkedAt',now(),
    'checks',v_checks
  );
end;
$function$;

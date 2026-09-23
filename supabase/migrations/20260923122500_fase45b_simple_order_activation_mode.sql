-- FASE 45B – valgt videreføring lagres på salgssaken og serveren markerer
-- prosjektmotor-raden som Enkel ordre. Ingen ny ordretabell opprettes.

create or replace function public.set_simple_order_activation_mode(
  p_request_ref text,
  p_mode text
)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  v_company_id uuid:=public.current_active_company_scope_id();
  v_mode text:=case when lower(trim(coalesce(p_mode,'')))='project' then 'project' else 'simple_order' end;
  v_payload jsonb;
begin
  if auth.uid() is null or v_company_id is null then
    raise exception 'Du har ikke tilgang til salgssaken.' using errcode='42501';
  end if;

  select r.payload into v_payload
  from public.sales_requests r
  where r.company_id=v_company_id
    and r.request_ref=trim(coalesce(p_request_ref,''))
  for update;

  if v_payload is null then
    raise exception 'Salgssaken finnes ikke.' using errcode='P0002';
  end if;

  if not exists(
    select 1
    from jsonb_array_elements(
      case when jsonb_typeof(v_payload->'offerLines')='array'
        then v_payload->'offerLines' else '[]'::jsonb end
    ) e(elem)
    where coalesce((e.elem->>'simpleOrder')::boolean,false)=true
       or e.elem->>'offerKind'='simple-order-v1'
  ) then
    raise exception 'Salgssaken er ikke en Enkel ordre.' using errcode='22023';
  end if;

  update public.sales_requests
  set payload=jsonb_set(v_payload,'{simpleOrderActivationMode}',to_jsonb(v_mode),true),
      updated_at=now()
  where company_id=v_company_id
    and request_ref=trim(coalesce(p_request_ref,''));

  return jsonb_build_object(
    'request_ref',trim(coalesce(p_request_ref,'')),
    'mode',v_mode
  );
end;
$$;

revoke all on function public.set_simple_order_activation_mode(text,text) from public,anon;
grant execute on function public.set_simple_order_activation_mode(text,text) to authenticated;

create or replace function public.fase45b_mark_simple_order_project()
returns trigger
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  v_company_id uuid:=public.current_active_company_scope_id();
  v_request_ref text:=trim(coalesce(new.data->'project'->'salesOrigin'->>'requestRef',''));
  v_payload jsonb;
  v_mode text;
  v_is_simple boolean:=false;
begin
  if v_company_id is null or v_request_ref='' then return new; end if;

  select r.payload into v_payload
  from public.sales_requests r
  where r.company_id=v_company_id
    and r.request_ref=v_request_ref;

  if v_payload is null then return new; end if;

  v_mode:=lower(trim(coalesce(v_payload->>'simpleOrderActivationMode','')));

  select exists(
    select 1
    from jsonb_array_elements(
      case when jsonb_typeof(v_payload->'offerLines')='array'
        then v_payload->'offerLines' else '[]'::jsonb end
    ) e(elem)
    where coalesce((e.elem->>'simpleOrder')::boolean,false)=true
       or e.elem->>'offerKind'='simple-order-v1'
  ) into v_is_simple;

  if v_is_simple and v_mode='simple_order' then
    new.data:=jsonb_set(coalesce(new.data,'{}'::jsonb),'{project,workflowType}',to_jsonb('simple_order'::text),true);
    new.data:=jsonb_set(new.data,'{project,simpleOrder}',to_jsonb(true),true);
    new.data:=jsonb_set(new.data,'{project,salesOrigin,activationMode}',to_jsonb('simple_order'::text),true);
    new.share_enabled:=false;
  end if;

  return new;
end;
$$;

revoke all on function public.fase45b_mark_simple_order_project() from public,anon,authenticated;

drop trigger if exists trg_fase45b_mark_simple_order_project on public.projects;
create trigger trg_fase45b_mark_simple_order_project
before insert on public.projects
for each row execute function public.fase45b_mark_simple_order_project();

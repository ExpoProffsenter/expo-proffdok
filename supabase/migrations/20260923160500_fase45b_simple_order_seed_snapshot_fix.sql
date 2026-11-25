-- FASE 45B – korrigerer seed av nested tilbudsdata når `tilbud` ikke finnes fra før.
-- PostgreSQL jsonb_set oppretter ikke manglende mellomobjekter i en flernivå-path.

create or replace function public.fase45b_seed_simple_order_accepted_products()
returns trigger
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  v_request_ref text:=trim(coalesce(new.data->'project'->'salesOrigin'->>'requestRef',''));
  v_workflow text:=lower(trim(coalesce(new.data->'project'->>'workflowType','')));
  v_accepted jsonb;
  v_snapshot jsonb;
  v_selected jsonb:='[]'::jsonb;
  v_products jsonb:='[]'::jsonb;
  v_existing jsonb:=coalesce(new.data->'manualProducts','{}'::jsonb);
  v_tilbud jsonb:=coalesce(new.data->'tilbud','{}'::jsonb);
begin
  if v_workflow<>'simple_order' and coalesce((new.data->'project'->>'simpleOrder')::boolean,false)=false then return new; end if;
  if v_request_ref='' then return new; end if;

  select o.accepted_payload into v_accepted
  from public.sales_offers o
  where o.request_ref=v_request_ref
    and o.status in ('accepted','akseptert')
    and (new.company_scope_id is null or o.company_id=new.company_scope_id)
  order by o.accepted_at desc nulls last limit 1;

  if v_accepted is null then return new; end if;
  v_snapshot:=coalesce(v_accepted->'version_snapshot','{}'::jsonb);
  v_selected:=case when jsonb_typeof(v_accepted->'selected_options')='array' then v_accepted->'selected_options' else '[]'::jsonb end;

  with accepted_items as (
    select elem,false as is_option
    from jsonb_array_elements(case when jsonb_typeof(v_snapshot->'lines')='array' then v_snapshot->'lines' else '[]'::jsonb end) t(elem)
    where coalesce((elem->>'__companyMeta')::boolean,false)=false
      and coalesce((elem->>'__storeOfferMeta')::boolean,false)=false
      and coalesce(elem->>'lineType','')<>'store_text'
      and nullif(trim(coalesce(elem->>'description','')),'') is not null
      and (
        nullif(trim(coalesce(elem->>'supplierProductNumber','')),'') is not null
        or nullif(trim(coalesce(elem->>'storeCatalogGtin','')),'') is not null
        or nullif(trim(coalesce(elem->>'nobbNumber','')),'') is not null
        or nullif(trim(coalesce(elem->>'productUrl','')),'') is not null
      )
    union all
    select opt,true as is_option
    from jsonb_array_elements(case when jsonb_typeof(v_snapshot->'options')='array' then v_snapshot->'options' else '[]'::jsonb end) o(opt)
    where exists(select 1 from jsonb_array_elements(v_selected) s(sel) where coalesce(s.sel->>'id','')=coalesce(opt->>'id',''))
      and (
        nullif(trim(coalesce(opt->>'supplierProductNumber','')),'') is not null
        or nullif(trim(coalesce(opt->>'storeCatalogGtin','')),'') is not null
        or nullif(trim(coalesce(opt->>'nobbNumber','')),'') is not null
        or nullif(trim(coalesce(opt->>'productUrl','')),'') is not null
      )
  )
  select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
      'id',coalesce(nullif(elem->>'id',''),gen_random_uuid()::text),
      'name',coalesce(nullif(elem->>'description',''),nullif(elem->>'title',''),'Produkt'),
      'comment',concat_ws(' · ',
        case when is_option then 'Valgt opsjon' else null end,
        case when nullif(elem->>'supplierProductNumber','') is not null then 'Varenr. '||(elem->>'supplierProductNumber') else null end,
        case when nullif(elem->>'nobbNumber','') is not null then 'NOBB '||(elem->>'nobbNumber') else null end,
        case when nullif(elem->>'storeCatalogGtin','') is not null then 'GTIN '||(elem->>'storeCatalogGtin') else null end
      ),
      'supplierProductNumber',nullif(elem->>'supplierProductNumber',''),
      'gtin',nullif(elem->>'storeCatalogGtin',''),
      'nobbNumber',nullif(elem->>'nobbNumber',''),
      'fdvUrl',coalesce(nullif(elem->>'fdvUrl',''),nullif(elem->>'productUrl','')),
      'source','accepted_offer'
    )) order by is_option,coalesce(elem->>'description',elem->>'title','')),'[]'::jsonb)
  into v_products from accepted_items;

  if jsonb_array_length(v_products)>0 then
    v_existing:=jsonb_set(v_existing,'{"Produkter fra akseptert tilbud"}',v_products,true);
    new.data:=jsonb_set(coalesce(new.data,'{}'::jsonb),'{manualProducts}',v_existing,true);
  end if;

  v_tilbud:=jsonb_set(v_tilbud,'{acceptedOfferSnapshot}',jsonb_build_object(
    'lines',coalesce(v_snapshot->'lines','[]'::jsonb),
    'selectedOptions',v_selected,
    'sourceVersionId',coalesce(v_accepted->'version_id','null'::jsonb),
    'sourceVersionNumber',coalesce(v_accepted->'version_number','null'::jsonb)
  ),true);
  v_tilbud:=jsonb_set(v_tilbud,'{enabled}','true'::jsonb,true);
  new.data:=jsonb_set(coalesce(new.data,'{}'::jsonb),'{tilbud}',v_tilbud,true);

  return new;
end;
$$;

revoke all on function public.fase45b_seed_simple_order_accepted_products() from public,anon,authenticated;

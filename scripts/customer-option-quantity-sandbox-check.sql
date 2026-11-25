-- Ephemeral integration proof. All inserted offer/version/acceptance rows roll back.
begin;
do $$
declare
  offer_id uuid := gen_random_uuid();
  version_id uuid := gen_random_uuid();
  token_id uuid := gen_random_uuid();
  result jsonb;
  original_options jsonb := '[{"id":"quantity-qa-spot","title":"Syntetisk downlight","amount":"2400","quantity":"1","unit":"stk","customerCanChooseQuantity":true},{"id":"quantity-qa-fixed","title":"Fast tillegg","amount":"100","quantity":"2"}]';
begin
  insert into public.sales_offers(id,public_token,customer_name,title,status)
    values(offer_id,token_id,'Syntetisk QA','Antallskontroll','sent');
  insert into public.sales_offer_versions(id,offer_id,version_number,title,lines,options,total_ex_vat)
    values(version_id,offer_id,1,'Antallskontroll','[{"id":"qa-base","amount":"10000"}]',original_options,10000);
  update public.sales_offers set active_version_id=version_id where id=offer_id;
  set local role anon;
  begin
    perform public.accept_sales_offer_quantities(token_id,'QA','[]',gen_random_uuid());
    raise exception 'Expected stale-version rejection';
  exception when serialization_failure then null;
  end;
  begin
    perform public.accept_sales_offer_quantities(token_id,'QA','[{"id":"quantity-qa-spot","quantity":0}]',version_id);
    raise exception 'Expected invalid-quantity rejection';
  exception when invalid_parameter_value then null;
  end;
  result := public.accept_sales_offer_quantities(token_id,'QA','[{"id":"quantity-qa-spot","quantity":4,"amount":0,"title":"Forged"},{"id":"quantity-qa-fixed","quantity":999}]',version_id);
  assert result->>'accepted_total'='19800', 'Server total must use published prices';
  assert result#>>'{selected_options,0,quantity}'='4', 'Chosen quantity missing';
  assert result#>>'{selected_options,0,amount}'='2400', 'Client changed price';
  assert result#>>'{selected_options,0,title}'='Syntetisk downlight', 'Client changed metadata';
  assert result#>>'{selected_options,1,quantity}'='2', 'Fixed quantity changed';
  assert result#>'{version_snapshot,options}'=original_options, 'Published snapshot changed';
  reset role;
  assert (select accepted_payload=result from public.sales_offers where id=offer_id), 'Acceptance not persisted';
  assert (select options=original_options from public.sales_offer_versions where id=version_id), 'Stored version changed';
end;
$$;
rollback;

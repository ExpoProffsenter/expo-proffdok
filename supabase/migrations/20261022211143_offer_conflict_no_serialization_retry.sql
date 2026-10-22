-- Business version conflicts must return HTTP 409. SQLSTATE 40001 means a
-- retryable serialization failure and can loop indefinitely in PostgREST 14.
-- Preserve the existing function, version guard, SECURITY DEFINER and grants.
do $migration$
declare definition text;needle text:=$needle$errcode = '40001'$needle$;
begin
 definition:=pg_get_functiondef('public.accept_sales_offer_quantities(uuid,text,jsonb,uuid)'::regprocedure);
 if position(needle in definition)=0 or
   (length(definition)-length(replace(definition,needle,'')))/length(needle)<>1 or
   position('expected_version_id is null or current_version is distinct from expected_version_id' in definition)=0 then
  raise exception 'Unexpected acceptance function. Inspect the current definition before changing it.';
 end if;
 execute replace(definition,needle,$replacement$errcode = 'PT409'$replacement$);
end
$migration$;

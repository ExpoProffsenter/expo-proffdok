-- Sandbox only. Uses existing Demo fixtures; all data writes roll back. Sends no email.
begin;
do $$
declare
 c uuid:='e0000000-0000-4000-8000-000000000001';
 actor uuid:='d0000000-0000-4000-8000-000000000001';
 product uuid:='11e0f96d-5941-4821-8e39-358bea924441';
 request_id uuid:=gen_random_uuid();
 order_input jsonb;prepared jsonb;ctx jsonb;token text;contact_id uuid;net numeric;
begin
 select i.purchase_net_ex_vat into strict net from public.internal_store_catalog_items i where id=product;
 select s.decrypted_secret into strict token from supplier_order_private.worker_settings cfg join vault.decrypted_secrets s on s.id=cfg.secret_id;
 perform set_config('request.jwt.claim.sub',actor::text,true);
 order_input:=jsonb_build_object('to','supplier-order-qa@example.invalid','supplierName','QA – rolles tilbake','reference','QA-00458',
 'deliveryAddress','QA testadresse','message','Ingen e-post skal sendes.','remember',true,'items',jsonb_build_array(jsonb_build_object('id',product,'quantity','2')));
 execute 'set local role authenticated';
 ctx:=public.supplier_order_context(c);assert ctx->'company'->>'companyName' is not null;
 prepared:=public.supplier_order_prepare(c,request_id,order_input);
 assert (prepared->'snapshot'->>'totalNet')::numeric=round(net,2)*2;
 assert (prepared->'snapshot'->'items'->0->>'unitNet')::numeric=round(net,2);
 assert prepared->'snapshot'->'items'->0->>'number'='DEMO-AZZ-001';
 assert prepared->'snapshot'->>'deliveryAddress'='QA testadresse';
 assert public.supplier_order_prepare(c,request_id,order_input)=prepared;
 begin perform public.supplier_order_context('e0000000-0000-4000-8000-000000000002');raise exception 'Foreign company unexpectedly accepted';exception when insufficient_privilege then null;end;
 begin perform public.supplier_order_prepare(c,request_id,order_input||'{"to":"changed@example.invalid"}');raise exception 'Changed replay unexpectedly accepted';exception when invalid_parameter_value then null;end;
 begin perform public.supplier_order_prepare(c,gen_random_uuid(),order_input||'{"unitNet":1}');raise exception 'Client price unexpectedly accepted';exception when invalid_parameter_value then null;end;
 begin perform public.supplier_order_prepare(c,gen_random_uuid(),order_input||'{"deliveryAddress":""}');raise exception 'Blank delivery unexpectedly accepted';exception when invalid_parameter_value then null;end;
 begin perform public.supplier_order_worker_get(token,request_id);raise exception 'Client dispatch unexpectedly accepted';exception when insufficient_privilege then null;end;
 begin perform public.supplier_order_complete(request_id,'forged');raise exception 'Client receipt unexpectedly accepted';exception when insufficient_privilege then null;end;
 execute 'reset role';execute 'set local role service_role';
 assert public.supplier_order_worker_get(token,request_id)=prepared;
 begin perform public.supplier_order_worker_get(repeat('0',64),request_id);raise exception 'Invalid worker token unexpectedly accepted';exception when insufficient_privilege then null;end;
 perform public.supplier_order_complete(request_id,'QA-NOT-A-REAL-SEND');
 execute 'reset role';execute 'set local role authenticated';
 ctx:=public.supplier_order_context(c);
 select (j->>'id')::uuid into strict contact_id from jsonb_array_elements(ctx->'contacts') j where j->>'email'='supplier-order-qa@example.invalid';
 assert public.supplier_order_contact_delete(c,contact_id);
 assert (public.supplier_order_prepare(c,request_id,order_input)->>'sent')::boolean;
 execute 'reset role';update public.profiles set approved=false where id=actor;
 execute 'set local role authenticated';
 begin perform public.supplier_order_prepare(c,request_id,order_input);raise exception 'Revoked actor unexpectedly accepted';exception when insufficient_privilege then null;end;
 execute 'reset role';
end $$;
rollback;

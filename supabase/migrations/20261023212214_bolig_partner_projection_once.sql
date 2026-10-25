-- Evaluate each whitelisted row once before filtering, sorting and aggregation.
-- SQL inlining otherwise repeats partner_target for each ORDER BY expression.
-- The resulting JSON, authority checks and write locks remain identical.
do $patch$
declare body text; anchor text;
begin
 body:=pg_get_functiondef('bolig_private.partner_view(bolig_private.partner_access)'::regprocedure);
 anchor:=$a$from (select bolig_private.partner_target(p.root_id,'order',o.id) v from bolig_private.purchase_orders o where o.root_id=p.root_id and bolig_private.partner_allowed(p,'order',o.id)) s$a$;
 if position(anchor in body)=0 then raise exception 'Missing order projection in bolig_private.partner_view(bolig_private.partner_access)';end if;
 body:=replace(body,anchor,$a$from (with partner_rows as materialized (select bolig_private.partner_target(p.root_id,'order',o.id) v from bolig_private.purchase_orders o where o.root_id=p.root_id and bolig_private.partner_allowed(p,'order',o.id)) select v from partner_rows) s$a$);
 anchor:=$a$from (select bolig_private.partner_target(p.root_id,'task',t.id) v from bolig_private.progress_tasks t where t.root_id=p.root_id and bolig_private.partner_allowed(p,'task',t.id)) s$a$;
 if position(anchor in body)=0 then raise exception 'Missing task projection in bolig_private.partner_view(bolig_private.partner_access)';end if;
 body:=replace(body,anchor,$a$from (with partner_rows as materialized (select bolig_private.partner_target(p.root_id,'task',t.id) v from bolig_private.progress_tasks t where t.root_id=p.root_id and bolig_private.partner_allowed(p,'task',t.id)) select v from partner_rows) s$a$);
 execute body;
 body:=pg_get_functiondef('bolig_private.partners_selected_v1(uuid,uuid,text,jsonb)'::regprocedure);
 anchor:=$a$from (select bolig_private.partner_target(root,'order',id) v from bolig_private.purchase_orders where root_id=root) s$a$;
 if position(anchor in body)=0 then raise exception 'Missing order projection in bolig_private.partners_selected_v1(uuid,uuid,text,jsonb)';end if;
 body:=replace(body,anchor,$a$from (with partner_rows as materialized (select bolig_private.partner_target(root,'order',id) v from bolig_private.purchase_orders where root_id=root) select v from partner_rows) s$a$);
 anchor:=$a$from (select bolig_private.partner_target(root,'task',id) v from bolig_private.progress_tasks where root_id=root) s$a$;
 if position(anchor in body)=0 then raise exception 'Missing task projection in bolig_private.partners_selected_v1(uuid,uuid,text,jsonb)';end if;
 body:=replace(body,anchor,$a$from (with partner_rows as materialized (select bolig_private.partner_target(root,'task',id) v from bolig_private.progress_tasks where root_id=root) select v from partner_rows) s$a$);
 execute body;
end$patch$;

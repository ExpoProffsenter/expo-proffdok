-- Non-sensitive progress counters only. Never expose order recipients or goods here.
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_private.overview(uuid,uuid)'::regprocedure);
 anchor:=$a$'order_revision',coalesce(od.revision,0),$a$;
 if position(anchor in body)=0 then raise exception 'Missing order summary anchor';end if;
 body:=replace(body,anchor,$a$'purchase_count',coalesce(pur.total,0),'prepared_count',coalesce(pur.prepared,0),'ordered_count',coalesce(pur.ordered,0),'partial_count',coalesce(pur.partial,0),'delivered_count',coalesce(pur.delivered,0),'purchase_outdated',coalesce(pur.outdated,false),
    'remaining_goods',case when od.revision is null then null else (select count(*) from jsonb_array_elements(od.snapshot->'goods') g where not exists(select 1 from bolig_private.purchase_orders po cross join lateral jsonb_array_elements(po.snapshot->'goods') pg where po.unit_id=u.id and po.root_id=root and po.status<>'cancelled' and bolig_private.same_good(g,pg))) end,
    'order_revision',coalesce(od.revision,0),$a$);
 body:=replace(body,'select d.revision,d.source_choice_revision from bolig_private.order_draft_versions','select d.revision,d.source_choice_revision,d.snapshot from bolig_private.order_draft_versions');
 anchor:='  where u.root_id=root and not u.archived;';
 if position(anchor in body)=0 then raise exception 'Missing overview scope anchor';end if;
 body:=replace(body,anchor,$a$  left join lateral (select count(*) total,count(*) filter(where po.status='prepared') prepared,count(*) filter(where po.status='ordered') ordered,count(*) filter(where po.status='partial') partial,count(*) filter(where po.status='delivered') delivered,bool_or(po.source_choice_revision is distinct from cv.revision) outdated from bolig_private.purchase_orders po where po.unit_id=u.id and po.root_id=root and po.status<>'cancelled') pur on true
  where u.root_id=root and not u.archived;$a$);
 execute body;
end$patch$;

-- Supplier reference remains editable after confirmed sending (it is optional).
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_private.deliveries(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 anchor:=$a$if o.mail_request_id is not null and action in ('ordered','cancel','supplier_reference')$a$;
 if position(anchor in body)=0 then raise exception 'Missing active mail guard';end if;
 execute replace(body,anchor,$a$if o.mail_request_id is not null and o.status='prepared' and action in ('ordered','cancel','supplier_reference')$a$);
end$patch$;

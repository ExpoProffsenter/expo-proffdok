-- Aggregate labels and handover must also describe the underlying dwellings.
do $patch$
declare body text;anchor text;
begin
 body:=pg_get_functiondef('bolig_private.completion_tree(uuid,uuid)'::regprocedure);
 anchor:=$a$  proof:=src->>'basis';items:='[]';done:=0;executed:=false;$a$;
 if position(anchor in body)=0 then raise exception 'Missing completion source anchor';end if;
 -- After evaluating own requirements, execution also requires executed children.
 anchor:=$a$  valid:=s.approval is not null$a$;
 if position(anchor in body)=0 then raise exception 'Missing completion validity anchor';end if;
 body:=replace(body,anchor,$a$  if r.kind<>'unit' and (jsonb_array_length(child)=0 or exists(select 1 from jsonb_array_elements(child) x where x->>'status' not in ('executed','controlled','ready','handed_over'))) then executed:=false;end if;
  valid:=s.approval is not null$a$);
 execute body;
 body:=pg_get_functiondef('bolig_private.completion(uuid,uuid,uuid,text,bigint,jsonb)'::regprocedure);
 anchor:=$a$   -- Records an already completed handover; this is not a legal signature.$a$;
 if position(anchor in body)=0 then raise exception 'Missing recorded handover anchor';end if;
 body:=replace(body,anchor,$a$   if kind<>'unit' and exists(select 1 from jsonb_array_elements(tree->'rows') x where x->>'parent_id'=scope::text and x->>'status'<>'handed_over') then raise exception 'Registrer overtagelse for alle aktive boliger eller bygg først.' using errcode='PT409';end if;
   -- Records an already completed handover; this is not a legal signature.$a$);
 execute body;
end$patch$;

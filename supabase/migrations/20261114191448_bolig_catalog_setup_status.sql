-- Non-sensitive project setup flag, after the existing firm/root authorization.
do $$declare definition text;anchor text;begin
 definition:=pg_get_functiondef('bolig_private.overview(uuid,uuid)'::regprocedure);
 anchor:='return jsonb_build_object(''context'',ctx,''root_id'',root,''units'',rows);';
 if strpos(definition,anchor)=0 then raise exception 'Unexpected bolig overview projection';end if;
 execute replace(definition,anchor,$replacement$return jsonb_build_object('context',ctx,'root_id',root,'units',rows,
 'catalog_empty',not exists(select 1 from bolig_private.packages p where p.root_id=root and not p.archived)
 and not exists(select 1 from bolig_private.options o where o.root_id=root and not o.archived));$replacement$);
end$$;

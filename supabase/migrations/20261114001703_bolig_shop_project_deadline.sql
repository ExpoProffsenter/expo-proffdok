-- Follow the portal's current date/time rule, including PR332's project clock.
-- This also works before PR332: portal_state then supplies the original date rule.
do $$declare body text;anchor text;begin
 body:=pg_get_functiondef('bolig_private.shop_proposal(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 anchor:=$a$exists(select 1 from bolig_private.units u where u.id=unit and u.choice_deadline is not null and clock_timestamp()>=(u.choice_deadline+1)::timestamp at time zone 'Europe/Oslo')$a$;
 if position(anchor in body)=0 then raise exception 'Missing shop deadline guard';end if;
 execute replace(body,anchor,$a$coalesce((bolig_private.portal_state(p)->>'choices_closed')::boolean,false)$a$);
 body:=pg_get_functiondef('bolig_private.shop_basis(uuid,uuid)'::regprocedure);
 anchor:='(select choice_deadline from bolig_private.units where id=unit and root_id=root),';
 if position(anchor in body)=0 then raise exception 'Missing shop project basis';end if;
 execute replace(body,anchor,anchor||E'\n (select revision from bolig_private.roots where id=root),');
end$$;
notify pgrst,'reload schema';

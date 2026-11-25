-- Price-neutral text is part of each immutable commercial snapshot.
-- No goods, prices, permissions, email or existing documents are rewritten.
create function bolig_private.offer_text_blocks(blocks jsonb, post_count int) returns jsonb
language plpgsql immutable set search_path='' as $$
declare b jsonb; result jsonb:='[]'; ids text[]:='{}'; slot int;
begin
 if jsonb_typeof(blocks) is distinct from 'array' or jsonb_array_length(blocks)>30
 or octet_length(blocks::text)>120000 or post_count is null or post_count<0 then
  raise exception 'Bruk inntil 30 tekstblokker og del opp svært lange tekster.' using errcode='22023';
 end if;
 for b in select value from jsonb_array_elements(blocks) loop
  if jsonb_typeof(b) is distinct from 'object' or coalesce(b->>'id','') !~ '^[a-zA-Z0-9-]{1,60}$'
  or b->>'id'=any(ids) or jsonb_typeof(b->'title') is distinct from 'string' or length(b->>'title')>120
  or jsonb_typeof(b->'text') is distinct from 'string' or length(b->>'text')>20000
  or length(trim(coalesce(b->>'title','')||coalesce(b->>'text','')))=0
  or coalesce(b->>'after','') !~ '^[0-9]{1,5}$' then
   raise exception 'Kontroller overskrift, tekst og plassering på tekstblokken.' using errcode='22023';
  end if;
  slot:=(b->>'after')::int;
  if slot>post_count then raise exception 'Postene er endret. Kontroller tekstens plassering.' using errcode='22023';end if;
  ids:=array_append(ids,b->>'id');
  result:=result||jsonb_build_array(jsonb_build_object('id',b->>'id','title',b->>'title','text',b->>'text','after',slot));
 end loop;
 return result;
end$$;
revoke all on function bolig_private.offer_text_blocks(jsonb,int) from public,anon,authenticated,service_role;

-- Patch only the snapshot assembly in the *current* functions. All newer
-- deadline, staff, replay, support and access fences remain byte-for-byte.
do $patch$
declare body text; anchor text; replacement text;
begin
 body:=pg_get_functiondef('bolig_private.commerce(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 anchor:='group_ref:=nullif(payload->>''group_id'','''')::uuid;';
 if strpos(body,anchor)=0 or strpos(body,'offer_text_blocks(')>0 then raise exception 'Uventet commerce-definisjon; kontroller installasjonsgrunnlaget.';end if;
 replacement:='snapshot:=snapshot||jsonb_build_object(''text_blocks'',bolig_private.offer_text_blocks(coalesce(payload->''text_blocks'',''[]''::jsonb),jsonb_array_length(snapshot->''goods'')));'||E'\n  '||anchor;
 body:=replace(body,anchor,replacement);
 execute body;

 body:=pg_get_functiondef('bolig_private.shop_proposal(uuid,uuid,uuid,text,jsonb)'::regprocedure);
 anchor:='''shop_lines'',lines,';
 if strpos(body,anchor)=0 or strpos(body,'offer_text_blocks(')>0 then raise exception 'Uventet shop-definisjon; kontroller installasjonsgrunnlaget.';end if;
 replacement:=anchor||'''text_blocks'',bolig_private.offer_text_blocks(coalesce(payload->''text_blocks'',''[]''::jsonb),jsonb_array_length(lines)),';
 body:=replace(body,anchor,replacement);
 execute body;
end$patch$;

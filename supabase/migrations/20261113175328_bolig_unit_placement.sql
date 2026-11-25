-- Extend the existing preview, root lock, access gate and exact-retry receipt.
-- Same entrance only: IDs, numbers, contacts and every dependent record stay put.
do $migration$
declare body text; anchor text; addition text;
begin
 select pg_get_functiondef('bolig_private.preparation(uuid,uuid,text,jsonb)'::regprocedure) into body;
 anchor:='kind not in (''numbering'',''building'',''template'')';
 if position(anchor in body)=0 then raise exception 'Missing preparation kind guard';end if;
 body:=replace(body,anchor,'kind not in (''numbering'',''building'',''template'',''placement'')');
 anchor:=' elsif kind=''building'' then';
 addition:=$branch$
 elsif kind='placement' then
  unit_id:=(data->>'unit_id')::uuid;t_id:=(data->>'target_unit_id')::uuid;
  if unit_id is null or t_id is null or unit_id=t_id then
   raise exception 'Velg to forskjellige boliger som skal bytte plass.' using errcode='22023';
  end if;
  select x.* into u from bolig_private.units x
   join bolig_private.entrances en on en.id=x.entrance_id
   join bolig_private.blocks bl on bl.id=en.block_id
   where x.id=unit_id and x.root_id=root and not x.archived and not en.archived and not bl.archived;
  if not found then raise exception 'Boligen er ikke tilgjengelig.' using errcode='42501';end if;
  select to_jsonb(x) into row_data from bolig_private.units x
   where x.id=t_id and x.root_id=root and x.entrance_id=u.entrance_id and not x.archived;
  if not found then raise exception 'Velg en aktiv bolig i samme oppgang.' using errcode='42501';end if;
  proposal:=jsonb_build_array(
   jsonb_build_object('id',u.id,'number',u.number,'before_floor',u.floor,'before_position',u.position,
    'floor',(row_data->>'floor')::int,'position',(row_data->>'position')::int,'status','ready'),
   jsonb_build_object('id',t_id,'number',row_data->>'number','before_floor',(row_data->>'floor')::int,
    'before_position',(row_data->>'position')::int,'floor',u.floor,'position',u.position,'status','ready'));
  -- An unused coordinate is transient inside this transaction only. Keep the
  -- existing immediate unique constraint: resize relies on its ON CONFLICT.
  select ff,pp into f,p from generate_series(1,30) ff cross join generate_series(1,20) pp
   where not exists(select 1 from bolig_private.units x where x.entrance_id=u.entrance_id and x.floor=ff and x.position=pp)
   order by ff desc,pp desc limit 1;
  if not found then raise exception 'Oppgangen har ingen ledig intern plass for et trygt bytte. Kontakt systemansvarlig.' using errcode='22023';end if;
  if action='save' then
   update bolig_private.units set floor=f,position=p where id=unit_id;
   update bolig_private.units set floor=u.floor,position=u.position where id=t_id;
   update bolig_private.units set floor=(row_data->>'floor')::int,position=(row_data->>'position')::int where id=unit_id;
   affected:=2;
  end if;
 elsif kind='building' then
$branch$;
 if position(anchor in body)=0 then raise exception 'Missing preparation building branch';end if;
 body:=replace(body,anchor,addition);
 anchor:='if kind=''numbering'' and affected>0 then';
 if position(anchor in body)=0 then raise exception 'Missing preparation revision increment';end if;
 body:=replace(body,anchor,'if kind in (''numbering'',''placement'') and affected>0 then');
 execute body;
end
$migration$;

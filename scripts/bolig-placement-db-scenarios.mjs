import fs from 'node:fs/promises';
export default async function scenarios({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider}) {
  await db.exec('reset role');
  await db.exec(await fs.readFile('supabase/migrations/20261113175328_bolig_unit_placement.sql','utf8'));
  await actor(manager);
  const s=await call('create_plan',null,null,{request_id:id(990100),title:'QA plassbytte',reference:'QA-MOVE',buildings:[{name:'Bygg A',address:'Testgata 1',building_type:'multi',house_floors:2,entrances:[{address:'Testgata 1',counts:[2,2]}]},{name:'Bygg B',address:'Testgata 2',building_type:'multi',house_floors:2,entrances:[{address:'Testgata 2',counts:[2,2]}]}]});
  const root=s.root.id, a=s.units[0], b=s.units.find(u=>u.entrance_id===a.entrance_id&&u.floor!==a.floor), outside=s.units.find(u=>u.entrance_id!==a.entrance_id);
  const rpc=async(action='get',payload={},company=firm)=>(await db.query('select public.bolig_prepare($1,$2,$3,$4) v',[company,root,action,payload])).rows[0].v;
  await call('unit',root,s.root.revision,{id:a.id,number:'38',contact_name:'Syntetisk hovedkontakt',contact_email:'qa@example.invalid',contact_phone:'',project_id:''});
  await db.query('select public.bolig_rooms($1,$2,$3,$4,$5,$6)',[firm,root,a.id,'save',0,{id:id(990101),name:'Bad',type:'bathroom',floor:'1'}]);
  const state=await rpc();
  const payload={intent:'preview',kind:'placement',basis:state.basis,data:{unit_id:a.id,target_unit_id:b.id}};
  const before=(await call('get',root)).units;
  eq((await rpc('preview',payload)).proposal.length,2,'Both placements previewed');
  eq((await call('get',root)).units,before,'Preview writes no units');
  const save={...payload,intent:'save',request_id:id(990102)};
  // Compare ALL dependent tables, not only contact fields. Existing fixtures
  // include accepted choices, orders, links, progress, rooms and visual sheets.
  await db.exec('reset role');
  const tables=(await db.query("select tablename from pg_tables where schemaname='bolig_private' and tablename not in ('units','roots','audit','preparation_receipts') order by tablename")).rows;
  const snapshot=async()=>Promise.all(tables.map(async({tablename})=>[tablename,(await db.query(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]') v from bolig_private."${tablename}" t`)).rows[0].v]));
  const dependentBefore=await snapshot();
  await actor(manager);
  const result=await rpc('save',save);
  eq(result.receipt.affected,2,'Two stable units updated');
  const after=(await call('get',root)).units;
  for(const original of before) {
    const actual=after.find(u=>u.id===original.id);
    const expected=original.id===a.id?{...original,floor:b.floor,position:b.position}:original.id===b.id?{...original,floor:a.floor,position:a.position}:original;
    eq(actual,expected,'Only floor/position changes; contacts, IDs and numbers retained');
  }
  await db.exec('reset role');eq(await snapshot(),dependentBefore,'All dependent records unchanged');await actor(manager);
  eq((await rpc('save',save)).replayed,true,'Lost-response retry does not swap back');
  eq((await call('get',root)).units,after,'Replay preserves new positions');
  await rejects(()=>rpc('save',{...save,data:{unit_id:b.id,target_unit_id:a.id}}),'PT409');
  await rejects(()=>rpc('save',{...save,request_id:id(990103)}),'PT409');
  const fresh={...payload,basis:(await rpc()).basis};
  await rejects(()=>rpc('preview',{...fresh,data:{unit_id:a.id,target_unit_id:a.id}}),'22023');
  await rejects(()=>rpc('preview',{...fresh,data:{unit_id:a.id,target_unit_id:outside.id}}),'42501');
  await rejects(()=>rpc('preview',fresh,other),'42501');
  for(const who of [reader,outsider]) {await actor(who);await rejects(()=>rpc('preview',fresh),'42501');}
  await actor(manager);
  // Existing resize must continue to use the immediate unique constraint.
  const current=await call('get',root),entrance=current.entrances.find(e=>e.id===a.entrance_id);
  await call('resize',root,current.root.revision,{id:entrance.id,address:entrance.address,counts:entrance.counts});
  eq((await call('get',root)).units,after,'Resize after swap preserves IDs and data');
}

import fs from 'node:fs/promises';
export default async function household({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider}) {
  await db.exec('reset role');
  await db.exec(await fs.readFile('supabase/migrations/20261112222106_bolig_household_contacts.sql','utf8'));
  await actor(manager);
  let state = await call('create_plan',null,null,{request_id:id(96000),title:'QA fire- og seksmannsboliger',reference:'QA',buildings:[4,6].map((n,i)=>({name:`Bygg ${i+1}`,building_type:'multi',address:`Testveien ${i+1}`,house_floors:2,entrances:[{address:`Testveien ${i+1}`,counts:[n/2,n/2]}]}))});
  const root=state.root.id, first=state.units[0].id, second=state.units[1].id;
  eq(state.units.length,10,'4+6 dwellings remain ten dwellings, independently of owner count');
  const extra=[{id:id(96001),name:'QA Eier To',email:'two@example.invalid',phone:'12345678'}];
  state=await call('unit',root,state.root.revision,{id:first,number:'24',contact_name:'QA Eier En',contact_email:'one@example.invalid',contact_phone:'87654321',additional_contacts:extra});
  eq(state.units.find(u=>u.id===first).additional_contacts,extra,'Additional owner stored on original dwelling');
  eq(state.units.find(u=>u.id===first).number,'24','Plain numeric dwelling label preserved');
  const internal = async (action='get',payload={})=>(await db.query('select public.bolig_resident_portal($1,$2,$3,$4,$5) v',[firm,root,first,action,payload])).rows[0].v;
  let portal=await internal();
  portal=await internal('publish',{request_id:id(96002),revision:portal.revision,token:'96001234'.repeat(8),reviewed:true});
  const publicRead=async()=>{await db.exec("reset role;select set_config('qa.user','',false);set role anon;");return (await db.query('select public.bolig_portal($1) v',['96001234'.repeat(8)])).rows[0].v;};
  const owner1=await publicRead(),owner2=await publicRead();eq(owner1,owner2,'Two owners using the same link see one portal state');
  await actor(manager);
  const before=await call('get',root);
  state=await call('unit',root,before.root.revision,{id:first,number:'24',contact_name:'QA Eier En',contact_email:'one@example.invalid',contact_phone:'11111111',additional_contacts:extra});
  await publicRead(); // ordinary phone edit does not revoke shared capability
  await actor(manager);
  state=await call('unit',root,state.root.revision,{id:first,number:'24',contact_name:'QA Eier En',contact_email:'one@example.invalid',contact_phone:'11111111',additional_contacts:[]});
  await rejects(publicRead,'42501');
  await actor(manager);
  state=await call('unit',root,state.root.revision,{id:first,number:'24',contact_name:'QA Eier En',contact_email:'one@example.invalid',contact_phone:'11111111',additional_contacts:extra});
  await rejects(publicRead,'42501'); // A -> B -> A must not restore old access
  await actor(manager);
  const u=state.units.find(u=>u.id===second);
  const row={id:u.id,before:{name:u.contact_name,email:u.contact_email,phone:u.contact_phone,additional_contacts:[]},name:'QA Tre',email:'three@example.invalid',phone:'22222222',additional_contacts:extra};
  const revision=state.root.revision,payload={request_id:id(96003),reviewed:true,rows:[row]};
  state=await call('resident_import',root,revision,payload);
  eq(state.units.find(u=>u.id===second).additional_contacts,extra,'Import preserves two contacts in one existing dwelling');
  const replay=await call('resident_import',root,revision,payload);
  eq(replay.replayed,true,'Lost response retries exact import');eq(replay.root.revision,state.root.revision,'Retry creates no duplicate writes');
  await rejects(()=>call('resident_import',root,revision,{...payload,rows:[{...row,name:'Changed'}]}),'PT409');
  await rejects(()=>call('resident_import',root,revision,{...payload,request_id:id(96004)}),'PT409');
  const freshRow={...row,before:{name:row.name,email:row.email,phone:row.phone,additional_contacts:extra}};
  await rejects(()=>call('resident_import',root,state.root.revision,{...payload,request_id:id(96005),rows:[freshRow,freshRow]}),'42501');
  eq((await call('get',root)).root.revision,state.root.revision,'Duplicate last row rolls back all writes');
  await rejects(()=>call('resident_import',root,state.root.revision,{...payload,request_id:id(96006),rows:[{...freshRow,additional_contacts:[{...extra[0],email:'bad'}]}]}),'22023');
  eq((await call('get',root)).root.revision,state.root.revision,'Invalid contact changes nothing');
  await actor(reader);await rejects(()=>call('resident_import',root,state.root.revision,payload),'42501');
  await actor(outsider,other);await rejects(()=>call('resident_import',root,state.root.revision,payload),'42501');
  await actor(manager);await rejects(()=>call('resident_import',root,state.root.revision,payload,other),'42501');
  await db.exec('reset role;set role anon');await rejects(()=>db.query('select * from bolig_private.units'),'42501');
  await actor(manager);
}

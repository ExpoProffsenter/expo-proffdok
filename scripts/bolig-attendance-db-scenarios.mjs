import fs from 'node:fs/promises';
export default async function({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider}){
 await db.exec('reset role');await db.exec(await fs.readFile('supabase/migrations/20261024011416_bolig_attendance.sql','utf8'));await actor(manager);
 const r=await call('create_plan',null,null,{request_id:id(991000),title:'QA bemanning',reference:'QA-ATTENDANCE',buildings:[{name:'QA',building_type:'house',address:'',house_floors:1,entrances:[{address:'',counts:[1]}]}]});const root=r.root.id;const baseline=await call('get',root);
 const rpc=async(action='get',p={},c=firm,rootId=root)=>(await db.query('select public.bolig_attendance($1,$2,$3,$4) v',[c,rootId,action,p])).rows[0].v;
 let n=991100;const write=(action,revision,p)=>rpc(action,{request_id:id(n++),revision,day:'2026-01-15',...p});
 let s=await rpc();eq(s.enabled,false,'optional default off');eq(s.revision,0);eq(s.visits,[]);
 await rejects(()=>write('visit',0,{id:id(991010),name:'QA',company:'QA',arrived:'2026-01-15T07:00'}),'22023');
 s=await write('enable',0,{enabled:true});eq(s.enabled,true);eq(s.revision,1);
 const payload={request_id:id(n++),revision:1,day:'2026-01-15',id:id(991010),name:'QA Person',company:'QA Firma',arrived:'2026-01-15T07:00',departed:''};s=await rpc('visit',payload);eq(s.visits.length,1);eq(s.visits[0].departed_at,null);eq(s.receipt_id,payload.request_id);eq(new Date(s.visits[0].arrived_at).toISOString(),'2026-01-15T06:00:00.000Z');
 const replay=await rpc('visit',payload);eq(replay,s,'exact retry stable');
 await rejects(()=>rpc('visit',{...payload,name:'Changed'}),'PT409');
 await rejects(()=>write('visit',1,{...payload,request_id:id(n++),revision:1}),'PT409');
 await rejects(()=>write('visit',2,{...payload,request_id:id(n++),revision:2,departed:'2026-01-15T06:00',reason:'Feil tidspunkt'}),'22023');
 await rejects(()=>write('visit',2,{...payload,request_id:id(n++),revision:2,departed:'2026-01-15T15:00'}),'22023');
 s=await write('visit',2,{id:payload.id,name:'QA Person',company:'QA Firma',arrived:payload.arrived,departed:'2026-01-15T15:00',reason:'Glemte å registrere ut'});eq(new Date(s.visits[0].departed_at).toISOString(),'2026-01-15T14:00:00.000Z');eq(s.events.length,2);eq(s.events[0].before_value.departed_at,null);eq(s.events[0].actor,manager);
 eq((await rpc('visit',payload)).revision,3,'old receipt cannot revert latest');eq((await rpc('get',{day:'2026-01-16'})).visits.length,0);eq((await rpc('get',{day:'2026-01-15'})).visits.length,1);
 s=await write('enable',3,{enabled:false});eq(s.visits.length,1,'disable preserves history');eq(s.enabled,false);
 await rejects(()=>write('visit',4,{id:id(n++),name:'QA',company:'QA',arrived:payload.arrived}),'22023');
 eq(await call('get',root),baseline,'attendance never changes existing root/units');
 for(const user of [reader,outsider]){await actor(user);await rejects(()=>rpc(),'42501');await rejects(()=>write('enable',4,{enabled:true}),'42501');}
 await actor(manager,other);await rejects(()=>rpc('get',{},other),'42501');await actor(manager);
 await db.exec("select set_config('qa.projects','no',false)");await rejects(()=>rpc(),'42501');await db.exec("select set_config('qa.projects','yes',false)");
 await call('archive',root,baseline.root.revision,{kind:'root',id:root,archived:true});await rejects(()=>write('enable',4,{enabled:true}),'42501');eq((await rpc('get',{day:'2026-01-15'})).visits.length,1,'archived read preserves records');
}

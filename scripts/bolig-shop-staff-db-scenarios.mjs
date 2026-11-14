import fs from 'node:fs/promises';
export default async function({db,call,actor,eq,rejects,id,firm,other,manager,reader,outsider,system}){
 await db.exec('reset role');await db.exec(await fs.readFile('supabase/migrations/20261114003459_bolig_shop_staff_admin.sql','utf8'));
 await db.exec(await fs.readFile('supabase/migrations/20261114195127_bolig_shop_unit_overview.sql','utf8'));
 await actor(manager);const state=await call('create_plan',null,null,{request_id:id(99500),title:'QA Butikktilgang',reference:'QA',buildings:[{name:'A',building_type:'multi',address:'QA',house_floors:1,entrances:[{address:'QA',counts:[1]}]}]});
 const root=state.root.id;
 const rpc=(action='list',payload={},c=firm,r=root)=>db.query('select public.bolig_shop_staff($1,$2,$3,$4) v',[c,r,action,payload]).then(x=>x.rows[0].v);
 const list=()=>db.query('select public.bolig_my_collaborations() v').then(x=>x.rows[0].v);
 eq((await rpc()).can_assign,false,'Project owner sees staff but cannot grant');await rejects(()=>rpc('lookup',{email:'collaborator@example.invalid'}),'42501');
 await actor(reader);await rejects(()=>rpc(),'42501');await actor(outsider,other);await rejects(()=>rpc(),'42501');
 await actor(system);eq((await rpc()).can_assign,true);eq((await rpc('lookup',{email:'missing@example.invalid'})).candidate,null,'Missing accounts remain unassigned');
 let candidate=(await rpc('lookup',{email:'  COLLABORATOR@example.invalid  '})).candidate;eq(candidate.id,outsider);eq(candidate.revision,0);
 const payload={request_id:id(99501),reviewed:true,user_id:outsider,email:'collaborator@example.invalid',days:90,revision:0};
 await rejects(()=>rpc('assign',{...payload,user_id:reader}),'22023');await rejects(()=>rpc('assign',{...payload,days:99999}),'22023');
 let v=await rpc('assign',payload);eq(v.staff.length,1);eq(v.staff[0].active,true);eq(v.actor_id,system);eq((await rpc('assign',payload)).replayed,true);
 await rejects(()=>rpc('assign',{...payload,days:30}),'PT409');await rejects(()=>rpc('assign',{...payload,request_id:id(99502)}),'PT409');await rejects(()=>rpc('list',{},other),'42501');
 await actor(outsider,other);eq((await list()).projects.some(p=>p.id===root),true,'Employee own firm sees assigned foreign project');
 await db.exec('reset role');
 const unit=(await db.query('select id from bolig_private.units where root_id=$1',[root])).rows[0].id;
 await db.query("update bolig_private.units set contact_phone='12345678',contact_email='qa@example.invalid',choice_deadline='2026-12-01' where id=$1",[unit]);
 await actor(outsider,other);
 const mine=(await db.query('select public.bolig_my_collaborations($1) v',[root])).rows[0].v;eq(mine.units[0].contact_phone,'12345678');eq(mine.units[0].contact_email,'qa@example.invalid');eq(mine.units[0].activities,[]);eq(mine.units[0].choice_deadline_at,'2026-12-01T11:00:00+00:00');eq(mine.context.publish_shop,true);eq(mine.context.edit_choices,true);eq(mine.context.edit_catalog,false);
 await rejects(()=>call('get',root),'42501');await rejects(()=>rpc(),'42501');
 await db.exec('reset role');eq((await db.query('select count(*)::int n from public.sales_company_memberships where user_id=$1 and company_id=$2',[outsider,firm])).rows[0].n,0,'No project-firm membership');
 for(const change of ['approved=false','deactivated=true']){
 await db.query('update public.profiles set '+change+' where id=$1',[outsider]);await actor(outsider,other);eq((await list()).projects.some(p=>p.id===root),false,'Inactive employee removed immediately');await db.exec('reset role');await db.query('update public.profiles set approved=true,deactivated=false where id=$1',[outsider]);}
 await db.query("update public.sales_company_memberships set workspace_role='kunde' where user_id=$1",[outsider]);await actor(outsider,other);eq((await list()).projects.some(p=>p.id===root),false,'Lost employee membership removes project');await db.exec('reset role');await db.query("update public.sales_company_memberships set workspace_role='ansatt' where user_id=$1",[outsider]);
 await db.query("update bolig_private.shop_staff_access set expires_at=now()-interval '1 second' where root_id=$1",[root]);await actor(outsider,other);eq((await list()).projects.some(p=>p.id===root),false,'Expiry closes access');
 await actor(system);v=await rpc('assign',{...payload,revision:1,request_id:id(99503)});await actor(manager);await rejects(()=>rpc('assign',{...payload,revision:2,request_id:id(99504)}),'42501');
 v=await rpc('revoke',{id:v.staff[0].id,revision:2,request_id:id(99505)});eq(v.staff[0].enabled,false,'Project owner revokes');await actor(outsider,other);eq((await list()).projects.some(p=>p.id===root),false,'Revocation closes employee view');
 // Use the actual support validator with its session/actor/target checks. The
 // foundation harness has synthetic auth.uid; transport is tested separately.
 await db.exec('reset role');
 await db.exec(`create schema app_support_private;create table auth.sessions(id uuid,user_id uuid);create table app_support_private.settings(singleton boolean,enabled boolean,transport_ready boolean);insert into app_support_private.settings values(true,true,true);create table app_support_private.sessions(id uuid,actor_id uuid,actor_session_id uuid,target_user_id uuid,company_id uuid,ended_at timestamptz,expires_at timestamptz);create table app_support_private.audit(session_id uuid,actor_id uuid,target_user_id uuid,company_id uuid,action text,resource text,after_value jsonb);`);
 const sessions=await fs.readFile('supabase/migrations/20261111182756_app_support_sessions.sql','utf8');await db.exec(sessions.slice(sessions.indexOf('create function app_support_private.assert_target'),sessions.indexOf('create function app_support_private.valid_session')));
 const gateway=await fs.readFile('supabase/migrations/20261111183233_app_support_write_gateway.sql','utf8');await db.exec(gateway.slice(gateway.indexOf('create function app_support_private.request_session'),gateway.indexOf('create function app_support_private.prepare_request')));
 await db.query('insert into auth.sessions values($1,$2)',[id(99506),system]);await db.query("insert into app_support_private.sessions values($1,$2,$3,$4,$5,null,now()+interval '1 hour')",[id(99507),system,id(99506),manager,firm]);
 await db.query("select set_config('app.support.session_id',$1,false),set_config('app.support.actor_id',$2,false),set_config('request.jwt.claims',$3,false)",[id(99507),system,JSON.stringify({session_id:id(99506)})]);
 await actor(manager);v=await rpc('list');eq(v.can_assign,true,'Validated support actor retains scoped admin assignment');eq(v.actor_id,system);eq(v.context.user_id,manager);
 v=await rpc('assign',{...payload,revision:3,request_id:id(99508)});eq(v.staff[0].active,true);
 await db.exec('reset role');const audit=(await db.query("select actor_id,target_user_id,company_id from app_support_private.audit where action='shop_staff_assign'")).rows[0];eq(audit,{actor_id:system,target_user_id:manager,company_id:firm},'Support attribution uses real admin and exact firm');
 await db.query('update app_support_private.sessions set expires_at=now()-interval \'1 second\'');await actor(manager);await rejects(()=>rpc('list'),'42501');
 await db.exec("reset role;select set_config('app.support.session_id','',false),set_config('app.support.actor_id','',false),set_config('request.jwt.claims','{}',false)");
 await actor(manager);eq((await rpc()).can_assign,false,'Payload cannot impersonate systemadmin');await rejects(()=>rpc('assign',{...payload,actor_id:system}),'42501');
 await db.exec("reset role;select set_config('qa.user','',false);set role anon");await rejects(()=>rpc(),'42501');await actor(manager);
 console.log('PASS shop staff: admin/owner separation, eligibility, expiry, revocation, identity, replay, support actor audit, no membership changes');
}

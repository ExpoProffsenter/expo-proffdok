import fs from 'node:fs/promises';
export async function checkInvitationAccess({db,id,a,b,outside,sys,admin,worker,other,secondary,q,rpc,actor,eq,rejects}) {
 await db.exec(`reset role;select set_config('request.jwt.claim.sub','',false);update public.profiles set approved=true,deactivated=false;
 create role service_role;create schema hr_private;
 create table public.user_module_access(user_id uuid,module_key text,granted_by uuid,primary key(user_id,module_key));
 create table public.company_module_access(company_id uuid,module_key text,enabled boolean,primary key(company_id,module_key));
 create table public.kshms_member_access(company_id uuid,user_id uuid,role text,enabled boolean,changed_by uuid,changed_at timestamptz default now(),primary key(company_id,user_id));
 create table hr_private.module_access(company_id uuid,user_id uuid,enabled boolean,changed_by uuid,changed_at timestamptz default now(),primary key(company_id,user_id));
 create table hr_private.closed_employments(company_id uuid,user_id uuid);
 create table public.kshms_settings(company_id uuid,responsible_user_id uuid);
 create table public.kshms_audit(company_id uuid,actor_id uuid,action text,object_id uuid);
 create function public.company_has_store_offers_access(uuid) returns boolean language sql security definer as $$select coalesce((select enabled from public.company_module_access where company_id=$1 and module_key='store_offers'),false)$$;
 insert into public.company_module_access values(${q(b)},'store_offers',true),(${q(b)},'kshms',true),(${q(b)},'hr',true);
 insert into public.user_module_access values(${q(admin)},'projects',${q(sys)}),(${q(admin)},'sales',${q(sys)}),(${q(worker)},'projects',${q(sys)});`);
 await db.exec(await fs.readFile('supabase/migrations/20261015124223_company_invitation_access_choices.sql','utf8'));
 const opts={module_keys:['sales','store_offers'],kshms:true,hr:true,kshms_role:'reader'};
 const create=(email,access=opts,role='ansatt',company=b)=>rpc('company_admin_invite_with_access',[company,email,role,access]);
 const fixture=async(u,email)=>db.exec(`reset role;select set_config('request.jwt.claim.sub','',false);insert into public.profiles(id,email,company_name,approved) values(${q(u)},${q(email)},'',false);`);
 const table=async(query)=>{await db.exec('reset role');return (await db.query(query)).rows;};
 await actor(admin);let context=await rpc('company_admin_snapshot');eq(context.invite_options.hr,true);eq(context.invite_options.store_offers,true);
 await rejects(()=>create('bad@example.invalid',{...opts,view_internal_net_prices:true}),'22023');await rejects(()=>create('bad@example.invalid',{...opts,module_keys:['forged']}),'22023');await rejects(()=>create('bad@example.invalid',{...opts,hr:'true'}),'22023');
 await rejects(()=>create('wrong@example.invalid',opts,'ansatt',a));
 await create('invite-new@example.invalid');context=await rpc('company_admin_snapshot');eq(context.invites.find(i=>i.email==='invite-new@example.invalid').access,opts);
 const fresh=id(30);await fixture(fresh,'invite-new@example.invalid');await actor(fresh);
 eq((await rpc('accept_company_user_invite')).accepted,true,'new signup applies saved access atomically');
 eq(await table(`select module_key from public.user_module_access where user_id=${q(fresh)} order by module_key`),[{module_key:'sales'},{module_key:'store_offers'}]);
 eq((await table(`select enabled from hr_private.module_access where company_id=${q(b)} and user_id=${q(fresh)}`))[0].enabled,true);
 eq((await table(`select enabled,role from public.kshms_member_access where company_id=${q(b)} and user_id=${q(fresh)}`))[0],{enabled:true,role:'reader'});
 await actor(fresh);eq((await rpc('accept_company_user_invite')).accepted,false,'repeat login does not replay grants');
 await actor(admin);await create('worker@example.invalid',{...opts,kshms:false,hr:false});
 eq(await table(`select module_key from public.user_module_access where user_id=${q(worker)} order by module_key`),[{module_key:'projects'}],'existing core is preserved');
 eq((await table(`select enabled from hr_private.module_access where company_id=${q(b)} and user_id=${q(worker)}`))[0].enabled,false);
 // Fresh company entitlement check before accepting an outstanding invitation.
 await actor(admin);await create('disabled-license@example.invalid');const licenseUser=id(31);await fixture(licenseUser,'disabled-license@example.invalid');
 await db.exec(`update public.company_module_access set enabled=false where company_id=${q(b)} and module_key='hr'`);await actor(licenseUser);await rejects(()=>rpc('accept_company_user_invite'));
 eq((await table(`select approved from public.profiles where id=${q(licenseUser)}`))[0].approved,false,'failed grant rolls back profile approval');
 await db.exec(`update public.company_module_access set enabled=true where company_id=${q(b)} and module_key='hr'`);await actor(licenseUser);eq((await rpc('accept_company_user_invite')).accepted,true);
 // A removed grantor module is rechecked at signup, not trusted from a stored JWT.
 await actor(admin);await create('revoked-module@example.invalid',{...opts,module_keys:['projects','sales','store_offers']});const revoked=id(32);await fixture(revoked,'revoked-module@example.invalid');
 await db.exec(`delete from public.user_module_access where user_id=${q(admin)} and module_key='projects'`);await actor(revoked);await rejects(()=>rpc('accept_company_user_invite'));
 await table(`select 1`);await db.exec(`insert into public.user_module_access values(${q(admin)},'projects',${q(sys)})`);await actor(revoked);eq((await rpc('accept_company_user_invite')).accepted,true);
 // An ordinary pro customer administers only their own company.
 await table('select 1');await db.exec(`select set_config('request.jwt.claim.sub','',false);update public.profiles set company_role='firmaadmin' where id=${q(other)}`);await actor(other,outside);
 context=await rpc('company_admin_snapshot');eq(context.company_id,outside);eq(context.users.map(u=>u.id),[other]);eq(context.can_switch_company,false);
 await rejects(()=>rpc('company_admin_snapshot',[b]));await rejects(()=>create('foreign@example.invalid'));
 const profileSql=await fs.readFile('supabase/migrations/20260910161200_fase41b3d_systemadmin_representation.sql','utf8');
 await db.exec(`reset role;create function public.get_my_work_profile_state() returns jsonb language sql as $$select '{}'::jsonb$$;`);
 const start=profileSql.indexOf('create or replace function public.set_active_work_profile(');
 await db.exec(profileSql.slice(start,profileSql.indexOf('end;\n$$;',start)+8));
 await actor(other,outside);await rejects(()=>rpc('set_active_work_profile',[b]));
 const workspaceSql=await fs.readFile('supabase/migrations/20260910152200_fase41b3_work_profile_target_guard.sql','utf8');await db.exec('reset role');await db.exec(workspaceSql);
 await actor(other,outside);await rejects(()=>db.query(`select public.set_managed_work_profiles(${q(other)},array[${q(b)}]::uuid[])`));await actor(sys);await rejects(()=>db.query(`select public.set_managed_work_profiles(${q(other)},array[${q(b)}]::uuid[])`));
 // The same closed-employment/responsible-person guards apply to existing people.
 await table('select 1');await db.exec(`insert into hr_private.closed_employments values(${q(b)},${q(worker)})`);await actor(admin);await rejects(()=>create('worker@example.invalid',opts));
 await table('select 1');await db.exec(`delete from hr_private.closed_employments;insert into public.kshms_settings values(${q(b)},${q(worker)})`);await actor(admin);await rejects(()=>create('worker@example.invalid',{...opts,kshms:false}));
 await table('select 1');await db.exec('delete from public.kshms_settings');
 // Resending a pending invitation for an already-created profile replaces its choices.
 await actor(admin);await create('resend@example.invalid');const resend=id(33);await fixture(resend,'resend@example.invalid');await actor(admin);await create('resend@example.invalid',{...opts,hr:false});
 await actor(resend);eq((await rpc('accept_company_user_invite')).accepted,true);eq((await table(`select enabled from hr_private.module_access where user_id=${q(resend)}`))[0].enabled,false);
 await db.exec('reset role;set role anon');await rejects(()=>create('anon@example.invalid'));await db.exec('reset role;set role authenticated');await rejects(()=>db.query('select * from company_admin_private.invitation_access'));
}

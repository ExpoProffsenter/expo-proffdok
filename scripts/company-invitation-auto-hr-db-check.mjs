import fs from 'node:fs/promises';

export async function checkInvitationAutoHr({db,id,a,b,sys,admin,worker,secondary,q,rpc,actor,eq,rejects}) {
 const read=async sql=>{await db.exec('reset role');return (await db.query(sql)).rows;};
 const owner=async sql=>{await db.exec("reset role;select set_config('request.jwt.claim.sub','',false)");await db.exec(sql);};
 const loadFunction=async(file,name)=>{
  const source=await fs.readFile('supabase/migrations/'+file,'utf8');
  const start=source.indexOf('create function '+name+'(')>=0?source.indexOf('create function '+name+'('):source.indexOf('create or replace function '+name+'(');
  if(start<0)throw Error('Missing real function '+name);
  await db.exec(source.slice(start,source.indexOf('$$;',start)+3));
 };
 const foundation=await fs.readFile('supabase/migrations/20261009182551_hr_access_foundation.sql','utf8');
 await owner(`create table auth.users(id uuid primary key);insert into auth.users select id from public.profiles;`);
 await db.exec(foundation.slice(foundation.indexOf('create table hr_private.firms'),foundation.indexOf('-- Minimal restore barrier')));
 await loadFunction('20261009182551_hr_access_foundation.sql','hr_private.active_member');
 await loadFunction('20261009203431_people_module_entitlements.sql','hr_private.has_module_access');
 await loadFunction('20261009203431_people_module_entitlements.sql','hr_private.require_actor');
 await loadFunction('20261009182551_hr_access_foundation.sql','public.hr_foundation_configure');
 await db.exec(`create schema org_private;create table org_private.settings(company_id uuid primary key,revision integer default 1);
 create table org_private.placements(company_id uuid,user_id uuid,leader_id uuid,primary key(company_id,user_id));
 create schema time_private;create table time_private.settings(company_id uuid primary key,content jsonb);
 create table time_private.enrollments(company_id uuid,employee_id uuid primary key references hr_private.employees(id),from_on date);
 create table hr_private.artifacts(employee_id uuid references hr_private.employees(id),payload jsonb);
 insert into time_private.settings values(${q(b)},'{"enabled":true}');`);
 await loadFunction('20261009232920_organization_hr_trigger_scope_fix.sql','org_private.on_hr_leader');
 await loadFunction('20261014144538_time_registration.sql','time_private.enroll_employee');
 await db.exec(`create trigger organization_hr_leader before insert or update of leader_id on hr_private.employees for each row execute function org_private.on_hr_leader();
 create trigger time_employee_enrollment after insert on hr_private.employees for each row execute function time_private.enroll_employee();
 insert into hr_private.firms(company_id,enabled,purpose,legal_basis,review_on) values(${q(b)},true,'Synthetic QA purpose','Synthetic QA basis',current_date+30);
 insert into org_private.placements values(${q(b)},${q(id(30))},${q(admin)});
 insert into hr_private.employees(company_id,user_id,leader_id,revision) values(${q(b)},${q(id(30))},${q(admin)},7);`);
 const employees=async(c,u)=>(await read(`select to_jsonb(e) as v from hr_private.employees e where company_id=${q(c)} and user_id=${q(u)}`)).map(r=>r.v);
 const original=await employees(b,id(30));
 await db.exec(await fs.readFile('supabase/migrations/20261015175511_company_invitation_auto_hr.sql','utf8'));
 eq(await employees(b,id(30)),original,'migration keeps existing employee, leader and revision');
 eq((await employees(b,id(31))).length,1,'migration fills only explicitly accepted HR invitation');
 eq((await employees(b,secondary)).length,0,'workspace membership alone creates no HR record');
 const opts={module_keys:['sales','store_offers'],kshms:false,hr:true,kshms_role:'reader'};
 const invite=async(email,access=opts,c=b,role='ansatt')=>{await actor(c===a?sys:admin,c);return rpc('company_admin_invite_with_access',[c,email,role,access]);};
 const signup=async(n,email,c=b)=>{const u=id(n);await owner(`insert into auth.users values(${q(u)});insert into public.profiles(id,email,company_name,approved) values(${q(u)},${q(email)},'',false)`);await actor(u,c);return u;};
 const accept=()=>rpc('accept_company_user_invite');
 const configure=async(c,enabled)=>{await actor(c===a?sys:admin,c);const f=(await read(`select revision from hr_private.firms where company_id=${q(c)}`))[0];await actor(c===a?sys:admin,c);return rpc('hr_foundation_configure',[c,f?.revision||0,enabled,'Synthetic QA purpose','Synthetic QA basis','2027-01-01']);};

 await invite('auto-hr@example.invalid');const fresh=await signup(80,'auto-hr@example.invalid');
 eq((await employees(b,fresh)).length,0,'pending invitation creates no HR employee');
 await actor(fresh);eq((await accept()).accepted,true);
 let row=(await employees(b,fresh))[0];eq(row.user_id,fresh);eq(row.company_id,b);eq(row.leader_id,null,'no manager is invented');
 eq((await read(`select count(*)::integer n from time_private.enrollments where employee_id=${q(row.id)}`))[0].n,1,'normal time enrollment trigger runs');
 await actor(fresh);eq((await accept()).accepted,false);eq((await employees(b,fresh)).length,1,'repeat login does not duplicate HR');
 await invite('no-auto-hr@example.invalid',{...opts,hr:false});const noHr=await signup(81,'no-auto-hr@example.invalid');await actor(noHr);await accept();eq(await employees(b,noHr),[],'unchecked HR creates no entry');
 await invite('worker@example.invalid');row=(await employees(b,worker))[0];eq(!!row,true,'existing active invited account enrolls immediately');
 await owner(`update hr_private.employees set leader_id=${q(admin)},revision=9 where id=${q(row.id)};
 insert into hr_private.readers(company_id,employee_id,user_id,granted_by,reason) values(${q(b)},${q(row.id)},${q(secondary)},${q(admin)},'Synthetic QA existing reader');
 insert into hr_private.artifacts values(${q(row.id)},'{"synthetic":"existing history"}');`);
 const before=await employees(b,worker);await invite('worker@example.invalid');eq(await employees(b,worker),before,'re-invite preserves existing HR identity, leader and revision');
 eq((await read(`select count(*)::integer n from hr_private.readers where employee_id=${q(row.id)}`))[0].n,1,'existing readers kept');
 eq((await read(`select payload from hr_private.artifacts where employee_id=${q(row.id)}`))[0].payload,{synthetic:'existing history'},'existing HR history kept');

 const ownOpts={...opts,module_keys:['projects']};
 await owner(`insert into public.company_module_access values(${q(a)},'hr',true)`);
 await invite('deferred-hr@example.invalid',ownOpts,a);const deferred=await signup(82,'deferred-hr@example.invalid',a);await actor(deferred,a);await accept();eq(await employees(a,deferred),[],'no fabricated company HR setup');
 await configure(a,true);eq((await employees(a,deferred)).length,1,'first real HR setup completes accepted invitation');
 await configure(a,false);await invite('disabled-hr@example.invalid',ownOpts,a);const disabled=await signup(83,'disabled-hr@example.invalid',a);await actor(disabled,a);await accept();eq(await employees(a,disabled),[],'disabled register defers enrollment');
 await configure(a,true);eq((await employees(a,disabled)).length,1,'enabling register finishes deferred enrollment');
 const deferredBefore=await employees(a,deferred);await configure(a,true);eq(await employees(a,deferred),deferredBefore,'saving setup never recreates employee');
 eq((await employees(b,deferred)).length,0,'HR enrollment never crosses company boundary');

 await configure(a,false);await invite('revoked-hr@example.invalid',ownOpts,a);const revoked=await signup(84,'revoked-hr@example.invalid',a);await actor(revoked,a);await accept();
 await owner(`update hr_private.module_access set enabled=false where company_id=${q(a)} and user_id=${q(revoked)}`);await configure(a,true);eq(await employees(a,revoked),[],'deferred enrollment rechecks current HR grant');
 await configure(a,false);await invite('closed-auto@example.invalid',ownOpts,a);const closed=await signup(85,'closed-auto@example.invalid',a);await actor(closed,a);await accept();
 await owner(`insert into hr_private.closed_employments values(${q(a)},${q(closed)})`);await configure(a,true);eq(await employees(a,closed),[],'closed employment is never resurrected');
 await invite('org-leader-auto@example.invalid');const orgLeader=await signup(86,'org-leader-auto@example.invalid');
 await owner(`insert into org_private.placements values(${q(b)},${q(orgLeader)},${q(admin)})`);await actor(orgLeader);await accept();eq((await employees(b,orgLeader))[0].leader_id,admin,'confirmed chart leader is preserved by real organization trigger');

 await invite('atomic-auto@example.invalid');const atomic=await signup(87,'atomic-auto@example.invalid');
 await owner(`create function public.reject_auto_hr_fixture() returns trigger language plpgsql as $$begin raise exception 'Synthetic downstream failure';end$$;
 create trigger reject_auto_hr_fixture after insert on hr_private.employees for each row when(new.user_id=${q(atomic)}::uuid) execute function public.reject_auto_hr_fixture();`);
 await actor(atomic);await rejects(accept,'P0001');eq(await employees(b,atomic),[],'downstream insert failure rolls back HR');
 eq((await read(`select approved from public.profiles where id=${q(atomic)}`))[0].approved,false,'same failure rolls back user activation');
 eq((await read(`select count(*)::integer n from hr_private.module_access where user_id=${q(atomic)}`))[0].n,0,'same failure rolls back HR access grant');
 await owner('drop trigger reject_auto_hr_fixture on hr_private.employees');await actor(atomic);await accept();eq((await employees(b,atomic)).length,1,'retry after downstream failure creates exactly one employee');
 await actor(admin);await rejects(()=>db.query(`select company_admin_private.enroll_invited_hr_users(${q(a)})`));
 await db.exec('reset role;set role anon');await rejects(()=>db.query(`select company_admin_private.enroll_invited_hr_users(${q(b)})`));
 await db.exec('reset role');
}

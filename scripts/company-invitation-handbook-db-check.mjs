import fs from 'node:fs/promises';
export async function checkInvitationHandbook({db,id,a,b,admin,worker,q,rpc,actor,eq,rejects}) {
 const owner=async sql=>{await db.exec("reset role;select set_config('request.jwt.claim.sub','',false)");return db.exec(sql);};
 const read=async sql=>{await db.exec('reset role');return (await db.query(sql)).rows;};
 const foundation=await fs.readFile('supabase/migrations/20261005195941_kshms_handbook_foundation.sql','utf8');
 await owner(foundation.slice(foundation.indexOf('create table public.kshms_routines'),foundation.indexOf('create table public.kshms_reviews')));
 const r1=id(200),r2=id(201),archived=id(202),draft=id(203),foreign=id(204),v1=id(210),v2=id(211),vSecond=id(212),vArchived=id(213),vForeign=id(214);
 await owner(`insert into public.kshms_routines(id,company_id,draft,archived,created_by,updated_by) values
 (${q(r1)},${q(b)},'{"title":"Edited draft, not approved"}',false,${q(admin)},${q(admin)}),
 (${q(r2)},${q(b)},'{"title":"Second"}',false,${q(admin)},${q(admin)}),
 (${q(archived)},${q(b)},'{"title":"Archived"}',true,${q(admin)},${q(admin)}),
 (${q(draft)},${q(b)},'{"title":"Never approved"}',false,${q(admin)},${q(admin)}),
 (${q(foreign)},${q(a)},'{"title":"Other company"}',false,${q(admin)},${q(admin)});
 insert into public.kshms_versions(id,company_id,routine_id,number,content,content_hash,change_summary,published_by) values
 (${q(v1)},${q(b)},${q(r1)},1,'{"title":"First"}','v1','First',${q(admin)}),
 (${q(v2)},${q(b)},${q(r1)},2,'{"title":"Latest approved"}','v2','Second',${q(admin)}),
 (${q(vSecond)},${q(b)},${q(r2)},1,'{"title":"Second"}','other','First',${q(admin)}),
 (${q(vArchived)},${q(b)},${q(archived)},1,'{"title":"Archived"}','archive','First',${q(admin)}),
 (${q(vForeign)},${q(a)},${q(foreign)},1,'{"title":"Foreign"}','foreign','First',${q(admin)});
 update public.kshms_member_access set enabled=true where company_id=${q(b)} and user_id=${q(worker)};
 insert into public.kshms_assignments values(${q(b)},${q(v1)},${q(worker)},${q(admin)},'2026-01-02');
 insert into public.kshms_acknowledgments values(${q(b)},${q(v1)},${q(worker)},'2026-01-03','Synthetic original receipt');`);
 const receiptBefore=await read('select * from public.kshms_acknowledgments');
 const assignmentBefore=await read(`select * from public.kshms_assignments where version_id=${q(v1)}`);
 const accessBefore=await read('select * from public.kshms_member_access order by company_id,user_id');
 await db.exec(await fs.readFile('supabase/migrations/20261020130549_kshms_auto_assign_handbook_on_access.sql','utf8'));
 eq(await read('select * from public.kshms_acknowledgments'),receiptBefore,'backfill never confirms for an employee');
 eq(await read(`select * from public.kshms_assignments where version_id=${q(v1)}`),assignmentBefore,'historical assignment unchanged');
 eq(await read('select * from public.kshms_member_access order by company_id,user_id'),accessBefore,'backfill never grants access');
 const assigned=async u=>(await read(`select version_id from public.kshms_assignments where user_id=${q(u)} and company_id=${q(b)} order by version_id`)).map(r=>r.version_id);
 eq(await assigned(worker),[v1,v2,vSecond].sort(),'existing worker receives missing latest editions and keeps old history');
 const opts={module_keys:['sales','store_offers'],kshms:true,hr:false,kshms_role:'reader'};
 const invite=async(email,choices=opts,role='ansatt')=>{await actor(admin,b);return rpc('company_admin_invite_with_access',[b,email,role,choices]);};
 const signup=async(n,email)=>{const u=id(n);await owner(`insert into auth.users values(${q(u)});insert into public.profiles(id,email,company_name,approved) values(${q(u)},${q(email)},'',false)`);return u;};
 await invite('auto-handbook@example.invalid');const fresh=await signup(130,'auto-handbook@example.invalid');
 eq(await assigned(fresh),[],'pending invitation sees no handbook');await actor(fresh,b);eq((await rpc('accept_company_user_invite')).accepted,true);
 eq(await assigned(fresh),[v2,vSecond].sort(),'accepted real invitation receives latest active approved editions only');
 await actor(fresh,b);eq((await rpc('accept_company_user_invite')).accepted,false);eq(await assigned(fresh),[v2,vSecond].sort(),'login retry is idempotent');
 await invite('no-handbook@example.invalid',{...opts,kshms:false});const noAccess=await signup(131,'no-handbook@example.invalid');await actor(noAccess,b);await rpc('accept_company_user_invite');eq(await assigned(noAccess),[],'unchecked KS/HMS stays empty');
 await invite('admin-handbook@example.invalid',{...opts,kshms:false},'firmaadmin');const inherited=await signup(132,'admin-handbook@example.invalid');await actor(inherited,b);await rpc('accept_company_user_invite');eq(await assigned(inherited),[v2,vSecond].sort(),'firmaadmin receives inherited handbook access');
 // All user-card grants use the same real RPC as PeopleModuleAccess.
 const entitlements=await fs.readFile('supabase/migrations/20261009203431_people_module_entitlements.sql','utf8');
 for(const name of ['people_modules_company_get','people_modules_user_get','people_modules_user_set']){const start=entitlements.indexOf('create function public.'+name+'(');await db.exec(entitlements.slice(start,entitlements.indexOf('end $$;',start)+8));}
 await actor(admin,b);const expected=await rpc('people_modules_user_get',[b,noAccess]);await rpc('people_modules_user_set',[b,noAccess,expected,true,'reader',false]);eq(await assigned(noAccess),[v2,vSecond].sort(),'existing registered user-card grant assigns handbook');
 for(const [n,approved,deactivated,role] of [[133,false,false,'member'],[134,true,true,'member'],[135,true,false,'kunde']]){
  const u=id(n);await owner(`insert into auth.users values(${q(u)});insert into public.profiles(id,email,company_name,approved,deactivated,role) values(${q(u)},${q('boundary-'+n+'@example.invalid')},'',${approved},${deactivated},${q(role)});insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role) values(${q(b)},${q(u)},false,'ansatt');insert into public.kshms_member_access values(${q(b)},${q(u)},'reader',true,${q(admin)},now())`);
  eq(await assigned(u),[],'inactive/unapproved/external profile receives nothing');await owner(`update public.profiles set approved=true,deactivated=false,role='member' where id=${q(u)}`);eq(await assigned(u),[v2,vSecond].sort(),'delayed active approval completes assignment');
 }
 const late=id(136);await owner(`insert into auth.users values(${q(late)});insert into public.profiles(id,email,company_name) values(${q(late)},'late-membership@example.invalid','');insert into public.kshms_member_access values(${q(b)},${q(late)},'reader',true,${q(admin)},now())`);eq(await assigned(late),[],'grant alone without membership gives nothing');await owner(`insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role) values(${q(b)},${q(late)},false,'ansatt')`);eq(await assigned(late),[v2,vSecond].sort(),'late membership completes assignment');
 await owner(`update public.company_module_access set enabled=false where company_id=${q(b)} and module_key='kshms'`);
 const licensed=id(137);await owner(`insert into auth.users values(${q(licensed)});insert into public.profiles(id,email,company_name) values(${q(licensed)},'later-license@example.invalid','');insert into public.sales_company_memberships(company_id,user_id,is_primary,workspace_role) values(${q(b)},${q(licensed)},false,'ansatt');insert into public.kshms_member_access values(${q(b)},${q(licensed)},'reader',true,${q(admin)},now())`);eq(await assigned(licensed),[],'disabled firm gives nothing');await owner(`update public.company_module_access set enabled=true where company_id=${q(b)} and module_key='kshms'`);eq(await assigned(licensed),[v2,vSecond].sort(),'later company activation completes assignment');
 const snapshot=await read('select * from public.kshms_assignments order by version_id,user_id');await owner(`update public.kshms_member_access set enabled=enabled;update public.company_module_access set enabled=enabled where module_key='kshms'`);eq(await read('select * from public.kshms_assignments order by version_id,user_id'),snapshot,'repeated settings preserve all assignment rows');
 eq(await read('select * from public.kshms_acknowledgments'),receiptBefore,'all flows preserve old receipt');
 for(const role of ['anon','authenticated','service_role']){await db.exec('reset role;set role '+role);await rejects(()=>db.query(`select kshms_private.assign_current_handbook(${q(b)},${q(noAccess)},${q(admin)})`));}
 await db.exec('reset role');
}

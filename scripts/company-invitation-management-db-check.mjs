import fs from 'node:fs/promises';
export async function checkInvitationManagement({db,id,a,b,sys,admin,worker,other,q,rpc,actor,eq,rejects}) {
 await db.exec('reset role');await db.exec(await fs.readFile('supabase/migrations/20261113000150_company_invitation_management.sql','utf8'));
 await actor(admin);await rpc('company_admin_invite_with_access',[b,'withdraw-typo@example.invalid','ansatt',{module_keys:['sales','store_offers'],kshms:false,hr:false,kshms_role:'reader'}]);
 let row=(await rpc('company_admin_snapshot')).invites.find(i=>i.email==='withdraw-typo@example.invalid');
 const cmd=(action,payload={fingerprint:row.fingerprint},c=b)=>rpc('company_admin_manage_invitation',[c,row.id,action,payload]);
 const first={fingerprint:row.fingerprint,request_id:id(8801)};
 await cmd('begin',first);await rejects(()=>cmd('begin',{...first,request_id:id(8802)}),'PT409');
 await cmd('confirmed',first);await cmd('confirmed',first);
 row=(await rpc('company_admin_snapshot')).invites.find(i=>i.id===row.id);eq(row.send_count,1,'confirmation retry does not count twice');eq(!!row.last_sent_at,true);
 await cmd('begin',{...first,request_id:id(8803)});await cmd('uncertain',{...first,request_id:id(8803)});
 row=(await rpc('company_admin_snapshot')).invites.find(i=>i.id===row.id);eq(row.send_count,1);eq(row.last_send_status,'uncertain','uncertain delivery visible without losing previous confirmation');
 await actor(worker);await rejects(()=>cmd('withdraw'));await actor(other);await rejects(()=>cmd('withdraw'));await actor(sys,a);await rejects(()=>cmd('withdraw',undefined,a));
 await actor(admin);await rejects(()=>cmd('withdraw',{fingerprint:'stale'}),'PT409');await cmd('withdraw');await cmd('withdraw');
 eq((await rpc('company_admin_snapshot')).invites.some(i=>i.id===row.id),false,'withdrawn invite removed from active list');await rejects(()=>rpc('company_admin_resend_invite',[b,row.id]));
 await db.exec('reset role');eq((await db.query(`select status from public.company_user_invites where id=${q(row.id)}`)).rows[0].status,'revoked','history retained');
 await db.exec(`update public.company_user_invites set status='accepted',accepted=true where id=${q(row.id)}`);await actor(admin);await rejects(()=>cmd('withdraw'),'PT409');
 await db.exec('reset role;set role anon');await rejects(()=>cmd('withdraw'));await db.exec('reset role;set role authenticated');await rejects(()=>db.query('select * from company_invitation_private.deliveries'));
 await db.exec('reset role');eq((await db.query("select has_function_privilege('anon','public.company_admin_manage_invitation(uuid,uuid,text,jsonb)','execute') a")).rows[0].a,false);
}

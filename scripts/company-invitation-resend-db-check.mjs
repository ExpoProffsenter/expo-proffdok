import fs from 'node:fs/promises';
export async function checkInvitationResend({db,id,a,b,sys,admin,worker,other,secondary,q,rpc,actor,eq,rejects}) {
 await db.exec('reset role');
 await db.exec(await fs.readFile('supabase/migrations/20261015134724_company_invitation_resend.sql','utf8'));
 await actor(admin);
 const opts={module_keys:['sales','store_offers'],kshms:true,hr:true,kshms_role:'reader'};
 await rpc('company_admin_invite_with_access',[b,'resend-original@example.invalid','ansatt',opts]);
 const invite=(await rpc('company_admin_snapshot')).invites.find(i=>i.email==='resend-original@example.invalid');
 const read=async()=>{await db.exec('reset role');return (await db.query(`select jsonb_build_object('invitation',to_jsonb(i),'choices',to_jsonb(o)) as state from public.company_user_invites i left join company_admin_private.invitation_access o on o.invite_id=i.id where i.id=${q(invite.id)}`)).rows[0].state;};
 const before=await read();await actor(admin);
 let result=await rpc('company_admin_resend_invite',[b,invite.id]);
 eq(result.invitation_id,invite.id);eq(result.email,invite.email);eq(result.invite_company_name,'Bademiljø Expo');eq(result.company_id,b);
 await rpc('company_admin_resend_invite',[b,invite.id]);eq(await read(),before,'repeated resend leaves invitation fingerprint and choices byte-identical');
 await db.exec(`update public.sales_company_scopes set display_name='Bademiljø Expo nytt navn' where id=${q(b)}`);await actor(admin);
 eq((await rpc('company_admin_resend_invite',[b,invite.id])).invite_company_name,'Bademiljø Expo','display rename preserves original registration identity');
 await actor(sys,a);await rejects(()=>rpc('company_admin_resend_invite',[a,invite.id]));await rejects(()=>rpc('company_admin_resend_invite',[b,invite.id]));
 await actor(worker);await rejects(()=>rpc('company_admin_resend_invite',[b,invite.id]));
 await actor(secondary);eq((await rpc('company_admin_resend_invite',[b,invite.id])).email,invite.email,'extra workspace firmaadmin can resend within selected company');
 await actor(other);await rejects(()=>rpc('company_admin_resend_invite',[b,invite.id]));
 await actor(admin);await rejects(()=>rpc('company_admin_resend_invite',[b,id(999)]));
 await db.exec(`reset role;update public.company_user_invites set status='accepted' where id=${q(invite.id)}`);await actor(admin);await rejects(()=>rpc('company_admin_resend_invite',[b,invite.id]));
 await db.exec(`reset role;update public.company_user_invites set status='revoked' where id=${q(invite.id)}`);await actor(admin);await rejects(()=>rpc('company_admin_resend_invite',[b,invite.id]));
 await db.exec(`reset role;select set_config('request.jwt.claim.sub','',false);update public.company_user_invites set status='pending' where id=${q(invite.id)};insert into public.profiles(id,email,company_name,deactivated) values(${q(id(70))},${q(invite.email)},'',true)`);await actor(admin);await rejects(()=>rpc('company_admin_resend_invite',[b,invite.id]));
 await db.exec('reset role;set role anon');await rejects(()=>rpc('company_admin_resend_invite',[b,invite.id]));
 await db.exec('reset role');eq((await db.query("select has_function_privilege('anon','public.company_admin_resend_invite(uuid,uuid)','execute') a,has_function_privilege('authenticated','public.company_admin_resend_invite(uuid,uuid)','execute') b")).rows[0],{a:false,b:true});
}

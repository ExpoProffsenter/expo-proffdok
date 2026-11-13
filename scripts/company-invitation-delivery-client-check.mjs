import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
export async function checkInvitationDeliveryClient(){
 const source=(await fs.readFile('src/modules/company/companyAdminClient.js','utf8')).replace(/^import .*;\n/gm,'');
 const factory=new Function('getAppSupabaseClient','kshmsRpc','window','crypto',source.replace('export const','const').replace('export async function','async function')+'\nreturn sendCompanyInvitation;');
 let sent=0,mode='ok',calls=[];
 const row={id:'invite',email:'qa@example.invalid',fingerprint:'v1'};
 const send=factory(()=>({functions:{invoke:async()=>{sent++;if(mode==='lost')throw Error('Svar mistet');return {data:{ok:true}};}}}),async(name,args)=>{calls.push({name,args});if(name==='company_admin_snapshot')return {company_id:'firm',caller_id:'admin',company_name:'QA',company_profile:{},invitation_management:true,invites:mode==='withdrawn'?[]:[row]};if(args.p_action==='begin'&&mode==='busy')throw Error('Utsending pågår');return {};},{location:{origin:'https://qa.invalid',pathname:'/'}},{randomUUID:()=> 'request'});
 const invite={company_id:'firm',invitation_id:'invite',email:row.email,invite_company_name:'QA'};
 await send(invite,'admin');assert.equal(sent,1);assert.deepEqual(calls.filter(c=>c.args?.p_action).map(c=>c.args.p_action),['begin','confirmed']);
 calls=[];mode='lost';await assert.rejects(()=>send(invite,'admin'),/Uavklart/);assert.deepEqual(calls.filter(c=>c.args?.p_action).map(c=>c.args.p_action),['begin','uncertain']);
 mode='busy';await assert.rejects(()=>send(invite,'admin'),/pågår/);assert.equal(sent,2,'busy reservation never calls provider');
 mode='withdrawn';await assert.rejects(()=>send(invite,'admin'),/endret/);assert.equal(sent,2,'withdrawn invite never calls provider');
 mode='ok';await assert.rejects(()=>send(invite,'admin',()=>false),/endret/);assert.equal(sent,2,'changed actor/scope never calls provider');
 console.log('Invitation delivery client: success, uncertain transport, concurrent reserve, withdrawal and scope gates PASS');
}
if(process.argv[1]?.endsWith('company-invitation-delivery-client-check.mjs'))await checkInvitationDeliveryClient();

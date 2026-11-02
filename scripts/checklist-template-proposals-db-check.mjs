import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {executionChecklistPlatform,id} from './fixtures/execution-checklist-platform.mjs';
const p=await executionChecklistPlatform();const {db,actor,rpc,firm,other,owner,colleague,foreign}=p;
let count=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);count++;};
async function deny(fn,code){try{await fn();assert.fail('Expected denial');}catch(e){eq(e.code,code,e.message);}}
const content={title:'TEST – forslag fra montør',trade:'Rørlegger',points:[{id:id(77),title:'Kontroller den nye jobben',guidance:'Før arbeidet bygges inn',image_required:false,comment_required:true,fields:[{id:id(78),label:'Trykk',type:'number',required:true}]}]};
try{
 await db.exec(await fs.readFile('supabase/migrations/20261031012504_checklist_template_proposals.sql','utf8'));
 await actor(colleague);let s=await rpc('checklist_template_proposal_state',[firm]);eq(s.context.can_review,false);eq(s.proposals,[]);
 const req=id(900);let r=(await rpc('checklist_template_proposal_submit',[firm,req,{...content,answers:{secret:'no'},order_number:'NO',signatures:{own:'NO'}}])).record;
 eq(r.status,'pending');eq(r.submitted_by,colleague);eq(Object.keys(r.definition).some(k=>['answers','order_number','signatures'].includes(k)),false,'only definition retained');
 eq((await rpc('checklist_template_proposal_submit',[firm,req,content])).record.id,r.id,'retry same proposal');
 await deny(()=>rpc('checklist_template_proposal_submit',[firm,req,{...content,title:'Changed'}]),'PT409');
 await deny(()=>rpc('checklist_template_proposal_review',[firm,r.id,1,id(901),'approve','']),'42501');
 await actor(owner);s=await rpc('checklist_template_proposal_state',[firm]);eq(s.context.can_review,true);eq(s.proposals.length,1);eq(s.proposals[0].definition,undefined,'bounded metadata list');
 const decision=id(902);let a=await rpc('checklist_template_proposal_review',[firm,r.id,1,decision,'approve','Kontrollert']);eq(a.record.status,'approved');eq(a.version.published_by,owner);eq(a.version.number,1);
 eq((await rpc('checklist_template_proposal_review',[firm,r.id,1,decision,'approve','Kontrollert'])).record.version_id,a.record.version_id,'review retry does not duplicate');
 await deny(()=>rpc('checklist_template_proposal_review',[firm,r.id,1,id(903),'reject','Nei']),'PT409');
 await actor(colleague);s=await rpc('checklist_template_proposal_state',[firm,r.id]);eq(s.record.status,'approved');eq((await rpc('standalone_checklist_workspace',[firm])).versions.some(v=>v.id===a.version.id),true,'approved template selectable');
 const b=(await rpc('checklist_template_proposal_submit',[firm,id(904),content])).record;
 await actor(owner);await deny(()=>rpc('checklist_template_proposal_review',[firm,b.id,1,id(905),'reject','']),'22023');
 eq((await rpc('checklist_template_proposal_review',[firm,b.id,1,id(906),'reject','Dupliserer eksisterende mal'])).record.status,'rejected');
 await actor(colleague);eq((await rpc('checklist_template_proposal_state',[firm,b.id])).record.decision_note,'Dupliserer eksisterende mal');
 await actor(foreign,other);await deny(()=>rpc('checklist_template_proposal_state',[firm,r.id]),'42501');await deny(()=>rpc('checklist_template_proposal_state',[other,r.id]),'42501');await deny(()=>rpc('checklist_template_proposal_submit',[other,req,content]),'PT409');
 await actor(owner);const own=(await rpc('checklist_template_proposal_submit',[firm,id(910),content])).record;
 await actor(colleague);await deny(()=>rpc('checklist_template_proposal_state',[firm,own.id]),'42501');eq((await rpc('checklist_template_proposal_state',[firm])).proposals.every(p=>p.submitted_by===colleague),true,'employee queue contains own only');
 await db.exec('reset role');await db.query('update public.kshms_settings set responsible_user_id=null where company_id=$1',[firm]);await actor(owner);
 eq((await rpc('checklist_template_proposal_state',[firm])).context.can_publish,true,'firmadmin can approve without designated-responsible assignment');
 await deny(()=>rpc('checklist_template_proposal_review',[firm,own.id,1,id(911),null,'']),'22023');
 await db.exec('reset role');await db.query("update public.company_module_access set enabled=false where company_id=$1 and module_key='kshms'",[firm]);await actor(owner);
 s=await rpc('checklist_template_proposal_state',[firm]);eq(s.context.can_review,true);eq(s.context.can_publish,false);
 await deny(()=>rpc('checklist_template_proposal_review',[firm,own.id,1,id(912),'approve','']),'42501');
 await actor(colleague);const off=(await rpc('checklist_template_proposal_submit',[firm,id(913),content])).record;eq(off.status,'pending','own proposals work without KS/HMS');
 await actor(owner);eq((await rpc('checklist_template_proposal_review',[firm,off.id,1,id(914),'reject','Ikke relevant'])).record.status,'rejected','admin can decline while module disabled');
 await db.exec('reset role');await db.query("update public.company_module_access set enabled=true where company_id=$1 and module_key='kshms'",[firm]);await actor(owner);
 const approvedWithoutAssignment=await rpc('checklist_template_proposal_review',[firm,own.id,1,id(915),'approve','Gjennomgått']);eq(approvedWithoutAssignment.record.status,'approved');
 // Many proposals at the same timestamp verify the actual tuple cursor without misses/duplicates.
 await db.exec('reset role');
 for(let i=0;i<57;i++)await db.query('insert into checklist_private.template_proposals(id,company_id,submitted_by,submitted_identity,definition,content_hash,created_at) values($1,$2,$3,$4,$5,$6,$7)',[id(1000+i),firm,colleague,{},content,'fixture','2026-10-30T00:00:00Z']);
 await actor(colleague);const first=await rpc('checklist_template_proposal_state',[firm]);eq(first.proposals.length,50);eq(Boolean(first.next),true);
 const second=await rpc('checklist_template_proposal_state',[firm,null,first.next.created_at,first.next.id]);const ids=[...first.proposals,...second.proposals].map(x=>x.id);eq(new Set(ids).size,ids.length,'same-time cursor has no duplicates');eq(ids.length,60,'same-time cursor loses no employee proposals');eq(second.next,null);
 await actor(owner);await db.exec('reset role');await db.query("update public.sales_company_memberships set workspace_role='ansatt' where company_id=$1 and user_id=$2",[firm,owner]);await db.query('update public.kshms_settings set responsible_user_id=null where company_id=$1',[firm]);await actor(owner);
 await deny(()=>rpc('checklist_template_proposal_review',[firm,b.id,1,id(907),'approve','']),'42501');await deny(()=>rpc('checklist_template_proposal_review',[firm,r.id,1,decision,'approve','Kontrollert']),'42501');
 await db.exec('reset role');await db.query('update public.profiles set deactivated=true where id=$1',[colleague]);await actor(colleague);await deny(()=>rpc('checklist_template_proposal_state',[firm]),'42501');
 await actor(colleague,firm,'anon');await deny(()=>rpc('checklist_template_proposal_state',[firm]),'42501');
 await actor(colleague);await deny(()=>db.query('select * from checklist_private.template_proposals'),'42501');
 console.log(`Checklist proposal PostgreSQL: ${count} assertions PASS; ordinary employee, definition only, private queue, scoped admin approval/rejection, exact retry, immutable publication, selectable template and revoked/foreign/anon boundaries.`);
}finally{await db.close();}

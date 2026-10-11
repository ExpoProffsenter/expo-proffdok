import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createConversationSession} from '../src/modules/hr/hrConversationSession.mjs';
import {conversationPdfDocument,downloadConversationPdf} from '../src/modules/hr/hrConversationPdf.mjs';
import {createHrDeletionAlerts} from '../supabase/functions/_shared/hr-deletion-alerts.mjs';
const clone=v=>structuredClone(v),id=n=>`71000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const employee={id:id(1),revision:1,user_id:id(2),email:'Syntetisk medarbeider',leader_id:id(3)};
const value={context:{company_id:id(4),user_id:id(2)},employee,leader_email:'Syntetisk leder',current_revision:1,historical:false,
 permissions:{prepare:true,meeting:false,comment:false,confirm:false},conversation:{id:id(5),revision:1,content_version:1,
 template_revision:1,template:{title:'Årlig samtale',questions:[{id:id(6),phase:'preparation',topic:'Trivsel',prompt:'Hvordan fungerer arbeidet?'},{id:id(7),phase:'meeting',topic:'Oppfølging',prompt:'Hva er avtalt?'}]},
 on:'2026-11-01',stage:'preparation',shared:false,preparation:{},meeting:{},actions:[],next_on:'',comments:{employee:'',leader:''},confirmations:{employee:null,leader:null}}};
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
function fixture(fn){let calls=[],denied=0;return {calls,get denied(){return denied;},session:createConversationSession({companyId:id(4),userId:id(2),employeeId:id(1),onDenied:()=>denied++,rpc:async(n,a)=>{calls.push({n,a});return fn(n,a,calls.length);}})};}
let x=fixture(()=>clone(value));eq((await x.session.get(id(5))).current_revision,1);eq(x.calls.length,2,'fresh authorization and final readback');
eq(x.calls.every(c=>c.a.p_company_id===id(4)&&c.a.p_employee_id===id(1)),true,'every call pins actor scope');
x=fixture(()=>clone(value));await assert.rejects(x.session.list(),/kunne ikke bekreftes/);checks++;
x=fixture((_n,_a,n)=>({...clone(value),current_revision:n}));await assert.rejects(x.session.get(id(5)),/endret/);checks++;
x=fixture(()=>({...clone(value),context:{company_id:id(99),user_id:id(2)}}));await assert.rejects(x.session.get(id(5)),/tilgang/);eq(x.denied,1);
x=fixture(()=>{throw Object.assign(Error('denied'),{code:'42501'});});await assert.rejects(x.session.list());eq(x.denied,1);
let resolve;x=fixture(()=>new Promise(r=>resolve=r));const pending=x.session.list();x.session.invalidate();resolve(clone(value));await assert.rejects(pending,/utløpt/);checks++;
x=fixture(()=>clone(value));x.session.dispose();await assert.rejects(x.session.list(),/avsluttet/);eq(x.calls.length,0);
x=fixture(()=>clone(value));await assert.rejects(x.session.command({...value,historical:true},'confirm'),/historisk/);eq(x.calls.length,0);
x=fixture((n)=>{if(n==='hr_conversation_command')return {...clone(value),current_revision:2,conversation:{...clone(value.conversation),revision:2}};return clone(value);});
await assert.rejects(x.session.command(value,'preparation',{answers:{}}),/kunne ikke bekreftes/);eq(x.calls.filter(c=>c.n==='hr_conversation_command').length,1,'unknown write outcome is not retried automatically');
x=fixture(()=>clone(value));await assert.rejects(x.session.start({id:id(5),employeeRevision:1,templateId:id(6),templateRevision:1,on:'2026-11-01',time:'24:00'}),/klokkeslett/);eq(x.calls.length,0,'invalid clock never sends an RPC');
x=fixture(()=>clone(value));await x.session.start({id:id(5),employeeRevision:1,templateId:id(6),templateRevision:1,on:'2026-11-01',time:'09:15'});eq(x.calls[0].n,'hr_conversation_start_at');eq(x.calls[0].a.p_time,'09:15','clock is passed unchanged, no browser timezone conversion');
x=fixture(()=>clone(value));await x.session.schedule(value,{on:'2026-11-02',time:'00:00'});eq(x.calls[0].n,'hr_conversation_schedule');eq(x.calls[0].a.p_revision,1);eq(x.calls[0].a.p_time,'00:00');
x=fixture(()=>clone(value));await assert.rejects(x.session.schedule({...value,historical:true},{on:'2026-11-02',time:'14:00'}),/historisk/);eq(x.calls.length,0);
const invitationStatus={context:value.context,employee:{id:employee.id},conversation_id:id(5),app_notification:true,email_status:'not_queued',can_notify:true,sent_at:null};
x=fixture(()=>clone(invitationStatus));eq((await x.session.invitationStatus(id(5))).email_status,'not_queued');await x.session.notify(value);eq(x.calls.at(-1).a.p_employee_revision,1);eq(x.calls.at(-1).a.p_revision,1);
x=fixture(()=>clone(invitationStatus));await assert.rejects(x.session.notify({...value,historical:true}),/historisk/);eq(x.calls.length,0);
for(const change of [{conversation_id:id(99)},{email_status:'delivered'},{can_notify:'yes'},{app_notification:null}]){x=fixture(()=>({...clone(invitationStatus),...change}));await assert.rejects(x.session.invitationStatus(id(5)),/kunne ikke bekreftes/);checks++;}
let sends=0;
eq(await downloadConversationPdf({value,loadPdf:()=>{throw Error('should not load');},isCurrent:()=>false}),null);
const sample=clone(value);sample.conversation.meeting_time='14:45';sample.conversation.shared=true;sample.conversation.stage='completed';sample.conversation.preparation[id(6)]='Opprinnelig medarbeidersvar. '.repeat(150);
sample.conversation.meeting[id(7)]='Avtalt møtereferat med æøå. '.repeat(150);sample.conversation.comments.employee='Egen uenighet beholdes.';
sample.conversation.actions=[{id:id(8),task:'Avtalt oppfølging',owner_id:id(2),due_on:'2026-11-20',done:false}];
sample.conversation.confirmations.employee={at:'2026-10-11T12:00:00Z'};
eq(conversationPdfDocument(sample).fields.find(f=>f[0]==='Medarbeider')[1],'Syntetisk medarbeider');
eq(conversationPdfDocument(sample).fields.find(f=>f[0]==='Klokkeslett')[1],'14:45 (norsk tid)');eq(conversationPdfDocument(value).fields.find(f=>f[0]==='Klokkeslett')[1],'Ikke avtalt','old records never get an invented meeting time');
const jspdf=await import(process.env.HR_PRACTICE_JSPDF_PATH||'/tmp/hr-practice-qa/node_modules/jspdf/dist/jspdf.node.min.js');
const pdf=await downloadConversationPdf({value:sample,companyName:'Syntetisk firma',loadPdf:async()=>jspdf,save:async doc=>{
 sends++;const bytes=new Uint8Array(doc.output('arraybuffer'));assert(bytes.length>2000);if(process.env.HR_CONVERSATION_PDF_PATH)await fs.writeFile(process.env.HR_CONVERSATION_PDF_PATH,bytes);
}});eq(pdf.pages>1,true,'long content paginates');eq(sends,1);
let current=true;eq(await downloadConversationPdf({value:sample,isCurrent:()=>current,loadPdf:async()=>{current=false;return jspdf;},save:()=>sends++}),null);eq(sends,1,'late PDF loader cannot export after navigation/access invalidation');
const receipt={id:id(10),company_id:id(4),employee_id:id(1),user_id:id(2),kind:'employment',through_revision:3,requested_at:'2026-10-11T12:00:00Z'};
function mailFixture({authorize=true,transport=true,valid=true,provider=200,extraReceipt={},finish=true,configured=true}={}){
 const calls=[],requests=[];const handler=createHrDeletionAlerts({apiKey:configured?'synthetic-provider-key':null,from:'qa@example.invalid',verifyTransport:async()=>transport,
 rpc:async(n,a)=>{calls.push({n,a});if(n==='hr_alert_worker_authorize')return authorize;if(n==='hr_alert_worker_reserve')return {id:id(11),attempt:id(12),to:'operator@example.invalid',receipt:{...receipt,...extraReceipt}};if(n==='hr_alert_worker_validate')return valid;if(n==='hr_alert_worker_finish')return finish;throw Error(n);},
 fetchImpl:async(url,opts)=>{requests.push({url,opts});if(provider==='unknown')throw Error('provider timeout');return new Response(null,{status:provider});}});
 return {handler,calls,requests};
}
const req=(body='{}',headers={},method='POST')=>new Request('https://example.invalid/alerts',{method,headers:{'x-hr-alert-token':'aa'.repeat(32),...headers},...(method==='POST'?{body}:{})});
for(const request of [req('{}',{origin:'https://example.invalid'}),req('{}',{authorization:'Bearer synthetic'}),req('{}',{'x-hr-alert-token':'bad'}),req(null,{},'GET')]){
 const f=mailFixture();eq((await f.handler(request)).status,request.method==='GET'?405:403);eq(f.calls.length,0);eq(f.requests.length,0);
}
for(const options of [{authorize:false},{transport:false},{configured:false}]){const f=mailFixture(options);eq((await f.handler(req())).status,options.authorize===false?403:503);eq(f.requests.length,0);eq(f.calls.some(c=>c.n==='hr_alert_worker_reserve'),false);}
for(const body of ['not-json','[]','{"unapproved":"payload"}','x'.repeat(100)]){const f=mailFixture();eq((await f.handler(req(body))).status,400);eq(f.calls.some(c=>c.n==='hr_alert_worker_reserve'),false);}
let f=mailFixture({extraReceipt:{preparation:'Forbidden HR contents'}});eq((await f.handler(req())).status,503);eq(f.requests.length,0);
f=mailFixture({valid:false});eq((await f.handler(req())).status,200);eq(f.requests.length,0,'fresh recipient revocation stops provider send');
f=mailFixture();eq((await f.handler(req())).status,200);eq(f.requests.length,1);
eq(f.requests[0].url,'https://api.resend.com/emails');eq(f.requests[0].opts.redirect,'error');eq(f.requests[0].opts.headers['Idempotency-Key'],'hr-deletion-'+id(11));
const mail=JSON.parse(f.requests[0].opts.body);eq(mail.to,['operator@example.invalid']);eq(mail.text.includes(JSON.stringify(receipt,null,2)),true);eq(mail.text.includes('Forbidden'),false);
eq(f.calls.at(-1).a.p_sent,true);
for(const provider of [500,'unknown']){f=mailFixture({provider});eq((await f.handler(req())).status,503);eq(f.calls.at(-1).a.p_sent,false);}
f=mailFixture({finish:false});eq((await f.handler(req())).status,503,'unknown database acknowledgement is not reported as confirmed');
console.log(`HR conversation session/PDF and deletion mail: ${checks} runtime assertions PASS; synthetic transport/provider, actual jsPDF.`);

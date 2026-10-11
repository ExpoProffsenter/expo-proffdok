import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createSickLeaveSession} from '../src/modules/hr/hrSickLeaveSession.mjs';
import {sickLeavePdfDocument,downloadSickLeavePdf} from '../src/modules/hr/hrSickLeavePdf.mjs';
import {createHrFollowupReminders} from '../supabase/functions/_shared/hr-followup-reminders.mjs';
const clone=v=>structuredClone(v),id=n=>`71000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const employee={id:id(1),revision:1,user_id:id(2),email:'Syntetisk medarbeider',leader_id:id(3)};
const value={context:{company_id:id(4),user_id:id(2)},employee,leader_email:'Syntetisk leder',current_revision:1,historical:false,
 permissions:{prepare:true,meeting:false,comment:false,confirm:false},conversation:{id:id(5),revision:1,content_version:1,
 template_revision:1,template:{title:'Årlig samtale',questions:[{id:id(6),phase:'preparation',topic:'Trivsel',prompt:'Hvordan fungerer arbeidet?'},{id:id(7),phase:'meeting',topic:'Oppfølging',prompt:'Hva er avtalt?'}]},
 type:'sickleave',case_status:'active',absence_mode:'partial',returned_on:'',sharing:{sykmelder:[],nav:[]},milestones:Object.fromEntries(['plan','meeting1','activity','meeting2'].map(k=>[k,{status:k==='meeting1'?'review':'open',on:'',note:''}])),on:'2026-10-01',stage:'preparation',shared:false,preparation:{},meeting:{},actions:[],next_on:'',comments:{employee:'',leader:''},confirmations:{employee:null,leader:null}}};
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
function fixture(fn){let calls=[],denied=0;return {calls,get denied(){return denied;},session:createSickLeaveSession({companyId:id(4),userId:id(2),employeeId:id(1),onDenied:()=>denied++,rpc:async(n,a)=>{calls.push({n,a});return fn(n,a,calls.length);}})};}
let x=fixture(()=>clone(value));eq((await x.session.get(id(5))).current_revision,1);eq(x.calls.length,2,'fresh authorization and final readback');
eq(x.calls.every(c=>c.a.p_company_id===id(4)&&c.a.p_employee_id===id(1)),true,'every call pins actor scope');
x=fixture(()=>clone(value));await assert.rejects(x.session.list(),/kunne ikke bekreftes/);checks++;
x=fixture((_n,_a,n)=>({...clone(value),current_revision:n}));await assert.rejects(x.session.get(id(5)),/endret/);checks++;
x=fixture(()=>({...clone(value),context:{company_id:id(99),user_id:id(2)}}));await assert.rejects(x.session.get(id(5)),/tilgang/);eq(x.denied,1);
x=fixture(()=>{throw Object.assign(Error('denied'),{code:'42501'});});await assert.rejects(x.session.list());eq(x.denied,1);
let resolve;x=fixture(()=>new Promise(r=>resolve=r));const pending=x.session.list();x.session.invalidate();resolve(clone(value));await assert.rejects(pending,/utløpt/);checks++;
x=fixture(()=>clone(value));x.session.dispose();await assert.rejects(x.session.list(),/avsluttet/);eq(x.calls.length,0);
x=fixture(()=>clone(value));await assert.rejects(x.session.command({...value,historical:true},'confirm'),/historisk/);eq(x.calls.length,0);
x=fixture((n)=>{if(n==='hr_sick_leave_command')return {...clone(value),current_revision:2,conversation:{...clone(value.conversation),revision:2}};return clone(value);});
await assert.rejects(x.session.command(value,'preparation',{answers:{}}),/kunne ikke bekreftes/);eq(x.calls.filter(c=>c.n==='hr_sick_leave_command').length,1,'unknown write outcome is not retried automatically');
let sends=0;
eq(await downloadSickLeavePdf({value,loadPdf:()=>{throw Error('should not load');},isCurrent:()=>false}),null);
const sample=clone(value);sample.conversation.shared=true;sample.conversation.stage='completed';sample.conversation.preparation[id(6)]='Opprinnelig medarbeidersvar. '.repeat(150);
sample.conversation.meeting[id(7)]='Avtalt møtereferat med æøå. '.repeat(150);sample.conversation.comments.employee='Egen uenighet beholdes.';
sample.conversation.actions=[{id:id(8),task:'Avtalt oppfølging',owner_id:id(2),due_on:'2026-11-20',done:false}];
sample.conversation.confirmations.employee={at:'2026-10-11T12:00:00Z'};
eq(sickLeavePdfDocument(sample).fields.find(f=>f[0]==='Medarbeider')[1],'Syntetisk medarbeider');
const jspdf=await import(process.env.HR_PRACTICE_JSPDF_PATH||'/tmp/hr-practice-qa/node_modules/jspdf/dist/jspdf.node.min.js');
const pdf=await downloadSickLeavePdf({value:sample,companyName:'Syntetisk firma',loadPdf:async()=>jspdf,save:async doc=>{
 sends++;const bytes=new Uint8Array(doc.output('arraybuffer'));assert(bytes.length>2000);if(process.env.HR_SICK_LEAVE_PDF_PATH)await fs.writeFile(process.env.HR_SICK_LEAVE_PDF_PATH,bytes);
}});eq(pdf.pages>1,true,'long content paginates');eq(sends,1);
let current=true;eq(await downloadSickLeavePdf({value:sample,isCurrent:()=>current,loadPdf:async()=>{current=false;return jspdf;},save:()=>sends++}),null);eq(sends,1,'late PDF loader cannot export after navigation/access invalidation');
const receipt={id:id(10),company_id:id(4),employee_id:id(1),user_id:id(2),kind:'employment',through_revision:3,requested_at:'2026-10-11T12:00:00Z'};
function mailFixture({authorize=true,transport=true,valid=true,provider=200,extraJob={},finish=true,configured=true}={}){
 const calls=[],requests=[];const handler=createHrFollowupReminders({apiKey:configured?'synthetic-provider-key':null,from:'qa@example.invalid',verifyTransport:async()=>transport,
 rpc:async(n,a)=>{calls.push({n,a});if(n==='hr_followup_worker_authorize')return authorize;if(n==='hr_conversation_mail_reserve')return {id:id(11),attempt:id(12),to:'leader@example.invalid',...(a.p_kind==='meeting-reminder'?{on:'2026-10-21',time:'12:00'}:{}),...extraJob};if(n==='hr_conversation_invitation_reserve')return {id:id(11),attempt:id(12),to:'operator@example.invalid',on:'2026-10-21',time:'12:00',location:'Sted A',branding:{name:'QA firma',logo:'https://example.invalid/logo.png'},...extraJob};if(n==='hr_followup_test_reserve')return {id:a.p_id,attempt:id(12),to:'operator@example.invalid',...extraJob};if(n==='hr_followup_worker_reserve')return {id:id(11),attempt:id(12),to:'operator@example.invalid',...extraJob};if(['hr_followup_worker_validate','hr_conversation_invitation_validate_place','hr_conversation_mail_validate'].includes(n))return valid;if(n==='hr_followup_worker_finish')return finish;throw Error(n);},
 fetchImpl:async(url,opts)=>{requests.push({url,opts});if(provider==='unknown')throw Error('provider timeout');return new Response(null,{status:provider});}});
 return {handler,calls,requests};
}
const req=(body='{}',headers={},method='POST')=>new Request('https://example.invalid/alerts',{method,headers:{'x-hr-followup-token':'aa'.repeat(32),...headers},...(method==='POST'?{body}:{})});
for(const request of [req('{}',{origin:'https://example.invalid'}),req('{}',{authorization:'Bearer synthetic'}),req('{}',{'x-hr-followup-token':'bad'}),req(null,{},'GET')]){
 const f=mailFixture();eq((await f.handler(request)).status,request.method==='GET'?405:403);eq(f.calls.length,0);eq(f.requests.length,0);
}
for(const options of [{authorize:false},{transport:false},{configured:false}]){const f=mailFixture(options);eq((await f.handler(req())).status,options.authorize===false?403:503);eq(f.requests.length,0);eq(f.calls.some(c=>c.n==='hr_followup_worker_reserve'),false);}
for(const body of ['not-json','[]','{"unapproved":"payload"}','x'.repeat(100)]){const f=mailFixture();eq((await f.handler(req(body))).status,400);eq(f.calls.some(c=>c.n==='hr_followup_worker_reserve'),false);}
let f=mailFixture({extraJob:{preparation:'Forbidden HR contents'}});eq((await f.handler(req())).status,503);eq(f.requests.length,0);
f=mailFixture({valid:false});eq((await f.handler(req())).status,200);eq(f.requests.length,0,'fresh recipient revocation stops provider send');
f=mailFixture();eq((await f.handler(req())).status,200);eq(f.requests.length,1);
eq(f.requests[0].url,'https://api.resend.com/emails');eq(f.requests[0].opts.redirect,'error');eq(f.requests[0].opts.headers['Idempotency-Key'],'hr-followup-'+id(11));
const mail=JSON.parse(f.requests[0].opts.body);eq(mail.to,['operator@example.invalid']);eq(mail.subject,'Expo ProffDok – HR-oppfølging');eq(mail.text.includes('sykefravær'),false);eq(mail.text.includes(employee.email),false);eq(mail.text.includes('example.invalid'),false);eq(mail.text.includes(id(1)),false);eq(mail.text.includes('Forbidden'),false);eq(mail.html.includes('Åpne Expo ProffDok'),true);eq(mail.html.includes('aria-label="Expo ProffDok"'),true);eq(mail.html.includes(employee.email),false);eq(mail.html.includes(id(1)),false);
eq(f.calls.at(-1).a.p_sent,true);
for(const provider of [500,'unknown']){f=mailFixture({provider});eq((await f.handler(req())).status,503);eq(f.calls.at(-1).a.p_sent,false);}
f=mailFixture({finish:false});eq((await f.handler(req())).status,503,'unknown database acknowledgement is not reported as confirmed');
const inviteReq=()=>req('{"invitation":true}');
f=mailFixture();eq((await f.handler(inviteReq())).status,200);eq(f.requests.length,1);
const invite=JSON.parse(f.requests[0].opts.body);eq(invite.subject,'Expo ProffDok – invitasjon til medarbeidersamtale');eq(invite.text.includes('21.10.2026 kl. 12:00 (norsk tid)'),true);eq(invite.text.includes('Klar til samtale'),true);
eq(f.calls.find(c=>c.n==='hr_conversation_invitation_validate_place').a,{p_id:id(11),p_attempt:id(12),p_on:'2026-10-21',p_time:'12:00',p_location:'Sted A'});eq(f.calls.some(c=>c.n==='hr_followup_worker_reserve'),false,'invitation cannot take deadline job');eq(invite.text.includes('Sted: Sted A'),true);eq(invite.html.includes('<img '),true);eq(invite.html.includes('https://example.invalid/logo.png'),true);eq(invite.html.includes('Åpne Expo ProffDok'),true);
for(const extraJob of [{on:'2026-02-30'},{time:'24:00'},{time:'12:00\\nprivate'},{answers:'forbidden'},{on:null},{location:''},{location:'A\nB'},{location:'x'.repeat(201)},{branding:{name:'QA',logo:'x',answers:'forbidden'}}]){f=mailFixture({extraJob});eq((await f.handler(inviteReq())).status,503);eq(f.requests.length,0);}
f=mailFixture({extraJob:{location:'Rom <A> & B',branding:{name:'QA <firma>',logo:'javascript:alert(1)'}}});eq((await f.handler(inviteReq())).status,200);const escaped=JSON.parse(f.requests[0].opts.body);eq(escaped.html.includes('Rom &lt;A&gt; &amp; B'),true);eq(escaped.html.includes('QA &lt;firma&gt;'),true);eq(escaped.html.includes('javascript:'),false);eq(escaped.html.includes('https://expo-proffdok.app/expo-logo.png'),true);
f=mailFixture({valid:false});eq((await f.handler(inviteReq())).status,200);eq(f.requests.length,0,'changed appointment/access stops invitation');
for(const provider of [500,'unknown']){f=mailFixture({provider});eq((await f.handler(inviteReq())).status,503);eq(f.calls.at(-1).a.p_sent,false);eq(f.requests[0].opts.headers['Idempotency-Key'],'hr-followup-'+id(11));}
f=mailFixture({finish:false});eq((await f.handler(inviteReq())).status,503,'unconfirmed invitation acknowledgement');
for(const [body,kind,subject] of [['{"reminder":true}','meeting-reminder','påminnelse om medarbeidersamtale'],['{"feedback":true}','employee-feedback','nytt innspill til medarbeidersamtale']]){
 f=mailFixture();eq((await f.handler(req(body))).status,200);const msg=JSON.parse(f.requests[0].opts.body);eq(msg.to,['leader@example.invalid']);eq(msg.subject,'Expo ProffDok – '+subject);eq(f.calls.find(c=>c.n==='hr_conversation_mail_reserve').a.p_kind,kind);eq(f.calls.find(c=>c.n==='hr_conversation_mail_validate').a.p_kind,kind);eq(msg.text.includes(employee.email),false);eq(msg.html.includes('aria-label="Expo ProffDok"'),true);eq(msg.html.includes('Åpne Expo ProffDok'),true);eq(msg.html.includes('href="https://expo-proffdok.app/"'),true);eq(msg.html.includes('safelinks'),false);eq(msg.html.includes(employee.email),false);eq(msg.html.includes(id(1)),false);eq(msg.html.includes('sykefravær'),false);eq(msg.html.includes('Nytt innspill til medarbeidersamtale')||msg.html.includes('Påminnelse om medarbeidersamtale'),true);
 f=mailFixture({valid:false});eq((await f.handler(req(body))).status,200);eq(f.requests.length,0,'revoked leader/event is not mailed');
 f=mailFixture({extraJob:{comments:'forbidden private text'}});eq((await f.handler(req(body))).status,503);eq(f.requests.length,0);
}
eq((await fs.readFile('supabase/functions/hr-followup-reminders/index.ts','utf8')).includes("'hr_followup_test_reserve'"),true,'deployed adapter permits targeted test RPC');
const testReq=()=>req(JSON.stringify({test:id(11)}));
f=mailFixture();eq((await f.handler(testReq())).status,200);eq(f.requests.length,1);
const testMail=JSON.parse(f.requests[0].opts.body);eq(testMail.to,['operator@example.invalid']);eq(testMail.subject,'Expo ProffDok – test av HR-varsling');eq(testMail.text.includes('Ingen faktisk medarbeidersamtale'),true);eq(testMail.html,undefined,'isolated test transport remains unchanged');
eq(f.calls.find(c=>c.n==='hr_followup_test_reserve').a,{p_id:id(11)});eq(f.calls.some(c=>c.n==='hr_followup_worker_reserve'||c.n==='hr_conversation_mail_reserve'||c.n==='hr_conversation_invitation_reserve'),false,'targeted test never drains queues');
for(const body of ['{"test":"bad"}',JSON.stringify({test:id(11),invitation:true}),JSON.stringify({test:id(11),to:'other@example.invalid'})]){f=mailFixture();eq((await f.handler(req(body))).status,400);eq(f.requests.length,0);}
f=mailFixture({extraJob:{id:id(99)}});eq((await f.handler(testReq())).status,503);eq(f.requests.length,0,'wrong delivery ID stops test');
f=mailFixture({valid:false});eq((await f.handler(testReq())).status,200);eq(f.requests.length,0,'fresh access check stops test');
f=mailFixture({provider:500});eq((await f.handler(testReq())).status,503);eq(f.calls.at(-1).a.p_sent,false);


const {hrNotificationHtml}=await import('../supabase/functions/_shared/hr-notification-mail.mjs');
eq(hrNotificationHtml({kind:'reminder',on:'2026-10-21',time:'<script>'}).includes('&lt;script&gt;'),true,'dynamic meeting metadata escaped in HTML');
assert.throws(()=>hrNotificationHtml({kind:'unknown'}));checks++;
eq(hrNotificationHtml({kind:'feedback'}).includes('Proffsenter'),false,'generic app branding must not impersonate a customer company');
console.log(`Sick-leave session/PDF and generic reminder mail: ${checks} runtime assertions PASS; synthetic transport/provider, actual jsPDF.`);

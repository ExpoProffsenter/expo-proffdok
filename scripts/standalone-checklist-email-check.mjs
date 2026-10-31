import {signatureA} from './fixtures/checklist-signatures.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {handleStandaloneChecklistEmail,standaloneChecklistEmail} from '../supabase/functions/_shared/standalone-checklist-email.mjs';
import {createStandaloneChecklistPdf} from '../supabase/functions/_shared/standalone-checklist-pdf.mjs';
import {standaloneTestPlatform,id} from './fixtures/standalone-checklist-platform.mjs';
const require=createRequire(import.meta.url),{jsPDF}=require('./qa/node_modules/jspdf/dist/jspdf.node.min.js');
const {db,actor,rpc,firm,owner,colleague}=await standaloneTestPlatform();let checks=0;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const args={standalone_checklist_mail:['p_company_id','p_id','p_revision','p_request_id','p_to'],standalone_checklist_mail_file:['p_request_id','p_content'],standalone_checklist_mail_complete:['p_request_id','p_provider_id']};
const address='chosen@example.invalid',run=id(20),point=id(21);
const payload={signatures:{own:{image:signatureA}},id:run,revision:0,definition:{title:'Trykkprøve <QA>',trade:'Rørlegger',instructions:'Isolert test',points:[{id:point,title:'Trykk',guidance:'Les av',image_required:false,comment_required:false}]},answers:{[point]:{status:'Ok',comment:'Dokumentert',photos:[],values:{}}},order_number:'ORD-42',work_site:'Testveien 42, bygg B',external_project:'Eksternt prosjekt <QA>',customer_name:'QA Oppdragsgiver'};
const records=[];let user=owner,acksFail=0,providerMode='ok',logoMode=0;
const client=role=>({auth:{getUser:async()=>({data:{user:user?{id:user}:null},error:null})},rpc:async(name,b)=>{
 try{await actor(user||owner,firm,role);if(name==='standalone_checklist_mail_complete'&&acksFail-- >0)throw Error('synthetic ack lost');return {data:await rpc(name,args[name].map(k=>b[k]??null)),error:null};}catch(e){return {data:null,error:{message:e.message,code:e.code}};}
}});
const logo=fs.readFileSync('public/brands/ringside-rorleggerbedrift.png');
const deps={env:k=>k==='RESEND_API_KEY'?'synthetic-key':k==='CHAT_FROM_EMAIL'?'Expo <noreply@example.invalid>':'',JsPDF:jsPDF,userClient:()=>client('authenticated'),adminClient:()=>client('service_role'),loadLogo:async()=>logoMode?null:'data:image/png;base64,'+logo.toString('base64'),fetch:async(url,options)=>{
 eq(url,'https://api.resend.com/emails','only expected mail provider');records.push({body:JSON.parse(options.body),key:options.headers['Idempotency-Key']});if(providerMode==='timeout')throw Error('synthetic network loss');return new Response(JSON.stringify(providerMode==='rejected'?{error:'rejected'}:{id:'provider-'+records.at(-1).key}),{status:providerMode==='rejected'?503:200});
}};
const request=b=>new Request('https://qa.example.invalid/send',{method:'POST',headers:{Authorization:'Bearer synthetic','Content-Type':'application/json'},body:JSON.stringify(b)});
const b={companyId:firm,id:run,revision:1,requestId:id(30),to:address};
try{
 await db.exec("create or replace function public.work_profile_company_profile(c uuid) returns jsonb language sql security definer set search_path='' as $$select jsonb_build_object('companyId',id,'companyName',display_name,'email','qa@example.invalid','logoUrl','https://qa.example.invalid/logo.png') from public.sales_company_scopes where id=c$$;");await actor();await rpc('standalone_checklist_command',[firm,'complete',id(22),payload]);
 let response=await handleStandaloneChecklistEmail(request(b),deps);eq(response.status,200);eq((await response.json()).providerAccepted,true);eq(records.length,1);eq(records[0].body.to,[address]);eq(records[0].body.attachments.length,1);eq(records[0].body.subject.includes('ORD-42'),true);eq(records[0].body.html.includes('&lt;QA&gt;'),true);eq(records[0].body.html.includes('Trykkprøve <QA>'),false,'HTML escaped');
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'standalone-pdf-')),file=path.join(directory,'email.pdf');fs.writeFileSync(file,Buffer.from(records[0].body.attachments[0].content,'base64'));
 const pdfText=execFileSync('pdftotext',['-layout',file,'-'],{encoding:'utf8'});for(const text of ['ORD-42','Testveien 42','Eksternt prosjekt','QA Oppdragsgiver','Trykkprøve','Dokumentert','Fullført','QA Bedrift'])eq(pdfText.includes(text),true,'real PDF contains '+text);
 response=await handleStandaloneChecklistEmail(request(b),deps);eq((await response.json()).alreadySent,true);eq(records.length,1,'acknowledged request never sends twice');
 acksFail=1;const lost={...b,requestId:id(31)};response=await handleStandaloneChecklistEmail(request(lost),deps);eq(response.status,502);eq((await response.json()).uncertain,true);const first=records.at(-1);logoMode=1;
 response=await handleStandaloneChecklistEmail(request(lost),deps);eq(response.status,200);eq(records.at(-1).key,first.key);eq(records.at(-1).body.attachments[0].content,first.body.attachments[0].content,'frozen PDF bytes survive ack loss and changed logo');
 user=colleague;const before=records.length;response=await handleStandaloneChecklistEmail(request({...b,requestId:id(32)}),deps);eq(response.status,403);eq(records.length,before,'foreign actor never reaches provider');user=null;response=await handleStandaloneChecklistEmail(request(b),deps);eq(response.status,401);eq(records.length,before);user=owner;
 response=await handleStandaloneChecklistEmail(request({...b,to:'a@b.invalid\nBcc: x@y.invalid',requestId:id(33)}),deps);eq(response.status,400);eq(records.length,before,'header injection blocked before provider');
 providerMode='timeout';const timeout={...b,requestId:id(34)};response=await handleStandaloneChecklistEmail(request(timeout),deps);eq((await response.json()).uncertain,true);providerMode='ok';response=await handleStandaloneChecklistEmail(request(timeout),deps);eq(response.status,200);eq(records.at(-1).key,records.at(-2).key,'network retry keeps provider key');
 const draft={...(await (async()=>{await actor();return rpc('standalone_checklist_workspace',[firm,run]);})()).record,status:'draft',completed_at:null};const generated=createStandaloneChecklistPdf({JsPDF:jsPDF,record:draft,company:{companyName:'QA Bedrift'}});const draftFile=path.join(directory,'draft.pdf');generated.doc.save(draftFile);const draftText=execFileSync('pdftotext',['-layout',draftFile,'-'],{encoding:'utf8'});eq(draftText.includes('IKKE FULLFØRT'),true,'draft never presented as completed');eq(draftText.includes('ORD-42'),true,'draft retains required order');assert.throws(()=>createStandaloneChecklistPdf({JsPDF:jsPDF,record:{...draft,order_number:''},company:{companyName:'QA'}}),/ordrenummer/);checks++;assert.throws(()=>createStandaloneChecklistPdf({JsPDF:jsPDF,record:{...draft,work_site:''},company:{companyName:'QA'}}),/arbeidssted/);checks++;eq(records[0].body.text.includes('Testveien 42, bygg B'),true,'mail has saved workplace');eq(records[0].body.text.includes('Eksternt prosjekt <QA>'),true,'mail has saved external reference');
 console.log(`Standalone checklist mail/PDF: ${checks} assertions PASS; real saved SQL snapshot and jsPDF, chosen recipient, escaping, no-recipient/actor gates, immutable PDF bytes, provider/ack uncertainty and retry keys. Synthetic provider only. PDFs: ${directory}`);
}finally{await db.close();}

import assert from 'node:assert/strict';import fs from 'node:fs';
import {handleProCatalogOrder,proCatalogOrderMail} from '../supabase/functions/_shared/pro-catalog-order-email.mjs';
import {proCatalogOrderAttachments} from '../supabase/functions/_shared/pro-catalog-order-files.mjs';
import {createCordelPicklist} from '../src/modules/cordel/picklistCordel.mjs';
let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const order={order_number:'V-QA-001',company:{companyName:'QA Ø & <Firma>',orgNumber:'000000001'},replyTo:'buyer@example.invalid',to:'orders@example.invalid',recipient_name:'Expo QA',reference:'0007',address:'QA gate 1',requested_date:'2026-12-11',requested_time:'10:30',note:'=not a formula <script>',goods:[{id:'p1',sku:'0012',supplier:'QA Rør',name:'Vare med ø og æ',quantity:2.5},{id:'p2',sku:'0012',supplier:'Annen',name:'Annen vare',quantity:1}]};
const files=proCatalogOrderAttachments(order);eq(files.length,2);eq(files[0].bytes,createCordelPicklist(order.goods.map(g=>({supplier_product_number:g.sku,supplier_name:g.supplier,quantity:g.quantity}))),'exact existing Cordel encoding/delimiters/decimal/CRLF');
// Independently read the stored ZIP entries and inspect the actual Excel cells.
const zip=files[1].bytes,view=new DataView(zip.buffer,zip.byteOffset,zip.byteLength);let offset=0,sheet='';
while(offset+30<=zip.length&&view.getUint32(offset,true)===0x04034b50){
 const size=view.getUint32(offset+18,true),nameLength=view.getUint16(offset+26,true),extraLength=view.getUint16(offset+28,true),start=offset+30+nameLength+extraLength;
 const name=new TextDecoder().decode(zip.slice(offset+30,offset+30+nameLength));
 if(name==='xl/worksheets/sheet1.xml')sheet=new TextDecoder().decode(zip.slice(start,start+size));
 offset=start+size;
}
assert(/<c r="B11" t="inlineStr">.*?>0012<\/t>/.test(sheet),'Excel keeps leading-zero SKU as text');checks++;
assert(sheet.includes('<c r="D11"><v>2.5</v></c>')&&sheet.includes('<c r="D12"><v>1</v></c>'),'Excel exact canonical quantities');checks++;
assert(sheet.includes('QA Rør')&&sheet.includes('Annen')&&sheet.includes('Vare med ø og æ'),'Excel supplier identity and Norwegian description');checks++;
assert(sheet.includes('11.12.2026 kl. 10:30 (norsk tid)'),'Excel delivery date and time');checks++;
assert(sheet.includes('=not a formula &lt;script&gt;')&&!sheet.includes('<f>'),'Excel text never becomes formula');checks++;
fs.writeFileSync('/tmp/pro-catalog-order-control.xlsx',files[1].bytes);fs.writeFileSync('/tmp/pro-catalog-order-cordel.txt',files[0].bytes);
const mail=proCatalogOrderMail(order);eq(mail.to,[order.to]);eq(mail.reply_to,order.replyTo);assert(mail.html.includes('Husk å sende ordrebekreftelse'));checks++;assert(mail.html.includes('11.12.2026 kl. 10:30'));checks++;assert(!mail.html.includes('<script>'));checks++;assert(mail.html.includes('&lt;script&gt;'));checks++;assert(mail.text.includes('Send ordrebekreftelse med bekreftet leveringstidspunkt'));checks++;
let calls=[],providerBodies=[],complete=0;let rejectAuth=false,revoke=false,already=false,providerFail=false,ackFail=false,configured=true;
const deps={env:n=>configured?(n==='CHAT_FROM_EMAIL'?'Expo <qa@example.invalid>':'test-key'):'',userClient:()=>({auth:{getUser:async()=>({data:rejectAuth?null:{user:{id:'u'}},error:null})},rpc:async(n,a)=>{calls.push(n);return revoke&&n==='pro_catalog_order_begin'?{error:{code:'42501',message:'Revoked'}}:{data:{id:'frozen-id',snapshot:order,sent:already}};}}),adminClient:()=>({rpc:async()=>{complete++;return {error:ackFail?{message:'lost ack'}:null};}}),fetch:async(url,args)=>{providerBodies.push(JSON.parse(args.body));eq(args.headers['Idempotency-Key'],'pro-catalog-order/frozen-id');return new Response(JSON.stringify(providerFail?{}:{id:'provider-id'}),{status:providerFail?503:200});}};
const req=(body={companyId:'87000000-0000-4000-8000-000000000003',requestId:'87000000-0000-4000-8000-000000000010',order:{items:[]}},origin='https://expo-proffdok.app')=>new Request('https://qa.invalid/send',{method:'POST',headers:{Origin:origin,Authorization:'Bearer synthetic'},body:JSON.stringify(body)});
let response=await handleProCatalogOrder(req(),deps);eq(response.status,200);eq(providerBodies[0].attachments.length,2);eq(providerBodies[0].attachments[0].content,Buffer.from(files[0].bytes).toString('base64'));eq(complete,1);eq(calls,['pro_catalog_order_prepare','pro_catalog_order_begin']);
rejectAuth=true;eq((await handleProCatalogOrder(req(),deps)).status,401);rejectAuth=false;
eq((await handleProCatalogOrder(req({companyId:null,requestId:'87000000-0000-4000-8000-000000000010',order:{}}),deps)).status,400,'malformed company never reaches provider');
const before=providerBodies.length;revoke=true;eq((await handleProCatalogOrder(req(),deps)).status,403);eq(providerBodies.length,before,'fresh revoke prevents send');revoke=false;
already=true;eq((await (await handleProCatalogOrder(req(),deps)).json()).alreadySent,true);eq(providerBodies.length,before);already=false;
configured=false;eq((await handleProCatalogOrder(req(),deps)).status,503);eq(providerBodies.length,before);configured=true;
providerFail=true;response=await handleProCatalogOrder(req(),deps);eq(response.status,502);eq((await response.json()).uncertain,true);providerFail=false;
ackFail=true;response=await handleProCatalogOrder(req(),deps);eq(response.status,502);eq((await response.json()).uncertain,true);ackFail=false;
eq((await handleProCatalogOrder(req({},'https://evil.invalid'),deps)).status,403);
console.log(`Pro-catalog mail/files: ${checks} assertions PASS, two exact attachments, confirmation reminder, authorization/revoke/retry; synthetic provider, no mail sent.`);

import assert from 'node:assert/strict';
import {confirmationMail,createConfirmationEmail} from '../supabase/functions/_shared/bolig-confirmation-email.mjs';
const id=n=>'40000000-0000-4000-8000-'+String(n).padStart(12,'0');
let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const doc={id:id(3),version:1,status:'accepted',accepted_name:'QA <script>',accepted_at:'2026-11-25T12:00:00Z',snapshot:{source:'resident',identity:{company:'QA Firma',project:'Aamodthagen <b>',unit:'H0101',address:'QA gate 7'},total_cents:25000,goods:[{key:'a',name:'Oak <script>',sku:'QA',quantity:1,unit:'stk'}],price_details:[{name:'Oak including installation',net_cents:25000}]}};
const job={id:id(1),attempt:id(2),kind:'resident',to:'qa@example.invalid',document:doc};
const mail=confirmationMail(job);eq(mail.subject.includes('H0101'),true);eq(mail.text.includes('250'),true);eq(mail.text.includes('Oak including installation'),true);eq(mail.html.includes('<script>'),false);eq(mail.html.includes('&lt;script&gt;'),true);eq(mail.html.includes('href=""'),false,'No empty or misleading portal button');eq(mail.text.includes('QA gate 7'),true);eq(mail.text.includes('utgaven er lagret og låst'),true);eq(confirmationMail({...job,kind:'manager'}).text.includes('prosjektleder'),true);
for(const change of [{to:'a\r\nb@example.invalid'},{kind:'owner'},{document:{...doc,status:'draft'}},{document:{...doc,snapshot:{...doc.snapshot,source:'shop'}}}]){assert.throws(()=>confirmationMail({...job,...change}));checks++;}
let authorized=true,valid=true,hasJob=true,delivered=false,sends=0,finished=[],keys=[],fail=false,lose=false;
const rpc=async(name,args)=>{
 if(name.endsWith('authorize'))return authorized;
 if(name.endsWith('reserve')){if(!hasJob)return null;hasJob=false;return structuredClone(job);}
 if(name.endsWith('validate'))return valid;
 if(name.endsWith('finish')){finished.push(args);if(lose){lose=false;throw Error('Lost acknowledgement');}delivered=args.p_sent;return true;}
 throw Error('Unexpected RPC');
};
const transport=async(url,opts)=>{eq(url,'https://api.resend.com/emails');keys.push(opts.headers['Idempotency-Key']);sends++;const b=JSON.parse(opts.body);eq(b.to,['qa@example.invalid']);eq(b.from,'QA <qa@example.invalid>');if(fail)throw Error('Provider timeout');return {ok:true,json:async()=>({id:'qa-provider-receipt'})};};
const handler=createConfirmationEmail({rpc,apiKey:'synthetic',from:'QA <qa@example.invalid>',fetchImpl:transport});
const req=(headers={},body='{}')=>new Request('https://qa.invalid',{method:'POST',headers:{'x-bolig-worker-token':'a'.repeat(64),...headers},body});
eq((await handler(new Request('https://qa.invalid'))).status,405);eq((await handler(req({origin:'https://qa.invalid'}))).status,403);eq((await handler(req({authorization:'Bearer synthetic'}))).status,403);eq(sends,0);
authorized=false;eq((await handler(req())).status,403);eq(sends,0);authorized=true;
eq((await handler(req({},'{"to":"attacker@example.invalid"}'))).status,400);eq(sends,0);
valid=false;eq((await handler(req())).status,200);eq(sends,0);eq(finished.at(-1).p_sent,false);valid=true;hasJob=true;
eq((await handler(req())).status,200);eq(delivered,true);eq(sends,1);eq(keys[0],'bolig-confirmation-'+job.id);
// Provider acknowledged but SQL acknowledgement lost: retry keeps the provider key.
hasJob=true;lose=true;eq((await handler(req())).status,503);hasJob=true;eq((await handler(req())).status,200);eq(new Set(keys).size,1,'All retries reuse durable delivery id');
hasJob=true;fail=true;eq((await handler(req())).status,503);eq(finished.at(-1).p_sent,false,'Provider failure is never represented as sent');
const noTransport=createConfirmationEmail({rpc,apiKey:'',from:'',fetchImpl:transport});eq((await noTransport(req())).status,503);
console.log(`PASS confirmation email: ${checks} assertions; frozen identity/items/prices, escaping, no caller recipient, server-only, paused transport, revoke-before-send, exact provider idempotency and independent acknowledgements (mock provider; no email sent).`);

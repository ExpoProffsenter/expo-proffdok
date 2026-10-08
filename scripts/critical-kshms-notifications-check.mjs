import assert from 'node:assert/strict';
import {assignmentEmail,createAssignmentMailer} from '../supabase/functions/_shared/kshms-assignment-mailer.mjs';
import {readNotificationLink} from '../src/modules/kshms/kshmsNotificationLinks.mjs';
const company=crypto.randomUUID(),object=crypto.randomUUID(),user=crypto.randomUUID();
const base={id:crypto.randomUUID(),company_id:company,deviation_id:object,object_id:object,email:'synthetic@example.invalid',app_url:'https://preview.example.com',attempt:1,title:'PRIVATE TITLE',content:{notes:'PRIVATE NOTES'},user_id:user};
for(const [kind,param] of [['deviation','kshmsDeviation'],['round','kshmsExecution'],['risk','kshmsExecution'],['sja','kshmsSja'],['reading','kshmsVersion'],['review','kshmsReview']]){
 const job={...base,notification_kind:kind,object_id:kind==='review'?company:object};
 const mail=assignmentEmail(job,'Approved sender');
 assert.deepEqual(mail.to,[base.email]);assert(mail.subject&&mail.text);
 assert(!JSON.stringify(mail).includes('PRIVATE'));assert(!mail.text.includes(user));
 const url=new URL(mail.text.match(/https:\/\/\S+/)[0]);assert.equal(url.searchParams.get('kshmsCompany'),company);assert.equal(url.searchParams.get(param),kind==='review'?company:object);assert.equal([...url.searchParams].length,2);
 if(kind!=='deviation'){
  const link=readNotificationLink(url.search,company);assert.equal(link.id,kind==='review'?company:object);assert(link.matchingCompany);
  assert.equal(readNotificationLink(url.search,crypto.randomUUID()).matchingCompany,false);
 }
}
for(const patch of [{notification_kind:'unknown'},{object_id:'invalid',notification_kind:'sja'},{app_url:'http://preview.example.com'},{app_url:'https://name:pass@preview.example.com'},{app_url:'https://preview.example.com/foreign/path'},{app_url:'https://preview.example.com/?existing=1'},{company_id:'bad'}])assert.throws(()=>assignmentEmail({...base,...patch},'Sender'));
for(const search of [`?kshmsCompany=${company}&kshmsExecution=invalid`,`?kshmsExecution=${object}`,`?kshmsCompany=${company}&kshmsSja=${object}&kshmsVersion=${object}`,`?kshmsCompany=${company}&kshmsExecution=${object}&kshmsExecution=${object}`,`?kshmsCompany=${company}&kshmsCompany=${company}&kshmsVersion=${object}`,`?kshmsCompany=${company}&kshmsReview=${object}`])assert.equal(readNotificationLink(search,company),null);
const token='a'.repeat(64),req=mode=>new Request('https://worker.invalid',{method:'POST',headers:{'x-kshms-worker-token':token,...(mode?{'x-kshms-worker-mode':mode}:{})}});
let reservations=0,sends=0;
const disabled=createAssignmentMailer({apiKey:'test',from:'sender',verifyTransport:async()=>true,rpc:async name=>{assert.equal(name,'kshms_email_worker_authorize');return {enabled:false};},fetcher:()=>{throw Error('Disabled worker sent');}});
assert.equal((await disabled(req())).status,401);assert.equal((await disabled(req('check'))).status,200);
const unconfigured=createAssignmentMailer({apiKey:'',from:'',verifyTransport:async()=>true,rpc:async name=>{if(name==='kshms_email_worker_authorize')return {enabled:true};reservations++;throw Error('Unconfigured reserve');},fetcher:()=>{throw Error('Unconfigured worker sent');}});
assert.equal((await unconfigured(req())).status,503);assert.equal((await unconfigured(req('check'))).status,503);assert.equal(reservations,0);
for(const kind of ['round','risk','sja','reading','review']){
 let offered=true,finished=false;
 const worker=createAssignmentMailer({apiKey:'test',from:'sender',verifyTransport:async()=>true,rpc:async(name,args)=>{
  if(name==='kshms_email_worker_authorize')return {enabled:true};
  if(name==='kshms_email_reserve'){if(!offered)return null;offered=false;return {...base,object_id:kind==='review'?company:object,notification_kind:kind};}
  if(name==='kshms_email_validate_attempt')return true;
  if(name==='kshms_email_finish_attempt'){assert.equal(args.p_id,base.id);assert.equal(args.p_attempt,1);assert.equal(args.p_sent,true);finished=true;return;}
  throw Error('Unexpected RPC');
 },fetcher:async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');assert.equal(options.headers['Idempotency-Key'],`kshms-assignment/${base.id}`);const body=JSON.parse(options.body);assert(!JSON.stringify(body).includes('PRIVATE'));sends++;return new Response(JSON.stringify({id:'provider-stub'}),{status:200});}});
 assert.equal((await worker(req())).status,200);assert(finished);
}
assert.equal(sends,5);
console.log('critical-kshms-notifications-check: OK — six notification kinds, protected links, minimal bodies, disabled health/no reservation, provider stub and fenced idempotency');

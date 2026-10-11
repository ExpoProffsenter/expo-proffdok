import {conversationInvitation} from './hr-conversation-invitation.mjs';
import {hrNotificationHtml} from './hr-notification-mail.mjs';
const json=(status,v)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});
const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
export function createHrFollowupReminders({rpc,apiKey,from,verifyTransport,fetchImpl=fetch}){
 return async req=>{
  if(req.method!=='POST')return json(405,{error:'method_not_allowed'});
  if(req.headers.has('origin')||req.headers.has('authorization'))return json(403,{error:'server_only'});
  const token=req.headers.get('x-hr-followup-token');if(!/^[a-f0-9]{64}$/.test(token||''))return json(403,{error:'server_only'});
  try{
   if(await rpc('hr_followup_worker_authorize',{p_token:token})!==true)return json(403,{error:'server_only'});
   if(!await verifyTransport())return json(503,{error:'transport_not_safe'});
   if(!apiKey||!from||from.length>254||/[\r\n]/.test(from))return json(503,{error:'mail_not_configured'});
   const reader=req.body?.getReader();if(!reader)return json(400,{error:'invalid_request'});let n=0,chunks=[];
   let timerId;
   const timer=new Promise((_,reject)=>{timerId=setTimeout(()=>{reader.cancel().catch(()=>{});reject(Error('body_timeout'));},5000);timerId.unref?.();});
   const consume=(async()=>{try{for(;;){const part=await reader.read();if(part.done)break;n+=part.value.length;if(n>64)throw Error('body_size');chunks.push(part.value);}return new TextDecoder('utf-8',{fatal:true}).decode(new Uint8Array(chunks.flatMap(v=>[...v])));}catch(e){await reader.cancel().catch(()=>{});throw e;}})();
   let invitation=false,reminder=false,feedback=false,testId=null;
   try{const body=JSON.parse(await Promise.race([consume,timer]));const encoded=JSON.stringify(body);if(body&&Object.keys(body).join(',')==='test'&&uuid.test(body.test||''))testId=body.test;else if(!['{}','{"invitation":true}','{"reminder":true}','{"feedback":true}'].includes(encoded))return json(400,{error:'invalid_request'});invitation=body.invitation===true;reminder=body.reminder===true;feedback=body.feedback===true;}
   catch{return json(400,{error:'invalid_request'});}finally{clearTimeout(timerId);}
   const kind=reminder?'meeting-reminder':'employee-feedback';
   const job=await rpc(testId?'hr_followup_test_reserve':invitation?'hr_conversation_invitation_reserve':reminder||feedback?'hr_conversation_mail_reserve':'hr_followup_worker_reserve',testId?{p_id:testId}:reminder||feedback?{p_kind:kind}:undefined);if(!job||job.suppressed)return json(200,{idle:true});
   if((testId&&job.id!==testId)||!uuid.test(job.id)||!uuid.test(job.attempt)||!job.to||job.to.length>254||/[\r\n]/.test(job.to))throw Error('invalid_job');
   if(Object.keys(job).sort().join(',')!==(invitation?['attempt','branding','id','location','on','time','to']:reminder?['attempt','id','on','time','to']:['attempt','id','to']).join(','))throw Error('invalid_job');
   if((invitation||reminder)&&(!/^\d{4}-\d{2}-\d{2}$/.test(job.on||'')||new Date(job.on+'T00:00:00Z').toISOString().slice(0,10)!==job.on||!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(job.time||'')))throw Error('invalid_job');
   if(invitation&&(typeof job.location!=='string'||!job.location.trim()||Array.from(job.location).length>200||/[\u0000-\u001f\u007f]/.test(job.location)))throw Error('invalid_location');
   const validation={p_id:job.id,p_attempt:job.attempt,...(invitation||reminder?{p_on:job.on,p_time:job.time}:{}),...(invitation?{p_location:job.location}:{}),...(reminder||feedback?{p_kind:kind}:{})};
   if(await rpc(invitation?'hr_conversation_invitation_validate_place':reminder||feedback?'hr_conversation_mail_validate':'hr_followup_worker_validate',validation)!==true)return json(200,{suppressed:true});
   const invitationContent=invitation?conversationInvitation(job):null;
   const html=invitation?invitationContent.html:testId?null:hrNotificationHtml({kind:feedback?'feedback':reminder?'reminder':'followup',on:job.on,time:job.time});
   const text=testId?'Dette er en test av e-postvarsling fra Expo ProffDok, sendt etter ditt ønske. Ingen faktisk medarbeidersamtale er opprettet eller endret av denne testen. Du trenger ikke gjøre noe i appen.':feedback?'Medarbeideren har delt forberedelse eller lagret en kommentar til en medarbeidersamtale. Logg inn på https://expo-proffdok.app/ og åpne HR for å lese innspillet. Kontroller at du arbeider i riktig firma. Ingen innspill eller personnavn er tatt med i denne e-posten.':reminder?`Påminnelse om medarbeidersamtale ${job.on.split('-').reverse().join('.')} kl. ${job.time} (norsk tid).\n\nDu har selv valgt denne påminnelsen. Logg inn på https://expo-proffdok.app/ og åpne HR for å se samtalen. Kontroller at du arbeider i riktig firma.`:invitation?invitationContent.text:'Du har en oppfølging i HR. Logg inn på https://expo-proffdok.app/ og åpne HR eller Min side → Mine oppfølginger. Kontroller firmaet du arbeider i.\n\nDenne meldingen inneholder ingen personlige opplysninger fra oppfølgingen. Gjennomfør oppgaven i appen eller kontakt din leder hvis noe er uklart.';
   let sent=false;
   try{const response=await fetchImpl('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{authorization:'Bearer '+apiKey,'content-type':'application/json','Idempotency-Key':'hr-followup-'+job.id},body:JSON.stringify({from,to:[job.to],subject:testId?'Expo ProffDok – test av HR-varsling':feedback?'Expo ProffDok – nytt innspill til medarbeidersamtale':reminder?'Expo ProffDok – påminnelse om medarbeidersamtale':invitation?'Expo ProffDok – invitasjon til medarbeidersamtale':'Expo ProffDok – HR-oppfølging',text,...(html?{html}:{})})});sent=response.ok;await response.body?.cancel();}catch{/* unknown provider reply retains pending, stable idempotency key */}
   const finished=await rpc('hr_followup_worker_finish',{p_id:job.id,p_attempt:job.attempt,p_sent:sent});
   return finished===true?json(sent?200:503,{sent}):json(503,{error:'result_not_confirmed'});
  }catch{return json(503,{error:'reminder_not_completed'});}
 };
}

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
   const consume=(async()=>{try{for(;;){const part=await reader.read();if(part.done)break;n+=part.value.length;if(n>32)throw Error('body_size');chunks.push(part.value);}return new TextDecoder('utf-8',{fatal:true}).decode(new Uint8Array(chunks.flatMap(v=>[...v])));}catch(e){await reader.cancel().catch(()=>{});throw e;}})();
   try{if(JSON.stringify(JSON.parse(await Promise.race([consume,timer])))!=='{}')return json(400,{error:'invalid_request'});}
   catch{return json(400,{error:'invalid_request'});}finally{clearTimeout(timerId);}
   const job=await rpc('hr_followup_worker_reserve');if(!job||job.suppressed)return json(200,{idle:true});
   if(!uuid.test(job.id)||!uuid.test(job.attempt)||!job.to||job.to.length>254||/[\r\n]/.test(job.to))throw Error('invalid_job');
   if(Object.keys(job).sort().join(',')!==['attempt','id','to'].join(','))throw Error('invalid_job');
   if(await rpc('hr_followup_worker_validate',{p_id:job.id,p_attempt:job.attempt})!==true)return json(200,{suppressed:true});
   const text='Du har en oppfølging i HR. Logg inn på https://expo-proffdok.app/ og åpne HR eller Min side → Mine oppfølginger. Kontroller firmaet du arbeider i.\n\nDenne meldingen inneholder ingen personlige opplysninger fra oppfølgingen. Gjennomfør oppgaven i appen eller kontakt din leder hvis noe er uklart.';
   let sent=false;
   try{const response=await fetchImpl('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{authorization:'Bearer '+apiKey,'content-type':'application/json','Idempotency-Key':'hr-followup-'+job.id},body:JSON.stringify({from,to:[job.to],subject:'Expo ProffDok – HR-oppfølging',text})});sent=response.ok;await response.body?.cancel();}catch{/* unknown provider reply retains pending, stable idempotency key */}
   const finished=await rpc('hr_followup_worker_finish',{p_id:job.id,p_attempt:job.attempt,p_sent:sent});
   return finished===true?json(sent?200:503,{sent}):json(503,{error:'result_not_confirmed'});
  }catch{return json(503,{error:'reminder_not_completed'});}
 };
}

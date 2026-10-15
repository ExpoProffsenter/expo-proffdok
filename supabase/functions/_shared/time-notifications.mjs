const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
export function createTimeNotifications({rpc,apiKey,from,verifyTransport,fetchImpl=fetch}){
 return async req=>{
  if(req.method!=='POST')return json(405,{error:'method_not_allowed'});
  if(req.headers.has('origin')||req.headers.has('authorization'))return json(403,{error:'server_only'});
  const token=req.headers.get('x-time-token');if(!/^[a-f0-9]{64}$/.test(token||''))return json(403,{error:'server_only'});
  try{
   if(await rpc('time_mail_authorize',{p_token:token})!==true)return json(403,{error:'server_only'});
   if(!await verifyTransport())return json(503,{error:'transport_not_safe'});
   if(!apiKey||!from||from.length>254||/[\r\n]/.test(from))return json(503,{error:'mail_not_configured'});
   if(Number(req.headers.get('content-length')||0)>16)return json(400,{error:'invalid_body'});
   const reader=req.body?.getReader();if(!reader)return json(400,{error:'invalid_body'});
   let bytes=[],length=0,timer;const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{reader.cancel().catch(()=>{});reject(Error('body_timeout'));},3000);timer.unref?.();});
   try{const read=async()=>{for(;;){const part=await reader.read();if(part.done)break;length+=part.value.length;if(length>16)throw Error('body_size');bytes.push(...part.value);}return new TextDecoder('utf-8',{fatal:true}).decode(new Uint8Array(bytes));};if((await Promise.race([read(),timeout])).trim()!=='{}')return json(400,{error:'invalid_body'});}finally{clearTimeout(timer);reader.cancel().catch(()=>{});}
   const job=await rpc('time_mail_reserve');if(!job)return json(200,{idle:true});
   if(Object.keys(job).sort().join(',')!=='attempt,id,to'||!uuid.test(job.id)||!uuid.test(job.attempt)||typeof job.to!=='string'||job.to.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(job.to))throw Error('invalid_job');
   if(await rpc('time_mail_validate',{p_id:job.id,p_attempt:job.attempt})!==true)return json(200,{suppressed:true});
   const text='Du har en oppgave knyttet til timer eller utlegg. Åpne Expo ProffDok og velg Min side → Mine timer, eller HR → Timer og utlegg. Kontroller at du arbeider i riktig firma.\n\nIngen personnavn, fravær, beløp eller kvitteringer er tatt med i denne e-posten.';
   const html='<html lang="nb"><body style="margin:0;background:#eef4f6;font-family:Arial,sans-serif"><table role="presentation" width="100%"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="560" style="max-width:100%;background:white;border-radius:12px"><tr><td style="padding:24px;background:#075961;color:white;font-size:24px;font-weight:bold">Expo ProffDok</td></tr><tr><td style="padding:28px;color:#18383f"><h1 style="font-size:22px">Timer og utlegg venter på oppfølging</h1><p style="line-height:1.7">Du har en oppgave knyttet til timer eller utlegg. Åpne <strong>Min side → Mine timer</strong>, eller <strong>HR → Timer og utlegg</strong>. Kontroller firmaet du arbeider i.</p><p><a href="https://expo-proffdok.app/" style="display:inline-block;padding:14px 20px;background:#007f89;color:white;text-decoration:none;border-radius:8px">Åpne Expo ProffDok</a></p><p style="font-size:12px;color:#526772;line-height:1.6">Ingen personnavn, fravær, beløp eller kvitteringer er tatt med i denne e-posten.</p></td></tr></table></td></tr></table></body></html>';
   let providerId=null;
   try{const response=await fetchImpl('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{authorization:'Bearer '+apiKey,'content-type':'application/json','Idempotency-Key':'time-notice-'+job.id},body:JSON.stringify({from,to:[job.to],subject:'Expo ProffDok – timer og utlegg',text,html})});const result=await response.json().catch(()=>null);if(response.ok&&typeof result?.id==='string'&&result.id.length<=150)providerId=result.id;}catch{/* Unknown replies never report delivery; stable provider idempotency key on retry. */}
   const finished=await rpc('time_mail_finish',{p_id:job.id,p_attempt:job.attempt,p_provider_id:providerId});
   if(!finished)return json(503,{error:'result_not_confirmed'});return json(providerId?200:503,{sent:Boolean(providerId)});
  }catch{return json(503,{error:'time_notification_not_completed'});}
 };
}

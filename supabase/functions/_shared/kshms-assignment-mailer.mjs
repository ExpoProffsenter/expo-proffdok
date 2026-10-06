const reply=(status,value)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function assignmentEmail(job,from) {
 const url=new URL(job.app_url);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||!uuid.test(job.company_id)||!uuid.test(job.deviation_id))throw new Error('invalid_delivery_configuration');
 url.searchParams.set('kshmsDeviation',job.deviation_id);url.searchParams.set('kshmsCompany',job.company_id);
 // No title, description, images, personal case notes or identity in the email.
 const text=`Du er valgt som ansvarlig for et avvik i KS/HMS.\n\nÅpne saken i ProffDok og dokumenter tiltak og egen kontroll. Oppgaven står i appen til lukkingen er lagret.\n\n${url.href}\n\nDu må være logget inn med tilgang i riktig firma for å åpne saken.`;
 return {from,to:[job.email],subject:'Du har fått ansvar for et KS/HMS-avvik',text};
}
export function createAssignmentMailer({rpc,apiKey,from,verifyTransport=async()=>false,fetcher=fetch,now=()=>Date.now()}) {
 return async req=>{
  if(req.method!=='POST')return reply(405,{error:'method_not_allowed'});
  const token=req.headers.get('x-kshms-worker-token')||'';
  if(!/^[0-9a-f]{64}$/.test(token))return reply(401,{error:'unauthorized'});
  try{
   const authorized=await rpc('kshms_email_worker_authorize',{p_token:token});
   if(!authorized?.enabled)return reply(401,{error:'unauthorized'});
   const transportSafe=await verifyTransport();
   const configuration={api_key_configured:Boolean(apiKey),sender_configured:Boolean(from),transport_safe:transportSafe};
   if(req.headers.get('x-kshms-worker-mode')==='check')return reply(apiKey&&from&&transportSafe?200:503,{configured:Boolean(apiKey&&from&&transportSafe),...configuration});
   if(!transportSafe)return reply(503,{error:'transport_exposure_not_verified'});
   if(!apiKey||!from)return reply(503,{error:'delivery_not_configured'});
   const counts={accepted:0,retry:0,suppressed:0},started=now();
   for(let i=0;i<20&&now()-started<40000;i++){
    const job=await rpc('kshms_email_reserve');if(!job)break;
    if(!await rpc('kshms_email_validate_attempt',{p_id:job.id,p_attempt:job.attempt})){counts.suppressed++;continue;}
    let sent=false;
    try{
     const body=assignmentEmail(job,from);
     const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json','Idempotency-Key':`kshms-assignment/${job.id}`},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
     if(response.ok){const result=await response.json();sent=typeof result.id==='string'&&Boolean(result.id);}
    }catch{/* Do not log recipients, response bodies, tokens or case content. */}
    await rpc('kshms_email_finish_attempt',{p_id:job.id,p_attempt:job.attempt,p_sent:sent});counts[sent?'accepted':'retry']++;
   }
   return reply(200,counts);
  }catch{return reply(503,{error:'worker_unavailable'});}
 };
}

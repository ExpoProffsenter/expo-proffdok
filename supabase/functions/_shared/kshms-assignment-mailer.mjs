const reply=(status,value)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function assignmentEmail(job,from) {
 const url=new URL(job.app_url);
 const kind=job.notification_kind||'deviation',id=kind==='deviation'?job.deviation_id:job.object_id;
 const messages={
  deviation:['kshmsDeviation','Du har fått ansvar for et KS/HMS-avvik','Du er valgt som ansvarlig for et avvik i KS/HMS.','Åpne saken i ProffDok og dokumenter tiltak og egen kontroll. Oppgaven står i appen til lukkingen er lagret.'],
  round:['kshmsExecution','Du har fått ansvar for en vernerunde / kontroll','Du er valgt som ansvarlig for en vernerunde eller kontroll i KS/HMS.','Åpne gjennomføringen i ProffDok, dokumenter kontrollen og bekreft egen gjennomgang før fullføring.'],
  risk:['kshmsExecution','Du har fått ansvar for en risikovurdering','Du er valgt som ansvarlig for en risikovurdering i KS/HMS.','Åpne vurderingen i ProffDok, dokumenter risiko og oppfølging og bekreft egen gjennomgang før fullføring.'],
  sja:['kshmsSja','Du har fått ansvar for en SJA','Du er valgt som ansvarlig prosjektleder for en SJA i KS/HMS.','Åpne KS/HMS → SJA i ProffDok. Gå gjennom analysen med deltakerne og signer din egen gjennomgang når dokumentasjonen er ferdig.'],
  reading:['kshmsVersion','Du har fått en KS/HMS-rutine å lese og bekrefte','En godkjent rutineutgave er tildelt deg for egen gjennomgang.','Åpne KS/HMS → Les og bekreft i ProffDok, les utgaven og bekreft egen gjennomgang.'],
  review:['kshmsReview','KS/HMS-håndboken har passert datoen for revisjon','Du er utpekt som ansvarlig for revisjon av KS/HMS-håndboken. Datoen for neste kontroll er passert.','Åpne KS/HMS → Oppfølging og revisjon i ProffDok. Kontroller håndboken og signer revisjonen når gjennomgangen er utført.']
 };
 const phase=job.notification_phase||'assignment';
 if(!['assignment','reminder'].includes(phase))throw new Error('invalid_delivery_configuration');
 const reminderSubjects={deviation:'Påminnelse: fristen for et KS/HMS-avvik er passert',review:'Påminnelse: KS/HMS-håndboken må revideres',round:'Påminnelse: fullfør din vernerunde / kontroll',risk:'Påminnelse: fullfør din risikovurdering',sja:'Påminnelse: din SJA mangler egen signering',reading:'Påminnelse: les og bekreft din tildelte KS/HMS-rutine'};
 const initial=Object.hasOwn(messages,kind)?messages[kind]:null;
 const message=phase==='reminder'&&initial
  ?kind==='deviation'?['kshmsDeviation',reminderSubjects.deviation,'Du har en åpen KS/HMS-oppgave med passert frist.','Åpne saken i ProffDok, dokumenter tiltak og egen kontroll, og lagre lukkingen når arbeidet er utført.']
   :[initial[0],reminderSubjects[kind],kind==='review'?initial[2]:'Du har en tildelt KS/HMS-oppgave som fortsatt mangler din egen gjennomgang.',initial[3]]
  :initial;
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash||!uuid.test(job.company_id)||!uuid.test(id)||!message)throw new Error('invalid_delivery_configuration');
 url.searchParams.set(message[0],id);url.searchParams.set('kshmsCompany',job.company_id);
 // No title, description, images, personal case notes or identity in the email.
 const text=`${message[2]}\n\n${message[3]}\n\n${url.href}\n\nDu må være logget inn med tilgang i riktig firma for å åpne saken.`;
 return {from,to:[job.email],subject:message[1],text};
}
export function createAssignmentMailer({rpc,apiKey,from,verifyTransport=async()=>false,fetcher=fetch,now=()=>Date.now()}) {
 return async req=>{
  if(req.method!=='POST')return reply(405,{error:'method_not_allowed'});
  const token=req.headers.get('x-kshms-worker-token')||'';
  if(!/^[0-9a-f]{64}$/.test(token))return reply(401,{error:'unauthorized'});
  try{
   const authorized=await rpc('kshms_email_worker_authorize',{p_token:token});
   if(!authorized||typeof authorized.enabled!=='boolean')return reply(401,{error:'unauthorized'});
   const checking=req.headers.get('x-kshms-worker-mode')==='check';
   if(!checking&&!authorized.enabled)return reply(401,{error:'unauthorized'});
   const transportSafe=await verifyTransport();
   const configuration={api_key_configured:Boolean(apiKey),sender_configured:Boolean(from),transport_safe:transportSafe};
   if(checking)return reply(apiKey&&from&&transportSafe?200:503,{configured:Boolean(apiKey&&from&&transportSafe),...configuration});
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

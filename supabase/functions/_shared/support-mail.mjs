const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const mailbox=value=>{
 const raw=String(value||'').trim();const address=raw.match(/^[^<>\r\n]*<([^<>]+)>$/)?.[1]||raw;
 if(address.length>254||! /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(address))throw Error('Invalid mailbox');
 return address.toLowerCase();
};
export function supportConfig(env){
 const mode=env('SUPPORT_MAIL_MODE')||'disabled';
 const project=new URL(env('SUPABASE_URL')).hostname.split('.')[0];
 const environment=project==='dqffxflaoyarbxyiyhop'?'production':'sandbox';
 // A sandbox can never enter production mode, even through a mistaken secret.
 if(mode!=='disabled'&&mode!==(environment==='production'?'production':'sandbox-test'))throw Error('Invalid support environment');
 const base=new URL(env('SUPPORT_APP_URL')||'https://expo-proffdok.app');
 if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw Error('Invalid app URL');
 if(environment==='sandbox'&&base.hostname==='expo-proffdok.app'&&mode!=='disabled')throw Error('Sandbox URL required');
 const replyDomain=String(env('SUPPORT_REPLY_DOMAIN')||'').trim().toLowerCase();
 if(replyDomain&&!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(replyDomain))throw Error('Invalid reply domain');
 return {mode,environment,base:base.origin,replyDomain,replies:!!replyDomain&&env('SUPPORT_INBOUND_ENABLED')==='true',
 from:mode==='disabled'?'':mailbox(env('SUPPORT_FROM_EMAIL')||env('CHAT_FROM_EMAIL')),
 internal:mode==='disabled'?'':mailbox(env('SUPPORT_INTERNAL_TO')),
 test:mode==='sandbox-test'?mailbox(env('SUPPORT_TEST_TO')):''};
}
export function supportMail(job,config){
 const user=job.audience==='user';
 const url=new URL(config.base);url.searchParams.set('supportCase',job.ticket_id);if(!user)url.searchParams.set('supportInbox','1');
 const heading=user?`Svar på supportsak #${job.number}`:`Ny aktivitet i supportsak #${job.number}`;
 const message=user?job.body:'En bruker har sendt en henvendelse. Åpne saken i ProffDok for å lese og svare.';
 const replyText=user?(config.replies?'Du kan svare på denne e-posten eller åpne saken i appen.':'Åpne saken i appen for å svare. Direkte e-postsvar er ikke aktivert.'):'Les og svar i Systemadmin → Support.';
 const rfcMessageId=`<support-${job.id}@${config.from.split('@')[1]}>`;
 const refs=String(job.references||'').match(/<[^<>\s\r\n]+>/g)?.slice(-15)||[];
 const body={from:`ProffDok Support <${config.from}>`,to:[config.mode==='sandbox-test'?config.test:(user?mailbox(job.email):config.internal)],
 subject:`${heading}${user?' – '+job.subject:''}`.replace(/[\r\n]/g,' ').slice(0,240),
 headers:{'Message-ID':rfcMessageId,'Auto-Submitted':'auto-generated','X-Auto-Response-Suppress':'All',...(refs.length?{'In-Reply-To':refs.at(-1),References:refs.join(' ')}:{})},
 ...(user&&config.replies?{reply_to:`support+${job.reply_token}@${config.replyDomain}`}:{})};
 // Even configuration mistakes must fail closed before private addresses reach a user.
 if(config.from===config.internal||body.reply_to?.toLowerCase().includes(config.internal))throw Error('Private recipient exposed');
 body.text=[heading,user?job.subject:'',message,'',replyText,`Åpne supportsak: ${url.href}`,'','--- Svar over denne linjen ---','Expo ProffDok'].filter(Boolean).join('\n');
 body.html=`<!doctype html><html lang="nb"><head><meta charset="utf-8"></head><body style="margin:0;background:#51585a;font-family:Arial,Helvetica,sans-serif;color:#dbe7f0"><table role="presentation" width="100%"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:680px;background:#242424;border:1px solid #71838a;border-radius:18px"><tr><td style="padding:24px;border-bottom:1px solid #71838a"><img src="${escape(config.base)}/expo-logo.png" alt="Expo" width="100" style="background:white;border-radius:8px;padding:6px"><span style="display:block;font-size:25px;font-weight:bold;color:#08d5d8;margin-top:12px">ProffDok Support</span></td></tr><tr><td style="padding:26px"><h1 style="font-size:23px;color:#ffffff">${escape(heading)}</h1>${user?`<p style="color:#cbd5e1">${escape(job.subject)}</p>`:''}<div style="white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;padding:20px;background:#163f43;border-radius:12px;color:#ffffff">${escape(message)}</div><p style="line-height:1.6;color:#cbd5e1">${escape(replyText)}</p><p style="margin:26px 0"><a href="${escape(url.href)}" style="display:inline-block;background:#08b9c3;border-radius:9px;padding:14px 20px;color:#071d20;font-weight:bold;text-decoration:none">Åpne supportsak</a></p><p style="color:#aebbc7;font-size:12px">--- Svar over denne linjen ---<br>Expo ProffDok · Support #${escape(job.number)}</p></td></tr></table></td></tr></table></body></html>`;
 return {body,rfcMessageId};
}
export async function dispatchSupport(id,deps){
 const config=supportConfig(deps.env);
 if(config.mode==='disabled')return {state:'disabled'};
 if(!deps.env('RESEND_API_KEY'))return {state:'not_configured'};
 const db=deps.adminClient();const {data:job,error}=await db.rpc('support_mail_claim',{p_id:id});
 if(error)throw Error('Queue unavailable');if(!job)return {state:'unchanged'};
 let state='uncertain',providerId=null,rfcMessageId=null;
 try{
  const mail=supportMail(job,config);rfcMessageId=mail.rfcMessageId;
  const res=await deps.fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),
   headers:{Authorization:`Bearer ${deps.env('RESEND_API_KEY')}`,'Content-Type':'application/json','Idempotency-Key':`support/${job.id}`},body:JSON.stringify(mail.body)});
  const result=await res.json().catch(()=>null);
  if(res.ok&&typeof result?.id==='string'&&result.id.length<=150&&result.id.length){state='accepted';providerId=result.id;}
  else state=res.status>=400&&res.status<500&&res.status!==409?'failed':'uncertain';
 }catch{/* Raw provider/configuration errors can contain private addresses. Never return them. */}
 const {error:finishError}=await db.rpc('support_mail_finish',{p_id:id,p_lease_id:job.lease_id,p_state:state,p_provider_id:providerId,p_rfc_message_id:rfcMessageId});
 return {state:finishError?'uncertain':state};
}
export async function handleSupportMail(req,deps){
 const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
 const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(req.method==='OPTIONS')return response({ok:true});if(req.method!=='POST')return response({error:'Bare POST er tillatt.'},405);
 try{
  const worker=req.headers.get('x-support-worker-token');
  if(worker){
   const secret=deps.env('SUPPORT_WORKER_SECRET');
   const equal=(a,b)=>{let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;};
   // Scheduled invocations use an isolated Vault token. A separately configured
   // worker secret remains supported; a bad explicit secret never falls back.
   let authorized=false;
   if(secret){authorized=secret.length>=32&&equal(secret,worker);}
   else if(worker.length>=32&&worker.length<=256){
    const {data:valid,error:authError}=await deps.adminClient().rpc('support_worker_authorize',{p_token:worker});
    authorized=!authError&&valid===true;
   }
   if(!authorized)return response({error:'Invalid worker authentication'},401);
   if(supportConfig(deps.env).mode==='disabled')return response({ok:true,state:'disabled'});
   const {data:ids,error:queueError}=await deps.adminClient().rpc('support_mail_pending');if(queueError)throw Error('Queue unavailable');
   const states=[];for(const id of (ids||[]).slice(0,5))states.push((await dispatchSupport(id,deps)).state);
   return response({ok:true,processed:states.length});
  }
  const client=deps.userClient(req.headers.get('Authorization')||'');const {data,error}=await client.auth.getUser();
  if(error||!data?.user)return response({error:'Logg inn for å bruke support.'},401);
  const raw=await req.text();if(raw.length>2000)return response({error:'Ugyldig forespørsel.'},413);
  const input=JSON.parse(raw);
  if(input.action==='status'){
   const {error:accessError}=await client.rpc('support_context');if(accessError)return response({error:'Support er ikke tilgjengelig.'},403);
   const c=supportConfig(deps.env);return response({ok:true,emailRepliesEnabled:c.replies&&c.mode!=='disabled',mailEnabled:c.mode!=='disabled'});
  }
  const {data:id,error:accessError}=await client.rpc('support_delivery_authorize',{p_company_id:input.companyId,p_message_id:input.messageId,p_admin:input.admin===true});
  if(accessError||!id)return response({error:'Meldingen er ikke tilgjengelig for utsending.'},403);
  return response({ok:true,...await dispatchSupport(id,deps)});
 }catch{return response({error:'Meldingen er lagret. E-poststatus kunne ikke bekreftes. Prøv igjen.'},503);}
}

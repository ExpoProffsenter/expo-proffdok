import {mailbox,supportConfig,dispatchSupport} from './support-mail.mjs';
// Standard Webhooks/Svix signature: HMAC-SHA256 over id.timestamp.raw-body.
export async function verifySupportWebhook(raw,headers,secret,now=Date.now()){
 const id=headers.get('svix-id'),timestamp=headers.get('svix-timestamp'),signature=headers.get('svix-signature');
 if(!id||!/^\d+$/.test(timestamp||'')||Math.abs(now/1000-Number(timestamp))>300||!signature||!secret.startsWith('whsec_'))throw Error('Invalid signature');
 const key=await crypto.subtle.importKey('raw',Uint8Array.from(atob(secret.slice(6)),c=>c.charCodeAt(0)),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 let valid=false;
 for(const part of signature.split(' ')){
  const [version,value]=part.split(',');if(version!=='v1'||!value)continue;
  try{if(await crypto.subtle.verify('HMAC',key,Uint8Array.from(atob(value),c=>c.charCodeAt(0)),new TextEncoder().encode(`${id}.${timestamp}.${raw}`)))valid=true;}catch{}
 }
 if(!valid)throw Error('Invalid signature');return JSON.parse(raw);
}
export function inboundSupportMessage(email,domain){
 const headers=Object.fromEntries(Object.entries(email.headers||{}).map(([k,v])=>[k.toLowerCase(),String(v)]));
 if(headers['auto-submitted']&&headers['auto-submitted'].toLowerCase()!=='no'||/bulk|junk|list/i.test(headers.precedence||'')||headers['x-autoreply']||headers['x-autorespond']||headers['list-id'])return null;
 // Use the provider's evaluated authentication object, never user-supplied Authentication-Results.
 const auth=email.authentication;
 if(!(auth?.dmarc==='pass'||auth?.dmarc==='gray'&&(auth?.dkim==='pass'||auth?.spf==='pass')))return null;
 const sender=mailbox(email.from);
 if(/^(mailer-daemon|postmaster|no-?reply)@/i.test(sender))return null;
 const tokens=(email.to||[]).map(v=>{try{const a=mailbox(v);const match=a.match(/^support\+([a-f0-9]{32})@(.+)$/);return match?.[2]===domain?match[1]:null;}catch{return null;}}).filter(Boolean);
 if(new Set(tokens).size!==1)return null;
 let text=String(email.text||'');
 // Never render arbitrary incoming HTML. HTML-only mail becomes plain text.
 if(!text&&email.html&&!email.html.startsWith('data:'))text=String(email.html).replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<br\s*\/?\s*>|<\/(p|div|li)>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
 text=text.split(/(?:^|\n).*--- Svar over denne linjen ---/)[0].trim();
 // Quoted original mail is not a new support message.
 text=text.split(/\n(?:On .+wrote:|Den .+skrev.+:|Fra: .+@)/i)[0].split('\n').filter(line=>!/^\s*>/.test(line)).join('\n').trim();
 if(!text||text.length>12000||!email.message_id||email.message_id.length>998)return null;
 return {p_provider_id:email.id,p_message_id:email.message_id,p_token:tokens[0],p_sender:sender,p_body:text,p_references:(headers.references||'').slice(-4000)};
}
export async function handleSupportInbound(req,deps){
 const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(req.method!=='POST')return response({error:'Method not allowed'},405);
 try{
  const config=supportConfig(deps.env);
  if(!config.replies||config.mode==='disabled'||!deps.env('SUPPORT_WEBHOOK_SECRET'))return response({error:'Receiving unavailable'},503);
  if(Number(req.headers.get('content-length'))>100000)return response({error:'Too large'},413);
  const raw=await req.text();if(raw.length>100000)return response({error:'Too large'},413);
  let event;try{event=await verifySupportWebhook(raw,req.headers,deps.env('SUPPORT_WEBHOOK_SECRET'));}catch{return response({error:'Invalid signature'},401);}
  if(event.type!=='email.received')return response({ok:true});
  const id=event.data?.email_id;if(!/^[a-f0-9-]{36}$/i.test(id||''))return response({ok:true});
  const res=await deps.fetch(`https://api.resend.com/emails/receiving/${id}?html_format=cid`,{redirect:'error',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${deps.env('RESEND_RECEIVING_API_KEY')||deps.env('RESEND_API_KEY')}`}});
  if(!res.ok)return response({error:'Temporary provider failure'},503);
  const providerBody=await res.text();if(providerBody.length>500000)return response({ok:true});
  const email=JSON.parse(providerBody);if(email.id!==id)return response({error:'Provider mismatch'},503);
  const input=inboundSupportMessage(email,config.replyDomain);if(!input)return response({ok:true});
  // Sandbox only accepts its explicitly configured test mailbox.
  if(config.mode==='sandbox-test'&&input.p_sender!==config.test)return response({ok:true});
  const {data:queueId,error}=await deps.adminClient().rpc('support_inbound_store',input);
  if(error)return response({error:'Temporary storage failure'},503);
  if(queueId){try{await dispatchSupport(queueId,deps);}catch{/* Durable queue remains available to admin retry. */}}
  return response({ok:true});
 }catch{return response({error:'Temporary receiving failure'},503);}
}

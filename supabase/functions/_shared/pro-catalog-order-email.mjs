import {supplierOrderFrom,supplierOrderLogo} from './supplier-order-email.mjs';
import {proCatalogOrderAttachments,requestedDelivery} from './pro-catalog-order-files.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const b64=bytes=>{let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s);};
export function proCatalogOrderMail(o){
 const details=[['Bestillingsnummer',o.order_number],['Kunde',o.company.companyName],['Referanse',o.reference||'Ikke oppgitt'],['Leveringsadresse',o.address],['Ønsket levering',requestedDelivery(o)],['Merknad',o.note||'Ingen']];
 const reminder=`Send ordrebekreftelse med bekreftet leveringstidspunkt til ${o.replyTo}. Ønsket leveringstidspunkt er ikke en bekreftet leveringsavtale.`;
 const sender=[o.company.companyName,o.company.orgNumber&&`Org.nr. ${o.company.orgNumber}`,o.company.address,o.company.phone,o.company.email,o.company.website].filter(Boolean);
 const confirmationLink='mailto:'+encodeURIComponent(o.replyTo).replace('%40','@');
 const html=`<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#51585a;font-family:Arial,Helvetica,sans-serif;color:#dbe7f0;">
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#51585a;"><tr><td align="center" style="padding:24px 12px;">
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:900px;background:#242424;border:1px solid #dbe7f0;border-radius:18px;">
 <tr><td style="padding:24px;border-bottom:1px solid #dbe7f0;"><table role="presentation" width="100%"><tr><td style="font-size:28px;line-height:1.2;font-weight:900;color:#ffffff;"><span style="color:#08b9c3;">EXPO</span><br>ProffDok</td><td align="right"><img src="${esc(supplierOrderLogo(o.company))}" alt="${esc(o.company.companyName)}" width="150" style="max-width:100%;max-height:90px;height:auto;background:#ffffff;padding:4px;border:0;object-fit:contain;"></td></tr></table></td></tr>
 <tr><td style="padding:28px 24px;">
 <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#dbe7f0;">Varebestilling</h1>
 <p style="font-size:16px;line-height:1.6;color:#cbd5e1;">Varebestilling fra <strong>${esc(o.company.companyName)}</strong> til ${esc(o.recipient_name)}.</p>
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#163f43;border:1px solid #08b9c3;border-radius:14px;"><tr><td style="padding:18px;color:#ffffff;">
 <p style="margin:0 0 8px;font-size:17px;font-weight:bold;">Husk å sende ordrebekreftelse</p>
 <a href="${esc(confirmationLink)}" style="font-size:19px;font-weight:bold;color:#08d5d8;overflow-wrap:anywhere;">${esc(o.replyTo)}</a>
 <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#dbe7f0;">${esc(reminder)}</p>
 </td></tr></table>
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#5a5d60;border:1px solid #dbe7f0;border-radius:14px;margin:20px 0;">${details.map(([k,v])=>`<tr><td style="padding:9px 14px;color:#cbd5e1;font-size:14px;vertical-align:top;width:35%;overflow-wrap:anywhere;">${k}</td><td style="padding:9px 14px;color:#ffffff;font-size:15px;font-weight:bold;white-space:pre-wrap;overflow-wrap:anywhere;">${esc(v)}</td></tr>`).join('')}</table>
 <h2 style="margin:24px 0 12px;font-size:18px;color:#dbe7f0;">Varer i bestillingen</h2>
 <table width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:collapse;font-size:14px;"><thead><tr>${['Leverandør / fagområde','Varenummer','Vare','Antall'].map((v,i)=>`<th scope="col" style="text-align:${i===3?'right':'left'};padding:12px 6px;background:#163f43;color:#ffffff;overflow-wrap:anywhere;">${v}</th>`).join('')}</tr></thead><tbody>${o.goods.map(g=>`<tr>${[g.supplier,g.sku,g.name,g.quantity].map((v,i)=>`<td style="padding:12px 6px;border-bottom:1px solid #75868b;color:#ffffff;vertical-align:top;overflow-wrap:anywhere;${i===3?'text-align:right;white-space:nowrap;':''}">${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>
 <p style="font-size:14px;line-height:1.6;color:#cbd5e1;">Vedlagt: Cordel ASCII og Excel-kontrollfil med identiske varer og antall.</p>
 <hr style="border:0;border-top:1px solid #dbe7f0;margin:28px 0;">
 <p style="margin:0 0 10px;color:#cbd5e1;">Med vennlig hilsen</p><p style="margin:0;font-size:15px;line-height:1.6;color:#dbe7f0;">${sender.map(esc).join('<br>')}</p>
 <p style="font-size:14px;line-height:1.6;color:#cbd5e1;"><strong>Ordrebekreftelse:</strong> <a href="${esc(confirmationLink)}" style="color:#08d5d8;">${esc(o.replyTo)}</a></p>
 <p style="font-size:12px;line-height:1.5;color:#aebbc7;">Bestillings-ID: ${esc(o.order_number)}<br>Sendt gjennom Expo ProffDok på vegne av ${esc(o.company.companyName)}.</p>
 </td></tr></table></td></tr></table></body></html>`;
 return {to:[o.to],reply_to:o.replyTo,subject:`Varebestilling – ${o.company.companyName} – ${o.reference||o.order_number}`.replace(/[\r\n]/g,' ').slice(0,240),html,text:[`Varebestilling fra ${o.company.companyName}`,reminder,...details.map(([k,v])=>`${k}: ${v}`),...o.goods.map(g=>`${g.supplier} | ${g.sku} | ${g.name} | ${g.quantity}`),'Vedlagt: Cordel ASCII og Excel.'].join('\n')};
}
export async function handleProCatalogOrder(req,deps){
 const origin=req.headers.get('Origin')||'';
 const allowed=!origin||/^https:\/\/(?:www\.)?expo-proffdok\.app$/.test(origin)||/^https:\/\/expo-proffdok-[a-z0-9-]+-ringside\.vercel\.app$/.test(origin);
 const headers={'Access-Control-Allow-Origin':allowed?origin:'null','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Vary':'Origin'};
 const response=(b,s=200)=>new Response(JSON.stringify(b),{status:s,headers});let begun=false;
 if(!allowed)return response({error:'Ugyldig opprinnelse.',uncertain:false},403);
 if(req.method==='OPTIONS')return response({ok:true});
 if(req.method!=='POST')return response({error:'Bare POST er tillatt.',uncertain:false},405);
 try{
  const client=deps.userClient(req.headers.get('Authorization')||'');const {data:auth,error:authError}=await client.auth.getUser();
  if(authError||!auth?.user)return response({error:'Logg inn før du bestiller.',uncertain:false},401);
  const raw=await req.text();if(raw.length>40000)return response({error:'For stor bestilling.',uncertain:false},413);const b=JSON.parse(raw);
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if(!uuid.test(b?.companyId||'')||!uuid.test(b?.requestId||'')||!b?.order||typeof b.order!=='object'||Array.isArray(b.order))return response({error:'Bestillingen mangler gyldig firma eller bestillings-ID.',uncertain:false},400);
  const args={p_company_id:b.companyId,p_request_id:b.requestId,p_order:b.order};
  const {data:prepared,error}=await client.rpc('pro_catalog_order_prepare',args);
  if(error)return response({error:error.message,uncertain:false},error.code==='42501'?403:409);
  if(prepared.sent)return response({ok:true,alreadySent:true});
  const key=deps.env('RESEND_API_KEY'),from=deps.env('CHAT_FROM_EMAIL');
  if(!key||!from)return response({error:'E-posttjenesten er ikke konfigurert.',uncertain:false},503);
  const attachments=proCatalogOrderAttachments(prepared.snapshot).map(f=>({filename:f.filename,content_type:f.mime,content:b64(f.bytes)}));
  const mail=proCatalogOrderMail(prepared.snapshot);
  const {data:claim,error:claimError}=await client.rpc('pro_catalog_order_begin',args);
  if(claimError)return response({error:claimError.message,uncertain:false},claimError.code==='42501'?403:409);
  if(claim.sent)return response({ok:true,alreadySent:true});
  begun=true;
  const r=await deps.fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`pro-catalog-order/${prepared.id}`},body:JSON.stringify({from:supplierOrderFrom(from,prepared.snapshot.company.companyName),...mail,attachments})});
  const receipt=await r.json().catch(()=>null);
  if(!r.ok||!receipt?.id||typeof receipt.id!=='string'||receipt.id.length>150)return response({error:'Sendingen kunne ikke bekreftes. Prøv samme sending igjen.',uncertain:true},502);
  const {error:ack}=await deps.adminClient().rpc('pro_catalog_order_complete',{p_request_id:prepared.id,p_provider_id:receipt.id});
  if(ack)return response({error:'E-posttjenesten har mottatt bestillingen. Prøv samme sending igjen for å hente kvittering.',uncertain:true},502);
  return response({ok:true});
 }catch(e){return response({error:begun?'Sendingen må avklares. Prøv samme sending igjen.':(e.message||'Bestillingen kunne ikke behandles.'),uncertain:begun},begun?502:400);}
}

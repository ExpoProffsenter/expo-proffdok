import {supplierOrderFrom,supplierOrderLogo} from './supplier-order-email.mjs';
import {proCatalogOrderAttachments,requestedDelivery} from './pro-catalog-order-files.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const b64=bytes=>{let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s);};
export function proCatalogOrderMail(o){
 const details=[['Bestillingsnummer',o.order_number],['Kunde',o.company.companyName],['Referanse',o.reference||'Ikke oppgitt'],['Leveringsadresse',o.address],['Ønsket levering',requestedDelivery(o)],['Merknad',o.note||'Ingen']];
 const reminder=`Send ordrebekreftelse med bekreftet leveringstidspunkt til ${o.replyTo}. Ønsket leveringstidspunkt er ikke en bekreftet leveringsavtale.`;
 const html=`<!doctype html><html lang="nb"><body style="margin:0;padding:24px;background:#51585a;font-family:Arial,sans-serif;color:#dbe7f0"><table role="presentation" style="width:100%;max-width:900px;margin:auto;background:#242424;border:1px solid #dbe7f0;border-radius:18px"><tr><td style="padding:24px"><table role="presentation" width="100%"><tr><td style="font-size:26px;font-weight:bold;color:#08b9c3">EXPO<br>ProffDok</td><td align="right"><img alt="${esc(o.company.companyName)}" src="${esc(supplierOrderLogo(o.company))}" width="140" style="max-height:90px;object-fit:contain;background:white"></td></tr></table><h1 style="color:white">Varebestilling fra ${esc(o.company.companyName)}</h1><p>Til ${esc(o.recipient_name)}</p><div style="padding:18px;background:#163f43;border:2px solid #08b9c3;border-radius:12px"><strong style="color:white">Husk å sende ordrebekreftelse</strong><p>${esc(reminder)}</p><a style="color:#08d5d8" href="mailto:${esc(o.replyTo)}">${esc(o.replyTo)}</a></div><table width="100%">${details.map(([k,v])=>`<tr><th style="text-align:left;padding:10px;vertical-align:top">${k}</th><td style="padding:10px;white-space:pre-wrap">${esc(v)}</td></tr>`).join('')}</table><table width="100%" style="border-collapse:collapse"><thead><tr>${['Leverandør / fagområde','Varenummer','Vare','Antall'].map(v=>`<th style="text-align:left;padding:10px;background:#163f43">${v}</th>`).join('')}</tr></thead><tbody>${o.goods.map(g=>`<tr>${[g.supplier,g.sku,g.name,g.quantity].map(v=>`<td style="padding:10px;border-bottom:1px solid #75868b;color:white">${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table><p>Vedlagt: Cordel ASCII og Excel-kontrollfil med identiske varer og antall.</p><p>Med vennlig hilsen<br><strong>${esc(o.company.companyName)}</strong><br>${[o.company.orgNumber,o.company.address,o.company.phone,o.company.email].filter(Boolean).map(esc).join('<br>')}</p></td></tr></table></body></html>`;
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

import {supplierOrderFrom} from './supplier-order-email.mjs';
import {boligOrderAttachments} from './bolig-order-attachments.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const base64=bytes=>{let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s);};
export function boligOrderMail(order){
 const i=order.identity||{},c=order.company;
 const detail=[['Prosjekt',[i.project,i.project_reference].filter(Boolean).join(' · ')],['Bygg / oppgang',[i.block,i.address].filter(Boolean).join(' · ')],['Leilighet',[i.number,i.official_number&&`Offisielt ${i.official_number}`].filter(Boolean).join(' · ')],['Vårt ordrenummer',order.reference],['Leverandørordrenummer',order.supplier_reference||'Ikke oppgitt'],['Leveringsadresse',order.address],['Ønsket leveringsdato',order.requested_date||'Avtales'],['Leveringsmåte',order.delivery_mode==='partial'?'Dellevering tillatt':'Samlet levering'],['Leveringsmerknad',order.delivery_note]];
 let logo='/expo-logo.png';const name=String(c.companyName||'').toLowerCase();
 if(String(c.orgNumber||'').replace(/\D/g,'')==='915407692'||name.includes('ringside'))logo='/brands/ringside-rorleggerbedrift.png';else if(name.includes('bademiljø expo'))logo='/brands/bademiljo-expo-ringside.png';else if(c.logoUrl)logo=c.logoUrl;
 try{const u=new URL(logo,'https://expo-proffdok.app');logo=u.protocol==='https:'&&!u.username&&!u.password?u.href:'https://expo-proffdok.app/expo-logo.png';}catch{logo='https://expo-proffdok.app/expo-logo.png';}
 const rows=order.goods.map(g=>`<tr>${[g.room_name,g.sku,g.name,`${g.quantity} ${g.unit}`].map(v=>`<td style="padding:11px 8px;border-bottom:1px solid #75868b;color:#ffffff;vertical-align:top;overflow-wrap:anywhere;">${esc(v)}</td>`).join('')}</tr>`).join('');
 const html=`<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#51585a;font-family:Arial,Helvetica,sans-serif;color:#dbe7f0"><table role="presentation" width="100%"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:900px;background:#242424;border:1px solid #dbe7f0;border-radius:18px"><tr><td style="padding:24px;border-bottom:1px solid #dbe7f0"><table role="presentation" width="100%"><tr><td style="font-size:28px;font-weight:900;color:#ffffff"><span style="color:#08b9c3">EXPO</span><br>ProffDok</td><td align="right"><img src="${esc(logo)}" alt="${esc(c.companyName)}" width="150" style="max-width:100%;max-height:90px;height:auto;background:#ffffff;padding:4px;object-fit:contain"></td></tr></table></td></tr><tr><td style="padding:24px"><h1 style="font-size:24px;color:#ffffff">Bestilling · leilighet ${esc(i.number)}</h1><p>Fra ${esc(c.companyName)} til ${esc(order.supplier)}</p><table role="presentation" width="100%" style="background:#163f43;border:1px solid #08b9c3;border-radius:14px;margin:18px 0"><tr><td style="padding:18px;color:#ffffff"><strong>Ordrebekreftelse og forventet leveringsdato sendes til:</strong><br><a href="mailto:${esc(order.replyTo)}" style="color:#08d5d8;font-size:18px">${esc(order.replyTo)}</a></td></tr></table><table role="presentation" width="100%" style="background:#5a5d60;border:1px solid #dbe7f0;border-radius:14px">${detail.filter(([,v])=>v).map(([k,v])=>`<tr><td style="padding:10px 12px;color:#cbd5e1;vertical-align:top;width:35%">${k}</td><td style="padding:10px 12px;color:#ffffff;font-weight:bold;white-space:pre-wrap;overflow-wrap:anywhere">${esc(v)}</td></tr>`).join('')}</table>${order.note?`<p style="white-space:pre-wrap;line-height:1.6">${esc(order.note)}</p>`:''}<h2 style="font-size:18px;margin-top:24px">Varer · ${order.goods.length} linjer</h2><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px"><thead><tr>${['Rom','Varenummer','Vare','Antall'].map(v=>`<th style="text-align:left;padding:11px 8px;background:#163f43;color:#ffffff">${v}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table><p style="padding:14px;background:#163f43;border:1px solid #08b9c3;border-radius:12px">Vedlagt: Cordel ASCII-fil og Excel-fil med samme vareutvalg og antall.</p><hr style="border:0;border-top:1px solid #75868b;margin:24px 0"><p>Med vennlig hilsen<br><strong>${esc(c.companyName)}</strong><br>${[c.orgNumber&&'Org.nr. '+c.orgNumber,c.address,c.phone,c.email].filter(Boolean).map(esc).join('<br>')}</p><p style="font-size:12px;color:#aebbc7">Bestillings-ID: ${esc(order.order_number)}<br>Sendt gjennom Expo ProffDok.</p></td></tr></table></td></tr></table></body></html>`;
 const text=[`Bestilling fra ${c.companyName} til ${order.supplier}`,...detail.filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`),order.note,`Ordrebekreftelse til: ${order.replyTo}`,...order.goods.map(g=>`${g.room_name} | ${g.sku} | ${g.name} | ${g.quantity} ${g.unit}`),'Vedlagt: Cordel ASCII og Excel.'].filter(Boolean).join('\n');
 return {to:[order.to],reply_to:order.replyTo,subject:`Bestilling – ${i.project||''} – leilighet ${i.number} – ${order.reference}`.replace(/[\r\n]/g,' ').slice(0,240),html,text};
}
export async function handleBoligOrderEmail(req,deps){
 const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
 const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(req.method==='OPTIONS')return response({ok:true});if(req.method!=='POST')return response({error:'Bare POST er tillatt.',uncertain:false},405);
 let begun=false;
 try{
  const client=deps.userClient(req.headers.get('Authorization')||'');const {data:auth,error:authError}=await client.auth.getUser();
  if(authError||!auth?.user)return response({error:'Logg inn før du sender bestilling.',uncertain:false},401);
  const raw=await req.text();if(raw.length>2000)return response({error:'Ugyldig forespørsel.',uncertain:false},413);const b=JSON.parse(raw);
  const key=deps.env('RESEND_API_KEY'),from=deps.env('CHAT_FROM_EMAIL');if(!key||!from)return response({error:'E-posttjenesten er ikke konfigurert.',uncertain:false},503);
  const {data:prepared,error}=await client.rpc('bolig_order_mail',{p_company_id:b.companyId,p_root_id:b.rootId,p_unit_id:b.unitId,p_action:'inspect',p_payload:{request_id:b.requestId}});
  if(error)return response({error:error.message,uncertain:false},error.code==='42501'?403:409);
  if(prepared.sent)return response({ok:true,alreadySent:true});
  const attachments=boligOrderAttachments(prepared.snapshot).map(a=>({filename:a.filename,content:base64(a.bytes),content_type:a.mime}));
  const mail=boligOrderMail(prepared.snapshot);
  const sender=supplierOrderFrom(from,prepared.snapshot.company.companyName);
  const {data:claim,error:claimError}=await client.rpc('bolig_order_mail',{p_company_id:b.companyId,p_root_id:b.rootId,p_unit_id:b.unitId,p_action:'begin',p_payload:{request_id:b.requestId}});
  if(claimError)return response({error:claimError.message,uncertain:false},claimError.code==='42501'?403:409);
  if(claim.sent)return response({ok:true,alreadySent:true});
  begun=true;
  const provider=await deps.fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`bolig-order/${prepared.id}`},body:JSON.stringify({from:sender,...mail,attachments})});
  const receipt=await provider.json().catch(()=>null);
  if(!provider.ok||typeof receipt?.id!=='string'||!receipt.id||receipt.id.length>150)return response({error:'Sendingen kunne ikke bekreftes. Prøv samme sending igjen.',uncertain:true},502);
  const {error:ack}=await deps.adminClient().rpc('bolig_order_mail_complete',{p_request_id:prepared.id,p_provider_id:receipt.id});
  if(ack)return response({error:'E-posttjenesten har mottatt bestillingen. Prøv samme sending igjen for å lagre kvitteringen.',uncertain:true},502);
  return response({ok:true});
 }catch(e){return response({error:begun?'Sendingen må avklares. Prøv samme sending igjen.':(e.message||'Bestillingen kunne ikke behandles.'),uncertain:begun},begun?502:400);}
}

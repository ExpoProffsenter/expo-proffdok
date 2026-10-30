import {supplierOrderFrom} from './supplier-order-email.mjs';
import {createStandaloneChecklistPdf} from './standalone-checklist-pdf.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function standaloneChecklistEmail(snapshot,to,fileName,content){
 const {record:r,company:c}=snapshot;
 const lines=[`Vedlagt følger sjekklisten «${r.definition.title}».`,`Ordrenummer: ${r.order_number}`,`Arbeidssted/adresse: ${r.work_site}`,...(r.external_project?[`Eksternt prosjektnavn: ${r.external_project}`]:[]),...(r.customer_name?[`Kunde/oppdragsgiver: ${r.customer_name}`]:[]),`Status: ${r.status==='completed'?'Fullført':'Utkast – ikke fullført'}`,`Lagret revisjon: ${r.revision}`,`Firma: ${c.companyName}`,`Kontroll-ID: ${r.id}`];
 return {to:[to],subject:`Sjekkliste${r.order_number?' – '+r.order_number:''} – ${r.definition.title}`.replace(/[\r\n]/g,' ').slice(0,240),
  ...(c.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)?{reply_to:c.email}:{}),
  text:lines.join('\n\n'),html:`<!doctype html><html lang="nb"><body style="margin:0;background:#edf3f4;font-family:Arial,Helvetica,sans-serif;color:#18343a"><main style="max-width:720px;margin:24px auto;background:white;border:1px solid #bed3d6;border-radius:16px;overflow:hidden"><header style="padding:24px;background:#123e44;color:white"><strong style="font-size:23px">EXPO ProffDok</strong><p>${esc(c.companyName)}</p></header><section style="padding:24px"><h1 style="font-size:24px">Utfylt sjekkliste</h1>${lines.map(v=>`<p style="line-height:1.6;overflow-wrap:anywhere">${esc(v)}</p>`).join('')}<hr><p>Med vennlig hilsen<br><strong>${esc(c.companyName)}</strong><br>${[c.address,c.phone,c.email].filter(Boolean).map(esc).join('<br>')}</p></section></main></body></html>`,attachments:[{filename:fileName,content}]};
}
export async function handleStandaloneChecklistEmail(req,deps){
 const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
 const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});let begun=false;
 if(req.method==='OPTIONS')return response({ok:true});if(req.method!=='POST')return response({error:'Bare POST er tillatt.',uncertain:false},405);
 try{
  const client=deps.userClient(req.headers.get('Authorization')||'');const {data:auth,error:authError}=await client.auth.getUser();
  if(authError||!auth?.user)return response({error:'Logg inn før du sender sjekklisten.',uncertain:false},401);
  const raw=await req.text();if(raw.length>2000)return response({error:'Forespørselen er for stor.',uncertain:false},413);
  const b=JSON.parse(raw),key=deps.env('RESEND_API_KEY'),from=deps.env('CHAT_FROM_EMAIL');
  if(!key||!from)return response({error:'E-posttjenesten er ikke konfigurert.',uncertain:false},503);
  const args={p_company_id:b.companyId,p_id:b.id,p_revision:b.revision,p_request_id:b.requestId,p_to:b.to};
  const inspect=async()=>{const {data,error}=await client.rpc('standalone_checklist_mail',args);if(error)throw Object.assign(Error(error.message),{code:error.code});return data;};
  const prepared=await inspect();if(prepared.sent)return response({ok:true,alreadySent:true});
  const {record,company}=prepared.snapshot;if(record.company_id!==b.companyId||record.created_by!==auth.user.id||record.id!==b.id||record.revision!==b.revision||company.companyId!==b.companyId)throw Error('Dokumentets firma eller revisjon kunne ikke bekreftes.');
  const logo=company.logoUrl?await deps.loadLogo(company.logoUrl).catch(()=>null):null;
  const {doc,fileName}=createStandaloneChecklistPdf({JsPDF:deps.JsPDF,record,company,logo,createdAt:prepared.created_at,fileId:prepared.id});
  const content=doc.output('datauristring').split(',')[1];if(!content||content.length>10000000)return response({error:'PDF-en er for stor for e-post. Last den ned i stedet.',uncertain:false},413);
  // Every retry sends the first frozen PDF bytes, even after a logo/network change.
  const {data:file,error:fileError}=await deps.adminClient().rpc('standalone_checklist_mail_file',{p_request_id:prepared.id,p_content:content});
  if(fileError)throw Error(fileError.message);if(file.sent)return response({ok:true,alreadySent:true});
  const final=await inspect();if(final.sent)return response({ok:true,alreadySent:true});
  const mail=standaloneChecklistEmail(prepared.snapshot,prepared.recipient,fileName,file.content);
  begun=true;const provider=await deps.fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`standalone-checklist/${prepared.id}`},body:JSON.stringify({from:supplierOrderFrom(from,company.companyName),...mail})});
  const receipt=await provider.json().catch(()=>null);
  if(!provider.ok||typeof receipt?.id!=='string'||!receipt.id||receipt.id.length>150)return response({error:'Sendingen kunne ikke bekreftes. Prøv samme sending igjen.',uncertain:true},502);
  const {error:ack}=await deps.adminClient().rpc('standalone_checklist_mail_complete',{p_request_id:prepared.id,p_provider_id:receipt.id});
  if(ack)return response({error:'E-posttjenesten tok imot PDF-en, men kvitteringen er ikke lagret. Prøv samme sending igjen.',uncertain:true},502);
  return response({ok:true,providerAccepted:true});
 }catch(e){return response({error:begun?'Sendingen er ikke avklart. Prøv samme sending igjen.':e.message||'Sjekklisten kunne ikke sendes.',uncertain:begun},e.code==='42501'?403:e.code==='PT409'?409:400);}
}

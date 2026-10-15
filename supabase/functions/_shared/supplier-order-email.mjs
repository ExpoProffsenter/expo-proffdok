const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function supplierOrderFrom(configured,companyName) {
 const address=String(configured||'').match(/<([^<>\s]+@[^<>\s]+)>/)?.[1]||String(configured||'').trim();
 if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address))throw Error('Invalid sender configuration');
 const name=String(companyName||'').replace(/[<>"\r\n]/g,' ').trim();
 return `${name} via Expo ProffDok <${address}>`;
}
export const formatOrderNet = value => new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(value));
function supplierOrderLogo(company) {
 const name=String(company.companyName||'').toLowerCase().replaceAll('ø','o').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 let raw=company.logoUrl;
 // Established internal sender brands use the same bundled logos as the app.
 if(String(company.orgNumber||'').replace(/\D/g,'')==='915407692'||name.includes('ringside rorleggerbedrift'))raw='/brands/ringside-rorleggerbedrift.png';
 else if(name.includes('bademiljo expo'))raw='/brands/bademiljo-expo-ringside.png';
 else if(name==='expo proffsenter')raw='/expo-logo.png';
 try {
  const url=new URL(String(raw||''),'https://expo-proffdok.app/');
  if(url.protocol==='https:'&&!url.username&&!url.password&&url.href.length<=2048)return url.href;
 } catch { /* Fall back to the app logo. */ }
 return 'https://expo-proffdok.app/expo-logo.png';
}
export function supplierOrderMail(order, id) {
 const company=order.company;
 const reference=order.reference || id;
 const confirmationEmail=String(order.replyTo);
 const confirmationLink='mailto:'+encodeURIComponent(confirmationEmail).replace('%40','@');
 const terms='Ved utkjøring tilkommer leveringsomkostninger.';
 const details=[['Avsenderbedrift',company.companyName],['Bestillingsreferanse',reference],['Leverandør',order.supplierName],['Leveringsadresse',order.deliveryAddress]];
 const sender=[company.companyName,company.orgNumber&&`Org.nr. ${company.orgNumber}`,company.address,company.phone,company.email,company.website].filter(Boolean);
 const rows=order.items.map(item=>`<tr><td style="padding:12px 10px;border-bottom:1px solid #75868b;color:#ffffff;vertical-align:top;"><strong>${escape(item.description)}</strong><br><span style="font-size:12px;color:#cbd5e1;">${escape(item.supplier)}${item.gtin?` · GTIN/EAN ${escape(item.gtin)}`:''}</span></td>${[item.number,item.quantity,formatOrderNet(item.unitNet),formatOrderNet(item.lineNet)].map((v,i)=>`<td style="padding:12px 10px;border-bottom:1px solid #75868b;color:#ffffff;vertical-align:top;${i>0?'text-align:right;white-space:nowrap;':''}">${escape(v)}</td>`).join('')}</tr>`).join('');
 const detailRows=details.filter(([,v])=>v).map(([label,value])=>`<tr><td style="padding:9px 14px;color:#cbd5e1;font-size:14px;vertical-align:top;width:150px;">${label}</td><td style="padding:9px 14px;color:#ffffff;font-size:15px;font-weight:bold;white-space:pre-wrap;overflow-wrap:anywhere;">${escape(value)}</td></tr>`).join('');
 const text=['Bestilling fra '+company.companyName,`Ordrebekreftelse og forventet leveringsdato sendes til: ${confirmationEmail}`,...details.slice(1).filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`),`Bestillings-ID: ${id}`,order.message&&`Melding: ${order.message}`,'',...order.items.map(i=>`${i.quantity} × ${i.description} | ${i.supplier} | Varenr. ${i.number} | GTIN/EAN ${i.gtin||'–'} | Netto eks. mva.: ${formatOrderNet(i.unitNet)} | Linjesum eks. mva.: ${formatOrderNet(i.lineNet)}`),'',`Sum varer eks. mva.: ${formatOrderNet(order.totalNet)}`,terms,'',`Ordrebekreftelse sendes til: ${confirmationEmail}`,'',...sender,'Bestilling sendt gjennom Expo ProffDok.'].filter(v=>v!==false).join('\n');
 const html=`<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#51585a;font-family:Arial,Helvetica,sans-serif;color:#dbe7f0;">
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#51585a;"><tr><td align="center" style="padding:24px 12px;">
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:900px;background:#242424;border:1px solid #dbe7f0;border-radius:18px;">
 <tr><td style="padding:24px;border-bottom:1px solid #dbe7f0;"><table role="presentation" width="100%"><tr><td style="font-size:28px;line-height:1.2;font-weight:900;color:#ffffff;"><span style="color:#08b9c3;">EXPO</span><br>ProffDok</td><td align="right"><img src="${escape(supplierOrderLogo(company))}" alt="${escape(company.companyName)}" width="150" style="max-width:100%;max-height:90px;height:auto;background:#ffffff;padding:4px;border:0;object-fit:contain;"></td></tr></table></td></tr>
 <tr><td style="padding:28px 24px;">
 <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#dbe7f0;">Bestilling</h1>
 <p style="font-size:16px;line-height:1.6;color:#cbd5e1;">Bestilling fra <strong>${escape(company.companyName)}</strong>.</p>
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#163f43;border:1px solid #08b9c3;border-radius:14px;"><tr><td style="padding:18px;color:#ffffff;">
 <p style="margin:0 0 8px;font-size:17px;font-weight:bold;">Ordrebekreftelse sendes til:</p>
 <a href="${escape(confirmationLink)}" style="font-size:19px;font-weight:bold;color:#08d5d8;overflow-wrap:anywhere;">${escape(confirmationEmail)}</a>
 <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#dbe7f0;">Send ordrebekreftelse og forventet leveringsdato til adressen over.</p>
 </td></tr></table>
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#5a5d60;border:1px solid #dbe7f0;border-radius:14px;margin:20px 0;">${detailRows}</table>
 ${order.message?`<p style="margin:20px 0 8px;font-weight:bold;color:#dbe7f0;">Melding til leverandør</p><div style="padding:16px;background:#5a5d60;border:1px solid #dbe7f0;border-radius:14px;white-space:pre-wrap;line-height:1.7;color:#ffffff;">${escape(order.message)}</div>`:''}
 <h2 style="margin:24px 0 12px;font-size:18px;color:#dbe7f0;">Varer i bestillingen</h2>
 <table width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;"><thead><tr>${['Vare','Varenummer','Antall','Netto eks. mva.','Linjesum eks. mva.'].map((v,i)=>`<th scope="col" style="text-align:${i>1?'right':'left'};padding:12px 10px;background:#163f43;color:#ffffff;">${v}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
 <p style="margin:20px 0 10px;font-size:18px;font-weight:bold;color:#ffffff;">Sum varer eks. mva.: ${escape(formatOrderNet(order.totalNet))}</p>
 <p style="font-size:14px;line-height:1.6;color:#cbd5e1;">${terms}</p>
 <hr style="border:0;border-top:1px solid #dbe7f0;margin:28px 0;">
 <p style="margin:0 0 10px;color:#cbd5e1;">Med vennlig hilsen</p><p style="margin:0;font-size:15px;line-height:1.6;color:#dbe7f0;">${sender.map(escape).join('<br>')}</p>
 <p style="font-size:14px;line-height:1.6;color:#cbd5e1;"><strong>Ordrebekreftelse:</strong> <a href="${escape(confirmationLink)}" style="color:#08d5d8;">${escape(confirmationEmail)}</a></p>
 <p style="font-size:12px;line-height:1.5;color:#aebbc7;">Bestillings-ID: ${escape(id)}<br>Sendt gjennom Expo ProffDok på vegne av ${escape(company.companyName)}.</p>
 </td></tr></table></td></tr></table></body></html>`;
 return {to:[order.to],reply_to:confirmationEmail,subject:`Bestilling – ${company.companyName} – ${reference}`.replace(/[\r\n]/g,' ').slice(0,240),text,html};
}
export async function handleSupplierOrderEmail(req,deps) {
 const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
 const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(req.method==='OPTIONS')return response({ok:true});
 if(req.method!=='POST')return response({error:'Bare POST er tillatt.'},405);
 try {
  const internalToken=req.headers.get('x-supplier-order-token');
  let client;
  if(!internalToken){
  client=deps.userClient(req.headers.get('Authorization')||'');
  const {data:auth,error:authError}=await client.auth.getUser();
  if(authError||!auth?.user)return response({error:'Logg inn før du sender bestilling.',uncertain:false},401);
  }
  if(Number(req.headers.get('content-length'))>20000)return response({error:'Bestillingen er for stor.'},413);
  const raw=await req.text();if(raw.length>20000)return response({error:'Bestillingen er for stor.'},413);
  const body=JSON.parse(raw);
  const key=deps.env('RESEND_API_KEY'),from=deps.env('CHAT_FROM_EMAIL');
  if(!key||!from)return response({error:'E-posttjenesten er ikke konfigurert.',uncertain:false},503);
  const {data:prepared,error}=internalToken
    ?await deps.adminClient().rpc('supplier_order_worker_get',{p_token:internalToken,p_id:body.requestId})
    :await client.rpc('supplier_order_prepare',{p_company_id:body.companyId,p_request_id:body.requestId,p_order:body.order});
  if(error)return response({error:error.message||'Bestillingen er ikke tilgjengelig.',uncertain:false},error.code==='42501'?403:400);
  if(prepared.sent)return response({ok:true,alreadySent:true});
  const mail=supplierOrderMail(prepared.snapshot,prepared.id);
  const provider=await deps.fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`supplier-order/${prepared.id}`},body:JSON.stringify({from:supplierOrderFrom(from,prepared.snapshot.company.companyName),...mail})});
  const receipt=await provider.json().catch(()=>null);
  if(!provider.ok||typeof receipt?.id!=='string'||!receipt.id||receipt.id.length>150)
    return response({error:'Sendingen kunne ikke bekreftes. Prøv samme bestilling igjen.',uncertain:true},502);
  const {error:completeError}=await deps.adminClient().rpc('supplier_order_complete',{p_id:prepared.id,p_provider_id:receipt.id});
  if(completeError)return response({error:'E-posttjenesten har mottatt bestillingen. Trykk Prøv sending igjen for å hente kvittering og lagre valgt leverandør.',uncertain:true},502);
  return response({ok:true});
 } catch {return response({error:'Sendingen kunne ikke bekreftes. Prøv samme bestilling igjen.',uncertain:true},502);}
}

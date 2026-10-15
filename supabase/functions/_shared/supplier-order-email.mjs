const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function supplierOrderMail(order, id) {
 const company=order.company;
 const reference=order.reference || id;
 const rows=order.items.map(item=>`<tr>${[item.description,item.supplier,item.number||'–',item.gtin||'–',item.quantity].map(v=>`<td style="padding:10px;border-bottom:1px solid #ddd">${escape(v)}</td>`).join('')}</tr>`).join('');
 const details=[['Bestillingsreferanse',reference],['Bestillings-ID',id],['Leverandør',order.supplierName],['Leveringsadresse',order.deliveryAddress],['Melding',order.message]];
 const sender=[company.companyName,company.orgNumber&&`Org.nr. ${company.orgNumber}`,company.address,company.phone,order.replyTo].filter(Boolean);
 const text=['Bestilling fra '+company.companyName,...details.filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`),'',...order.items.map(i=>`${i.quantity} × ${i.description} | ${i.supplier} | Varenr. ${i.number||'–'} | GTIN ${i.gtin||'–'}`),'','Bekreft bestillingen og forventet levering ved å svare på denne e-posten.','',...sender,'Sendt via Expo ProffDok'].join('\n');
 const html=`<div style="font-family:Arial,sans-serif;max-width:850px;margin:auto;color:#192b38"><h1>Bestilling</h1><p>Fra <strong>${escape(company.companyName)}</strong></p>${details.filter(([,v])=>v).map(([k,v])=>`<p style="white-space:pre-wrap"><strong>${escape(k)}:</strong> ${escape(v)}</p>`).join('')}<table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr>${['Vare','Vareleverandør','Varenummer','GTIN/EAN','Antall'].map(v=>`<th style="text-align:left;padding:10px;background:#e7f5f5">${v}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table><p>Bekreft bestillingen og forventet levering ved å svare på denne e-posten.</p><p>${sender.map(escape).join('<br>')}</p><p style="font-size:12px;color:#536170">Sendt via Expo ProffDok</p></div>`;
 return {to:[order.to],reply_to:order.replyTo,subject:`Bestilling – ${company.companyName} – ${reference}`.replace(/[\r\n]/g,' ').slice(0,240),text,html};
}
export async function handleSupplierOrderEmail(req,deps) {
 const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
 const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(req.method==='OPTIONS')return response({ok:true});
 if(req.method!=='POST')return response({error:'Bare POST er tillatt.'},405);
 try {
  const client=deps.userClient(req.headers.get('Authorization')||'');
  const {data:auth,error:authError}=await client.auth.getUser();
  if(authError||!auth?.user)return response({error:'Logg inn før du sender bestilling.',uncertain:false},401);
  if(Number(req.headers.get('content-length'))>20000)return response({error:'Bestillingen er for stor.'},413);
  const raw=await req.text();if(raw.length>20000)return response({error:'Bestillingen er for stor.'},413);
  const body=JSON.parse(raw);
  const key=deps.env('RESEND_API_KEY'),from=deps.env('CHAT_FROM_EMAIL');
  if(!key||!from)return response({error:'E-posttjenesten er ikke konfigurert.',uncertain:false},503);
  const {data:prepared,error}=await client.rpc('supplier_order_prepare',{p_company_id:body.companyId,p_request_id:body.requestId,p_order:body.order});
  if(error)return response({error:error.message||'Bestillingen er ikke tilgjengelig.',uncertain:false},error.code==='42501'?403:400);
  if(prepared.sent)return response({ok:true,alreadySent:true});
  const mail=supplierOrderMail(prepared.snapshot,prepared.id);
  const provider=await deps.fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`supplier-order/${prepared.id}`},body:JSON.stringify({from,...mail})});
  const receipt=await provider.json().catch(()=>null);
  if(!provider.ok||typeof receipt?.id!=='string'||!receipt.id||receipt.id.length>150)
    return response({error:'Sendingen kunne ikke bekreftes. Prøv samme bestilling igjen.',uncertain:true},502);
  const {error:completeError}=await deps.adminClient().rpc('supplier_order_complete',{p_id:prepared.id,p_provider_id:receipt.id});
  if(completeError)return response({error:'E-posttjenesten har mottatt bestillingen. Trykk Prøv sending igjen for å hente kvittering og lagre valgt leverandør.',uncertain:true},502);
  return response({ok:true});
 } catch {return response({error:'Sendingen kunne ikke bekreftes. Prøv samme bestilling igjen.',uncertain:true},502);}
}

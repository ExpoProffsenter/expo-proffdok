import {brandedInvitationMail} from './bolig-partner-email.mjs';
const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
const money=c=>new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK'}).format(Number(c||0)/100);
export function confirmationMail(job){
 const d=job.document,s=d?.snapshot,i=s?.identity;
 if(!uuid.test(job.id)||!uuid.test(job.attempt)||!uuid.test(d?.id)||!['resident','manager'].includes(job.kind)||!['accepted','handled'].includes(d?.status)||s?.source!=='resident'||!Array.isArray(s.goods)||s.goods.length>1000||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(job.to||''))throw Error('invalid_job');
 const detail=[['Prosjekt',i.project],['Bolig',[i.unit,i.address].filter(Boolean).join(' · ')],['Bekreftet av',d.accepted_name],['Kvittering til',job.kind==='resident'?'Beboer':'Prosjektleder'],['Utgave',d.version],['Bekreftet',new Intl.DateTimeFormat('nb-NO',{dateStyle:'long',timeStyle:'short',timeZone:'Europe/Oslo'}).format(new Date(d.accepted_at))],['Pristillegg inkl. mva.',money(s.total_cents)],...(s.reason?[['Merknad',s.reason]]:[]),...((s.price_details||[]).map(p=>[p.name,money(p.net_cents)])),...s.goods.map(g=>[g.room_name||'Vare / arbeid',`${g.name}${g.sku?' · '+g.sku:''} · ${g.quantity} ${g.unit}`])];
 return brandedInvitationMail({snapshot:{to:job.to,name:job.kind==='resident'?d.accepted_name:'prosjektleder',company:{companyName:job.company||i.company||'Expo ProffDok',logoUrl:i.logo_url}},link:'',title:'Bestillingen er bekreftet',intro:`${d.accepted_name} har bekreftet grunnpakke og valgte tilvalg for bolig ${i.unit}.`,detail,instructions:'Denne utgaven er lagret og låst i beboerportalen. Grunnpakken er inkludert i hovedleveransen.'+(s.requires_supplier_followup?' Endringen krever oppfølging av tidligere varebestillinger.':''),button:'',subject:`Bestillingsbekreftelse · ${i.unit} – ${i.project} · utgave ${d.version}`});
}
export function createConfirmationEmail({rpc,apiKey,from,fetchImpl=fetch}){
 const respond=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
 return async req=>{
  if(req.method!=='POST')return respond(405,{error:'method_not_allowed'});
  if(req.headers.has('origin')||req.headers.has('authorization'))return respond(403,{error:'server_only'});
  const token=req.headers.get('x-bolig-worker-token');if(!/^[a-f0-9]{64}$/.test(token||''))return respond(403,{error:'server_only'});
  try{
   if(await rpc('bolig_confirmation_worker_authorize',{p_token:token})!==true)return respond(403,{error:'server_only'});
   if(!apiKey||!from||from.length>254||/[\r\n]/.test(from))return respond(503,{error:'transport_paused'});
   if((await req.text())!=='{}')return respond(400,{error:'invalid_body'});
   let sent=0;const started=Date.now();
   for(let n=0;n<10&&Date.now()-started<25000;n++){
    const job=await rpc('bolig_confirmation_worker_reserve');if(!job)break;
    let accepted=false;
    try{
     const mail=confirmationMail(job);
     if(await rpc('bolig_confirmation_worker_validate',{p_id:job.id,p_attempt:job.attempt})!==true)continue;
     const response=await fetchImpl('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{authorization:'Bearer '+apiKey,'content-type':'application/json','Idempotency-Key':'bolig-confirmation-'+job.id},body:JSON.stringify({...mail,to:[job.to],from})});
     accepted=response.ok&&typeof (await response.json())?.id==='string';
     if(accepted)sent++;
    }finally{await rpc('bolig_confirmation_worker_finish',{p_id:job.id,p_attempt:job.attempt,p_sent:accepted});}
   }
   return respond(200,{ok:true,sent});
  }catch{return respond(503,{error:'delivery_unavailable'});}
 };
}

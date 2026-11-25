import {hrRpc} from '../hr/hrAccess.js';
import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {UUID} from './timeCore.mjs';
export function createTimeSession(context){
 let alive=true,epoch=0;
 const assertResult=r=>{if(!alive||r?.context?.company_id!==context.company_id||r?.context?.user_id!==context.user_id)throw Object.assign(Error('Tilgangen eller arbeidsprofilen er endret.'),{code:'42501'});return r;};
 return {
  async call(name,args={}){if(!alive)throw Error('Arbeidsflaten er lukket.');const ticket=epoch;const result=await hrRpc(name,{p_company_id:context.company_id,...args});if(ticket!==epoch)throw Error('Tilgangen er kontrollert på nytt. Hent den lagrede utgaven.');return assertResult(result);},
  invalidate(){epoch++;},dispose(){alive=false;epoch++;}
 };
}
export async function uploadTimeReceipt(session,sheet,file){
 if(!['application/pdf','image/jpeg','image/png'].includes(file.type)||file.size<1||file.size>10485760)throw Error('Velg PDF, JPG eller PNG på høyst 10 MB.');
 const bytes=await file.arrayBuffer();
 const sha256=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
 const id=crypto.randomUUID();
 const {file:reservation}=await session.call('time_file_begin',{p_sheet_id:sheet.id,p_id:id,p_name:file.name.slice(0,180),p_size:file.size,p_mime:file.type,p_sha256:sha256});
 const client=getAppSupabaseClient();if(!client)throw Error('Innloggingen er ikke klar.');
 const response=await client.storage.from('time-private').upload(reservation.object_path,file,{contentType:file.type,upsert:false});
 let ready;try{ready=await session.call('time_file_finish',{p_id:id});}catch(e){throw Error(response.error?.message||e.message);}
 if(ready.file?.sha256!==sha256||ready.file?.size_bytes!==file.size||!ready.file?.ready)throw Error('Kvitteringen kunne ikke bekreftes.');return ready.file;
}
export async function downloadTimeReceipt(session,id){
 if(!UUID.test(id))throw Error('Ugyldig vedlegg.');const first=await session.call('time_file_get',{p_id:id});
 const client=getAppSupabaseClient();if(!client)throw Error('Innloggingen er ikke klar.');
 const {data,error}=await client.storage.from('time-private').download(first.file.object_path);
 if(error||!data)throw Error(error?.message||'Vedlegget kunne ikke hentes.');const last=await session.call('time_file_get',{p_id:id});
 if(first.file.sha256!==last.file.sha256||data.size!==last.file.size_bytes)throw Error('Vedlegget er endret eller tilgangen er trukket tilbake.');
 const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await data.arrayBuffer()))].map(v=>v.toString(16).padStart(2,'0')).join('');
 if(digest!==last.file.sha256)throw Error('Vedlegget stemmer ikke med den lagrede kvitteringen.');
 return {blob:new Blob([data],{type:last.file.mime_type}),name:last.file.name};
}
export function saveTimeDownload(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);}

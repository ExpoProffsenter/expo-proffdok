import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
export const CONTRACT_EVENT='expo:bolig-contracts';
const drafts=new Map();let activeScope='';
export function contractDraft(scope){
 const userCompany=scope.split(':').slice(0,2).join(':');
 if(activeScope&&activeScope!==userCompany)drafts.clear();activeScope=userCompany;
 return drafts.get(scope)||{document_id:'',title:'',kind:'contract',comment:'',file:null,attempt:null,conflict:false};
}
export function rememberContractDraft(scope,value){drafts.set(scope,value);}
export function forgetContractDraft(scope){drafts.delete(scope);}
function verify(data,context,root){
 if(data?.context?.user_id!==context.user_id||data?.context?.company_id!==context.company_id||data?.context?.role!==context.role||!data?.context?.enabled||data?.root_id!==root)throw Object.assign(Error('Bruker, firma eller kontraktstilgang er endret.'),{code:'42501'});
 return data;
}
export async function contractRpc(context,root,action='get',payload={}){
 const client=getAppSupabaseClient();if(!client)throw Error('Innloggingen er ikke klar.');
 const request=client.rpc('bolig_contracts',{p_company_id:context.company_id,p_root_id:root,p_action:action,p_payload:payload});
 const {data,error}=await (typeof request.retry==='function'?request.retry(false):request);
 if(error)throw Object.assign(Error(error.message),{code:error.code});return verify(data,context,root);
}
export async function contractHash(file){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');}
async function fileRequest(context,body,signal){
 const client=getAppSupabaseClient();if(!client)throw Error('Innloggingen er ikke klar.');
 const {data,error}=await client.auth.getSession();
 if(error||data?.session?.user?.id!==context.user_id||!data.session.access_token)throw Object.assign(Error('Innloggingen må bekreftes.'),{code:'42501'});
 const isJson=!(body instanceof FormData);
 const response=await fetch(client.supabaseUrl+'/functions/v1/bolig-contract-files',{method:'POST',cache:'no-store',signal,
  headers:{authorization:'Bearer '+data.session.access_token,apikey:import.meta.env.VITE_SUPABASE_ANON_KEY,...(isJson?{'content-type':'application/json'}:{})},body:isJson?JSON.stringify(body):body});
 if(!response.ok){const e=await response.json().catch(()=>null);throw Object.assign(Error(e?.message||'Dokumentet kunne ikke bekreftes. Prøv samme forsøk igjen.'),{code:e?.code});}
 return response;
}
export async function uploadContract(context,root,file,attempt){
 const form=new FormData();form.set('company_id',context.company_id);form.set('root_id',root);form.set('payload',JSON.stringify(attempt));form.set('file',file);
 const response=await fileRequest(context,form,AbortSignal.timeout(90000));
 const result=verify(await response.json(),context,root);
 if(result.receipt_id!==attempt.id||result.file?.id!==attempt.id||result.file?.sha256!==attempt.sha256)throw Error('Opplastingen mangler bekreftet kvittering. Prøv samme forsøk igjen.');
 return result;
}
export async function downloadContract(context,root,file,signal){
 const response=await fileRequest(context,{action:'download',company_id:context.company_id,root_id:root,id:file.id},signal);
 const blob=await response.blob();
 if(blob.size!==file.size_bytes||await contractHash(blob)!==file.sha256)throw Error('Originalfilen kunne ikke bekreftes.');
 const fresh=await contractRpc(context,root,'file',{id:file.id});
 if(fresh.file.sha256!==file.sha256)throw Error('Dokumentet er endret. Hent siste oversikt.');
 return blob;
}

import {createHrFollowupReminders} from '../_shared/hr-followup-reminders.mjs';
const url=Deno.env.get('SUPABASE_URL')||'',service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const request=(path:string,options:RequestInit={})=>{
 if(!url||!service)throw Error('not_configured');
 return fetch(url+path,{...options,headers:{apikey:service,authorization:`Bearer ${service}`,...options.headers},redirect:'error',signal:AbortSignal.timeout(10000)});
};
const rpc=async(name:string,args:Record<string,unknown>={})=>{
 if(!['hr_followup_worker_authorize','hr_followup_worker_reserve','hr_conversation_invitation_reserve','hr_conversation_invitation_validate','hr_followup_worker_validate','hr_followup_worker_finish'].includes(name))throw Error('rpc_denied');
 const r=await request('/rest/v1/rpc/'+name,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(args)});
 if(!r.ok)throw Error('rpc_unavailable');return r.status===204?null:r.json();
};
const verifyTransport=async()=>{try{const r=await request('/rest/v1/http_request_queue?select=id&limit=0',{headers:{'accept-profile':'net'}});return r.status===406&&(await r.json()).code==='PGRST106';}catch{return false;}};
// Custom Vault-token authentication is verified before reserve/provider side effects.
Deno.serve(createHrFollowupReminders({rpc,verifyTransport,apiKey:Deno.env.get('RESEND_API_KEY')||'',from:Deno.env.get('CHAT_FROM_EMAIL')||''}));

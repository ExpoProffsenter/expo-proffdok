import { createAssignmentMailer } from '../_shared/kshms-assignment-mailer.mjs';
// verify_jwt=false: this cron-only endpoint authenticates its own 256-bit Vault
// token through a service-only RPC before touching the delivery queue.
const url=Deno.env.get('SUPABASE_URL')||'';
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const rpc=async(name:string,args:Record<string,unknown>={})=>{
 if(!url||!key)throw new Error('server_not_configured');
 const result=await fetch(`${url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(10000)});
 if(!result.ok)throw new Error('rpc_unavailable');
 return result.status===204?null:result.json();
};
// pg_net grants are platform-owned. Confirm its transport schema stays outside
// the Data API. Request zero rows and accept only explicit schema exclusion.
const verifyTransport=async()=>{
 if(!url||!key)return false;
 try{
  const result=await fetch(url+'/rest/v1/http_request_queue?select=id&limit=0',{headers:{apikey:key,authorization:'Bearer '+key,'accept-profile':'net'},signal:AbortSignal.timeout(10000)});
  return result.status===406&&(await result.json()).code==='PGRST106';
 }catch{return false;}
};
Deno.serve(createAssignmentMailer({rpc,verifyTransport,apiKey:Deno.env.get('RESEND_API_KEY')||'',from:Deno.env.get('CHAT_FROM_EMAIL')||''}));

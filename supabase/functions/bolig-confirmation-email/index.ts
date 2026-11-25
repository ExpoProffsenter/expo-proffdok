import { createConfirmationEmail } from '../_shared/bolig-confirmation-email.mjs';
const base=Deno.env.get('SUPABASE_URL')||'',service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
Deno.serve(createConfirmationEmail({apiKey:Deno.env.get('RESEND_API_KEY')||'',from:Deno.env.get('CHAT_FROM_EMAIL')||'',
 rpc:async(name:string,args:Record<string,unknown>={})=>{
  if(!/^bolig_confirmation_worker_(authorize|reserve|validate|finish)$/.test(name)||!base||!service)throw Error('unavailable');
  const response=await fetch(base+'/rest/v1/rpc/'+name,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{apikey:service,authorization:'Bearer '+service,'content-type':'application/json'},body:JSON.stringify(args)});
  if(!response.ok)throw Error('unavailable');return response.json();
 }
}));

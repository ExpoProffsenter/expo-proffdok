import { createClient } from 'npm:@supabase/supabase-js@2.45.0';
import { handleSupportMail } from '../_shared/support-mail.mjs';
const env=(key:string)=>Deno.env.get(key)||'';
Deno.serve(req=>handleSupportMail(req,{
 env,fetch,
 userClient:(authorization:string)=>createClient(env('SUPABASE_URL'),env('SUPABASE_ANON_KEY'),{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}}),
 adminClient:()=>createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}}),
}));

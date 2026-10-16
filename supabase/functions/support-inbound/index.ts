import { createClient } from 'npm:@supabase/supabase-js@2.45.0';
import { handleSupportInbound } from '../_shared/support-inbound.mjs';
const env=(key:string)=>Deno.env.get(key)||'';
Deno.serve(req=>handleSupportInbound(req,{env,fetch,
 adminClient:()=>createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}}),
}));

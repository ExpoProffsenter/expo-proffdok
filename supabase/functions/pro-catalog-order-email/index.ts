import {createClient} from 'npm:@supabase/supabase-js@2.45.0';
import {handleProCatalogOrder} from '../_shared/pro-catalog-order-email.mjs';
const env=(name:string)=>Deno.env.get(name)||'';
Deno.serve(req=>handleProCatalogOrder(req,{env,fetch,userClient:(authorization:string)=>createClient(env('SUPABASE_URL'),env('SUPABASE_ANON_KEY'),{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}}),adminClient:()=>createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}})}));

import {boligAllowedOrigins} from '../_shared/bolig-origins.mjs';
import {createClient} from 'npm:@supabase/supabase-js@2.45.0';
import {createContractFiles} from '../_shared/bolig-contract-files.mjs';
const url=Deno.env.get('SUPABASE_URL')||'',anon=Deno.env.get('SUPABASE_ANON_KEY')||'',service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const path=(value:string)=>value.split('/').map(encodeURIComponent).join('/');
Deno.serve(createContractFiles({
 origins:boligAllowedOrigins,
 authenticate:async(authorization:string)=>{
  const user=createClient(url,anon,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await user.auth.getUser();if(error||!data.user)return null;
  // The service key only touches fixed-bucket bytes after a fresh user RPC gate.
  const storage=(objectPath:string,options:RequestInit)=>fetch(url+'/storage/v1/object/'+objectPath,{...options,headers:{apikey:service,authorization:'Bearer '+service,...options.headers},signal:AbortSignal.timeout(30000)});
  return {
   user_id:data.user.id,
   rpc:async(c:string,root:string,action:string,payload:unknown)=>{
    const {data,error}=await user.rpc('bolig_contracts',{p_company_id:c,p_root_id:root,p_action:action,p_payload:payload});
    if(error)throw Object.assign(Error(error.message),{code:error.code});return data;
   },
   upload:async(objectPath:string,body:Uint8Array,mime:string)=>{
    const r=await storage('bolig-contracts/'+path(objectPath),{method:'POST',headers:{'content-type':mime,'x-upsert':'false','cache-control':'private, no-store, max-age=0'},body});
    if(r.status===400){const e=await r.clone().json().catch(()=>null);if(String(e?.statusCode)==='409'||e?.error==='Duplicate')return {ok:false,status:409};}return r;
   },
   download:(objectPath:string)=>storage('authenticated/bolig-contracts/'+path(objectPath),{method:'GET'}),
  };
 }
}));

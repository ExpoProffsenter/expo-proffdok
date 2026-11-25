import {createPortalImages} from '../_shared/bolig-portal-images.mjs';
import {boligAllowedOrigins} from '../_shared/bolig-origins.mjs';
const url=Deno.env.get('SUPABASE_URL')||'',anon=Deno.env.get('SUPABASE_ANON_KEY')||'',service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
async function request(path:string,body:unknown,key:string){
 const r=await fetch(url+path,{method:'POST',headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw Error('Image access failed');return r.json();
}
Deno.serve(createPortalImages({
 authorize:(token:string)=>request('/rest/v1/rpc/bolig_portal_image_paths',{p_token:token},anon),
 sign:async(paths:string[])=>{
  const rows=await request('/storage/v1/object/sign/bolig-catalog-images',{expiresIn:120,paths},service);
  return rows.filter((r:{signedURL?:string})=>r.signedURL).map((r:{path:string,signedURL:string})=>({path:r.path,url:url+'/storage/v1'+r.signedURL}));
 },
 origins:[...boligAllowedOrigins,...(url==='https://ppvircenkjizeiqdxphj.supabase.co'?['https://expo-proffdok-git-feat-bolig-partner-commerce-20261113-ringside.vercel.app']:[])],
}));

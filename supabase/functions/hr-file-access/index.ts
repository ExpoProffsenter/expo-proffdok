import {createHrFileAccess} from '../_shared/hr-file-access.mjs';
const url=Deno.env.get('SUPABASE_URL')||'',anon=Deno.env.get('SUPABASE_ANON_KEY')||'',service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const request=(path:string,options:RequestInit={},key=service,authorization=`Bearer ${key}`)=>{
 if(!url||!key)throw Error('not_configured');
 return fetch(url+path,{...options,headers:{apikey:key,authorization,...options.headers},signal:AbortSignal.timeout(10000)});
};
const rpc=async(name:string,args:Record<string,unknown>,key=service,authorization=`Bearer ${key}`)=>{
 const r=await request('/rest/v1/rpc/'+name,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(args)},key,authorization);
 if(!r.ok)throw Error('rpc_unavailable');return r.status===204?null:r.json();
};
const path=(object:string)=>object.split('/').map(encodeURIComponent).join('/');
const storage={
 download:(object:string)=>request('/storage/v1/object/authenticated/hr-private/'+path(object)),
 remove:async(object:string)=>{const r=await request('/storage/v1/object/hr-private',{method:'DELETE',headers:{'content-type':'application/json'},body:JSON.stringify({prefixes:[object]})});if(!r.ok)throw Error('remove_failed');},
 missing:async(object:string)=>{
  const r=await storage.download(object);if(r.status===404)return true;
  if(r.status!==400)return false;
  const error=await r.json().catch(()=>null);return String(error?.statusCode)==='404'&&['not_found','Not Found','NoSuchKey'].includes(error?.error);
 }
};
// verify_jwt=false is intentional: worker token is service-verified, while user
// requests are validated through Auth /user plus fresh, actor-bound SQL twice.
Deno.serve(createHrFileAccess({
 authenticate:async(authorization:string)=>{const r=await request('/auth/v1/user',{},anon,authorization);if(!r.ok)return null;return (await r.json()).id;},
 userRpc:(name:string,args:Record<string,unknown>,authorization:string)=>rpc(name,args,anon,authorization),
 workerRpc:rpc,storage,
 verifyTransport:async()=>{try{const r=await request('/rest/v1/http_request_queue?select=id&limit=0',{headers:{'accept-profile':'net'}});return r.status===406&&(await r.json()).code==='PGRST106';}catch{return false;}},
 origins:['https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app','https://expo-proffdok.app']
}));

import {createTimeCleanup} from '../_shared/time-cleanup.mjs';
const url=Deno.env.get('SUPABASE_URL')||'',service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const request=(path:string,options:RequestInit)=>{if(!url||!service)throw Error('not_configured');return fetch(url+path,{...options,headers:{apikey:service,authorization:`Bearer ${service}`,'content-type':'application/json'},redirect:'error',signal:AbortSignal.timeout(20000)});};
const rpc=async(name:string,args:Record<string,unknown>={})=>{if(!['time_cleanup_authorize','time_cleanup_files','time_cleanup_finish'].includes(name))throw Error('rpc_denied');const r=await request('/rest/v1/rpc/'+name,{method:'POST',body:JSON.stringify(args)});if(!r.ok)throw Error('rpc_unavailable');return r.json();};
const remove=async(paths:string[])=>{const r=await request('/storage/v1/object/time-private',{method:'DELETE',body:JSON.stringify({prefixes:paths})});if(!r.ok)return false;
 // Confirm absence before acknowledging the queue, including after a lost deletion reply.
 for(const path of paths){const read=await request('/storage/v1/object/authenticated/time-private/'+path,{method:'GET'});if(read.status!==404&&read.status!==400)return false;const result=await read.json().catch(()=>null);if(!result||!['404','NoSuchKey','not_found'].includes(String(result.statusCode||result.error||result.code)))return false;}return true;};
Deno.serve(createTimeCleanup({rpc,remove}));

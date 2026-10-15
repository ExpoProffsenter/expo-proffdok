// No browser endpoint: dedicated Vault token + server-only RPCs, fixed private bucket.
export function createTimeCleanup({rpc,remove}){
 const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
 return async request=>{
  try{
   if(request.method!=='POST')return reply(405,{error:'method'});
   const token=request.headers.get('x-time-token')||'';
   if(request.headers.has('origin')||request.headers.has('authorization')||!/^\w{64}$/.test(token))return reply(403,{error:'denied'});
   if(await rpc('time_cleanup_authorize',{p_token:token})!==true)return reply(403,{error:'denied'});
   if(Number(request.headers.get('content-length')||0)>100)return reply(400,{error:'body'});
   const reader=request.body?.getReader();if(!reader)return reply(400,{error:'body'});
   let length=0,text='';try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>100)return reply(400,{error:'body'});text+=new TextDecoder().decode(value);}}finally{reader.cancel().catch(()=>{});}
   if(text.trim()!=='{}')return reply(400,{error:'body'});
   const paths=await rpc('time_cleanup_files');
   const path=/^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}$/i;
   if(!Array.isArray(paths)||paths.length>100||paths.some(p=>typeof p!=='string'||!path.test(p)))throw Error('invalid_paths');
   if(!paths.length)return reply(200,{removed:0});
   if(await remove(paths)!==true)return reply(503,{error:'storage_unconfirmed'});
   const n=await rpc('time_cleanup_finish',{p_paths:paths});
   return reply(200,{removed:n});
  }catch{return reply(503,{error:'cleanup_incomplete'});}
 };
}

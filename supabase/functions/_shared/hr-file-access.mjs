const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const safePath=/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}$/;
const limit=10485760;
const headers={'cache-control':'no-store, private','pragma':'no-cache','x-content-type-options':'nosniff','vary':'Origin, Authorization'};
const json=(status,value,cors={})=>new Response(JSON.stringify(value),{status,headers:{...headers,...cors,'content-type':'application/json'}});
export async function boundedBytes(response,max=limit) {
 if(Number(response.headers.get('content-length'))>max)throw Error('too_large');
 const reader=response.body?.getReader();if(!reader)throw Error('empty_file');
 const chunks=[];let size=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>max)throw Error('too_large');chunks.push(value);}}
 catch(e){await reader.cancel().catch(()=>{});throw e;}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}return bytes;
}
export async function sha256(bytes){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');}
function checkGrant(value,user,company,file){
 const f=value?.file;
 if(value?.context?.company_id!==company||value.context.user_id!==user||f?.id!==file||f.company_id!==company
 ||!uuid.test(f.employee_id)||f.object_path!==`${company}/${f.employee_id}/${file}`||!safePath.test(f.object_path)
 ||!Number.isInteger(f.size_bytes)||f.size_bytes<1||f.size_bytes>limit||!/^[a-f0-9]{64}$/.test(f.sha256)
 ||!['application/pdf','image/jpeg','image/png'].includes(f.mime_type)||!Number.isInteger(value.employee_revision))throw Error('denied');
 return f;
}
export function createHrFileAccess({authenticate,userRpc,workerRpc,storage,verifyTransport,origins=[],probe=null,contentEnabled=false,now=()=>Date.now()}) {
 return async req=>{
  const origin=req.headers.get('origin'),cors=origin&&origins.includes(origin)?{'access-control-allow-origin':origin,'access-control-allow-headers':'authorization, apikey, content-type, x-client-info','access-control-allow-methods':'POST, OPTIONS'}:{};
  if(origin&&!origins.includes(origin))return json(403,{error:'origin_denied'});
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,...cors}});
  if(req.method!=='POST')return json(405,{error:'method_not_allowed'},cors);
  const token=req.headers.get('x-hr-purge-token');
  if(token!==null){
   if(!/^[0-9a-f]{64}$/.test(token))return json(401,{error:'unauthorized'});
   try{
    if(await workerRpc('hr_purge_worker_authorize',{p_token:token})!==true)return json(401,{error:'unauthorized'});
    if(!await verifyTransport())return json(503,{error:'transport_not_verified'});
    if(req.headers.get('x-hr-storage-probe')==='1')return probe?json(200,await probe()):json(404,{error:'not_available'});
    const result={removed:0,retry:0},started=now();
    for(let count=0;count<20&&now()-started<40000;count++){
     const job=await workerRpc('hr_purge_worker_reserve',{});if(!job)break;
     let removed=false;
     try{if(!uuid.test(job.id)||!uuid.test(job.attempt)||!safePath.test(job.object_path))throw Error('invalid_job');
      await storage.remove(job.object_path);removed=await storage.missing(job.object_path);
     }catch{/* Keep only bounded generic retry state; never log file names/content. */}
     const done=await workerRpc('hr_purge_worker_finish',{p_id:job.id,p_attempt:job.attempt,p_removed:removed});result[done===true?'removed':'retry']++;
    }
    return json(200,result);
   }catch{return json(503,{error:'purge_unavailable'});}
  }
  const authorization=req.headers.get('authorization')||'';
  if(!/^Bearer \S+$/.test(authorization))return json(401,{error:'unauthorized'},cors);
  try{
   const user=await authenticate(authorization);if(!uuid.test(user))return json(401,{error:'unauthorized'},cors);
   // This release gate lives in Edge code, outside a restored database backup.
   // H3 keeps it closed; a SQL flag alone cannot open file delivery.
   if(contentEnabled!==true)return json(423,{error:'content_closed'},cors);
   const body=JSON.parse(new TextDecoder().decode(await boundedBytes(req,2048)));
   if(!body||Object.keys(body).some(key=>!['company_id','file_id'].includes(key))||!uuid.test(body.company_id)||!uuid.test(body.file_id))return json(400,{error:'invalid_request'},cors);
   const args={p_company_id:body.company_id,p_file_id:body.file_id};
   const first=await userRpc('hr_file_authorize',args,authorization);const file=checkGrant(first,user,body.company_id,body.file_id);
   const response=await storage.download(file.object_path);if(!response.ok)throw Error('unavailable');
   const bytes=await boundedBytes(response);
   if(bytes.byteLength!==file.size_bytes||await sha256(bytes)!==file.sha256)throw Error('invalid_bytes');
   // Buffer first, then revalidate current membership/leader/grant and deletion.
   // No bytes or reusable bearer URL have been released before this check.
   const fresh=await userRpc('hr_file_authorize',args,authorization);checkGrant(fresh,user,body.company_id,body.file_id);
   if(JSON.stringify(first)!==JSON.stringify(fresh))throw Error('changed');
   const ext={'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png'}[file.mime_type];
   return new Response(bytes,{headers:{...headers,...cors,'content-type':file.mime_type,'content-length':String(bytes.byteLength),'content-disposition':`attachment; filename="HR-dokument.${ext}"`}});
  }catch{return json(403,{error:'file_not_available'},cors);}
 };
}

// QA-only adapter for a temporary Sandbox Edge deployment. Never included in the normal entrypoint.
// An isolated synthetic Storage health proof, callable only with the private
// purge token and only in the expressly authorized Sandbox. No HR identities.
const probe=url==='https://ppvircenkjizeiqdxphj.supabase.co'?async()=>{
 const object=`${crypto.randomUUID()}/${crypto.randomUUID()}/${crypto.randomUUID()}`;
 const bytes=new TextEncoder().encode('Expo ProffDok HR H3 synthetic Storage proof. No personal data.');
 let absent=false;
 try{
  const put=await request('/storage/v1/object/hr-private/'+path(object),{method:'POST',headers:{'content-type':'application/pdf','x-upsert':'false','cache-control':'no-store'},body:bytes});
  if(!put.ok)throw Error('probe_upload_failed');
  const get=await storage.download(object);if(!get.ok)throw Error('probe_download_failed');
  const downloaded=await boundedBytes(get);if(await sha256(downloaded)!==await sha256(bytes))throw Error('probe_hash_failed');
  const publicGet=await request('/storage/v1/object/public/hr-private/'+path(object),{},anon);
  const anonGet=await request('/storage/v1/object/authenticated/hr-private/'+path(object),{},anon);
  if(publicGet.ok||anonGet.ok)throw Error('probe_not_private');
  await storage.remove(object);absent=await storage.missing(object);if(!absent)throw Error('probe_delete_failed');
  return {synthetic:true,uploaded:true,downloaded_hash_equal:true,public_denied:true,anon_denied:true,api_removed:true,absent:true,size:bytes.byteLength};
 }finally{if(!absent)await storage.remove(object);}
}:null;

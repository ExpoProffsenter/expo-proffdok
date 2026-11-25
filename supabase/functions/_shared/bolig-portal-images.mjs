export function createPortalImages({authorize,sign,origins}) {
 return async req=>{
  const origin=req.headers.get('origin');
  const headers={'access-control-allow-origin':origins.includes(origin)?origin:origins[0],vary:'Origin','access-control-allow-headers':'content-type,apikey','access-control-allow-methods':'POST,OPTIONS','cache-control':'no-store','content-type':'application/json'};
  const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers});
  if(origin&&!origins.includes(origin))return reply(403,{message:'Ukjent arbeidsflate.'});
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST')return reply(405,{message:'Bruk POST.'});
  try {
   const reader=req.body?.getReader();if(!reader)return reply(400,{});
   let text='',size=0;const decoder=new TextDecoder();
   while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>512){await reader.cancel();return reply(413,{});}text+=decoder.decode(part.value,{stream:true});}
   text+=decoder.decode();const body=JSON.parse(text);
   if(Object.keys(body).some(k=>k!=='token')||!/^[a-f0-9]{64}$/.test(body.token))return reply(400,{});
   const paths=await authorize(body.token);
   if(!Array.isArray(paths)||paths.length>1000||paths.some(p=>!/^[-a-f0-9]{36}\/[-a-f0-9]{36}\/[-a-f0-9]{36}\.jpg$/.test(p)))return reply(403,{});
   const images=paths.length?await sign(paths):[];
   // Contact, expiry, revocation or published menu may have changed during Storage IO.
   const fresh=new Set(await authorize(body.token));
   return reply(200,{images:images.filter(i=>fresh.has(i.path))});
  }catch{return reply(403,{message:'Bildene kunne ikke hentes. Hent siste status.'});}
 };
}

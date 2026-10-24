const MAX=20*1024*1024;
export function validContractFile(bytes,mime,name){
 if(!bytes.length||bytes.length>MAX||typeof name!=='string'||name.length>180||/[\x00-\x1f/\\]/.test(name))return false;
 if(mime==='application/pdf')return /\.pdf$/i.test(name)&&new TextDecoder().decode(bytes.slice(0,5))==='%PDF-';
 if(mime==='image/jpeg')return /\.jpe?g$/i.test(name)&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(mime==='image/png')return /\.png$/i.test(name)&&[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b);
 return false;
}
export async function contractDigest(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');}
export function createContractFiles({authenticate,origins}){
 return async req=>{
  const origin=req.headers.get('origin');
  const headers={'access-control-allow-origin':origin&&origins.includes(origin)?origin:origins[0],'vary':'Origin','access-control-allow-headers':'authorization,apikey,content-type','access-control-allow-methods':'POST,OPTIONS','cache-control':'private, no-store, max-age=0','pragma':'no-cache','x-content-type-options':'nosniff'};
  const json=(status,value)=>new Response(JSON.stringify(value),{status,headers:{...headers,'content-type':'application/json'}});
  if(origin&&!origins.includes(origin))return json(403,{message:'Ukjent arbeidsflate.',code:'42501'});
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST')return json(405,{message:'Bruk POST.'});
  try{
   const authorization=req.headers.get('authorization')||'';
   if(!/^Bearer\s+\S+$/i.test(authorization))return json(401,{message:'Logg inn for å åpne kontrakter.',code:'42501'});
   // Auth.getUser must succeed before body parsing, RPC or privileged Storage.
   const session=await authenticate(authorization);
   if(!session?.user_id)return json(401,{message:'Innloggingen må bekreftes.',code:'42501'});
   const rawType=req.headers.get('content-type')||'';
   const isJson=rawType.startsWith('application/json');
   if(!isJson&&!rawType.startsWith('multipart/form-data'))return json(415,{message:'Velg en dokumentfil.'});
   const reader=req.body?.getReader();if(!reader)return json(400,{message:'Forespørselen mangler innhold.'});
   const chunks=[];let length=0;
   while(true){const part=await reader.read();if(part.done)break;length+=part.value.length;if(length>(isJson?4096:MAX+65536)){await reader.cancel();return json(413,{message:'Filen kan være inntil 20 MB.'});}chunks.push(part.value);}
   const rpc=async(c,root,action,payload)=>{
    const data=await session.rpc(c,root,action,payload);
    if(data?.context?.user_id!==session.user_id||data?.context?.company_id!==c||data?.root_id!==root||!data?.context?.enabled)throw Object.assign(Error('Bruker eller prosjekt er endret.'),{code:'42501'});
    return data;
   };
   if(isJson){
    const p=JSON.parse(await new Blob(chunks).text());
    if(p.action!=='download'||Object.keys(p).some(k=>!['action','company_id','root_id','id'].includes(k)))return json(400,{message:'Ukjent filhandling.'});
    const a=await rpc(p.company_id,p.root_id,'file',{id:p.id});
    const response=await session.download(a.path);
    if(!response.ok)throw Error('Dokumentet kunne ikke hentes.');
    const bytes=new Uint8Array(await response.arrayBuffer());
    if(bytes.length!==a.file.size_bytes||await contractDigest(bytes)!==a.file.sha256)throw Error('Dokumentet kunne ikke bekreftes.');
    const fresh=await rpc(p.company_id,p.root_id,'file',{id:p.id});
    if(fresh.file.id!==a.file.id||fresh.file.sha256!==a.file.sha256)throw Error('Dokumentet er endret.');
    return new Response(bytes,{headers:{...headers,'content-type':a.file.mime,'content-disposition':`attachment; filename*=UTF-8''${encodeURIComponent(a.file.name)}`}});
   }
   const form=await new Request(req.url,{method:'POST',headers:{'content-type':rawType},body:new Blob(chunks)}).formData();
   const c=String(form.get('company_id')||''),root=String(form.get('root_id')||'');
   const access=await rpc(c,root,'get',{});
   if(!access.allowed||!access.manage)throw Object.assign(Error('Kontraktsadministrator kreves.'),{code:'42501'});
   const file=form.get('file');
   if(!file||typeof file.arrayBuffer!=='function')return json(400,{message:'Velg en fil.'});
   const bytes=new Uint8Array(await file.arrayBuffer());
   if(!validContractFile(bytes,file.type,file.name))return json(400,{message:'Velg en gyldig PDF, JPG eller PNG på inntil 20 MB.'});
   const p=JSON.parse(String(form.get('payload')||'{}'));
   if(p.name!==file.name||p.mime!==file.type||p.size!==bytes.length||p.sha256!==await contractDigest(bytes))return json(400,{message:'Filen er endret. Velg samme fil på nytt.'});
   const ticket=await rpc(c,root,'prepare',p);
   // Ready exact replay is a receipt, never a second write or an overwrite.
   if(!ticket.ready){
    const stored=await session.upload(ticket.path,bytes,file.type);
    if(!stored.ok){
     if(stored.status!==409)throw Error('Opplastingen kunne ikke bekreftes.');
     const prior=await session.download(ticket.path);
     if(!prior.ok)throw Error('Den tidligere opplastingen kunne ikke bekreftes.');
     const old=new Uint8Array(await prior.arrayBuffer());
     if(old.length!==bytes.length||await contractDigest(old)!==p.sha256)throw Error('Den tidligere opplastingen har et annet innhold.');
    }
   }
   return json(200,await rpc(c,root,'finish',{id:p.id}));
  }catch(e){
   const code=['42501','PT409','22023'].includes(e.code)?e.code:'file_failed';
   return json(code==='42501'?403:code==='PT409'?409:400,{code,message:code==='file_failed'?'Dokumentet kunne ikke behandles. Behold kladden og prøv samme forsøk igjen.':e.message});
  }
 };
}

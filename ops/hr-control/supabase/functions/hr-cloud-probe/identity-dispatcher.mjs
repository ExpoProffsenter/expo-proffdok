// Edge-only transport compatibility: the actual Deno runtime crashed in BrotliDecompress.
// Preserve SDK auth/CAS headers and TLS; request uncompressed responses on two fixed origins.
const origins=new Set(['https://vercel.com','https://feueeykoyyvzvmca.private.blob.vercel-storage.com']);
export function createIdentityDispatcher(inner){
 return {
  dispatch(options,handler){
   const origin=new URL(String(options.origin));
   if(!origins.has(origin.origin) || origin.username || origin.password)
    throw Error('hr_probe_transport_origin');
   const input=options.headers??[];
   const pairs=Array.isArray(input) && input.every(v=>typeof v==='string')
    ? Array.from({length:input.length/2},(_,i)=>[input[2*i],input[2*i+1]])
    : input;
   const headers=new Headers(pairs);headers.set('accept-encoding','identity');
   return inner.dispatch({...options,headers:[...headers].flat()},handler);
  },
  close(...args){return inner.close(...args);},
  destroy(...args){return inner.destroy(...args);}
 };
}

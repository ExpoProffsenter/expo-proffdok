let cached=null;
export async function hydratePortalImages(result,token,base,key,request=fetch) {
 const prefix=base+'/storage/v1/object/public/bolig-catalog-images/';
 const paths=[...new Set((result.offers||[]).flatMap(o=>(o.goods||[]).map(g=>g.image_url).filter(u=>u?.startsWith(prefix)).map(u=>u.slice(prefix.length))))].sort();
 if(!paths.length)return result;
 const basis=JSON.stringify([token,base,paths]);let images;
 try {
  if(cached?.basis===basis&&cached.expires>Date.now())images=cached.images;
  else {
   const response=await request(base+'/functions/v1/bolig-portal-images',{method:'POST',signal:AbortSignal.timeout(20000),headers:{apikey:key,'content-type':'application/json'},body:JSON.stringify({token})});
   if(!response.ok)return result;
   images=(await response.json()).images;
   if(!Array.isArray(images))return result;
   cached={basis,images,expires:Date.now()+60000};
  }
  const urls=new Map(images.filter(i=>paths.includes(i.path)&&i.url?.startsWith(base+'/storage/v1/object/sign/bolig-catalog-images/')).map(i=>[prefix+i.path,i.url]));
  return {...result,offers:result.offers.map(o=>({...o,goods:o.goods.map(g=>({...g,image_url:urls.get(g.image_url)||g.image_url}))}))};
 }catch{return result;}
}

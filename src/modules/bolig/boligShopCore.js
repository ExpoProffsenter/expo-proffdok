export function shopCents(value) {
  const text=String(value).trim().replace(',','.');
  if(!/^\d+(\.\d{1,2})?$/.test(text))throw Error('Skriv en pris med inntil to desimaler.');
  const cents=Math.round(Number(text)*100);
  if(!Number.isSafeInteger(cents)||cents>100000000)throw Error('Kontroller prisen.');
  return cents;
}
export function shopPayload(draft){
  if(!draft.title.trim()||!draft.lines.length)throw Error('Legg inn en tittel og minst én vare.');
  return {title:draft.title.trim(),lines:draft.lines.map(line=>{
    const quantity=Number(String(line.quantity).replace(',','.'));
    if(!line.name.trim()||!Number.isFinite(quantity)||quantity<=0||quantity>10000)throw Error('Fyll inn varenavn og gyldig antall.');
    return {name:line.name.trim(),sku:line.sku,room_name:line.room_name,unit:line.unit,quantity,
      price_cents:shopCents(line.price),installation_cents:shopCents(line.installation||'0'),image_url:line.image_url||''};
  })};
}
export const shopTotal=payload=>payload.lines.reduce((sum,line)=>sum+Math.round(line.quantity*line.price_cents)+line.installation_cents,0);
export const newShopLine=(item={})=>({key:crypto.randomUUID(),name:item.name||'',sku:item.sku||'',quantity:'1',unit:'stk',room_name:'',price:item.price??'',installation:'0',image_url:item.image_url||''});
export function shopDraftFrom(document){return {title:document?.snapshot.reason||'Tillegg fra butikk',lines:(document?.snapshot.shop_lines||[]).map(g=>({...g,key:crypto.randomUUID(),quantity:String(g.quantity),price:String(g.price_cents/100),installation:String(g.installation_cents/100)}))};}
// Small raster thumbnails travel with the private agreement snapshot. No public
// bucket or cross-company storage permission is needed to show the resident's image.
export async function shopPhoto(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||!file.size||file.size>10*1024*1024)throw Error('Velg JPG, PNG eller WebP på inntil 10 MB.');
 const url=URL.createObjectURL(file);
 try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Bildet kunne ikke åpnes.'));img.src=url;});
 const scale=Math.min(1,600/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=canvas.getContext('2d');if(!ctx)throw Error('Bildet kunne ikke klargjøres.');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
 const data=canvas.toDataURL('image/jpeg',0.65);if(data.length>120000)throw Error('Velg et mindre bilde.');return data;
 }finally{URL.revokeObjectURL(url);}
}

// Keep Norwegian decimal input and exact thousandths; never make an empty cart row.
export function parseOrderQuantity(value){
 const text=String(value??'').trim();
 if(!/^\d{1,5}([.,]\d{1,3})?$/.test(text))return null;
 const number=Number(text.replace(',','.'));
 return number>0&&number<=99999?number:null;
}
export const formatOrderQuantity=number=>String(number).replace('.',',');
export function stepOrderQuantity(value,direction){
 const current=parseOrderQuantity(value);if(current===null)return null;
 const scaled=Math.round(current*1000),next=scaled+(direction>0?1000:-1000);
 return formatOrderQuantity(Math.min(99999000,Math.max(scaled<=1000&&direction<0?scaled:1,next))/1000);
}

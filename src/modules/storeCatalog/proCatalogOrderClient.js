import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
export async function orderRpc(name,args={}){
 const client=getAppSupabaseClient();if(!client)throw new Error('Innloggingen er ikke klar.');
 const {data,error}=await client.rpc(name,args);if(error)throw error;return data;
}
export const getProCatalogOrderContext=()=>orderRpc('pro_catalog_order_context');
export async function sendProCatalogOrder(attempt){
 const client=getAppSupabaseClient();if(!client)throw new Error('Innloggingen er ikke klar.');
 // functions.invoke uses the registered app client's current in-memory session.
 const {data,error}=await client.functions.invoke('pro-catalog-order-email',{body:attempt});
 if(error){let payload;try{payload=await error.context?.json();}catch{}const e=new Error(payload?.error||error.message||'Sendingen kunne ikke bekreftes.');e.uncertain=payload?.uncertain!==false;throw e;}
 if(!data?.ok){const e=new Error(data?.error||'Sendingen kunne ikke bekreftes.');e.uncertain=data?.uncertain!==false;throw e;}
 return data;
}
export const orderScope=c=>`${c.user_id}:${c.company_id}`;
export const cartKey=c=>'expo-proffdok:pro-catalog-order:v1:'+orderScope(c);
export function readOrderDraft(c){try{
 const d=JSON.parse(localStorage.getItem(cartKey(c)));if(!d||typeof d!=='object'||Array.isArray(d)||!Array.isArray(d.items))return {};
 if(d.items.length>100||d.items.some(i=>!i||typeof i.id!=='string'||typeof i.description!=='string'||typeof i.quantity!=='string'))return {};
 if(d.attempt&&(!d.preview||typeof d.attempt.requestId!=='string'||d.attempt.companyId!==c.company_id))return {};
 return d;
}catch{return {};}}
export function writeOrderDraft(c,draft){localStorage.setItem(cartKey(c),JSON.stringify(draft));}
export function openProCatalogOrder(){
 const button=[...document.querySelectorAll('nav button,.mobileMenuQuickGrid button')].find(b=>b.textContent.trim()==='Varebestilling');
 button?.click();return Boolean(button);
}

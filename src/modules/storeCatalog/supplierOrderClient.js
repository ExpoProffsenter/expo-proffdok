import { getStoredSupabaseSession, rpcWithStoredSession } from '../access/moduleAccessClient.js';
export const supplierOrderContext = companyId => rpcWithStoredSession('supplier_order_context',{p_company_id:companyId});
export const deleteSupplierOrderContact = (companyId,id) => rpcWithStoredSession('supplier_order_contact_delete',{p_company_id:companyId,p_id:id});
export async function sendSupplierOrder(companyId,requestId,order) {
 const {accessToken}=getStoredSupabaseSession();
 if(!accessToken)throw new Error('Innloggingen er ikke klar.');
 const url=import.meta.env.VITE_SUPABASE_URL;
 const response=await fetch(`${url}/functions/v1/supplier-order-email`,{method:'POST',headers:{Authorization:`Bearer ${accessToken}`,apikey:import.meta.env.VITE_SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({companyId,requestId,order})});
 const result=await response.json().catch(()=>null);
 if(!response.ok||!result?.ok){const error=new Error(result?.error||'Sendingen kunne ikke bekreftes. Prøv samme bestilling igjen.');error.uncertain=result?.uncertain!==false;throw error;}
 return result;
}
export const prepareSupplierOrder = (companyId,requestId,order) => rpcWithStoredSession('supplier_order_prepare',{p_company_id:companyId,p_request_id:requestId,p_order:order});

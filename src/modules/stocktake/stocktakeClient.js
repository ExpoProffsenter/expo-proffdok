import { rpcWithStoredSession } from '../access/moduleAccessClient.js';
export const stocktakeRpc=(name,args={})=>rpcWithStoredSession(name,args);
export async function allStocktakeLines(companyId,id) {
 let offset=0,initial=null,items=[];
 for(;;) {
  const page=await stocktakeRpc('stocktake_get',{p_company_id:companyId,p_id:id,p_offset:offset});
  if(!initial)initial=page;
  if(page.session.revision!==initial.session.revision||page.total!==initial.total)throw Error('Tellingen ble endret under eksport. Hent tellingen på nytt og prøv igjen.');
  if(page.session.company_id!==companyId||page.session.id!==id)throw Error('Arbeidsfirma eller telling er endret.');
  items.push(...page.items);offset+=page.items.length;
  if(offset>=page.total)break;
  if(!page.items.length)throw Error('Kunne ikke hente alle varene. Prøv igjen.');
 }
 // Verify that a write did not land between the final data page and completion.
 const end=await stocktakeRpc('stocktake_get',{p_company_id:companyId,p_id:id,p_offset:0});
 if(end.session.revision!==initial.session.revision)throw Error('Tellingen ble endret under eksport. Prøv igjen.');
 return {session:initial.session,items};
}

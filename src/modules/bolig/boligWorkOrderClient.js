import { getAppSupabaseClient } from '../access/appSupabaseClientRegistry.js';
export async function workOrderRpc(context,root,unit){
 const client=getAppSupabaseClient();if(!client)throw Error('Innloggingen er ikke klar.');
 const request=client.rpc('bolig_work_order',{p_company_id:context.company_id,p_root_id:root,p_unit_id:unit});
 const {data,error}=await (typeof request.retry==='function'?request.retry(false):request);
 if(error)throw Object.assign(Error(error.message),{code:error.code});
 if(data?.context?.user_id!==context.user_id||data?.context?.company_id!==context.company_id||data?.context?.role!=='manager'||!data.context.enabled||data.root_id!==root||data.unit_id!==unit||!Array.isArray(data.goods)||!data.basis)throw Error('Firma eller boligtilgang er endret.');
 return data;
}
export const workOrderGroups=goods=>{const groups=new Map();for(const g of goods){const name=[g.room_name||'Felles for boligen',g.section_name].filter(Boolean).join(' · ');if(!groups.has(name))groups.set(name,[]);groups.get(name).push(g);}return [...groups].map(([name,goods])=>({name,goods}));};

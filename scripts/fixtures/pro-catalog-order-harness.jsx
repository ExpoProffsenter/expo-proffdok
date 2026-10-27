import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
import {registerAppSupabaseClient} from '../../src/modules/access/appSupabaseClientRegistry.js';
import {useProCatalogOrderAccess} from '../../src/modules/storeCatalog/useProCatalogOrderAccess.js';
import {createGlobalAppTabs} from '../../src/modules/project/projectNavigationTabs.mjs';
import Orders from '../../src/modules/storeCatalog/ProCatalogOrders.jsx';
import '../../src/style.css';
import {installStorePriceSearchUx} from '../../src/modules/storeCatalog/storePriceSearchUx.jsx';
const company='87000000-0000-4000-8000-000000000003';
window.qa={internal:new URL(location.href).searchParams.get('internal')==='1',allowed:true,company,user:'user-a',contacts:[],sentIds:JSON.parse(sessionStorage.getItem('qa-sent-ids')||'[]'),unknown:sessionStorage.getItem('qa-provider-accepted')!=='1',delay:0,reads:0};
const item={id:'87000000-0000-4000-8000-000000000005',supplier_name:'QA Rør',supplier_product_number:'0012',description:'QA Ø-vare',suggested_sale_price_ex_vat:125,my_net_price_ex_vat:null};
const context=()=>({internal_catalog:window.qa.internal,company_id:window.qa.company,user_id:window.qa.user,company:{companyName:'QA Firma'},replyTo:'buyer@example.invalid',contacts:window.qa.contacts});
const client={auth:{getUser:async()=>({data:{user:{id:window.qa.user}}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},rpc:async(name,args)=>{
 const qa=window.qa;if(qa.delay)await new Promise(r=>setTimeout(r,qa.delay));qa.reads++;
 if(name==='get_my_work_profile_state')return {data:{active_company_id:qa.company}};
 if(name==='stocktake_context')return {data:{enabled:false,user_id:qa.user,company_id:qa.company}};
 if(name==='list_mobile_store_picklists')return {data:[]};
 if(name==='get_cordel_export_access')return {data:false};
 if(name==='current_user_has_internal_store_price_search_access')return {data:qa.internal&&qa.allowed};
 if(!qa.allowed)return {error:{code:'42501',message:'Ingen tilgang'}};
 if(name==='pro_catalog_order_context')return {data:context()};
 if(name==='current_user_has_pro_store_catalog_access')return {data:qa.allowed};
 if(name==='pro_catalog_order_search')return {data:[item]};
 if(name==='pro_catalog_order_contact'){qa.contacts=args.p_action==='save'?[{id:'contact-1',...args.p_contact}]:[];return {data:context()};}
 if(name==='pro_catalog_order_prepare')return {data:{snapshot:{...args.p_order,company:context().company,replyTo:context().replyTo,goods:[{id:item.id,name:item.description,sku:item.supplier_product_number,supplier:item.supplier_name,quantity:Number(args.p_order.items[0].quantity.replace(',','.'))}]}}};
 throw Error('Unexpected '+name);
},functions:{invoke:async(name,{body})=>{window.qa.sentIds.push(body.requestId);sessionStorage.setItem('qa-sent-ids',JSON.stringify(window.qa.sentIds));if(window.qa.unknown){window.qa.unknown=false;sessionStorage.setItem('qa-provider-accepted','1');return {error:{message:'Uavklart sending',context:{json:async()=>({error:'Uavklart sending',uncertain:true})}}};}return {data:{ok:true}};}}};registerAppSupabaseClient(client);
if(window.qa.internal){
 localStorage.setItem('sb-qa-auth-token',JSON.stringify({access_token:'synthetic-only',user:{id:window.qa.user}}));
 window.__expoProffDokWorkProfile={active_company_id:company};
 window.fetch=async(url,args)=>{
  const name=new URL(url).pathname.split('/').pop(),result=await client.rpc(name,JSON.parse(args?.body||'{}'));
  return new Response(JSON.stringify(result.error||result.data),{status:result.error?403:200});
 };
 installStorePriceSearchUx();
}
function App(){
 const access=useProCatalogOrderAccess(window.qa.user),[tab,setTab]=useState(window.qa.internal?'catalog_order':'pro_catalog');
 const tabs=createGlobalAppTabs({canUseProCatalogOrders:!!access.context,internalCatalogOrders:access.context?.internal_catalog===true});
 const visibleTabs=window.qa.internal?tabs:tabs.filter(([id])=>['pro_catalog','catalog_order'].includes(id));
 return <><nav>{visibleTabs.map(([id,label])=><button data-order-nav={['pro_catalog','catalog_order'].includes(id)?'true':undefined} key={id} onClick={()=>setTab(id)}>{label}</button>)}</nav><main>{access.context&&['pro_catalog','catalog_order'].includes(tab)?<Orders key={access.context.user_id+':'+access.context.company_id} context={access.context} pending={access.pending} mode={tab==='pro_catalog'?'search':'order'} onSearch={()=>setTab('pro_catalog')} onOrder={()=>setTab('catalog_order')}/>:<p>Ingen katalogtilgang</p>}</main></>;
}
createRoot(document.getElementById('app')).render(<App/>);

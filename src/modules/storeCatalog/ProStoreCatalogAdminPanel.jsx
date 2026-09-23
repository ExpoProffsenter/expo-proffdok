import { useEffect, useMemo, useState } from "react";
import { createDefaultSalesSupabaseClient } from "../sales/services/salesSupabase.js";
import { listCatalogCompanies, listCatalogSuppliers, listCompanySupplierAccess, setCompanySupplierAccess, listUserNetPriceAccess, setUserNetPriceAccess } from "./proStoreCatalogClient.js";

export default function ProStoreCatalogAdminPanel({ companyId = "", mode = "systemadmin" }) {
  const [client] = useState(() => createDefaultSalesSupabaseClient());
  const [authorized,setAuthorized]=useState(mode!=="firmaadmin");
  const [companies,setCompanies]=useState([]); const [selectedCompanyId,setSelectedCompanyId]=useState(companyId); const [suppliers,setSuppliers]=useState([]); const [access,setAccess]=useState([]); const [users,setUsers]=useState([]); const [message,setMessage]=useState("");
  const effectiveCompanyId=companyId||selectedCompanyId;

  useEffect(()=>{
    if(mode!=="firmaadmin"){setAuthorized(true);return;}
    let active=true;
    Promise.all([client?.rpc?.("current_profile_is_firmaadmin"),client?.rpc?.("current_profile_is_systemadmin")])
      .then(([firma,system])=>active&&setAuthorized(firma?.data===true&&system?.data!==true))
      .catch(()=>active&&setAuthorized(false));
    return()=>{active=false;};
  },[client,mode]);

  async function refreshBase(){
    if(!authorized)return;
    setMessage("");
    try{
      const userRows=await listUserNetPriceAccess(client); setUsers(Array.isArray(userRows)?userRows:[]);
      if(mode==="systemadmin"){
        const [companyRows,supplierRows]=await Promise.all([listCatalogCompanies(client),listCatalogSuppliers(client)]);
        setCompanies(companyRows); setSuppliers(supplierRows);
        if(!companyId&&!selectedCompanyId&&companyRows.length){
          const demo=companyRows.find((row)=>String(row.display_name||"").toLowerCase()==="proffkunde demo as");
          setSelectedCompanyId(String((demo||companyRows[0]).company_id||""));
        }
      }
    }catch(error){setMessage(error?.message||"Kunne ikke hente proffinnstillinger.");}
  }

  async function refreshAccess(targetCompanyId=effectiveCompanyId){
    if(!authorized||mode!=="systemadmin"||!targetCompanyId){setAccess([]);return;}
    try{const rows=await listCompanySupplierAccess(client,targetCompanyId);setAccess(Array.isArray(rows)?rows:[]);}catch(error){setMessage(error?.message||"Kunne ikke hente leverandørtilganger.");}
  }

  useEffect(()=>{void refreshBase();},[mode,companyId,authorized]);
  useEffect(()=>{void refreshAccess(effectiveCompanyId);},[effectiveCompanyId,mode,authorized]);

  const accessByKey=useMemo(()=>new Map(access.map((row)=>[row.supplier_key,row])),[access]);
  const visibleUsers=mode==="systemadmin"&&effectiveCompanyId?users.filter((user)=>String(user.company_id||"")===String(effectiveCompanyId)):users;

  async function saveSupplier(supplier,patch){const current=accessByKey.get(supplier.supplier_key);try{await setCompanySupplierAccess(client,{companyId:effectiveCompanyId,supplierKey:supplier.supplier_key,discountPercent:patch.discountPercent??current?.discount_percent??0,isActive:patch.isActive??current?.is_active??true});await refreshAccess(effectiveCompanyId);}catch(error){setMessage(error?.message||"Kunne ikke lagre leverandørtilgang.");}}
  async function saveUser(userId,canView){try{await setUserNetPriceAccess(client,userId,canView);await refreshBase();}catch(error){setMessage(error?.message||"Kunne ikke lagre prisinnsyn.");}}

  if(!authorized)return null;
  return <section className="pro-catalog-admin">
    <div><h3>Proff vareregister</h3><p>Leverandørtilgang og rabatt styres per firma. Firmaadmin bestemmer hvem som får se «Din nto pris».</p></div>
    {mode==="systemadmin"&&!companyId?<label className="pro-catalog-company">Firma<select value={selectedCompanyId} onChange={(e)=>setSelectedCompanyId(e.target.value)}><option value="">Velg firma</option>{companies.map((company)=><option key={company.company_id} value={company.company_id}>{company.display_name}</option>)}</select></label>:null}
    {mode==="systemadmin"&&effectiveCompanyId?<div className="pro-catalog-admin-list"><strong>Leverandører og rabatt</strong>{suppliers.map((supplier)=>{const row=accessByKey.get(supplier.supplier_key);return <div className="pro-catalog-admin-row" key={supplier.supplier_key}><label><input type="checkbox" checked={row?.is_active===true} onChange={(e)=>void saveSupplier(supplier,{isActive:e.target.checked})}/><span>{supplier.supplier_name}</span></label><label>Rabatt %<input type="number" min="0" max="100" step="0.01" defaultValue={row?.discount_percent??0} onBlur={(e)=>void saveSupplier(supplier,{discountPercent:Number(e.target.value)})}/></label></div>;})}</div>:null}
    <div className="pro-catalog-admin-list"><strong>Hvem kan se «Din nto pris»</strong>{visibleUsers.length?visibleUsers.map((user)=><label className="pro-catalog-admin-user" key={user.user_id}><input type="checkbox" checked={user.can_view_net_price===true} onChange={(e)=>void saveUser(user.user_id,e.target.checked)}/><span>{user.email||user.user_id}</span></label>):<small>Ingen brukere funnet for valgt firma.</small>}</div>
    {message?<small className="is-error">{message}</small>:null}
    <style>{`.pro-catalog-admin{display:grid;gap:16px}.pro-catalog-admin h3,.pro-catalog-admin p{margin:0}.pro-catalog-company{display:grid;gap:6px;font-weight:700}.pro-catalog-company select{min-height:42px;border:1px solid #ccdadd;border-radius:9px;padding:0 10px;background:#fff;font:inherit}.pro-catalog-admin-list{display:grid;gap:8px}.pro-catalog-admin-row{display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:12px;align-items:center;padding:10px;border:1px solid #d7e2e5;border-radius:10px}.pro-catalog-admin-row label,.pro-catalog-admin-user{display:flex;gap:8px;align-items:center}.pro-catalog-admin-row label:last-child{justify-content:flex-end}.pro-catalog-admin-row input[type=number]{width:78px;min-height:36px}.pro-catalog-admin-user{padding:8px 0}.pro-catalog-admin .is-error{color:#a33232}@media(max-width:700px){.pro-catalog-admin-row{grid-template-columns:1fr}.pro-catalog-admin-row label:last-child{justify-content:flex-start}}`}</style>
  </section>;
}
